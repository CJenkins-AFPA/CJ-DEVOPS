# 09 – Interactions Calendrier & Gestion des Conflits

Le calendrier est le cœur opérationnel de uHub. Il ne sert pas juste à voir, mais à **planifier et piloter** les actions.

## 1. Fonctionnalités UI

### 1.1 Glisser-Déposer (Drag & Drop)
- **Action** : L'utilisateur peut déplacer un Event (Job) d'un jour à l'autre ou changer son horaire.
- **Backend** : Déclenche un appel `PATCH /jobs/{id}` avec les nouvelles dates `planned_start` / `planned_end`.
- **Permissions** :
  - **Dev** : Libre sur les jobs `dev` en environnement non-prod.
  - **Projets** : Libre sur ses projets.
  - **Ops** : Libre sur `maintenance` et `ops`, mais soumis à approbation pour la `prod`.

### 1.2 Code Couleur
Pour une lisibilité immédiate, les événements sont colorés :
- par **Projet** (bordure ou point) pour identifier le contexte.
- par **Type de Job** (fond) :
  - `Meeting`: Bleu clai / Transparent
  - `Dev`: Vert désaturé
  - `Ops`: Orange / Ambre
  - `Maintenance`: Violet
  - `Incident`: Rouge vif (clignotant ou hachuré)

---

## 2. Gestion des Conflits

uHub vise à éviter que deux maintenances critiques ou deux déploiements majeurs se percutent sur le même environnement.

### 2.1 Détection
L'API `GET /calendar/events` calcule à la volée les chevauchements.
Un conflit est détecté si :
1.  Deux Jobs ciblent le **même Environnement** (ex: `prod`).
2.  Leurs plages horaires (`planned_start` -> `planned_end`) se chevauchent.
3.  Ils sont de type "exclusif" (ex: `maintenance` vs `ops`).

### 2.2 UI : Alerte
Lorsqu'un conflit est détecté, l'API renvoie `extendedProps.conflict = true`.
- **Visuel** : L'événement s'affiche avec une bordure **Rouge** épaisse ou une icône "Warning".
- **Tooltip** : Au survol, affiche "Conflit avec [Nom de l'autre Job]".

### 2.3 Résolution
Au clic sur un événement en conflit, une modale propose :
- De voir les détails du job concurrent.
- De décaler automatiquement l'horaire (suggère le prochain créneau libre).
- De forcer le maintien (nécessite droits **Admin** ou **Projets**).

---

## 3. Endpoints Clés

- **`GET /calendar/events`**
  - Query params: `start`, `end`, `project_id`
  - Response: Liste d'objets compatibles FullCalendar.

- **`PATCH /jobs/{id}`**
  - Body: `{"planned_start": "...", "planned_end": "..."}`
  - Logique: Recalcule les conflits avant de valider. Retourne une erreur (409 Conflict) ou un warning si bloquant en prod.
