# 📝 Mémo Local - Organisation Git CJ-DEVOPS

*Ce fichier est local uniquement et n'est pas versionné sur GitHub*

---

## 🗂️ Structure du Dépôt

**Répertoire local :** `/home/cj/gitdata`

**GitHub :** `github.com/CJenkins-AFPA/CJ-DEVOPS`

---

## 🌿 Branches et leur contenu

### `main` - Documentation
- Contient uniquement le README général
- Point d'entrée du dépôt

### `docker-compose` - Projets Docker
- Dossier : `Docker/`
- Projets : Compose, docker-install, project, Sources&DockerFile, TEST

### `ansible-automation` - Travaux Ansible
- Dossier : `TP-Ansible/`
- TPs et configurations Ansible

### `vagrant-vms` - Configurations Vagrant
- Machines virtuelles et environnements de dev

### `uyoop-app` - Application UyoopApp
- Projets liés à UyoopApp

---

## 🔄 Commandes Essentielles

### Navigation entre branches
```bash
# Consulter projets Docker
git checkout docker-compose

# Consulter projets Ansible  
git checkout ansible-automation

# Consulter projets Vagrant
git checkout vagrant-vms

# Consulter projets UyoopApp
git checkout uyoop-app

# Retour à la doc
git checkout main
```

### Voir l'état actuel
```bash
git branch              # Liste des branches
git status              # État de la branche actuelle
ls -la                  # Contenu du dossier
```

---

## ✨ Créer un nouveau projet

### Dans une catégorie existante
```bash
# 1. Aller sur la branche appropriée
git checkout docker-compose

# 2. Créer le projet
cd Docker
mkdir mon-nouveau-projet
cd mon-nouveau-projet
# ... créer fichiers ...

# 3. Sauvegarder
git add .
git commit -m "feat(docker): description du projet"
git push origin docker-compose
```

### Nouvelle catégorie (nouvelle branche)
```bash
# 1. Créer branche depuis main
git checkout main
git checkout -b nom-nouvelle-branche

# 2. Créer structure
mkdir NouveauDossier
# ... créer projets ...

# 3. Sauvegarder
git add .
git commit -m "feat: initialisation nouvelle catégorie"
git push origin nom-nouvelle-branche

# 4. Mettre à jour doc dans main
git checkout main
# éditer README.md pour ajouter la nouvelle branche
git add README.md
git commit -m "docs: ajout nouvelle branche"
git push origin main
```

---

## 💡 Points Importants

✅ **Vos fichiers ne disparaissent pas** - ils sont dans Git, simplement dans d'autres branches

✅ **Toujours travailler dans** `/home/cj/gitdata/`

✅ **Chaque branche = contenu différent** - c'est normal !

✅ **GitHub = sauvegarde** - tout est synchronisé

⚠️ **Pas besoin de `git pull`** si vous ne travaillez pas depuis plusieurs machines

---

## 🆘 En cas de doute

```bash
# Où suis-je ?
pwd                     # → /home/cj/gitdata

# Sur quelle branche ?
git branch              # * indique la branche active

# Que contient cette branche ?
ls -la

# Tout est sauvegardé ?
git status
```

---

**Dernière mise à jour :** 3 décembre 2025
