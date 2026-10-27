# Enshrouded Statuspage

Statusseite für den **Enshrouded Dedicated Server**. Fragt den Server via **Steam A2S Game Server Query** (UDP) ab und zeigt Servername, Status, Spieleranzahl + Spielerliste, Map/Welt, Passwortschutz und alle weiteren verfügbaren A2S-Informationen an.

## Features
- Live-Status via A2S
- Spieleranzahl & Spielerliste (Name, Spielzeit, Score)
- Serverdetails aus dem kompletten A2S-Response
- Auto-Refresh alle 60 Sekunden
- Für Docker optimiert
- Konfiguration über `.env`

## Voraussetzungen
- Node.js 18+ (für lokales Ausführen)
- Docker & Docker Compose (für Container)
- Erreichbarer A2S Query-Port des Enshrouded Dedicated Servers (UDP)

## Konfiguration
1. `.env.example` zu `.env` kopieren
```bash
cp .env.example .env
```
2. Werte eintragen
```env
SERVER_HOST=dein-server.de
SERVER_QUERY_PORT=27015
PORT=3000
```

> Der Query-Port ist nicht zwingend identisch mit dem Game-Port. Für Enshrouded findest du ihn in der Server-Konfiguration bzw. muss er in der Firewall freigegeben sein.

## Lokal starten
```bash
npm install
npm start
```
Öffne dann [http://localhost:3000](http://localhost:3000)

## Mit Docker starten

### Option 1: Docker Compose mit Build
```bash
cp .env.example .env
docker compose up -d --build
```

### Option 2: Docker Compose mit vorgefertigtem Image
Erstelle eine `docker-compose.yml`:

```yaml
services:
  enshrouded-status:
    image: joyki/enshrouded-serverstatus:latest
    container_name: enshrouded-statuspage
    env_file:
      - .env
    ports:
      - "3000:3000"
    restart: unless-stopped
```

Alternativ kannst du die Einstellungen direkt über `environment:` im Compose-File angeben, ohne eine `.env`-Datei zu verwenden:

```yaml
services:
  enshrouded-status:
    image: joyki/enshrouded-serverstatus:latest
    container_name: enshrouded-statuspage
    environment:
      - SERVER_HOST=dein-server.de
      - SERVER_QUERY_PORT=27015
      - PORT=3000
    ports:
      - "3000:3000"
    restart: unless-stopped
```

Dann starten:
```bash
cp .env.example .env
docker compose up -d
```

> **Hinweis:** Falls sowohl `env_file:` als `environment:` genutzt werden, überschreiben die `environment:`-Einträge die Werte aus der `.env`-Datei. Auch Werte aus deiner Shell lassen sich über `${VAR}` übernehmen.

### Option 3: Direkt mit Docker
```bash
docker run -d \
  --name enshrouded-statuspage \
  --env-file .env \
  -p 3000:3000 \
  --restart unless-stopped \
  joyki/enshrouded-serverstatus:latest
```

Öffne dann [http://localhost:3000](http://localhost:3000)

## API
- `GET /api/status` – Führt eine A2S-Abfrage durch und gibt das Ergebnis als JSON zurück
- `GET /api/health` – Healthcheck

## Tech Stack
- [Express](https://expressjs.com/)
- [gamedig](https://github.com/gamedig/node-gamedig) – A2S/Game Server Query
- Vanilla HTML/CSS/JS

## Hinweis
Die Seite kommuniziert nicht direkt aus dem Browser mit dem Game Server, sondern über das Node.js-Backend (da A2S/UDP nicht aus dem Browser möglich ist). Der Query-Port muss also vom Host/Container aus erreichbar sein.
