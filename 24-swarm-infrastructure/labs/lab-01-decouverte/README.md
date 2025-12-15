# Lab 1 - Découverte et Architecture Docker Swarm

## 🎯 Objectifs pédagogiques

- Comprendre l'architecture distribuée de Docker Swarm
- Initialiser un cluster Swarm multi-nœuds
- Maîtriser les concepts de managers et workers
- Découvrir les mécanismes de haute disponibilité
- Déployer ses premières applications en mode Swarm

## 📋 Prérequis

- Environnement Vagrant configuré avec 3 VMs (1 manager, 2 workers)
- Accès SSH aux machines
- Docker installé sur toutes les VMs
- Connaissances de base de Docker (images, conteneurs, volumes)

## 🏗️ Architecture cible

```
┌─────────────────────────────────────────────────────────────┐
│                    DOCKER SWARM CLUSTER                      │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────────┐      ┌──────────────┐   ┌──────────────┐ │
│  │   manager1   │      │   worker1    │   │   worker2    │ │
│  │  (Leader)    │◄────►│              │   │              │ │
│  │ 192.168.56.10│      │192.168.56.11 │   │192.168.56.12 │ │
│  └──────────────┘      └──────────────┘   └──────────────┘ │
│         │                      │                   │         │
│         └──────────────────────┴───────────────────┘         │
│                    Overlay Network                           │
└─────────────────────────────────────────────────────────────┘
```

## 📚 Exercices

### Exercice 1.1 - Initialisation du Cluster

**Objectif** : Créer le cluster Swarm et comprendre son architecture

**Étapes** :

1. Connexion au manager :
```bash
vagrant ssh manager1
```

2. Initialisation du Swarm :
```bash
docker swarm init --advertise-addr 192.168.56.10
```

3. **Questions** :
   - Quelle commande affiche pour joindre le cluster ?
   - Où est stocké le token de jointure ?
   - Quel est le rôle du paramètre `--advertise-addr` ?

4. Obtenir le token worker :
```bash
docker swarm join-token worker
```

5. Obtenir le token manager :
```bash
docker swarm join-token manager
```

**Livrables** :
- Screenshot de la sortie de `docker swarm init`
- Copie des deux tokens (worker et manager)

---

### Exercice 1.2 - Ajout des Workers

**Objectif** : Joindre les nœuds workers au cluster

**Étapes** :

1. Sur worker1 :
```bash
vagrant ssh worker1
docker swarm join --token SWMTKN-1-xxxxx 192.168.56.10:2377
```

2. Sur worker2 :
```bash
vagrant ssh worker2
docker swarm join --token SWMTKN-1-xxxxx 192.168.56.10:2377
```

3. Vérification depuis le manager :
```bash
docker node ls
```

**Questions** :
- Combien de nœuds sont listés ?
- Quel est le statut de chaque nœud ?
- Quelle est la différence entre `AVAILABILITY` et `STATUS` ?

**Livrables** :
- Screenshot de `docker node ls`
- Réponses aux questions dans `reponses.md`

---

### Exercice 1.3 - Inspection du Cluster

**Objectif** : Explorer la configuration et l'état du cluster

**Commandes à exécuter** :

```bash
# Informations détaillées sur le Swarm
docker info | grep -A 10 Swarm

# Détails d'un nœud spécifique
docker node inspect manager1

# Informations formatées
docker node inspect manager1 --format '{{ .Status.State }}'
docker node inspect manager1 --format '{{ .Spec.Role }}'
docker node inspect manager1 --format '{{ .ManagerStatus.Leader }}'

# Liste des nœuds avec format personnalisé
docker node ls --format "table {{.Hostname}}\t{{.Status}}\t{{.Availability}}\t{{.ManagerStatus}}"
```

**Questions** :
- Quel port utilise le Raft consensus ?
- Quelle est la fréquence de heartbeat ?
- Où sont stockées les données du Raft log ?

**Livrables** :
- Fichier `inspection-results.txt` avec les sorties
- Document `architecture-analysis.md` répondant aux questions

---

### Exercice 1.4 - Premier Service Simple

**Objectif** : Déployer un service basique et observer sa répartition

**Étapes** :

1. Création du service :
```bash
docker service create \
  --name web-nginx \
  --replicas 3 \
  --publish published=8080,target=80 \
  nginx:alpine
```

2. Vérification :
```bash
# Liste des services
docker service ls

# Détails du service
docker service ps web-nginx

# Logs du service
docker service logs web-nginx
```

3. Observer la répartition :
```bash
# Sur chaque nœud
docker ps
```

**Questions** :
- Comment les 3 réplicas sont-ils répartis ?
- Que se passe-t-il si vous accédez à http://192.168.56.10:8080 ?
- Que se passe-t-il si vous accédez à http://192.168.56.11:8080 ?
- Qu'est-ce qui permet cette répartition de charge ?

**Livrables** :
- Screenshot de `docker service ps web-nginx`
- Document expliquant le routing mesh

---

### Exercice 1.5 - Scaling et Auto-Répartition

**Objectif** : Comprendre le scaling horizontal

**Étapes** :

1. Scaler le service :
```bash
docker service scale web-nginx=6
```

2. Observer la nouvelle répartition :
```bash
docker service ps web-nginx
watch -n 1 docker service ps web-nginx
```

3. Scaler vers le bas :
```bash
docker service scale web-nginx=2
```

**Questions** :
- Comment Swarm choisit-il où placer les nouveaux conteneurs ?
- Que devient un conteneur supprimé lors du scale down ?
- Quelle stratégie utilise Swarm pour équilibrer la charge ?

**Expérimentation** :
```bash
# Tester différents nombres de réplicas
docker service scale web-nginx=1
docker service scale web-nginx=10
docker service scale web-nginx=3
```

**Livrables** :
- Tableau comparatif de la répartition selon le nombre de réplicas
- Analyse de la stratégie de placement

---

### Exercice 1.6 - Mise à Jour Rolling

**Objectif** : Comprendre les mises à jour sans interruption

**Étapes** :

1. Déployer un service avec l'ancienne version :
```bash
docker service create \
  --name app-demo \
  --replicas 4 \
  nginx:1.20-alpine
```

2. Configurer la stratégie de mise à jour :
```bash
docker service update \
  --update-parallelism 1 \
  --update-delay 10s \
  --update-failure-action rollback \
  app-demo
```

3. Effectuer la mise à jour :
```bash
docker service update --image nginx:1.21-alpine app-demo
```

4. Observer en temps réel :
```bash
watch -n 1 docker service ps app-demo
```

**Questions** :
- Que signifie `--update-parallelism 1` ?
- À quoi sert `--update-delay` ?
- Que se passe-t-il avec `--update-failure-action rollback` ?

**Livrables** :
- Captures d'écran des différentes phases de mise à jour
- Chronologie des événements

---

### Exercice 1.7 - Gestion des Pannes

**Objectif** : Tester la résilience du cluster

**Étapes** :

1. Déployer un service :
```bash
docker service create \
  --name resilient-app \
  --replicas 6 \
  nginx:alpine
```

2. Simuler une panne d'un worker :
```bash
# Sur worker1
vagrant ssh worker1
sudo systemctl stop docker
```

3. Observer depuis le manager :
```bash
docker node ls
docker service ps resilient-app
```

4. Redémarrer le worker :
```bash
sudo systemctl start docker
```

**Questions** :
- Que devient le statut du nœud worker1 ?
- Comment les réplicas sont-elles redistribuées ?
- Combien de temps prend la détection de la panne ?
- Que se passe-t-il au redémarrage du nœud ?

**Livrables** :
- Journal des événements avec timestamps
- Analyse du temps de récupération (RTO)

---

### Exercice 1.8 - Labels et Contraintes

**Objectif** : Contrôler le placement des services

**Étapes** :

1. Ajouter des labels aux nœuds :
```bash
docker node update --label-add environment=prod manager1
docker node update --label-add environment=dev worker1
docker node update --label-add environment=dev worker2
docker node update --label-add tier=frontend worker1
docker node update --label-add tier=backend worker2
```

2. Déployer avec contraintes :
```bash
# Service uniquement sur les workers dev
docker service create \
  --name dev-app \
  --constraint 'node.labels.environment==dev' \
  --replicas 4 \
  nginx:alpine

# Service uniquement sur le backend
docker service create \
  --name backend-service \
  --constraint 'node.labels.tier==backend' \
  --replicas 2 \
  redis:alpine
```

3. Vérifier le placement :
```bash
docker service ps dev-app
docker service ps backend-service
```

**Questions** :
- Où sont déployées les réplicas de dev-app ?
- Que se passe-t-il si vous tentez 10 réplicas sur backend-service ?
- Comment combiner plusieurs contraintes ?

**Livrables** :
- Liste des labels appliqués
- Documentation de la stratégie de placement

---

### Exercice 1.9 - Réseau Overlay

**Objectif** : Créer et utiliser des réseaux overlay

**Étapes** :

1. Créer un réseau overlay :
```bash
docker network create \
  --driver overlay \
  --subnet 10.0.9.0/24 \
  my-app-network
```

2. Lister les réseaux :
```bash
docker network ls
```

3. Déployer des services sur ce réseau :
```bash
docker service create \
  --name frontend \
  --network my-app-network \
  --replicas 3 \
  nginx:alpine

docker service create \
  --name backend \
  --network my-app-network \
  --replicas 2 \
  redis:alpine
```

4. Tester la communication :
```bash
# Depuis un conteneur frontend
docker exec -it $(docker ps -q -f name=frontend) sh
ping backend
```

**Questions** :
- Comment les conteneurs se découvrent-ils ?
- Quel est le rôle du DNS interne ?
- Quelle est la différence entre overlay et bridge ?

**Livrables** :
- Schéma du réseau overlay
- Résultats des tests de connectivité

---

### Exercice 1.10 - Stack Multi-Services

**Objectif** : Déployer une application complète avec Docker Stack

**Fichier** : Créer `voting-app-stack.yml`

```yaml
version: '3.8'

services:
  vote:
    image: dockersamples/examplevotingapp_vote
    ports:
      - "5000:80"
    networks:
      - frontend
    deploy:
      replicas: 2
      update_config:
        parallelism: 1
        delay: 10s
      restart_policy:
        condition: on-failure

  redis:
    image: redis:alpine
    networks:
      - frontend
    deploy:
      replicas: 1
      placement:
        constraints:
          - node.role == worker

  worker:
    image: dockersamples/examplevotingapp_worker
    networks:
      - frontend
      - backend
    deploy:
      replicas: 2
      restart_policy:
        condition: on-failure
        delay: 10s
        max_attempts: 3

  db:
    image: postgres:15-alpine
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
    networks:
      - backend
    volumes:
      - db-data:/var/lib/postgresql/data
    deploy:
      replicas: 1
      placement:
        constraints:
          - node.role == manager

  result:
    image: dockersamples/examplevotingapp_result
    ports:
      - "5001:80"
    networks:
      - backend
    deploy:
      replicas: 1

networks:
  frontend:
    driver: overlay
  backend:
    driver: overlay

volumes:
  db-data:
```

**Déploiement** :

```bash
docker stack deploy -c voting-app-stack.yml voting-app
```

**Vérification** :

```bash
docker stack ls
docker stack services voting-app
docker stack ps voting-app
```

**Tests** :

- Accéder à http://192.168.56.10:5000 (vote)
- Accéder à http://192.168.56.10:5001 (résultats)

**Questions** :
- Combien de services sont créés ?
- Comment les réseaux sont-ils configurés ?
- Où est stockée la base de données ?

**Livrables** :
- Fichier stack YAML commenté
- Screenshots de l'application en fonctionnement
- Document d'analyse de l'architecture

---

## 🎓 Questions de Réflexion

1. **Architecture** :
   - Quelle est la différence fondamentale entre Docker Compose et Docker Stack ?
   - Pourquoi a-t-on besoin de plusieurs managers ?
   - Qu'est-ce que le quorum Raft et pourquoi est-il important ?

2. **Haute Disponibilité** :
   - Comment Swarm assure-t-il la haute disponibilité des services ?
   - Que se passe-t-il si le manager leader tombe ?
   - Quelle est la différence entre un nœud `drain` et `pause` ?

3. **Réseau** :
   - Comment fonctionne le routing mesh ?
   - Quelle est la différence entre mode `ingress` et mode `host` ?
   - Comment les conteneurs communiquent-ils entre différents nœuds ?

4. **Sécurité** :
   - Comment sont sécurisées les communications inter-nœuds ?
   - Quel protocole utilise le Raft consensus ?
   - Comment sont gérés les secrets dans Swarm ?

## 📊 Critères d'Évaluation

| Critère | Points | Description |
|---------|--------|-------------|
| Initialisation cluster | 10 | Cluster fonctionnel avec 3 nœuds |
| Déploiement services | 15 | Services déployés et accessibles |
| Scaling | 10 | Scaling up/down maîtrisé |
| Mise à jour rolling | 15 | Mise à jour sans interruption |
| Gestion des pannes | 15 | Tests de résilience documentés |
| Labels et contraintes | 10 | Placement contrôlé des services |
| Réseaux overlay | 10 | Communication inter-services |
| Stack multi-services | 10 | Application complète déployée |
| Documentation | 5 | Livrables complets et clairs |
| **Total** | **100** | |

## 🚀 Aller Plus Loin

**Défis supplémentaires** :

1. Ajouter un 4ème nœud en tant que manager
2. Implémenter un service avec placement global
3. Créer un réseau overlay chiffré
4. Tester le failover d'un manager
5. Déployer une stack avec des secrets

**Ressources** :

- [Docker Swarm Documentation](https://docs.docker.com/engine/swarm/)
- [Raft Consensus Algorithm](https://raft.github.io/)
- [Docker Networking](https://docs.docker.com/network/)

---

**Temps estimé** : 4-6 heures

**Difficulté** : ⭐⭐☆☆☆

**Next** : [Lab 2 - Haute Disponibilité et Persistance](../lab-02-ha-persistance/README.md)
