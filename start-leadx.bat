@echo off
echo Starting LeadX Ambassador Platform...
echo.

echo Starting Backend Server...
start "LeadX Backend" cmd /k "cd leadx-backend && npm run dev"

timeout /t 3 /nobreak >nul

echo Starting Frontend Server...
start "LeadX Frontend" cmd /k "cd leadx-frontend && npm run dev"

timeout /t 2 /nobreak >nul

echo.
echo ✅ LeadX Platform is starting up!
echo.
echo Backend: http://localhost:5000
echo Frontend: http://localhost:3000
echo.
echo Open test-embed.html to test the widget embedding
echo.
pause