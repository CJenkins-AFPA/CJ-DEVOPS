# 🚀 Quick Start - BookStack Production Sécurisé

Guide de démarrage en 10 minutes pour déployer BookStack en production.

## ⚡ Prérequis (5 min)

```bash
# 1. Serveur Ubuntu 20.04+ ou Debian 11+
# 2. Domaine avec accès DNS (ex: bookstack.example.com)
# 3. Cloudflare account pour DNS challenge (gratuit)
# 4. 2 GB RAM minimum, 10 GB disque

# Vérifier les prérequis
curl -fsSL https://get.docker.com | sh
sudo apt-get install -y docker-compose-plugin git
docker --version
docker compose version
```

## 📋 Configuration (3 min)

```bash
# 1. Cloner le repository
cd /tmp
git clone https://github.com/CJenkins-AFPA/CJ-DEVOPS.git
cd CJ-DEVOPS
git checkout docker
cd 10-bookstack-production

# 2. Copier la configuration
cp .env.example .env

# 3. Éditer .env avec vos paramètres
nano .env
```

**Variables essentielles à définir dans `.env` :**

```bash
# Domaine
DOMAIN=bookstack.example.com

# Cloudflare DNS
CLOUDFLARE_EMAIL=your-email@example.com
CLOUDFLARE_API_TOKEN=your-cloudflare-token   # Voir ci-dessous

# Mail (optionnel mais recommandé)
MAIL_HOST=smtp.gmail.com
MAIL_FROM=bookstack@example.com
MAIL_USERNAME=your-email@gmail.com
MAIL_PASSWORD=your-app-password

# Timezone
TZ=Europe/Paris
```

### 🔑 Obtenir le token Cloudflare

1. Aller à https://dash.cloudflare.com/profile/api-tokens
2. Cliquer "Create Token"
3. Utiliser le template "Edit zone DNS"
4. Sélectionner votre domaine
5. Copier le token généré

## 🚀 Lancer le Stack (2 min)

```bash
# 1. Générer les secrets
bash scripts/install.sh

# 2. Créer les réseaux Docker
docker network create proxy
docker network create backend
docker network create database

# 3. Lancer les services
docker compose up -d

# 4. Attendre le démarrage (2-3 min)
docker compose logs -f bookstack

# Quand vous voyez "ready to accept connections", c'est prêt !
```

## ✅ Vérification

```bash
# Vérifier tous les services
docker compose ps

# Vérifier les certificats SSL
docker compose exec traefik ls -la /letsencrypt/

# Tester l'accès HTTPS
curl -k https://bookstack.example.com

# Voir les logs en temps réel
docker compose logs -f
```

## 🎯 Accès aux Services

| Service | URL | Identifiants |
|---------|-----|--------------|
| **BookStack** | https://bookstack.DOMAIN | admin@admin.com / password |
| **Authelia (2FA)** | https://auth.DOMAIN | - |
| **Grafana** | https://grafana.DOMAIN | admin / (voir secrets/) |
| **Traefik** | https://traefik.DOMAIN | - |

### ⚠️ Première connexion

1. Aller sur https://bookstack.DOMAIN
2. Cliquer sur "Login"
3. Entrer : `admin@admin.com` / `password`
4. **⚠️ IMMÉDIATEMENT changer le mot de passe !**
5. Configurer 2FA dans Authelia

## 🔒 Configuration Sécurité (Optionnel)

```bash
# 1. Activez le firewall
sudo ufw enable

# 2. Installlez Fail2Ban
sudo apt-get install -y fail2ban

# 3. Lancez l'hardening complet
bash scripts/hardening.sh
```

## 📦 Sauvegarde

```bash
# Sauvegarde manuelle
bash scripts/backup.sh

# Sauvegarde automatique (2h du matin tous les jours)
# Déjà configurée dans docker-compose.yml

# Vérifier les backups
ls -lah backups/
```

## 🆘 Troubleshooting Rapide

### Certificat SSL ne se génère pas
```bash
# Vérifier les logs Traefik
docker compose logs traefik | grep -i challenge

# Vérifier la connectivité DNS
nslookup bookstack.example.com
nslookup _acme-challenge.example.com
```

### BookStack timeout à la connexion
```bash
# Vérifier si la base de données est prête
docker compose logs bookstack-db | grep "ready"

# Attendre un peu et réessayer
```

### Port 80/443 déjà utilisé
```bash
# Trouver le processus
sudo lsof -i :80
sudo lsof -i :443

# Libérer le port ou changer dans docker-compose.yml
```

## 📚 Documentation Complète

Pour une configuration avancée, consultez [README.md](./README.md) :
- Architecture détaillée
- Configuration 2FA
- CrowdSec setup
- Monitoring Prometheus/Grafana
- Disaster recovery
- Practical exercises

## 🎓 Prochaines Étapes

1. ✅ Vérifier que tout fonctionne
2. 📝 Configurer 2FA pour les utilisateurs
3. 🔐 Changer les secrets par défaut
4. 📊 Configurer les dashboards Grafana
5. 🔄 Tester une restauration de backup
6. 🛡️ Mettre en place les alertes CrowdSec

## 💬 Support

- Logs: `docker compose logs <service>`
- Docs: Voir [README.md](./README.md)
- Issues: GitHub issues
- Status: `docker compose ps`

---

**Temps total estimé : ~15 minutes** ⏱️

Bon déploiement ! 🚀
