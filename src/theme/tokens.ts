export const colors = {
  ui: {
    bg: "#0e0e0e",
    rail: "#141414",
    shell: "#1a1a1a",
    surface: "#1f1f1f",
    surfaceAlt: "#242424",
    surfaceRaised: "#2d2d2d",
    surfaceHover: "#2a2a2a",
    surfaceInset: "#111111",

    text: "#e8e8e8",
    textMuted: "#a0a0a0",
    textSubtle: "#707070",

    border: "#2d2d2d",
    borderStrong: "#3a3a3a",

    accent: "#6B63D7",
    accentHover: "#5B54BC",
    accentSoft: "#8D88DF",
    accentMuted: "#6B63D714",
    accentBorder: "#6B63D726",
    accentGlow: "#6B63D71F",
    accentGlowSoft: "#8D88DF14",

    panelAlpha: "rgba(20,20,20,0.94)",
    cardAlpha: "rgba(26,26,26,0.94)",
    cardAltAlpha: "rgba(31,31,31,0.90)",
    pillAlpha: "rgba(31,31,31,0.72)",

    success: "#2EDF72",
    warning: "#FFB64A",
    danger: "#FF6767",
    violet: "#AB94FF",
    focus: "#8D88DF",
  },

  brand: {
    50: "#efeeff",
    100: "#e0ddfb",
    200: "#c4c0f4",
    300: "#aba6ea",
    400: "#8D88DF",
    500: "#6B63D7",
    600: "#5b54bc",
    700: "#494493",
    800: "#363268",
    900: "#242145",
    950: "#151229",
  },

  surface: {
    50: "#f5f5f5",
    100: "#e8e8e8",
    200: "#d0d0d0",
    300: "#a0a0a0",
    400: "#808080",
    500: "#606060",
    600: "#404040",
    700: "#2d2d2d",
    800: "#1f1f1f",
    900: "#141414",
    950: "#0e0e0e",
  },

  text: {
    100: "#e8e8e8",
    200: "#a0a0a0",
  },
} as const;

export const fonts = {
  body: "'Inter', sans-serif",
  heading: "'Inter', sans-serif",
  mono: "'IBM Plex Mono', monospace",
} as const;

export const radii = {
  panel: "18px",
  control: "12px",
} as const;

export const shadows = {
  panel: "0 0 0 1px rgba(58,58,58,0.88), 0 14px 36px rgba(0,0,0,0.28)",
  hairline: "0 0 0 1px rgba(58,58,58,0.92)",
} as const;
