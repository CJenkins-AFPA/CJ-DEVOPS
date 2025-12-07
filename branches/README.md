# Structure du dossier `branches`

Ce dossier regroupe une copie locale de chaque branche Git du projet CJ-DEVOPS. Il permet de :

- **Consulter le contenu de chaque branche** sans changer de branche Git
- **Comparer facilement** les différents travaux, TPs, playbooks, applications, etc.
- **Préparer ou organiser** tes ajouts futurs (cours, TP, docs)

## Organisation

- `branches/main/` : Branche principale, version stable et documentation globale
- `branches/ansible-automation/` : Infrastructure as Code (Ansible), playbooks et rôles
- `branches/docker/` : TPs Docker, exemples, exercices, best practices
- `branches/test/` : Environnements de test, labs Vagrant
- `branches/uyoop-app/` : Application Uyoop (PHP et version dockerisée)
- `branches/vagrant-vms/` : TPs Vagrant, machines virtuelles

Chaque dossier contient le contenu exact de la branche correspondante, consultable et modifiable localement.

## Utilisation

- Pour **travailler sur une branche**, utilise le dossier correspondant dans `branches/`
- Pour **ajouter un nouveau TP ou cours**, crée un dossier dans la branche concernée puis synchronise avec Git
- Pour **présenter ton travail**, tu peux montrer l’arborescence complète sans changer de branche

## Avantages

- **Gain de temps** pour la navigation et la comparaison
- **Clarté** pour les recruteurs, formateurs ou collaborateurs
- **Préparation facilitée** pour l’ajout de nouveaux contenus

---

> Cette organisation est idéale pour un portfolio DevOps évolutif et pédagogique.
