"use client";

import TopBar from "@/components/ui/TopBar";
import { ThemeToggleDropdown } from "@/components/ui/ThemeToggle";
import { useTheme } from "@/components/providers/ThemeProvider";

export default function StyleGuidePage() {
  const { resolvedTheme } = useTheme();

  return (
    <div className="min-h-screen bg-[var(--color-bg)]">
      <TopBar />

      <main className="max-w-7xl mx-auto px-6 py-10 space-y-16">
        {/* Header */}
        <section>
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-2xl font-bold text-[var(--color-text)]">
                EasyLehrer Design System
              </h1>
              <p className="text-sm text-[var(--color-text-muted)]">
                Catppuccin Theme - {resolvedTheme === "dark" ? "Mocha (Dark)" : "Latte (Light)"}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm text-[var(--color-text-secondary)]">Theme:</span>
              <ThemeToggleDropdown />
            </div>
          </div>
        </section>

        {/* Table of Contents */}
        <nav className="card p-6">
          <h2 className="text-lg font-semibold mb-4 text-[var(--color-text)]">
            Quick Navigation
          </h2>
          <div className="flex flex-wrap gap-2">
            {["Theme Toggle", "Colors", "Typography", "Border Radius", "Shadows", "Buttons", "Cards", "Inputs", "Pills & Tags", "Navigation"].map((section) => (
              <a
                key={section}
                href={`#${section.toLowerCase().replace(/ & /g, "-").replace(/ /g, "-")}`}
                className="pill pill-primary hover:opacity-80 transition-opacity"
              >
                {section}
              </a>
            ))}
          </div>
        </nav>

        {/* =================================================================
            THEME TOGGLE
            ================================================================= */}
        <section id="theme-toggle">
          <h2 className="text-2xl font-bold mb-2 text-[var(--color-text)]">
            Theme Toggle
          </h2>
          <p className="mb-6 text-[var(--color-text-muted)]">
            Three theme modes: Light (Latte), Dark (Mocha), and System (follows OS preference).
          </p>

          <div className="card p-8">
            <div className="flex items-center gap-4 mb-6">
              <span className="text-sm text-[var(--color-text-secondary)]">Try it:</span>
              <ThemeToggleDropdown />
            </div>
            <p className="text-sm text-[var(--color-text-muted)]">
              Current resolved theme: <strong className="text-[var(--color-primary)]">{resolvedTheme}</strong>
            </p>
          </div>
        </section>

        {/* =================================================================
            COLORS
            ================================================================= */}
        <section id="colors">
          <h2 className="text-2xl font-bold mb-2 text-[var(--color-text)]">
            Colors - Catppuccin Palette
          </h2>
          <p className="mb-6 text-[var(--color-text-muted)]">
            {resolvedTheme === "dark" ? "Mocha" : "Latte"} flavor - All colors adapt automatically with theme.
          </p>

          {/* Accent Colors */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold mb-4 text-[var(--color-text)]">
              Accent Colors
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
              <ColorSwatch name="Blue" cssVar="--ctp-blue" />
              <ColorSwatch name="Sapphire" cssVar="--ctp-sapphire" />
              <ColorSwatch name="Sky" cssVar="--ctp-sky" />
              <ColorSwatch name="Teal" cssVar="--ctp-teal" />
              <ColorSwatch name="Green" cssVar="--ctp-green" />
              <ColorSwatch name="Yellow" cssVar="--ctp-yellow" />
              <ColorSwatch name="Peach" cssVar="--ctp-peach" />
              <ColorSwatch name="Maroon" cssVar="--ctp-maroon" />
              <ColorSwatch name="Red" cssVar="--ctp-red" />
              <ColorSwatch name="Mauve" cssVar="--ctp-mauve" />
              <ColorSwatch name="Pink" cssVar="--ctp-pink" />
              <ColorSwatch name="Flamingo" cssVar="--ctp-flamingo" />
              <ColorSwatch name="Rosewater" cssVar="--ctp-rosewater" />
              <ColorSwatch name="Lavender" cssVar="--ctp-lavender" />
            </div>
          </div>

          {/* Base Colors */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold mb-4 text-[var(--color-text)]">
              Base Colors
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              <ColorSwatch name="Base" cssVar="--ctp-base" />
              <ColorSwatch name="Mantle" cssVar="--ctp-mantle" />
              <ColorSwatch name="Crust" cssVar="--ctp-crust" />
              <ColorSwatch name="Surface 0" cssVar="--ctp-surface0" />
              <ColorSwatch name="Surface 1" cssVar="--ctp-surface1" />
              <ColorSwatch name="Surface 2" cssVar="--ctp-surface2" />
            </div>
          </div>

          {/* Overlay Colors */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold mb-4 text-[var(--color-text)]">
              Overlay & Text Colors
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              <ColorSwatch name="Overlay 0" cssVar="--ctp-overlay0" />
              <ColorSwatch name="Overlay 1" cssVar="--ctp-overlay1" />
              <ColorSwatch name="Overlay 2" cssVar="--ctp-overlay2" />
              <ColorSwatch name="Subtext 0" cssVar="--ctp-subtext0" />
              <ColorSwatch name="Subtext 1" cssVar="--ctp-subtext1" />
              <ColorSwatch name="Text" cssVar="--ctp-text" />
            </div>
          </div>

          {/* Semantic Colors */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold mb-4 text-[var(--color-text)]">
              Semantic Tokens
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <SemanticColorSwatch name="Primary" cssVar="--color-primary" />
              <SemanticColorSwatch name="Success" cssVar="--color-success" />
              <SemanticColorSwatch name="Warning" cssVar="--color-warning" />
              <SemanticColorSwatch name="Error" cssVar="--color-error" />
              <SemanticColorSwatch name="Info" cssVar="--color-info" />
              <SemanticColorSwatch name="Accent" cssVar="--color-accent" />
              <SemanticColorSwatch name="Focus" cssVar="--color-focus" />
            </div>
          </div>
        </section>

        {/* =================================================================
            TYPOGRAPHY
            ================================================================= */}
        <section id="typography">
          <h2 className="text-2xl font-bold mb-2 text-[var(--color-text)]">
            Typography
          </h2>
          <p className="mb-6 text-[var(--color-text-muted)]">
            Text colors automatically adapt between themes for optimal readability.
          </p>

          <div className="card p-8 space-y-6">
            <div className="border-b border-[var(--color-border)] pb-4">
              <span className="label-meta">H1 - Primary Text Color</span>
              <h1 className="text-5xl mt-2">Heading Level 1</h1>
            </div>

            <div className="border-b border-[var(--color-border)] pb-4">
              <span className="label-meta">H2</span>
              <h2 className="text-4xl mt-2">Heading Level 2</h2>
            </div>

            <div className="border-b border-[var(--color-border)] pb-4">
              <span className="label-meta">H3</span>
              <h3 className="text-3xl mt-2">Heading Level 3</h3>
            </div>

            <div className="border-b border-[var(--color-border)] pb-4">
              <span className="label-meta">Body Text - Secondary Color</span>
              <p className="text-base mt-2">
                This is regular body text using --color-text-secondary. EasyLehrer ist die Schweizer
                Plattform für Lehrpersonen, um Unterrichtsmaterialien zu kaufen, verkaufen und zu teilen.
              </p>
            </div>

            <div className="border-b border-[var(--color-border)] pb-4">
              <span className="label-meta">Muted Text</span>
              <p className="text-sm mt-2 text-[var(--color-text-muted)]">
                This is muted text using --color-text-muted for less emphasis.
              </p>
            </div>

            <div>
              <span className="label-meta">Meta Label - .label-meta class</span>
              <p className="label-meta mt-2">UPPERCASE TRACKED LABEL</p>
            </div>
          </div>
        </section>

        {/* =================================================================
            BORDER RADIUS
            ================================================================= */}
        <section id="border-radius">
          <h2 className="text-2xl font-bold mb-2 text-[var(--color-text)]">
            Border Radius
          </h2>
          <p className="mb-6 text-[var(--color-text-muted)]">
            Consistent rounded corners for modern UI elements.
          </p>

          <div className="card p-6">
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-6">
              <RadiusSwatch name="--radius-xs" value="4px" usage="Chips" />
              <RadiusSwatch name="--radius-sm" value="6px" usage="Tags" />
              <RadiusSwatch name="--radius-md" value="8px" usage="Buttons, Inputs" />
              <RadiusSwatch name="--radius-lg" value="12px" usage="Cards" />
              <RadiusSwatch name="--radius-xl" value="16px" usage="Modals" />
              <RadiusSwatch name="--radius-2xl" value="20px" usage="Hero cards" />
              <RadiusSwatch name="--radius-full" value="9999px" usage="Pills, Avatars" />
            </div>
          </div>
        </section>

        {/* =================================================================
            SHADOWS
            ================================================================= */}
        <section id="shadows">
          <h2 className="text-2xl font-bold mb-2 text-[var(--color-text)]">
            Shadows
          </h2>
          <p className="mb-6 text-[var(--color-text-muted)]">
            Shadows automatically adjust for better visibility in each theme.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <ShadowSwatch name="--shadow-sm" />
            <ShadowSwatch name="--shadow-md" />
            <ShadowSwatch name="--shadow-lg" />
            <ShadowSwatch name="--shadow-card" />
          </div>
        </section>

        {/* =================================================================
            BUTTONS
            ================================================================= */}
        <section id="buttons">
          <h2 className="text-2xl font-bold mb-2 text-[var(--color-text)]">
            Buttons
          </h2>
          <p className="mb-6 text-[var(--color-text-muted)]">
            Contrast-safe button styles with guaranteed text visibility.
          </p>

          <div className="card p-8 space-y-8">
            {/* Primary */}
            <div>
              <span className="label-meta mb-3 block">Primary - .btn-primary</span>
              <div className="flex flex-wrap gap-4">
                <button className="btn-primary px-6 py-3">Primary Button</button>
                <button className="btn-primary px-6 py-3 opacity-50 cursor-not-allowed">Disabled</button>
              </div>
              <p className="text-sm mt-3 text-[var(--color-text-muted)]">
                Uses --btn-primary-bg and --btn-primary-text for guaranteed contrast.
              </p>
            </div>

            {/* Secondary */}
            <div>
              <span className="label-meta mb-3 block">Secondary - .btn-secondary</span>
              <div className="flex flex-wrap gap-4">
                <button className="btn-secondary px-6 py-3">Secondary Button</button>
                <button className="btn-secondary px-6 py-3 opacity-50 cursor-not-allowed">Disabled</button>
              </div>
            </div>

            {/* Tertiary */}
            <div>
              <span className="label-meta mb-3 block">Tertiary - .btn-tertiary</span>
              <div className="flex flex-wrap gap-4">
                <button className="btn-tertiary px-6 py-3">Tertiary Button</button>
                <button className="btn-tertiary px-6 py-3 opacity-50 cursor-not-allowed">Disabled</button>
              </div>
            </div>

            {/* Ghost */}
            <div>
              <span className="label-meta mb-3 block">Ghost - .btn-ghost</span>
              <div className="flex flex-wrap gap-4">
                <button className="btn-ghost px-6 py-3">Ghost Button</button>
                <button className="btn-ghost px-6 py-3 opacity-50 cursor-not-allowed">Disabled</button>
              </div>
            </div>

            {/* Danger */}
            <div>
              <span className="label-meta mb-3 block">Danger - .btn-danger</span>
              <div className="flex flex-wrap gap-4">
                <button className="btn-danger px-6 py-3">Danger Button</button>
                <button className="btn-danger px-6 py-3 opacity-50 cursor-not-allowed">Disabled</button>
              </div>
            </div>
          </div>
        </section>

        {/* =================================================================
            CARDS
            ================================================================= */}
        <section id="cards">
          <h2 className="text-2xl font-bold mb-2 text-[var(--color-text)]">
            Cards
          </h2>
          <p className="mb-6 text-[var(--color-text-muted)]">
            Card styles with proper borders and shadows for both themes.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Standard Card */}
            <div className="card p-6">
              <span className="label-meta mb-2 block">Standard Card</span>
              <h3 className="text-lg font-semibold mb-2">Card Title</h3>
              <p className="text-sm text-[var(--color-text-muted)]">
                Uses .card class with border and shadow.
              </p>
            </div>

            {/* Glass Card */}
            <div className="glass-card p-6">
              <span className="label-meta mb-2 block">Glass Card</span>
              <h3 className="text-lg font-semibold mb-2">Glass Morphism</h3>
              <p className="text-sm text-[var(--color-text-muted)]">
                Frosted glass effect for auth pages.
              </p>
            </div>

            {/* Geometric BG */}
            <div className="geometric-bg rounded-xl p-6 border border-[var(--color-border)]">
              <span className="label-meta mb-2 block">Geometric BG</span>
              <h3 className="text-lg font-semibold mb-2">Grid Pattern</h3>
              <p className="text-sm text-[var(--color-text-muted)]">
                Subtle grid background pattern.
              </p>
            </div>
          </div>
        </section>

        {/* =================================================================
            INPUTS
            ================================================================= */}
        <section id="inputs">
          <h2 className="text-2xl font-bold mb-2 text-[var(--color-text)]">
            Inputs
          </h2>
          <p className="mb-6 text-[var(--color-text-muted)]">
            Form elements with theme-aware colors and focus states.
          </p>

          <div className="card p-8 space-y-6">
            <div>
              <label className="label-meta block mb-2">Text Input</label>
              <input type="text" className="input" placeholder="Enter text here..." />
            </div>

            <div>
              <label className="label-meta block mb-2">With Label</label>
              <label className="block text-sm font-medium mb-1.5 text-[var(--color-text-secondary)]">
                Email Address
              </label>
              <input type="email" className="input" placeholder="you@example.com" />
            </div>

            <div>
              <label className="label-meta block mb-2">Textarea</label>
              <textarea
                className="input min-h-[120px] resize-y"
                placeholder="Enter longer text..."
              ></textarea>
            </div>
          </div>
        </section>

        {/* =================================================================
            PILLS & TAGS
            ================================================================= */}
        <section id="pills-tags">
          <h2 className="text-2xl font-bold mb-2 text-[var(--color-text)]">
            Pills & Tags
          </h2>
          <p className="mb-6 text-[var(--color-text-muted)]">
            Status badges with 20% opacity backgrounds and full-color text.
          </p>

          <div className="card p-8 space-y-6">
            <div>
              <span className="label-meta mb-3 block">Standard Pills</span>
              <div className="flex flex-wrap gap-3">
                <span className="pill pill-primary">Primary</span>
                <span className="pill pill-accent">Accent</span>
                <span className="pill pill-neutral">Neutral</span>
              </div>
            </div>

            <div>
              <span className="label-meta mb-3 block">Status Pills</span>
              <div className="flex flex-wrap gap-3">
                <span className="pill pill-success">Success</span>
                <span className="pill pill-warning">Warning</span>
                <span className="pill pill-error">Error</span>
              </div>
            </div>
          </div>
        </section>

        {/* =================================================================
            NAVIGATION
            ================================================================= */}
        <section id="navigation">
          <h2 className="text-2xl font-bold mb-2 text-[var(--color-text)]">
            Navigation
          </h2>
          <p className="mb-6 text-[var(--color-text-muted)]">
            Nav links with active states and hover effects.
          </p>

          <div className="card p-8">
            <span className="label-meta mb-3 block">Nav Links</span>
            <nav className="flex flex-wrap gap-2">
              <a href="#" className="nav-link nav-link-active">Active Link</a>
              <a href="#" className="nav-link">Katalog</a>
              <a href="#" className="nav-link">Hochladen</a>
              <a href="#" className="nav-link">Dashboard</a>
            </nav>
          </div>
        </section>

        {/* =================================================================
            CSS VARIABLES REFERENCE
            ================================================================= */}
        <section id="css-variables">
          <h2 className="text-2xl font-bold mb-2 text-[var(--color-text)]">
            CSS Variables Reference
          </h2>
          <p className="mb-6 text-[var(--color-text-muted)]">
            Quick reference for semantic design tokens.
          </p>

          <div className="p-4 bg-[var(--ctp-crust)] rounded-lg overflow-x-auto">
            <pre className="text-sm text-[var(--color-text)]">
{`/* Semantic Colors */
var(--color-primary)         /* Primary action */
var(--color-text)            /* Main text */
var(--color-text-secondary)  /* Body text */
var(--color-text-muted)      /* Muted text */
var(--color-bg)              /* Page background */
var(--color-surface)         /* Card background */
var(--color-border)          /* Default borders */

/* Button Tokens (contrast-safe) */
var(--btn-primary-bg)        /* Primary button background */
var(--btn-primary-text)      /* Primary button text */
var(--btn-secondary-bg)      /* Secondary button background */
var(--btn-secondary-text)    /* Secondary button text */

/* Status Colors */
var(--color-success)
var(--color-warning)
var(--color-error)
var(--color-info)

/* Border Radius */
var(--radius-md)             /* 8px - buttons, inputs */
var(--radius-lg)             /* 12px - cards */
var(--radius-full)           /* 9999px - pills */`}
            </pre>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="mt-16 py-8 border-t border-[var(--color-border)] bg-[var(--color-bg-secondary)]">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <p className="text-[var(--color-text-muted)]">
            EasyLehrer Design System v2.0 - Catppuccin Theme
          </p>
        </div>
      </footer>
    </div>
  );
}

/* =================================================================
   COMPONENT HELPERS
   ================================================================= */

function ColorSwatch({ name, cssVar }: { name: string; cssVar: string }) {
  return (
    <div className="text-center">
      <div
        className="w-full h-16 rounded-lg border border-[var(--color-border-subtle)] mb-2"
        style={{ backgroundColor: `var(${cssVar})` }}
      ></div>
      <span className="text-xs block text-[var(--color-text)]">{name}</span>
      <code className="text-xs text-[var(--color-text-muted)]">{cssVar}</code>
    </div>
  );
}

function SemanticColorSwatch({ name, cssVar }: { name: string; cssVar: string }) {
  return (
    <div className="text-center">
      <div
        className="w-full h-12 rounded-lg mb-2"
        style={{ backgroundColor: `var(${cssVar})` }}
      ></div>
      <span className="text-xs block text-[var(--color-text)]">{name}</span>
      <code className="text-xs text-[var(--color-text-muted)]">{cssVar}</code>
    </div>
  );
}

function RadiusSwatch({ name, value, usage }: { name: string; value: string; usage: string }) {
  return (
    <div className="text-center">
      <div
        className="w-16 h-16 mx-auto mb-2 border-2 border-[var(--color-primary)] bg-[var(--color-primary-light)]"
        style={{ borderRadius: value }}
      ></div>
      <code className="text-xs block text-[var(--color-text)]">{name}</code>
      <span className="text-xs block text-[var(--color-text-muted)]">{value}</span>
      <span className="text-xs text-[var(--color-text-faint)]">{usage}</span>
    </div>
  );
}

function ShadowSwatch({ name }: { name: string }) {
  return (
    <div className="text-center">
      <div
        className="w-full h-20 rounded-lg bg-[var(--color-bg)] mb-2"
        style={{ boxShadow: `var(${name})` }}
      ></div>
      <code className="text-xs text-[var(--color-text)]">{name}</code>
    </div>
  );
}
