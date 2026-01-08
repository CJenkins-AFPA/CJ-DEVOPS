# Instructions IA

> Mise à jour 2026-01-08 — Méthode IKEA‑PROOF & Documentation
- Recherche d’abord → plan validé → exécution idempotente → vérification → documentation. Aucun bricolage.
- Objectif d’exploitation: déploiement « 1 commande » reproductible; automatiser tous les prérequis (scripts/init, healthchecks).
- Politique docs: 3‑4 fichiers denses et tenus à jour; pas de prolifération. Proposition: 1) README (accueil/Runbook rapide), 2) Architecture & Implémentation (fusion `IMPLEMENTATION_SUMMARY` + DHI), 3) Sécurité (ce fichier `SECURITE_GLOBALE` renommé « Security »), 4) Ops/Runbook (déploiement, sauvegardes, rotation, observabilité). `action-history` pourra devenir un CHANGELOG sectionné.
- Contraintes runtime: image durcie (distroless, nonroot), dépendances en roues binaires uniquement, pas d’apt en runtime, Vault en TLS avec CA obligatoire.


## 1. Objet
- Capitaliser le contexte projet pour Copilot/IA via deux fichiers centraux : action-history.md (journal) et instructions-ia.md (règles).
- Assurer la continuité entre sessions en documentant décisions, périmètre et processus.

## 2. Portée actuelle du produit
- Backend FastAPI + PostgreSQL (Docker) pour gestion d'événements (FullCalendar).
- Frontend FullCalendar + Chart.js (dashboard) + formulaire multi-étapes.
- RBAC en 4 rôles : PROJET (tous événements), DEV (git_action), OPS (deployment_window), ADMIN (tout).
- Métadonnées événement en JSONB extra (meeting/deployment/git_action spécifiques).

## 2bis. Fichiers clés à connaître
- Backend: app/main.py (routes), app/models.py (ORM), app/schemas.py (Pydantic), app/crud.py (données), app/database.py (session), app/vault_client.py (Vault AppRole/TOTP/KV), app/auth.py (JWT tokens).
- Frontend: app/static/index.html (FullCalendar, Chart.js, formulaire multi-étapes), app/static/assets éventuels.
- Infra: docker-compose.yml, Dockerfile (multi-stage), requirements.txt, scripts/init-vault.sh (provisioning Vault).
- Contexte: action-history.md (journal), instructions-ia.md (ces règles), README.md (documentation utilisateur).
- Sécurité: VAULT_APPROLE_SETUP.md (setup Vault AppRole), SECURITE_GLOBALE.md (plan 5 étapes), IMPLEMENTATION_SUMMARY.md (détails techniques).
- Tests: test_rbac.py (validation RBAC automatisée, 23 tests).

## 3. Architecture technique
- Infra: Docker compose v2, services app (FastAPI) port 8000, db PostgreSQL port 5433, vault port 8200, volume projet monté sur /app.
- Backend: FastAPI + SQLAlchemy (JSONB pour extra), endpoints REST (/login, /events, /git_action, /2fa/*), rate limiting slowapi.
- Frontend: FullCalendar 6.1.x + Chart.js 4.x, assets dans app/static, page principale index.html.
- Auth: Vault AppRole + bcrypt passwords + TOTP 2FA + JWT tokens (backend prêt, frontend migration en cours).
- Secrets: DATABASE_URL dans Vault KV v2 (secret/app/config), TOTP keys dans Vault native engine.
- Sécurité: Rate limiting (5 req/min sur auth), security headers (HSTS/CSP/X-Frame-Options), Docker non-root multi-stage.

## 4. Modèle de données (principal)
- User: id, username, role (PROJET/DEV/OPS/ADMIN).
- Event: id, title, start, end, type (meeting/deployment_window/git_action), extra (JSONB), created_by.
- Extra JSONB: meeting{subtype,link,notes}, deployment_window{environment,services,needs_approval}, git_action{repo_url,branch,action,auto_trigger}.

## 5. Règles RBAC détaillées
- ADMIN: créer/éditer/supprimer tout; accès git_action; peut modifier/supprimer tous les events.
- PROJET: peut créer tous les types; peut modifier/supprimer ses propres events; pas d'accès admin-only.
- DEV: peut créer git_action uniquement; accès /git_action; pas de meeting/deployment.
- OPS: peut créer deployment_window uniquement; pas de meeting/git_action.
- Edition/suppression: créateur ou ADMIN; refus clair si non autorisé.

## 6. UX et comportements clés
- Modal de création en 3 étapes avec indicateurs de progression; validation à chaque étape.
- Filtrage des types visibles selon rôle avant ouverture du modal et lors du change de select.
- Champs spécifiques affichés/masqués selon type choisi; extra JSONB construit à l'enregistrement.
- UI rôle → labels FR: PROJET=Chef de projet, DEV=Développeur, OPS=Ops/SysAdmin, ADMIN=Administrateur.
- Les champs extra doivent être transmis côté backend dans extra JSONB selon le type.

## 7. Endpoints et attentes
- POST /login: crée/retourne user (username, role). Roles autorisés: PROJET/DEV/OPS/ADMIN.
- CRUD /events: appliquer RBAC ci-dessus; répondre 403 si type non autorisé par rôle.
- POST /git_action: réservé ADMIN/DEV; exécute action git (chemin dans conteneur app).
- Erreurs: messages explicites (ex: "DEV role can only create git_action events").

## 8. Tests et fixtures actuels
- Utilisateurs de test: admin_test (ADMIN ID=2), dev_test (DEV ID=3), ops_test (OPS ID=4), projet_test (PROJET ID=5).
- Script test_rbac.py: validation automatisée (13/13 PASS) des permissions création/édition/suppression + persistance JSONB.
- Cas validés: DEV bloqué meeting/deployment (403), OK git_action; OPS bloqué meeting/git_action (403), OK deployment; PROJET OK tous types; ADMIN OK tout.
- Permissions édition/suppression validées: créateur ou ADMIN uniquement.

## 9. Opérations courantes
- Démarrer: docker compose up -d, vérifier santé db, app sur 8000.
- Vérifier: curl /login et /events; docker compose ps pour statut.
- Logs: docker compose logs app|db pour diagnostiquer; privilégier messages backend.
- Users de test pour reprise rapide: admin_test (ADMIN), dev_test (DEV), ops_test (OPS), projet_test (PROJET). Passer X-User-ID retourné par /login.

## 10. Documentation vivante
- action-history.md: journal chronologique des actions (date, action, impact). Append-only.
- instructions-ia.md: règles, périmètre, décisions, processus de travail; mettre à jour dès qu'un process change.
- README.md: documentation utilisateur, démarrage rapide, API endpoints, structure projet.
- VAULT_APPROLE_SETUP.md: guide setup Vault AppRole, troubleshooting, production roadmap.
- SECURITE_GLOBALE.md: plan 5 étapes sécurité (rate limiting, JWT, headers, Docker, Vault prod) avec implémentation détaillée.
- IMPLEMENTATION_SUMMARY.md: résumé technique complet implémentations (JWT, 2FA, AppRole, tests validation).
- Style: puces courtes, ASCII, concis; conserver la clarté pour reprise rapide.
- INTERDIT: créer des fichiers de documentation supplémentaires (ETAT_*, TESTS_*, rapports) sans validation explicite.

## 11. Processus de travail avec IA
- **RÈGLE ABSOLUE**: L'IA PROPOSE, l'utilisateur VALIDE. Pas d'action sans validation explicite.
- **Interdiction formelle**: créer des fichiers non demandés (rapports, états, guides détaillés, scripts de test).
- **Fichiers autorisés**: action-history.md, instructions-ia.md, README.md, fichiers projet (app/, docker-compose.yml, etc.).
- **Exception**: test_rbac.py validé pour validation RBAC automatisée.
- **Principe**: concision et centralisation > prolifération de fichiers. L'utilisateur contrôle les opérations.

## 12. Contributions / changements
- Avant modification: lire action-history.md et instructions-ia.md pour contexte.
- Après modification notable: ajouter une entrée dans action-history.md et, si besoin, ajuster la section pertinente ici.
- Ne pas écraser l'existant; append et préciser les évolutions.
- TOUJOURS proposer le plan d'action et attendre validation avant exécution.

## 13. Dépannage rapide
- Module introuvable: vérifier volume ./:/app et COPY . . dans Dockerfile.
- 404/403 sur events: contrôler rôle courant et type demandé; vérifier header X-User-ID.
- Erreurs delete: s'assurer que l'ID est valide et que l'utilisateur est créateur ou ADMIN.
- Frontend: si types non filtrés, vérifier mapping rôle → options dans index.html.
- User role en minuscules: UPDATE users SET role = UPPER(role) dans PostgreSQL.

## 14. Exigences de sécurité professionnelle (CRITIQUE)

**uyoop-cal est une application de niveau professionnel destinée à des environnements de production sécurisés.**
Aucune concession sur la sécurité n'est acceptable. Les développeurs y connecteront leurs GitLab, les Ops l'intégreront dans leurs environnements de test et production.

### 14.1. Authentification & Contrôle d'accès
- ✅ Authentification par mot de passe avec bcrypt (passlib 1.7.4 + bcrypt 4.0.1)
- ✅ **2FA obligatoire** (TOTP via Vault native engine, QR code setup, validation serveur, backup codes)
- ✅ Rate limiting sur endpoints auth (/login, /2fa/*) - slowapi 5 req/min par IP
- ✅ Sessions JWT avec access (30min) et refresh (7j) tokens - backend prêt, frontend en migration
- 📋 Politique mots de passe forte (longueur min, complexité, expiration)
- 📋 OAuth2/OIDC pour intégration GitLab (pas de stockage credentials)

### 14.2. Infrastructure & Container Security
- ✅ **Image Docker durcie** :
  - ✅ Multi-stage build (séparation build/runtime)
  - ✅ USER non-root dans conteneur (appuser UID 1000)
  - 📋 Scan vulnérabilités automatisé (Trivy, Snyk, Clair)
  - 📋 Read-only filesystem avec tmpfs /tmp
  - 📋 Drop capabilities (--cap-drop=ALL)
- 📋 Network policies (isolation services)
- 📋 Resource limits (CPU/RAM) + healthchecks robustes

### 14.3. Secrets Management
- ✅ **Vault pour secrets** (HashiCorp Vault dev mode, AppRole auth)
- ✅ DATABASE_URL dans Vault KV v2 (secret/app/config)
- ✅ TOTP keys gérées par Vault native engine
- ✅ Pas de secrets plaintext dans docker-compose.yml
- ⏳ Vault production HA avec TLS/mTLS (roadmap)
- 📋 Rotation automatique credentials database
- 📋 Chiffrement secrets au repos et en transit
- 📋 Tokens GitLab/GitHub stockés chiffrés dans vault
- 📋 Clés SSH git_action gérées par vault (short-lived certificates)

### 14.4. Intégrations Externes Sécurisées
- 📋 **GitLab OAuth2** (pas de tokens personnels stockés)
- 📋 Webhooks signés (HMAC validation)
- 📋 Validation stricte payloads entrants (prévention injection)
- 📋 Rate limiting par IP sur webhooks
- 📋 Whitelist IPs GitLab/GitHub pour webhooks

### 14.5. Audit & Compliance
- 📋 Logs audit complets (qui/quoi/quand/comment)
- 📋 Logs centralisés (ELK, Splunk, Datadog)
- 📋 Alertes événements sensibles (échec auth, changements config)
- 📋 Conformité RGPD (données personnelles, droit à l'oubli)
- 📋 Backup chiffrés automatisés avec tests restore

### 14.6. Sécurité Applicative
- ✅ Input validation stricte (Pydantic schemas)
- ✅ Security headers (HSTS, CSP, X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Permissions-Policy)
- ⏳ CSP restrictive (retirer unsafe-inline/unsafe-eval après migration frontend)
- 📋 HTTPS obligatoire (TLS 1.3 minimum)
- 📋 Dependency scanning (Dependabot, Renovate)

### 14.7. Git Actions Security
- 📋 Sandboxing exécution git_action (conteneurs éphémères isolés)
- 📋 Validation commandes git (whitelist, pas d'injection shell)
- 📋 Audit trail complet des actions git exécutées
- 📋 Timeout et resource limits sur exécutions

## 15. Roadmap détaillée (priorisée)

### Phase 2 : Authentification & Sécurité (PRIORITÉ 1 - ✅ BACKEND COMPLET, 🔄 FRONTEND EN COURS)
- ✅ **Authentification par mot de passe** : password_hash dans User, vérification bcrypt (passlib 1.7.4 + bcrypt 4.0.1)
- ✅ **2FA avec TOTP** : intégration Vault TOTP engine, QR code setup, validation codes 6 chiffres, backup codes
- ✅ **Secrets vault** : AppRole auth, DATABASE_URL dans KV v2, policies scoped, init script idempotent
- 🔄 **Phase 2b - Durcissement Sécurité (5 étapes - 3/5 terminées)** :
  1. ✅ **Rate Limiting** : slowapi sur /login et /2fa/* (5 req/min par IP)
  2. 🔄 **JWT Sessions** : Backend terminé (access 30min, refresh 7j), frontend migration en cours
  3. ✅ **Security Headers** : HSTS, CSP (à durcir), X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Permissions-Policy
  4. ✅ **Docker Hardening** : multi-stage build, USER appuser non-root (UID 1000), optimisation wheels
  5. ⏳ **Vault Production** : Dev mode OK; roadmap HA cluster, TLS/mTLS, SECRET_ID rotation, token renewal
- 📋 Workflow d'approbation pour deployment_window (prod) avec validation ADMIN obligatoire

**Détails:** Voir [SECURITE_GLOBALE.md](./SECURITE_GLOBALE.md) et [IMPLEMENTATION_SUMMARY.md](./IMPLEMENTATION_SUMMARY.md)

### Phase 3 : Fonctionnalités Collaboratives (PRIORITÉ 2)
- Système de commentaires sur événements (thread de discussion)
- Notifications email/webhook avant fenêtres de déploiement
- Mentions @user dans commentaires
- Historique audit détaillé (qui a fait quoi, quand)

### Phase 4 : Métriques & DevOps (PRIORITÉ 3)
- **Métriques DORA** dans dashboard :
  - Deployment Frequency (nb deployments/semaine)
  - Lead Time for Changes (temps commit → déploiement)
  - Change Failure Rate (% déploiements échoués)
  - Time to Restore Service (durée rollback)
- Statuts deployment : planned → in-progress → completed/failed
- Graphiques tendances mensuelles

### Phase 5 : Gestion Agile (PRIORITÉ 4)
- Gestion sprints (2 semaines) avec planning automatique
- Vue Burndown chart des tâches/meetings
- Lien vers backlog Jira/GitHub Issues
- Templates rétrospectives automatiques
- Templates événements récurrents (daily, maintenance windows)
- Import/export iCal

### Phase 6 : Intégrations CI/CD (PRIORITÉ 5)
- Webhooks entrants : créer deployment_window auto sur merge vers main
- Webhooks sortants : notification Slack/Teams/email
- Déclencher pipeline Jenkins/GitLab CI depuis git_action
- Statut temps réel (pipeline en cours → icône calendrier)
- Logs CI/CD dans interface

### Phase 7 : UX Avancée (OPTIONNEL)
- Vue Kanban (To Plan → Planned → In Progress → Done)
- Équipes (DEV-Frontend, OPS-Cloud, etc.)
- Visibilité par équipe
- Délégation permissions temporaires
- Checklists pré-déploiement & rollback plans

### Quick Wins Suggérés
- Améliorer deployment_window : checklist pré-deploy, rollback plan, statuts
- Logs temps réel dans interface pour git_actions
- Templates récurrents (grande valeur, effort moyen)

## 16. Rappels de style
- ASCII uniquement; français concis; termes techniques anglais permis.
- Chemins relatifs au repo pour toute référence de fichier.
