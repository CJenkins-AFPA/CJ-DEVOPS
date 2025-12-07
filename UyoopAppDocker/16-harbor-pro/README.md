# TP16 - Harbor Production: Enterprise-Grade Container Registry

## 📋 Table of Contents
1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Prerequisites](#prerequisites)
4. [Installation](#installation)
5. [Configuration](#configuration)
6. [Operations](#operations)
7. [Monitoring & Alerts](#monitoring--alerts)
8. [Security](#security)
9. [Backup & Recovery](#backup--recovery)
10. [Troubleshooting](#troubleshooting)

---

## Overview

**TP16** extends TP15 Harbor into a production-ready, enterprise-grade container registry with:

✅ **High Availability** - PostgreSQL replication, Redis Sentinel, multi-node deployment  
✅ **Security** - Traefik SSL/TLS, LDAP/OIDC auth, RBAC, image signing with Notary  
✅ **Observability** - Prometheus metrics, Grafana dashboards, Loki logs, AlertManager  
✅ **Reliability** - Comprehensive backup/restore, health checks, automatic recovery  
✅ **Performance** - S3 storage backend, Redis caching, optimized configurations  
✅ **Compliance** - Audit logging, vulnerability scanning, security policies  

### Technology Stack

| Component | Version | Purpose |
|-----------|---------|---------|
| Harbor | 2.9.1 | Core container registry |
| Traefik | v3.0 | Reverse proxy + SSL/TLS |
| PostgreSQL | 15 | Database with replication |
| Redis | 7 | Cache with Sentinel HA |
| Prometheus | Latest | Metrics collection |
| Grafana | Latest | Dashboards & visualization |
| Loki | Latest | Log aggregation |
| AlertManager | Latest | Alert routing |
| Trivy | v2.9.1 | Vulnerability scanning |
| Notary | v2.9.1 | Image signing |

### Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                    Internet / Load Balancer                      │
└──────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                     Traefik (SSL/TLS)                            │
│  - Let's Encrypt automation                                      │
│  - Request routing                                               │
│  - Rate limiting                                                 │
└──────────────────────────────────────────────────────────────────┘
                              │
                ┌─────────────┼─────────────┐
                ▼             ▼             ▼
        ┌────────────┐ ┌────────────┐ ┌────────────┐
        │   Harbor   │ │ Prometheus │ │  Grafana   │
        │    Portal  │ │ + Alerts   │ │ + Dashbds  │
        └────────────┘ └────────────┘ └────────────┘
                │
    ┌───────────┼───────────┐
    ▼           ▼           ▼
┌────────┐ ┌────────┐ ┌─────────────┐
│ Registry│ │ JobSvc │ │ Trivy Scan  │
│ + Core  │ │ + Ctrl │ │ + Notary    │
└────────┘ └────────┘ └─────────────┘
    │
    │ (S3 / Filesystem)
    ▼
┌────────────────────────┐
│  Image Storage Layer   │
│ - S3 Backend           │
│ - Regional Replicas    │
└────────────────────────┘

Database Layer (HA):
┌──────────────────┐      ┌──────────────────┐
│  PostgreSQL      │◄────►│  PostgreSQL      │
│  Primary (HA)    │      │  Replica (RO)    │
│  Streaming Rep.  │      │  Read Scale-out  │
└──────────────────┘      └──────────────────┘

Cache Layer (HA):
┌──────────────────┐      ┌──────────────────┐      ┌──────────────────┐
│  Redis Master    │      │  Sentinel 1      │      │  Sentinel 2      │
│  Port 6379       │      │  Port 26379      │      │  Port 26379      │
│  MasterAuthPass  │      │  Auto-failover   │      │  Auto-failover   │
└──────────────────┘      └──────────────────┘      └──────────────────┘
       ▲                             │
       └─────────────────────────────┘
```

---

## Prerequisites

### System Requirements

| Resource | Minimum | Recommended | Production |
|----------|---------|------------|------------|
| **CPU** | 4 cores | 8 cores | 16+ cores |
| **Memory** | 8 GB | 16 GB | 32+ GB |
| **Disk** | 100 GB | 500 GB | 2+ TB (SSD) |
| **Network** | 1 Gbps | 10 Gbps | 25 Gbps |

### Software Requirements

```bash
# Verify prerequisites
docker --version          # >= 20.10
docker compose --version  # >= 2.0
openssl version          # For certificate generation

# Check disk space
df -h / | tail -1

# Check available memory
free -h

# Check network connectivity
ping docker.io
```

### Domain & DNS

1. **Register domain**: `harbor.example.com`
2. **DNS A record**: Points to your server IP
3. **Verify DNS resolution**:
```bash
nslookup harbor.example.com
ping harbor.example.com
```

### Firewall Rules

```bash
# Allow inbound traffic
ufw allow 80/tcp     # HTTP (redirect to HTTPS)
ufw allow 443/tcp    # HTTPS (Harbor + monitoring)
ufw allow 22/tcp     # SSH (management)

# Optional: Management UI access
ufw allow from 10.0.0.0/8 to any port 8080  # Internal monitoring
```

---

## Installation

### Step 1: Clone & Setup

```bash
# Clone the repository
cd /opt/docker-projects
git clone <your-repo-url> UyoopAppDocker
cd UyoopAppDocker/16-harbor-pro

# Set correct permissions
chmod +x scripts/*.sh
mkdir -p backups logs

# Create directory structure
mkdir -p {config,traefik,prometheus,loki,alertmanager,grafana,scripts,docs}
```

### Step 2: Generate Security Credentials

```bash
# Copy environment template
cp .env.example .env

# Generate secure passwords and secrets
openssl rand -base64 32 > /tmp/core_secret.txt
openssl rand -base64 32 > /tmp/jobservice_secret.txt
openssl rand -base64 32 > /tmp/db_password.txt
openssl rand -base64 32 > /tmp/redis_password.txt

# Update .env with generated values
echo "CORE_SECRET=$(cat /tmp/core_secret.txt)" >> .env
echo "JOBSERVICE_SECRET=$(cat /tmp/jobservice_secret.txt)" >> .env
echo "DB_PASSWORD=$(cat /tmp/db_password.txt)" >> .env
echo "REDIS_PASSWORD=$(cat /tmp/redis_password.txt)" >> .env

# Update domain and email
sed -i 's/harbor.example.com/your-harbor-domain.com/g' .env
sed -i 's/admin@example.com/your-email@example.com/g' .env

# Secure the .env file
chmod 600 .env
rm /tmp/*_*.txt
```

### Step 3: Configure Traefik

```bash
# Generate Traefik auth credentials (admin:password)
htpasswd -c traefik/auth.htpasswd admin
# Enter secure password when prompted

# Create Traefik ACME directory
mkdir -p traefik/acme
chmod 700 traefik/acme

# Create logs directory
mkdir -p traefik/logs
```

### Step 4: Prepare Configuration Files

```bash
# All configuration files are provided in:
# - config/core/app.conf
# - config/registry/config.yml
# - traefik/dynamic/middlewares.yml
# - prometheus/prometheus.yml
# - alertmanager/config.yml

# Create missing config directories
mkdir -p config/{core,registry,jobservice,portal,notary}
mkdir -p prometheus/rules
mkdir -p loki
mkdir -p alertmanager
mkdir -p grafana/{provisioning/datasources,provisioning/dashboards,dashboards}
mkdir -p redis
```

### Step 5: Initialize Database

```bash
# Create PostgreSQL initialization script
cat > postgres/init-db.sh << 'EOF'
#!/bin/bash
set -e

POSTGRES_USER="${POSTGRES_USER:-postgres}"
export PGPASSWORD="${POSTGRES_PASSWORD}"

# Create Harbor databases
psql -U "$POSTGRES_USER" <<SQL
CREATE DATABASE harbor;
CREATE DATABASE notaryserver;
CREATE DATABASE notarysigner;
GRANT ALL PRIVILEGES ON DATABASE harbor TO postgres;
GRANT ALL PRIVILEGES ON DATABASE notaryserver TO postgres;
GRANT ALL PRIVILEGES ON DATABASE notarysigner TO postgres;
SQL

echo "Databases created successfully"
EOF

chmod +x postgres/init-db.sh
```

### Step 6: Configure Redis Sentinel

```bash
# Create Sentinel configuration files
for i in 1 2 3; do
cat > redis/sentinel-${i}.conf << EOF
port 26379
dir /var/lib/sentinel
logfile ""
logfilepath /var/log/sentinel-${i}.log
loglevel notice
databases 16

sentinel monitor harbor-master redis-master 6379 2
sentinel down-after-milliseconds harbor-master 30000
sentinel parallel-syncs harbor-master 1
sentinel failover-timeout harbor-master 180000

sentinel deny-scripts-reconfig yes
sentinel require-pass "${REDIS_PASSWORD}"
EOF
done
```

### Step 7: Start Services

```bash
# Validate docker-compose configuration
docker compose config > /dev/null

# Start all services
docker compose up -d

# Check service status
docker compose ps

# View startup logs
docker compose logs -f

# Wait for services to be healthy (2-3 minutes)
sleep 120
```

### Step 8: Verify Installation

```bash
# Check all services are running
docker compose ps | grep healthy

# Test Harbor API
curl -k https://harbor.example.com/api/v2.0/health

# Access web interfaces
# Harbor: https://harbor.example.com
# Grafana: https://monitor.example.com/grafana  (user: admin)
# Prometheus: https://monitor.example.com/prometheus
# AlertManager: https://monitor.example.com/alertmanager

# View logs
docker compose logs harbor-core
docker compose logs harbor-registry
docker compose logs postgres-primary
```

---

## Configuration

### Harbor Core Settings

Edit `config/core/app.conf`:

```yaml
# Authentication mode
auth_mode: oidc_auth  # Options: db_auth, ldap_auth, oidc_auth, uaa_auth

# LDAP Configuration (if using LDAP)
ldap:
  url: "${LDAP_URL}"
  search_dn: "${LDAP_SEARCHDN}"
  search_filter: "${LDAP_SEARCH_FILTER}"

# OIDC Configuration (if using OIDC)
oidc:
  name: "${OIDC_NAME}"
  endpoint: "${OIDC_ENDPOINT}"
  client_id: "${OIDC_CLIENT_ID}"
  client_secret: "${OIDC_CLIENT_SECRET}"
```

See [LDAP_OIDC_SETUP.md](docs/LDAP_OIDC_SETUP.md) for detailed configuration.

### Image Scanning Policies

```bash
# Create webhook for scan results
curl -X POST https://harbor.example.com/api/v2.0/projects/1/webhook/policies \
  -H "Authorization: Basic $(echo -n admin:password | base64)" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "scan-webhook",
    "description": "Webhook for vulnerability scans",
    "event_types": ["scanningCompleted"],
    "address": "https://your-webhook-server/harbor-scan",
    "skip_cert_verify": false,
    "enabled": true
  }'
```

### RBAC Setup

```bash
# Create custom project with specific permissions
curl -X POST https://harbor.example.com/api/v2.0/projects \
  -H "Authorization: Basic $(echo -n admin:password | base64)" \
  -H "Content-Type: application/json" \
  -d '{
    "project_name": "production",
    "public": false,
    "metadata": {
      "auto_scan": "true",
      "severity": "high"
    }
  }'

# Add team members
curl -X POST https://harbor.example.com/api/v2.0/projects/2/members \
  -H "Authorization: Basic $(echo -n admin:password | base64)" \
  -H "Content-Type: application/json" \
  -d '{
    "role_id": 2,
    "member_user": {
      "username": "devteam"
    }
  }'
```

### Storage Backend Configuration

#### S3 Backend (Recommended)

```bash
# Update .env for S3
REGISTRY_STORAGE_PROVIDER=s3
S3_REGION=eu-west-1
S3_BUCKET=harbor-registry-prod
S3_ACCESS_KEY=AKIA1234567890ABCDEF
S3_SECRET_KEY=wJalrXUtnFEMI/K7MDENG+bPxRfiCYEXAMPLEKEY

# Use S3 endpoint for private deployments
S3_ENDPOINT=https://s3-custom.example.com
```

#### Filesystem Backend (Development/Small Deployments)

```bash
# Default uses filesystem
# Data stored in: registry-data/ volume
# Performance: Suitable for < 100GB
```

---

## Operations

### Routine Management

```bash
# View logs
docker compose logs -f <service>

# Restart specific service
docker compose restart harbor-core

# Update configuration
# Edit config files, then:
docker compose down
docker compose up -d

# Clean up unused data
docker system prune -a --volumes

# Monitor disk usage
du -sh harbor-data/

# Check service health
docker compose ps
docker compose exec -T postgres-primary pg_isready
docker compose exec -T redis-master redis-cli ping
```

### Database Maintenance

```bash
# Connect to database
docker compose exec -T postgres-primary psql -U postgres -d harbor

# Check database size
SELECT pg_size_pretty(pg_database_size('harbor'));

# Vacuum database
docker compose exec -T postgres-primary psql -U postgres -d harbor -c "VACUUM ANALYZE;"

# Backup database (manual)
docker compose exec -T postgres-primary pg_dump -U postgres -d harbor > harbor_manual_backup.sql
```

### Redis Management

```bash
# Check Redis info
docker compose exec -T redis-master redis-cli -a "${REDIS_PASSWORD}" info

# Monitor commands
docker compose exec -T redis-master redis-cli -a "${REDIS_PASSWORD}" monitor

# Clear cache
docker compose exec -T redis-master redis-cli -a "${REDIS_PASSWORD}" FLUSHALL

# Check replication status
docker compose exec -T redis-master redis-cli -a "${REDIS_PASSWORD}" info replication
```

### Image Management

```bash
# Login to registry
docker login https://harbor.example.com
# Username: admin
# Password: From .env HARBOR_ADMIN_PASSWORD

# Tag and push image
docker tag myapp:v1 harbor.example.com/production/myapp:v1
docker push harbor.example.com/production/myapp:v1

# Pull image
docker pull harbor.example.com/production/myapp:v1

# List repositories
curl -u admin:password https://harbor.example.com/api/v2.0/repositories

# Delete image
curl -X DELETE -u admin:password https://harbor.example.com/api/v2.0/projects/production/repositories/myapp/artifacts/v1
```

### Quota & Storage Management

```bash
# Set project quota
curl -X PUT -u admin:password https://harbor.example.com/api/v2.0/projects/production \
  -H "Content-Type: application/json" \
  -d '{
    "storage_limit": 107374182400
  }'

# Monitor storage usage
curl -u admin:password https://harbor.example.com/api/v2.0/statistics

# Garbage collection
curl -X POST -u admin:password https://harbor.example.com/api/v2.0/system/gc/schedule \
  -H "Content-Type: application/json" \
  -d '{
    "schedule": {
      "type": "daily",
      "cron": "0 2 * * *"
    }
  }'
```

---

## Monitoring & Alerts

### Access Monitoring Dashboards

| Service | URL | Credentials |
|---------|-----|-------------|
| **Grafana** | https://monitor.example.com/grafana | admin / password from .env |
| **Prometheus** | https://monitor.example.com/prometheus | admin / htpasswd credentials |
| **AlertManager** | https://monitor.example.com/alertmanager | admin / htpasswd credentials |
| **Harbor UI** | https://harbor.example.com | admin / password from .env |

### Built-in Alert Rules

Alert rules are defined in `prometheus/rules/harbor-alerts.yml`:

**Critical Alerts:**
- Harbor Core API down (2 min)
- Harbor Registry down (2 min)
- PostgreSQL database down (2 min)
- Redis cache down (2 min)
- Storage usage > 95%

**Warning Alerts:**
- High API latency (p95 > 2s)
- High error rate (> 5%)
- Storage usage > 80%
- Authentication failures > 10/s
- Pending jobs > 100

**Info Alerts:**
- Database cache hit ratio low
- Slow registry operations
- High connection count

### Create Custom Dashboards

```bash
# Access Grafana API
curl -X POST -H "Authorization: Bearer <api_token>" \
  -H "Content-Type: application/json" \
  -d @dashboard.json \
  https://monitor.example.com/grafana/api/dashboards/db
```

### Alert Notifications

Configure multiple notification channels in `alertmanager/config.yml`:

- **Email**: SMTP configuration
- **Slack**: Webhook integration
- **PagerDuty**: Incident management
- **Opsgenie**: Alert aggregation
- **Webhooks**: Custom integrations

---

## Security

### SSL/TLS Configuration

Automatically managed by Traefik with Let's Encrypt:

```bash
# Check certificate status
curl -kv https://harbor.example.com 2>&1 | grep -i "subject:"

# Verify certificate chain
echo | openssl s_client -showcerts -connect harbor.example.com:443

# Certificate renewal (automatic, triggered by Traefik)
# Logs available at: docker compose logs traefik | grep "certificate"
```

### Authentication

**Local Database (default):**
- Admin user: admin
- Password: Set in `.env` HARBOR_ADMIN_PASSWORD

**LDAP Authentication:**
- See [LDAP_OIDC_SETUP.md](docs/LDAP_OIDC_SETUP.md)

**OIDC/OAuth2:**
- Supports Azure AD, Google, Keycloak, etc.
- See [LDAP_OIDC_SETUP.md](docs/LDAP_OIDC_SETUP.md)

### Image Signing (Notary)

```bash
# Setup content trust
export DOCKER_CONTENT_TRUST=1
export DOCKER_CONTENT_TRUST_SERVER=https://notary.example.com

# Sign and push image
docker push harbor.example.com/project/image:tag

# Verify signature
docker trust inspect --pretty harbor.example.com/project/image:tag
```

### Network Isolation

```yaml
# Three network tiers in docker-compose.yml:
public:    # Traefik and external access
backend:   # Internal service communication
database:  # Database-only access (internal: true)
```

### Secret Management

```bash
# .env file contains sensitive data
chmod 600 .env

# Rotate secrets
# 1. Generate new secret: openssl rand -base64 32
# 2. Update in .env
# 3. Restart service: docker compose restart harbor-core
# 4. Backup .env to secure location

# Never commit .env to git
echo ".env" >> .gitignore
```

### Audit Logging

```bash
# Enable audit logging
docker compose exec -T postgres-primary psql -U postgres -d harbor -c \
  "SELECT * FROM audit_log ORDER BY creation_time DESC LIMIT 10;"

# Export audit logs
curl -u admin:password https://harbor.example.com/api/v2.0/audit-logs > audit_logs.json
```

---

## Backup & Recovery

### Automated Backups

```bash
# Schedule daily backups (crontab)
0 2 * * * /opt/docker-projects/UyoopAppDocker/16-harbor-pro/scripts/backup.sh

# Backup retention: 30 days (configurable in .env)
# Backups stored in: /backups/harbor/
```

### Manual Backup

```bash
# Full backup
./scripts/backup.sh

# Check backup status
ls -lh /backups/harbor/
cat /backups/harbor/BACKUP_REPORT_*.txt
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

### Backup Verification

```bash
# Check backup integrity
cd /backups/harbor/harbor_backup_20240115_020000/
sha256sum -c checksums.sha256

# Test restore (dry-run)
# Create test environment and restore
```

### Disaster Recovery Checklist

- [ ] Backup verified and tested
- [ ] Restore procedure documented
- [ ] RTO/RPO defined and understood
- [ ] Network connectivity verified
- [ ] Storage capacity confirmed
- [ ] Team trained on recovery
- [ ] Alert monitoring active
- [ ] Secondary site prepared

---

## Troubleshooting

### Service Startup Issues

```bash
# Check service logs
docker compose logs <service> --tail=100

# Check specific error
docker compose logs harbor-core 2>&1 | grep -i error

# Restart service
docker compose restart <service>

# Rebuild service
docker compose up -d --build <service>
```

### Database Connection Issues

```bash
# Test PostgreSQL connectivity
docker compose exec -T postgres-primary pg_isready -h postgres-primary -p 5432

# Check PostgreSQL logs
docker compose logs postgres-primary | grep -i "error\|fatal"

# Reset connection
docker compose restart postgres-primary
```

### Registry Push/Pull Failures

```bash
# Test registry endpoint
curl -v https://harbor.example.com/v2/

# Check registry logs
docker compose logs harbor-registry | grep -i error

# Verify S3 connectivity (if using S3)
aws s3 ls s3://harbor-registry-prod --endpoint-url https://s3.example.com

# Test manual push
docker push harbor.example.com/test/image:latest
```

### Authentication Problems

```bash
# Check auth logs
docker compose logs harbor-core | grep -i "auth\|ldap\|oidc"

# Test LDAP connection
ldapsearch -x -H ldap://ldap.example.com:389 -D "cn=admin,dc=example,dc=com" -W

# Reset admin password
docker compose exec postgres-primary psql -U postgres -d harbor -c \
  "UPDATE harbor_user SET password=MD5('newpassword123') WHERE user_id=1;"
```

### High Load / Performance Issues

```bash
# Check resource usage
docker compose stats

# Monitor database queries
docker compose exec -T postgres-primary psql -U postgres -d harbor -c \
  "SELECT query, calls, mean_exec_time FROM pg_stat_statements ORDER BY mean_exec_time DESC LIMIT 10;"

# Check Redis memory
docker compose exec -T redis-master redis-cli -a "${REDIS_PASSWORD}" info memory

# Scale services
# Edit docker-compose.yml to increase resources or replica count
docker compose up -d --scale harbor-core=2
```

### Network/Connectivity Issues

```bash
# Check Traefik routing
docker compose logs traefik | grep -i "route\|error"

# Test DNS resolution
nslookup harbor.example.com
ping harbor.example.com

# Check certificate
curl -kv https://harbor.example.com 2>&1 | head -20

# Verify Traefik config
docker compose exec -T traefik traefik validate --config.file=/traefik/config/middlewares.yml
```

### Trivy Vulnerability Scanner Issues

```bash
# Check Trivy status
docker compose logs harbor-trivy | grep -i "error\|database"

# Verify Trivy database is updated
docker compose exec -T harbor-trivy trivy version

# Force database update
docker compose exec -T harbor-trivy trivy image --download-db-only

# Scan manually
docker compose exec -T harbor-trivy trivy image harbor.example.com/project/image:tag
```

---

## Learning Objectives

After completing TP16, you will be able to:

1. ✅ **Deploy** production-grade Harbor with HA components
2. ✅ **Configure** advanced authentication (LDAP/OIDC)
3. ✅ **Implement** comprehensive monitoring and alerting
4. ✅ **Manage** image policies, scanning, and signing
5. ✅ **Automate** backup and disaster recovery procedures
6. ✅ **Troubleshoot** common registry issues
7. ✅ **Optimize** storage and performance for scale
8. ✅ **Secure** infrastructure with SSL/TLS and RBAC

---

## Resources

### Official Documentation
- [Harbor Documentation](https://goharbor.io/docs/)
- [Harbor API Reference](https://editor.swagger.io/?url=https://raw.githubusercontent.com/goharbor/harbor/main/api/openapi-spec.yaml)
- [Traefik Documentation](https://traefik.io/traefik/)
- [PostgreSQL High Availability](https://www.postgresql.org/docs/current/warm-standby.html)
- [Redis Sentinel](https://redis.io/topics/sentinel)

### Related Technologies
- [Container Registry Best Practices](https://docs.docker.com/docker-hub/content-trust/)
- [Image Signing with Notary](https://github.com/notaryproject/notary)
- [Vulnerability Scanning with Trivy](https://github.com/aquasecurity/trivy)
- [LDAP Configuration Guide](https://ubuntu.com/server/docs/service-ldap)

### Similar Implementations
- [CNCF Harbor](https://www.cncf.io/projects/harbor/)
- [Amazon ECR](https://aws.amazon.com/ecr/)
- [Azure Container Registry](https://azure.microsoft.com/en-us/products/container-registry/)
- [GitLab Container Registry](https://docs.gitlab.com/ee/user/packages/container_registry/)

---

## Next Steps

### TP17 Suggestions
- **Harbor Kubernetes Integration**: Deploy Harbor on Kubernetes with Helm
- **Harbor Replication**: Multi-site registry replication and disaster recovery
- **Advanced Scanning**: Custom scanning policies and compliance enforcement
- **CI/CD Integration**: Jenkins/GitLab/GitHub Actions integration

### Enhancements
1. Add Harbor image proxy for upstream registries
2. Implement container image signing with Binary Authorization
3. Setup Harbor webhook notifications (Slack, Teams)
4. Configure per-project scan policies
5. Integrate with threat intelligence feeds
6. Setup IP whitelist/blacklist for pull/push

### Security Hardening
- [ ] Enable network policies between services
- [ ] Implement image pull limits per IP
- [ ] Setup firewall rules for S3 access
- [ ] Enable audit logging for all API calls
- [ ] Configure secrets rotation policy
- [ ] Add WAF (Web Application Firewall) in front

---

## Support & Contribution

Found issues or improvements? 

```bash
# Check logs for detailed information
docker compose logs --timestamps --follow

# Collect diagnostics
docker compose ps
docker compose version
docker system info

# Report findings
# Create issue with: docker info, config files, error logs
```

---

**Last Updated**: 2024  
**Harbor Version**: v2.9.1  
**Maintained By**: Portfolio DevOps Project  
**License**: MIT

---

*TP16 represents production-ready infrastructure best practices for secure, scalable container image management.*
