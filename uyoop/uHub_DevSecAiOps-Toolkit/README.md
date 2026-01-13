# uHub_DevSecAiOps-Toolkit

uHub est un portail DevSecAiOps conçu pour orchestrer les opérations (Projets, Jobs, Git, Ansible) avec une sécurité maximale.

## 🚀 Setup & Démarrage

### Pré-requis Critique : Docker Hardened Images

> [!IMPORTANT]
> **Accès aux Images Hardened (DHI)**
> Ce projet utilise les images officielles **Docker Hardened Images** (`dhi.io`) pour garantir la sécurité de la supply chain.
>
> Avant toute commande de build, vous **DEVEZ** vous authentifier :
> ```bash
> docker login dhi.io
> ```
> *Utilisez vos identifiants Docker Hub personnels.*

### Commandes Rapides (Makefile)

Le projet inclut un `Makefile` pour simplifier les opérations (Idempotence garantie).

| Commande | Action |
|---|---|
| `make up` | **Build & Start** (Back, Front, DB, Vault). |
| `make down` | Arrête et supprime les conteneurs (conserve les données volume). |
| `make clean` | **Reset Total** : Supprime conteneurs ET volumes (Base de données vide). |
| `make logs` | Affiche les logs en temps réel. |

### Vérification
Une fois lancé (`make up`) :
- **Frontend** : [http://localhost:8080](http://localhost:8080)
- **Backend** : [http://localhost:8000/docs](http://localhost:8000/docs) (Swagger UI)

## 📚 Documentation
Toute la documentation technique et fonctionnelle se trouve dans le dossier `docs/` :
- [11 - Choix Techniques](docs/11-technical-choices.md) (Stack, Hardening, Ports)
- [04 - Architecture](docs/04-architecture-v1.md)
