# Design System

## Implementation Status

**Status: Complete**

The Catppuccin theme system is fully implemented with semantic design tokens, component classes, and automatic theme switching.

---

## Overview

EasyLehrer uses the Catppuccin color palette with two theme variants:
- **Latte** (Light mode)
- **Mocha** (Dark mode)

The theme automatically adapts based on user preference (System, Light, or Dark).

## Catppuccin Color Palette

### Accent Colors

| Name       | CSS Variable       |
|------------|-------------------|
| Blue       | `--ctp-blue`      |
| Sapphire   | `--ctp-sapphire`  |
| Sky        | `--ctp-sky`       |
| Teal       | `--ctp-teal`      |
| Green      | `--ctp-green`     |
| Yellow     | `--ctp-yellow`    |
| Peach      | `--ctp-peach`     |
| Maroon     | `--ctp-maroon`    |
| Red        | `--ctp-red`       |
| Mauve      | `--ctp-mauve`     |
| Pink       | `--ctp-pink`      |
| Flamingo   | `--ctp-flamingo`  |
| Rosewater  | `--ctp-rosewater` |
| Lavender   | `--ctp-lavender`  |

### Base Colors

| Name      | CSS Variable       |
|-----------|-------------------|
| Base      | `--ctp-base`      |
| Mantle    | `--ctp-mantle`    |
| Crust     | `--ctp-crust`     |
| Surface 0 | `--ctp-surface0`  |
| Surface 1 | `--ctp-surface1`  |
| Surface 2 | `--ctp-surface2`  |

### Overlay & Text Colors

| Name      | CSS Variable       |
|-----------|-------------------|
| Overlay 0 | `--ctp-overlay0`  |
| Overlay 1 | `--ctp-overlay1`  |
| Overlay 2 | `--ctp-overlay2`  |
| Subtext 0 | `--ctp-subtext0`  |
| Subtext 1 | `--ctp-subtext1`  |
| Text      | `--ctp-text`      |

## Semantic Design Tokens

### Core Tokens

```css
var(--color-primary)         /* Primary action color */
var(--color-text)            /* Main heading text */
var(--color-text-secondary)  /* Body text */
var(--color-text-muted)      /* Muted/helper text */
var(--color-text-faint)      /* Very subtle text */
var(--color-bg)              /* Page background */
var(--color-bg-secondary)    /* Secondary background */
var(--color-surface)         /* Card/panel background */
var(--color-surface-elevated)/* Elevated surface */
var(--color-border)          /* Default borders */
var(--color-border-subtle)   /* Subtle borders */
```

### Status Colors

```css
var(--color-success)         /* Success states */
var(--color-warning)         /* Warning states */
var(--color-error)           /* Error states */
var(--color-info)            /* Informational */
var(--color-accent)          /* Accent color */
var(--color-focus)           /* Focus ring */
```

### Button Tokens (Contrast-Safe)

```css
var(--btn-primary-bg)        /* Primary button background */
var(--btn-primary-text)      /* Primary button text */
var(--btn-secondary-bg)      /* Secondary button background */
var(--btn-secondary-text)    /* Secondary button text */
```

## Typography Scale

Text colors automatically adapt between themes for optimal readability.

| Level | Size Class | Color |
|-------|-----------|-------|
| H1    | `text-5xl` | `--color-text` |
| H2    | `text-4xl` | `--color-text` |
| H3    | `text-3xl` | `--color-text` |
| Body  | `text-base` | `--color-text-secondary` |
| Muted | `text-sm` | `--color-text-muted` |
| Label | `.label-meta` | Uppercase, tracked |

## Border Radius Tokens

| Token | Value | Usage |
|-------|-------|-------|
| `--radius-xs` | 4px | Chips |
| `--radius-sm` | 6px | Tags |
| `--radius-md` | 8px | Buttons, Inputs |
| `--radius-lg` | 12px | Cards |
| `--radius-xl` | 16px | Modals |
| `--radius-2xl` | 20px | Hero cards |
| `--radius-full` | 9999px | Pills, Avatars |

## Shadow Tokens

Shadows automatically adjust for better visibility in each theme.

| Token | Usage |
|-------|-------|
| `--shadow-sm` | Subtle elevation |
| `--shadow-md` | Medium elevation |
| `--shadow-lg` | High elevation |
| `--shadow-card` | Card default |

## Component Classes

### Buttons

| Class | Description |
|-------|-------------|
| `.btn-primary` | Primary action button with gradient |
| `.btn-secondary` | Secondary/outlined button |
| `.btn-tertiary` | Tertiary subtle button |
| `.btn-ghost` | Ghost/transparent button |
| `.btn-danger` | Destructive action button |

### Cards

| Class | Description |
|-------|-------------|
| `.card` | Standard card with border and shadow |
| `.glass-card` | Frosted glass effect for auth pages |
| `.geometric-bg` | Subtle grid background pattern |

### Form Elements

| Class | Description |
|-------|-------------|
| `.input` | Text input with theme-aware colors and focus states |
| `.label-meta` | Uppercase tracked label |

### Pills & Tags

Pills use 20% opacity backgrounds with full-color text.

| Class | Description |
|-------|-------------|
| `.pill` | Base pill class |
| `.pill-primary` | Primary colored pill |
| `.pill-accent` | Accent colored pill |
| `.pill-neutral` | Neutral colored pill |
| `.pill-success` | Success status pill |
| `.pill-warning` | Warning status pill |
| `.pill-error` | Error status pill |

### Navigation

| Class | Description |
|-------|-------------|
| `.nav-link` | Base navigation link |
| `.nav-link-active` | Active state for nav link |

## Theme Toggle

Three theme modes available:
- **Light** - Catppuccin Latte
- **Dark** - Catppuccin Mocha
- **System** - Follows OS preference

Use `<ThemeToggleDropdown />` component from `@/components/ui/ThemeToggle`.

Access current theme via `useTheme()` hook from `@/components/providers/ThemeProvider`.
