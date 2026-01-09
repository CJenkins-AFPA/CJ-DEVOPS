# PREREQUISITES.md - Dépendances TP24 Swarm Infrastructure

## Vue d'ensemble

Ce document détaille toutes les dépendances système requises avant de déployer TP24 sur une nouvelle machine.

---

## 1. Système d'exploitation

**Requis** : Linux (Debian 11+, Ubuntu 20.04+, ou autre distribution compatible)

**Vérifier** :
```bash
lsb_release -a
```

---

## 2. Hyperviseur et Virtualisation

### VirtualBox
- **Version** : 6.1 ou supérieure
- **Installation** (Debian/Ubuntu) :
  ```bash
  sudo apt-get install virtualbox virtualbox-dkms
  ```
- **Vérifier** :
  ```bash
  vboxmanage --version
  ```

### Vagrant
- **Version** : 2.3 ou supérieure
- **Installation** :
  ```bash
  curl -fsSL https://apt.releases.hashicorp.com/gpg | sudo apt-key add -
  sudo apt-add-repository "deb [arch=amd64] https://apt.releases.hashicorp.com $(lsb_release -cs) main"
  sudo apt-get update && sudo apt-get install vagrant
  ```
- **Vérifier** :
  ```bash
  vagrant --version
  ```

---

## 3. Orchestration et Conteneurisation

### Docker Engine
- **Version** : 20.10+ (recommandé : 24+)
- **Installation** :
  ```bash
  # Add Docker GPG key and repository
  curl -fsSL https://download.docker.com/linux/debian/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
  echo "deb [arch=amd64 signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/debian $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
  
  sudo apt-get update
  sudo apt-get install docker-ce docker-ce-cli containerd.io docker-compose-plugin
  ```
- **Vérifier** :
  ```bash
  docker --version
  docker run hello-world
  ```
- **Post-installation** :
  ```bash
  sudo usermod -aG docker $USER
  newgrp docker
  ```

### Docker Compose
- **Version** : 2.0+ (inclus dans docker-compose-plugin)
- **Vérifier** :
  ```bash
  docker compose version
  ```

### Ansible
- **Version** : 2.9 ou supérieure (recommandé : 2.13+)
- **Installation** :
  ```bash
  sudo apt-get install ansible
  # ou
  pip install --user ansible
  ```
- **Vérifier** :
  ```bash
  ansible --version
  ```
- **Collections requises** :
  ```bash
  ansible-galaxy collection install community.general
  ```

---

## 4. Version Control

### Git
- **Version** : 2.25 ou supérieure
- **Installation** :
  ```bash
  sudo apt-get install git
  ```
- **Vérifier** :
  ```bash
  git --version
  ```
- **Configuration** :
  ```bash
  git config --global user.name "Your Name"
  git config --global user.email "your.email@example.com"
  ```

---

## 5. Utilitaires système

| Outil | Version | Usage | Installation |
|-------|---------|-------|--------------|
| **curl** | 7.68+ | Télécharger certificats, tester APIs | `sudo apt-get install curl` |
| **openssl** | 1.1.1+ | Générer/valider certificats | `sudo apt-get install openssl` |
| **jq** | 1.6+ | Parser JSON (logs, config) | `sudo apt-get install jq` |
| **make** | 4.2+ | Exécuter Makefile (optionnel) | `sudo apt-get install make` |
| **rsync** | 3.1+ | Sync fichiers (Ansible) | `sudo apt-get install rsync` |

**Vérifier tous** :
```bash
for cmd in curl openssl jq; do command -v $cmd && echo "$cmd OK" || echo "$cmd MISSING"; done
```

---

## 6. Réseau et connectivité

### IP fixe ou DHCP réservé
- Les 5 VMs Vagrant doivent avoir des IPs stables sur le réseau hôte (192.168.56.0/24)
- VirtualBox crée un réseau NAT par défaut ; Vagrant configure les IPs

### Ports disponibles
Vérifier que ces ports sont libres sur PC Dev :
```bash
netstat -tuln | grep -E ":(80|443|3000|8080|9000|2377|7946|4789)"
```

**Ports utilisés** :
| Port | Service | Description |
|------|---------|-------------|
| 80 | Traefik (HTTP) | Ingress HTTP |
| 443 | Traefik (HTTPS) | Ingress HTTPS |
| 2377 | Docker Swarm | Manager API |
| 7946 | Docker Swarm | Node communication |
| 4789 | Docker Swarm | VXLAN overlay |

### DNS local
- `/etc/hosts` doit contenir les entrées des 5 VMs (voir `scripts/setup-dev-env.sh`)
- Ou configurer un serveur DNS local (optionnel, mais recommandé en prod)

---

## 7. Certificats TLS/SSL

### Harbor CA (Self-signed)
- Généré automatiquement lors de l'installation Harbor (Ansible playbook 04)
- Copié dans le trust store système par `setup-certificates.sh`
- Chemin système : `/usr/local/share/ca-certificates/harbor.local.crt`
- Chemin Docker : `/etc/docker/certs.d/harbor.local/ca.crt`

### Traefik Certificates (Self-signed)
- Générés automatiquement par Traefik au premier démarrage
- Stockés dans le volume `traefik-certs` (Swarm)
- Chemin : `/var/lib/docker/volumes/traefik-certs/_data/`

---

## 8. SSH et authentification

### Clés Vagrant
- Générées automatiquement dans `.vagrant/machines/` lors de `vagrant up`
- Format : OpenSSH private key
- Utilisées par Ansible pour l'orchestration

### Clés git (recommandé)
```bash
ssh-keygen -t ed25519 -C "your.email@example.com"
# Ajouter la clé publique à GitHub/GitLab
```

---

## 9. Stockage et ressources

### Espace disque
| Composant | Taille estimée | Notes |
|-----------|---|---|
| VMs Vagrant (5 × 30GB) | 150 GB | Images de base + données |
| Docker images | 5 GB | Harbor, Traefik, Portainer, apps |
| Volumes persistants | 2 GB | Certs, DB, app data |
| **Total** | **~160 GB** | Adapter selon environnement |

### RAM et CPU
- **Minimum** : 8 GB RAM, 4 CPU cores
- **Recommandé** : 16 GB RAM, 8 CPU cores
- **VirtualBox default** : 1 GB RAM/VM (ajuster dans Vagrantfile)

---

## 10. Checklist pré-déploiement

```bash
# 1. Vérifier OS
lsb_release -a

# 2. Vérifier VirtualBox
vboxmanage --version

# 3. Vérifier Vagrant
vagrant --version

# 4. Vérifier Ansible
ansible --version

# 5. Vérifier Docker
docker --version && docker run hello-world

# 6. Vérifier Git
git --version && git config user.name

# 7. Vérifier utilitaires
curl --version && openssl version && jq --version

# 8. Vérifier espace disque
df -h | grep -E "/$|/home"

# 9. Vérifier ports libres
netstat -tuln | grep -E ":(80|443)"

# 10. Vérifier SSH
ls -la ~/.ssh/
```

---

## 11. Scripts d'automatisation

Tous les vérifications ci-dessus sont **automatisées** par :

```bash
# Vérifie et installe les prérequis (requiert sudo)
sudo ./scripts/check-prerequisites.sh

# Configure les certificats Harbor CA
sudo ./scripts/setup-certificates.sh

# Configure compètement le poste dev
sudo ./scripts/setup-dev-env.sh
```

---

## 12. Troubleshooting

### Docker login fails
```bash
# Cause : Certificat Harbor non installé
# Solution :
sudo ./scripts/setup-certificates.sh
docker login harbor.local -u admin -p Harbor12345
```

### Vagrant SSH fails
```bash
# Cause : Clés SSH manquantes ou permissions incorrectes
# Solution :
vagrant ssh harbor -c "echo OK"
chmod 600 .vagrant/machines/*/virtualbox/private_key
```

### Ansible inventory errors
```bash
# Cause : IPs Vagrant vs inventory.ini ne correspondent pas
# Vérifier :
vagrant status
cat ansible/inventory.ini
# Corriger si nécessaire (voir docs/DEPLOYMENT.md)
```

### Ports already in use
```bash
# Trouver le processus
sudo lsof -i :80
sudo lsof -i :443
# Terminer le processus ou changer les ports dans docker-compose
```

---

## 13. Références

- **Vagrant docs** : https://www.vagrantup.com/docs
- **Ansible docs** : https://docs.ansible.com/
- **Docker docs** : https://docs.docker.com/
- **Harbor docs** : https://goharbor.io/docs/
- **Traefik docs** : https://doc.traefik.io/traefik/

---

**Date** : 11 décembre 2025  
**Projet** : TP24 Swarm Infrastructure  
**Repository** : CJ-DEVOPS (branche docker)
