# Tâches
- [x] Localiser et analyser le dossier `uyoop-cal`
- [x] Présenter Gemini et Antigravity (voir `presentation.md`)
- [x] Réaliser un état des lieux technique et fonctionnel précis (`audit_and_proposals.md`)
- [x] Proposer des améliorations et optimisations
- [x] Définir le cadre de collaboration (questions au user)
- [x] Vérifier l'état de l'application (Relancée car arrêtée)
- [x] Exécuter les tests existants (Échoués : tests obsolètes vs code strict JWT)
- [x] Analyser le choix Frontend (Réponse au user)

## Axe 1 : Réparation des Fondations (Tests)
- [x] Créer le plan d'implémentation (`implementation_plan.md`)
- [x] Initialiser l'environnement de test (`tests/conftest.py`, `pytest`)
- [x] Implémenter les aides au test (Client authentifié JWT)
- [x] Portages des scenarios RBAC vers Pytest
- [x] Initialiser l'environnement de test (`tests/conftest.py`, `pytest`)
- [x] Implémenter les aides au test (Client authentifié JWT)
- [x] Portages des scenarios RBAC vers Pytest
- [x] Validation et nettoyage (`doc/test_rbac.py`)
  - [x] Debug RBAC : Faille confirmée sur `/users` (Public).
  - [x] Debug RBAC : Comprendre pourquoi PROJET supprime ADMIN event (Résolu: Conflit Fixtures).
- [x] Vérification Visuelle (Browser Tool) : Login OK, Dashboard OK.

## Axe 2 : Refonte Identité & Ergonomie (UX/UI)
- [x] Benchmarking : Tendances UI "Dark/Neon DevOps"
- [x] Création Concept Login : Full screen, immersif, moderne
- [x] Création Concept Dashboard : Aéré, KPI essentiels
- [x] Implémenter CSS/HTML : Variables, Refonte structure
- [x] Implémenter CSS/HTML : Variables, Refonte structure
- [x] Validation visuelle avec le user (Logo intégré)
  - [x] Font Comfortaa & Background Animé (Fait via CSS)
  - [x] Slogan "Unified Yield..." & "DevSecOps augmenté" (Intégré dans HTML)
