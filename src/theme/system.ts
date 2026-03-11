import { createSystem, defaultConfig, defineConfig } from "@chakra-ui/react";
import { colors, fonts, radii, shadows } from "./tokens";

function v(raw: string) {
  return { value: raw };
}

function mapRecord(record: Record<string, string>) {
  return Object.fromEntries(
    Object.entries(record).map(([k, val]) => [k, v(val)])
  );
}

const config = defineConfig({
  globalCss: {
    ":root": {
      "--ui-bg": colors.ui.bg,
      "--ui-rail": colors.ui.rail,
      "--ui-shell": colors.ui.shell,
      "--ui-surface": colors.ui.surface,
      "--ui-surface-alt": colors.ui.surfaceAlt,
      "--ui-accent": colors.ui.accent,
      "--ui-accent-soft": colors.ui.accentSoft,
      "--ui-text": colors.ui.text,
      "--ui-text-muted": colors.ui.textMuted,
      "--ui-text-subtle": colors.ui.textSubtle,
      "--ui-border": colors.ui.border,
      "--ui-panel-alpha": colors.ui.panelAlpha,
      "--ui-card-alpha": colors.ui.cardAlpha,
      "--ui-card-alt-alpha": colors.ui.cardAltAlpha,
      "--ui-pill-alpha": colors.ui.pillAlpha,
    },
    "html, body, #root": {
      minHeight: "100%",
    },
    html: {
      background: colors.ui.bg,
    },
    body: {
      margin: 0,
      bg: "ui.bg",
      color: "ui.text",
      fontFamily: "body",
      textRendering: "optimizeLegibility",
    },
    "::selection": {
      background: `${colors.ui.accent}48`,
    },
  },

  theme: {
    tokens: {
      fonts: {
        body: v(fonts.body),
        heading: v(fonts.heading),
        mono: v(fonts.mono),
      },
      colors: {
        ui: mapRecord(colors.ui),
        brand: mapRecord(colors.brand),
        surface: mapRecord(colors.surface),
        text: mapRecord(colors.text),
      },
      radii: mapRecord(radii),
      shadows: mapRecord(shadows),
    },

    semanticTokens: {
      colors: {
        bg: {
          DEFAULT: v(colors.ui.bg),
          panel: v(colors.ui.shell),
          subtle: v(colors.ui.surfaceInset),
          muted: v(colors.ui.surfaceAlt),
          emphasized: v(colors.ui.surfaceRaised),
          inverted: v(colors.ui.text),
        },
        fg: {
          DEFAULT: v(colors.ui.text),
          muted: v(colors.ui.textMuted),
          subtle: v(colors.ui.textSubtle),
          inverted: v(colors.ui.bg),
        },
        border: {
          DEFAULT: v(colors.ui.border),
          muted: v(colors.ui.surfaceAlt),
          subtle: v(colors.ui.surfaceHover),
          emphasized: v(colors.ui.borderStrong),
          inverted: v(colors.ui.textMuted),
        },
        accent: {
          DEFAULT: v(colors.ui.accent),
          subtle: v(colors.ui.accentSoft),
          emphasized: v(colors.ui.accentHover),
        },
        success: {
          DEFAULT: v(colors.ui.success),
        },
        warning: {
          DEFAULT: v(colors.ui.warning),
        },
        danger: {
          DEFAULT: v(colors.ui.danger),
        },
        violet: {
          DEFAULT: v(colors.ui.violet),
        },
      },
    },
  },
});

export const system = createSystem(defaultConfig, config);
