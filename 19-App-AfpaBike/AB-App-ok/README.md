# AfpaBike - Variante App complète (AB-App-ok)

Objectif : corriger l'application (Dev + DevOps) pour qu'elle soit fonctionnelle et optimisée. Point de départ : copie fidèle de `AB-projet-base` avant toute correction.

## État actuel
- Stack Docker identique à la source (avant refonte). A adapter en reprenant les améliorations DevOps de `AB-Devops-ok`.
- Code applicatif brut, non corrigé.

## Plan de travail suggéré
1) **Appliquer les fixes DevOps** : reprendre `docker-compose.yml`, `Dockerfile`, `.env` depuis `AB-Devops-ok` et ajuster si besoin.
2) **Corrections Dev** (exemples à adresser) :
   - Sécuriser et centraliser la config BDD (`files/config_afpabike_dev.ini`).
   - Corriger les chemins/`include` et la gestion du document root.
   - Fiabiliser l'authentification et la gestion de session.
   - Assainir les requêtes SQL (paramétrées), gérer les erreurs.
   - Nettoyer les assets JS/CSS dupliqués, vérifier les dépendances front.
3) **Tests** : démarrage des conteneurs, import BDD, parcours fonctionnels clés.

## Lancement (à faire après refonte)
```bash
cd 19-App-AfpaBike/AB-App-ok
# mettre à jour docker-compose/Dockerfile/.env
docker compose up -d
```

## Documentation
- Voir `../README.md` pour l’organisation globale.
- Voir `../AB-Devops-ok/README.md` pour la référence DevOps.
