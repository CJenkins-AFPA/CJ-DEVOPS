# RÉCAPITULATIF COMPLET : TP24 Swarm-Infrastructure

---

## **1. COMPOSANTES PHYSIQUES (5 VMs)**

| VM | Hostname | Rôle | Services | Accès |
|----|-|-|-|-|
| **PC Dev** | ce poste | Build/Tag/Push images | Docker, git, build-push.sh script | localhost |
| **Harbor** | harbor.local | Registry privé | Harbor (self-signed HTTPS) | https://harbor.local |
| **Swarm Manager** | swarm-manager.local | Orchestration Swarm | Docker Swarm (Manager), Traefik, Portainer, certs self-signed | IP fixe (ex: 192.168.1.20) |
| **Swarm Worker1** | swarm-worker1.local | Exécution services | Docker Swarm (Worker) | IP fixe (ex: 192.168.1.21) |
| **Swarm Worker2** | swarm-worker2.local | Exécution services | Docker Swarm (Worker) | IP fixe (ex: 192.168.1.22) |
| **MariaDB** | db.local | Base de données | MariaDB server (shared for Afpabike + uyoopApp migré) | IP fixe (ex: 192.168.1.30) |

---

## **2. FLUX BUILD/TAG/PUSH (PC Dev → Harbor)**

```
┌─────────────────────────────────────┐
│  PC Dev (ce poste)                  │
│  ├─ git clone/checkout branche      │
│  ├─ ./build-and-push.sh <app> <v>   │
│  └─ Génère tag : v1.0.0-main        │
└─────────────────────────────────────┘
             ↓ docker build
             ↓ docker push
┌─────────────────────────────────────┐
│  Harbor (registry.local)            │
│  ├─ library/afpabike:1.0.0-main     │
│  └─ library/uyoopapp:1.0.0-main     │
│      (Traefik/Portainer tirés du Hub officiel, 
│       pas stockés dans Harbor)      │
└─────────────────────────────────────┘
```

**Script build-push.sh** :
- Input : `./build-and-push.sh afpabike main 1.0.0`
- Output : pousse `harbor.local/library/afpabike:1.0.0-main`
- Traçabilité : commit SHA + branche + version sémantique dans le tag

---

## **3. CLUSTER SWARM (Orchestration + Déploiement)**

```
┌─────────────────────────────────────────────────────────────┐
│  DOCKER SWARM CLUSTER                                       │
│                                                             │
│  ┌────────────────────────────────────────────────────┐     │
│  │  MANAGER (swarm-manager.local)                     │     │
│  │  ├─ Init Swarm (docker swarm init)                 │     │
│  │  ├─ docker stack deploy (tous les services)        │     │
│  │  ├─ Orchestre/monitor les workers                  │     │
│  │  └─ Expose ports 80/443 (ingress)                  │     │
│  └────────────────────────────────────────────────────┘     │
│                          ↓                                  │
│  ┌──────────────────────┴──────────────────────┐            │
│  │ Overlay Network (docker_gwbridge, ingress)  │            │
│  └──────────────────────┬──────────────────────┘            │
│          ↙                          ↖                       │
│  ┌─────────────────┐        ┌─────────────────┐             │
│  │ WORKER1         │        │ WORKER2         │             │
│  │ (swarm-w1.local)│        │ (swarm-w2.local)│             │
│  │ ├─ Pull images  │        │ ├─ Pull images  │             │
│  │ └─ Run services │        │ └─ Run services │             │
│  └─────────────────┘        └─────────────────┘             │
└─────────────────────────────────────────────────────────────┘
```

---

## **4. SERVICES DÉPLOYÉS DANS SWARM (docker stack)**

### **4.1 Traefik (Reverse Proxy + HTTPS self-signed)**
- **Service** : `traefik`
- **Port exposé** : 80 (HTTP), 443 (HTTPS)
- **Config** : 
  - Écoute le label Docker `traefik.enable=true` sur chaque service
  - Génère cert self-signed (`*.local.crt`) au startup
  - Routing : `hostname.local` → service correspondant (via labels Traefik)
- **Réseau** : `frontend` (overlay) 
- **Volume** : `/var/lib/docker/volumes/traefik-certs/_data` (persiste certs)

### **4.2 Portainer (UI Management Swarm)**
- **Service** : `portainer`
- **Accès** : `https://portainer.local` (via Traefik)
- **Auth** : user/password configurable (ex: admin/password123)
- **Rôle** : UI pour voir/gérer services, logs, health
- **Réseau** : `frontend` + `backend` (pour parler au Docker daemon)
- **Volume** : `/var/lib/docker/volumes/portainer-data/_data` (persiste config)

### **4.3 MariaDB (Base de données externe hors Swarm)**
- **VM dédiée** : `db.local` (ex: 192.168.1.30), hors cluster Swarm
- **Base de données** : `afpabike_db` (Afpabike) + `uyoopapp_db` (uyoopApp migré MariaDB)
- **Users** : 
  - `afpabike_user` (password) → accès `afpabike_db`
  - `uyoop_user` (password) → accès `uyoopapp_db`
  - `root` (password) → full access
- **Port exposé** : 3306 sur la VM, reachable depuis Manager/Workers (pare-feu ouvert)
- **Persistance** : volume local sur la VM (pas de volume Swarm)
- **Init** : `config/mariadb/init.sql` (CREATE DB/USERS) à exécuter sur la VM ou via Ansible ciblant la VM DB

### **4.4 Afpabike (App fonctionnelle)**
- **Image** : `harbor.local/library/afpabike:1.0.0-main`
- **Accès** : `https://afpabike.local` (via Traefik + labels)
- **Env vars** : 
  - `DB_HOST=db.local` (VM externe)
  - `DB_USER=afpabike_user`
  - `DB_PASSWORD=***`
  - `DB_NAME=afpabike_db`
- **Réseau** : `backend` (pour parler à MariaDB)
- **Volume** : (optionnel) `/app/data/` (persiste uploads/cache)
- **Labels Traefik** : 
  ```yaml
  traefik.enable: "true"
  traefik.http.routers.afpabike.rule: "Host(`afpabike.local`)"
  traefik.http.services.afpabike.loadbalancer.server.port: "3000"
  ```

### **4.5 uyoopApp (App fonctionnelle)**
- **Image** : `harbor.local/library/uyoopapp:1.0.0-main`
- **Accès** : `https://uyoop.local` (via Traefik + labels)
- **Env vars** : 
  - `DB_HOST=db.local` (VM externe)
  - `DB_USER=uyoop_user`
  - `DB_PASSWORD=***`
  - `DB_NAME=uyoopapp_db`
- **Réseau** : `backend` (pour parler à MariaDB)
- **Volume** : (optionnel) `/app/data/uyoop.db` (persiste SQLite migré ou données MariaDB)
- **Labels Traefik** : 
  ```yaml
  traefik.enable: "true"
  traefik.http.routers.uyoop.rule: "Host(`uyoop.local`)"
  traefik.http.services.uyoop.loadbalancer.server.port: "8000"
  ```

---

## **5. RÉSEAU & DNS (/etc/hosts)**

**PC Dev et chaque VM doivent avoir dans `/etc/hosts`** :
```
192.168.56.10    harbor.local
192.168.56.20    swarm-manager.local portainer.local afpabike.local uyoop.local traefik.local
192.168.56.21    swarm-worker1.local
192.168.56.22    swarm-worker2.local
192.168.56.30    db.local
```

**Justification** :
- Accès local via hostname (pas d'IP brute).
- Traefik sur Manager écoute ces hostnames et route.
- `.local` = convention interne (pas de DNS publique).

---

## **6. ORCHESTRATION ANSIBLE (PC Dev)**

**Playbooks exécutés dans l'ordre** (de PC Dev via SSH) :

| # | Playbook | Cible | Action |
|---|----------|-------|--------|
| 0 | `00-prerequisites.yml` | ALL | Vérify SSH, OS, ports disponibles |
| 1 | `01-docker-setup.yml` | Manager + Workers | Install Docker Engine + Docker Compose |
| 2 | `02-swarm-init.yml` | Manager + Workers | Init Swarm (Manager seul d'abord, puis workers join) |
| 3 | `03-network-setup.yml` | ALL | Update `/etc/hosts`, configure firewall (UFW) |
| 4 | `04-registry-setup.yml` | Harbor VM | Deploy Harbor (si on automatise la VM) |
| 5 | `05-database-setup.yml` | MariaDB VM | Init DB/users sur la VM (pas dans Swarm) |
| 10 | `10-deploy-traefik.yml` | Manager | `docker stack deploy -c stack-traefik.yml traefik` |
| 11 | `11-deploy-portainer.yml` | Manager | `docker stack deploy -c stack-portainer.yml portainer` |
| 12 | `12-deploy-apps.yml` | Manager | `docker stack deploy -c stack-afpabike.yml afpabike` + `stack-uyoopapp.yml uyoop` |
| 99 | `99-health-check.yml` | Manager | `docker service ls`, healthcheck, logs verification |

**Exécution** :
```bash
./scripts/deploy-all.sh  # Lance les playbooks dans l'ordre (optionnel)
```

---

## **7. VOLUMES PERSISTANTS (Swarm)**

| Volume | Service | Chemin host | Chemin container | Contenu |
|--------|---------|------------|------------------|---------|
| `traefik-certs` | Traefik | `/var/lib/docker/volumes/traefik-certs/_data` | `/etc/traefik/certs/` | Certs self-signed |
| `portainer-data` | Portainer | `/var/lib/docker/volumes/portainer-data/_data` | `/data/` | Config Portainer |
| `afpabike-data` | Afpabike | `/var/lib/docker/volumes/afpabike-data/_data` | `/app/data/` | Uploads, cache |
| `uyoop-data` | uyoopApp | `/var/lib/docker/volumes/uyoop-data/_data` | `/app/data/` | Données app |

---

## **8. FICHIERS À CRÉER DANS `/24-swarm-infrastructure`**

```
24-swarm-infrastructure/
├─ README.md (guide complet, architecture, quickstart)
├─ QUICKSTART.md (steps rapides)
├─ .env.example
│
├─ ansible/
│  ├─ inventory.ini (5 VMs : Manager, W1, W2, Harbor, MariaDB)
│  ├─ ansible.cfg
│  ├─ group_vars/ + host_vars/
│  ├─ playbooks/ (00-*, 01-*, ..., 99-*)
│  └─ roles/ (docker-engine, swarm-manager, swarm-worker, etc)
│
├─ docker-stack/
│  ├─ stack-traefik.yml
│  ├─ stack-portainer.yml
│  ├─ stack-afpabike.yml
│  ├─ stack-uyoopapp.yml
│  └─ stack-all.yml (optional, merge all)
│
├─ config/
│  ├─ traefik/ (traefik.yml, dynamic.yml, acme.json)
│  ├─ mariadb/ (init.sql, my.cnf)
│  ├─ harbor/ (harbor.yml, certs)
│  └─ app/ (afpabike/.env, uyoopapp/.env)
│
├─ certs/ (self-signed certs)
│  ├─ ca.key, ca.crt
│  ├─ *.local.key, *.local.crt
│  └─ generate-certs.sh
│
├─ scripts/
│  ├─ build-and-push.sh (from 23-build-push-automation, adapted)
│  ├─ deploy-all.sh (wrapper Ansible)
│  ├─ health-check.sh
│  ├─ logs.sh
│  └─ setup-dev-env.sh (prep PC Dev)
│
└─ docs/ (architecture, deployment, troubleshooting, security, monitoring)
```

---

## **9. CHECKLIST AVANT LANCEMENT**

- ✅ Registry Harbor : `harbor.local` (self-signed HTTPS) pour les images applicatives uniquement
- ✅ Swarm Manager : Traefik + Portainer (images officielles Docker Hub)
- ✅ Swarm Workers : 2 nodes pour exécuter services
- ✅ MariaDB : VM externe (db.local), 2 DBs (Afpabike + uyoopApp migré) reachable depuis Swarm
- ✅ Apps : Afpabike + uyoopApp custom-built et poussées sur Harbor
- ✅ Build/Push script : `build-and-push.sh` (tag = VERSION-BRANCH)
- ✅ Ansible : orchestration complète (init Swarm, deploy stacks, init DB VM)
- ✅ /etc/hosts : tous les hostnames (harbor.local, swarm-manager.local, etc)
- ✅ Volumes persistants : Traefik, Portainer, Apps (DB persistance gérée sur la VM MariaDB)
- ✅ Documentation : README, QUICKSTART, ARCHITECTURE, TROUBLESHOOTING

---

**Date de création** : 10 décembre 2025  
**Projet** : TP24 - Swarm Infrastructure avec Harbor Registry + Traefik + Portainer  
**Repository** : CJ-DEVOPS (branche docker)
