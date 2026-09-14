Write-Host 'Starting AI Service Setup...' -ForegroundColor Yellow
Set-Location "ai-service"

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
$env:PYTHONPATH = "C:\Users\Enes\RiderProjects\CareerMatch\ai-service;C:\Users\Enes\RiderProjects\CareerMatch\ai-service\app"

# Using host 0.0.0.0 to allow external access if needed, standard port 5001
uvicorn app.ai.src.api.main:app --port 5001 --reload --host 0.0.0.0
