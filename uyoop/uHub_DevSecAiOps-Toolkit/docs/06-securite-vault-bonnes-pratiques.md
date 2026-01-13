06 – Sécurité, Vault & bonnes pratiques
Ce document résume les exigences de sécurité de uHub v1.

1. Secrets & Vault
Tous les secrets sensibles sont gérés via un service secrets_service qui :

lit les secrets depuis Vault,

les fournit aux services (Git, Ansible, Terraform, K8s) en mémoire seulement,

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

Mapping interne logical_name → secret_path dans Vault (ex : git/uhub/project123/token).

Les modèles (GitRepo, Cluster) stockent uniquement une référence (vault_secret_ref), pas la valeur.

2. Auth & RBAC
Authentification via OAuth2 + JWT :

JWT signé, expirations courtes, rotation possible.

Option future : refresh tokens + SSO (OIDC).

RBAC conforme à 03-rbac-and-workflows.md :

rôles : admin, projets, dev, ops,

helpers côté backend pour vérifier les rôles avant chaque action sensible.

3. Transport & exposition
Toutes les communications vers uHub doivent passer en HTTPS (TLS).

En production :

reverse proxy (nginx, traefik ou autre) devant le backend,

headers de sécurité (HSTS, X‑Frame‑Options, etc.).

Front et backend peuvent être derrière un même domaine (ex. uhub.uyoop.fr) avec des chemins séparés (/api pour l’API).

4. Logging & audit
Logging applicatif structuré (JSON) pour faciliter la collecte (ELK, Loki, etc.).

AuditLog :

actions tracées : création/suppression de users, changements de rôles, exécutions de jobs, modifications d’incidents critiques, configurations d’intégrations.

accessible via un endpoint admin dédié.

5. Conteneurs & images
Images Docker basées sur :

Python slim / hardened pour le backend,

image de base minimale pour le frontend.

Règles :

user non‑root,

filesystem en lecture seule sauf pour dossiers de données désignés (/data/uploads, /var/log/uhub, etc.),

scans d’images intégrés dans la CI (Trivy, Grype, etc. à terme).

6. Hardening de l’application
Validation stricte des inputs (schémas Pydantic, constraints).

Limitation des opérations d’exécution (Guardrails par Backend) :

- **Local** : Whitelists de chemins stricts, user système restreint, timeouts forcés. Jamais en prod.
- **Docker** : Images minimales (distroless/alpine), user non‑root, limites CPU/RAM, pas de montage socket Docker en prod.
- **Webhook** : Tokens API stockés dans Vault uniquement, scopes minimaux, logs sanitaires (pas de secrets).

**Règle d'Or en Prod** : Approbation (humaine ou automatique via policy stricte) requise avant exécution + AuditLog systématique.