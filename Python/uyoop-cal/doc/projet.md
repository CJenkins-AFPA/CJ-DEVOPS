# uYoop-Cal — Cahier des Charges Projet (Version Finale Attendue)

**Version:** 1.0.0  
**Date:** 8 janvier 2026  
**Statut:** Spécification du produit final  
**Portée:** Application DevOps/Agile centralisée production-ready

---

## 1. Vision & Objectifs

### 1.1. Vision du Produit

**uYoop-Cal** est une plateforme centralisée de gestion DevOps + Agile permettant aux équipes techniques de **planifier, exécuter et superviser** l'intégralité du cycle de vie logiciel depuis une interface unique et sécurisée.

**Promesse centrale:**  
*"Un centre de contrôle DevOps/Agile qui pilote calendrier, sprints, déploiements, métriques et logs depuis un hub unifié — déployé sur infra K3s production avec sécurité enterprise."*

### 1.2. Objectifs Métier

1. **Coordination équipes** : Plannings individuels, daily standups, sprint reviews, rétrospectives
2. **Traçabilité opérations** : Logs critiques (bugs, déploiements succès/échec) en temps réel
3. **Automatisation CI/CD** : Déclenchement pipelines, webhooks GitLab/GitHub, intégration Jenkins
4. **Conformité sécurité** : Approbations déploiements prod, RBAC granulaire, audit trail
5. **Prise de décision data-driven** : Métriques DORA, burndown charts, graphiques de tendances
6. **Scalabilité infrastructure** : K3s autoscaling, haute disponibilité, monitoring Prometheus/Grafana

---

## 2. Architecture Cible (Finale)

### 2.1. Stack Technique

#### Backend
- **Framework:** FastAPI 0.115+ (Python 3.14)
- **ORM:** SQLAlchemy 2.0 avec support JSONB
- **Base de données:** PostgreSQL 16 HA (patroni/repmgr)
- **Cache:** Redis (sessions, rate limiting distribué)
- **Auth:** JWT tokens (access 30min, refresh 7j) + 2FA TOTP via Vault

#### Frontend
- **Core:** Vanilla JS (FullCalendar 6.1.x, Chart.js 4.x)
- **Design:** Responsive mobile-first, dark theme noir/vert néon
- **Structure:** SPA avec routing côté client, API REST
- **Assets:** CSS externalisé (`style.css`), JS modulaire (`app.js`)

#### Infrastructure
- **Orchestration:** Kubernetes (K3s) sur Proxmox/Azure/ESXi
- **IaC:** Terraform (infrastructure), Ansible (configuration)
- **Secrets:** HashiCorp Vault HA (3 nodes Raft, TLS/mTLS)
- **Monitoring:** Prometheus + Grafana + Alertmanager
- **Logging:** ELK Stack ou Loki + Promtail
- **Networking:** Nginx Ingress Controller, CoreDNS, Calico CNI
- **Registry:** Harbor (Docker registry privé avec scan Trivy)

#### Sécurité
- **Image applicative:** DHI (Docker Hardened Images) dhi.io/python:3.14.2-debian13-cis-l2
- **Runtime:** Distroless, nonroot (UID 1000), read-only filesystem, capabilities dropped
- **TLS:** Certificats Let's Encrypt ou CA interne, renouvellement automatique (cert-manager)
- **Scanning:** Trivy (CVE), Snyk (dependencies), SBOM généré à chaque build
- **Compliance:** CIS benchmarks, PSP/OPA policies K3s

### 2.2. Schéma d'Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                        Internet (WAN sécurisé)                      │
└────────────────────────┬────────────────────────────────────────────┘
                         │
                    [Nginx Ingress]
                         │
        ┌────────────────┼────────────────┐
        │                │                │
   [uYoop-Cal]      [Vault HA]      [PostgreSQL HA]
   Pods (3x)        (3 nodes)       (Primary + 2 replicas)
        │                │                │
        └────────────────┴────────────────┘
                         │
              [Prometheus + Grafana]
              [ELK/Loki Stack]
```

**Composants clés:**
- **uYoop-Cal pods** : 3 réplicas (HPA sur CPU/RAM)
- **Vault cluster** : 3 nodes Raft, TLS end-to-end
- **PostgreSQL** : Patroni HA avec failover automatique
- **Storage** : Persistent Volumes (Longhorn, Rook-Ceph, ou cloud CSI)
- **Backup** : Velero (snapshots K3s), Raft snapshots Vault, pg_basebackup

---

## 3. Fonctionnalités (Version Finale)

### 3.1. Gestion d'Événements Multi-Type

#### Types d'événements supportés

##### 1. **Meeting** (Réunions)
**Créateurs:** PROJET, ADMIN  
**Champs:**
- Titre, date/heure, durée
- Type réunion : daily, sprint planning, retrospective, review, technique
- Participants (multi-select depuis liste membres)
- Lien visio (Zoom/Meet/Teams)
- Notes/Agenda (markdown)
- Tags : sprint number, epic
- Récurrence : unique, quotidien, hebdomadaire, mensuel

**Workflow:**
1. Étape 1 : Infos de base
2. Étape 2 : Participants + type + lien visio
3. Étape 3 : Agenda + récurrence
4. Étape 4 : Récapitulatif + création

##### 2. **Deployment Window** (Fenêtres de Déploiement)
**Créateurs:** OPS, PROJET, ADMIN  
**Champs:**
- Environnement : dev, staging, prod
- Date/heure début + durée estimée
- Services impactés (checklist)
- Description changements
- Approbation requise (prod uniquement)
- Checklist pré-déploiement (validation avant exécution)
- Rollback plan (procédure de retour arrière)
- Statut : planned → in-progress → completed/failed/rolled-back

**Workflow:**
1. Étape 1 : Environnement + date/heure
2. Étape 2 : Services impactés + description
3. Étape 3 : Checklist pré-deploy (si prod : approbation ADMIN)
4. Étape 4 : Rollback plan
5. Étape 5 : Récapitulatif + soumission approbation

**Approbations (prod):**
- ADMIN reçoit notification email/Slack
- Bouton "Approuver/Refuser" dans interface
- Historique des approbations visible

##### 3. **Git Action** (Actions Git)
**Créateurs:** DEV, ADMIN  
**Champs:**
- Repository URL (validation format Git)
- Branche (auto-complétion depuis remote)
- Action : clone, pull, merge, tag, release
- Déclencheur : manuel, automatique (webhook), planifié (cron)
- Post-actions : run tests, build Docker image, notify Slack
- Logs en temps réel (streaming via WebSocket)

**Workflow:**
1. Étape 1 : Repository + branche
2. Étape 2 : Action + déclencheur
3. Étape 3 : Post-actions (optionnel)
4. Étape 4 : Récapitulatif + planification

**Exécution:**
- Sandbox : Pods K3s éphémères avec limites CPU/RAM
- Timeout : 30 min max
- Logs : streaming temps réel, stockage S3/Longhorn
- Audit : git_action_id, user, timestamp, exit code

### 3.2. Système RBAC (4 Rôles)

| Rôle    | Permissions Événements                          | Permissions Utilisateurs | Permissions Git Actions |
|---------|-------------------------------------------------|--------------------------|-------------------------|
| **PROJET** | Créer/éditer/supprimer tous types (ses events) | Consulter liste          | Consulter logs          |
| **DEV**    | Créer/éditer/supprimer git_action uniquement    | Consulter liste          | Exécuter (ADMIN/DEV)    |
| **OPS**    | Créer/éditer/supprimer deployment_window uniquement | Consulter liste       | Consulter logs          |
| **ADMIN**  | Tous pouvoirs (tous events, tous users)        | CRUD complet             | Exécuter + gérer        |

**Permissions granulaires:**
- Édition/suppression : créateur **ou** ADMIN
- Approbation déploiements prod : ADMIN uniquement
- Gestion équipes : ADMIN + PROJET (son équipe)
- Délégation temporaire : PROJET peut donner rôle DEV lead (72h max)

### 3.3. Fonctionnalités Collaboratives

#### Commentaires & Mentions
- Thread de discussion sur chaque événement
- Mentions `@username` (notification email/Slack)
- Markdown support (code blocks, liens, images)
- Réactions emoji (👍 ✅ ❌ 🔥)

#### Notifications Multi-Canal
- **Email** : Digest quotidien + alertes critiques
- **Slack/Teams** : Webhooks sortants configurables
- **In-app** : Badge notification dans header (compteur non lu)
- **Alertes** : Déploiement prod imminent (24h, 1h, 15min avant)

#### Approbations (Prod)
- Workflow 3 étapes : Soumission → Review → Approbation/Refus
- Commentaires obligatoires si refus
- Historique traçable (qui, quand, pourquoi)

### 3.4. Métriques DevOps (DORA)

#### Dashboard dédié
Page `/metrics` avec graphiques temps réel :

1. **Deployment Frequency**
   - Graphique barres : déploiements/semaine par environnement
   - Objectif cible : ≥5 déploiements/semaine (prod)
   
2. **Lead Time for Changes**
   - Graphique ligne : temps commit → déploiement (médiane)
   - Objectif cible : <1 jour (dev), <7 jours (prod)
   
3. **Change Failure Rate**
   - Graphique donut : % déploiements échoués/rolled-back
   - Objectif cible : <15%
   
4. **Time to Restore Service (MTTR)**
   - Graphique ligne : durée moyenne rollback
   - Objectif cible : <1h

**Export:**
- PDF mensuel auto-généré (envoi par email)
- CSV téléchargeable (pour Excel/PowerBI)
- API endpoint `/api/metrics?start=2026-01&end=2026-03`

### 3.5. Gestion Agile & Sprints

#### Sprints
- Durée : configurable (1–4 semaines, défaut 2 semaines)
- Création automatique : planning récurrent
- Vue dédiée : `/sprints/42`
- Backlog intégré : import depuis Jira/GitHub Issues via API
- Burndown chart : tâches restantes vs. jours sprint

#### Templates Récurrents
- Daily standups : lundi–vendredi 9h00
- Sprint planning : 1er jour sprint 10h00
- Retrospective : dernier jour sprint 16h00
- Maintenance windows : 1er samedi du mois 02h00

#### Vue Kanban
Complément au calendrier : `/kanban`

Colonnes :
```
[ To Plan ] → [ Planned ] → [ In Progress ] → [ Done ]
```

- Drag & drop événements entre colonnes
- Filtres : type, équipe, sprint, assigné
- Export PNG/PDF (screenshot automatique)

### 3.6. Intégrations CI/CD

#### Webhooks Entrants
Créer automatiquement deployment_window sur événements externes :

- **GitLab/GitHub** : merge vers `main` → déploiement staging planifié
- **Jenkins** : build success → notification in-app
- **Sentry** : erreur critique → création incident

#### Webhooks Sortants
Notifier systèmes externes lors d'événements uYoop-Cal :

- Création git_action → déclencher pipeline GitLab CI
- Déploiement prod → message Slack #ops-prod
- Échec déploiement → créer ticket Jira automatique

#### Intégration Continue (uYoop-Cal App)
- **GitHub Actions** : build, tests, Trivy scan, push Harbor
- **ArgoCD** : GitOps deployment vers K3s
- **SonarQube** : qualité code (coverage >80%, code smells)

---

## 4. Design & Charte Graphique

### 4.1. Identité Visuelle

**Palette de couleurs** (d'après `style.css`) :

| Couleur          | Hex       | Usage                                      |
|------------------|-----------|--------------------------------------------|
| Noir absolu      | `#000000` | Background principal (dégradé radial)      |
| Gris foncé       | `#050505` | Panels, cartes, modals                     |
| Vert néon        | `#00ff00` | Accent principal (CTA, succès, hover)      |
| Jaune            | `#facc15` | Alertes, warnings                          |
| Blanc cassé      | `#f9fafb` | Texte principal                            |
| Gris bordures    | `#222222` | Séparateurs, borders muted                 |

**Typographie:**
- Police système : `system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif`
- Titres : `letter-spacing: 0.06em`, font-weight 600
- Body : `font-size: 0.9rem`, line-height 1.5

**Logo:**
- Fichier : `app/static/uG512.png` (50x50px)
- Position : header gauche, à côté du titre
- Format : PNG transparent, fond noir compatible

### 4.2. Layout & Composants

#### Header
```
[Logo] uYoop-Cal | DevOps Calendar    [🟢 Operational v0.1.0]    [Username] [Logout]
```
- Gradient noir : `linear-gradient(135deg, #000000, #050505)`
- Border-bottom : `1px solid #222`
- Box-shadow : `0 3px 15px rgba(0,0,0,0.8)`

#### Navbar
```
[Calendrier] [Tableau] [Dashboard] [Membres*]    [Filtres ▾]  [+ Nouvel événement]
```
- Tabs : background `#020617`, border `#374151`
- Active : border-color `#00ff00`, background `rgba(0,255,0,0.1)`
- Bouton principal : `#00ff00` avec box-shadow néon sur hover

#### Calendar View (FullCalendar)
- Theme : custom dark
- Événements colorés par type :
  - Meeting : `#3b82f6` (bleu)
  - Deployment : `#facc15` (jaune)
  - Git Action : `#00ff00` (vert)
- Hover : glow effect `box-shadow: 0 0 12px rgba(couleur, 0.6)`

#### Modal Création (Multi-étapes)
```
┌─────────────────────────────────────┐
│  Créer un événement                 │
│  ● ○ ○  (Step 1/3)                  │
├─────────────────────────────────────┤
│  [Champs formulaire]                │
│                                     │
│  [Précédent]       [Suivant →]     │
└─────────────────────────────────────┘
```
- Background : `#050505`
- Indicateurs : dots `●` vert (active), `○` gris (inactive)
- Boutons : secondaire (précédent), primaire (suivant/créer)

#### Dashboard Métriques
Grille responsive 2x2 :
```
┌────────────────┬────────────────┐
│ Deployment Freq│ Lead Time      │
│ [Chart.js bar] │ [Chart.js line]│
├────────────────┼────────────────┤
│ Failure Rate   │ MTTR           │
│ [Chart.js pie] │ [Chart.js line]│
└────────────────┴────────────────┘
```
- Cartes : background `#050505`, border `#222`
- Graphiques : thème dark Chart.js, couleurs palette

### 4.3. Responsive & Accessibilité

#### Breakpoints
- **Desktop** : ≥1200px (layout complet)
- **Tablet** : 768px–1199px (navbar collapse, 2 colonnes)
- **Mobile** : <768px (1 colonne, menu hamburger)

#### Accessibilité (WCAG 2.1 AA)
- Contraste texte/background : ≥4.5:1
- Focus visible : outline `2px solid #00ff00`
- Navigation clavier : tab order logique
- ARIA labels : modals, boutons icônes
- Screen reader : alt text images, roles sémantiques

### 4.4. Animations & Micro-interactions

- **Transitions** : `all 0.2s ease` (buttons, borders)
- **Hover effects** :
  - Boutons : border-color change + box-shadow néon
  - Cartes : translate Y -2px + shadow augmentée
- **Loading states** : spinner CSS (pas de GIF), skeleton screens
- **Toasts notifications** : slide-in depuis top-right, auto-dismiss 5s

---

## 5. Spécifications Techniques Détaillées

### 5.1. Modèle de Données (PostgreSQL)

#### Table `users`
```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(100) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(20) CHECK (role IN ('PROJET', 'DEV', 'OPS', 'ADMIN')),
  team_id INTEGER REFERENCES teams(id),
  totp_enabled BOOLEAN DEFAULT false,
  totp_secret VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### Table `events`
```sql
CREATE TABLE events (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  start TIMESTAMP NOT NULL,
  "end" TIMESTAMP NOT NULL,
  type VARCHAR(50) CHECK (type IN ('meeting', 'deployment_window', 'git_action')),
  extra JSONB DEFAULT '{}',
  created_by INTEGER REFERENCES users(id),
  status VARCHAR(50) DEFAULT 'planned',
  approved_by INTEGER REFERENCES users(id),
  approved_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_events_start ON events(start);
CREATE INDEX idx_events_type ON events(type);
CREATE INDEX idx_events_created_by ON events(created_by);
CREATE INDEX idx_events_extra_gin ON events USING GIN(extra);
```

#### Table `comments`
```sql
CREATE TABLE comments (
  id SERIAL PRIMARY KEY,
  event_id INTEGER REFERENCES events(id) ON DELETE CASCADE,
  user_id INTEGER REFERENCES users(id),
  content TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);
```

#### Table `teams`
```sql
CREATE TABLE teams (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) UNIQUE NOT NULL,
  description TEXT,
  lead_id INTEGER REFERENCES users(id)
);
```

#### Table `git_action_logs`
```sql
CREATE TABLE git_action_logs (
  id SERIAL PRIMARY KEY,
  git_action_id INTEGER REFERENCES events(id) ON DELETE CASCADE,
  executed_by INTEGER REFERENCES users(id),
  exit_code INTEGER,
  stdout TEXT,
  stderr TEXT,
  duration_seconds INTEGER,
  executed_at TIMESTAMP DEFAULT NOW()
);
```

### 5.2. API Endpoints (REST)

#### Authentification
- `POST /auth/register` : Créer compte
- `POST /auth/login` : Login (retourne JWT access + refresh)
- `POST /auth/refresh` : Renouveler access token
- `POST /auth/logout` : Invalider refresh token
- `POST /auth/2fa/setup` : Générer QR code TOTP
- `POST /auth/2fa/enable` : Activer 2FA avec code
- `POST /auth/2fa/verify` : Vérifier code TOTP

#### Utilisateurs
- `GET /users` : Liste utilisateurs (filtres : role, team)
- `POST /users` : Créer utilisateur (ADMIN)
- `GET /users/{id}` : Détails utilisateur
- `PUT /users/{id}` : Modifier (ADMIN ou self)
- `DELETE /users/{id}` : Supprimer (ADMIN)

#### Événements
- `GET /events` : Liste événements (filtres : type, start, end, status)
- `POST /events` : Créer événement (permissions RBAC)
- `GET /events/{id}` : Détails événement
- `PUT /events/{id}` : Modifier (créateur ou ADMIN)
- `DELETE /events/{id}` : Supprimer (créateur ou ADMIN)

#### Commentaires
- `GET /events/{id}/comments` : Liste commentaires
- `POST /events/{id}/comments` : Ajouter commentaire
- `DELETE /comments/{id}` : Supprimer (auteur ou ADMIN)

#### Git Actions
- `POST /git/run/{event_id}` : Exécuter action Git (DEV/ADMIN)
- `GET /git/logs/{event_id}` : Historique exécutions
- `GET /git/logs/{event_id}/stream` : Stream logs temps réel (WebSocket)

#### Métriques
- `GET /metrics/dora` : Métriques DORA (query params : start, end)
- `GET /metrics/export` : Export PDF/CSV
- `GET /metrics/dashboard` : Données dashboard (Chart.js format)

#### Webhooks
- `POST /webhooks/gitlab` : Entrant GitLab
- `POST /webhooks/github` : Entrant GitHub
- `POST /webhooks/jenkins` : Entrant Jenkins
- `POST /webhooks/outgoing/register` : Enregistrer webhook sortant

### 5.3. Sécurité Applicative

#### Headers HTTP (tous endpoints)
```
Strict-Transport-Security: max-age=63072000; includeSubDomains; preload
Content-Security-Policy: default-src 'self'; script-src 'self' https://cdn.jsdelivr.net; style-src 'self' https://cdn.jsdelivr.net; img-src 'self' data:; connect-src 'self'; frame-ancestors 'none'
X-Frame-Options: DENY
X-Content-Type-Options: nosniff
Referrer-Policy: no-referrer
Permissions-Policy: geolocation=(), microphone=(), camera=()
```

#### Rate Limiting (slowapi + Redis)
| Endpoint                  | Limite           |
|---------------------------|------------------|
| `/auth/login`             | 5 req/min par IP |
| `/auth/2fa/*`             | 5 req/min par IP |
| `/events` (POST)          | 20 req/min par user |
| `/git/run/*`              | 10 req/hour par user |
| `/webhooks/*`             | 100 req/min par IP |

#### Input Validation (Pydantic)
- Tous les champs validés via schémas Pydantic
- Sanitization XSS : `bleach` pour markdown
- Validation Git URLs : regex strict (`https://` ou `git@`)
- Limites taille : title 255 chars, description 2000 chars

#### Audit Trail
Toutes actions critiques loggées dans table `audit_log` :
```sql
CREATE TABLE audit_log (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  action VARCHAR(100),
  resource_type VARCHAR(50),
  resource_id INTEGER,
  details JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### 5.4. Déploiement K3s

#### Manifests Kubernetes

**Deployment (uYoop-Cal)**
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: uyoop-cal
  namespace: devops-tools
spec:
  replicas: 3
  selector:
    matchLabels:
      app: uyoop-cal
  template:
    metadata:
      labels:
        app: uyoop-cal
    spec:
      containers:
      - name: app
        image: dhi.io/uyoop-cal:latest
        ports:
        - containerPort: 8000
        env:
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: uyoop-secrets
              key: database-url
        - name: VAULT_ADDR
          value: "https://vault.devops-tools.svc.cluster.local:8200"
        - name: VAULT_CACERT
          value: "/vault/ca/ca.crt"
        volumeMounts:
        - name: vault-ca
          mountPath: /vault/ca
          readOnly: true
        resources:
          requests:
            memory: "256Mi"
            cpu: "200m"
          limits:
            memory: "512Mi"
            cpu: "500m"
        securityContext:
          runAsNonRoot: true
          runAsUser: 1000
          readOnlyRootFilesystem: true
          capabilities:
            drop: ["ALL"]
        livenessProbe:
          httpGet:
            path: /health
            port: 8000
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /health
            port: 8000
          initialDelaySeconds: 5
          periodSeconds: 5
      volumes:
      - name: vault-ca
        secret:
          secretName: vault-ca-cert
```

**Service**
```yaml
apiVersion: v1
kind: Service
metadata:
  name: uyoop-cal
  namespace: devops-tools
spec:
  selector:
    app: uyoop-cal
  ports:
  - port: 8000
    targetPort: 8000
  type: ClusterIP
```

**Ingress (TLS)**
```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: uyoop-cal-ingress
  namespace: devops-tools
  annotations:
    cert-manager.io/cluster-issuer: letsencrypt-prod
    nginx.ingress.kubernetes.io/force-ssl-redirect: "true"
spec:
  ingressClassName: nginx
  tls:
  - hosts:
    - uyoop.example.com
    secretName: uyoop-cal-tls
  rules:
  - host: uyoop.example.com
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: uyoop-cal
            port:
              number: 8000
```

**HorizontalPodAutoscaler**
```yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: uyoop-cal-hpa
  namespace: devops-tools
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: uyoop-cal
  minReplicas: 3
  maxReplicas: 10
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70
  - type: Resource
    resource:
      name: memory
      target:
        type: Utilization
        averageUtilization: 80
```

---

## 6. Procédures Opérationnelles

### 6.1. Déploiement Initial

#### Prérequis
- K3s cluster opérationnel (3+ nodes)
- Vault HA déployé et initialisé
- PostgreSQL HA (patroni/CloudNativePG)
- Harbor registry accessible
- DNS configuré (`uyoop.example.com`)

#### Étapes
```bash
# 1. Créer namespace
kubectl create namespace devops-tools

# 2. Déployer Vault CA secret
kubectl create secret generic vault-ca-cert \
  --from-file=ca.crt=vault/ca-cert.pem \
  -n devops-tools

# 3. Créer secrets app
kubectl create secret generic uyoop-secrets \
  --from-literal=database-url="postgresql://..." \
  --from-literal=jwt-secret="$(openssl rand -hex 32)" \
  -n devops-tools

# 4. Appliquer manifests
kubectl apply -f k8s/deployment.yaml
kubectl apply -f k8s/service.yaml
kubectl apply -f k8s/ingress.yaml
kubectl apply -f k8s/hpa.yaml

# 5. Vérifier rollout
kubectl rollout status deployment/uyoop-cal -n devops-tools

# 6. Vérifier pods healthy
kubectl get pods -n devops-tools -l app=uyoop-cal

# 7. Tester endpoint
curl -k https://uyoop.example.com/health
```

### 6.2. Mises à Jour (Rolling)

```bash
# Build nouvelle image
docker build -t dhi.io/uyoop-cal:1.2.0 -f Dockerfile.hardened .
docker push dhi.io/uyoop-cal:1.2.0

# Update deployment
kubectl set image deployment/uyoop-cal \
  app=dhi.io/uyoop-cal:1.2.0 \
  -n devops-tools

# Surveiller rollout
kubectl rollout status deployment/uyoop-cal -n devops-tools

# Rollback si échec
kubectl rollout undo deployment/uyoop-cal -n devops-tools
```

### 6.3. Sauvegardes

#### PostgreSQL
```bash
# Backup quotidien (cron)
0 2 * * * pg_basebackup -h postgres-primary.devops-tools.svc -U backup_user \
  -D /backups/postgres/$(date +\%Y\%m\%d) -Ft -z -P

# Restore
pg_restore -h postgres-primary.devops-tools.svc -U postgres \
  -d devops_calendar /backups/postgres/20260108/base.tar.gz
```

#### Vault Raft
```bash
# Snapshot hebdomadaire
vault operator raft snapshot save /backups/vault/raft-$(date +\%Y\%m\%d).snap

# Restore
vault operator raft snapshot restore /backups/vault/raft-20260108.snap
```

#### K3s (Velero)
```bash
# Backup namespace complet
velero backup create uyoop-cal-backup --include-namespaces devops-tools

# Restore
velero restore create --from-backup uyoop-cal-backup
```

### 6.4. Monitoring & Alerting

#### Métriques Prometheus
- `http_requests_total{app="uyoop-cal"}` : Total requêtes
- `http_request_duration_seconds` : Latence (p50, p95, p99)
- `git_actions_executed_total` : Actions Git exécutées
- `deployments_total{environment="prod"}` : Déploiements prod
- `events_created_total{type="meeting"}` : Événements créés

#### Alertes (Alertmanager)
```yaml
groups:
- name: uyoop-cal
  rules:
  - alert: HighErrorRate
    expr: rate(http_requests_total{status=~"5.."}[5m]) > 0.05
    for: 5m
    annotations:
      summary: "Taux d'erreur 5xx élevé (>5%)"
  
  - alert: PodCrashLooping
    expr: rate(kube_pod_container_status_restarts_total{namespace="devops-tools"}[15m]) > 0
    for: 5m
    annotations:
      summary: "Pod en crash loop"
  
  - alert: VaultSealed
    expr: vault_core_unsealed == 0
    for: 1m
    annotations:
      summary: "Vault cluster sealed"
```

---

## 7. Tests & Validation

### 7.1. Tests Unitaires
- **Framework:** pytest
- **Coverage cible:** >80%
- **Commande:** `pytest tests/ --cov=app --cov-report=html`

### 7.2. Tests d'Intégration
- **Scénarios:** API endpoints, RBAC, workflows multi-étapes
- **Outil:** `test_rbac.py` (existant) + extension
- **Exécution:** CI/CD (GitHub Actions)

### 7.3. Tests E2E
- **Framework:** Playwright (Python)
- **Scénarios:**
  - Login → Créer meeting → Vérifier calendrier
  - DEV crée git_action → Exécute → Vérifie logs
  - OPS crée deployment prod → ADMIN approuve → Statut updated

### 7.4. Tests de Charge
- **Outil:** Locust
- **Cibles:**
  - 100 users concurrents
  - 1000 req/s soutenu (5 min)
  - Latence p95 < 500ms

### 7.5. Tests Sécurité
- **Trivy:** Scan image Docker (0 CVE HIGH/CRITICAL)
- **OWASP ZAP:** Scan endpoints (0 HIGH)
- **Penetration testing:** Simulation attaques (bruteforce, injection SQL, XSS)

---

## 8. Documentation Utilisateur

### 8.1. Quick Start Guide
- Installation K3s + Helm charts
- Configuration DNS + TLS
- Création premier utilisateur ADMIN
- Tutoriel créer 1er événement

### 8.2. Manuel Utilisateur
- Rôles & permissions détaillés
- Workflows création événements (captures écran)
- Dashboard métriques DORA (interprétation)
- FAQ troubleshooting

### 8.3. Guide Administrateur
- Gestion utilisateurs & équipes
- Configuration Vault policies
- Rotation credentials
- Procédures backup/restore
- Monitoring & alerting

### 8.4. API Reference
- OpenAPI 3.0 spec (`/docs`)
- Exemples cURL pour chaque endpoint
- Webhooks : payload formats, signatures HMAC
- Rate limits & quotas

---

## 9. Critères d'Acceptance (Définition of Done)

### 9.1. Fonctionnalités
- ✅ 3 types d'événements créables (meeting, deployment, git_action)
- ✅ RBAC 4 rôles fonctionnel (permissions respectées)
- ✅ Workflows multi-étapes (3–5 steps selon type)
- ✅ Approbations déploiements prod (ADMIN)
- ✅ Dashboard métriques DORA (4 graphiques)
- ✅ Intégration Vault HA (secrets, TOTP)
- ✅ Logs Git Actions en temps réel (WebSocket)
- ✅ Notifications email/Slack configurables

### 9.2. Sécurité
- ✅ Image durcie DHI (0 CVE base OS)
- ✅ JWT auth + 2FA TOTP obligatoire
- ✅ TLS/mTLS end-to-end (app ↔ Vault ↔ PostgreSQL)
- ✅ Rate limiting (redis distribué)
- ✅ Audit trail complet (qui/quoi/quand)
- ✅ Security headers (HSTS, CSP strict, etc.)
- ✅ Input validation (Pydantic + sanitization)
- ✅ Trivy scan <HIGH findings

### 9.3. Infrastructure
- ✅ Déployé sur K3s HA (3+ nodes)
- ✅ HPA configuré (3–10 replicas)
- ✅ PostgreSQL HA (patroni/CloudNativePG)
- ✅ Vault 3 nodes Raft + TLS
- ✅ Ingress nginx + cert-manager (Let's Encrypt)
- ✅ Prometheus + Grafana + Alertmanager
- ✅ ELK/Loki centralized logging
- ✅ Backups automatiques (DB, Vault, K3s)

### 9.4. Performance
- ✅ Latence API p95 <500ms
- ✅ Temps chargement page <2s (Lighthouse >85)
- ✅ Support 100 users concurrents
- ✅ 1000 req/s soutenu (5 min load test)

### 9.5. Qualité Code
- ✅ Tests coverage >80%
- ✅ Linting (pylint, black) sans erreurs
- ✅ SonarQube Quality Gate PASS
- ✅ Documentation API complète (OpenAPI)
- ✅ Runbooks opérationnels (deploy, backup, incident)

### 9.6. Utilisabilité
- ✅ Design responsive mobile-first
- ✅ WCAG 2.1 AA compliant
- ✅ Temps apprentissage <1h (utilisateur)
- ✅ Feedback positif beta-testers (≥4/5)

---

## 10. Roadmap & Évolutions Futures

### Phase 1 (Actuelle) : MVP Production-Ready ✅
- Événements multi-type + RBAC
- Vault HA + PostgreSQL HA
- Dashboard métriques DORA
- Déploiement K3s

### Phase 2 : Fonctionnalités Collaboratives (Q1 2026)
- [ ] Système commentaires + mentions
- [ ] Approbations workflows personnalisables
- [ ] Notifications multi-canal (email/Slack/Teams)
- [ ] Webhooks sortants (GitLab, Jenkins, Jira)

### Phase 3 : Agile Avancé (Q2 2026)
- [ ] Gestion sprints complète
- [ ] Backlog intégré (import Jira/GitHub)
- [ ] Burndown charts + velocity
- [ ] Templates rétrospectives

### Phase 4 : Intelligence & Automation (Q3 2026)
- [ ] Prédiction durée déploiements (ML)
- [ ] Recommandations fenêtres de maintenance
- [ ] Détection anomalies métriques (alertes prédictives)
- [ ] Chatbot Slack (commandes vocales)

### Phase 5 : Multi-Tenancy & SaaS (Q4 2026)
- [ ] Isolation par organisation (DB multi-tenant)
- [ ] Billing & quotas par plan
- [ ] Marketplace d'intégrations (plugins)
- [ ] API publique OAuth2 pour intégrations tierces

---

## 11. Références & Ressources

### Documentation Externe
- **FullCalendar:** https://fullcalendar.io/docs
- **Chart.js:** https://www.chartjs.org/docs/
- **FastAPI:** https://fastapi.tiangolo.com
- **Vault:** https://developer.hashicorp.com/vault
- **K3s:** https://docs.k3s.io
- **Prometheus:** https://prometheus.io/docs/

### Images Projet (doc/projet/)
- `image.png` : Dashboard principal (vue calendrier)
- `image (1).png` : Modal création événement (étape 1)
- `image (2).png` : Tableau événements (filtres)
- `image (3).png` : Dashboard métriques DORA
- `image (4).png` : Vue Kanban (To Plan → Done)
- `image (5).png` : Modal approbation déploiement prod
- `image (6).png` : Logs Git Action temps réel (WebSocket)

### Dépôts Git
- **App principale:** `git@gitlab.example.com:devops/uyoop-cal.git`
- **IaC (Terraform):** `git@gitlab.example.com:devops/uyoop-infra.git`
- **Config (Ansible):** `git@gitlab.example.com:devops/uyoop-config.git`
- **K8s manifests:** `git@gitlab.example.com:devops/uyoop-k8s.git`

---

## 12. Conformité & Standards

### Sécurité
- **CIS Benchmarks:** Docker (Level 2), Kubernetes (Level 1)
- **OWASP Top 10:** Couvert (injection, XSS, auth, secrets, logging)
- **ISO 27001:** Contrôles applicables (access control, cryptography, audit)

### DevOps
- **DORA Metrics:** 4 métriques clés collectées et dashboardées
- **GitOps:** Déploiements via ArgoCD (single source of truth Git)
- **Infrastructure as Code:** Terraform (infra) + Ansible (config) + Helm (K8s)

### Agilité
- **Scrum:** Sprints 2 semaines, daily standups, retrospectives
- **Kanban:** Vue tableau + WIP limits configurables
- **SAFe (optionnel):** Support PI planning (Program Increment)

---

## Annexes

### A. Glossaire
- **DORA:** DevOps Research and Assessment (métriques performance équipes)
- **RBAC:** Role-Based Access Control (contrôle accès par rôle)
- **DHI:** Docker Hardened Images (images sécurisées CIS Level 2)
- **HA:** High Availability (haute disponibilité)
- **HPA:** Horizontal Pod Autoscaler (K8s autoscaling)
- **MTTR:** Mean Time To Restore (temps moyen restauration service)

### B. Contacts Équipe Projet
- **Chef de projet:** cjuyoop@example.com
- **Lead Dev:** dev-lead@example.com
- **Ops Lead:** ops-lead@example.com
- **Security Officer:** security@example.com

### C. Changelog Projet
Voir [/doc/changelog.md](../changelog.md) pour historique détaillé des versions.

---

**Document rédigé le 8 janvier 2026**  
**Statut:** Spécification finale attendue (production-ready)  
**Prochaine revue:** Trimestrielle (Q1 2026)
