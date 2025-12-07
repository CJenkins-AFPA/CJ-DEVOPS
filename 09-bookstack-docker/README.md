# TP 9 : BookStack avec Docker Compose

## 🎯 Objectifs

- Déployer BookStack (plateforme de documentation) avec Docker Compose
- Configurer MySQL comme base de données
- Personnaliser l'installation (timezone, mail, URL)
- Gérer les volumes pour la persistance des données

## 📋 Prérequis

- Docker et Docker Compose installés
- Port 8080 disponible (ou modifier dans `.env`)
- Minimum 2 GB de RAM recommandé

## 🚀 Installation Rapide

### 1. Cloner ou copier les fichiers

```bash
cd 09-bookstack-docker
```

### 2. Créer le fichier de configuration

```bash
cp .env.example .env
# Éditer le fichier .env avec vos paramètres
nano .env
```

### 3. Démarrer BookStack

```bash
docker compose up -d
```

### 4. Accéder à BookStack

Ouvrez votre navigateur : **http://localhost:8080**

**Identifiants par défaut** :
- Email : `admin@admin.com`
- Mot de passe : `password`

⚠️ **Changez immédiatement ces identifiants après la première connexion !**

## ⚙️ Configuration

### Fichier `.env`

Personnalisez les variables d'environnement :

```env
# URL publique de votre BookStack
APP_URL=http://localhost:8080
APP_PORT=8080

# Timezone
TIMEZONE=Europe/Paris

# Base de données
DB_ROOT_PASSWORD=votre_mot_de_passe_root_fort
DB_DATABASE=bookstack
DB_USER=bookstack
DB_PASSWORD=votre_mot_de_passe_fort

# Mail (optionnel, pour les notifications)
MAIL_DRIVER=smtp
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_FROM=votre-email@example.com
MAIL_USERNAME=votre-email@example.com
MAIL_PASSWORD=votre_mot_de_passe_application
MAIL_ENCRYPTION=tls
```

### Changer le port

Si le port 8080 est déjà utilisé, modifiez `APP_PORT` dans `.env` :

```env
APP_PORT=8081
```

Puis redémarrez :

```bash
docker compose down
docker compose up -d
```

## 📦 Structure Docker Compose

### Services

1. **bookstack-db** : Base de données MySQL 8.0
   - Volume : `bookstack-db-data` (persistance des données)
   - Réseau : `bookstack-network` (isolé)

2. **bookstack** : Application BookStack (LinuxServer.io)
   - Volume : `bookstack-app-data` (configuration et uploads)
   - Port : 8080 → 80 (configurable)
   - Dépend de : `bookstack-db`

### Volumes

- `bookstack-db-data` : Données MySQL
- `bookstack-app-data` : Configuration BookStack, uploads, thèmes

## 🔧 Commandes Utiles

### Démarrer les services

```bash
docker compose up -d
```

### Voir les logs

```bash
# Tous les services
docker compose logs -f

# Seulement BookStack
docker compose logs -f bookstack

# Seulement la base de données
docker compose logs -f bookstack-db
```

### Arrêter les services

```bash
docker compose stop
```

### Redémarrer les services

```bash
docker compose restart
```

### Supprimer tout (⚠️ perte des données)

```bash
docker compose down -v
```

### Accéder au conteneur BookStack

```bash
docker compose exec bookstack bash
```

### Accéder à MySQL

```bash
docker compose exec bookstack-db mysql -u bookstack -p
# Entrez le mot de passe défini dans DB_PASSWORD
```

## 🔒 Sécurité

### 1. Changer les identifiants par défaut

Après la première connexion :
1. Allez dans **Settings** → **Users**
2. Modifiez l'utilisateur `admin@admin.com`
3. Changez l'email et le mot de passe

### 2. Utiliser des mots de passe forts

Dans `.env`, utilisez des mots de passe complexes :

```bash
# Générer un mot de passe aléatoire
openssl rand -base64 32
```

### 3. Configuration HTTPS (Production)

Pour la production, utilisez un reverse proxy (Nginx, Traefik) avec Let's Encrypt :

```yaml
# Exemple avec Nginx Proxy Manager
services:
  bookstack:
    # ...existing config...
    environment:
      - APP_URL=https://bookstack.votredomaine.com
    networks:
      - bookstack-network
      - proxy-network

networks:
  proxy-network:
    external: true
```

## 📊 Maintenance

### Backup de la base de données

```bash
# Backup
docker compose exec bookstack-db mysqldump -u bookstack -p bookstack > backup-$(date +%Y%m%d).sql

# Restore
docker compose exec -T bookstack-db mysql -u bookstack -p bookstack < backup-20241207.sql
```

### Backup des fichiers

```bash
# Backup du volume d'application
docker run --rm -v bookstack-app-data:/data -v $(pwd):/backup alpine tar czf /backup/bookstack-app-backup.tar.gz /data
```

### Mise à jour

```bash
# Télécharger la dernière image
docker compose pull

# Redémarrer avec la nouvelle version
docker compose up -d
```

## 🎨 Personnalisation

### Thèmes personnalisés

Les thèmes personnalisés peuvent être ajoutés dans le volume `bookstack-app-data`.

### Langues

BookStack supporte plusieurs langues. Configurez dans **Settings** → **App Settings** → **Default Language**.

## 🐛 Dépannage

### BookStack ne démarre pas

```bash
# Vérifier les logs
docker compose logs bookstack

# Vérifier que la DB est prête
docker compose exec bookstack-db mysqladmin ping -h localhost -u root -p
```

### Impossible de se connecter

1. Vérifiez que les deux conteneurs tournent :
   ```bash
   docker compose ps
   ```

2. Vérifiez les variables d'environnement :
   ```bash
   docker compose config
   ```

3. Réinitialisez la base de données :
   ```bash
   docker compose down -v
   docker compose up -d
   ```

### Port déjà utilisé

```bash
# Trouver quel processus utilise le port 8080
sudo lsof -i :8080

# Changer le port dans .env
APP_PORT=8081
```

## 📚 Ressources

- [Documentation officielle BookStack](https://www.bookstackapp.com/docs/)
- [BookStack sur GitHub](https://github.com/BookStackApp/BookStack)
- [Image Docker LinuxServer](https://docs.linuxserver.io/images/docker-bookstack)
- [Forum BookStack](https://www.bookstackapp.com/support)

## 🎓 Exercices Pratiques

### Exercice 1 : Installation basique

1. Déployez BookStack avec les paramètres par défaut
2. Connectez-vous et créez votre premier livre
3. Ajoutez des chapitres et des pages

### Exercice 2 : Configuration avancée

1. Configurez l'envoi d'emails (SMTP)
2. Créez plusieurs utilisateurs avec différents rôles
3. Configurez les permissions d'accès

### Exercice 3 : Backup et restore

1. Créez du contenu dans BookStack
2. Effectuez un backup complet (DB + fichiers)
3. Détruisez les conteneurs et volumes
4. Restaurez à partir du backup

### Exercice 4 : Production avec HTTPS

1. Configurez un reverse proxy (Nginx ou Traefik)
2. Ajoutez un certificat SSL (Let's Encrypt)
3. Testez l'accès en HTTPS

## 💡 Conseils

- **Sauvegardez régulièrement** la base de données et les volumes
- **Documentez votre configuration** (versions, paramètres spécifiques)
- **Testez les mises à jour** dans un environnement de test avant la production
- **Utilisez des mots de passe forts** pour tous les comptes

---

**BookStack** est une excellente solution pour créer une base de connaissances, documentation technique, wiki d'équipe, ou support client.  
Profitez-en pour centraliser vos notes DevOps ! 📚
