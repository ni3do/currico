# Git Basics für Anfänger

## Was ist Git?

Git ist ein Versionskontrollsystem. Es speichert die Geschichte Ihrer Codeänderungen, sodass Sie:
- Frühere Versionen wiederherstellen können
- Mit anderen zusammenarbeiten können
- Nachvollziehen können, wer was geändert hat

## Grundkonzepte

- **Repository (Repo)**: Ein Projekt mit allen Dateien und deren Geschichte
- **Commit**: Ein Schnappschuss Ihrer Änderungen zu einem bestimmten Zeitpunkt
- **Branch**: Eine separate Arbeitslinie (z.B. für neue Features)
- **Remote**: Eine Online-Version Ihres Repos (z.B. auf GitHub)

## Die wichtigsten Befehle

### Status prüfen
```bash
git status
```
Zeigt, welche Dateien geändert wurden.

### Änderungen speichern (Commit)
```bash
# 1. Dateien zum Commit hinzufügen
git add dateiname.txt           # Einzelne Datei
git add .                       # Alle geänderten Dateien

# 2. Commit erstellen
git commit -m "Beschreibung der Änderung"
```

### Mit Remote synchronisieren
```bash
# Änderungen hochladen
git push

# Änderungen herunterladen
git pull
```

### Branches
```bash
# Neuen Branch erstellen und wechseln
git checkout -b mein-feature

# Zu einem Branch wechseln
git checkout main

# Alle Branches anzeigen
git branch
```

### Historie ansehen
```bash
# Commit-Historie anzeigen
git log

# Kurze Übersicht
git log --oneline
```

## Typischer Workflow

1. **Änderungen machen**: Bearbeiten Sie Ihre Dateien
2. **Status prüfen**: `git status`
3. **Änderungen stagen**: `git add .`
4. **Commit erstellen**: `git commit -m "Was ich geändert habe"`
5. **Hochladen**: `git push`

## Beispiel: Erste Schritte

```bash
# Repository klonen (herunterladen)
git clone https://github.com/username/repository.git
cd repository

# Datei bearbeiten
# (Öffnen Sie eine Datei in Ihrem Editor und ändern Sie etwas)

# Änderungen ansehen
git status

# Alle Änderungen hinzufügen
git add .

# Commit erstellen
git commit -m "Meine erste Änderung"

# Zum Server hochladen
git push
```

## Hilfreiche Tipps

- Schreiben Sie aussagekräftige Commit-Nachrichten: "Button-Farbe zu Blau geändert" statt "Fix"
- Committen Sie oft - kleine, häufige Commits sind besser als große
- Pullen Sie regelmäßig, um auf dem neuesten Stand zu bleiben
- Wenn Sie unsicher sind: `git status` ist Ihr Freund

## Häufige Probleme

### "Merge Conflict"
Wenn zwei Personen dieselbe Datei ändern, müssen Sie die Konflikte manuell lösen.
Git markiert die Konflikte in der Datei mit `<<<<<<<`, `=======`, und `>>>>>>>`.

### Änderungen verwerfen
```bash
# Einzelne Datei zurücksetzen
git restore dateiname.txt

# Alle Änderungen verwerfen (Vorsicht!)
git restore .
```

### Letzten Commit rückgängig machen
```bash
# Commit rückgängig, aber Änderungen behalten
git reset --soft HEAD~1

# Commit UND Änderungen verwerfen (Vorsicht!)
git reset --hard HEAD~1
```

## Weiterführende Ressourcen

- [Git Dokumentation](https://git-scm.com/doc)
- [GitHub Guides](https://guides.github.com/)
- Interaktives Tutorial: [learngitbranching.js.org](https://learngitbranching.js.org/)
