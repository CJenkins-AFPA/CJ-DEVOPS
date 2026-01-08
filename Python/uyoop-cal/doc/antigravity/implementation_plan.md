# Plan de Refonte UX/UI : uYoop Modernization

## 1. Identité Visuelle (Design System)

L'objectif est de passer d'un simple "Bootstrap-like" à une identité forte "Cyberpunk Corporate / DevOps".

### Palette
- **Primaire** : `#00FF00` (Neon Green) - Pour les actions principales, les indicateurs de succès, et le logo.
- **Accents** : 
    - `#00CC00` (Hover states)
    - `#EB4D4B` (Error/Critical - Red neon)
    - `#F0932B` (Warning - Orange neon)
- **Backgrounds** :
    - `#0D0D0D` (Main background - Deepest Charcoal, quasi noir)
    - `#1A1A1A` (Cards/Panels - Slightly lighter for depth)
    - `#2C3E50` (Subtle borders/dividers)
- **Typography** : `Inter` ou `Roboto` (Google Fonts).

### Composants Clés (CSS)
- **Glassmorphism** : Utilisation de `backdrop-filter: blur()` pour les modales et les overlays.
- **Glow Effects** : `box-shadow` et `text-shadow` subtils en vert pour les éléments actifs.
- **Rounded Corners** : `border-radius: 12px` pour moderniser les cartes.

## 2. Refonte Page de Login (Fullscreen)

Remplacer la page d'accueil actuelle (Calendrier vide) par une **Landing Page dédiée**.

**Structure :**
- Container `100vw`, `100vh`.
- Background : Animé ou Image abstraite (Réseau/Matrix) sombre.
- Centrage absolu du formulaire de connexion.
- **Logo uYoop** : Grand format, effet néon.
- **Formulaire** :
    - Input fields avec bordures animées au focus.
    - Bouton "Connexion" large et lumineux.

**Expérience :**
- "You are entering a secure system".
- Pas de header/footer distrayant.

## 3. Nouveau Dashboard (Post-Login)

Créer une **Vue "Dashboard"** comme page par défaut après connexion (au lieu du Calendrier).

**Layout (Grid CSS) :**
- **Top Bar** : Profil à droite, Navigation propre (Tabs).
- **KPI Cards (Haut)** :
    - Déploiements en cours (active count).
    - Succès 24h (%).
    - Prochaines fenêtres de tir.
- **Main Area (Gauche - 60%)** :
    - Graphique d'activité (FullCalendar timeline preview ou Chart.js amélioré).
- **Activity Feed (Droite - 40%)** :
    - Liste des dernières actions Git / Events.

## 4. Étapes Techniques

1.  **CSS Global** : Créer `root` variables dans `style.css` (actuellement dans le HTML/JS parfois).
2.  **HTML Structure** : Séparer "Login View" de "App View" dans le DOM (`index.html`).
    - Par défaut : Afficher uniquement Login View.
    - Après auth : Masquer Login, Afficher App View.
3.  **JS Logic** : Mettre à jour `app.js` pour gérer ce switch de vue propre.
4.  **Integration** : Ajouter les classes utilitaires pour le nouveau look (Cards, Glows).
