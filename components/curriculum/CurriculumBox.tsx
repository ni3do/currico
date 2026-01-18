"use client";

import { LP21Badge, TransversalBadge, BneBadge } from "./LP21Badge";

interface Competency {
  id: string;
  code: string;
  description_de: string;
  anforderungsstufe?: string | null;
  subjectCode?: string;
  subjectColor?: string;
}

interface Transversal {
  id: string;
  code: string;
  name_de: string;
  icon?: string | null;
  color?: string | null;
}

interface BneTheme {
  id: string;
  code: string;
  name_de: string;
  sdg_number?: number | null;
  icon?: string | null;
  color?: string | null;
}

interface CurriculumBoxProps {
  competencies?: Competency[];
  transversals?: Transversal[];
  bneThemes?: BneTheme[];
  isMiIntegrated?: boolean;
  showEmptyState?: boolean;
  compact?: boolean;
}

/**
 * CurriculumBox - Displays curriculum alignment information for a resource
 *
 * Shows:
 * - LP21 competency badges with requirement levels
 * - Transversal competency icons
 * - BNE theme badges
 * - M&I integration indicator
 */
export function CurriculumBox({
  competencies = [],
  transversals = [],
  bneThemes = [],
  isMiIntegrated = false,
  showEmptyState = false,
  compact = false,
}: CurriculumBoxProps) {
  const hasContent =
    competencies.length > 0 || transversals.length > 0 || bneThemes.length > 0 || isMiIntegrated;

  if (!hasContent && !showEmptyState) {
    return null;
  }

  if (!hasContent && showEmptyState) {
    return (
      <div className="rounded-xl border border-border bg-surface p-4">
        <div className="text-center text-sm text-text-muted">
          Keine Lehrplan 21 Zuordnung vorhanden
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-surface">
      {/* Header */}
      <div className="border-b border-border bg-surface-elevated px-4 py-3">
        <div className="flex items-center gap-2">
          <svg
            className="h-5 w-5 text-primary"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
            />
          </svg>
          <h3 className="font-semibold text-text">Lehrplan 21 Zuordnung</h3>
        </div>
      </div>

      <div className={`p-4 ${compact ? "space-y-3" : "space-y-4"}`}>
        {/* LP21 Competencies */}
        {competencies.length > 0 && (
          <div>
            <h4 className="mb-2 text-xs font-semibold tracking-wide text-text-muted uppercase">
              Kompetenzen
            </h4>
            <div className="flex flex-wrap gap-2">
              {competencies.map((comp) => (
                <LP21Badge
                  key={comp.id}
                  code={comp.code}
                  description={comp.description_de}
                  anforderungsstufe={comp.anforderungsstufe as "grund" | "erweitert" | null}
                  subjectColor={comp.subjectColor}
                  size={compact ? "sm" : "md"}
                />
              ))}
            </div>
          </div>
        )}

        {/* Transversal Competencies */}
        {transversals.length > 0 && (
          <div>
            <h4 className="mb-2 text-xs font-semibold tracking-wide text-text-muted uppercase">
              Überfachliche Kompetenzen
            </h4>
            <div className="flex flex-wrap gap-2">
              {transversals.map((trans) => (
                <TransversalBadge
                  key={trans.id}
                  code={trans.code}
                  name={trans.name_de}
                  icon={trans.icon || undefined}
                  color={trans.color || undefined}
                  size={compact ? "sm" : "md"}
                />
              ))}
            </div>
          </div>
        )}

        {/* BNE Themes */}
        {bneThemes.length > 0 && (
          <div>
            <h4 className="mb-2 text-xs font-semibold tracking-wide text-text-muted uppercase">
              BNE Themen
            </h4>
            <div className="flex flex-wrap gap-2">
              {bneThemes.map((bne) => (
                <BneBadge
                  key={bne.id}
                  code={bne.code}
                  name={bne.name_de}
                  sdgNumber={bne.sdg_number || undefined}
                  icon={bne.icon || undefined}
                  color={bne.color || undefined}
                  size={compact ? "sm" : "md"}
                />
              ))}
            </div>
          </div>
        )}

        {/* M&I Integration Indicator */}
        {isMiIntegrated && (
          <div className="flex items-center gap-2 rounded-lg bg-[#6366f1]/10 px-3 py-2">
            <svg
              className="h-5 w-5 text-[#6366f1]"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              />
            </svg>
            <span className="text-sm font-medium text-[#6366f1]">
              Medien und Informatik integriert
            </span>
          </div>
        )}
      </div>

      {/* Legend/Help */}
      {!compact && competencies.some((c) => c.anforderungsstufe) && (
        <div className="border-t border-border bg-surface-elevated px-4 py-2">
          <div className="flex items-center gap-4 text-xs text-text-muted">
            <span className="flex items-center gap-1">
              <span className="rounded bg-surface-hover px-1 font-bold text-text-muted">
                G
              </span>
              Grundansprüche
            </span>
            <span className="flex items-center gap-1">
              <span className="rounded bg-warning/15 px-1 font-bold text-warning">
                E
              </span>
              Erweiterte Ansprüche
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * CurriculumBoxCompact - A minimal version for resource cards
 */
export function CurriculumBoxCompact({
  competencies = [],
  isMiIntegrated = false,
}: {
  competencies?: Competency[];
  isMiIntegrated?: boolean;
}) {
  if (competencies.length === 0 && !isMiIntegrated) {
    return null;
  }

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {competencies.slice(0, 3).map((comp) => (
        <LP21Badge
          key={comp.id}
          code={comp.code}
          subjectColor={comp.subjectColor}
          size="sm"
          clickable={false}
          showTooltip={false}
        />
      ))}
      {competencies.length > 3 && (
        <span className="text-xs text-text-muted">+{competencies.length - 3}</span>
      )}
      {isMiIntegrated && (
        <span
          className="inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-xs font-medium"
          style={{
            backgroundColor: "#6366f120",
            color: "#6366f1",
          }}
          title="Medien und Informatik integriert"
        >
          M&I
        </span>
      )}
    </div>
  );
}
