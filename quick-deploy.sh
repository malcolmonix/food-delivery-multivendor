#!/bin/bash

# Enatega VPS Quick Deploy Script
# Run this script on your local machine to deploy to VPS

VPS_HOST="145.14.158.29"
VPS_USER="root"
DOMAIN="${DOMAIN:-enatega-delivery.com}"  # Change this to your domain
APP_DIR="/opt/enatega-app"

echo "🚀 Deploying Enatega Food Delivery Platform to VPS..."
echo "VPS: $VPS_HOST"
echo "Domain: $DOMAIN"

# Step 1: Copy deployment files to VPS
echo "📁 Copying project files to VPS..."
scp -r . $VPS_USER@$VPS_HOST:/tmp/enatega-deploy/

# Step 2: Run deployment on VPS
echo "🔧 Running deployment on VPS..."
ssh $VPS_USER@$VPS_HOST << EOF
    set -e
    
    # Update system
    echo "📦 Updating system packages..."
    apt update && apt upgrade -y
    
    # Install required packages
    apt install -y curl git ufw fail2ban
    
    # Install Docker
    if ! command -v docker &> /dev/null; then
        echo "🐳 Installing Docker..."
        curl -fsSL https://get.docker.com -o get-docker.sh
        sh get-docker.sh
        rm get-docker.sh
    fi
    
    # Install Docker Compose
    if ! command -v docker-compose &> /dev/null; then
        echo "📦 Installing Docker Compose..."
        DOCKER_COMPOSE_VERSION=\$(curl -s https://api.github.com/repos/docker/compose/releases/latest | grep 'tag_name' | cut -d'"' -f4)
        curl -L "https://github.com/docker/compose/releases/download/\${DOCKER_COMPOSE_VERSION}/docker-compose-\$(uname -s)-\$(uname -m)" -o /usr/local/bin/docker-compose
        chmod +x /usr/local/bin/docker-compose
    fi
    
    # Setup firewall
    echo "🔒 Configuring firewall..."
    ufw allow ssh
    ufw allow 80/tcp
    ufw allow 443/tcp
    ufw --force enable
    
    # Create application directory
    echo "📁 Setting up application directory..."
    mkdir -p $APP_DIR
    
    # Copy files
    cp -r /tmp/enatega-deploy/* $APP_DIR/
    cd $APP_DIR
    
    # Make deploy script executable
    chmod +x scripts/deploy.sh
    
    # Create environment file
    if [ ! -f .env ]; then
        echo "⚙️ Creating environment file..."
        cp .env.example .env
        
        # Generate secure passwords
        DB_PASSWORD=\$(openssl rand -base64 32 | tr -d "=+/" | cut -c1-25)
        JWT_SECRET=\$(openssl rand -base64 64 | tr -d "=+/" | cut -c1-50)
        SESSION_SECRET=\$(openssl rand -base64 32 | tr -d "=+/" | cut -c1-25)
        
        # Update environment file with generated values
        sed -i "s/your_secure_password/\$DB_PASSWORD/g" .env
        sed -i "s/your_jwt_secret_key_here_minimum_32_characters/\$JWT_SECRET/g" .env
        sed -i "s/your_session_secret_here/\$SESSION_SECRET/g" .env
        sed -i "s/your-domain.com/$DOMAIN/g" .env
        
        echo "✅ Environment file created with secure defaults"
        echo "⚠️  Please update .env with your actual service credentials"
    fi
    
    # Start Docker service
    systemctl start docker
    systemctl enable docker
    
    # Build and start services
    echo "🔨 Building and starting services..."
    docker-compose pull postgres redis nginx
    docker-compose up -d postgres redis
    
    # Wait for database to be ready
    echo "⏳ Waiting for database to be ready..."
    sleep 30
    
    # Build application services
    docker-compose build
    docker-compose up -d
    
    # Wait for services to start
    echo "⏳ Waiting for services to start..."
    sleep 60
    
    # Show status
    echo "📊 Service Status:"
    docker-compose ps
    
    echo ""
    echo "🎉 Deployment completed!"
    echo "📍 Your application should be accessible at:"
    echo "   Web App: http://$VPS_HOST:3000"
    echo "   Admin Panel: http://$VPS_HOST:3001"
    echo "   API: http://$VPS_HOST:4000"
    echo ""
    echo "⚠️  Next steps:"
    echo "1. Configure your domain to point to $VPS_HOST"
    echo "2. Update /opt/enatega-app/.env with your service credentials"
    echo "3. Run: cd /opt/enatega-app && ./scripts/deploy.sh ssl (after domain setup)"
    echo "4. Restart services: docker-compose restart"
    
    # Cleanup
    rm -rf /tmp/enatega-deploy
EOF

echo "✅ Deployment script completed!"
echo ""
echo "🔗 Quick access commands:"
echo "ssh $VPS_USER@$VPS_HOST 'cd $APP_DIR && docker-compose ps'"
echo "ssh $VPS_USER@$VPS_HOST 'cd $APP_DIR && docker-compose logs -f'"
echo ""
echo "📝 To configure your application:"
echo "ssh $VPS_USER@$VPS_HOST"
echo "cd $APP_DIR"
echo "nano .env"