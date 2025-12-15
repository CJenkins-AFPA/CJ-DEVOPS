#!/bin/bash

################################################################################
# setup-certificates.sh - Générer et configurer les certificats self-signed
#
# Objectif :
# - Récupérer le certificat Harbor CA depuis la VM Harbor
# - Installer Harbor CA dans le trust store système (PC Dev)
# - Vérifier que Docker peut accéder à Harbor en HTTPS
#
# Idempotent : détecte si certificats existent, les réutilise
#
# Usage:
#   ./scripts/setup-certificates.sh  (puis sudo pour installer certs)
#
################################################################################

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
CERTS_DIR="$PROJECT_DIR/certs"
HARBOR_CA_PATH="/usr/local/share/ca-certificates/harbor.local.crt"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log_info() {
    echo -e "${BLUE}ℹ${NC} $*"
}

log_ok() {
    echo -e "${GREEN}✓${NC} $*"
}

log_warn() {
    echo -e "${YELLOW}⚠${NC} $*"
}

log_error() {
    echo -e "${RED}✗${NC} $*"
}

echo "==============================================="
echo "  TP24 Swarm - Certificates Setup"
echo "==============================================="
echo ""

# ============================================================================
# 1. Check if Vagrant is initialized
# ============================================================================
log_info "1. Checking Vagrant VMs..."
if ! command -v vagrant &> /dev/null; then
    log_error "Vagrant not found. Run check-prerequisites.sh first."
    exit 1
fi

# Check if Harbor VM is running
if ! vagrant ssh harbor -c "true" > /dev/null 2>&1; then
    log_error "Harbor VM not running. Run 'vagrant up' first."
    exit 1
fi
log_ok "Harbor VM is running"
echo ""

# ============================================================================
# 2. Create certs directory
# ============================================================================
log_info "2. Creating certificates directory..."
mkdir -p "$CERTS_DIR"
log_ok "Directory: $CERTS_DIR"
echo ""

# ============================================================================
# 3. Fetch Harbor CA certificate
# ============================================================================
log_info "3. Fetching Harbor CA certificate..."
HARBOR_CERT="$CERTS_DIR/harbor.local.crt"

if [ -f "$HARBOR_CERT" ]; then
    log_warn "Harbor CA already exists at $HARBOR_CERT"
else
    log_info "Downloading from Harbor VM..."
    vagrant ssh harbor -c "sudo cat /etc/harbor/ssl/harbor.crt" > "$HARBOR_CERT"
    if [ -s "$HARBOR_CERT" ]; then
        log_ok "Harbor CA saved: $HARBOR_CERT"
    else
        log_error "Failed to fetch Harbor CA"
        exit 1
    fi
fi
echo ""

# ============================================================================
# 4. Install Harbor CA in system trust store (requires sudo)
# ============================================================================
log_info "4. Installing Harbor CA in system trust store..."

if sudo test -f "$HARBOR_CA_PATH"; then
    log_warn "Harbor CA already in trust store"
else
    log_info "Copying to $HARBOR_CA_PATH..."
    sudo cp "$HARBOR_CERT" "$HARBOR_CA_PATH"
    log_ok "Harbor CA installed"
fi

# Update CA certificates
log_info "Updating CA certificate database..."
if command -v update-ca-certificates &> /dev/null; then
    sudo update-ca-certificates -q
    log_ok "CA database updated"
elif command -v update-ca-trust &> /dev/null; then
    sudo update-ca-trust
    log_ok "CA database updated"
else
    log_warn "Could not update CA database (unknown system)"
fi
echo ""

# ============================================================================
# 5. Configure Docker to trust Harbor CA
# ============================================================================
log_info "5. Configuring Docker to trust Harbor CA..."

# Create Docker daemon config directory
DOCKER_CERTS_DIR="/etc/docker/certs.d/harbor.local"
sudo mkdir -p "$DOCKER_CERTS_DIR"

# Copy Harbor CA to Docker certs directory
sudo cp "$HARBOR_CERT" "$DOCKER_CERTS_DIR/ca.crt"
log_ok "Docker daemon configured"
echo ""

# ============================================================================
# 6. Test Docker login to Harbor
# ============================================================================
log_info "6. Testing Docker connection to Harbor..."

# First, ensure docker socket is accessible
if ! docker ps > /dev/null 2>&1; then
    log_warn "Docker daemon not accessible. User may need to be in docker group:"
    log_warn "  sudo usermod -aG docker \$USER"
    log_warn "  newgrp docker"
fi

# Try docker login with credentials
HARBOR_HOST="harbor.local"
HARBOR_USER="admin"
HARBOR_PASS="Harbor12345"

if docker login "$HARBOR_HOST" -u "$HARBOR_USER" -p "$HARBOR_PASS" > /dev/null 2>&1; then
    log_ok "Docker successfully authenticated to Harbor"
else
    log_warn "Docker authentication test failed. Check Harbor is running:"
    log_warn "  vagrant ssh harbor -c 'docker ps'"
    log_warn "  curl -k https://$HARBOR_HOST/"
fi
echo ""

# ============================================================================
# Summary
# ============================================================================
echo "==============================================="
log_ok "Certificates configured!"
echo ""
echo "Certificate locations:"
echo "  System trust: $HARBOR_CA_PATH"
echo "  Docker config: $DOCKER_CERTS_DIR/ca.crt"
echo "  Project backup: $HARBOR_CERT"
echo ""
echo "Next steps:"
echo "  ./scripts/setup-dev-env.sh"
echo ""
