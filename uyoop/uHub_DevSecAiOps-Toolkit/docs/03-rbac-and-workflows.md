# 03 – RBAC et Workflows uHub

Ce document décrit les rôles de uHub, leurs droits principaux et trois workflows cœur alignés sur ces droits. Il s’appuie sur les bonnes pratiques RBAC DevOps (least privilege, séparation des fonctions, traçabilité). [web:354][web:356][web:360]

---

## 1. Rôles et principes

### 1.1 Rôles

uHub utilise quatre rôles principaux :

- **admin**
- **projets**
- **dev**
- **ops**

Ces rôles sont **globaux** (liés au User) mais plusieurs permissions sont évaluées **par projet** et **par environnement**.

### 1.2 Principes RBAC

- **Least privilege** : chaque rôle n’a que les permissions nécessaires à sa fonction. [web:354][web:356]  
- **Séparation des responsabilités** :  
  - Dev ne déploie pas librement en prod,  
  - Projets ne manipule pas directement l’infra,  
  - Admin configure et supervise. [web:354][web:360]  
- **Traçabilité totale** : les actions sensibles sont auditées via `AuditLog`. [web:340][web:360]

---

## 2. Droits par zones fonctionnelles

### 2.1 Utilisateurs, rôles, paramètres globaux

**Admin**

- Créer / modifier / supprimer des utilisateurs.  
- Assigner / retirer les rôles (`admin`, `projets`, `dev`, `ops`).  
- Gérer les groupes / équipes.  
- Modifier les paramètres globaux de l’application (thèmes disponibles, policies).  
- Configurer les intégrations : Vault, Git providers, Ansible, Terraform, Kubernetes, registries Docker. [web:353][web:357]

**Projets / Dev / Ops**

- Voir la liste des utilisateurs (éventuellement restreinte aux projets auxquels ils participent).  
- Modifier uniquement leur propre profil (display_name, thème, préférences).  
- Aucun droit sur les rôles ou les intégrations.

---

### 2.2 Projets & environnements

**Admin**

- Créer / modifier / supprimer n’importe quel projet.  
- Créer / modifier / supprimer les environnements d’un projet.  
- Archiver ou supprimer un projet (y compris ses artefacts).

**Projets**

- Créer de nouveaux projets (dans les limites définies par Admin).  
- Modifier les projets dont ils sont `owner` : nom, description, couleur, statut, backlog, jalons.  
- Ajouter / modifier / supprimer les environnements (`dev`, `test`, `staging`, `prod`) de leurs projets, dans les contraintes suivantes :  
  - politiques Admin possibles (ex : suppression d’un env prod uniquement avec validation Admin). [web:358][web:360]

**Dev / Ops**

- Voir les projets auxquels ils sont associés.  
- Ne pas créer / supprimer de projets.  
- Proposer des modifications de projet via des jobs ou tickets, pas en éditant directement la fiche projet (sauf champs mineurs éventuels à définir plus tard).

---

### 2.3 Jobs & calendrier

**Admin**

- Créer / modifier / supprimer tous les jobs, tous projets confondus.  
- Planifier / déplacer les événements dans le calendrier pour tous les projets.  
- Lancer tous les jobs (y compris en prod).

**Projets**

- Créer / modifier / supprimer des jobs pour les projets dont ils sont responsables, notamment :  
  - `meeting` (réunions agiles, points projet),  
  - `dev` (tâches projet),  
  - `ops` (opérations planifiées) – mais **sans exécuter** les scripts de déploiement.  
- Planifier et gérer les événements de calendrier (fenêtres de maintenance, jalons, releases planifiées). [web:343][web:340]

**Dev**

- Créer / modifier des jobs de type `dev` sur les projets auxquels ils participent.  
- Planifier des jobs sur des environnements non‑prod (`dev`, `test`, `staging` selon policy).  
- Ne pas supprimer des jobs critiques verrouillés (releases, maintenances, incidents).  
- Ne pas planifier de jobs qui ciblent directement `prod` (ou seulement via workflow validé par Projets/Ops).

**Ops**

- Créer / modifier des jobs de type `ops` / `maintenance` / `infra`.  
- Planifier des maintenances et des releases dans le calendrier, notamment en `staging` et `prod`.  

101: - Adapter les créneaux en fonction des contraintes de capacité, de charge, d’autres jobs. [web:360]
102: 
103: **Calendrier interactif & Drag‑Drop** :
104: - Projets : peuvent replanifier via drag‑drop leurs jobs (dans le respect des policies).
105: - Dev : drag‑drop autorisé pour jobs dev en non‑prod.
106: - Ops : drag‑drop pour ops/maintenance/infra; prod selon policy et approbation.
107: 
108: **Conflits de planning (ALERTE)** :
109: - Détection automatique des chevauchements critiques (bordure rouge, tooltip warning).
110: - En prod, approbation Projets/Admin requise pour décalage en cas de conflit.

---

### 2.4 Runs (exécutions techniques)

**Admin**

- Lancer un Run pour n’importe quel Job.  
- Consulter tous les logs d’exécution.  
- Annuler un Run en cours (kill).

**Projets**

- Voir les Runs des Jobs de leurs projets (statuts, horodatages, résumés).  
- Ne pas lancer de Runs techniques eux‑mêmes (sauf exception décidée plus tard).  

**Dev**

- Lancer des Runs sur les Jobs de type `dev` dans les environnements non‑prod.  
- Voir les logs des Runs qu’ils ont lancés et ceux de leur équipe sur leurs projets.  

**Ops**

- Lancer des Runs sur les Jobs de type `ops` / `infra` (et certains Jobs `dev` de type pipeline de déploiement).  
- Lancer des Runs sur `staging` et `prod` selon les policies en vigueur. [web:360]  

127: - Voir les logs et statuts pour tous les Runs liés à leurs projets.
128: 
129: **Guardrails d’exécution** :
130: - Dev : runs autorisés en non‑prod uniquement.
131: - Ops : runs en staging|prod via backends sécurisés (docker/k8s/webhook) et logs audités.

---

### 2.5 Incidents & post‑mortems

**Admin**

- Voir tous les incidents.  
- Modifier / fermer n’importe quel incident.  
- Consulter et annoter tous les post‑mortems.

**Projets**

- Créer des incidents liés à leurs projets (problèmes majeurs, défauts qualité).  
- Modifier la description, la sévérité proposée et l’impact projet.  
- Co‑éditer les post‑mortems côté métier / produit.

**Dev**

- Créer des incidents sur dev/test/staging (bugs critiques, échecs répétés des builds).  
- Lier des Jobs, Runs et GitChange (commits/MR) à un incident.  
- Contribuer à la partie technique du post‑mortem (root cause applicative). [web:340][web:330]

**Ops**

- Créer des incidents sur tous les environnements, notamment staging/prod.  
- Mettre à jour le statut de l’incident (`open` → `mitigated` → `resolved` → `closed`).  
- Documenter les actions de mitigation, rollback, tuning dans le post‑mortem.

---

### 2.6 Git & code

**Admin**

- Configurer les connexions aux providers Git (GitHub, GitLab, etc.).  
- Définir quelles organisations/repos sont visibles/configurables.  

**Projets**

- Déclarer les repos Git d’un projet (`GitRepo`), choisir la branche par défaut.  
- Ne jamais manipuler directement les credentials (seulement des références Vault gérées par Admin). [web:301][web:303][web:307]

**Dev**

- Voir les repos Git attachés à leurs projets.  
- Lier des commits/MR à des Jobs (objet `GitChange`).  
- Lancer des actions de type build/test en non‑prod (via CI/CD ou scripts référencés). [web:351][web:360]

**Ops**

- Voir les repos liés aux pipelines de déploiement.  
- Lancer des actions de déploiement/rollback via Jobs planifiés (et non pas via `git push` direct depuis uHub).  
- uHub reste orchestrateur, les pushes restent faits avec les outils dev classiques.

---

### 2.7 Ansible, Terraform, Kubernetes

**Admin**

- Configurer les intégrations Ansible/Terraform/K8s et Vault (sources, chemins, secrets). [web:301][web:303][web:307]

**Projets**

- Analyser un inventory Ansible, un plan Terraform et les rattacher à un projet (`Inventory`, `TerraformPlan`).  
- Voir les données structurées (groupes/hôtes, résumé des plans). [web:329][web:332]

**Dev**

- Consulter inventaires et plans pour comprendre l’infra.  
- Proposer des modifications via Jobs, MR ou plans, sans exécuter directement en prod.

**Ops**

- Lancer des scripts / playbooks / apply à partir des Jobs du calendrier, notamment :  
  - exécution sur staging / prod selon les policies,  
  - consultation des logs d’exécution. [web:329][web:332][web:360]

---

### 2.8 Vue serveur / observabilité

**Admin**

- Voir la vue serveur globale (CPU/RAM/disk) et configurer les sondes/collecte.  

**Projets / Dev / Ops**

- Consulter la vue serveur (lecture seule), éventuellement filtrée par contexte projet.  
- Pas de gestion infra profonde (power off, reboot, etc.) directement depuis cette vue dans v1.

---

### 2.9 Audit & sécurité

- Toutes les actions sensibles (création de projet, changement de rôle, exécution de job sur prod, modification d’un incident critique, etc.) sont enregistrées dans `AuditLog`. [web:354][web:356][web:360]  
- **Admin** peut consulter tous les logs.  
- **Projets / Dev / Ops** ont accès aux logs pertinents pour leurs projets via des vues filtrées.

---

## 3. Workflows concrets

### 3.1 Workflow – Déploiement applicatif (dev → staging → prod)

**Objectif** : déployer une nouvelle version d’une application avec séparation Dev / Ops / Projets et traçabilité complète. [web:340][web:343]

1. **Préparation de la release**
   - Dev : implémente la feature, crée une MR/PR, la relie à un Job `dev` (“Feature X – build & tests”).  
   - Projets : crée un Job “Release vX.Y – staging” (type `dev` ou `ops`), environnement = `staging`, et l’ajoute au calendrier.

2. **Build & validation non‑prod**
   - Dev : lance les Jobs techniques (build/tests) en `dev` puis `staging`, met à jour le Job en `success` si tout est OK.  
   - Ops : vérifie le résultat sur `staging` (logs, monitoring), confirme la readiness pour prod via un champ/flag.

3. **Planification déploiement prod**
   - Projets : crée un Job “Release vX.Y – production” (type `ops`), lié à l’environnement `prod`, planifié dans le calendrier (fenêtre de maintenance).  
   - Projets invite Dev/Ops concernés comme participants/observateurs.

4. **Exécution déploiement prod**
   - Ops : au créneau prévu, lance le Run du Job “Release vX.Y – production” (scripts/Ansible/Terraform/K8s référencés).  
   - Dev : consulte les logs si besoin, mais ne déclenche pas le Run en prod.

5. **Clôture & trace**
   - Ops : met le Job en `success` ou `failed`, crée un Incident si nécessaire (en cas d’échec).  
   - Projets : met à jour la fiche projet (version déployée, prochains jalons).  
   - Admin : dispose de la trace complète via `AuditLog` et les objets Project/Job/Run/Incident.

---

### 3.2 Workflow – Maintenance Ansible planifiée

**Objectif** : appliquer une maintenance infra (patch, configuration) de manière contrôlée via Ansible. [web:329][web:332]

1. **Analyse de l’inventory**
   - Ops (ou Projets avec Ops) : charge un `inventory.ini` (upload ou chemin) dans uHub.  
   - uHub crée un `Inventory` lié au projet, affiche les groupes/hôtes détectés.

2. **Création du Job de maintenance**
   - Projets : crée un Job `maintenance` (“Patch cluster dev”), lié à l’`Inventory` et à un `ScriptRef` Ansible.  
   - Planifie ce Job dans le calendrier sur un créneau adapté (faible risque, fenêtre de maintenance).

3. **Pré‑vérifications**
   - Ops : vérifie le groupe cible (ex : `k3s_workers`), les dépendances et la non‑collision avec d’autres Jobs critiques.

4. **Exécution**
   - Ops : lance le Run du Job à l’heure prévue, surveille les logs, annule si besoin.  
   - Admin : peut intervenir pour annuler/forcer en cas d’urgence.

5. **Post‑maintenance**
   - Ops : met le Job en `success` ou `failed`, ajoute un résumé dans la description.  
   - Projets : voit dans la timeline que la maintenance est effectuée et peut ajuster le planning projet.  
   - Si anomalie, un Incident est créé et lié au Job/Run.

---

### 3.3 Workflow – Incident critique & post‑mortem

**Objectif** : gérer un incident critique, lier les changements récents et produire un post‑mortem. [web:340][web:330]

1. **Détection**
   - Ops : détecte un incident (alertes monitoring, erreurs massives), crée un `Incident` (projet, sévérité `critical`, description, `status = open`).

2. **Lien avec les changements**
   - Ops + Dev : lient au même Incident :  
     - les Jobs récents (ex : “Release vX.Y – production”),  
     - les Runs associés,  
     - les `GitChange` (commits/MR déployés).

3. **Mitigation**
   - Ops : crée des Jobs de mitigation (rollback, scale up, patch), les exécute via des Runs.  
   - Quand la situation est stabilisée, passe l’Incident en `mitigated`.

4. **Résolution**
   - Ops : confirme que le service est revenu à un état acceptable, passe l’Incident en `resolved`.

5. **Post‑mortem**
   - Projets : décrit l’impact projet/clients, les décisions produit.  
   - Dev : documente la root cause applicative (bug, design, dette technique).  
   - Ops : documente les actions d’exploitation (mitigation, rollback, tuning).  
   - Ils remplissent ensemble l’objet `PostMortem` lié à l’Incident (résumé, timeline, actions).  

6. **Clôture & apprentissage**
   - Admin : valide le post‑mortem (si politique interne) et garantit que les actions correctives (Jobs futurs, changements de process) sont planifiées dans le calendrier.  
   - L’ensemble Incident + Jobs + Runs + GitChange + PostMortem sert de base à de futures analyses IA et à l’amélioration continue. [web:345]

---
