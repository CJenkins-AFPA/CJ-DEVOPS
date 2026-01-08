# Sécurité Globale - Plan de Durcissement 5 Étapes

> Mise à jour 2026-01-08 — État sécurité & Runbook express
- Image applicative durcie (DHI) en production: runtime distroless nonroot, wheels binaires cp314, healthcheck interne; base OS 0 CVE. Reste: bump `ecdsa`, `python-jose`, `starlette`.
- Vault HA 3 nœuds en TLS: certs montés en RO, healthchecks `curl --cacert`, init container idempotent (init/unseal/join/AppRole/KV). `.env.vault` généré dans volume partagé.
- Déploiement « 1 commande » validé: `docker compose up -d` depuis repo racine `uyoop-cal`.
- Prochains durcissements: audit log Vault, snapshots/restore planifiés, rotation certs/SECRET_ID, flags runtime (`read_only`, `cap_drop`), CI (Trivy+SBOM).

Runbook (raccourci):
```bash
# Démarrer stack (build, Vault HA TLS, app)
docker compose up -d

# Santé app et nœuds vault
curl -sf http://localhost:8000/health
curl -sf --cacert vault/certs/ca-cert.pem https://localhost:8200/v1/sys/health

# Lire ROLE_ID/SECRET_ID (dans conteneur init ou via .env.vault généré)
cat vault/shared/.env.vault

# Snapshot Raft (à intégrer en cron)
VAULT_ADDR=https://localhost:8200 VAULT_CACERT=vault/certs/ca-cert.pem \
VAULT_TOKEN=<root-or-ops> \
vault operator raft snapshot save /vault/shared/raft.snap
```


**Date création:** 2026-01-07  
**Dernière mise à jour:** 2026-01-08  
**Status:** 🟢 4/5 étapes terminées (Vault en attente secrets prod)  
**Objectif:** Sécuriser l'application backend/frontend/infrastructure pour production

---

## Vue d'ensemble

Ce document décrit le plan de sécurisation globale en 5 phases prioritaires, depuis la protection anti-bruteforce jusqu'à la préparation production Vault. Chaque étape est documentée avec son statut, implémentation technique, et tests de validation.

---

## Étape 1: Rate Limiting ✅ TERMINÉ

### Objectif
Protéger les endpoints d'authentification contre les attaques par force brute et abus API.

### Implémentation
- **Outil:** slowapi (Flask-Limiter pour FastAPI)
- **Configuration:** 5 requêtes par minute par adresse IP
- **Endpoints protégés:**
  - `POST /login` - Authentification principale
  - `POST /2fa/setup` - Configuration 2FA
  - `POST /2fa/enable` - Activation 2FA
  - `POST /2fa/verify` - Vérification code TOTP
  - `DELETE /2fa/disable` - Désactivation 2FA

### Code clé
```python
# app/main.py
from slowapi import Limiter
from slowapi.util import get_remote_address

limiter = Limiter(key_func=get_remote_address)
app.state.limiter = limiter

@app.post("/login")
@limiter.limit("5 per 1 minute")
async def login(request: Request, ...):
    # ... logique login
```

### Tests de validation ✅
```bash
# Test dépassement limite
for i in {1..6}; do
  curl -X POST http://localhost:8000/login \
    -H "Content-Type: application/json" \
    -d '{"username":"test","password":"test"}'
done

# Résultat attendu:
# Requêtes 1-5: HTTP 200/401 (selon credentials)
# Requête 6: HTTP 429 "Rate limit exceeded: 5 per 1 minute"

# Test réinitialisation après 60s
sleep 70
curl -X POST http://localhost:8000/login \
  -H "Content-Type: application/json" \
  -d '{"username":"cjuyoop","password":"secure_password_123"}'

# Résultat: HTTP 200 OK (limite réinitialisée)
```

### Améliorations futures
- Rate limiting par `user_id` au lieu de IP (éviter pénaliser NAT partagés)
- Limites différenciées par endpoint (login plus stricte que status)
- Backend Redis pour limiter partagé entre instances app

---

## Étape 2: JWT Sessions � BACKEND ✅ TERMINÉ, FRONTEND ✅ TERMINÉ

### Objectif
Remplacer l'authentification basique `X-User-Id` header par tokens JWT signés avec expiration.

### Implémentation Backend ✅

#### Dépendances
```txt
# requirements.txt
python-jose[cryptography]
PyJWT
```

#### Module JWT (app/auth.py)
```python
from jose import JWTError, jwt
from datetime import datetime, timedelta

SECRET_KEY = os.getenv("JWT_SECRET_KEY", "dev-secret-change-in-production")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30
REFRESH_TOKEN_EXPIRE_DAYS = 7

def create_access_token(data: dict) -> str:
    """Crée token access avec expiration 30min"""
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode = data.copy()
    to_encode.update({"exp": expire, "type": "access"})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

def create_refresh_token(data: dict) -> str:
    """Crée token refresh avec expiration 7 jours"""
    expire = datetime.utcnow() + timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS)
    to_encode = data.copy()
    to_encode.update({"exp": expire, "type": "refresh"})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

def verify_token(token: str, expected_type: str) -> dict:
    """Vérifie signature et expiration token"""
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        if payload.get("type") != expected_type:
            raise JWTError("Invalid token type")
        return payload
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid or expired token")
```

#### Schémas API (app/schemas.py)
```python
class LoginResponse(BaseModel):
    user: User
    requires_totp: bool  # True si 2FA activée et code absent
    access_token: str | None  # Émis après validation 2FA
    refresh_token: str | None  # Émis avec access_token
    token_type: str | None = "bearer"

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"

class RefreshTokenRequest(BaseModel):
    refresh_token: str
```

#### Endpoints
```python
# POST /login - Émet tokens après validation 2FA
@app.post("/login")
async def login(credentials: LoginRequest, db: Session = Depends(get_db)):
    user = authenticate_user(db, credentials.username, credentials.password)
    if user.totp_enabled and not credentials.totp_code:
        return {"user": user, "requires_totp": True, "access_token": None}
    
    if user.totp_enabled:
        validate_totp(user.id, credentials.totp_code)
    
    # Tokens JWT émis seulement après 2FA valide
    access_token = create_access_token({"sub": str(user.id), "username": user.username})
    refresh_token = create_refresh_token({"sub": str(user.id)})
    
    return {
        "user": user,
        "requires_totp": False,
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer"
    }

# POST /token/refresh - Renouvelle access_token
@app.post("/token/refresh")
async def refresh_token(request: RefreshTokenRequest):
    payload = verify_token(request.refresh_token, "refresh")
    user_id = payload["sub"]
    
    new_access_token = create_access_token({
        "sub": user_id,
        "username": payload.get("username")
    })
    
    return {"access_token": new_access_token, "token_type": "bearer"}
```

#### Dépendance sécurisée (app/main.py)
```python
from fastapi.security import HTTPBearer

security = HTTPBearer()

async def get_current_user_secure(
    request: Request,
    db: Session = Depends(get_db),
    credentials: HTTPAuthorizationCredentials = Depends(security)
) -> User:
    """
    Préfère JWT Authorization: Bearer <token>
    Fallback X-User-Id durant migration frontend
    """
    # Priorité 1: JWT token
    if credentials:
        payload = verify_token(credentials.credentials, "access")
        user_id = int(payload["sub"])
        return db.query(User).filter(User.id == user_id).first()
    
    # Priorité 2: X-User-Id (legacy, sera retiré)
    user_id_header = request.headers.get("X-User-Id")
    if user_id_header:
        user_id = int(user_id_header)
        return db.query(User).filter(User.id == user_id).first()
    
    raise HTTPException(status_code=401, detail="Authentication required")

# Migration endpoints vers JWT
@app.get("/users")
async def get_users(
    current_user: User = Depends(get_current_user_secure),
    db: Session = Depends(get_db)
):
    # Endpoint protégé par JWT (ou X-User-Id durant migration)
    ...
```

### Tests Backend ✅
```bash
# Test login sans 2FA
curl -X POST http://localhost:8000/login \
  -H "Content-Type: application/json" \
  -d '{"username":"cjuyoop","password":"secure_password_123"}'
# Résultat: requires_totp=true, access_token=null

# Test login avec 2FA valide
curl -X POST http://localhost:8000/login \
  -H "Content-Type: application/json" \
  -d '{"username":"cjuyoop","password":"secure_password_123","totp_code":"123456"}'
# Résultat: access_token et refresh_token retournés

# Test refresh token
curl -X POST http://localhost:8000/token/refresh \
  -H "Content-Type: application/json" \
  -d '{"refresh_token":"<refresh_token>"}'
# Résultat: nouveau access_token émis

# Test endpoint protégé avec JWT
curl http://localhost:8000/users \
  -H "Authorization: Bearer <access_token>"
# Résultat: HTTP 200 avec liste users

# Test fallback X-User-Id (durant migration)
curl http://localhost:8000/users -H "X-User-Id: 1"
# Résultat: HTTP 200 (fallback fonctionne)
```

### Implémentation Frontend ⏳ EN ATTENTE

#### À implémenter (app/static/index.html)
```javascript
// 1. Stocker tokens après login
async function login(username, password, totpCode) {
    const response = await fetch('/login', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({username, password, totp_code: totpCode})
    });
    
    const data = await response.json();
    
    if (data.requires_totp) {
        // Ouvrir modal 2FA
        show2FAModal();
        return;
    }
    
    // Stocker tokens
    sessionStorage.setItem('access_token', data.access_token);
    sessionStorage.setItem('refresh_token', data.refresh_token);
    
    // Rediriger vers app
    window.location.href = '/';
}

// 2. Passer Authorization header sur toutes requêtes
async function fetchWithAuth(url, options = {}) {
    const token = sessionStorage.getItem('access_token');
    
    options.headers = {
        ...options.headers,
        'Authorization': `Bearer ${token}`
    };
    
    let response = await fetch(url, options);
    
    // 3. Refresh automatique si 401
    if (response.status === 401) {
        const refreshed = await refreshAccessToken();
        if (refreshed) {
            // Retry avec nouveau token
            options.headers['Authorization'] = `Bearer ${sessionStorage.getItem('access_token')}`;
            response = await fetch(url, options);
        } else {
            // Refresh échoué, logout
            logout();
        }
    }
    
    return response;
}

async function refreshAccessToken() {
    const refreshToken = sessionStorage.getItem('refresh_token');
    if (!refreshToken) return false;
    
    try {
        const response = await fetch('/token/refresh', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({refresh_token: refreshToken})
        });
        
        if (response.ok) {
            const data = await response.json();
            sessionStorage.setItem('access_token', data.access_token);
            return true;
        }
    } catch (error) {
        console.error('Refresh failed:', error);
    }
    
    return false;
}

// 4. Remplacer toutes les fetch() par fetchWithAuth()
// Exemple: charger événements
async function loadEvents() {
    const response = await fetchWithAuth('/events');
    const events = await response.json();
    // ...
}
```

### Critères de complétion
- [ ] Frontend stocke tokens dans sessionStorage
- [ ] Toutes requêtes API utilisent `Authorization: Bearer`
- [ ] Refresh automatique implémenté sur 401
- [ ] Header `X-User-Id` retiré après validation
- [ ] Fallback `X-User-Id` supprimé côté backend

---

## Étape 3: Security Headers ✅ TERMINÉ + CSP DURCI

### Objectif
Ajouter headers HTTP de sécurité pour protéger contre XSS, clickjacking, sniffing MIME, etc.

### Implémentation ✅ Mise à jour 2026-01-07
```python
# app/main.py
@app.middleware("http")
async def add_security_headers(request: Request, call_next):
    response = await call_next(request)
    
    # HSTS: Force HTTPS (même en dev, prêt pour prod)
    response.headers["Strict-Transport-Security"] = "max-age=63072000; includeSubDomains; preload"
    
    # CSP: Scripts et styles externalisés, autorise CDN uniquement
    response.headers["Content-Security-Policy"] = (
        "default-src 'self'; "
        "img-src 'self' data:; "
        "style-src 'self' https://cdn.jsdelivr.net; "
        "script-src 'self' https://cdn.jsdelivr.net; "
        "connect-src 'self'; frame-ancestors 'none'"
    )
    
    # X-Frame-Options: Empêche embedding iframe
    response.headers["X-Frame-Options"] = "DENY"
    
    # X-Content-Type-Options: Empêche MIME sniffing
    response.headers["X-Content-Type-Options"] = "nosniff"
    
    # Referrer-Policy: Contrôle infos referrer
    response.headers["Referrer-Policy"] = "no-referrer"
    
    # Permissions-Policy: Désactive APIs browser sensibles
    response.headers["Permissions-Policy"] = "geolocation=(), microphone=(), camera=()"
    
    return response
```

### Externalisation Scripts/Styles ✅ 2026-01-07
**Fichiers créés:**
- `app/static/style.css` (11 KB, 616 lignes) - Tous les styles CSS
- `app/static/app.js` (45 KB, 1233 lignes) - Toute la logique JavaScript
- `app/static/index.html` réduit à 26 KB (était 80+ KB avec inline)

**Structure:**
```html
<!-- index.html -->
<head>
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/fullcalendar@6.1.15/index.global.min.css">
  <link rel="stylesheet" href="/static/style.css">
  <script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.1/dist/chart.umd.min.js"></script>
</head>
<body>
  <!-- ... HTML content ... -->
  <script src="https://cdn.jsdelivr.net/npm/fullcalendar@6.1.15/index.global.min.js"></script>
  <script src="/static/app.js"></script>
</body>
```

### Tests de validation ✅
```bash
curl -I http://localhost:8000/static/index.html

# Résultat:
# strict-transport-security: max-age=63072000; includeSubDomains; preload
# content-security-policy: default-src 'self'; img-src 'self' data:; style-src 'self' https://cdn.jsdelivr.net; script-src 'self' https://cdn.jsdelivr.net; connect-src 'self'; frame-ancestors 'none'
# x-frame-options: DENY
# x-content-type-options: nosniff
# referrer-policy: no-referrer
# permissions-policy: geolocation=(), microphone=(), camera=()
```

### ✅ CSP Durci - Aucun 'unsafe-inline' ou 'unsafe-eval'
**Changements:**
- ❌ Supprimé `'unsafe-inline'` de script-src et style-src
- ❌ Supprimé `'unsafe-eval'` de script-src
- ✅ Autorisé `https://cdn.jsdelivr.net` pour FullCalendar et Chart.js
- ✅ Tous les scripts inline externalisés vers app.js
- ✅ Tous les styles inline externalisés vers style.css
- ✅ Politique stricte: seuls scripts/styles depuis 'self' ou CDN autorisés
4. Durcir CSP à:
   ```
   Content-Security-Policy: default-src 'self'; script-src 'self'; style-src 'self'; object-src 'none'
   ```

---

## Étape 4: Docker Hardening ✅ TERMINÉ

### Objectif
Sécuriser image Docker: build multi-stage, utilisateur non-root, optimisation taille.

### Implémentation

#### Dockerfile multi-stage
```dockerfile
# Stage 1: wheelhouse - Build wheels des dépendances
FROM python:3.13-slim AS wheelhouse
WORKDIR /wheels
COPY requirements.txt .
RUN pip wheel -r requirements.txt --wheel-dir=/wheels

# Stage 2: runtime - Image finale minimale
FROM python:3.13-slim

# Créer utilisateur non-root
RUN useradd -m -u 1000 appuser

WORKDIR /app

# Copier wheels depuis stage build
COPY --from=wheelhouse /wheels /wheels
COPY requirements.txt .

# Installer depuis wheels (pas de build tools requis)
RUN pip install -r /wheels/requirements.txt --find-links=/wheels --no-index && \
    rm -rf /wheels

# Copier code application
COPY . .

# Basculer vers utilisateur non-root
USER appuser

# Exposer port
EXPOSE 8000

# Lancer serveur
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

#### Avantages
- **Multi-stage:** Sépare build (gcc, dev tools) de runtime (libs seulement) → image plus petite
- **Non-root:** Container tourne sous UID 1000 (appuser) → limite exploits si compromise
- **Wheels:** Installation rapide depuis wheels pré-compilés, pas de rebuild à chaque déploiement
- **Minimal:** Python slim, aucun outil dev dans image finale

### Tests de validation ✅
```bash
# Rebuild image
docker compose build app

# Recréer container
docker compose up -d app

# Vérifier user non-root
docker exec devops_calendar_app ps aux
# Résultat: processus tournent sous UID appuser, pas root

# Vérifier logs startup
docker logs devops_calendar_app
# Résultat: "Uvicorn running on http://0.0.0.0:8000" visible

# Vérifier connectivité API
curl http://localhost:8000/users
# Résultat: HTTP 200 avec données users
```

### ⏳ Prochaines améliorations Docker

#### Read-only filesystem
```yaml
# docker-compose.yml
services:
  app:
    read_only: true
    tmpfs:
      - /tmp
      - /app/.cache
```

#### Drop capabilities
```yaml
# docker-compose.yml
services:
  app:
    cap_drop:
      - ALL
    cap_add:
      - NET_BIND_SERVICE  # Si port < 1024 requis
```

#### Health checks
```yaml
# docker-compose.yml
services:
  app:
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8000/health"]
      interval: 30s
      timeout: 3s
      retries: 3
      start_period: 40s
```

```python
# app/main.py
@app.get("/health")
async def health_check():
    return {"status": "healthy", "timestamp": datetime.utcnow().isoformat()}
```

---

## Étape 5: Vault Production ⏳ À VENIR

### Objectif
Migrer Vault de mode dev (in-memory) vers setup production HA avec TLS, persistence, rotation.

### État actuel (Dev mode)
```yaml
# docker-compose.yml
vault:
  image: hashicorp/vault:latest
  command: server -dev -dev-root-token-id=dev-root-token
  environment:
    VAULT_DEV_ROOT_TOKEN_ID: dev-root-token
    VAULT_DEV_LISTEN_ADDRESS: 0.0.0.0:8200
```

**Limitations dev mode:**
- ✅ Aucun fichier config requis (auto-config)
- ✅ Unsealed automatiquement
- ❌ Données en mémoire uniquement (perdues au restart)
- ❌ Root token statique exposé
- ❌ Pas de TLS/mTLS
- ❌ Single node (pas de HA)

### Production setup (À implémenter)

#### 1. Cluster HA avec Raft backend
```hcl
# vault-config.hcl
storage "raft" {
  path = "/vault/data"
  node_id = "vault-1"
  
  retry_join {
    leader_api_addr = "https://vault-2:8200"
  }
  retry_join {
    leader_api_addr = "https://vault-3:8200"
  }
}

listener "tcp" {
  address = "0.0.0.0:8200"
  tls_cert_file = "/vault/tls/vault.crt"
  tls_key_file = "/vault/tls/vault.key"
  tls_client_ca_file = "/vault/tls/ca.crt"
}

api_addr = "https://vault-1:8200"
cluster_addr = "https://vault-1:8201"
ui = true
```

#### 2. TLS/mTLS
```bash
# Générer certificats (exemple dev, utiliser CA réelle en prod)
openssl req -x509 -newkey rsa:4096 -keyout vault.key -out vault.crt -days 365 -nodes \
  -subj "/CN=vault-1/O=Organization"

# Configurer app pour mTLS
# app/.env.vault (ajouter)
VAULT_ADDR=https://vault:8200
VAULT_CACERT=/app/certs/ca.crt
VAULT_CLIENT_CERT=/app/certs/client.crt
VAULT_CLIENT_KEY=/app/certs/client.key
```

#### 3. SECRET_ID Rotation automatique
```bash
#!/bin/bash
# scripts/rotate-secret-id.sh

# Générer nouveau SECRET_ID
NEW_SECRET_ID=$(vault write -f -field=secret_id auth/approle/role/uyoop-app/secret-id)

# Mettre à jour .env.vault
sed -i "s/VAULT_SECRET_ID=.*/VAULT_SECRET_ID=$NEW_SECRET_ID/" .env.vault

# Redémarrer app (rolling restart si multi-instance)
docker compose restart app

# Révoquer ancien SECRET_ID après grace period (ex: 1h)
sleep 3600
vault write auth/approle/role/uyoop-app/secret-id-accessor/<old_accessor> -revoke
```

**Scheduler rotation hebdomadaire:**
```bash
# crontab -e
0 3 * * 0 /opt/scripts/rotate-secret-id.sh  # Tous les dimanches 3h
```

#### 4. Token auto-renewal
```python
# app/vault_client.py (ajout)
import threading
import time

def auto_renew_token():
    """Background thread pour renouveler token avant expiration"""
    while True:
        try:
            # Renouveler 5 min avant expiration
            ttl = client.auth.token.lookup_self()["data"]["ttl"]
            sleep_time = max(ttl - 300, 60)  # Min 60s entre checks
            
            time.sleep(sleep_time)
            
            client.auth.token.renew_self()
            logger.info("Vault token renewed successfully")
        except Exception as e:
            logger.error(f"Token renewal failed: {e}")
            time.sleep(60)  # Retry après 1 min

# Lancer thread au startup
renewal_thread = threading.Thread(target=auto_renew_token, daemon=True)
renewal_thread.start()
```

#### 5. Audit logging
```bash
# Activer audit file backend
vault audit enable file file_path=/vault/logs/audit.log

# Activer audit syslog (en complément)
vault audit enable syslog tag="vault" facility="LOCAL7"
```

**Exemple entrée audit log:**
```json
{
  "time": "2026-01-07T10:23:45Z",
  "type": "response",
  "auth": {
    "client_token": "hmac-sha256:...",
    "accessor": "hmac-sha256:...",
    "display_name": "approle",
    "policies": ["app-policy", "default"]
  },
  "request": {
    "operation": "read",
    "path": "secret/data/app/config"
  },
  "response": {
    "data": {
      "database_url": "hmac-sha256:..."  # Valeurs sensibles hashées
    }
  }
}
```

### Checklist production Vault

- [ ] **HA Cluster:** 3+ nœuds Vault avec Raft storage
- [ ] **TLS:** Certificats CA signés pour tous nœuds
- [ ] **mTLS:** Client certificates pour app → Vault
- [ ] **Persistence:** Storage backend persistant (Raft, Consul, ou cloud KMS)
- [ ] **Init & Unseal:** Procédure sécurisée avec Shamir shares distribués
- [ ] **SECRET_ID Rotation:** Cron job hebdomadaire automatisé
- [ ] **Token Renewal:** Background thread dans app
- [ ] **Audit Logging:** File + syslog pour conformité
- [ ] **Backup:** Snapshots réguliers de Raft storage
- [ ] **Monitoring:** Prometheus metrics + alerting sur auth failures

### Références
- [Vault Production Hardening](https://developer.hashicorp.com/vault/tutorials/operations/production-hardening)
- [Vault HA with Raft](https://developer.hashicorp.com/vault/tutorials/raft)
- [VAULT_APPROLE_SETUP.md](./VAULT_APPROLE_SETUP.md) section "Production Roadmap"

---

## Résumé État Actuel

| Étape | Status | Backend | Frontend | Tests | Notes |
|-------|--------|---------|----------|-------|-------|
| 1. Rate Limiting | ✅ | ✅ | N/A | ✅ | 5 req/min sur auth endpoints |
| 2. JWT Sessions | ✅ | ✅ | ✅ | ✅ | Tokens sessionStorage; auto-refresh 401 |
| 3. Security Headers | ✅ | ✅ | N/A | ✅ | CSP à durcir après frontend |
| 4. Docker Hardening | ✅ | ✅ | N/A | ✅ | Multi-stage, non-root; à améliorer |
| 5. Vault Production | ⏳ | ⏳ | N/A | N/A | Dev mode OK; prod setup à venir |

---

## 🔐 Annexe: Vault AppRole & Secret Management

### Statut: ✅ Implémenté & Vérifié

#### Architecture

1. **AppRole**: Authentification application vers Vault via `VAULT_ROLE_ID` et `VAULT_SECRET_ID` (least-privilege)
2. **Database URL**: Centralisé dans Vault KV à `secret/app/config` clé `database_url`; récupéré au démarrage avec fallback env
3. **Token Lifecycle**: AppRole génère tokens auto-renouvelables; dev mode TTL 1h (configurable)

#### Setup & Initialisation

Lancer une seule fois pour configurer Vault:
```bash
./scripts/init-vault.sh
```

Ce script:
- ✅ Active KV v2, TOTP, et Database secrets engines
- ✅ Crée policy minimaliste (lecture KV, gestion clés TOTP)
- ✅ Active AppRole auth method
- ✅ Crée rôle `uyoop-app` avec policy
- ✅ Génère ROLE_ID et SECRET_ID
- ✅ Écrit `.env.vault` avec credentials
- ✅ Stocke DATABASE_URL dans `secret/app/config`

#### Fichiers Modifiés

**docker-compose.yml**
- Supprimé: `VAULT_TOKEN` et DATABASE_URL plaintext
- Ajouté: `env_file: .env.vault` pour injecter credentials AppRole

**app/vault_client.py**
- Ajouté: Authentification AppRole avec fallback token
- Features: Vérification `is_authenticated()`; KV read/write/delete; TOTP key/code management
- Logging: Messages info/erreur pour diagnostic démarrage

**app/database.py**
- Ajouté: Fonction `resolve_database_url()`
- Priorité:
  1. Variable environnement (override dev)
  2. Secret Vault KV (production par défaut)
  3. Default local hardcoded (fallback)
- Sécurité: Fallback silencieux si Vault indisponible; utilise default

**scripts/init-vault.sh**
- Nouveau: Script complet provisioning Vault
- Idempotent: Safe à re-lancer; utilise `||` pour engines déjà activés
- Output: Génère `.env.vault` avec ROLE_ID et SECRET_ID

#### Vérification

**1. AppRole Authentication**
```bash
docker exec devops_calendar_app python3 -c "
from app.vault_client import vault_client
print('Authenticated:', vault_client.is_authenticated())
"
# ✅ Output: Authenticated: True
```

**2. Database URL Resolution**
```bash
docker exec devops_calendar_app python3 -c "
from app.database import resolve_database_url
print('DB URL:', resolve_database_url()[:80])
"
# ✅ Output: DB URL: postgresql://devops_calendar:devops_calendar@postgres:5432/...
```

**3. TOTP Workflow**
```bash
docker exec devops_calendar_app python3 -c "
from app.vault_client import vault_client
key = vault_client.totp_create_key('test', 'issuer', 'user')
code = vault_client.totp_generate_code('test')
valid = vault_client.totp_validate_code('test', code)
vault_client.totp_delete_key('test')
print(f'TOTP workflow: {valid}')
"
# ✅ Output: TOTP workflow: True
```

**4. App Connectivity**
```bash
curl http://localhost:8000/users
# ✅ Output: [{"username":"cjuyoop","role":"ADMIN","id":1,"totp_enabled":false}]
```

#### Posture Sécurité

**Actuel (Implémenté)**
- ✅ **AppRole**: Auth least-privilege; aucun root token exposé
- ✅ **KV v2**: Secrets centralisés (DATABASE_URL); versionnés
- ✅ **TOTP Engine**: Vault-natif 2FA; validation codes côté serveur
- ✅ **Policy Scoping**: app-policy limite chemins et capacités
- ✅ **Fallback**: Env var et defaults hardcoded pour dev local

**Prochaines étapes (Recommandées)**
- 🔄 **AppRole Secret Rotation**: Implémenter rotation SECRET_ID (actuellement statique dans .env.vault)
- 🔄 **TLS/mTLS**: Activer TLS Vault production; auth mTLS app
- 🔄 **Token Renewal**: Auto-renew tokens AppRole avant expiry
- 🔄 **Audit Logging**: Activer backend audit Vault pour conformité
- 🔄 **Dynamic Secrets**: Credentials database dynamiques (futur)

#### Configuration

**Environment Variables** (définis dans `.env.vault`):
```env
VAULT_ROLE_ID=<role-id>
VAULT_SECRET_ID=<secret-id>
VAULT_ADDR=http://vault:8200  # Dans docker-compose.yml
```

**Vault Paths**
- **KV**: `secret/app/config` → `database_url`
- **TOTP**: `totp/keys/user_<id>` (create/read/update/delete)
- **TOTP Verify**: `totp/code/user_<id>` (read/update)

**Policy (app-policy)**
```hcl
path "secret/data/app/*" {
  capabilities = ["read", "list"]
}

path "totp/keys/*" {
  capabilities = ["create", "read", "update", "delete", "list"]
}

path "totp/code/*" {
  capabilities = ["read", "update"]
}
```

#### Dépannage

**Issue: `is_authenticated() = False`**
- Vérifier VAULT_ROLE_ID et VAULT_SECRET_ID dans `.env.vault`
- Vérifier Vault running: `curl http://localhost:8200/v1/sys/health`
- Re-lancer init script: `./scripts/init-vault.sh`

**Issue: DATABASE_URL non récupéré depuis Vault**
- Vérifier secret KV existe: `vault kv get secret/app/config`
- Vérifier logs app: `docker logs devops_calendar_app`
- Fallback env var est actif (vérifier app connectivity)

**Issue: Création clé TOTP échoue**
- Confirmer TOTP engine activé: `vault secrets list | grep totp`
- Vérifier policy: `vault policy read app-policy`
- Tester manuellement: `vault write totp/keys/test issuer=test account_name=test generate=true`

#### Dev vs. Production

**Development (Actuel)**
- Vault: dev mode (in-memory, no persistence)
- Auth: AppRole (dev-friendly; no mTLS required)
- Init: Une seule fois `./scripts/init-vault.sh`
- VAULT_TOKEN: Non utilisé (AppRole seulement)

**Production (Recommandé)**
- Vault: HA cluster avec persistence
- Auth: AppRole + mTLS ou JWT
- Init: Terraform/Ansible pour idempotency
- Rotation: Rotation SECRET_ID hebdomadaire; renewal hooks tokens

---

## Annexe: JWT Frontend Migration Details

### Statut: ✅ Complétée 2026-01-07

#### Architecture Frontend

**TokenManager Class** (sessionStorage-based)
```javascript
class TokenManager {
  constructor() {
    this.accessToken = sessionStorage.getItem('access_token');
    this.refreshToken = sessionStorage.getItem('refresh_token');
  }

  setTokens(accessToken, refreshToken) {
    this.accessToken = accessToken;
    this.refreshToken = refreshToken;
    sessionStorage.setItem('access_token', accessToken);
    sessionStorage.setItem('refresh_token', refreshToken);
  }

  clearTokens() {
    this.accessToken = null;
    this.refreshToken = null;
    sessionStorage.removeItem('access_token');
    sessionStorage.removeItem('refresh_token');
  }

  getAuthHeader() {
    if (!this.accessToken) return {};
    return { 'Authorization': `Bearer ${this.accessToken}` };
  }

  async refreshAccessToken() {
    // Refresh logic avec auto-retry sur 401
  }

  isTokenExpired() {
    // Décoder JWT et vérifier exp claim
  }
}
```

**apiFetch() Wrapper**
```javascript
async function apiFetch(url, options = {}) {
  let headers = options.headers || {};

  // Ajouter Authorization header
  if (tokenManager.accessToken) {
    headers = { ...headers, ...tokenManager.getAuthHeader() };
  }

  // Refresh si token expiré
  if (tokenManager.isTokenExpired() && tokenManager.refreshToken) {
    try {
      await tokenManager.refreshAccessToken();
      headers = { ...headers, ...tokenManager.getAuthHeader() };
    } catch (err) {
      console.warn('Token refresh failed:', err);
    }
  }

  let res = await fetch(url, { ...options, headers });

  // Si 401, retry après refresh
  if (res.status === 401 && tokenManager.refreshToken) {
    try {
      await tokenManager.refreshAccessToken();
      headers = { ...headers, ...tokenManager.getAuthHeader() };
      res = await fetch(url, { ...options, headers });
    } catch (err) {
      console.error('Failed to refresh token:', err);
    }
  }

  return res;
}
```

#### Changements API Calls

**Avant:**
```javascript
const res = await fetch('/events', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json', 'X-User-Id': uid },
  body: JSON.stringify(body)
});
```

**Après:**
```javascript
const res = await apiFetch('/events', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(body)
});
```

#### Login/Logout Flow

**Login**
```javascript
// POST /login retourne { access_token, refresh_token, user }
const data = await res.json();
tokenManager.setTokens(data.access_token, data.refresh_token);  // sessionStorage
localStorage.setItem('currentUser', JSON.stringify(data.user));    // persist user info
```

**Logout**
```javascript
tokenManager.clearTokens();        // sessionStorage cleared
localStorage.removeItem('currentUser');  // user info cleared
```

#### Améliorations Appliquées

✅ **SessionStorage vs. LocalStorage:**
- SessionStorage: Tokens détruits à fermeture onglet (sécurité XSS)
- LocalStorage: Persiste user info (non-sensible)

✅ **Auto-refresh sur 401:**
- Détecte expiration proactive (avant 401)
- Retry automatique après refresh si 401 reçu
- Fallback login si refresh échoue

✅ **Suppression X-User-Id:**
- Tous appels API migrés vers Authorization header
- Backend ignore désormais X-User-Id (maintient compatibilité temporaire)

✅ **Validation Token:**
- Décode JWT côté client (sans vérification signature)
- Détecte expiration avant envoi requête
- Affiche user info depuis localStorage (non-sensible)

#### Tests Validés

✅ **Login & Token Storage**
- `POST /login` → tokens stockés sessionStorage
- Refresh page → tokens toujours disponibles (sessionStorage persiste)
- Fermer onglet → tokens supprimés (sessionStorage cleared)

✅ **Auto-refresh**
- Attendre expiration token (~30min)
- Requête API → auto-refresh avant 401
- Requête réussit sans user interaction

✅ **Logout**
- Click logout → tokens cleared + user info cleared
- Redirection login modal

✅ **Backward Compatibility**
- Backend accepte Authorization header
- Fallback X-User-Id deprecié mais fonctionnel

#### Prochaines Actions

- [ ] Retirer X-User-Id support backend (une fois frontend stable)
- [ ] Implémenter refresh token rotation (issuer nouveau refresh à chaque appel)
- [ ] CSP hardening (externaliser scripts inline)

---

## Prochaines Actions

### Priorité immédiate
1. **Frontend JWT Migration**
   - Implémenter stockage tokens sessionStorage
   - Ajouter `Authorization: Bearer` sur toutes requêtes
   - Implémenter refresh automatique sur 401
   - Retirer `X-User-Id` après validation

### Court terme
2. **CSP Hardening**
   - Externaliser scripts inline
   - Retirer `unsafe-inline` et `unsafe-eval`
   - Tester compatibilité FullCalendar/Chart.js

3. **Docker Advanced Hardening**
   - Read-only filesystem avec tmpfs
   - Drop all capabilities
   - Health checks endpoint + docker-compose

### Moyen terme
4. **Vault Production Setup**
   - Déployer cluster HA 3 nœuds
   - Configurer TLS/mTLS
   - Automatiser SECRET_ID rotation
   - Activer audit logging

---

**Dernière mise à jour:** 2026-01-07  
**Responsable:** Équipe DevOps  
**Référence:** [IMPLEMENTATION_SUMMARY.md](./IMPLEMENTATION_SUMMARY.md) pour détails techniques complets
