@echo off
echo 🚀 Enatega VPS Deployment for Windows
echo.

REM Check if PowerShell is available
powershell -Command "Get-Host" >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ PowerShell is required but not found!
    pause
    exit /b 1
)

REM Set your domain here (optional)
set DOMAIN=your-domain.com

echo 📋 Starting deployment to VPS: 145.14.158.29
echo 🌐 Domain: %DOMAIN%
echo.

REM Run PowerShell deployment script
powershell -ExecutionPolicy Bypass -File ".\deploy-vps.ps1" -Domain "%DOMAIN%"

echo.
echo ✅ Deployment script finished!
echo 📖 Check the output above for any errors or next steps.
pause