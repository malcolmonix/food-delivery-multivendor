@echo off
echo ================================
echo    Food Delivery MVP Deployment
echo ================================

echo.
echo [1/5] Building the web application...
cd multivendor-web
call npm run build
if %errorlevel% neq 0 (
    echo ERROR: Frontend build failed!
    pause
    exit /b %errorlevel%
)

echo.
echo [2/5] Testing the backend...
cd ..\sqlite-backend
call npm test 2>nul
if %errorlevel% neq 0 (
    echo WARNING: Backend tests failed or not found. Continuing anyway...
)

echo.
echo [3/5] Starting backend server...
start "Backend Server" cmd /k "npm start"
timeout /t 3 >nul

echo.
echo [4/5] Starting frontend server...
cd ..\multivendor-web
start "Frontend Server" cmd /k "npm start"
timeout /t 5 >nul

echo.
echo [5/5] Opening application in browser...
timeout /t 3 >nul
start http://localhost:3000

echo.
echo ================================
echo     🚀 DEPLOYMENT COMPLETE! 🚀
echo ================================
echo.
echo Frontend: http://localhost:3000
echo Backend:  http://localhost:4000/graphql
echo.
echo Press any key to exit...
pause >nul