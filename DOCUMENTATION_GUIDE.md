# 📚 Guide de Documentation Standard - TPs DevOps

## Principes

1. **Clarté**: Chaque section répond à une question pratique
2. **Concision**: Pas de redondance, pas de process de vérification
3. **Action**: Centré sur ce qu'on peut faire, pas sur comment on l'a vérifié
4. **Cohérence**: Structure identique entre tous les TPs
5. **Progressivité**: Du simple au complexe

## Structure Standard par Type

### Type A: Applications Containerisées (TP09-18)

```markdown
# TP[N] - [Nom]

[1 ligne de description]

## Architecture

[ASCII diagram avec composants clés]

## Installation

### Prérequis
- [liste minimale]

### Démarrage
\`\`\`bash
docker compose up -d
\`\`\`

### Accès
- Service: http://localhost:PORT
- Admin: user/password (si applicable)

## Configuration

[Fichiers de config principaux]
[Variables d'environnement critiques]

## Utilisation

[Cas d'usage principaux avec exemples]

## Dépannage

[Erreurs communes et solutions]

## Ressources

[Liens externes pertinents]
```

### Type B: Scripts/Automation (TP23)

```markdown
# TP[N] - [Nom]

[1 ligne de description]

## Fonctionnalités

- Feature 1
- Feature 2
- Feature 3

## Installation

\`\`\`bash
chmod +x script.sh
\`\`\`

## Usage

### Syntaxe
\`\`\`bash
./script.sh [options] [arguments]
\`\`\`

### Exemples
\`\`\`bash
Example 1
Example 2
\`\`\`

## Options

[Table des options disponibles]

## Cas d'Usage

[Scénarios réels avec commandes complètes]

## Intégration CI/CD

[Si applicable]
```

### Type C: Infrastructure (TP24)

```markdown
# TP[N] - [Nom]

[1 ligne de description]

## Architecture

[Diagram des composants et réseau]

## Prérequis

[Logiciels, ressources, versions minimum]

## Déploiement

### Installation
\`\`\`bash
Étapes séquentielles
\`\`\`

### Vérification
\`\`\`bash
Commandes pour confirmer le déploiement
\`\`\`

## Configuration Post-Déploiement

[Configurations spécifiques après installation]

## Opérations

### Monitoring
[Commandes de vérification d'état]

### Scaling
[Comment ajouter/supprimer ressources]

### Backup/Restore
[Si applicable]

## Dépannage

[Erreurs communes et solutions]
```

## À Éviter

❌ Sections de vérification ("nous avons testé et confirmé que...")
❌ Process internal ("d'abord nous avons fait X, puis nous avons vérifié Y...")
❌ Redondance entre sections
❌ Explications théoriques longues
❌ Exemples génériques sans contexte

## À Inclure

✅ Exemples concrets et copiables
✅ Configuration réelle et opérationnelle
✅ Cas d'usage avec commandes complètes
✅ Erreurs common et solutions directes
✅ Références vers documentation externe
