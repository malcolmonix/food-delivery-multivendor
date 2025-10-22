# SQLite Backend Port Policy

## ⚠️ CRITICAL: Port 4000 is Required

The `sqlite-backend` GraphQL server **MUST** run on port 4000.

### Why Port 4000?

The `enatega-multivendor-web` application has hardcoded references to `http://localhost:4000/` for:

1. **Menu listing** - Fetching restaurant data via `nearByRestaurantsPreview` query
2. **Purchase flow** - Order creation and cart management
3. **Checkout process** - Payment and order finalization

### Configuration Files That Depend on Port 4000

#### 1. `enatega-multivendor-web/.env.local`
```bash
NEXT_PUBLIC_SERVER_URL=http://localhost:4000/
NEXT_PUBLIC_WS_SERVER_URL=ws://localhost:4000/
NODE_ENV=development
```

#### 2. `enatega-multivendor-web/lib/hooks/useSetApollo.tsx`
```typescript
// Fallback defaults for development
const SERVER_URL = envServerUrl && envServerUrl.length > 0
  ? envServerUrl
  : (isDev ? 'http://localhost:4000/' : '');  // ← Hardcoded port 4000

const WS_SERVER_URL = envWsUrl && envWsUrl.length > 0
  ? envWsUrl
  : (isDev ? 'ws://localhost:4000/' : '');    // ← Hardcoded port 4000
```

#### 3. `sqlite-backend/index.js`
```javascript
// IMPORTANT: Do NOT change this port. Other apps (web menu, purchase, checkout)
// assume the SQLite GraphQL backend is available on http://localhost:4000/.
// If you must override, update enatega-multivendor-web/.env.local accordingly.
const PORT = process.env.PORT || 4000;
```

## If You MUST Change the Port

**Only change the port if absolutely necessary.** If you do:

1. Update `sqlite-backend/index.js`:
   ```javascript
   const PORT = process.env.PORT || YOUR_NEW_PORT;
   ```

2. Update `enatega-multivendor-web/.env.local`:
   ```bash
   NEXT_PUBLIC_SERVER_URL=http://localhost:YOUR_NEW_PORT/
   NEXT_PUBLIC_WS_SERVER_URL=ws://localhost:YOUR_NEW_PORT/
   ```

3. Update `enatega-multivendor-web/lib/hooks/useSetApollo.tsx`:
   ```typescript
   const SERVER_URL = isDev ? 'http://localhost:YOUR_NEW_PORT/' : '';
   const WS_SERVER_URL = isDev ? 'ws://localhost:YOUR_NEW_PORT/' : '';
   ```

4. **Rebuild and restart both applications:**
   ```bash
   # Terminal 1: Restart backend
   cd sqlite-backend
   npm start

   # Terminal 2: Restart web app
   cd enatega-multivendor-web
   npm run dev
   ```

5. **Clear browser cache and hard refresh** (Ctrl+Shift+R)

## Conflict Resolution

### Only One Backend at a Time

You cannot run both `dev-backend` and `sqlite-backend` on port 4000 simultaneously.

**Check what's running on port 4000:**
```powershell
netstat -ano | Select-String ":4000"
```

**Stop a process (Windows PowerShell):**
```powershell
Stop-Process -Id PROCESS_ID -Force
```

**Example workflow:**
```powershell
# 1. Check current process on port 4000
netstat -ano | Select-String ":4000"
# Output: TCP  0.0.0.0:4000  LISTENING  12345

# 2. Stop it
Stop-Process -Id 12345 -Force

# 3. Start sqlite-backend
cd sqlite-backend
npm start
```

## Testing the Connection

### PowerShell Test Script

```powershell
# Test basic restaurant query
$body = '{"query":"{ restaurants { _id name } }"}';
$result = Invoke-RestMethod -Uri "http://localhost:4000/graphql" -Method POST -Body $body -ContentType "application/json";
Write-Host "Found $($result.data.restaurants.Count) restaurants";
$result.data.restaurants | Select-Object -First 5 | Format-Table

# Test nearByRestaurantsPreview (what web app uses)
$query = '{"query":"query Restaurants($latitude: Float, $longitude: Float, $page: Int, $limit: Int) { nearByRestaurantsPreview(latitude: $latitude, longitude: $longitude, page: $page, limit: $limit) { restaurants { _id name isAvailable isActive } } }","variables":{"latitude":5.0389,"longitude":7.9135,"page":1,"limit":5}}';
$result = Invoke-RestMethod -Uri "http://localhost:4000/graphql" -Method POST -Body $query -ContentType "application/json";
Write-Host "Found $($result.data.nearByRestaurantsPreview.restaurants.Count) nearby restaurants";
$result.data.nearByRestaurantsPreview.restaurants | Format-Table
```

### Expected Output

```
Found 44 restaurants
_id name
--- ----
1   Burger Palace
2   Pizza Corner
3   Sakura Sushi
...

Found 5 nearby restaurants
_id name                           isAvailable isActive
--- ----                           ----------- --------
19  AJ's PiriPiri                 True        True
20  Amys Patisserie               True        True
35  Apples Fried Chicken Ltd      True        True
...
```

## Common Issues and Solutions

### Issue: "Failed to fetch" in web app

**Cause:** Backend not running on port 4000

**Solution:**
```powershell
cd sqlite-backend
npm start
```

### Issue: "Port 4000 already in use"

**Cause:** Another process (dev-backend, old instance) is using port 4000

**Solution:**
```powershell
# Find and stop the process
netstat -ano | Select-String ":4000"
Stop-Process -Id PROCESS_ID -Force

# Start sqlite-backend
npm start
```

### Issue: Empty restaurant list

**Cause:** Database not seeded OR query parameters incorrect

**Solution:**
```bash
# Check database has restaurants
cd sqlite-backend
npm run seed:fastfoods

# Verify with direct query
$body = '{"query":"{ restaurants { _id name } }"}';
Invoke-RestMethod -Uri "http://localhost:4000/graphql" -Method POST -Body $body -ContentType "application/json"
```

### Issue: CORS errors in browser console

**Cause:** Web app running on a port not in the CORS whitelist

**Solution:** Add your port to `sqlite-backend/index.js`:
```javascript
app.use(
  cors({
    origin: [
      'http://localhost:3000',
      'http://localhost:3001',
      'http://localhost:YOUR_PORT',  // ← Add your port
    ],
    credentials: true,
    optionsSuccessStatus: 200,
  })
);
```

## DO NOT CHANGE THIS PORT

**Final reminder:** Changing this port creates a cascade of changes across multiple files and requires coordinated updates, testing, and deployment. Unless you have a compelling reason, **DO NOT CHANGE THE PORT from 4000**.

---

**Last Updated:** 2025-10-22  
**Responsible Team:** Backend & Web Development  
**Change Policy:** Any port changes require approval from both backend and frontend teams
