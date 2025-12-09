# TP24 - Docker Swarm Infrastructure

Automatisation complète d'un cluster Docker Swarm 3 nœuds (manager + 2 workers) avec PostgreSQL via Vagrant + Ansible.

## Architecture

```
VMs: 4 × Ubuntu 22.04 (Vagrant)
├─ swarm-manager   192.168.56.20 (Manager Swarm)
├─ swarm-worker1   192.168.56.21 (Worker)
├─ swarm-worker2   192.168.56.22 (Worker)
└─ swarm-db        192.168.56.23 (PostgreSQL 15)

Network: 192.168.56.0/24 (private)
```

## Installation (10-20 min)

### Prérequis

```bash
- Vagrant >= 2.3
- VirtualBox >= 6.1 (ou libvirt)
- Ansible >= 2.12
- 10GB RAM libre
```

### Démarrage

```bash
# 1. Créer et démarrer les VMs
vagrant up

# 2. Provisionner (choisir UNE option):

# Option A: Playbooks individuels
ansible-playbook -i ansible/inventory.ini ansible/playbooks/00-prepare.yml
ansible-playbook -i ansible/inventory.ini ansible/playbooks/01-docker-install.yml
ansible-playbook -i ansible/inventory.ini ansible/playbooks/02-swarm-init.yml
ansible-playbook -i ansible/inventory.ini ansible/playbooks/03-db-deploy.yml
ansible-playbook -i ansible/inventory.ini ansible/playbooks/04-registry-config.yml

# Option B: Automatisé (recommandé)
bash scripts/setup-cluster.sh
```

### Vérification

```bash
# Connexion au manager
vagrant ssh swarm-manager

# Dans la VM:
docker node ls        # Voir les nœuds
docker service ls     # Services actifs
bash ../scripts/monitor-health.sh  # Monitoring complet
```

## Fichiers & Structure

| Fichier | Objectif |
|---------|----------|
| `Vagrantfile` | 4 VMs Ubuntu 22.04 |
| `ansible/playbooks/00-prepare.yml` | Système (NTP, DNS, kernel) |
| `ansible/playbooks/01-docker-install.yml` | Docker CE + Compose |
| `ansible/playbooks/02-swarm-init.yml` | Initialiser Swarm ⭐ |
| `ansible/playbooks/03-db-deploy.yml` | PostgreSQL 15 |
| `ansible/playbooks/04-registry-config.yml` | Registre privé |
| `scripts/setup-cluster.sh` | Auto-provisionnement |
| `scripts/monitor-health.sh` | Monitoring |

## Commandes Essentielles

### Vagrant

```bash
vagrant up [name]                 # Créer/démarrer VMs
vagrant ssh [name]                # Connexion SSH
vagrant halt [name]               # Arrêter VM
vagrant destroy -f [name]         # Supprimer VM
vagrant status                    # Voir statut
```

### Docker Swarm (depuis manager)

```bash
docker node ls                    # Lister nœuds
docker swarm status               # État du cluster
docker service create --name web --replicas 3 nginx
docker service ls                 # Services actifs
docker service ps <name>          # Tâches du service
docker service logs -f <name>     # Logs en temps réel
```

## Test Rapide

```bash
# 1. Créer réseau overlay
vagrant ssh swarm-manager -c "docker network create --driver overlay test-net"

# 2. Déployer nginx (3 replicas)
vagrant ssh swarm-manager -c "docker service create --name test-nginx --replicas 3 --publish 8080:80 nginx"

# 3. Tester (load balanced):
curl http://192.168.56.20:8080
curl http://192.168.56.21:8080
curl http://192.168.56.22:8080

# 4. Nettoyer
vagrant ssh swarm-manager -c "docker service rm test-nginx"
```

## Playbooks Détaillés

### 00-prepare.yml (2-3 min)

- Hostname configuration
- NTP synchronization
- DNS setup
- System packages
- Kernel parameters

### 01-docker-install.yml (3-4 min)

- Docker CE installation
- Docker Compose
- Docker CLI plugins
- User permissions

### 02-swarm-init.yml ⭐ (1-2 min)

**CRITIQUE**: Initialise le Swarm
- Manager: `docker swarm init`
- Récupère token worker
- Workers: `docker swarm join --token`
- Vérification cluster

### 03-db-deploy.yml (1-2 min)

- PostgreSQL 15 container
- Volume persistant
- Environment variables
- Backup scripts

### 04-registry-config.yml (1 min)

- Update `/etc/docker/daemon.json`
- Insecure registries (harbor.local)
- Redémarrer Docker daemon
- Test push

## Accès aux Services

| Service | URL/IP | Port |
|---------|--------|------|
| Swarm Manager | 192.168.56.20 | 2377 |
| PostgreSQL | 192.168.56.23 | 5432 |
| Harbor Registry | harbor.local | 443 |

## Troubleshooting

| Problème | Solution |
|----------|----------|
| VMs ne démarrent | Réduire RAM/CPU dans Vagrantfile, vérifier VirtualBox |
| Ansible ne se connecte | Vérifier `inventory.ini`, `vagrant up` d'abord |
| Worker ne joindre pas | `docker swarm join-token worker` sur manager |
| Docker inaccessible | SSH → VM → `sudo systemctl restart docker` |
| Harbor push échoue | Vérifier `/etc/hosts` include `harbor.local` |

## Monitoring

```bash
# Health check continu
vagrant ssh swarm-manager
bash ../scripts/monitor-health.sh --continuous

# Voir les services
docker service ls
docker service ps <service_name>

# Logs
docker service logs -f <service_name>
journalctl -u docker -f
```

## Sauvegardes

```bash
# Backup DB
bash scripts/backup-db.sh          # → backups/postgres_backup_TIMESTAMP.sql.gz

# Restore DB
bash scripts/restore-db.sh backups/postgres_backup_TIMESTAMP.sql.gz
```

## Intégration

Fonctionne avec:
- **TP16 (Harbor)**: Registre privé Docker
- **TP14 (Prometheus/Grafana)**: Monitoring de l'infrastructure
- **TP23 (Build & Push)**: Automatisation build/push vers ce registre

## Ressources

- [Docker Swarm Docs](https://docs.docker.com/engine/swarm/)
- [Vagrant Docs](https://www.vagrantup.com/docs)
- [Ansible Docs](https://docs.ansible.com/)
- [Blog Stéphane Robert](https://blog.stephane-robert.info/docs/conteneurs/orchestrateurs/docker-swarm/)

**Status**: Production-ready ✅
