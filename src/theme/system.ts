import { createSystem, defaultConfig, defineConfig } from "@chakra-ui/react";
import { colors, fonts, radii, shadows } from "./tokens";

function v(raw: string) {
  return { value: raw };
}

function sv(raw: string) {
  return { value: { _light: raw, _dark: raw } };
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
          DEFAULT: sv(colors.ui.bg),
          panel: sv(colors.ui.shell),
          subtle: sv(colors.ui.surfaceInset),
          muted: sv(colors.ui.surface),
          emphasized: sv(colors.ui.surfaceRaised),
          inverted: sv(colors.ui.text),
        },
        fg: {
          DEFAULT: sv(colors.ui.text),
          muted: sv(colors.ui.textMuted),
          subtle: sv(colors.ui.textSubtle),
          inverted: sv(colors.ui.bg),
        },
        border: {
          DEFAULT: sv(colors.ui.border),
          muted: sv(colors.ui.surfaceAlt),
          subtle: sv(colors.ui.surfaceHover),
          emphasized: sv(colors.ui.borderStrong),
          inverted: sv(colors.ui.textMuted),
        },
        accent: {
          DEFAULT: sv(colors.ui.accent),
          subtle: sv(colors.ui.accentSoft),
          emphasized: sv(colors.ui.accentHover),
        },
        success: {
          DEFAULT: sv(colors.ui.success),
        },
        warning: {
          DEFAULT: sv(colors.ui.warning),
        },
        danger: {
          DEFAULT: sv(colors.ui.danger),
        },
        violet: {
          DEFAULT: sv(colors.ui.violet),
        },
      },
    },
  },
});

export const system = createSystem(defaultConfig, config);
