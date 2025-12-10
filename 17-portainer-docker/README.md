# TP 17 : Portainer Community (Gestion Docker Web)

Interface légère de gestion Docker pour la gestion des conteneurs, images, volumes et réseaux via interface web.

## 🎯 Vue d'ensemble

**Portainer** est une interface de gestion open-source légère qui permet de gérer facilement vos environnements Docker (machines individuelles ou clusters Swarm).

## ✨ Fonctionnalités

✅ **Gestion des Conteneurs**
- Lister les conteneurs actifs
- Démarrer/arrêter/redémarrer
- Créer de nouveaux conteneurs
- Supprimer des conteneurs
- Consulter les logs en temps réel

✅ **Gestion des Images**
- Tirer des images depuis des registres
- Pousser des images
- Supprimer des images
- Consulter les détails et couches

✅ **Gestion des Volumes**
- Créer/supprimer des volumes
- Consulter les détails
- Gérer les montages

✅ **Gestion des Réseaux**
- Créer/supprimer des réseaux
- Consulter les détails
- Connecter les conteneurs

✅ **Gestion des Stacks** (Docker Compose)
- Déployer des fichiers compose
- Gérer les apps multi-conteneurs
- Consulter les logs

---

## 🚀 Démarrage Rapide

### 1. Configuration

```bash
cd 17-portainer-docker
cp .env.example .env
```

### 2. Déployer

```bash
docker compose up -d
```

### 3. Accéder à Portainer

- **HTTP**: http://localhost:9000
- **HTTPS**: https://localhost:9443
- **Port agent**: 8000

### 4. Configuration initiale

1. Définir le mot de passe admin au premier accès
2. Connecter à l'environnement Docker local
3. Commencer à gérer les conteneurs

---

## 🌐 Accès à Portainer

```bash
# HTTP
http://localhost:9000

# HTTPS
https://localhost:9443

# Credentials (premier accès):
Username: admin
Password: [Depuis PORTAINER_ADMIN_PASSWORD dans .env]
```

---

## 🔧 Gestion des Services

### Vérifier le statut

```bash
docker compose ps
```

### Consulter les logs

```bash
docker compose logs -f portainer
```

### Arrêter Portainer

```bash
docker compose down
```

### Redémarrer

```bash
docker compose restart portainer
```

---

## 💡 Utilisation des Fonctionnalités

### Conteneurs

- Lister tous les conteneurs
- Consulter les statistiques temps réel
- Accéder aux logs
- Exécuter des commandes
- Inspecter les détails

### Images

- Parcourir les images disponibles
- Tirer des images depuis Docker Hub
- Supprimer les images inutilisées
- Consulter les détails et couches

### Volumes

- Créer des volumes persistants
- Lister les volumes
- Supprimer les volumes
- Parcourir les contenus

### Réseaux

- Créer des réseaux personnalisés
- Lister les réseaux
- Supprimer les réseaux
- Connecter les conteneurs

### Stacks

- Déployer des fichiers Docker Compose
- Gérer les apps multi-conteneurs
- Consulter le statut
- Éditer les configurations

---

## 👥 Gestion des Utilisateurs

### Créer des Utilisateurs

Via l'interface Portainer:

1. Admin > Utilisateurs
2. Cliquer "Add user"
3. Définir les credentials et le rôle:
   - **Admin**: Permissions complètes
   - **Editor**: Gestion des conteneurs
   - **Viewer**: Accès lecture seule

---

## 💾 Backup & Restore

### Backup des Données Portainer

```bash
# Copier le volume
docker cp portainer:/data ./portainer-backup-$(date +%Y%m%d)

# Ou utiliser tar
docker run --rm -v portainer-data:/data -v $(pwd):/backup \
  alpine tar czf /backup/portainer-backup-$(date +%Y%m%d).tar.gz -C /data .
```

### Restore

```bash
docker compose down
docker volume rm portainer-data
docker volume create portainer-data

docker run --rm -v portainer-data:/data -v $(pwd):/backup \
  alpine tar xzf /backup/portainer-backup-YYYYMMDD.tar.gz -C /data

docker compose up -d
```

---

## 🔧 Dépannage

### Port Déjà Utilisé

```bash
# Vérifier quel processus utilise le port 9000
lsof -i :9000

# Arrêter le processus
kill -9 <PID>

# Ou modifier le port dans docker-compose.yml
```

### Connexion à Docker Impossible

```bash
# Vérifier les permissions du socket Docker
ls -l /var/run/docker.sock

# Ajouter l'utilisateur au groupe docker
sudo usermod -aG docker $USER
```

### Consulter les Logs

```bash
# Logs Portainer
docker compose logs portainer

# Logs en temps réel
docker compose logs -f portainer
```

---

## 📋 Tâches Courantes

### Déployer un Conteneur

1. Ouvrir Portainer (http://localhost:9000)
2. Sélectionner "Conteneurs" > "Créer un conteneur"
3. Choisir l'image et configurer
4. Cliquer "Déployer"

### Gérer Plusieurs Hôtes

1. Ajouter des environnements
2. Connecter à des hôtes Docker distants
3. Gérer tous les hôtes depuis un seul dashboard

### Déployer une Stack

1. "Stacks" > "Ajouter une stack"
2. Coller le contenu du docker-compose.yml
3. Configurer et déployer

---

## 🔐 Notes de Sécurité

- Changer le mot de passe admin immédiatement
- Restreindre l'accès réseau aux IPs de confiance
- Utiliser HTTPS en production
- Activer l'authentification
- Faire régulièrement des backups

---

## 📊 Configuration Avancée

### Connexion à Swarm Mode

```bash
# Portainer détecte automatiquement Swarm
docker swarm init  # Si pas déjà initialisé
docker compose up -d
```

### Limites de Ressources

```yaml
# Dans docker-compose.yml
portainer:
  mem_limit: 512m
  memswap_limit: 512m
```

### Certificats Personnalisés

```bash
# Placer les certificats dans ./certs/
./certs/portainer.crt
./certs/portainer.key
```

---

## 💻 Commandes Utiles

```bash
# Utilisation des ressources
docker stats portainer

# Accéder au shell du conteneur
docker compose exec portainer sh

# Forcer la mise à jour
docker compose pull
docker compose up -d --force-recreate

# Nettoyer les données (⚠️ destructif)
docker volume rm portainer-data
```

---

**Status**: ✅ Opérationnel
**Dernière mise à jour**: Décembre 2024
