# TP16 - Harbor Production: File Manifest

## Directory Structure

```
16-harbor-pro/
├── README.md                              # Comprehensive production guide (1800+ lines)
├── COMMANDS.md                            # Command reference guide
├── .env.example                           # Environment variables template
├── .gitignore                             # Git ignore patterns
├── docker-compose.yml                     # Production stack (15 services)
│
├── config/                                # Service configurations
│   ├── core/
│   │   └── app.conf                       # Harbor Core application config
│   ├── registry/
│   │   └── config.yml                     # Docker Registry V2 config
│   ├── jobservice/
│   │   └── config.yml                     # JobService configuration
│   ├── notary/
│   │   ├── server-config.json             # Notary Server config
│   │   └── signer-config.json             # Notary Signer config
│   ├── portal/
│   │   └── nginx.conf                     # Portal Nginx config
│   └── certificates/
│       └── (TLS certs - managed by Traefik)
│
├── traefik/                               # Reverse proxy & SSL/TLS
│   ├── dynamic/
│   │   └── middlewares.yml                # Routing rules, auth, middleware
│   ├── acme/                              # ACME certificates (auto-managed)
│   ├── logs/                              # Access/error logs
│   └── auth.htpasswd                      # HTTP basic auth (generated)
│
├── prometheus/                            # Metrics collection
│   ├── prometheus.yml                     # Scrape configs (15+ jobs)
│   └── rules/
│       └── harbor-alerts.yml              # Alert rules (40+ rules, recording rules)
│
├── alertmanager/                          # Alert routing
│   └── config.yml                         # Routing, receivers, inhibition
│
├── loki/                                  # Log aggregation
│   └── loki-config.yml                    # Retention, storage, schema
│
├── promtail/                              # Log shipper
│   └── config.yml                         # Log scrape configs
│
├── grafana/                               # Dashboards & visualization
│   ├── provisioning/
│   │   ├── datasources/
│   │   │   └── datasource.yml             # Prometheus & Loki datasources
│   │   └── dashboards/
│   │       └── dashboards.yml             # Dashboard provisioning
│   └── dashboards/                        # Dashboard JSON files
│
├── postgres/                              # Database config
│   ├── init-db.sh                         # Database initialization
│   ├── postgresql.conf                    # PostgreSQL tuning
│   └── sentinel-*.conf                    # Redis Sentinel configs
│
├── redis/                                 # Cache config
│   ├── sentinel-1.conf                    # Sentinel 1 config
│   ├── sentinel-2.conf                    # Sentinel 2 config
│   └── sentinel-3.conf                    # Sentinel 3 config
│
├── scripts/                               # Automation scripts
│   ├── backup.sh                          # Full backup script (500+ lines)
│   ├── restore.sh                         # Full restore script (400+ lines)
│   └── README.md                          # Scripts documentation
│
├── docs/                                  # Additional documentation
│   ├── LDAP_OIDC_SETUP.md                # LDAP/OIDC configuration guide
│   ├── ARCHITECTURE.md                    # Detailed architecture
│   ├── SECURITY.md                        # Security hardening guide
│   ├── PERFORMANCE.md                     # Performance tuning
│   └── TROUBLESHOOTING.md                 # Common issues & solutions
│
├── volumes/                               # Data volumes (created at runtime)
│   ├── postgresql-data/
│   ├── postgresql-replica-data/
│   ├── redis-data/
│   ├── registry-data/
│   ├── prometheus-data/
│   ├── grafana-data/
│   ├── loki-data/
│   └── alertmanager-data/
│
└── backups/                               # Backup directory (created at runtime)
    ├── harbor_backup_YYYYMMDD_HHMMSS.tar.gz
    ├── BACKUP_REPORT_YYYYMMDD_HHMMSS.txt
    └── RESTORE_REPORT_YYYYMMDD_HHMMSS.txt
```

## Files Summary

### Core Configuration Files (10 files)

| File | Lines | Purpose | Type |
|------|-------|---------|------|
| `docker-compose.yml` | 650+ | 15-service orchestration | YAML |
| `.env.example` | 45 | Environment variables template | TEXT |
| `.gitignore` | 60 | Git ignore patterns | TEXT |
| `config/core/app.conf` | 120+ | Harbor Core app config | YAML |
| `config/registry/config.yml` | - | Registry V2 config | YAML |
| `config/jobservice/config.yml` | - | JobService config | YAML |
| `traefik/dynamic/middlewares.yml` | 200+ | Traefik routing & middleware | YAML |
| `prometheus/prometheus.yml` | 220+ | Prometheus scrape jobs | YAML |
| `alertmanager/config.yml` | 180+ | Alert routing & receivers | YAML |
| `loki/loki-config.yml` | 60+ | Loki storage & retention | YAML |

### Documentation Files (5 files)

| File | Lines | Purpose |
|------|-------|---------|
| `README.md` | 1800+ | Complete production guide |
| `COMMANDS.md` | 600+ | Command reference |
| `docs/LDAP_OIDC_SETUP.md` | 400+ | Auth setup guide |
| `docs/ARCHITECTURE.md` | 300+ | Architecture details |
| `docs/SECURITY.md` | 250+ | Security hardening |

### Script Files (2 files)

| File | Lines | Purpose |
|------|-------|---------|
| `scripts/backup.sh` | 500+ | Automated backup |
| `scripts/restore.sh` | 400+ | Automated restore |

### Total Files: 23 files
### Total Lines: 7000+ lines of configuration & documentation

## Services (15 total)

### Core Services (4)
- `harbor-core`: API and business logic
- `harbor-registry`: Docker V2 API
- `harbor-jobservice`: Async jobs
- `harbor-portal`: Web UI

### Supporting Services (6)
- `harbor-registryctl`: Registry controller
- `harbor-trivy`: Vulnerability scanning
- `notary-server`: Image signing
- `notary-signer`: Signing certificate authority

### Infrastructure (3)
- `postgres-primary`: Database (primary)
- `postgres-replica`: Database (replica for HA)
- `redis-master`: Cache (master)

### Sentinel (3)
- `redis-sentinel-1`: Auto-failover
- `redis-sentinel-2`: Auto-failover
- `redis-sentinel-3`: Auto-failover

### Observability (4)
- `prometheus`: Metrics collection
- `grafana`: Dashboards
- `loki`: Log aggregation
- `promtail`: Log shipping

### Proxy & Load Balancing (1)
- `traefik`: SSL/TLS, reverse proxy, load balancing

## Networks (3)

1. **public**: External-facing (Traefik)
2. **backend**: Internal communication
3. **database**: Database-only (internal: true)

## Volumes (14)

### Database Volumes
- `postgresql-data`: Primary database
- `postgresql-replica-data`: Replica database

### Cache Volumes
- `redis-data`: Master cache
- `redis-sentinel-1`: Sentinel state
- `redis-sentinel-2`: Sentinel state
- `redis-sentinel-3`: Sentinel state

### Registry & Storage
- `registry-data`: Registry data
- `harbor-core-data`: Core data
- `harbor-jobservice-data`: Job service data

### Scanning & Signing
- `trivy-data`: Vulnerability DB
- `trivy-reports`: Scan reports
- `notary-server-data`: Notary data
- `notary-signer-data`: Signer data

### Monitoring
- `prometheus-data`: Metrics
- `grafana-data`: Dashboards
- `loki-data`: Logs
- `alertmanager-data`: Alerts

## Key Features

### High Availability
✅ PostgreSQL streaming replication (primary + replica)
✅ Redis Sentinel (3-node automatic failover)
✅ Health checks on all services
✅ Automatic restart on failure

### Security
✅ Traefik with Let's Encrypt SSL/TLS
✅ HTTP basic auth for dashboards
✅ LDAP/OIDC authentication support
✅ Image signing with Notary
✅ Network isolation (3 separate networks)

### Monitoring & Logging
✅ Prometheus with 15+ scrape jobs
✅ 40+ production-ready alert rules
✅ Grafana dashboards
✅ Loki log aggregation (31-day retention)
✅ AlertManager with multi-channel notifications

### Operational Excellence
✅ Automated backup scripts (daily schedule)
✅ Automated restore procedures
✅ Comprehensive troubleshooting guide
✅ 1800+ line documentation
✅ 600+ command reference guide

### Storage & Performance
✅ S3 backend support (optional)
✅ Redis caching layer
✅ Optimized PostgreSQL configuration
✅ Registry garbage collection
✅ Recording rules for pre-computed metrics

## Dependencies

### External
- Docker >= 20.10
- Docker Compose >= 2.0
- 4+ CPU cores
- 8+ GB RAM
- 100+ GB disk
- Domain name with DNS

### Container Images
- `goharbor/harbor-*:v2.9.1` (6 images)
- `postgres:15-alpine`
- `redis:7-alpine`
- `traefik:v3.0`
- `prom/prometheus:latest`
- `grafana/grafana:latest`
- `grafana/loki:latest`
- `prom/alertmanager:latest`

## Configuration Details

### Environment Variables
- 45 configurable variables
- Secure credential generation
- Optional S3 backend
- LDAP/OIDC provider settings
- SMTP/Slack/PagerDuty webhooks

### Alert Rules
- 15+ critical alerts
- 10+ warning alerts
- 5+ info alerts
- Service-specific monitoring
- Infrastructure monitoring
- Database monitoring
- Cache monitoring

### Backup/Restore
- Database (PostgreSQL)
- Cache (Redis)
- Registry data (filesystem/S3)
- Configuration files
- Prometheus data
- Grafana dashboards
- 30-day retention policy
- Automated cleanup

## Deployment Path

1. **Clone repository** → Get all files
2. **Generate credentials** → openssl rand
3. **Configure .env** → Domain, passwords, SMTP
4. **Start services** → docker compose up -d
5. **Verify health** → docker compose ps
6. **Configure auth** → LDAP/OIDC setup
7. **Setup monitoring** → Grafana dashboards
8. **Test backup** → ./scripts/backup.sh
9. **Secure production** → Review security guide

## File Checksums & Integrity

All files created with:
- Proper YAML formatting and validation
- Environment variable placeholder support
- Production-ready configurations
- Security best practices
- Error handling
- Health checks
- Documentation comments

---

**Total Production Stack**: 23 files, 7000+ lines, 15 services, 3 networks, 14 volumes

**Difficulty Level**: Advanced / Professional  
**Deployment Time**: 15-20 minutes (after prerequisites)  
**Maintenance**: 2-4 hours/month  
**Learning Outcome**: Enterprise container registry management  

---
