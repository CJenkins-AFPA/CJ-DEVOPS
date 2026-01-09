# Lab 2 - Haute Disponibilité et Persistance

## 🎯 Objectifs pédagogiques

- Implémenter un cluster multi-managers pour la haute disponibilité
- Maîtriser la gestion des volumes distribués
- Configurer la persistance des données critiques
- Gérer les secrets et configurations sensibles
- Mettre en place des stratégies de backup et restore

## 📋 Prérequis

- Lab 1 complété et validé
- Cluster Swarm opérationnel (1 manager + 2 workers)
- Compréhension des concepts de base de Swarm
- Accès SSH à toutes les machines

## 🏗️ Architecture cible

```
┌────────────────────────────────────────────────────────────────┐
│              CLUSTER HAUTE DISPONIBILITÉ                        │
├────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌─────────────┐   ┌─────────────┐   ┌─────────────┐          │
│  │  manager1   │   │  manager2   │   │  manager3   │          │
│  │  (Leader)   │◄─►│  (Follower) │◄─►│  (Follower) │          │
│  │ 192.168.56  │   │ 192.168.56  │   │ 192.168.56  │          │
│  │     .10     │   │     .20     │   │     .30     │          │
│  └─────────────┘   └─────────────┘   └─────────────┘          │
│         │                  │                  │                 │
│         └──────────────────┴──────────────────┘                 │
│                       RAFT CONSENSUS                            │
│                                                                  │
│  ┌─────────────┐   ┌─────────────┐                             │
│  │   worker1   │   │   worker2   │                             │
│  │192.168.56.11│   │192.168.56.12│                             │
│  └─────────────┘   └─────────────┘                             │
│                                                                  │
│  [Volumes Distribués] [Secrets] [Configs]                       │
└────────────────────────────────────────────────────────────────┘
```

## 📚 Exercices

### Exercice 2.1 - Promotion de Workers en Managers

**Objectif** : Créer un cluster avec 3 managers pour la haute disponibilité

**Théorie** :
- Nombre optimal de managers : 3, 5 ou 7
- Quorum = (N/2) + 1
- Pour 3 managers : tolère 1 panne
- Pour 5 managers : tolère 2 pannes

**Étapes** :

1. État initial du cluster :
```bash
docker node ls
```

2. Promouvoir worker1 en manager :
```bash
docker node promote worker1
```

3. Ajouter un nouveau nœud manager3 :
```bash
# Sur la nouvelle VM manager3
vagrant ssh manager3

# Récupérer le token manager depuis manager1
docker swarm join-token manager

# Joindre le cluster en tant que manager
docker swarm join --token SWMTKN-1-xxxxx-manager 192.168.56.10:2377
```

4. Vérification :
```bash
docker node ls
# Vérifier que vous avez 3 managers
```

**Questions** :
- Combien de pannes le cluster peut-il tolérer maintenant ?
- Que signifie le statut "Reachable" vs "Leader" ?
- Quel est l'algorithme utilisé pour l'élection du leader ?

**Livrables** :
- Screenshot de `docker node ls` montrant 3 managers
- Document expliquant le quorum Raft

---

### Exercice 2.2 - Test de Failover Manager

**Objectif** : Valider le basculement automatique du leader

**Étapes** :

1. Identifier le leader actuel :
```bash
docker node ls
# Noter quel nœud a le statut "Leader"
```

2. Arrêter le leader (simuler une panne) :
```bash
# Si manager1 est leader
vagrant ssh manager1
sudo systemctl stop docker
```

3. Observer depuis un autre manager :
```bash
vagrant ssh manager2
watch -n 1 docker node ls
```

4. Chronométrer :
- Temps de détection de la panne
- Temps d'élection du nouveau leader
- Temps total de basculement

5. Redémarrer le manager :
```bash
vagrant ssh manager1
sudo systemctl start docker
```

**Questions** :
- Combien de temps a pris l'élection du nouveau leader ?
- Le cluster a-t-il continué de fonctionner pendant le basculement ?
- L'ancien leader redevient-il automatiquement leader au redémarrage ?

**Tests supplémentaires** :
```bash
# Tester avec un service en cours
docker service create --name test-ha --replicas 5 nginx:alpine

# Arrêter le leader et vérifier que le service fonctionne toujours
```

**Livrables** :
- Chronologie détaillée du failover
- Analyse de la disponibilité du service pendant le basculement

---

### Exercice 2.3 - Volumes Locaux et Contraintes

**Objectif** : Comprendre les limites des volumes locaux en Swarm

**Problématique** :
Les volumes Docker locaux ne se déplacent pas avec les conteneurs

**Démonstration** :

1. Créer un service avec volume local :
```bash
docker service create \
  --name db-local \
  --mount type=volume,source=mydata,target=/data \
  --constraint 'node.hostname==worker1' \
  postgres:15-alpine
```

2. Écrire des données :
```bash
# Trouver le conteneur
docker ps

# Se connecter et créer des données
docker exec -it <container_id> psql -U postgres
CREATE DATABASE testdb;
\q
```

3. Retirer la contrainte et observer :
```bash
docker service update --constraint-rm 'node.hostname==worker1' db-local

# Le conteneur se déplace mais perd ses données !
```

**Questions** :
- Que devient le volume sur worker1 ?
- Pourquoi les données ne suivent-elles pas le conteneur ?
- Quelles solutions existent pour ce problème ?

**Livrables** :
- Documentation du comportement observé
- Analyse des cas d'usage appropriés pour les volumes locaux

---

### Exercice 2.4 - Solutions de Stockage Distribué

**Objectif** : Implémenter des solutions de persistance adaptées à Swarm

**Option A : NFS Partagé**

1. Configuration du serveur NFS (sur manager1) :
```bash
# Installer NFS
sudo apt-get update
sudo apt-get install -y nfs-kernel-server

# Créer le répertoire partagé
sudo mkdir -p /srv/nfs/swarm-data
sudo chown nobody:nogroup /srv/nfs/swarm-data
sudo chmod 777 /srv/nfs/swarm-data

# Configurer les exports
echo "/srv/nfs/swarm-data 192.168.56.0/24(rw,sync,no_subtree_check,no_root_squash)" | sudo tee -a /etc/exports

# Appliquer la configuration
sudo exportfs -ra
sudo systemctl restart nfs-kernel-server
```

2. Configuration des clients NFS (sur tous les nœuds) :
```bash
# Installer le client NFS
sudo apt-get install -y nfs-common

# Créer le point de montage
sudo mkdir -p /mnt/nfs/swarm-data

# Monter le partage
sudo mount 192.168.56.10:/srv/nfs/swarm-data /mnt/nfs/swarm-data

# Rendre permanent
echo "192.168.56.10:/srv/nfs/swarm-data /mnt/nfs/swarm-data nfs defaults 0 0" | sudo tee -a /etc/fstab
```

3. Utilisation avec Docker :
```bash
docker service create \
  --name db-nfs \
  --mount type=bind,source=/mnt/nfs/swarm-data,target=/var/lib/postgresql/data \
  --replicas 1 \
  postgres:15-alpine
```

**Option B : Plugin de Volume (Rex-Ray)**

```bash
# Installer Rex-Ray sur tous les nœuds
curl -sSL https://dl.bintray.com/emccode/rexray/install | sh

# Configuration (exemple pour NFS)
sudo tee /etc/rexray/config.yml << EOF
libstorage:
  service: nfs
nfs:
  host: 192.168.56.10
  volumePath: /srv/nfs/volumes
EOF

# Démarrer Rex-Ray
sudo systemctl start rexray
sudo systemctl enable rexray

# Créer un volume
docker volume create -d rexray -o size=1 --name shared-data

# Utiliser le volume
docker service create \
  --name db-rexray \
  --mount source=shared-data,target=/var/lib/postgresql/data \
  postgres:15-alpine
```

**Questions** :
- Quels sont les avantages et inconvénients de chaque approche ?
- Quelle solution convient le mieux pour une base de données ?
- Comment gérer les permissions ?

**Livrables** :
- Configuration complète de NFS
- Tests de mobilité des conteneurs avec données persistantes
- Comparatif des solutions

---

### Exercice 2.5 - Stack Applicative avec Persistance

**Objectif** : Déployer WordPress avec base de données persistante

**Fichier** : `wordpress-stack.yml`

```yaml
version: '3.8'

services:
  db:
    image: mysql:8.0
    environment:
      MYSQL_ROOT_PASSWORD_FILE: /run/secrets/db_root_password
      MYSQL_DATABASE: wordpress
      MYSQL_USER: wordpress
      MYSQL_PASSWORD_FILE: /run/secrets/db_password
    secrets:
      - db_root_password
      - db_password
    volumes:
      - db-data:/var/lib/mysql
    networks:
      - backend
    deploy:
      replicas: 1
      placement:
        constraints:
          - node.labels.storage == nfs
      restart_policy:
        condition: on-failure

  wordpress:
    image: wordpress:latest
    ports:
      - "8080:80"
    environment:
      WORDPRESS_DB_HOST: db:3306
      WORDPRESS_DB_USER: wordpress
      WORDPRESS_DB_PASSWORD_FILE: /run/secrets/db_password
      WORDPRESS_DB_NAME: wordpress
    secrets:
      - db_password
    volumes:
      - wp-content:/var/www/html/wp-content
    networks:
      - backend
      - frontend
    deploy:
      replicas: 3
      update_config:
        parallelism: 1
        delay: 10s
      restart_policy:
        condition: on-failure
    depends_on:
      - db

networks:
  frontend:
    driver: overlay
  backend:
    driver: overlay

volumes:
  db-data:
    driver: local
    driver_opts:
      type: nfs
      o: addr=192.168.56.10,rw
      device: ":/srv/nfs/swarm-data/mysql"
  
  wp-content:
    driver: local
    driver_opts:
      type: nfs
      o: addr=192.168.56.10,rw
      device: ":/srv/nfs/swarm-data/wordpress"

secrets:
  db_root_password:
    external: true
  db_password:
    external: true
```

**Préparation** :

```bash
# Créer les répertoires NFS
sudo mkdir -p /srv/nfs/swarm-data/mysql
sudo mkdir -p /srv/nfs/swarm-data/wordpress

# Ajouter un label au nœud pour le stockage
docker node update --label-add storage=nfs worker1

# Créer les secrets
echo "MyRootPassword123!" | docker secret create db_root_password -
echo "MyWordPressPassword123!" | docker secret create db_password -

# Déployer la stack
docker stack deploy -c wordpress-stack.yml wp
```

**Vérification** :

```bash
docker stack services wp
docker stack ps wp
```

**Tests** :
1. Installer WordPress via http://192.168.56.10:8080
2. Créer un article
3. Supprimer le service db et le recréer
4. Vérifier que les données sont toujours là

**Questions** :
- Les données survivent-elles à la suppression du conteneur ?
- Que se passe-t-il si vous scalez WordPress à 5 réplicas ?
- Comment gérer les uploads de médias ?

**Livrables** :
- Stack YAML fonctionnelle
- Tests de persistance documentés
- Analyse des points de vigilance

---

### Exercice 2.6 - Gestion Avancée des Secrets

**Objectif** : Sécuriser les données sensibles dans Swarm

**Concepts** :
- Les secrets sont chiffrés au repos et en transit
- Stockés dans le Raft log (managers uniquement)
- Montés en RAM dans les conteneurs (/run/secrets/)
- Jamais écrits sur disque dans les conteneurs

**Pratique** :

1. Créer différents types de secrets :
```bash
# Secret depuis string
echo "MonSuperMotDePasse" | docker secret create mysql_root_password -

# Secret depuis fichier
echo "user:password:1000:1000:User Name:/home/user:/bin/bash" > passwd
docker secret create passwd_file passwd
rm passwd

# Secret depuis variable d'environnement
export DB_PASS="SecurePassword123"
echo "$DB_PASS" | docker secret create db_password -
```

2. Lister et inspecter :
```bash
docker secret ls
docker secret inspect mysql_root_password
# Note: le contenu n'est PAS visible
```

3. Utiliser les secrets :
```yaml
version: '3.8'

services:
  app:
    image: myapp:latest
    secrets:
      - source: db_password
        target: /run/secrets/db_pass
        mode: 0400
    environment:
      DB_PASSWORD_FILE: /run/secrets/db_pass
```

4. Rotation de secrets :
```bash
# Créer une nouvelle version
echo "NewPassword456" | docker secret create db_password_v2 -

# Mettre à jour le service
docker service update \
  --secret-rm db_password \
  --secret-add db_password_v2 \
  myapp

# Supprimer l'ancien secret
docker secret rm db_password
```

**Questions** :
- Où sont stockés les secrets physiquement ?
- Comment un worker accède-t-il aux secrets ?
- Peut-on modifier un secret existant ?

**Exercice pratique** :
Créer une application multi-tiers avec :
- Secret pour la base de données
- Secret pour une clé API
- Secret pour un certificat SSL

**Livrables** :
- Procédure de gestion des secrets
- Exemple de rotation de secrets
- Bonnes pratiques documentées

---

### Exercice 2.7 - Configurations Dynamiques

**Objectif** : Gérer les configurations applicatives avec Docker Config

**Différence Secret vs Config** :
- **Secret** : données sensibles (mots de passe, clés)
- **Config** : données non sensibles (fichiers de config)

**Pratique** :

1. Créer une configuration Nginx :
```bash
cat > nginx.conf << 'EOF'
server {
    listen 80;
    server_name example.com;
    
    location / {
        proxy_pass http://backend:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
EOF

docker config create nginx_config nginx.conf
```

2. Utiliser la configuration :
```yaml
version: '3.8'

services:
  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
    configs:
      - source: nginx_config
        target: /etc/nginx/conf.d/default.conf
    networks:
      - frontend

configs:
  nginx_config:
    external: true

networks:
  frontend:
    driver: overlay
```

3. Mise à jour de configuration :
```bash
# Créer une nouvelle version
cat > nginx-v2.conf << 'EOF'
server {
    listen 80;
    server_name example.com;
    
    location / {
        proxy_pass http://backend:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        
        # Nouvelles options
        proxy_cache_bypass $http_upgrade;
        proxy_http_version 1.1;
    }
}
EOF

docker config create nginx_config_v2 nginx-v2.conf

# Mettre à jour le service
docker service update \
  --config-rm nginx_config \
  --config-add source=nginx_config_v2,target=/etc/nginx/conf.d/default.conf \
  nginx
```

**Cas d'usage avancé** : Application multi-environnement

```bash
# Config pour développement
docker config create app_config_dev app-dev.yml

# Config pour production
docker config create app_config_prod app-prod.yml

# Déployer selon l'environnement
docker service create \
  --name myapp \
  --config source=app_config_prod,target=/app/config.yml \
  myapp:latest
```

**Questions** :
- Quelle est la taille maximale d'une config ?
- Peut-on partager une config entre plusieurs services ?
- Comment versionner les configs ?

**Livrables** :
- Exemples de configurations pour différents services
- Procédure de mise à jour sans interruption
- Stratégie de versioning

---

### Exercice 2.8 - Backup et Restore du Swarm

**Objectif** : Sauvegarder et restaurer l'état du cluster

**Importance** :
- Sauvegarder les données du Raft (secrets, configs, services)
- Plan de disaster recovery
- Migration de cluster

**Procédure de Backup** :

1. Backup sur un manager :
```bash
# Arrêter Docker sur le manager
sudo systemctl stop docker

# Sauvegarder le répertoire Swarm
sudo tar -czvf swarm-backup-$(date +%Y%m%d).tar.gz \
  /var/lib/docker/swarm

# Redémarrer Docker
sudo systemctl start docker

# Sauvegarder aussi les volumes (si locaux)
sudo tar -czvf volumes-backup-$(date +%Y%m%d).tar.gz \
  /var/lib/docker/volumes
```

2. Script de backup automatisé :
```bash
#!/bin/bash
# backup-swarm.sh

BACKUP_DIR="/backup/swarm"
DATE=$(date +%Y%m%d-%H%M%S)

# Créer le répertoire de backup
mkdir -p $BACKUP_DIR

# Backup du Raft
sudo systemctl stop docker
sudo tar -czf $BACKUP_DIR/swarm-$DATE.tar.gz /var/lib/docker/swarm
sudo systemctl start docker

# Backup des secrets (export)
docker secret ls -q | while read secret; do
    echo "Secret: $secret" >> $BACKUP_DIR/secrets-list-$DATE.txt
done

# Backup des configs
docker config ls -q | while read config; do
    docker config inspect $config > $BACKUP_DIR/config-$config-$DATE.json
done

# Backup de la topologie
docker node ls --format "{{.ID}} {{.Hostname}} {{.Status}} {{.Availability}}" \
  > $BACKUP_DIR/nodes-$DATE.txt

# Backup des services
docker service ls --format "{{.ID}} {{.Name}} {{.Replicas}}" \
  > $BACKUP_DIR/services-$DATE.txt

# Nettoyer les backups de plus de 7 jours
find $BACKUP_DIR -name "*.tar.gz" -mtime +7 -delete

echo "Backup completed: $DATE"
```

**Procédure de Restore** :

1. Restore complet :
```bash
# Sur un nouveau manager
sudo systemctl stop docker

# Restaurer les données
sudo rm -rf /var/lib/docker/swarm
sudo tar -xzvf swarm-backup-YYYYMMDD.tar.gz -C /

# Redémarrer Docker
sudo systemctl start docker

# Forcer la réinitialisation
docker swarm init --force-new-cluster --advertise-addr 192.168.56.10

# Rejoindre les autres managers et workers
```

**Questions** :
- Quelle est la fréquence de backup recommandée ?
- Peut-on faire un backup à chaud ?
- Comment tester la procédure de restore ?

**Exercice** :
1. Créer un cluster avec quelques services
2. Faire un backup complet
3. Détruire complètement le cluster
4. Restaurer depuis le backup
5. Vérifier que tout fonctionne

**Livrables** :
- Script de backup automatisé
- Procédure de restore documentée
- Résultats d'un test de restore

---

### Exercice 2.9 - Healthchecks et Auto-Healing

**Objectif** : Configurer la surveillance automatique des services

**Concepts** :
- Healthcheck au niveau de l'image Docker
- Healthcheck au niveau du service Swarm
- Actions automatiques en cas de problème

**Healthcheck dans Dockerfile** :

```dockerfile
FROM nginx:alpine

# Installer curl pour le healthcheck
RUN apk add --no-cache curl

# Configuration du healthcheck
HEALTHCHECK --interval=30s \
            --timeout=3s \
            --start-period=5s \
            --retries=3 \
  CMD curl -f http://localhost/ || exit 1

COPY index.html /usr/share/nginx/html/
```

**Healthcheck dans Docker Compose/Stack** :

```yaml
version: '3.8'

services:
  web:
    image: nginx:alpine
    deploy:
      replicas: 3
      update_config:
        parallelism: 1
        delay: 10s
        failure_action: rollback
        monitor: 30s
      restart_policy:
        condition: on-failure
        delay: 5s
        max_attempts: 3
        window: 120s
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost/"]
      interval: 30s
      timeout: 3s
      retries: 3
      start_period: 40s

  api:
    image: myapi:latest
    deploy:
      replicas: 5
    healthcheck:
      test: ["CMD-SHELL", "wget --no-verbose --tries=1 --spider http://localhost:8080/health || exit 1"]
      interval: 10s
      timeout: 5s
      retries: 5
      start_period: 30s

  database:
    image: postgres:15
    deploy:
      replicas: 1
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 10s
      timeout: 5s
      retries: 5
```

**Test de l'auto-healing** :

1. Déployer un service avec healthcheck :
```bash
docker service create \
  --name test-health \
  --replicas 3 \
  --health-cmd "curl -f http://localhost/ || exit 1" \
  --health-interval 10s \
  --health-retries 3 \
  --health-timeout 5s \
  --health-start-period 10s \
  nginx:alpine
```

2. Simuler une panne :
```bash
# Trouver un conteneur
docker ps | grep test-health

# Corrompre le healthcheck
docker exec <container_id> sh -c "rm /usr/share/nginx/html/index.html"

# Observer le comportement
watch -n 1 docker service ps test-health
```

3. Observer :
- Le conteneur devient "unhealthy"
- Swarm le redémarre automatiquement
- Un nouveau conteneur sain le remplace

**Healthcheck avancé pour API** :

```python
# app.py
from flask import Flask, jsonify
import psycopg2
import redis

app = Flask(__name__)

@app.route('/health')
def health():
    checks = {
        'status': 'healthy',
        'checks': {}
    }
    
    # Check database
    try:
        conn = psycopg2.connect("dbname=mydb user=user password=pass host=db")
        conn.close()
        checks['checks']['database'] = 'ok'
    except:
        checks['checks']['database'] = 'fail'
        checks['status'] = 'unhealthy'
    
    # Check Redis
    try:
        r = redis.Redis(host='redis', port=6379)
        r.ping()
        checks['checks']['redis'] = 'ok'
    except:
        checks['checks']['redis'] = 'fail'
        checks['status'] = 'unhealthy'
    
    status_code = 200 if checks['status'] == 'healthy' else 503
    return jsonify(checks), status_code

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8080)
```

**Questions** :
- Quelle est la différence entre `interval` et `timeout` ?
- Que fait `start_period` ?
- Comment éviter les faux positifs ?

**Livrables** :
- Stack avec healthchecks configurés
- Tests d'auto-healing documentés
- Bonnes pratiques pour les healthchecks

---

### Exercice 2.10 - Stack Production Complète

**Objectif** : Assembler tous les concepts dans une stack production-ready

**Application** : E-commerce avec microservices

**Architecture** :
- Frontend (React)
- API Gateway (Nginx)
- Service Produits (Node.js)
- Service Commandes (Python)
- Service Utilisateurs (Go)
- Base de données PostgreSQL
- Cache Redis
- File de messages RabbitMQ

**Fichier** : `ecommerce-stack.yml`

```yaml
version: '3.8'

services:
  # Frontend
  frontend:
    image: ecommerce/frontend:latest
    ports:
      - "80:80"
    configs:
      - source: nginx_config
        target: /etc/nginx/nginx.conf
    networks:
      - frontend
    deploy:
      replicas: 3
      update_config:
        parallelism: 1
        delay: 10s
        failure_action: rollback
      restart_policy:
        condition: on-failure
      labels:
        - "app=ecommerce"
        - "tier=frontend"
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost/health"]
      interval: 30s
      timeout: 5s
      retries: 3

  # API Gateway
  api-gateway:
    image: nginx:alpine
    ports:
      - "8080:80"
    configs:
      - source: gateway_config
        target: /etc/nginx/nginx.conf
    networks:
      - frontend
      - backend
    deploy:
      replicas: 2
      labels:
        - "app=ecommerce"
        - "tier=gateway"

  # Service Produits
  products-service:
    image: ecommerce/products:latest
    environment:
      DATABASE_URL_FILE: /run/secrets/db_url
      REDIS_URL: redis://redis:6379
    secrets:
      - db_url
    networks:
      - backend
    deploy:
      replicas: 3
      placement:
        constraints:
          - node.role == worker
      labels:
        - "app=ecommerce"
        - "tier=backend"
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/health"]
      interval: 20s
      timeout: 5s
      retries: 3

  # Service Commandes
  orders-service:
    image: ecommerce/orders:latest
    environment:
      DATABASE_URL_FILE: /run/secrets/db_url
      RABBITMQ_URL_FILE: /run/secrets/rabbitmq_url
    secrets:
      - db_url
      - rabbitmq_url
    networks:
      - backend
    deploy:
      replicas: 3
      labels:
        - "app=ecommerce"
        - "tier=backend"
    healthcheck:
      test: ["CMD-SHELL", "wget --spider -q http://localhost:5000/health || exit 1"]
      interval: 20s

  # Service Utilisateurs
  users-service:
    image: ecommerce/users:latest
    environment:
      DATABASE_URL_FILE: /run/secrets/db_url
    secrets:
      - db_url
      - jwt_secret
    networks:
      - backend
    deploy:
      replicas: 2
      labels:
        - "app=ecommerce"
        - "tier=backend"

  # Base de données
  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: ecommerce
      POSTGRES_USER_FILE: /run/secrets/db_user
      POSTGRES_PASSWORD_FILE: /run/secrets/db_password
    secrets:
      - db_user
      - db_password
    volumes:
      - postgres-data:/var/lib/postgresql/data
    networks:
      - backend
    deploy:
      replicas: 1
      placement:
        constraints:
          - node.labels.storage == nfs
      labels:
        - "app=ecommerce"
        - "tier=database"
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 10s
      timeout: 5s
      retries: 5

  # Cache Redis
  redis:
    image: redis:7-alpine
    command: redis-server --requirepass ${REDIS_PASSWORD}
    networks:
      - backend
    deploy:
      replicas: 1
      placement:
        constraints:
          - node.role == worker
      labels:
        - "app=ecommerce"
        - "tier=cache"
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 3s
      retries: 3

  # RabbitMQ
  rabbitmq:
    image: rabbitmq:3-management-alpine
    environment:
      RABBITMQ_DEFAULT_USER_FILE: /run/secrets/rabbitmq_user
      RABBITMQ_DEFAULT_PASS_FILE: /run/secrets/rabbitmq_password
    secrets:
      - rabbitmq_user
      - rabbitmq_password
    ports:
      - "15672:15672"  # Management UI
    networks:
      - backend
    volumes:
      - rabbitmq-data:/var/lib/rabbitmq
    deploy:
      replicas: 1
      labels:
        - "app=ecommerce"
        - "tier=messaging"
    healthcheck:
      test: ["CMD", "rabbitmq-diagnostics", "ping"]
      interval: 30s
      timeout: 10s
      retries: 5

networks:
  frontend:
    driver: overlay
    attachable: true
  backend:
    driver: overlay
    driver_opts:
      encrypted: "true"

volumes:
  postgres-data:
    driver: local
    driver_opts:
      type: nfs
      o: addr=192.168.56.10,rw
      device: ":/srv/nfs/swarm-data/postgres"
  
  rabbitmq-data:
    driver: local
    driver_opts:
      type: nfs
      o: addr=192.168.56.10,rw
      device: ":/srv/nfs/swarm-data/rabbitmq"

secrets:
  db_url:
    external: true
  db_user:
    external: true
  db_password:
    external: true
  jwt_secret:
    external: true
  rabbitmq_url:
    external: true
  rabbitmq_user:
    external: true
  rabbitmq_password:
    external: true

configs:
  nginx_config:
    external: true
  gateway_config:
    external: true
```

**Préparation et déploiement** :

```bash
# Créer les répertoires NFS
sudo mkdir -p /srv/nfs/swarm-data/{postgres,rabbitmq}

# Créer les secrets
echo "postgresql://user:pass@postgres:5432/ecommerce" | docker secret create db_url -
echo "ecomuser" | docker secret create db_user -
echo "SecureDbPass123!" | docker secret create db_password -
echo "MyJWT_SecretKey_2024" | docker secret create jwt_secret -
echo "amqp://admin:pass@rabbitmq:5672/" | docker secret create rabbitmq_url -
echo "admin" | docker secret create rabbitmq_user -
echo "SecureRabbitPass123!" | docker secret create rabbitmq_password -

# Créer les configs
docker config create nginx_config nginx-frontend.conf
docker config create gateway_config nginx-gateway.conf

# Labelliser les nœuds
docker node update --label-add storage=nfs worker1

# Déployer
docker stack deploy -c ecommerce-stack.yml ecommerce
```

**Monitoring et validation** :

```bash
# Statut de la stack
docker stack ps ecommerce

# Services
docker stack services ecommerce

# Logs
docker service logs ecommerce_products-service

# Health status
docker service ps --filter "desired-state=running" ecommerce_postgres
```

**Tests de charge et résilience** :

1. Test de montée en charge
2. Simulation de panne d'un service
3. Test de mise à jour rolling
4. Validation de la persistance

**Livrables** :
- Stack complète fonctionnelle
- Documentation d'architecture
- Procédures de déploiement
- Tests de résilience
- Plan de monitoring

---

## 🎓 Questions de Synthèse

### Architecture
1. Pourquoi 3, 5 ou 7 managers et pas 2, 4 ou 6 ?
2. Comment dimensionner le nombre de workers ?
3. Quelle stratégie pour la haute disponibilité des données ?

### Persistance
1. Quand utiliser des volumes locaux vs distribués ?
2. Comment gérer les migrations de données ?
3. Quelle stratégie de backup pour une production critique ?

### Sécurité
1. Différence entre secrets et configs ?
2. Comment protéger les communications inter-services ?
3. Stratégie de rotation des secrets ?

### Opérations
1. Procédure de mise à jour d'une stack en production ?
2. Comment gérer un rollback ?
3. Stratégie de monitoring et alerting ?

## 📊 Critères d'Évaluation

| Critère | Points | Description |
|---------|--------|-------------|
| Cluster HA (3 managers) | 15 | Configuration et validation |
| Test failover | 10 | Documentation du comportement |
| Stockage distribué | 15 | NFS ou solution équivalente |
| Stack WordPress | 15 | Déploiement avec persistance |
| Gestion secrets/configs | 10 | Utilisation appropriée |
| Backup/Restore | 10 | Procédures testées |
| Healthchecks | 10 | Auto-healing fonctionnel |
| Stack production | 10 | Application complète |
| Documentation | 5 | Qualité des livrables |
| **Total** | **100** | |

## 🚀 Aller Plus Loin

1. Implémenter Consul pour le service discovery
2. Configurer GlusterFS comme stockage distribué
3. Mettre en place une stack de monitoring (Prometheus/Grafana)
4. Automatiser les backups avec des CronJobs
5. Implémenter une stratégie de disaster recovery multi-datacenter

---

**Temps estimé** : 6-8 heures

**Difficulté** : ⭐⭐⭐⭐☆

**Prerequis** : Lab 1 validé

**Next** : [Lab 3 - Sécurité et Monitoring](../lab-03-securite-monitoring/README.md)
