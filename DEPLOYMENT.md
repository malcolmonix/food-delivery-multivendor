# Food Delivery MVP - Deployment Guide

## Quick Deploy (Development)
```bash
# Windows
deploy.bat

# Manual steps:
1. cd multivendor-web && npm run build
2. cd ../sqlite-backend && npm start
3. cd ../multivendor-web && npm start
4. Open http://localhost:3000
```

## Production Deploy
```bash
# Windows
deploy-production.bat

# Manual steps:
1. Set NODE_ENV=production
2. Install production dependencies: npm ci --production
3. Build frontend: npm run build
4. Start backend: npm start (in sqlite-backend)
5. Start frontend: npm start (in multivendor-web)
```

## System Requirements
- Node.js 18+ 
- npm 8+
- SQLite (included)
- 2GB RAM minimum
- 1GB disk space

## Ports Used
- **3000**: Frontend (Next.js)
- **4000**: Backend (GraphQL API)

## Environment Variables
Create `.env.local` in `multivendor-web/`:
```env
NEXT_PUBLIC_GRAPHQL_URL=http://localhost:4000/graphql
NODE_ENV=production
```

## Quick Fix Deployment
For continuous delivery and quick fixes:

1. **Make your code changes**
2. **Test locally**: `npm run dev`
3. **Deploy**: Run `deploy.bat`
4. **Verify**: Check http://localhost:3000

## Health Checks
- Frontend: http://localhost:3000 (should show restaurant list)
- Backend: http://localhost:4000/graphql (should show GraphQL playground)
- API Test: Try restaurant query in GraphQL playground

## Troubleshooting
- **Port conflicts**: Kill processes on ports 3000/4000
- **Build fails**: Clear node_modules and reinstall
- **No restaurants**: Check sqlite-backend logs
- **White screen**: Check browser console for errors

## Production Checklist
- [ ] Environment variables set
- [ ] Build completes without errors  
- [ ] Backend starts and serves GraphQL
- [ ] Frontend loads restaurant list
- [ ] Cart functionality works
- [ ] Order placement works

## Continuous Delivery
1. Make small changes
2. Test immediately with `deploy.bat`
3. Fix issues quickly
4. Deploy again
5. Repeat for rapid iteration