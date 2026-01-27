#!/bin/bash
# Script de nettoyage complet (attention: supprime toutes les données)
# Usage: ./cleanup.sh

set -e

echo "============================================"
echo "  ⚠️  NETTOYAGE COMPLET DU PROJET CI"
echo "============================================"
echo ""
echo "⚠️  ATTENTION: Cette action va supprimer:"
echo "   - Tous les containers"
echo "   - Tous les volumes (données GitLab, Harbor, etc.)"
echo "   - Toutes les configurations"
echo ""
read -p "Êtes-vous sûr de vouloir continuer? (yes/NO): " -r
echo ""

if [[ ! $REPLY =~ ^[Yy][Ee][Ss]$ ]]; then
    echo "❌ Opération annulée."
    exit 1
fi

echo "🗑️  Arrêt et suppression des containers..."
docker compose down -v

echo ""
echo "🗑️  Suppression des répertoires de données..."
rm -rf gitlab/config gitlab/logs gitlab/data gitlab/runner-config
rm -rf harbor/data
rm -rf app/data

echo ""
echo "🗑️  Nettoyage des images Docker inutilisées..."
docker system prune -f

echo ""
echo "✅ Nettoyage terminé!"
echo ""
echo "💡 Pour redémarrer le projet: ./start.sh"
echo ""
