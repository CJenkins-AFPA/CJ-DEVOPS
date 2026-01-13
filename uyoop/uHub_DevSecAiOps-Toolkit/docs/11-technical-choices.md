# 11 – Choix Techniques & Implémentation

Ce document recense les décisions techniques prises lors de l'implémentation, conformément à la règle : "toute modification opérée en cours de prod doit être documentée".

## 1. Initialisation v1 (2026-01-09)

### 1.1 Frontend : Vue.js 3 + Vite
- **Choix** : Vue.js 3 avec Composition API.
- **Justification** : Compromis idéal entre performance et facilité de maintenance pour des équipes Ops (courbe d'apprentissage plus douce que React).
- **Tooling** :
  - `Vite` : Build tool ultra-rapide.
  - `TypeScript` : Pour la robustesse du typage.
  - `Vanilla CSS` : Choix de ne pas utiliser TailwindCSS pour l'instant pour respecter le Design System "sur mesure" défini.

### 1.2 Backend : Standard Pip
- **Choix** : Utilisation de `pip` avec `requirements.txt`.
- **Justification** : Simplicité et standardisation maximale. Évite la complexité d'outils comme Poetry pour un démarrage simple compatible avec tous les environnements CI/CD.
- **Image Docker** : `dhi.io/python:3.13` (Hardened, nécessite `docker login dhi.io`).

### 1.3 Hardening & Sécurité
- **Docker Images** :
  - **Backend** : Création d'un user `uhub` système. Pas de root.
  - **Frontend** : Configuration Nginx pour tourner avec l'utilisateur `nginx` (changement des droits sur `/var/run`, `/var/cache`).
- **Base de Données** : PostgreSQL 16 Alpine.

### 1.4 Ports
- **Backend** : 8000
- **Frontend** : 8080
- **Postgres** : 5432 (Attention : conflit local → mappé sur **5434**).
- **Vault** : 8200 (Attention : conflit local → mappé sur **8300**).

### 1.5 Idempotence & Opérations
- **Makefile** : Création d'un `Makefile` pour standardiser les commandes de cycle de vie.
  - `make up` : Build & Run (Idempotent).
  - `make clean` : Destruction totale (y compris volumes) pour repartir de zéro.
- **Principe** : L'application doit pouvoir être redémarrée à l'infini sans erreur. Les scripts d'initialisation (seeds) devront vérifier l'existence des données avant d'écrire (Check-before-write ou ON CONFLICT DO NOTHING).
