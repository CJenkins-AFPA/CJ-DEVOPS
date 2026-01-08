# Runbook Opérations — uYoop-Cal

**Version:** 1.0.0  
**Dernière mise à jour:** 8 janvier 2026  
**Public:** Ops, SRE, DevOps Engineers

---

## 1. Déploiement

### 1.1. Installation Initiale (Développement)

#### Prérequis
- Docker Engine 24.0+
- Docker Compose v2.20+
- Ports disponibles : 8000, 5433, 8200/8201, 8210/8211, 8220/8221
- Minimum 4 GB RAM, 10 GB disk

#### Procédure

```bash
# 1. Cloner le repository
git clone https://github.com/example/uyoop-cal.git
cd uyoop-cal

# 2. Vérifier certificats TLS Vault (générer si absent)
ls -lh vault/certs/ca-cert.pem vault/certs/vault-*-{cert,key}.pem

# Si absent, générer avec script fourni
./scripts/generate-vault-certs.sh

# 3. Déploiement complet (build + init + start)
docker compose up -d

# 4. Attendre initialisation Vault (30-60s)
sleep 60

# 5. Vérifier santé services
docker compose ps --format "table {{.Name}}\t{{.Status}}"

# 6. Tester endpoint app
curl -s http://localhost:8000/health | jq
# Attendu: {"status":"healthy","service":"uyoop-cal-api","version":"0.1.0"}

# 7. Vérifier Vault leader
curl -sf --cacert vault/certs/ca-cert.pem https://localhost:8200/v1/sys/health | jq
# Attendu: {"initialized":true,"sealed":false,"standby":false}
```

**Temps déploiement:** 5-10 minutes (build image première fois).

#### Troubleshooting Déploiement

**Problème:** `vault-1` unhealthy après 2 min

```bash
# Vérifier logs init
docker compose logs vault-init

# Vérifier certificats montés
docker compose exec vault-1 ls -l /vault/certs/

# Vérifier listener TLS dans config
docker compose exec vault-1 cat /vault/config/vault.hcl | grep listener -A 5

# Re-init si nécessaire
docker compose down -v
docker compose up -d
```

**Problème:** App 503 "Vault unavailable"

```bash
# Vérifier .env.vault généré
cat vault/shared/.env.vault

# Vérifier AppRole credentials
export VAULT_ADDR=https://localhost:8200
export VAULT_CACERT=vault/certs/ca-cert.pem
export VAULT_TOKEN=$(grep VAULT_ROOT_TOKEN vault/shared/.env.vault | cut -d= -f2)

vault read auth/approle/role/uyoop-cal/role-id
# Attendu: role_id = <uuid>

# Tester login AppRole
vault write auth/approle/login \
  role_id=$(grep VAULT_APPROLE_ROLE_ID vault/shared/.env.vault | cut -d= -f2) \
  secret_id=$(grep VAULT_APPROLE_SECRET_ID vault/shared/.env.vault | cut -d= -f2)
# Attendu: token retourné
```

**Problème:** PostgreSQL connection refused

```bash
# Vérifier healthcheck Postgres
docker compose exec postgres pg_isready -U devops_calendar

# Tester connexion directe
docker compose exec postgres psql -U devops_calendar -d devops_calendar -c "SELECT version();"

# Vérifier DATABASE_URL dans Vault
vault kv get secret/app/config
```

### 1.2. Mise à Jour Rolling (Zero Downtime)

#### Prérequis K3s
- 3+ replicas app déployées
- HPA configuré
- PodDisruptionBudget : minAvailable=2

#### Procédure K3s

```bash
# 1. Build nouvelle image
docker build -t harbor.example.com/uyoop-cal:1.2.0 -f Dockerfile.hardened .

# 2. Scan vulnérabilités
trivy image --severity HIGH,CRITICAL harbor.example.com/uyoop-cal:1.2.0

# 3. Push vers registry
docker push harbor.example.com/uyoop-cal:1.2.0

# 4. Update deployment
kubectl set image deployment/uyoop-cal \
  app=harbor.example.com/uyoop-cal:1.2.0 \
  -n devops-tools

# 5. Surveiller rollout
kubectl rollout status deployment/uyoop-cal -n devops-tools --timeout=5m

# 6. Vérifier pods healthy
kubectl get pods -n devops-tools -l app=uyoop-cal

# 7. Smoke tests
kubectl exec -it deployment/uyoop-cal -n devops-tools -- \
  python -c "import app; print(app.__version__)"

curl https://uyoop.example.com/health
```

**Rollback si échec:**
```bash
kubectl rollout undo deployment/uyoop-cal -n devops-tools
kubectl rollout status deployment/uyoop-cal -n devops-tools
```

#### Procédure Docker Compose (Dev)

```bash
# 1. Build nouvelle image
docker compose build app

# 2. Restart avec nouvelle image
docker compose up -d app

# 3. Vérifier logs startup
docker compose logs -f app

# 4. Tester health
curl http://localhost:8000/health
```

---

## 2. Sauvegardes & Restauration

### 2.1. PostgreSQL

#### Backup Quotidien (Automatisé)

**Cron job (à installer sur host ou pod dédié):**
```bash
# /etc/cron.d/uyoop-backup
0 2 * * * root /opt/scripts/backup-postgres.sh >> /var/log/postgres-backup.log 2>&1
```

**Script backup-postgres.sh:**
```bash
#!/bin/bash
set -e

BACKUP_DIR="/backups/postgres"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
DB_HOST="localhost"
DB_PORT="5433"
DB_NAME="devops_calendar"
DB_USER="devops_calendar"
PGPASSWORD="devops_calendar"

mkdir -p $BACKUP_DIR

# Dump SQL
export PGPASSWORD
pg_dump -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME \
  -F c -f $BACKUP_DIR/uyoop_cal_${TIMESTAMP}.dump

# Compression
gzip $BACKUP_DIR/uyoop_cal_${TIMESTAMP}.dump

# Rétention 30 jours
find $BACKUP_DIR -name "*.dump.gz" -mtime +30 -delete

echo "✅ Backup PostgreSQL: uyoop_cal_${TIMESTAMP}.dump.gz"
```

#### Restauration PostgreSQL

```bash
# 1. Arrêter app pour éviter écritures pendant restore
docker compose stop app

# 2. Restaurer dump
gunzip -c /backups/postgres/uyoop_cal_20260108_020000.dump.gz | \
docker compose exec -T postgres pg_restore \
  -h localhost -p 5432 -U devops_calendar \
  -d devops_calendar --clean --if-exists

# 3. Vérifier données restaurées
docker compose exec postgres psql -U devops_calendar -d devops_calendar \
  -c "SELECT COUNT(*) FROM events;"

# 4. Redémarrer app
docker compose start app
```

### 2.2. Vault Raft Snapshots

#### Backup Hebdomadaire

**Script backup-vault.sh:**
```bash
#!/bin/bash
set -e

BACKUP_DIR="/backups/vault"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
export VAULT_ADDR="https://localhost:8200"
export VAULT_CACERT="vault/certs/ca-cert.pem"
export VAULT_TOKEN=$(grep VAULT_ROOT_TOKEN vault/shared/.env.vault | cut -d= -f2)

mkdir -p $BACKUP_DIR

# Snapshot Raft
vault operator raft snapshot save $BACKUP_DIR/raft_${TIMESTAMP}.snap

# Chiffrement du snapshot (recommandé)
gpg --encrypt --recipient ops@example.com \
  $BACKUP_DIR/raft_${TIMESTAMP}.snap

rm $BACKUP_DIR/raft_${TIMESTAMP}.snap

# Rétention 90 jours
find $BACKUP_DIR -name "*.snap.gpg" -mtime +90 -delete

echo "✅ Snapshot Vault: raft_${TIMESTAMP}.snap.gpg"
```

**Cron:**
```bash
0 3 * * 0 root /opt/scripts/backup-vault.sh >> /var/log/vault-backup.log 2>&1
```

#### Restauration Vault

⚠️ **PROCÉDURE CRITIQUE** — Tester en environnement staging avant prod.

```bash
# 1. Arrêter tous nodes Vault
docker compose stop vault-1 vault-2 vault-3

# 2. Supprimer données Raft existantes
docker volume rm uyoop-cal_vault_data_1 uyoop-cal_vault_data_2 uyoop-cal_vault_data_3

# 3. Déchiffrer snapshot
gpg --decrypt /backups/vault/raft_20260101_030000.snap.gpg > /tmp/raft.snap

# 4. Redémarrer vault-1 seul
docker compose up -d vault-1

# 5. Attendre healthy
sleep 10

# 6. Restore snapshot
export VAULT_ADDR=https://localhost:8200
export VAULT_CACERT=vault/certs/ca-cert.pem
export VAULT_TOKEN=<root-token-from-backup>

vault operator raft snapshot restore -force /tmp/raft.snap

# 7. Redémarrer tous nodes
docker compose up -d vault-2 vault-3

# 8. Vérifier cluster health
vault operator raft list-peers
curl -sf --cacert vault/certs/ca-cert.pem https://localhost:8200/v1/sys/health | jq
```

### 2.3. K3s (Velero)

#### Backup Namespace Complet

```bash
# Installation Velero (une fois)
velero install \
  --provider aws \
  --bucket uyoop-backups \
  --secret-file ./aws-credentials \
  --backup-location-config region=us-east-1 \
  --snapshot-location-config region=us-east-1

# Backup namespace devops-tools
velero backup create uyoop-cal-backup-$(date +%Y%m%d) \
  --include-namespaces devops-tools \
  --wait

# Vérifier backup
velero backup describe uyoop-cal-backup-20260108
```

#### Restauration K3s

```bash
# Restore depuis backup
velero restore create --from-backup uyoop-cal-backup-20260108 --wait

# Vérifier restoration
kubectl get all -n devops-tools
kubectl logs -n devops-tools deployment/uyoop-cal
```

---

## 3. Rotation Credentials

### 3.1. Rotation AppRole SECRET_ID

**Fréquence recommandée:** Hebdomadaire ou mensuelle.

**Procédure:**
```bash
# 1. Connexion Vault avec root token
export VAULT_ADDR=https://localhost:8200
export VAULT_CACERT=vault/certs/ca-cert.pem
export VAULT_TOKEN=$(grep VAULT_ROOT_TOKEN vault/shared/.env.vault | cut -d= -f2)

# 2. Générer nouveau SECRET_ID
NEW_SECRET_ID=$(vault write -field=secret_id -f auth/approle/role/uyoop-cal/secret-id)

echo "Nouveau SECRET_ID: $NEW_SECRET_ID"

# 3. Mettre à jour .env.vault
sed -i "s/VAULT_APPROLE_SECRET_ID=.*/VAULT_APPROLE_SECRET_ID=$NEW_SECRET_ID/" \
  vault/shared/.env.vault

# 4. Redémarrer app pour reload (K3s)
kubectl rollout restart deployment/uyoop-cal -n devops-tools

# Ou Docker Compose:
docker compose restart app

# 5. Vérifier logs app (auth Vault OK)
kubectl logs -n devops-tools deployment/uyoop-cal | grep "Vault login successful"
```

**Automatisation (Kubernetes CronJob):**
```yaml
apiVersion: batch/v1
kind: CronJob
metadata:
  name: rotate-approle-secret
  namespace: devops-tools
spec:
  schedule: "0 2 * * 0"  # Tous les dimanches 2h
  jobTemplate:
    spec:
      template:
        spec:
          containers:
          - name: rotate
            image: hashicorp/vault:1.15
            command: ["/bin/sh"]
            args:
            - -c
            - |
              NEW_SECRET=$(vault write -field=secret_id -f auth/approle/role/uyoop-cal/secret-id)
              kubectl create secret generic uyoop-approle \
                --from-literal=secret_id=$NEW_SECRET \
                --dry-run=client -o yaml | kubectl apply -f -
              kubectl rollout restart deployment/uyoop-cal
            env:
            - name: VAULT_ADDR
              value: "https://vault.devops-tools.svc:8200"
            - name: VAULT_TOKEN
              valueFrom:
                secretKeyRef:
                  name: vault-root-token
                  key: token
          restartPolicy: OnFailure
```

### 3.2. Rotation Root Token Vault

⚠️ **PROCÉDURE SENSIBLE** — Coordination équipe requise.

```bash
# 1. Générer nouveau root token (requiert quorum unseal keys)
vault operator generate-root -init

# 2. Fournir unseal keys (3/5 requis)
vault operator generate-root -nonce=<nonce> <unseal-key-1>
vault operator generate-root -nonce=<nonce> <unseal-key-2>
vault operator generate-root -nonce=<nonce> <unseal-key-3>

# 3. Décoder nouveau root token
vault operator generate-root -decode=<encoded-token> -otp=<otp>

# 4. Tester nouveau token
export VAULT_TOKEN=<new-root-token>
vault token lookup

# 5. Révoquer ancien token
vault token revoke <old-root-token>

# 6. Mettre à jour .env.vault
sed -i "s/VAULT_ROOT_TOKEN=.*/VAULT_ROOT_TOKEN=<new-root-token>/" \
  vault/shared/.env.vault
```

**Fréquence recommandée:** Trimestrielle ou après incident sécurité.

### 3.3. Rotation Certificats TLS

**Expiration:** Certificats Let's Encrypt = 90 jours.

**Automatisation cert-manager (K3s):**
```yaml
apiVersion: cert-manager.io/v1
kind: Certificate
metadata:
  name: uyoop-cal-tls
  namespace: devops-tools
spec:
  secretName: uyoop-cal-tls
  issuerRef:
    name: letsencrypt-prod
    kind: ClusterIssuer
  dnsNames:
  - uyoop.example.com
  renewBefore: 720h  # Renouvellement 30j avant expiration
```

**Rotation manuelle (dev):**
```bash
# 1. Générer nouveaux certs
./scripts/generate-vault-certs.sh

# 2. Redémarrer Vault nodes avec nouveaux certs
docker compose restart vault-1 vault-2 vault-3

# 3. Vérifier certificats chargés
openssl s_client -connect localhost:8200 -showcerts < /dev/null 2>/dev/null | \
  openssl x509 -noout -dates
```

---

## 4. Monitoring & Alerting

### 4.1. Healthchecks (Services Actifs)

**App:**
```bash
curl -f http://localhost:8000/health
# Attendu: HTTP 200, {"status":"healthy"}
```

**PostgreSQL:**
```bash
docker compose exec postgres pg_isready -U devops_calendar
# Attendu: accepting connections
```

**Vault (tous nodes):**
```bash
for port in 8200 8210 8220; do
  echo "=== Node port $port ==="
  curl -sf --cacert vault/certs/ca-cert.pem \
    https://localhost:$port/v1/sys/health | jq '{initialized, sealed, standby}'
done

# Attendu:
# Node 8200: {"initialized":true,"sealed":false,"standby":false}  # Leader
# Node 8210: {"initialized":true,"sealed":false,"standby":true}   # Standby
# Node 8221: {"initialized":true,"sealed":false,"standby":true}   # Standby
```

### 4.2. Métriques Prometheus (K3s)

**ServiceMonitor (Prometheus Operator):**
```yaml
apiVersion: monitoring.coreos.com/v1
kind: ServiceMonitor
metadata:
  name: uyoop-cal
  namespace: devops-tools
spec:
  selector:
    matchLabels:
      app: uyoop-cal
  endpoints:
  - port: metrics
    interval: 30s
    path: /metrics
```

**Métriques exposées (via FastAPI middleware):**
- `http_requests_total{method, path, status}`
- `http_request_duration_seconds{method, path}`
- `events_created_total{type}`
- `git_actions_executed_total{status}`
- `vault_login_failures_total`

### 4.3. Alertes Critiques (Alertmanager)

**Fichier:** `k8s/alerts/uyoop-cal.yaml`

```yaml
apiVersion: monitoring.coreos.com/v1
kind: PrometheusRule
metadata:
  name: uyoop-cal-alerts
  namespace: devops-tools
spec:
  groups:
  - name: uyoop-cal
    interval: 30s
    rules:
    - alert: HighErrorRate
      expr: rate(http_requests_total{status=~"5.."}[5m]) > 0.05
      for: 5m
      labels:
        severity: critical
      annotations:
        summary: "Taux d'erreur 5xx élevé (>5%)"
        description: "{{ $value | humanizePercentage }} requêtes échouent"

    - alert: AppDown
      expr: up{job="uyoop-cal"} == 0
      for: 2m
      labels:
        severity: critical
      annotations:
        summary: "Application uYoop-Cal down"

    - alert: VaultSealed
      expr: vault_core_unsealed == 0
      for: 1m
      labels:
        severity: critical
      annotations:
        summary: "Vault cluster sealed"
        description: "Vault nécessite unseal manuel"

    - alert: PostgreSQLDown
      expr: pg_up == 0
      for: 2m
      labels:
        severity: critical
      annotations:
        summary: "PostgreSQL down"

    - alert: HighMemoryUsage
      expr: container_memory_usage_bytes{pod=~"uyoop-cal.*"} / container_spec_memory_limit_bytes > 0.9
      for: 5m
      labels:
        severity: warning
      annotations:
        summary: "Utilisation mémoire >90%"
```

**Notification Slack:**
```yaml
# alertmanager.yaml
route:
  receiver: slack-ops
  routes:
  - match:
      severity: critical
    receiver: slack-ops-critical

receivers:
- name: slack-ops
  slack_configs:
  - api_url: https://hooks.slack.com/services/XXX
    channel: '#ops-alerts'
    title: '{{ .CommonAnnotations.summary }}'
    text: '{{ .CommonAnnotations.description }}'

- name: slack-ops-critical
  slack_configs:
  - api_url: https://hooks.slack.com/services/XXX
    channel: '#ops-critical'
    title: '🔴 CRITICAL: {{ .CommonAnnotations.summary }}'
    text: '{{ .CommonAnnotations.description }}'
```

### 4.4. Dashboards Grafana

**Datasource:** Prometheus

**Dashboard IDs (Grafana.com):**
- **FastAPI:** 16110 (requêtes, latence, erreurs)
- **PostgreSQL:** 9628 (connections, queries, replication)
- **Vault:** 12904 (tokens, seal status, operations)
- **Kubernetes:** 315 (pods, CPU, RAM, réseau)

**Dashboard custom uYoop-Cal:**
```json
{
  "dashboard": {
    "title": "uYoop-Cal DevOps Metrics",
    "panels": [
      {
        "title": "Events Created (by Type)",
        "targets": [{
          "expr": "sum(rate(events_created_total[5m])) by (type)"
        }],
        "type": "graph"
      },
      {
        "title": "Git Actions Success Rate",
        "targets": [{
          "expr": "sum(rate(git_actions_executed_total{status=\"success\"}[5m])) / sum(rate(git_actions_executed_total[5m]))"
        }],
        "type": "gauge"
      },
      {
        "title": "DORA - Deployment Frequency",
        "targets": [{
          "expr": "sum(rate(events_created_total{type=\"deployment_window\"}[7d]))"
        }],
        "type": "stat"
      }
    ]
  }
}
```

---

## 5. Gestion Incidents

### 5.1. Procédure Standard

1. **Détection** : Alerte Prometheus/Alertmanager ou user report
2. **Triage** : Vérifier healthchecks, logs, métriques
3. **Investigation** : Identifier root cause (logs détaillés, traces)
4. **Mitigation** : Appliquer fix temporaire (rollback, scale up, restart)
5. **Résolution** : Déployer fix permanent
6. **Post-mortem** : Documenter incident, actions préventives

### 5.2. Scénarios Courants

#### Scenario 1: App 503 "Vault unavailable"

**Symptômes:**
- App logs: `Failed to login to Vault: connection refused`
- Vault healthcheck failed

**Diagnostic:**
```bash
# Vérifier Vault sealed
curl -sf --cacert vault/certs/ca-cert.pem \
  https://localhost:8200/v1/sys/seal-status | jq '.sealed'

# Si sealed=true
# Cause probable: Redémarrage node sans auto-unseal
```

**Mitigation:**
```bash
# Unseal avec 3 clés (de init-keys.json)
export VAULT_ADDR=https://localhost:8200
export VAULT_CACERT=vault/certs/ca-cert.pem

vault operator unseal <key-1>
vault operator unseal <key-2>
vault operator unseal <key-3>

# Vérifier unsealed
vault status

# App redémarre automatiquement après retry
```

**Résolution permanente:** Configurer Vault auto-unseal (Cloud KMS, Transit).

#### Scenario 2: PostgreSQL replica lag >10s

**Symptômes:**
- Métriques: `pg_replication_lag_seconds > 10`
- Reads stale sur replica

**Diagnostic:**
```bash
# Vérifier replication status (sur primary)
docker compose exec postgres psql -U postgres \
  -c "SELECT * FROM pg_stat_replication;"

# Identifier lag
# Cause probable: Heavy write load, réseau lent, replica sous-dimensionné
```

**Mitigation:**
```bash
# Rediriger reads temporairement vers primary
kubectl annotate service uyoop-cal-db-ro \
  metallb.universe.tf/allow-shared-ip=false

# Scale replica pour catch-up
kubectl scale statefulset postgres-replica --replicas=2
```

**Résolution permanente:** Augmenter resources replica, tuning PostgreSQL (`max_wal_senders`).

#### Scenario 3: Memory leak app (OOMKilled)

**Symptômes:**
- Pods restart fréquents
- Logs K8s: `OOMKilled`
- Métriques: mémoire croissante linéairement

**Diagnostic:**
```bash
# Vérifier memory usage trend
kubectl top pods -n devops-tools -l app=uyoop-cal

# Profiler memory (temporaire)
kubectl exec -it deployment/uyoop-cal -n devops-tools -- \
  python -m memory_profiler app/main.py
```

**Mitigation:**
```bash
# Augmenter limits temporairement
kubectl set resources deployment/uyoop-cal \
  --limits=memory=1Gi \
  -n devops-tools

# Redémarrer pods
kubectl rollout restart deployment/uyoop-cal -n devops-tools
```

**Résolution permanente:** Identifier leak dans code (profiling), fix + déployer patch.

---

## 6. Maintenance Planifiée

### 6.1. Mise à Jour Vault

**Fenêtre:** Week-end, 2h maintenance

```bash
# 1. Backup Raft snapshot
./scripts/backup-vault.sh

# 2. Update image Vault (docker-compose.yml)
# vault: image: hashicorp/vault:1.16  # Was 1.15

# 3. Rolling update (un node à la fois)
docker compose stop vault-3
docker compose up -d vault-3
# Attendre healthy avant continuer
docker compose stop vault-2
docker compose up -d vault-2
docker compose stop vault-1  # Leader en dernier
docker compose up -d vault-1

# 4. Vérifier cluster health
vault operator raft list-peers
vault status
```

### 6.2. Mise à Jour PostgreSQL

**Fenêtre:** Week-end, 4h maintenance (si major version)

```bash
# 1. Backup complet
./scripts/backup-postgres.sh

# 2. Tester upgrade sur staging avant prod
# ...

# 3. Update image (docker-compose.yml)
# postgres: image: postgres:17  # Was 16

# 4. Arrêter app
docker compose stop app

# 5. Upgrade PostgreSQL
docker compose up -d postgres

# Vérifier logs upgrade
docker compose logs postgres | grep -i upgrade

# 6. Redémarrer app
docker compose up -d app
```

### 6.3. Purge Logs Anciens

**Script cleanup-logs.sh (cron mensuel):**
```bash
#!/bin/bash
# Nettoyer logs >90 jours

# Logs Docker
docker system prune -a --filter "until=2160h" -f

# Logs applicatifs (si montés sur host)
find /var/log/uyoop-cal -name "*.log" -mtime +90 -delete

# Events PostgreSQL (archiver avant delete)
docker compose exec postgres psql -U devops_calendar -d devops_calendar <<EOF
BEGIN;
CREATE TABLE events_archive AS 
  SELECT * FROM events WHERE created_at < NOW() - INTERVAL '1 year';
DELETE FROM events WHERE created_at < NOW() - INTERVAL '1 year';
COMMIT;
EOF

echo "✅ Nettoyage terminé"
```

---

## 7. Contacts & Escalade

### Équipe Ops

| Rôle | Contact | Disponibilité |
|------|---------|---------------|
| **Ops Lead** | ops-lead@example.com | 24/7 (astreinte) |
| **SRE Team** | sre-team@example.com | Lun-Ven 9h-18h |
| **Security Officer** | security@example.com | Sur incident |
| **Dev Lead** | dev-lead@example.com | Lun-Ven 10h-19h |

### Escalation

- **Severity 1 (Critical):** App down, perte données → Ops Lead immédiat
- **Severity 2 (High):** Performance dégradée, feature broken → SRE Team <1h
- **Severity 3 (Medium):** Bug mineur, anomalie → Ticket JIRA
- **Severity 4 (Low):** Question, amélioration → Backlog

### Outils

- **Alerting:** Alertmanager → Slack #ops-critical
- **Incidents:** PagerDuty (S1/S2) ou JIRA (S3/S4)
- **Communication:** Slack #ops-incidents (war room)
- **Documentation:** Confluence `devops-tools/uyoop-cal`

---

## 8. Checklist Pre-Deployment

Avant chaque déploiement production:

- [ ] Tests E2E PASS sur staging
- [ ] Scan sécurité Trivy <HIGH findings
- [ ] Load tests OK (latence p95 <500ms)
- [ ] Backup PostgreSQL + Vault <24h
- [ ] Rollback plan documenté
- [ ] Change Request approuvé (prod)
- [ ] Équipe ops notifiée (Slack)
- [ ] Fenêtre de maintenance communiquée (si downtime)
- [ ] Monitoring dashboards ouverts
- [ ] Logs streaming actifs

---

**Document maintenu par:** SRE Team uYoop-Cal  
**Dernière révision:** 8 janvier 2026  
**Prochaine mise à jour:** Après chaque incident majeur ou trim
