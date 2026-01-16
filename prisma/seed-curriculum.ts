/**
 * Curriculum Seed Data for Easy-Lehrer
 *
 * Contains structured data for:
 * - Lehrplan 21 (LP21) - German-speaking Switzerland
 * - Plan d'études romand (PER) - French-speaking Switzerland
 *
 * Data structure follows the LP21 hierarchy:
 * Fachbereich -> Kompetenzbereich -> Handlungsaspekt -> Kompetenzstufe
 */

// ============================================================
// CURRICULUM DEFINITIONS
// ============================================================

export const curricula = [
  {
    code: "LP21",
    name_de: "Lehrplan 21",
    name_fr: "Plan d'études 21",
    name_it: "Piano di studio 21",
    region: "de-CH",
  },
  {
    code: "PER",
    name_de: "Plan d'études romand",
    name_fr: "Plan d'études romand",
    name_it: null,
    region: "fr-CH",
  },
];

// ============================================================
// LP21 SUBJECTS (Fachbereiche)
// ============================================================

export const lp21Subjects = [
  {
    code: "MA",
    name_de: "Mathematik",
    name_fr: "Mathématiques",
    name_it: "Matematica",
    color: "#3b82f6", // Blue
    icon: "calculator",
  },
  {
    code: "D",
    name_de: "Deutsch",
    name_fr: null,
    name_it: null,
    color: "#e64545", // Red
    icon: "book-open",
  },
  {
    code: "F",
    name_de: "Französisch",
    name_fr: "Français",
    name_it: "Francese",
    color: "#0891b2", // Cyan
    icon: "message-circle",
  },
  {
    code: "E",
    name_de: "Englisch",
    name_fr: "Anglais",
    name_it: "Inglese",
    color: "#84cc16", // Lime
    icon: "globe",
  },
  {
    code: "NMG",
    name_de: "Natur, Mensch, Gesellschaft",
    name_fr: "Sciences de la nature",
    name_it: "Natura, uomo, società",
    color: "#22c55e", // Green
    icon: "leaf",
  },
  {
    code: "BG",
    name_de: "Bildnerisches Gestalten",
    name_fr: "Arts visuels",
    name_it: "Arti visive",
    color: "#f59e0b", // Yellow/Amber
    icon: "palette",
  },
  {
    code: "TTG",
    name_de: "Textiles und Technisches Gestalten",
    name_fr: "Activités créatrices et manuelles",
    name_it: "Lavori manuali e tessili",
    color: "#a855f7", // Purple
    icon: "scissors",
  },
  {
    code: "MU",
    name_de: "Musik",
    name_fr: "Musique",
    name_it: "Musica",
    color: "#ec4899", // Pink
    icon: "music",
  },
  {
    code: "BS",
    name_de: "Bewegung und Sport",
    name_fr: "Éducation physique",
    name_it: "Educazione fisica",
    color: "#14b8a6", // Teal
    icon: "activity",
  },
  {
    code: "MI",
    name_de: "Medien und Informatik",
    name_fr: "MITIC",
    name_it: "Media e informatica",
    color: "#6366f1", // Indigo
    icon: "monitor",
  },
];

// ============================================================
// TRANSVERSAL COMPETENCIES (Überfachliche Kompetenzen)
// ============================================================

export const transversalCompetencies = [
  // Personale Kompetenzen
  {
    code: "PK.1",
    category: "personale",
    name_de: "Selbstreflexion",
    name_fr: "Réflexion sur soi",
    description_de:
      "Die Schülerinnen und Schüler können eigene Gefühle wahrnehmen und situationsangemessen ausdrücken. Sie können ihre Interessen und Bedürfnisse wahrnehmen und formulieren.",
    description_fr:
      "Les élèves peuvent percevoir leurs propres sentiments et les exprimer de manière appropriée à la situation.",
    icon: "user",
    color: "#8b5cf6", // Violet
  },
  {
    code: "PK.2",
    category: "personale",
    name_de: "Selbstständigkeit",
    name_fr: "Autonomie",
    description_de:
      "Die Schülerinnen und Schüler können Herausforderungen annehmen und konstruktiv damit umgehen. Sie können für sich selbst sorgen und Verantwortung übernehmen.",
    description_fr: "Les élèves peuvent relever des défis et les gérer de manière constructive.",
    icon: "star",
    color: "#8b5cf6",
  },
  {
    code: "PK.3",
    category: "personale",
    name_de: "Eigenständigkeit",
    name_fr: "Indépendance",
    description_de:
      "Die Schülerinnen und Schüler können Ziele setzen und Entscheidungen treffen. Sie können eigene Werte entwickeln und danach handeln.",
    description_fr: "Les élèves peuvent fixer des objectifs et prendre des décisions.",
    icon: "compass",
    color: "#8b5cf6",
  },
  // Soziale Kompetenzen
  {
    code: "SK.1",
    category: "soziale",
    name_de: "Kooperationsfähigkeit",
    name_fr: "Capacité de coopération",
    description_de:
      "Die Schülerinnen und Schüler können sich aktiv und im Dialog an der Zusammenarbeit mit anderen beteiligen. Sie können aufeinander eingehen und Konflikte lösen.",
    description_fr:
      "Les élèves peuvent participer activement et en dialogue à la collaboration avec les autres.",
    icon: "users",
    color: "#f97316", // Orange
  },
  {
    code: "SK.2",
    category: "soziale",
    name_de: "Konfliktfähigkeit",
    name_fr: "Capacité à gérer les conflits",
    description_de:
      "Die Schülerinnen und Schüler können Konflikte wahrnehmen und ansprechen. Sie können Kritik angemessen äussern und annehmen.",
    description_fr: "Les élèves peuvent percevoir et aborder les conflits.",
    icon: "message-square",
    color: "#f97316",
  },
  {
    code: "SK.3",
    category: "soziale",
    name_de: "Umgang mit Vielfalt",
    name_fr: "Gestion de la diversité",
    description_de:
      "Die Schülerinnen und Schüler können Menschen in ihren Gemeinsamkeiten und Differenzen wahrnehmen und verstehen. Sie können respektvoll mit Menschen umgehen.",
    description_fr:
      "Les élèves peuvent percevoir et comprendre les personnes dans leurs points communs et leurs différences.",
    icon: "heart",
    color: "#f97316",
  },
  // Methodische Kompetenzen
  {
    code: "MK.1",
    category: "methodische",
    name_de: "Sprachfähigkeit",
    name_fr: "Compétences linguistiques",
    description_de:
      "Die Schülerinnen und Schüler können unterschiedliche Sachverhalte sprachlich ausdrücken und andere verstehen. Sie erweitern und verfeinern ihre Sprache.",
    description_fr:
      "Les élèves peuvent exprimer différents faits de manière linguistique et comprendre les autres.",
    icon: "message-circle",
    color: "#0ea5e9", // Sky blue
  },
  {
    code: "MK.2",
    category: "methodische",
    name_de: "Informationen nutzen",
    name_fr: "Utiliser les informations",
    description_de:
      "Die Schülerinnen und Schüler können Informationen aus verschiedenen Quellen suchen, bewerten und für eigene Zwecke nutzen. Sie können Informationen verarbeiten.",
    description_fr:
      "Les élèves peuvent rechercher des informations provenant de différentes sources, les évaluer et les utiliser à leurs propres fins.",
    icon: "search",
    color: "#0ea5e9",
  },
  {
    code: "MK.3",
    category: "methodische",
    name_de: "Aufgaben/Probleme lösen",
    name_fr: "Résoudre des tâches/problèmes",
    description_de:
      "Die Schülerinnen und Schüler können Aufgaben und Probleme analysieren und Lösungsstrategien entwickeln. Sie können Lösungen überprüfen und optimieren.",
    description_fr:
      "Les élèves peuvent analyser des tâches et des problèmes et développer des stratégies de résolution.",
    icon: "lightbulb",
    color: "#0ea5e9",
  },
];

// ============================================================
// BNE THEMES (Bildung für Nachhaltige Entwicklung)
// ============================================================

export const bneThemes = [
  {
    code: "BNE.1",
    name_de: "Politik, Demokratie und Menschenrechte",
    name_fr: "Politique, démocratie et droits de l'homme",
    description_de:
      "Auseinandersetzung mit politischen Prozessen, demokratischen Prinzipien und Menschenrechten als Grundlage für eine nachhaltige Gesellschaft.",
    description_fr:
      "Réflexion sur les processus politiques, les principes démocratiques et les droits de l'homme comme base d'une société durable.",
    sdg_number: 16, // Peace, Justice and Strong Institutions
    icon: "scale",
    color: "#1e3a8a", // Dark blue
  },
  {
    code: "BNE.2",
    name_de: "Natürliche Umwelt und Ressourcen",
    name_fr: "Environnement naturel et ressources",
    description_de:
      "Verständnis von Ökosystemen, natürlichen Ressourcen und deren nachhaltige Nutzung sowie Schutz der Biodiversität.",
    description_fr:
      "Compréhension des écosystèmes, des ressources naturelles et de leur utilisation durable ainsi que protection de la biodiversité.",
    sdg_number: 15, // Life on Land
    icon: "tree",
    color: "#166534", // Dark green
  },
  {
    code: "BNE.3",
    name_de: "Geschlechter und Gleichstellung",
    name_fr: "Genre et égalité",
    description_de:
      "Reflexion über Geschlechterrollen, Gleichstellung und Chancengleichheit als Grundlage für eine gerechte Gesellschaft.",
    description_fr:
      "Réflexion sur les rôles de genre, l'égalité et l'égalité des chances comme base d'une société juste.",
    sdg_number: 5, // Gender Equality
    icon: "users",
    color: "#be185d", // Pink
  },
  {
    code: "BNE.4",
    name_de: "Gesundheit und Wohlbefinden",
    name_fr: "Santé et bien-être",
    description_de:
      "Förderung von körperlicher und psychischer Gesundheit, Prävention und einem verantwortungsvollen Umgang mit sich selbst und anderen.",
    description_fr:
      "Promotion de la santé physique et psychique, prévention et gestion responsable de soi-même et des autres.",
    sdg_number: 3, // Good Health and Well-being
    icon: "heart",
    color: "#dc2626", // Red
  },
  {
    code: "BNE.5",
    name_de: "Globale Entwicklung und Frieden",
    name_fr: "Développement global et paix",
    description_de:
      "Verständnis globaler Zusammenhänge, internationaler Beziehungen und Förderung von Frieden und Gerechtigkeit weltweit.",
    description_fr:
      "Compréhension des relations mondiales, des relations internationales et promotion de la paix et de la justice dans le monde.",
    sdg_number: 17, // Partnerships for the Goals
    icon: "globe",
    color: "#7c3aed", // Violet
  },
  {
    code: "BNE.6",
    name_de: "Kulturelle Identitäten und interkulturelle Verständigung",
    name_fr: "Identités culturelles et compréhension interculturelle",
    description_de:
      "Wertschätzung kultureller Vielfalt, Entwicklung eigener kultureller Identität und Förderung interkultureller Kompetenz.",
    description_fr:
      "Appréciation de la diversité culturelle, développement de sa propre identité culturelle et promotion des compétences interculturelles.",
    sdg_number: 10, // Reduced Inequalities
    icon: "globe-2",
    color: "#0891b2", // Cyan
  },
  {
    code: "BNE.7",
    name_de: "Wirtschaft und Konsum",
    name_fr: "Économie et consommation",
    description_de:
      "Verstehen wirtschaftlicher Zusammenhänge, nachhaltiger Produktion und verantwortungsvollem Konsum für eine zukunftsfähige Wirtschaft.",
    description_fr:
      "Compréhension des relations économiques, de la production durable et de la consommation responsable pour une économie durable.",
    sdg_number: 12, // Responsible Consumption and Production
    icon: "shopping-bag",
    color: "#ca8a04", // Yellow/Gold
  },
];

// ============================================================
// LP21 COMPETENCIES (Sample - Math Cycle 1-2)
// ============================================================

export const lp21Competencies: Record<
  string,
  Array<{
    code: string;
    cycle: number;
    kompetenzbereich: string;
    handlungsaspekt: string | null;
    description_de: string;
    description_fr: string | null;
    anforderungsstufe?: string | null;
  }>
> = {
  MA: [
    // Zahl und Variable - Operieren und Benennen
    {
      code: "MA.1.A.1",
      cycle: 1,
      kompetenzbereich: "Zahl und Variable",
      handlungsaspekt: "Operieren und Benennen",
      description_de:
        "Die Schülerinnen und Schüler verstehen und verwenden arithmetische Begriffe und Symbole.",
      description_fr: "Les élèves comprennent et utilisent des termes et symboles arithmétiques.",
      anforderungsstufe: "grund",
    },
    {
      code: "MA.1.A.2",
      cycle: 1,
      kompetenzbereich: "Zahl und Variable",
      handlungsaspekt: "Operieren und Benennen",
      description_de: "Die Schülerinnen und Schüler können addieren, subtrahieren und verdoppeln.",
      description_fr: "Les élèves savent additionner, soustraire et doubler.",
      anforderungsstufe: "grund",
    },
    {
      code: "MA.1.A.3",
      cycle: 2,
      kompetenzbereich: "Zahl und Variable",
      handlungsaspekt: "Operieren und Benennen",
      description_de: "Die Schülerinnen und Schüler können multiplizieren und dividieren.",
      description_fr: "Les élèves savent multiplier et diviser.",
      anforderungsstufe: "grund",
    },
    {
      code: "MA.1.A.4",
      cycle: 2,
      kompetenzbereich: "Zahl und Variable",
      handlungsaspekt: "Operieren und Benennen",
      description_de:
        "Die Schülerinnen und Schüler können Rechengesetze und Rechenregeln anwenden.",
      description_fr: "Les élèves savent appliquer les lois et règles de calcul.",
      anforderungsstufe: "erweitert",
    },
    // Zahl und Variable - Erforschen und Argumentieren
    {
      code: "MA.1.B.1",
      cycle: 1,
      kompetenzbereich: "Zahl und Variable",
      handlungsaspekt: "Erforschen und Argumentieren",
      description_de:
        "Die Schülerinnen und Schüler können Muster und Beziehungen bei natürlichen Zahlen erforschen.",
      description_fr:
        "Les élèves peuvent explorer des motifs et des relations entre nombres naturels.",
    },
    {
      code: "MA.1.B.2",
      cycle: 2,
      kompetenzbereich: "Zahl und Variable",
      handlungsaspekt: "Erforschen und Argumentieren",
      description_de:
        "Die Schülerinnen und Schüler können Eigenschaften von Zahlen erforschen und Aussagen überprüfen.",
      description_fr:
        "Les élèves peuvent explorer les propriétés des nombres et vérifier des énoncés.",
    },
    // Form und Raum - Operieren und Benennen
    {
      code: "MA.2.A.1",
      cycle: 1,
      kompetenzbereich: "Form und Raum",
      handlungsaspekt: "Operieren und Benennen",
      description_de:
        "Die Schülerinnen und Schüler können Figuren und Körper benennen, bezeichnen und darstellen.",
      description_fr:
        "Les élèves peuvent nommer, désigner et représenter des figures et des corps.",
    },
    {
      code: "MA.2.A.2",
      cycle: 2,
      kompetenzbereich: "Form und Raum",
      handlungsaspekt: "Operieren und Benennen",
      description_de:
        "Die Schülerinnen und Schüler können Längen, Flächen und Volumen bestimmen und berechnen.",
      description_fr:
        "Les élèves peuvent déterminer et calculer des longueurs, des aires et des volumes.",
    },
    // Grössen, Funktionen, Daten und Zufall
    {
      code: "MA.3.A.1",
      cycle: 1,
      kompetenzbereich: "Grössen, Funktionen, Daten und Zufall",
      handlungsaspekt: "Operieren und Benennen",
      description_de:
        "Die Schülerinnen und Schüler können Grössen schätzen, messen, umwandeln, runden und mit ihnen rechnen.",
      description_fr:
        "Les élèves peuvent estimer, mesurer, convertir, arrondir des grandeurs et calculer avec elles.",
    },
    {
      code: "MA.3.A.2",
      cycle: 2,
      kompetenzbereich: "Grössen, Funktionen, Daten und Zufall",
      handlungsaspekt: "Operieren und Benennen",
      description_de: "Die Schülerinnen und Schüler können mit Geldbeträgen rechnen.",
      description_fr: "Les élèves peuvent calculer avec des montants.",
    },
    {
      code: "MA.3.C.1",
      cycle: 1,
      kompetenzbereich: "Grössen, Funktionen, Daten und Zufall",
      handlungsaspekt: "Mathematisieren und Darstellen",
      description_de:
        "Die Schülerinnen und Schüler können Daten zu Statistik, Kombinatorik und Wahrscheinlichkeit erheben, ordnen, darstellen und interpretieren.",
      description_fr:
        "Les élèves peuvent collecter, organiser, représenter et interpréter des données statistiques, combinatoires et probabilistes.",
    },
  ],
  D: [
    // Hören
    {
      code: "D.1.A.1",
      cycle: 1,
      kompetenzbereich: "Hören",
      handlungsaspekt: "Grundfertigkeiten",
      description_de:
        "Die Schülerinnen und Schüler können Laute, Silben, Stimmen und Geräusche wahrnehmen und unterscheiden.",
      description_fr: null,
    },
    {
      code: "D.1.B.1",
      cycle: 1,
      kompetenzbereich: "Hören",
      handlungsaspekt: "Verstehen in monologischen Hörsituationen",
      description_de:
        "Die Schülerinnen und Schüler können wichtige Informationen aus Hörtexten entnehmen.",
      description_fr: null,
    },
    // Lesen
    {
      code: "D.2.A.1",
      cycle: 1,
      kompetenzbereich: "Lesen",
      handlungsaspekt: "Grundfertigkeiten",
      description_de: "Die Schülerinnen und Schüler können Wörter und Sätze lesen.",
      description_fr: null,
    },
    {
      code: "D.2.B.1",
      cycle: 1,
      kompetenzbereich: "Lesen",
      handlungsaspekt: "Verstehen von Sachtexten",
      description_de:
        "Die Schülerinnen und Schüler können wichtige Informationen aus Sachtexten entnehmen.",
      description_fr: null,
    },
    {
      code: "D.2.C.1",
      cycle: 1,
      kompetenzbereich: "Lesen",
      handlungsaspekt: "Verstehen literarischer Texte",
      description_de: "Die Schülerinnen und Schüler können literarische Texte lesen und verstehen.",
      description_fr: null,
    },
    // Schreiben
    {
      code: "D.4.A.1",
      cycle: 1,
      kompetenzbereich: "Schreiben",
      handlungsaspekt: "Grundfertigkeiten",
      description_de:
        "Die Schülerinnen und Schüler können in einer persönlichen Handschrift leserlich schreiben.",
      description_fr: null,
    },
    {
      code: "D.4.B.1",
      cycle: 1,
      kompetenzbereich: "Schreiben",
      handlungsaspekt: "Schreibprodukte",
      description_de: "Die Schülerinnen und Schüler können eigene Texte planen und schreiben.",
      description_fr: null,
    },
    // Sprache im Fokus
    {
      code: "D.5.A.1",
      cycle: 1,
      kompetenzbereich: "Sprache im Fokus",
      handlungsaspekt: "Verfahren und Proben",
      description_de: "Die Schülerinnen und Schüler können Sprache erforschen und Regeln erkennen.",
      description_fr: null,
    },
    {
      code: "D.5.D.1",
      cycle: 1,
      kompetenzbereich: "Sprache im Fokus",
      handlungsaspekt: "Rechtschreibregeln",
      description_de: "Die Schülerinnen und Schüler können Rechtschreibregeln anwenden.",
      description_fr: null,
    },
  ],
  NMG: [
    // Identität, Körper, Gesundheit
    {
      code: "NMG.1.1",
      cycle: 1,
      kompetenzbereich: "Identität, Körper, Gesundheit",
      handlungsaspekt: null,
      description_de:
        "Die Schülerinnen und Schüler können sich und andere wahrnehmen und beschreiben.",
      description_fr: "Les élèves peuvent se percevoir et percevoir les autres, et les décrire.",
    },
    {
      code: "NMG.1.2",
      cycle: 1,
      kompetenzbereich: "Identität, Körper, Gesundheit",
      handlungsaspekt: null,
      description_de:
        "Die Schülerinnen und Schüler können Mitverantwortung für Gesundheit und Wohlbefinden übernehmen.",
      description_fr:
        "Les élèves peuvent assumer une coresponsabilité pour la santé et le bien-être.",
    },
    // Tiere, Pflanzen, Lebensräume
    {
      code: "NMG.2.1",
      cycle: 1,
      kompetenzbereich: "Tiere, Pflanzen, Lebensräume",
      handlungsaspekt: null,
      description_de:
        "Die Schülerinnen und Schüler können Tiere und Pflanzen in ihren Lebensräumen erkunden.",
      description_fr: "Les élèves peuvent explorer les animaux et les plantes dans leurs habitats.",
    },
    {
      code: "NMG.2.2",
      cycle: 1,
      kompetenzbereich: "Tiere, Pflanzen, Lebensräume",
      handlungsaspekt: null,
      description_de:
        "Die Schülerinnen und Schüler können die Bedeutung von Sonne, Luft, Wasser, Boden und Steinen für Lebewesen erkennen.",
      description_fr:
        "Les élèves peuvent reconnaître l'importance du soleil, de l'air, de l'eau, du sol et des pierres pour les êtres vivants.",
    },
    // Stoffe, Energie, Bewegungen
    {
      code: "NMG.3.1",
      cycle: 1,
      kompetenzbereich: "Stoffe, Energie, Bewegungen",
      handlungsaspekt: null,
      description_de:
        "Die Schülerinnen und Schüler können Stoffe im Alltag und in natürlichen Lebensräumen untersuchen.",
      description_fr:
        "Les élèves peuvent examiner des substances dans la vie quotidienne et dans les habitats naturels.",
    },
    {
      code: "NMG.3.2",
      cycle: 2,
      kompetenzbereich: "Stoffe, Energie, Bewegungen",
      handlungsaspekt: null,
      description_de:
        "Die Schülerinnen und Schüler können Stoffe verändern, trennen und vergleichen.",
      description_fr: "Les élèves peuvent transformer, séparer et comparer des substances.",
    },
    {
      code: "NMG.3.3",
      cycle: 2,
      kompetenzbereich: "Stoffe, Energie, Bewegungen",
      handlungsaspekt: null,
      description_de:
        "Die Schülerinnen und Schüler können Wasser als Lebensraum verschiedener Lebewesen erkunden (Wasserkreislauf).",
      description_fr:
        "Les élèves peuvent explorer l'eau comme habitat de différents êtres vivants (cycle de l'eau).",
    },
    // Zeit, Dauer und Wandel
    {
      code: "NMG.9.1",
      cycle: 1,
      kompetenzbereich: "Zeit, Dauer und Wandel",
      handlungsaspekt: null,
      description_de:
        "Die Schülerinnen und Schüler können Zeitbegriffe aufbauen und korrekt verwenden.",
      description_fr:
        "Les élèves peuvent construire des notions de temps et les utiliser correctement.",
    },
  ],
};

// ============================================================
// LEHRMITTEL (TEXTBOOKS)
// ============================================================

export const lehrmittel = [
  // Mathematik
  {
    name: "Schweizer Zahlenbuch 1",
    publisher: "Klett und Balmer",
    subject: "MA",
    cantons: ["ZH", "AG", "SG", "TG", "SH", "GR"],
    cycles: [1],
  },
  {
    name: "Schweizer Zahlenbuch 2",
    publisher: "Klett und Balmer",
    subject: "MA",
    cantons: ["ZH", "AG", "SG", "TG", "SH", "GR"],
    cycles: [1],
  },
  {
    name: "Schweizer Zahlenbuch 3",
    publisher: "Klett und Balmer",
    subject: "MA",
    cantons: ["ZH", "AG", "SG", "TG", "SH", "GR"],
    cycles: [1],
  },
  {
    name: "Schweizer Zahlenbuch 4",
    publisher: "Klett und Balmer",
    subject: "MA",
    cantons: ["ZH", "AG", "SG", "TG", "SH", "GR"],
    cycles: [2],
  },
  {
    name: "Schweizer Zahlenbuch 5",
    publisher: "Klett und Balmer",
    subject: "MA",
    cantons: ["ZH", "AG", "SG", "TG", "SH", "GR"],
    cycles: [2],
  },
  {
    name: "Schweizer Zahlenbuch 6",
    publisher: "Klett und Balmer",
    subject: "MA",
    cantons: ["ZH", "AG", "SG", "TG", "SH", "GR"],
    cycles: [2],
  },
  {
    name: "mathbuch 1",
    publisher: "Schulverlag plus",
    subject: "MA",
    cantons: ["BE", "FR", "SO", "VS"],
    cycles: [3],
  },
  {
    name: "mathbuch 2",
    publisher: "Schulverlag plus",
    subject: "MA",
    cantons: ["BE", "FR", "SO", "VS"],
    cycles: [3],
  },
  // Französisch
  {
    name: "Mille feuilles 3",
    publisher: "Schulverlag plus",
    subject: "F",
    cantons: ["ZH", "BE", "LU", "AG"],
    cycles: [2],
  },
  {
    name: "Mille feuilles 4",
    publisher: "Schulverlag plus",
    subject: "F",
    cantons: ["ZH", "BE", "LU", "AG"],
    cycles: [2],
  },
  {
    name: "Mille feuilles 5",
    publisher: "Schulverlag plus",
    subject: "F",
    cantons: ["ZH", "BE", "LU", "AG"],
    cycles: [2],
  },
  {
    name: "Mille feuilles 6",
    publisher: "Schulverlag plus",
    subject: "F",
    cantons: ["ZH", "BE", "LU", "AG"],
    cycles: [2],
  },
  {
    name: "dis donc! 5",
    publisher: "Lehrmittelverlag Zürich",
    subject: "F",
    cantons: ["ZH", "SG", "TG", "SH"],
    cycles: [2],
  },
  {
    name: "dis donc! 6",
    publisher: "Lehrmittelverlag Zürich",
    subject: "F",
    cantons: ["ZH", "SG", "TG", "SH"],
    cycles: [2],
  },
  {
    name: "dis donc! 7",
    publisher: "Lehrmittelverlag Zürich",
    subject: "F",
    cantons: ["ZH", "SG", "TG", "SH"],
    cycles: [3],
  },
  {
    name: "dis donc! 8",
    publisher: "Lehrmittelverlag Zürich",
    subject: "F",
    cantons: ["ZH", "SG", "TG", "SH"],
    cycles: [3],
  },
  {
    name: "dis donc! 9",
    publisher: "Lehrmittelverlag Zürich",
    subject: "F",
    cantons: ["ZH", "SG", "TG", "SH"],
    cycles: [3],
  },
  // Deutsch
  {
    name: "Die Sprachstarken 2",
    publisher: "Klett und Balmer",
    subject: "D",
    cantons: ["ZH", "AG", "SG", "TG"],
    cycles: [1],
  },
  {
    name: "Die Sprachstarken 3",
    publisher: "Klett und Balmer",
    subject: "D",
    cantons: ["ZH", "AG", "SG", "TG"],
    cycles: [1],
  },
  {
    name: "Die Sprachstarken 4",
    publisher: "Klett und Balmer",
    subject: "D",
    cantons: ["ZH", "AG", "SG", "TG"],
    cycles: [2],
  },
  {
    name: "Die Sprachstarken 5",
    publisher: "Klett und Balmer",
    subject: "D",
    cantons: ["ZH", "AG", "SG", "TG"],
    cycles: [2],
  },
  {
    name: "Die Sprachstarken 6",
    publisher: "Klett und Balmer",
    subject: "D",
    cantons: ["ZH", "AG", "SG", "TG"],
    cycles: [2],
  },
  // Englisch
  {
    name: "Young World 1",
    publisher: "Klett und Balmer",
    subject: "E",
    cantons: ["ZH", "AG", "SG", "BE", "LU"],
    cycles: [2],
  },
  {
    name: "Young World 2",
    publisher: "Klett und Balmer",
    subject: "E",
    cantons: ["ZH", "AG", "SG", "BE", "LU"],
    cycles: [2],
  },
  {
    name: "Young World 3",
    publisher: "Klett und Balmer",
    subject: "E",
    cantons: ["ZH", "AG", "SG", "BE", "LU"],
    cycles: [2],
  },
  {
    name: "Young World 4",
    publisher: "Klett und Balmer",
    subject: "E",
    cantons: ["ZH", "AG", "SG", "BE", "LU"],
    cycles: [2],
  },
  // NMG
  {
    name: "NaTech 1-2",
    publisher: "Schulverlag plus",
    subject: "NMG",
    cantons: ["BE", "FR", "SO"],
    cycles: [1],
  },
  {
    name: "NaTech 3-4",
    publisher: "Schulverlag plus",
    subject: "NMG",
    cantons: ["BE", "FR", "SO"],
    cycles: [1, 2],
  },
  {
    name: "NaTech 5-6",
    publisher: "Schulverlag plus",
    subject: "NMG",
    cantons: ["BE", "FR", "SO"],
    cycles: [2],
  },
];

// ============================================================
// SEED FUNCTION
// ============================================================

import { PrismaClient } from "@prisma/client";

export async function seedCurriculum(prisma: PrismaClient) {
  console.log("📚 Seeding curriculum data...");

  // 1. Create curricula
  console.log("   Creating curricula...");
  const createdCurricula: Record<string, string> = {};
  for (const curriculum of curricula) {
    const created = await prisma.curriculum.upsert({
      where: { code: curriculum.code },
      update: {
        name_de: curriculum.name_de,
        name_fr: curriculum.name_fr,
        name_it: curriculum.name_it,
        region: curriculum.region,
      },
      create: curriculum,
    });
    createdCurricula[curriculum.code] = created.id;
    console.log(`   ✓ ${curriculum.name_de}`);
  }

  // 2. Create LP21 subjects (with colors and icons)
  console.log("   Creating LP21 subjects...");
  const createdSubjects: Record<string, string> = {};
  for (const subject of lp21Subjects) {
    const created = await prisma.curriculumSubject.upsert({
      where: {
        curriculum_id_code: {
          curriculum_id: createdCurricula["LP21"],
          code: subject.code,
        },
      },
      update: {
        name_de: subject.name_de,
        name_fr: subject.name_fr,
        name_it: subject.name_it,
        color: subject.color,
        icon: subject.icon,
      },
      create: {
        code: subject.code,
        name_de: subject.name_de,
        name_fr: subject.name_fr,
        name_it: subject.name_it,
        color: subject.color,
        icon: subject.icon,
        curriculum_id: createdCurricula["LP21"],
      },
    });
    createdSubjects[subject.code] = created.id;
    console.log(`   ✓ ${subject.code}: ${subject.name_de}`);
  }

  // 3. Create competencies
  console.log("   Creating LP21 competencies...");
  let competencyCount = 0;
  for (const [subjectCode, competencies] of Object.entries(lp21Competencies)) {
    const subjectId = createdSubjects[subjectCode];
    if (!subjectId) continue;

    for (const comp of competencies) {
      await prisma.curriculumCompetency.upsert({
        where: { code: comp.code },
        update: {
          description_de: comp.description_de,
          description_fr: comp.description_fr,
          cycle: comp.cycle,
          kompetenzbereich: comp.kompetenzbereich,
          handlungsaspekt: comp.handlungsaspekt,
          anforderungsstufe: comp.anforderungsstufe,
        },
        create: {
          code: comp.code,
          description_de: comp.description_de,
          description_fr: comp.description_fr,
          cycle: comp.cycle,
          kompetenzbereich: comp.kompetenzbereich,
          handlungsaspekt: comp.handlungsaspekt,
          anforderungsstufe: comp.anforderungsstufe,
          subject_id: subjectId,
        },
      });
      competencyCount++;
    }
  }
  console.log(`   ✓ Created ${competencyCount} competencies`);

  // 4. Create Lehrmittel
  console.log("   Creating Lehrmittel (textbooks)...");
  for (const lm of lehrmittel) {
    await prisma.lehrmittel.upsert({
      where: {
        id: `lehrmittel-${lm.name.toLowerCase().replace(/\s+/g, "-")}`,
      },
      update: {
        publisher: lm.publisher,
        subject: lm.subject,
        cantons: lm.cantons,
        cycles: lm.cycles,
      },
      create: {
        id: `lehrmittel-${lm.name.toLowerCase().replace(/\s+/g, "-")}`,
        name: lm.name,
        publisher: lm.publisher,
        subject: lm.subject,
        cantons: lm.cantons,
        cycles: lm.cycles,
      },
    });
  }
  console.log(`   ✓ Created ${lehrmittel.length} textbooks`);

  // 5. Create Transversal Competencies
  console.log("   Creating transversal competencies...");
  for (const tc of transversalCompetencies) {
    await prisma.transversalCompetency.upsert({
      where: { code: tc.code },
      update: {
        category: tc.category,
        name_de: tc.name_de,
        name_fr: tc.name_fr,
        description_de: tc.description_de,
        description_fr: tc.description_fr,
        icon: tc.icon,
        color: tc.color,
      },
      create: tc,
    });
  }
  console.log(`   ✓ Created ${transversalCompetencies.length} transversal competencies`);

  // 6. Create BNE Themes
  console.log("   Creating BNE themes...");
  for (const bne of bneThemes) {
    await prisma.bneTheme.upsert({
      where: { code: bne.code },
      update: {
        name_de: bne.name_de,
        name_fr: bne.name_fr,
        description_de: bne.description_de,
        description_fr: bne.description_fr,
        sdg_number: bne.sdg_number,
        icon: bne.icon,
        color: bne.color,
      },
      create: bne,
    });
  }
  console.log(`   ✓ Created ${bneThemes.length} BNE themes`);

  console.log("✅ Curriculum seed completed!");
}
