@echo off
echo Setting up development environment for code execution...

echo.
echo Installing Node.js packages...
npm install

echo.
echo Checking Python installation...
python --version || echo Python not found - please install Python

echo.
echo Checking Java installation...
javac -version || echo Java not found - please install JDK

echo.
echo Checking C++ compiler...
g++ --version || echo G++ not found - please install MinGW or Visual Studio

echo.
echo Checking .NET installation...
dotnet --version || echo .NET not found - please install .NET SDK

echo.
echo Checking PHP installation...
php --version || echo PHP not found - please install PHP

echo.
echo Environment setup complete!
echo Run 'npm start' to start the server with code execution capabilities.
pause