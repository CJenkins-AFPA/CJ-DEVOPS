# Architecture BookStack Production Sécurisé

## 🏗️ Architecture Globale

```
┌─────────────────────────────────────────────────────────────────┐
│                          INTERNET                              │
└──────────────────────────────┬──────────────────────────────────┘
                               │
                      ┌────────▼────────┐
                      │   UFW Firewall  │
                      │ (Allow 22,80,443)
                      └────────┬────────┘
                               │
                    ┌──────────▼──────────┐
                    │ DOCKER NETWORK      │
                    │ (proxy)             │
                    └──────────┬──────────┘
                               │
        ┌──────────────────────┼──────────────────────┐
        │                      │                      │
   ┌────▼───┐          ┌──────▼──────┐        ┌──────▼──────┐
   │Traefik │          │  Authelia   │        │  CrowdSec   │
   │  SSL   │          │   2FA TOTP  │        │   IDS/IPS   │
   │  v3    │          │             │        │             │
   └────┬───┘          └──────┬──────┘        └──────┬──────┘
        │                     │                      │
        └─────────────────────┼──────────────────────┘
                              │
                    ┌─────────▼─────────┐
                    │ DOCKER NETWORK    │
                    │ (backend/internal)│
                    └─────────┬─────────┘
                              │
                ┌─────────────┼─────────────┐
                │             │             │
           ┌────▼──┐    ┌────▼──┐    ┌────▼──┐
           │Book   │    │Backup │    │Monitor│
           │Stack  │    │Restic │    │Stack  │
           │       │    │       │    │       │
           └────┬──┘    └────┬──┘    └────┬──┘
                │            │            │
                │      ┌─────┴────┐       │
                │      │          │       │
           ┌────▼──────▼──┐   ┌──▼───────▼──┐
           │ DOCKER NET   │   │ MONITORING  │
           │ (database)   │   │ Prometheus  │
           └────┬─────────┘   │ Grafana     │
                │             │ Node-exp    │
           ┌────▼─────────┐   └─────────────┘
           │ MySQL 8.0    │
           │ (Isolated)   │
           └──────────────┘
```

## 📊 Architecture Détaillée par Service

### 1️⃣ Reverse Proxy - Traefik v3

```
Client HTTPS
    ↓
[Traefik]
    ├─ HTTP → HTTPS Redirect
    ├─ SSL/TLS 1.3 avec Let's Encrypt (Cloudflare DNS)
    ├─ Load Balancer
    ├─ Routing intelligent par domaine
    └─ Dashboard (https://traefik.DOMAIN)
    
Services routés:
├─ bookstack.DOMAIN → BookStack:3000
├─ auth.DOMAIN → Authelia:9091
├─ grafana.DOMAIN → Grafana:3000
└─ traefik.DOMAIN → Traefik Dashboard:8080
```

### 2️⃣ Authentification - Authelia

```
User Request
    ↓
[Authelia Middleware]
    ├─ Session validation
    ├─ 2FA TOTP check
    ├─ Brute-force protection
    │  (5 attempts, 10min ban)
    ├─ Argon2id password hashing
    └─ Access control rules
    
Allowed → Application
Denied → 401/403 Error
```

### 3️⃣ Détection Intrusions - CrowdSec

```
Network Traffic
    ↓
[CrowdSec Parser]
    ├─ Log analysis
    ├─ Threat intelligence (Community)
    └─ Behavior analysis
    
Detection → [CrowdSec Bouncer]
    ├─ IP blocking
    ├─ Rate limiting
    └─ Automatic ban (5min → 1h)
```

### 4️⃣ Application - BookStack

```
Authenticated Request
    ↓
[BookStack Container]
    ├─ No new privileges
    ├─ Read-only filesystem (/)
    ├─ tmpfs for /tmp and /var/tmp
    ├─ Capability dropping
    └─ Non-root user (bookstack:1000)
    
Database Connection
    ↓
[MySQL 8.0 - Isolated Network]
```

### 5️⃣ Base de Données - MySQL

```
Properties:
├─ Isolated network (database)
├─ No direct internet access
├─ Credentials via Docker Secrets
├─ Health check active
├─ InnoDB buffer pool 256M
└─ Slow query logging
```

### 6️⃣ Sauvegarde - Restic

```
Daily Backup Schedule (2h00)
    ↓
[Backup Script]
    ├─ MySQL Dump
    │  └─ Data export
    ├─ Volume Backup
    │  └─ Tar archive
    └─ GPG Encryption (AES256)
    
Storage
    ├─ Local: /backups
    ├─ Remote: S3/B2/Rclone
    └─ Retention: Last 10 backups
```

### 7️⃣ Monitoring - Prometheus + Grafana

```
[Metrics Collection]
├─ Prometheus (9090)
│  ├─ Docker stats
│  ├─ MySQL metrics
│  ├─ Traefik metrics
│  └─ Node exporter (system)
│
└─ Grafana (3000)
   ├─ Dashboard 1860 (Node Exporter)
   ├─ Dashboard 12250 (MySQL)
   ├─ Dashboard 7362 (Docker)
   └─ Custom alerts
```

## 🔐 Couches de Sécurité

```
Couche 1: Réseau
├─ UFW Firewall (ports: 22, 80, 443)
├─ Fail2Ban (SSH: 3 essais, MySQL: 5 essais)
└─ Kernel hardening (sysctl)

Couche 2: Reverse Proxy
├─ Traefik (SSL/TLS 1.3)
├─ Security headers (HSTS, CSP, X-Frame-Options)
├─ Rate limiting (100 req/min)
└─ Traefik v3 (latest best practices)

Couche 3: Authentification
├─ Authelia 2FA (TOTP)
├─ Argon2id password hashing
├─ Session management (1h expiration)
└─ Brute-force protection

Couche 4: Intrusion Detection
├─ CrowdSec (IDS/IPS)
├─ Community threat intelligence
├─ Auto-blocking rules
└─ Bouncer integration

Couche 5: Application
├─ Container hardening
├─ No-new-privileges flag
├─ Read-only filesystem
├─ Capability dropping
└─ Non-root execution

Couche 6: Données
├─ Docker Secrets (encrypted at rest)
├─ Isolated database network
├─ MySQL hardening (skip-show-database)
└─ Automatic encrypted backups

Couche 7: Audit
├─ Auditd system audit
├─ Application logs
├─ Traefik access logs
└─ CrowdSec event logs
```

## 🌐 Réseaux Isolés Docker

```
┌─────────────────────────────────────┐
│ PROXY NETWORK (proxy)               │
├─────────────────────────────────────┤
│ ├─ traefik (public)                 │
│ ├─ authelia                         │
│ └─ crowdsec                         │
└─────────────────────────────────────┘
          ↓ (internal)
┌─────────────────────────────────────┐
│ BACKEND NETWORK (backend)           │
├─────────────────────────────────────┤
│ ├─ bookstack                        │
│ ├─ backup (restic)                  │
│ └─ prometheus                       │
└─────────────────────────────────────┘
          ↓ (isolated)
┌─────────────────────────────────────┐
│ DATABASE NETWORK (database)         │
├─────────────────────────────────────┤
│ └─ bookstack-db (mysql)             │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│ HOST NETWORK (monitoring)           │
├─────────────────────────────────────┤
│ ├─ grafana                          │
│ ├─ node-exporter                    │
│ └─ (exposed on :3000)               │
└─────────────────────────────────────┘
```

## 📈 Chemins de Communication

```
1. Client HTTPS Request
   ├─ UFW Firewall ✓
   ├─ Traefik (reverse proxy) ✓
   ├─ Middleware security headers ✓
   └─ Authelia (if protected route) ✓

2. Rate Limiting (100 req/min)
   ├─ Per IP address
   ├─ Burst allowed: 50 requests
   └─ Excess: 429 Too Many Requests

3. Intrusion Detection (CrowdSec)
   ├─ Log parsing
   ├─ Threat detection
   └─ Automatic bouncing (ban IP)

4. Application Processing
   ├─ BookStack validation
   ├─ Database query (if needed)
   └─ Response to client

5. Monitoring
   ├─ Prometheus scrapes metrics
   ├─ Node exporter (system metrics)
   └─ Grafana visualizes data
```

## 💾 Flux de Sauvegarde

```
Production Database & Volumes
         ↓
  Backup Script (cron 2h00)
         ↓
  ├─ MySQL Dump
  ├─ Tar volumes
  └─ GPG Encryption (AES256)
         ↓
  Backups Directory
         ↓
  ├─ Local Storage (/backups)
  ├─ Retention Policy (keep 10)
  └─ Optional Remote (S3, B2, etc)
```

## 🔄 Processus de Restauration

```
Disaster Occurred
         ↓
  Restore Script
         ↓
  ├─ Stop Services
  ├─ GPG Decrypt Backup
  ├─ MySQL Restore from dump
  ├─ Volume Restore from tar
  └─ Start Services
         ↓
  Verification
         ↓
  ✓ Service Running
  ✓ Data Restored
  ✓ Ready for Use
```

## 📊 Stack de Monitoring

```
Prometheus (Time Series Database)
    ↓
Scrape Endpoints:
├─ http://prometheus:9090/metrics (self)
├─ http://bookstack-db:3306 (MySQL exporter)
├─ http://node-exporter:9100/metrics (system)
├─ http://traefik:8080/metrics (reverse proxy)
└─ http://bookstack:8080/metrics (app)
    ↓
Data Storage (15-day retention)
    ↓
Grafana (Visualization)
    ├─ Dashboard 1860 (Node Exporter Full)
    ├─ Dashboard 12250 (MySQL 8.0)
    ├─ Dashboard 7362 (Docker)
    └─ Custom alerts (if configured)
```

## 🎯 Métriques Clés Surveillées

```
Infrastructure:
├─ CPU usage
├─ Memory (RAM) consumption
├─ Disk I/O
├─ Network traffic
└─ Swap usage

Docker:
├─ Container health
├─ Memory limits
├─ Network stats
└─ Restart count

Database (MySQL):
├─ Connections active
├─ Slow queries
├─ Query response time
├─ Innodb buffer pool hits
└─ Replication lag (if replicating)

Application (BookStack):
├─ Response time
├─ HTTP status codes
├─ Error rate
├─ Request throughput
└─ Concurrent connections

Security:
├─ Failed login attempts
├─ CrowdSec alerts
├─ Firewall blocks
└─ SSL certificate expiration
```

---

**Architecture Overview**: Production-ready, secured, monitored, and automated. 🚀
