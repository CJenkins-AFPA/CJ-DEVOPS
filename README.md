# CJ-DEVOPS — branche `uyoop`

Cette branche regroupe l'application Uyoop (PHP/SQLite) et son packaging complet Docker/Ansible, plus la documentation des TPs Harbor (TP15/TP16).

## Projets inclus
- `UyoopApp/` : appli minimale (formulaire intelligent, génération de cahier des charges HTML, stockage SQLite, page admin).
- `UyoopAppDocker/` : même appli conteneurisée (Nginx + PHP-FPM), Makefile, scripts, docs complètes, playbook Ansible.
- `UyoopAppDocker/16-harbor-pro/` : livrables TPs Harbor (basic + production), docs et configurations prêtes à l'emploi.

## Démarrages rapides
- Sans Docker : `cd UyoopApp/public && php -S localhost:8080` puis ouvrir `http://localhost:8080` (admin sur `/admin.php`).
- Avec Docker : `cd UyoopAppDocker && make install` (ou `docker compose -f docker/docker-compose.yml up -d --build`), appli sur `http://localhost:8080`.

## Travaux réalisés (synthèse)
- App Uyoop : formulaires conditionnels, prévisualisation, génération de cahier des charges, persistance SQLite, admin listant les soumissions.
- Dockerisation : images Nginx/PHP 8.4-FPM, healthchecks, environnements dev/prod, variables via `.env`, volumes pour les données, cibles Make (`up/down/logs/redeploy/backup/test`).
- Automatisation : scripts `deploy.sh`, `test.sh`, inventaire + playbook Ansible pour déployer l'appli sur serveur distant.
- Harbor TP15/TP16 :
	- TP15 (basique) : stack Harbor 8 services, README guidé, workflows d'images, troubleshooting.
	- TP16 (prod) : HA Postgres + Redis Sentinel, Traefik SSL/Let's Encrypt, monitoring Prometheus/Grafana, alerting (40+ règles), Loki logs, Notary, backups/restore automatisés, guide 1800+ lignes.

## Documentation utile
- `UyoopApp/README.md` : détails appli standalone.
- `UyoopAppDocker/README.md` : guide Docker complet + commandes.
- `UyoopAppDocker/docs/` : architecture, quickstart, changelog, commandes.
- `UyoopAppDocker/ansible/README.md` : déploiement Ansible.
- `UyoopAppDocker/COMPLETION_REPORT_TP15_16.md` : synthèse détaillée des TPs Harbor.
