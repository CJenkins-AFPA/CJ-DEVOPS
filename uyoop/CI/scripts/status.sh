#!/bin/bash
# Script de vérification de l'état des services
# Usage: ./status.sh

echo "============================================"
echo "  État des Services CI SAST"
echo "============================================"
echo ""

echo "🐳 Containers Docker:"
echo ""
docker compose ps

echo ""
echo "============================================"
echo "📊 Utilisation des ressources:"
echo ""
docker stats --no-stream --format "table {{.Name}}\t{{.CPUPerc}}\t{{.MemUsage}}\t{{.NetIO}}"

echo ""
echo "============================================"
echo "💾 Espace disque Docker:"
echo ""
docker system df

echo ""
echo "============================================"
echo "🌐 URLs des services:"
echo "   - App Demo: http://localhost:8090"
echo "   - Harbor:   http://harbor.local:8081"
echo "   - GitLab:   https://gitlab.com (Cloud)"
echo ""
