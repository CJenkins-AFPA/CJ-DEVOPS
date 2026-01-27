# Guide de Mise en Œuvre - Pipeline CI SAST (Mode Hybride GitLab.com)

## 📋 Pré-requis

- Compte GitLab.com (Gratuit)
- Docker et Docker Compose installés en local
- Harbor Registry installé localement (ou accessible)

## 🚀 Installation & Configuration

### 1. Démarrage des services locaux (Runner + App + Harbor)

```bash
cd /home/cj/gitdata/uyoop/CI
./scripts/start.sh
```

Cela démarre :
- **GitLab Runner** : Agent qui exécutera les jobs
- **UyoopApp** : Application de démo
- **Harbor** : Registry Docker (si installé dans le dossier harbor/)

### 2. Configuration sur GitLab.com

1. **Créer un nouveau projet** sur [gitlab.com](https://gitlab.com)
   - Nom : `uyoop-ci-test`
   - Visibilité : Privée ou Publique

2. **Récupérer le Token d'enregistrement**
   - Allez dans **Settings > CI/CD > Runners**
   - Cliquez sur **New Project Runner**
   - Tags : `docker`, `local`
   - Cliquez sur **Create runner**
   - Copiez le token d'authentification (commence par `glrt-`)

### 3. Enregistrement du Runner Local

Connectez votre runner local à votre projet GitLab.com :

```bash
# Commande interactive
docker exec -it ci-gitlab-runner gitlab-runner register

# Paramètres à fournir :
# URL instance : https://gitlab.com
# Token : <VOTRE_TOKEN_RECUPERE>
# Description : local-runner
# Tags : docker, local
# Pass optional maintenance note : (Laisser vide)
# Executor : docker
# Default Docker image : docker:24-dind
```

### 4. Configuration Variables CI/CD (GitLab.com)

Dans votre projet GitLab.com (Settings > CI/CD > Variables) :

| Key | Value | Type | Protected | Masked |
|-----|-------|------|-----------|--------|
| `HARBOR_URL` | http://host.docker.internal:8081 | Variable | ❌ | ❌ |
| `HARBOR_USERNAME` | admin | Variable | ❌ | ❌ |
| `HARBOR_PASSWORD` | Harbor12345 | Variable | ❌ | ✅ |
| `HARBOR_PROJECT` | uyoop | Variable | ❌ | ❌ |

**Note importante pour Harbor Local** :
Comme Harbor tourne sur votre machine locale et que le runner est dans un conteneur Docker, l'adresse `localhost` ou `127.0.0.1` dans le pipeline ferait référence au conteneur runner lui-même, pas à votre machine.

- Utilisez `host.docker.internal` (si configuré) ou l'IP de votre machine sur le réseau docker (`172.17.0.1` souvent).
- Ou exposez Harbor via `ngrok` ou un tunnel si besoin d'accès externe.

### 5. Pousser le code

```bash
# Ajouter le remote GitLab.com
git remote add gitlab-com https://gitlab.com/<votre-user>/uyoop-ci-test.git

# Pousser
git push -u gitlab-com main
```

## ✅ Test du Pipeline

Le pipeline se lancera sur GitLab.com, mais les jobs s'exécuteront **SUR VOTRE MACHINE** via le runner local.

1. Allez dans **Build > Pipelines** sur GitLab.com
2. Vérifiez que le job est bien pris en charge par votre runner "local-runner"

### Troubleshooting Connection Harbor

Si le runner n'arrive pas à contacter Harbor (Connection refused) :
1. Assurez-vous que Harbor écoute sur toutes les interfaces (`0.0.0.0`)
2. Utilisez l'adresse IP de votre machine hôte (ex: `192.168.x.x`) dans la variable `HARBOR_URL` au lieu de `localhost`

---
**Ancienne section "Installation GitLab Local" (Obsolète - Performance)**
*GitLab CE local consomme trop de ressources pour ce poste. Nous utilisons le mode SaaS (GitLab.com) avec Runners locaux.*


## 📚 Commandes utiles

```bash
# Voir tous les containers
docker ps -a

# Logs en temps réel
docker-compose logs -f

# Redémarrer un service
docker-compose restart <service>

# Arrêter tout
docker-compose down

# Nettoyer les volumes (attention : perte de données)
docker-compose down -v

# Espace disque utilisé
docker system df
```

## 🎯 Prochaines étapes

1. ✅ Pipeline fonctionnel en local
2. ⏭️ Personnaliser les règles SAST
3. ⏭️ Ajouter des tests unitaires PHP
4. ⏭️ Intégrer Sonarqube (optionnel)
5. ⏭️ Déploiement automatique vers environnement de test
6. ⏭️ Transposer sur infrastructure réelle (PROJET-INFRA-RBC)

## 📖 Documentation de référence

- [GitLab CI/CD](https://docs.gitlab.com/ee/ci/)
- [GitLab SAST](https://docs.gitlab.com/ee/user/application_security/sast/)
- [Harbor Documentation](https://goharbor.io/docs/)
- [Trivy Documentation](https://aquasecurity.github.io/trivy/)
- [Docker Compose](https://docs.docker.com/compose/)
