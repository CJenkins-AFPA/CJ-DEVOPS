# CJ-DEVOPS

## Structure du Repository

Ce repository contient trois projets principaux, chacun avec sa propre branche :

| Dossier | Branche | Description |
|---------|---------|-------------|
| Scripts-Base | `Scripts-Base` | Scripts de base pour l'administration |
| TP-Ansible | `TP-Ansible` | Travaux pratiques Ansible |
| TP-Vagrant | `TP-Vagrant` | Travaux pratiques Vagrant |

## Création des branches

Pour créer les branches séparées pour chaque dossier, exécutez le script :

```bash
./create-branches.sh
```

Ensuite, poussez les branches vers le remote :

```bash
git push origin Scripts-Base
git push origin TP-Ansible
git push origin TP-Vagrant
```
