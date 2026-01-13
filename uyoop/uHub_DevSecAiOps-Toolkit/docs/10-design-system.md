# 10 – Design System

uHub se veut un outil agréable, moderne et "Premium", loin des interfaces d'administration tristes.

## 1. Identité Visuelle

### 1.1 Palette de Couleurs (Dark Mode Only)
Le thème par défaut est sombre pour réduire la fatigue visuelle et donner un aspect "hacker / pro".

- **Fond** : `#000000` (Noir pur) ou `#050505` (Noir profond)
- **Surfaces** : `#111111` (Cartes), `#1A1A1A` (Hover)
- **Bordures** : `#333333` (Subtil)
- **Primaire (uHub Green)** : `#00ff00` (Vert terminal vif, néon)
  - Utilisé pour : Actions principales, Status Success, Logo.
- **Secondaires** :
  - `#00cc88` (Teal), `#66ffcc` (Mint) pour varier les accents.
- **Texte** :
  - Principal : `#ffffff`
  - Secondaire : `#a1a1aa` (Gris neutre)

### 1.2 "Blurry Gradients"
Pour donner de la profondeur, uHub utilise des gradients flous et subtils en arrière-plan (ex: derrière la sidebar ou en header).
- Couleurs : Mélange de vert uHub (`#00ff00`) et de bleu nuit, très faible opacité (5-10%).
- Animation : Légère pulsation ou mouvement lent type "Aurora".

## 2. Typographie

- **Titres (Headings)** : [Comfortaa](https://fonts.google.com/specimen/Comfortaa)
  - Ronde, moderne, distinctive. Pour `h1`, `h2`, Logo.
- **Corps (Body / UI)** : [Inter](https://fonts.google.com/specimen/Inter) ou [Geist](https://vercel.com/font)
  - Lisibilité maximale, chiffres tabulaires parfaits pour les dashboards.
- **Code** : [JetBrains Mono](https://www.jetbrains.com/lp/mono/) ou [Fira Code]
  - Pour les logs, terminaux, snippets.

## 3. Composants UI & Formes

- **Border Radius** : Généreux.
  - Boutons : `999px` (Pill shape) ou `12px`.
  - Cartes : `16px` à `24px`.
  - Modales : `32px`.
- **Effets** :
  - **Glassmorphism** : Arrière-plans semi-transparents avec `backdrop-filter: blur(12px)` pour les menus flottants et modales.
  - **Glow** : Légère ombre portée colorée au survol des éléments interactifs (`box-shadow: 0 0 15px rgba(0, 255, 0, 0.3)`).

## 4. Command Palette (Ctrl/Cmd + K)

Inspirée des outils modernes (Linear, Vercel), la palette de commande est le point central de navigation rapide.

- **Raccourci** : `Ctrl+K` (Windows/Linux) ou `Cmd+K` (Mac).
- **Fonctionnalités** :
  - **Navigation** : "Aller à Projet X", "Aller au Calendrier".
  - **Actions** : "Créer un Job", "Lancer un déploiement".
  - **Recherche** : Trouver un utilisateur, un job ou un incident.
- **Design** : Modale centrée, input minimaliste, liste de résultats avec icônes.
