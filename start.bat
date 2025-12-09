@echo off
cd /d "%~dp0"

echo ==========================================
echo      Starting Appraise Application
echo ==========================================

REM Check if node_modules exists to skip install if possible
if exist "node_modules" (
    echo Dependencies found. Skipping install.
) else (
    echo Dependencies not found. Installing...
    call npm install
    if %errorlevel% neq 0 (
        echo Error installing dependencies. Please check your Node.js installation.
        pause
        exit /b %errorlevel%
    )
)

echo.
echo Starting development server...
echo The website will open in your default browser.
echo Press Ctrl+C to stop the server.
echo.

call npm run dev -- --open
if %errorlevel% neq 0 (
    echo.
    echo Server stopped with an error.
    pause
)
