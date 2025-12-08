# 📝 CHANGELOG - TPs Docker

Historique des versions et ajouts de TPs pour la formation Docker DevOps.

---

## [v2.2.0] - 2025-12-08

### ✨ Ajouts
- **TP20** : Dive Docker - Analyse interactive des layers d'images (TUI/CI)
- **TP21** : Dive + Harbor avec Ansible - Audit automatisé pour registries
- **TP22** : Dive Test Suite - Exercice complet (bad/good Dockerfile, scripts)

### 📚 Documentation
- README.md mis à jour avec section "Audit & Qualité d'Image"
- CHANGELOG.md créé pour traçabilité des versions
- Structure professionnelle TP22 (dockerfiles, app, scripts, ansible, results)

### 🛠️ Infrastructure
- Playbook Ansible pour installation Docker + Dive
- Scripts de diagnostic et comparaison automatisés
- .gitignore étendu (exclusion des artifacts volumineux)

---

## [v2.1.0] - 2025-12-07

### ✨ Ajouts
- **TP19** : AfpaBike - Refonte Dev/DevOps avec 3 variantes (base, DevOps-ok, App-ok)

### 📚 Documentation
- README détaillé pour chaque variante AfpaBike
- Documentation complète de la stack Docker (healthchecks, volumes, init SQL)

---

## [v2.0.0] - 2025-12-06

### ✨ Ajouts (TPs Production-Ready)
- **TP16** : Harbor Production - Registry HA avec Traefik, monitoring, backups
- **TP17** : Portainer Docker - Portainer CE pour gestion conteneurs
- **TP18** : Portainer Enterprise - Portainer EE avec PostgreSQL, GitOps, Traefik

### 📚 Documentation
- Guides QUICKSTART pour chaque TP pro
- Documentation MANIFEST (composants, ports, variables)
- Commandes essentielles (COMMANDS.md)

---

## [v1.9.0] - 2025-12-05

### ✨ Ajouts
- **TP14** : Prometheus + Grafana Pro - Stack observabilité complète (10 services)
- **TP15** : Harbor Docker - Registry avec scanning Trivy

### 🔒 Sécurité
- Traefik v3 avec SSL/TLS automatique
- Monitoring multi-services (Prometheus, Grafana, Loki, Alertmanager)
- Alerting multi-canal (email, Slack, webhook)

---

## [v1.7.0] - 2025-12-04

### ✨ Ajouts
- **TP12** : NetBox Professionnel - IPAM/DCIM avec Traefik, monitoring
- **TP13** : Prometheus Docker - Stack monitoring de base

### 📚 Documentation
- Guides d'API (REST, GraphQL) pour NetBox
- Configuration Prometheus/Grafana

---

## [v1.5.0] - 2025-12-03

### ✨ Ajouts
- **TP10** : BookStack Production - Sécurité multi-couches (Traefik, Authelia, CrowdSec)
- **TP11** : NetBox Docker - IPAM/DCIM basique

### 🔒 Sécurité
- Authentification 2FA avec Authelia
- IDS/IPS avec CrowdSec
- Backups automatisés chiffrés

---

## [v1.0.0] - 2025-12-01

### ✨ Release Initiale (TP01-09)
- **TP01** : Installation Docker
- **TP02** : Commandes Docker de base
- **TP03** : Docker Compose
- **TP04** : Docker Registry Privé
- **TP05** : Réseaux Docker
- **TP06** : Volumes Docker
- **TP07** : Dockerfiles optimisés
- **TP08** : Docker Swarm
- **TP09** : BookStack Docker (basique)

### 📚 Documentation
- README principal avec parcours recommandé
- Structure organisée par niveau (débutant → expert)

---

## 📊 Statistiques Globales

- **Total TPs** : 22
- **Niveaux** : Débutant (5), Intermédiaire (8), Avancé/Prod (9)
- **Durée totale** : ~60-70 heures
- **Documentation** : 15,000+ lignes
- **Scripts** : 30+ scripts d'automation

---

## 🔗 Liens Utiles

- **Repository** : https://github.com/CJenkins-AFPA/CJ-DEVOPS
- **Branch** : docker
- **README Principal** : [README.md](README.md)
