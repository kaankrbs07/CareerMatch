# Script to restart backend and apply database migration

Write-Host "Stopping all services..." -ForegroundColor Yellow

# Find and stop all PowerShell processes running our services
Get-Process powershell | Where-Object { 
    $_.MainWindowTitle -match "CareerMatch|AI Service|Frontend|Backend" 
} | Stop-Process -Force -ErrorAction SilentlyContinue

# Wait a moment for processes to clean up
Start-Sleep -Seconds 2

Write-Host "Creating and applying database migration..." -ForegroundColor Cyan
Set-Location "CareerMatch"

# Create migration
dotnet ef migrations add AddFeedbackTable

# Apply migration to database
dotnet ef database update

Write-Host "`nMigration complete!" -ForegroundColor Green
Write-Host "`nRestarting all services..." -ForegroundColor Cyan

# Go back to root and restart all services
Set-Location ..
.\run.bat

