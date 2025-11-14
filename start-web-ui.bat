@echo off
echo.
echo ========================================
echo  Bruno Collection Generator - Web UI
echo ========================================
echo.
echo Starting the web server...
echo.

cd web-ui

REM Check if node_modules exists
if not exist "node_modules\" (
    echo Installing dependencies...
    call npm install
    echo.
)

echo Starting server on http://localhost:3001
echo.
echo The browser will open automatically...
echo.
echo Press Ctrl+C to stop the server
echo.

REM Start the server and open browser
start http://localhost:3001/index.html
node server.js
