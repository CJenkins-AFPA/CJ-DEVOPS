# 04 – Architecture v1 de uHub

Ce document décrit l’architecture technique de la v1 de **uHub_DevSecAiOps-Toolkit** : stack, modules, API principales et choix d’authentification/RBAC, alignés avec les bonnes pratiques DevSecOps et les portails développeurs modernes. 

---

## 1. Stack technique et principes

### 1.1 Stack

- **Backend** : Python + FastAPI.
- **Base de données** : PostgreSQL.
- **Front** :
  - v1 : SPA légère (ou front HTML/JS structuré) avec :
    - vue calendrier (FullCalendar ou équivalent) pour les Events,  
    - vues dédiées Projets, Jobs, Incidents, Ansible, Git, Administration. 
  - Docker, avec images **hardened** (DHI / Docker images sécurisées, user non‑root, rootfs en lecture seule, bonnes pratiques).
- **Sécurité des secrets** :
  - intégration de **Vault** dès la conception pour les secrets sensibles (tokens Git, clés SSH, Kubeconfig, etc.), jamais stockés en clair dans le code ou la base. 

### 1.2 Principes d’architecture

- **API d’abord** : toutes les fonctions principales passent par l’API (REST/JSON), le front n’est qu’un client de cette API. 
- **Domain‑driven** : modules alignés sur le domaine (users, projects, jobs, incidents, integrations).  
- **DevSecOps** :
  - RBAC strict (admin/projets/dev/ops).
  - audit des actions sensibles.  
  - préparation à scans d’images, tests de sécurité, etc.
- **IA‑ready** :
  - modèle de données structuré et horodaté,  
  - journaux d’exécution et incidents exploitables plus tard par des agents IA. 

---

## 2. Modules logiques backend

Découpage logique (packages FastAPI) :

- `auth` : OAuth2 + JWT, bootstrap admin, gestion du user courant. 
- `users` : CRUD utilisateurs, rôles, profils.
- `projects` : projets, environnements, liens vers repos/infra.
- `jobs` : jobs planifiés, liens vers scripts/inventaires/commits.
- `runs` : exécutions techniques des jobs, logs, statuts.
- `calendar` : projection des jobs et incidents en events (FullCalendar‑ready).
- `incidents` : incidents, timelines, post‑mortems.
- `integrations.git` : repos Git, changements liés aux jobs/incidents.
- `integrations.ansible` : inventories, scripts Ansible, analyse.
- `integrations.terraform` : plans Terraform, résumés.
- `integrations.k8s` : clusters, références Kubeconfig.
- `infrastructure` : vue serveur CPU/RAM/disk.
- `audit` : journalisation des actions (AuditLog).
- `secrets` : abstraction sur Vault (lecture de secrets à la demande, jamais exposition directe).

Chaque module expose ses routes sous un préfixe cohérent (`/auth`, `/users`, `/projects`, etc.) et utilise des schémas Pydantic pour les entrées/sorties.

---

## 3. Authentification et RBAC

### 3.1 OAuth2 + JWT


62: uHub utilise **OAuth2 (Password flow v1) + JWT** pour les appels API. 
- **Access token JWT** :
  - payload minimal : `sub` (user_id), `username`, `role`, `exp`.  
  - signé avec un secret/clé géré par Vault ou une configuration sécurisée. 
- **Header** :
  - `Authorization: Bearer <access_token>` sur tous les endpoints protégés.

Endpoints auth principaux :

#### `POST /auth/token`

- OAuth2 Password flow.  
- Entrée : `username`, `password` (form urlencoded).  
- Sortie :

```json
{
  "access_token": "jwt_here",
  "token_type": "bearer",
  "user": { "id": 1, "username": "uyoop", "role": "admin", "display_name": null, "theme": "dark" }
}
401 en cas d’échec d’authentification.

GET /auth/me
Retourne le user courant (UserPublic) à partir du JWT.

200 sur succès, 401 si token invalide/expiré.

POST /auth/logout
v1 : logout géré côté client (suppression token), endpoint optionnel pour cohérence.

3.2 Bootstrap admin
POST /bootstrap/admin
Une seule utilisation : créer l’admin initial si aucun utilisateur n’existe.

Si base vide → crée username = "uyoop", password = "uyoop-ADMIN", role = "admin", hash sécurisé.


99: Si au moins un user existe → 409 Conflict.
100: 
101: *Option Seed Démo* : Si variable d’env `UHUB_SEED_DEMO=true`, le bootstrap crée aussi les comptes démo et projets exemples.

3.3 Dépendances d’auth / RBAC
get_current_user() :

lit le JWT, vérifie signature/expiration,

charge le User en base, vérifie is_active. 
Helpers RBAC :

require_admin(current_user)

require_role("ops") ou require_any_role("admin", "projets")

plus tard : helpers prenant en compte projet/environnement.

Les droits détaillés par rôle sont décrits dans 03-rbac-and-workflows.md (admin/projets/dev/ops). 

4. API v1 – Users
Préfixe : /users

4.1 GET /users
Description : liste les utilisateurs.

Auth :

admin : voit tous les utilisateurs.

autres rôles : v1 → liste complète en lecture, v2 → éventuellement filtrée.

Réponse :

200 [UserPublic].

4.2 GET /users/{user_id}
Description : retourne un utilisateur donné.

Auth :

admin : tous.

non‑admin : au minimum soi‑même ; ouverture plus large possible selon policy.

4.3 POST /users
Description : crée un nouvel utilisateur.

Auth : admin uniquement.

Body : UserCreate (username, email, password, role, display_name, theme).

Réponse : 201 UserPublic.

4.4 PATCH /users/{user_id}
Description : met à jour un utilisateur.

Auth :

admin : peut modifier rôle, email, is_active, etc.

user lui‑même : seulement profil (display_name, theme, email optionnel).

4.5 DELETE /users/{user_id}
Description : désactive/supprime un utilisateur.

Auth : admin uniquement.

Comportement : recommandé v1 = soft delete via is_active = false.

5. API v1 – Projects & Environments
Préfixes : /projects, /environments

5.1 GET /projects
Description : liste les projets visibles pour le user courant.

Auth : tous les rôles authentifiés.

Réponse : 200 [ProjectSummary].

5.2 POST /projects
Description : crée un nouveau projet.

Auth :

admin : peut toujours créer.

projets : peut créer si policy globale l’autorise.

Body : ProjectCreate (name, description, color, etc.).

Réponse : 201 Project.

5.3 GET /projects/{project_id}
Description : détail d’un projet (environnements, stats, liens principaux).

Auth : accès pour les membres rattachés au projet (admin, projets, dev, ops concernés).

5.4 PATCH /projects/{project_id}
Description : modification d’un projet.

Auth :

admin : tout projet.

projets : seulement projets dont ils sont owner.

Body : ProjectUpdate.

5.5 DELETE /projects/{project_id}
Description : archive/supprime un projet.

Auth : admin uniquement (ou admin + propriétaire avec confirmation).

Comportement : de préférence archivage (status archived) plutôt que suppression physique, pour conserver l’historique.

5.6 GET /projects/{project_id}/environments
Liste les environnements d’un projet (dev/test/staging/prod…).

5.7 POST /projects/{project_id}/environments
Auth : admin + rôle projets pour ce projet.

Crée un Environment (nom, type, description).

5.8 PATCH /environments/{env_id} / DELETE /environments/{env_id}
Modifie / supprime un environnement.

Suppression prod peut exiger un niveau admin ou une double validation (policy).

6. API v1 – Jobs, Runs, Calendar Events
Préfixes : /jobs, /runs, /events

6.1 GET /projects/{project_id}/jobs
Description : liste des Jobs d’un projet (avec filtres : type, status, environnement, date).

Auth : membres du projet.

6.2 POST /projects/{project_id}/jobs
Description : crée un nouveau Job (dev/ops/maintenance/meeting/infra).

Auth :

admin : tous projets.

projets : tous types sur leurs projets.

dev : types dev sur leurs projets.

ops : types ops/maintenance/infra sur leurs projets.

Body : JobCreate (title, job_type, environment_id, planned_start/end, etc.).

Réponse : 201 Job.

6.3 GET /jobs/{job_id} / PATCH /jobs/{job_id} / DELETE /jobs/{job_id}
Lecture et modification d’un Job, avec RBAC aligné sur les règles ci‑dessus (admin/projets/dev/ops).

Suppression de Jobs critiques (releases, incidents) possiblement limitée à admin/projets.

6.4 GET /jobs/{job_id}/runs
Liste les exécutions d’un Job.

6.5 POST /jobs/{job_id}/runs
Description : lance une exécution technique (Run) du Job.

Auth :

admin : toujours.

dev : Jobs dev en non‑prod.

ops : Jobs ops/infra en staging/prod (selon policy).


270: Réponse : 201 Run, puis mises à jour via statut/logs.
271: 
272: **Architecture ExecutionBackend (Strategy Pattern)** :
273: - `LocalExecutionBackend` : subprocess, pour dev/test. Whitelists requis.
274: - `DockerExecutionBackend` : conteneur éphémère (limits CPU/Mem, no-root). Standard pour prod v1.
275: - `WebhookBackend` : déclenche CI/CD externe (GitLab CI, Jenkins).
276: - v2 : `SSHExecutionBackend`, `K8sJobBackend`.
277: 
278: Secrets injectés à la volée (Vault), jamais loggés. Guardrails : Prod requiert Docker/K8s/Webhook + approbation éventuelle.

6.6 GET /runs/{run_id}
Détail d’un Run (timestamps, statut, extraits de logs).

6.7 GET /calendar/events
Description : retourne les Event (projection des Jobs/Incidents) pour la vue calendrier.

Query :

project_id (optionnel),

plage de dates (start, end).


284: Réponse : 200, format compatible FullCalendar (title, start, end, allDay, extendedProps). 
285: - `extendedProps.conflict = true` si chevauchement détecté.
286: 
287: 6.8 PATCH /jobs/{job_id}/reschedule (ou PATCH /jobs/{id})
288: - Pour le drag‑drop : met à jour `planned_start` / `planned_end`.
289: - Vérifie les conflits et droits (Projets/Admin en prod).
6.8 POST /calendar/events (optionnel)
Pour créer un Event “simple” (ex : réunion) qui crée en coulisse un Job de type meeting.

Ou bien la création d’Event passe toujours par POST /jobs → projection en Event (design à trancher).

7. API v1 – Incidents & Post‑mortems
Préfixe : /incidents

7.1 GET /projects/{project_id}/incidents
Liste les incidents d’un projet, avec filtres (status, severity).

7.2 POST /projects/{project_id}/incidents
Auth :

ops : tous environnements.

dev : dev/test/staging.

projets : incidents de nature métier/qualité

Body : IncidentCreate (title, severity, description, detected_at…).

Réponse : 201 Incident.

7.3 GET /incidents/{incident_id} / PATCH /incidents/{incident_id}
Consultations / mises à jour de l’incident (status, liens avec Jobs/Runs/GitChange).

RBAC :

ops : peut mettre à jour status (open, mitigated, resolved, closed) dans son périmètre.

projets/dev : peuvent compléter description, liens, commentaires.

7.4 POST /incidents/{incident_id}/postmortem
Crée ou met à jour le PostMortem associé.

Auth : projets/dev/ops sur ce projet, admin toujours.

8. API v1 – Intégrations (Git, Ansible, Terraform, K8s)
Préfixes : /integrations/git, /integrations/ansible, /integrations/terraform, /integrations/k8s

Résumé v1 :

Git

POST /projects/{project_id}/git-repos (admin/projets) → crée GitRepo avec référence Vault pour credentials. 

GET /projects/{project_id}/git-repos → liste des repos.

GET /jobs/{job_id}/git-changes / POST /jobs/{job_id}/git-changes → lien commits/MR ↔ jobs.

Ansible

POST /projects/{project_id}/ansible/inventories (ops/projets) → upload/analyse inventory, crée Inventory. 

GET /projects/{project_id}/ansible/inventories → liste.

Terraform

POST /projects/{project_id}/terraform/plans → upload/référence plan, résumés.

GET /projects/{project_id}/terraform/plans.

K8s

POST /projects/{project_id}/clusters (admin) → associer cluster + référence Kubeconfig (Vault).

GET /projects/{project_id}/clusters.

Les exécutions effectives (Ansible/Terraform/kubectl) passent par les Jobs/ Runs, qui appellent les scripts/clients en interne en récupérant les secrets via Vault.]

9. API v1 – Vue serveur & audit
9.1 GET /admin/server/status
Description : retourne un snapshot CPU/RAM/disk du serveur uHub.

Auth : admin (lecture complète), éventuellement lecture partielle pour autres rôles.

Données : issues de ServerStatus (ou collectées à la volée).

9.2 GET /admin/audit-logs
Description : vue sur AuditLog (actions sensibles).

Auth : admin uniquement.


369: Filtres : user, action, période, projet, etc.
370: 
371: 9.3 Seeds & Initialisation
372: - Script `backend/app/seeds/seed_demo.py` ou endpoint admin `POST /admin/seeds/demo`.
373: - Importe `users.json` et `projects-with-jobs.json`.

10. Déploiement et environnements
uHub est prévu pour tourner sur :

un serveur unique (VM/bare metal),

un cluster k3s/Kubernetes,

ou une infra cloud, via images Docker hardened.

Environnements recommandés :

uhub-dev.uyoop.fr,

uhub-staging.uyoop.fr,

uhub.uyoop.fr (prod), par exemple.

CI/CD : pipeline à définir (build image, tests, scans de sécurité, déploiement).