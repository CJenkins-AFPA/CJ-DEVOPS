#!/bin/bash
#
# Script de backup automatisé pour Docker Swarm
# Usage: ./backup-swarm.sh
#

set -e

# Configuration
BACKUP_DIR="/backup/swarm"
DATE=$(date +%Y%m%d-%H%M%S)
RETENTION_DAYS=7

# Couleurs pour les logs
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Vérifier si on est sur un manager
if ! docker node ls &> /dev/null; then
    log_error "Ce script doit être exécuté sur un manager Swarm"
    exit 1
fi

# Créer le répertoire de backup
log_info "Création du répertoire de backup: $BACKUP_DIR"
mkdir -p "$BACKUP_DIR"

# Backup du Raft
log_info "Backup du Raft database..."
log_warn "Arrêt de Docker..."
sudo systemctl stop docker

log_info "Compression des données Swarm..."
sudo tar -czf "$BACKUP_DIR/swarm-$DATE.tar.gz" /var/lib/docker/swarm

log_info "Redémarrage de Docker..."
sudo systemctl start docker

# Attendre que Docker soit prêt
log_info "Attente de la disponibilité de Docker..."
sleep 5

# Backup de la liste des secrets
log_info "Export de la liste des secrets..."
docker secret ls --format "{{.ID}}\t{{.Name}}\t{{.CreatedAt}}" \
    > "$BACKUP_DIR/secrets-list-$DATE.txt"

# Backup des configs
log_info "Export des configurations..."
docker config ls --format "{{.ID}}\t{{.Name}}\t{{.CreatedAt}}" \
    > "$BACKUP_DIR/configs-list-$DATE.txt"

# Export des configs
mkdir -p "$BACKUP_DIR/configs-$DATE"
docker config ls -q | while read config_id; do
    config_name=$(docker config inspect "$config_id" --format '{{.Spec.Name}}')
    log_info "  - Export config: $config_name"
    docker config inspect "$config_id" > "$BACKUP_DIR/configs-$DATE/$config_name.json"
done

# Backup de la topologie du cluster
log_info "Export de la topologie du cluster..."
docker node ls --format "{{.ID}}\t{{.Hostname}}\t{{.Status}}\t{{.Availability}}\t{{.ManagerStatus}}" \
    > "$BACKUP_DIR/nodes-$DATE.txt"

# Backup des détails de chaque nœud
mkdir -p "$BACKUP_DIR/nodes-$DATE"
docker node ls -q | while read node_id; do
    node_name=$(docker node inspect "$node_id" --format '{{.Description.Hostname}}')
    log_info "  - Export node: $node_name"
    docker node inspect "$node_id" > "$BACKUP_DIR/nodes-$DATE/$node_name.json"
done

# Backup des services
log_info "Export des services..."
docker service ls --format "{{.ID}}\t{{.Name}}\t{{.Mode}}\t{{.Replicas}}" \
    > "$BACKUP_DIR/services-$DATE.txt"

# Backup détaillé de chaque service
mkdir -p "$BACKUP_DIR/services-$DATE"
docker service ls -q | while read service_id; do
    service_name=$(docker service inspect "$service_id" --format '{{.Spec.Name}}')
    log_info "  - Export service: $service_name"
    docker service inspect "$service_id" > "$BACKUP_DIR/services-$DATE/$service_name.json"
done

# Backup des networks
log_info "Export des réseaux..."
docker network ls --filter driver=overlay --format "{{.ID}}\t{{.Name}}\t{{.Driver}}\t{{.Scope}}" \
    > "$BACKUP_DIR/networks-$DATE.txt"

mkdir -p "$BACKUP_DIR/networks-$DATE"
docker network ls --filter driver=overlay -q | while read network_id; do
    network_name=$(docker network inspect "$network_id" --format '{{.Name}}')
    log_info "  - Export network: $network_name"
    docker network inspect "$network_id" > "$BACKUP_DIR/networks-$DATE/$network_name.json"
done

# Backup des stacks
log_info "Export des stacks..."
docker stack ls --format "{{.Name}}\t{{.Services}}" \
    > "$BACKUP_DIR/stacks-$DATE.txt" || true

# Backup des volumes
log_info "Export de la liste des volumes..."
docker volume ls --format "{{.Name}}\t{{.Driver}}\t{{.Mountpoint}}" \
    > "$BACKUP_DIR/volumes-$DATE.txt"

# Créer un manifest du backup
log_info "Création du manifest..."
cat > "$BACKUP_DIR/manifest-$DATE.txt" << EOF
Docker Swarm Backup
Date: $DATE
Hostname: $(hostname)
Swarm ID: $(docker info --format '{{.Swarm.Cluster.ID}}')

Fichiers inclus:
- swarm-$DATE.tar.gz (Raft database)
- secrets-list-$DATE.txt (Liste des secrets)
- configs-list-$DATE.txt (Liste des configs)
- configs-$DATE/ (Export des configs)
- nodes-$DATE.txt (Topologie du cluster)
- nodes-$DATE/ (Détails des nœuds)
- services-$DATE.txt (Liste des services)
- services-$DATE/ (Détails des services)
- networks-$DATE.txt (Liste des réseaux)
- networks-$DATE/ (Détails des réseaux)
- stacks-$DATE.txt (Liste des stacks)
- volumes-$DATE.txt (Liste des volumes)

Statistiques:
- Secrets: $(docker secret ls -q | wc -l)
- Configs: $(docker config ls -q | wc -l)
- Nodes: $(docker node ls -q | wc -l)
- Services: $(docker service ls -q | wc -l)
- Networks: $(docker network ls --filter driver=overlay -q | wc -l)
- Volumes: $(docker volume ls -q | wc -l)
EOF

# Nettoyer les vieux backups
log_info "Nettoyage des backups de plus de $RETENTION_DAYS jours..."
find "$BACKUP_DIR" -name "*.tar.gz" -mtime +$RETENTION_DAYS -delete
find "$BACKUP_DIR" -name "*.txt" -mtime +$RETENTION_DAYS -delete
find "$BACKUP_DIR" -type d -name "*-2*" -mtime +$RETENTION_DAYS -exec rm -rf {} + 2>/dev/null || true

# Calculer la taille du backup
BACKUP_SIZE=$(du -sh "$BACKUP_DIR/swarm-$DATE.tar.gz" | cut -f1)

log_info "Backup terminé avec succès!"
echo ""
echo "============================================"
echo "Backup ID: $DATE"
echo "Taille du Raft backup: $BACKUP_SIZE"
echo "Emplacement: $BACKUP_DIR"
echo "============================================"
echo ""
cat "$BACKUP_DIR/manifest-$DATE.txt"
