"use client";

import { useState } from "react";
import Link from "next/link";

interface LP21BadgeProps {
  code: string;
  description?: string;
  anforderungsstufe?: "grund" | "erweitert" | null;
  subjectColor?: string;
  size?: "sm" | "md" | "lg";
  clickable?: boolean;
  showTooltip?: boolean;
}

/**
 * LP21Badge - Displays an LP21 competency code as a colored badge
 *
 * Features:
 * - Subject-colored background based on LP21 color scheme
 * - Hover tooltip showing full description
 * - Click navigates to filtered search
 * - Requirement level badge (G/E)
 */
export function LP21Badge({
  code,
  description,
  anforderungsstufe,
  subjectColor,
  size = "md",
  clickable = true,
  showTooltip = true,
}: LP21BadgeProps) {
  const [tooltipVisible, setTooltipVisible] = useState(false);

  // Extract subject code from LP21 code (e.g., "MA" from "MA.1.A.1")
  const subjectCode = code.split(".")[0];

  // Default colors based on subject if not provided
  const defaultColors: Record<string, string> = {
    MA: "#3b82f6", // Blue
    D: "#e64545", // Red
    F: "#0891b2", // Cyan
    E: "#84cc16", // Lime
    NMG: "#22c55e", // Green
    BG: "#f59e0b", // Yellow/Amber
    TTG: "#a855f7", // Purple
    MU: "#ec4899", // Pink
    BS: "#14b8a6", // Teal
    MI: "#6366f1", // Indigo
    PK: "#8b5cf6", // Violet (Personale)
    SK: "#f97316", // Orange (Soziale)
    MK: "#0ea5e9", // Sky blue (Methodische)
    BNE: "#166534", // Dark green
  };

  const color = subjectColor || defaultColors[subjectCode] || "#6b7280";

  const sizeClasses = {
    sm: "px-1.5 py-0.5 text-xs",
    md: "px-2 py-1 text-sm",
    lg: "px-3 py-1.5 text-base",
  };

  const badgeContent = (
    <span
      className={`inline-flex items-center gap-1 rounded-md font-mono font-semibold transition-all ${sizeClasses[size]} ${
        clickable ? "cursor-pointer hover:opacity-80" : ""
      }`}
      style={{
        backgroundColor: `${color}20`,
        color: color,
        border: `1px solid ${color}40`,
      }}
      onMouseEnter={() => showTooltip && setTooltipVisible(true)}
      onMouseLeave={() => setTooltipVisible(false)}
    >
      {code}
      {anforderungsstufe && (
        <span
          className={`ml-1 rounded px-1 text-[0.65em] font-bold ${
            anforderungsstufe === "grund"
              ? "bg-[var(--color-surface-high)] text-[var(--color-text-muted)]"
              : "bg-[var(--color-warning-light)] text-[var(--color-warning)]"
          }`}
        >
          {anforderungsstufe === "grund" ? "G" : "E"}
        </span>
      )}
    </span>
  );

  const tooltipContent = showTooltip && description && tooltipVisible && (
    <div
      className="absolute bottom-full left-1/2 z-50 mb-2 w-64 -translate-x-1/2 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-3 shadow-xl"
      style={{ maxWidth: "min(300px, 90vw)" }}
    >
      <div className="mb-1 font-mono text-sm font-semibold" style={{ color }}>
        {code}
      </div>
      <p className="text-xs leading-relaxed text-[var(--color-text-muted)]">{description}</p>
      {anforderungsstufe && (
        <div className="mt-2 text-xs text-[var(--color-text-muted)]">
          Anforderungsstufe:{" "}
          <span className="font-medium">
            {anforderungsstufe === "grund" ? "Grundansprüche" : "Erweiterte Ansprüche"}
          </span>
        </div>
      )}
      <div className="absolute -bottom-1.5 left-1/2 h-3 w-3 -translate-x-1/2 rotate-45 border-r border-b border-[var(--color-border)] bg-[var(--color-surface)]" />
    </div>
  );

  if (clickable) {
    return (
      <div className="relative inline-block">
        <Link href={`/resources?competency=${encodeURIComponent(code)}`}>{badgeContent}</Link>
        {tooltipContent}
      </div>
    );
  }

  return (
    <div className="relative inline-block">
      {badgeContent}
      {tooltipContent}
    </div>
  );
}

/**
 * TransversalBadge - Displays a transversal competency badge
 */
interface TransversalBadgeProps {
  code: string;
  name: string;
  icon?: string;
  color?: string;
  size?: "sm" | "md" | "lg";
  clickable?: boolean;
}

export function TransversalBadge({
  code,
  name,
  icon,
  color = "#8b5cf6",
  size = "md",
  clickable = true,
}: TransversalBadgeProps) {
  const sizeClasses = {
    sm: "px-1.5 py-0.5 text-xs",
    md: "px-2 py-1 text-sm",
    lg: "px-3 py-1.5 text-base",
  };

  const badgeContent = (
    <span
      className={`inline-flex items-center gap-1.5 rounded-md font-medium transition-all ${sizeClasses[size]} ${
        clickable ? "cursor-pointer hover:opacity-80" : ""
      }`}
      style={{
        backgroundColor: `${color}20`,
        color: color,
        border: `1px solid ${color}40`,
      }}
      title={name}
    >
      {icon && <span className="text-current">{icon}</span>}
      {code}
    </span>
  );

  if (clickable) {
    return <Link href={`/resources?transversal=${encodeURIComponent(code)}`}>{badgeContent}</Link>;
  }

  return badgeContent;
}

/**
 * BneBadge - Displays a BNE theme badge
 */
interface BneBadgeProps {
  code: string;
  name: string;
  sdgNumber?: number;
  icon?: string;
  color?: string;
  size?: "sm" | "md" | "lg";
  clickable?: boolean;
}

export function BneBadge({
  code,
  name,
  sdgNumber,
  icon,
  color = "#166534",
  size = "md",
  clickable = true,
}: BneBadgeProps) {
  const sizeClasses = {
    sm: "px-1.5 py-0.5 text-xs",
    md: "px-2 py-1 text-sm",
    lg: "px-3 py-1.5 text-base",
  };

  const badgeContent = (
    <span
      className={`inline-flex items-center gap-1.5 rounded-md font-medium transition-all ${sizeClasses[size]} ${
        clickable ? "cursor-pointer hover:opacity-80" : ""
      }`}
      style={{
        backgroundColor: `${color}20`,
        color: color,
        border: `1px solid ${color}40`,
      }}
      title={`${name}${sdgNumber ? ` (SDG ${sdgNumber})` : ""}`}
    >
      {icon && <span className="text-current">{icon}</span>}
      {code}
      {sdgNumber && (
        <span className="ml-0.5 rounded-full bg-current/20 px-1 text-[0.7em]">SDG{sdgNumber}</span>
      )}
    </span>
  );

  if (clickable) {
    return <Link href={`/resources?bne=${encodeURIComponent(code)}`}>{badgeContent}</Link>;
  }

  return badgeContent;
}
