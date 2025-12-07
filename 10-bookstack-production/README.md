# TP 10 : BookStack Production Sécurisé

## 🎯 Objectifs

- Déployer BookStack dans un environnement de **production sécurisé**
- Implémenter une **architecture multi-couches** de sécurité
- Configurer un **reverse proxy** (Traefik) avec SSL automatique
- Mettre en place une **authentification 2FA** (Authelia)
- Protéger contre les **intrusions** (CrowdSec)
- Gérer les **secrets** de manière sécurisée (Docker Secrets)
- Automatiser les **backups chiffrés**
- Monitorer l'infrastructure (Prometheus + Grafana)

## 📋 Prérequis

- **Serveur Linux** : Ubuntu 22.04 LTS ou Debian 12
- **Docker** : Version 24.0+ avec Docker Compose v2
- **RAM** : 4 GB minimum (8 GB recommandé)
- **Disque** : 20 GB minimum
- **Domaine** : Un nom de domaine avec accès DNS (Cloudflare recommandé)
- **Ports** : 80, 443, 22 disponibles

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────┐
│                     INTERNET                            │
└──────────────────┬──────────────────────────────────────┘
                   │
           ┌───────▼────────┐
           │   UFW Firewall │  (Ports 22, 80, 443)
           └───────┬────────┘
                   │
           ┌───────▼────────┐
           │    Traefik     │  (Reverse Proxy + SSL)
           │  Let's Encrypt │
           └───┬────────┬───┘
               │        │
       ┌───────▼───┐  ┌▼────────────┐
       │  CrowdSec │  │   Authelia  │  (2FA / SSO)
       │  Bouncer  │  │   (MFA)     │
       └───────────┘  └─────────────┘
                           │
               ┌───────────▼──────────┐
               │                      │
         ┌─────▼─────┐         ┌─────▼──────┐
         │ BookStack │         │ Monitoring │
         │           │         │  Grafana   │
         └─────┬─────┘         └────────────┘
               │
         ┌─────▼─────┐
         │   MySQL   │  (Réseau isolé)
         │  (Secret) │
         └───────────┘
```

### Réseaux Docker

- **proxy** : Frontend (Traefik, Authelia, CrowdSec)
- **backend** : Application (BookStack, monitoring) - *interne*
- **database** : Base de données MySQL - *interne isolé*

## 🚀 Installation Rapide

### 1. Cloner le projet

```bash
cd /opt
sudo git clone https://github.com/CJenkins-AFPA/CJ-DEVOPS.git
cd CJ-DEVOPS/10-bookstack-production
```

### 2. Lancer le script d'installation

```bash
sudo ./scripts/install.sh
```

Ce script va :
- Générer les secrets aléatoires
- Configurer le pare-feu UFW
- Installer Fail2Ban
- Créer les réseaux Docker
- Préparer l'environnement

### 3. Configuration

Éditez le fichier `.env` :

```bash
nano .env
```

**Variables essentielles à modifier :**

```env
DOMAIN=votre-domaine.com
CLOUDFLARE_EMAIL=votre-email@example.com
CLOUDFLARE_API_TOKEN=votre-token-cloudflare
MAIL_HOST=smtp.gmail.com
MAIL_FROM=bookstack@votre-domaine.com
MAIL_USERNAME=votre-email@gmail.com
```

### 4. Configurer Cloudflare

1. Connectez-vous à [Cloudflare](https://dash.cloudflare.com)
2. Allez dans **Mon profil** → **Jetons API**
3. Créez un token avec les permissions :
   - Zone : Zone : Read
   - Zone : DNS : Edit
4. Copiez le token dans `.env` → `CLOUDFLARE_API_TOKEN`

### 5. Modifier les secrets

Les mots de passe sont dans `secrets/`. **Changez au moins** :

```bash
echo "votre-mot-de-passe-mail" > secrets/mail_password.txt
```

### 6. Démarrer les services

```bash
docker-compose up -d
```

### 7. Vérifier le déploiement

```bash
docker-compose ps
docker-compose logs -f bookstack
```

### 8. Accéder à BookStack

Après quelques minutes (temps de génération des certificats) :

**https://bookstack.votre-domaine.com**

**Identifiants par défaut** :
- Email : `admin@admin.com`
- Mot de passe : `password`

⚠️ **Changez immédiatement ces identifiants !**

## 🔐 Sécurité

### 1. Authentification 2FA (Authelia)

Après la première connexion :

1. Accédez à **https://auth.votre-domaine.com**
2. Connectez-vous avec les credentials Authelia (voir `config/authelia/users_database.yml`)
3. Configurez votre application TOTP (Google Authenticator, Authy, etc.)
4. Tous les accès à BookStack/Traefik/Grafana nécessiteront maintenant le 2FA

### 2. Créer un utilisateur Authelia

```bash
# Générer un hash de mot de passe
docker-compose exec authelia authelia crypto hash generate argon2 --password 'votre_mot_de_passe'

# Ajouter dans config/authelia/users_database.yml
```

### 3. CrowdSec - Protection contre intrusions

```bash
# Voir les décisions (bans)
docker-compose exec crowdsec cscli decisions list

# Voir les alertes
docker-compose exec crowdsec cscli alerts list

# Ajouter une IP à la whitelist
docker-compose exec crowdsec cscli decisions add --ip 1.2.3.4 --duration 24h --type ban
```

### 4. Rotation des secrets

```bash
# Générer un nouveau secret
openssl rand -base64 32 > secrets/db_password.txt

# Redémarrer les services
docker-compose restart bookstack bookstack-db
```

### 5. Pare-feu (UFW)

```bash
# Voir les règles actives
sudo ufw status verbose

# Autoriser une IP spécifique
sudo ufw allow from 192.168.1.100 to any port 443

# Bloquer une IP
sudo ufw deny from 1.2.3.4
```

## 📦 Backup et Restauration

### Backup manuel

```bash
./scripts/backup.sh
```

Le backup sera chiffré avec GPG dans `./backups/`

### Backup automatique

Le service `backup` effectue des backups quotidiens à 2h du matin (configurable dans `.env` → `BACKUP_CRON`)

### Restauration

```bash
./scripts/restore.sh backups/bookstack_backup_YYYYMMDD_HHMMSS.tar.gz.gpg
```

⚠️ Entrez la passphrase GPG utilisée lors du chiffrement

### Backup vers stockage distant

Modifiez `.env` :

```env
BACKUP_REPOSITORY=s3:s3.amazonaws.com/mon-bucket/bookstack
# ou
BACKUP_REPOSITORY=sftp:user@backup-server.com:/backups/bookstack
```

## 📊 Monitoring

### Grafana

**https://grafana.votre-domaine.com**

- Utilisateur : `admin`
- Mot de passe : `secrets/grafana_password.txt`

**Dashboards à importer** :

1. Node Exporter Full (ID: 1860)
2. Traefik 2 (ID: 12250)
3. MySQL Overview (ID: 7362)

### Prometheus

**https://prometheus.votre-domaine.com**

Requêtes utiles :

```promql
# CPU usage
100 - (avg by (instance) (rate(node_cpu_seconds_total{mode="idle"}[5m])) * 100)

# Memory usage
(1 - (node_memory_MemAvailable_bytes / node_memory_MemTotal_bytes)) * 100

# Disk usage
(1 - (node_filesystem_avail_bytes / node_filesystem_size_bytes)) * 100
```

### Alertes

Configurez des alertes dans Prometheus pour :
- CPU > 80%
- RAM > 90%
- Disque > 85%
- Service down
- Trop de tentatives de connexion échouées

## 🔧 Maintenance

### Logs

```bash
# Tous les services
docker-compose logs -f

# Seulement BookStack
docker-compose logs -f bookstack

# Dernières 100 lignes
docker-compose logs --tail=100 bookstack
```

### Mise à jour des services

```bash
# Télécharger les nouvelles images
docker-compose pull

# Redémarrer avec les nouvelles versions
docker-compose up -d

# Vérifier
docker-compose ps
```

### Nettoyer Docker

```bash
# Supprimer les images inutilisées
docker image prune -a

# Nettoyer tout
docker system prune -a --volumes
```

### Redémarrer un service

```bash
docker-compose restart bookstack
```

## 🛡️ Hardening Avancé

### Script de durcissement système

```bash
sudo ./scripts/hardening.sh
```

Ce script configure :
- Sécurité kernel (sysctl)
- Protection SYN flood
- Désactivation IPv6 (si non utilisé)
- Fail2Ban pour Docker/Traefik
- SSH hardening
- Audit système (auditd)

### SELinux ou AppArmor

#### Ubuntu/Debian (AppArmor)

```bash
sudo apt install apparmor apparmor-utils
sudo aa-enforce /etc/apparmor.d/*
```

#### CentOS/RHEL (SELinux)

```bash
sudo setenforce 1
sudo sed -i 's/SELINUX=.*/SELINUX=enforcing/' /etc/selinux/config
```

### Scan de vulnérabilités

```bash
# Trivy pour les images Docker
docker run --rm -v /var/run/docker.sock:/var/run/docker.sock \
  aquasec/trivy image lscr.io/linuxserver/bookstack:latest

# Lynis pour l'audit système
sudo apt install lynis
sudo lynis audit system
```

## 🚨 Dépannage

### Les certificats SSL ne se génèrent pas

1. Vérifiez les logs Traefik :
   ```bash
   docker-compose logs traefik
   ```

2. Vérifiez le token Cloudflare :
   ```bash
   docker-compose exec traefik env | grep CLOUDFLARE
   ```

3. Vérifiez les enregistrements DNS :
   ```bash
   dig bookstack.votre-domaine.com
   ```

### Authelia ne fonctionne pas

1. Vérifiez les logs :
   ```bash
   docker-compose logs authelia
   ```

2. Réinitialisez la base de données :
   ```bash
   docker-compose exec authelia rm /config/db.sqlite3
   docker-compose restart authelia
   ```

### BookStack ne démarre pas

1. Vérifiez que MySQL est prêt :
   ```bash
   docker-compose exec bookstack-db mysqladmin ping
   ```

2. Vérifiez les secrets :
   ```bash
   ls -l secrets/
   cat secrets/db_password.txt
   ```

### CrowdSec ne bloque pas

1. Vérifiez les collections installées :
   ```bash
   docker-compose exec crowdsec cscli collections list
   ```

2. Vérifiez les scénarios :
   ```bash
   docker-compose exec crowdsec cscli scenarios list
   ```

3. Testez manuellement un ban :
   ```bash
   docker-compose exec crowdsec cscli decisions add --ip 1.2.3.4 --duration 1h --type ban
   ```

## 📚 Documentation Supplémentaire

- [Traefik Documentation](https://doc.traefik.io/traefik/)
- [Authelia Documentation](https://www.authelia.com/docs/)
- [CrowdSec Documentation](https://docs.crowdsec.net/)
- [BookStack Documentation](https://www.bookstackapp.com/docs/)
- [Docker Secrets](https://docs.docker.com/engine/swarm/secrets/)

## 🎓 Exercices Pratiques

### Exercice 1 : Déploiement complet

1. Déployez la stack complète sur un serveur de test
2. Configurez le 2FA avec votre smartphone
3. Créez du contenu dans BookStack
4. Testez l'accès via HTTPS

### Exercice 2 : Tests de sécurité

1. Lancez un scan de vulnérabilités avec Trivy
2. Tentez une attaque brute-force et vérifiez le ban CrowdSec
3. Testez le rate limiting (100 requêtes/min)
4. Auditez les logs de sécurité

### Exercice 3 : Backup et disaster recovery

1. Effectuez un backup complet
2. Détruisez complètement l'infrastructure
3. Restaurez depuis le backup
4. Vérifiez l'intégrité des données

### Exercice 4 : Monitoring et alerting

1. Configurez Grafana avec les dashboards
2. Créez des alertes pour les métriques critiques
3. Simulez une charge élevée (stress test)
4. Analysez les métriques dans Prometheus

### Exercice 5 : Haute disponibilité

1. Déployez sur plusieurs nœuds avec Docker Swarm
2. Configurez la réplication MySQL
3. Testez le failover automatique
4. Mesurez le RTO et RPO

## 💡 Best Practices

✅ **Utilisez des mots de passe forts** (32+ caractères aléatoires)  
✅ **Activez le 2FA** pour tous les utilisateurs administrateurs  
✅ **Backups réguliers** (quotidiens minimum)  
✅ **Mises à jour régulières** (testez en staging d'abord)  
✅ **Monitoring 24/7** avec alertes SMS/email  
✅ **Rotation des secrets** tous les 90 jours  
✅ **Audit logs** réguliers  
✅ **Tests de restauration** mensuels  
✅ **Plan de reprise d'activité** documenté  
✅ **Séparation des environnements** (dev/staging/prod)  

## 🚀 Évolutions Possibles

- **Haute disponibilité** : Ajouter un second nœud avec réplication
- **WAF** : Intégrer ModSecurity pour une protection applicative
- **SIEM** : Centraliser les logs avec ELK ou Graylog
- **Vault** : Gestion centralisée des secrets avec rotation automatique
- **Kubernetes** : Migration vers K8s pour plus de résilience
- **CDN** : Ajouter Cloudflare CDN pour les performances

---

## 📧 Support

Ce TP fait partie du projet **CJ-DEVOPS** : [GitHub](https://github.com/CJenkins-AFPA/CJ-DEVOPS)

**Profil DevOps Senior - Portfolio** 🚀
