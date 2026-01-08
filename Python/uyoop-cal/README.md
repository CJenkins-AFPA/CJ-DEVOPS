# 🗓️ uYoop Calendar - DevOps Calendar App

Application web de gestion de calendrier DevOps avec **RBAC** (contrôle d'accès basé sur les rôles), construite avec **FastAPI**, **FullCalendar**, **PostgreSQL** et **Chart.js**. Gérez vos réunions, fenêtres de déploiement et actions Git avec un système de permissions granulaire.

![Status](https://img.shields.io/badge/status-operational-success)
![Version](https://img.shields.io/badge/version-0.1.0-blue)
![Python](https://img.shields.io/badge/python-3.13-blue)
![FastAPI](https://img.shields.io/badge/FastAPI-0.115-green)

---

## ✨ Fonctionnalités Principales

### 🎭 Système RBAC (4 rôles)
- **ADMIN** : Accès complet, gestion utilisateurs, tous types d'événements
- **PROJET** (Chef de projet) : Création de tous types d'événements
- **DEV** (Développeur) : Actions Git uniquement
- **OPS** (Ops/SysAdmin) : Fenêtres de déploiement uniquement

### 📅 3 Types d'Événements
1. **Réunions** (meeting)
   - Type de réunion, lien visio, notes
   
2. **Fenêtres de déploiement** (deployment_window)
   - Environnement (dev/staging/prod)
   - Services impactés, description
   - Approbation requise (prod)

3. **Actions Git** (git_action)
   - URL dépôt, branche, action (clone/pull)
   - Déclenchement automatique
   - Exécution sécurisée dans conteneur

### 🎨 Interface Multi-Vues
- **Calendrier** : Vue mensuelle/hebdomadaire/journalière (FullCalendar)
- **Tableau** : Liste filtrable avec actions (éditer/supprimer)
- **Dashboard** : Statistiques et graphiques (Chart.js)
- **Membres** : Gestion utilisateurs (ADMIN uniquement)

### 🧙 Wizard Multi-Étapes
- Étape 1 : Informations de base (titre, date, horaires)
- Étape 2 : Champs spécifiques au type d'événement
- Étape 3 : Récapitulatif et confirmation
- Validation à chaque étape

---

## 🚀 Démarrage Rapide

### Prérequis
- Docker & Docker Compose v2
- Ports disponibles : `8000` (app), `5433` (PostgreSQL)
- Vault HA TLS exposé: `8200/8201` (vault-1), `8210/8211` (vault-2), `8220/8221` (vault-3)

### Installation et Lancement

```bash
# Aller dans le dossier projet
cd /home/cj/gitdata/Python/uyoop-cal

# Déploiement complet (build image durcie, Vault HA TLS, app)
docker compose up -d

# Vérifier santé app et services
sleep 5 && curl -s http://localhost:8000/health && echo "" && docker compose ps --format "table {{.Name}}\t{{.Status}}"

# Logs applicatifs
docker compose logs -f app
```

### Accès à l'Application

- **Interface Web** : http://127.0.0.1:8000
- **API Documentation** : http://127.0.0.1:8000/docs
- **Base de données** : `localhost:5433` (credentials: devops_calendar/devops_calendar)
- **Vault UI (TLS)** : https://127.0.0.1:8200 (certificat CA: `vault/certs/ca-cert.pem`). Navigateur: faire confiance au CA, ou `curl --cacert vault/certs/ca-cert.pem`.

### Utilisateurs de Test

| Username     | Mot de passe | Rôle   | Permissions                    |
|--------------|--------------|--------|--------------------------------|
| admin_test   | -            | ADMIN  | Tout                           |
| dev_test     | -            | DEV    | Actions Git uniquement         |
| ops_test     | -            | OPS    | Fenêtres déploiement uniquement|
| projet_test  | -            | PROJET | Tous types d'événements        |

> **Note:** Auth simplifiée (pas de mot de passe). Sélectionner le rôle à la connexion.

---

## 🧪 Tests

### Tests RBAC Automatisés

```bash
# Exécuter la suite de tests
python3 test_rbac.py
```

**Couverture :**
- Permissions de création par rôle ✅
- Permissions d'édition/suppression ✅
- Persistance JSONB des métadonnées ✅
- Endpoint Git Actions ✅

**Résultat attendu :** 13/13 tests PASS

---

## 📁 Structure du Projet

```
Python/
├── app/
│   ├── main.py              # Routes FastAPI + RBAC
│   ├── models.py            # Modèles SQLAlchemy (User, Event)
│   ├── schemas.py           # Schémas Pydantic (validation)
│   ├── crud.py              # Opérations CRUD
│   ├── database.py          # Configuration PostgreSQL
│   ├── static/
│   │   ├── index.html       # Frontend (FullCalendar + Chart.js)
│   │   └── uG512.png        # Logo
│   └── repos/               # Dépôts Git clonés (git actions)
├── docker-compose.yml       # Orchestration services
├── Dockerfile               # Image Python + FastAPI
├── requirements.txt         # Dépendances Python
├── test_rbac.py             # Tests automatisés RBAC
├── action-history.md        # Journal des modifications
├── instructions-ia.md       # Règles métier et périmètre
└── README.md                # Ce fichier
```

---

## 🔧 Configuration

### Variables d'Environnement

```bash
DATABASE_URL=postgresql://devops_calendar:devops_calendar@postgres:5432/devops_calendar
```

### Personnalisation

- **Logo** : Remplacer `app/static/uG512.png` (50x50px recommandé)
- **Rôles** : Modifier `schemas.py` → `RoleType`
- **Types d'événements** : Modifier `schemas.py` → `EventType`

---

## 📊 API Endpoints

### Authentification
- `POST /login` - Créer/récupérer utilisateur

### Utilisateurs
- `GET /users` - Liste des utilisateurs
- `POST /users` - Créer utilisateur
- `PUT /users/{id}` - Modifier rôle (ADMIN)
- `DELETE /users/{id}` - Supprimer utilisateur (ADMIN)

### Événements
- `GET /events` - Liste des événements
- `POST /events` - Créer événement (permissions RBAC)
- `PUT /events/{id}` - Modifier événement (créateur ou ADMIN)
- `DELETE /events/{id}` - Supprimer événement (créateur ou ADMIN)

### Actions Git
- `POST /git/run/{event_id}` - Exécuter action Git (ADMIN/DEV)

**Documentation complète** : http://127.0.0.1:8000/docs

---

## 🔒 Sécurité & Permissions

### Règles RBAC

| Rôle    | Créer Meeting | Créer Deployment | Créer Git Action | Éditer Event | Supprimer Event |
|---------|---------------|------------------|------------------|--------------|-----------------|
| ADMIN   | ✅            | ✅               | ✅               | Tous         | Tous            |
| PROJET  | ✅            | ✅               | ✅               | Ses events   | Ses events      |
| DEV     | ❌            | ❌               | ✅               | Ses events   | Ses events      |
| OPS     | ❌            | ✅               | ❌               | Ses events   | Ses events      |

### Limitations Actuelles

- Auth simplifiée (header `X-User-Id`, pas de JWT)
- Pas de gestion de sessions
- Pas de mots de passe
- CORS non configuré

> **⚠️ Pour production** : Implémenter JWT, hash passwords, rate limiting

---

## 🛠️ Développement

### Lancer en mode développement

```bash
# Avec auto-reload
docker compose up

# Consulter logs en temps réel
docker compose logs -f app

# Accéder au conteneur
docker compose exec app bash

# Accéder à PostgreSQL
docker compose exec postgres psql -U devops_calendar -d devops_calendar
```

### Contribuer

1. Lire [action-history.md](action-history.md) et [instructions-ia.md](instructions-ia.md)
2. Créer une branche feature
3. Développer et tester (exécuter `test_rbac.py`)
4. Ajouter entrée dans `action-history.md`
5. Mettre à jour `instructions-ia.md` si nécessaire

---

## 📦 Arrêt et Suppression

### Suppression complète

```bash
# Arrêter et supprimer les conteneurs
docker-compose down

# Supprimer également les volumes (⚠️ perte de données)
docker-compose down -v

# Supprimer aussi les images Docker créées
docker-compose down --rmi all -v
```

## ✨ Fonctionnalités

---

## 📦 Arrêt et Gestion

```bash
# Arrêter les conteneurs
docker compose stop

# Redémarrer
docker compose start

# Arrêter et supprimer (conserver les volumes/données)
docker compose down

# Tout supprimer incluant volumes (⚠️ perte de données)
docker compose down -v
```

---

## 🐛 Dépannage

### L'application ne démarre pas
```bash
# Vérifier les logs
docker compose logs app

# Vérifier la santé de PostgreSQL
docker compose exec postgres pg_isready -U devops_calendar
```

### Erreur 500 sur /users
- Vérifier que tous les rôles en DB sont valides (ADMIN, DEV, OPS, PROJET en majuscules)
- Corriger si nécessaire :
  ```bash
  docker compose exec postgres psql -U devops_calendar -d devops_calendar \
    -c "UPDATE users SET role = UPPER(role) WHERE role != UPPER(role);"
  ```

### Modules Python non trouvés
- Vérifier le volume mount dans `docker-compose.yml` : doit être `./:/app`

---

## 📚 Documentation

### Documentation Technique

- **[doc/archi.md](doc/archi.md)** : Architecture système, image durcie DHI, Vault HA TLS, modèle de données
- **[doc/security.md](doc/security.md)** : Plan de sécurité 5 étapes, JWT, rate limiting, hardening Docker
- **[doc/runbook.md](doc/runbook.md)** : Procédures opérationnelles (déploiement, backups, rotation, incidents)
- **[doc/changelog.md](doc/changelog.md)** : Historique des versions et changements notables

### Spécifications Projet

- **[doc/projet.md](doc/projet.md)** : Cahier des charges complet (vision, fonctionnalités, design, roadmap)

### Archives

- **[doc/action-history.md](doc/action-history.md)** : Journal des actions (format ancien, voir changelog.md)
- **[doc/instructions-ia.md](doc/instructions-ia.md)** : Règles métier et périmètre (référence historique)

---

## 🗺️ Roadmap

### Sécurité
- [x] Authentification JWT (backend ✅, frontend migration en cours)
- [x] Hash de mots de passe (bcrypt via passlib)
- [x] Rate limiting (slowapi 5 req/min)
- [x] Image Docker durcie (DHI, 0 CVE OS)
- [x] Vault HA avec TLS
- [ ] Correction 3 CVE Python (ecdsa, python-jose, starlette)
- [ ] CI/CD avec scan sécurité (Trivy, SBOM)

### Fonctionnalités
- [ ] Workflow d'approbation (deployments prod)
- [ ] Notifications (email/webhook)
- [ ] Métriques DORA dans dashboard
- [ ] Audit trail (historique modifications)
- [ ] Export calendrier (iCal)

### DevOps
- [ ] CI/CD (GitHub Actions)
- [ ] Tests E2E (Playwright)
- [ ] Monitoring (Prometheus/Grafana)
- [ ] Migrations DB (Alembic)
- [ ] Backup automatique

---

## 🤝 Support

- **Logs** : `docker compose logs app`
- **Base de données** : `docker compose exec postgres psql -U devops_calendar -d devops_calendar`
- **Documentation API** : http://127.0.0.1:8000/docs

---

**Dernière mise à jour :** 7 janvier 2026  
**Dernière mise à jour :** 8 janvier 2026  
**Version :** 1.0.0  
**Statut :** 🟢 Production-Ready (image durcie + Vault HA TLS)
