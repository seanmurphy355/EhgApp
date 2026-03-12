# Aurelia Design Tokens

Canonical source: `src/theme/tokens.ts`

All colors in the application are neutral grays (equal R/G/B channels) with no blue or warm tint. Purple is reserved exclusively for accent and brand elements.

---

## Surface palette

Surfaces form the layering system. Each step is roughly +6 lightness from the previous.

| Token | Hex | Role |
|---|---|---|
| `ui.bg` | `#0e0e0e` | Page background, outermost layer |
| `ui.surfaceInset` | `#111111` | Recessed inputs, inset fields |
| `ui.rail` | `#141414` | Sidebar rail / navigation strip |
| `ui.shell` | `#1a1a1a` | Panel shells, sidebar body |
| `ui.surface` | `#1f1f1f` | Default card / content surface |
| `ui.surfaceAlt` | `#242424` | Alternate surface, slight elevation |
| `ui.surfaceHover` | `#2a2a2a` | Hover state for interactive surfaces |
| `ui.surfaceRaised` | `#2d2d2d` | Raised elements, popovers, tooltips |

### Alpha overlays

Used for surfaces that sit over the ASCII animation background with backdrop-filter.

| Token | Value | Role |
|---|---|---|
| `ui.panelAlpha` | `rgba(20,20,20,0.94)` | Sidebar panel over animation |
| `ui.cardAlpha` | `rgba(26,26,26,0.94)` | Primary card over animation |
| `ui.cardAltAlpha` | `rgba(31,31,31,0.90)` | Secondary card over animation |
| `ui.pillAlpha` | `rgba(31,31,31,0.72)` | Small pill badges over animation |

---

## Text palette

Three tiers of text. All are neutral gray.

| Token | Hex | Role |
|---|---|---|
| `ui.text` | `#e8e8e8` | Primary text, headings |
| `ui.textMuted` | `#a0a0a0` | Secondary text, descriptions |
| `ui.textSubtle` | `#707070` | Tertiary text, labels, metadata |

---

## Border palette

| Token | Hex | Role |
|---|---|---|
| `ui.border` | `#2d2d2d` | Default border for cards, inputs, separators |
| `ui.borderStrong` | `#3a3a3a` | Emphasized border, active states, hover outlines |

---

## Accent palette

Purple is the sole chromatic accent. It appears only on primary buttons, active indicators, focus rings, and badges.

| Token | Hex | Role |
|---|---|---|
| `ui.accent` | `#6B63D7` | Primary accent (buttons, active nav indicator) |
| `ui.accentHover` | `#5B54BC` | Accent hover state |
| `ui.accentSoft` | `#8D88DF` | Lighter accent (badges, dot indicators) |
| `ui.accentMuted` | `#6B63D714` | Very low-opacity accent fill |
| `ui.accentBorder` | `#6B63D726` | Low-opacity accent border |
| `ui.accentGlow` | `#6B63D71F` | Faint glow around accent elements |
| `ui.accentGlowSoft` | `#8D88DF14` | Ultra-faint soft glow |
| `ui.focus` | `#8D88DF` | Focus ring color (matches accentSoft) |

---

## Status colors

Used for status dots, inline chips, and validation. Never as the only cue -- always paired with text or iconography per WCAG.

| Token | Hex | Role |
|---|---|---|
| `ui.success` | `#2EDF72` | Connected, complete, healthy |
| `ui.warning` | `#FFB64A` | Attention, degraded, pending |
| `ui.danger` | `#FF6767` | Error, destructive, failed |
| `ui.violet` | `#AB94FF` | Informational accent, secondary status |

---

## Brand ramp

Full 50-950 ramp derived from the accent purple. Used for Chakra's `brand` color palette and any place that needs a range of purple intensities.

| Step | Hex |
|---|---|
| 50 | `#efeeff` |
| 100 | `#e0ddfb` |
| 200 | `#c4c0f4` |
| 300 | `#aba6ea` |
| 400 | `#8D88DF` |
| 500 | `#6B63D7` |
| 600 | `#5b54bc` |
| 700 | `#494493` |
| 800 | `#363268` |
| 900 | `#242145` |
| 950 | `#151229` |

---

## Surface ramp

Full 50-950 neutral gray ramp. Used for Chakra's `surface` color palette.

| Step | Hex |
|---|---|
| 50 | `#f5f5f5` |
| 100 | `#e8e8e8` |
| 200 | `#d0d0d0` |
| 300 | `#a0a0a0` |
| 400 | `#808080` |
| 500 | `#606060` |
| 600 | `#404040` |
| 700 | `#2d2d2d` |
| 800 | `#1f1f1f` |
| 900 | `#141414` |
| 950 | `#0e0e0e` |

---

## Typography

| Token | Value | Role |
|---|---|---|
| `fonts.body` | Inter | UI text, body copy |
| `fonts.heading` | Inter | Headings (same family, heavier weight) |
| `fonts.mono` | IBM Plex Mono | Code, metadata labels, IDs, tabular data |

---

## Radii

| Token | Value | Role |
|---|---|---|
| `radii.panel` | 18px | Cards, panels, modals |
| `radii.control` | 12px | Buttons, inputs, pills |

---

## Shadows

| Token | Value | Role |
|---|---|---|
| `shadows.panel` | `0 0 0 1px rgba(58,58,58,0.88), 0 14px 36px rgba(0,0,0,0.28)` | Primary card/panel shadow |
| `shadows.hairline` | `0 0 0 1px rgba(58,58,58,0.92)` | Subtle outline-only shadow for secondary cards |

---

## Chakra semantic token mapping

These override Chakra's built-in `bg`, `fg`, and `border` defaults so every component recipe uses our palette without per-prop overrides.

| Chakra semantic key | Maps to |
|---|---|
| `bg` | `ui.bg` |
| `bg.panel` | `ui.shell` |
| `bg.subtle` | `ui.surfaceInset` |
| `bg.muted` | `ui.surface` |
| `bg.emphasized` | `ui.surfaceRaised` |
| `bg.inverted` | `ui.text` |
| `fg` | `ui.text` |
| `fg.muted` | `ui.textMuted` |
| `fg.subtle` | `ui.textSubtle` |
| `fg.inverted` | `ui.bg` |
| `border` | `ui.border` |
| `border.muted` | `ui.surfaceAlt` |
| `border.subtle` | `ui.surfaceHover` |
| `border.emphasized` | `ui.borderStrong` |
| `border.inverted` | `ui.textMuted` |

---

## Design rules

- **No blue tint.** Every neutral color must have equal or near-equal R, G, and B channels.
- **Purple is accent only.** It appears on buttons, active indicators, focus rings, and badges. Never on surfaces or text.
- **Three-layer model.** Background, card/surface, overlay -- each one step lighter.
- **Status colors support text.** Never convey meaning by color alone (WCAG 1.4.1).
- **Single source of truth.** All values live in `src/theme/tokens.ts`. The Chakra system in `src/theme/system.ts` imports from tokens. No hardcoded hex values anywhere else.
