# Changelog — uYoop-Cal

Tous les changements notables du projet sont documentés dans ce fichier.

Format basé sur [Keep a Changelog](https://keepachangelog.com/fr/1.0.0/),
et ce projet adhère au [Semantic Versioning](https://semver.org/lang/fr/).

---

## [Non publié]

### À venir
- Correction 3 CVEs dépendances Python (ecdsa, python-jose, starlette)
- CI/CD GitHub Actions (build, tests, Trivy, SBOM)
- Déploiement K3s avec ArgoCD
- Audit log Vault activé
- Snapshots Raft automatisés (cron)
- Rotation SECRET_ID hebdomadaire (CronJob K8s)
- Runtime hardening (read_only, cap_drop, seccomp)

---

## [1.0.0] - 2026-01-08

### 🎉 Version Production-Ready

Premier release stable avec image durcie, Vault HA TLS et déploiement 1-commande.

### Ajouté
- **Image durcie (DHI)**: Base `dhi.io/python:3-debian13` distroless, CIS Level 2, 0 CVE OS
- **Build multi-stage**: Builder (debian13-dev) + Runtime (distroless nonroot)
- **Vault HA cluster**: 3 nodes Raft avec TLS end-to-end
- **Init container**: Automatisation init/unseal/join/AppRole/KV idempotent
- **Healthcheck app**: Endpoint `/health` + healthcheck interne Python (urllib)
- **Healthcheck Vault**: `curl --cacert` pour TLS dans compose
- **Certificats TLS**: CA + certs par node, montés en RO
- **Déploiement 1-commande**: `docker compose up -d` depuis état vierge
- **Documentation consolidée**: 4 fichiers (archi, security, runbook, changelog)
- **Cahier des charges**: `doc/projet.md` complet (19 KB)

### Modifié
- **docker-compose.yml**: Vault en HTTPS, app avec `VAULT_CACERT`, healthchecks adaptés
- **requirements.txt**: psycopg2-binary 2.9.11, pillow 12.1.0 (wheels cp314)
- **Dockerfile.hardened**: Stage runtime distroless, USER nonroot, wheels binaires uniquement
- **scripts/init-vault-ha.sh**: Support TLS (`--cacert`), génération `.env.vault` dans volume
- **README.md**: Sections Prérequis/Installation/Accès mises à jour (ports Vault HA, TLS)

### Sécurité
- Base OS 0 CVE ✅ (Debian 13 distroless)
- Runtime nonroot ✅ (UID 65532)
- Pas de shell en prod ✅ (defense-in-depth)
- TLS Vault obligatoire ✅ (healthchecks + app)
- Secrets hors compose ✅ (`.env.vault` généré, pas hardcodé)

### Performance
- Image runtime 70 MB (vs 180 MB legacy)
- Build via wheels binaires (pas de compilation runtime)
- Healthcheck 30s interval, 10s timeout

### Connu
- 3 CVE Python (ecdsa, python-jose, starlette) — correction prévue v1.1.0
- Frontend JWT migration incomplete (backend prêt)

---

## [0.9.0] - 2026-01-07

### Phase Sécurité Globale (5 étapes)

#### Ajouté
- **Rate limiting**: slowapi 5 req/min sur `/login` et `/2fa/*`
- **JWT backend**: Tokens access (30min) + refresh (7j), endpoint `/token/refresh`
- **Security headers**: HSTS, CSP durci (pas de `unsafe-inline`), X-Frame-Options, etc.
- **Docker hardening**: Multi-stage build, USER appuser (UID 1000), wheels optimisés
- **Scripts/styles externalisés**: `app.js` (1233 lignes), `style.css` (616 lignes)

#### Modifié
- **app/auth.py**: Ajout `create_access_token()`, `create_refresh_token()`, `verify_token()`
- **app/main.py**: Middleware security headers, limiter slowapi
- **app/schemas.py**: `LoginResponse` avec tokens JWT, `TokenResponse`, `RefreshTokenRequest`
- **Dockerfile**: Multi-stage (wheelhouse + runtime), USER appuser

#### Sécurité
- CSP sans `unsafe-inline` ✅
- Authentification JWT backend prête ✅
- Headers sécurité tous présents ✅
- Image Docker non-root ✅

---

## [0.8.0] - 2026-01-07

### Vault AppRole & TOTP 2FA

#### Ajouté
- **AppRole authentication**: Remplace dev root token, policy moindre privilège `app-policy`
- **DATABASE_URL dans Vault**: KV v2 à `secret/app/config`, résolution dynamique startup
- **2FA TOTP native Vault**: Génération clé, QR code, validation serveur, backup codes
- **Script init-vault.sh**: Idempotent, configure engines/policy/approle, génère `.env.vault`
- **vault_client.py**: Modules login AppRole, TOTP CRUD, KV get/put, fallback token
- **database.py**: Fonction `resolve_database_url()` avec fallbacks (env > Vault > hardcoded)

#### Endpoints
- `POST /2fa/setup`: Génère clé TOTP + QR code
- `POST /2fa/enable`: Active 2FA avec code validation
- `POST /2fa/verify`: Vérifie code TOTP au login
- `DELETE /2fa/disable`: Désactive 2FA (ADMIN ou self)

#### Sécurité
- Aucun secret plaintext docker-compose ✅
- Policies least-privilege Vault ✅
- Validation TOTP côté serveur ✅

---

## [0.7.0] - 2026-01-07

### Restructuration RBAC & Formulaires Multi-Étapes

#### Ajouté
- **4 rôles métier**: PROJET, DEV, OPS, ADMIN (remplace viewer/editor/admin)
- **Permissions RBAC**:
  - PROJET: tous types événements
  - DEV: git_action uniquement
  - OPS: deployment_window uniquement
  - ADMIN: tous pouvoirs + gestion membres
- **Formulaire 3 étapes**:
  - Étape 1: Infos base (titre, date/heure, type)
  - Étape 2: Champs spécifiques type (meeting/deployment/git_action)
  - Étape 3: Récapitulatif avant création
- **Filtrage types**: Modal affiche uniquement types autorisés par rôle
- **Stockage JSONB**: Champ `extra` pour métadonnées type-spécifiques

#### Modifié
- **models.py**: Enum `RoleType` (PROJET/DEV/OPS/ADMIN)
- **schemas.py**: `EventType`, `EventCreate` avec validation JSONB
- **main.py**: RBAC dans endpoints `/events` (POST), `/git_action` (ADMIN/DEV)
- **index.html**: Wizard multi-étapes avec indicateurs progression, filtres rôle

#### Tests
- Script `test_rbac.py`: 23 tests validation permissions (13 initiaux + 10 Phase 2)
- Tous tests PASS ✅

---

## [0.6.0] - 2025-12

### Interface Web & Dashboard

#### Ajouté
- **FullCalendar 6.1.x**: Vue mensuelle/hebdomadaire/journalière
- **Chart.js 4.x**: Dashboard avec graphiques (événements par type, tendances)
- **3 vues**: Calendrier, Tableau (filtrable), Dashboard (stats)
- **Onglet Membres**: Gestion utilisateurs (ADMIN uniquement)
- **Actions événements**: Éditer, Supprimer (créateur ou ADMIN)

#### Modifié
- **index.html**: Intégration FullCalendar, Chart.js, modals création/édition
- **main.py**: Endpoints `/users`, `/events` (CRUD complet)
- **style**: Dark theme (noir/vert néon), responsive

#### UX
- Hover effects sur cartes calendrier
- Tooltips IDs sur boutons action (debug)
- Filtres par type événement

---

## [0.5.0] - 2025-12

### Backend FastAPI + PostgreSQL

#### Ajouté
- **FastAPI 0.115**: Framework API REST
- **SQLAlchemy 2.0**: ORM avec support JSONB
- **PostgreSQL**: Base de données via Docker
- **Models**: `User`, `Event` avec relations
- **CRUD basique**: Création/lecture users et events

#### Endpoints
- `POST /login`: Créer/récupérer user
- `GET /events`: Liste événements
- `POST /events`: Créer événement
- `PUT /events/{id}`: Modifier événement
- `DELETE /events/{id}`: Supprimer événement

---

## [0.1.0] - 2025-12

### Prototype Initial

#### Ajouté
- Structure projet Docker Compose
- PostgreSQL 16 container
- FastAPI hello world
- README basique

---

## Types de Changements

- **Ajouté**: Nouvelles fonctionnalités
- **Modifié**: Changements dans fonctionnalités existantes
- **Déprécié**: Fonctionnalités bientôt retirées
- **Retiré**: Fonctionnalités supprimées
- **Corrigé**: Corrections de bugs
- **Sécurité**: Vulnérabilités corrigées

---

**Légende Versions:**
- **MAJOR** (1.x.x): Breaking changes, refonte architecture
- **MINOR** (x.1.x): Nouvelles fonctionnalités rétro-compatibles
- **PATCH** (x.x.1): Corrections bugs, améliorations mineures

**Maintenu par:** DevOps Team uYoop-Cal  
**Dernier update:** 8 janvier 2026
