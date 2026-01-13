# uHub – Vision

Nom court : **uHub**  
Nom officiel : **uHub_DevSecAiOps-Toolkit**

## 1. Pourquoi uHub ?

uHub est conçu comme une **brique DevSecAiOps** au même titre qu’un serveur web (Nginx) ou un orchestrateur CI/CD : une pièce standard qu’on ajoute à une architecture pour organiser le travail des équipes DevOps. [web:335][web:338]

Les équipes ont déjà de nombreux outils spécialisés (GitHub/GitLab, Ansible, Terraform, Kubernetes, CI/CD, monitoring), mais elles manquent souvent d’un **hub opérationnel unique** qui relie :

- les projets (backlog, tâches, jalons, environnements),  
- les jobs (déploiements, maintenances, scripts, runbooks),  
- le code (commits, MR, branches),  
- l’infrastructure as code (Ansible, Terraform, Kubernetes),  
- l’infrastructure réelle (serveurs, clusters, ressources),  
- et, plus tard, l’IA (assistance runbook, post‑mortems, recommandations). [web:320][web:335][web:340]

uHub vise à combler ce manque.

## 2. Ce qu’est uHub

> **uHub est un portail DevSecAiOps de terrain qui relie projets, jobs, Git, Ansible/Terraform/Kubernetes et infra autour d’un calendrier et d’une fiche projet, avec une sécurité de niveau Vault et des workflows simples mais puissants.** [web:320][web:335][web:301][web:303][web:307]

Caractéristiques clés :

- **Portail DevOps** : une interface unique pour piloter les opérations techniques par projet.  
- **Calendrier opérationnel** : toutes les actions importantes (jobs, maintenances, déploiements, incidents, réunions) sont visibles dans une timeline claire. [web:343][web:340]  
- **Fiches projet complètes** : chaque projet rassemble ses repos Git, inventaires Ansible, plans Terraform, environnements, jobs, incidents et métriques.  
- **DevSecAiOps‑ready** : dès la conception, uHub intègre la sécurité (Vault, images hardened) et prépare le terrain pour des agents IA utiles et contrôlés. [web:301][web:303][web:307][web:345]

uHub ne remplace pas GitLab, Grafana ou Ansible : il les **orchesre** dans un flux cohérent, centré sur le temps et le projet.

## 3. Pour qui ?

- **Équipes DevOps** (PME, ESN, DSI) qui disposent déjà d’outils (Git, CI/CD, monitoring) mais veulent :  
  - une vue consolidée des opérations et changements,  
  - des workflows d’exécution standardisés,  
  - un historique lisible pour les post‑mortems et audits. [web:335][web:338][web:340]

- **Équipes projet techniques** (Dev + Ops + Chef de projet) qui veulent :  
  - planifier et suivre les releases, maintenances, incidents,  
  - rattacher code, infra et opérations à une même timeline,  
  - pouvoir démontrer “qui a fait quoi, quand, où et avec quoi”.

La cible est **toute infra on‑prem ou cloud** : uHub doit pouvoir tourner sur un serveur unique, un cluster k3s, ou dans le cloud selon les besoins.

## 4. Expérience utilisateur (UX/UI)

L’adhésion des professionnels passe par une **expérience utilisateur exemplaire**. uHub met la barre haut sur l’UX/UI :

- **Accueil** :  
  - Page d’accueil avec une **modale de connexion** centrée.  
  - Un **compte admin natif** est présent dès l’installation (`uyoop / uyoop-ADMIN`).  
  
55:   - Optionnel : comptes démo pré‑créés (un par rôle) avec 2–3 actions par profil pour faciliter la découverte.
56:   - **Comptes Démo** :
57:     - Comptes: `demo-admin` (Admin), `demo-projets` (Projets), `demo-dev` (Dev), `demo-ops` (Ops). Mot de passe = username. display_name en Prénom NOM. Emails demo-*@uhub.local.
58:     - Projets Démo:
59:       - Projet Pilote App X — owner `demo-projets`, color `#00ff00`
60:       - Infra K3s — owner `demo-ops`, color `#00cc88`
61:       - Registry Docker Privé — owner `demo-ops`, color `#66ffcc`
62:       - Monitoring Stack — owner `demo-projets`, color `#33ff99`
63:     - Jobs initiaux par projet: meeting, déploiement, rapport, maintenance.
64:   - **Calendrier & Command Palette** :
65:     - Drag‑drop pour replanifier; coloration par projet/type/statut; ALERTE des conflits (bordure rouge, tooltip, modale).
66:     - Command Palette (Ctrl/Cmd+K): créer/lancer des jobs, naviguer, rechercher globalement.

- **Principes UX** :  
  - Peu de clics, beaucoup de fonctions via des **formulaires intelligents** et des workflows guidés.  
  - Navigation claire : sections principales (Calendrier, Projets, Jobs, Git, Infra, Administration).  
  - Éviter l’effet “usine à gaz” : pas de menus labyrinthiques, pas de surcharge d’options à l’écran.

- **Charte graphique** :  
  - Logo uHub basé sur le symbole “u” entouré, fourni en PJ. [image:349]  
  - Thème **dark** par défaut.  
  - Couleurs :  
    - fond : `#000000`,  
    - texte : `#ffffff`,  
    - couleur dominante : `#00ff00` (vert uHub) avec variations plus sombres/plus claires et dégradés vers `#000000`.  
  - Style visuel :  
    - courbes, **border‑radius** généreux, effet d’**application souple** visuellement,  
    - style ultramoderne, épuré, intuitif, avec des CTA bien visibles.  
  - Police principale : **Comfortaa**, pour un rendu lisible mais distinctif.

L’objectif est que, dès les premières minutes, un·e professionnel·le DevOps comprenne **l’intérêt** de l’outil sans documentation lourde.

## 5. Rôles, sécurité et démo initiale

uHub repose sur quatre rôles principaux :

- **Admin** : tous les droits, configuration globale, intégrations, gestion des utilisateurs.  
- **Projets** : gestion des projets, des jobs projet, des réunions et jalons.  
- **Dev** : tâches de développement, liens Git, suivi des actions de code.  
- **Ops** : tâches d’exploitation, suivi des déploiements, incidents et reporting.

Pour la démo et les tests, uHub embarquera nativement :  

- 1 compte réel **admin** (`uyoop / uyoop-ADMIN`).  
- 1 compte de démonstration par rôle (`demo-admin`, `demo-projets`, `demo-dev`, `demo-ops` ou équivalent),  
- quelques projets et jobs pré‑créés (2–3 actions par profil) pour illustrer :

  - planification de jobs dans le calendrier,  
  - analyse d’inventaire Ansible ou plan Terraform rattaché à un projet,  
  - lancement d’un script/playbook/apply avec logs,  
  - suivi d’un déploiement et reporting d’événements,  
  - vue serveur (CPU/RAM/disk) contextualisée.

La **sécurité** est un principe fondateur :

- intégration de **Vault** dès la conception pour tous les secrets sensibles,  
- conteneurs basés sur des images **hardened** (DHI/Docker + bonnes pratiques),  
- préparation à un DevSecOps complet (validation de code, scans d’images, guardrails de déploiement).

uHub est conçu pour rester sécurisé « le plus longtemps possible » en s’appuyant sur les pratiques modernes de DevSecOps. [web:301][web:303][web:307][web:347]

## 6. IA : futur intégré, pas gadget

La v1 de uHub sera **IA‑ready** mais n’inclura pas encore d’IA complexe en production.  

Les fondations (modèle de données, journaux, API internes) sont pensées pour accueillir plus tard :

- un assistant de runbooks et de jobs,  
- un générateur de post‑mortems,  
- un agent de change management,  
- un assistant conversational DevOps. [web:336][web:345][web:347]

L’IA sera au service des workflows DevSecOps réels, pas un gadget marketing.

---

