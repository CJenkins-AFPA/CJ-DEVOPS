# Démarrage VMs Vagrant

## Lancer les 5 VMs

```bash
cd /home/cj/gitdata/24-swarm-infrastructure

# Démarrer toutes les VMs
vagrant up

# Ou une par une
vagrant up harbor
vagrant up manager
vagrant up worker1
vagrant up worker2
vagrant up db
```

## Vérifier l'état

```bash
vagrant status
```

## SSH vers les VMs

```bash
vagrant ssh harbor
vagrant ssh manager
vagrant ssh worker1
vagrant ssh worker2
vagrant ssh db
```

## IPs attribuées

- Harbor: 192.168.56.10
- Manager: 192.168.56.20
- Worker1: 192.168.56.21
- Worker2: 192.168.56.22
- MariaDB: 192.168.56.30

## Arrêt/Suppression

```bash
# Arrêter
vagrant halt

# Supprimer
vagrant destroy -f
```

## Prochaines étapes

Après `vagrant up`, lancer le déploiement :

```bash
./scripts/deploy-all.sh
```
