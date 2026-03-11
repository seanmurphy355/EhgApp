export const colors = {
  ui: {
    bg: "#141316",
    rail: "#16161A",
    shell: "#1B1A1F",
    surface: "#1F1F24",
    surfaceAlt: "#24252B",
    surfaceRaised: "#2D2C32",
    surfaceHover: "#2A2B31",
    surfaceInset: "#131418",

    text: "#F2F0F4",
    textMuted: "#A6A4B1",
    textSubtle: "#817E91",

    border: "#2D2C32",
    borderStrong: "#3A3941",

    accent: "#6B63D7",
    accentHover: "#5B54BC",
    accentSoft: "#8D88DF",
    accentMuted: "#6B63D714",
    accentBorder: "#6B63D726",
    accentGlow: "#6B63D71F",
    accentGlowSoft: "#8D88DF14",

    panelAlpha: "rgba(22,22,26,0.94)",
    cardAlpha: "rgba(27,26,31,0.94)",
    cardAltAlpha: "rgba(31,31,36,0.90)",
    pillAlpha: "rgba(31,31,36,0.72)",

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
    50: "#F9F8FF",
    100: "#F2F0FC",
    200: "#DAD5F2",
    300: "#C0B6F2",
    400: "#A6A4B1",
    500: "#817E91",
    600: "#4B4952",
    700: "#36353B",
    800: "#24252B",
    900: "#1B1A1F",
    950: "#141316",
  },

  text: {
    100: "#F2F0F4",
    200: "#A6A4B1",
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
  panel: "0 0 0 1px rgba(58,57,65,0.88), 0 14px 36px rgba(0,0,0,0.28)",
  hairline: "0 0 0 1px rgba(58,57,65,0.92)",
} as const;

