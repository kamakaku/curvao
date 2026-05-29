# Player Cutouts

Dieser Ordner verwaltet alle lokalen Player-Cutouts für CURVAO Card-Assets.

## Zweck
- nachvollziehbare Zuordnung von Playern zu lokalen Cutouts
- klare Trennung zwischen `licensed`, `demo` und `placeholders`
- Schutz davor, dass unfreigegebene oder abgelaufene Bilder in Production erscheinen

## Struktur
- `licensed/` – echte freigegebene Cutouts für App/Card-Assets
- `demo/` – interne Demo-/Test-Cutouts, niemals automatisch in Production
- `placeholders/` – CURVAO Platzhalter, generisch oder positionsbezogen
- `manifest.json` – zentrale Zuordnung und Freigabelogik

## Neues Cutout hinzufügen
1. Datei in den passenden Ordner legen (`licensed/`, `demo/` oder `placeholders/`).
2. Eintrag in `manifest.json` anlegen.
3. `playerId` und/oder `playerSlug` sauber pflegen.
4. `licenseStatus`, `usageScope`, `approvedFor` und optional `expiresAt` korrekt setzen.
5. Resolver in der App nur über das Manifest nutzen, nicht direkt per Dateipfad.

## Manifest-Pflege
Jeder Eintrag beschreibt:
- wem das Asset gehört (`playerId`, `playerSlug`, `displayName`)
- welche Variante existiert (`hero`, `thumb`)
- woher das Asset kommt (`source`)
- ob es rechtlich genutzt werden darf (`licenseStatus`)
- für welchen Einsatzzweck es gilt (`usageScope`)
- in welchen Modi es zulässig ist (`approvedFor`)

## License Status
- `licensed` – freigegeben und nutzbar, solange nicht abgelaufen
- `demo_only` – nur intern für Demo/Entwicklung
- `restricted` – bewusst gesperrt für Cards/Production
- `expired` – nicht mehr verwenden
- `unlicensed` – niemals verwenden

## Production-Regeln
Production darf nur Cutouts verwenden, wenn:
- `licenseStatus === "licensed"`
- `usageScope === "card_asset"` oder `"app_display"`
- `approvedFor` enthält `"production"`
- `expiresAt` leer oder in der Zukunft ist

## Wichtiger Hinweis
Keine externen Bilder ohne gesicherte Rechte hinzufügen.
Keine URLs, kein Scraping, keine Fremdquellen im Resolver.
