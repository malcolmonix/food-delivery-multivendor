# Deployment & Development Guide

This guide covers local development with Docker Compose (preferred) and notes for Windows. It also outlines how you can proceed toward Kubernetes deployments later.

## Prerequisites

- Docker Desktop (for Windows/macOS) or Docker Engine
- Node.js 20+ (if running services locally without Docker)
- Git and VS Code recommended

## Local development (Docker Compose)

1. Ensure Docker Desktop is running
2. In VS Code, use the task: "Install and run dev GraphQL backend" (or run compose directly)
3. Services:
   - sqlite-backend: http://localhost:4000/graphql
   - multivendor-web: http://localhost:3000
   - multivendor-admin: http://localhost:3001

Environment notes:
- API URL for web/admin is provided via NEXT_PUBLIC_SERVER_URL (default http://localhost:4000)
- File watching in containers is enabled with CHOKIDAR_USEPOLLING=1 (helpful on Windows)

## Running without Docker (fallback)

- sqlite-backend: npm install; npm run dev (ensure DB_FILE if using custom path)
- multivendor-web: npm install; npm run dev (ensure NEXT_PUBLIC_SERVER_URL)
- multivendor-admin: npm install; npm run dev (ensure NEXT_PUBLIC_SERVER_URL)

Make sure ports 4000/3000/3001 are free.

## Seeding the database

You can seed using one of the following paths depending on what you’re testing:

- sqlite-backend seeds (recommended when using sqlite-backend):
  - sqlite-backend/seed-runner.js with seed-* files (e.g., seed-fastfoods.js, seed-locations.sql)
- Root-level seeds (broader sample data):
  - seed.js, run-comprehensive-seed.js, seed.sql, schema-matched-seed.sql, comprehensive-seed.sql
- dev-backend (alternative GraphQL backend seeding):
  - dev-backend/seed.js, seed-orders.js

## Windows-specific notes

- EPERM errors on Next.js .next files:
  - Stop dev servers, close terminals pointing at the folder, remove .next, and restart
- PowerShell environment variables:
  - Use $env:VAR="value" for setting env vars in the current session
- Docker Desktop must be running for compose; otherwise you’ll see pipe/socket errors

## Kubernetes (future)

- Manifests live under deploy/k8s; these are starting points and may need updates as services evolve
- Recommended additions before production:
  - Ingress controller, TLS, secret management (e.g., External Secrets), and resource requests/limits
  - CI/CD with GitHub Actions building/pushing images and GitOps (e.g., Argo CD) applying manifests
  - Observability (Prometheus/Grafana/OpenTelemetry), centralized logging, and alerting

## Troubleshooting checklist

- Ports busy: Free 4000/3000/3001 or update compose and env values
- API unreachable from web: Verify NEXT_PUBLIC_SERVER_URL, and that sqlite-backend is listening on 4000
- File changes not reloading: Polling is enabled in containers; on host, confirm watchers aren’t hitting OS limits
