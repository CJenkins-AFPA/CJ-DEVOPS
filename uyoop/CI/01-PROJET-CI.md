PRÉSENTATION ET OBJECTIFS PROJET

Projet-CI :
Déploiement d'une infra test sur 3 ou 4 VM

L'objectif est de travailler sur la mise en oeuvre d'un pipeline CI test qui sera ensuite transposé sur un projet infra réel (PROJET-INFRA-RBC) et en cours de déploiement.

INFRA RETENUE : Mode Hybride (GitLab.com + Runner Local)
- Orchestrateur CI : GitLab.com (SaaS gratuit) - Héberge le repository et pilote le CI
- Runner : Local (Docker) - Exécute les jobs sur votre machine
- Registry : Harbor Local - Stocke les images Docker
- App Démo : UyoopApp (PHP 8.4)

APP DÉMO : UyoopApp (PHP 8.4 + SQLite)
Source : /home/cj/gitdata/uyoop/UyoopApp/UyoopAppDocker/
Copie de travail : /home/cj/gitdata/uyoop/CI/app/

PIPELINE CI/CD SAST :
Stages : test → sast → build → scan-image → push → deploy
Outils : GitLab SAST, Gitleaks, PHPStan, Trivy, PHP_CodeSniffer

ÉTAT DU PROJET :
✅ Structure CI/ créée
✅ App UyoopApp préparée
✅ docker-compose.yml optimisé (App + Runner + Harbor)
✅ .gitlab-ci.yml prêt pour GitLab.com
✅ Documentation mise à jour pour le mode hybride
❌ GitLab Local supprimé (Resource intensive)

PROCHAINES ÉTAPES :
1. Créer projet sur GitLab.com
2. Enregistrer le Runner local sur le projet GitLab.com
3. Configurer variables Harbor dans GitLab.com
4. Pousser le code et valider le pipeline

DOCUMENTATION :
- 03-MISE-EN-OEUVRE.md : Guide pour connecteur GitLab.com et Runner local

ACCÈS AUX SERVICES :
- GitLab : http://gitlab.local:8080 (root / RootPassword123!)
- Harbor : http://harbor.local:8081 (admin / Harbor12345)
- App Demo : http://localhost:8090

Date : 27 janvier 2026
Environnement : Debian 13 - labo-afpa (10.8.0.48)