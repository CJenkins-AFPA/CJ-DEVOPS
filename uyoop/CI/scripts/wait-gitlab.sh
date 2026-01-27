#!/bin/bash
# Script pour attendre que GitLab soit complètement démarré

echo "⏳ Attente du démarrage complet de GitLab..."
echo ""

COUNTER=0
MAX_TRIES=60

until [ "$(curl -s -o /dev/null -w '%{http_code}' http://gitlab.local:8080)" = "200" ] || [ $COUNTER -eq $MAX_TRIES ]; do
    echo -n "."
    sleep 5
    ((COUNTER++))
done

echo ""

if [ $COUNTER -eq $MAX_TRIES ]; then
    echo "❌ GitLab n'a pas démarré dans le délai imparti (5 minutes)"
    echo "   Vérifiez les logs: docker compose logs gitlab"
    exit 1
else
    echo "✅ GitLab est prêt et accessible!"
    echo ""
    echo "🌐 Accédez à GitLab: http://gitlab.local:8080"
    echo "👤 Username: root"
    echo "🔑 Password: RootPassword123!"
fi
