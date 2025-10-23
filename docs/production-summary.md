# Production Readiness Summary

This summary captures our current state, recent improvements, and pending work to reach a production-grade system.

## Current state (dev)

- Backend: sqlite-backend on Apollo Server (GraphQL) with SQLite
  - DB_FILE support for configurable DB location
  - WAL enabled for better dev performance
- Frontends: Next.js apps for consumer (multivendor-web) and admin (multivendor-admin)
- Orchestration: Docker Compose with 3 services (API, web, admin)
- Ports: 4000 (API), 3000 (web), 3001 (admin host)

## Recent improvements

- Simplified docker-compose stack to core 3 services
- Added DB_FILE env for sqlite-backend for flexible volume mounting
- Enabled CHOKIDAR_USEPOLLING in containers for reliable file watching on Windows
- Fixed a minor TypeScript type in admin to prevent runtime/compile errors
- Cleaned repository docs and archived legacy modules under archive/
- Added dev-friendly Dockerfiles for web/admin

## Pending items

- Start Compose stack and verify health (requires Docker Desktop running)
- Complete branding scrub across configs and assets
- Add authentication/authorization (JWT/OAuth2)
- Introduce automated tests (unit/integration/e2e) and CI gates
- Add observability stack (metrics, traces, logs)

## Port and environment policy

- Ports: 4000 API, 3000 web, 3001 admin host (container 3000)
- NEXT_PUBLIC_SERVER_URL points UIs at the API (default http://localhost:4000)
- DB_FILE allows reusing or mounting a consistent SQLite DB file across runs

## Operational notes

- Windows EPERM on .next: stop servers and remove .next when locked
- Docker required for compose; otherwise run services with npm scripts
- Seeding is available via sqlite-backend seeds and root-level seeds for larger datasets

## Migration intent

- Move to microservices with PostgreSQL per service, messaging bus, and a GraphQL gateway
- Establish CI/CD and GitOps for consistent, observable deployments
