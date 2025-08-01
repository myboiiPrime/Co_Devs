@echo off
echo 🧪 Testing Production Build Locally
echo.

echo 📦 Installing backend dependencies...
cd backend
call npm install
if %errorlevel% neq 0 (
    echo ❌ Backend npm install failed
    pause
    exit /b 1
)

echo.
echo 📦 Installing frontend dependencies...
cd ..\frontend\vue-project
call npm install
if %errorlevel% neq 0 (
    echo ❌ Frontend npm install failed
    pause
    exit /b 1
)

echo.
echo 🏗️ Building frontend for production...
call npm run build
if %errorlevel% neq 0 (
    echo ❌ Frontend build failed
    pause
    exit /b 1
)

echo.
echo ✅ Production build test completed successfully!
echo.
echo 📁 Frontend build output is in: frontend\vue-project\dist
echo 🚀 Ready for Render deployment!
echo.
pause