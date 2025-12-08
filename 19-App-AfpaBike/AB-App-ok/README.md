# AfpaBike - Variante App complète (AB-App-ok)

Objectif : corriger l'application (Dev + DevOps) pour qu'elle soit fonctionnelle et optimisée. 

## État actuel
✅ **Corrections DevOps appliquées** : Infrastructure Docker optimisée et fonctionnelle.
✅ **Corrections Dev appliquées** : Configuration adaptée pour environnement Docker.

## Corrections appliquées

### 1. Infrastructure DevOps (✅ Complètes)
- ✅ `docker-compose.yml` : 
  - Healthcheck MySQL avec `mysqladmin ping`
  - Dépendance `service_healthy` pour web
  - Named volume `db-data` pour persistance
  - Bind mounts corrects pour code source
  - Variables d'environnement via `.env`
  
- ✅ `Dockerfile` :
  - Image PHP 8.2-Apache optimisée
  - Extensions PDO MySQL + MySQLi
  - Mod Rewrite Apache activé
  - Dos2unix pour scripts shell
  - Permissions www-data correctes
  
- ✅ `.env` : Credentials MySQL centralisés
- ✅ Initialisation BDD : SQL via `docker-entrypoint-initdb.d`

### 2. Configuration applicative (✅ Complète)
- ✅ `files/config_afpabike_dev.ini` :
  - `PATH_HOME` : `/var/www/html/` (Docker Linux)
  - `PATH_CLASS` : `modules/afpabike/` (ajouté)
  - `PATH_FILES` : `files/afpabike/HTML/`
  - Variables BDD : `DB_HOST=mysql`, `DB_NAME`, `DB_LOGIN`, `DB_PSW`
  
- ✅ Structure vérifiée :
  - `web/route.php` : point d'entrée avec mod_rewrite
  - `modules/afpabike/initialize.php` : initialisation BDD/config
  - `modules/afpabike/database.php` : classe PDO
  - `files/afpabike/HTML/` : vues HTML
  - `files/afpabike/SQL/` : requêtes SQL (125 fichiers PHP)

### 3. Points d'attention (Dev legacy conservé)
⚠️ **Sécurité SQL** : Utilise `str_replace()` au lieu de prepared statements PDO natifs.
⚠️ **Hachage** : Crypto custom avec MD5 au lieu de `password_hash()` PHP moderne.
⚠️ **Input validation** : `htmlspecialchars()` uniquement, pas de validation métier.

> Ces pratiques sont conservées pour rester fidèles au code source fourni. Pour un environnement de production, il conviendrait d'utiliser des pratiques modernes (prepared statements, password_hash, validation robuste).

## Lancement
```bash
cd 19-App-AfpaBike/AB-App-ok
docker compose up -d
```

Accès : http://localhost:1234

## Documentation
- Voir `../README.md` pour l’organisation globale.
- Voir `../AB-Devops-ok/README.md` pour la référence DevOps.
