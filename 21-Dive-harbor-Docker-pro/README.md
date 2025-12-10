# TP21 - Dive + Harbor (Production) avec Ansible

Automatiser l'audit des images poussées sur Harbor (stack TP16) avec l'outil Dive, en mode non interactif et intégrable en CI/CD.

## 🎯 Objectifs
- Déployer automatiquement Dive sur un bastion/runner via Ansible.
- Analyser une image issue de Harbor en mode CI (`--ci`) avec seuil d'efficacité.
- Exporter un rapport JSON/HTML pour vos pipelines.

## 🗂️ Contenu
- `ansible/inventory.ini` : exemple d'inventaire.
- `ansible/inventory.local.ini` : inventaire prêt pour les tests en local (localhost).
- `ansible/playbook.yml` : installation optionnelle de Docker, gestion du service Docker, installation de Dive, analyse Harbor, récupération locale des rapports, login Harbor optionnel.

## ✅ Prérequis
- Accès SSH à un hôte d'analyse (Ubuntu/Debian) avec Docker 20.10+ et Compose 2+.
- Ansible 2.14+ lancé depuis votre poste.
- Un compte Harbor avec droits de pull sur le projet ciblé.
- Variables Harbor (hostname, projet, image, tag) à définir dans le playbook ou via `--extra-vars`.

## 🚀 Quickstart
```bash
cd 21-Dive-harbor-Docker-pro/ansible

# 1) Adapter l'inventaire
cp inventory.ini inventory.local.ini
# éditer l'hôte et l'utilisateur SSH

# 2) Lancer le playbook (rapports rapatriés en local par défaut)
# En local : Docker sera installé si absent (install_docker=true)
ansible-playbook -i inventory.local.ini playbook.yml \
  -e harbor_host=harbor.example.com \
  -e harbor_project=prod \
  -e harbor_image=api \
  -e harbor_tag=2025.01.0 \
  -e harbor_username=ci-bot \
  -e harbor_password="<token>" \
  -e lowest_efficiency=0.90 \
  -e dive_fetch_reports=true \
  -e dive_local_reports_dir=$(pwd)/reports \
  -e install_docker=true
```

## 🔧 Paramètres clés (variables)
- `install_docker` : installer et démarrer Docker si absent (défaut: true pour les tests locaux).
- `dive_version` : version binaire (défaut: 0.12.0).
- `lowest_efficiency` : seuil minimal d'efficacité Dive (défaut: 0.90).
- `harbor_host` / `harbor_project` / `harbor_image` / `harbor_tag` : cible d'analyse.
- `harbor_username` / `harbor_password` : credentials de pull (no_log).
- `report_dir` : dossier de sortie des rapports sur le bastion (`/tmp/dive-reports`).
- `dive_fetch_reports` : rapatrier les rapports sur la machine de contrôle (défaut: true).
- `dive_local_reports_dir` : répertoire local pour les artefacts (défaut: `ansible/reports`).
- `manage_docker_service` : démarrer le service Docker même si déjà installé (défaut: true).
- `harbor_login_enabled` : activer/désactiver le `docker login` (défaut: true).
- `full_image` : image complète utilisée (construite depuis host/project/image/tag).

### Exemple test sans login (image publique)
```bash
ansible-playbook -i inventory.local.ini playbook.yml \
  -e harbor_host=registry-1.docker.io \
  -e harbor_project=library \
  -e harbor_image=busybox \
  -e harbor_tag=latest \
  -e harbor_login_enabled=false \
  -e lowest_efficiency=0.80 \
  -e dive_fetch_reports=true \
  -e dive_local_reports_dir=$(pwd)/reports \
  -e install_docker=false \
  -e manage_docker_service=true \
  --ask-become-pass
```

## 📈 Résultat attendu
- Docker installé et démarré si absent (quand `install_docker=true`).
- Dive installé sur l'hôte cible.
- Docker CLI vérifié avant exécution.
- Image `harbor_host/harbor_project/harbor_image:harbor_tag` pullée.
- Rapport JSON `dive-report.json` (et texte `dive-report.txt`) généré dans `report_dir`.
- Rapports rapatriés en local dans `dive_local_reports_dir` (si `dive_fetch_reports=true`).
- Échec du playbook si l'efficacité est < `lowest_efficiency` (gating CI/CD).

## 🧪 Intégration CI/CD (exemple GitLab)
```yaml
dive_audit:
  stage: test
  image: python:3.12-slim
  before_script:
    - apt-get update && apt-get install -y ansible sshpass
  script:
    - ansible-playbook -i ansible/inventory.local.ini ansible/playbook.yml \
        -e harbor_host=$HARBOR_HOST \
        -e harbor_project=$CI_PROJECT_NAME \
        -e harbor_image=api \
        -e harbor_tag=$CI_COMMIT_SHORT_SHA \
        -e harbor_username=$HARBOR_USER \
        -e harbor_password=$HARBOR_PASS \
        -e lowest_efficiency=0.92
  artifacts:
    paths:
      - ansible/dive-report.json
      - ansible/dive-report.txt
```

## 📚 Ressources
- Dive : https://github.com/wagoodman/dive
- Harbor : https://goharbor.io/
- Article Dive : https://blog.stephane-robert.info/docs/conteneurs/outils/dive/
- TP16 Harbor Pro : `16-harbor-pro/`
