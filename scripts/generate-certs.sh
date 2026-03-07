#!/usr/bin/env bash
set -euo pipefail

CERTS_DIR="$(cd "$(dirname "$0")/.." && pwd)/certs"

mkdir -p "$CERTS_DIR"

if command -v mkcert &>/dev/null; then
    echo "Using mkcert to generate locally-trusted certificates..."
    mkcert -install 2>/dev/null || true
    mkcert -key-file "$CERTS_DIR/localhost-key.pem" -cert-file "$CERTS_DIR/localhost.pem" \
        localhost 127.0.0.1 ::1
else
    echo "mkcert not found, falling back to openssl..."
    openssl req -x509 -newkey rsa:2048 -nodes \
        -keyout "$CERTS_DIR/localhost-key.pem" \
        -out "$CERTS_DIR/localhost.pem" \
        -days 365 \
        -subj "/CN=localhost" \
        -addext "subjectAltName=DNS:localhost,IP:127.0.0.1,IP:::1"
    echo ""
    echo "WARNING: self-signed certificate generated via openssl."
    echo "Your browser will show a security warning. To avoid this, install mkcert:"
    echo "  https://github.com/FiloSottile/mkcert#installation"
fi

echo ""
echo "Certificates generated in $CERTS_DIR"
echo "  - $CERTS_DIR/localhost-key.pem"
echo "  - $CERTS_DIR/localhost.pem"
