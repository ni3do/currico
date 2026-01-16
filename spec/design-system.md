# Design System

Catppuccin theme with Latte (light) and Mocha (dark) variants. Auto-adapts to user preference.

## Semantic Tokens

```css
/* Layout */
--color-bg              /* Page background */
--color-surface         /* Card background */
--color-border          /* Borders */

/* Text */
--color-text            /* Headings */
--color-text-secondary  /* Body */
--color-text-muted      /* Helper text */

/* Actions */
--color-primary         /* Primary actions */
--color-success / --color-warning / --color-error / --color-info

/* Buttons (contrast-safe) */
--btn-primary-bg / --btn-primary-text
--btn-secondary-bg / --btn-secondary-text
```

## Radius & Shadow

| Token | Value | Usage |
|-------|-------|-------|
| `--radius-md` | 8px | Buttons, inputs |
| `--radius-lg` | 12px | Cards |
| `--radius-full` | 9999px | Pills, avatars |
| `--shadow-card` | - | Card elevation |

## Component Classes

**Buttons:** `.btn-primary` `.btn-secondary` `.btn-tertiary` `.btn-ghost` `.btn-danger`

**Cards:** `.card` `.glass-card`

**Forms:** `.input` `.label-meta`

**Pills:** `.pill` + `.pill-primary` `.pill-success` `.pill-warning` `.pill-error`

**Nav:** `.nav-link` `.nav-link-active`

## Theme Toggle

```tsx
import { ThemeToggleDropdown } from "@/components/ui/ThemeToggle";
import { useTheme } from "@/components/providers/ThemeProvider";

const { theme, setTheme, resolvedTheme } = useTheme();
```

## Catppuccin Reference

Full palette: `--ctp-blue`, `--ctp-green`, `--ctp-red`, `--ctp-yellow`, `--ctp-peach`, `--ctp-mauve`, `--ctp-pink`, `--ctp-teal`, `--ctp-sky`, `--ctp-sapphire`, `--ctp-lavender`, `--ctp-flamingo`, `--ctp-rosewater`, `--ctp-maroon`

Base: `--ctp-base`, `--ctp-mantle`, `--ctp-crust`, `--ctp-surface0/1/2`, `--ctp-overlay0/1/2`, `--ctp-subtext0/1`, `--ctp-text`
