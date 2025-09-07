# Protocol Companion — Boilerplate

Duolingo-style habit app for science-based protocols (e.g., Huberman-inspired), with **mobile-first** Expo (iOS/Android) and **web** via `react-native-web`. Includes a tiny Node server stub for AI endpoints (bandit `/next`, events logging, and RAG `explain` placeholder).

## Monorepo layout
```
protocol-companion/
├─ app/        # Expo (React Native + Web)
└─ server/     # Node/Express mock APIs (replace with real services later)
```

## Quick start

### 1) Client (Expo)
```bash
cd app
npm i
npm run dev   # opens Expo dev tools; scan QR with Expo Go
# Web:
npm run web
```

### 2) Server (Node)
```bash
cd server
npm i
npm run dev   # http://localhost:4000
```

The client expects `SERVER_URL=http://localhost:4000`. Set it in `app/.env` or hardcode in `src/lib/api.ts` during development.

## Features (MVP)
- Onboarding (choose Sleep / Focus / Energy)
- Today card (Action • Why • How) with "Done"
- Streaks & weekly heatmap (simple)
- Library of 5 starter protocols
- Insight of the day
- Daily notification (Expo)
- Server stubs for:
  - `/next` → returns next protocol (with simple Thompson Sampling mock)
  - `/events` → logs delivered/completed
  - `/explain?slug=...` → returns top-k snippets (static JSON mock)

## Disclaimer
Educational only. Not medical advice.
