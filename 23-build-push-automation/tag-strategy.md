# 🏷️ Stratégie de Tagging - Build & Push Automation

## Vue d'ensemble

Le script `build-push.sh` génère automatiquement des tags Docker en fonction de :
- **Branche Git** actuellement en cours
- **Commit hash** (7 premiers caractères)
- **Timestamp** ISO (année-mois-jour-heure/minute/seconde)
- **Statut Git** (clean ou dirty - modifications locales)
- **Tags Git** existants (versions sémantiques)

## 📋 Stratégie par Branche

### 1️⃣ Production Branches

**Branches concernées :** `main`, `master`, `production`, `release/*`

```
Format: prod-<commit_hash>-<timestamp>[-dirty]
```

**Exemples :**
```
prod-a1b2c3d-2025-01-09-143000
prod-a1b2c3d-2025-01-09-143000-dirty  (avec modifications locales)
```

**Cas d'usage :**
- Merges sur la branche principale
- Releases de production
- Hotfixes critiques

---

### 2️⃣ Develop Branch

**Branch concernée :** `develop`

```
Format: dev-dev-<commit_hash>-<timestamp>[-dirty]
```

**Exemples :**
```
dev-dev-f4e5d6c-2025-01-09-120000
dev-dev-f4e5d6c-2025-01-09-120000-dirty
```

**Cas d'usage :**
- Branche d'intégration continue
- Testing pré-production
- Merge de features

---

### 3️⃣ Feature Branches

**Pattern :** `feature/<nom_feature>`

```
Format: feature-<feature_name>-<commit_hash>-<timestamp>[-dirty]
```

**Exemples :**
```
Branch: feature/user-authentication
Tag:    feature-user-a1b2c3d-2025-01-09-120000

Branch: feature/api/auth-system
Tag:    feature-api-f4e5d6c-2025-01-09-143000
```

**Cas d'usage :**
- Développement de nouvelles fonctionnalités
- Branches courtes de développement
- Pre-PR validation

---

### 4️⃣ Hotfix Branches

**Pattern :** `hotfix/<description_issue>`

```
Format: hotfix-<issue_name>-<commit_hash>-<timestamp>[-dirty]
```

**Exemples :**
```
Branch: hotfix/sql-injection-fix
Tag:    hotfix-sql-injection-a1b2c3d-2025-01-09-143000

Branch: hotfix/memory-leak
Tag:    hotfix-memory-a1b2c3d-2025-01-09-150000
```

**Cas d'usage :**
- Corrections critiques en production
- Sécurité/Performance/Stabilité
- Déploiements urgents

---

### 5️⃣ Bugfix Branches

**Pattern :** `bugfix/<description_bug>`

```
Format: bugfix-<bug_name>-<commit_hash>-<timestamp>[-dirty]
```

**Exemples :**
```
Branch: bugfix/db-connection-timeout
Tag:    bugfix-db-a1b2c3d-2025-01-09-143000

Branch: bugfix/api-validation
Tag:    bugfix-api-f4e5d6c-2025-01-09-120000
```

**Cas d'usage :**
- Correction de bugs en développement
- Branche de feature -> bugfix discovery
- Non-critique mais important

---

### 6️⃣ Custom Branches

**Pattern :** Toute autre branche

```
Format: branch-<sanitized_branch_name>-<commit_hash>-<timestamp>[-dirty]
```

**Exemples :**
```
Branch: experiment/ml-model-v2
Tag:    branch-experiment-ml-a1b2c3d-2025-01-09-143000

Branch: poc/kubernetes-migration
Tag:    branch-poc-a1b2c3d-2025-01-09-120000

Branch: research/optimization
Tag:    branch-research-f4e5d6c-2025-01-09-140000
```

**Cas d'usage :**
- Branches expérimentales
- POC (Proof of Concept)
- Recherches/Optimisations
- Branches temporaires de travail

---

### 7️⃣ Version Tags

**Scenario :** Commit avec tag git sémantique existant

```
Format: <git_tag>-<commit_hash>-<timestamp>[-dirty]
```

**Exemples :**
```
Commit avec tag: v1.2.0
Docker tag:      v1.2.0-a1b2c3d-2025-01-09-143000

Commit avec tag: v2.5.1-beta
Docker tag:      v2.5.1-beta-f4e5d6c-2025-01-09-120000
```

**Cas d'usage :**
- Releases sémantiques
- Versionning explicite
- Production stable

---

## ⚠️ Le Flag "Dirty"

### Détection

Le flag `dirty` est ajouté au tag si la working directory contient des modifications non commited :

```bash
# Ces fichiers rendent le build "dirty" :
- Fichiers modifiés non staged
- Fichiers untracked
- Fichiers staged non commited
```

### Exemples

```bash
# Clean working directory
$ git status
nothing to commit, working tree clean

$ ./build-push.sh myapp
# → Tag: prod-a1b2c3d-2025-01-09-143000  ✓

# Modifications locales
$ echo "test" >> file.txt
$ git status
modified: file.txt

$ ./build-push.sh myapp
# → Tag: prod-a1b2c3d-2025-01-09-143000-dirty  ⚠️
```

### Interprétation

| Tag | Signification |
|-----|---|
| `tag-xxx` | Build reproductible, tous les changements sont commités |
| `tag-xxx-dirty` | Build non reproductible, contient du code non commité |

### Bonnes pratiques

```bash
# ✅ BON - Avant de builder
git add .
git commit -m "Feature complète"
./build-push.sh myapp

# ❌ MAUVAIS - Code non commité
git status  # modified: config.yml, untracked: .env
./build-push.sh myapp  # → tag-dirty (risqué !)
```

---

## 📊 Tableau Récapitulatif

| Branche | Pattern | Format Tag |
|---------|---------|-----------|
| main/master | Directe | `prod-<commit>-<ts>` |
| develop | Directe | `dev-dev-<commit>-<ts>` |
| feature/* | Préfixe | `feature-<name>-<commit>-<ts>` |
| hotfix/* | Préfixe | `hotfix-<issue>-<commit>-<ts>` |
| bugfix/* | Préfixe | `bugfix-<name>-<commit>-<ts>` |
| autres | Custom | `branch-<sanitized>-<commit>-<ts>` |
| v*.*.* | Git tag | `<version>-<commit>-<ts>` |

---

## 🔍 Exemples Concrets

### Scenario 1: Feature Development

```bash
# Créer une feature
git checkout -b feature/payment-integration

# Développer et commiter
git commit -m "Add Stripe integration"

# Builder l'image
./build-push.sh payment-service harbor.local/mycompany

# Tag généré:
# → payment-service:feature-payment-a1b2c3d-2025-01-09-120000
# → harbor.local/mycompany/payment-service:feature-payment-a1b2c3d-2025-01-09-120000
```

### Scenario 2: Hotfix Urgent

```bash
# Créer hotfix
git checkout main
git checkout -b hotfix/security-patch-cve

# Fix et commit
git commit -m "CVE-2025-1234 - SQL Injection fix"

# Builder rapidement
./build-push.sh api-gateway harbor.local/mycompany

# Tag généré:
# → api-gateway:hotfix-security-a1b2c3d-2025-01-09-143000
# → harbor.local/mycompany/api-gateway:hotfix-security-a1b2c3d-2025-01-09-143000
```

### Scenario 3: Production Release

```bash
# Être sur main et créer une release
git checkout main
git tag v2.1.0
git push origin v2.1.0

# Builder version
./build-push.sh webapp harbor.local/mycompany

# Tag généré:
# → webapp:v2.1.0-a1b2c3d-2025-01-09-143000
# → harbor.local/mycompany/webapp:v2.1.0-a1b2c3d-2025-01-09-143000
```

---

## 🎯 Recommandations

### ✅ Bonnes Pratiques

1. **Commits propres** : Un commit = Une feature/fix logique
2. **Messages explicites** : `git commit -m "Add authentication"` plutôt que "Fix"
3. **Pas de builds dirty** : Toujours commiter avant de builder
4. **Tags sémantiques** : Utiliser `v1.2.3` pour les releases
5. **Noms de branches clairs** : `feature/user-auth` plutôt que `f1`

### ❌ À Éviter

```bash
# ❌ MAUVAIS
git checkout -b work  # Nom peu explicite
./build-push.sh app   # Pas d'URL registry

# ❌ MAUVAIS
echo "debug" >> app.js
./build-push.sh app   # Avec modifications locales

# ❌ MAUVAIS
git checkout main
git merge feature --no-edit
./build-push.sh app   # Pas de commit de merge explicite
```

---

## 🚀 Intégration CI/CD

Le tagging automatique s'intègre parfaitement avec des pipelines CI/CD:

```yaml
# GitLab CI Example
build:
  script:
    - ./build-push.sh $CI_PROJECT_NAME harbor.local/$CI_PROJECT_NAMESPACE
  variables:
    REGISTRY_PASSWORD: $HARBOR_PASSWORD
```

Le tag généré automatiquement évite d'avoir à coder les logiques de tagging en YAML !

---

## 📝 Notes

- Les timestamps sont en **UTC** (`%Y-%m-%d-%H%M%S`)
- Les `/` dans les noms de branche sont remplacés par des `-`
- Le tag "latest" est toujours pushé (peu importe la branche)
- Tous les tags Docker sont en **minuscules**

---

**Voir aussi:** [README.md](./README.md) pour l'utilisation du script
