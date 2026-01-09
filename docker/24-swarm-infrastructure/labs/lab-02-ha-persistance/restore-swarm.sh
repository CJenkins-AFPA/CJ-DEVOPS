#!/bin/bash
#
# Script de restore pour Docker Swarm
# Usage: ./restore-swarm.sh <backup-date>
# Exemple: ./restore-swarm.sh 20231210-143022
#

set -e

BACKUP_DIR="/backup/swarm"
BACKUP_DATE="$1"

# Couleurs
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Validation
if [ -z "$BACKUP_DATE" ]; then
    log_error "Usage: $0 <backup-date>"
    echo ""
    echo "Backups disponibles:"
    ls -1 "$BACKUP_DIR"/swarm-*.tar.gz 2>/dev/null | sed 's/.*swarm-\(.*\)\.tar\.gz/  \1/' || echo "  Aucun backup trouvé"
    exit 1
fi

BACKUP_FILE="$BACKUP_DIR/swarm-$BACKUP_DATE.tar.gz"
MANIFEST_FILE="$BACKUP_DIR/manifest-$BACKUP_DATE.txt"

if [ ! -f "$BACKUP_FILE" ]; then
    log_error "Backup non trouvé: $BACKUP_FILE"
    exit 1
fi

# Afficher le manifest
if [ -f "$MANIFEST_FILE" ]; then
    log_info "Informations du backup:"
    cat "$MANIFEST_FILE"
    echo ""
fi

# Confirmation
log_warn "ATTENTION: Cette opération va:"
log_warn "  1. Arrêter Docker"
log_warn "  2. Supprimer les données Swarm actuelles"
log_warn "  3. Restaurer les données du backup"
log_warn "  4. Réinitialiser le cluster Swarm"
echo ""
read -p "Voulez-vous continuer? (yes/NO): " -r
if [[ ! $REPLY =~ ^[Yy][Ee][Ss]$ ]]; then
    log_info "Opération annulée"
    exit 0
fi

# Backup de sécurité des données actuelles
log_info "Création d'un backup de sécurité des données actuelles..."
SAFETY_BACKUP="$BACKUP_DIR/pre-restore-$(date +%Y%m%d-%H%M%S).tar.gz"
sudo systemctl stop docker
sudo tar -czf "$SAFETY_BACKUP" /var/lib/docker/swarm 2>/dev/null || true
log_info "Backup de sécurité créé: $SAFETY_BACKUP"

# Suppression des données actuelles
log_info "Suppression des données Swarm actuelles..."
sudo rm -rf /var/lib/docker/swarm

# Restauration
log_info "Extraction du backup..."
sudo tar -xzf "$BACKUP_FILE" -C /

# Récupérer l'adresse IP du manager
MANAGER_IP=$(ip -4 addr show eth1 | grep -oP '(?<=inet\s)\d+(\.\d+){3}' | head -n1)
if [ -z "$MANAGER_IP" ]; then
    MANAGER_IP="192.168.56.10"
    log_warn "IP auto-détectée non trouvée, utilisation de $MANAGER_IP"
else
    log_info "IP du manager détectée: $MANAGER_IP"
fi

# Démarrer Docker
log_info "Démarrage de Docker..."
sudo systemctl start docker

# Attendre que Docker soit prêt
log_info "Attente de Docker..."
sleep 10

# Forcer la réinitialisation du Swarm
log_info "Réinitialisation du Swarm avec force-new-cluster..."
docker swarm init --force-new-cluster --advertise-addr "$MANAGER_IP" || {
    log_error "Échec de l'initialisation du Swarm"
    log_info "Tentative de restauration depuis le backup de sécurité..."
    sudo systemctl stop docker
    sudo rm -rf /var/lib/docker/swarm
    sudo tar -xzf "$SAFETY_BACKUP" -C /
    sudo systemctl start docker
    exit 1
}

log_info "Cluster réinitialisé avec succès!"

# Afficher l'état
echo ""
log_info "État du cluster:"
docker node ls

echo ""
log_info "Services récupérés:"
docker service ls

echo ""
log_info "Réseaux récupérés:"
docker network ls --filter driver=overlay

echo ""
log_info "Secrets récupérés:"
docker secret ls

echo ""
log_info "Configs récupérées:"
docker config ls

echo ""
echo "============================================"
log_info "Restore terminé avec succès!"
echo "============================================"
echo ""
log_warn "PROCHAINES ÉTAPES:"
echo "  1. Vérifier l'état des services: docker service ls"
echo "  2. Rejoindre les autres managers avec: docker swarm join-token manager"
echo "  3. Rejoindre les workers avec: docker swarm join-token worker"
echo "  4. Vérifier les volumes et les données persistantes"
echo ""
