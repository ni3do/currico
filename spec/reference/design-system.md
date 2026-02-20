# Design System

Catppuccin theme with Latte (light) and Mocha (dark) variants. Auto-adapts to user preference.

## Semantic Tokens

```css
/* Layout */
--color-bg              /* Page background */
--color-bg-secondary    /* Sidebar, footer background */
--color-surface         /* Card background */
--color-surface-hover   /* Card hover state */
--color-border          /* Borders */

/* Text */
--color-text            /* Headings */
--color-text-secondary  /* Body */
--color-text-muted      /* Helper text */
--color-text-on-accent  /* Text on colored backgrounds */

/* Primary & Accent */
--color-primary         /* Primary actions (Blue) */
--color-accent          /* Secondary accent (Teal) */
--color-action          /* Purchase CTAs (Teal) */
--color-price           /* CHF prices (Peach) */

/* Status */
--color-success / --color-warning / --color-error / --color-info

/* Subject Colors (Lehrplan 21 - All Fachbereiche) */
--color-subject-deutsch       /* Red */
--color-subject-mathe         /* Yellow */
--color-subject-nmg           /* Green */
--color-subject-gestalten     /* Pink */
--color-subject-musik         /* Mauve */
--color-subject-sport         /* Red-Orange */
--color-subject-fremdsprachen /* Blue */
--color-subject-medien        /* Sky */
/* Zyklus 3 specific */
--color-subject-nt            /* Teal */
--color-subject-wah           /* Flamingo */
--color-subject-rzg           /* Maroon */
--color-subject-erg           /* Mauve */
--color-subject-bo            /* Sapphire */
--color-subject-ttg           /* Peach */
--color-subject-pu            /* Overlay (Gray) */

/* Buttons (contrast-safe) */
--btn-primary-bg / --btn-primary-text
--btn-secondary-bg / --btn-secondary-text
--btn-action-bg / --btn-action-text   /* Teal kaufen buttons */
--btn-danger-bg / --btn-danger-text
```

## Radius & Shadow

| Token           | Value  | Usage           |
| --------------- | ------ | --------------- |
| `--radius-md`   | 8px    | Buttons, inputs |
| `--radius-lg`   | 12px   | Cards           |
| `--radius-full` | 9999px | Pills, avatars  |
| `--shadow-card` | -      | Card elevation  |

## Component Classes

**Buttons:** `.btn-primary` `.btn-secondary` `.btn-tertiary` `.btn-ghost` `.btn-danger` `.btn-action`

**Cards:** `.card` `.glass-card`

**Forms:** `.input` `.label-meta`

**Pills:** `.pill` + `.pill-primary` `.pill-success` `.pill-warning` `.pill-error` `.pill-neutral` `.pill-accent`

**Subject Pills:** `.pill-deutsch` `.pill-mathe` `.pill-nmg` `.pill-gestalten` `.pill-musik` `.pill-sport` `.pill-fremdsprachen` `.pill-medien` `.pill-nt` `.pill-wah` `.pill-rzg` `.pill-erg` `.pill-bo` `.pill-ttg` `.pill-pu`

**Nav:** `.nav-link` `.nav-link-active`

## Disabled States

Use `disabled:opacity-60` (not `disabled:opacity-50`) on all interactive elements to meet WCAG AA contrast requirements. Combined with `disabled:cursor-not-allowed` for clarity.

```tsx
className = "btn-primary disabled:opacity-60 disabled:cursor-not-allowed";
```

## Tailwind Integration

Colors are registered via `@theme` block. Use directly as utilities:

```tsx
// Instead of
className = "text-[var(--color-text)]";

// Use
className = "text-text";
className = "bg-primary";
className = "border-border";
className = "text-subject-deutsch";
```

## Theme Toggle

```tsx
import { ThemeToggleDropdown } from "@/components/ui/ThemeToggle";
import { useTheme } from "@/components/providers/ThemeProvider";

const { theme, setTheme, resolvedTheme } = useTheme();
```

## Catppuccin Reference

Full palette: `--ctp-blue`, `--ctp-green`, `--ctp-red`, `--ctp-yellow`, `--ctp-peach`, `--ctp-mauve`, `--ctp-pink`, `--ctp-teal`, `--ctp-sky`, `--ctp-sapphire`, `--ctp-lavender`, `--ctp-flamingo`, `--ctp-rosewater`, `--ctp-maroon`

Base: `--ctp-base`, `--ctp-mantle`, `--ctp-crust`, `--ctp-surface0/1/2`, `--ctp-overlay0/1/2`, `--ctp-subtext0/1`, `--ctp-text`
