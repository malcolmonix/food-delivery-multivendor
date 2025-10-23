# Architecture Overview

This repository hosts a modular, local-first development stack for a multi-vendor food delivery platform. The current setup emphasizes a simple GraphQL + SQLite backend for fast iteration, with Next.js frontends for both consumer and admin experiences.

## Components

- sqlite-backend
  - Purpose: Single GraphQL API for local/dev, backed by SQLite
  - Tech: Node.js 20, Apollo Server, sqlite3
  - Port: 4000 (HTTP)
  - Data: SQLite DB file, WAL mode enabled
  - Env:
    - DB_FILE: Absolute/relative path to the SQLite database file (default ../enatega.db)

- multivendor-web
  - Purpose: Consumer-facing Next.js application
  - Port: 3000 (host)
  - Env:
    - NEXT_PUBLIC_SERVER_URL: GraphQL endpoint URL (default http://localhost:4000)

- multivendor-admin
  - Purpose: Admin-facing Next.js application
  - Port: 3001 (host) mapped from container 3000 in dev
  - Notes: Small TS fix applied to broaden display field types

## Ports and networking

- 4000: GraphQL API (sqlite-backend)
- 3000: Consumer web (multivendor-web)
- 3001: Admin web (host-mapped to container 3000)

All services communicate over localhost in development. The web apps read the API URL from NEXT_PUBLIC_SERVER_URL.

## Orchestration (local)

- docker-compose.yml defines a lean 3-service dev stack:
  - sqlite-backend (builds from sqlite-backend/), exposes 4000, mounts DB_FILE volume
  - multivendor-web (builds from multivendor-web/), exposes 3000, reads NEXT_PUBLIC_SERVER_URL
  - multivendor-admin (builds from multivendor-admin/), exposes 3001->3000
- Windows file watching inside containers is enabled via CHOKIDAR_USEPOLLING=1 to prevent missed changes.

## Data and seeding

- SQLite database file is controlled by DB_FILE; default resolves to ../enatega.db relative to sqlite-backend
- WAL mode and pragmatic PRAGMA settings are used for dev performance
- Seeding options:
  - sqlite-backend/seed-runner.js and related seed-* scripts
  - Root-level seed scripts (seed.js, run-comprehensive-seed.js, *.sql) for broader datasets
  - dev-backend/seed.js for GraphQL dev backend seeding (alternate path)

## Data flow (simplified)

1. Client (web/admin) sends GraphQL requests to http://localhost:4000/graphql
2. Apollo Server resolves queries/mutations against SQLite via sqlite3
3. Responses are returned to the clients; cache and state are managed client-side by their respective frameworks/libraries

## Configuration and environment

- NEXT_PUBLIC_SERVER_URL is the only required client-side env for the UIs
- DB_FILE can point to a mounted path for persistent local DBs or shared datasets
- Docker images for web/admin are developer-friendly and optimized for hot reloads

## Decisions and trade-offs

- SQLite for local speed and zero external dependencies; plan to migrate to PostgreSQL per service in microservices phase
- GraphQL remains the single API surface for now; future gateway/federation planned
- Minimized services in compose for faster startup and simpler debugging

## Caveats and edge cases

- Windows: EPERM errors can occur on .next files; stop dev servers and delete .next if needed
- Port collisions: Ensure ports 4000/3000/3001 are free before starting
- Docker Desktop must be running to use docker-compose; otherwise start services locally via npm scripts

## Next steps (toward microservices)

- Introduce per-domain services (User, Restaurant, Order, Payment, Notification, Admin) with PostgreSQL
- Add API Gateway (Apollo Federation or GraphQL Mesh) and event streaming (Kafka/RabbitMQ)
- Establish CI/CD pipelines, observability, and authentication/authorization layers
