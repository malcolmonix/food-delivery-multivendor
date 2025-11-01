# Enatega Food Delivery Platform - VPS Deployment Guide

This guide will help you deploy your Enatega food delivery multivendor platform to a VPS server with Docker containerization and CI/CD pipeline.

## 🚀 Quick Start

### Prerequisites

- A VPS server (Ubuntu 20.04+ recommended)
- Domain name pointed to your VPS IP
- GitHub repository access
- Basic Linux command line knowledge

### 1. Initial VPS Setup

```bash
# SSH into your VPS
ssh root@your-vps-ip

# Download and run the deployment script
curl -sSL https://raw.githubusercontent.com/malcolmonix/food-delivery-multivendor/main/scripts/deploy.sh -o deploy.sh
chmod +x deploy.sh

# Run full setup (replace with your domain)
DOMAIN=yourdomain.com ./deploy.sh setup
```

### 2. Configure Environment Variables

```bash
# Edit the environment file
nano /opt/enatega-app/.env

# Update with your actual values:
# - Database credentials
# - Payment gateway keys (Stripe/PayPal)
# - Email service credentials
# - Firebase configuration
# - Cloudinary/AWS S3 settings
```

### 3. Deploy Application

```bash
# Deploy the application
./deploy.sh deploy

# Check application status
./deploy.sh status
```

## 📋 Configuration

### Environment Variables

Copy `.env.example` to `.env` and configure:

#### Required Settings:
- `DATABASE_URL`: PostgreSQL connection string
- `JWT_SECRET`: Secure random string for JWT tokens
- `STRIPE_SECRET_KEY`: Stripe payment processing
- `FIREBASE_*`: Firebase authentication and services
- `CLOUDINARY_URL`: Image upload service

#### Optional Settings:
- `SMTP_*`: Email service configuration
- `GOOGLE_MAPS_API_KEY`: Maps integration
- `ONESIGNAL_*`: Push notifications
- `SENTRY_DSN`: Error tracking

### SSL Certificates

SSL certificates are automatically obtained and renewed using Let's Encrypt:

```bash
# Manual SSL setup (if needed)
./deploy.sh ssl
```

## 🔧 GitHub Actions CI/CD

### Setup GitHub Secrets

Add these secrets to your GitHub repository:

1. Go to your repository → Settings → Secrets and variables → Actions
2. Add the following secrets:

```
VPS_HOST=your.vps.ip.address
VPS_USERNAME=root
VPS_SSH_KEY=your-private-ssh-key
VPS_PORT=22
```

### Automatic Deployment

The CI/CD pipeline will:
1. Run tests on all services
2. Build Docker images
3. Deploy to your VPS when you push to `main` branch

## 🐳 Docker Services

The application consists of these services:

| Service | Port | Description |
|---------|------|-------------|
| nginx | 80, 443 | Reverse proxy & SSL termination |
| web | 3000 | Main customer web app |
| admin | 3001 | Restaurant admin panel |
| api | 4000 | GraphQL API server |
| sqlite-api | 5000 | SQLite API backend |
| menuverse | 3002 | MenuVerse service |
| postgres | 5432 | PostgreSQL database |
| redis | 6379 | Caching & sessions |

## 📊 Monitoring

Optional monitoring stack:
- **Prometheus**: Metrics collection (port 9090)
- **Grafana**: Monitoring dashboards (port 3003)

Access Grafana at `https://yourdomain.com:3003`
- Username: `admin`
- Password: Set in `GRAFANA_PASSWORD` environment variable

## 🛠️ Management Commands

```bash
# Application management
./deploy.sh start      # Start all services
./deploy.sh stop       # Stop all services
./deploy.sh restart    # Restart all services
./deploy.sh update     # Update code and restart

# Monitoring
./deploy.sh status     # Show service status
./deploy.sh health     # Run health checks
./deploy.sh logs       # View application logs

# Backup
./deploy.sh backup     # Create manual backup
```

## 🔍 Troubleshooting

### Common Issues

1. **Services not starting**:
   ```bash
   ./deploy.sh logs
   docker-compose ps
   ```

2. **SSL certificate issues**:
   ```bash
   ./deploy.sh ssl
   ```

3. **Database connection errors**:
   - Check PostgreSQL credentials in `.env`
   - Verify database service is running: `docker-compose ps postgres`

4. **Memory issues**:
   ```bash
   # Check memory usage
   free -h
   
   # Restart services if needed
   ./deploy.sh restart
   ```

### Log Locations

- Application logs: `docker-compose logs [service-name]`
- Nginx logs: `docker-compose logs nginx`
- System logs: `/var/log/syslog`

## 🔒 Security

### Implemented Security Features:
- SSL/TLS encryption with auto-renewal
- Rate limiting on API endpoints
- Security headers (XSS, CSRF protection)
- Firewall configuration
- Container security (non-root users)
- Environment variable protection

### Additional Security Recommendations:
1. Change default SSH port
2. Set up fail2ban
3. Regular security updates
4. Monitor access logs
5. Use strong passwords for all services

## 📈 Performance Optimization

### Production Optimizations:
- Multi-stage Docker builds
- Image optimization and caching
- Nginx gzip compression
- Redis caching layer
- Database connection pooling
- CDN for static assets (recommended)

### Scaling Considerations:
- Load balancer for multiple instances
- Database clustering
- Redis clustering
- Horizontal pod autoscaling (Kubernetes)

## 🔄 Updates and Maintenance

### Automatic Updates:
- Code updates: Push to main branch triggers deployment
- SSL renewals: Automated via cron job
- Security updates: Regular system updates recommended

### Manual Updates:
```bash
# Update application code
./deploy.sh update

# Update system packages
apt update && apt upgrade -y

# Update Docker images
docker-compose pull
./deploy.sh restart
```

## 📞 Support

For support and questions:
- Check the troubleshooting section above
- Review application logs
- Create an issue in the GitHub repository
- Contact the development team

---

## 🎯 Production Checklist

Before going live:

- [ ] Domain configured and pointing to VPS
- [ ] SSL certificates obtained and working
- [ ] All environment variables configured
- [ ] Payment gateways tested
- [ ] Email services working
- [ ] Database backups configured
- [ ] Monitoring dashboards accessible
- [ ] Performance testing completed
- [ ] Security audit performed

---

*Last updated: October 2025*