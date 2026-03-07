$ErrorActionPreference = "Stop"

$certsDir = Join-Path (Split-Path $PSScriptRoot) "certs"

if (-not (Test-Path $certsDir)) {
    New-Item -ItemType Directory -Path $certsDir | Out-Null
}

$keyPath = Join-Path $certsDir "localhost-key.pem"
$certPath = Join-Path $certsDir "localhost.pem"

if (Get-Command mkcert -ErrorAction SilentlyContinue) {
    Write-Host "Using mkcert to generate locally-trusted certificates..."
    $ErrorActionPreference = "Continue"
    & mkcert -install 2>&1 | Out-Null
    $ErrorActionPreference = "Stop"
    & mkcert -key-file $keyPath -cert-file $certPath localhost 127.0.0.1 "::1"
} else {
    Write-Host "mkcert not found, falling back to openssl..."
    openssl req -x509 -newkey rsa:2048 -nodes `
        -keyout $keyPath `
        -out $certPath `
        -days 365 `
        -subj "/CN=localhost" `
        -addext "subjectAltName=DNS:localhost,IP:127.0.0.1,IP:::1"
    Write-Host ""
    Write-Host "WARNING: self-signed certificate generated via openssl." -ForegroundColor Yellow
    Write-Host "Your browser will show a security warning. To avoid this, install mkcert:"
    Write-Host "  https://github.com/FiloSottile/mkcert#installation"
}

Write-Host ""
Write-Host "Certificates generated in $certsDir"
Write-Host "  - $keyPath"
Write-Host "  - $certPath"
