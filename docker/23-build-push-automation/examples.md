# 📚 Exemples Pratiques - Build & Push Automation

Guide complet avec exemples concrets d'utilisation du script `build-push.sh`

## Table des Matières

1. [Cas Simples](#cas-simples)
2. [Scénarios Complexes](#scénarios-complexes)
3. [Authentification](#authentification)
4. [CI/CD Integration](#cicd-integration)
5. [Troubleshooting](#troubleshooting)

---

## Cas Simples

### Exemple 1: Build & Push Basique

**Situation:** Vous êtes sur `feature/auth` et voulez builder votre app.

```bash
# Prérequis
cd /home/user/projects/myapp
git checkout feature/auth
git add . && git commit -m "Implement JWT authentication"

# Exécution
chmod +x build-push.sh
./build-push.sh myapp

# Résultat (avec config par défaut)
# → Image locale: myapp:feature-auth-a1b2c3d-2025-01-09-120000
# → Registre: harbor.local/myapp:feature-auth-a1b2c3d-2025-01-09-120000
# → Latest: harbor.local/myapp:latest
```

**Console output:**
```
═════════════════════════════════════════════════════════════════════════════
🐳 Docker Build & Push Automation
═════════════════════════════════════════════════════════════════════════════

>>> Vérification des pré-requis
[✓] ✓ git trouvé
[✓] ✓ docker trouvé
[✓] ✓ Repository git détecté
[✓] ✓ Docker daemon accessible
[✓] Dockerfile trouvé: ./Dockerfile

>>> Informations du build

📦 Image Information:
   Nom local:      myapp:feature-auth-a1b2c3d-2025-01-09-120000
   Registre:       harbor.local/myapp:feature-auth-a1b2c3d-2025-01-09-120000
   Latest:         harbor.local/myapp:latest

🌿 Git Information:
   Branch:         feature/auth
   Commit:         a1b2c3d
   Status:         clean
   Timestamp:      2025-01-09-120000
   Dockerfile:     ./Dockerfile

>>> Construction de l'image Docker
[INFO] Dockerfile: ./Dockerfile
[INFO] Image: myapp:feature-auth-a1b2c3d-2025-01-09-120000
[INFO] Contexte: .
[✓] ✓ Image construite: myapp:feature-auth-a1b2c3d-2025-01-09-120000

[INFO] Tagging en tant que latest: harbor.local/myapp:latest

>>> Connexion à Harbor
[INFO] Utilisation des credentials Docker existantes

[INFO] Push [1/3] : harbor.local/myapp:feature-auth-a1b2c3d-2025-01-09-120000
[✓] ✓ Push réussi: harbor.local/myapp:feature-auth-a1b2c3d-2025-01-09-120000

[INFO] Push latest [1/3] : harbor.local/myapp:latest
[✓] ✓ Push latest réussi: harbor.local/myapp:latest

═════════════════════════════════════════════════════════════════════════════
✅ Succès !
═════════════════════════════════════════════════════════════════════════════

📊 Résumé:
   Image publiée:  harbor.local/myapp:feature-auth-a1b2c3d-2025-01-09-120000
   Latest tag:     harbor.local/myapp:latest
   
   Build time:     Thu Jan  9 12:00:05 UTC 2025
   Log file:       ./build-push.log
```

---

### Exemple 2: Spécifier Registry et Dockerfile Personnalisé

**Situation:** Vous utilisez une registry personnalisée et un Dockerfile en sous-dossier.

```bash
# Vous êtes sur develop
git checkout develop

# Exécution avec registry et Dockerfile custom
./build-push.sh api my-registry.io/production ./docker/Dockerfile.prod

# Résultat
# → Harbor: my-registry.io/production/api:dev-dev-f4e5d6c-2025-01-09-143000
# → Dockerfile: ./docker/Dockerfile.prod
```

**Détails :**
```bash
./build-push.sh <image-name> <registry-url> <dockerfile-path>
                api          my-registry.io/production  ./docker/Dockerfile.prod
```

---

### Exemple 3: Hotfix Production Urgent

**Situation:** Bug critique en production à corriger immédiatement.

```bash
# Créer et switcher sur hotfix
git checkout main
git checkout -b hotfix/critical-bug
echo "fix critical bug" > patch.txt
git add . && git commit -m "Fix: Critical production bug"

# Builder rapidement
./build-push.sh critical-service harbor.local

# Résultat
# → Tag: critical-service:hotfix-critical-f4e5d6c-2025-01-09-150000
# → Push: harbor.local/critical-service:hotfix-critical-f4e5d6c-2025-01-09-150000
```

---

## Scénarios Complexes

### Scenario 1: Branche Develop avec Registry Custom

**Situation:** Pipeline CI/CD sur branche develop, registry privée avec auth.

```bash
# Variables d'environnement
export REGISTRY_USER=devops
export REGISTRY_PASSWORD=secure_password_123
export LOG_FILE=./logs/build-$(date +%s).log

# Build
git checkout develop
git pull origin develop

./build-push.sh myservice mycompany.io/development

# Résultat
# → Image: mycompany.io/development/myservice:dev-dev-xyz-2025-01-09-143000
# → Log: ./logs/build-1736430005.log
```

---

### Scenario 2: Build Version Taggée

**Situation:** Release officielle avec tag git.

```bash
# Être sur main avec un tag git
git checkout main
git tag v2.5.0
git push origin v2.5.0

# Build version
./build-push.sh webapp harbor.local/company

# Résultat
# → Détection automatique du tag v2.5.0
# → Image: harbor.local/company/webapp:v2.5.0-a1b2c3d-2025-01-09-143000
# → Latest: harbor.local/company/webapp:latest
```

---

### Scenario 3: Multi-Images d'une Même Monorepo

**Situation:** Monorepo avec plusieurs services à builder.

```bash
# Backend
cd backend
./build-push.sh api-service harbor.local/myproject ./Dockerfile

# Frontend
cd ../frontend
./build-push.sh web-ui harbor.local/myproject ./Dockerfile

# Infrastructure
cd ../infrastructure
./build-push.sh devops-tools harbor.local/internal ./Dockerfile

# Résultat
# → 3 images différentes, auto-taggées selon leur branche respective
```

---

### Scenario 4: Test DRY-RUN Avant Production

**Situation:** Vérifier ce qui sera fait sans réellement le faire.

```bash
# Mode test (dry-run) - aucune action réelle
DRY_RUN=true DEBUG=true ./build-push.sh prod-api harbor.local

# Output (simulation)
[DEBUG] [DRY-RUN] docker build -f ./Dockerfile -t prod-api:prod-a1b2c3d-2025-01-09-143000 .
[DEBUG] [DRY-RUN] docker tag prod-api:prod-a1b2c3d-2025-01-09-143000 prod-api:latest
[DEBUG] [DRY-RUN] docker push harbor.local/prod-api:prod-a1b2c3d-2025-01-09-143000
[DEBUG] [DRY-RUN] docker push harbor.local/prod-api:latest

# Vérifier les logs
cat build-push.log
```

---

## Authentification

### Methode 1: Docker Config Existant (Recommandé)

```bash
# Login Docker une fois
docker login harbor.local
# → Credentials sauvegardés dans ~/.docker/config.json

# Utilisation simple
./build-push.sh myapp harbor.local

# Le script détecte automatiquement les credentials
```

---

### Methode 2: Variable d'Environnement

**Sécuriser pour un seul build :**

```bash
# Inline (attention: visible en historique bash)
REGISTRY_PASSWORD=my_secret ./build-push.sh myapp harbor.local

# Mieux: depuis un fichier .env
cat > .env.local << EOF
REGISTRY_USER=admin
REGISTRY_PASSWORD=secure_password
EOF

source .env.local
./build-push.sh myapp harbor.local

# Ne pas commiter le fichier
echo ".env.local" >> .gitignore
```

---

### Methode 3: Credentials GitLab/GitHub

**Pour CI/CD pipelines :**

```yaml
# .gitlab-ci.yml
build_image:
  script:
    - ./build-push.sh $CI_PROJECT_NAME harbor.local
  variables:
    REGISTRY_PASSWORD: $HARBOR_DEPLOY_PASSWORD
  only:
    - develop
    - main
    - /^feature\/.*$/
```

---

## CI/CD Integration

### GitLab CI/CD

**`.gitlab-ci.yml`**

```yaml
variables:
  DOCKER_DRIVER: overlay2
  REGISTRY_URL: harbor.local
  REGISTRY_USER: ci_user

stages:
  - build
  - push

build_dev:
  stage: build
  script:
    - chmod +x build-push.sh
    - ./build-push.sh $CI_PROJECT_NAME $REGISTRY_URL
  variables:
    REGISTRY_PASSWORD: $HARBOR_PASSWORD
  only:
    - develop
    - feature/*

build_prod:
  stage: build
  script:
    - chmod +x build-push.sh
    - ./build-push.sh $CI_PROJECT_NAME $REGISTRY_URL
  variables:
    REGISTRY_PASSWORD: $HARBOR_PROD_PASSWORD
  only:
    - main
    - tags
```

---

### GitHub Actions

**`.github/workflows/build-push.yml`**

```yaml
name: Build & Push Docker Image

on:
  push:
    branches:
      - develop
      - main
      - feature/**
    tags:
      - 'v*'

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Build & Push Image
        env:
          REGISTRY_PASSWORD: ${{ secrets.HARBOR_PASSWORD }}
        run: |
          chmod +x build-push.sh
          ./build-push.sh ${{ github.event.repository.name }} harbor.local/${{ github.repository_owner }}
```

---

### Jenkins

**`Jenkinsfile`**

```groovy
pipeline {
    agent any
    
    environment {
        REGISTRY_URL = 'harbor.local'
        REGISTRY_USER = 'jenkins'
        REGISTRY_PASSWORD = credentials('harbor-password')
    }
    
    stages {
        stage('Build & Push') {
            steps {
                sh '''
                    chmod +x build-push.sh
                    ./build-push.sh ${JOB_NAME} ${REGISTRY_URL}
                '''
            }
        }
    }
    
    post {
        always {
            archiveArtifacts artifacts: 'build-push.log'
        }
    }
}
```

---

## Troubleshooting

### Problème 1: "Pas dans un repository git"

**Erreur:**
```
[ERROR] Pas dans un repository git
```

**Solution:**
```bash
# Vérifier l'emplacement
pwd

# Vérifier qu'on est bien dans un repo
git status

# Ou initialiser un repo
git init
```

---

### Problème 2: "Docker daemon non accessible"

**Erreur:**
```
[ERROR] Impossible de se connecter au daemon Docker
```

**Solution:**
```bash
# Vérifier Docker
docker ps

# Démarrer Docker (Linux)
sudo systemctl start docker

# Vérifier les permissions
groups $USER
# Ajouter à docker group si nécessaire
sudo usermod -aG docker $USER
newgrp docker
```

---

### Problème 3: "Dockerfile non trouvé"

**Erreur:**
```
[ERROR] Dockerfile non trouvé: ./Dockerfile
```

**Solution:**
```bash
# Vérifier le chemin
ls -la Dockerfile

# Ou spécifier le bon chemin
./build-push.sh myapp harbor.local ./path/to/Dockerfile

# Ou chercher
find . -name "Dockerfile*"
```

---

### Problème 4: "Échec d'authentification Harbor"

**Erreur:**
```
[ERROR] Échec de l'authentification Harbor
```

**Solution:**
```bash
# Test login manual
docker login harbor.local
# → Entrer credentials

# Ou avec variable
export REGISTRY_PASSWORD=correct_password
./build-push.sh myapp harbor.local

# Vérifier les credentials
cat ~/.docker/config.json | grep -A 5 harbor.local
```

---

### Problème 5: "Push échoue - réseau"

**Erreur:**
```
[WARNING] Push échoué. Nouvelle tentative...
[ERROR] Échec du push après 3 tentatives
```

**Solution:**
```bash
# Augmenter les tentatives
RETRY_COUNT=5 ./build-push.sh myapp harbor.local

# Vérifier la connectivité
ping harbor.local
curl -I https://harbor.local

# Vérifier les logs
cat build-push.log | tail -20
```

---

### Problème 6: "Modifications locales détectées"

**Warning:**
```
[WARNING] ⚠️ Modifications locales détectées (tag: dirty)
```

**Explication:**
```bash
# Vérifier les fichiers modifiés
git status

# Commiter les changements
git add .
git commit -m "Your message"

# Relancer le build
./build-push.sh myapp
# → Tag sans -dirty
```

---

## Bonnes Pratiques

### ✅ DO's

```bash
# ✅ Commiter avant de builder
git add .
git commit -m "Feature complete"
./build-push.sh myapp

# ✅ Utiliser des noms explicites
git checkout -b feature/user-authentication
./build-push.sh auth-service

# ✅ Vérifier avant production
DRY_RUN=true DEBUG=true ./build-push.sh prod-app
# → Vérifier l'output
./build-push.sh prod-app  # Puis vraiment builder

# ✅ Conserver les logs
tail -f build-push.log
```

### ❌ DON'Ts

```bash
# ❌ Builder avec modifications locales
echo "debug code" >> app.js
./build-push.sh myapp  # Tag: dirty !

# ❌ Noms de branches génériques
git checkout -b work
git checkout -b fix

# ❌ Oublier de pull avant
./build-push.sh myapp  # Code obsolète ?
# Mieux:
git pull origin develop
./build-push.sh myapp

# ❌ Hardcoder les credentials
REGISTRY_PASSWORD=secret123 ./build-push.sh myapp  # Visible en bash history !
```

---

## Ressources

- [Build & Push Script](./build-push.sh)
- [Stratégie de Tagging](./tag-strategy.md)
- [README Principal](./README.md)
- [Docker Best Practices](https://docs.docker.com/develop/dev-best-practices/)
- [Git Workflow](https://git-scm.com/book/en/v2/Git-Branching-Branching-Workflows)

---

**Questions?** Consultez le README ou la stratégie de tagging!
