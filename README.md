# Fitness Game Portfolio (Local-First)

## Overview
High-performance, local-first fitness gamification app built with **Node.js, TypeScript, PostgreSQL (PostGIS), Redis, and React Native**.

## Architecture
- **Backend**: Node.js + Express (TypeScript)
- **Database**: PostgreSQL with PostGIS extension for geospatial queries.
- **Cache/Realtime**: Redis for match state and telemetry buffering.
- **Mobile**: React Native (Expo) with `react-native-maps`.

## Key Features
1.  **Local-First Infrastructure**: Fully containerized with Docker Compose.
2.  **Geospatial Validation**: `ST_DWithin` queries to validate zone captures server-side.
3.  **Real-Time Gaming**: Socket.io + Redis for low-latency match updates.
4.  **Telemetry Pipeline**: "Hot/Cold" storage pattern (Redis Stream -> Postgres Batch Insert).

## Setup
1.  **Infrastructure**:
    ```bash
    docker-compose up -d --build
    ```
2.  **Seeding**:
    ```bash
    docker-compose exec backend npm run seed
    ```
3.  **Mobile App**:
    ```bash
    cd mobile
    npx expo start
    ```

## Testing
Run integration tests (Auth, Match Flow, Anti-Cheat):
```bash
docker-compose exec backend npm test
```

## Data Science / Analytics
- **Voronoi Partitioning**: See `v_park_territories` view (in `schema.sql`) for zone influence visualization.
- **Telemetry**: User movement data is stored in `telemetry` table for heatmap generation.

## License
MIT
