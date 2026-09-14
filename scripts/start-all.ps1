# CareerMatch Unified Startup Script

Write-Host "Starting CareerMatch System..." -ForegroundColor Green

# 1. Start AI Service (Python)
Write-Host "Launching AI Service (Port 5001)..." -ForegroundColor Cyan
$aiServiceDir = "ai-service"

# Resolve absolute path for PYTHONPATH
# Script lives in scripts/, so repo root is one level up
$rootPath = (Get-Item $PSScriptRoot).Parent.FullName
$aiAbsPath = "$rootPath\$aiServiceDir"
$aiAppAbsPath = "$rootPath\$aiServiceDir\app"

# Create start-ai.ps1 dynamically to run in new window
# We escape `$env` as ``$env`` so it is not interpolated by the outer script
$aiScriptContent = @"
Write-Host 'Starting AI Service Setup...' -ForegroundColor Yellow
Set-Location "$aiServiceDir"

# Check if venv exists
if (-not (Test-Path ".venv")) {
    Write-Host 'Creating Python Virtual Environment...' -ForegroundColor Yellow
    python -m venv .venv
}

# Activate venv
if (Test-Path ".venv\Scripts\Activate.ps1") {
    . .venv\Scripts\Activate.ps1
} else {
    Write-Error "Could not find Activate.ps1"
    exit 1
}

# Install requirements
if (Test-Path "app\ai\requirements.txt") {
    Write-Host 'Installing/Updating Dependencies...' -ForegroundColor Yellow
    pip install -r app\ai\requirements.txt | Out-Null
} else {
    Write-Error "requirements.txt not found at app\ai\requirements.txt"
}

# Run Uvicorn with correct PYTHONPATH
Write-Host 'Starting Uvicorn...' -ForegroundColor Green

# Add both ai-service and ai-service/app to PYTHONPATH so 'app.ai...' and 'ai.src...' both work
`$env:PYTHONPATH = "$aiAbsPath;$aiAppAbsPath"

# Using host 0.0.0.0 to allow external access if needed, standard port 5001
uvicorn app.ai.src.api.main:app --port 5001 --reload --host 0.0.0.0
"@

$aiScriptPath = "$rootPath\scripts\start-ai-temp.ps1"
Set-Content -Path $aiScriptPath -Value $aiScriptContent

Start-Process powershell -ArgumentList "-NoExit", "-ExecutionPolicy", "Bypass", "-File", "$aiScriptPath"

# 2. Start Backend (ASP.NET Core)
Write-Host "Launching Backend API (Port 5217)..." -ForegroundColor Cyan
$backendDir = "$rootPath\CareerMatch"
Start-Process powershell -ArgumentList "-NoExit", "-Command", "dotnet run" -WorkingDirectory $backendDir

# 3. Start Frontend (React + Vite)
Write-Host "Launching Frontend (Port 5173)..." -ForegroundColor Cyan
$frontendDir = "$rootPath\frontend"
Start-Process powershell -ArgumentList "-NoExit", "-Command", "npm run dev" -WorkingDirectory $frontendDir

Write-Host "All services launched!" -ForegroundColor Green
Write-Host "Backend: http://localhost:5217"
Write-Host "Frontend: http://localhost:5173"
Write-Host "AI Docs: http://localhost:5001/docs"

