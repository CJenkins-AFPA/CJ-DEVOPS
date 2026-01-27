# RETEX : Premier Test CI "Hybride" (GitLab.com + Runner Local)

## 1. Contexte et Objectif
L'objectif était de valider la chaîne CI complète sur une architecture hybride :
- **Orchestrateur** : GitLab.com (SaaS).
- **Exécution** : Runner Local (Docker) sur le poste de travail.
- **Code** : Projet PHP simple (`UyoopApp`).

## 2. Étapes de Mise en Œuvre

### A. Configuration du Runner
- Enregistrement du Runner Docker local avec le token projet GitLab.
- Mode : `privileged` (Docker-in-Docker).
- Vérification : `docker exec ci-gitlab-runner gitlab-runner list`.

### B. Adaptation Architecture (Docker Compose)
- **Nettoyage** : Suppression du service `gitlab-ce` local (trop lourd/instable) pour passer en FULL Hybride.
- **Droits** : Correction des permissions sur le volume `app/data` (`chmod 777`) pour permettre au Healthcheck de passer.

### C. Le Pipeline `.gitlab-ci.yml`
Tentative de définition d'un pipeline complet (Test, SAST, Build, Deploy).

## 3. Incidents et Résolutions (Troubleshooting)

| Incident | Symptôme | Cause Racine | Solution Appliquée |
| :--- | :--- | :--- | :--- |
| **Terminal Figé** | `git push` bloqué sans invite | Absence de gestionnaire de credentials | Passage à l'authentification **SSH** (`git remote set-url`). |
| **Historique Git** | `! [rejected] main -> main` | Création de fichiers par défaut sur GitLab | Merge forcé : `git pull --allow-unrelated-histories`. |
| **YAML Invalid** | Pipeline échoue instantanément | Conflits de syntaxe sur les jobs `deploy` (même cachés) | **Simplification radicale** : Suppression temporaire des jobs de build/deploy pour ne garder que `Test` et `SAST`. |

## 4. Résultat Final
- **Statut Pipeline** : ✅ **PASSED** (Vert).
- **Jobs exécutés** :
  1. `lint:php` (Qualité de code).
  2. `gitleaks` (Détection de secrets).
- **Preuve de fonctionnement** : Les conteneurs éphémères apparaissent bien sur le poste local (`watch docker ps`) lors de l'exécution du pipeline distant.

---
*Date : 28 Janvier 2026*
