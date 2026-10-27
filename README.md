# COSMIC FRONTIER

An interactive astronomy platform built for the NASA Space Apps Challenge. It combines live NASA/JPL data, curated reference datasets, 3D visualisation and an AI guide.

## Features

| Page | Hash route | What it does |
| :--- | :--- | :--- |
| Home | `#home` | Landing page |
| Mission Control | `#mission-control` | Unified dashboard of live celestial monitoring |
| Live Cosmic Observatory | `#observatory` | Time-travel motion viewer for solar-system objects |
| 3D Universe | `#universe` | Three.js solar system explorer with Keplerian orbits |
| Asteroid Watch | `#asteroid-watch` | Close-approach tracker for near-Earth objects |
| Exoplanet Lab | `#exoplanets` | NASA Exoplanet Archive TAP queries and comparison |
| Galaxy Explorer | `#galaxies` | NED / SIMBAD lookups and comparison workspace |
| SPHEREx / Image Lab | `#spherex` | SPHEREx multi-spectral products and imagery |
| Planet X | `#planet-x` | Theoretical Planet Nine modelling, learning missions, glossary |
| Data Centre | `#data-centre` | Browse the verified datasets |
| AI Guide | `#ai-guide` | Gemini-powered assistant (offline demo mode without a key) |
| About | `#about` | Project information |

## Tech stack

- React 19, TypeScript, Vite 8
- Tailwind CSS 4, lucide-react
- Three.js
- Express 5 backend (`server/`), `@google/genai`
- oxlint

## Getting started

```bash
npm install
cp .env.example .env     # then fill in your keys
npm run server           # API on http://localhost:3001
npm run dev              # frontend; Vite proxies /api to the API
```

### Environment variables

| Variable | Purpose |
| :--- | :--- |
| `PORT` | API port (default `3001`) |
| `NASA_API_KEY` | Used server-side for NASA APIs. A demo key is used as a fallback. |
| `GEMINI_API_KEY` | Server-side only. Leave blank to run the AI Guide in offline demo mode. |
| `GEMINI_MODEL` | Optional model id (default `gemini-2.5-flash`) |

API keys are read on the server only and are never sent to the browser. `.env` is git-ignored.

## Scripts

| Command | Description |
| :--- | :--- |
| `npm run dev` | Start the Vite dev server |
| `npm run server` / `npm start` | Start the Express API |
| `npm run build` | Type-check (`tsc -b`) and build for production |
| `npm run preview` | Preview the production build |
| `npm run lint` | Run oxlint |
| `npm test` | Run the server test suite |

## API overview

| Endpoint | Description |
| :--- | :--- |
| `GET /api/status` | Configuration and operational status |
| `GET /api/nasa/apod` | Astronomy Picture of the Day |
| `GET /api/nasa/spherex` | SPHEREx imagery from the NASA Image Library |
| `GET /api/data/manifest` | Dataset manifest |
| `GET /api/data/solar-system` | Planets |
| `GET /api/data/exoplanets` | Exoplanets (`search`, `candidates` query params) |
| `GET /api/data/small-bodies` | Asteroids and comets |
| `GET /api/data/galaxies` | Galaxies |
| `GET /api/data/stars` | Bright stars |
| `GET /api/data/spherex` | SPHEREx mission products |
| `GET /api/data/images` | NASA image archives |
| `GET /api/data/catalog` | Unified search (`category`, `q`) |
| `GET /api/data/live-space/ephemeris` | Ephemeris (`date`, `target`) |
| `GET /api/data/live-space/close-approaches` | Close approaches |
| `GET /api/data/observatory/objects` | Unified observatory aggregator |
| `POST /api/chat` | AI Guide conversation |

## Data provenance

See [`data/README.md`](./data/README.md) for dataset sources, status labels and units.

