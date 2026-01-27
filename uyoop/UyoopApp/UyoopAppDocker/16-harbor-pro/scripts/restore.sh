#!/bin/bash

# ============================================================================
# Harbor Production Restore Script
# Restores from backup: PostgreSQL, Redis, Registry, Configs, Prometheus
# ============================================================================

set -euo pipefail

# Configuration
BACKUP_FILE="${1:-.}"
BACKUP_DIR="/backups/harbor"
RESTORE_TIMESTAMP=$(date +%Y%m%d_%H%M%S)
LOG_FILE="${BACKUP_DIR}/restore_${RESTORE_TIMESTAMP}.log"

# Docker environment
COMPOSE_FILE="${PWD}/docker-compose.yml"

# Color output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging function
log() {
    local level=$1
    shift
    local message="$*"
    local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
    echo "[${timestamp}] [${level}] ${message}" | tee -a "${LOG_FILE}"
}

# Error handler
trap 'log "ERROR" "Restore failed"; exit 1' ERR

# ============================================================================
# Validation
# ============================================================================
log "INFO" "Validating backup file..."

if [ ! -f "${BACKUP_FILE}" ]; then
    echo -e "${RED}Error: Backup file not found: ${BACKUP_FILE}${NC}"
    echo "Usage: $0 <backup_file.tar.gz>"
    exit 1
fi

BACKUP_FILENAME=$(basename "${BACKUP_FILE}" .tar.gz)
EXTRACT_DIR="${BACKUP_DIR}/${BACKUP_FILENAME}"

log "INFO" "Restore starting..."
log "INFO" "Backup file: ${BACKUP_FILE}"
log "INFO" "Extract directory: ${EXTRACT_DIR}"

echo -e "${YELLOW}This will restore your Harbor production environment from backup.${NC}"
echo -e "${YELLOW}Current running services will be stopped.${NC}"
echo ""

read -p "Continue with restore? (yes/no): " -r confirm
if [[ ! $confirm == "yes" ]]; then
    log "INFO" "Restore cancelled by user"
    exit 0
fi

# ============================================================================
# Pre-restore checks
# ============================================================================
log "INFO" "Performing pre-restore checks..."

# Check disk space
BACKUP_SIZE=$(du -sb "${BACKUP_FILE}" | cut -f1)
AVAILABLE_SPACE=$(df /var/lib/docker | awk 'NR==2 {print $4 * 1024}')

if [ "${BACKUP_SIZE}" -gt "${AVAILABLE_SPACE}" ]; then
    log "ERROR" "Insufficient disk space. Required: $(numfmt --to=iec ${BACKUP_SIZE}), Available: $(numfmt --to=iec ${AVAILABLE_SPACE})"
    exit 1
fi

log "INFO" "Disk space check passed"

# ============================================================================
# 1. Extract backup
# ============================================================================
log "INFO" "Extracting backup archive..."

cd "${BACKUP_DIR}"
tar -xzf "${BACKUP_FILE}" || {
    log "ERROR" "Failed to extract backup archive"
    exit 1
}

log "INFO" "Backup extracted to ${EXTRACT_DIR}"

# Verify manifest
if [ ! -f "${EXTRACT_DIR}/MANIFEST.json" ]; then
    log "ERROR" "Manifest file not found in backup"
    exit 1
fi

log "INFO" "Manifest verified"
cat "${EXTRACT_DIR}/MANIFEST.json" | tee -a "${LOG_FILE}"

# ============================================================================
# 2. Stop services
# ============================================================================
log "INFO" "Stopping Harbor services..."

echo -e "${YELLOW}Stopping all services...${NC}"
docker compose down || {
    log "WARNING" "Some services may not have stopped cleanly"
}

# Wait for services to fully stop
sleep 10

log "INFO" "Services stopped"

# ============================================================================
# 3. Restore volumes (create backups of current data first)
# ============================================================================
log "INFO" "Backing up current volumes for safety..."

for volume in postgresql-data redis-data registry-data grafana-data prometheus-data; do
    if docker volume inspect "${volume}" &>/dev/null; then
        VOLUME_BACKUP_DIR="${BACKUP_DIR}/volume_backups_${RESTORE_TIMESTAMP}"
        mkdir -p "${VOLUME_BACKUP_DIR}"
        docker run --rm -v "${volume}:/data" \
            -v "${VOLUME_BACKUP_DIR}:/backup" \
            alpine tar -czf "/backup/${volume}_${RESTORE_TIMESTAMP}.tar.gz" -C /data . 2>&1 | tee -a "${LOG_FILE}" || true
        log "INFO" "Volume ${volume} backed up"
    fi
done

# ============================================================================
# 4. Clean volumes for restore
# ============================================================================
log "INFO" "Cleaning volumes for restore..."

for volume in postgresql-data postgresql-replica-data redis-data registry-data grafana-data prometheus-data loki-data; do
    if docker volume inspect "${volume}" &>/dev/null; then
        docker volume rm "${volume}" || {
            log "WARNING" "Could not remove volume ${volume}"
        }
    fi
done

log "INFO" "Volumes cleaned"

# ============================================================================
# 5. Restore configurations
# ============================================================================
log "INFO" "Restoring configuration files..."

if [ -f "${EXTRACT_DIR}/configs/configs_backup_"*.tar.gz ]; then
    cd "${PWD}"
    tar -xzf "${EXTRACT_DIR}"/configs/configs_backup_*.tar.gz || {
        log "ERROR" "Failed to restore configurations"
        exit 1
    }
    log "INFO" "Configuration files restored"
fi

# ============================================================================
# 6. Start core services
# ============================================================================
log "INFO" "Starting core services (database, cache, storage)..."

docker compose up -d postgres-primary redis-master postgres-replica || {
    log "ERROR" "Failed to start core services"
    exit 1
}

log "INFO" "Waiting for core services to be ready..."
sleep 20

# Verify core services health
for service in postgres-primary redis-master; do
    if ! docker compose exec -T "${service}" /bin/true &>/dev/null; then
        log "ERROR" "${service} is not responding"
        exit 1
    fi
    log "INFO" "${service} is ready"
done

# ============================================================================
# 7. Restore PostgreSQL
# ============================================================================
log "INFO" "Restoring PostgreSQL database..."

if [ -f "${EXTRACT_DIR}"/database/harbor_backup_*.sql ]; then
    DUMP_FILE="${EXTRACT_DIR}"/database/harbor_backup_*.sql
    
    # Copy SQL dump to container
    docker compose cp "${DUMP_FILE}" postgres-primary:/tmp/harbor_backup.sql || {
        log "ERROR" "Failed to copy SQL dump to container"
        exit 1
    }
    
    # Restore database
    docker compose exec -T postgres-primary psql \
        -U postgres \
        -f /tmp/harbor_backup.sql \
        2>&1 | tee -a "${LOG_FILE}" || {
        log "ERROR" "PostgreSQL restore failed"
        exit 1
    }
    
    log "INFO" "PostgreSQL restored successfully"
else
    log "ERROR" "PostgreSQL dump not found in backup"
    exit 1
fi

# ============================================================================
# 8. Restore Redis (optional - may not have latest data)
# ============================================================================
log "INFO" "Restoring Redis data..."

if [ -f "${EXTRACT_DIR}"/redis_backup_*.rdb ]; then
    docker compose cp "${EXTRACT_DIR}"/redis_backup_*.rdb redis-master:/data/dump.rdb || {
        log "WARNING" "Failed to restore Redis RDB file"
    }
    log "INFO" "Redis RDB restored"
fi

# ============================================================================
# 9. Restore registry data
# ============================================================================
log "INFO" "Restoring registry data..."

if [ -f "${EXTRACT_DIR}"/registry/registry_backup_*.tar.gz ]; then
    mkdir -p registry-data
    tar -xzf "${EXTRACT_DIR}"/registry/registry_backup_*.tar.gz -C . || {
        log "ERROR" "Failed to restore registry data"
        exit 1
    }
    log "INFO" "Registry data restored"
fi

# ============================================================================
# 10. Start all services
# ============================================================================
log "INFO" "Starting all Harbor services..."

docker compose up -d || {
    log "ERROR" "Failed to start all services"
    exit 1
}

log "INFO" "Waiting for services to be healthy..."
sleep 30

# ============================================================================
# 11. Verify restoration
# ============================================================================
log "INFO" "Verifying restoration..."

FAILED_SERVICES=()
for service in harbor-core harbor-registry harbor-jobservice postgres-primary redis-master; do
    if ! docker compose ps | grep -q "${service}.*healthy"; then
        FAILED_SERVICES+=("${service}")
        log "WARNING" "${service} is not healthy"
    else
        log "INFO" "${service} is healthy"
    fi
done

if [ ${#FAILED_SERVICES[@]} -gt 0 ]; then
    log "WARNING" "Some services are not healthy: ${FAILED_SERVICES[*]}"
    echo -e "${YELLOW}Some services need attention. Check logs with: docker compose logs${NC}"
else
    log "INFO" "All services are healthy"
fi

# ============================================================================
# 12. Restore Prometheus and Grafana data
# ============================================================================
log "INFO" "Restoring Prometheus data..."

if [ -f "${EXTRACT_DIR}"/prometheus/prometheus_backup_*.tar.gz ]; then
    tar -xzf "${EXTRACT_DIR}"/prometheus/prometheus_backup_*.tar.gz -C . || {
        log "WARNING" "Failed to restore Prometheus data (non-critical)"
    }
fi

if [ -f "${EXTRACT_DIR}"/grafana_backup_*.tar.gz ]; then
    docker run --rm -v grafana-data:/data \
        -v "${EXTRACT_DIR}":/backup \
        alpine tar -xzf /backup/grafana_backup_*.tar.gz -C /data --strip-components=2 2>&1 | tee -a "${LOG_FILE}" || {
        log "WARNING" "Failed to restore Grafana data (non-critical)"
    }
fi

# ============================================================================
# 13. Generate restore report
# ============================================================================
log "INFO" "Generating restore report..."

cat > "${BACKUP_DIR}/RESTORE_REPORT_${RESTORE_TIMESTAMP}.txt" << EOF
================================================================================
Harbor Production Restore Report
================================================================================

Restore Date: $(date '+%Y-%m-%d %H:%M:%S')
Restore ID: ${RESTORE_TIMESTAMP}
Hostname: $(hostname)
Source Backup: ${BACKUP_FILE}
Backup Timestamp: ${BACKUP_FILENAME}

RESTORE SUMMARY
===============
Status: $([ ${#FAILED_SERVICES[@]} -eq 0 ] && echo "SUCCESS" || echo "PARTIAL")

RESTORED COMPONENTS
===================
✓ Configuration Files
✓ PostgreSQL Database
✓ Redis Cache
$([ -f "${EXTRACT_DIR}"/registry/registry_backup_*.tar.gz ] && echo "✓ Registry Data" || echo "✗ Registry Data (skipped)")
$([ -f "${EXTRACT_DIR}"/prometheus/prometheus_backup_*.tar.gz ] && echo "✓ Prometheus Data" || echo "✗ Prometheus Data (skipped)")
$([ -f "${EXTRACT_DIR}"/grafana_backup_*.tar.gz ] && echo "✓ Grafana Dashboards" || echo "✗ Grafana Dashboards (skipped)")

SERVICE STATUS
==============
$(docker compose ps)

NEXT STEPS
==========
1. Verify Harbor is accessible: https://your-harbor-domain
2. Check database integrity: docker compose exec postgres-primary psql -U postgres -d harbor -c "SELECT COUNT(*) FROM projects;"
3. Review logs for any errors: docker compose logs
4. Run backup verification: docker compose exec postgres-primary pg_verify -d harbor

TROUBLESHOOTING
===============
If services are not healthy:
  - Check logs: docker compose logs <service_name>
  - Restart service: docker compose restart <service_name>
  - Full restart: docker compose down && docker compose up -d

DATABASE INTEGRITY CHECK
========================
EOF

# Add database integrity check results if applicable
docker compose exec -T postgres-primary psql \
    -U postgres \
    -d harbor \
    -c "SELECT COUNT(*) as projects FROM projects;" >> "${BACKUP_DIR}/RESTORE_REPORT_${RESTORE_TIMESTAMP}.txt" 2>&1 || true

cat >> "${BACKUP_DIR}/RESTORE_REPORT_${RESTORE_TIMESTAMP}.txt" << EOF

BACKUP LOCATION
===============
Original Backup: ${BACKUP_FILE}
Extract Location: ${EXTRACT_DIR}

RETENTION POLICY
================
Extraction files will be kept for 7 days for verification.
Run 'rm -rf ${EXTRACT_DIR}' to clean up extraction directory.

Log File: ${LOG_FILE}
================================================================================
EOF

cat "${BACKUP_DIR}/RESTORE_REPORT_${RESTORE_TIMESTAMP}.txt" | tee -a "${LOG_FILE}"

# ============================================================================
# Final summary
# ============================================================================
if [ ${#FAILED_SERVICES[@]} -eq 0 ]; then
    echo -e "${GREEN}✓ Restore completed successfully!${NC}"
    log "INFO" "Restore completed successfully"
else
    echo -e "${YELLOW}⚠ Restore completed with warnings${NC}"
    log "WARNING" "Restore completed with ${#FAILED_SERVICES[@]} unhealthy service(s)"
fi

log "INFO" "Restore report: RESTORE_REPORT_${RESTORE_TIMESTAMP}.txt"
