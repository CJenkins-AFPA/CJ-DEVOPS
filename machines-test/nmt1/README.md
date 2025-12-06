# Machine Vagrant Docker pour exercice réseau

Machine Vagrant Ubuntu 20.04 avec Docker, Docker Compose et Alpine pré-installés.

## Démarrage

Pour démarrer la machine :

```bash
vagrant up
```

Pour vous connecter :

```bash
vagrant ssh
```

## Arrêt et suppression

Pour arrêter la machine :

```bash
vagrant halt
```

Pour supprimer la machine :

```bash
vagrant destroy
```

## Vérification

Une fois connecté, vérifiez que Docker fonctionne :

```bash
docker --version
docker ps
```

## Exercice

Vous êtes maintenant prêt à faire l'exercice de manipulation des réseaux Docker.
