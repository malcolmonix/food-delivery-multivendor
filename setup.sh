#!/bin/bash

# Enatega Multi-vendor Food Delivery - Standardized Setup Script
# This script sets up the development environment with standardized port 4000

set -e

echo "🚀 Setting up Enatega Multi-vendor Food Delivery System"
echo "=================================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    print_error "Node.js is not installed. Please install Node.js 18-20 first."
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ] || [ "$NODE_VERSION" -gt 20 ]; then
    print_warning "Node.js version $NODE_VERSION detected. Recommended: Node.js 18-20"
fi

print_status "Node.js version: $(node -v)"

# Create environment files if they don't exist
create_env_file() {
    local dir=$1
    local env_file="$dir/.env.local"
    
    if [ ! -f "$env_file" ]; then
        print_status "Creating $env_file"
        cat > "$env_file" << EOF
# Backend Configuration - Standardized to port 4000
NEXT_PUBLIC_SERVER_URL=http://localhost:4000/
NEXT_PUBLIC_WS_SERVER_URL=ws://localhost:4000/

# Development settings
NODE_ENV=development
EOF
    else
        print_status "$env_file already exists"
    fi
}

# Setup backend
setup_backend() {
    print_status "Setting up development backend..."
    
    cd dev-backend
    
    if [ ! -d "node_modules" ]; then
        print_status "Installing backend dependencies..."
        npm install
    else
        print_status "Backend dependencies already installed"
    fi
    
    # Create database if it doesn't exist
    if [ ! -f "data.db" ]; then
        print_status "Creating SQLite database..."
        npm run seed
    else
        print_status "Database already exists"
    fi
    
    cd ..
    print_success "Backend setup complete"
}

# Setup admin dashboard
setup_admin() {
    print_status "Setting up admin dashboard..."
    
    cd enatega-multivendor-admin
    create_env_file "."
    
    if [ ! -d "node_modules" ]; then
        print_status "Installing admin dependencies..."
        npm install
    else
        print_status "Admin dependencies already installed"
    fi
    
    cd ..
    print_success "Admin dashboard setup complete"
}

# Setup new admin
setup_new_admin() {
    print_status "Setting up new admin dashboard..."
    
    cd multivendor-admin
    create_env_file "."
    
    if [ ! -d "node_modules" ]; then
        print_status "Installing new admin dependencies..."
        npm install
    else
        print_status "New admin dependencies already installed"
    fi
    
    cd ..
    print_success "New admin dashboard setup complete"
}

# Setup customer web
setup_customer_web() {
    print_status "Setting up customer web application..."
    
    cd enatega-multivendor-web
    create_env_file "."
    
    if [ ! -d "node_modules" ]; then
        print_status "Installing customer web dependencies..."
        npm install
    else
        print_status "Customer web dependencies already installed"
    fi
    
    cd ..
    print_success "Customer web setup complete"
}

# Setup mobile apps
setup_mobile_apps() {
    print_status "Setting up mobile applications..."
    
    # Customer app
    cd enatega-multivendor-app
    if [ ! -d "node_modules" ]; then
        print_status "Installing customer app dependencies..."
        npm install
    fi
    cd ..
    
    # Rider app
    cd enatega-multivendor-rider
    if [ ! -d "node_modules" ]; then
        print_status "Installing rider app dependencies..."
        npm install
    fi
    cd ..
    
    # Store app
    cd enatega-multivendor-store
    if [ ! -d "node_modules" ]; then
        print_status "Installing store app dependencies..."
        npm install
    fi
    cd ..
    
    print_success "Mobile applications setup complete"
}

# Main setup function
main() {
    print_status "Starting standardized setup process..."
    
    # Setup backend first
    setup_backend
    
    # Setup frontend applications
    setup_admin
    setup_new_admin
    setup_customer_web
    setup_mobile_apps
    
    print_success "🎉 Setup complete!"
    echo ""
    echo "📋 Next steps:"
    echo "1. Start the backend: cd dev-backend && npm run dev"
    echo "2. Start admin dashboard: cd enatega-multivendor-admin && npm run dev"
    echo "3. Start customer web: cd enatega-multivendor-web && npm start"
    echo "4. Start mobile apps: cd enatega-multivendor-app && npm start"
    echo ""
    echo "🌐 URLs:"
    echo "- Backend GraphQL: http://localhost:4000/graphql"
    echo "- Admin Dashboard: http://localhost:3000"
    echo "- Customer Web: http://localhost:3001"
    echo ""
    echo "📚 Documentation: https://enatega.com/multi-vendor-doc/"
}

# Run main function
main

