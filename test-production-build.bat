@echo off
echo 🧪 Testing Production Build Locally
echo.

echo 📦 Installing server dependencies...
cd server
call npm install
if %errorlevel% neq 0 (
    echo ❌ Server npm install failed
    pause
    exit /b 1
)

echo.
echo 📦 Installing client dependencies...
cd ..\client\vue-project
call npm install
if %errorlevel% neq 0 (
    echo ❌ Client npm install failed
    pause
    exit /b 1
)

echo.
echo 🏗️ Building client for production...
call npm run build
if %errorlevel% neq 0 (
    echo ❌ Client build failed
    pause
    exit /b 1
)

echo.
echo ✅ Production build test completed successfully!
echo.
echo 📁 Client build output is in: client\vue-project\dist
echo 🚀 Ready for Render deployment!
echo.
pause