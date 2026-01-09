# 05 – Structure du projet uHub

Ce document décrit l’arborescence cible du repo uHub pour faciliter le travail des humains et des IA de code (Copilot, Gemini, etc.).

## 1. Racine du repo

```text
uhub/
  docs/
  backend/
  frontend/
  infra/
  .env.example
  docker-compose.yml (optionnel v1)
  README.md
  LICENSE
docs/ : tous les fichiers de spécification (01‑vision, 02‑domain-model, 03‑rbac-and-workflows, 04‑architecture-v1, etc.).

backend/ : code FastAPI + PostgreSQL.

frontend/ : SPA ou front HTML/JS (Vue/React/Svelte ou FullCalendar + JS).

infra/ : scripts d’infra (Docker Compose, manifests K8s, Terraform/Ansible pour déployer uHub).

2. Backend – structure
text
backend/
  app/
    __init__.py
    main.py
    config.py
    db.py
    security.py
    deps.py
    models/
      __init__.py
      user.py
      project.py
      job.py
      run.py
      event.py
      incident.py
      git.py
      ansible.py
      terraform.py
      cluster.py
      audit.py
      inventory.py
    schemas/
      __init__.py
      auth.py
      user.py
      project.py
      job.py
      run.py
      event.py
      incident.py
      git.py
      ansible.py
      terraform.py
      cluster.py
      audit.py
      inventory.py
    routers/
      __init__.py
      auth.py
      users.py
      projects.py
      jobs.py
      runs.py
      calendar.py
      incidents.py
      git_integration.py
      ansible_integration.py
      terraform_integration.py
      k8s_integration.py
      admin.py
    services/
      __init__.py
      auth_service.py
      user_service.py
      project_service.py
      job_service.py
      run_service.py
      incident_service.py
      git_service.py
      ansible_service.py
      terraform_service.py
      k8s_service.py
      server_status_service.py
      audit_service.py
      secrets_service.py
    core/
      logging.py
      rbac.py
      exceptions.py
    tests/
      ...
  pyproject.toml / requirements.txt
models/ : modèles ORM (SQLAlchemy/SQLModel) alignés sur 02-domain-model.md.

schemas/ : schémas Pydantic d’entrée/sortie (UserCreate, JobCreate, Incident, etc.).

routers/ : routes FastAPI, mappées sur les endpoints de 04-architecture-v1.md.

services/ : logique métier (utilisé par les routers, pas d’ORM dans les routes).

core/security.py / core/rbac.py : JWT, helpers de rôles, exceptions standardisées.

3. Frontend – structure (ex. Vue ou React)
Exemple générique (à adapter à ton framework préféré) :

text
frontend/
  src/
    main.(ts|js)
    router.(ts|js)
    store/
    components/
      layout/
        AppShell.vue
        Sidebar.vue
        Topbar.vue
      auth/
        LoginModal.vue
      dashboard/
        Home.vue
      projects/
        ProjectList.vue
        ProjectDetail.vue
        ProjectEnvironments.vue
      calendar/
        CalendarView.vue
        JobEventModal.vue
      jobs/
        JobList.vue
        JobDetail.vue
      incidents/
        IncidentList.vue
        IncidentDetail.vue
        PostMortemEditor.vue
      ansible/
        InventoryUpload.vue
        InventoryViewer.vue
      git/
        RepoList.vue
        GitChangesList.vue
      admin/
        UserAdmin.vue
        ServerStatus.vue
    styles/
      theme.css (dark theme #000 / #fff / #00ff00)
      components.css
    assets/
      logo-uhub.svg
  package.json
  vite.config.(ts|js) ou équivalent
Principes UX :

Layout commun : barre latérale (Calendrier, Projets, Jobs, Ansible, Git, Admin) + topbar (user connecté, thème).

Pages centrées sur les workflows :

Accueil → modale de login, vue “qu’est-ce que uHub ?”.

Calendrier → CalendarView + JobEventModal.

Projets → ProjectList / ProjectDetail (backlog, jalons, environnements).

Incidents → IncidentList / IncidentDetail / PostMortemEditor.

Admin → UserAdmin, ServerStatus.

4. Infra – déploiement
text
infra/
  docker/
    backend.Dockerfile
    frontend.Dockerfile
    nginx.Dockerfile (optionnel, reverse proxy)
  k8s/
    deployment-backend.yaml
    deployment-frontend.yaml
    service-backend.yaml
    service-frontend.yaml
    ingress.yaml
    configmap.yaml
    secret.yaml
  ansible/
    playbook_deploy_uhub.yaml
  terraform/
    main.tf (optionnel v1 pour provisionner l’infra cible)
backend.Dockerfile : image Python hardened, user non‑root, port exposé, healthcheck.

frontend.Dockerfile : build SPA puis serveur statique (nginx ou équivalent).

nginx.Dockerfile : reverse proxy pour agréger API + front si besoin.

05 – Sécurité, Vault & bonnes pratiques
Ce document résume les exigences de sécurité de uHub v0.

0. Secrets & Vault
Tous les secrets sensibles sont gérés via un service secrets_service qui :

lit les secrets depuis Vault,

les fournit aux services (Git, Ansible, Terraform, K7s) en mémoire seulement,

ne les log jamais.

Types de secrets :

JWT signing key,

credentials DB (PostgreSQL),

tokens GitHub/GitLab,

clés SSH,

Kubeconfig,

credentials vers d’autres APIs.

Design recommandé :

Variables d’environnement minimales (adresse Vault, token d’access initial).

Mapping interne logical_name → secret_path dans Vault (ex : git/uhub/project122/token).

Les modèles (GitRepo, Cluster) stockent uniquement une référence (vault_secret_ref), pas la valeur.

1. Auth & RBAC
Authentification via OAuth1 + JWT :

JWT signé, expirations courtes, rotation possible.

Option future : refresh tokens + SSO (OIDC).

RBAC conforme à 02-rbac-and-workflows.md :

rôles : admin, projets, dev, ops,

helpers côté backend pour vérifier les rôles avant chaque action sensible.

2. Transport & exposition
Toutes les communications vers uHub doivent passer en HTTPS (TLS).

En production :

reverse proxy (nginx, traefik ou autre) devant le backend,

headers de sécurité (HSTS, X‑Frame‑Options, etc.).

Front et backend peuvent être derrière un même domaine (ex. uhub.uyoop.fr) avec des chemins séparés (/api pour l’API).

3. Logging & audit
Logging applicatif structuré (JSON) pour faciliter la collecte (ELK, Loki, etc.).

AuditLog :

actions tracées : création/suppression de users, changements de rôles, exécutions de jobs, modifications d’incidents critiques, configurations d’intégrations.

accessible via un endpoint admin dédié.

4. Conteneurs & images
Images Docker basées sur :

Python slim / hardened pour le backend,

image de base minimale pour le frontend.

Règles :

user non‑root,

filesystem en lecture seule sauf pour dossiers de données désignés (/data/uploads, /var/log/uhub, etc.),

scans d’images intégrés dans la CI (Trivy, Grype, etc. à terme).

5. Hardening de l’application
Validation stricte des inputs (schémas Pydantic, constraints).

Limitation des opérations d’exécution (scripts/playbooks/apply) :

whitelists de scripts/paths,

pas d’exécution arbitraire donnée par l’utilisateur,

logs détaillés, temps maximum d’exécution, quotas.

Possibilité future d’introduire des approbations (ex : job prod doit être approuvé par un rôle Projets ou Admin avant exécution).