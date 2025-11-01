# PowerShell VPS Deployment Script for Chop Chop & MenuVerse Platform
# Run this script from your project directory

param(
    [string]$VpsHost = "145.14.158.29",
    [string]$VpsUser = "root",
    [string]$ChopChopDomain = "chopchop.com",
    [string]$MenuVerseDomain = "menuverse.com",
    [string]$SshKeyPath = "$env:USERPROFILE\.ssh\id_ed25519"
)

Write-Host "🚀 Chop Chop & MenuVerse Platform Deployment Script" -ForegroundColor Green
Write-Host "VPS: $VpsHost" -ForegroundColor Yellow
Write-Host "Chop Chop Domain: $ChopChopDomain" -ForegroundColor Yellow
Write-Host "MenuVerse Domain: $MenuVerseDomain" -ForegroundColor Yellow

# Check if SSH key exists
if (!(Test-Path $SshKeyPath)) {
    Write-Host "❌ SSH key not found at $SshKeyPath" -ForegroundColor Red
    Write-Host "Please generate SSH key first: ssh-keygen -t ed25519 -C 'your-email@gmail.com'" -ForegroundColor Yellow
    exit 1
}

# Display SSH public key
$PublicKeyPath = "$SshKeyPath.pub"
if (Test-Path $PublicKeyPath) {
    $PublicKey = Get-Content $PublicKeyPath
    Write-Host "📋 Your SSH Public Key:" -ForegroundColor Cyan
    Write-Host $PublicKey -ForegroundColor White
    Write-Host ""
    Write-Host "⚠️  MANUAL STEP REQUIRED:" -ForegroundColor Yellow
    Write-Host "1. Copy the SSH key above" -ForegroundColor White
    Write-Host "2. Access your VPS through your provider's web console/VNC" -ForegroundColor White
    Write-Host "3. Run these commands on your VPS:" -ForegroundColor White
    Write-Host "   mkdir -p ~/.ssh" -ForegroundColor Gray
    Write-Host "   echo '$PublicKey' >> ~/.ssh/authorized_keys" -ForegroundColor Gray
    Write-Host "   chmod 700 ~/.ssh" -ForegroundColor Gray
    Write-Host "   chmod 600 ~/.ssh/authorized_keys" -ForegroundColor Gray
    Write-Host ""
}

# Test SSH connection
Write-Host "🔍 Testing SSH connection..." -ForegroundColor Cyan
$TestConnection = ssh -o ConnectTimeout=10 -o BatchMode=yes -i $SshKeyPath $VpsUser@$VpsHost "echo 'SSH connection successful'" 2>$null

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ SSH connection successful!" -ForegroundColor Green
    
    # Create deployment package
    Write-Host "📦 Creating deployment package..." -ForegroundColor Cyan
    $TempDir = "$env:TEMP\enatega-deploy-$(Get-Date -Format 'yyyyMMdd-HHmmss')"
    New-Item -ItemType Directory -Path $TempDir -Force | Out-Null
    
    # Copy project files (excluding node_modules and .git)
    $ExcludeItems = @("node_modules", ".git", ".next", "dist", "build", "*.log")
    Get-ChildItem -Path "." | Where-Object { 
        $item = $_
        -not ($ExcludeItems | Where-Object { $item.Name -like $_ })
    } | Copy-Item -Destination $TempDir -Recurse -Force
    
    # Create deployment archive
    $ArchivePath = "$env:TEMP\enatega-deploy.zip"
    Compress-Archive -Path "$TempDir\*" -DestinationPath $ArchivePath -Force
    
    # Upload and deploy
    Write-Host "📤 Uploading to VPS..." -ForegroundColor Cyan
    scp -i $SshKeyPath $ArchivePath "$VpsUser@$VpsHost:/tmp/"
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "🚀 Running deployment on VPS..." -ForegroundColor Cyan
        
        # Create deployment script
        $DeployScript = @"
#!/bin/bash
set -e

echo "🔧 Starting Enatega deployment..."

# Extract files
cd /tmp
unzip -o enatega-deploy.zip -d enatega-deploy/
cd enatega-deploy

# Update system
echo "📦 Updating system..."
apt update

# Install Docker if not present
if ! command -v docker &> /dev/null; then
    echo "🐳 Installing Docker..."
    curl -fsSL https://get.docker.com -o get-docker.sh
    sh get-docker.sh
    rm get-docker.sh
fi

# Install Docker Compose if not present
if ! command -v docker-compose &> /dev/null; then
    echo "📦 Installing Docker Compose..."
    COMPOSE_VERSION=`$(curl -s https://api.github.com/repos/docker/compose/releases/latest | grep 'tag_name' | cut -d'"' -f4)
    curl -L "https://github.com/docker/compose/releases/download/`${COMPOSE_VERSION}/docker-compose-`$(uname -s)-`$(uname -m)" -o /usr/local/bin/docker-compose
    chmod +x /usr/local/bin/docker-compose
fi

# Setup firewall
echo "🔒 Configuring firewall..."
ufw allow ssh
ufw allow 80/tcp
ufw allow 443/tcp
ufw --force enable

# Create app directory
APP_DIR="/opt/enatega-app"
mkdir -p `$APP_DIR
cp -r * `$APP_DIR/
cd `$APP_DIR

# Create environment file if it doesn't exist
if [ ! -f .env ]; then
    echo "⚙️ Creating environment file..."
    cp .env.example .env
    
    # Generate secure passwords
    DB_PASSWORD=`$(openssl rand -base64 32 | tr -d "=+/" | cut -c1-25)
    JWT_SECRET=`$(openssl rand -base64 64 | tr -d "=+/" | cut -c1-50)
    SESSION_SECRET=`$(openssl rand -base64 32 | tr -d "=+/" | cut -c1-25)
    
    # Update environment file
    sed -i "s/your_secure_password/`$DB_PASSWORD/g" .env
    sed -i "s/your_jwt_secret_key_here_minimum_32_characters/`$JWT_SECRET/g" .env
    sed -i "s/your_session_secret_here/`$SESSION_SECRET/g" .env
    sed -i "s/your-domain.com/$Domain/g" .env
fi

# Start Docker service
systemctl start docker
systemctl enable docker

# Deploy application
echo "🐳 Deploying application..."
docker-compose down 2>/dev/null || true
docker-compose pull postgres redis nginx
docker-compose up -d

# Wait for services
echo "⏳ Waiting for services to start..."
sleep 60

# Show status
echo "📊 Deployment Status:"
docker-compose ps

echo ""
echo "🎉 Deployment completed!"
echo "📍 Access your application:"
echo "   Web: http://$VpsHost:3000"
echo "   Admin: http://$VpsHost:3001"
echo "   API: http://$VpsHost:4000"
echo ""
echo "⚠️  Next steps:"
echo "1. Configure your .env file: nano /opt/enatega-app/.env"
echo "2. Restart services: cd /opt/enatega-app && docker-compose restart"

# Cleanup
rm -rf /tmp/enatega-deploy*
"@
        
        # Execute deployment script
        $DeployScript | ssh -i $SshKeyPath $VpsUser@$VpsHost "cat > /tmp/deploy.sh && chmod +x /tmp/deploy.sh && /tmp/deploy.sh"
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "🎉 Deployment completed successfully!" -ForegroundColor Green
            Write-Host ""
            Write-Host "📍 Your application is now available at:" -ForegroundColor Cyan
            Write-Host "   Web App: http://$VpsHost:3000" -ForegroundColor White
            Write-Host "   Admin Panel: http://$VpsHost:3001" -ForegroundColor White
            Write-Host "   GraphQL API: http://$VpsHost:4000" -ForegroundColor White
            Write-Host "   SQLite API: http://$VpsHost:5000" -ForegroundColor White
            Write-Host "   MenuVerse: http://$VpsHost:3002" -ForegroundColor White
            Write-Host ""
            Write-Host "🔧 Management commands:" -ForegroundColor Yellow
            Write-Host "   Check status: ssh -i $SshKeyPath $VpsUser@$VpsHost 'cd /opt/enatega-app && docker-compose ps'" -ForegroundColor Gray
            Write-Host "   View logs: ssh -i $SshKeyPath $VpsUser@$VpsHost 'cd /opt/enatega-app && docker-compose logs -f'" -ForegroundColor Gray
            Write-Host "   Edit config: ssh -i $SshKeyPath $VpsUser@$VpsHost 'nano /opt/enatega-app/.env'" -ForegroundColor Gray
        }
    } else {
        Write-Host "❌ Failed to upload files to VPS" -ForegroundColor Red
    }
    
    # Cleanup local temp files
    Remove-Item $TempDir -Recurse -Force -ErrorAction SilentlyContinue
    Remove-Item $ArchivePath -Force -ErrorAction SilentlyContinue
    
} else {
    Write-Host "❌ SSH connection failed!" -ForegroundColor Red
    Write-Host ""
    Write-Host "🔧 Alternative deployment options:" -ForegroundColor Yellow
    Write-Host "1. Use your VPS provider's web console to manually copy the SSH key" -ForegroundColor White
    Write-Host "2. Contact your VPS provider for root password reset" -ForegroundColor White
    Write-Host "3. Use VNC/Console access to set up SSH keys" -ForegroundColor White
    Write-Host ""
    Write-Host "📋 SSH Key to copy manually:" -ForegroundColor Cyan
    Write-Host $PublicKey -ForegroundColor White
    Write-Host ""
    Write-Host "🔍 VPS Console Commands:" -ForegroundColor Yellow
    Write-Host "mkdir -p ~/.ssh" -ForegroundColor Gray
    Write-Host "echo '$PublicKey' >> ~/.ssh/authorized_keys" -ForegroundColor Gray
    Write-Host "chmod 700 ~/.ssh && chmod 600 ~/.ssh/authorized_keys" -ForegroundColor Gray
}

Write-Host ""
Write-Host "✅ Deployment script completed!" -ForegroundColor Green