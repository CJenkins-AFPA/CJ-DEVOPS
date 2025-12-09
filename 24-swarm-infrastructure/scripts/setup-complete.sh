#!/bin/bash

################################################################################
# setup-complete.sh - Complete Swarm Cluster Setup
#
# Purpose:
#   Automated setup of complete Docker Swarm cluster with all playbooks
#
# Usage:
#   bash setup-complete.sh
#   bash setup-complete.sh --vms-only
#   bash setup-complete.sh --ansible-only
#   bash setup-complete.sh --verbose
#
################################################################################

set -euo pipefail

# ============================================================================
# Colors
# ============================================================================

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
MAGENTA='\033[0;35m'
NC='\033[0m'

# ============================================================================
# Configuration
# ============================================================================

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="${SCRIPT_DIR}/24-swarm-infrastructure"
ANSIBLE_DIR="${PROJECT_DIR}/ansible"
LOG_DIR="${PROJECT_DIR}/logs"
VERBOSE="${VERBOSE:-false}"

# ============================================================================
# Functions
# ============================================================================

header() {
    echo -e "\n${BLUE}╔════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${BLUE}║ $@${NC}"
    echo -e "${BLUE}╚════════════════════════════════════════════════════════════╝${NC}\n"
}

section() {
    echo -e "\n${MAGENTA}>>> $@${NC}\n"
}

success() {
    echo -e "${GREEN}✓ $@${NC}"
}

error() {
    echo -e "${RED}✗ $@${NC}"
}

warning() {
    echo -e "${YELLOW}⚠ $@${NC}"
}

info() {
    echo -e "${BLUE}ℹ $@${NC}"
}

# ============================================================================
# Checks
# ============================================================================

check_requirements() {
    section "Vérification des pré-requis"
    
    local missing=()
    
    # Check Vagrant
    if ! command -v vagrant &> /dev/null; then
        missing+=("vagrant")
    else
        success "Vagrant $(vagrant --version | cut -d' ' -f3)"
    fi
    
    # Check Ansible
    if ! command -v ansible &> /dev/null; then
        missing+=("ansible")
    else
        success "Ansible $(ansible --version | head -1 | cut -d' ' -f6)"
    fi
    
    # Check Docker (optional, for local use)
    if command -v docker &> /dev/null; then
        success "Docker $(docker --version | cut -d' ' -f3 | cut -d',' -f1)"
    else
        warning "Docker non trouvé (optionnel)"
    fi
    
    # Check Python
    if ! command -v python3 &> /dev/null; then
        missing+=("python3")
    else
        success "Python $(python3 --version | cut -d' ' -f2)"
    fi
    
    # Check Git
    if ! command -v git &> /dev/null; then
        missing+=("git")
    else
        success "Git $(git --version | cut -d' ' -f3)"
    fi
    
    if [[ ${#missing[@]} -gt 0 ]]; then
        error "Outils manquants: ${missing[*]}"
        echo -e "\n${YELLOW}Installation:${NC}"
        
        if [[ " ${missing[*]} " =~ " vagrant " ]]; then
            echo "  Vagrant: https://www.vagrantup.com/downloads"
        fi
        
        if [[ " ${missing[*]} " =~ " ansible " ]]; then
            echo "  Ansible: pip install ansible"
        fi
        
        if [[ " ${missing[*]} " =~ " python3 " ]]; then
            echo "  Python: apt install python3 python3-pip"
        fi
        
        return 1
    fi
    
    success "Tous les pré-requis sont satisfaits"
}

# ============================================================================
# Vagrant Setup
# ============================================================================

setup_vms() {
    section "Création des VMs Vagrant"
    
    cd "$PROJECT_DIR"
    
    info "Démarrage de toutes les VMs (cela peut prendre 5-10 minutes)..."
    
    if [[ "$VERBOSE" == "true" ]]; then
        vagrant up
    else
        vagrant up --no-provision 2>&1 | grep -E "(Created|Running|not running|Bringing|Creating|Waiting)" || true
    fi
    
    success "VMs créées et démarrées"
    
    # Verify VMs are running
    echo ""
    info "Vérification du statut des VMs..."
    vagrant status
}

# ============================================================================
# Ansible Setup
# ============================================================================

run_playbook() {
    local playbook=$1
    local description=$2
    
    info "Exécution: $description"
    
    if [[ "$VERBOSE" == "true" ]]; then
        ansible-playbook -i "$ANSIBLE_DIR/inventory.ini" \
                        "$ANSIBLE_DIR/playbooks/$playbook.yml" \
                        -v
    else
        ansible-playbook -i "$ANSIBLE_DIR/inventory.ini" \
                        "$ANSIBLE_DIR/playbooks/$playbook.yml" \
                        2>&1 | grep -E "(PLAY|TASK|ok|changed|failed|RUNNING)" || true
    fi
    
    if [[ $? -eq 0 ]]; then
        success "$description - OK"
    else
        error "$description - FAILED"
        return 1
    fi
}

setup_ansible() {
    section "Configuration Ansible"
    
    cd "$PROJECT_DIR"
    
    # Create logs directory
    mkdir -p "$LOG_DIR"
    
    # Check inventory
    info "Vérification de l'inventory Ansible..."
    if [[ ! -f "$ANSIBLE_DIR/inventory.ini" ]]; then
        error "inventory.ini not found"
        return 1
    fi
    
    success "Inventory trouvé"
    
    # Run playbooks in order
    local playbooks=(
        "00-prepare:Préparation système"
        "01-docker-install:Installation Docker"
        "02-swarm-init:Initialisation Swarm"
        "03-db-deploy:Déploiement PostgreSQL"
        "04-registry-config:Configuration registre privé"
    )
    
    for playbook_spec in "${playbooks[@]}"; do
        local playbook="${playbook_spec%:*}"
        local description="${playbook_spec#*:}"
        
        echo ""
        info "▶ $description..."
        
        if ! run_playbook "$playbook" "$description"; then
            error "Playbook $playbook échoué"
            return 1
        fi
        
        sleep 2  # Wait between playbooks
    done
    
    success "Configuration Ansible complète"
}

# ============================================================================
# Verification
# ============================================================================

verify_cluster() {
    section "Vérification du cluster"
    
    cd "$PROJECT_DIR"
    
    info "Accès au manager et vérification du cluster..."
    
    # Get manager host
    local manager_host=$(grep "^swarm-manager" "$ANSIBLE_DIR/inventory.ini" | grep "ansible_host=" | cut -d'=' -f2)
    
    info "Adresse manager: $manager_host"
    
    # Test SSH access
    if ssh -o StrictHostKeyChecking=no -o ConnectTimeout=5 "vagrant@$manager_host" "docker node ls" &>/dev/null; then
        success "Cluster Swarm opérationnel"
        
        # Show nodes
        info "Nœuds du cluster:"
        ssh -o StrictHostKeyChecking=no "vagrant@$manager_host" "docker node ls" 2>/dev/null || true
    else
        warning "Impossible de vérifier le cluster (SSH peut nécessiter setup clé SSH)"
    fi
}

# ============================================================================
# Usage & Help
# ============================================================================

usage() {
    cat << EOF

${BLUE}Usage:${NC} bash setup-complete.sh [options]

${BLUE}Options:${NC}
    --vms-only          Créer seulement les VMs (pas Ansible)
    --ansible-only      Exécuter seulement Ansible (VMs déjà prêtes)
    --verbose           Mode verbeux (affiche tous les détails)
    --help              Afficher cette aide

${BLUE}Exemples:${NC}
    # Setup complet
    bash setup-complete.sh

    # Créer les VMs et s'arrêter
    bash setup-complete.sh --vms-only

    # Provisionner VMs existantes
    bash setup-complete.sh --ansible-only --verbose

    # Mode complet verbeux
    bash setup-complete.sh --verbose

${YELLOW}Durée estimée:${NC}
    - VMs: 5-10 minutes (première fois)
    - Ansible: 5-10 minutes
    - Total: 10-20 minutes

${YELLOW}Notes:${NC}
    - Vérifier que Vagrant et Ansible sont installés
    - Pour VirtualBox: ~10GB RAM libres (2GB x 4 VMs)
    - Les VMs sont créées avec IP 192.168.56.x/24
    - Logs disponibles dans: $LOG_DIR/

${BLUE}Documentation:${NC}
    README.md      - Guide complet
    QUICKSTART.md  - Démarrage rapide

EOF
}

# ============================================================================
# Main
# ============================================================================

main() {
    header "Docker Swarm Infrastructure - Complete Setup"
    
    # Parse arguments
    local vms_only=false
    local ansible_only=false
    
    while [[ $# -gt 0 ]]; do
        case "$1" in
            --vms-only)
                vms_only=true
                shift
                ;;
            --ansible-only)
                ansible_only=true
                shift
                ;;
            --verbose)
                VERBOSE=true
                shift
                ;;
            --help|-h)
                usage
                exit 0
                ;;
            *)
                error "Option inconnue: $1"
                usage
                exit 1
                ;;
        esac
    done
    
    # =====================================================================
    # Pre-flight checks
    # =====================================================================
    
    if ! check_requirements; then
        error "Les pré-requis ne sont pas satisfaits"
        exit 1
    fi
    
    echo ""
    read -p "Continuer? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        info "Annulation"
        exit 0
    fi
    
    # =====================================================================
    # Execute Setup
    # =====================================================================
    
    if [[ "$ansible_only" == "true" ]]; then
        # Only Ansible
        if ! setup_ansible; then
            error "Setup Ansible échoué"
            exit 1
        fi
    elif [[ "$vms_only" == "true" ]]; then
        # Only VMs
        if ! setup_vms; then
            error "Setup VMs échoué"
            exit 1
        fi
    else
        # Complete setup
        if ! setup_vms; then
            error "Setup VMs échoué"
            exit 1
        fi
        
        echo ""
        warning "⏳ Attente pour que les VMs se stabilisent (30s)..."
        sleep 30
        
        if ! setup_ansible; then
            error "Setup Ansible échoué"
            exit 1
        fi
    fi
    
    # =====================================================================
    # Verification & Summary
    # =====================================================================
    
    echo ""
    verify_cluster
    
    # =====================================================================
    # Final Summary
    # =====================================================================
    
    header "✅ Setup Complet!"
    
    cat << EOF

${GREEN}Cluster Docker Swarm prêt!${NC}

${BLUE}Accès:${NC}
    Vous pouvez maintenant accéder au cluster:
    
    • Manager: vagrant ssh swarm-manager
    • Worker1: vagrant ssh swarm-worker1
    • Worker2: vagrant ssh swarm-worker2
    • DB:      vagrant ssh swarm-db

${BLUE}Commandes utiles:${NC}
    # Vérifier les nœuds
    vagrant ssh swarm-manager -c "docker node ls"
    
    # Monitoring continu
    bash scripts/monitor-health.sh continuous
    
    # Déployer un service
    vagrant ssh swarm-manager -c "docker service create --name web nginx:latest"

${BLUE}Prochaines étapes:${NC}
    1. Tester le déploiement d'une application
    2. Configurer Harbor (../16-harbor-pro)
    3. Intégrer le build-push script (../23-build-push-automation)
    4. Ajouter monitoring (../14-prometheus-grafana-pro)

${BLUE}Documentation:${NC}
    • README.md      - Documentation complète
    • QUICKSTART.md  - Guide rapide
    • Logs: tail -f $LOG_DIR/ansible.log

${YELLOW}Logs Ansible:${NC}
    tail -f $LOG_DIR/ansible.log

EOF
    
}

# ============================================================================
# Run Main
# ============================================================================

main "$@"
