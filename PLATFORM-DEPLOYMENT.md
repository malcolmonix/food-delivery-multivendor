# 🍕 Chop Chop & MenuVerse Platform Deployment Guide

## Platform Overview

**Chop Chop** - Customer-facing food delivery application
**MenuVerse** - Restaurant/vendor management platform
**Admin Panel** - System administration interface

## 🚀 Quick VPS Deployment

### Prerequisites

- VPS server (Ubuntu 20.04+ recommended)
- SSH access to VPS (145.14.158.29)
- Domain names for both platforms (optional but recommended)

### 1. SSH Key Setup (Already Done ✅)

Your SSH key is configured:
- Public Key: `ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIOECw8Sg6RGNCTRKTiUTMXQLmF5YI4/qdtbaJVqzyf98 malcolmonix@gmail.com`

### 2. VPS Deployment Options

#### Option A: Automated PowerShell Deployment (Windows)
```powershell
# From your project directory
.\deploy-vps.ps1 -ChopChopDomain "yourchopchop.com" -MenuVerseDomain "yourmenuverse.com"
```

#### Option B: Manual VPS Setup
```bash
# SSH into your VPS
ssh root@145.14.158.29

# Clone repository
git clone https://github.com/malcolmonix/food-delivery-multivendor.git /opt/chopchop-menuverse-platform
cd /opt/chopchop-menuverse-platform

# Run deployment script
chmod +x scripts/deploy.sh
CHOPCHOP_DOMAIN=yourchopchop.com MENUVERSE_DOMAIN=yourmenuverse.com ./scripts/deploy.sh setup
```

## 🐳 Service Architecture

| Service | Port | Domain | Description |
|---------|------|---------|-------------|
| **Chop Chop** | 3000 | chopchop.com | Customer food delivery app |
| **MenuVerse** | 3002 | menuverse.com | Restaurant management platform |
| **Admin** | 3001 | chopchop.com/admin | System administration |
| **API** | 4000 | chopchop.com/api | GraphQL API server |
| **SQLite API** | 5000 | - | Alternative SQLite backend |
| **PostgreSQL** | 5432 | - | Main database |
| **Redis** | 6379 | - | Caching & sessions |
| **Nginx** | 80,443 | - | Reverse proxy & SSL |

## ⚙️ Configuration

### Environment Variables (.env)

```env
# Application Branding
CHOPCHOP_APP_NAME="Chop Chop"
MENUVERSE_APP_NAME="MenuVerse"

# Domains
NEXT_PUBLIC_CHOPCHOP_URL=https://chopchop.com
NEXT_PUBLIC_MENUVERSE_URL=https://menuverse.com

# Database
DATABASE_URL=postgresql://chopchop_user:password@postgres:5432/chopchop_db

# Security
JWT_SECRET=your_secure_jwt_secret
CORS_ORIGIN=https://chopchop.com,https://menuverse.com

# Payment (Stripe)
STRIPE_SECRET_KEY=sk_live_your_stripe_key
STRIPE_PUBLISHABLE_KEY=pk_live_your_stripe_key

# Firebase (for MenuVerse)
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk@your-project.iam.gserviceaccount.com

# File Storage (Cloudinary)
CLOUDINARY_URL=cloudinary://api_key:api_secret@cloud_name
```

## 🔄 GitHub Actions CI/CD

### GitHub Secrets Required

Add these to your repository secrets:

```
VPS_HOST=145.14.158.29
VPS_USERNAME=root
VPS_SSH_KEY=<your-private-ssh-key>
VPS_PORT=22
SLACK_WEBHOOK=<optional-slack-webhook>
```

### Automated Deployment

Pushes to `main` branch automatically:
1. Run tests for all services
2. Build Docker images
3. Deploy to VPS
4. Run health checks
5. Notify via Slack (optional)

## 🌐 Domain Configuration

### DNS Setup

Point your domains to your VPS IP:

```
A    chopchop.com       145.14.158.29
A    www.chopchop.com   145.14.158.29
A    menuverse.com      145.14.158.29
A    www.menuverse.com  145.14.158.29
```

### SSL Certificates

Automatically managed via Let's Encrypt:

```bash
# Manual SSL setup (if needed)
ssh root@145.14.158.29
cd /opt/chopchop-menuverse-platform
./scripts/deploy.sh ssl
```

## 🛠️ Management Commands

### From Local Machine

```powershell
# Check status
ssh root@145.14.158.29 "cd /opt/chopchop-menuverse-platform && docker-compose ps"

# View logs
ssh root@145.14.158.29 "cd /opt/chopchop-menuverse-platform && docker-compose logs -f"

# Restart services
ssh root@145.14.158.29 "cd /opt/chopchop-menuverse-platform && docker-compose restart"
```

### From VPS

```bash
cd /opt/chopchop-menuverse-platform

# Service management
./scripts/deploy.sh start      # Start all services
./scripts/deploy.sh stop       # Stop all services
./scripts/deploy.sh restart    # Restart all services
./scripts/deploy.sh status     # Check status
./scripts/deploy.sh health     # Health check
./scripts/deploy.sh logs       # View logs
./scripts/deploy.sh backup     # Create backup
./scripts/deploy.sh update     # Update and restart
```

## 🔍 Application Access

After deployment, access your applications:

### Chop Chop (Customer App)
- **Development**: http://145.14.158.29:3000
- **Production**: https://chopchop.com

### MenuVerse (Restaurant Platform)
- **Development**: http://145.14.158.29:3002
- **Production**: https://menuverse.com

### Admin Panel
- **Development**: http://145.14.158.29:3001
- **Production**: https://chopchop.com/admin

### APIs
- **GraphQL API**: http://145.14.158.29:4000/graphql
- **SQLite API**: http://145.14.158.29:5000

## 🔒 Security Features

- ✅ SSL/TLS encryption with auto-renewal
- ✅ Rate limiting on API endpoints
- ✅ Security headers (XSS, CSRF protection)
- ✅ Firewall configuration (UFW)
- ✅ Container security (non-root users)
- ✅ Environment variable protection
- ✅ Automated backups

## 📊 Monitoring

### Health Checks
- Application health endpoints
- Database connectivity checks
- Redis availability checks
- Container health status

### Optional Monitoring Stack
- **Prometheus**: http://145.14.158.29:9090 (metrics)
- **Grafana**: http://145.14.158.29:3003 (dashboards)

## 🆘 Troubleshooting

### Common Issues

1. **Services not starting**
   ```bash
   docker-compose ps
   docker-compose logs [service-name]
   ```

2. **Database connection errors**
   ```bash
   # Check PostgreSQL
   docker-compose exec postgres pg_isready -U chopchop_user -d chopchop_db
   ```

3. **Memory issues**
   ```bash
   free -h
   docker system prune -f
   ```

4. **SSL certificate problems**
   ```bash
   ./scripts/deploy.sh ssl
   ```

### Log Locations
- **Application**: `docker-compose logs [service]`
- **Nginx**: `docker-compose logs nginx`
- **System**: `/var/log/syslog`

## 🔄 Update Process

### Automatic Updates (via GitHub Actions)
1. Push code to `main` branch
2. GitHub Actions builds and deploys automatically
3. Health checks ensure successful deployment

### Manual Updates
```bash
ssh root@145.14.158.29
cd /opt/chopchop-menuverse-platform
./scripts/deploy.sh update
```

## 📋 Production Checklist

Before going live:

- [ ] Domain names configured and pointing to VPS
- [ ] SSL certificates obtained and working
- [ ] Environment variables configured with production values
- [ ] Payment gateways (Stripe) configured and tested
- [ ] Email services working
- [ ] Firebase configuration complete
- [ ] Database backups configured
- [ ] Monitoring dashboards accessible
- [ ] Performance testing completed
- [ ] Security audit performed
- [ ] GitHub Actions CI/CD pipeline tested

## 📞 Support

For issues and questions:
- Check service logs: `docker-compose logs [service]`
- Review troubleshooting section
- Contact: malcolmonix@gmail.com

---

**Platform**: Chop Chop & MenuVerse Food Delivery Platform  
**Last Updated**: October 2025  
**Version**: 1.0.0