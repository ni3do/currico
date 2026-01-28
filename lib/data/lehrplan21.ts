/**
 * Lehrplan 21 Data Structure
 *
 * This file contains the static LP21 curriculum data used for:
 * 1. Seeding the database (prisma/seed-curriculum.ts)
 * 2. Fallback when API is unavailable
 *
 * For runtime use, prefer fetching from the API via useCurriculum hook.
 *
 * Hierarchical structure:
 * - Level 1: Fachbereich (Subject Area)
 * - Level 2: Kompetenzbereich (Competence Area)
 * - Level 3: Kompetenz / Handlungsaspekt (Competence / Action Aspect)
 *
 * Each Fachbereich is available in specific Zyklen (Cycles 1-3)
 *
 * Handlungsaspekte / Themen (Detail) are stored but NOT displayed in navigation.
 */

// Re-export types from the centralized types file
export type { Kompetenz, Kompetenzbereich, Fachbereich, Zyklus } from "../curriculum-types";

import type { Fachbereich, Zyklus, Kompetenzbereich, Kompetenz } from "../curriculum-types";

// Zyklen (Cycles) - Static data, doesn't need to be in DB
export const ZYKLEN: Zyklus[] = [
  {
    id: 1,
    name: "Zyklus 1",
    shortName: "Z1",
    grades: ["KG", "1", "2"],
    description: "Kindergarten – 2. Klasse",
  },
  {
    id: 2,
    name: "Zyklus 2",
    shortName: "Z2",
    grades: ["3", "4", "5", "6"],
    description: "3. – 6. Klasse",
  },
  {
    id: 3,
    name: "Zyklus 3",
    shortName: "Z3",
    grades: ["7", "8", "9"],
    description: "7. – 9. Klasse",
  },
];

// Fachbereiche with full LP21 hierarchy
// Each subject has a unique color from the Catppuccin Latte palette
export const FACHBEREICHE: Fachbereich[] = [
  // ============ SPRACHEN ============
  {
    code: "D",
    name: "Deutsch",
    shortName: "DE",
    color: "#d20f39", // Red - Catppuccin Red
    colorClass: "subject-deutsch",
    icon: "book-open",
    cycles: [1, 2, 3],
    kompetenzbereiche: [
      {
        code: "D.1",
        name: "Hören",
        handlungsaspekte: ["Zuhören", "Verstehen"],
        kompetenzen: [
          {
            code: "D.1.A",
            name: "Zuhören",
            handlungsaspekte: ["Aufmerksam zuhören", "Hörverstehen entwickeln"],
          },
          {
            code: "D.1.B",
            name: "Verstehen",
            handlungsaspekte: ["Gehörtes verstehen", "Informationen verarbeiten"],
          },
        ],
      },
      {
        code: "D.2",
        name: "Lesen",
        handlungsaspekte: ["Grundfertigkeiten", "Verstehen", "Reflexion"],
        kompetenzen: [
          {
            code: "D.2.A",
            name: "Grundfertigkeiten",
            handlungsaspekte: ["Lesetechnik", "Leseflüssigkeit"],
          },
          {
            code: "D.2.B",
            name: "Verstehen",
            handlungsaspekte: ["Texte verstehen", "Informationen entnehmen"],
          },
          {
            code: "D.2.C",
            name: "Reflexion",
            handlungsaspekte: ["Über Gelesenes nachdenken", "Texte beurteilen"],
          },
        ],
      },
      {
        code: "D.3",
        name: "Sprechen",
        handlungsaspekte: ["Dialogisches Sprechen", "Monologisches Sprechen", "Sprachreflexion"],
        kompetenzen: [
          {
            code: "D.3.A",
            name: "Dialogisches Sprechen",
            handlungsaspekte: ["Gespräche führen", "Sich austauschen"],
          },
          {
            code: "D.3.B",
            name: "Monologisches Sprechen",
            handlungsaspekte: ["Vortragen", "Erzählen", "Präsentieren"],
          },
          {
            code: "D.3.C",
            name: "Sprachreflexion",
            handlungsaspekte: ["Über Sprache nachdenken", "Sprachbewusstsein"],
          },
        ],
      },
      {
        code: "D.4",
        name: "Schreiben",
        handlungsaspekte: [
          "Grundfertigkeiten",
          "Schreibprozesse",
          "Schreibprodukte",
          "Texte verfassen",
          "Schreibkompetenz reflektieren",
        ],
        kompetenzen: [
          {
            code: "D.4.A",
            name: "Grundfertigkeiten",
            handlungsaspekte: ["Handschrift", "Tastaturschreiben"],
          },
          {
            code: "D.4.B",
            name: "Schreibprozesse",
            handlungsaspekte: ["Planen", "Formulieren", "Überarbeiten"],
          },
          {
            code: "D.4.C",
            name: "Schreibprodukte",
            handlungsaspekte: ["Textsorten", "Textmuster"],
          },
          {
            code: "D.4.D",
            name: "Texte verfassen",
            handlungsaspekte: ["Inhaltlich gestalten", "Sprachlich gestalten"],
          },
          {
            code: "D.4.E",
            name: "Schreibkompetenz reflektieren",
            handlungsaspekte: ["Eigene Texte beurteilen", "Schreibstrategien"],
          },
        ],
      },
      {
        code: "D.5",
        name: "Sprache(n) im Fokus",
        handlungsaspekte: [
          "Verfahren & Proben",
          "Grammatikbegriffe",
          "Rechtschreibung",
          "Sprachgebrauch untersuchen",
        ],
        kompetenzen: [
          {
            code: "D.5.A",
            name: "Verfahren & Proben",
            handlungsaspekte: ["Sprachliche Proben anwenden"],
          },
          {
            code: "D.5.B",
            name: "Grammatikbegriffe",
            handlungsaspekte: ["Wortarten", "Satzglieder", "Satzarten"],
          },
          {
            code: "D.5.C",
            name: "Rechtschreibung",
            handlungsaspekte: ["Rechtschreibregeln", "Zeichensetzung"],
          },
          {
            code: "D.5.D",
            name: "Sprachgebrauch untersuchen",
            handlungsaspekte: ["Sprache vergleichen", "Sprachvarietäten"],
          },
        ],
      },
      {
        code: "D.6",
        name: "Literatur im Fokus",
        handlungsaspekte: ["Lesen & Genießen", "Literatur erschließen", "Mit Literatur umgehen"],
        kompetenzen: [
          {
            code: "D.6.A",
            name: "Lesen & Genießen",
            handlungsaspekte: ["Lesefreude entwickeln", "Literarische Texte erleben"],
          },
          {
            code: "D.6.B",
            name: "Literatur erschließen",
            handlungsaspekte: ["Texte analysieren", "Gattungen kennen"],
          },
          {
            code: "D.6.C",
            name: "Mit Literatur umgehen",
            handlungsaspekte: ["Kreativ mit Texten umgehen", "Literatur präsentieren"],
          },
        ],
      },
    ],
  },
  {
    code: "FS",
    name: "Fremdsprachen",
    shortName: "FS",
    color: "#1e66f5", // Blue - Catppuccin Blue
    colorClass: "subject-fremdsprachen",
    icon: "globe",
    cycles: [2, 3],
    kompetenzbereiche: [
      {
        code: "FS.1",
        name: "Hören",
        handlungsaspekte: ["Verstehen von gesprochener Sprache (Englisch/Französisch)"],
        kompetenzen: [
          {
            code: "FS.1.A",
            name: "Monologische Texte verstehen",
            handlungsaspekte: ["Hörtexte verstehen"],
          },
          {
            code: "FS.1.B",
            name: "Dialogische Texte verstehen",
            handlungsaspekte: ["Gespräche verstehen"],
          },
        ],
      },
      {
        code: "FS.2",
        name: "Lesen",
        handlungsaspekte: ["Verstehen von geschriebener Sprache"],
        kompetenzen: [
          {
            code: "FS.2.A",
            name: "Texte lesen und verstehen",
            handlungsaspekte: ["Lesetexte verstehen", "Informationen entnehmen"],
          },
          { code: "FS.2.B", name: "Lesestrategien", handlungsaspekte: ["Strategien anwenden"] },
        ],
      },
      {
        code: "FS.3",
        name: "Sprechen",
        handlungsaspekte: ["Zusammenhängendes Sprechen", "An Gesprächen teilnehmen"],
        kompetenzen: [
          {
            code: "FS.3.A",
            name: "Zusammenhängendes Sprechen",
            handlungsaspekte: ["Monologisch sprechen", "Präsentieren"],
          },
          {
            code: "FS.3.B",
            name: "An Gesprächen teilnehmen",
            handlungsaspekte: ["Dialogisch sprechen", "Interagieren"],
          },
        ],
      },
      {
        code: "FS.4",
        name: "Schreiben",
        handlungsaspekte: ["Texte schreiben und gestalten"],
        kompetenzen: [
          {
            code: "FS.4.A",
            name: "Texte schreiben",
            handlungsaspekte: ["Schriftliche Texte verfassen"],
          },
          {
            code: "FS.4.B",
            name: "Texte gestalten",
            handlungsaspekte: ["Texte überarbeiten", "Schreibstrategien"],
          },
        ],
      },
      {
        code: "FS.5",
        name: "Sprache(n) im Fokus",
        handlungsaspekte: [
          "Bewusstheit für Sprache",
          "Wortschatz",
          "Grammatik",
          "Aussprache",
          "Lernstrategien",
        ],
        kompetenzen: [
          {
            code: "FS.5.A",
            name: "Bewusstheit für Sprache",
            handlungsaspekte: ["Sprachvergleich", "Mehrsprachigkeit"],
          },
          {
            code: "FS.5.B",
            name: "Wortschatz",
            handlungsaspekte: ["Wortschatz aufbauen", "Wortschatz anwenden"],
          },
          { code: "FS.5.C", name: "Grammatik", handlungsaspekte: ["Grammatische Strukturen"] },
          {
            code: "FS.5.D",
            name: "Aussprache",
            handlungsaspekte: ["Aussprache üben", "Intonation"],
          },
          {
            code: "FS.5.E",
            name: "Lernstrategien",
            handlungsaspekte: ["Lernstrategien entwickeln", "Selbstständig lernen"],
          },
        ],
      },
      {
        code: "FS.6",
        name: "Kulturen im Fokus",
        handlungsaspekte: ["Kennen & Verstehen", "Begegnung & Umgang"],
        kompetenzen: [
          {
            code: "FS.6.A",
            name: "Kennen & Verstehen",
            handlungsaspekte: ["Kulturelle Eigenheiten kennen"],
          },
          {
            code: "FS.6.B",
            name: "Begegnung & Umgang",
            handlungsaspekte: ["Interkulturelle Kompetenz", "Respektvoller Umgang"],
          },
        ],
      },
    ],
  },

  // ============ MATHEMATIK ============
  {
    code: "MA",
    name: "Mathematik",
    shortName: "MA",
    color: "#df8e1d", // Yellow - Catppuccin Yellow
    colorClass: "subject-mathe",
    icon: "calculator",
    cycles: [1, 2, 3],
    kompetenzbereiche: [
      {
        code: "MA.1",
        name: "Zahl und Variable",
        handlungsaspekte: [
          "Zählkompetenz & Zahlenraum",
          "Operationen & Rechenwege",
          "Funktionale Zusammenhänge & Terme",
        ],
        kompetenzen: [
          {
            code: "MA.1.A",
            name: "Zählkompetenz & Zahlenraum",
            handlungsaspekte: ["Zahlen verstehen", "Zahlenraum erweitern"],
          },
          {
            code: "MA.1.B",
            name: "Operationen & Rechenwege",
            handlungsaspekte: ["Grundoperationen", "Rechenstrategien"],
          },
          {
            code: "MA.1.C",
            name: "Funktionale Zusammenhänge & Terme",
            handlungsaspekte: ["Variablen", "Terme", "Gleichungen"],
          },
        ],
      },
      {
        code: "MA.2",
        name: "Form und Raum",
        handlungsaspekte: [
          "Operieren mit Figuren & Körpern",
          "Erforschen & Argumentieren",
          "Koordinaten & Pläne",
        ],
        kompetenzen: [
          {
            code: "MA.2.A",
            name: "Operieren mit Figuren & Körpern",
            handlungsaspekte: ["Geometrische Formen", "Konstruieren"],
          },
          {
            code: "MA.2.B",
            name: "Erforschen & Argumentieren",
            handlungsaspekte: ["Geometrische Zusammenhänge", "Beweisen"],
          },
          {
            code: "MA.2.C",
            name: "Koordinaten & Pläne",
            handlungsaspekte: ["Koordinatensystem", "Pläne lesen und erstellen"],
          },
        ],
      },
      {
        code: "MA.3",
        name: "Grössen, Funktionen, Daten",
        handlungsaspekte: [
          "Grössen schätzen & messen",
          "Erforschen & Argumentieren (Sachrechnen)",
          "Daten darstellen & interpretieren",
          "Wahrscheinlichkeit",
        ],
        kompetenzen: [
          {
            code: "MA.3.A",
            name: "Grössen schätzen & messen",
            handlungsaspekte: ["Masseinheiten", "Schätzen", "Messen"],
          },
          {
            code: "MA.3.B",
            name: "Erforschen & Argumentieren",
            handlungsaspekte: ["Sachrechnen", "Problemlösen"],
          },
          {
            code: "MA.3.C",
            name: "Daten darstellen & interpretieren",
            handlungsaspekte: ["Diagramme", "Statistik"],
          },
          {
            code: "MA.3.D",
            name: "Wahrscheinlichkeit",
            handlungsaspekte: ["Zufall", "Wahrscheinlichkeitsrechnung"],
          },
        ],
      },
    ],
  },

  // ============ NATUR, MENSCH, GESELLSCHAFT (Zyklus 1 & 2) ============
  {
    code: "NMG",
    name: "Natur, Mensch, Gesellschaft",
    shortName: "NMG",
    color: "#40a02b", // Green - Catppuccin Green
    colorClass: "subject-nmg",
    icon: "leaf",
    cycles: [1, 2],
    kompetenzbereiche: [
      {
        code: "NMG.1",
        name: "Identität, Körper, Gesundheit",
        handlungsaspekte: [
          "Entwicklung & Identität",
          "Körperfunktionen & -pflege",
          "Ernährung & Gesundheit",
          "Sicherheit & Erste Hilfe",
        ],
        kompetenzen: [
          {
            code: "NMG.1.A",
            name: "Entwicklung & Identität",
            handlungsaspekte: ["Eigene Entwicklung", "Identität erforschen"],
          },
          {
            code: "NMG.1.B",
            name: "Körperfunktionen & -pflege",
            handlungsaspekte: ["Körper kennenlernen", "Hygiene"],
          },
          {
            code: "NMG.1.C",
            name: "Ernährung & Gesundheit",
            handlungsaspekte: ["Gesunde Ernährung", "Wohlbefinden"],
          },
          {
            code: "NMG.1.D",
            name: "Sicherheit & Erste Hilfe",
            handlungsaspekte: ["Gefahren erkennen", "Erste Hilfe"],
          },
        ],
      },
      {
        code: "NMG.2",
        name: "Tiere, Pflanzen, Lebensräume",
        handlungsaspekte: [
          "Tiere & Pflanzen erkunden",
          "Lebensräume erkunden",
          "Beziehungen in der Natur",
          "Artenschutz",
          "Evolution (Ansätze)",
        ],
        kompetenzen: [
          {
            code: "NMG.2.A",
            name: "Tiere & Pflanzen erkunden",
            handlungsaspekte: ["Beobachten", "Bestimmen"],
          },
          {
            code: "NMG.2.B",
            name: "Lebensräume erkunden",
            handlungsaspekte: ["Ökosysteme", "Habitate"],
          },
          {
            code: "NMG.2.C",
            name: "Beziehungen in der Natur",
            handlungsaspekte: ["Nahrungsketten", "Symbiosen"],
          },
          { code: "NMG.2.D", name: "Artenschutz", handlungsaspekte: ["Biodiversität", "Schutz"] },
          {
            code: "NMG.2.E",
            name: "Evolution (Ansätze)",
            handlungsaspekte: ["Entwicklung des Lebens"],
          },
        ],
      },
      {
        code: "NMG.3",
        name: "Stoffe, Energie, Bewegungen",
        handlungsaspekte: [
          "Stoffeigenschaften",
          "Stoffumwandlungen",
          "Energieformen",
          "Bewegung & Kraft",
        ],
        kompetenzen: [
          {
            code: "NMG.3.A",
            name: "Stoffeigenschaften",
            handlungsaspekte: ["Materialien untersuchen"],
          },
          {
            code: "NMG.3.B",
            name: "Stoffumwandlungen",
            handlungsaspekte: ["Aggregatzustände", "Mischen und Trennen"],
          },
          {
            code: "NMG.3.C",
            name: "Energieformen",
            handlungsaspekte: ["Energie erkennen", "Energieumwandlung"],
          },
          {
            code: "NMG.3.D",
            name: "Bewegung & Kraft",
            handlungsaspekte: ["Kräfte erfahren", "Bewegungen untersuchen"],
          },
        ],
      },
      {
        code: "NMG.4",
        name: "Phänomene der Natur",
        handlungsaspekte: [
          "Wetter & Jahreszeiten",
          "Erde & Universum",
          "Naturphänomene erforschen",
          "Umweltprobleme",
        ],
        kompetenzen: [
          {
            code: "NMG.4.A",
            name: "Wetter & Jahreszeiten",
            handlungsaspekte: ["Wetterbeobachtung", "Jahreszeitenwechsel"],
          },
          {
            code: "NMG.4.B",
            name: "Erde & Universum",
            handlungsaspekte: ["Sonnensystem", "Tag und Nacht"],
          },
          {
            code: "NMG.4.C",
            name: "Naturphänomene erforschen",
            handlungsaspekte: ["Experimente", "Beobachtungen"],
          },
          {
            code: "NMG.4.D",
            name: "Umweltprobleme",
            handlungsaspekte: ["Umweltschutz", "Nachhaltigkeit"],
          },
        ],
      },
      {
        code: "NMG.5",
        name: "Technik",
        handlungsaspekte: [
          "Technische Geräte bedienen",
          "Funktionsweisen verstehen",
          "Erfindungen & Entwicklungen",
          "Technikfolgen",
        ],
        kompetenzen: [
          {
            code: "NMG.5.A",
            name: "Technische Geräte bedienen",
            handlungsaspekte: ["Alltagstechnik nutzen"],
          },
          {
            code: "NMG.5.B",
            name: "Funktionsweisen verstehen",
            handlungsaspekte: ["Wie Dinge funktionieren"],
          },
          {
            code: "NMG.5.C",
            name: "Erfindungen & Entwicklungen",
            handlungsaspekte: ["Technikgeschichte", "Innovation"],
          },
          {
            code: "NMG.5.D",
            name: "Technikfolgen",
            handlungsaspekte: ["Auswirkungen von Technik"],
          },
        ],
      },
      {
        code: "NMG.6",
        name: "Arbeit, Produktion, Konsum",
        handlungsaspekte: [
          "Arbeitswelten erkunden",
          "Produktionsabläufe",
          "Geld & Konsum",
          "Werbung",
        ],
        kompetenzen: [
          {
            code: "NMG.6.A",
            name: "Arbeitswelten erkunden",
            handlungsaspekte: ["Berufe kennenlernen"],
          },
          {
            code: "NMG.6.B",
            name: "Produktionsabläufe",
            handlungsaspekte: ["Herstellung von Produkten"],
          },
          {
            code: "NMG.6.C",
            name: "Geld & Konsum",
            handlungsaspekte: ["Umgang mit Geld", "Kaufentscheidungen"],
          },
          {
            code: "NMG.6.D",
            name: "Werbung",
            handlungsaspekte: ["Werbung erkennen und verstehen"],
          },
        ],
      },
      {
        code: "NMG.7",
        name: "Lebensweisen & Menschen",
        handlungsaspekte: [
          "Soziales Umfeld",
          "Wohnen & Zusammenleben",
          "Lebensformen & Kulturen",
          "Migration & Mobilität",
        ],
        kompetenzen: [
          {
            code: "NMG.7.A",
            name: "Soziales Umfeld",
            handlungsaspekte: ["Familie", "Freunde", "Nachbarschaft"],
          },
          {
            code: "NMG.7.B",
            name: "Wohnen & Zusammenleben",
            handlungsaspekte: ["Verschiedene Wohnformen"],
          },
          {
            code: "NMG.7.C",
            name: "Lebensformen & Kulturen",
            handlungsaspekte: ["Kulturelle Vielfalt"],
          },
          {
            code: "NMG.7.D",
            name: "Migration & Mobilität",
            handlungsaspekte: ["Menschen unterwegs", "Einwanderung"],
          },
        ],
      },
      {
        code: "NMG.8",
        name: "Räume nutzen",
        handlungsaspekte: [
          "Schulweg & Umgebung",
          "Karten & Orientierung",
          "Raumplanung & Verkehr",
          "Raumnutzung vergleichen",
        ],
        kompetenzen: [
          { code: "NMG.8.A", name: "Schulweg & Umgebung", handlungsaspekte: ["Nahraum erkunden"] },
          {
            code: "NMG.8.B",
            name: "Karten & Orientierung",
            handlungsaspekte: ["Karten lesen", "Sich orientieren"],
          },
          {
            code: "NMG.8.C",
            name: "Raumplanung & Verkehr",
            handlungsaspekte: ["Verkehrswege", "Siedlungen"],
          },
          {
            code: "NMG.8.D",
            name: "Raumnutzung vergleichen",
            handlungsaspekte: ["Verschiedene Räume"],
          },
        ],
      },
      {
        code: "NMG.9",
        name: "Zeit, Dauer, Wandel",
        handlungsaspekte: [
          "Zeitbegriffe & Zeitmessung",
          "Vergangenheit, Gegenwart, Zukunft",
          "Geschichte & Quellen",
          "Historische Veränderungen",
        ],
        kompetenzen: [
          {
            code: "NMG.9.A",
            name: "Zeitbegriffe & Zeitmessung",
            handlungsaspekte: ["Zeit verstehen", "Zeit messen"],
          },
          {
            code: "NMG.9.B",
            name: "Vergangenheit, Gegenwart, Zukunft",
            handlungsaspekte: ["Zeitliche Einordnung"],
          },
          {
            code: "NMG.9.C",
            name: "Geschichte & Quellen",
            handlungsaspekte: ["Historische Quellen", "Geschichten erzählen"],
          },
          {
            code: "NMG.9.D",
            name: "Historische Veränderungen",
            handlungsaspekte: ["Wandel verstehen"],
          },
        ],
      },
      {
        code: "NMG.10",
        name: "Gemeinschaft & Gesellschaft",
        handlungsaspekte: [
          "Gruppen & Regeln",
          "Konflikte lösen",
          "Demokratie & Mitbestimmung",
          "Rechte & Pflichten",
        ],
        kompetenzen: [
          {
            code: "NMG.10.A",
            name: "Gruppen & Regeln",
            handlungsaspekte: ["Regeln verstehen", "Zusammenleben"],
          },
          {
            code: "NMG.10.B",
            name: "Konflikte lösen",
            handlungsaspekte: ["Streit schlichten", "Kompromisse finden"],
          },
          {
            code: "NMG.10.C",
            name: "Demokratie & Mitbestimmung",
            handlungsaspekte: ["Mitbestimmen", "Abstimmen"],
          },
          {
            code: "NMG.10.D",
            name: "Rechte & Pflichten",
            handlungsaspekte: ["Kinderrechte", "Verantwortung"],
          },
        ],
      },
      {
        code: "NMG.11",
        name: "Grunderfahrungen & Werte",
        handlungsaspekte: [
          "Gefühle & Bedürfnisse",
          "Freundschaft & Liebe",
          "Philosophieren",
          "Ethik & Moral",
        ],
        kompetenzen: [
          {
            code: "NMG.11.A",
            name: "Gefühle & Bedürfnisse",
            handlungsaspekte: ["Gefühle erkennen", "Bedürfnisse benennen"],
          },
          {
            code: "NMG.11.B",
            name: "Freundschaft & Liebe",
            handlungsaspekte: ["Beziehungen pflegen"],
          },
          {
            code: "NMG.11.C",
            name: "Philosophieren",
            handlungsaspekte: ["Nachdenken", "Fragen stellen"],
          },
          {
            code: "NMG.11.D",
            name: "Ethik & Moral",
            handlungsaspekte: ["Gut und Böse", "Werte reflektieren"],
          },
        ],
      },
      {
        code: "NMG.12",
        name: "Religionen & Weltsichten",
        handlungsaspekte: [
          "Religiöse Spuren",
          "Feste & Bräuche",
          "Religiöse Schriften & Lehren",
          "Religionen im Vergleich",
        ],
        kompetenzen: [
          {
            code: "NMG.12.A",
            name: "Religiöse Spuren",
            handlungsaspekte: ["Religion im Alltag entdecken"],
          },
          {
            code: "NMG.12.B",
            name: "Feste & Bräuche",
            handlungsaspekte: ["Religiöse Feiertage", "Traditionen"],
          },
          {
            code: "NMG.12.C",
            name: "Religiöse Schriften & Lehren",
            handlungsaspekte: ["Heilige Texte kennenlernen"],
          },
          {
            code: "NMG.12.D",
            name: "Religionen im Vergleich",
            handlungsaspekte: ["Verschiedene Religionen", "Gemeinsamkeiten und Unterschiede"],
          },
        ],
      },
    ],
  },

  // ============ GESTALTEN ============
  {
    code: "BG",
    name: "Bildnerisches Gestalten",
    shortName: "BG",
    color: "#ea76cb", // Pink - Catppuccin Pink
    colorClass: "subject-bg",
    icon: "palette",
    cycles: [1, 2, 3],
    kompetenzbereiche: [
      {
        code: "BG.1",
        name: "Wahrnehmung & Kommunikation",
        handlungsaspekte: ["Sehen & Verstehen", "Präsentieren & Kommunizieren"],
        kompetenzen: [
          {
            code: "BG.1.A",
            name: "Sehen & Verstehen",
            handlungsaspekte: ["Wahrnehmen", "Beobachten", "Reflektieren"],
          },
          {
            code: "BG.1.B",
            name: "Präsentieren & Kommunizieren",
            handlungsaspekte: ["Arbeiten zeigen", "Über Bilder sprechen"],
          },
        ],
      },
      {
        code: "BG.2",
        name: "Prozesse & Produkte",
        handlungsaspekte: [
          "Bildnerische Verfahren & Materialien",
          "Bildnerische Grundelemente",
          "Bildnerische Konzepte (Fläche, Raum, Zeit)",
        ],
        kompetenzen: [
          {
            code: "BG.2.A",
            name: "Bildnerische Verfahren & Materialien",
            handlungsaspekte: ["Techniken anwenden", "Materialien erkunden"],
          },
          {
            code: "BG.2.B",
            name: "Bildnerische Grundelemente",
            handlungsaspekte: ["Form", "Farbe", "Linie", "Fläche"],
          },
          {
            code: "BG.2.C",
            name: "Bildnerische Konzepte",
            handlungsaspekte: ["Fläche", "Raum", "Zeit", "Bewegung"],
          },
        ],
      },
      {
        code: "BG.3",
        name: "Kontexte & Orientierung",
        handlungsaspekte: ["Kunst & Kulturgeschichte", "Kultur & Gesellschaft"],
        kompetenzen: [
          {
            code: "BG.3.A",
            name: "Kunst & Kulturgeschichte",
            handlungsaspekte: ["Kunstwerke kennenlernen", "Kunstgeschichte"],
          },
          {
            code: "BG.3.B",
            name: "Kultur & Gesellschaft",
            handlungsaspekte: ["Kunst im Alltag", "Visuelle Kultur"],
          },
        ],
      },
    ],
  },
  {
    code: "TTG",
    name: "Textiles und Technisches Gestalten",
    shortName: "TTG",
    color: "#fe640b", // Peach - Catppuccin Peach
    colorClass: "subject-ttg",
    icon: "scissors",
    cycles: [1, 2, 3],
    kompetenzbereiche: [
      {
        code: "TTG.1",
        name: "Wahrnehmung & Kommunikation",
        handlungsaspekte: ["Wahrnehmen & Beschreiben", "Dokumentieren & Präsentieren"],
        kompetenzen: [
          {
            code: "TTG.1.A",
            name: "Wahrnehmen & Beschreiben",
            handlungsaspekte: ["Beobachten", "Analysieren"],
          },
          {
            code: "TTG.1.B",
            name: "Dokumentieren & Präsentieren",
            handlungsaspekte: ["Prozesse festhalten", "Ergebnisse zeigen"],
          },
        ],
      },
      {
        code: "TTG.2",
        name: "Prozesse & Produkte",
        handlungsaspekte: [
          "Material",
          "Verfahren (Verarbeitung)",
          "Funktion & Konstruktion",
          "Gestaltungselemente",
          "Technik & Designprozess",
        ],
        kompetenzen: [
          {
            code: "TTG.2.A",
            name: "Material",
            handlungsaspekte: ["Materialien erkunden", "Eigenschaften verstehen"],
          },
          {
            code: "TTG.2.B",
            name: "Verfahren",
            handlungsaspekte: ["Verarbeitungstechniken", "Handwerkliche Fertigkeiten"],
          },
          {
            code: "TTG.2.C",
            name: "Funktion & Konstruktion",
            handlungsaspekte: ["Funktionale Gestaltung", "Konstruktionsprinzipien"],
          },
          {
            code: "TTG.2.D",
            name: "Gestaltungselemente",
            handlungsaspekte: ["Form", "Farbe", "Oberfläche"],
          },
          {
            code: "TTG.2.E",
            name: "Technik & Designprozess",
            handlungsaspekte: ["Entwerfen", "Planen", "Umsetzen"],
          },
        ],
      },
      {
        code: "TTG.3",
        name: "Kontexte & Orientierung",
        handlungsaspekte: ["Kultur & Geschichte", "Technik, Umwelt & Wirtschaft"],
        kompetenzen: [
          {
            code: "TTG.3.A",
            name: "Kultur & Geschichte",
            handlungsaspekte: ["Design- und Technikgeschichte"],
          },
          {
            code: "TTG.3.B",
            name: "Technik, Umwelt & Wirtschaft",
            handlungsaspekte: ["Nachhaltigkeit", "Ressourcen"],
          },
        ],
      },
    ],
  },

  // ============ MUSIK ============
  {
    code: "MU",
    name: "Musik",
    shortName: "MU",
    color: "#7c3aed", // Violet - Distinct purple
    colorClass: "subject-musik",
    icon: "music",
    cycles: [1, 2, 3],
    kompetenzbereiche: [
      {
        code: "MU.1",
        name: "Singen & Sprechen",
        handlungsaspekte: ["Stimme bilden", "Liederrepertoire", "Experimentieren"],
        kompetenzen: [
          {
            code: "MU.1.A",
            name: "Stimme bilden",
            handlungsaspekte: ["Stimmbildung", "Atemtechnik"],
          },
          {
            code: "MU.1.B",
            name: "Liederrepertoire",
            handlungsaspekte: ["Lieder lernen", "Liedgut pflegen"],
          },
          {
            code: "MU.1.C",
            name: "Experimentieren",
            handlungsaspekte: ["Mit der Stimme experimentieren"],
          },
        ],
      },
      {
        code: "MU.2",
        name: "Hören & Sich-Orientieren",
        handlungsaspekte: [
          "Akustische Orientierung",
          "Musik hören & verstehen",
          "Bedeutung & Funktion",
        ],
        kompetenzen: [
          {
            code: "MU.2.A",
            name: "Akustische Orientierung",
            handlungsaspekte: ["Klänge unterscheiden", "Geräusche erkennen"],
          },
          {
            code: "MU.2.B",
            name: "Musik hören & verstehen",
            handlungsaspekte: ["Aktiv zuhören", "Musik analysieren"],
          },
          {
            code: "MU.2.C",
            name: "Bedeutung & Funktion",
            handlungsaspekte: ["Musik im Alltag", "Musikfunktionen"],
          },
        ],
      },
      {
        code: "MU.3",
        name: "Bewegen & Tanzen",
        handlungsaspekte: ["Körperwahrnehmung", "Bewegung zur Musik", "Tanzen"],
        kompetenzen: [
          {
            code: "MU.3.A",
            name: "Körperwahrnehmung",
            handlungsaspekte: ["Körper spüren", "Koordination"],
          },
          {
            code: "MU.3.B",
            name: "Bewegung zur Musik",
            handlungsaspekte: ["Rhythmisch bewegen", "Bewegungsfolgen"],
          },
          { code: "MU.3.C", name: "Tanzen", handlungsaspekte: ["Tanzformen", "Choreografien"] },
        ],
      },
      {
        code: "MU.4",
        name: "Musizieren",
        handlungsaspekte: ["Instrumente kennen", "Instrumentalspiel", "Ensemblespiel"],
        kompetenzen: [
          {
            code: "MU.4.A",
            name: "Instrumente kennen",
            handlungsaspekte: ["Instrumentenkunde", "Klangfarben"],
          },
          {
            code: "MU.4.B",
            name: "Instrumentalspiel",
            handlungsaspekte: ["Instrumente spielen", "Technik entwickeln"],
          },
          {
            code: "MU.4.C",
            name: "Ensemblespiel",
            handlungsaspekte: ["Zusammen musizieren", "Aufeinander hören"],
          },
        ],
      },
      {
        code: "MU.5",
        name: "Gestaltungsprozesse",
        handlungsaspekte: ["Improvisieren", "Komponieren", "Aufführen"],
        kompetenzen: [
          {
            code: "MU.5.A",
            name: "Improvisieren",
            handlungsaspekte: ["Spontan musizieren", "Kreativ gestalten"],
          },
          { code: "MU.5.B", name: "Komponieren", handlungsaspekte: ["Musik erfinden", "Notieren"] },
          { code: "MU.5.C", name: "Aufführen", handlungsaspekte: ["Präsentieren", "Vortragen"] },
        ],
      },
      {
        code: "MU.6",
        name: "Praxis des musikalischen Wissens",
        handlungsaspekte: ["Rhythmus, Melodie, Harmonie", "Notation", "Geschichte & Gesellschaft"],
        kompetenzen: [
          {
            code: "MU.6.A",
            name: "Rhythmus, Melodie, Harmonie",
            handlungsaspekte: ["Musikalische Grundlagen"],
          },
          {
            code: "MU.6.B",
            name: "Notation",
            handlungsaspekte: ["Noten lesen", "Noten schreiben"],
          },
          {
            code: "MU.6.C",
            name: "Geschichte & Gesellschaft",
            handlungsaspekte: ["Musikgeschichte", "Musik und Gesellschaft"],
          },
        ],
      },
    ],
  },

  // ============ BEWEGUNG UND SPORT ============
  {
    code: "BS",
    name: "Bewegung und Sport",
    shortName: "BS",
    color: "#dc2626", // Red-Orange - Sporty energetic color
    colorClass: "subject-sport",
    icon: "activity",
    cycles: [1, 2, 3],
    kompetenzbereiche: [
      {
        code: "BS.1",
        name: "Laufen, Springen, Werfen",
        handlungsaspekte: ["Leichtathletik-Grundformen"],
        kompetenzen: [
          { code: "BS.1.A", name: "Laufen", handlungsaspekte: ["Lauftechniken", "Ausdauer"] },
          {
            code: "BS.1.B",
            name: "Springen",
            handlungsaspekte: ["Sprungtechniken", "Koordination"],
          },
          {
            code: "BS.1.C",
            name: "Werfen",
            handlungsaspekte: ["Wurftechniken", "Zielgenauigkeit"],
          },
        ],
      },
      {
        code: "BS.2",
        name: "Bewegen an Geräten",
        handlungsaspekte: ["Turnen, Klettern, Balancieren"],
        kompetenzen: [
          { code: "BS.2.A", name: "Turnen", handlungsaspekte: ["Geräteturnen", "Bodenturnen"] },
          {
            code: "BS.2.B",
            name: "Klettern",
            handlungsaspekte: ["Klettertechniken", "Sicherheit"],
          },
          {
            code: "BS.2.C",
            name: "Balancieren",
            handlungsaspekte: ["Gleichgewicht", "Körperspannung"],
          },
        ],
      },
      {
        code: "BS.3",
        name: "Darstellen & Tanzen",
        handlungsaspekte: ["Ausdruck, Rhythmus, Gestaltung"],
        kompetenzen: [
          {
            code: "BS.3.A",
            name: "Ausdruck",
            handlungsaspekte: ["Bewegungsausdruck", "Darstellung"],
          },
          { code: "BS.3.B", name: "Rhythmus", handlungsaspekte: ["Rhythmische Bewegung"] },
          {
            code: "BS.3.C",
            name: "Gestaltung",
            handlungsaspekte: ["Bewegungsgestaltung", "Choreografie"],
          },
        ],
      },
      {
        code: "BS.4",
        name: "Spielen",
        handlungsaspekte: ["Kleine Spiele", "Sportspiele (Ballspiele etc.)"],
        kompetenzen: [
          {
            code: "BS.4.A",
            name: "Kleine Spiele",
            handlungsaspekte: ["Fangspiele", "Laufspiele", "Kooperationsspiele"],
          },
          {
            code: "BS.4.B",
            name: "Sportspiele",
            handlungsaspekte: ["Ballspiele", "Mannschaftsspiele", "Rückschlagspiele"],
          },
        ],
      },
      {
        code: "BS.5",
        name: "Gleiten, Rollen, Fahren",
        handlungsaspekte: ["Wintersport, Radfahren, Trendsportarten"],
        kompetenzen: [
          { code: "BS.5.A", name: "Rollen & Fahren", handlungsaspekte: ["Rollsport", "Radfahren"] },
          {
            code: "BS.5.B",
            name: "Wintersport",
            handlungsaspekte: ["Skifahren", "Schlittschuhlaufen"],
          },
          { code: "BS.5.C", name: "Trendsportarten", handlungsaspekte: ["Neue Bewegungsformen"] },
        ],
      },
      {
        code: "BS.6",
        name: "Bewegen im Wasser",
        handlungsaspekte: ["Schwimmen, Tauchen, Wassersicherheit"],
        kompetenzen: [
          {
            code: "BS.6.A",
            name: "Schwimmen",
            handlungsaspekte: ["Schwimmtechniken", "Schwimmstile"],
          },
          { code: "BS.6.B", name: "Tauchen", handlungsaspekte: ["Tauchtechniken", "Unterwasser"] },
          {
            code: "BS.6.C",
            name: "Wassersicherheit",
            handlungsaspekte: ["Sicherheit im Wasser", "Rettungsschwimmen"],
          },
        ],
      },
    ],
  },

  // ============ MEDIEN UND INFORMATIK ============
  {
    code: "MI",
    name: "Medien und Informatik",
    shortName: "MI",
    color: "#04a5e5", // Sky - Catppuccin Sky
    colorClass: "subject-mi",
    icon: "monitor",
    cycles: [1, 2, 3],
    kompetenzbereiche: [
      {
        code: "MI.1",
        name: "Medien",
        handlungsaspekte: [
          "Medien verstehen",
          "Medien produzieren",
          "Medienkommunikation",
          "Medieneinflüsse",
        ],
        kompetenzen: [
          {
            code: "MI.1.A",
            name: "Medien verstehen",
            handlungsaspekte: ["Medienarten kennen", "Medien kritisch betrachten"],
          },
          {
            code: "MI.1.B",
            name: "Medien produzieren",
            handlungsaspekte: ["Eigene Medien erstellen", "Kreativ gestalten"],
          },
          {
            code: "MI.1.C",
            name: "Medienkommunikation",
            handlungsaspekte: ["Kommunizieren mit Medien", "Social Media"],
          },
          {
            code: "MI.1.D",
            name: "Medieneinflüsse",
            handlungsaspekte: ["Wirkung von Medien", "Medienkompetenz"],
          },
        ],
      },
      {
        code: "MI.2",
        name: "Informatik",
        handlungsaspekte: ["Datenstrukturen", "Algorithmen", "Informatiksysteme"],
        kompetenzen: [
          {
            code: "MI.2.A",
            name: "Datenstrukturen",
            handlungsaspekte: ["Daten organisieren", "Datenformate"],
          },
          {
            code: "MI.2.B",
            name: "Algorithmen",
            handlungsaspekte: ["Programmieren", "Problemlösen"],
          },
          {
            code: "MI.2.C",
            name: "Informatiksysteme",
            handlungsaspekte: ["Computer verstehen", "Netzwerke"],
          },
        ],
      },
    ],
  },

  // ============ ZYKLUS 3 SPEZIFISCHE FÄCHER ============
  {
    code: "NT",
    name: "Natur und Technik",
    shortName: "NT",
    color: "#179299", // Teal - Catppuccin Teal
    colorClass: "subject-nt",
    icon: "flask",
    cycles: [3],
    kompetenzbereiche: [
      {
        code: "NT.1",
        name: "Wesen der Naturwissenschaften",
        handlungsaspekte: ["Arbeitsweisen, Modelle, Geschichte der Naturwissenschaften"],
        kompetenzen: [
          {
            code: "NT.1.A",
            name: "Naturwissenschaftliche Arbeitsweisen",
            handlungsaspekte: ["Beobachten", "Experimentieren", "Hypothesen bilden"],
          },
          {
            code: "NT.1.B",
            name: "Modelle & Theorien",
            handlungsaspekte: ["Modelle verstehen", "Theorien anwenden"],
          },
          {
            code: "NT.1.C",
            name: "Geschichte der Naturwissenschaften",
            handlungsaspekte: ["Entwicklung der Wissenschaft", "Entdeckungen"],
          },
        ],
      },
      {
        code: "NT.2",
        name: "Stoffe (Chemie)",
        handlungsaspekte: ["Eigenschaften, Trennverfahren, Teilchenmodell, Reaktionen"],
        kompetenzen: [
          {
            code: "NT.2.A",
            name: "Stoffeigenschaften",
            handlungsaspekte: ["Eigenschaften untersuchen", "Stoffklassen"],
          },
          {
            code: "NT.2.B",
            name: "Trennverfahren",
            handlungsaspekte: ["Gemische trennen", "Verfahren anwenden"],
          },
          {
            code: "NT.2.C",
            name: "Teilchenmodell",
            handlungsaspekte: ["Aufbau der Materie", "Atome und Moleküle"],
          },
          {
            code: "NT.2.D",
            name: "Chemische Reaktionen",
            handlungsaspekte: ["Reaktionsgleichungen", "Reaktionstypen"],
          },
        ],
      },
      {
        code: "NT.3",
        name: "Energie (Physik)",
        handlungsaspekte: ["Energieformen, Umwandlung, Kraft, Elektrizität, Optik, Schall"],
        kompetenzen: [
          {
            code: "NT.3.A",
            name: "Energieformen & Umwandlung",
            handlungsaspekte: ["Energieformen", "Energieerhaltung"],
          },
          {
            code: "NT.3.B",
            name: "Kraft & Bewegung",
            handlungsaspekte: ["Newtonsche Gesetze", "Mechanik"],
          },
          {
            code: "NT.3.C",
            name: "Elektrizität",
            handlungsaspekte: ["Stromkreise", "Elektromagnetismus"],
          },
          { code: "NT.3.D", name: "Optik & Schall", handlungsaspekte: ["Licht", "Schallwellen"] },
        ],
      },
      {
        code: "NT.4",
        name: "Organismen (Biologie)",
        handlungsaspekte: ["Bau & Funktion (Mensch/Tier/Pflanze), Genetik, Evolution"],
        kompetenzen: [
          {
            code: "NT.4.A",
            name: "Bau & Funktion",
            handlungsaspekte: ["Körpersysteme", "Organe", "Zellen"],
          },
          { code: "NT.4.B", name: "Genetik", handlungsaspekte: ["Vererbung", "DNA", "Gene"] },
          {
            code: "NT.4.C",
            name: "Evolution",
            handlungsaspekte: ["Evolutionstheorie", "Anpassung", "Selektion"],
          },
        ],
      },
      {
        code: "NT.5",
        name: "Lebensräume",
        handlungsaspekte: ["Ökosysteme, Biodiversität, Nachhaltigkeit"],
        kompetenzen: [
          {
            code: "NT.5.A",
            name: "Ökosysteme",
            handlungsaspekte: ["Ökosysteme verstehen", "Stoffkreisläufe"],
          },
          {
            code: "NT.5.B",
            name: "Biodiversität",
            handlungsaspekte: ["Artenvielfalt", "Artenschutz"],
          },
          {
            code: "NT.5.C",
            name: "Nachhaltigkeit",
            handlungsaspekte: ["Nachhaltige Entwicklung", "Umweltschutz"],
          },
        ],
      },
      {
        code: "NT.6",
        name: "Sinne & Signale",
        handlungsaspekte: ["Reizaufnahme, Nervensystem, Kommunikation (biologisch)"],
        kompetenzen: [
          { code: "NT.6.A", name: "Reizaufnahme", handlungsaspekte: ["Sinnesorgane", "Reize"] },
          {
            code: "NT.6.B",
            name: "Nervensystem",
            handlungsaspekte: ["Nerven", "Gehirn", "Reflexe"],
          },
          {
            code: "NT.6.C",
            name: "Biologische Kommunikation",
            handlungsaspekte: ["Hormonsystem", "Signalübertragung"],
          },
        ],
      },
      {
        code: "NT.7",
        name: "Technische Entwicklungen",
        handlungsaspekte: ["Mechanik, Antriebe, Steuerung, Automatisierung"],
        kompetenzen: [
          {
            code: "NT.7.A",
            name: "Mechanik & Antriebe",
            handlungsaspekte: ["Maschinen", "Motoren"],
          },
          {
            code: "NT.7.B",
            name: "Steuerung & Regelung",
            handlungsaspekte: ["Steuerungstechnik", "Feedback-Systeme"],
          },
          {
            code: "NT.7.C",
            name: "Automatisierung",
            handlungsaspekte: ["Robotik", "Automatische Systeme"],
          },
        ],
      },
      {
        code: "NT.8",
        name: "Stoffe im Alltag",
        handlungsaspekte: ["Werkstoffe, Abfall, Recycling"],
        kompetenzen: [
          {
            code: "NT.8.A",
            name: "Werkstoffe",
            handlungsaspekte: ["Materialien im Alltag", "Eigenschaften"],
          },
          {
            code: "NT.8.B",
            name: "Abfall & Recycling",
            handlungsaspekte: ["Entsorgung", "Wiederverwertung", "Kreislaufwirtschaft"],
          },
        ],
      },
      {
        code: "NT.9",
        name: "Energie im Alltag",
        handlungsaspekte: ["Energieversorgung, Mobilität, Energieeffizienz"],
        kompetenzen: [
          {
            code: "NT.9.A",
            name: "Energieversorgung",
            handlungsaspekte: ["Energiequellen", "Energienetze"],
          },
          { code: "NT.9.B", name: "Mobilität", handlungsaspekte: ["Verkehr", "Antriebsarten"] },
          {
            code: "NT.9.C",
            name: "Energieeffizienz",
            handlungsaspekte: ["Energie sparen", "Nachhaltiger Umgang"],
          },
        ],
      },
    ],
  },
  {
    code: "WAH",
    name: "Wirtschaft, Arbeit, Haushalt",
    shortName: "WAH",
    color: "#dd7878", // Flamingo - Catppuccin Flamingo
    colorClass: "subject-wah",
    icon: "briefcase",
    cycles: [3],
    kompetenzbereiche: [
      {
        code: "WAH.1",
        name: "Produktions- & Arbeitswelten",
        handlungsaspekte: ["Wertschöpfung, Betriebswirtschaft, Berufsfelder"],
        kompetenzen: [
          {
            code: "WAH.1.A",
            name: "Wertschöpfung",
            handlungsaspekte: ["Produktion verstehen", "Wertschöpfungsketten"],
          },
          {
            code: "WAH.1.B",
            name: "Betriebswirtschaft",
            handlungsaspekte: ["Unternehmen", "Wirtschaftskreisläufe"],
          },
          {
            code: "WAH.1.C",
            name: "Berufsfelder",
            handlungsaspekte: ["Berufe erkunden", "Arbeitswelt"],
          },
        ],
      },
      {
        code: "WAH.2",
        name: "Märkte & Handel",
        handlungsaspekte: ["Preisbildung, Marktmechanismen, Globalisierung"],
        kompetenzen: [
          {
            code: "WAH.2.A",
            name: "Preisbildung",
            handlungsaspekte: ["Angebot und Nachfrage", "Preismechanismen"],
          },
          {
            code: "WAH.2.B",
            name: "Marktmechanismen",
            handlungsaspekte: ["Marktwirtschaft", "Wettbewerb"],
          },
          {
            code: "WAH.2.C",
            name: "Globalisierung",
            handlungsaspekte: ["Welthandel", "Internationale Verflechtung"],
          },
        ],
      },
      {
        code: "WAH.3",
        name: "Umgang mit Geld",
        handlungsaspekte: ["Einnahmen/Ausgaben, Budget, Schulden, Versicherungen"],
        kompetenzen: [
          {
            code: "WAH.3.A",
            name: "Einnahmen & Ausgaben",
            handlungsaspekte: ["Geld verwalten", "Finanzen überblicken"],
          },
          {
            code: "WAH.3.B",
            name: "Budget",
            handlungsaspekte: ["Budgetplanung", "Haushaltsführung"],
          },
          {
            code: "WAH.3.C",
            name: "Schulden & Versicherungen",
            handlungsaspekte: ["Schuldenprävention", "Absicherung"],
          },
        ],
      },
      {
        code: "WAH.4",
        name: "Ernährung & Gesundheit",
        handlungsaspekte: ["Nahrungsmittelzubereitung, Physiologie, Esskultur"],
        kompetenzen: [
          {
            code: "WAH.4.A",
            name: "Nahrungsmittelzubereitung",
            handlungsaspekte: ["Kochen", "Lebensmittelverarbeitung"],
          },
          {
            code: "WAH.4.B",
            name: "Physiologie",
            handlungsaspekte: ["Ernährungsphysiologie", "Nährstoffe"],
          },
          {
            code: "WAH.4.C",
            name: "Esskultur",
            handlungsaspekte: ["Essgewohnheiten", "Traditionen"],
          },
        ],
      },
      {
        code: "WAH.5",
        name: "Konsum & Lebensstil",
        handlungsaspekte: ["Konsumentscheidungen, Ökologie, Rechte als Konsument"],
        kompetenzen: [
          {
            code: "WAH.5.A",
            name: "Konsumentscheidungen",
            handlungsaspekte: ["Bewusst konsumieren", "Kaufentscheidungen"],
          },
          {
            code: "WAH.5.B",
            name: "Ökologie",
            handlungsaspekte: ["Nachhaltiger Konsum", "Umweltauswirkungen"],
          },
          {
            code: "WAH.5.C",
            name: "Konsumentenrechte",
            handlungsaspekte: ["Rechte kennen", "Verbraucherschutz"],
          },
        ],
      },
    ],
  },
  {
    code: "RZG",
    name: "Räume, Zeiten, Gesellschaften",
    shortName: "RZG",
    color: "#e64553", // Maroon - Catppuccin Maroon
    colorClass: "subject-rzg",
    icon: "map",
    cycles: [3],
    kompetenzbereiche: [
      {
        code: "RZG.1",
        name: "Erde als Lebensraum",
        handlungsaspekte: ["Klima, Wetter, Endogene/Exogene Kräfte (Geologie)"],
        kompetenzen: [
          {
            code: "RZG.1.A",
            name: "Klima & Wetter",
            handlungsaspekte: ["Klimazonen", "Wetterphänomene"],
          },
          {
            code: "RZG.1.B",
            name: "Endogene Kräfte",
            handlungsaspekte: ["Vulkanismus", "Erdbeben", "Plattentektonik"],
          },
          {
            code: "RZG.1.C",
            name: "Exogene Kräfte",
            handlungsaspekte: ["Erosion", "Verwitterung", "Sedimentation"],
          },
        ],
      },
      {
        code: "RZG.2",
        name: "Lebensräume nutzen",
        handlungsaspekte: ["Bevölkerung, Stadtentwicklung, Ressourcen"],
        kompetenzen: [
          {
            code: "RZG.2.A",
            name: "Bevölkerung",
            handlungsaspekte: ["Bevölkerungsentwicklung", "Migration"],
          },
          {
            code: "RZG.2.B",
            name: "Stadtentwicklung",
            handlungsaspekte: ["Urbanisierung", "Siedlungsformen"],
          },
          {
            code: "RZG.2.C",
            name: "Ressourcen",
            handlungsaspekte: ["Ressourcennutzung", "Rohstoffe"],
          },
        ],
      },
      {
        code: "RZG.3",
        name: "Mensch-Umwelt",
        handlungsaspekte: ["Naturgefahren, Nachhaltigkeit, Tourismus"],
        kompetenzen: [
          {
            code: "RZG.3.A",
            name: "Naturgefahren",
            handlungsaspekte: ["Naturkatastrophen", "Risikomanagement"],
          },
          {
            code: "RZG.3.B",
            name: "Nachhaltigkeit",
            handlungsaspekte: ["Nachhaltige Entwicklung", "Umweltschutz"],
          },
          {
            code: "RZG.3.C",
            name: "Tourismus",
            handlungsaspekte: ["Tourismusentwicklung", "Auswirkungen"],
          },
        ],
      },
      {
        code: "RZG.4",
        name: "Orientierung",
        handlungsaspekte: ["Kartenarbeit, Topografie, Globales Verständnis"],
        kompetenzen: [
          { code: "RZG.4.A", name: "Kartenarbeit", handlungsaspekte: ["Karten lesen", "GIS"] },
          {
            code: "RZG.4.B",
            name: "Topografie",
            handlungsaspekte: ["Landschaftsformen", "Topografisches Wissen"],
          },
          {
            code: "RZG.4.C",
            name: "Globales Verständnis",
            handlungsaspekte: ["Weltbild", "Globale Zusammenhänge"],
          },
        ],
      },
      {
        code: "RZG.5",
        name: "Zeit & Wandel",
        handlungsaspekte: ["Epochen (Antike bis Neuzeit), Modernisierung"],
        kompetenzen: [
          {
            code: "RZG.5.A",
            name: "Antike & Mittelalter",
            handlungsaspekte: ["Frühe Hochkulturen", "Mittelalter"],
          },
          {
            code: "RZG.5.B",
            name: "Neuzeit",
            handlungsaspekte: ["Renaissance", "Aufklärung", "Industrialisierung"],
          },
          {
            code: "RZG.5.C",
            name: "Modernisierung",
            handlungsaspekte: ["Gesellschaftlicher Wandel", "Moderne"],
          },
        ],
      },
      {
        code: "RZG.6",
        name: "Kontinuitäten & Umbrüche",
        handlungsaspekte: ["Weltkriege, Kalter Krieg, Imperialismus, Revolutionen"],
        kompetenzen: [
          {
            code: "RZG.6.A",
            name: "Weltkriege",
            handlungsaspekte: ["Erster Weltkrieg", "Zweiter Weltkrieg"],
          },
          {
            code: "RZG.6.B",
            name: "Kalter Krieg",
            handlungsaspekte: ["Ost-West-Konflikt", "Nachkriegsordnung"],
          },
          {
            code: "RZG.6.C",
            name: "Imperialismus & Revolutionen",
            handlungsaspekte: ["Kolonialismus", "Revolutionen"],
          },
        ],
      },
      {
        code: "RZG.7",
        name: "Politik & Demokratie",
        handlungsaspekte: ["Politisches System Schweiz, Menschenrechte, Partizipation"],
        kompetenzen: [
          {
            code: "RZG.7.A",
            name: "Politisches System Schweiz",
            handlungsaspekte: ["Föderalismus", "Direkte Demokratie"],
          },
          {
            code: "RZG.7.B",
            name: "Menschenrechte",
            handlungsaspekte: ["Grundrechte", "Internationale Abkommen"],
          },
          {
            code: "RZG.7.C",
            name: "Partizipation",
            handlungsaspekte: ["Politische Teilhabe", "Bürgerengagement"],
          },
        ],
      },
    ],
  },
  {
    code: "ERG",
    name: "Ethik, Religionen, Gemeinschaft",
    shortName: "ERG",
    color: "#8839ef", // Mauve - Catppuccin Mauve
    colorClass: "subject-erg",
    icon: "users",
    cycles: [3],
    kompetenzbereiche: [
      {
        code: "ERG.1",
        name: "Existenzielle Erfahrungen",
        handlungsaspekte: ["Leben/Tod, Glück, Freiheit, Verantwortung"],
        kompetenzen: [
          {
            code: "ERG.1.A",
            name: "Leben & Tod",
            handlungsaspekte: ["Lebensfragen", "Umgang mit Vergänglichkeit"],
          },
          {
            code: "ERG.1.B",
            name: "Glück & Sinn",
            handlungsaspekte: ["Glücksvorstellungen", "Lebenssinn"],
          },
          {
            code: "ERG.1.C",
            name: "Freiheit & Verantwortung",
            handlungsaspekte: ["Freiheitsbegriff", "Verantwortung übernehmen"],
          },
        ],
      },
      {
        code: "ERG.2",
        name: "Werte & Normen",
        handlungsaspekte: ["Ethische Dilemmata, Gerechtigkeit, Toleranz"],
        kompetenzen: [
          {
            code: "ERG.2.A",
            name: "Ethische Dilemmata",
            handlungsaspekte: ["Entscheidungssituationen", "Ethisch urteilen"],
          },
          {
            code: "ERG.2.B",
            name: "Gerechtigkeit",
            handlungsaspekte: ["Gerechtigkeitsvorstellungen", "Fairness"],
          },
          { code: "ERG.2.C", name: "Toleranz", handlungsaspekte: ["Akzeptanz", "Respekt"] },
        ],
      },
      {
        code: "ERG.3",
        name: "Spuren von Religionen",
        handlungsaspekte: ["Architektur, Kunst, Musik, Sprache religiös gedeutet"],
        kompetenzen: [
          {
            code: "ERG.3.A",
            name: "Religiöse Architektur",
            handlungsaspekte: ["Sakralbauten", "Symbole"],
          },
          {
            code: "ERG.3.B",
            name: "Religiöse Kunst & Musik",
            handlungsaspekte: ["Religiöse Kunstwerke", "Sakrale Musik"],
          },
          {
            code: "ERG.3.C",
            name: "Religiöse Sprache",
            handlungsaspekte: ["Religiöse Begriffe", "Texte"],
          },
        ],
      },
      {
        code: "ERG.4",
        name: "Religionen verstehen",
        handlungsaspekte: ["Die 5 Weltreligionen, Säkularisierung, religiöse Praxis"],
        kompetenzen: [
          {
            code: "ERG.4.A",
            name: "Weltreligionen",
            handlungsaspekte: ["Christentum", "Islam", "Judentum", "Buddhismus", "Hinduismus"],
          },
          {
            code: "ERG.4.B",
            name: "Säkularisierung",
            handlungsaspekte: ["Religiöser Wandel", "Säkulare Gesellschaft"],
          },
          {
            code: "ERG.4.C",
            name: "Religiöse Praxis",
            handlungsaspekte: ["Rituale", "Feste", "Traditionen"],
          },
        ],
      },
      {
        code: "ERG.5",
        name: "Ich & Gemeinschaft",
        handlungsaspekte: ["Identität, Rollenbilder, Konfliktmanagement"],
        kompetenzen: [
          {
            code: "ERG.5.A",
            name: "Identität",
            handlungsaspekte: ["Selbstwahrnehmung", "Identitätsentwicklung"],
          },
          {
            code: "ERG.5.B",
            name: "Rollenbilder",
            handlungsaspekte: ["Geschlechterrollen", "Soziale Rollen"],
          },
          {
            code: "ERG.5.C",
            name: "Konfliktmanagement",
            handlungsaspekte: ["Konflikte lösen", "Mediation"],
          },
        ],
      },
    ],
  },

  // ============ BERUFLICHE ORIENTIERUNG ============
  {
    code: "BO",
    name: "Berufliche Orientierung",
    shortName: "BO",
    color: "#209fb5", // Sapphire - Catppuccin Sapphire
    colorClass: "subject-bo",
    icon: "compass",
    cycles: [3],
    kompetenzbereiche: [
      {
        code: "BO.1",
        name: "Persönlichkeitsprofil",
        handlungsaspekte: ["Interessen, Stärken, Fähigkeiten analysieren"],
        kompetenzen: [
          {
            code: "BO.1.A",
            name: "Interessen erkunden",
            handlungsaspekte: ["Eigene Interessen erkennen"],
          },
          {
            code: "BO.1.B",
            name: "Stärken & Fähigkeiten",
            handlungsaspekte: ["Kompetenzen analysieren", "Potenziale erkennen"],
          },
        ],
      },
      {
        code: "BO.2",
        name: "Bildungswege",
        handlungsaspekte: ["Lehre, Mittelschule, Brückenangebote kennenlernen"],
        kompetenzen: [
          {
            code: "BO.2.A",
            name: "Berufliche Grundbildung",
            handlungsaspekte: ["Lehre", "Berufsausbildung"],
          },
          {
            code: "BO.2.B",
            name: "Weiterführende Schulen",
            handlungsaspekte: ["Mittelschule", "Gymnasium"],
          },
          {
            code: "BO.2.C",
            name: "Brückenangebote",
            handlungsaspekte: ["Zwischenlösungen", "Vorbereitung"],
          },
        ],
      },
      {
        code: "BO.3",
        name: "Entscheidung",
        handlungsaspekte: ["Schnupperlehren, Auswahlprozess, Umgang mit Absagen"],
        kompetenzen: [
          {
            code: "BO.3.A",
            name: "Schnupperlehren",
            handlungsaspekte: ["Berufe ausprobieren", "Einblicke gewinnen"],
          },
          {
            code: "BO.3.B",
            name: "Auswahlprozess",
            handlungsaspekte: ["Entscheidungen treffen", "Alternativen prüfen"],
          },
          {
            code: "BO.3.C",
            name: "Umgang mit Absagen",
            handlungsaspekte: ["Resilienz", "Neue Wege finden"],
          },
        ],
      },
      {
        code: "BO.4",
        name: "Planung & Umsetzung",
        handlungsaspekte: ["Bewerbungsdossier, Vorstellungsgespräch"],
        kompetenzen: [
          {
            code: "BO.4.A",
            name: "Bewerbungsdossier",
            handlungsaspekte: ["Lebenslauf", "Bewerbungsschreiben"],
          },
          {
            code: "BO.4.B",
            name: "Vorstellungsgespräch",
            handlungsaspekte: ["Vorbereitung", "Auftreten"],
          },
        ],
      },
    ],
  },

  // ============ PROJEKTUNTERRICHT (NEU) ============
  {
    code: "PU",
    name: "Projektunterricht",
    shortName: "PU",
    color: "#6c6f85", // Overlay - Catppuccin Overlay
    colorClass: "subject-pu",
    icon: "clipboard-list",
    cycles: [3],
    kompetenzbereiche: [
      {
        code: "PU.1",
        name: "Initiierung",
        handlungsaspekte: ["Ideenfindung, Zielsetzung"],
        kompetenzen: [
          {
            code: "PU.1.A",
            name: "Ideenfindung",
            handlungsaspekte: ["Kreativtechniken", "Brainstorming"],
          },
          {
            code: "PU.1.B",
            name: "Zielsetzung",
            handlungsaspekte: ["Ziele definieren", "Fragestellungen formulieren"],
          },
        ],
      },
      {
        code: "PU.2",
        name: "Planung",
        handlungsaspekte: ["Ressourcen, Zeitplan, Meilensteine"],
        kompetenzen: [
          {
            code: "PU.2.A",
            name: "Ressourcen",
            handlungsaspekte: ["Material", "Hilfsmittel", "Unterstützung"],
          },
          {
            code: "PU.2.B",
            name: "Zeitplan",
            handlungsaspekte: ["Zeitmanagement", "Termine setzen"],
          },
          {
            code: "PU.2.C",
            name: "Meilensteine",
            handlungsaspekte: ["Etappenziele", "Fortschrittskontrolle"],
          },
        ],
      },
      {
        code: "PU.3",
        name: "Durchführung",
        handlungsaspekte: ["Umsetzung, Problemlösung, Begleitung"],
        kompetenzen: [
          {
            code: "PU.3.A",
            name: "Umsetzung",
            handlungsaspekte: ["Arbeitsprozess", "Dokumentation"],
          },
          {
            code: "PU.3.B",
            name: "Problemlösung",
            handlungsaspekte: ["Herausforderungen bewältigen", "Anpassungen vornehmen"],
          },
          {
            code: "PU.3.C",
            name: "Begleitung",
            handlungsaspekte: ["Zusammenarbeit", "Feedback einholen"],
          },
        ],
      },
      {
        code: "PU.4",
        name: "Abschluss",
        handlungsaspekte: ["Präsentation, Reflexion, Auswertung"],
        kompetenzen: [
          {
            code: "PU.4.A",
            name: "Präsentation",
            handlungsaspekte: ["Ergebnisse vorstellen", "Visualisierung"],
          },
          {
            code: "PU.4.B",
            name: "Reflexion",
            handlungsaspekte: ["Prozess reflektieren", "Learnings formulieren"],
          },
          { code: "PU.4.C", name: "Auswertung", handlungsaspekte: ["Evaluation", "Bewertung"] },
        ],
      },
    ],
  },
];

// Helper functions
export function getFachbereicheByZyklus(zyklusId: number): Fachbereich[] {
  return FACHBEREICHE.filter((f) => f.cycles.includes(zyklusId));
}

export function getFachbereichByCode(code: string): Fachbereich | undefined {
  return FACHBEREICHE.find((f) => f.code === code);
}

export function getKompetenzbereichByCode(code: string):
  | {
      fachbereich: Fachbereich;
      kompetenzbereich: Kompetenzbereich;
    }
  | undefined {
  for (const fachbereich of FACHBEREICHE) {
    const kompetenzbereich = fachbereich.kompetenzbereiche.find((kb) => kb.code === code);
    if (kompetenzbereich) {
      return { fachbereich, kompetenzbereich };
    }
  }
  return undefined;
}

export function getKompetenzByCode(code: string):
  | {
      fachbereich: Fachbereich;
      kompetenzbereich: Kompetenzbereich;
      kompetenz: Kompetenz;
    }
  | undefined {
  for (const fachbereich of FACHBEREICHE) {
    for (const kompetenzbereich of fachbereich.kompetenzbereiche) {
      const kompetenz = kompetenzbereich.kompetenzen.find((k) => k.code === code);
      if (kompetenz) {
        return { fachbereich, kompetenzbereich, kompetenz };
      }
    }
  }
  return undefined;
}

export function searchByCode(query: string): {
  type: "fachbereich" | "kompetenzbereich" | "kompetenz";
  code: string;
  name: string;
  fachbereich: Fachbereich;
  kompetenzbereich?: Kompetenzbereich;
  kompetenz?: Kompetenz;
}[] {
  const results: ReturnType<typeof searchByCode> = [];
  const normalizedQuery = query.toUpperCase().trim();

  for (const fachbereich of FACHBEREICHE) {
    // Check Fachbereich
    if (fachbereich.code.toUpperCase().includes(normalizedQuery)) {
      results.push({
        type: "fachbereich",
        code: fachbereich.code,
        name: fachbereich.name,
        fachbereich,
      });
    }

    for (const kompetenzbereich of fachbereich.kompetenzbereiche) {
      // Check Kompetenzbereich
      if (kompetenzbereich.code.toUpperCase().includes(normalizedQuery)) {
        results.push({
          type: "kompetenzbereich",
          code: kompetenzbereich.code,
          name: kompetenzbereich.name,
          fachbereich,
          kompetenzbereich,
        });
      }

      for (const kompetenz of kompetenzbereich.kompetenzen) {
        // Check Kompetenz
        if (kompetenz.code.toUpperCase().includes(normalizedQuery)) {
          results.push({
            type: "kompetenz",
            code: kompetenz.code,
            name: kompetenz.name,
            fachbereich,
            kompetenzbereich,
            kompetenz,
          });
        }
      }
    }
  }

  return results;
}

// Subject color map for quick lookups
export const SUBJECT_COLORS: Record<string, { color: string; colorClass: string }> =
  FACHBEREICHE.reduce(
    (acc, fb) => {
      acc[fb.code] = { color: fb.color, colorClass: fb.colorClass };
      return acc;
    },
    {} as Record<string, { color: string; colorClass: string }>
  );
