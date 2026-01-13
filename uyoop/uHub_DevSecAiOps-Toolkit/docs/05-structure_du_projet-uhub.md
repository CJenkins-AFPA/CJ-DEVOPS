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

92:       secrets_service.py
93:       execution_backends/
94:         __init__.py
95:         base.py
96:         local.py
97:         docker.py
98:         webhook.py
99:     core/
      logging.py
      rbac.py
      exceptions.py
    tests/
      ...

99:   pyproject.toml / requirements.txt
100:   seeds/
101:     users.json
102:     projects-with-jobs.json
103:     seed_demo.py
104: 
105: models/ : modèles ORM (SQLAlchemy/SQLModel) alignés sur 02-domain-model.md.

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

133:         CalendarView.vue
134:         JobEventModal.vue
135:       commands/
136:         CommandPalette.vue
137:       jobs/
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

151:     styles/
152:       theme.css (dark, verts uHub)
153:       gradients.css (blurry gradients)
154:       components.css
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
