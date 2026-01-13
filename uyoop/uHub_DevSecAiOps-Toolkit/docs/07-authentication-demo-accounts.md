# 07 – Authentification & Comptes Démo

Ce document détaille les mécanismes d’authentification pour l’API uHub et les comptes de démonstration inclus.

## 1. Authentification (v1)

uHub utilise le standard **OAuth2 avec Password Flow** pour obtenir un token **JWT** (JSON Web Token).

### 1.1 Endpoints

- **`POST /auth/token`**
  - **Payload** (form-urlencoded) : `username`, `password`
  - **Réponse** :
    ```json
    {
      "access_token": "eyJhbGciOiJIUzI1Ni...",
      "token_type": "bearer",
      "user": { ... }
    }
    ```

- **`GET /auth/me`**
  - Requiert Header : `Authorization: Bearer <token>`
  - Retourne les infos de l’utilisateur courant.

- **`POST /bootstrap/admin`**
  - Initialisation du premier compte admin si la base est vide.

### 1.2 JWT

Le token contient au minimum :
- `sub` : ID utilisateur
- `username` : Nom d’utilisateur
- `role` : Rôle (admin, projets, dev, ops)
- `exp` : Date d’expiration

### 1.3 Roadmap SSO (v2)
L’intégration OIDC (OpenID Connect) est prévue pour la v2 afin de supporter le SSO d’entreprise (Okta, Keycloak, Azure AD), avec mapping automatique des rôles.

---

## 2. Comptes Démo

Pour faciliter la prise en main et les tests, uHub peut être initialisé avec des données de démonstration via la variable d’environnement `UHUB_SEED_DEMO=true` ou via le script de seed.

### 2.1 Utilisateurs Démo

Tous les comptes ont pour mot de passe : **leur username**.

| Username       | Rôle    | Display Name   | Email                   | Description |
|----------------|---------|----------------|-------------------------|-------------|
| `demo-admin`   | **Admin** | Alice ADMIN    | demo-admin@uhub.local   | Accès complet, config système |
| `demo-projets` | **Projets**| Bruno PROJETS | demo-projets@uhub.local | Gestionnaire de projets & planning |
| `demo-dev`     | **Dev** | Chloé DEV      | demo-dev@uhub.local     | Développeuse back/front |
| `demo-ops`     | **Ops** | David OPS      | demo-ops@uhub.local     | Ingénieur SRE / Infra |

### 2.2 Projets Démo

Quatre projets sont créés pour illustrer des cas réels :

1.  **Projet Pilote App X** (Couleur: `#00ff00`)
    - *Owner*: `demo-projets`
    - *But*: Application web standard.

2.  **Infra K3s** (Couleur: `#00cc88`)
    - *Owner*: `demo-ops`
    - *But*: Gestion du cluster Kubernetes de l'entreprise.

3.  **Registry Docker Privé** (Couleur: `#66ffcc`)
    - *Owner*: `demo-ops`
    - *But*: Maintenance du registre d'images.

4.  **Monitoring Stack** (Couleur: `#33ff99`)
    - *Owner*: `demo-projets`
    - *But*: Tableaux de bord Grafana / Prometheus.

Chaque projet est pré-peuplé avec des jobs de type Meeting, Déploiement, Rapport et Maintenance.
