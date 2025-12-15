#!/bin/bash

################################################################################
# check-prerequisites.sh - Vérifier et installer les dépendances système
#
# Objectif : Assurer que tous les prérequis sont présents avant déploiement
# - Vagrant + VirtualBox
# - Ansible
# - Docker CLI
# - git
# - curl, openssl, jq
#
# Idempotent : peut être exécuté plusieurs fois sans effet de bord
#
# Usage:
#   sudo ./scripts/check-prerequisites.sh
#   ./scripts/check-prerequisites.sh [--skip-install] [--verbose]
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

# Flags
SKIP_INSTALL=${SKIP_INSTALL:-false}
VERBOSE=${VERBOSE:-false}

# Parse arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --skip-install) SKIP_INSTALL=true; shift ;;
        --verbose) VERBOSE=true; shift ;;
        *) echo "Usage: $0 [--skip-install] [--verbose]"; exit 1 ;;
    esac
done

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

check_command() {
    local cmd=$1
    local name=${2:-$cmd}
    
    if command -v "$cmd" &> /dev/null; then
        local version=$($cmd --version 2>&1 | head -1)
        log_ok "$name : $version"
        return 0
    else
        log_warn "$name : NOT FOUND"
        return 1
    fi
}

install_package() {
    local package=$1
    local name=${2:-$package}
    
    if [ "$SKIP_INSTALL" = true ]; then
        log_warn "Skipping installation of $name (--skip-install)"
        return 1
    fi
    
    log_info "Installing $name..."
    
    if command -v apt-get &> /dev/null; then
        sudo apt-get update -qq
        sudo apt-get install -y "$package" > /dev/null 2>&1
        log_ok "$name installed"
        return 0
    elif command -v dnf &> /dev/null; then
        sudo dnf install -y "$package" > /dev/null 2>&1
        log_ok "$name installed"
        return 0
    else
        log_error "Unsupported package manager. Please install $name manually."
        return 1
    fi
}

echo "==============================================="
echo "  TP24 Swarm - Prerequisites Check"
echo "==============================================="
echo ""

MISSING_DEPS=0

# ============================================================================
# 1. Check OS
# ============================================================================
log_info "1. Checking OS..."
if [[ "$OSTYPE" == "linux-gnu"* ]]; then
    OS=$(lsb_release -ds 2>/dev/null || echo "Linux")
    log_ok "OS: $OS"
else
    log_error "Unsupported OS: $OSTYPE (Linux required)"
    exit 1
fi
echo ""

# ============================================================================
# 2. Check Vagrant
# ============================================================================
log_info "2. Checking Vagrant..."
if ! check_command vagrant; then
    MISSING_DEPS=$((MISSING_DEPS + 1))
    if ! install_package vagrant; then
        log_error "Vagrant installation failed"
    fi
fi

# Check VirtualBox
if ! check_command vboxmanage "VirtualBox"; then
    log_error "VirtualBox NOT FOUND (required by Vagrant)"
    MISSING_DEPS=$((MISSING_DEPS + 1))
    if [ "$SKIP_INSTALL" = false ]; then
        log_info "Installing VirtualBox..."
        if ! install_package virtualbox; then
            log_error "VirtualBox installation failed. Install manually from https://www.virtualbox.org"
        fi
    fi
fi
echo ""

# ============================================================================
# 3. Check Ansible
# ============================================================================
log_info "3. Checking Ansible..."
if ! check_command ansible; then
    MISSING_DEPS=$((MISSING_DEPS + 1))
    if ! install_package ansible; then
        log_error "Ansible installation failed"
    fi
fi
echo ""

# ============================================================================
# 4. Check Docker
# ============================================================================
log_info "4. Checking Docker..."
if ! check_command docker; then
    MISSING_DEPS=$((MISSING_DEPS + 1))
    log_info "Installing Docker..."
    if command -v apt-get &> /dev/null; then
        # Add Docker GPG key
        if [ "$SKIP_INSTALL" = false ]; then
            sudo apt-get update -qq
            sudo apt-get install -y ca-certificates curl gnupg lsb-release > /dev/null 2>&1
            sudo mkdir -p /etc/apt/keyrings
            curl -fsSL https://download.docker.com/linux/debian/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
            
            # Add Docker repository
            echo "deb [arch=amd64 signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/debian $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
            
            sudo apt-get update -qq
            sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin > /dev/null 2>&1
            log_ok "Docker installed"
        fi
    fi
fi
echo ""

# ============================================================================
# 5. Check git
# ============================================================================
log_info "5. Checking git..."
if ! check_command git; then
    MISSING_DEPS=$((MISSING_DEPS + 1))
    if ! install_package git; then
        log_error "git installation failed"
    fi
fi
echo ""

# ============================================================================
# 6. Check utilities
# ============================================================================
log_info "6. Checking utilities..."
for cmd in curl openssl jq; do
    if ! check_command "$cmd"; then
        MISSING_DEPS=$((MISSING_DEPS + 1))
        if ! install_package "$cmd"; then
            log_warn "Failed to install $cmd"
        fi
    fi
done
echo ""

# ============================================================================
# 7. Check SSH keys for Vagrant
# ============================================================================
log_info "7. Checking SSH configuration..."
if [ -d "$PROJECT_DIR/.vagrant" ]; then
    PRIVATE_KEYS=$(find "$PROJECT_DIR/.vagrant" -name "private_key" 2>/dev/null | wc -l)
    log_ok "Found $PRIVATE_KEYS Vagrant SSH private keys"
else
    log_warn "Vagrant folder not initialized yet (will be created on 'vagrant up')"
fi
echo ""

# ============================================================================
# 8. Check git repository
# ============================================================================
log_info "8. Checking git repository..."
if [ -d "$PROJECT_DIR/.git" ]; then
    BRANCH=$(cd "$PROJECT_DIR" && git rev-parse --abbrev-ref HEAD)
    COMMIT=$(cd "$PROJECT_DIR" && git rev-parse --short HEAD)
    log_ok "Git repository: branch '$BRANCH' (commit: $COMMIT)"
else
    log_warn "Not a git repository. Run 'git init' if needed."
fi
echo ""

# ============================================================================
# Summary
# ============================================================================
echo "==============================================="
if [ $MISSING_DEPS -eq 0 ]; then
    log_ok "All prerequisites OK !"
    echo ""
    echo "Next steps:"
    echo "  1. ./scripts/setup-certificates.sh    (generate certs)"
    echo "  2. ./scripts/setup-dev-env.sh          (configure env)"
    echo "  3. ./scripts/deploy-all.sh             (deploy infrastructure)"
    echo ""
    exit 0
else
    log_error "$MISSING_DEPS missing dependencies"
    if [ "$SKIP_INSTALL" = true ]; then
        echo ""
        echo "Run without --skip-install to auto-install missing packages:"
        echo "  sudo ./scripts/check-prerequisites.sh"
        echo ""
        exit 1
    fi
fi
