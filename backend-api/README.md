# Backend API

Node.js + Express + TypeScript API for the fitness game. Designed for Azure App Service (F1 or B1 dev plan) and free/lowest tier dependencies.

## Run locally
1. Copy .env.example to .env and fill values.
2. npm install
3. npm run dev

## Key Endpoints
- POST /api/matches
- POST /api/matches/:id/join
- POST /api/matches/:id/start
- POST /api/matches/:id/capture-zone
- POST /api/matches/:id/chat
- GET /api/matches/:id/negotiate
- GET /api/parks/:parkId/zones
