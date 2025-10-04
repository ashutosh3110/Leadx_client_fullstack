# LeadX Platform Startup Script
Write-Host "🚀 Starting LeadX Ambassador Platform..." -ForegroundColor Green
Write-Host ""

# Start Backend
Write-Host "📡 Starting Backend Server..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd leadx-backend; npm run dev" -WindowStyle Normal

# Wait a bit
Start-Sleep -Seconds 3

# Start Frontend  
Write-Host "🌐 Starting Frontend Server..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd leadx-frontend; npm run dev" -WindowStyle Normal

# Wait a bit more
Start-Sleep -Seconds 2

Write-Host ""
Write-Host "✅ LeadX Platform is starting up!" -ForegroundColor Green
Write-Host ""
Write-Host "🔗 URLs:" -ForegroundColor Cyan
Write-Host "   Backend:  http://localhost:5000" -ForegroundColor White
Write-Host "   Frontend: http://localhost:3000" -ForegroundColor White
Write-Host ""
Write-Host "📋 Next Steps:" -ForegroundColor Cyan
Write-Host "   1. Open http://localhost:3000 in your browser" -ForegroundColor White
Write-Host "   2. Login as admin" -ForegroundColor White
Write-Host "   3. Go to Settings > Customize" -ForegroundColor White
Write-Host "   4. Fill the form to generate a script" -ForegroundColor White
Write-Host "   5. Test with test-embed.html" -ForegroundColor White
Write-Host ""
Write-Host "Press any key to continue..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")