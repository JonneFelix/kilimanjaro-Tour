# 🏔️ Kilimandscharo Tour - Papa & Jonne

Eine maßgeschneiderte Full-Stack-Web-App zur Planung der Kilimandscharo-Reise auf der Machame-Route.

![App Screenshot](https://via.placeholder.com/800x400?text=Kilimandscharo+App+Preview)

## ✨ Features

*   **Pack-Board (Kanban):**
    *   Gemeinsame & individuelle Packlisten für 2 Personen (Jonne & Frank).
    *   Drag & Drop Status (Backlog, Noch besorgen, Gepackt...).
    *   Smarte Filter ("Nur Meine", "Nur Gemeinsame").
    *   Mobile-optimiert.
*   **Karte (Machame Route):**
    *   Interaktive Karte mit allen Camps und Wegpunkten (Tag 1-7).
    *   Höhenangaben und Distanzen.
    *   Möglichkeit, eigene Marker zu setzen.
*   **Notizen:**
    *   Einfache Verwaltung von Reiseinfos, Flugdaten etc.
*   **Dokumente:**
    *   Upload & Verwaltung von wichtigen PDFs (Versicherung, Pässe) und Bildern.
    *   Integrierte Vorschau.

## 🛠️ Tech Stack

Dieses Projekt ist ein modernes **Bun Monorepo**:

*   **Runtime:** [Bun](https://bun.sh) (extrem schnell)
*   **Backend:** Hono (Web Framework) + SQLite (Datenbank)
*   **Frontend:** React + Vite + TailwindCSS
*   **Deployment:** Docker (Multi-Arch: amd64/arm64) via GitHub Actions & GHCR.

## 🚀 Installation & Start

### Lokal (Entwicklung)

1.  Repository klonen:
    ```bash
    git clone https://github.com/JonneFelix/kilimanjaro-Tour.git
    cd kilimanjaro-Tour
    ```

2.  Abhängigkeiten installieren:
    ```bash
    bun install
    ```

3.  Datenbank initialisieren (Seed):
    ```bash
    bun run backend/src/seed_tamac.ts
    ```

4.  App starten (Backend + Frontend):
    ```bash
    bun dev
    ```
    Die App läuft unter `http://localhost:5173` (oder nächster freier Port).

### Deployment (Docker / Dokploy)

Das Projekt wird automatisch bei jedem Push auf `main` als Docker-Image gebaut und auf GitHub Packages (`ghcr.io`) veröffentlicht.

**docker-compose.prod.yml:**
```yaml
services:
  app:
    image: ghcr.io/jonnefelix/kilimanjaro-tour:latest
    ports:
      - "3010:3000"
    volumes:
      - kili_uploads:/app/backend/uploads
      - kili_db:/app/backend
    restart: always

volumes:
  kili_uploads:
  kili_db:
```

**Nach dem Start auf dem Server einmalig ausführen (zum Befüllen der Daten):**
```bash
docker exec -it <container_name> bun run backend/src/seed_tamac.ts
```

## 📂 Projektstruktur

*   `/backend`: API-Server und Datenbank-Logik.
*   `/frontend`: React-Applikation.
*   `/shared`: Geteilte TypeScript-Typen.

