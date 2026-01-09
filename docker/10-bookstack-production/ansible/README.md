# Ansible Deployment Guide

## Prérequis

- Ansible 2.9+
- Accès SSH au serveur cible
- Clé SSH configurée

## Installation Ansible

```bash
sudo apt update
sudo apt install -y ansible
```

## Configuration

1. Éditez `inventory.ini` :

```ini
[bookstack_servers]
bookstack-prod ansible_host=VOTRE_IP ansible_user=ubuntu

[bookstack_servers:vars]
domain=votre-domaine.com
cloudflare_email=email@example.com
cloudflare_api_token=votre-token
mail_password=votre-mot-de-passe-mail
```

2. Testez la connexion :

```bash
ansible -i inventory.ini bookstack_servers -m ping
```

## Déploiement

### Déploiement complet

```bash
ansible-playbook -i inventory.ini deploy.yml
```

### Déploiement avec tags

```bash
# Seulement la partie Docker
ansible-playbook -i inventory.ini deploy.yml --tags docker

# Seulement le hardening
ansible-playbook -i inventory.ini deploy.yml --tags hardening

# Seulement les backups
ansible-playbook -i inventory.ini deploy.yml --tags backup
```

### Mode check (dry-run)

```bash
ansible-playbook -i inventory.ini deploy.yml --check
```

### Mode verbose

```bash
ansible-playbook -i inventory.ini deploy.yml -vvv
```

## Post-déploiement

1. Vérifiez les services :

```bash
ansible -i inventory.ini bookstack_servers -m shell -a "docker ps"
```

2. Récupérez les secrets :

```bash
ansible -i inventory.ini bookstack_servers -m shell -a "cat /opt/bookstack-production/secrets/grafana_password.txt"
```

## Maintenance

### Mise à jour

```bash
ansible-playbook -i inventory.ini deploy.yml --tags update
```

### Backup manuel

```bash
ansible -i inventory.ini bookstack_servers -m shell -a "/opt/bookstack-production/scripts/backup.sh"
```

### Redémarrage des services

```bash
ansible -i inventory.ini bookstack_servers -m shell -a "cd /opt/bookstack-production && docker-compose restart"
```

## Troubleshooting

### Vérifier les logs

```bash
ansible -i inventory.ini bookstack_servers -m shell -a "cd /opt/bookstack-production && docker-compose logs bookstack"
```

### Vérifier l'état des services

```bash
ansible -i inventory.ini bookstack_servers -m systemd -a "name=docker state=started"
```
