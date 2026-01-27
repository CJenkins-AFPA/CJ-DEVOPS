# Architecture du Pipeline CI/CD SAST

## 🎯 Objectif

Mettre en place un pipeline CI/CD avec analyse de sécurité (SAST) pour déployer l'application UyoopApp vers Harbor.

## 🏗️ Architecture Cible (Mode Hybride)

```
┌─────────────┐       ┌────────────────────┐
│   VM1 Dev   │       │    GitLab.com      │
│  (Poste)    │──────>│  (SaaS Gratuit)    │
└─────────────┘       └─────────┬──────────┘
       │                        │
       │ (Code & Logs)          │ (Instructions Job)
       ▼                        ▼
┌──────────────────────────────────────────────┐
│             POSTE LOCAL (Debian)             │
│                                              │
│  ┌──────────────┐      ┌──────────────────┐  │
│  │ GitLab       │      │   App Demo       │  │
│  │ Runner       │      │  (Dockerised)    │  │
│  └──────┬───────┘      └──────────────────┘  │
│         │                                    │
│         ▼                                    │
│  ┌──────────────┐      ┌──────────────────┐  │
│  │ Docker build │────> │ Harbor Registry  │  │
│  │ & SAST Scan  │      │ (Local Docker)   │  │
│  └──────────────┘      └──────────────────┘  │
└──────────────────────────────────────────────┘
```

## 📦 Composants

### 1. GitLab.com (SaaS)
- Héberge le code source (`.gitlab-ci.yml`)
- Orchestre le pipeline CI/CD
- Affiche les résultats des tests et scans
- Stocke les variables secrètes (Credentials Harbor)

### 2. Poste Local (Runner + Services)
- **GitLab Runner** : Container Docker connecté à GitLab.com
  - Récupère les jobs
  - Lance les containers temporaires pour Build/Test/Scan
- **Harbor** : Registry privé local
  - Reçoit les images Docker construites
  - Scanne les vulnérabilités images (Trivy)
- **UyoopApp** : Application cible

## 🔄 Flux Simplifié

1. **Dev** : Push vers GitLab.com
2. **GitLab.com** : Détecte le push -> Notifie le Runner Local
3. **Runner** :
   - Clone le code
   - Lance les tests PHP (SAST)
   - Construit l'image Docker
4. **Runner -> Harbor** : Push l'image vers le registry local
5. **Harbor** : Scanne l'image et stocke le rapport

## 🔐 Avantages de cette architecture
- **Performance** : Décharge le poste de la lourdeur de GitLab CE
- **Réalisme** : Utilise le vrai moteur GitLab CI (production-grade)
- **Flexibilité** : Permet de tester Harbor en local sans exposition publique complexe


## 🔄 Pipeline CI/CD

### Stages définis

```yaml
stages:
  - test          # Tests unitaires et linting
  - sast          # Analyse de sécurité du code
  - build         # Construction de l'image Docker
  - scan-image    # Scan de sécurité de l'image
  - push          # Push vers Harbor
  - deploy        # Déploiement (optionnel)
```

### 1. Stage TEST
**Jobs** :
- `lint:php` : Vérification des standards PSR-12
- `syntax:php` : Validation syntaxe PHP

**Outils** :
- PHP_CodeSniffer
- php -l (built-in)

### 2. Stage SAST (Security Analysis)
**Jobs** :
- `sast` : GitLab SAST (automatique)
- `secret-detection` : Détection de secrets
- `gitleaks` : Scan de credentials
- `phpstan` : Analyse statique PHP

**Outils** :
- GitLab SAST (Semgrep)
- GitLab Secret Detection
- Gitleaks
- PHPStan

### 3. Stage BUILD
**Job** : `build:image`
- Construction de l'image Docker
- Tag avec commit SHA
- Tag latest

**Image de base** : php:8.4-fpm-alpine

### 4. Stage SCAN-IMAGE
**Job** : `trivy:scan`
- Scan de vulnérabilités de l'image Docker
- Niveau : HIGH et CRITICAL
- Rapport JSON généré

**Outil** : Trivy (Aqua Security)

### 5. Stage PUSH
**Job** : `push:harbor`
- Push vers Harbor Registry
- Authentification requise
- Uniquement sur branches main/develop

### 6. Stage DEPLOY (Optionnel)
**Jobs** :
- `deploy:staging` : Déploiement staging (manuel)
- `deploy:production` : Déploiement production (manuel)

## 🔐 Sécurité

### Analyse SAST
1. **Code source** : Détection de vulnérabilités dans le code PHP
2. **Secrets** : Détection de credentials, tokens, clés API
3. **Dépendances** : Scan des packages PHP (composer)
4. **Image Docker** : Scan des vulnérabilités système et packages

### Points de contrôle
- ✅ Tous les scans doivent passer avant push
- ✅ Vulnérabilités critiques bloquent le pipeline
- ✅ Rapport de sécurité généré à chaque build
- ✅ Traçabilité complète (commit → image)

## 📊 Variables d'environnement

```bash
# Harbor
HARBOR_REGISTRY=harbor.local:8081
HARBOR_PROJECT=uyoop
HARBOR_USERNAME=admin
HARBOR_PASSWORD=Harbor12345

# GitLab
CI_COMMIT_SHORT_SHA=<auto>
CI_COMMIT_REF_NAME=<auto>

# Image Docker
IMAGE_NAME=${HARBOR_REGISTRY}/${HARBOR_PROJECT}/uyoopapp
IMAGE_TAG=${CI_COMMIT_SHORT_SHA}
```

## 🚀 Workflow complet

1. **Développeur** : Code + commit + push
2. **GitLab** : Détecte le push, déclenche le pipeline
3. **Runner** : Exécute les jobs séquentiellement
4. **SAST** : Analyse le code source
5. **Build** : Construit l'image Docker
6. **Trivy** : Scan de l'image
7. **Harbor** : Stockage sécurisé de l'image
8. **Deploy** : Déploiement manuel vers environnement cible

## 📝 Prochaines étapes

1. Installation GitLab + Runner
2. Installation Harbor
3. Configuration du Runner
4. Enregistrement du projet dans GitLab
5. Test du pipeline complet
6. Intégration sur infrastructure réelle (PROJET-INFRA-RBC)
