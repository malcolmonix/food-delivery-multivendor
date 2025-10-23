# Project Progress Tracker

Last updated: 2025-10-23

This tracker summarizes what’s implemented and what’s next for each component.

## multivendor-admin (Admin web)

Status: On track

Implemented
- [x] Dev Dockerfile added for fast local iteration
- [x] Integrated into docker-compose (exposed on host :3001 -> container :3000)
- [x] TypeScript fix for InfoField value rendering (string|number)
- [x] Documentation added (architecture, deployment guide, production summary)

TODO
- [ ] Branding/domain scrub and asset review (images, titles, meta)
- [ ] next.config image remotePatterns hardening (allow only needed domains)
- [ ] Ensure NEXT_PUBLIC_SERVER_URL consumption is consistent across data hooks
- [ ] Add unit tests and minimal e2e smoke (Cypress/Playwright)
- [ ] AuthN/AuthZ integration (JWT/OAuth2), protected routes, session handling
- [ ] Error boundaries and basic observability (Sentry or OpenTelemetry web)

## multivendor-web (Consumer web)

Status: On track

Implemented
- [x] .env.local defaults API to http://localhost:4000
- [x] Dev Dockerfile added and wired in docker-compose
- [x] Updated documentation and guidance for Windows EPERM issues

TODO
- [ ] Branding/domain scrub and content updates
- [ ] next.config image remotePatterns review and tighten
- [ ] Convert any legacy fetches to use NEXT_PUBLIC_SERVER_URL consistently
- [ ] Add tests (unit + a couple of e2e routes: home, restaurant list, checkout)
- [ ] Performance budget and basic Web Vitals tracking

## sqlite-backend (GraphQL + SQLite)

Status: On track

Implemented
- [x] DB_FILE environment variable support (configurable SQLite path)
- [x] WAL mode and pragmatic PRAGMAs for dev performance
- [x] Integrated into docker-compose with volume mounting
- [x] Seed scripts available (sqlite-backend seeds and root-level seeds)

TODO
- [ ] Add /health (HTTP) and GraphQL ping/self-test resolver
- [ ] Extend schema coverage (pagination, filtering, sorting where relevant)
- [ ] Input validation and error handling pass
- [ ] CORS configuration review (web/admin origins)
- [ ] Unit tests for resolvers and a lightweight integration test
- [ ] Plan migration path toward PostgreSQL and service extraction

## Cross-cutting: DevOps/Docs/Infra

Status: Partially blocked (Docker Desktop not running during last attempt)

Implemented
- [x] Lean docker-compose with three services (API 4000, web 3000, admin 3001)
- [x] CHOKIDAR_USEPOLLING in containers to improve Windows file watching
- [x] Legacy modules archived; repo docs cleaned; README reworked
- [x] Added core docs: architecture, deployment guide, microservices plan, production summary

TODO
- [ ] Bring up Docker Compose stack and verify endpoints once Docker Desktop is available
- [ ] Add CI (lint/test/build) and container build pipelines via GitHub Actions
- [ ] Add GitOps/K8s deployment path (refine deploy/k8s, consider Argo CD)
- [ ] Add observability (logs/metrics/traces) and security baselines (rate limits)

## How to update

- Add newly completed items as checked boxes under Implemented
- Move items from TODO to Implemented once merged to main branch
- Keep short and action-oriented; link to issues/PRs when available
