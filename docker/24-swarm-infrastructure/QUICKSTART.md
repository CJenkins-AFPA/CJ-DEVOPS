# QUICKSTART

1) Copier `.env.example` en `.env` et ajuster (hostnames, mots de passe, projets Harbor).
2) Préparer les VMs : Harbor (registry), Manager, Worker1, Worker2, MariaDB.
3) Depuis le Manager (ou via Ansible):
   - `docker swarm init` (si non fait) puis join des workers.
   - Réseaux overlay : `docker network create --driver overlay frontend` et `docker network create --driver overlay backend` (si non existants).
   - Volumes : `docker volume create traefik-certs`, `docker volume create portainer-data`, `docker volume create uyoop-data`.
   - Vérifier l'accès à la DB externe `db.local:3306` (pare-feu ouvert depuis Manager/Workers).
4) Déployer les stacks :
   - `docker stack deploy -c docker-stack/stack-traefik.yml traefik`
   - `docker stack deploy -c docker-stack/stack-portainer.yml portainer`
   - `docker stack deploy -c docker-stack/stack-afpabike.yml afpabike`
   - `docker stack deploy -c docker-stack/stack-uyoopapp.yml uyoop`
5) Vérifier :
   - `docker service ls`
   - `curl -k https://traefik.local`, `https://portainer.local`, `https://afpabike.local`, `https://uyoop.local`
6) Mise à jour d'app :
   - `./scripts/build-and-push.sh <app> <git_ref> <version>`
   - `docker stack deploy ...` pour redeployer l'app concernée.
