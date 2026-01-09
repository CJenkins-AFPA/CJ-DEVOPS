# Lab 1 - Réponses aux Questions

**Nom** : ________________________________

**Date** : ________________________________

---

## Exercice 1.1 - Initialisation du Cluster

### Commande affichée pour joindre le cluster
```bash
[Coller ici la commande docker swarm join]
```

### Token Worker
```
[Coller le token worker]
```

### Token Manager
```
[Coller le token manager]
```

### Rôle du paramètre `--advertise-addr`
```
[Votre réponse]
```

---

## Exercice 1.2 - Ajout des Workers

### Nombre de nœuds listés
```
[Votre réponse]
```

### Statut de chaque nœud
| Nœud | Status | Availability | Manager Status |
|------|--------|--------------|----------------|
| manager1 | | | |
| worker1 | | | |
| worker2 | | | |

### Différence entre AVAILABILITY et STATUS
```
[Votre réponse]
```

---

## Exercice 1.3 - Inspection du Cluster

### Port utilisé par Raft
```
[Votre réponse]
```

### Fréquence de heartbeat
```
[Votre réponse]
```

### Emplacement du Raft log
```
[Votre réponse]
```

---

## Exercice 1.4 - Premier Service Simple

### Répartition des 3 réplicas
| Nœud | Nombre de réplicas |
|------|--------------------|
| manager1 | |
| worker1 | |
| worker2 | |

### Accès à http://192.168.56.10:8080
```
[Observation]
```

### Accès à http://192.168.56.11:8080
```
[Observation]
```

### Mécanisme de répartition de charge
```
[Explication du routing mesh]
```

---

## Exercice 1.5 - Scaling

### Stratégie de placement de Swarm
```
[Votre analyse]
```

### Sort d'un conteneur lors du scale down
```
[Votre réponse]
```

### Tableau de répartition
| Réplicas | manager1 | worker1 | worker2 |
|----------|----------|---------|---------|
| 1 | | | |
| 3 | | | |
| 6 | | | |
| 10 | | | |

---

## Exercice 1.6 - Mise à Jour Rolling

### Signification de `--update-parallelism 1`
```
[Votre réponse]
```

### Rôle de `--update-delay`
```
[Votre réponse]
```

### Fonctionnement de `--update-failure-action rollback`
```
[Votre réponse]
```

### Chronologie des événements
| Temps | Événement |
|-------|-----------|
| T0 | Commande update lancée |
| T+10s | |
| T+20s | |
| T+30s | |
| T+40s | |

---

## Exercice 1.7 - Gestion des Pannes

### Statut du nœud worker1 après arrêt Docker
```
[Votre observation]
```

### Redistribution des réplicas
```
[Description du processus observé]
```

### Temps de détection de la panne
```
[Temps mesuré]
```

### Comportement au redémarrage
```
[Observation]
```

### Analyse du RTO (Recovery Time Objective)
```
[Votre analyse avec calculs]
```

---

## Exercice 1.8 - Labels et Contraintes

### Placement de dev-app
```
[Nœuds utilisés]
```

### Tentative de 10 réplicas sur backend-service
```
[Observation et explication]
```

### Combinaison de contraintes
```
[Exemple de commande avec contraintes multiples]
```

---

## Exercice 1.9 - Réseau Overlay

### Mécanisme de découverte des conteneurs
```
[Explication]
```

### Rôle du DNS interne
```
[Explication]
```

### Différence overlay vs bridge
| Caractéristique | Overlay | Bridge |
|----------------|---------|--------|
| Portée | | |
| Multi-hôte | | |
| Cas d'usage | | |

---

## Exercice 1.10 - Stack Multi-Services

### Nombre de services créés
```
[Nombre]
```

### Configuration des réseaux
```
[Description]
```

### Stockage de la base de données
```
[Emplacement et type]
```

---

## Questions de Réflexion

### 1. Architecture

**Docker Compose vs Docker Stack** :
```
[Votre réponse]
```

**Nécessité de plusieurs managers** :
```
[Votre réponse]
```

**Quorum Raft** :
```
[Votre réponse]
```

### 2. Haute Disponibilité

**Mécanismes de HA des services** :
```
[Votre réponse]
```

**Panne du manager leader** :
```
[Votre réponse]
```

**Différence drain vs pause** :
```
[Votre réponse]
```

### 3. Réseau

**Fonctionnement du routing mesh** :
```
[Votre réponse]
```

**Mode ingress vs mode host** :
```
[Votre réponse]
```

**Communication inter-nœuds** :
```
[Votre réponse]
```

### 4. Sécurité

**Sécurisation inter-nœuds** :
```
[Votre réponse]
```

**Protocole Raft** :
```
[Votre réponse]
```

**Gestion des secrets** :
```
[Votre réponse]
```

---

## Auto-Évaluation

| Exercice | Compris | À revoir | Notes |
|----------|---------|----------|-------|
| 1.1 | ☐ | ☐ | |
| 1.2 | ☐ | ☐ | |
| 1.3 | ☐ | ☐ | |
| 1.4 | ☐ | ☐ | |
| 1.5 | ☐ | ☐ | |
| 1.6 | ☐ | ☐ | |
| 1.7 | ☐ | ☐ | |
| 1.8 | ☐ | ☐ | |
| 1.9 | ☐ | ☐ | |
| 1.10 | ☐ | ☐ | |

**Points à approfondir** :
```
[Notes personnelles]
```
