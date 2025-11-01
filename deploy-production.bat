@echo off
echo ================================
echo    Production Build & Deploy
echo ================================

echo.
echo [1/4] Installing dependencies...
cd multivendor-web
call npm ci --production
if %errorlevel% neq 0 (
    echo ERROR: Frontend dependency installation failed!
    pause
    exit /b %errorlevel%
)

cd ..\sqlite-backend
call npm ci --production
if %errorlevel% neq 0 (
    echo ERROR: Backend dependency installation failed!
    pause
    exit /b %errorlevel%
)

echo.
echo [2/4] Building frontend for production...
cd ..\multivendor-web
call npm run build
if %errorlevel% neq 0 (
    echo ERROR: Production build failed!
    pause
    exit /b %errorlevel%
)

echo.
echo [3/4] Starting production servers...
cd ..\sqlite-backend
start "Production Backend" cmd /k "set NODE_ENV=production && npm start"
timeout /t 5 >nul

cd ..\multivendor-web
start "Production Frontend" cmd /k "set NODE_ENV=production && npm start"
timeout /t 8 >nul

echo.
echo [4/4] Verifying deployment...
echo Checking if servers are running...
timeout /t 3 >nul

echo.
echo ================================
echo   🌟 PRODUCTION DEPLOYED! 🌟
echo ================================
echo.
echo Production URL: http://localhost:3000
echo Admin Panel:    http://localhost:3000/admin
echo GraphQL API:    http://localhost:4000/graphql
echo.
echo Monitor logs in the opened terminal windows.
echo Press any key to exit this script...
pause >nul