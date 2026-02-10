# Joel Improvements - Status nach Seite

Legende: [x] = erledigt, [ ] = offen

---

## 1. Startseite (`/`)

- [x] "Alle Zyklen" Option raus → "Zyklus wählen…" / "Fach wählen…"
- [x] Sprachvarianten ersetzt durch Kompetenzen-Selector
- [x] SwissMade rot gelöscht aus TrustBar
- [x] Empfohlene Materialien laden echte Materialien via API

### Eigene Vorschläge (Startseite)

- [ ] Hero-Dropdowns haben `rounded-xl` statt `rounded-full` (inkonsistent mit globalem Dropdown-Style)
- [ ] SellerHeroSection: "70% Provision für Sie" ist hardcoded auf Deutsch — sollte über i18n laufen (`t("badge")`)
- [ ] `SUBJECT_PILL_MAP` hat "Franzosisch" ohne Umlaut — sollte "Französisch" sein (oder Code-basiert matchen)
- [ ] Kein Fallback wenn `/api/materials` keine Materialien zurückgibt — Sektion wird unsichtbar, besser: leerer Zustand mit CTA "Sei der Erste"
- [ ] Hero-Bild `hero-teachers.png` hat keinen `sizes`-Prop auf `<Image>` — verschlechtert LCP auf Mobile
- [ ] Suchformular hat kein `aria-label` auf dem `<form>` — Screenreader können es nicht identifizieren
- [ ] Search-Button zeigt auf Mobile nur das Icon ohne Text — kein `aria-label` auf dem Button
- [ ] SwissBrandSection und ValueProposition haben fast identisches Layout — könnten zu einer generischen Sektion vereinheitlicht werden
- [ ] TrustBar Items sind nicht verlinkt — z.B. "Schweizer Hosting" könnte auf Über-uns oder Datenschutz verlinken
- [ ] Kein `<meta description>` oder OpenGraph Tags spezifisch für die Startseite (SEO)
- [ ] Featured Materials zeigen keinen Rating/Bewertung — hilft Nutzern bei der Entscheidung

---

## 2. Materialien (`/materialien`)

### Suche & Darstellung

- [ ] Entweder Profil ODER Materialien darstellen (nicht beides gemischt)
- [ ] Ersteller als Default ausschalten, "Ersteller" zu "Profil" ändern
- [ ] Suchleiste bei Profilen: "nach Lehrpersonen" → "nach Profilen suchen"
- [ ] Per Default nur Materialien ausgewählt (nicht Profile)
- [ ] Text in Suchleiste verbessern wenn Materialien ausgewählt
- [ ] Fuzzy-Match Suche für Materialien
- [ ] Upload-Button auf der Materialien-Seite hinzufügen

### Filter

- [ ] Aktive Filter Aufpoppen verbessern
- [ ] Ersteller + Zyklus/Fachbereich: auch Ersteller anzeigen die das anbieten
- [ ] Fachbereich + Zyklus Filter nicht resetten wenn im gleichen Zyklus
- [ ] ">" aus Preisoptionen rausnehmen
- [ ] OneNote als Formatoption hinzufügen
- [ ] Andere Formate als Option hinzufügen
- [ ] Formate: kein blauer Punkt wenn ausgewählt (wie alle anderen Filter)
- [ ] Hover-Effekt bei Filtern verbessern und einheitlich machen
- [ ] Nach Kantonen filtern können
- [ ] Aktive Filter nur rechts unter "Gefundene Materialien" (nicht links in der Bar)
- [ ] Filter-Funktion überarbeiten (Zyklus/Tab-spezifische Suche)

### Bugs

- [ ] Profil anklicken führt zu Error → FIX

### Eigene Vorschläge (Materialien)

- [ ] Seite ist 1173 Zeilen lang — Filter-Chips, Pagination und Grid-Rendering sollten in eigene Komponenten extrahiert werden
- [ ] `getSubjectPillClass()` ist dupliziert zwischen `page.tsx` (Startseite) und `materialien/page.tsx` — in eine gemeinsame Utility-Funktion auslagern
- [ ] Hardcoded deutsche Strings in Filter-Chips: "Kostenlos", "Einzelmaterial", "Bundle", "Alle entfernen", "Zyklus" — müssen über i18n (`t()`) laufen
- [ ] Mobile-Filter-Drawer "anzeigen" Button: `{totalCount} {t("results.countLabel")} anzeigen` — "anzeigen" ist hardcoded Deutsch
- [ ] Kein `aria-label` auf den Pagination Prev/Next Buttons — nur SVG-Icons ohne Text, unzugänglich für Screenreader
- [ ] Pagination `<nav>` hat kein `aria-label="Pagination"` — Screenreader können die Navigation nicht identifizieren
- [ ] Profil-Suche auf 12 Ergebnisse limitiert ohne Pagination — bei vielen Profilen fehlen Ergebnisse
- [ ] Sortierung fehlt: kein "Beliebteste" oder "Beste Bewertung" — nur Neueste und Preis
- [ ] `priceType`-Filter hat keine "Nur kostenpflichtig" Option — nur "Kostenlos" und Max-Preis
- [ ] LP21FilterSidebar ist 1769 Zeilen — sollte in Sub-Komponenten aufgeteilt werden (ZyklusFilter, FachbereichFilter, PriceFilter, FormatFilter etc.)
- [ ] Filter-State wird bei jedem Wechsel komplett neu erstellt statt per Spread-Update — könnte zu unnötigen Re-Renders führen
- [ ] Kein URL-Encoding bei Suchbegriff in der URL — Sonderzeichen und Umlaute könnten Probleme verursachen
- [ ] `MaterialCard` bekommt keinen `rating`-Prop — Bewertungen werden auf der Materialien-Übersicht nicht angezeigt
- [ ] Kein Skeleton-Loading für Profile-Bereich — nur `MaterialGridSkeleton` vorhanden, Profile springen rein
- [ ] Mobile Filter Drawer hat keinen Focus-Trap — Tab-Navigation kann hinter den Drawer gelangen
- [ ] Kein `<meta description>` oder SEO-Tags für `/materialien` (ähnlich wie Startseite)
- [ ] Wenn beide Tabs aktiv (Materialien+Profile), wird die Gesamtzahl addiert — das kann verwirrend sein (z.B. "32 Ergebnisse" bei 30 Materialien + 2 Profile)
- [ ] Sort-Dropdown ist nur sichtbar wenn `showMaterials=true` — wenn nur Profile gezeigt werden, fehlt jede Sortier-Option
- [ ] `EmptySearchState` zeigt Vorschläge zum Zurücksetzen — aber keine konkreten Suchvorschläge basierend auf vorhandenen Materialien

---

## 3. Material-Vorschau (`/materialien/[id]`)

### Vorschau & Tags

- [ ] Tags der hochgeladenen Dokumente überarbeiten
- [ ] Vorschau: Wasserzeichen statt Verschwimmen

### Bewertungen & Kommentare

- [ ] Bewertung-Button an Style angleichen
- [ ] "Material melden" Button grösser machen
- [ ] Bewertung-Look überarbeiten
- [ ] Profil des Bewertenden verlinken (klickbar zum Profil)
- [ ] Kommentar-Bearbeiten Button/Dropdown überarbeiten
- [ ] Bewertungen-Overview verkleinern/verbessern
- [ ] Kommentare Daumen-hoch verbessern und ersichtlicher machen
- [ ] Kommentar-Bearbeitung: Speicherung ohne Refresh anzeigen
- [ ] Kommentare mit Bewertungen verschmelzen (ein Segment)
- [ ] Verkäufer des Dokuments kann nicht bewerten (Logik einbauen)

### Eigene Vorschläge (Material-Vorschau)

- [ ] Hardcoded deutsche Strings: "Material nicht gefunden", "Fehler beim Laden", "Dieses Material wird noch überprüft", "Keine Vorschau verfügbar", "PDF", "Verifiziert", "Wird überprüft", "Folge ich", "+Folgen", "Anonym", "Ähnliche Materialien" — alle in i18n auslagern
- [ ] Browser-native Dialoge (`confirm()`/`alert()`) bei Kommentar-Löschung durch i18n-fähige Modals ersetzen
- [ ] Report-Modal: Texte komplett hardcoded (Titel, Gründe, Placeholder, Buttons, Erfolgsmeldung) — benötigt eigenen i18n-Namespace
- [ ] Report-Modal schliesst nach 2 Sekunden automatisch — zu schnell, Benutzer könnte verwirrt sein
- [ ] Typ-Duplikation: Interfaces für Material, Comment, Review in mehreren Komponenten definiert — in gemeinsame `lib/types/` auslagern
- [ ] PreviewGallery: Bilder mit raw `<img>` statt Next.js `<Image>` — kein Lazy Loading, keine responsive Sizes, kein Blur-Placeholder
- [ ] Seller-Avatar mit raw `<img>` statt `<Image>` Component geladen
- [ ] Keine `aria-label` auf Download-, Wishlist-, Follow-, Report-Buttons — unzugänglich für Screenreader
- [ ] PreviewGallery Lightbox hat keinen Focus-Trap — Tab-Navigation kann hinter die Lightbox gelangen
- [ ] `window.location.href` für unauthentifizierte Redirects statt Next.js Router — inkonsistent und nicht SEO-freundlich
- [ ] Kein Duplicate-Prevention beim Melden — Benutzer können Material mehrfach hintereinander melden
- [ ] Review-Labels ("Schlecht", "Mangelhaft", "Okay", "Gut", "Ausgezeichnet") sind hardcoded — nicht lokalisierbar
- [ ] Keine Feedback wenn Download startet (`window.open()`) — kein Bestätigungs-Toast
- [ ] Kein Schema.org Markup (`Product`, `AggregateRating`, `BreadcrumbList`) — fehlende Rich Snippets in Suchmaschinen
- [ ] Redundante Datenfelder: `subject`/`subjects` und `cycle`/`cycles` — sollte normalisiert werden
- [ ] Kommentar-/Review-Like-Button State wird nach Vote nicht sofort aktualisiert — fehlendes Optimistic Update
- [ ] Magische Zahlen in PreviewGallery (50px Swipe-Threshold, 80px Thumbnail-Höhe) — als benannte Konstanten definieren

---

## 4. Hilfe (`/hilfe`)

- [x] FAQ-Tab-Farben angepasst
- [x] Doppelpfeile bei Schnelleinstieg entfernt
- [x] Schnelleinstieg-Text voll ausgeschrieben

### Eigene Vorschläge (Hilfe)

- [ ] Keine `generateMetadata()` Funktion — SEO-Metadaten, OpenGraph und Canonical URLs fehlen
- [ ] Hardcodierte E-Mail `info@currico.ch` (Zeile 194) statt aus i18n — sollte über `t("noResults.contactEmail")` gelöst werden
- [ ] FAQ-Tabs haben kein `aria-selected` Attribut — Screenreader können aktiven Tab nicht identifizieren
- [ ] Accordion-Buttons fehlt `aria-expanded` Attribut — Screenreader erkennen geöffneten Zustand nicht
- [ ] Keine Suchfunktion für FAQ — bei 30+ Fragen wäre In-App-Suche hilfreich
- [ ] Kategorie-State wird bei Tab-Wechsel / Navigation nicht gespeichert — LocalStorage-Persistierung würde helfen
- [ ] Keine `FAQPage` Schema.org-Daten — Google Featured Snippets werden nicht unterstützt

---

## 5. Urheberrecht (`/urheberrecht`)

- [x] Inhalt-Navigation als Sidebar links (sticky, scroll-spy, responsive)

### Eigene Vorschläge (Urheberrecht)

- [ ] Duplizierte Icon + Sektions-Header-Struktur (12 Sektionen gleiches Pattern) — in wiederverwendbare Komponente extrahieren
- [ ] Sticky-TOC Offset `top-24` ist hart kodiert — variiert je nach Header-Höhe, sollte dynamisch sein
- [ ] Mobile TOC verschwindet ab `lg:hidden` (1024px) — auch Tablet-Nutzer verlieren Orientierung, Toggle-Button wäre besser
- [ ] TOC-Links ohne `aria-current="page"` für aktiven Link — nur CSS-Styling, kein Screenreader-Hinweis
- [ ] Sektions-Icons (CheckCircle, XCircle etc.) haben kein `aria-hidden="true"` — werden als Inhalt für Screenreader gelesen
- [ ] "Back to Top" Link hat nur `onClick` — sollte auch echtes `<a href="#top">` sein für Keyboard-Navigation
- [ ] Kein Anker-Navigation beim Seitenladen — wenn User mit `#aiContent` kommt, öffnet Seite oben statt am Anker
- [ ] Fehlende `BreadcrumbList` Schema.org-Daten

---

## 6. Impressum (`/impressum`)

- [ ] GmbH nachtragen (Firmenform aktualisieren)
- [ ] Version update (optional)
- [ ] Light mode Inselfarben gleich machen (Farbkonsistenz)
- [ ] Kontakt Currico Link führt nach Mainpage (statt toter Link)

### Eigene Vorschläge (Impressum)

- [ ] Keine `generateMetadata()` Funktion — Impressum ist wichtig für SEO/Trust
- [ ] "Handelsname:" hardcoded statt i18n — sollte über `t("company.tradeNameLabel")` kommen
- [ ] Person-Array `["p1", "p2", "p3"]` ist magisch — sollte Konstante oder aus Config geladen werden
- [ ] Icons (Building2, Mail, Globe, Scale, Users) haben kein `aria-hidden="true"` — werden als Inhalt gelesen
- [ ] E-Mail-Links ohne `title`-Attribut — Tooltip für Nutzer fehlt
- [ ] `grid-cols-2` auf Mobile führt zu sehr schmalen Spalten — sollte `grid-cols-1 md:grid-cols-2` sein
- [ ] Disclaimer-Sektionen nutzen `<div>` statt `<section>` mit `aria-labelledby` — fehlende Semantik
- [ ] Keine `Organization`/`LocalBusiness` Schema.org-Daten — für Suchmaschinen-Vertrauen
- [ ] Links zu anderen Legal-Seiten fehlen (wie bei Cookie-Seite vorhanden)

---

## 7. Cookie-Richtlinien (`/cookie-richtlinien`)

- [ ] Inhalt überprüfen (stimmen die Angaben noch?)

### Eigene Vorschläge (Cookie-Richtlinien)

- [ ] Keine `generateMetadata()` Funktion — Cookie Policy ist wichtig für GDPR/Compliance SEO
- [ ] Hardcoded Cookie-Namen `["consent", "session", "csrf", "locale"]` — sollten aus zentraler Konstante kommen (Single Source of Truth mit `CookieConsent.tsx`)
- [ ] Cookie-Listen nutzen `<div>` statt `<dl>`/`<dt>`/`<dd>` — fehlende Semantik für Screenreader
- [ ] Analytics-Cookie-Informationen zu vage ("Um unsere Dienstleistungen zu verbessern") — welche Tools genau? (Sentry, etc.)
- [ ] Keine Table of Contents — im Gegensatz zu Urheberrecht-Seite, bei 5+ Sektionen wäre TOC hilfreich
- [ ] Related-Links Section nutzt `<div>` statt `<nav>` — fehlende Navigation-Semantik
- [ ] Keine visuelle Unterscheidung zwischen Cookie-Typen — Essential vs. Analytics sollten farblich getrennt sein

---

## 8. Verkäufer-Stufen (`/verkaeufer-stufen`)

- [ ] "So sammelst du Punkte" Raster einheitlich auf gleiche Höhe bringen
- [ ] Lock Tier Upgrade nur bei bestimmten Voraussetzungen (Anzahl Downloads/Uploads)
- [ ] Namen von Leveln überarbeiten
- [ ] Punkte/Level-Aufstieg-System überarbeiten

### Eigene Vorschläge (Verkäufer-Stufen)

- [ ] Hardcoded deutsche Strings ("1 Material", "5 Materialien", "25 Downloads", "1 Bewertung" etc.) — sollten über i18n laufen
- [ ] Hardcoded "Level" Text in Badge — nicht lokalisierbar
- [ ] Layout-Metadata nutzt Canonical URL "seller-levels" statt "verkaeufer-stufen" — SEO-Fehler
- [ ] `tipIcons` Array wird per Index gemappt — fragile Zuordnung, bricht wenn Array-Länge ändert
- [ ] Keine visuelle Hierarchie zwischen aktuellem und angestrebtem Level — alle Level gleich dargestellt
- [ ] Breadcrumb zeigt nur Seitentitel ohne Home-Link — fehlende Hierarchie
- [ ] Keine Schema.org-Daten für Punkte-System

---

## 9. Verifizierter Verkäufer (`/verifizierter-verkaeufer`)

- [ ] "Keine offenen Meldungen" Kriterium entfernen
- [ ] Text-Blur beim Hover fixen (Text muss scharf und lesbar bleiben)

### Eigene Vorschläge (Verifizierter Verkäufer)

- [ ] Keine Validierung dass `VERIFIED_SELLER_CRITERIA` genau 5 Items hat passend zu `criteriaIcons` Array — Icon-Text-Mismatch möglich
- [ ] Benefits-Section nutzt inline SVG-Icons statt lucide-react wie andere Sektionen — inkonsistentes Icon-System
- [ ] Nur 3 Benefits gelistet — fühlt sich unvollständig an, Nutzer wollen mehr Detail was "verifiziert" praktisch bedeutet
- [ ] "How it works" hat 3 kurze Absätze ohne visuelle Differenzierung oder Icons — schwer zu scannen
- [ ] Kein Vergleich mit nicht-verifizierten Verkäufern — Nutzer sehen keinen konkreten Unterschied
- [ ] Metadata in Layout nutzt falschen Canonical-Pfad

---

## 10. Über uns (`/ueber-uns`)

- [ ] Ganze Seite überarbeiten und persönlicher gestalten
- [ ] Bilder überarbeiten und einheitlicher machen

### Eigene Vorschläge (Über uns)

- [ ] `Link` aus "next/link" importiert statt aus `@/i18n/navigation` — umgeht Locale-Handling, kann Mehrsprachigkeit brechen
- [ ] Layout-Metadata nutzt Canonical "/about" statt "/ueber-uns" — SEO-Fehler
- [ ] Hardcoded SVG-Icons für Values statt lucide-react — inkonsistentes Icon-System
- [ ] Persönliches Zitat (Kursiv-Serif) ohne klaren Kontext wer spricht — mehrdeutig
- [ ] Values-Section nutzt sehr generische Beschreibungen — nicht differenziert von anderen EdTech-Plattformen
- [ ] Kein CTA-Button am Seitenanfang — erst ganz unten nach viel Text
- [ ] Kein Schema.org `Organization` Markup — fehlende strukturierte Daten
- [ ] Meta-Description zu generisch — sollte spezifischer für Schweizer Kontext sein
- [ ] Keine Social-Media-Links oder Kontaktmöglichkeiten beim Team — Nutzer können Team nicht kontaktieren
- [ ] Kein Fallback wenn Team-Member-Bilder nicht laden

---

## 11. Kontakt (`/kontakt`)

- [ ] Grüner Kasten rechts löschen
- [ ] E-Mail-Adresse "example" ändern zu "Max Muster"
- [ ] "Schnelle Antworten gesucht" → Verlinkung nach Hilfe, Sektion ganz nach oben verschieben
- [ ] "Worum geht es": Widerruf/Rückgabe von Gekauftem als Option hinzufügen

### Eigene Vorschläge (Kontakt)

- [ ] E-Mail "info@currico.ch" hardcoded statt aus Config-Konstante — Wartbarkeitsproblem
- [ ] Kein Spam-Schutz (kein Honeypot, kein reCaptcha, kein Rate-Limiting sichtbar) — Formular könnte missbraucht werden
- [ ] Telefonnummer-Feld hat keine Formatvalidierung — akzeptiert ungültige Nummern
- [ ] Formular-State nur Client-seitig (useState) — bei Navigation weg sind Daten ohne Warnung verloren
- [ ] Erfolgs-Nachricht erklärt keine nächsten Schritte (z.B. "Wir melden uns in 24-48 Stunden")
- [ ] Keine Referenznummer nach Absenden — Nutzer kann Anfrage nicht nachverfolgen
- [ ] Fehlende `autocomplete`-Hints auf Formularfeldern (z.B. `autocomplete="email"`) — schlechte Accessibility
- [ ] Keine Schema.org `ContactPoint` Markup
- [ ] Antwortzeit "24-48 Stunden" ist statischer Text — nicht konfigurierbar oder dynamisch

---

## 12. Anmelden (`/anmelden`)

- [ ] Weiterleitung nach Login anpassen (wohin wird man geleitet?)
- [ ] "Vergessenes Passwort" Seite/Link erstellen (mit E-Mail-Reset)
- [ ] Google-Anmeldung → direkt zum Profil, nicht zurück zum Login
- [ ] Google-Anmeldung überarbeiten (Flow verbessern)
- [ ] Erneute Google-Anmeldung → braucht Zwischenfenster von Google
- [ ] "Zurück zur Startseite" sichtbar machen ohne Scrollen

### Eigene Vorschläge (Anmelden)

- [ ] "Remember Me" Kontrollkästchen ist vorhanden, aber Auswahl wird nicht gespeichert — Funktionalität fehlt
- [ ] Nach fehlgeschlagenem Login werden E-Mail und Passwort geleert — sollten bestehen bleiben für schnelleres Ausprobieren
- [ ] OAuth-Fehler haben keine spezifischen Fehlermeldungen — nur generischer Fehler
- [ ] Keine sichtbare Brute-Force-Schutz-Anzeige (z.B. "Zu viele Versuche, bitte warten")
- [ ] Keine Capslock-Warnung beim Passwort-Feld
- [ ] Passwort vergessen führt zu "/bald-verfuegbar" statt zu echter Reset-Funktionalität

## 12b. Registrieren (`/registrieren`)

### Eigene Vorschläge (Registrieren)

- [ ] Passwort-Anforderungen (8 Zeichen Minimum) werden nicht vor dem Absenden angezeigt — nur bei der Eingabe
- [ ] Keine Prüfung auf häufig verwendete Passwörter (z.B. "password123")
- [ ] Keine Passwort-Stärke-Anzeige — nur Mindestlänge wird validiert
- [ ] AGB/Datenschutz-Links zeigen "/bald-verfuegbar" — sollten auf echte Seiten verlinken
- [ ] Keine klare Indication nach Registrierung, dass E-Mail bestätigt werden muss

---

## 13. Konto - Übersicht (`/konto`)

### Übersicht

- [ ] "Profil vervollständigen" nicht in der Übersicht anzeigen
- [ ] "Neues Material" und "Material entdecken" Buttons löschen
- [ ] Buttons in der Übersicht einheitlich machen
- [ ] Uploads auch in Übersicht unter "Meine Uploads" anzeigen

### Navigation

- [ ] Navigationsbar Farben und ausgewählte Tags überarbeiten
- [ ] Mitteilungen als Tab in der Profil-Navigationsbar haben

### Profil vervollständigen

- [ ] "Profil vervollständigen" überarbeiten und sicherstellen dass es funktioniert + Buttons

### Eigene Vorschläge (Konto-Übersicht)

- [ ] Profile-Completion-Banner nutzt localStorage mit Prozentwert-Key — könnte bei mehrfachem Speichern zu verwirrenden Zuständen führen
- [ ] "Pending" Status wird als "Ausstehend" hardcoded — sollte i18n nutzen
- [ ] Keine Filterung nach Material-Status auf der Overview
- [ ] Recent Downloads zeigt max 6 Items ohne Pagination — bei mehr werden diese nicht angezeigt
- [ ] Download-Funktion öffnet neues Fenster ohne Error-Handling für fehlgeschlagene Downloads
- [ ] Seller-Materials-Tabelle hat keine Sortier-Funktionalität

### Eigene Vorschläge (Konto-Layout)

- [ ] Mobile Tab Bar scrollt aktiven Tab nicht immer in die Mitte — `scrollIntoView` Positionierung verbessern
- [ ] Keine Bestätigung beim Navigieren weg von ungespeicherten Änderungen in Settings
- [ ] Keine Skeleton-Animationen für die Quick-Stats Desktop-Ansicht
- [ ] Fallback `displayData` nutzt potenziell veraltete Session-Daten beim Seitenwechsel

---

## 14. Konto - Einstellungen (`/konto/settings`)

### Profil-Einstellungen

- [ ] Überschneidungen von Text und Emblem fixen
- [ ] Speichern von Änderungen verschönern (besseres Feedback)
- [ ] Fächer im Profil schöner darstellen (LP21-Farben verwenden)
- [ ] Kanton aus Kontakt-Sektion rausnehmen, im Profil nach oben verschieben
- [ ] "Bevorzugte Sprache" entfernen im Profil
- [ ] Profil-Namenlänge auf 32 Zeichen limitieren

### Einstellungen entfernen

- [ ] "Darstellung" raus aus Einstellungen
- [ ] "Konto Datenexport" entfernen
- [ ] "Konto löschen" überarbeiten

### Profilbild

- [ ] Profilbild hochladen/löschen Funktion überarbeiten (+ Doku für Simon)
- [ ] Nur JPG, PNG, WebP erlauben + Grössenlimite einrichten

### E-Mail

- [ ] "Wichtig" aus der E-Mail-Verifizierung rausnehmen

### Eigene Vorschläge (Einstellungen)

- [ ] Bio-Feld `maxLength={500}` — Zeichenzähler sollte früher sichtbar sein (z.B. ab 400 Zeichen)
- [ ] Passwort ändern Funktion fehlt komplett — sollte in diesem Bereich sein
- [ ] "E-Mail ändern → kontaktieren Sie uns" ohne Link/Button zu Support — Sackgasse
- [ ] Instagram/Pinterest-Felder: keine Validierung der Benutzernamen
- [ ] Profil-Visibility-Toggle hat keine Bestätigung vor Änderung zu Private
- [ ] Floating Save Bar könnte Position bei kleinen Screens falsch berechnen
- [ ] Keine Vorschau-Funktion für öffentliches Profil vor dem Speichern
- [ ] "Datenexport"-Button hat keine Funktionalität implementiert — sollte disabled oder funktional sein
- [ ] "Konto löschen"-Button hat keine Funktionalität — sollte zu Bestätigungsdialog führen
- [ ] Keine Warnung, dass Konto-Löschung permanent ist und Materialien/Käufe betroffen
- [ ] Keine Zwei-Faktor-Authentifizierung (2FA) Option
- [ ] Benachrichtigungs-Prefs zeigen nur Erfolg/Fehler als kurze Toast — besseres Feedback nötig
- [ ] Keine Unterteilung in "E-Mail" vs. "In-App" Benachrichtigungen
- [ ] Keine Batch-Option "Alle Benachrichtigungen deaktivieren"

---

## 15. Konto - Wunschliste (`/konto/wishlist`)

- [ ] "Materialien entdecken" Button oben rechts hinzufügen
- [ ] Suchfunktion einbauen

### Eigene Vorschläge (Wunschliste)

- [ ] Wenn Item entfernt wird, werden Stats nicht aktualisiert — inkonsistente Zahlen möglich
- [ ] Keine Benachrichtigung wenn Artikel auf Wunschliste Preisänderung hat
- [ ] Keine Sortier- oder Filteroptionen
- [ ] Herz-Icon für Wunschliste könnte konsistenter mit anderen Seiten sein

---

## 16. Konto - Bibliothek (`/konto/library`)

- [ ] Suchfunktion einbauen

### Eigene Vorschläge (Bibliothek)

- [ ] Statistik-Karten verwenden hardcoded deutsche Texte ("Gesamt in Bibliothek", "Gratis erhalten", "Gekauft") — sollten i18n nutzen
- [ ] Suchfunktion: wenn Suchfeld geleert wird, wird nicht neu geladen
- [ ] Keine Filteroptionen für Material-Typ (kostenlos vs. kostenpflichtig)
- [ ] Badge-Text "Verifiziert" ist hardcoded statt i18n
- [ ] Keine Sortieroptionen (nach Datum, Preis, Bewertung etc.)
- [ ] Keine Bulk-Actions (z.B. mehrere auswählen und zu Sammlung hinzufügen)

---

## 17. Konto - Uploads (`/konto/uploads`)

- [ ] Suchfunktion einbauen
- [ ] "Meine Materialien bearbeiten" führt zu Error 404 → FIX
- [ ] "Link zur Vorschau" Button bei Meine Materialien löschen
- [ ] Meine Materialien sortieren möglich machen
- [ ] Dokumente in Überprüfung in Uploads anzeigen

### Eigene Vorschläge (Uploads)

- [ ] Suchfeld wird nur angezeigt wenn `uploadedItems.length > 0` — sollte immer sichtbar sein
- [ ] Badge-Texte ("Verifiziert", "Ausstehend") sind hardcoded statt i18n
- [ ] Placeholder-Text "Uploads durchsuchen..." ist hardcoded (nicht i18n)
- [ ] Keine Anzeige von Upload-Fortschritt für Materials im Draft-Status
- [ ] Keine Möglichkeit, Material zu duplizieren

---

## 18. Folge ich (`/folge-ich`)

- [ ] "Gefolgte Profile" Wording überarbeiten
- [ ] Bei Klick auf Profil → zur Profilansicht wechseln, "Alle" zeigt alle
- [ ] Man kann sich nicht selber folgen (Logik einbauen)

### Eigene Vorschläge (Folge ich)

- [ ] `getSubjectPillClass` ist dupliziert (erscheint in 3+ Dateien) — sollte in gemeinsame Utility
- [ ] Link href zu `/profile/{id}` statt `/profil/{id}` — URL-Inkonsistenz (alter englischer Pfad)
- [ ] Unfollow-Button zeigt Hover-State mit Error-Farben (`hover:border-error`) — impliziert Gefahr statt einfaches Entfolgen
- [ ] "Discover profiles" Button im Empty-State verlinkt auf `/materialien` statt auf Profil-Suche
- [ ] "Followed since" Datumsformat nutzt `toLocaleDateString` aber matcht nicht Rest der App
- [ ] Alle gefolgten Seller werden auf einmal geladen — keine Pagination für grosse Listen
- [ ] Keine Metadata für `/folge-ich` Route
- [ ] API-Response-Struktur wird nicht validiert — nimmt an dass `data.sellers` existiert

---

## 19. Hochladen (`/hochladen`)

### Formular-Validierung

- [ ] Titel-Limite auf 64 Zeichen
- [ ] Fächer-Abkürzungen mindestens 2 Buchstaben
- [ ] Vorschaubild auf 5 MB limitieren
- [ ] Nur eine Datei aufs Mal hochladen (nicht mehrere gleichzeitig)
- [ ] Wenn zwei verschiedene Material-Typen hochgeladen → nicht erlauben (nur ein Typ)

### Kompetenzen

- [ ] Kompetenz-Auswahl im gleichen Style und Layout wie Zyklus/Fach
- [ ] Maximal 5 Kompetenzen auswählen

### Preise

- [ ] Mindestpreis 0.50 CHF (0 darf nicht als kostenpflichtig durchgehen)
- [ ] Kosten nur in 0.50-Schritten erlauben, automatisch auf/abrunden

### Fehlermeldungen

- [ ] "Profil vervollständigen" Fehlermeldung → Link zum Profil
- [ ] Alle Fehlermeldungen mit Link zum Problem + Rechtschreibung prüfen

### Nach dem Upload

- [ ] Mehrere Dokumente vom gleichen Typ uploaden möglich machen
- [ ] "Zurück zum Profil" Link richtig verlinken
- [ ] Tag von Material-Typ angleichen
- [ ] Vor Veröffentlichung: Übersicht wie es auf der Materialseite aussehen wird
- [ ] "Verifizierte Dokumente" umbenennen zu "Geprüft"

### Verkäufer-Dashboard

- [ ] Downloads überarbeiten (funktioniert noch nicht)
- [ ] Einnahmen total anzeigen (nicht monatlich)

### Eigene Vorschläge (Hochladen)

- [ ] Eszett (ß) Warnung nur in Step 1, aber User kann in Step 3 auch Text eingeben — nicht alle Felder geprüft
- [ ] Draft-System speichert Felder aber keine Dateien — bei Browser-Cache-Leerung sind Dateien weg
- [ ] Keine Anzeige von verbleibender Datei-Grösse/Speicher-Limit
- [ ] "Automatische Vorschau" Info nur für PDF erwähnt — andere Formate?
- [ ] Keine Duplikat-Erkennung — User könnte versehentlich gleiches Material mehrmals hochladen
- [ ] "Lehrplan-Zuordnung" Selektor ist sehr gross — könnte Search-Funktionalität haben
- [ ] Keine Warnung beim Tab-Schliessen mit ungespeicherten Änderungen
- [ ] Validierung von Dateinamen wird nicht durchgeführt (z.B. zu lange Namen)
- [ ] Preview-Bild: keine Vorschau der finalen Galerie-Ansicht
- [ ] Bundle: Subject und Cycle sind fixiert auf Bundle-Level — sollten optional sein da Bundle mehrere Subjects haben kann
- [ ] Bundle: Discount-Berechnung zeigt nur Prozentsatz — sollte auch Ersparnis in CHF zeigen
- [ ] Bundle: Keine Validierung dass Bundle-Preis unter Summe der Einzelpreise liegt
- [ ] Bundle: Materials-Liste hat keine Pagination — bei 100+ Materials sehr lang

---

## 20. Öffentliches Profil (`/profil/[id]`)

- [ ] Profilseite komplett überarbeiten und funktionierend machen

### Eigene Vorschläge (Öffentliches Profil)

- [ ] Hardcoded deutsche Strings: "Profil nicht gefunden", "Das gesuchte Profil existiert nicht", "Benutzer", "Materialien durchsuchen", "Profil wird geladen..." — alles in i18n auslagern
- [ ] `getSubjectPillClass` und `formatPrice` sind lokal definiert statt aus Shared Utility — Code-Duplikation
- [ ] Keine Validierung dass `params.id` ein gültiger UUID/Slug ist vor dem Fetchen
- [ ] 4 parallele API-Calls bei Seitenaufruf — könnten zu einem einzelnen Endpoint gebündelt werden
- [ ] Keine SSR/Static Generation — alle Daten Client-seitig gefetcht, schlecht für SEO
- [ ] Keine OpenGraph Meta-Tags für Profil-Sharing in sozialen Medien
- [ ] Follow-Button zeigt "Gefolgt" erst nach erfolgreicher Action — kein sofortiges Feedback (kein Optimistic Update)
- [ ] Private-Profile-Notice versteckt zu viel — Verkäufer wollen evtl. kein privates Profil
- [ ] Kein Caching von Profil-Daten — jeder Besuch fetcht frische Daten
- [ ] "Beste Uploads" Titel ist hardcoded Deutsch

---

## 21. Verkäufer werden (`/verkaeufer-werden`)

- [ ] Stripe Konto einrichten Button + Bestätigungsbutton überarbeiten

### Eigene Vorschläge (Verkäufer werden)

- [ ] Hardcoded deutsche Strings in gesamter Komponente — nicht lokalisierbar
- [ ] Inline SVG-Icons statt lucide-react — inkonsistent mit Rest der App
- [ ] Seller-Terms-Inhalt direkt in Komponente eingebettet — sollte in separater Datei oder von CMS geladen werden
- [ ] Terms-Section hat nur 500px max-height mit `overflow-y-auto` — beengtes Leseerlebnis
- [ ] Requirements-Section zeigt 3 Anforderungen ohne Anzeige welche der User schon erfüllt hat (z.B. grüner Haken für erledigt)
- [ ] Kein Fortschrittsanzeiger für den 4-Schritte-Prozess (Login → E-Mail verifizieren → Terms akzeptieren → Stripe verbinden)
- [ ] E-Mail-Verifizierungs-Fehler hat keinen direkten Link zu Einstellungen
- [ ] Stripe Redirect nutzt `window.location.href` statt Next.js Navigation
- [ ] CTA-Buttons erklären nicht per Tooltip warum sie disabled sind
- [ ] Copyright-Section fühlt sich vom Hauptflow abgekoppelt an

---

## 22. Stripe Konto (Seller Onboarding)

- [ ] Einstellungen verbessern
- [ ] Weniger Angaben bei der Einrichtung
- [ ] Rückkehr von Stripe zu Currico → Buttons überarbeiten und funktionierend machen

---

## 23. Benachrichtigungen

- [ ] Autoren-Benachrichtigungen einrichten
- [ ] Newsletter-System
- [ ] Gesamtes Benachrichtigungssystem überarbeiten

---

## 24. Global / Alle Seiten

- [x] Cursor pointer auf alle klickbaren Elemente
- [x] Alle Dropdowns abgerundet (rounded-full)
- [x] Alle URL-Pfade auf Deutsch
- [x] ScrollToTop-Button auf allen Seiten
- [x] Keine ß in Content-Text
- [x] Fehlermeldungen lokalisiert
- [x] Kantone vervollständigt (26 Kantone)
- [x] Hintergrundfarben einheitlich
- [x] Kaufstornierung/Widerrufsrecht in AGB dokumentiert
- [ ] Info bei Fehlermeldungen auf Deutsch bzw. der Sprache angepasst (restliche prüfen)

### Eigene Vorschläge (Global)

- [ ] `getSubjectPillClass()` ist in 3+ Dateien dupliziert — in gemeinsame Utility-Funktion `lib/utils/subject-pills.ts` auslagern
- [ ] Viele Canonical-URLs in Metadata nutzen noch englische Pfade ("/about", "/seller-levels") statt deutsche ("/ueber-uns", "/verkaeufer-stufen") — SEO-Fehler
- [ ] Inkonsistente Loading-States: manche Seiten nutzen Spinner, andere Skeleton, andere Pulse — vereinheitlichen
- [ ] Inkonsistente Button-Styles (ghost, outline, solid) nicht überall einheitlich verwendet
- [ ] Card-Layouts nutzen teils `rounded-xl`, teils `rounded-lg` — inkonsistent
- [ ] Viele Seiten haben keine `generateMetadata()` Funktion — fehlende SEO-Metadaten
- [ ] Keine CSRF-Token-Validierung sichtbar bei POST-Requests
- [ ] localStorage wird für sensitive Daten genutzt (Drafts, Preferences) — könnte XSS-anfällig sein
- [ ] `Link` aus "next/link" statt aus `@/i18n/navigation` auf einigen Seiten — umgeht Locale-Handling
- [ ] Dekorative Icons (lucide-react) haben oft kein `aria-hidden="true"` — werden von Screenreadern vorgelesen
- [ ] Viele `<div>`-Container sollten semantische Elemente sein (`<section>`, `<nav>`, `<article>`) für bessere Accessibility
- [ ] Keine Schema.org-Daten auf den meisten Seiten — fehlende Rich Snippets
- [ ] API-Fehler werden oft als generische "Ein Fehler ist aufgetreten" angezeigt — keine spezifischen Hilfe für 401/403/404/500

---

## Zusammenfassung

| Seite                     | Erledigt | Offen (Joel) | Offen (Eigene) | Total Offen |
| ------------------------- | -------- | ------------ | -------------- | ----------- |
| Startseite                | 4        | 0            | 11             | 11          |
| Materialien               | 0        | 21           | 19             | 40          |
| Material-Vorschau         | 0        | 12           | 17             | 29          |
| Hilfe                     | 3        | 0            | 7              | 7           |
| Urheberrecht              | 1        | 0            | 8              | 8           |
| Impressum                 | 0        | 4            | 9              | 13          |
| Cookie-Richtlinien        | 0        | 1            | 7              | 8           |
| Verkäufer-Stufen          | 0        | 4            | 7              | 11          |
| Verifizierter Verkäufer   | 0        | 2            | 6              | 8           |
| Über uns                  | 0        | 2            | 10             | 12          |
| Kontakt                   | 0        | 4            | 9              | 13          |
| Anmelden                  | 0        | 6            | 6              | 12          |
| Registrieren              | 0        | 0            | 5              | 5           |
| Konto (alle Unterseiten)  | 0        | 27           | 39             | 66          |
| Folge ich                 | 0        | 3            | 8              | 11          |
| Hochladen                 | 0        | 18           | 13             | 31          |
| Öffentliches Profil       | 0        | 1            | 10             | 11          |
| Verkäufer werden / Stripe | 0        | 4            | 10             | 14          |
| Benachrichtigungen        | 0        | 3            | 0              | 3           |
| Global                    | 9        | 1            | 13             | 14          |
| **Total**                 | **17**   | **113**      | **214**        | **327**     |
