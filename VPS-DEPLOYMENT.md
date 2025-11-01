# VPS Deployment Instructions

## 🚀 Quick Deployment to VPS (145.14.158.29)

### Prerequisites
1. SSH access to your VPS
2. Domain name (optional but recommended)

### Option 1: Automated Deployment

Run this command from your local project directory:

```bash
# Make the script executable
chmod +x quick-deploy.sh

# Run deployment (replace with your domain)
DOMAIN=yourdomain.com ./quick-deploy.sh
```

### Option 2: Manual Deployment

If you can SSH into your VPS, follow these steps:

```bash
# 1. SSH into your VPS
ssh root@145.14.158.29

# 2. Install required packages
apt update && apt upgrade -y
apt install -y curl git docker.io docker-compose

# 3. Clone your repository
git clone https://github.com/malcolmonix/food-delivery-multivendor.git /opt/enatega-app
cd /opt/enatega-app

# 4. Configure environment
cp .env.example .env
nano .env  # Edit with your values

# 5. Deploy application
chmod +x scripts/deploy.sh
./scripts/deploy.sh setup
```

### Option 3: SSH Key Setup (Recommended)

If you're having SSH issues, set up key-based authentication:

```bash
# Generate SSH key (if you don't have one)
ssh-keygen -t rsa -b 4096

# Copy to VPS (enter password when prompted)
ssh-copy-id root@145.14.158.29

# Now you can SSH without password
ssh root@145.14.158.29
```

## 🔧 After Deployment

### 1. Configure Environment Variables

SSH into your VPS and edit the configuration:

```bash
ssh root@145.14.158.29
cd /opt/enatega-app
nano .env
```

### Required Configuration:
- Database credentials (auto-generated)
- JWT secrets (auto-generated)
- Payment gateway credentials
- Email service settings
- Firebase configuration
- Cloudinary/file upload settings

### 2. Set Up Domain (Optional)

If you have a domain:

```bash
# Update domain in environment
sed -i 's/your-domain.com/yourdomain.com/g' .env
sed -i 's/your-domain.com/yourdomain.com/g' nginx/nginx.conf

# Set up SSL
./scripts/deploy.sh ssl

# Restart services
docker-compose restart
```

### 3. Verify Deployment

Check service status:
```bash
docker-compose ps
docker-compose logs -f
```

## 🌐 Access Your Application

After deployment, your services will be available at:

- **Web Application**: http://145.14.158.29:3000
- **Admin Panel**: http://145.14.158.29:3001
- **GraphQL API**: http://145.14.158.29:4000
- **SQLite API**: http://145.14.158.29:5000
- **MenuVerse**: http://145.14.158.29:3002

## 🔒 Security Setup

For production use, ensure:

1. **Change default passwords**
2. **Configure firewall properly**
3. **Set up SSL certificates**
4. **Update all service credentials**
5. **Enable fail2ban for SSH protection**

## 📊 Monitoring

Access monitoring (if enabled):
- **Prometheus**: http://145.14.158.29:9090
- **Grafana**: http://145.14.158.29:3003

## 🛠️ Management Commands

```bash
# Application management
./scripts/deploy.sh start      # Start services
./scripts/deploy.sh stop       # Stop services
./scripts/deploy.sh restart    # Restart services
./scripts/deploy.sh status     # Check status
./scripts/deploy.sh logs       # View logs
./scripts/deploy.sh backup     # Create backup
```

## 🆘 Troubleshooting

### Common Issues:

1. **Can't SSH**: Check password or set up SSH keys
2. **Services not starting**: Check logs with `docker-compose logs`
3. **Port conflicts**: Ensure ports 3000-5000 are available
4. **Memory issues**: VPS needs at least 2GB RAM

### Get Help:
```bash
# Check service status
docker-compose ps

# View logs
docker-compose logs [service-name]

# Check system resources
free -h
df -h
```

---

**Need help?** Check the logs and service status, or contact support with the error details.