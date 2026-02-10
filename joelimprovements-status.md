# Joel Improvements - Audit & Status

## DONE (lines 1-25)

### Titel Page (lines 1-5) - ALL DONE

- [x] L2: "Alle Zyklen" Option ersetzt durch "Zyklus wählen…" / "Fach wählen…"
- [x] L3: Sprachvarianten-Dropdown ersetzt durch Kompetenzen-Selector
- [x] L4: SwissMade rot komplett gelöscht aus TrustBar
- [x] L5: Empfohlene Materialien laden jetzt echte Materialien via API

### Hilfe Center (lines 7-10) - ALL DONE

- [x] L8: FAQ-Tab-Farben angepasst (softer: bg-primary-light statt solid)
- [x] L9: Doppelpfeile bei Schnelleinstieg entfernt (ChevronRight-Icon reicht)
- [x] L10: Schnelleinstieg-Text voll ausgeschrieben

### Allgemein (lines 12-22) - 7/10 DONE

- [x] L13: Cursor pointer auf alle klickbaren Elemente (global CSS)
- [x] L14: FormSelect-Dropdown abgerundet (rounded-full)
- [x] L15: Alle URL-Pfade auf Deutsch umbenannt (17 Route-Ordner)
- [x] L17: ScrollToTop-Button auf allen Seiten (globale Komponente im Layout)
- [x] L18: Keine ß in Content-Text (nur in erklärenden Referenzen)
- [x] L20: Fehlermeldungen lokalisiert (common.errors mit 7 Keys)
- [x] L22: Kaufstornierung/Widerrufsrecht in AGB dokumentiert

### Urheberrechtlicher Leitfaden (lines 24-25) - DONE

- [x] L25: Inhalt-Navigation als Sidebar links (sticky, scroll-spy, responsive)

---

## ERLEDIGT - Nachträglich gefixt (3 Items)

### AG-L16: Hintergrundfarben einheitlich machen - DONE

- Impressum Disclaimer von `bg-bg-secondary` → `bg-surface` (konsistent mit allen anderen Karten auf der Seite)
- Pattern standardisiert: Content-Karten = `bg-surface`, CTA-Sektionen = `bg-bg-secondary`

### AG-L19: ALLE Dropdowns rund machen - DONE

11 Dropdowns auf `rounded-full` aktualisiert:

- LocaleSwitcher (`rounded-md` → `rounded-full`)
- Kontakt-Formular Subject (`rounded-lg` → `rounded-full`)
- Materialien Sort (`rounded-lg` → `rounded-full`)
- Admin Users Role (`rounded-lg` → `rounded-full`)
- Bundle Upload Subject + Cycle (`rounded-xl` → `rounded-full`)
- EnhancedCurriculumSelector Canton (`rounded-xl` → `rounded-full`)
- Material Report Reason (`.input` + `rounded-full`)
- Settings Teaching Experience (`.input` + `rounded-full`)
- Settings Language (`.input` + `rounded-full`)
- Seller Comments Filter (`.input` + `rounded-full`)

### AG-L21: Kantone vervollständigen - DONE

- EnhancedCurriculumSelector von 13 → 26 Kantone (alle alphabetisch sortiert mit Kantonskürzel)
- `lib/validations/user.ts` hatte bereits alle 26 korrekt

---

## NICHT BEARBEITET - Restliche Segmente (lines 27-165)

### Impressum (lines 27-31)

- [ ] L28: GmbH nachtragen
- [ ] L29: Version update (evt)
- [ ] L30: Light mode Inselfarben gleich machen
- [ ] L31: Kontakt Currico Link führt nach Mainpage

### Cookie-Richtlinien (line 33)

- [ ] L33: Überprüfung der Cookie-Richtlinien

### Seller Levels (lines 35-39)

- [ ] L36: "So sammelst du Punkte" Raster einheitlich auf gleiche Höhe
- [ ] L37: Lock Tier Upgrade nur bei bestimmten Voraussetzungen (Anzahl Downloads/Uploads)
- [ ] L38: Namen von Leveln überarbeiten
- [ ] L39: Punkte/Level-Aufstieg überarbeiten

### Verifizierter Verkäufer (lines 41-43)

- [ ] L42: "Keine offenen Meldungen" Kriterium muss raus
- [ ] L43: Text verschwimmen wenn man darüber hovert

### Materialien (lines 45-65)

- [ ] L46: Entweder Profil ODER Materialien darstellen
- [ ] L47: Ersteller als Default ausschalten, "Ersteller" zu "Profil" ändern
- [ ] L48: Suchleiste bei Profilen: "nach Lehrpersonen" → "nach Profilen suchen"
- [ ] L49: Aktive Filter Aufpoppen verbessern
- [ ] L50: Ersteller + Zyklus/Fachbereich: auch Ersteller anzeigen die das anbieten
- [ ] L51: Fachbereich + Zyklus Filter nicht resetten wenn im gleichen Zyklus
- [ ] L53: ">" aus Preisoptionen rausnehmen
- [ ] L54: OneNote als Formatoption
- [ ] L55: Andere Formate als Option hinzufügen
- [ ] L56: Formate: kein blauer Punkt wenn ausgewählt (wie alle anderen)
- [ ] L57: Hover-Effekt bei Filtern verbessern und einheitlich machen
- [ ] L58: Profil anklicken führt zu Error - FIX
- [ ] L59: Text in Suchleiste verbessern wenn Materialien ausgewählt
- [ ] L60: Per Default nur Materialien ausgewählt (nicht Profile)
- [ ] L61: Upload-Button hinzufügen
- [ ] L62: Nach Kantonen filtern können
- [ ] L63: Fuzzy-Match Suche für Materialien
- [ ] L64: Aktive Filter nur rechts unter "Gefundene Materialien" (nicht links in der Bar)
- [ ] L65: Filter-Funktion überarbeiten (Zyklus/Tab-spezifische Suche)

### About Us (lines 67-69)

- [ ] L68: Ganze Seite überarbeiten und persönlicher gestalten
- [ ] L69: Bilder überarbeiten und einheitlicher machen

### Kontakt (lines 71-75)

- [ ] L72: Grüner Kasten rechts löschen
- [ ] L73: E-Mail-Adresse "example" ändern zu "Max Muster"
- [ ] L74: "Schnelle Antworten gesucht" → Verlinkung nach Hilfe, ganz nach oben
- [ ] L75: "Worum geht es": Widerruf/Rückgabe als Option hinzufügen

### Login (lines 77-83)

- [ ] L78: Weiterleitung anpassen
- [ ] L79: "Vergessenes Passwort" Seite/Link mit E-Mail erstellen
- [ ] L80: Google-Anmeldung → direkt zum Profil, nicht zum Login
- [ ] L81: Google-Anmeldung überarbeiten
- [ ] L82: Erneute Google-Anmeldung → Zwischenfenster
- [ ] L83: "Zurück zur Startseite" sichtbar ohne Scrollen

### Accounts (lines 85-112)

- [ ] L86: "Profil vervollständigen" nicht in Übersicht anzeigen
- [ ] L87: Profilbild hochladen/löschen überarbeiten + Doku für Simon
- [ ] L88: Profilbilder: JPG, PNG, WebP erlaubt + Grössenlimite
- [ ] L89: "Wichtig" aus E-Mail-Verifizierung rausnehmen
- [ ] L90: Einstellungen-Profil: Überschneidungen von Text und Emblem
- [ ] L91: Speichern von Änderungen verschönern
- [ ] L92: Navigationsbar Farben und ausgewählte Tags überarbeiten
- [ ] L93: Wunschliste: "Materialien entdecken" Button oben rechts
- [ ] L94: Fächer im Profil schöner darstellen (LP21-Farben)
- [ ] L95: Kanton aus Kontakt raus, im Profil nach oben verschieben
- [ ] L96: "Bevorzugte Sprache" entfernen im Profil
- [ ] L97: "Darstellung" raus aus Einstellungen
- [ ] L98: Konto Datenexport muss weg
- [ ] L99: "Konto löschen" überarbeiten
- [ ] L100: "Profil vervollständigen" überarbeiten + Buttons
- [ ] L101: Gefolgte Profile → Profilansicht bei Klick, "Alle" zeigt alle
- [ ] L102: "Gefolgte" zu "Followed" wechseln
- [ ] L103: "Neues Material" und "Material entdecken" löschen
- [ ] L104: Buttons in Übersicht einheitlich machen
- [ ] L105: Profil-Namenlänge auf 32 limitieren
- [ ] L106: Uploads auch in Übersicht unter "Meine Uploads" anzeigen
- [ ] L107: Mitteilungen als Tab in der Profil-Navigationsbar
- [ ] L108: Man kann sich nicht selber folgen
- [ ] L109: Suchfunktion bei Uploads, Wunschliste, Bibliothek
- [ ] L110: "Meine Materialien bearbeiten" → Error 404 FIX
- [ ] L111: "Link zur Vorschau" Button bei Meine Materialien löschen
- [ ] L112: Meine Materialien sortieren möglich machen

### Upload (lines 114-134)

- [ ] L115: Titel-Limite auf 64 Zeichen
- [ ] L116: Kompetenz-Auswahl im gleichen Style wie Zyklus/Fach
- [ ] L117: Maximal 5 Kompetenzen auswählen
- [ ] L118: Kostenpflichtig: Preis muss > 1 sein
- [ ] L119: 0 darf nicht als kostenpflichtig durchgehen
- [ ] L120: Kosten nur in 0.50-Schritten, automatisch runden
- [ ] L121: Vorschaubild auf 5 MB limitieren
- [ ] L122: Fehlermeldung "Profil vervollständigen" → Link zum Profil
- [ ] L123: Alle Fehlermeldungen mit Link zum Problem + Rechtschreibung
- [ ] L124: Dokumente in Überprüfung in Uploads anzeigen
- [ ] L125: Fächer-Abkürzungen mindestens 2 Buchstaben
- [ ] L126: Mehrere Dokumente vom gleichen Typ uploaden
- [ ] L127: "Zurück zum Profil" Link richtig verlinken
- [ ] L128: Tag von Material-Typ angleichen
- [ ] L129: Zwei verschiedene Material-Typen nicht erlauben (nur ein Typ)
- [ ] L130: Nur eine Datei aufs Mal hochladen
- [ ] L131: Vor Veröffentlichung: Übersicht wie es aussehen wird
- [ ] L132: "Verifizierte Dokumente" → "Geprüft" umbenennen
- [ ] L133: Downloads überarbeiten (funktioniert noch nicht)
- [ ] L134: Einnahmen total anzeigen (nicht monatlich)

### Vorschau (lines 136-148)

- [ ] L137: Tags der hochgeladenen Dokumente überarbeiten
- [ ] L138: Vorschau: Wasserzeichen statt Verschwimmen
- [ ] L139: Bewertung-Button an Style angleichen
- [ ] L140: "Material melden" Button grösser
- [ ] L141: Bewertung-Look überarbeiten
- [ ] L142: Bewertungen: Profil des Bewertenden verlinken
- [ ] L143: Kommentar-Bearbeiten Button/Dropdown überarbeiten
- [ ] L144: Bewertungen-Overview verkleinern/verbessern
- [ ] L145: Kommentare Daumen-hoch verbessern/ersichtlicher
- [ ] L146: Kommentar-Bearbeitung: Speicherung ohne Refresh
- [ ] L147: Kommentare mit Bewertungen verschmelzen (ein Segment)
- [ ] L148: Verkäufer des Dokuments kann nicht bewerten

### Öffentliches Profil (lines 150-151)

- [ ] L151: Profilseite überarbeiten und funktionierend machen

### Become a Seller (lines 153-154)

- [ ] L154: Stripe Konto einrichten Button + Bestätigungsbutton überarbeiten

### Stripe Konto (lines 156-159)

- [ ] L157: Einstellungen verbessern
- [ ] L158: Weniger Angaben einrichten
- [ ] L159: Rückkehr von Stripe → Buttons überarbeiten/funktionierend

### Benachrichtigungen (lines 161-164)

- [ ] L162: Autoren-Benachrichtigungen
- [ ] L163: Newsletter
- [ ] L164: Alles (komplett überarbeiten)
