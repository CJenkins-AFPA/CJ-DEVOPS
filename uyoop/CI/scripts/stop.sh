#!/bin/bash
# Script d'arrêt du projet CI SAST
# Usage: ./stop.sh

set -e

echo "============================================"
echo "  Arrêt du Projet CI SAST"
echo "============================================"
echo ""

# Arrêter les services
echo "🛑 Arrêt des services Docker Compose..."
docker compose down

echo ""
echo "✅ Services arrêtés avec succès!"
echo ""
echo "💡 Pour supprimer également les volumes (attention: perte de données):"
echo "   docker compose down -v"
echo ""
