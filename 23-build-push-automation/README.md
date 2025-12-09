# 📦 Build & Push Automation - TP23

Script bash intelligent pour automatiser le build, le tagging et le push d'images Docker vers Harbor.

## 🎯 Objectifs

- ✅ **Récupérer** le commit hash (7 premiers caractères)
- ✅ **Récupérer** date/heure ISO pour traçabilité
- ✅ **Détecter** la branche git automatiquement
- ✅ **Générer** un tag cohérent selon la branche
- ✅ **Builder** l'image Docker avec validation
- ✅ **Appliquer** deux tags : specific + latest
- ✅ **Pusher** vers Harbor avec retry logic
- ✅ **Logger** toutes les actions
- ✅ **Supporter** le mode dry-run (test)

## 🏗️ Structure

```
23-build-push-automation/
├── README.md                 # Cette documentation
├── build-push.sh            # Script principal
├── tag-strategy.md          # Stratégie de tagging
├── examples.md              # Exemples d'utilisation
├── templates/
│   ├── Dockerfile.example   # Template Dockerfile
│   └── gitlab-ci.yml.example # Intégration CI/CD (futur)
└── tests/
    └── test-build-push.sh   # Tests du script
```

## 🚀 Installation Rapide

### 1️⃣ Donner les permissions

```bash
chmod +x build-push.sh
```

### 2️⃣ Vérifier les pré-requis

```bash
# Git et Docker doivent être installés
git --version
docker --version
```

### 3️⃣ Configurer Harbor (si nécessaire)

```bash
# Authentification manually
docker login harbor.local

# Ou via environment variable
export REGISTRY_PASSWORD="your_password"
```

## 📖 Usage Basique

### Syntaxe

```bash
./build-push.sh <image-name> [registry-url] [dockerfile-path]
```

### Exemples

```bash
# 1. Cas simple (defaults)
./build-push.sh myapp

# 2. Registre et image customisées
./build-push.sh backend harbor.local/myproject

# 3. Dockerfile personnalisé
./build-push.sh frontend ./docker/Dockerfile.prod

# 4. Avec authentification
REGISTRY_PASSWORD=secret123 ./build-push.sh myapp

# 5. Mode test (dry-run)
DRY_RUN=true ./build-push.sh myapp

# 6. Avec debug verbeux
DEBUG=true ./build-push.sh myapp
```

## 🏷️ Stratégie de Tagging Automatique

Le script génère **automatiquement** des tags selon la branche Git:

### Production Branches

**Branches:** `main`, `master`, `production`, `release/*`

```
Tag généré: prod-<commit_hash>-<timestamp>

Exemple:
  prod-a1b2c3d-2025-01-09-143000
  prod-xyz789-2025-01-09-143000-dirty  (si modifications locales)
```

### Development

**Branch:** `develop`

```
Tag généré: dev-dev-<commit>-<timestamp>

Exemple:
  dev-dev-f4e5d6c-2025-01-09-120000
```

### Feature Branches

**Pattern:** `feature/*`

```
Tag généré: feature-<name>-<commit>-<timestamp>

Exemple:
  Branch: feature/auth-system
  Tag: feature-auth-f4e5d6c-2025-01-09-120000
```

### Hotfix Branches

**Pattern:** `hotfix/*`

```
Tag généré: hotfix-<issue>-<commit>-<timestamp>

Exemple:
  Branch: hotfix/security-patch
  Tag: hotfix-security-a1b2c3d-2025-01-09-143000
```

### Bugfix Branches

**Pattern:** `bugfix/*`

```
Tag généré: bugfix-<name>-<commit>-<timestamp>

Exemple:
  Branch: bugfix/db-connection
  Tag: bugfix-db-a1b2c3d-2025-01-09-143000
```

### Custom Branches

**Pattern:** anything else

```
Tag généré: branch-<sanitized_name>-<commit>-<timestamp>

Exemple:
  Branch: experiment/ml-model
  Tag: branch-experiment-ml-a1b2c3d-2025-01-09-143000
```

### Version Tags

**Scenario:** Si on build depuis un commit avec tag git

```
Branch: main avec tag v1.2.0
Tag généré: v1.2.0-<commit>-<timestamp>

Exemple:
  v1.2.0-a1b2c3d-2025-01-09-143000
```

## 🔐 Authentification Harbor

### Methode 1 : Docker Config (Recommandé)

```bash
# Login une fois
docker login harbor.local

# Puis utiliser le script
./build-push.sh myapp harbor.local
```

### Methode 2 : Environment Variable

```bash
export REGISTRY_USER=admin
export REGISTRY_PASSWORD=your_password

./build-push.sh myapp harbor.local
```

### Methode 3 : Argument CLI (moins sûr)

```bash
REGISTRY_PASSWORD=secret123 ./build-push.sh myapp
```

## 📊 Output & Logging

Le script produit:

### 1. **Console Output** (avec couleurs)

```
[INFO] ✓ Docker daemon accessible
[✓] Dockerfile trouvé: ./Dockerfile
[✓] Image construite: myapp:dev-dev-a1b2c3d-2025-01-09-143000
[✓] Push réussi: harbor.local/myapp:dev-dev-a1b2c3d-2025-01-09-143000
[✓] Push latest réussi: harbor.local/myapp:latest
```

### 2. **Log File** (`./build-push.log`)

```
[2025-01-09 14:30:00] [INFO] Vérification des pré-requis
[2025-01-09 14:30:01] [INFO] ✓ git trouvé
[2025-01-09 14:30:01] [INFO] ✓ docker trouvé
[2025-01-09 14:30:02] [INFO] Construction de l'image Docker
[2025-01-09 14:30:15] [INFO] ✓ Image construite: myapp:dev-dev-a1b2c3d
```

## 🔄 Mode DRY-RUN (Test)

Pour tester sans exécuter réellement:

```bash
DRY_RUN=true ./build-push.sh myapp

# Output:
# [DEBUG] [DRY-RUN] docker build -f ./Dockerfile -t myapp:dev-dev-a1b2c3d ...
# [DEBUG] [DRY-RUN] docker tag myapp:dev-dev-a1b2c3d myapp:latest
# [DEBUG] [DRY-RUN] docker push harbor.local/myapp:dev-dev-a1b2c3d
```

## 🔄 Retry Logic

Le script inclut une **retry logic** pour les pushes:

```bash
# Par défaut: 3 tentatives
./build-push.sh myapp

# Personnaliser:
RETRY_COUNT=5 ./build-push.sh myapp

# Attend avant retry: 5s, 10s, 15s entre tentatives
```

## ⚙️ Variables d'Environnement

| Variable | Default | Description |
|----------|---------|-------------|
| `REGISTRY_URL` | `harbor.local` | URL du registre |
| `REGISTRY_USER` | `admin` | Utilisateur registry |
| `REGISTRY_PASSWORD` | *(vide)* | Mot de passe (si non dans ~/.docker) |
| `LOG_FILE` | `./build-push.log` | Chemin du log |
| `RETRY_COUNT` | `3` | Tentatives de push |
| `DRY_RUN` | `false` | Mode simulation |
| `DEBUG` | `false` | Messages debug |

## 📋 Checklist Pré-Build

- [ ] Vous êtes dans le repository git
- [ ] `git status` montre l'état attendu
- [ ] Dockerfile existe et est valide
- [ ] Harbor est accessible (`docker login harbor.local`)
- [ ] `build-push.sh` est exécutable (`chmod +x`)

## 🔍 Troubleshooting

### ❌ "Pas dans un repository git"

```bash
# Vérifier:
git log --oneline -n 1

# Ou initialiser:
cd /path/to/repo
```

### ❌ "Impossible de se connecter au daemon Docker"

```bash
# Vérifier Docker:
docker ps

# Ou démarrer:
sudo systemctl start docker
```

### ❌ "Échec de l'authentification Harbor"

```bash
# Vérifier credentials:
docker login harbor.local

# Ou utiliser env var:
REGISTRY_PASSWORD=correctpassword ./build-push.sh myapp
```

### ❌ "Dockerfile non trouvé"

```bash
# Chercher:
find . -name "Dockerfile*"

# Ou spécifier:
./build-push.sh myapp harbor.local ./path/to/Dockerfile
```

### ❌ "Push échoue - réseau"

Le script retry automatiquement. Pour plus de tentatives:

```bash
RETRY_COUNT=5 ./build-push.sh myapp
```

## 🧪 Tests

Pour tester le script:

```bash
# Test dry-run
DRY_RUN=true ./build-push.sh test-app

# Test avec debug
DEBUG=true DRY_RUN=true ./build-push.sh test-app

# Vérifier log
cat build-push.log
```

## 📚 Intégration CI/CD (Futur)

Ce script est conçu pour intégration dans:

- ✅ GitLab CI (`.gitlab-ci.yml`)
- ✅ GitHub Actions (`.github/workflows/`)
- ✅ Jenkins (Jenkinsfile)
- ✅ Automation manuelle

## 🎓 Exemples Pratiques

### Scenario 1: Build Feature et Push

```bash
# On est sur feature/user-auth
git checkout feature/user-auth
git pull

./build-push.sh myapp harbor.local

# Résultat:
# → Tag: feature-user-a1b2c3d-2025-01-09-143000
# → Push: harbor.local/myapp:feature-user-a1b2c3d-2025-01-09-143000
# → Push: harbor.local/myapp:latest
```

### Scenario 2: Hotfix Urgent

```bash
# Hotfix pour bug critique
git checkout hotfix/sql-injection
git pull

./build-push.sh myapp harbor.local

# Résultat:
# → Tag: hotfix-sql-injection-a1b2c3d-2025-01-09-143000
# → Push rapide vers Harbor
```

### Scenario 3: Production Release

```bash
# Release sur main
git checkout main
git tag v2.1.0
git push origin v2.1.0

./build-push.sh myapp harbor.local

# Résultat:
# → Tag: v2.1.0-a1b2c3d-2025-01-09-143000
# → Déployable en prod
```

## 📖 Ressources

- [Blog Stéphane Robert - Harbor](https://blog.stephane-robert.info/docs/developper/artefacts/harbor/)
- [Docker CLI Reference](https://docs.docker.com/engine/reference/commandline/docker/)
- [Git Reference](https://git-scm.com/doc)
- [Bash Best Practices](https://mywiki.wooledge.org/BashGuide)

## 📝 License

MIT License - Libre d'utilisation

## ✍️ Auteur

Créé pour la formation AFPA - Suite Docker 2/3

---

**Next:** Voir [tag-strategy.md](./tag-strategy.md) pour approfondir la stratégie de tagging.
