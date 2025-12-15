# Lab 3 - Sécurité et Monitoring

## 🎯 Objectifs pédagogiques

- Sécuriser les communications inter-nœuds
- Implémenter des politiques de sécurité avancées
- Mettre en place un monitoring complet du cluster
- Configurer l'observabilité (logs, métriques, traces)
- Gérer les certificats SSL/TLS
- Implémenter le scanning de sécurité des images

## 📋 Prérequis

- Lab 1 et Lab 2 complétés
- Cluster Swarm opérationnel (3 managers + 2 workers)
- Compréhension des concepts de sécurité réseau
- Connaissances de base en cryptographie

## 🏗️ Architecture cible

```
┌──────────────────────────────────────────────────────────────────┐
│                  SWARM SÉCURISÉ ET MONITORÉ                       │
├──────────────────────────────────────────────────────────────────┤
│                                                                    │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │                   MONITORING STACK                          │  │
│  │  [Prometheus] [Grafana] [AlertManager] [Loki] [Jaeger]    │  │
│  └────────────────────────────────────────────────────────────┘  │
│                              │                                    │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │                   SECURITY LAYER                            │  │
│  │  [Traefik] [Let's Encrypt] [Vault] [Trivy]                │  │
│  └────────────────────────────────────────────────────────────┘  │
│                              │                                    │
│  ┌──────────────┐   ┌──────────────┐   ┌──────────────┐         │
│  │  manager1    │   │  manager2    │   │  manager3    │         │
│  │  (TLS mTLS)  │◄─►│  (TLS mTLS)  │◄─►│  (TLS mTLS)  │         │
│  └──────────────┘   └──────────────┘   └──────────────┘         │
│                                                                    │
│  ┌──────────────┐   ┌──────────────┐                             │
│  │   worker1    │   │   worker2    │                             │
│  │ (Encrypted)  │   │ (Encrypted)  │                             │
│  └──────────────┘   └──────────────┘                             │
│                                                                    │
│  [Overlay Networks Encrypted] [Secrets] [Image Scanning]          │
└──────────────────────────────────────────────────────────────────┘
```

## 📚 Exercices

### Exercice 3.1 - Comprendre la Sécurité Native de Swarm

**Objectif** : Analyser les mécanismes de sécurité intégrés

**Concepts clés** :
- Chiffrement TLS mutuel (mTLS) entre nœuds
- Rotation automatique des certificats
- Certificats auto-signés pour le cluster
- Encryption du Raft log

**Investigation** :

1. Inspecter les certificats Swarm :
```bash
# Certificat du nœud
sudo ls -la /var/lib/docker/swarm/certificates/

# Détails du certificat
sudo openssl x509 -in /var/lib/docker/swarm/certificates/swarm-node.crt -text -noout

# CA du Swarm
sudo openssl x509 -in /var/lib/docker/swarm/certificates/swarm-root-ca.crt -text -noout
```

2. Vérifier la configuration TLS :
```bash
docker info | grep -A 10 "Swarm:"

# Observer les ports utilisés
sudo netstat -tlnp | grep dockerd
```

3. Analyser le chiffrement :
```bash
# Capturer le trafic entre nœuds (éducatif uniquement)
sudo tcpdump -i eth1 -n port 2377 -X | head -100

# Observer que le contenu est chiffré
```

**Questions** :
- Quelle est la durée de validité par défaut des certificats ?
- Comment fonctionne la rotation automatique ?
- Quels ports sont utilisés et pour quoi ?
  - 2377 : Cluster management (TLS)
  - 7946 : Communication entre nœuds
  - 4789 : Overlay network traffic

**Livrables** :
- Analyse des certificats du cluster
- Documentation des mécanismes de sécurité
- Schéma du flux de communication chiffré

---

### Exercice 3.2 - Rotation Manuelle des Certificats

**Objectif** : Maîtriser la rotation des certificats CA et nœuds

**Théorie** :
- CA root du Swarm signe les certificats de nœuds
- Rotation régulière = meilleure sécurité
- Rotation sans interruption de service

**Procédure** :

1. Vérifier la configuration actuelle :
```bash
docker swarm ca
```

2. Générer un nouveau CA :
```bash
# Rotation avec génération automatique
docker swarm ca --rotate

# Ou avec votre propre CA
openssl genrsa -out new-ca-key.pem 4096
openssl req -new -x509 -key new-ca-key.pem -out new-ca-cert.pem -days 3650

docker swarm ca --rotate \
  --ca-cert new-ca-cert.pem \
  --ca-key new-ca-key.pem
```

3. Observer le processus :
```bash
# Pendant la rotation
watch -n 1 'docker node ls'

# Vérifier les certificats
docker node inspect manager1 --format '{{ .Description.TLSInfo }}'
```

4. Modifier la période de rotation automatique :
```bash
docker swarm update --cert-expiry 168h  # 7 jours
docker swarm update --cert-expiry 720h  # 30 jours (défaut: 90j)
```

**Questions** :
- Combien de temps prend la rotation complète ?
- Les services sont-ils impactés ?
- Que se passe-t-il si un nœud est arrêté pendant la rotation ?

**Tests** :
- Simuler une rotation pendant qu'un service tourne
- Vérifier l'impact sur les performances
- Documenter la durée de la transition

**Livrables** :
- Procédure de rotation documentée
- Chronologie de la rotation avec timestamps
- Recommandations de fréquence

---

### Exercice 3.3 - Chiffrement des Overlay Networks

**Objectif** : Créer des réseaux overlay avec chiffrement fort

**Principe** :
- IPSEC pour chiffrer le trafic entre conteneurs
- Overhead performance à considérer
- Obligatoire pour données sensibles

**Pratique** :

1. Créer un réseau chiffré :
```bash
docker network create \
  --driver overlay \
  --opt encrypted \
  --subnet 10.0.10.0/24 \
  --attachable \
  secure-network
```

2. Déployer un service sur ce réseau :
```bash
docker service create \
  --name secure-app \
  --network secure-network \
  --replicas 5 \
  nginx:alpine
```

3. Tester le chiffrement :
```bash
# Capturer le trafic overlay (port 4789)
sudo tcpdump -i eth1 -n port 4789 -X -c 100 > traffic.txt

# Analyser : le contenu devrait être chiffré
cat traffic.txt
```

4. Comparer avec réseau non chiffré :
```bash
docker network create --driver overlay unencrypted-network

docker service create \
  --name unsecure-app \
  --network unencrypted-network \
  --replicas 5 \
  nginx:alpine
```

**Benchmark performance** :

```bash
# Installer iperf3 dans les conteneurs
# Test sur réseau chiffré
docker exec <container1> iperf3 -s &
docker exec <container2> iperf3 -c <container1-ip>

# Test sur réseau non chiffré
# Comparer les débits
```

**Questions** :
- Quel est l'impact sur les performances ?
- Quand est-ce nécessaire ?
- Comment vérifier que le chiffrement fonctionne ?

**Livrables** :
- Résultats des tests de performance
- Recommandations d'utilisation
- Guide de configuration

---

### Exercice 3.4 - Scanning de Sécurité avec Trivy

**Objectif** : Détecter les vulnérabilités dans les images Docker

**Installation de Trivy** :

```bash
# Sur tous les nœuds
wget https://github.com/aquasecurity/trivy/releases/download/v0.48.0/trivy_0.48.0_Linux-64bit.deb
sudo dpkg -i trivy_0.48.0_Linux-64bit.deb
```

**Utilisation** :

1. Scanner une image locale :
```bash
trivy image nginx:latest

# Format JSON
trivy image -f json -o results.json nginx:latest

# Seulement les critiques
trivy image --severity CRITICAL,HIGH nginx:latest
```

2. Scanner avant de déployer :
```bash
#!/bin/bash
# secure-deploy.sh

IMAGE=$1
SERVICE_NAME=$2

echo "Scanning $IMAGE for vulnerabilities..."
trivy image --severity HIGH,CRITICAL --exit-code 1 $IMAGE

if [ $? -eq 0 ]; then
    echo "✓ Image passed security scan"
    docker service create --name $SERVICE_NAME $IMAGE
else
    echo "✗ Image has HIGH or CRITICAL vulnerabilities"
    exit 1
fi
```

3. Automatiser avec CI/CD :
```yaml
# .gitlab-ci.yml
security_scan:
  stage: test
  image: aquasec/trivy:latest
  script:
    - trivy image --exit-code 1 --severity HIGH,CRITICAL myapp:$CI_COMMIT_SHA
  allow_failure: false
```

4. Créer un registre de scanning :
```yaml
# trivy-server-stack.yml
version: '3.8'

services:
  trivy:
    image: aquasec/trivy:latest
    command: server --listen 0.0.0.0:8080
    ports:
      - "8080:8080"
    volumes:
      - trivy-cache:/root/.cache
    deploy:
      replicas: 1
      placement:
        constraints:
          - node.role == manager

volumes:
  trivy-cache:
```

**Exercice pratique** :
1. Scanner toutes les images utilisées dans le cluster
2. Créer un rapport de sécurité
3. Identifier les images à mettre à jour
4. Automatiser le scanning quotidien

**Questions** :
- Combien de vulnérabilités dans nginx:latest ?
- Quelle est la différence entre les tags `latest` et versionnés ?
- Comment gérer les faux positifs ?

**Livrables** :
- Script de scanning automatisé
- Rapport de vulnérabilités
- Politique de sécurité des images

---

### Exercice 3.5 - Déploiement de Traefik avec SSL

**Objectif** : Reverse proxy avec certificats Let's Encrypt automatiques

**Stack Traefik** : `traefik-stack.yml`

```yaml
version: '3.8'

services:
  traefik:
    image: traefik:v2.10
    command:
      - --api.dashboard=true
      - --providers.docker.swarmMode=true
      - --providers.docker.exposedByDefault=false
      - --providers.docker.network=traefik-public
      - --entrypoints.web.address=:80
      - --entrypoints.websecure.address=:443
      - --certificatesresolvers.letsencrypt.acme.email=admin@example.com
      - --certificatesresolvers.letsencrypt.acme.storage=/letsencrypt/acme.json
      - --certificatesresolvers.letsencrypt.acme.httpchallenge.entrypoint=web
      - --log.level=INFO
      - --accesslog=true
      - --metrics.prometheus=true
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock:ro
      - traefik-certificates:/letsencrypt
    networks:
      - traefik-public
    deploy:
      replicas: 1
      placement:
        constraints:
          - node.role == manager
      labels:
        - "traefik.enable=true"
        - "traefik.http.routers.dashboard.rule=Host(`traefik.example.com`)"
        - "traefik.http.routers.dashboard.service=api@internal"
        - "traefik.http.routers.dashboard.entrypoints=websecure"
        - "traefik.http.routers.dashboard.tls.certresolver=letsencrypt"
        - "traefik.http.services.dashboard.loadbalancer.server.port=8080"

  # Application exemple
  whoami:
    image: traefik/whoami
    networks:
      - traefik-public
    deploy:
      replicas: 3
      labels:
        - "traefik.enable=true"
        - "traefik.http.routers.whoami.rule=Host(`whoami.example.com`)"
        - "traefik.http.routers.whoami.entrypoints=websecure"
        - "traefik.http.routers.whoami.tls.certresolver=letsencrypt"
        - "traefik.http.services.whoami.loadbalancer.server.port=80"

networks:
  traefik-public:
    driver: overlay
    attachable: true

volumes:
  traefik-certificates:
```

**Configuration avancée** :

1. Redirection HTTP → HTTPS :
```yaml
      - --entrypoints.web.http.redirections.entrypoint.to=websecure
      - --entrypoints.web.http.redirections.entrypoint.scheme=https
```

2. Certificats wildcard (DNS challenge) :
```yaml
      - --certificatesresolvers.letsencrypt.acme.dnschallenge=true
      - --certificatesresolvers.letsencrypt.acme.dnschallenge.provider=cloudflare
```

3. Basic Auth sur le dashboard :
```bash
# Générer le hash du mot de passe
htpasswd -nb admin SecurePassword

# Ajouter au label
- "traefik.http.middlewares.auth.basicauth.users=admin:$$apr1$$xyz..."
- "traefik.http.routers.dashboard.middlewares=auth"
```

**Tests** :
1. Accéder au dashboard Traefik
2. Vérifier les certificats SSL
3. Tester le load balancing
4. Observer les métriques Prometheus

**Livrables** :
- Stack Traefik fonctionnelle
- Configuration SSL validée
- Documentation des middlewares

---

### Exercice 3.6 - Stack de Monitoring Complète

**Objectif** : Prometheus + Grafana + AlertManager + Loki

**Stack** : `monitoring-stack.yml`

```yaml
version: '3.8'

services:
  # Prometheus - Métriques
  prometheus:
    image: prom/prometheus:latest
    command:
      - '--config.file=/etc/prometheus/prometheus.yml'
      - '--storage.tsdb.path=/prometheus'
      - '--storage.tsdb.retention.time=30d'
      - '--web.console.libraries=/usr/share/prometheus/console_libraries'
      - '--web.console.templates=/usr/share/prometheus/consoles'
    configs:
      - source: prometheus_config
        target: /etc/prometheus/prometheus.yml
    volumes:
      - prometheus-data:/prometheus
    networks:
      - monitoring
    deploy:
      replicas: 1
      placement:
        constraints:
          - node.role == manager
      labels:
        - "traefik.enable=true"
        - "traefik.http.routers.prometheus.rule=Host(`prometheus.example.com`)"
        - "traefik.http.routers.prometheus.entrypoints=websecure"
        - "traefik.http.routers.prometheus.tls.certresolver=letsencrypt"
        - "traefik.http.services.prometheus.loadbalancer.server.port=9090"

  # Node Exporter - Métriques système
  node-exporter:
    image: prom/node-exporter:latest
    command:
      - '--path.procfs=/host/proc'
      - '--path.sysfs=/host/sys'
      - '--collector.filesystem.mount-points-exclude=^/(sys|proc|dev|host|etc)($$|/)'
    volumes:
      - /proc:/host/proc:ro
      - /sys:/host/sys:ro
      - /:/rootfs:ro
    networks:
      - monitoring
    deploy:
      mode: global

  # cAdvisor - Métriques conteneurs
  cadvisor:
    image: gcr.io/cadvisor/cadvisor:latest
    volumes:
      - /:/rootfs:ro
      - /var/run:/var/run:ro
      - /sys:/sys:ro
      - /var/lib/docker/:/var/lib/docker:ro
      - /dev/disk/:/dev/disk:ro
    networks:
      - monitoring
    deploy:
      mode: global

  # Grafana - Visualisation
  grafana:
    image: grafana/grafana:latest
    environment:
      - GF_SECURITY_ADMIN_USER=admin
      - GF_SECURITY_ADMIN_PASSWORD__FILE=/run/secrets/grafana_password
      - GF_INSTALL_PLUGINS=grafana-piechart-panel
      - GF_SERVER_ROOT_URL=https://grafana.example.com
    secrets:
      - grafana_password
    configs:
      - source: grafana_datasources
        target: /etc/grafana/provisioning/datasources/datasources.yml
      - source: grafana_dashboards_config
        target: /etc/grafana/provisioning/dashboards/dashboards.yml
    volumes:
      - grafana-data:/var/lib/grafana
    networks:
      - monitoring
      - traefik-public
    deploy:
      replicas: 1
      placement:
        constraints:
          - node.role == manager
      labels:
        - "traefik.enable=true"
        - "traefik.http.routers.grafana.rule=Host(`grafana.example.com`)"
        - "traefik.http.routers.grafana.entrypoints=websecure"
        - "traefik.http.routers.grafana.tls.certresolver=letsencrypt"
        - "traefik.http.services.grafana.loadbalancer.server.port=3000"

  # AlertManager - Gestion des alertes
  alertmanager:
    image: prom/alertmanager:latest
    command:
      - '--config.file=/etc/alertmanager/alertmanager.yml'
      - '--storage.path=/alertmanager'
    configs:
      - source: alertmanager_config
        target: /etc/alertmanager/alertmanager.yml
    volumes:
      - alertmanager-data:/alertmanager
    networks:
      - monitoring
    deploy:
      replicas: 1
      placement:
        constraints:
          - node.role == manager

  # Loki - Logs
  loki:
    image: grafana/loki:latest
    command: -config.file=/etc/loki/loki.yml
    configs:
      - source: loki_config
        target: /etc/loki/loki.yml
    volumes:
      - loki-data:/loki
    networks:
      - monitoring
    deploy:
      replicas: 1

  # Promtail - Agent de collecte de logs
  promtail:
    image: grafana/promtail:latest
    command: -config.file=/etc/promtail/promtail.yml
    configs:
      - source: promtail_config
        target: /etc/promtail/promtail.yml
    volumes:
      - /var/log:/var/log:ro
      - /var/lib/docker/containers:/var/lib/docker/containers:ro
    networks:
      - monitoring
    deploy:
      mode: global

networks:
  monitoring:
    driver: overlay
    attachable: true
  traefik-public:
    external: true

volumes:
  prometheus-data:
  grafana-data:
  alertmanager-data:
  loki-data:

secrets:
  grafana_password:
    external: true

configs:
  prometheus_config:
    file: ./prometheus/prometheus.yml
  grafana_datasources:
    file: ./grafana/datasources.yml
  grafana_dashboards_config:
    file: ./grafana/dashboards.yml
  alertmanager_config:
    file: ./alertmanager/alertmanager.yml
  loki_config:
    file: ./loki/loki.yml
  promtail_config:
    file: ./promtail/promtail.yml
```

**Configuration Prometheus** : `prometheus/prometheus.yml`

```yaml
global:
  scrape_interval: 15s
  evaluation_interval: 15s
  external_labels:
    cluster: 'swarm-prod'
    replica: '1'

alerting:
  alertmanagers:
    - static_configs:
        - targets:
            - alertmanager:9093

rule_files:
  - 'alerts.yml'

scrape_configs:
  # Prometheus lui-même
  - job_name: 'prometheus'
    static_configs:
      - targets: ['localhost:9090']

  # Node Exporter (métriques système)
  - job_name: 'node-exporter'
    dns_sd_configs:
      - names:
          - 'tasks.node-exporter'
        type: 'A'
        port: 9100

  # cAdvisor (métriques Docker)
  - job_name: 'cadvisor'
    dns_sd_configs:
      - names:
          - 'tasks.cadvisor'
        type: 'A'
        port: 8080

  # Docker Swarm managers
  - job_name: 'docker-swarm-managers'
    dockerswarm_sd_configs:
      - host: unix:///var/run/docker.sock
        role: nodes
        filters:
          - name: node-role
            values: [manager]

  # Docker Swarm workers
  - job_name: 'docker-swarm-workers'
    dockerswarm_sd_configs:
      - host: unix:///var/run/docker.sock
        role: nodes
        filters:
          - name: node-role
            values: [worker]

  # Docker services
  - job_name: 'docker-services'
    dockerswarm_sd_configs:
      - host: unix:///var/run/docker.sock
        role: services
```

**Règles d'alerte** : `prometheus/alerts.yml`

```yaml
groups:
  - name: swarm_alerts
    interval: 30s
    rules:
      # Node down
      - alert: NodeDown
        expr: up{job="node-exporter"} == 0
        for: 2m
        labels:
          severity: critical
        annotations:
          summary: "Node {{ $labels.instance }} is down"
          description: "Node has been down for more than 2 minutes"

      # High CPU
      - alert: HighCPUUsage
        expr: 100 - (avg by (instance) (irate(node_cpu_seconds_total{mode="idle"}[5m])) * 100) > 80
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "High CPU usage on {{ $labels.instance }}"
          description: "CPU usage is above 80% for 5 minutes"

      # High Memory
      - alert: HighMemoryUsage
        expr: (node_memory_MemTotal_bytes - node_memory_MemAvailable_bytes) / node_memory_MemTotal_bytes * 100 > 85
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "High memory usage on {{ $labels.instance }}"

      # Disk space
      - alert: DiskSpaceLow
        expr: (node_filesystem_avail_bytes{mountpoint="/"} / node_filesystem_size_bytes{mountpoint="/"}) * 100 < 15
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "Low disk space on {{ $labels.instance }}"

      # Service replicas
      - alert: ServiceReplicasDown
        expr: (kube_deployment_spec_replicas - kube_deployment_status_replicas_available) > 0
        for: 5m
        labels:
          severity: critical
        annotations:
          summary: "Service {{ $labels.deployment }} has missing replicas"

      # Container restarts
      - alert: ContainerRestarting
        expr: rate(container_last_seen[5m]) > 0
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "Container {{ $labels.name }} is restarting frequently"
```

**Configuration AlertManager** : `alertmanager/alertmanager.yml`

```yaml
global:
  resolve_timeout: 5m

route:
  group_by: ['alertname', 'cluster', 'service']
  group_wait: 10s
  group_interval: 10s
  repeat_interval: 12h
  receiver: 'team-notifications'
  routes:
    - match:
        severity: critical
      receiver: 'team-critical'
      continue: true
    
    - match:
        severity: warning
      receiver: 'team-warnings'

receivers:
  - name: 'team-notifications'
    webhook_configs:
      - url: 'http://webhook-receiver:5000/alerts'
  
  - name: 'team-critical'
    email_configs:
      - to: 'ops-critical@example.com'
        from: 'alertmanager@example.com'
        smarthost: 'smtp.example.com:587'
        auth_username: 'alertmanager'
        auth_password: 'password'
        headers:
          Subject: '[CRITICAL] {{ .GroupLabels.alertname }}'
    
    slack_configs:
      - api_url: 'https://hooks.slack.com/services/YOUR/SLACK/WEBHOOK'
        channel: '#alerts-critical'
        title: '{{ .GroupLabels.alertname }}'
        text: '{{ range .Alerts }}{{ .Annotations.description }}{{ end }}'
  
  - name: 'team-warnings'
    slack_configs:
      - api_url: 'https://hooks.slack.com/services/YOUR/SLACK/WEBHOOK'
        channel: '#alerts-warnings'

inhibit_rules:
  - source_match:
      severity: 'critical'
    target_match:
      severity: 'warning'
    equal: ['alertname', 'cluster', 'service']
```

**Déploiement** :

```bash
# Créer les secrets
echo "SuperSecureGrafanaPassword" | docker secret create grafana_password -

# Créer le réseau Traefik si nécessaire
docker network create --driver overlay traefik-public

# Déployer la stack
docker stack deploy -c monitoring-stack.yml monitoring

# Vérifier
docker stack ps monitoring
```

**Accès** :
- Grafana: https://grafana.example.com (admin / SuperSecureGrafanaPassword)
- Prometheus: https://prometheus.example.com
- AlertManager: http://<manager-ip>:9093

**Livrables** :
- Stack de monitoring complète et fonctionnelle
- Dashboards Grafana configurés
- Alertes testées et validées

---

### Exercice 3.7 - Dashboards Grafana Personnalisés

**Objectif** : Créer des dashboards pour monitorer le cluster Swarm

**Dashboard 1 : Vue d'ensemble du cluster**

Métriques à inclure :
- Nombre de nœuds actifs
- Nombre de services déployés
- Utilisation CPU/RAM globale
- Trafic réseau
- I/O disque

**Dashboard 2 : Services et conteneurs**

- État des réplicas par service
- Temps de réponse des healthchecks
- Redémarrages de conteneurs
- Utilisation ressources par service

**Dashboard 3 : Alertes et incidents**

- Historique des alertes
- Temps de résolution
- Services en état dégradé

**Import de dashboards communautaires** :

```bash
# Via l'UI Grafana
# ID de dashboards populaires:
# - 893: Docker and System Monitoring
# - 11074: Node Exporter Full
# - 179: Docker Swarm & Container Overview
```

**Export/Import programmatique** :

```bash
# Export d'un dashboard
curl -u admin:password http://grafana.example.com/api/dashboards/uid/xyz > dashboard.json

# Import
curl -X POST -H "Content-Type: application/json" \
  -u admin:password \
  -d @dashboard.json \
  http://grafana.example.com/api/dashboards/db
```

**Livrables** :
- 3 dashboards personnalisés
- Captures d'écran
- JSON des dashboards

---

### Exercice 3.8 - Audit et Logs Centralisés

**Objectif** : Centraliser et analyser les logs du cluster

**Stack Loki déjà incluse dans Exercise 3.6**

**Configuration Loki** : `loki/loki.yml`

```yaml
auth_enabled: false

server:
  http_listen_port: 3100

ingester:
  lifecycler:
    address: 127.0.0.1
    ring:
      kvstore:
        store: inmemory
      replication_factor: 1
    final_sleep: 0s
  chunk_idle_period: 5m
  chunk_retain_period: 30s

schema_config:
  configs:
    - from: 2020-05-15
      store: boltdb
      object_store: filesystem
      schema: v11
      index:
        prefix: index_
        period: 168h

storage_config:
  boltdb:
    directory: /loki/index

  filesystem:
    directory: /loki/chunks

limits_config:
  enforce_metric_name: false
  reject_old_samples: true
  reject_old_samples_max_age: 168h

chunk_store_config:
  max_look_back_period: 0s

table_manager:
  retention_deletes_enabled: true
  retention_period: 720h
```

**Configuration Promtail** : `promtail/promtail.yml`

```yaml
server:
  http_listen_port: 9080
  grpc_listen_port: 0

positions:
  filename: /tmp/positions.yaml

clients:
  - url: http://loki:3100/loki/api/v1/push

scrape_configs:
  # Logs système
  - job_name: system
    static_configs:
      - targets:
          - localhost
        labels:
          job: varlogs
          host: ${HOSTNAME}
          __path__: /var/log/*.log

  # Logs Docker containers
  - job_name: containers
    docker_sd_configs:
      - host: unix:///var/run/docker.sock
        refresh_interval: 5s
    relabel_configs:
      - source_labels: ['__meta_docker_container_name']
        regex: '/(.*)'
        target_label: 'container'
      - source_labels: ['__meta_docker_container_log_stream']
        target_label: 'stream'
      - source_labels: ['__meta_docker_container_label_com_docker_swarm_service_name']
        target_label: 'service'
      - source_labels: ['__meta_docker_container_label_com_docker_swarm_task_name']
        target_label: 'task'
```

**Requêtes LogQL** :

```logql
# Logs d'un service spécifique
{service="my-app"}

# Logs d'erreur
{service="my-app"} |= "error"

# Logs avec niveau ERROR ou CRITICAL
{service="my-app"} | json | level=~"ERROR|CRITICAL"

# Nombre d'erreurs par minute
sum(rate({service="my-app"} |= "error" [1m]))

# Top 10 des erreurs
topk(10, sum by (error) (rate({service="my-app"} | json [5m])))
```

**Alertes sur les logs** :

Ajouter à Prometheus pour alerter sur patterns dans Loki :

```yaml
# Dans prometheus/alerts.yml
- name: log_alerts
  rules:
    - alert: HighErrorRate
      expr: |
        sum(rate({service="my-app"} |= "ERROR" [5m])) > 10
      for: 5m
      labels:
        severity: warning
      annotations:
        summary: "High error rate in my-app"
```

**Livrables** :
- Loki opérationnel avec logs centralisés
- Exemples de requêtes LogQL
- Dashboard Grafana pour les logs

---

### Exercice 3.9 - Security Scanning Continue

**Objectif** : Automatiser le scanning de sécurité en continu

**Service de scanning périodique** :

```yaml
# security-scanner-stack.yml
version: '3.8'

services:
  trivy-scanner:
    image: aquasec/trivy:latest
    command: 
      - server
      - --listen
      - 0.0.0.0:8080
    volumes:
      - trivy-cache:/root/.cache
    networks:
      - monitoring
    deploy:
      replicas: 1

  scanner-cron:
    image: alpine:latest
    command: >
      sh -c "
        apk add --no-cache curl jq &&
        while true; do
          echo 'Running security scan...'
          curl -X POST trivy-scanner:8080/scan
          sleep 86400
        done
      "
    networks:
      - monitoring
    deploy:
      replicas: 1

volumes:
  trivy-cache:

networks:
  monitoring:
    external: true
```

**Script de rapport hebdomadaire** :

```bash
#!/bin/bash
# weekly-security-report.sh

REPORT_DIR="/reports/security"
DATE=$(date +%Y%m%d)
mkdir -p $REPORT_DIR

echo "=== Security Report - $DATE ===" > $REPORT_DIR/report-$DATE.txt

# Scanner toutes les images en cours d'utilisation
docker ps --format '{{.Image}}' | sort -u | while read image; do
    echo "Scanning $image..." >> $REPORT_DIR/report-$DATE.txt
    trivy image --severity HIGH,CRITICAL --format json $image > $REPORT_DIR/$image-$DATE.json
    
    # Résumé
    jq -r '.Results[] | .Vulnerabilities[] | "\(.Severity): \(.VulnerabilityID) - \(.Title)"' \
        $REPORT_DIR/$image-$DATE.json >> $REPORT_DIR/report-$DATE.txt
    
    echo "---" >> $REPORT_DIR/report-$DATE.txt
done

# Envoyer par email
mail -s "Weekly Security Report - $DATE" ops@example.com < $REPORT_DIR/report-$DATE.txt
```

**Livrables** :
- Système de scanning continu
- Rapports automatisés
- Procédure de remédiation

---

### Exercice 3.10 - Projet Final : Infrastructure Production Sécurisée

**Objectif** : Assembler tous les concepts dans une infrastructure complète

**Spécifications** :

1. **Architecture** :
   - 3 managers en HA
   - 3 workers
   - Tous les réseaux overlay chiffrés
   - Certificats TLS automatiques

2. **Applications** :
   - Frontend Web (3 réplicas)
   - API REST (5 réplicas)
   - Base de données PostgreSQL (1 réplica + réplication)
   - Cache Redis (1 réplica)
   - Job workers (2 réplicas)

3. **Sécurité** :
   - Traefik avec Let's Encrypt
   - Scanning Trivy automatique
   - Secrets pour toutes les credentials
   - Réseau segmenté (frontend/backend/data)
   - Politiques de restart appropriées

4. **Monitoring** :
   - Prometheus + Grafana
   - AlertManager configuré
   - Loki pour les logs
   - Dashboards personnalisés
   - Alertes sur :
     - Nœuds down
     - Services dégradés
     - CPU/RAM/Disk
     - Erreurs applicatives

5. **Opérations** :
   - Healthchecks sur tous les services
   - Rolling updates configurées
   - Backups automatisés (quotidiens)
   - Documentation complète
   - Runbook pour les incidents

**Livrables** :

1. **Code** :
   - `production-stack.yml` complet
   - Tous les fichiers de configuration
   - Scripts d'automatisation

2. **Documentation** :
   - Architecture diagram
   - Guide de déploiement
   - Procédures de maintenance
   - Runbooks pour incidents courants
   - Guide de monitoring

3. **Tests** :
   - Tests de résilience (simulation de pannes)
   - Tests de charge
   - Tests de sécurité
   - Validation des backups/restore

4. **Présentation** :
   - Démo de la stack en fonctionnement
   - Simulation d'incident et résolution
   - Explication des choix d'architecture

---

## 🎓 Questions de Synthèse

### Sécurité
1. Quels sont les 5 principes de sécurité les plus importants pour Swarm ?
2. Comment implémenter une défense en profondeur ?
3. Quelle stratégie de gestion des secrets en production ?

### Monitoring
1. Quelles métriques sont critiques pour un cluster Swarm ?
2. Comment dimensionner le système de monitoring ?
3. Stratégie de rétention des données (métriques et logs) ?

### Opérations
1. Procédure de réponse à incident ?
2. Comment effectuer une mise à jour de sécurité en urgence ?
3. Stratégie de disaster recovery ?

## 📊 Critères d'Évaluation

| Critère | Points | Description |
|---------|--------|-------------|
| Sécurité native Swarm | 10 | Compréhension des mécanismes |
| Chiffrement réseau | 10 | Overlay networks sécurisés |
| Scanning sécurité | 10 | Trivy et politique d'images |
| Traefik + SSL | 15 | Reverse proxy avec certificats |
| Stack monitoring | 20 | Prometheus + Grafana + Loki |
| Dashboards | 10 | Visualisations pertinentes |
| Alerting | 10 | AlertManager configuré |
| Projet final | 10 | Infrastructure complète |
| Documentation | 5 | Qualité des livrables |
| **Total** | **100** | |

## 🚀 Aller Plus Loin

1. Implémenter Vault pour la gestion des secrets
2. Configurer Jaeger pour le distributed tracing
3. Mettre en place un WAF (Web Application Firewall)
4. Implémenter le mTLS pour les services
5. Configurer l'audit logging de Docker
6. Intégrer avec un SIEM (Security Information and Event Management)

---

**Temps estimé** : 8-10 heures

**Difficulté** : ⭐⭐⭐⭐⭐

**Prerequis** : Labs 1 et 2 validés

**Certification** : Ce lab prépare à la certification Docker Certified Associate (DCA)
