@echo off
REM Enatega Multi-vendor Food Delivery - Windows Setup Script
REM This script sets up the development environment with standardized port 4000

echo 🚀 Setting up Enatega Multi-vendor Food Delivery System
echo ==================================================

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js is not installed. Please install Node.js 18-20 first.
    pause
    exit /b 1
)

echo ✅ Node.js version: 
node --version

REM Setup backend
echo.
echo 📦 Setting up development backend...
cd dev-backend
if not exist "node_modules" (
    echo Installing backend dependencies...
    npm install
) else (
    echo Backend dependencies already installed
)

REM Create database if it doesn't exist
if not exist "data.db" (
    echo Creating SQLite database...
    npm run seed
) else (
    echo Database already exists
)

cd ..
echo ✅ Backend setup complete

REM Setup admin dashboard
echo.
echo 📦 Setting up admin dashboard...
cd enatega-multivendor-admin
if not exist "node_modules" (
    echo Installing admin dependencies...
    npm install
) else (
    echo Admin dependencies already installed
)

REM Create .env.local if it doesn't exist
if not exist ".env.local" (
    echo Creating .env.local...
    echo NEXT_PUBLIC_SERVER_URL=http://localhost:4000/ > .env.local
    echo NEXT_PUBLIC_WS_SERVER_URL=ws://localhost:4000/ >> .env.local
    echo NODE_ENV=development >> .env.local
) else (
    echo .env.local already exists
)

cd ..
echo ✅ Admin dashboard setup complete

REM Setup new admin
echo.
echo 📦 Setting up new admin dashboard...
cd multivendor-admin
if not exist "node_modules" (
    echo Installing new admin dependencies...
    npm install
) else (
    echo New admin dependencies already installed
)

REM Create .env.local if it doesn't exist
if not exist ".env.local" (
    echo Creating .env.local...
    echo NEXT_PUBLIC_SERVER_URL=http://localhost:4000/ > .env.local
    echo NEXT_PUBLIC_WS_SERVER_URL=ws://localhost:4000/ >> .env.local
    echo NODE_ENV=development >> .env.local
) else (
    echo .env.local already exists
)

cd ..
echo ✅ New admin dashboard setup complete

REM Setup customer web
echo.
echo 📦 Setting up customer web application...
cd enatega-multivendor-web
if not exist "node_modules" (
    echo Installing customer web dependencies...
    npm install
) else (
    echo Customer web dependencies already installed
)

REM Create .env.local if it doesn't exist
if not exist ".env.local" (
    echo Creating .env.local...
    echo NEXT_PUBLIC_SERVER_URL=http://localhost:4000/ > .env.local
    echo NEXT_PUBLIC_WS_SERVER_URL=ws://localhost:4000/ >> .env.local
    echo NODE_ENV=development >> .env.local
) else (
    echo .env.local already exists
)

cd ..
echo ✅ Customer web setup complete

REM Setup mobile apps
echo.
echo 📦 Setting up mobile applications...

REM Customer app
cd enatega-multivendor-app
if not exist "node_modules" (
    echo Installing customer app dependencies...
    npm install
) else (
    echo Customer app dependencies already installed
)
cd ..

REM Rider app
cd enatega-multivendor-rider
if not exist "node_modules" (
    echo Installing rider app dependencies...
    npm install
) else (
    echo Rider app dependencies already installed
)
cd ..

REM Store app
cd enatega-multivendor-store
if not exist "node_modules" (
    echo Installing store app dependencies...
    npm install
) else (
    echo Store app dependencies already installed
)
cd ..

echo ✅ Mobile applications setup complete

echo.
echo 🎉 Setup complete!
echo.
echo 📋 Next steps:
echo 1. Start the backend: cd dev-backend ^&^& npm run dev
echo 2. Start admin dashboard: cd enatega-multivendor-admin ^&^& npm run dev
echo 3. Start customer web: cd enatega-multivendor-web ^&^& npm start
echo 4. Start mobile apps: cd enatega-multivendor-app ^&^& npm start
echo.
echo 🌐 URLs:
echo - Backend GraphQL: http://localhost:4000/graphql
echo - Admin Dashboard: http://localhost:3000
echo - Customer Web: http://localhost:3001
echo.
echo 📚 Documentation: https://enatega.com/multi-vendor-doc/
echo.
pause

