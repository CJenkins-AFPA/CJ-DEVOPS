# 02 – Modèle de domaine uHub

Ce document décrit les **entités métier** de uHub_DevSecAiOps-Toolkit, leurs champs principaux et leurs relations. Il sert de référence pour le schéma de base de données, les APIs et, plus tard, pour les agents IA.

## 1. Principes généraux

- Tout objet important est :
  - identifié par un `id` stable,  
  - horodaté (`created_at`, `updated_at`),  
  - rattaché à un **projet** dès que pertinent. [web:335][web:338]
- Les relations sont explicites (pas de magie) afin de faciliter :
  - les projections (calendrier, vues projet),  
  - les analyses ultérieures (post‑mortems, IA). [web:345]

---

## 2. Utilisateurs, rôles, groupes

### 2.1 User

**But** : représenter une personne qui utilise uHub.

Champs principaux (v1) :
- `id: int`
- `username: str` (unique)
- `email: str | null`
- `role: Enum("admin", "projets", "dev", "ops")`
- `theme: Enum("dark", ...)` (v1 : dark par défaut, variantes possibles)
- `display_name: str | null`
- `is_active: bool`
- `created_at: datetime`
- `updated_at: datetime`

Remarques :
- Authentification : v1 peut être simple (password hash local), mais le modèle doit supporter plus tard SSO (OIDC, LDAP). [web:288][web:310]

### 2.2 Group / Team (optionnel v1, préparé)

**But** : regrouper des utilisateurs par équipe, projet ou fonction.

Champs :
- `id: int`
- `name: str`
- `description: str | null`
- `created_at`, `updated_at`

Relations :
- `GroupUser` (table de jointure) :  
  - `group_id`, `user_id`, `role_in_group: str | null`

---

## 3. Projets et environnements

### 3.1 Project

**But** : entité centrale de uHub ; tout ou presque est rattaché à un projet.

Champs :
- `id: int`
- `name: str` (ex. `projet22`)
- `description: str | null`
- `color: str` (code couleur pour UI, ex `#00ff00`)
- `status: Enum("active", "archived", "paused")`

65: - `owner_id: int` (User, typiquement rôle Projets ou Admin)
66: - `execution_backend: Enum("local","docker","webhook","ssh","k8s","serverless") | null` (v1: local/docker/webhook)
67: - `execution_backend_config: jsonb | null` (image, timeouts, limites CPU/Mem, etc.)
68: - `created_at`, `updated_at`

Relations :
- `environments: list[Environment]`
- `repos: list[GitRepo]`
- `inventories: list[Inventory]`
- `terraform_plans: list[TerraformPlan]`
- `clusters: list[Cluster]`
- `jobs: list[Job]`
- `incidents: list[Incident]`

### 3.2 Environment

**But** : représenter un environnement logique d’un projet (dev, staging, prod, etc.).

Champs :
- `id: int`
- `project_id: int`
- `name: str` (ex. `dev`, `staging`, `prod`)
- `description: str | null`
- `type: Enum("dev", "test", "staging", "prod", "other")`
- `created_at`, `updated_at`

---

## 4. Jobs, runs et calendrier

### 4.1 Job

**But** : unité d’action planifiée (déploiement, maintenance, script, réunion, tâche projet).

Champs :
- `id: int`
- `project_id: int`
- `environment_id: int | null`
- `title: str`
- `description: str | null`
- `job_type: Enum("dev", "ops", "maintenance", "meeting", "infra")`
- `owner_id: int` (User responsable)
- `requested_by_id: int | null` (User qui a demandé le job)
- `status: Enum("draft", "planned", "running", "success", "failed", "canceled")`
- `priority: Enum("low", "normal", "high", "critical")`
- `planned_start: datetime | null`
- `planned_end: datetime | null`
- `tags: list[str]` (JSON/text)
- `created_at`, `updated_at`

Relations :
- `runs: list[Run]`
- `events: list[Event]`
- `linked_incidents: list[Incident]`
- `linked_commits: list[GitChange]`
- `linked_scripts: list[ScriptRef]` (Ansible/Terraform/shell, voir plus bas)

### 4.2 Run

**But** : une exécution concrète d’un Job (surtout pour les jobs techniques).

Champs :
- `id: int`
- `job_id: int`
- `started_at: datetime | null`
- `finished_at: datetime | null`
- `status: Enum("running", "success", "failed", "canceled")`
- `triggered_by_id: int` (User qui a lancé le run)
- `log_path: str | null` (chemin vers fichier log / stockage objet)
- `stdout_excerpt: str | null`
- `stderr_excerpt: str | null`
- `exit_code: int | null`
- `created_at`, `updated_at`

### 4.3 Event (calendrier)

**But** : projection d’un Job dans le calendrier (vue temps).

Champs :
- `id: int`
- `project_id: int`
- `job_id: int | null` (un event peut être juste une réunion sans job technique)
- `title: str`
- `start: datetime`
- `end: datetime | null`
- `event_type: Enum("job", "meeting", "maintenance", "incident", "other")`
- `color: str | null`
- `all_day: bool`
- `created_at`, `updated_at`


153: - `extendedProps`: JSON incluant `conflict: bool` en cas de chevauchement critique.
154: 
155: L’API calendrier exposera ces events au format FullCalendar (title, start, end, extendedProps, etc.). [web:282][web:285]

---

## 5. Incidents et post‑mortems

### 5.1 Incident

**But** : représenter un incident ou une alerte majeur(e) lié(e) à un projet.

Champs :
- `id: int`
- `project_id: int`
- `title: str`
- `description: str | null`
- `severity: Enum("low", "medium", "high", "critical")`
- `status: Enum("open", "mitigated", "resolved", "closed")`
- `detected_at: datetime`
- `resolved_at: datetime | null`
- `created_at`, `updated_at`

Relations :
- `jobs: list[Job]` (changement ayant introduit l’incident, mitigation, rollback)
- `runs: list[Run]`
- `events: list[Event]` (créneau incident dans le calendrier)
- `metrics_refs: list[MetricRef]` (pointeurs vers dashboards externalisés)
- `postmortem: PostMortem | null`

### 5.2 PostMortem

**But** : document structuré d’analyse a posteriori.

Champs :
- `id: int`
- `incident_id: int`
- `summary: str`
- `impact: str`
- `root_cause: str | null`
- `timeline: str` (texte structuré / markdown ; plus tard, peut être généré par IA) [web:330][web:345]
- `action_items: str` (liste d’actions correctives/préventives)
- `created_by_id: int`
- `created_at`, `updated_at`

---

## 6. Code, Git et CI/CD

### 6.1 GitRepo

**But** : représenter un dépôt Git lié à un projet.

Champs :
- `id: int`
- `project_id: int`
- `provider: Enum("github", "gitlab", "gitea", "other")`
- `name: str`
- `url: str`
- `default_branch: str`
- `credentials_ref: str` (référence vers un secret Vault, jamais le secret lui‑même) [web:301][web:303][web:307]
- `created_at`, `updated_at`

### 6.2 GitChange (commit / MR lié à un job)

**But** : pointer vers des changements Git liés à un job ou à un incident.

Champs :
- `id: int`
- `job_id: int | null`
- `incident_id: int | null`
- `repo_id: int`
- `change_type: Enum("commit", "merge_request", "pull_request")`
- `external_id: str` (hash commit, MR id, etc.)
- `title: str | null`
- `url: str | null`
- `author: str | null`
- `created_at`, `updated_at`

---

## 7. Infra as Code : Ansible, Terraform, Kubernetes

### 7.1 Inventory (Ansible)

**But** : représenter un inventory Ansible analysé par uHub.

Champs :
- `id: int`
- `project_id: int`
- `source_type: Enum("uploaded", "fs_path", "git")`
- `source_location: str` (path ou URL dans un repo)
- `summary: str | null` (texte descriptif)
- `groups_json: jsonb` (structure group → hosts) [web:329][web:332]
- `created_at`, `updated_at`

### 7.2 TerraformPlan

**But** : capture d’un plan Terraform attaché à un projet/job.

Champs :
- `id: int`
- `project_id: int`
- `job_id: int | null`
- `source_type: Enum("uploaded", "fs_path", "git")`
- `source_location: str`
- `summary: str | null`
- `raw_plan_path: str | null` (fichier)
- `created_at`, `updated_at`

### 7.3 Cluster (Kubernetes)

**But** : représenter un cluster Kubernetes géré/observé via uHub.

Champs :
- `id: int`
- `project_id: int`
- `name: str`
- `kubeconfig_ref: str` (réf Vault)
- `environment_id: int | null`
- `api_server_url: str | null`
- `created_at`, `updated_at`

---

## 8. Scripts et actions automatisées

### 8.1 ScriptRef

**But** : pointer vers un script ou playbook exécutable par uHub.

Champs :
- `id: int`
- `project_id: int`
- `tool: Enum("ansible", "shell", "terraform", "custom")`
- `name: str`
- `description: str | null`
- `location_type: Enum("uploaded", "fs_path", "git")`
- `location: str` (chemin local, sous `/data`, ou chemin dans un repo)
- `vault_secret_ref: str | null` (si des secrets sont nécessaires) [web:301][web:303][web:307]
- `created_at`, `updated_at`

Relations :
- `jobs: list[Job]` (via une table JobScriptRef : un job peut référencer plusieurs scripts).

---

## 9. Observabilité et vue serveur

### 9.1 ServerStatus

**But** : vue synthétique CPU/RAM/disk utilisée par le module Administration.

Champs :
- `id: int`
- `snapshot_time: datetime`
- `cpu_cores: int`
- `cpu_load_1m: float`
- `cpu_load_5m: float`
- `cpu_load_15m: float`
- `ram_total_gib: float`
- `ram_used_gib: float`
- `disk_path: str`
- `disk_total_gib: float`
- `disk_used_gib: float`
- `disk_free_gib: float`

En pratique, ces données pourront être stockées en base ou calculées à la volée selon le besoin. [web:330]

### 9.2 MetricRef (optionnel v1)

**But** : pointer vers des dashboards ou métriques externes (Grafana, Centreon, etc.).

Champs :
- `id: int`
- `project_id: int`
- `incident_id: int | null`
- `label: str`
- `url: str`
- `created_at`, `updated_at`

---

## 10. Audit et sécurité

### 10.1 AuditLog

**But** : tracer les actions importantes dans uHub (pour sécurité, conformité, IA).

Champs :
- `id: int`
- `timestamp: datetime`
- `user_id: int | null`
- `action: str` (ex. `job.create`, `run.start`, `run.finish`, `incident.create`)
- `object_type: str` (ex. `Job`, `Run`, `Incident`)
- `object_id: int | null`
- `metadata: jsonb`


349: Ce log servira plus tard de base à des analyses IA (patterns de changement, anomalies, etc.). [web:340][web:345]
350: 
351: ## 11. Données Démo v1 (Seed)
352: 
353: **Objectif** : Peupler la base pour la démo et les tests.
354: 
355: - **Users** : 4 comptes (admin, projets, dev, ops) avec `is_active=true` et `theme=dark`.
356: - **Projects** : 4 projets types (App, Infra, Registry, Monitoring) avec envs `dev/staging/prod`.
357: - **Jobs** :
358:   - Meeting (Sprint Planning),
359:   - Déploiement (Release vX.Y - staging),
360:   - Rapport (Santé projet),
361:   - Maintenance (Patch sécurité).
