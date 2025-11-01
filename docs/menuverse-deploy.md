MenuVerse CI/CD to VPS (template)

This document mirrors the ChopChop pipeline and adapts it for MenuVerse.

What’s included
- GitHub Actions workflow: `.github/workflows/menuverse-ci.yml`
- Server compose template: `scripts/menuverse/docker-compose.yml`
- Secrets checklist and Dockerfile notes

GitHub Secrets (repo → Settings → Secrets and variables → Actions)
- VPS_HOST: your server IP or hostname
- VPS_USERNAME: ssh user (e.g., root)
- VPS_SSH_KEY: private key contents (PEM/openssh). Use a deploy key account restricted to this VPS.
- SLACK_WEBHOOK: optional Slack incoming webhook
- NEXT_PUBLIC_APP_NAME
- NEXT_PUBLIC_API_URL
- NEXT_PUBLIC_GRAPHQL_ENDPOINT
- NEXT_PUBLIC_FIREBASE_API_KEY
- NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
- NEXT_PUBLIC_FIREBASE_PROJECT_ID
- NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
- NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
- NEXT_PUBLIC_FIREBASE_APP_ID
- NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
- FIREBASE_SERVICE_ACCOUNT (JSON string, server-only, if used)

Dockerfile change (required for baking public env into the Next build)
Add these lines near the top of your build stage (before `RUN npm run build`):

ARG NEXT_PUBLIC_APP_NAME
ARG NEXT_PUBLIC_API_URL
ARG NEXT_PUBLIC_GRAPHQL_ENDPOINT
ARG NEXT_PUBLIC_FIREBASE_API_KEY
ARG NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
ARG NEXT_PUBLIC_FIREBASE_PROJECT_ID
ARG NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
ARG NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
ARG NEXT_PUBLIC_FIREBASE_APP_ID
ARG NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID

ENV NEXT_PUBLIC_APP_NAME=$NEXT_PUBLIC_APP_NAME \
    NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL \
    NEXT_PUBLIC_GRAPHQL_ENDPOINT=$NEXT_PUBLIC_GRAPHQL_ENDPOINT \
    NEXT_PUBLIC_FIREBASE_API_KEY=$NEXT_PUBLIC_FIREBASE_API_KEY \
    NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=$NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN \
    NEXT_PUBLIC_FIREBASE_PROJECT_ID=$NEXT_PUBLIC_FIREBASE_PROJECT_ID \
    NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=$NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET \
    NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=$NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID \
    NEXT_PUBLIC_FIREBASE_APP_ID=$NEXT_PUBLIC_FIREBASE_APP_ID \
    NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=$NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID

This ensures client code sees the values at runtime and avoids the "Firebase API key is missing" error.

Optional health endpoint (Next.js)
Add a minimal handler if you don’t have one yet:

`app/api/health/route.ts` (App Router)
export async function GET() { return Response.json({ ok: true }); }

or `pages/api/health.ts` (Pages Router)
export default function handler(_req, res) { res.status(200).json({ ok: true }); }

Server paths and ports
- The workflow provisions `/opt/menuverse-app` and exposes port 3002 on the VPS → container 3000
- If you use Nginx, proxy your domain to `http://127.0.0.1:3002`

Example Nginx vhost
server {
    server_name menuverse.example.com;
    listen 80;
    location / {
        proxy_pass http://127.0.0.1:3002;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}

Troubleshooting
- Health check fails: run `docker logs --tail=200 menuverse` on the server.
- Firebase key missing: verify Dockerfile ENV lines above and that GitHub secrets are set.
- GHCR private pulls: supply GHCR_PAT and run `docker login ghcr.io` in the deploy step before `docker pull`.
