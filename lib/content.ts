/**
 * ===========================================
 * EASYLEHRER WEBSITE CONTENT / TEXT MANAGEMENT
 * ===========================================
 *
 * This file contains ALL text content for the EasyLehrer website.
 * Edit the text here and it will update across the website.
 *
 * STRUCTURE:
 * - common: Shared text used across multiple pages (header, footer, brand)
 * - homePage: Landing page (app/page.tsx)
 * - loginPage: Login page (app/login/page.tsx)
 * - registerPage: Registration page (app/register/page.tsx)
 * - resourcesPage: Resources listing page (app/resources/page.tsx)
 * - schoolDashboard: School admin dashboard (app/dashboard/school/page.tsx)
 * - sellerDashboard: Seller dashboard (app/dashboard/seller/page.tsx)
 */

export const content = {
  // ============================================
  // COMMON - Used across multiple pages
  // ============================================
  common: {
    brand: {
      logoText: "EL",                              // Logo initials in the circle
      name: "EasyLehrer",                          // Brand name
      tagline: "Bildungsplattform Schweiz",        // Tagline under brand name
    },

    navigation: {
      resources: "Ressourcen",
      forSchools: "Fur Schulen",
      aboutUs: "Uber uns",
      contact: "Kontakt",
      login: "Anmelden",
      register: "Registrieren",
      dashboard: "Dashboard",
      profile: "Profil",
    },

    footer: {
      brandDescription: "Die offizielle Plattform fur Unterrichtsmaterial von Schweizer Lehrpersonen.",

      platformSection: {
        title: "Plattform",
        resources: "Ressourcen",
        forSchools: "Fur Schulen",
        pricing: "Preise",
      },

      infoSection: {
        title: "Information",
        aboutUs: "Uber uns",
        contact: "Kontakt",
        help: "Hilfe",
      },

      legalSection: {
        title: "Rechtliches",
        privacy: "Datenschutz",
        terms: "AGB",
        imprint: "Impressum",
      },

      copyright: "2026 EasyLehrer. Alle Rechte vorbehalten.",
      initiative: "Eine Initiative fur Schweizer Bildung",
    },

    buttons: {
      viewAll: "Alle anzeigen",
      view: "Ansehen",
      edit: "Bearbeiten",
      cancel: "Abbrechen",
      apply: "Anwenden",
      reset: "Zurucksetzen",
      backToHome: "Zuruck zur Startseite",
    },
  },

  // ============================================
  // HOME PAGE (app/page.tsx)
  // ============================================
  homePage: {
    hero: {
      badge: "Offizielle Bildungsplattform",
      title: "Qualitatsgesicherte Unterrichtsmaterialien fur Schweizer Schulen",
      description: "Entdecken Sie professionelle Lehrmittel, entwickelt von Lehrpersonen und abgestimmt auf den Lehrplan 21. Vertrauenswurdig, gepruft, sofort einsetzbar.",
      primaryButton: "Materialien durchsuchen",
      secondaryButton: "Mehr erfahren",
      trustLabel: "Vertraut von Bildungsinstitutionen",
      trustBadges: {
        lehrplan21: "Lehrplan 21 konform",
        qualityChecked: "Qualitatsgepruft",
        swissStandard: "Schweizer Standard",
      },
    },

    categories: {
      allSubjects: "Alle Facher",
      science: "Naturwissenschaften",
      languages: "Sprachen",
      math: "Mathematik",
      arts: "Gestalten",
      history: "Geschichte",
      music: "Musik",
    },

    featuredResources: {
      title: "Empfohlene Materialien",
      description: "Von Experten ausgewahlt und qualitatsgepruft",
      viewAllMobile: "Alle Materialien anzeigen",

      // Resource Card 1
      card1: {
        category: "Naturwissenschaften",
        cycle: "Zyklus 2",
        title: "Naturkunde Experimente",
        description: "Praxisnahe Experimente und Arbeitsblatter fur den naturwissenschaftlichen Unterricht.",
        documents: "12 Dokumente",
        rating: "4.9",
      },

      // Resource Card 2
      card2: {
        category: "Sprachen",
        cycle: "Zyklus 1-2",
        title: "Deutsch Lesetraining",
        description: "Strukturierte Lesetexte mit differenzierten Aufgaben fur verschiedene Niveaus.",
        documents: "8 Dokumente",
        rating: "4.8",
      },

      // Resource Card 3
      card3: {
        category: "Mathematik",
        cycle: "Zyklus 1",
        title: "Mathematik Grundlagen",
        description: "Systematische Ubungsblatter fur den Aufbau mathematischer Grundkompetenzen.",
        documents: "15 Dokumente",
        rating: "4.7",
      },
    },

    features: {
      title: "Warum EasyLehrer?",
      description: "Eine Plattform, die den Anspruchen von Schweizer Bildungsinstitutionen gerecht wird.",

      feature1: {
        title: "Qualitatsgepruft",
        description: "Jedes Material wird von Fachexperten auf padagogische Qualitat und Lehrplan-Konformitat gepruft.",
      },

      feature2: {
        title: "Lehrplan 21 konform",
        description: "Alle Ressourcen sind nach Kompetenzbereichen und Zyklen des Lehrplan 21 kategorisiert.",
      },

      feature3: {
        title: "Schullizenzen",
        description: "Institutionelle Lizenzen ermoglichen die gemeinsame Nutzung von Materialien im gesamten Kollegium.",
      },
    },

    stats: {
      materials: { value: "500+", label: "Geprufte Materialien" },
      teachers: { value: "1'000+", label: "Aktive Lehrpersonen" },
      schools: { value: "50+", label: "Partnerschulen" },
      satisfaction: { value: "98%", label: "Zufriedenheitsrate" },
    },

    cta: {
      title: "Bereit, Ihren Unterricht zu bereichern?",
      description: "Registrieren Sie sich kostenlos und erhalten Sie Zugang zu hochwertigen Unterrichtsmaterialien.",
      primaryButton: "Kostenlos registrieren",
      secondaryButton: "Ressourcen durchsuchen",
    },
  },

  // ============================================
  // LOGIN PAGE (app/login/page.tsx)
  // ============================================
  loginPage: {
    title: "Willkommen zuruck",
    subtitle: "Melden Sie sich bei Ihrem Konto an",

    form: {
      emailLabel: "E-Mail-Adresse",
      emailPlaceholder: "ihre.email@example.com",
      emailError: "Bitte geben Sie eine gultige E-Mail-Adresse ein",

      passwordLabel: "Passwort",
      passwordPlaceholder: "Ihr Passwort",
      forgotPassword: "Vergessen?",

      rememberMe: "Angemeldet bleiben",
      submitButton: "Anmelden",
    },

    divider: "Oder fortfahren mit",

    oauth: {
      google: "Mit Google anmelden",
      github: "Mit GitHub anmelden",
    },

    register: {
      prompt: "Noch kein Konto?",
      link: "Kostenlos registrieren",
    },
  },

  // ============================================
  // REGISTER PAGE (app/register/page.tsx)
  // ============================================
  registerPage: {
    title: "Konto erstellen",
    subtitle: "Werden Sie Teil der EasyLehrer Plattform",

    accountTypes: {
      teacher: "Lehrperson",
      school: "Schule / Institution",
    },

    form: {
      // Name field
      nameLabel: {
        teacher: "Vollstandiger Name",
        school: "Name der Institution",
      },
      namePlaceholder: {
        teacher: "Maria Schmidt",
        school: "Primarschule Musterstadt",
      },

      // Email field
      emailLabel: "E-Mail-Adresse",
      emailPlaceholder: "ihre.email@example.com",
      emailError: "Bitte geben Sie eine gultige E-Mail-Adresse ein",

      // Canton field
      cantonLabel: "Kanton",
      cantonPlaceholder: "Kanton wahlen",
      cantons: {
        ZH: "Zurich",
        BE: "Bern",
        LU: "Luzern",
        UR: "Uri",
        SZ: "Schwyz",
        OW: "Obwalden",
        NW: "Nidwalden",
        GL: "Glarus",
        ZG: "Zug",
        FR: "Freiburg",
        SO: "Solothurn",
        BS: "Basel-Stadt",
        BL: "Basel-Landschaft",
        SH: "Schaffhausen",
        AR: "Appenzell Ausserrhoden",
        AI: "Appenzell Innerrhoden",
        SG: "St. Gallen",
        GR: "Graubunden",
        AG: "Aargau",
        TG: "Thurgau",
        TI: "Tessin",
        VD: "Waadt",
        VS: "Wallis",
        NE: "Neuenburg",
        GE: "Genf",
        JU: "Jura",
      },

      // Subjects (for teachers)
      subjectsLabel: "Unterrichtsfacher",
      subjects: ["Mathematik", "Deutsch", "Englisch", "Franzosisch", "NMG", "BG", "Musik", "Sport"],

      // Cycles (for teachers)
      cyclesLabel: "Unterrichtete Zyklen",
      cycles: ["Zyklus 1", "Zyklus 2", "Zyklus 3"],

      // Password fields
      passwordLabel: "Passwort",
      passwordPlaceholder: "Mindestens 8 Zeichen",
      passwordError: "Passwort muss mindestens 8 Zeichen lang sein",

      confirmPasswordLabel: "Passwort bestatigen",
      confirmPasswordPlaceholder: "Passwort wiederholen",
      confirmPasswordError: "Passworter stimmen nicht uberein",

      // Terms
      termsText: "Ich akzeptiere die",
      termsLink: "Allgemeinen Geschaftsbedingungen",
      termsAnd: "und die",
      privacyLink: "Datenschutzerklarung",

      submitButton: "Konto erstellen",
    },

    divider: "Oder registrieren mit",

    oauth: {
      google: "Mit Google registrieren",
      github: "Mit GitHub registrieren",
    },

    login: {
      prompt: "Bereits registriert?",
      link: "Anmelden",
    },
  },

  // ============================================
  // RESOURCES PAGE (app/resources/page.tsx)
  // ============================================
  resourcesPage: {
    breadcrumb: {
      home: "Startseite",
    },

    header: {
      title: "Unterrichtsmaterialien",
      description: "Durchsuchen Sie qualitatsgeprufte Materialien fur Ihren Unterricht",
    },

    search: {
      placeholder: "Suche nach Titel, Thema, Stichwort...",

      subjectFilter: {
        all: "Alle Facher",
        math: "Mathematik",
        german: "Deutsch",
        english: "Englisch",
        french: "Franzosisch",
        nmg: "NMG",
        arts: "Bildnerisches Gestalten",
        music: "Musik",
        sports: "Sport",
      },

      filterButton: "Filter",
    },

    advancedFilters: {
      title: "Erweiterte Filter",

      cycleFilter: {
        label: "Zyklus",
        all: "Alle Zyklen",
        cycle1: "Zyklus 1",
        cycle2: "Zyklus 2",
        cycle3: "Zyklus 3",
      },

      cantonFilter: {
        label: "Kanton",
        all: "Alle Kantone",
      },

      qualityFilter: {
        label: "Qualitat",
        all: "Alle",
        verified: "Verifiziert",
        aiChecked: "KI-Gepruft",
      },

      priceFilter: {
        label: "Preistyp",
        all: "Alle",
        free: "Kostenlos",
        paid: "Kostenpflichtig",
      },

      typeFilter: {
        label: "Ressourcentyp",
        all: "Alle",
        pdf: "PDF",
        word: "Word",
        powerpoint: "PowerPoint",
        bundle: "Bundle",
      },

      editableFilter: {
        label: "Editierbar",
        all: "Alle",
        yes: "Ja",
        no: "Nein",
      },

      applyButton: "Filter anwenden",
      resetButton: "Zurucksetzen",
    },

    results: {
      countLabel: "Ressourcen gefunden",
      sortLabel: "Sortieren:",
      sortOptions: {
        newest: "Neueste",
        popular: "Beliebteste",
        rating: "Beste Bewertung",
        priceLow: "Preis aufsteigend",
        priceHigh: "Preis absteigend",
      },
    },

    card: {
      verified: "Verifiziert",
      aiChecked: "KI-Gepruft",
      documents: "Dok.",
      free: "Gratis",
      viewButton: "Ansehen",
    },
  },

  // ============================================
  // SCHOOL DASHBOARD (app/dashboard/school/page.tsx)
  // ============================================
  schoolDashboard: {
    header: {
      subtitle: "Verwalten Sie Ihre Schule und Team-Lizenzen",
    },

    tabs: {
      members: "Team-Mitglieder",
      licenses: "Lizenzen",
      billing: "Abrechnung",
    },

    members: {
      title: "Team-Mitglieder",
      inviteButton: "+ Mitglied einladen",
      statusActive: "Aktiv",
      statusPending: "Ausstehend",
      removeButton: "Entfernen",
    },

    licenses: {
      title: "School Library",
      buyButton: "Ressourcen kaufen",
      purchasedLabel: "Gekauft:",
      usedByLabel: "Verwendet von",
      teachersLabel: "Lehrpersonen",
    },

    billing: {
      title: "Abrechnung",

      paymentMethod: {
        title: "Zahlungsmethode",
        editButton: "Bearbeiten",
        cardNumber: "---- ---- ---- 4242",
        expires: "Lauft ab 12/2027",
      },

      transactions: {
        title: "Letzte Transaktionen",
        viewAllButton: "Alle Transaktionen anzeigen",
      },
    },

    sidebar: {
      schoolInfo: {
        title: "Schul-Informationen",
        nameLabel: "Name",
        cantonLabel: "Kanton",
        emailLabel: "E-Mail",
        editButton: "Details bearbeiten",
      },

      stats: {
        title: "Statistiken",
        membersLabel: "Team-Mitglieder",
        licensesLabel: "Aktive Lizenzen",
      },
    },

    inviteModal: {
      title: "Lehrperson einladen",
      emailLabel: "E-Mail-Adresse",
      emailPlaceholder: "lehrperson@example.com",
      sendButton: "Einladung senden",
      cancelButton: "Abbrechen",
    },
  },

  // ============================================
  // SELLER DASHBOARD (app/dashboard/seller/page.tsx)
  // ============================================
  sellerDashboard: {
    header: {
      title: "Verkaufer Dashboard",
      subtitle: "Verwalten Sie Ihre Ressourcen und uberwachen Sie Ihre Verkaufe",
    },

    stats: {
      earnings: {
        title: "Netto-Einnahmen",
        subtitle: "Nach Plattformgebuhr",
      },
      downloads: {
        title: "Downloads",
        subtitle: "Alle Ressourcen",
      },
      followers: {
        title: "Follower",
        subtitle: "Folgen Ihnen",
      },
    },

    actions: {
      uploadResource: "+ Neue Ressource hochladen",
      createBundle: "+ Bundle erstellen",
    },

    tabs: {
      resources: "Meine Ressourcen",
      transactions: "Transaktionen",
    },

    resourcesTable: {
      columns: {
        title: "Titel",
        type: "Typ",
        status: "Status",
        downloads: "Downloads",
        earnings: "Einnahmen",
        actions: "Aktionen",
      },
      statusLabels: {
        verified: "Verifiziert",
        aiChecked: "KI-Gepruft",
        pending: "Ausstehend",
      },
      editButton: "Bearbeiten",
      viewButton: "Ansehen",
    },

    transactionsTable: {
      columns: {
        resource: "Ressource",
        date: "Datum",
        gross: "Bruttopreis",
        platformFee: "Plattformgebuhr",
        payout: "Ihre Auszahlung",
      },
    },
  },
};

// Type export for TypeScript support
export type Content = typeof content;
