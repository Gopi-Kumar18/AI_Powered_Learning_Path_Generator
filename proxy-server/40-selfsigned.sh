#!/bin/sh
# Generates a self-signed certificate on first start (kept in a Docker volume,
# so it survives redeploys and the browser exception only has to be accepted once).
set -e

CERT_DIR=/etc/nginx/certs
mkdir -p "$CERT_DIR"

if [ ! -f "$CERT_DIR/server.crt" ] || [ ! -f "$CERT_DIR/server.key" ]; then
  echo "[selfsigned] generating certificate..."
  openssl req -x509 -nodes -newkey rsa:2048 -days 365 \
    -keyout "$CERT_DIR/server.key" \
    -out "$CERT_DIR/server.crt" \
    -subj "/CN=sals-app" \
    -addext "subjectAltName=DNS:localhost,IP:127.0.0.1${PUBLIC_IP:+,IP:$PUBLIC_IP}"
fi
