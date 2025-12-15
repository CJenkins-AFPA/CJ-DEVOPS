# Troubleshooting

- Vérifier `docker service ls` pour l'état des services.
- `docker service ps <service>` pour voir les erreurs de déploiement.
- Traefik : `docker service logs -f traefik` pour les routes et certs.
- Portainer : vérifier l'accès via `https://portainer.local` (cert self-signed).
- DB externe : tester `mysql -h db.local -u afpabike_user -p` depuis le Manager.
