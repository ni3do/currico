"use client";

export default function StyleGuidePage() {
  return (
    <div className="min-h-screen" style={{ backgroundColor: "var(--background)" }}>
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white border-b border-[var(--border)]">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <h1 className="text-2xl font-bold" style={{ color: "var(--text-heading)" }}>
            EasyLehrer Design System
          </h1>
          <p className="text-sm" style={{ color: "var(--text-muted)" }}>
            Swiss-Warm: Clean, Grid-based, Precise yet Approachable
          </p>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-10 space-y-16">
        {/* Table of Contents */}
        <nav className="card p-6">
          <h2 className="text-lg font-semibold mb-4" style={{ color: "var(--text-heading)" }}>
            Quick Navigation
          </h2>
          <div className="flex flex-wrap gap-2">
            {["Colors", "Typography", "Spacing", "Border Radius", "Shadows", "Buttons", "Cards", "Inputs", "Pills & Tags", "Navigation", "Utility Classes"].map((section) => (
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
            COLORS
            ================================================================= */}
        <section id="colors">
          <h2 className="text-2xl font-bold mb-2" style={{ color: "var(--text-heading)" }}>
            Colors
          </h2>
          <p className="mb-6" style={{ color: "var(--text-muted)" }}>
            60% Backgrounds (Cool Gray) | 30% Text (Dark Navy & Warm Gray) | 10% Accent (Trust Blue)
          </p>

          {/* Primary Colors */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold mb-4" style={{ color: "var(--text-heading)" }}>
              Primary Accent - Trust Blue
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <ColorSwatch name="--primary" value="rgba(0, 82, 204, 0.9)" />
              <ColorSwatch name="--primary-solid" value="#0052CC" />
              <ColorSwatch name="--primary-hover" value="#0047B3" />
              <ColorSwatch name="--primary-light" value="rgba(0, 82, 204, 0.08)" />
            </div>
          </div>

          {/* Secondary/Accent Colors */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold mb-4" style={{ color: "var(--text-heading)" }}>
              Secondary Accents
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <ColorSwatch name="--accent" value="#0D9488" description="Teal" />
              <ColorSwatch name="--accent-hover" value="#0F766E" />
              <ColorSwatch name="--accent-light" value="rgba(13, 148, 136, 0.1)" />
              <ColorSwatch name="--secondary" value="#059669" description="Emerald" />
            </div>
          </div>

          {/* Background Colors */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold mb-4" style={{ color: "var(--text-heading)" }}>
              Backgrounds
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <ColorSwatch name="--white" value="#FFFFFF" />
              <ColorSwatch name="--off-white" value="#FAFAF9" />
              <ColorSwatch name="--background" value="#F8F9FC" description="Page BG" />
              <ColorSwatch name="--background-alt" value="#F1F3F8" />
              <ColorSwatch name="--sidebar-bg" value="#EEF1F6" />
              <ColorSwatch name="--surface" value="#FFFFFF" />
              <ColorSwatch name="--surface-hover" value="#F8F9FC" />
            </div>
          </div>

          {/* Gray Scale */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold mb-4" style={{ color: "var(--text-heading)" }}>
              Gray Scale
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <ColorSwatch name="--gray-50" value="#F8F9FC" />
              <ColorSwatch name="--gray-100" value="#F1F3F8" />
              <ColorSwatch name="--gray-200" value="#E5E7EB" />
              <ColorSwatch name="--gray-300" value="#D1D5DB" />
              <ColorSwatch name="--gray-400" value="#9CA3AF" />
              <ColorSwatch name="--gray-500" value="#6B7280" />
              <ColorSwatch name="--gray-600" value="#4B5563" />
              <ColorSwatch name="--gray-700" value="#374151" />
              <ColorSwatch name="--gray-800" value="#1F2937" />
              <ColorSwatch name="--gray-900" value="#111827" />
            </div>
          </div>

          {/* Text Colors */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold mb-4" style={{ color: "var(--text-heading)" }}>
              Text Colors
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <ColorSwatch name="--text-heading" value="#0A1628" description="Headings" />
              <ColorSwatch name="--text-body" value="#3D4852" description="Body text" />
              <ColorSwatch name="--text-muted" value="#6B7280" description="Secondary" />
              <ColorSwatch name="--text-light" value="#9CA3AF" description="Placeholder" />
            </div>
          </div>

          {/* Status Colors */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold mb-4" style={{ color: "var(--text-heading)" }}>
              Status Colors
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <ColorSwatch name="--success" value="#059669" />
              <ColorSwatch name="--success-light" value="rgba(5, 150, 105, 0.1)" />
              <ColorSwatch name="--warning" value="#D97706" />
              <ColorSwatch name="--warning-light" value="rgba(217, 119, 6, 0.1)" />
              <ColorSwatch name="--error" value="#DC2626" />
              <ColorSwatch name="--error-light" value="rgba(220, 38, 38, 0.1)" />
            </div>
          </div>

          {/* Border Colors */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold mb-4" style={{ color: "var(--text-heading)" }}>
              Borders
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <ColorSwatch name="--border" value="#E5E7EB" description="Default" />
              <ColorSwatch name="--border-hover" value="#D1D5DB" />
              <ColorSwatch name="--border-focus" value="#0052CC" />
            </div>
          </div>
        </section>

        {/* =================================================================
            TYPOGRAPHY
            ================================================================= */}
        <section id="typography">
          <h2 className="text-2xl font-bold mb-2" style={{ color: "var(--text-heading)" }}>
            Typography
          </h2>
          <p className="mb-6" style={{ color: "var(--text-muted)" }}>
            Headings: Dark Navy (#0A1628), weight 700-800 | Body: Warm Gray (#3D4852)
          </p>

          <div className="card p-8 space-y-6">
            <div className="border-b pb-4" style={{ borderColor: "var(--border)" }}>
              <span className="label-meta">H1 - font-weight: 800, letter-spacing: -0.02em</span>
              <h1 className="text-5xl mt-2">Heading Level 1</h1>
            </div>

            <div className="border-b pb-4" style={{ borderColor: "var(--border)" }}>
              <span className="label-meta">H2 - font-weight: 700</span>
              <h2 className="text-4xl mt-2">Heading Level 2</h2>
            </div>

            <div className="border-b pb-4" style={{ borderColor: "var(--border)" }}>
              <span className="label-meta">H3 - font-weight: 700</span>
              <h3 className="text-3xl mt-2">Heading Level 3</h3>
            </div>

            <div className="border-b pb-4" style={{ borderColor: "var(--border)" }}>
              <span className="label-meta">H4</span>
              <h4 className="text-2xl mt-2">Heading Level 4</h4>
            </div>

            <div className="border-b pb-4" style={{ borderColor: "var(--border)" }}>
              <span className="label-meta">H5</span>
              <h5 className="text-xl mt-2">Heading Level 5</h5>
            </div>

            <div className="border-b pb-4" style={{ borderColor: "var(--border)" }}>
              <span className="label-meta">H6</span>
              <h6 className="text-lg mt-2">Heading Level 6</h6>
            </div>

            <div className="border-b pb-4" style={{ borderColor: "var(--border)" }}>
              <span className="label-meta">Body Text - color: var(--text-body), line-height: 1.6</span>
              <p className="text-base mt-2">
                This is regular body text. EasyLehrer ist die Schweizer Plattform für Lehrpersonen,
                um Unterrichtsmaterialien zu kaufen, verkaufen und zu teilen. Die Plattform ist auf
                den Lehrplan 21 ausgerichtet.
              </p>
            </div>

            <div className="border-b pb-4" style={{ borderColor: "var(--border)" }}>
              <span className="label-meta">Small Text</span>
              <p className="text-sm mt-2" style={{ color: "var(--text-muted)" }}>
                This is smaller text, often used for captions and metadata.
              </p>
            </div>

            <div>
              <span className="label-meta">Meta Label - .label-meta class</span>
              <p className="label-meta mt-2">UPPERCASE TRACKED LABEL</p>
            </div>
          </div>

          {/* Font Sizes Reference */}
          <div className="mt-8">
            <h3 className="text-lg font-semibold mb-4" style={{ color: "var(--text-heading)" }}>
              Tailwind Font Sizes
            </h3>
            <div className="card p-6 overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b" style={{ borderColor: "var(--border)" }}>
                    <th className="pb-3 font-semibold">Class</th>
                    <th className="pb-3 font-semibold">Size</th>
                    <th className="pb-3 font-semibold">Example</th>
                  </tr>
                </thead>
                <tbody className="divide-y" style={{ borderColor: "var(--border)" }}>
                  <tr><td className="py-3">text-xs</td><td>0.75rem (12px)</td><td className="text-xs">Sample text</td></tr>
                  <tr><td className="py-3">text-sm</td><td>0.875rem (14px)</td><td className="text-sm">Sample text</td></tr>
                  <tr><td className="py-3">text-base</td><td>1rem (16px)</td><td className="text-base">Sample text</td></tr>
                  <tr><td className="py-3">text-lg</td><td>1.125rem (18px)</td><td className="text-lg">Sample text</td></tr>
                  <tr><td className="py-3">text-xl</td><td>1.25rem (20px)</td><td className="text-xl">Sample text</td></tr>
                  <tr><td className="py-3">text-2xl</td><td>1.5rem (24px)</td><td className="text-2xl">Sample text</td></tr>
                  <tr><td className="py-3">text-3xl</td><td>1.875rem (30px)</td><td className="text-3xl">Sample text</td></tr>
                  <tr><td className="py-3">text-4xl</td><td>2.25rem (36px)</td><td className="text-4xl">Sample text</td></tr>
                  <tr><td className="py-3">text-5xl</td><td>3rem (48px)</td><td className="text-5xl">Sample</td></tr>
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* =================================================================
            SPACING
            ================================================================= */}
        <section id="spacing">
          <h2 className="text-2xl font-bold mb-2" style={{ color: "var(--text-heading)" }}>
            Spacing
          </h2>
          <p className="mb-6" style={{ color: "var(--text-muted)" }}>
            20% increased spacing for breathing room. Using CSS variables for consistency.
          </p>

          <div className="card p-6">
            <h3 className="text-lg font-semibold mb-4" style={{ color: "var(--text-heading)" }}>
              Custom Spacing Variables
            </h3>
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <code className="text-sm bg-gray-100 px-2 py-1 rounded">--space-section</code>
                <span style={{ color: "var(--text-muted)" }}>5rem (80px)</span>
                <div className="h-4 bg-blue-200" style={{ width: "5rem" }}></div>
              </div>
              <div className="flex items-center gap-4">
                <code className="text-sm bg-gray-100 px-2 py-1 rounded">--space-card</code>
                <span style={{ color: "var(--text-muted)" }}>1.75rem (28px)</span>
                <div className="h-4 bg-blue-200" style={{ width: "1.75rem" }}></div>
              </div>
            </div>

            <h3 className="text-lg font-semibold mt-8 mb-4" style={{ color: "var(--text-heading)" }}>
              Tailwind Spacing Scale
            </h3>
            <div className="flex flex-wrap gap-4 items-end">
              {[1, 2, 3, 4, 5, 6, 8, 10, 12, 16, 20, 24].map((size) => (
                <div key={size} className="text-center">
                  <div
                    className="bg-blue-500 mx-auto mb-2"
                    style={{ width: `${size * 4}px`, height: `${size * 4}px` }}
                  ></div>
                  <span className="text-xs" style={{ color: "var(--text-muted)" }}>{size}</span>
                  <br />
                  <span className="text-xs" style={{ color: "var(--text-light)" }}>{size * 4}px</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* =================================================================
            BORDER RADIUS
            ================================================================= */}
        <section id="border-radius">
          <h2 className="text-2xl font-bold mb-2" style={{ color: "var(--text-heading)" }}>
            Border Radius
          </h2>
          <p className="mb-6" style={{ color: "var(--text-muted)" }}>
            Modern, friendly rounded corners using CSS variables.
          </p>

          <div className="card p-6">
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-6">
              <RadiusSwatch name="--radius-xs" value="4px" />
              <RadiusSwatch name="--radius-sm" value="6px" />
              <RadiusSwatch name="--radius-md" value="8px" />
              <RadiusSwatch name="--radius-lg" value="12px" />
              <RadiusSwatch name="--radius-xl" value="16px" />
              <RadiusSwatch name="--radius-2xl" value="20px" />
              <RadiusSwatch name="--radius-full" value="9999px" />
            </div>
          </div>
        </section>

        {/* =================================================================
            SHADOWS
            ================================================================= */}
        <section id="shadows">
          <h2 className="text-2xl font-bold mb-2" style={{ color: "var(--text-heading)" }}>
            Shadows
          </h2>
          <p className="mb-6" style={{ color: "var(--text-muted)" }}>
            Soft elevation with Swiss-style subtle depth.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <ShadowSwatch name="--shadow-xs" />
            <ShadowSwatch name="--shadow-sm" />
            <ShadowSwatch name="--shadow-md" />
            <ShadowSwatch name="--shadow-lg" />
            <ShadowSwatch name="--shadow-xl" />
            <ShadowSwatch name="--shadow-card" />
            <ShadowSwatch name="--shadow-card-hover" />
            <ShadowSwatch name="--shadow-glass" />
          </div>
        </section>

        {/* =================================================================
            BUTTONS
            ================================================================= */}
        <section id="buttons">
          <h2 className="text-2xl font-bold mb-2" style={{ color: "var(--text-heading)" }}>
            Buttons
          </h2>
          <p className="mb-6" style={{ color: "var(--text-muted)" }}>
            Three tiers: Primary (Trust Blue), Secondary (Gray fill), Tertiary (Bordered).
          </p>

          <div className="card p-8 space-y-8">
            {/* Primary */}
            <div>
              <span className="label-meta mb-3 block">Primary - .btn-primary</span>
              <div className="flex flex-wrap gap-4">
                <button className="btn-primary px-6 py-3">Primary Button</button>
                <button className="btn-primary px-6 py-3 opacity-50 cursor-not-allowed">Disabled</button>
              </div>
              <p className="text-sm mt-3" style={{ color: "var(--text-muted)" }}>
                Use for main CTAs. Hover: translateY(-2px) + shadow. Active: translateY(0).
              </p>
            </div>

            {/* Secondary */}
            <div>
              <span className="label-meta mb-3 block">Secondary - .btn-secondary</span>
              <div className="flex flex-wrap gap-4">
                <button className="btn-secondary px-6 py-3">Secondary Button</button>
                <button className="btn-secondary px-6 py-3 opacity-50 cursor-not-allowed">Disabled</button>
              </div>
              <p className="text-sm mt-3" style={{ color: "var(--text-muted)" }}>
                Light gray fill, no border. Use for secondary actions.
              </p>
            </div>

            {/* Tertiary */}
            <div>
              <span className="label-meta mb-3 block">Tertiary - .btn-tertiary</span>
              <div className="flex flex-wrap gap-4">
                <button className="btn-tertiary px-6 py-3">Tertiary Button</button>
                <button className="btn-tertiary px-6 py-3 opacity-50 cursor-not-allowed">Disabled</button>
              </div>
              <p className="text-sm mt-3" style={{ color: "var(--text-muted)" }}>
                White with border. Hover: border and text turn primary blue.
              </p>
            </div>

            {/* Size Variants */}
            <div>
              <span className="label-meta mb-3 block">Size Variants (using Tailwind padding)</span>
              <div className="flex flex-wrap items-center gap-4">
                <button className="btn-primary px-3 py-1.5 text-sm">Small</button>
                <button className="btn-primary px-5 py-2.5">Medium</button>
                <button className="btn-primary px-6 py-3">Default</button>
                <button className="btn-primary px-8 py-4 text-lg">Large</button>
              </div>
            </div>
          </div>
        </section>

        {/* =================================================================
            CARDS
            ================================================================= */}
        <section id="cards">
          <h2 className="text-2xl font-bold mb-2" style={{ color: "var(--text-heading)" }}>
            Cards
          </h2>
          <p className="mb-6" style={{ color: "var(--text-muted)" }}>
            Modern Swiss aesthetic with subtle shadows and hover animations.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Standard Card */}
            <div className="card p-6">
              <span className="label-meta mb-2 block">Standard Card</span>
              <h3 className="text-lg font-semibold mb-2">Card Title</h3>
              <p className="text-sm" style={{ color: "var(--text-muted)" }}>
                Uses .card class. Hover: translateY(-4px) + enhanced shadow.
              </p>
            </div>

            {/* Glass Card */}
            <div className="glass-card p-6">
              <span className="label-meta mb-2 block">Glass Card</span>
              <h3 className="text-lg font-semibold mb-2">Glass Morphism</h3>
              <p className="text-sm" style={{ color: "var(--text-muted)" }}>
                Uses .glass-card class. For auth pages.
              </p>
            </div>

            {/* Card with geometric bg */}
            <div className="geometric-bg rounded-xl p-6 border" style={{ borderColor: "var(--border)" }}>
              <span className="label-meta mb-2 block">Geometric BG</span>
              <h3 className="text-lg font-semibold mb-2">Grid Pattern</h3>
              <p className="text-sm" style={{ color: "var(--text-muted)" }}>
                Uses .geometric-bg class for subtle grid.
              </p>
            </div>
          </div>

          {/* Card Code Reference */}
          <div className="mt-6 p-4 bg-gray-900 rounded-lg overflow-x-auto">
            <pre className="text-sm text-gray-300">
{`.card {
  background: var(--white);
  border-radius: var(--radius-lg);      /* 12px */
  box-shadow: var(--shadow-card);
  transition: transform 0.2s, box-shadow 0.2s;
}

.card:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-card-hover);
}`}
            </pre>
          </div>
        </section>

        {/* =================================================================
            INPUTS
            ================================================================= */}
        <section id="inputs">
          <h2 className="text-2xl font-bold mb-2" style={{ color: "var(--text-heading)" }}>
            Inputs
          </h2>
          <p className="mb-6" style={{ color: "var(--text-muted)" }}>
            Modern Swiss form elements with focus states.
          </p>

          <div className="card p-8 space-y-6">
            <div>
              <label className="label-meta block mb-2">Text Input - .input</label>
              <input type="text" className="input" placeholder="Enter text here..." />
            </div>

            <div>
              <label className="label-meta block mb-2">With Label</label>
              <label className="block text-sm font-medium mb-1.5" style={{ color: "var(--text-body)" }}>
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

            <div>
              <label className="label-meta block mb-2">Select</label>
              <select className="input">
                <option>Select an option...</option>
                <option>Option 1</option>
                <option>Option 2</option>
              </select>
            </div>
          </div>

          {/* Input Code Reference */}
          <div className="mt-6 p-4 bg-gray-900 rounded-lg overflow-x-auto">
            <pre className="text-sm text-gray-300">
{`.input {
  padding: 0.875rem 1rem;
  border: 1px solid var(--border);
  border-radius: var(--radius-md);      /* 8px */
  background: var(--white);
  color: var(--text-heading);
}

.input:focus {
  border-color: var(--primary);
  box-shadow: 0 0 0 3px var(--primary-light);
}`}
            </pre>
          </div>
        </section>

        {/* =================================================================
            PILLS & TAGS
            ================================================================= */}
        <section id="pills-tags">
          <h2 className="text-2xl font-bold mb-2" style={{ color: "var(--text-heading)" }}>
            Pills & Tags
          </h2>
          <p className="mb-6" style={{ color: "var(--text-muted)" }}>
            For categories, subjects, and status indicators.
          </p>

          <div className="card p-8 space-y-6">
            <div>
              <span className="label-meta mb-3 block">Pill Variants - .pill</span>
              <div className="flex flex-wrap gap-3">
                <span className="pill pill-primary">Primary Pill</span>
                <span className="pill pill-accent">Accent Pill</span>
                <span className="pill pill-neutral">Neutral Pill</span>
              </div>
            </div>

            <div>
              <span className="label-meta mb-3 block">Status Badges</span>
              <div className="flex flex-wrap gap-3">
                <span className="pill" style={{ backgroundColor: "var(--success-light)", color: "var(--success)" }}>
                  Approved
                </span>
                <span className="pill" style={{ backgroundColor: "var(--warning-light)", color: "var(--warning)" }}>
                  Pending
                </span>
                <span className="pill" style={{ backgroundColor: "var(--error-light)", color: "var(--error)" }}>
                  Rejected
                </span>
              </div>
            </div>

            <div>
              <span className="label-meta mb-3 block">Subject Tags Example</span>
              <div className="flex flex-wrap gap-2">
                <span className="pill pill-primary">Mathematik</span>
                <span className="pill pill-primary">Deutsch</span>
                <span className="pill pill-primary">NMG</span>
                <span className="pill pill-accent">Zyklus 2</span>
              </div>
            </div>
          </div>
        </section>

        {/* =================================================================
            NAVIGATION
            ================================================================= */}
        <section id="navigation">
          <h2 className="text-2xl font-bold mb-2" style={{ color: "var(--text-heading)" }}>
            Navigation
          </h2>
          <p className="mb-6" style={{ color: "var(--text-muted)" }}>
            Nav links with active states.
          </p>

          <div className="card p-8">
            <span className="label-meta mb-3 block">Nav Links - .nav-link</span>
            <nav className="flex flex-wrap gap-2">
              <a href="#" className="nav-link nav-link-active">Active Link</a>
              <a href="#" className="nav-link">Katalog</a>
              <a href="#" className="nav-link">Hochladen</a>
              <a href="#" className="nav-link">Dashboard</a>
            </nav>

            <div className="mt-6 p-4 bg-gray-900 rounded-lg overflow-x-auto">
              <pre className="text-sm text-gray-300">
{`.nav-link {
  padding: 0.5rem 1rem;
  font-weight: 500;
  font-size: 0.875rem;
  color: var(--text-body);
  border-radius: var(--radius-full);
}

.nav-link:hover {
  color: var(--primary);
  background-color: var(--primary-light);
}

.nav-link-active {
  background-color: var(--primary-light);
  color: var(--primary);
  font-weight: 600;
}`}
              </pre>
            </div>
          </div>
        </section>

        {/* =================================================================
            UTILITY CLASSES
            ================================================================= */}
        <section id="utility-classes">
          <h2 className="text-2xl font-bold mb-2" style={{ color: "var(--text-heading)" }}>
            Utility Classes
          </h2>
          <p className="mb-6" style={{ color: "var(--text-muted)" }}>
            Additional helper classes defined in globals.css.
          </p>

          <div className="card p-6 overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b" style={{ borderColor: "var(--border)" }}>
                  <th className="pb-3 font-semibold">Class</th>
                  <th className="pb-3 font-semibold">Description</th>
                </tr>
              </thead>
              <tbody className="divide-y" style={{ borderColor: "var(--border)" }}>
                <tr>
                  <td className="py-3"><code className="text-sm bg-gray-100 px-2 py-0.5 rounded">.label-meta</code></td>
                  <td>Uppercase tracked label for metadata</td>
                </tr>
                <tr>
                  <td className="py-3"><code className="text-sm bg-gray-100 px-2 py-0.5 rounded">.text-balance</code></td>
                  <td>Balanced text wrapping</td>
                </tr>
                <tr>
                  <td className="py-3"><code className="text-sm bg-gray-100 px-2 py-0.5 rounded">.header-shadow</code></td>
                  <td>Subtle shadow for headers</td>
                </tr>
                <tr>
                  <td className="py-3"><code className="text-sm bg-gray-100 px-2 py-0.5 rounded">.footer-grounded</code></td>
                  <td>Footer background color</td>
                </tr>
                <tr>
                  <td className="py-3"><code className="text-sm bg-gray-100 px-2 py-0.5 rounded">.divider</code></td>
                  <td>Horizontal line separator</td>
                </tr>
                <tr>
                  <td className="py-3"><code className="text-sm bg-gray-100 px-2 py-0.5 rounded">.geometric-bg</code></td>
                  <td>Grid pattern background</td>
                </tr>
                <tr>
                  <td className="py-3"><code className="text-sm bg-gray-100 px-2 py-0.5 rounded">.glass-card</code></td>
                  <td>Frosted glass effect card</td>
                </tr>
                <tr>
                  <td className="py-3"><code className="text-sm bg-gray-100 px-2 py-0.5 rounded">.animate-fade-in</code></td>
                  <td>Fade in animation (0.3s)</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* =================================================================
            CSS VARIABLES REFERENCE
            ================================================================= */}
        <section id="css-variables">
          <h2 className="text-2xl font-bold mb-2" style={{ color: "var(--text-heading)" }}>
            CSS Variables Quick Reference
          </h2>
          <p className="mb-6" style={{ color: "var(--text-muted)" }}>
            Copy-paste reference for all design tokens.
          </p>

          <div className="p-4 bg-gray-900 rounded-lg overflow-x-auto">
            <pre className="text-sm text-gray-300">
{`/* Primary */
var(--primary)           /* rgba(0, 82, 204, 0.9) */
var(--primary-solid)     /* #0052CC */
var(--primary-hover)     /* #0047B3 */
var(--primary-light)     /* rgba(0, 82, 204, 0.08) */

/* Accents */
var(--accent)            /* #0D9488 - Teal */
var(--secondary)         /* #059669 - Emerald */

/* Backgrounds */
var(--white)             /* #FFFFFF */
var(--background)        /* #F8F9FC - Page background */
var(--surface)           /* #FFFFFF - Card surface */

/* Text */
var(--text-heading)      /* #0A1628 */
var(--text-body)         /* #3D4852 */
var(--text-muted)        /* #6B7280 */
var(--text-light)        /* #9CA3AF */

/* Status */
var(--success)           /* #059669 */
var(--warning)           /* #D97706 */
var(--error)             /* #DC2626 */

/* Borders */
var(--border)            /* #E5E7EB */
var(--border-focus)      /* #0052CC */

/* Radius */
var(--radius-sm)         /* 6px */
var(--radius-md)         /* 8px */
var(--radius-lg)         /* 12px */
var(--radius-xl)         /* 16px */
var(--radius-full)       /* 9999px */

/* Shadows */
var(--shadow-sm)         /* Subtle */
var(--shadow-md)         /* Medium */
var(--shadow-card)       /* Card default */
var(--shadow-card-hover) /* Card hover */

/* Spacing */
var(--space-section)     /* 5rem */
var(--space-card)        /* 1.75rem */`}
            </pre>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="mt-16 py-8 border-t" style={{ borderColor: "var(--border)", backgroundColor: "var(--sidebar-bg)" }}>
        <div className="max-w-7xl mx-auto px-6 text-center">
          <p style={{ color: "var(--text-muted)" }}>
            EasyLehrer Design System v1.0
          </p>
        </div>
      </footer>
    </div>
  );
}

/* =================================================================
   COMPONENT HELPERS
   ================================================================= */

function ColorSwatch({ name, value, description }: { name: string; value: string; description?: string }) {
  const isLight = value.includes("0.08") || value.includes("0.1") ||
                  ["#FFFFFF", "#FAFAF9", "#F8F9FC", "#F1F3F8", "#EEF1F6", "#E5E7EB"].includes(value);

  return (
    <div className="text-center">
      <div
        className="w-full h-20 rounded-lg border mb-2"
        style={{
          backgroundColor: value,
          borderColor: isLight ? "var(--border)" : "transparent"
        }}
      ></div>
      <code className="text-xs block" style={{ color: "var(--text-body)" }}>{name}</code>
      <span className="text-xs" style={{ color: "var(--text-muted)" }}>{value}</span>
      {description && (
        <span className="text-xs block" style={{ color: "var(--text-light)" }}>{description}</span>
      )}
    </div>
  );
}

function RadiusSwatch({ name, value }: { name: string; value: string }) {
  return (
    <div className="text-center">
      <div
        className="w-16 h-16 mx-auto mb-2 border-2"
        style={{
          borderRadius: value,
          borderColor: "var(--primary)",
          backgroundColor: "var(--primary-light)"
        }}
      ></div>
      <code className="text-xs block" style={{ color: "var(--text-body)" }}>{name}</code>
      <span className="text-xs" style={{ color: "var(--text-muted)" }}>{value}</span>
    </div>
  );
}

function ShadowSwatch({ name }: { name: string }) {
  return (
    <div className="text-center">
      <div
        className="w-full h-24 rounded-lg bg-white mb-2"
        style={{ boxShadow: `var(${name})` }}
      ></div>
      <code className="text-xs" style={{ color: "var(--text-body)" }}>{name}</code>
    </div>
  );
}
