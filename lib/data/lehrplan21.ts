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
 * - Level 3: Kompetenz (Competence)
 *
 * Each Fachbereich is available in specific Zyklen (Cycles 1-3)
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
export const FACHBEREICHE: Fachbereich[] = [
  // ============ SPRACHEN ============
  {
    code: "D",
    name: "Deutsch",
    shortName: "DE",
    color: "#d20f39", // Red
    colorClass: "subject-deutsch",
    icon: "book-open",
    cycles: [1, 2, 3],
    kompetenzbereiche: [
      {
        code: "D.1",
        name: "Hören",
        kompetenzen: [
          { code: "D.1.A", name: "Grundfertigkeiten" },
          { code: "D.1.B", name: "Verstehen in dialogischen Hörsituationen" },
          { code: "D.1.C", name: "Verstehen in monologischen Hörsituationen" },
        ],
      },
      {
        code: "D.2",
        name: "Lesen",
        kompetenzen: [
          { code: "D.2.A", name: "Grundfertigkeiten" },
          { code: "D.2.B", name: "Verstehen von Sachtexten" },
          { code: "D.2.C", name: "Verstehen literarischer Texte" },
          { code: "D.2.D", name: "Reflexion über das Leseverhalten" },
        ],
      },
      {
        code: "D.3",
        name: "Sprechen",
        kompetenzen: [
          { code: "D.3.A", name: "Grundfertigkeiten" },
          { code: "D.3.B", name: "Monologisches Sprechen" },
          { code: "D.3.C", name: "Dialogisches Sprechen" },
        ],
      },
      {
        code: "D.4",
        name: "Schreiben",
        kompetenzen: [
          { code: "D.4.A", name: "Grundfertigkeiten" },
          { code: "D.4.B", name: "Schreibprodukte" },
          { code: "D.4.C", name: "Schreibprozess: Ideen finden und planen" },
          { code: "D.4.D", name: "Schreibprozess: formulieren" },
          { code: "D.4.E", name: "Schreibprozess: inhaltlich überarbeiten" },
          { code: "D.4.F", name: "Schreibprozess: sprachformal überarbeiten" },
          { code: "D.4.G", name: "Reflexion über Schreibprozess und Schreibprodukte" },
        ],
      },
      {
        code: "D.5",
        name: "Sprache(n) im Fokus",
        kompetenzen: [
          { code: "D.5.A", name: "Verfahren und Proben" },
          { code: "D.5.B", name: "Sprachgebrauch untersuchen" },
          { code: "D.5.C", name: "Sprachformales untersuchen" },
          { code: "D.5.D", name: "Grammatikbegriffe" },
          { code: "D.5.E", name: "Rechtschreibregeln" },
        ],
      },
      {
        code: "D.6",
        name: "Literatur im Fokus",
        kompetenzen: [
          { code: "D.6.A", name: "Auseinandersetzung mit literarischen Texten" },
          { code: "D.6.B", name: "Auseinandersetzung mit verschiedenen Autor/innen und Kulturen" },
          { code: "D.6.C", name: "Literarische Texte: Beschaffenheit und Wirkung" },
        ],
      },
    ],
  },
  {
    code: "FS1E",
    name: "English",
    shortName: "English",
    color: "#209fb5", // Sapphire
    colorClass: "subject-fremdsprachen",
    icon: "globe",
    cycles: [2, 3],
    kompetenzbereiche: [
      {
        code: "FS1E.1",
        name: "Hören",
        kompetenzen: [
          { code: "FS1E.1.A", name: "Monologische und dialogische Texte hören und verstehen" },
          { code: "FS1E.1.B", name: "Strategien" },
          { code: "FS1E.1.C", name: "Sprachmittlung" },
        ],
      },
      {
        code: "FS1E.2",
        name: "Lesen",
        kompetenzen: [
          { code: "FS1E.2.A", name: "Texte lesen und verstehen" },
          { code: "FS1E.2.B", name: "Strategien" },
          { code: "FS1E.2.C", name: "Sprachmittlung" },
        ],
      },
      {
        code: "FS1E.3",
        name: "Sprechen",
        kompetenzen: [
          { code: "FS1E.3.A", name: "Dialogisches Sprechen" },
          { code: "FS1E.3.B", name: "Monologisches Sprechen" },
          { code: "FS1E.3.C", name: "Strategien" },
          { code: "FS1E.3.D", name: "Sprachmittlung" },
        ],
      },
      {
        code: "FS1E.4",
        name: "Schreiben",
        kompetenzen: [
          { code: "FS1E.4.A", name: "Schriftliche Texte verfassen" },
          { code: "FS1E.4.B", name: "Strategien" },
          { code: "FS1E.4.C", name: "Sprachmittlung" },
        ],
      },
      {
        code: "FS1E.5",
        name: "Sprache(n) im Fokus",
        kompetenzen: [
          { code: "FS1E.5.A", name: "Bewusstheit für Sprache" },
          { code: "FS1E.5.B", name: "Wortschatz" },
          { code: "FS1E.5.C", name: "Aussprache" },
          { code: "FS1E.5.D", name: "Grammatik" },
          { code: "FS1E.5.E", name: "Rechtschreibung" },
          { code: "FS1E.5.F", name: "Sprachlernreflexion und -planung" },
        ],
      },
      {
        code: "FS1E.6",
        name: "Kulturen im Fokus",
        kompetenzen: [
          { code: "FS1E.6.A", name: "Kenntnisse" },
          { code: "FS1E.6.B", name: "Haltungen" },
          { code: "FS1E.6.C", name: "Handlungen" },
        ],
      },
    ],
  },
  {
    code: "FS2F",
    name: "Französisch",
    shortName: "Französisch",
    color: "#209fb5", // Sapphire
    colorClass: "subject-fremdsprachen",
    icon: "globe",
    cycles: [2, 3],
    kompetenzbereiche: [
      {
        code: "FS2F.1",
        name: "Hören",
        kompetenzen: [
          { code: "FS2F.1.A", name: "Monologische und dialogische Texte hören und verstehen" },
          { code: "FS2F.1.B", name: "Strategien" },
          { code: "FS2F.1.C", name: "Sprachmittlung" },
        ],
      },
      {
        code: "FS2F.2",
        name: "Lesen",
        kompetenzen: [
          { code: "FS2F.2.A", name: "Texte lesen und verstehen" },
          { code: "FS2F.2.B", name: "Strategien" },
          { code: "FS2F.2.C", name: "Sprachmittlung" },
        ],
      },
      {
        code: "FS2F.3",
        name: "Sprechen",
        kompetenzen: [
          { code: "FS2F.3.A", name: "Dialogisches Sprechen" },
          { code: "FS2F.3.B", name: "Monologisches Sprechen" },
          { code: "FS2F.3.C", name: "Strategien" },
          { code: "FS2F.3.D", name: "Sprachmittlung" },
        ],
      },
      {
        code: "FS2F.4",
        name: "Schreiben",
        kompetenzen: [
          { code: "FS2F.4.A", name: "Schriftliche Texte verfassen" },
          { code: "FS2F.4.B", name: "Strategien" },
          { code: "FS2F.4.C", name: "Sprachmittlung" },
        ],
      },
      {
        code: "FS2F.5",
        name: "Sprache(n) im Fokus",
        kompetenzen: [
          { code: "FS2F.5.A", name: "Bewusstheit für Sprache" },
          { code: "FS2F.5.B", name: "Wortschatz" },
          { code: "FS2F.5.C", name: "Aussprache" },
          { code: "FS2F.5.D", name: "Grammatik" },
          { code: "FS2F.5.E", name: "Rechtschreibung" },
          { code: "FS2F.5.F", name: "Sprachlernreflexion und -planung" },
        ],
      },
      {
        code: "FS2F.6",
        name: "Kulturen im Fokus",
        kompetenzen: [
          { code: "FS2F.6.A", name: "Kenntnisse" },
          { code: "FS2F.6.B", name: "Haltungen" },
          { code: "FS2F.6.C", name: "Handlungen" },
        ],
      },
    ],
  },

  // ============ MATHEMATIK ============
  {
    code: "MA",
    name: "Mathematik",
    shortName: "MA",
    color: "#1e66f5", // Blue
    colorClass: "subject-mathe",
    icon: "calculator",
    cycles: [1, 2, 3],
    kompetenzbereiche: [
      {
        code: "MA.1",
        name: "Zahl und Variable",
        kompetenzen: [
          { code: "MA.1.A", name: "Verstehen und Darstellen von Zahlen" },
          { code: "MA.1.B", name: "Zahlen schätzen und runden" },
          { code: "MA.1.C", name: "Addieren, Subtrahieren, Multiplizieren, Dividieren" },
        ],
      },
      {
        code: "MA.2",
        name: "Form und Raum",
        kompetenzen: [
          { code: "MA.2.A", name: "Geometrische Figuren erforschen und beschreiben" },
          { code: "MA.2.B", name: "Geometrische Beziehungen nutzen" },
          { code: "MA.2.C", name: "Geometrische Konstruktionen" },
        ],
      },
      {
        code: "MA.3",
        name: "Grössen, Funktionen, Daten und Zufall",
        kompetenzen: [
          { code: "MA.3.A", name: "Grössen operieren und benennen" },
          { code: "MA.3.B", name: "Beziehungen und Veränderungen beschreiben" },
          { code: "MA.3.C", name: "Daten erheben, ordnen, darstellen und interpretieren" },
        ],
      },
    ],
  },

  // ============ NATUR, MENSCH, GESELLSCHAFT ============
  {
    code: "NMG",
    name: "NMG",
    shortName: "NMG",
    color: "#40a02b", // Green
    colorClass: "subject-nmg",
    icon: "leaf",
    cycles: [1, 2],
    kompetenzbereiche: [
      {
        code: "NMG.1",
        name: "Identität, Körper, Gesundheit",
        kompetenzen: [
          { code: "NMG.1.1", name: "Sich und den eigenen Körper wahrnehmen" },
          { code: "NMG.1.2", name: "Gefühle und Bedürfnisse wahrnehmen und ausdrücken" },
          { code: "NMG.1.3", name: "Zusammenhänge von Ernährung und Wohlbefinden erkennen" },
          { code: "NMG.1.4", name: "Gefahren und Risiken einschätzen" },
          { code: "NMG.1.5", name: "Sexuelle Entwicklung" },
          { code: "NMG.1.6", name: "Geschlechterrollen und Gleichstellung" },
        ],
      },
      {
        code: "NMG.2",
        name: "Tiere, Pflanzen, Lebensräume",
        kompetenzen: [
          { code: "NMG.2.1", name: "Tiere und Pflanzen in ihren Lebensräumen erkunden" },
          { code: "NMG.2.2", name: "Wachstum und Entwicklung von Tieren und Pflanzen" },
          { code: "NMG.2.3", name: "Beziehungen von Pflanzen und Tieren" },
          { code: "NMG.2.4", name: "Artenvielfalt und ökologische Kreisläufe" },
          { code: "NMG.2.5", name: "Verantwortung im Umgang mit Tieren und Pflanzen" },
          { code: "NMG.2.6", name: "Nutzung von Tieren und Pflanzen" },
        ],
      },
      {
        code: "NMG.3",
        name: "Stoffe, Energie, Bewegungen",
        kompetenzen: [
          { code: "NMG.3.1", name: "Stoffeigenschaften erkunden und beschreiben" },
          { code: "NMG.3.2", name: "Stoffumwandlungen untersuchen" },
          { code: "NMG.3.3", name: "Bewegungen und Kräfte erforschen" },
          { code: "NMG.3.4", name: "Energie wahrnehmen und nutzen" },
        ],
      },
      {
        code: "NMG.4",
        name: "Phänomene der belebten und unbelebten Natur",
        kompetenzen: [
          { code: "NMG.4.1", name: "Wetter und Witterung" },
          { code: "NMG.4.2", name: "Tag und Nacht, Jahreszeiten" },
          { code: "NMG.4.3", name: "Naturereignisse und Naturgefahren" },
          { code: "NMG.4.4", name: "Himmelskörper und Universum" },
          { code: "NMG.4.5", name: "Technische Geräte und ihre Funktionsweise" },
        ],
      },
      {
        code: "NMG.5",
        name: "Technische Entwicklungen",
        kompetenzen: [
          { code: "NMG.5.1", name: "Bedeutung von Technik im Alltag" },
          { code: "NMG.5.2", name: "Entwicklungen und Veränderungen durch Technik" },
          { code: "NMG.5.3", name: "Chancen und Risiken von Technik abwägen" },
        ],
      },
      {
        code: "NMG.6",
        name: "Arbeit, Produktion, Konsum",
        kompetenzen: [
          { code: "NMG.6.1", name: "Produkte und ihre Herstellung" },
          { code: "NMG.6.2", name: "Konsum und Konsumverhalten" },
          { code: "NMG.6.3", name: "Berufe und Arbeitsteilung" },
          { code: "NMG.6.4", name: "Tauschen und Handeln, Geld und Wirtschaft" },
          { code: "NMG.6.5", name: "Wohlstand und Ungleichheit" },
        ],
      },
      {
        code: "NMG.7",
        name: "Lebensweisen und Lebensräume",
        kompetenzen: [
          { code: "NMG.7.1", name: "Räume wahrnehmen und sich orientieren" },
          { code: "NMG.7.2", name: "Lebensräume und Lebensweisen vergleichen" },
          { code: "NMG.7.3", name: "Mobilität und Verkehr" },
          { code: "NMG.7.4", name: "Raumnutzung und Raumveränderung" },
        ],
      },
      {
        code: "NMG.8",
        name: "Menschen nutzen Räume",
        kompetenzen: [
          { code: "NMG.8.1", name: "Raumwahrnehmung und Raumvorstellung" },
          { code: "NMG.8.2", name: "Räume erkunden und darstellen" },
          { code: "NMG.8.3", name: "Einflüsse des Menschen auf Räume" },
        ],
      },
      {
        code: "NMG.9",
        name: "Zeit, Dauer, Wandel",
        kompetenzen: [
          { code: "NMG.9.1", name: "Zeit messen und wahrnehmen" },
          { code: "NMG.9.2", name: "Veränderungen über die Zeit" },
          { code: "NMG.9.3", name: "Geschichte und Geschichten" },
          { code: "NMG.9.4", name: "Alltagsleben früher und heute" },
        ],
      },
      {
        code: "NMG.10",
        name: "Gemeinschaft und Gesellschaft",
        kompetenzen: [
          { code: "NMG.10.1", name: "Zusammenleben in Gemeinschaften" },
          { code: "NMG.10.2", name: "Regeln und Rechte" },
          { code: "NMG.10.3", name: "Demokratie und Mitbestimmung" },
          { code: "NMG.10.4", name: "Konflikte und Konfliktlösungen" },
          { code: "NMG.10.5", name: "Vielfalt in der Gesellschaft" },
        ],
      },
      {
        code: "NMG.11",
        name: "Grunderfahrungen, Werte, Normen",
        kompetenzen: [
          { code: "NMG.11.1", name: "Philosophieren und Nachdenken" },
          { code: "NMG.11.2", name: "Werte und Normen erkunden" },
          { code: "NMG.11.3", name: "Situationen beurteilen" },
          { code: "NMG.11.4", name: "Verantwortung übernehmen" },
        ],
      },
      {
        code: "NMG.12",
        name: "Religionen und Weltsichten",
        kompetenzen: [
          { code: "NMG.12.1", name: "Religiöse Traditionen und Ausdrucksformen kennenlernen" },
          { code: "NMG.12.2", name: "Weltbilder und Vorstellungen" },
          { code: "NMG.12.3", name: "Feste und Bräuche" },
          { code: "NMG.12.4", name: "Unterschiedliche Überzeugungen" },
          { code: "NMG.12.5", name: "Respektvoller Umgang mit Vielfalt" },
        ],
      },
    ],
  },

  // ============ NMG ZYKLUS 3 FÄCHER ============
  {
    code: "NT",
    name: "Natur und Technik",
    shortName: "NT",
    color: "#40a02b", // Green
    colorClass: "subject-nmg",
    icon: "flask",
    cycles: [3],
    kompetenzbereiche: [
      {
        code: "NT.1",
        name: "Wesen und Bedeutung von Naturwissenschaften",
        kompetenzen: [
          { code: "NT.1.1", name: "Naturwissenschaftliche Arbeitsweisen" },
          { code: "NT.1.2", name: "Modelle und Theorien" },
          { code: "NT.1.3", name: "Naturwissenschaften und Gesellschaft" },
        ],
      },
      {
        code: "NT.2",
        name: "Stoffe erkunden",
        kompetenzen: [
          { code: "NT.2.1", name: "Stoffeigenschaften" },
          { code: "NT.2.2", name: "Stoffumwandlungen" },
          { code: "NT.2.3", name: "Atome und Periodensystem" },
        ],
      },
      {
        code: "NT.3",
        name: "Chemische Reaktionen",
        kompetenzen: [
          { code: "NT.3.1", name: "Chemische Reaktionen erkennen" },
          { code: "NT.3.2", name: "Verbrennung und Oxidation" },
          { code: "NT.3.3", name: "Säuren und Basen" },
        ],
      },
      {
        code: "NT.4",
        name: "Sinne und Signale",
        kompetenzen: [
          { code: "NT.4.1", name: "Sinnesorgane" },
          { code: "NT.4.2", name: "Nervensystem" },
          { code: "NT.4.3", name: "Reize und Signale" },
        ],
      },
      {
        code: "NT.5",
        name: "Energie",
        kompetenzen: [
          { code: "NT.5.1", name: "Energieformen und Energieumwandlung" },
          { code: "NT.5.2", name: "Energieträger und Ressourcen" },
          { code: "NT.5.3", name: "Nachhaltiger Umgang mit Energie" },
        ],
      },
      {
        code: "NT.6",
        name: "Bewegung und Kraft",
        kompetenzen: [
          { code: "NT.6.1", name: "Bewegungen beschreiben" },
          { code: "NT.6.2", name: "Kräfte und ihre Wirkungen" },
          { code: "NT.6.3", name: "Newtonsche Gesetze" },
        ],
      },
      {
        code: "NT.7",
        name: "Elektrizität",
        kompetenzen: [
          { code: "NT.7.1", name: "Elektrische Stromkreise" },
          { code: "NT.7.2", name: "Elektrische Grössen" },
          { code: "NT.7.3", name: "Elektromagnetismus" },
        ],
      },
      {
        code: "NT.8",
        name: "Fortpflanzung und Entwicklung",
        kompetenzen: [
          { code: "NT.8.1", name: "Fortpflanzung bei Pflanzen und Tieren" },
          { code: "NT.8.2", name: "Genetik und Vererbung" },
          { code: "NT.8.3", name: "Evolution" },
        ],
      },
      {
        code: "NT.9",
        name: "Ökosysteme",
        kompetenzen: [
          { code: "NT.9.1", name: "Ökosysteme erforschen" },
          { code: "NT.9.2", name: "Stoffkreisläufe und Energiefluss" },
          { code: "NT.9.3", name: "Mensch und Umwelt" },
        ],
      },
    ],
  },
  {
    code: "WAH",
    name: "WAH",
    shortName: "WAH",
    color: "#40a02b", // Green
    colorClass: "subject-nmg",
    icon: "briefcase",
    cycles: [3],
    kompetenzbereiche: [
      {
        code: "WAH.1",
        name: "Produktions- und Arbeitswelten",
        kompetenzen: [
          { code: "WAH.1.1", name: "Berufswahl und Arbeitswelt" },
          { code: "WAH.1.2", name: "Produktion und Dienstleistungen" },
          { code: "WAH.1.3", name: "Wirtschaftskreisläufe" },
        ],
      },
      {
        code: "WAH.2",
        name: "Märkte und Handel",
        kompetenzen: [
          { code: "WAH.2.1", name: "Markt und Preis" },
          { code: "WAH.2.2", name: "Globaler Handel" },
          { code: "WAH.2.3", name: "Fairer Handel" },
        ],
      },
      {
        code: "WAH.3",
        name: "Konsum",
        kompetenzen: [
          { code: "WAH.3.1", name: "Konsumentscheidungen" },
          { code: "WAH.3.2", name: "Budget und Schulden" },
          { code: "WAH.3.3", name: "Nachhaltiger Konsum" },
        ],
      },
      {
        code: "WAH.4",
        name: "Ernährung und Gesundheit",
        kompetenzen: [
          { code: "WAH.4.1", name: "Gesunde Ernährung" },
          { code: "WAH.4.2", name: "Lebensmittelproduktion" },
          { code: "WAH.4.3", name: "Nahrungszubereitung" },
          { code: "WAH.4.4", name: "Esskultur und Traditionen" },
          { code: "WAH.4.5", name: "Lebensmittelsicherheit" },
        ],
      },
    ],
  },
  {
    code: "RZG",
    name: "RZG",
    shortName: "RZG",
    color: "#40a02b", // Green
    colorClass: "subject-nmg",
    icon: "map",
    cycles: [3],
    kompetenzbereiche: [
      {
        code: "RZG.1",
        name: "Natürliche Grundlagen der Erde",
        kompetenzen: [
          { code: "RZG.1.1", name: "Aufbau und Dynamik der Erde" },
          { code: "RZG.1.2", name: "Klima und Klimazonen" },
          { code: "RZG.1.3", name: "Naturgefahren und Naturkatastrophen" },
        ],
      },
      {
        code: "RZG.2",
        name: "Lebensweisen und Lebensräume",
        kompetenzen: [
          { code: "RZG.2.1", name: "Bevölkerung und Migration" },
          { code: "RZG.2.2", name: "Städte und Siedlungen" },
          { code: "RZG.2.3", name: "Landwirtschaft und Ernährung" },
        ],
      },
      {
        code: "RZG.3",
        name: "Schweiz in Europa und der Welt",
        kompetenzen: [
          { code: "RZG.3.1", name: "Schweizer Geographie" },
          { code: "RZG.3.2", name: "Europa als Lebensraum" },
          { code: "RZG.3.3", name: "Globalisierung und Vernetzung" },
        ],
      },
      {
        code: "RZG.4",
        name: "Menschen machen Geschichte",
        kompetenzen: [
          { code: "RZG.4.1", name: "Quellen und Darstellungen" },
          { code: "RZG.4.2", name: "Kontinuität und Wandel" },
        ],
      },
      {
        code: "RZG.5",
        name: "Weltgeschichte",
        kompetenzen: [
          { code: "RZG.5.1", name: "Frühe Hochkulturen" },
          { code: "RZG.5.2", name: "Antike" },
          { code: "RZG.5.3", name: "Mittelalter" },
        ],
      },
      {
        code: "RZG.6",
        name: "Schweizer Geschichte",
        kompetenzen: [
          { code: "RZG.6.1", name: "Entstehung der Eidgenossenschaft" },
          { code: "RZG.6.2", name: "Neuzeit und Bundesstaat" },
          { code: "RZG.6.3", name: "20. und 21. Jahrhundert" },
        ],
      },
      {
        code: "RZG.7",
        name: "Geschichtskultur",
        kompetenzen: [
          { code: "RZG.7.1", name: "Erinnerungskultur" },
          { code: "RZG.7.2", name: "Geschichtliche Darstellungen analysieren" },
        ],
      },
      {
        code: "RZG.8",
        name: "Politik und Demokratie",
        kompetenzen: [
          { code: "RZG.8.1", name: "Schweizer Staatsaufbau" },
          { code: "RZG.8.2", name: "Demokratie und Menschenrechte" },
          { code: "RZG.8.3", name: "Internationale Organisationen" },
        ],
      },
    ],
  },
  {
    code: "ERG",
    name: "ERG",
    shortName: "ERG",
    color: "#40a02b", // Green
    colorClass: "subject-nmg",
    icon: "users",
    cycles: [3],
    kompetenzbereiche: [
      {
        code: "ERG.1",
        name: "Existenzielle Grunderfahrungen",
        kompetenzen: [
          { code: "ERG.1.1", name: "Lebensfragen" },
          { code: "ERG.1.2", name: "Glück und Sinn" },
        ],
      },
      {
        code: "ERG.2",
        name: "Werte und Normen",
        kompetenzen: [
          { code: "ERG.2.1", name: "Werte reflektieren" },
          { code: "ERG.2.2", name: "Ethisch urteilen" },
        ],
      },
      {
        code: "ERG.3",
        name: "Spannungsfelder",
        kompetenzen: [
          { code: "ERG.3.1", name: "Individuum und Gemeinschaft" },
          { code: "ERG.3.2", name: "Freiheit und Verantwortung" },
        ],
      },
      {
        code: "ERG.4",
        name: "Religionen und Weltanschauungen",
        kompetenzen: [
          { code: "ERG.4.1", name: "Weltreligionen" },
          { code: "ERG.4.2", name: "Religiöse Praxis" },
          { code: "ERG.4.3", name: "Religion und Gesellschaft" },
        ],
      },
      {
        code: "ERG.5",
        name: "Ich und die Gemeinschaft",
        kompetenzen: [
          { code: "ERG.5.1", name: "Identität und Rolle" },
          { code: "ERG.5.2", name: "Beziehungen gestalten" },
          { code: "ERG.5.3", name: "Konflikte lösen" },
          { code: "ERG.5.4", name: "Vielfalt und Zusammenleben" },
          { code: "ERG.5.5", name: "Verantwortung für andere" },
          { code: "ERG.5.6", name: "Gesellschaftliches Engagement" },
        ],
      },
    ],
  },

  // ============ GESTALTEN ============
  {
    code: "BG",
    name: "Bildnerisches Gestalten",
    shortName: "BG",
    color: "#ea76cb", // Pink
    colorClass: "subject-gestalten",
    icon: "palette",
    cycles: [1, 2, 3],
    kompetenzbereiche: [
      {
        code: "BG.1",
        name: "Wahrnehmung und Kommunikation",
        kompetenzen: [
          { code: "BG.1.A", name: "Wahrnehmung und Reflexion" },
          { code: "BG.1.B", name: "Präsentation und Dokumentation" },
        ],
      },
      {
        code: "BG.2",
        name: "Prozesse und Produkte",
        kompetenzen: [
          { code: "BG.2.A", name: "Bildnerischer Prozess" },
          { code: "BG.2.B", name: "Bildnerische Grundelemente" },
          { code: "BG.2.C", name: "Bildnerische Verfahren und kunstorientierte Methoden" },
        ],
      },
      {
        code: "BG.3",
        name: "Kontexte und Orientierung",
        kompetenzen: [
          { code: "BG.3.A", name: "Kunst- und Bildverständnis" },
          { code: "BG.3.B", name: "Kultur und Geschichte" },
        ],
      },
    ],
  },
  {
    code: "TTG",
    name: "TTG",
    shortName: "TTG",
    color: "#ea76cb", // Pink
    colorClass: "subject-gestalten",
    icon: "scissors",
    cycles: [1, 2, 3],
    kompetenzbereiche: [
      {
        code: "TTG.1",
        name: "Wahrnehmung und Kommunikation",
        kompetenzen: [
          { code: "TTG.1.A", name: "Wahrnehmung und Reflexion" },
          { code: "TTG.1.B", name: "Dokumentation und Präsentation" },
        ],
      },
      {
        code: "TTG.2",
        name: "Prozesse und Produkte",
        kompetenzen: [
          { code: "TTG.2.A", name: "Gestaltungs- und Designprozess" },
          { code: "TTG.2.B", name: "Funktion und Konstruktion" },
          { code: "TTG.2.C", name: "Material, Werkzeug und Maschine" },
          { code: "TTG.2.D", name: "Verfahren" },
          { code: "TTG.2.E", name: "Gestaltungselemente" },
        ],
      },
      {
        code: "TTG.3",
        name: "Kontexte und Orientierung",
        kompetenzen: [
          { code: "TTG.3.A", name: "Design- und Technikverständnis" },
          { code: "TTG.3.B", name: "Kultur und Geschichte" },
        ],
      },
    ],
  },

  // ============ MUSIK ============
  {
    code: "MU",
    name: "Musik",
    shortName: "Musik",
    color: "#8839ef", // Mauve
    colorClass: "subject-musik",
    icon: "music",
    cycles: [1, 2, 3],
    kompetenzbereiche: [
      {
        code: "MU.1",
        name: "Singen und Sprechen",
        kompetenzen: [
          { code: "MU.1.A", name: "Stimme im Ensemble" },
          { code: "MU.1.B", name: "Liedrepertoire" },
          { code: "MU.1.C", name: "Stimme als Ausdrucksmittel" },
        ],
      },
      {
        code: "MU.2",
        name: "Hören und Sich-Orientieren",
        kompetenzen: [
          { code: "MU.2.A", name: "Akustische Orientierung" },
          { code: "MU.2.B", name: "Bedeutung und Funktion von Musik" },
          { code: "MU.2.C", name: "Musikalische Merkmale" },
        ],
      },
      {
        code: "MU.3",
        name: "Bewegen und Tanzen",
        kompetenzen: [
          { code: "MU.3.A", name: "Körperausdruck" },
          { code: "MU.3.B", name: "Bewegungsabläufe" },
          { code: "MU.3.C", name: "Tanzformen" },
        ],
      },
      {
        code: "MU.4",
        name: "Musizieren",
        kompetenzen: [
          { code: "MU.4.A", name: "Musizieren im Ensemble" },
          { code: "MU.4.B", name: "Instrument als Ausdrucksmittel" },
          { code: "MU.4.C", name: "Instrumentenkunde" },
        ],
      },
      {
        code: "MU.5",
        name: "Gestaltungsprozesse",
        kompetenzen: [
          { code: "MU.5.A", name: "Musik erkunden" },
          { code: "MU.5.B", name: "Musik erfinden" },
          { code: "MU.5.C", name: "Musik aufführen" },
        ],
      },
      {
        code: "MU.6",
        name: "Praxis des musikalischen Wissens",
        kompetenzen: [
          { code: "MU.6.A", name: "Notation" },
          { code: "MU.6.B", name: "Rhythmus und Metrum" },
          { code: "MU.6.C", name: "Melodie und Harmonie" },
        ],
      },
    ],
  },

  // ============ BEWEGUNG UND SPORT ============
  {
    code: "BS",
    name: "Bewegung und Sport",
    shortName: "BS",
    color: "#fe640b", // Peach
    colorClass: "subject-sport",
    icon: "activity",
    cycles: [1, 2, 3],
    kompetenzbereiche: [
      {
        code: "BS.1",
        name: "Laufen, Springen, Werfen",
        kompetenzen: [
          { code: "BS.1.A", name: "Laufen" },
          { code: "BS.1.B", name: "Springen" },
          { code: "BS.1.C", name: "Werfen" },
          { code: "BS.1.D", name: "Leichtathletik" },
        ],
      },
      {
        code: "BS.2",
        name: "Bewegen an Geräten",
        kompetenzen: [
          { code: "BS.2.A", name: "Grundbewegungen" },
          { code: "BS.2.B", name: "Geräteturnen" },
          { code: "BS.2.C", name: "Parkour" },
        ],
      },
      {
        code: "BS.3",
        name: "Darstellen und Tanzen",
        kompetenzen: [
          { code: "BS.3.A", name: "Körperwahrnehmung" },
          { code: "BS.3.B", name: "Darstellen" },
          { code: "BS.3.C", name: "Tanzen" },
        ],
      },
      {
        code: "BS.4",
        name: "Spielen",
        kompetenzen: [
          { code: "BS.4.A", name: "Spielfähigkeit" },
          { code: "BS.4.B", name: "Sportspiele" },
          { code: "BS.4.C", name: "Rückschlagspiele" },
        ],
      },
      {
        code: "BS.5",
        name: "Gleiten, Rollen, Fahren",
        kompetenzen: [
          { code: "BS.5.A", name: "Auf Rollen und Rädern" },
          { code: "BS.5.B", name: "Auf Schnee und Eis" },
          { code: "BS.5.C", name: "Im Wasser" },
        ],
      },
      {
        code: "BS.6",
        name: "Bewegen im Wasser",
        kompetenzen: [
          { code: "BS.6.A", name: "Sicherheit im Wasser" },
          { code: "BS.6.B", name: "Schwimmtechniken" },
          { code: "BS.6.C", name: "Tauchen und Wasserspiele" },
        ],
      },
    ],
  },

  // ============ MEDIEN UND INFORMATIK ============
  {
    code: "MI",
    name: "Medien und Informatik",
    shortName: "MI",
    color: "#04a5e5", // Sky
    colorClass: "subject-medien",
    icon: "monitor",
    cycles: [1, 2, 3],
    kompetenzbereiche: [
      {
        code: "MI.1",
        name: "Medien",
        kompetenzen: [
          { code: "MI.1.1", name: "Medien verstehen und verantwortungsvoll nutzen" },
          { code: "MI.1.2", name: "Medien und Medienbeiträge produzieren" },
          { code: "MI.1.3", name: "Medien und Medienbeiträge verstehen und reflektieren" },
          { code: "MI.1.4", name: "Mit Medien kommunizieren und kooperieren" },
        ],
      },
      {
        code: "MI.2",
        name: "Informatik",
        kompetenzen: [
          { code: "MI.2.1", name: "Datenstrukturen" },
          { code: "MI.2.2", name: "Algorithmen" },
          { code: "MI.2.3", name: "Informatiksysteme" },
        ],
      },
    ],
  },

  // ============ BERUFLICHE ORIENTIERUNG ============
  {
    code: "BO",
    name: "Berufliche Orientierung",
    shortName: "BO",
    color: "#7c7f93", // Gray
    colorClass: "subject-default",
    icon: "compass",
    cycles: [3],
    kompetenzbereiche: [
      {
        code: "BO.1",
        name: "Persönlichkeitsprofil",
        kompetenzen: [
          { code: "BO.1.1", name: "Interessen und Fähigkeiten erkunden" },
          { code: "BO.1.2", name: "Stärken und Schwächen analysieren" },
        ],
      },
      {
        code: "BO.2",
        name: "Bildungswege, Berufs- und Arbeitswelt",
        kompetenzen: [
          { code: "BO.2.1", name: "Bildungssystem Schweiz" },
          { code: "BO.2.2", name: "Berufsfelder erkunden" },
          { code: "BO.2.3", name: "Arbeitswelt verstehen" },
        ],
      },
      {
        code: "BO.3",
        name: "Entscheidung und Planung",
        kompetenzen: [
          { code: "BO.3.1", name: "Entscheidungsprozess" },
          { code: "BO.3.2", name: "Bewerbungsprozess" },
        ],
      },
      {
        code: "BO.4",
        name: "Umsetzung",
        kompetenzen: [
          { code: "BO.4.1", name: "Schnupperlehren" },
          { code: "BO.4.2", name: "Bewerbungen" },
          { code: "BO.4.3", name: "Übergänge gestalten" },
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
