# TP24 - Swarm Infrastructure

Infrastructure complète Docker Swarm avec Traefik, Portainer, Harbor (registry privé) et MariaDB externe pour déploiement des applications Afpabike et uyoopApp.

## 🎓 Formation Pratique Docker Swarm

Ce projet contient une **formation complète en 3 labs progressifs** pour maîtriser Docker Swarm de A à Z.

### 📚 Accès aux Labs
**➡️ [CONSULTER L'INDEX DES LABS](./labs/INDEX.md)**

Les labs couvrent :
- **Lab 1** : Découverte et Architecture (4-6h) ⭐⭐☆☆☆
- **Lab 2** : Haute Disponibilité et Persistance (6-8h) ⭐⭐⭐⭐☆
- **Lab 3** : Sécurité et Monitoring (8-10h) ⭐⭐⭐⭐⭐

---

## Architecture Production

- **PC Dev** : poste de développement (build/tag/push vers Harbor)
- **5 VMs** :
  - `harbor.local` : Registry privé Harbor (HTTPS self-signed)
  - `swarm-manager.local` : Manager Swarm + Traefik + Portainer
  - `swarm-worker1.local` : Worker Swarm
  - `swarm-worker2.local` : Worker Swarm
  - `db.local` : MariaDB externe (hors Swarm)

Voir `RECAP-TP24.md` pour l'architecture détaillée.

## Prérequis

- 5 VMs Linux (Debian/Ubuntu recommandé) avec SSH
- Docker Engine sur PC Dev
- Ansible sur PC Dev
- Accès réseau entre toutes les machines
- `/etc/hosts` configuré sur PC Dev et VMs

## Quickstart

### 1. Configuration PC Dev

```bash
cd 24-swarm-infrastructure
cp .env.example .env
# Éditer .env (hostnames, mots de passe, Harbor credentials)

./scripts/setup-dev-env.sh
# Login Harbor + vérification /etc/hosts
```

### 2. Génération certificats self-signed

```bash
./certs/generate-certs.sh
# Génère ca.crt + certs pour *.local domains
```

### 3. Déploiement Infrastructure + Services

```bash
./scripts/deploy-all.sh
# Lance tous les playbooks Ansible:
# - Install Docker sur Manager/Workers
# - Init Swarm + join workers
# - Config /etc/hosts, firewall
# - Deploy Harbor, MariaDB externe
# - Deploy Traefik, Portainer
# - Deploy Afpabike, uyoopApp
```

### 4. Build et Push des images

```bash
# Depuis apps/afpabike
cd apps/afpabike
../../scripts/build-and-push.sh afpabike docker 1.0.0

# Depuis apps/uyoopapp
cd apps/uyoopapp
../../scripts/build-and-push.sh uyoopapp docker 1.0.0
```

### 5. Accès aux services

- Traefik dashboard : `https://traefik.local`
- Portainer : `https://portainer.local`
- Afpabike : `https://afpabike.local`
- uyoopApp : `https://uyoop.local`
- Harbor : `https://harbor.local`

## Structure

```
24-swarm-infrastructure/
├── README.md
├── RECAP-TP24.md (architecture détaillée)
├── QUICKSTART.md
├── .env.example
├── ansible/ (playbooks + rôles)
├── apps/ (code source Afpabike + uyoopApp)
├── certs/ (certificats self-signed)
├── config/ (Traefik, MariaDB, Harbor, apps)
├── docker-stack/ (compose files Swarm)
├── docs/ (architecture, déploiement, troubleshooting)
└── scripts/ (build-push, deploy-all, health-check, logs)
```

## Documentation

- `RECAP-TP24.md` : architecture complète, composants, flux
- `QUICKSTART.md` : steps rapides de déploiement
- `docs/ARCHITECTURE.md` : détails techniques
- `docs/DEPLOYMENT.md` : guide déploiement pas-à-pas
- `docs/TROUBLESHOOTING.md` : résolution problèmes courants
- `docs/SECURITY.md` : considérations sécurité
- `docs/MONITORING.md` : observabilité

## Commandes utiles

```bash
# Health check cluster
./scripts/health-check.sh

# Logs d'un service
./scripts/logs.sh <service-name>

# Rebuild + redeploy une app
cd apps/<app>
../../scripts/build-and-push.sh <app> <ref> <version>
docker stack deploy -c ../../docker-stack/stack-<app>.yml <app>
```

## Maintenance

- **Mise à jour app** : rebuild/push + redeploy stack
- **Backup DB** : dump MariaDB depuis `db.local`
- **Rotation logs** : configurer logrotate sur VMs
- **Renouvellement certs** : regénérer avec `certs/generate-certs.sh`

## Support

Voir `docs/TROUBLESHOOTING.md` pour les problèmes courants ou consulter les logs des services via Portainer.
