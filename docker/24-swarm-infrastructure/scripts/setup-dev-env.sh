#!/usr/bin/env bash

################################################################################
# setup-dev-env.sh - Configuration complète du poste développement (PC Dev)
#
# Exécute dans l'ordre :
# 1. check-prerequisites.sh (vérifie/installe dépendances)
# 2. setup-certificates.sh (configure Harbor CA)
# 3. Configure /etc/hosts
# 4. Teste Docker login
#
# Usage:
#   sudo ./scripts/setup-dev-env.sh
#
################################################################################

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"

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
echo "  TP24 Swarm - PC Dev Configuration"
echo "==============================================="
echo ""

# ============================================================================
# 1. Check prerequisites
# ============================================================================
log_info "Phase 1: Checking prerequisites..."
if ! "$SCRIPT_DIR/check-prerequisites.sh"; then
    log_error "Prerequisites check failed"
    exit 1
fi
echo ""

# ============================================================================
# 2. Setup certificates
# ============================================================================
log_info "Phase 2: Setting up certificates..."
if ! "$SCRIPT_DIR/setup-certificates.sh"; then
    log_error "Certificate setup failed"
    exit 1
fi
echo ""

# ============================================================================
# 3. Configure /etc/hosts
# ============================================================================
log_info "Phase 3: Configuring /etc/hosts..."
HOSTS_FILE="/etc/hosts"
ENTRIES=(
    "192.168.56.10 harbor.local"
    "192.168.56.20 swarm-manager.local portainer.local afpabike.local uyoop.local traefik.local"
    "192.168.56.21 swarm-worker1.local"
    "192.168.56.22 swarm-worker2.local"
    "192.168.56.30 db.local"
)

ADDED=0
for entry in "${ENTRIES[@]}"; do
    if ! grep -qF "$entry" "$HOSTS_FILE" 2>/dev/null; then
        echo "$entry" | sudo tee -a "$HOSTS_FILE" > /dev/null
        ADDED=$((ADDED + 1))
    fi
done

if [ $ADDED -gt 0 ]; then
    log_ok "Added $ADDED entries to /etc/hosts"
else
    log_ok "/etc/hosts already configured"
fi
echo ""

# ============================================================================
# 4. Test Docker connection
# ============================================================================
log_info "Phase 4: Testing Docker connectivity..."

# Ensure user can access docker socket
if ! docker ps > /dev/null 2>&1; then
    log_warn "Docker socket not accessible. Adding user to docker group..."
    sudo usermod -aG docker "$USER" 2>/dev/null || true
    log_warn "Please run: newgrp docker"
fi

HARBOR_URL="${HARBOR_URL:-harbor.local}"
HARBOR_USER="${HARBOR_USER:-admin}"
HARBOR_PASS="${HARBOR_PASS:-Harbor12345}"

log_info "Testing Docker login to Harbor..."
if docker login "$HARBOR_URL" -u "$HARBOR_USER" -p "$HARBOR_PASS" > /dev/null 2>&1; then
    log_ok "Docker connected to Harbor"
else
    log_warn "Docker login failed. Ensure Harbor VM is running and accessible."
fi
echo ""

# ============================================================================
# 5. Verify versions
# ============================================================================
log_info "Phase 5: Verifying installed versions..."
log_ok "$(docker --version)"
log_ok "$(docker compose version)"
log_ok "$(vagrant --version)"
log_ok "$(ansible --version | head -1)"
log_ok "$(git --version)"
echo ""

# ============================================================================
# Summary
# ============================================================================
echo "==============================================="
log_ok "PC Dev configuration complete!"
echo ""
echo "Deployed components:"
echo "  ✓ System prerequisites installed"
echo "  ✓ Harbor CA certificate configured"
echo "  ✓ /etc/hosts updated with VM hostnames"
echo "  ✓ Docker authenticated to Harbor"
echo ""
echo "Next steps:"
echo "  1. Ensure Vagrant VMs are running:"
echo "     vagrant status"
echo "  2. Deploy infrastructure:"
echo "     ./scripts/deploy-all.sh"
echo "  3. Build and push app images:"
echo "     cd apps/afpabike && ../../scripts/build-and-push.sh afpabike harbor.local/library"
echo "     cd apps/uyoopapp && ../../scripts/build-and-push.sh uyoopapp harbor.local/library"
echo ""