# Run a local service with VPS infrastructure via SSH tunnel.
#
# Prerequisites: start the tunnel first in a separate terminal:
#   .\scripts\tunnel.ps1
#
# Usage:
#   .\scripts\dev-tunnel.ps1 main        # run main-service
#   .\scripts\dev-tunnel.ps1 storage     # run storage-service
#   .\scripts\dev-tunnel.ps1 frontend    # run task-manager frontend
#   .\scripts\dev-tunnel.ps1 socket      # run socket-service (Elixir)

param(
    [Parameter(Mandatory=$true)]
    [ValidateSet("main", "storage", "frontend", "socket")]
    [string]$Service
)

$envFile = Join-Path $PSScriptRoot "..\.env.tunnel"

if (-not (Test-Path $envFile)) {
    Write-Host "ERROR: .env.tunnel not found. Copy .env.tunnel.example and fill in your values." -ForegroundColor Red
    exit 1
}

# Load env vars from .env.tunnel
Get-Content $envFile | ForEach-Object {
    $line = $_.Trim()
    if ($line -and -not $line.StartsWith("#")) {
        $parts = $line -split "=", 2
        if ($parts.Length -eq 2) {
            [System.Environment]::SetEnvironmentVariable($parts[0], $parts[1], "Process")
        }
    }
}

$root = Join-Path $PSScriptRoot ".."

switch ($Service) {
    "main" {
        Write-Host "Starting main-service on port $env:MAIN_SERVICE_PORT ..." -ForegroundColor Cyan
        Set-Location $root
        cargo run -p main
    }
    "storage" {
        Write-Host "Starting storage-service on port $env:STORAGE_SERVICE_PORT ..." -ForegroundColor Cyan
        Set-Location $root
        cargo run -p storage
    }
    "frontend" {
        Write-Host "Starting task-manager frontend ..." -ForegroundColor Cyan
        Set-Location $root
        pnpm exec nx run task-manager:dev
    }
    "socket" {
        Write-Host "Starting socket-service (Elixir) ..." -ForegroundColor Cyan
        Set-Location (Join-Path $root "apps\elixir\socket_service")
        mix phx.server
    }
}
