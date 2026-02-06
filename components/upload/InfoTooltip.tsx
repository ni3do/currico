"use client";

import { useState, useRef, useEffect } from "react";
import { Info } from "lucide-react";

interface InfoTooltipProps {
  content: string;
  example?: string;
  className?: string;
}

export function InfoTooltip({ content, example, className = "" }: InfoTooltipProps) {
  const [isOpen, setIsOpen] = useState(false);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Close on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        tooltipRef.current &&
        !tooltipRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isOpen]);

  return (
    <div className={`relative inline-flex ${className}`}>
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        onMouseEnter={() => setIsOpen(true)}
        onMouseLeave={() => setIsOpen(false)}
        className="text-text-muted hover:text-info hover:bg-info/10 rounded-full p-0.5 transition-colors"
        aria-label="Mehr Informationen"
      >
        <Info className="h-4 w-4" />
      </button>

      {isOpen && (
        <div
          ref={tooltipRef}
          className="absolute bottom-full left-1/2 z-50 mb-2 w-64 -translate-x-1/2 sm:w-72"
          role="tooltip"
        >
          <div className="border-border bg-surface-elevated rounded-xl border p-3 shadow-xl">
            <p className="text-text text-sm">{content}</p>
            {example && (
              <div className="bg-bg mt-2 rounded-lg px-3 py-2">
                <span className="text-text-muted text-xs">Beispiel: </span>
                <span className="text-text text-xs font-medium">{example}</span>
              </div>
            )}
          </div>
          {/* Arrow */}
          <div className="absolute top-full left-1/2 -mt-1 -translate-x-1/2">
            <div className="border-t-surface-elevated border-8 border-transparent" />
          </div>
        </div>
      )}
    </div>
  );
}

// Tooltip content for all upload form fields
export const FIELD_TOOLTIPS = {
  title: {
    content:
      "Wählen Sie einen klaren, aussagekräftigen Titel, der den Inhalt Ihres Materials beschreibt. Ein guter Titel hilft anderen Lehrpersonen, Ihre Materialien zu finden.",
    example: "Bruchrechnen Übungsblätter Zyklus 2",
  },
  description: {
    content:
      "Beschreiben Sie kurz, was Ihr Material enthält und für welchen Einsatz es gedacht ist. Erwähnen Sie besondere Merkmale oder didaktische Hinweise.",
    example:
      "10 differenzierte Arbeitsblätter zum Thema Bruchrechnen mit Lösungen. Geeignet für Einzel- und Gruppenarbeit.",
  },
  language: {
    content: "Wählen Sie die Hauptsprache des Inhalts. Dies hilft bei der Suche und Filterung.",
  },
  resourceType: {
    content:
      "Wählen Sie das Hauptformat Ihrer Datei. PDF-Dateien werden am häufigsten verwendet und erhalten automatisch eine Vorschau.",
  },
  cycle: {
    content:
      "Der Zyklus definiert die Altersstufe gemäss Lehrplan 21. Zyklus 1: KG-2. Klasse, Zyklus 2: 3.-6. Klasse, Zyklus 3: 7.-9. Klasse.",
  },
  subject: {
    content:
      "Wählen Sie das Hauptfach, zu dem Ihr Material passt. Die verfügbaren Fächer hängen vom gewählten Zyklus ab.",
  },
  canton: {
    content:
      "Optional: Wählen Sie einen Kanton, wenn Ihr Material speziell für bestimmte kantonale Lehrmittel konzipiert ist.",
  },
  competencies: {
    content:
      "Wählen Sie die Lehrplan 21 Kompetenzen aus, die Ihr Material abdeckt. Je genauer Sie zuordnen, desto besser finden Lehrpersonen Ihre Materialien.",
    example: "MA.1.A.1 - Zahlen verstehen",
  },
  lehrmittel: {
    content:
      "Optional: Wählen Sie Lehrmittel aus, zu denen Ihr Material passt. Dies hilft Lehrpersonen, passende Ergänzungsmaterialien zu finden.",
    example: "Zahlenbuch, mathwelt",
  },
  priceType: {
    content:
      "Entscheiden Sie, ob Ihr Material kostenlos oder kostenpflichtig sein soll. Kostenlose Materialien erreichen mehr Nutzer, kostenpflichtige generieren Einkommen.",
  },
  price: {
    content:
      "Legen Sie den Verkaufspreis in CHF fest. Sie erhalten 70% des Verkaufspreises, 30% sind Plattformgebühr. Der Mindestpreis ist CHF 1, Maximum CHF 50.",
    example: "CHF 5.00",
  },
  editable: {
    content:
      "Aktivieren Sie dies, wenn Käufer die Datei bearbeiten können sollen (z.B. Word-Dokumente). Bei PDF-Dateien ist dies meist nicht nötig.",
  },
  files: {
    content:
      "Laden Sie Ihre Hauptdatei(en) hoch. Unterstützte Formate: PDF, Word, PowerPoint, Excel. Maximale Dateigrösse: 50 MB pro Datei.",
  },
  previewFiles: {
    content:
      "Optional: Laden Sie ein eigenes Vorschaubild hoch. Bei PDF-Dateien wird automatisch eine Vorschau aus der ersten Seite erstellt.",
  },
  legalOwnContent: {
    content:
      "Bestätigen Sie, dass Sie alle Bilder, Grafiken und Texte selbst erstellt haben oder nur Materialien mit CC0-Lizenz (Public Domain) verwenden.",
  },
  legalNoTextbookScans: {
    content:
      "Bestätigen Sie, dass Sie keine Seiten aus Lehrmitteln, Schulbüchern oder anderen urheberrechtlich geschützten Werken eingescannt oder kopiert haben.",
  },
  legalNoTrademarks: {
    content:
      "Bestätigen Sie, dass Ihr Material keine geschützten Marken, Logos oder Figuren enthält (z.B. Disney, Marvel, Pokémon).",
  },
  legalSwissGerman: {
    content:
      "Bestätigen Sie, dass Ihr Material die Schweizer Rechtschreibung verwendet (kein Eszett 'ß', stattdessen 'ss').",
  },
  legalTermsAccepted: {
    content:
      "Mit der Annahme der Verkäufervereinbarung bestätigen Sie, dass Sie die Rechte haben, dieses Material zu verkaufen, und die Plattformregeln akzeptieren.",
  },
};
