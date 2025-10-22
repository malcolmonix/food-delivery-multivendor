# sqlite-backend

SQLite-backed GraphQL server for local development.

## Port policy (must be 4000)

- This service MUST listen on http://localhost:4000.
- Do not change this port. The web app (menu listing, purchase, checkout) points to port 4000 by default via:
  - enatega-multivendor-web/.env.local:
    - NEXT_PUBLIC_SERVER_URL=http://localhost:4000/
    - NEXT_PUBLIC_WS_SERVER_URL=ws://localhost:4000/
  - Apollo client fallback in `lib/hooks/useSetApollo.tsx` also defaults to 4000 for localhost development.

If you absolutely need a different port, you must change ALL of the following accordingly:
- enatega-multivendor-web/.env.local -> NEXT_PUBLIC_SERVER_URL and NEXT_PUBLIC_WS_SERVER_URL
- Any hard-coded localhost fallbacks within compiled artifacts (clean and rebuild after changes)

Note: Only run one backend on port 4000 at a time. If `dev-backend` is running on 4000, stop it before starting `sqlite-backend`, or vice versa.

## Quick start

1. Install deps
   - `npm i`
2. Seed data (optional)
   - `npm run seed:locations`
   - `npm run seed:fastfoods`
3. Start server
   - `npm start`

On success, GraphQL Playground will be available at:
- http://localhost:4000/graphql

## Key Queries for Web App

### Restaurant Listing (`nearByRestaurantsPreview`)

The web app's restaurant listing uses this query from `lib/api/graphql/queries/restaurants/index.ts`:

```graphql
query Restaurants($latitude: Float, $longitude: Float, $page: Int, $limit: Int, $shopType: String) {
  nearByRestaurantsPreview(
    latitude: $latitude
    longitude: $longitude
    page: $page
    limit: $limit
    shopType: $shopType
  ) {
    restaurants {
      _id name image logo slug shopType deliveryTime
      location { coordinates }
      reviewAverage cuisines
      openingTimes { day times { startTime endTime } }
      isAvailable isActive
    }
  }
}
```

**How it works:**
- Web app passes `latitude` and `longitude` from user location (defaults to Uyo: 5.0389, 7.9135 if not set)
- Resolver returns **ALL** restaurants when no `city`/`state` filters are provided
- Optional: Pass `city` and/or `state` to filter by restaurant address (e.g., `"Calabar, Cross River"`)
- Returns paginated results with rich preview data

**Testing from PowerShell:**
```powershell
# Test restaurant list with lat/lon only (should return all restaurants)
$body = '{"query":"{ nearByRestaurantsPreview(latitude: 5.0389, longitude: 7.9135, page: 1, limit: 5) { restaurants { _id name } } }"}'; 
Invoke-RestMethod -Uri "http://localhost:4000/graphql" -Method POST -Body $body -ContentType "application/json"

# Test with city filter (returns only Calabar restaurants)
$body = '{"query":"{ nearByRestaurantsPreview(city: \"Calabar\", state: \"Cross River\", page: 1, limit: 5) { restaurants { _id name } } }"}'; 
Invoke-RestMethod -Uri "http://localhost:4000/graphql" -Method POST -Body $body -ContentType "application/json"
```

## Troubleshooting

### "Failed to fetch" or empty restaurant list

1. **Check if backend is running on port 4000:**
   ```powershell
   netstat -ano | Select-String ":4000"
   ```
   - Should show `LISTENING` on port 4000
   - If not, start backend: `cd sqlite-backend; npm start`

2. **Test GraphQL endpoint directly:**
   ```powershell
   $body = '{"query":"{ restaurants { _id name } }"}'; 
   Invoke-RestMethod -Uri "http://localhost:4000/graphql" -Method POST -Body $body -ContentType "application/json"
   ```
   - Should return list of restaurants
   - If error, check server logs

3. **Verify database has data:**
   - Open `../enatega.db` with SQLite browser
   - Run: `SELECT COUNT(*) FROM restaurants` → should return > 0
   - If empty, run seed: `npm run seed:fastfoods`

4. **Check web app .env.local:**
   ```bash
   # enatega-multivendor-web/.env.local should contain:
   NEXT_PUBLIC_SERVER_URL=http://localhost:4000/
   NEXT_PUBLIC_WS_SERVER_URL=ws://localhost:4000/
   NODE_ENV=development
   ```
   - After changing, restart web app: `npm run dev`

5. **CORS issues:**
   - Backend allows `http://localhost:3000` and `http://localhost:3001` by default
   - If web app runs on different port, add to `cors()` config in `index.js`

### Port already in use
- Stop any process on 4000 (e.g., `dev-backend`):
  ```powershell
  # Find process on port 4000
  netstat -ano | Select-String ":4000"
  # Stop it (replace XXXX with PID)
  Stop-Process -Id XXXX -Force
  ```
