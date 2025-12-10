# TP18 - Portainer Enterprise (Production-Ready)

Déploiement production d'une édition Portainer Enterprise avec fonctionnalités avancées pour la gestion d'environnements Docker multi-hôtes.

## 🎯 Vue d'ensemble

**TP18** est un déploiement production-ready de Portainer Enterprise Edition avec les fonctionnalités avancées requises pour la gestion d'entreprise.

## ✨ Fonctionnalités Enterprise

✅ **Édition Enterprise**
- Portainer Business Edition (EE)
- Backend PostgreSQL
- Équipes et RBAC
- Authentification avancée
- Intégration GitOps
- Agents Edge pour gestion distante

✅ **Haute Disponibilité**
- Base de données PostgreSQL persistante
- Health checks sur tous les services
- Restart automatique
- Persistance des données

✅ **Monitoring & Observabilité**
- Métriques Prometheus
- Dashboards Grafana
- Monitoring temps réel
- Tracking de performance

✅ **Réseaux & Sécurité**
- Reverse proxy Traefik v3
- SSL/TLS automatique
- Isolation réseau
- Communication sécurisée

✅ **Multi-Environnements**
- Gérer plusieurs hôtes Docker
- Connexions à hôtes distants
- Agents Portainer
- Dashboard centralisé

---

## 🚀 Démarrage Rapide

### 1. Configuration

```bash
cd 18-portainer-pro
cp .env.example .env
nano .env
```

### 2. Déployer

```bash
chmod +x scripts/*.sh
./scripts/deploy.sh
```

### 3. Accéder

- **URL**: https://portainer.example.com
- **Admin**: admin
- **Mot de passe**: [Depuis PORTAINER_ADMIN_PASSWORD]

---

## 💡 Fonctionnalités Clés

### Gestion des Conteneurs

- Créer, démarrer, arrêter, supprimer
- Monitoring des ressources temps réel
- Consultation et streaming des logs
- Exec dans les conteneurs
- Gestion des volumes
- Configuration réseau

### Gestion des Images

- Tirer/pousser des images
- Intégration registres
- Nettoyage d'images
- Inspection des couches

### Gestion des Stacks

- Déployer des fichiers Docker Compose
- Déploiement GitOps
- Mises à jour de stacks
- Contrôle de version

### Gestion des Environnements

- Ajouter des hôtes Docker distants
- Intégration clusters Kubernetes
- Gestion agents Edge
- Dashboard multi-environnements

### Équipes & RBAC

- Gestion des utilisateurs
- Création d'équipes
- Contrôle d'accès basé sur les rôles
- Permissions granulaires

### Monitoring

- Métriques Prometheus
- Dashboards Grafana
- Statistiques conteneurs
- Utilisation des ressources

---

## 🗄️ Base de Données

PostgreSQL pour la persistance:

```env
POSTGRES_DATABASE=portainer
POSTGRES_USER=portainer
POSTGRES_PASSWORD=***
```

**Important**: Sauvegarder avant les mises à jour!

---

## 📊 Dashboards de Monitoring

Accéder via:

- **Grafana**: https://grafana.portainer.example.com
- **Prometheus**: https://prometheus.portainer.example.com

---

## 🌐 Gestion des Hôtes Distants

### Ajouter un Environnement Distant

1. Aller à Environnements > Ajouter un environnement
2. Sélectionner Docker ou Kubernetes
3. Entrer les détails de l'hôte
4. Cliquer Créer
5. Gérer depuis le dashboard centralisé

### Utiliser Portainer Agent

Déployer l'agent sur l'hôte distant:

```bash
docker run -d \
  -v /var/run/docker.sock:/var/run/docker.sock \
  -v /var/lib/docker/volumes:/var/lib/docker/volumes \
  -p 9001:9001 \
  portainer/agent:latest
```

---

## 💾 Backup & Restore

### Backup

```bash
./scripts/backup.sh

# Avec nom personnalisé
./scripts/backup.sh mon-backup-20241207
```

### Restore

```bash
# Arrêter les services
docker compose down

# Copier les données
cp -r backups/mon-backup-*/portainer-data /chemin/restore

# Restaurer PostgreSQL
gunzip -c backups/mon-backup-*/postgres-dump.sql.gz | \
  docker compose exec -T postgres psql -U portainer portainer

# Redémarrer
docker compose up -d
```

---

## 🔐 Bonnes Pratiques de Sécurité

- Changer le mot de passe admin immédiatement
- Activer l'authentification
- Utiliser HTTPS uniquement
- Configurer LDAP/OIDC
- Restreindre l'accès réseau
- Faire des backups réguliers
- Mettre à jour les images régulièrement
- Utiliser RBAC pour les équipes

---

## 🔧 Dépannage

### Consulter les logs

```bash
docker compose logs -f portainer
```

### Vérifier la santé

```bash
docker compose ps
```

### Vérifier la base de données

```bash
docker compose exec postgres psql -U portainer -d portainer
```

### Redémarrer

```bash
docker compose restart portainer
```

### Problèmes Courants

```bash
# Port déjà utilisé
lsof -i :9000

# Problèmes de connexion BD
docker compose logs postgres

# Réinitialiser le mot de passe admin
docker compose exec portainer /portainer-config reset-password
```

---

## 📋 Tâches Courantes

### Déployer une Stack

1. Stacks > Ajouter une stack
2. Télécharger docker-compose.yml
3. Configurer les variables
4. Déployer

### Créer un Utilisateur

1. Paramètres > Utilisateurs
2. Ajouter un utilisateur
3. Définir le rôle (Admin, Editor, Viewer)
4. Configurer l'accès aux équipes

### Gérer les Volumes

1. Volumes
2. Créer, inspecter, supprimer des volumes
3. Consulter l'utilisation

### Configurer GitOps

1. Paramètres > GitOps
2. Configurer le provider Git
3. Lier les repositories
4. Auto-déployer en cas de push

---

## 🔄 Administration

### Utilisateurs et Équipes

```
Admin Center → Users
├─ Créer des utilisateurs
├─ Assigner des rôles
├─ Créer des équipes
└─ Gérer les permissions
```

### Environnements

```
Admin Center → Environments
├─ Ajouter des environnements
├─ Configurer les accès
├─ Gérer les agents Edge
└─ Monitoring de santé
```

### Paramètres Globaux

```
Admin Center → Settings
├─ Authentification (LDAP, OIDC)
├─ Branding
├─ Sauvegardes
└─ Configuration du système
```

---

## 💻 Commandes Utiles

### Status & Logs

```bash
# Statut des services
docker compose ps

# Logs en temps réel
docker compose logs -f portainer

# Logs d'un service spécifique
docker compose logs -f postgres
```

### Maintenance

```bash
# Mettre à jour les images
docker compose pull
docker compose up -d

# Nettoyer les ressources inutilisées
docker system prune

# Accéder au shell Portainer
docker compose exec portainer sh
```

### Sauvegarde & Données

```bash
# Sauvegarder le volume PostgreSQL
docker run --rm \
  -v portainer-data:/data \
  -v $(pwd):/backup \
  alpine tar czf /backup/portainer-data.tar.gz -C /data .

# Sauvegarder la configuration
docker cp portainer:/data/config.json ./config-backup.json
```

---

## 📈 Performance & Scaling

### Ressources Recommandées

| Environnement | CPU | RAM | Stockage |
|--------------|-----|-----|----------|
| Dev/Test | 2 cores | 4 GB | 50 GB |
| Production | 4+ cores | 8+ GB | 100+ GB |
| Enterprise | 8+ cores | 16+ GB | 500+ GB |

### Limites de Ressources

```yaml
# Dans docker-compose.yml
portainer:
  mem_limit: 1g
  memswap_limit: 1g
  cpus: '2'
```

---

## 📚 Documentation & Support

- **Portainer Official**: https://docs.portainer.io
- **Docker**: https://docs.docker.com
- **PostgreSQL**: https://www.postgresql.org/docs

---

**Status**: ✅ Production-Ready
**Dernière mise à jour**: Décembre 2024
