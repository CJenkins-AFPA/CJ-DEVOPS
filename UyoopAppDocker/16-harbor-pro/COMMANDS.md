# TP16 - Harbor Production Commands Reference

## Quick Start Commands

```bash
# Clone and setup
cd /opt/docker-projects/UyoopAppDocker/16-harbor-pro
cp .env.example .env

# Generate credentials
openssl rand -base64 32 | tee core_secret.txt
openssl rand -base64 32 | tee jobservice_secret.txt
openssl rand -base64 32 | tee db_password.txt
openssl rand -base64 32 | tee redis_password.txt

# Edit .env with your values
nano .env

# Start services
docker compose up -d

# Check status
docker compose ps
docker compose logs -f
```

## Service Management

### Start/Stop Services

```bash
# Start all services
docker compose up -d

# Stop all services
docker compose down

# Restart specific service
docker compose restart harbor-core

# Restart with fresh build
docker compose up -d --build harbor-core

# View live logs
docker compose logs -f harbor-core

# View logs with timestamps
docker compose logs -f --timestamps harbor-core

# Get specific number of log lines
docker compose logs --tail=50 harbor-core
```

### Health Checks

```bash
# Check all services
docker compose ps

# Check service health
docker compose exec -T harbor-core curl -f http://localhost:8080/api/v2.0/health

# Database health
docker compose exec -T postgres-primary pg_isready -h postgres-primary -p 5432

# Redis health
docker compose exec -T redis-master redis-cli -a "${REDIS_PASSWORD}" ping

# Registry health
docker compose exec -T harbor-registry curl -f http://localhost:5000/v2/

# Test Harbor API
curl -k https://harbor.example.com/api/v2.0/health
```

## Database Operations

### PostgreSQL Management

```bash
# Connect to database
docker compose exec -T postgres-primary psql -U postgres -d harbor

# List databases
docker compose exec -T postgres-primary psql -U postgres -l

# Show database size
docker compose exec -T postgres-primary psql -U postgres -d harbor -c \
  "SELECT pg_size_pretty(pg_database_size('harbor'));"

# List tables
docker compose exec -T postgres-primary psql -U postgres -d harbor -c \
  "SELECT tablename FROM pg_tables WHERE schemaname='public';"

# Count projects
docker compose exec -T postgres-primary psql -U postgres -d harbor -c \
  "SELECT COUNT(*) FROM projects;"

# Count images
docker compose exec -T postgres-primary psql -U postgres -d harbor -c \
  "SELECT COUNT(*) FROM artifact;"

# Vacuum database (maintenance)
docker compose exec -T postgres-primary psql -U postgres -d harbor -c "VACUUM ANALYZE;"

# Export database
docker compose exec -T postgres-primary pg_dump -U postgres -d harbor > harbor_dump.sql

# Import database
docker compose exec -T postgres-primary psql -U postgres -d harbor < harbor_dump.sql
```

### PostgreSQL Replication

```bash
# Check replication status
docker compose exec -T postgres-primary psql -U postgres -c \
  "SELECT slot_name, restart_lsn, confirmed_flush_lsn FROM pg_replication_slots;"

# Check replica lag
docker compose exec -T postgres-replica psql -U postgres -c \
  "SELECT extract(epoch from (now() - pg_last_xact_replay_timestamp())) as lag_seconds;"

# Manual checkpoint
docker compose exec -T postgres-primary psql -U postgres -c "CHECKPOINT;"

# Monitor replication
docker compose exec -T postgres-primary psql -U postgres -c \
  "SELECT * FROM pg_stat_replication;" -c "watch -n 1 'SELECT * FROM pg_stat_replication;'"
```

## Redis Management

```bash
# Connect to Redis
docker compose exec -T redis-master redis-cli -a "${REDIS_PASSWORD}"

# Get Redis info
docker compose exec -T redis-master redis-cli -a "${REDIS_PASSWORD}" INFO

# Memory usage
docker compose exec -T redis-master redis-cli -a "${REDIS_PASSWORD}" INFO memory

# Key count
docker compose exec -T redis-master redis-cli -a "${REDIS_PASSWORD}" DBSIZE

# Monitor commands in real-time
docker compose exec -T redis-master redis-cli -a "${REDIS_PASSWORD}" MONITOR

# Clear all data
docker compose exec -T redis-master redis-cli -a "${REDIS_PASSWORD}" FLUSHALL

# Check replication
docker compose exec -T redis-master redis-cli -a "${REDIS_PASSWORD}" INFO replication

# Check sentinel
docker compose exec -T redis-sentinel-1 redis-cli -p 26379 SENTINEL masters

# Force failover
docker compose exec -T redis-sentinel-1 redis-cli -p 26379 SENTINEL failover harbor-master
```

## Harbor API Operations

### Authentication

```bash
# Get admin token
TOKEN=$(curl -s -X POST https://admin:password@harbor.example.com/api/v2.0/users/login -d '{}'  | jq -r '.token')

# Use token in API calls
curl -H "Authorization: Bearer ${TOKEN}" https://harbor.example.com/api/v2.0/projects
```

### Project Management

```bash
# List projects
curl -u admin:password https://harbor.example.com/api/v2.0/projects

# Create project
curl -X POST -u admin:password \
  -H "Content-Type: application/json" \
  -d '{
    "project_name": "production",
    "public": false
  }' \
  https://harbor.example.com/api/v2.0/projects

# Get project details
curl -u admin:password https://harbor.example.com/api/v2.0/projects/2

# Update project
curl -X PUT -u admin:password \
  -H "Content-Type: application/json" \
  -d '{"public": false}' \
  https://harbor.example.com/api/v2.0/projects/2

# Delete project
curl -X DELETE -u admin:password https://harbor.example.com/api/v2.0/projects/2
```

### Repository Management

```bash
# List repositories in project
curl -u admin:password https://harbor.example.com/api/v2.0/projects/production/repositories

# List artifacts (images)
curl -u admin:password https://harbor.example.com/api/v2.0/projects/production/repositories/myapp/artifacts

# Get artifact details
curl -u admin:password https://harbor.example.com/api/v2.0/projects/production/repositories/myapp/artifacts/v1.0

# Get vulnerability scan results
curl -u admin:password https://harbor.example.com/api/v2.0/projects/production/repositories/myapp/artifacts/v1.0/scan

# Delete artifact
curl -X DELETE -u admin:password \
  https://harbor.example.com/api/v2.0/projects/production/repositories/myapp/artifacts/v1.0
```

### User Management

```bash
# List users
curl -u admin:password https://harbor.example.com/api/v2.0/users

# Create user
curl -X POST -u admin:password \
  -H "Content-Type: application/json" \
  -d '{
    "username": "newuser",
    "email": "user@example.com",
    "password": "SecurePassword123",
    "realname": "New User"
  }' \
  https://harbor.example.com/api/v2.0/users

# Update user password
curl -X PUT -u admin:password \
  -H "Content-Type: application/json" \
  -d '{"new_password": "NewPassword123"}' \
  https://harbor.example.com/api/v2.0/users/2/password

# Delete user
curl -X DELETE -u admin:password https://harbor.example.com/api/v2.0/users/2
```

### System Statistics

```bash
# Get system statistics
curl -u admin:password https://harbor.example.com/api/v2.0/statistics

# Get system info
curl -u admin:password https://harbor.example.com/api/v2.0/systeminfo

# Get system certificate
curl -u admin:password https://harbor.example.com/api/v2.0/systeminfo/getcert
```

## Image Operations

### Docker Push/Pull

```bash
# Login to registry
docker login https://harbor.example.com
# Username: admin
# Password: (from .env)

# Tag image for Harbor
docker tag myapp:latest harbor.example.com/production/myapp:latest

# Push image
docker push harbor.example.com/production/myapp:latest

# Pull image
docker pull harbor.example.com/production/myapp:latest

# List local images
docker images | grep harbor.example.com

# Remove image locally
docker rmi harbor.example.com/production/myapp:latest
```

### Image Scanning

```bash
# Trigger scan manually
curl -X POST -u admin:password \
  https://harbor.example.com/api/v2.0/projects/production/repositories/myapp/artifacts/v1.0/scan

# Get scan results
curl -u admin:password \
  https://harbor.example.com/api/v2.0/projects/production/repositories/myapp/artifacts/v1.0/scan/overview

# Generate SBOM
curl -u admin:password \
  https://harbor.example.com/api/v2.0/projects/production/repositories/myapp/artifacts/v1.0/additions/sbom
```

## Backup & Recovery

### Create Backups

```bash
# Full backup
./scripts/backup.sh

# Check backup status
ls -lh /backups/harbor/
cat /backups/harbor/BACKUP_REPORT_*.txt

# List available backups
docker compose exec -T postgres-primary ls -la /var/lib/postgresql/backup/
```

### Restore from Backup

```bash
# List available backups
ls /backups/harbor/harbor_backup_*.tar.gz

# Restore specific backup
./scripts/restore.sh /backups/harbor/harbor_backup_20240115_020000.tar.gz

# Verify restoration
docker compose ps
curl https://harbor.example.com/api/v2.0/health
```

## Monitoring & Logs

### Access Dashboards

```bash
# Harbor Web UI
https://harbor.example.com

# Grafana Dashboards
https://monitor.example.com/grafana
# Login: admin / (password from .env GRAFANA_PASSWORD)

# Prometheus Metrics
https://monitor.example.com/prometheus
# Login: admin / (htpasswd password)

# AlertManager
https://monitor.example.com/alertmanager
# Login: admin / (htpasswd password)

# Traefik Dashboard
https://monitor.example.com
# Login: admin / (htpasswd password)
```

### View Logs

```bash
# All services
docker compose logs -f

# Specific service
docker compose logs -f harbor-core
docker compose logs -f harbor-registry
docker compose logs -f postgres-primary
docker compose logs -f traefik

# Filter logs
docker compose logs | grep -i error
docker compose logs harbor-core | grep -i "authentication\|oidc\|ldap"

# Export logs
docker compose logs > all_logs.txt
docker compose logs harbor-core > harbor-core.log
```

### Prometheus Queries

```bash
# Harbor Core availability
up{job="harbor-core"}

# Registry push/pull latency
histogram_quantile(0.95, rate(registry_request_duration_seconds_bucket{method="GET"}[5m]))

# Error rate
rate(harbor_http_requests_total{status=~"5.."}[5m])

# Database connection count
pg_stat_activity_count

# Redis memory usage
redis_memory_used_bytes / redis_memory_max_bytes

# Container CPU usage
rate(container_cpu_usage_seconds_total[1m])

# Container memory usage
container_memory_usage_bytes
```

## Maintenance & Cleanup

```bash
# Garbage collection (remove untagged images)
docker compose exec -T harbor-registry \
  registry garbage-collect /etc/registry/config.yml

# System prune (be careful)
docker system prune -a

# Volume cleanup
docker volume prune

# Network cleanup
docker network prune

# Remove old backups
find /backups/harbor -name "harbor_backup_*.tar.gz" -mtime +30 -delete

# Clean Docker logs
truncate -s 0 /var/lib/docker/containers/*/*-json.log

# Check disk usage
du -sh /*
df -h
```

## Configuration Updates

```bash
# Edit environment variables
nano .env
docker compose restart harbor-core

# Edit Harbor core config
nano config/core/app.conf
docker compose restart harbor-core

# Edit Prometheus config
nano prometheus/prometheus.yml
docker compose restart prometheus

# Edit Grafana provisioning
nano grafana/provisioning/datasources/datasource.yml
docker compose restart grafana

# Edit AlertManager
nano alertmanager/config.yml
docker compose restart alertmanager

# Reload Traefik config
docker compose exec -T traefik traefik validate --config.file=/traefik/config/middlewares.yml
docker compose restart traefik
```

## Troubleshooting Commands

```bash
# General status
docker compose ps
docker compose version
docker info

# Check service health
docker compose logs --tail=50 <service>

# Inspect container
docker inspect <container_id>

# Execute command in container
docker compose exec -T <service> <command>

# Test connectivity
docker compose exec -T harbor-core curl -v http://postgres-primary:5432
docker compose exec -T harbor-core curl -v http://redis-master:6379

# Check disk space
du -sh /var/lib/docker
df -h

# Monitor real-time metrics
docker compose stats

# View resource limits
docker inspect <container_id> | grep -A 10 '"Memory"'
```

## Advanced Operations

### Scale Services

```bash
# Start multiple replicas (requires load balancing)
docker compose up -d --scale harbor-core=3

# Note: Default docker-compose doesn't support this with stateful services
# Use docker swarm or kubernetes for proper scaling
```

### Custom Scripts

```bash
# Make scripts executable
chmod +x scripts/*.sh

# Run backup
./scripts/backup.sh

# Run restore
./scripts/restore.sh <backup_file>

# Check syntax
docker compose config
```

### Performance Tuning

```bash
# Check slow queries
docker compose exec -T postgres-primary psql -U postgres -d harbor -c \
  "SELECT query, calls, mean_exec_time FROM pg_stat_statements ORDER BY mean_exec_time DESC LIMIT 10;"

# Check expensive queries
docker compose exec -T postgres-primary psql -U postgres -d harbor -c \
  "SELECT * FROM pg_stat_statements WHERE mean_exec_time > 100 ORDER BY mean_exec_time DESC;"

# Clear slow query cache
docker compose exec -T postgres-primary psql -U postgres -d postgres -c \
  "SELECT pg_stat_statements_reset();"
```

---

**Last Updated**: 2024  
**For more info**: See README.md or official Harbor docs
