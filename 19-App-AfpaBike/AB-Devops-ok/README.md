# AfpaBike - Variante DevOps (AB-Devops-ok)

Objectif : obtenir une stack Docker propre (web + MySQL) sans corriger le code applicatif. Les problèmes purement Dev sont listés mais non traités.

## Contenu
- `docker-compose.yml` : réécrit avec healthcheck MySQL, dépendance "healthy", volume nommé `db-data`, init SQL (schema + grants), variables via `.env`.
- `Dockerfile` : PHP 8.2 Apache, extensions mysqli/pdo_mysql, mod rewrite, copie du code dans `/var/www/html`, droits `www-data`, nettoyage EOL.
- `.env` : credentials MySQL (dev). Exemple fourni dans le repo.
- Code applicatif : identique à la source, simplement monté/copier dans l'image.

## Lancement rapide
```bash
cd 19-App-AfpaBike/AB-Devops-ok
cp .env .env.local  # optionnel, ou éditer .env
docker compose up -d
```
- Web : http://localhost:1234
- MySQL : localhost:3306 (user/pass dans `.env`)

## Points Dev non corrigés (à traiter par les devs)
- Vérifier/assainir les accès BDD dans le code PHP (connexion, gestion d'erreurs, injections SQL possibles).
- Harmoniser les chemins et includes PHP (dépendent du document root `/var/www/html`).
- Revoir la configuration des sessions/authentification.
- Nettoyer les assets doublons (nombreux fichiers JS/CSS dupliqués).
- Mettre en place un chargement de config unique (`files/config_afpabike_dev.ini`).

## Notes
- Le réseau externe a été supprimé ; usage du bridge Docker par défaut.
- Les volumes anonymes "/var/www/..." ont été retirés pour éviter d'écraser les fichiers copiés.
- Les scripts SQL sont injectés via `docker-entrypoint-initdb.d` (ordre 01 schema, 02 grants).
