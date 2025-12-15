#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="${SCRIPT_DIR}/.."
ANSIBLE_DIR="${PROJECT_DIR}/ansible"

# Exporter la variable pour qu'Ansible utilise le bon ansible.cfg
export ANSIBLE_CONFIG="${ANSIBLE_DIR}/ansible.cfg"

echo "=== Déploiement complet Swarm Infrastructure ==="
echo ""

# Fonction d'exécution avec confirmation
run_playbook() {
    local playbook="$1"
    local description="$2"
    
    echo "-----------------------------------"
    echo "Étape: ${description}"
    echo "Playbook: ${playbook}"
    echo "-----------------------------------"
    
    if ansible-playbook -i "${ANSIBLE_DIR}/inventory.ini" "${ANSIBLE_DIR}/playbooks/${playbook}"; then
        echo "✓ ${description} - OK"
    else
        echo "✗ ${description} - ÉCHEC"
        read -p "Continuer malgré l'erreur? (y/N) " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            exit 1
        fi
    fi
    echo ""
}

# Phase 1: Infrastructure
echo "=== PHASE 1: INFRASTRUCTURE ==="
run_playbook "00-prerequisites.yml" "Vérification prérequis"
run_playbook "01-docker-setup.yml" "Installation Docker Engine"
run_playbook "02-swarm-init.yml" "Initialisation Swarm"
run_playbook "03-network-setup.yml" "Configuration réseau et /etc/hosts"
run_playbook "04-registry-setup.yml" "Configuration Harbor"
run_playbook "05-database-setup.yml" "Configuration MariaDB externe"

# Phase 2: Services Swarm
echo "=== PHASE 2: SERVICES SWARM ==="
run_playbook "10-deploy-traefik.yml" "Déploiement Traefik"
run_playbook "11-deploy-portainer.yml" "Déploiement Portainer"
run_playbook "12-deploy-apps.yml" "Déploiement Applications"

# Phase 3: Vérification
echo "=== PHASE 3: VÉRIFICATION ==="
run_playbook "99-health-check.yml" "Health check cluster"

echo ""
echo "=== DÉPLOIEMENT TERMINÉ ==="
echo "Vérifiez les services:"
echo "  - Traefik: https://traefik.local"
echo "  - Portainer: https://portainer.local"
echo "  - Afpabike: https://afpabike.local"
echo "  - uyoopApp: https://uyoop.local"