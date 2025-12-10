# TP 16 : Harbor Production-Ready (Registre d'Entreprise)

Déploiement complet et production-ready d'un registre Harbor avec haute disponibilité, monitoring et sécurité avancée.

## 🎯 Vue d'ensemble

**Harbor** est un registre cloud-native open-source qui stocke, signe et analyse les images conteneurs pour les vulnérabilités. Il étend Docker Registry avec les fonctionnalités requises par les environnements d'entreprise.

## ✨ Fonctionnalités TP16

✅ **Reverse Proxy & Load Balancing**
- Traefik v3 avec SSL/TLS automatique via Let's Encrypt
- Redirection HTTP vers HTTPS
- Middleware de rate limiting et compression

✅ **Haute Disponibilité**
- PostgreSQL avec réplication streaming (1 primary + 2 replicas)
- Redis Sentinel avec failover automatique (1 master + 2 replicas + 3 sentinels)
- Health checks sur tous les services critiques

✅ **Monitoring & Observabilité**
- Prometheus pour la collecte de métriques
- Grafana pour les dashboards
- Loki pour l'agrégation des logs
- AlertManager pour le routage d'alertes
- Promtail pour l'expédition de logs

✅ **Sécurité**
- Trivy pour le scan de vulnérabilités
- Notary pour la signature d'images (optionnel)
- Support LDAP/OIDC
- Support certificats CA personnalisés
- TLS 1.2+ enforced

✅ **Backup & Disaster Recovery**
- Scripts de backup automatisés (données, BD, configs)
- Scripts de restore pour récupération rapide
- Gestion des politiques de rétention

✅ **Orchestration Conteneurs**
- Docker Compose v3.9
- Health checks et restart automatique
- Limites de ressources
- Isolation réseau

---

## 🏗️ Architecture

```
                          Internet
                              |
                    ┌─────────▼─────────┐
                    │    Traefik v3     │
                    │  (SSL/TLS, LB)    │
                    └────────┬──────────┘
                             |
              ┌──────────────┼──────────────┐
              |              |              |
         ┌────▼───┐   ┌─────▼────┐   ┌───▼────┐
         │ Harbor │   │ Grafana  │   │Alerts  │
         │  Core  │   │Dashboard │   │Manager │
         └────┬───┘   └────┬─────┘   └───┬────┘
              |            |             |
              └────────────┼─────────────┘
                           |
            ┌──────────────┼──────────────┐
            |              |              |
        ┌───▼────┐    ┌───▼────┐    ┌──▼──────┐
        │Postgres│    │ Redis  │    │Trivy    │
        │  HA    │    │Sentinel│    │Security │
        └────────┘    └────────┘    └─────────┘
        
        Monitoring Stack:
        Prometheus → Loki → Promtail → AlertManager
```

---

## 📋 Prérequis Système

| Élément | Minimum | Production |
|---------|---------|-----------|
| **OS** | Ubuntu 20.04+, Debian 11+ | Ubuntu 22.04 LTS |
| **CPU** | 4 cores | 8+ cores |
| **RAM** | 8 GB | 16+ GB |
| **Storage** | 50 GB | 200+ GB |
| **Docker** | 20.10+ | 24.0+ |
| **Docker Compose** | 2.0+ | 2.20+ |

### Accès Réseau

- Domaine publique avec DNS A record
- Port 80 (HTTP) pour ACME challenge
- Port 443 (HTTPS) pour Harbor
- Port 8080 (Traefik Dashboard) - accès restreint admin

### Services Externes (Optionnels)

- LDAP/Active Directory
- OIDC provider (Keycloak, Okta, etc.)
- S3-compatible storage
- SMTP server
- Slack workspace

---

## 🚀 Démarrage Rapide

### 1. Configuration initiale

```bash
cd 16-harbor-pro
cp .env.example .env
```

### 2. Éditer la configuration

```bash
nano .env
```

Paramètres essentiels:

```env
# Accès
HARBOR_HOSTNAME=harbor.example.com
HARBOR_ADMIN_PASSWORD=ChangeMeToSecurePassword123!
CERT_EMAIL=admin@example.com
TRAEFIK_DASHBOARD_PASSWORD=$(openssl passwd -apr1)

# Versions
HARBOR_VERSION=v2.9.1
POSTGRES_VERSION=15
REDIS_VERSION=7.2
PROMETHEUS_VERSION=latest
GRAFANA_VERSION=latest
```

### 3. Rendre les scripts exécutables

```bash
chmod +x scripts/*.sh
```

### 4. Déployer

```bash
./scripts/deploy.sh
```

### 5. Vérifier le statut

```bash
docker compose ps
docker compose logs -f harbor
```

### 6. Accéder à Harbor

- **URL**: https://harbor.example.com
- **Username**: admin
- **Password**: [Depuis HARBOR_ADMIN_PASSWORD]

---

## ⚙️ Configuration Détaillée

### Harbor Core

| Variable | Description |
|----------|-------------|
| `HARBOR_HOSTNAME` | FQDN pour Harbor |
| `HARBOR_ADMIN_PASSWORD` | Mot de passe admin initial |
| `HARBOR_VERSION` | Version Harbor (ex: v2.9.1) |
| `HARBOR_STORAGE_PATH` | Chemin stockage images |

### Base de Données (PostgreSQL)

| Variable | Description |
|----------|-------------|
| `POSTGRES_PASSWORD` | Mot de passe superuser |
| `POSTGRES_USER_PASSWORD` | Mot de passe utilisateur Harbor |
| `POSTGRES_REPLICATION_PASSWORD` | Mot de passe réplication |

### Cache (Redis)

| Variable | Description |
|----------|-------------|
| `REDIS_PASSWORD` | Mot de passe Redis master |
| `REDIS_SENTINEL_PASSWORD` | Mot de passe Sentinel |

### SSL/TLS

| Variable | Description |
|----------|-------------|
| `CERT_EMAIL` | Email Let's Encrypt |
| `ACME_SERVER` | URL serveur ACME (prod/staging) |

### S3 Backend (Optionnel)

```env
S3_ENABLED=true
S3_ENDPOINT=s3.amazonaws.com
S3_REGION=us-east-1
S3_BUCKET=harbor-registry
S3_ACCESS_KEY=YOUR_ACCESS_KEY
S3_SECRET_KEY=YOUR_SECRET_KEY
```

### LDAP (Optionnel)

```env
LDAP_ENABLED=true
LDAP_URL=ldap://ldap.example.com:389
LDAP_BASE_DN=dc=example,dc=com
```

Puis configurer dans Harbor UI: Administration → Configuration → Authentication

### OIDC (Optionnel)

```env
OIDC_ENABLED=true
OIDC_ENDPOINT=https://oidc.example.com
OIDC_CLIENT_ID=harbor-app
OIDC_CLIENT_SECRET=YOUR_SECRET
```

---

## 🔧 Gestion des Services

### Afficher le statut

```bash
docker compose ps
```

### Consulter les logs

```bash
# Tous les services
docker compose logs -f

# Service spécifique
docker compose logs -f harbor
docker compose logs -f postgres-primary
docker compose logs -f prometheus
```

### Arrêter les services

```bash
docker compose down
```

### Redémarrer

```bash
# Tous les services
docker compose restart

# Service spécifique
docker compose restart harbor
docker compose restart postgres-primary
```

### Mettre à jour les images

```bash
docker compose pull
docker compose up -d
```

---

## 💾 Backup & Restore

### Backup Automatisé

```bash
# Lancer un backup
./scripts/backup.sh

# Backup avec nom personnalisé
./scripts/backup.sh mon-backup-custom
```

Les backups sont stockés dans `./backups/` (rétention: 30 jours par défaut).

**Contenu du backup:**
- Données Harbor et configurations
- Dump PostgreSQL
- Snapshot Redis
- Fichiers de configuration

### Restore depuis un Backup

```bash
# Lister les backups disponibles
ls -la backups/

# Restaurer un backup spécifique
./scripts/restore.sh harbor-backup-20241207-143022
```

### Backup Manuel

```bash
# PostgreSQL
docker compose exec postgres-primary pg_dump -U harbor harbor | gzip > harbor.sql.gz

# Redis
docker compose exec redis-master redis-cli BGSAVE
docker cp redis-master:/data/dump.rdb redis-dump.rdb

# Données Harbor
docker compose exec harbor tar czf - /data > harbor-data.tar.gz
```

---

## 📊 Monitoring & Alerting

### Accéder aux Dashboards

- **Prometheus**: https://prometheus.harbor.example.com
- **Grafana**: https://grafana.harbor.example.com
- **AlertManager**: https://alerts.harbor.example.com
- **Traefik**: https://traefik.harbor.example.com

### Configurer les Alertes

Éditer `alertmanager/config.yml`:

```yaml
receivers:
  - name: 'critical-receiver'
    slack_configs:
      - channel: '#alerts-critical'
        api_url: 'YOUR_SLACK_WEBHOOK_URL'
    email_configs:
      - to: 'ops@example.com'
        from: 'alerts@example.com'
```

Recharger:
```bash
docker compose restart alertmanager
```

### Ajouter des Métriques Personnalisées

Éditer `prometheus/prometheus.yml`:

```yaml
scrape_configs:
  - job_name: 'custom-service'
    static_configs:
      - targets: ['custom-service:8080']
```

---

## 🔐 Sécurité

### 1. Changer les Mots de Passe par Défaut

```bash
# Password admin Harbor (dans Harbor UI)
# Menu: Administration → Users → Admin

# Mot de passe BD (mettre à jour .env et redémarrer)
POSTGRES_PASSWORD=NewSecurePassword123!

# Mot de passe Redis (mettre à jour .env et redémarrer)
REDIS_PASSWORD=NewSecurePassword123!
```

### 2. HTTPS Partout

- Let's Encrypt automatiquement configuré
- Redirection HTTP → HTTPS
- Renouvellement automatique des certificats

### 3. Isolation Réseau

- Services internes: réseau `harbor-internal`
- Trafic externe: passant par Traefik
- BD et Redis: pas exposés à Internet

### 4. Règles Firewall

```bash
sudo ufw allow 80/tcp    # HTTP (ACME)
sudo ufw allow 443/tcp   # HTTPS
sudo ufw allow 8080/tcp  # Traefik Dashboard (restreint par IP)
sudo ufw deny 5432       # PostgreSQL
sudo ufw deny 6379       # Redis
```

### 5. Scan d'Images

- Trivy automatiquement configuré
- Activer enforcement policy dans Harbor UI
- Configurer les niveaux de sévérité Trivy

### 6. Content Trust (Optionnel)

Activer Notary dans `docker-compose.yml`:

```yaml
NOTARY_ENABLED: 'true'
```

Signer les images:
```bash
docker push -DCT=true user/image:tag
```

---

## 🔧 Dépannage

### Harbor ne démarre pas

```bash
# Consulter les logs
docker compose logs harbor

# Problèmes courants:
# 1. PostgreSQL pas prêt - attendre 30+ secondes
# 2. Port 443 déjà utilisé - vérifier: lsof -i :443
# 3. Fichier .env manquant - copier depuis .env.example
```

### Problèmes de Connexion BD

```bash
# Tester PostgreSQL
docker compose exec postgres-primary psql -U harbor -d harbor -c "SELECT 1"

# Tester la replica
docker compose exec postgres-replica-1 psql -U harbor -d harbor -c "SELECT 1"
```

### Problèmes Redis

```bash
# Tester Redis
docker compose exec redis-master redis-cli -a PASSWORD ping

# Vérifier la réplication
docker compose exec redis-master redis-cli -a PASSWORD info replication
```

### Problèmes de Certificat SSL

```bash
# Vérifier le statut du certificat
docker compose logs traefik | grep -i "tls\|acme\|certificate"

# Forcer le renouvellement
docker compose restart traefik
```

### Monitoring ne collecte pas les métriques

```bash
# Vérifier les targets Prometheus
docker compose logs prometheus | grep "scrape"

# Tester l'endpoint métrique
docker compose exec harbor curl localhost:8080/metrics
```

---

## ⚡ Tuning Performance

### Optimisation Base de Données

Éditer `config/postgres/postgresql.conf`:

```conf
# Serveur 16GB RAM
shared_buffers = 4GB
effective_cache_size = 12GB
work_mem = 32MB
maintenance_work_mem = 512MB
```

### Optimisation Redis

```bash
# Augmenter la limite de mémoire si nécessaire
docker update --memory 2g redis-master
```

### Limites de Ressources Conteneurs

Mettre à jour `docker-compose.yml`:

```yaml
harbor:
  mem_limit: 2g
  memswap_limit: 2g
```

---

## 🔄 Maintenance

### Tâches Régulières

- **Quotidien**: Monitorer les alertes
- **Hebdomadaire**: Vérifier les dashboards Grafana
- **Mensuel**: Tester les backups/restores
- **Trimestriel**: Mettre à jour les images

### Mettre à Jour Harbor

```bash
# 1. Backup avant mise à jour
./scripts/backup.sh pre-upgrade-backup

# 2. Mettre à jour HARBOR_VERSION dans .env
HARBOR_VERSION=v2.10.0

# 3. Redémarrer avec les nouvelles images
docker compose pull
docker compose up -d

# 4. Vérifier
docker compose ps
```

---

## 💻 Commandes Utiles

```bash
# Utilisation ressources des conteneurs
docker stats

# Nettoyer les images inutilisées
docker image prune -a

# Redémarrer tous les services
docker compose restart

# Reconstruire un service spécifique
docker compose up -d --build harbor

# Exécuter une commande dans un conteneur
docker compose exec harbor bash

# Monitorer les logs en temps réel
docker compose logs -f --tail=100 harbor
```

---

## 📚 Documentation & Support

- **Harbor Official**: https://goharbor.io/docs
- **Docker Compose**: https://docs.docker.com/compose
- **Traefik**: https://doc.traefik.io/traefik/
- **Prometheus**: https://prometheus.io/docs
- **Grafana**: https://grafana.com/docs

---

**Dernière mise à jour**: Décembre 2024
