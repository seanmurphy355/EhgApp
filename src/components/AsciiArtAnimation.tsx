import { useEffect, useRef } from "react";

const CHARS = [" ", " ", " ", ".", "\u00b7", "~"] as const;
const TARGET_FPS = 24;
const FRAME_INTERVAL_MS = 1000 / TARGET_FPS;
const FRAME_CYCLE_TICKS = 10;

type Sprite = readonly string[];
type FrameSet = readonly Sprite[];

const OCTOPUS_FRAMES: readonly FrameSet[] = [
  [
    [
      "        _...._          ",
      "      .'      '.        ",
      "     / 0      0 \\       ",
      "    |     __      |     ",
      "     \\   '--'    /      ",
      "      '-......-'        ",
      "     / |  ||  | \\       ",
      "    /  |  ||  |  \\      ",
      "   /   |  ||  |   \\     ",
      "   \\   |  ||  |   /     ",
      "    \\  /  ||  \\  /      ",
      "     \\/   ||   \\/       ",
      "          ||            ",
      "          ''            ",
    ],
    [
      "        _...._          ",
      "      .'      '.        ",
      "     / 0      0 \\       ",
      "    |     __      |     ",
      "     \\   '--'    /      ",
      "      '-......-'        ",
      "     /  | || |  \\       ",
      "      \\ | || | /        ",
      "       )| || |(         ",
      "      / | || | \\        ",
      "     / /  ||  \\ \\       ",
      "    ( (   ||   ) )      ",
      "     \\'   ||   '/       ",
      "          ''            ",
    ],
    [
      "        _...._          ",
      "      .'      '.        ",
      "     / 0      0 \\       ",
      "    |     __      |     ",
      "     \\   '--'    /      ",
      "      '-......-'        ",
      "    \\ |   ||   | /      ",
      "     \\|   ||   |/       ",
      "    / |   ||   | \\      ",
      "   /  |   ||   |  \\     ",
      "   \\ /    ||    \\ /     ",
      "    (    /||\\.   )      ",
      "     '-' /  \\ '-'       ",
      "        '    '          ",
    ],
    [
      "        _...._          ",
      "      .'      '.        ",
      "     / 0      0 \\       ",
      "    |     __      |     ",
      "     \\   '--'    /      ",
      "      '-......-'        ",
      "      /| || |\\          ",
      "     / | || | \\         ",
      "     \\ | || | /         ",
      "      \\| || |/          ",
      "      /\\ || /\\          ",
      "     (  )||(  )         ",
      "      '-'||'-'          ",
      "         ''             ",
    ],
  ],
  [
    [
      "       .-\"\"\"--.         ",
      "      / o    o \\        ",
      "     |    __    |       ",
      "      \\  '--'  /        ",
      "       '------'         ",
      "      /|  ||  |\\        ",
      "     / |  ||  | \\       ",
      "    |  |  ||  |  |      ",
      "     \\ |  ||  | /       ",
      "      \\|  ||  |/        ",
      "      /\\  ||  /\\        ",
      "     /  \\ || /  \\       ",
      "    '    '||'    '      ",
    ],
    [
      "       .-\"\"\"--.         ",
      "      / o    o \\        ",
      "     |    __    |       ",
      "      \\  '--'  /        ",
      "       '------'         ",
      "      /|  ||  |\\        ",
      "       |  ||  |         ",
      "      /|  ||  |\\        ",
      "     ( |  ||  | )       ",
      "      \\|  ||  |/        ",
      "      /\\  ||  /\\        ",
      "     '  '-||-'  '       ",
      "          ''            ",
    ],
    [
      "       .-\"\"\"--.         ",
      "      / o    o \\        ",
      "     |    __    |       ",
      "      \\  '--'  /        ",
      "       '------'         ",
      "     \\ |  ||  | /       ",
      "      \\|  ||  |/        ",
      "     / |  ||  | \\       ",
      "    / /|  ||  |\\ \\      ",
      "    \\ / \\  || / \\ /     ",
      "     (   )|||(   )      ",
      "      '-' || '-'        ",
      "          ''            ",
    ],
    [
      "       .-\"\"\"--.         ",
      "      / o    o \\        ",
      "     |    __    |       ",
      "      \\  '--'  /        ",
      "       '------'         ",
      "     /  | || |  \\       ",
      "    /  /| || |\\  \\      ",
      "    | / | || | \\ |      ",
      "    |/  | || |  \\|      ",
      "     \\ /  ||  \\ /       ",
      "      (   ||   )        ",
      "       '--||--'         ",
      "          ''            ",
    ],
  ],
] as const;

interface Creature {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  drift: number;
  variant: number;
  width: number;
  height: number;
}

function measureChar(container: HTMLElement): { w: number; h: number } {
  const span = document.createElement("span");
  span.textContent = "M";
  span.style.cssText =
    "position:absolute;visibility:hidden;white-space:pre;font-size:11px;font-family:monospace;line-height:1;";
  container.appendChild(span);
  const rect = span.getBoundingClientRect();
  container.removeChild(span);
  return { w: rect.width, h: rect.height };
}

function frameSetSize(frames: FrameSet): { width: number; height: number } {
  let width = 0;
  let height = 0;
  for (const frame of frames) {
    height = Math.max(height, frame.length);
    for (const row of frame) width = Math.max(width, row.length);
  }
  return { width, height };
}

function currentSprite(creature: Creature): Sprite {
  const frames = OCTOPUS_FRAMES[creature.variant]!;
  const idx = Math.floor(creature.life / FRAME_CYCLE_TICKS) % frames.length;
  return frames[idx]!;
}

export function AsciiArtAnimation() {
  const preRef = useRef<HTMLPreElement>(null);
  const frameRef = useRef<number | null>(null);

  useEffect(() => {
    if (!preRef.current) return;
    const preEl: HTMLPreElement = preRef.current;
    const motionMedia = window.matchMedia("(prefers-reduced-motion: reduce)");
    let isVisible = document.visibilityState !== "hidden";
    let loopActive = false;
    let lastRenderAt = 0;
    let tick = 0;
    let cols = 0;
    let rows = 0;
    let charW = 7;
    let charH = 11;
    let trail = new Float32Array(0);
    let colWave = new Float32Array(0);
    let rowWave = new Float32Array(0);
    let clipMask = new Uint16Array(0);
    let creatures: Creature[] = [];
    let lastOutput = "";

    function toGlyph(value: number): string {
      const clamped = Math.max(0, Math.min(0.999, value));
      const idx = Math.floor(clamped * CHARS.length);
      return CHARS[idx] ?? " ";
    }

    function rebuildGrid() {
      const nextCols = Math.max(0, Math.ceil(preEl.clientWidth / Math.max(1, charW)));
      const nextRows = Math.max(0, Math.ceil(preEl.clientHeight / Math.max(1, charH)));
      if (nextCols === cols && nextRows === rows) return;

      cols = nextCols;
      rows = nextRows;
      const cellCount = cols * rows;
      trail = new Float32Array(cellCount);
      colWave = new Float32Array(cols);
      rowWave = new Float32Array(rows);
      clipMask = new Uint16Array(cellCount);
      creatures = creatures.filter((c) => {
        return (
          c.x > -c.width - 2 &&
          c.x < cols + 2 &&
          c.y > -c.height - 2 &&
          c.y < rows + 2
        );
      });
      lastOutput = "";
    }

    function drawStaticFrame() {
      if (cols <= 0 || rows <= 0) {
        preEl.textContent = "";
        return;
      }

      const grid = Array.from({ length: rows }, () =>
        Array.from({ length: cols }, () => " ")
      );
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const ambient =
            (Math.sin(c * 0.11 + r * 0.04) + Math.cos(r * 0.08 - c * 0.02)) * 0.18 + 0.22;
          grid[r][c] = toGlyph(ambient);
        }
      }

      const gapX = 40;
      const gapY = 20;
      for (let baseRow = 2; baseRow < rows - 16; baseRow += gapY) {
        const startX = Math.floor(baseRow / gapY) % 2 === 0 ? 4 : 22;
        for (let baseCol = startX; baseCol < cols - 28; baseCol += gapX) {
          const variant = (baseCol + baseRow) % OCTOPUS_FRAMES.length;
          const sprite = OCTOPUS_FRAMES[variant]![0]!;
          for (let sr = 0; sr < sprite.length; sr++) {
            const line = sprite[sr]!;
            for (let sc = 0; sc < line.length; sc++) {
              const ch = line[sc] ?? " ";
              if (ch === " ") continue;
              const row = baseRow + sr;
              const col = baseCol + sc;
              if (row < 0 || row >= rows || col < 0 || col >= cols) continue;
              grid[row]![col] = ch;
            }
          }
        }
      }

      const output = grid.map((line) => line.join("")).join("\n");
      preEl.textContent = output;
      lastOutput = output;
    }

    function overlapsAny(cx: number, cy: number, cw: number, ch: number): boolean {
      const pad = 4;
      for (const other of creatures) {
        if (
          cx - pad < other.x + other.width &&
          cx + cw + pad > other.x &&
          cy - pad < other.y + other.height &&
          cy + ch + pad > other.y
        ) return true;
      }
      return false;
    }

    function spawnCreature() {
      const variant = Math.floor(Math.random() * OCTOPUS_FRAMES.length);
      const size = frameSetSize(OCTOPUS_FRAMES[variant]!);
      const speed = 0.05 + Math.random() * 0.04;

      const midX = cols / 2;
      const midY = rows / 2;
      let leftCount = 0;
      let rightCount = 0;
      let topCount = 0;
      let bottomCount = 0;
      for (const c of creatures) {
        const cx = c.x + c.width / 2;
        const cy = c.y + c.height / 2;
        if (cx < midX) leftCount++; else rightCount++;
        if (cy < midY) topCount++; else bottomCount++;
      }

      const preferRight = leftCount > rightCount;
      const preferBottom = topCount > bottomCount;

      let x: number;
      let y: number;
      let vx: number;
      let vy: number;

      const edge = Math.random();
      if (edge < 0.70) {
        const fromRight = preferRight
          ? Math.random() < 0.8
          : Math.random() < 0.3;
        if (fromRight) {
          x = cols + 1;
          y = Math.random() * Math.max(1, rows - size.height);
          vx = -speed;
        } else {
          x = -size.width - 1;
          y = Math.random() * Math.max(1, rows - size.height);
          vx = speed;
        }
        vy = (Math.random() - 0.5) * 0.01;
      } else {
        const fromBottom = preferBottom
          ? Math.random() < 0.8
          : Math.random() < 0.3;
        if (fromBottom) {
          y = rows + 1;
          vy = -speed * 0.6;
        } else {
          y = -size.height - 1;
          vy = speed * 0.6;
        }
        x = Math.random() * Math.max(1, cols - size.width);
        vx = (Math.random() - 0.5) * 0.02;
      }

      if (overlapsAny(x, y, size.width, size.height)) return;

      creatures.push({
        x,
        y,
        vx,
        vy,
        life: 0,
        drift: (Math.random() - 0.5) * 1.2,
        variant,
        width: size.width,
        height: size.height,
      });
    }

    function stampCreature(creature: Creature, alpha: number) {
      const sprite = currentSprite(creature);
      const baseCol = Math.round(creature.x);
      const baseRow = Math.round(creature.y);
      for (let sr = 0; sr < sprite.length; sr++) {
        const line = sprite[sr]!;
        const row = baseRow + sr;
        if (row < 0 || row >= rows) continue;
        for (let sc = 0; sc < line.length; sc++) {
          const ch = line[sc] ?? " ";
          if (ch === " ") continue;
          const col = baseCol + sc;
          if (col < 0 || col >= cols) continue;
          const idx = row * cols + col;
          const stroke = ch === "." || ch === "'" ? 0.62 : 0.8;
          trail[idx] = Math.max(trail[idx] ?? 0, alpha * stroke);
          clipMask[idx] = ch.charCodeAt(0);
        }
      }
    }

    function step(time: number) {
      if (!loopActive) return;
      frameRef.current = requestAnimationFrame(step);
      if (time - lastRenderAt < FRAME_INTERVAL_MS || cols <= 0 || rows <= 0)
        return;

      const delta = Math.min(
        2,
        lastRenderAt === 0 ? 1 : (time - lastRenderAt) / 16.6667
      );
      lastRenderAt = time;
      tick += delta;

      const targetCount = Math.min(3, Math.max(2, Math.floor((cols * rows) / 6000)));
      while (creatures.length < targetCount) spawnCreature();

      for (let i = 0; i < trail.length; i++) trail[i] *= 0.92;
      clipMask.fill(0);

      for (let i = creatures.length - 1; i >= 0; i--) {
        const creature = creatures[i]!;
        creature.life += delta;

        const wobbleX =
          Math.sin((creature.y + creature.drift + tick * 0.12) * 0.09) * 0.001;
        const wobbleY =
          Math.cos((creature.x - creature.drift - tick * 0.09) * 0.08) * 0.002;
        creature.vx += wobbleX;
        creature.vy += wobbleY;

        creature.x += creature.vx * delta;
        creature.y += creature.vy * delta;

        if (
          creature.x < -creature.width - 2 ||
          creature.x > cols + 2 ||
          creature.y < -creature.height - 2 ||
          creature.y > rows + 2
        ) {
          creatures.splice(i, 1);
          continue;
        }

        const alpha = creature.life < 15 ? creature.life / 15 : 1;
        stampCreature(creature, alpha);
      }

      for (let c = 0; c < cols; c++)
        colWave[c] = Math.sin(c * 0.08 + tick * 0.06);
      for (let r = 0; r < rows; r++)
        rowWave[r] = Math.cos(r * 0.1 - tick * 0.05);

      let output = "";
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const idx = r * cols + c;
          const clipChar = clipMask[idx];
          if (clipChar > 0) {
            output += String.fromCharCode(clipChar);
            continue;
          }
          const ambient = (colWave[c] + rowWave[r]) * 0.05 + 0.065;
          const intensity = Math.max(trail[idx] ?? 0, ambient * 0.36);
          output += toGlyph(intensity);
        }
        if (r < rows - 1) output += "\n";
      }

      if (output !== lastOutput) {
        preEl.textContent = output;
        lastOutput = output;
      }
    }

    function syncLoop() {
      const canRender = cols > 0 && rows > 0;
      if (motionMedia.matches) {
        if (loopActive) {
          loopActive = false;
          if (frameRef.current !== null) cancelAnimationFrame(frameRef.current);
          frameRef.current = null;
        }
        if (canRender) drawStaticFrame();
        return;
      }

      if (!isVisible || !canRender) {
        if (loopActive) {
          loopActive = false;
          if (frameRef.current !== null) cancelAnimationFrame(frameRef.current);
          frameRef.current = null;
        }
        return;
      }

      if (!loopActive) {
        loopActive = true;
        lastRenderAt = 0;
        frameRef.current = requestAnimationFrame(step);
      }
    }

    const observer = new ResizeObserver(() => {
      const size = measureChar(preEl);
      charW = size.w;
      charH = size.h;
      rebuildGrid();
      syncLoop();
    });
    observer.observe(preEl);

    const onVisibilityChange = () => {
      isVisible = document.visibilityState !== "hidden";
      syncLoop();
    };
    document.addEventListener("visibilitychange", onVisibilityChange);

    const onMotionChange = () => {
      syncLoop();
    };
    motionMedia.addEventListener("change", onMotionChange);

    const charSize = measureChar(preEl);
    charW = charSize.w;
    charH = charSize.h;
    rebuildGrid();
    syncLoop();

    return () => {
      loopActive = false;
      if (frameRef.current !== null) cancelAnimationFrame(frameRef.current);
      observer.disconnect();
      document.removeEventListener("visibilitychange", onVisibilityChange);
      motionMedia.removeEventListener("change", onMotionChange);
    };
  }, []);

  return (
    <pre
      ref={preRef}
      style={{
        width: "100%",
        height: "100%",
        margin: 0,
        padding: 0,
        overflow: "hidden",
        fontSize: "11px",
        fontFamily: "monospace",
        lineHeight: 1,
        color: "var(--ui-accent-soft)",
        opacity: 0.34,
        userSelect: "none",
      }}
      aria-hidden="true"
    />
  );
}
