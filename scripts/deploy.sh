#!/bin/bash

# Chop Chop & MenuVerse Platform VPS Deployment Script
# This script sets up and deploys the food delivery and restaurant management platform
set -e

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
APP_NAME="chopchop-menuverse-platform"
APP_DIR="/opt/$APP_NAME"
CHOPCHOP_DOMAIN="${CHOPCHOP_DOMAIN:-chopchop.com}"
MENUVERSE_DOMAIN="${MENUVERSE_DOMAIN:-menuverse.com}"
VPS_USER="${VPS_USER:-root}"
BACKUP_RETENTION=5

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Logging functions
log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

log_step() {
    echo -e "${BLUE}[STEP]${NC} $1"
}

# Check if running as root on VPS
check_root() {
    if [[ $EUID -ne 0 ]] && [[ "$1" == "vps" ]]; then
        log_error "This script must be run as root on the VPS"
        exit 1
    fi
}

# Check required dependencies
check_dependencies() {
    log_step "Checking dependencies..."
    
    local missing_deps=()
    
    if ! command -v git &> /dev/null; then
        missing_deps+=("git")
    fi
    
    if ! command -v curl &> /dev/null; then
        missing_deps+=("curl")
    fi
    
    if [[ ${#missing_deps[@]} -gt 0 ]]; then
        log_error "Missing dependencies: ${missing_deps[*]}"
        log_info "Installing missing dependencies..."
        apt update
        apt install -y "${missing_deps[@]}"
    fi
    
    log_info "✅ Dependencies check completed"
}

# Install Docker and Docker Compose
install_docker() {
    log_step "Installing Docker and Docker Compose..."
    
    if command -v docker &> /dev/null; then
        log_info "Docker is already installed"
    else
        log_info "Installing Docker..."
        curl -fsSL https://get.docker.com -o get-docker.sh
        sh get-docker.sh
        rm get-docker.sh
        
        # Add current user to docker group if not root
        if [[ $EUID -ne 0 ]]; then
            usermod -aG docker $USER
            log_warning "You may need to log out and back in for Docker permissions to take effect"
        fi
    fi
    
    if command -v docker-compose &> /dev/null; then
        log_info "Docker Compose is already installed"
    else
        log_info "Installing Docker Compose..."
        DOCKER_COMPOSE_VERSION=$(curl -s https://api.github.com/repos/docker/compose/releases/latest | grep 'tag_name' | cut -d'"' -f4)
        curl -L "https://github.com/docker/compose/releases/download/${DOCKER_COMPOSE_VERSION}/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
        chmod +x /usr/local/bin/docker-compose
    fi
    
    # Start Docker service
    systemctl start docker
    systemctl enable docker
    
    log_info "✅ Docker installation completed"
}

# Setup firewall
setup_firewall() {
    log_step "Configuring firewall..."
    
    if command -v ufw &> /dev/null; then
        ufw allow ssh
        ufw allow 80/tcp
        ufw allow 443/tcp
        ufw --force enable
        log_info "✅ UFW firewall configured"
    else
        log_warning "UFW not available, skipping firewall setup"
    fi
}

# Setup SSL certificates
setup_ssl() {
    log_step "Setting up SSL certificates..."
    
    if [[ "$CHOPCHOP_DOMAIN" == "chopchop.com" && "$MENUVERSE_DOMAIN" == "menuverse.com" ]]; then
        log_warning "Domains not configured, skipping SSL setup"
        log_info "Please update CHOPCHOP_DOMAIN and MENUVERSE_DOMAIN variables and run: setup_ssl"
        return
    fi
    
    # Install certbot
    if ! command -v certbot &> /dev/null; then
        log_info "Installing Certbot..."
        apt update
        apt install -y certbot
    fi
    
    # Stop nginx if running
    docker-compose -f $APP_DIR/docker-compose.yml stop nginx 2>/dev/null || true
    
    # Get SSL certificates for both domains
    log_info "Obtaining SSL certificates..."
    certbot certonly --standalone \
        -d "$CHOPCHOP_DOMAIN" \
        -d "www.$CHOPCHOP_DOMAIN" \
        -d "$MENUVERSE_DOMAIN" \
        -d "www.$MENUVERSE_DOMAIN" \
        --agree-tos \
        --non-interactive \
        --email "admin@$CHOPCHOP_DOMAIN" \
        --expand
    
    # Create SSL directory and copy certificates
    mkdir -p $APP_DIR/nginx/ssl
    cp /etc/letsencrypt/live/$CHOPCHOP_DOMAIN/fullchain.pem $APP_DIR/nginx/ssl/cert.pem
    cp /etc/letsencrypt/live/$CHOPCHOP_DOMAIN/privkey.pem $APP_DIR/nginx/ssl/key.pem
    
    # Set proper permissions
    chown -R root:root $APP_DIR/nginx/ssl
    chmod 600 $APP_DIR/nginx/ssl/*
    
    log_info "✅ SSL certificates configured for Chop Chop and MenuVerse"
}

# Setup SSL renewal cron job
setup_ssl_renewal() {
    log_step "Setting up SSL certificate auto-renewal..."
    
    # Create renewal script
    cat > /usr/local/bin/renew-ssl.sh << 'EOF'
#!/bin/bash
certbot renew --quiet --deploy-hook "
    cp /etc/letsencrypt/live/*/fullchain.pem /opt/chopchop-menuverse-platform/nginx/ssl/cert.pem
    cp /etc/letsencrypt/live/*/privkey.pem /opt/chopchop-menuverse-platform/nginx/ssl/key.pem
    cd /opt/chopchop-menuverse-platform && docker-compose restart nginx
"
EOF
    
    chmod +x /usr/local/bin/renew-ssl.sh
    
    # Add to crontab
    (crontab -l 2>/dev/null; echo "0 3 * * * /usr/local/bin/renew-ssl.sh") | crontab -
    
    log_info "✅ SSL auto-renewal configured"
}

# Create application directory structure
setup_app_directory() {
    log_step "Setting up application directory..."
    
    mkdir -p $APP_DIR
    mkdir -p $APP_DIR/nginx/html
    mkdir -p $APP_DIR/nginx/ssl
    mkdir -p $APP_DIR/init-db
    mkdir -p $APP_DIR/backups
    
    # Create robots.txt
    cat > $APP_DIR/nginx/html/robots.txt << 'EOF'
User-agent: *
Allow: /

Sitemap: https://your-domain.com/sitemap.xml
EOF
    
    log_info "✅ Application directory structure created"
}

# Clone or update application code
deploy_code() {
    log_step "Deploying application code..."
    
    if [[ -d "$APP_DIR/.git" ]]; then
        log_info "Updating existing code..."
        cd $APP_DIR
        git stash push -m "Auto-stash before deployment $(date)"
        git pull origin main
    else
        log_info "Cloning repository..."
        rm -rf $APP_DIR/*
        git clone https://github.com/malcolmonix/food-delivery-multivendor.git $APP_DIR
        cd $APP_DIR
    fi
    
    log_info "✅ Code deployment completed"
}

# Setup environment variables
setup_environment() {
    log_step "Setting up environment variables..."
    
    if [[ ! -f "$APP_DIR/.env" ]]; then
        log_info "Creating environment file..."
        cat > $APP_DIR/.env << EOF
# Database Configuration
DATABASE_URL=postgresql://enatega_user:$(openssl rand -base64 32 | tr -d "=+/" | cut -c1-25)@postgres:5432/enatega_db
POSTGRES_DB=enatega_db
POSTGRES_USER=enatega_user
POSTGRES_PASSWORD=$(openssl rand -base64 32 | tr -d "=+/" | cut -c1-25)

# Application Configuration
NODE_ENV=production
JWT_SECRET=$(openssl rand -base64 64 | tr -d "=+/" | cut -c1-50)
API_URL=https://$DOMAIN/api

# Redis Configuration
REDIS_URL=redis://redis:6379

# Security
CORS_ORIGIN=https://$DOMAIN
SESSION_SECRET=$(openssl rand -base64 32 | tr -d "=+/" | cut -c1-25)

# Firebase Configuration (Update with your values)
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nyour-private-key\n-----END PRIVATE KEY-----"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk@your-project-id.iam.gserviceaccount.com

# Payment Configuration (Update with your values)
STRIPE_SECRET_KEY=sk_live_your_stripe_secret_key
STRIPE_PUBLISHABLE_KEY=pk_live_your_stripe_publishable_key

# File Upload Configuration (Update with your values)
CLOUDINARY_URL=cloudinary://api_key:api_secret@cloud_name

# Email Configuration (Update with your values)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# Monitoring (optional)
GRAFANA_PASSWORD=$(openssl rand -base64 16 | tr -d "=+/" | cut -c1-12)
EOF
        
        log_warning "Environment file created with default values"
        log_warning "Please update the .env file with your actual configuration values"
    else
        log_info "Environment file already exists"
    fi
    
    log_info "✅ Environment setup completed"
}

# Create backup
create_backup() {
    log_step "Creating backup..."
    
    local backup_name="enatega-backup-$(date +%Y%m%d_%H%M%S)"
    local backup_path="$APP_DIR/backups/$backup_name"
    
    mkdir -p "$backup_path"
    
    # Backup database
    if docker ps | grep -q postgres; then
        log_info "Backing up database..."
        docker exec postgres pg_dump -U enatega_user enatega_db > "$backup_path/database.sql"
    fi
    
    # Backup uploaded files
    if [[ -d "$APP_DIR/uploads" ]]; then
        log_info "Backing up uploaded files..."
        tar -czf "$backup_path/uploads.tar.gz" -C "$APP_DIR" uploads
    fi
    
    # Backup environment
    cp "$APP_DIR/.env" "$backup_path/" 2>/dev/null || true
    
    log_info "✅ Backup created: $backup_name"
    
    # Clean old backups
    cleanup_old_backups
}

# Cleanup old backups
cleanup_old_backups() {
    log_info "Cleaning up old backups..."
    cd "$APP_DIR/backups"
    ls -t | tail -n +$((BACKUP_RETENTION + 1)) | xargs -r rm -rf
    log_info "Kept last $BACKUP_RETENTION backups"
}

# Deploy application
deploy_application() {
    log_step "Deploying application..."
    
    cd $APP_DIR
    
    # Create backup before deployment
    create_backup
    
    # Pull latest images
    log_info "Pulling latest Docker images..."
    docker-compose pull
    
    # Update domain in nginx config
    if [[ "$DOMAIN" != "your-domain.com" ]]; then
        sed -i "s/your-domain.com/$DOMAIN/g" nginx/nginx.conf
        sed -i "s/your-domain.com/$DOMAIN/g" nginx/html/robots.txt
    fi
    
    # Start services
    log_info "Starting services..."
    docker-compose up -d --remove-orphans
    
    # Wait for services to be ready
    log_info "Waiting for services to start..."
    sleep 60
    
    # Health check
    health_check
    
    log_info "✅ Application deployed successfully"
}

# Health check
health_check() {
    log_step "Performing health check..."
    
    local max_attempts=5
    local attempt=1
    
    while [[ $attempt -le $max_attempts ]]; do
        log_info "Health check attempt $attempt/$max_attempts..."
        
        if curl -f -s http://localhost/health > /dev/null; then
            log_info "✅ Application is healthy!"
            return 0
        fi
        
        if [[ $attempt -lt $max_attempts ]]; then
            log_warning "Health check failed, retrying in 30 seconds..."
            sleep 30
        fi
        
        ((attempt++))
    done
    
    log_error "❌ Health check failed after $max_attempts attempts"
    log_info "Checking service status..."
    docker-compose ps
    return 1
}

# Show status
show_status() {
    log_step "Application Status"
    
    cd $APP_DIR 2>/dev/null || {
        log_error "Application not found at $APP_DIR"
        return 1
    }
    
    echo "Docker containers:"
    docker-compose ps
    
    echo -e "\nDisk usage:"
    df -h $APP_DIR
    
    echo -e "\nMemory usage:"
    free -h
    
    echo -e "\nRecent logs:"
    docker-compose logs --tail=20
}

# Stop application
stop_application() {
    log_step "Stopping application..."
    
    cd $APP_DIR
    docker-compose down
    
    log_info "✅ Application stopped"
}

# Start application
start_application() {
    log_step "Starting application..."
    
    cd $APP_DIR
    docker-compose up -d
    
    log_info "Waiting for services to start..."
    sleep 30
    health_check
    
    log_info "✅ Application started"
}

# Update application
update_application() {
    log_step "Updating application..."
    
    cd $APP_DIR
    
    # Create backup
    create_backup
    
    # Stop services
    docker-compose down
    
    # Update code
    git pull origin main
    
    # Update images
    docker-compose pull
    
    # Start services
    docker-compose up -d
    
    # Health check
    sleep 60
    health_check
    
    log_info "✅ Application updated successfully"
}

# Full VPS setup
full_setup() {
    log_step "Starting full VPS setup for Chop Chop & MenuVerse Platform..."
    
    check_root "vps"
    check_dependencies
    install_docker
    setup_firewall
    setup_app_directory
    deploy_code
    setup_environment
    
    if [[ "$CHOPCHOP_DOMAIN" != "chopchop.com" && "$MENUVERSE_DOMAIN" != "menuverse.com" ]]; then
        setup_ssl
        setup_ssl_renewal
    fi
    
    deploy_application
    
    log_info "🎉 VPS setup completed successfully!"
    log_info "Your Chop Chop app is now available at: https://$CHOPCHOP_DOMAIN"
    log_info "Your MenuVerse platform is now available at: https://$MENUVERSE_DOMAIN"
    log_warning "Please update your .env file with actual configuration values"
    log_warning "Then run: ./scripts/deploy.sh update"
}

# Show help
show_help() {
    cat << EOF
Chop Chop & MenuVerse Platform Deployment Script

Usage: $0 [COMMAND]

Commands:
    setup           Full VPS setup (run this first)
    deploy          Deploy/update application
    start           Start application services
    stop            Stop application services
    restart         Restart application services
    status          Show application status
    backup          Create manual backup
    health          Run health check
    logs            Show application logs
    update          Update application code and restart
    ssl             Setup/renew SSL certificates
    help            Show this help message

Environment Variables:
    CHOPCHOP_DOMAIN     Chop Chop domain name (default: chopchop.com)
    MENUVERSE_DOMAIN    MenuVerse domain name (default: menuverse.com)
    VPS_USER            VPS username (default: root)

Examples:
    # Full setup
    CHOPCHOP_DOMAIN=yourdomain.com MENUVERSE_DOMAIN=vendors.yourdomain.com ./scripts/deploy.sh setup
    
    # Deploy updates
    ./scripts/deploy.sh deploy
    
    # Check status
    ./scripts/deploy.sh status

EOF
}

# Main execution
main() {
    case "${1:-help}" in
        setup)
            full_setup
            ;;
        deploy)
            deploy_application
            ;;
        start)
            start_application
            ;;
        stop)
            stop_application
            ;;
        restart)
            stop_application
            start_application
            ;;
        status)
            show_status
            ;;
        backup)
            create_backup
            ;;
        health)
            health_check
            ;;
        logs)
            cd $APP_DIR && docker-compose logs -f
            ;;
        update)
            update_application
            ;;
        ssl)
            setup_ssl
            ;;
        help|*)
            show_help
            ;;
    esac
}

# Run main function with all arguments
main "$@"