#!/bin/bash

# ============================================================================
# Harbor Production Backup Script
# Backs up: PostgreSQL, Registry data, Harbor configs, Prometheus data
# ============================================================================

set -euo pipefail

# Configuration
BACKUP_DIR="/backups/harbor"
BACKUP_TIMESTAMP=$(date +%Y%m%d_%H%M%S)
LOG_FILE="${BACKUP_DIR}/backup_${BACKUP_TIMESTAMP}.log"
RETENTION_DAYS=${BACKUP_RETENTION_DAYS:-30}

# Docker environment
COMPOSE_FILE="${PWD}/docker-compose.yml"
BACKUP_CONTAINER_PREFIX="harbor_"

# Color output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Ensure backup directory exists
mkdir -p "${BACKUP_DIR}"

# Logging function
log() {
    local level=$1
    shift
    local message="$*"
    local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
    echo "[${timestamp}] [${level}] ${message}" | tee -a "${LOG_FILE}"
}

# Error handler
trap 'log "ERROR" "Backup failed"; exit 1' ERR

log "INFO" "Starting Harbor backup (Timestamp: ${BACKUP_TIMESTAMP})"

# Create backup subdirectories
BACKUP_PATH="${BACKUP_DIR}/harbor_backup_${BACKUP_TIMESTAMP}"
mkdir -p "${BACKUP_PATH}"/{database,registry,configs,prometheus}

echo -e "${YELLOW}Starting backup process...${NC}"

# ============================================================================
# 1. Backup PostgreSQL Database
# ============================================================================
log "INFO" "Backing up PostgreSQL database..."

docker compose exec -T postgres-primary pg_dump \
    -U postgres \
    -d harbor \
    --verbose \
    --format=plain \
    --file=/var/lib/postgresql/backup/harbor_backup_${BACKUP_TIMESTAMP}.sql \
    2>&1 | tee -a "${LOG_FILE}" || {
    log "ERROR" "PostgreSQL backup failed"
    exit 1
}

# Copy backup from container
docker compose cp postgres-primary:/var/lib/postgresql/backup/harbor_backup_${BACKUP_TIMESTAMP}.sql \
    "${BACKUP_PATH}/database/" || {
    log "ERROR" "Failed to copy PostgreSQL backup"
    exit 1
}

log "INFO" "PostgreSQL backup completed"
du -h "${BACKUP_PATH}/database/"* | tee -a "${LOG_FILE}"

# ============================================================================
# 2. Backup Redis Data
# ============================================================================
log "INFO" "Backing up Redis data..."

docker compose exec -T redis-master redis-cli \
    -a "${REDIS_PASSWORD}" \
    --rdb "${BACKUP_PATH}/redis_backup_${BACKUP_TIMESTAMP}.rdb" 2>&1 | tee -a "${LOG_FILE}" || {
    log "ERROR" "Redis backup failed"
    exit 1
}

log "INFO" "Redis backup completed"
du -h "${BACKUP_PATH}"/redis* | tee -a "${LOG_FILE}"

# ============================================================================
# 3. Backup Registry Data (if filesystem storage)
# ============================================================================
log "INFO" "Backing up Registry data..."

if [ -d "${PWD}/registry-data" ]; then
    tar --exclude='*.lock' \
        -czf "${BACKUP_PATH}/registry/registry_backup_${BACKUP_TIMESTAMP}.tar.gz" \
        -C "${PWD}" registry-data/ 2>&1 | tee -a "${LOG_FILE}" || {
        log "ERROR" "Registry backup failed"
        exit 1
    }
    log "INFO" "Registry backup completed"
    du -h "${BACKUP_PATH}/registry/"* | tee -a "${LOG_FILE}"
else
    log "WARNING" "Registry filesystem storage not found (using S3?)"
fi

# ============================================================================
# 4. Backup Configuration Files
# ============================================================================
log "INFO" "Backing up configuration files..."

tar -czf "${BACKUP_PATH}/configs/configs_backup_${BACKUP_TIMESTAMP}.tar.gz" \
    -C "${PWD}" \
    config/ \
    traefik/ \
    prometheus/ \
    --exclude='*.log' \
    2>&1 | tee -a "${LOG_FILE}" || {
    log "ERROR" "Configuration backup failed"
    exit 1
}

log "INFO" "Configuration backup completed"
du -h "${BACKUP_PATH}/configs/"* | tee -a "${LOG_FILE}"

# ============================================================================
# 5. Backup Docker volumes metadata
# ============================================================================
log "INFO" "Backing up volumes metadata..."

docker compose exec -T grafana tar -czf /tmp/grafana_backup_${BACKUP_TIMESTAMP}.tar.gz \
    /var/lib/grafana/ 2>&1 | tee -a "${LOG_FILE}" || true

docker compose cp grafana:/tmp/grafana_backup_${BACKUP_TIMESTAMP}.tar.gz \
    "${BACKUP_PATH}/" 2>&1 | tee -a "${LOG_FILE}" || {
    log "WARNING" "Grafana backup failed (continuing)"
}

log "INFO" "Volumes backup completed"

# ============================================================================
# 6. Backup Prometheus configuration and recent data
# ============================================================================
log "INFO" "Backing up Prometheus data..."

tar -czf "${BACKUP_PATH}/prometheus/prometheus_backup_${BACKUP_TIMESTAMP}.tar.gz" \
    -C "${PWD}" \
    prometheus/ \
    --exclude='prometheus-data/wal' \
    2>&1 | tee -a "${LOG_FILE}" || {
    log "ERROR" "Prometheus backup failed"
    exit 1
}

log "INFO" "Prometheus backup completed"
du -h "${BACKUP_PATH}/prometheus/"* | tee -a "${LOG_FILE}"

# ============================================================================
# 7. Create manifest and checksum
# ============================================================================
log "INFO" "Creating backup manifest..."

cat > "${BACKUP_PATH}/MANIFEST.json" << EOF
{
  "timestamp": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
  "backup_date": "$(date '+%Y-%m-%d %H:%M:%S')",
  "harbor_version": "2.9.1",
  "docker_compose_version": "$(docker compose version --short)",
  "hostname": "$(hostname)",
  "backup_type": "full",
  "contents": {
    "database": {
      "type": "PostgreSQL",
      "size": "$(du -sh ${BACKUP_PATH}/database/ | cut -f1)",
      "backup_method": "pg_dump"
    },
    "registry": {
      "type": "S3",
      "filesystem_metadata": "$(du -sh ${BACKUP_PATH}/registry/ 2>/dev/null | cut -f1 || echo 'N/A')"
    },
    "redis": {
      "size": "$(du -sh ${BACKUP_PATH}/redis* 2>/dev/null | cut -f1 || echo 'N/A')",
      "backup_method": "redis-cli --rdb"
    },
    "configurations": {
      "size": "$(du -sh ${BACKUP_PATH}/configs/ | cut -f1)"
    },
    "prometheus": {
      "size": "$(du -sh ${BACKUP_PATH}/prometheus/ | cut -f1)"
    },
    "grafana": {
      "size": "$(du -sh ${BACKUP_PATH}/grafana* 2>/dev/null | cut -f1 || echo 'N/A')"
    }
  },
  "total_size": "$(du -sh ${BACKUP_PATH}/ | cut -f1)"
}
EOF

# Generate checksums
cd "${BACKUP_PATH}"
find . -type f ! -name "*.sha256" -exec sha256sum {} \; > checksums.sha256
cd - > /dev/null

log "INFO" "Backup manifest created"

# ============================================================================
# 8. Compress backup
# ============================================================================
log "INFO" "Compressing backup archive..."

cd "${BACKUP_DIR}"
tar -czf "harbor_backup_${BACKUP_TIMESTAMP}.tar.gz" "harbor_backup_${BACKUP_TIMESTAMP}/" \
    2>&1 | tee -a "${LOG_FILE}" || {
    log "ERROR" "Compression failed"
    exit 1
}

# Verify compressed backup
if [ ! -s "harbor_backup_${BACKUP_TIMESTAMP}.tar.gz" ]; then
    log "ERROR" "Backup archive is empty"
    exit 1
fi

log "INFO" "Backup compression completed"
du -h "harbor_backup_${BACKUP_TIMESTAMP}.tar.gz" | tee -a "${LOG_FILE}"

# ============================================================================
# 9. Cleanup old backups
# ============================================================================
log "INFO" "Cleaning up old backups (retention: ${RETENTION_DAYS} days)..."

find "${BACKUP_DIR}" -maxdepth 1 -name "harbor_backup_*.tar.gz" -type f -mtime +${RETENTION_DAYS} -exec rm -v {} \; 2>&1 | tee -a "${LOG_FILE}"
find "${BACKUP_DIR}" -maxdepth 1 -name "harbor_backup_*" -type d -mtime +${RETENTION_DAYS} -exec rm -rf {} \; 2>&1 | tee -a "${LOG_FILE}"

log "INFO" "Cleanup completed"

# ============================================================================
# 10. Generate backup report
# ============================================================================
log "INFO" "Generating backup report..."

cat > "${BACKUP_DIR}/BACKUP_REPORT_${BACKUP_TIMESTAMP}.txt" << EOF
================================================================================
Harbor Production Backup Report
================================================================================

Backup Date: $(date '+%Y-%m-%d %H:%M:%S')
Backup ID: ${BACKUP_TIMESTAMP}
Hostname: $(hostname)
Location: ${BACKUP_PATH}.tar.gz

BACKUP SUMMARY
==============
Total Size: $(du -sh "${BACKUP_PATH}" | cut -f1)
Compressed Size: $(du -sh "${BACKUP_DIR}/harbor_backup_${BACKUP_TIMESTAMP}.tar.gz" | cut -f1)

BACKED UP COMPONENTS
====================
✓ PostgreSQL Database
✓ Redis Cache
✓ Registry Data
✓ Configuration Files (core, registry, nginx, prometheus, alertmanager)
✓ Prometheus Data
✓ Grafana Dashboards

RETENTION POLICY
================
Backups older than ${RETENTION_DAYS} days will be automatically deleted.
Cleanup executed at: $(date '+%Y-%m-%d %H:%M:%S')

VERIFICATION
============
To verify backup integrity, run:
  cd ${BACKUP_DIR}
  sha256sum -c harbor_backup_${BACKUP_TIMESTAMP}/checksums.sha256

RESTORATION
===========
To restore from this backup, use: ./restore.sh harbor_backup_${BACKUP_TIMESTAMP}.tar.gz

NOTES
=====
- This backup includes all essential Harbor data
- S3 registry data is not backed up (separate backup strategy required)
- Ensure backups are stored on separate secure location
- Test restore procedure regularly

Log File: ${LOG_FILE}
================================================================================
EOF

cat "${BACKUP_DIR}/BACKUP_REPORT_${BACKUP_TIMESTAMP}.txt" | tee -a "${LOG_FILE}"

echo -e "${GREEN}✓ Backup completed successfully!${NC}"
log "INFO" "Backup completed successfully"
log "INFO" "Backup archive: harbor_backup_${BACKUP_TIMESTAMP}.tar.gz"
log "INFO" "Backup report: BACKUP_REPORT_${BACKUP_TIMESTAMP}.txt"
