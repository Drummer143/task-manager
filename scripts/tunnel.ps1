# SSH tunnel to VPS for local development
# Usage: .\scripts\tunnel.ps1 [user@host]
#
# Forwards:
#   localhost:5432  -> VPS postgres
#   localhost:6379  -> VPS redis
#   localhost:9000  -> VPS authentik
#
# Press Ctrl+C to stop the tunnel.

param(
    [Parameter(Mandatory=$true)]
    [string]$SshHost
)

Write-Host "Starting SSH tunnel to $SshHost ..." -ForegroundColor Cyan
Write-Host "  localhost:5432  -> postgres"
Write-Host "  localhost:6379  -> redis"
Write-Host "  localhost:9000  -> authentik"
Write-Host ""
Write-Host "Press Ctrl+C to stop." -ForegroundColor Yellow

ssh -N `
    -L 5432:localhost:5432 `
    -L 6379:localhost:6379 `
    -L 9000:localhost:9000 `
    $SshHost
