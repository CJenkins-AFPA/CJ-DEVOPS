#!/bin/bash
# Script de démarrage du projet CI SAST
# Usage: ./start.sh

set -e

echo "============================================"
echo "  Démarrage du Projet CI SAST"
echo "============================================"
echo ""

# Vérifier Docker
if ! command -v docker &> /dev/null; then
    echo "❌ Docker n'est pas installé."
    exit 1
fi

if ! docker ps &> /dev/null; then
    echo "❌ Docker daemon n'est pas démarré."
    exit 1
fi

echo "✅ Docker est prêt"

# Vérifier Docker Compose
if ! docker compose version &> /dev/null; then
    echo "❌ Docker Compose n'est pas installé."
    exit 1
fi

echo "✅ Docker Compose est prêt"
echo ""

# Créer les répertoires nécessaires
echo "📁 Création des répertoires..."
mkdir -p gitlab/{config,logs,data,runner-config}
mkdir -p harbor/data
mkdir -p app/data
chmod -R 755 gitlab harbor app/data

echo "✅ Répertoires créés"
echo ""

# Vérifier /etc/hosts
if ! grep -q "gitlab.local" /etc/hosts; then
    echo "⚠️  Ajout de gitlab.local dans /etc/hosts..."
    echo "127.0.0.1 gitlab.local" | sudo tee -a /etc/hosts > /dev/null
    echo "✅ gitlab.local ajouté"
fi

if ! grep -q "harbor.local" /etc/hosts; then
    echo "⚠️  Ajout de harbor.local dans /etc/hosts..."
    echo "127.0.0.1 harbor.local" | sudo tee -a /etc/hosts > /dev/null
    echo "✅ harbor.local ajouté"
fi

echo ""

# Démarrer les services
echo "🚀 Démarrage des services Docker Compose (Mode GitLab.com Worker)..."
docker compose up -d

# Initialiser le répertoire data si nécessaire
mkdir -p app/data
chmod 777 app/data

# Configurer Harbor (rappel)
echo ""
echo "ℹ️  Rappel: Harbor doit être démarré séparément."
echo "   Voir le dossier 'harbor' pour plus de détails."

echo ""
echo "============================================"
echo "  Services démarrés avec succès (Mode Worker)!"
echo "============================================"
echo ""
echo "🌐 Accès aux services:"
echo "   - App Demo:    http://localhost:8090"
echo "   - Harbor:      http://harbor.local:8081"
echo ""
echo "🛠️ Configuration GitLab Runner:"
echo "   1. Créez un projet sur GitLab.com"
echo "   2. Récupérez le token d'enregistrement (Settings > CI/CD > Runners)"
echo "   3. Enregistrez le runner avec la commande suivante:"
echo "      docker exec -it ci-gitlab-runner gitlab-runner register --url https://gitlab.com --registration-token <VOTRE_TOKEN>"
echo ""
echo "📚 Documentation mise à jour: 03-MISE-EN-OEUVRE.md"
echo ""
