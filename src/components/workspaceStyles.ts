export const fieldStyles = {
  bg: "ui.surfaceInset",
  border: "1px solid",
  borderColor: "ui.border",
  borderRadius: "control",
  color: "ui.text",
  _placeholder: { color: "ui.textSubtle" },
  _hover: { borderColor: "ui.borderStrong" },
  _focusVisible: {
    borderColor: "ui.focus",
    boxShadow: "0 0 0 1px var(--chakra-colors-ui-focus)",
  },
} as const;

export const secondaryButtonStyles = {
  bg: "transparent",
  color: "ui.textMuted",
  border: "1px solid",
  borderColor: "ui.border",
  borderRadius: "control",
  _hover: {
    bg: "ui.surfaceHover",
    borderColor: "ui.borderStrong",
    color: "ui.text",
  },
} as const;
