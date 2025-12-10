# TP 4 : Registry Docker Privé (TLS + Auth)

Vagrant VM pré-configurée avec Docker, Docker Compose et registry privé sécurisé.

## 🎯 Objectifs

- Configurer une VM Vagrant avec Docker
- Déployer un registry privé sécurisé
- Configurer TLS et authentification
- Tester le push/pull sur le registry

## 📋 Prérequis

- Vagrant 2.2+
- VirtualBox 6.1+
- 2 GB RAM disponible

## 🚀 Démarrage Rapide

### Démarrer la VM

```bash
vagrant up         # Crée et provisionne la VM
vagrant ssh        # Se connecte à la VM
```

### Vérifier Docker

```bash
docker --version
docker ps          # Doit afficher le container registry
```

## Accès Registry

### Depuis la VM

```bash
docker login https://localhost:443
# Username: testuser
# Password: testpassword
```

### Push/Pull d'images

```bash
docker pull alpine:latest
docker tag alpine:latest localhost:443/alpine
docker push localhost:443/alpine

# Consulter le catalogue
curl -k -u testuser:testpassword https://localhost:443/v2/_catalog
```

### Depuis l'hôte (port forwardé en 5443)

```bash
vagrant ssh -- sudo cat /opt/registry-secure/certs/localhost.crt > /tmp/ca.crt
sudo mkdir -p /etc/docker/certs.d/localhost:5443
sudo cp /tmp/ca.crt /etc/docker/certs.d/localhost:5443/ca.crt
sudo systemctl restart docker
docker login https://localhost:5443
```

## Opérations Courantes

### Arrêter la VM

```bash
vagrant halt
```

### Supprimer la VM

```bash
vagrant destroy
```

### Fichiers de configuration (dans la VM)

- Registry: `/opt/registry-secure`
- Données: `/opt/registry-secure/data`
- Certificats: `/opt/registry-secure/certs`
- Auth: `/opt/registry-secure/auth/htpasswd`
- Docker Compose: `/opt/registry-secure/docker-compose.yml`

## Exercice : Registry Docker privé (TLS + auth)

Objectif : déployer et tester un registry privé sécurisé à l'intérieur de la VM.

### 1) Démarrer et provisionner la VM
```bash
vagrant up         # crée la VM, installe Docker, compose, registry TLS+auth
```
Si besoin de repartir de zéro :
```bash
vagrant destroy -f
vagrant up
```

### 2) Se connecter et vérifier
```bash
vagrant ssh
docker ps          # doit montrer mon-registry exposé en 443
```

### 3) Authentification sur le registry (dans la VM)
```bash
docker login https://localhost:443
# Username: testuser
# Password: testpassword
```

### 4) Push d'une image de test
```bash
docker pull alpine:latest
docker tag alpine:latest localhost:443/alpine
docker push localhost:443/alpine
```

### 5) Consulter le catalogue
```bash
curl -k -u testuser:testpassword https://localhost:443/v2/_catalog
```

### 6) Fichiers/chemins utiles (dans la VM)
- Registry et données : `/opt/registry-secure` (data, certs, auth, docker-compose.yml)
- Certificat autosigné : `/opt/registry-secure/certs/localhost.crt`
- htpasswd : `/opt/registry-secure/auth/htpasswd`
- Service : `docker compose -f /opt/registry-secure/docker-compose.yml ps|logs`

### 7) Accès depuis l'hôte (facultatif)
Le port 443 de la VM est forwardé sur l'hôte en 5443. Si Docker est installé sur l'hôte :
```bash
vagrant ssh -- sudo cat /opt/registry-secure/certs/localhost.crt > /tmp/ca.crt
sudo mkdir -p /etc/docker/certs.d/localhost:5443
sudo cp /tmp/ca.crt /etc/docker/certs.d/localhost:5443/ca.crt
sudo systemctl restart docker
docker login https://localhost:5443
docker push localhost:5443/alpine
```
