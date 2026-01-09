# Guide de Déploiement Complet

## Prérequis

### Machines requises
- 1 PC Dev (Linux/Mac/WSL)
- 5 VMs Linux (Debian 11/12 ou Ubuntu 20.04/22.04):
  - harbor.local (192.168.56.10) - 4GB RAM, 50GB disque
  - swarm-manager.local (192.168.56.20) - 2GB RAM, 20GB disque
  - swarm-worker1.local (192.168.56.21) - 2GB RAM, 20GB disque
  - swarm-worker2.local (192.168.56.22) - 2GB RAM, 20GB disque
  - db.local (192.168.56.30) - 2GB RAM, 20GB disque

### Logiciels PC Dev
- Docker Engine
- Docker Compose
- Ansible 2.9+
- Git
- OpenSSL

### Accès réseau
- SSH root (ou sudo) sur toutes les VMs
- Connectivité réseau entre toutes les machines
- Ports ouverts : 22 (SSH), 80/443 (HTTP/S), 2377/7946/4789 (Swarm), 3306 (MariaDB)

## Étape 1 : Préparation PC Dev

```bash
cd /path/to/24-swarm-infrastructure

# 1. Configuration environnement
cp .env.example .env
nano .env  # Ajuster les valeurs (passwords, IPs, hostnames)

# 2. Générer certificats self-signed
./certs/generate-certs.sh

# 3. Setup PC Dev (login Harbor, /etc/hosts)
./scripts/setup-dev-env.sh
```

## Étape 2 : Configuration SSH

```bash
# Copier clés SSH sur toutes les VMs
ssh-copy-id root@harbor.local
ssh-copy-id root@swarm-manager.local
ssh-copy-id root@swarm-worker1.local
ssh-copy-id root@swarm-worker2.local
ssh-copy-id root@db.local

# Tester connectivité
ansible all -i ansible/inventory.ini -m ping
```

## Étape 3 : Déploiement Infrastructure (Ansible)

```bash
# Option A : Déploiement complet automatique
./scripts/deploy-all.sh

# Option B : Étape par étape
cd ansible

# Vérification prérequis
ansible-playbook -i inventory.ini playbooks/00-prerequisites.yml

# Installation Docker sur Manager + Workers
ansible-playbook -i inventory.ini playbooks/01-docker-setup.yml

# Init Swarm (Manager + join Workers)
ansible-playbook -i inventory.ini playbooks/02-swarm-init.yml

# Config réseau et /etc/hosts
ansible-playbook -i inventory.ini playbooks/03-network-setup.yml

# Setup Harbor (manuel ou assisté)
ansible-playbook -i inventory.ini playbooks/04-registry-setup.yml

# Setup MariaDB externe
ansible-playbook -i inventory.ini playbooks/05-database-setup.yml
```

## Étape 4 : Installation Harbor (manuelle)

```bash
# Sur la VM harbor.local
ssh root@harbor.local

# Télécharger Harbor
cd /opt
wget https://github.com/goharbor/harbor/releases/download/v2.10.0/harbor-offline-installer-v2.10.0.tgz
tar xzvf harbor-offline-installer-v2.10.0.tgz
cd harbor

# Copier les certificats
mkdir -p /etc/harbor/ssl
cp /path/to/certs/harbor.local.crt /etc/harbor/ssl/harbor.crt
cp /path/to/certs/harbor.local.key /etc/harbor/ssl/harbor.key

# Configurer harbor.yml
cp harbor.yml.tmpl harbor.yml
nano harbor.yml
# hostname: harbor.local
# https.certificate: /etc/harbor/ssl/harbor.crt
# https.private_key: /etc/harbor/ssl/harbor.key
# harbor_admin_password: Harbor12345

# Installer
./install.sh

# Vérifier
docker-compose ps
```

## Étape 5 : Build et Push des Images

```bash
cd /path/to/24-swarm-infrastructure

# Login Harbor depuis PC Dev
docker login harbor.local -u admin -p Harbor12345

# Build Afpabike
cd apps/afpabike
../../scripts/build-and-push.sh afpabike docker 1.0.0

# Build uyoopApp
cd ../uyoopapp
../../scripts/build-and-push.sh uyoopapp docker 1.0.0
```

## Étape 6 : Déploiement Services Swarm

```bash
cd /path/to/24-swarm-infrastructure/ansible

# Déployer Traefik
ansible-playbook -i inventory.ini playbooks/10-deploy-traefik.yml

# Déployer Portainer
ansible-playbook -i inventory.ini playbooks/11-deploy-portainer.yml

# Déployer Applications (avec tags spécifiques)
ansible-playbook -i inventory.ini playbooks/12-deploy-apps.yml \
  -e "afpabike_image_tag=1.0.0-docker" \
  -e "uyoop_image_tag=1.0.0-docker"
```

## Étape 7 : Vérification

```bash
# Health check
ansible-playbook -i inventory.ini playbooks/99-health-check.yml

# Ou manuellement sur Manager
ssh root@swarm-manager.local
docker service ls
docker service ps traefik portainer afpabike uyoop

# Accès web
curl -k https://traefik.local
curl -k https://portainer.local
curl -k https://afpabike.local
curl -k https://uyoop.local
```

## Dépannage

### Services ne démarrent pas
```bash
# Logs d'un service
docker service logs -f <service-name>

# Inspecter une task en échec
docker service ps --no-trunc <service-name>
```

### Problèmes réseau
```bash
# Vérifier les réseaux overlay
docker network ls
docker network inspect frontend
docker network inspect backend
```

### DB inaccessible
```bash
# Tester depuis Manager
mysql -h db.local -u afpabike_user -p
# password: ChangeMeAfpabike
```

### Images non trouvées
```bash
# Vérifier login Harbor sur workers
docker login harbor.local

# Pull manuel pour tester
docker pull harbor.local/library/afpabike:1.0.0-docker
```
