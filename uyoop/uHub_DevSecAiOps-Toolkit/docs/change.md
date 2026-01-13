Plan:

Incrementally update 01→06 and PLAN with your points 2–7.
Add demo accounts/projects/jobs details and seeds.
Create 07→10 docs and JSON files under concept_projet.
Below are ready-to-paste additions and new files. I can apply them after your review.

PLAN_uHub-v1.md — Insertion

Auth: OAuth2 Password Flow + JWT. SSO/OIDC en v2.
Démo: comptes pré-créés demo-admin, demo-projets, demo-dev, demo-ops (mdp=username; display_name=Prénom NOM; email @uhub.local), 4 projets avec 4 jobs chacun.
Exécution: abstraction ExecutionBackend v1 (local, docker, webhook), v2 (ssh, k8s, serverless). Guardrails: prod → docker|k8s|webhook + approbation.
UI calendrier: glisser‑déposer, couleurs par projet/type/statut, détection + ALERTE de conflits, modale de résolution.
Design: thème dark moderne (Matrix + Vercel/Supabase/Linear), blurry gradients, courbes/border‑radius généreux, Command Palette (Ctrl/Cmd+K).
Stack: FastAPI + PostgreSQL + SQLAlchemy 2.0 (async), Alembic, Pydantic v2, pytest(+asyncio).
01-vision.md — Ajouts

Comptes et Projets Démo:
Comptes: demo-admin (Admin), demo-projets (Projets), demo-dev (Dev), demo-ops (Ops). Mot de passe = username. display_name en Prénom NOM. Emails demo-*@uhub.local.
Projets:
Projet Pilote App X — owner demo-projets, color #00ff00
Infra K3s — owner demo-ops, color #00cc88
Registry Docker Privé — owner demo-ops, color #66ffcc
Monitoring Stack — owner demo-projets, color #33ff99
Jobs initiaux par projet: meeting, déploiement, rapport, maintenance.
Calendrier & Command Palette:
Drag‑drop pour replanifier; coloration par projet/type/statut; ALERTE des conflits (bordure rouge, tooltip, modale).
Command Palette (Ctrl/Cmd+K): créer/lancer des jobs, naviguer, rechercher globalement.
02-domain-model.md — Ajouts

Project (extensions v1 optionnelles):
execution_backend: Enum("local","docker","webhook","ssh","k8s","serverless") | null
execution_backend_config: jsonb | null (image, timeouts, limites CPU/Mem, etc.)
Event — Conflits de calendrier:
Chevauchement de planned_start/end pour jobs critiques dans un même environment → extendedProps.conflict = true côté API calendrier (pas de table dédiée v1).
Données Démo v1 (seed):
Users: 4 comptes démo (mdp=username, theme=dark, is_active=true).
Projects: 4 projets avec environnements dev|staging|prod.
Jobs par projet:
Meeting: “Sprint Planning – Semaine 01” (meeting, planned_start = J+1)
Déploiement: “Release v0.1 – staging” (ops, env staging)
Rapport: “Rapport hebdo – santé projet” (dev, all_day = true)
Maintenance: “Patch sécurité – workers” (maintenance, env staging|prod)
03-rbac-and-workflows.md — Ajouts

Calendrier interactif & Drag‑Drop:
Projets: replanifient via drag‑drop leurs jobs (policies respectées).
Dev: drag‑drop autorisé pour jobs dev en non‑prod.
Ops: drag‑drop pour ops/maintenance/infra; prod selon policy et approbation.
Conflits de planning (ALERTE):
Détection automatique des chevauchements critiques; bordure rouge + tooltip; modale de résolution avec suggestions.
En prod, approbation Projets/Admin requise pour décalage.
Guardrails d’exécution:
Dev: runs en non‑prod.
Ops: runs en staging|prod via docker|k8s|webhook.
Traçabilité: AuditLog pour toutes exécutions.
04-architecture-v1.md — Ajouts

Auth v1 — OAuth2 + JWT:
Password flow; JWT signé avec sub, username, role, exp. POST /bootstrap/admin. Seed démo si UHUB_SEED_DEMO=true.
ExecutionBackends (Strategy):
LocalExecutionBackend (subprocess, whitelists, timeouts)
DockerExecutionBackend (conteneur éphémère, limites CPU/Mem)
WebhookBackend (CI/CD externes GitHub/GitLab/Jenkins)
v2: SSHExecutionBackend, K8sJobBackend, ServerlessBackend
Secrets injectés via Vault à l’exécution; jamais loggés.
Guardrails prod: docker|k8s|webhook + approbation.
Calendrier & conflits:
Drag‑drop → PATCH /jobs/{id} (maj planned_start/end).
GET /calendar/events expose extendedProps.conflict = true quand chevauchement.
Seeds Démo:
Script backend/app/seeds/seed_demo.py ou endpoint admin POST /admin/seeds/demo important users.json et projects-with-jobs.json.
05-structure_du_projet-uhub.md — Ajouts

Dossiers additionnels:
services/execution_backends/: base.py, local.py, docker.py, webhook.py (v1); ssh.py, k8s.py, serverless.py (stubs v2).
seeds/: users.json, projects-with-jobs.json, seed_demo.py.
Frontend:
components/calendar/CalendarView.vue (drag‑drop, couleurs, alertes).
components/commands/CommandPalette.vue (Ctrl/Cmd+K).
Styles: styles/theme.css (dark, verts uHub), styles/gradients.css (blurry gradients animés), border‑radius 12–32px.
06-securite-vault-bonnes-pratiques.md — Corrections/Ajouts

Auth: remplacer toute mention OAuth1 par OAuth2 + JWT; SSO (OIDC) prévu en v2.
Guardrails d’exécution:
Local: whitelists de chemins, user système restreint, timeouts.
Docker: images minimales, no‑root, limites CPU/Mem; éviter montage Docker socket en prod.
Webhook: tokens API en Vault; scopes minimaux; logs sans secrets.
Prod: approbation requise; AuditLog systématique sur runs.
Nouveaux fichiers — création

uyoop/uHub_DevSecAiOps-Toolkit/concept_projet/07-authentication-demo-accounts.md

Auth: OAuth2 + JWT
Endpoints: POST /auth/token, GET /auth/me, POST /bootstrap/admin
Comptes démo: demo-admin, demo-projets, demo-dev, demo-ops (mdp=username; display_name=Prénom NOM; emails @uhub.local)
Option seed UHUB_SEED_DEMO=true
Roadmap SSO (OIDC): mapping des rôles et claims
uyoop/uHub_DevSecAiOps-Toolkit/concept_projet/08-job-execution-backends.md

Strategy ExecutionBackend avec v1: local, docker, webhook
Config projet/global: image, timeouts, ressources, policies
Guardrails par environnement (prod vs non‑prod)
v2: ssh, k8s, serverless (principes, contraintes)
uyoop/uHub_DevSecAiOps-Toolkit/concept_projet/09-ui-calendar-interactions.md

Drag‑drop, coloration par projet/type/statut
Conflits: règle de détection, extendedProps.conflict, UX alerte + modale
Endpoints: GET /calendar/events, PATCH /jobs/{id}; payloads exemples
uyoop/uHub_DevSecAiOps-Toolkit/concept_projet/10-design-system.md

Palette: fond #000, texte #fff, vert uHub #00ff00, secondaires
Blurry gradients: blobs verts/vert‑bleu, animation subtile
Border‑radius: 12–32px selon composant
Typo: Comfortaa (titres) + Inter/Geist (corps)
Command Palette (Ctrl/Cmd+K): UX, raccourcis, commandes
Seeds JSON — à créer pour backend/app/seeds/

backend/app/seeds/users.json
[
  {"username":"demo-admin","password":"demo-admin","role":"admin","display_name":"Alice ADMIN","email":"demo-admin@uhub.local","theme":"dark","is_active":true},
  {"username":"demo-projets","password":"demo-projets","role":"projets","display_name":"Bruno PROJETS","email":"demo-projets@uhub.local","theme":"dark","is_active":true},
  {"username":"demo-dev","password":"demo-dev","role":"dev","display_name":"Chloé DEV","email":"demo-dev@uhub.local","theme":"dark","is_active":true},
  {"username":"demo-ops","password":"demo-ops","role":"ops","display_name":"David OPS","email":"demo-ops@uhub.local","theme":"dark","is_active":true}
]

backend/app/seeds/projects-with-jobs.json
[
  {
    "name":"Projet Pilote App X","color":"#00ff00","owner_username":"demo-projets","environments":["dev","staging","prod"],
    "jobs":[
      {"title":"Sprint Planning – Semaine 01","job_type":"meeting","planned_start":"+1d"},
      {"title":"Release v0.1 – staging","job_type":"ops","environment":"staging","planned_start":"+2d"},
      {"title":"Rapport hebdo – santé projet","job_type":"dev","all_day":true,"planned_start":"+3d"},
      {"title":"Patch sécurité – workers","job_type":"maintenance","environment":"staging","planned_start":"+4d"}
    ]
  },
  {
    "name":"Infra K3s","color":"#00cc88","owner_username":"demo-ops","environments":["dev","staging","prod"],
    "jobs":[
      {"title":"Sprint Planning – Semaine 01","job_type":"meeting","planned_start":"+1d"},
      {"title":"Release k3s v1.29 – staging","job_type":"ops","environment":"staging","planned_start":"+2d"},
      {"title":"Rapport hebdo – capacité cluster","job_type":"dev","all_day":true,"planned_start":"+3d"},
      {"title":"Patch sécurité – workers","job_type":"maintenance","environment":"prod","planned_start":"+4d"}
    ]
  },
  {
    "name":"Registry Docker Privé","color":"#66ffcc","owner_username":"demo-ops","environments":["dev","staging","prod"],
    "jobs":[
      {"title":"Sprint Planning – Semaine 01","job_type":"meeting","planned_start":"+1d"},
      {"title":"Release registry config – staging","job_type":"ops","environment":"staging","planned_start":"+2d"},
      {"title":"Rapport hebdo – erreurs push/pull","job_type":"dev","all_day":true,"planned_start":"+3d"},
      {"title":"Maintenance – rotation certificats","job_type":"maintenance","environment":"prod","planned_start":"+4d"}
    ]
  },
  {
    "name":"Monitoring Stack","color":"#33ff99","owner_username":"demo-projets","environments":["dev","staging","prod"],
    "jobs":[
      {"title":"Sprint Planning – Semaine 01","job_type":"meeting","planned_start":"+1d"},
      {"title":"Déploiement dashboards – staging","job_type":"ops","environment":"staging","planned_start":"+2d"},
      {"title":"Rapport hebdo – disponibilité","job_type":"dev","all_day":true,"planned_start":"+3d"},
      {"title":"Maintenance – upgrade exporters","job_type":"maintenance","environment":"staging","planned_start":"+4d"}
    ]
  }
]