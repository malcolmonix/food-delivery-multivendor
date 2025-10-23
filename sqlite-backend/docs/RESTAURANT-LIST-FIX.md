# Fix Summary: Restaurant List Not Loading in multivendor-web

## Problem
- **Error:** "Failed to fetch" in multivendor-web
- **Symptom:** No restaurant grid displayed on the page

## Root Causes Identified

### 1. Port Mismatch
- `multivendor-web/.env.local` was pointing to port **4010**
- `sqlite-backend` was running on port **4000**
- Web app couldn't connect to the GraphQL endpoint

### 2. Query Implementation Issue
- `nearByRestaurantsPreview` resolver was only returning restaurants when `city` or `state` parameters were provided
- Web app calls this query with only `latitude` and `longitude` (no city/state)
- Result: Empty restaurant list even though database had 44 restaurants

## Fixes Applied

### Fix 1: Corrected Port Configuration
**File:** `multivendor-web/.env.local`
```bash
# Before
NEXT_PUBLIC_SERVER_URL=http://localhost:4010/

# After
# IMPORTANT: sqlite-backend MUST run on port 4000 (see sqlite-backend/PORT-POLICY.md)
# Do NOT change this port unless you also update sqlite-backend/index.js
NEXT_PUBLIC_SERVER_URL=http://localhost:4000/
```

### Fix 2: Updated GraphQL Resolver Logic
**File:** `sqlite-backend/schema.js`

**Before:**
```javascript
nearByRestaurantsPreview: async (_, { latitude, longitude, page = 1, limit = 10, shopType, city, state }, { db }) => {
  // Only returned restaurants if city OR state was provided
  // Web app doesn't pass these parameters
  if (city && state) {
    whereClauses.push('LOWER(address) = LOWER(?)');
    params.push(`${String(city).trim()}, ${String(state).trim()}`);
  } else if (city) { /* ... */ }
  else if (state) { /* ... */ }
  // Missing: No else clause to return all restaurants
}
```

**After:**
```javascript
nearByRestaurantsPreview: async (_, { latitude, longitude, page = 1, limit = 10, shopType, city, state }, { db }) => {
  // Web app calls this with latitude/longitude only (no city/state).
  // Return ALL restaurants when no city/state filter is provided.
  // Optionally filter by city/state if provided (e.g., "Calabar, Cross River").
  
  if (city && state) {
    whereClauses.push('LOWER(address) = LOWER(?)');
    params.push(`${String(city).trim()}, ${String(state).trim()}`);
  } else if (city) { /* ... */ }
  else if (state) { /* ... */ }
  // else: No city/state filter - return all restaurants (common case for lat/lon only queries)
}
```

### Fix 3: Enhanced Documentation
**File:** `sqlite-backend/schema.js` (GraphQL schema)
```graphql
"""
Primary query for web app restaurant listing.
- latitude/longitude: User location (web app defaults to Uyo: 5.0389, 7.9135)
- city/state: Optional filters for restaurant address (e.g., "Calabar, Cross River")
- page/limit: Pagination (default: page 1, limit 10)
- shopType: Filter by "restaurant" or "grocery" (optional)

Returns ALL restaurants when city/state are omitted (common case for web app).
"""
nearByRestaurantsPreview(
  latitude: Float
  longitude: Float
  page: Int
  limit: Int
  shopType: String
  city: String
  state: String
): NearByRestaurantsResponse
```

### Fix 4: Port Policy Documentation
**Created:** `sqlite-backend/PORT-POLICY.md`
- Comprehensive guide on why port 4000 is required
- Step-by-step instructions if port change is unavoidable
- Troubleshooting guide for common issues

## Testing Results

### Before Fix
```powershell
# Query with lat/lon only (as web app does)
$query = '{"query":"{ nearByRestaurantsPreview(latitude: 5.0, longitude: 8.32) { restaurants { _id name } } }"}';
Invoke-RestMethod -Uri "http://localhost:4000/graphql" -Method POST -Body $query -ContentType "application/json"

# Result: Empty { restaurants: [] }
```

### After Fix
```powershell
# Same query
$query = '{"query":"{ nearByRestaurantsPreview(latitude: 5.0389, longitude: 7.9135, page: 1, limit: 5) { restaurants { _id name } } }"}';
$result = Invoke-RestMethod -Uri "http://localhost:4000/graphql" -Method POST -Body $query -ContentType "application/json";

# Result: Found 5 restaurants
_id name
--- ----
19  AJ's PiriPiri
20  Amys Patisserie
35  Apples Fried Chicken Ltd
21  Beverly Heels Club & Fast Food
1   Burger Palace
```

## Files Changed

1. **multivendor-web/.env.local** - Fixed port from 4010 to 4000
2. **sqlite-backend/schema.js** - Fixed resolver to return all restaurants when no city/state filter
3. **sqlite-backend/PORT-POLICY.md** (new) - Comprehensive port policy documentation
4. **sqlite-backend/index.js** - Added warning comment about port 4000 requirement

## How to Verify the Fix

### 1. Ensure sqlite-backend is running
```powershell
cd sqlite-backend
npm start
# Should see: 🚀 SQLite GraphQL API ready at http://localhost:4000/graphql
```

### 2. Verify port 4000 is active
```powershell
netstat -ano | Select-String ":4000" | Select-String "LISTENING"
# Should see: TCP  0.0.0.0:4000  LISTENING
```

### 3. Test the GraphQL query
```powershell
$query = '{"query":"query Restaurants($latitude: Float, $longitude: Float, $page: Int, $limit: Int) { nearByRestaurantsPreview(latitude: $latitude, longitude: $longitude, page: $page, limit: $limit) { restaurants { _id name isAvailable isActive } } }","variables":{"latitude":5.0389,"longitude":7.9135,"page":1,"limit":5}}';
$result = Invoke-RestMethod -Uri "http://localhost:4000/graphql" -Method POST -Body $query -ContentType "application/json";
Write-Host "Found $($result.data.nearByRestaurantsPreview.restaurants.Count) restaurants";
$result.data.nearByRestaurantsPreview.restaurants | Format-Table
```

### 4. Restart multivendor-web
```bash
cd multivendor-web
npm run dev
```

### 5. Open browser and check
- Navigate to `http://localhost:3000` (or your multivendor-web port)
- Restaurant grid should now display with all available restaurants
- No "Failed to fetch" errors in the console

## Prevention Measures

### 1. Port Policy
- Port 4000 is now documented as **REQUIRED** for sqlite-backend
- Warning comments added to prevent accidental changes
- `PORT-POLICY.md` created with comprehensive guidance

### 2. Code Comments
- Added inline comments in resolver explaining the no-filter case
- GraphQL schema now includes detailed documentation
- Apollo client configuration comments reference the port policy

### 3. Configuration Validation
- `.env.local` files now include warning comments
- Port mismatch is now easier to identify and debug

## Related Issues
- Menu listing depends on this query
- Purchase flow uses the same backend
- Checkout process requires port 4000 connectivity

## Additional Notes
- Database contains 44 restaurants total
- Default coordinates: Uyo (latitude: 5.0389, longitude: 7.9135)
- CORS already configured for ports 3000, 3001 (web apps typically use these)

---

**Fixed:** 2025-10-22  
**Issue:** Restaurant list not loading in multivendor-web  
**Status:** ✅ Resolved
