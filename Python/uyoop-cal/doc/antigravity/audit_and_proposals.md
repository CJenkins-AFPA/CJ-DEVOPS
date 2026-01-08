# Audit & Propositions : uyoop-cal

## 1. État des Lieux Précis

### 🟢 Points Forts (Ce qui est solide)
*   **Architecture "Enterprise-Ready"** : L'intégration de **Vault** (gestion des secrets/TOTP) et la préparation pour **K3s** (Kubernetes) montrent une maturité rare pour un projet de cette taille.
*   **Sécurité en profondeur** :
    *   Headers HTTP stricts (HSTS, CSP, X-Frame-Options).
    *   Rate Limiting implémenté (`slowapi`) sur les endpoints sensibles.
    *   Authentification 2FA (TOTP) fonctionnelle via Vault.
*   **Frontend Avancé (malgré le "Vanilla JS")** : Le fichier `app.js` (bien que monolithique) gère correctement la complexité :
    *   Gestionnaire de tokens JWT (`TokenManager`) avec auto-refresh sur erreur 401.
    *   Tableaux de bord interactifs (Chart.js).
    *   Modales multi-étapes.

### 🟠 Points d'Attention (Dette Technique & Risques)
1.  **Tests Obsolètes** : Le script `doc/test_rbac.py` teste uniquement l'authentification "Legacy" via l'en-tête `X-User-Id`. Il ne teste **pas** le flux JWT réel. Si on désactive le fallback `X-User-Id` demain, on perd toute couverture de test.
2.  **Documentation vs Réalité** :
    *   `doc/security.md` indique que le frontend JWT est "EN ATTENTE", alors qu'il est **implémenté** dans `app.js`.
    *   `test_rbac.py` est situé dans le dossier de documentation (`doc/`) au lieu d'un dossier racine `tests/`.
3.  **Frontend Monolithique** : `app.js` dépasse 1200 lignes. La maintenabilité va devenir critique sans découpage modulaire ou passage à un framework léger (Vue.js/Alpine.js).
4.  **Absence de CI/CD** : Tout repose sur des actions manuelles ou des scripts shell locaux.

---

## 2. Propositions d'Augmentation & Optimisation

Je vous propose 3 axes de travail, du plus "Fondationnel" au plus "Visionnaire".

### 🧱 Axe 1 : Fondations & Industrialisation (Priorité Haute)
*Objectif : Fiabiliser l'existant pour ne plus rien casser.*

*   **Refonte des Tests** :
    *   Déplacer `doc/test_rbac.py` vers `tests/test_api.py`.
    *   Migrer vers **Pytest**.
    *   Réécrire les tests pour utiliser l'authentification **JWT** (plus de `X-User-Id`).
*   **Mise en place CI/CD (GitHub Actions)** :
    *   Pipeline automatique à chaque push : Linting (Ruff), Tests (Pytest), Build Docker.
    *   Scan de sécurité (Trivy) pour valider l'image "hardened".

### 🚀 Axe 2 : Modernisation & Monitoring (Priorité Moyenne)
*Objectif : Rendre l'app observable et modulaire.*

*   **Stack Monitoring** : Déploiement de **Prometheus + Grafana** (via Docker Compose dans un premier temps) pour visualiser les métriques déjà exposées par l'app (DORA metrics).
*   **Refactoring Frontend** : Découper `app.js` en modules ES6 (`api.js`, `auth.js`, `ui.js`) sans forcément introduire la complexité de React/build tools, pour rester léger mais propre.

## Axe 3 : Industrialisation (CI/CD)
- [x] Mettre à jour `requirements.txt` (Dev dependencies: pytest, ruff, httpx)
- [x] Configurer GitHub Actions (`.github/workflows/ci.yml`)
  - [x] Lint (Ruff)
  - [x] Test (Pytest)
  - [x] Build Docker (Hardened)
- [x] Configurer GitLab CI (`.gitlab-ci.yml`)
  - [x] Miroir du pipeline GitHub
- [ ] Documentation CI/CD

---

## 3. Cadre de Collaboration

Pour avancer efficacement, j'ai besoin de clarifier vos préférences :

1.  **Niveau d'intervention** : Préférez-vous que je "fasse" (écrire le code, les tests, les fichiers YAML) ou que je "guide" (vous donner les instructions et vous laisser taper) ? *Je suis conçu pour "faire", c'est souvent plus efficace.*
2.  **Environnement** : L'application tourne-t-elle actuellement sur votre machine (Docker Compose) ? Puis-je lancer des commandes `docker` ou `curl` pour vérifier mes modifications ?
3.  **Choix Frontend** : Souhaitez-vous garder l'approche "Vanilla JS" (simple, pas de build node_modules) ou basculer sur un framework moderne (Vue/React) sachant que cela complexifie la chaine de build ?

**Ma recommandation immédiate** : Commençons par l'**Axe 1 (Tests & CI)** pour sécuriser le projet avant d'ajouter des fonctionnalités.
