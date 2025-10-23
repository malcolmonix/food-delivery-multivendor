# Microservices Migration Plan

This document proposes a phased migration from the monolithic sqlite-backend to a set of domain-driven microservices.

## Target architecture

- API Gateway
  - Option A: Apollo Gateway (federation)
  - Option B: GraphQL Mesh over REST/GRPC backends
- Services (suggested)
  - User Service (auth, profiles) — PostgreSQL
  - Restaurant Service (menus, opening hours) — PostgreSQL
  - Order Service (cart, checkout, order state machine) — PostgreSQL
  - Payment Service (payment intents, webhooks) — PostgreSQL + provider SDKs
  - Notification Service (email/SMS/push) — queue-backed workers
  - Admin Service (admin-specific queries/mutations) — PostgreSQL (or federated from other services)
- Messaging
  - Kafka or RabbitMQ for events (order placed, payment captured, delivery status updates)
- Observability
  - OpenTelemetry instrumentation, Prometheus metrics, Grafana dashboards
- Security
  - JWT/OAuth2 (per service validation), rate limiting at gateway, audit logs

## Data strategy

- DB-per-service: PostgreSQL schemas per service
- Migrations: Prisma/Migrate or Flyway (uniform across services)
- Event-driven integration: Outbox pattern for reliable event publishing

## CI/CD

- GitHub Actions for build/test/lint + container image builds (per service)
- GitOps with Argo CD: versioned manifests in a separate repo/environment folders
- Promotion via tags/branches (dev → staging → prod)

## Phased migration

1. Prepare monolith for split
   - Define clear module boundaries in sqlite-backend
   - Extract shared contracts (GraphQL schemas, types)

2. Carve out Order Service (first candidate)
   - Stand up Order Service with PostgreSQL
   - Proxy relevant GraphQL fields through gateway
   - Migrate write paths first, then reads

3. Extract User and Restaurant Services
   - Move auth and catalog domains next
   - Introduce SSO/OIDC integration as needed

4. Add Payment and Notification Services
   - Integrate with payment provider(s) and webhook handlers
   - Introduce async notifications via queue

5. Hardening and scale
   - Add rate limiting, WAF, idempotency keys, retries/backoff
   - Implement SLOs and error budgets, autoscaling policies

## Risks and mitigations

- Cross-service transactions: use sagas and idempotency
- Schema drift and breaking changes: contract tests and versioning
- Operational complexity: templates, scaffolding, and platform tooling

## Success criteria

- Independent deployability of services
- No degraded user experience during migration
- Observability and SLOs in place
