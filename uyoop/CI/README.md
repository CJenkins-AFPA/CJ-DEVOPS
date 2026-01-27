# Projet CI/CD - Pipeline SAST

## 📝 Description

Projet d'apprentissage et de mise en œuvre d'un pipeline CI/CD avec analyse de sécurité (SAST) utilisant GitLab, Harbor et l'application UyoopApp.

**Objectif** : Créer un pipeline CI/CD fonctionnel en local avec Docker Compose, qui sera ensuite transposé sur une infrastructure réelle (PROJET-INFRA-RBC).

## 🎯 Architecture

```
VM1 (Dev) → git push → VM2 (GitLab + Runner) → SAST → Build → Trivy Scan → VM3 (Harbor)
```

### Composants
- **VM1** : Poste de développement (ce poste)
- **VM2** : GitLab CE + GitLab Runner (Docker Compose)
- **VM3** : Harbor Registry (Docker Compose)
- **App** : UyoopApp (PHP 8.4 + SQLite)

## 🚀 Démarrage rapide

```bash
# Démarrer tous les services
cd /home/cj/gitdata/uyoop/CI
./scripts/start.sh

# Vérifier l'état
./scripts/status.sh

# Arrêter les services
./scripts/stop.sh
```

## 📁 Structure du projet

```
CI/
├── 00-INSTRUCTIONS-IA.md          # Instructions pour l'IA
├── 01-PROJET-CI                   # Présentation du projet
├── 02-ARCHITECTURE-PIPELINE.md    # Architecture détaillée
├── 03-MISE-EN-OEUVRE.md          # Guide d'installation complet
├── docker-compose.yml             # Configuration Docker Compose
├── .env                           # Variables d'environnement
│
├── app/                           # Application UyoopApp
│   ├── .gitlab-ci.yml            # 🎯 Pipeline CI/CD SAST
│   ├── Dockerfile                 # Image PHP 8.4 Alpine
│   ├── nginx.conf                 # Configuration Nginx
│   ├── public/                    # Frontend (HTML/CSS/JS)
│   └── src/                       # Backend PHP
│
├── gitlab/                        # Données GitLab
│   ├── config/                    # Configuration GitLab
│   ├── data/                      # Données GitLab
│   ├── logs/                      # Logs GitLab
│   └── runner-config/             # Configuration Runner
│
├── harbor/                        # Données Harbor
│   └── data/                      # Données Harbor
│
└── scripts/                       # Scripts utilitaires
    ├── start.sh                   # Démarrage des services
    ├── stop.sh                    # Arrêt des services
    ├── status.sh                  # État des services
    └── cleanup.sh                 # Nettoyage complet
```

## 🔑 Accès aux services

| Service | URL | Credentials |
|---------|-----|------------|
| GitLab | http://gitlab.local:8080 | root / RootPassword123! |
| Harbor | http://harbor.local:8081 | admin / Harbor12345 |
| App Demo | http://localhost:8090 | - |

## 🔄 Pipeline CI/CD

### Stages

1. **test** : Linting et tests de syntaxe PHP
2. **sast** : Analyse de sécurité du code (GitLab SAST, Gitleaks, PHPStan)
3. **build** : Construction de l'image Docker
4. **scan-image** : Scan de vulnérabilités de l'image (Trivy)
5. **push** : Push vers Harbor Registry
6. **deploy** : Déploiement (manuel, optionnel)

### Outils SAST utilisés

- **GitLab SAST** : Analyse automatique du code PHP
- **Secret Detection** : Détection de credentials et secrets
- **Gitleaks** : Scan de secrets dans l'historique Git
- **PHPStan** : Analyse statique PHP niveau 5
- **Trivy** : Scan de vulnérabilités de l'image Docker
- **PHP_CodeSniffer** : Vérification des standards PSR-12

## 📚 Documentation

- [02-ARCHITECTURE-PIPELINE.md](02-ARCHITECTURE-PIPELINE.md) : Architecture complète et détaillée
- [03-MISE-EN-OEUVRE.md](03-MISE-EN-OEUVRE.md) : Guide d'installation pas à pas
- [app/.gitlab-ci.yml](app/.gitlab-ci.yml) : Configuration du pipeline CI/CD

## 🔧 Configuration requise

### Ressources système
- **CPU** : 4 cores minimum
- **RAM** : 10 GB minimum disponible
- **Disque** : 40 GB minimum
- **OS** : Debian 13 (labo-afpa 10.8.0.48)

### Logiciels requis
- Docker 24+
- Docker Compose 2.20+
- Git

## 📝 Notes importantes

- ⚠️ **Ne pas modifier** le dossier `/home/cj/gitdata/uyoop/UyoopApp/UyoopAppDocker/`
- ✅ Tous les fichiers de l'app sont **dupliqués** dans `CI/app/`
- 🔒 GitLab prend 3-5 minutes pour démarrer complètement
- 🐳 Harbor doit être installé séparément (voir guide)

## 🎓 Objectifs pédagogiques

1. ✅ Comprendre le fonctionnement d'un pipeline CI/CD
2. ✅ Maîtriser GitLab CI/CD et les runners
3. ✅ Intégrer l'analyse de sécurité (SAST) dans le pipeline
4. ✅ Utiliser Harbor comme registry privé
5. ✅ Scanner les vulnérabilités des images Docker
6. ⏭️ Transposer sur infrastructure production

## 🚦 Prochaines étapes

1. Démarrer les services avec `./scripts/start.sh`
2. Configurer le GitLab Runner (voir [03-MISE-EN-OEUVRE.md](03-MISE-EN-OEUVRE.md))
3. Installer Harbor (voir [03-MISE-EN-OEUVRE.md](03-MISE-EN-OEUVRE.md))
4. Créer le projet dans GitLab
5. Pousser le code et tester le pipeline
6. Analyser les résultats SAST
7. Intégrer sur l'infrastructure réelle

## 📖 Références

- [GitLab CI/CD Documentation](https://docs.gitlab.com/ee/ci/)
- [GitLab SAST](https://docs.gitlab.com/ee/user/application_security/sast/)
- [Harbor Documentation](https://goharbor.io/docs/)
- [Trivy Documentation](https://aquasecurity.github.io/trivy/)
- [Docker Compose](https://docs.docker.com/compose/)

## 🤝 Support

Pour toute question ou problème, consulter la section Troubleshooting dans [03-MISE-EN-OEUVRE.md](03-MISE-EN-OEUVRE.md).

---

**Date de création** : 27 janvier 2026  
**Environnement** : Debian 13 - labo-afpa (10.8.0.48)  
**Projet parent** : PROJET-INFRA-RBC
