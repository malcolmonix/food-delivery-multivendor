# Multi-Repository Architecture Setup Guide

## 🏗️ Repository Structure Overview

```
🍕 Customer App
├── ChopChop (https://github.com/malcolmonix/ChopChop)
│   └── Customer food delivery interface

🏪 Restaurant Platform  
├── MenuVerse (https://github.com/malcolmonix/MenuVerse) ✅
│   └── Restaurant management platform

🔧 Backend Services
├── food-delivery-api (https://github.com/malcolmonix/food-delivery-api)
│   └── GraphQL API, Authentication, Orders
├── food-delivery-admin (https://github.com/malcolmonix/food-delivery-admin)
│   └── System administration panel

⚙️ Infrastructure
├── food-delivery-infrastructure (https://github.com/malcolmonix/food-delivery-infrastructure)
│   └── Docker, K8s, Terraform, Monitoring
```

## 🚀 Step-by-Step Migration Plan

### Phase 1: Create ChopChop Repository

1. **Create new repository**: `https://github.com/malcolmonix/ChopChop`

2. **Extract multivendor-web content**:
   ```bash
   # Create new directory
   mkdir ChopChop
   cd ChopChop
   
   # Copy multivendor-web files
   cp -r ../food-delivery-multivendor/multivendor-web/* .
   
   # Initialize git
   git init
   git remote add origin https://github.com/malcolmonix/ChopChop.git
   ```

3. **Update package.json**:
   ```json
   {
     "name": "chopchop",
     "description": "Fast food delivery app for customers",
     "version": "1.0.0"
   }
   ```

### Phase 2: Create Backend API Repository

1. **Create**: `https://github.com/malcolmonix/food-delivery-api`

2. **Extract backend content**:
   ```bash
   mkdir food-delivery-api
   cd food-delivery-api
   
   # Copy dev-backend and sqlite-backend
   cp -r ../food-delivery-multivendor/dev-backend/* .
   cp -r ../food-delivery-multivendor/sqlite-backend ./sqlite-backend/
   ```

### Phase 3: Create Admin Repository

1. **Create**: `https://github.com/malcolmonix/food-delivery-admin`

2. **Extract admin content**:
   ```bash
   mkdir food-delivery-admin
   cd food-delivery-admin
   
   # Copy multivendor-admin files
   cp -r ../food-delivery-multivendor/multivendor-admin/* .
   ```

### Phase 4: Create Infrastructure Repository

1. **Create**: `https://github.com/malcolmonix/food-delivery-infrastructure`

2. **Move DevOps files**:
   ```bash
   mkdir food-delivery-infrastructure
   cd food-delivery-infrastructure
   
   # Copy infrastructure files
   cp -r ../food-delivery-multivendor/nginx ./
   cp -r ../food-delivery-multivendor/scripts ./
   cp ../food-delivery-multivendor/docker-compose*.yml ./
   cp ../food-delivery-multivendor/.env.example ./
   ```

## 📦 Docker Compose Orchestration

### Main Infrastructure Repository

**docker-compose.yml** (in infrastructure repo):

```yaml
version: '3.8'

services:
  # ChopChop Customer App
  chopchop:
    image: ghcr.io/malcolmonix/chopchop:latest
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - NEXT_PUBLIC_API_URL=http://api:4000/graphql
    depends_on:
      - api
    restart: unless-stopped
    networks:
      - food-delivery-network

  # MenuVerse Restaurant Platform
  menuverse:
    image: ghcr.io/malcolmonix/menuverse:latest
    ports:
      - "3002:3000"
    environment:
      - NODE_ENV=production
      - NEXT_PUBLIC_API_URL=http://api:4000/graphql
    depends_on:
      - api
    restart: unless-stopped
    networks:
      - food-delivery-network

  # Backend API
  api:
    image: ghcr.io/malcolmonix/food-delivery-api:latest
    ports:
      - "4000:4000"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=${DATABASE_URL}
      - JWT_SECRET=${JWT_SECRET}
    depends_on:
      - postgres
      - redis
    restart: unless-stopped
    networks:
      - food-delivery-network

  # Admin Panel
  admin:
    image: ghcr.io/malcolmonix/food-delivery-admin:latest
    ports:
      - "3001:3000"
    environment:
      - NODE_ENV=production
      - NEXT_PUBLIC_API_URL=http://api:4000/graphql
    depends_on:
      - api
    restart: unless-stopped
    networks:
      - food-delivery-network

  # Infrastructure services
  postgres:
    image: postgres:15-alpine
    environment:
      - POSTGRES_DB=${POSTGRES_DB}
      - POSTGRES_USER=${POSTGRES_USER}
      - POSTGRES_PASSWORD=${POSTGRES_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    restart: unless-stopped
    networks:
      - food-delivery-network

  redis:
    image: redis:7-alpine
    volumes:
      - redis_data:/data
    restart: unless-stopped
    networks:
      - food-delivery-network

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf
      - ./nginx/ssl:/etc/nginx/ssl
    depends_on:
      - chopchop
      - menuverse
      - admin
      - api
    restart: unless-stopped
    networks:
      - food-delivery-network

volumes:
  postgres_data:
  redis_data:

networks:
  food-delivery-network:
    driver: bridge
```

## 🔄 Independent CI/CD Pipelines

### Benefits of Separate Pipelines:

1. **Faster Builds**: Only changed services rebuild
2. **Independent Releases**: Deploy ChopChop without affecting MenuVerse
3. **Focused Testing**: Service-specific tests
4. **Better Resource Usage**: Smaller Docker images

### Pipeline Triggers:

```yaml
# ChopChop Repository
on:
  push:
    branches: [main]
  # Triggers infrastructure update when ChopChop changes

# MenuVerse Repository  
on:
  push:
    branches: [main]
  # Triggers infrastructure update when MenuVerse changes

# Infrastructure Repository
on:
  push:
    branches: [main]
  workflow_dispatch:
  repository_dispatch:
    types: [chopchop-updated, menuverse-updated, api-updated]
```

## 🔧 Repository Communication

### GitHub Actions Cross-Repository Triggers:

```yaml
# In ChopChop repository
- name: Trigger Infrastructure Update
  uses: peter-evans/repository-dispatch@v2
  with:
    token: ${{ secrets.PERSONAL_ACCESS_TOKEN }}
    repository: malcolmonix/food-delivery-infrastructure
    event-type: chopchop-updated
    client-payload: '{"ref": "${{ github.ref }}", "sha": "${{ github.sha }}"}'
```

## ✅ Migration Checklist

- [ ] Create ChopChop repository
- [ ] Create food-delivery-api repository  
- [ ] Create food-delivery-admin repository
- [ ] Create food-delivery-infrastructure repository
- [ ] Set up GitHub secrets for each repository
- [ ] Configure cross-repository triggers
- [ ] Update domain routing
- [ ] Test independent deployments
- [ ] Update documentation

## 🎯 Next Steps

1. **Would you like me to help create the ChopChop repository setup?**
2. **Should we extract the multivendor-web content first?**
3. **Do you want to set up the infrastructure repository?**

This multi-repo approach will give you:
- ⚡ Faster CI/CD pipelines
- 🔧 Independent service updates
- 📦 Smaller, focused deployments
- 🛡️ Better security boundaries
- 👥 Team-specific development workflows

What would you like to tackle first?