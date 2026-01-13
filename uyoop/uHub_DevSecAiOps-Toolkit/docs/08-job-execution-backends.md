# 08 – Backends d’Exécution (Job Execution)

uHub a pour vocation de lancer des tâches techniques (jobs) de manière sécurisée et tracée. Pour cela, il utilise une abstraction "ExecutionBackend" qui permet de déléguer l'exécution réelle selon le contexte.

## 1. Stratégie ExecutionBackend

Le backend FastAPI ne lance pas les commandes "en dur" mais instancie une classe héritant de `BaseExecutionBackend`.

Chaque projet ou job peut configurer son backend préféré :
- **v1** : Local, Docker, Webhook.
- **v2** : SSH, KubernetesJob, Serverless.

---

## 2. Backends Supportés (v1)

### 2.1 LocalExecutionBackend
- **Principe** : Exécute un processus (subprocess) directement sur le serveur uHub.
- **Usage** : Développement, tests simples, scripts sans dépendances lourdes.
- **Sécurité** :
  - Identité système restreinte (`nobody` ou user dédié).
  - Whitelist stricte des exécutables autorisés (ex: `/usr/bin/ansible-playbook`, `/usr/bin/terraform`).
  - Timeouts forcés.
- **Risque** : Élevé si mal configuré (accès au filesystem hôte).

### 2.2 DockerExecutionBackend (Recommandé Prod)
- **Principe** : Lance un conteneur Docker éphémère pour chaque Run.
- **Usage** : Production, environnements aux dépendances complexes.
- **Config** : Image Docker spécifique par job (ex: `custom-ansible-runner:latest`).
- **Sécurité** :
  - Isolation du filesystem.
  - User non-root dans le conteneur.
  - Limites CPU/RAM configurables.
  - Injection des secrets (Vault) via variables d'env en mémoire uniquement.

### 2.3 WebhookBackend
- **Principe** : Appelle une URL externe (POST) pour déléguer l'exécution.
- **Usage** : Déclencher un pipeline GitLab CI, un job Jenkins ou une Azure Function.
- **Sécurité** :
  - Token d'authentification stocké dans Vault.
  - Vérification SSL/TLS.
  - Le "Run" uHub attend le callback ou polle le statut externe.

---

## 3. Configuration & Guardrails

La configuration se fait via le champ `execution_backend_config` (JSONB) du Projet ou du Job.

Exemple de config :
```json
{
  "image": "my-org/runner-ansible:1.2",
  "cpu_limit": "500m",
  "mem_limit": "512Mi",
  "timeout_seconds": 3600
}
```

**Guardrails Globaux** :
1.  **Environnement Prod** : `LocalExecutionBackend` interdit par défaut (sauf dérogation Admin). Seuls `Docker` et `Webhook` sont recommandés.
2.  **Approbation** : Pour les jobs critiques en prod, uHub peut demander une validation manuelle d'un rôle `Projets` ou `Admin` avant d'instancier le backend.
