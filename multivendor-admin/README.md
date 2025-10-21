# Multivendor Admin (Modern)

A modern, fast Next.js 14 admin dashboard integrated with your existing SQLite GraphQL backend.

## Quick start

1. Copy env
```
cp .env.example .env.local
```
2. Install deps
```
npm install
```
3. Run dev
```
npm run dev
```

Backend expected at http://localhost:4000/graphql.

## Features
- Next.js 14 App Router + TypeScript
- Tailwind CSS
- Apollo Client (HTTP + WS)
- next-intl
- Basic login (ownerLogin), token saved in localStorage
- Protected /dashboard

## Troubleshooting
- If you see CORS errors, ensure backend allows http://localhost:3000 origin.
- Clear Service Worker/Cache if stale requests persist (Application tab → Unregister + Clear site data).
