# 🐳 TPs Docker - Formation DevOps

Bienvenue dans la formation Docker ! Cette branche contient l'ensemble des travaux pratiques pour maîtriser Docker de A à Z.

## 📚 Liste des TPs

### [01 - Installation de Docker](./01-docker-install/)
Installation et configuration de Docker Engine sur Linux.
- Installation automatique et manuelle
- Configuration post-installation
- Vérification et tests
- **Durée estimée** : 30 min

### [02 - Commandes Docker de Base](./02-docker-basics/)
Maîtrise des commandes essentielles Docker.
- Gestion des images et conteneurs
- Logs et inspection
- Cycle de vie des conteneurs
- Exercices pratiques (Nginx, PostgreSQL, Python)
- **Durée estimée** : 1h30

### [03 - Docker Compose](./03-docker-compose/)
Orchestration d'applications multi-conteneurs.
- Syntaxe docker-compose.yml
- Stack WordPress, Monitoring
- Variables d'environnement et secrets
- Commandes Compose avancées
- **Durée estimée** : 2h

### [04 - Docker Registry Privé](./04-docker-registry-prive/)
Déploiement d'un registry Docker sécurisé.
- Configuration TLS avec certificats auto-signés
- Authentication htpasswd
- Déploiement avec Vagrant + Ansible
- Push/Pull d'images personnalisées
- **Durée estimée** : 2h

### [05 - Réseaux Docker](./05-docker-network/)
Maîtrise des réseaux et communication inter-conteneurs.
- Types de réseaux (bridge, host, overlay)
- Isolation et segmentation
- DNS et service discovery
- Reverse proxy avec Nginx
- **Durée estimée** : 1h30

### [06 - Volumes Docker](./06-docker-volumes/)
Persistance des données et gestion du stockage.
- Volumes, bind mounts, tmpfs
- Backup et restore
- Permissions et sécurité
- Drivers NFS et CIFS
- **Durée estimée** : 1h30

### [07 - Création de Dockerfiles](./07-dockerfiles/)
Construction d'images Docker personnalisées.
- Syntaxe et instructions
- Multi-stage builds
- Optimisation et best practices
- Exemples : Python, Node.js, Go, PHP
- **Durée estimée** : 2h30

### [08 - Docker Swarm](./08-docker-swarm/)
Orchestration et haute disponibilité.
- Initialisation d'un cluster Swarm
- Services et stacks
- Scaling et rolling updates
- Secrets et configs
- Haute disponibilité
- **Durée estimée** : 3h

## 🎯 Objectifs Globaux

À la fin de cette formation, vous serez capable de :

✅ Installer et configurer Docker  
✅ Gérer des conteneurs et images  
✅ Orchestrer des applications multi-conteneurs avec Docker Compose  
✅ Déployer un registry privé sécurisé  
✅ Maîtriser les réseaux et volumes Docker  
✅ Créer des Dockerfiles optimisés  
✅ Déployer des applications en haute disponibilité avec Docker Swarm  

## 📋 Prérequis

- **Linux** : Ubuntu 20.04+ ou Debian 11+
- **RAM** : 4 GB minimum (8 GB recommandé)
- **Disk** : 20 GB d'espace libre
- **Connaissances** : 
  - Ligne de commande Linux
  - Concepts réseaux de base
  - Notions de développement (pour les Dockerfiles)

## 🚀 Démarrage Rapide

### Installation Docker (Méthode rapide)

```bash
# Script d'installation automatique
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Ajouter votre utilisateur au groupe docker
sudo usermod -aG docker $USER
newgrp docker

# Vérifier l'installation
docker --version
docker run hello-world
```

### Cloner ce repository

```bash
git clone https://github.com/CJenkins-AFPA/CJ-DEVOPS.git
cd CJ-DEVOPS
git checkout docker
```

## 📖 Parcours Recommandé

### 🟢 Débutant (Jour 1-2)
1. TP 01 - Installation
2. TP 02 - Commandes de base
3. TP 03 - Docker Compose (partie 1)

### 🟡 Intermédiaire (Jour 3-4)
4. TP 03 - Docker Compose (partie 2)
5. TP 05 - Réseaux
6. TP 06 - Volumes
7. TP 04 - Registry Privé

### 🔴 Avancé (Jour 5-7)
8. TP 07 - Dockerfiles avancés
9. TP 08 - Docker Swarm

## 🔧 Outils Complémentaires

### VS Code Extensions
- Docker (ms-azuretools.vscode-docker)
- YAML (redhat.vscode-yaml)

### CLI Tools
```bash
# Docker Compose v2
sudo apt install docker-compose-plugin

# ctop (monitoring conteneurs)
sudo wget https://github.com/bcicen/ctop/releases/download/v0.7.7/ctop-0.7.7-linux-amd64 -O /usr/local/bin/ctop
sudo chmod +x /usr/local/bin/ctop

# dive (analyser les layers d'images)
wget https://github.com/wagoodman/dive/releases/download/v0.11.0/dive_0.11.0_linux_amd64.deb
sudo apt install ./dive_0.11.0_linux_amd64.deb
```

## 📊 Structure du Projet

```
docker/
├── 01-docker-install/          # Installation Docker
│   └── README.md
├── 02-docker-basics/           # Commandes essentielles
│   └── README.md
├── 03-docker-compose/          # Orchestration multi-conteneurs
│   └── README.md
├── 04-docker-registry-prive/   # Registry sécurisé
│   ├── README.md
│   ├── Vagrantfile
│   ├── playbook.yml
│   └── inventory.ini
├── 05-docker-network/          # Réseaux Docker
│   └── README.md
├── 06-docker-volumes/          # Persistance des données
│   └── README.md
├── 07-dockerfiles/             # Construction d'images
│   └── README.md
└── 08-docker-swarm/            # Orchestration Swarm
    └── README.md
```

## 🎓 Ressources Externes

### Documentation Officielle
- [Docker Docs](https://docs.docker.com/)
- [Docker Hub](https://hub.docker.com/)
- [Docker Compose](https://docs.docker.com/compose/)

### Tutoriels et Guides
- [Play with Docker](https://labs.play-with-docker.com/)
- [Docker Curriculum](https://docker-curriculum.com/)
- [Awesome Docker](https://github.com/veggiemonk/awesome-docker)

### Livres Recommandés
- "Docker Deep Dive" - Nigel Poulton
- "Docker in Action" - Jeff Nickoloff
- "Kubernetes Patterns" - Bilgin Ibryam (pour après Docker)

## 💡 Conseils d'Apprentissage

1. **Pratiquez régulièrement** : Docker s'apprend en faisant
2. **Expérimentez** : Cassez des choses, c'est normal !
3. **Lisez les logs** : `docker logs` est votre ami
4. **Utilisez docker inspect** : Pour comprendre ce qui se passe
5. **Nettoyez régulièrement** : `docker system prune` pour libérer de l'espace

## 🐛 Debugging Courant

### Conteneur qui ne démarre pas
```bash
docker logs <container-id>
docker inspect <container-id>
```

### Port déjà utilisé
```bash
sudo netstat -tulpn | grep <port>
sudo lsof -i :<port>
```

### Espace disque saturé
```bash
docker system df
docker system prune -a --volumes
```

### Réseau qui ne fonctionne pas
```bash
docker network inspect <network-name>
docker exec <container> ping <other-container>
```

## 🤝 Contribution

Cette formation est open-source. N'hésitez pas à :
- Signaler des erreurs (Issues)
- Proposer des améliorations (Pull Requests)
- Partager vos retours d'expérience

## 📧 Contact

- **Author** : CJenkins-AFPA
- **GitHub** : [CJenkins-AFPA/CJ-DEVOPS](https://github.com/CJenkins-AFPA/CJ-DEVOPS)
- **Branch** : `docker`

## 📝 Licence

Ce projet est sous licence MIT - voir le fichier [LICENSE](../LICENSE) pour plus de détails.

---

## 🎯 Checklist de Progression

- [ ] TP 01 - Installation Docker
- [ ] TP 02 - Commandes de base
- [ ] TP 03 - Docker Compose
- [ ] TP 04 - Registry Privé
- [ ] TP 05 - Réseaux Docker
- [ ] TP 06 - Volumes Docker
- [ ] TP 07 - Dockerfiles
- [ ] TP 08 - Docker Swarm

**Bon apprentissage ! 🚀**
