# System Architecture - Current Working State# Architecture Overview



## OverviewThis repository hosts a modular, local-first development stack for a multi-vendor food delivery platform. The current setup emphasizes a simple GraphQL + SQLite backend for fast iteration, with Next.js frontends for both consumer and admin experiences.

Simple, working multivendor food delivery platform with MenuVerse Firebase integration.

## Components

## Core Architecture

- sqlite-backend

```  - Purpose: Single GraphQL API for local/dev, backed by SQLite

┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐  - Tech: Node.js 20, Apollo Server, sqlite3

│   Consumer Web  │────│  MenuVerse API   │────│  Firebase DB    │  - Port: 4000 (HTTP)

│   (Next.js)     │    │   (Firebase)     │    │   (Firestore)   │  - Data: SQLite DB file, WAL mode enabled

│   Port 3000     │    │                  │    │  chopchop-67750 │  - Env:

└─────────────────┘    └──────────────────┘    └─────────────────┘    - DB_FILE: Absolute/relative path to the SQLite database file (default ../enatega.db)

         │

         │- multivendor-web

┌─────────────────┐  - Purpose: Consumer-facing Next.js application

│   Admin Panel   │  - Port: 3000 (host)

│   (Next.js)     │  - Env:

│   Port 3001     │    - NEXT_PUBLIC_SERVER_URL: GraphQL endpoint URL (default http://localhost:4000)

└─────────────────┘

```- multivendor-admin

  - Purpose: Admin-facing Next.js application

## Components  - Port: 3001 (host) mapped from container 3000 in dev

  - Notes: Small TS fix applied to broaden display field types

### 1. Consumer Web App (`multivendor-web/`)

- **Technology**: Next.js 13+ with App Router## Ports and networking

- **Purpose**: Customer-facing restaurant browsing and ordering

- **Key Features**:- 4000: GraphQL API (sqlite-backend)

  - Restaurant listings from MenuVerse Firebase- 3000: Consumer web (multivendor-web)

  - Menu item display with categories- 3001: Admin web (host-mapped to container 3000)

  - Working cart system with localStorage

  - Responsive design with Tailwind CSSAll services communicate over localhost in development. The web apps read the API URL from NEXT_PUBLIC_SERVER_URL.



### 2. MenuVerse Integration## Orchestration (local)

- **Database**: Firebase Firestore (`chopchop-67750`)

- **Collections**: - docker-compose.yml defines a lean 3-service dev stack:

  - `eateries/` - Restaurant data  - sqlite-backend (builds from sqlite-backend/), exposes 4000, mounts DB_FILE volume

  - `eateries/{eateryId}/menu_items` - Menu items (nested)  - multivendor-web (builds from multivendor-web/), exposes 3000, reads NEXT_PUBLIC_SERVER_URL

- **Authentication**: Anonymous auth for public access  - multivendor-admin (builds from multivendor-admin/), exposes 3001->3000

- **API**: Custom Firebase service layer- Windows file watching inside containers is enabled via CHOKIDAR_USEPOLLING=1 to prevent missed changes.



### 3. Admin Dashboard (`multivendor-admin/`)## Data and seeding

- **Technology**: Next.js with admin UI components

- **Purpose**: Content management and system administration- SQLite database file is controlled by DB_FILE; default resolves to ../enatega.db relative to sqlite-backend

- **Status**: Basic interface, connecting to MenuVerse- WAL mode and pragmatic PRAGMA settings are used for dev performance

- Seeding options:

## Data Flow  - sqlite-backend/seed-runner.js and related seed-* scripts

  - Root-level seed scripts (seed.js, run-comprehensive-seed.js, *.sql) for broader datasets

### Restaurant Listing  - dev-backend/seed.js for GraphQL dev backend seeding (alternate path)

1. Web app calls `getRestaurants()` from MenuVerse API

2. Firebase query returns restaurant data from `eateries` collection## Data flow (simplified)

3. Frontend renders restaurant grid with search functionality

1. Client (web/admin) sends GraphQL requests to http://localhost:4000/graphql

### Menu Display  2. Apollo Server resolves queries/mutations against SQLite via sqlite3

1. User navigates to `/restaurant/[id]`3. Responses are returned to the clients; cache and state are managed client-side by their respective frameworks/libraries

2. Web app calls `getRestaurantMenu(id)` from MenuVerse API

3. Firebase query returns menu items from `eateries/{id}/menu_items`## Configuration and environment

4. Frontend renders categorized menu with add-to-cart buttons

- NEXT_PUBLIC_SERVER_URL is the only required client-side env for the UIs

### Cart Management- DB_FILE can point to a mounted path for persistent local DBs or shared datasets

1. User adds items via cart context- Docker images for web/admin are developer-friendly and optimized for hot reloads

2. Cart state managed in React Context

3. Data persisted to localStorage## Decisions and trade-offs

4. Cart totals calculated automatically

- SQLite for local speed and zero external dependencies; plan to migrate to PostgreSQL per service in microservices phase

## Key Design Decisions- GraphQL remains the single API surface for now; future gateway/federation planned

- Minimized services in compose for faster startup and simpler debugging

### ✅ Simplification Wins

- **Single Database**: MenuVerse Firebase (phasing out SQLite GraphQL)## Caveats and edge cases

- **Direct Integration**: Firebase client calls (no complex middleware)

- **Standard Collections**: Following MenuVerse app structure- Windows: EPERM errors can occur on .next files; stop dev servers and delete .next if needed

- **Context State**: Simple React Context for cart (no complex state management)- Port collisions: Ensure ports 4000/3000/3001 are free before starting

- Docker Desktop must be running to use docker-compose; otherwise start services locally via npm scripts

### ✅ Working Features

- Restaurant visibility from real database## Next steps (toward microservices)

- Menu items with correct nested structure

- Functional cart with persistence- Introduce per-domain services (User, Restaurant, Order, Payment, Notification, Admin) with PostgreSQL

- Modern responsive UI- Add API Gateway (Apollo Federation or GraphQL Mesh) and event streaming (Kafka/RabbitMQ)

- Establish CI/CD pipelines, observability, and authentication/authorization layers

### 🔄 Legacy Components (Being Phased Out)
- SQLite backend with GraphQL API
- Complex location selection systems
- Over-engineered address management
- Multiple database connections

## File Structure

```
lib/
├── services/
│   └── menuverse-api.ts     # Firebase API integration
├── context/
│   └── cart.context.tsx     # Cart state management
└── firebase/
    └── menuverse.ts         # Firebase configuration

pages/
├── index.tsx                # Restaurant listings homepage
├── restaurant/[id].tsx      # Restaurant detail pages  
└── cart.tsx                 # Cart management page
```

## Success Metrics

This architecture successfully delivers:
- ✅ Fast restaurant loading from Firebase
- ✅ Accurate menu display with proper data structure  
- ✅ Working cart functionality with persistence
- ✅ Simple, maintainable codebase
- ✅ Responsive user experience

---

**Architecture Status**: Stable and Working ✅  
**Last Updated**: October 27, 2025