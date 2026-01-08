#!/bin/bash
# Script d'initialisation Vault (dev) + AppRole + KV app/config
# - Active TOTP & Database engines
# - Crée une policy minimale pour l'app
# - Crée AppRole et génère ROLE_ID/SECRET_ID
# - Stocke DATABASE_URL dans KV: secret/app/config (key: database_url)

set -euo pipefail

echo "⏳ Attente démarrage Vault..."
sleep 5

export VAULT_ADDR='http://vault:8200'
export VAULT_TOKEN='dev-root-token'

echo "✅ Vault prêt"

# Activer KV v2 (secret), TOTP et Database secrets engines
echo "🔐 Activation secrets engines..."
docker exec -i devops_calendar_vault sh -lc "VAULT_ADDR=http://127.0.0.1:8200 VAULT_TOKEN=dev-root-token vault secrets enable -path=secret -version=2 kv || echo 'KV v2 déjà activé'"
docker exec -i devops_calendar_vault sh -lc "VAULT_ADDR=http://127.0.0.1:8200 VAULT_TOKEN=dev-root-token vault secrets enable totp || echo 'TOTP déjà activé'"
docker exec -i devops_calendar_vault sh -lc "VAULT_ADDR=http://127.0.0.1:8200 VAULT_TOKEN=dev-root-token vault secrets enable database || echo 'Database déjà activé'"

# Définir la DATABASE_URL à stocker (côté app, hôte postgres dans le réseau compose)
DB_URL_DEFAULT="postgresql://devops_calendar:devops_calendar@postgres:5432/devops_calendar"
DB_URL_VALUE="${DATABASE_URL:-$DB_URL_DEFAULT}"

# Créer policy minimale pour l'application
echo "📜 Création policy application (app-policy)..."
docker exec -i devops_calendar_vault sh -lc "cat > /tmp/app-policy.hcl <<'EOF'
# KV app config (lecture + list)
path \"secret/data/app/*\" {
  capabilities = [\"read\", \"list\"]
}

# TOTP keys management
path \"totp/keys/*\" {
  capabilities = [\"create\", \"read\", \"update\", \"delete\", \"list\"]
}

# TOTP code verification (update) + read for test code generation
path \"totp/code/*\" {
  capabilities = [\"read\", \"update\"]
}

# Future: dynamic DB creds (read)
path \"database/creds/*\" {
  capabilities = [\"read\"]
}
EOF
VAULT_ADDR=http://127.0.0.1:8200 VAULT_TOKEN=dev-root-token vault policy write app-policy /tmp/app-policy.hcl"

# Activer AppRole auth method et créer un rôle
echo "🧩 Configuration AppRole..."
docker exec -i devops_calendar_vault sh -lc "VAULT_ADDR=http://127.0.0.1:8200 VAULT_TOKEN=dev-root-token vault auth enable approle || echo 'AppRole déjà activé'"
docker exec -i devops_calendar_vault sh -lc "VAULT_ADDR=http://127.0.0.1:8200 VAULT_TOKEN=dev-root-token vault write auth/approle/role/uyoop-app policies=app-policy token_ttl=1h token_max_ttl=4h || true"

# Récupérer ROLE_ID et SECRET_ID
ROLE_ID=$(docker exec -i devops_calendar_vault sh -lc "VAULT_ADDR=http://127.0.0.1:8200 VAULT_TOKEN=dev-root-token vault read -field=role_id auth/approle/role/uyoop-app/role-id")
SECRET_ID=$(docker exec -i devops_calendar_vault sh -lc "VAULT_ADDR=http://127.0.0.1:8200 VAULT_TOKEN=dev-root-token vault write -f -field=secret_id auth/approle/role/uyoop-app/secret-id")

echo "🔑 ROLE_ID: $ROLE_ID"
echo "🔑 SECRET_ID: $SECRET_ID"

# Écrire le fichier .env.vault pour docker-compose
echo "📝 Écriture .env.vault..."
cat > .env.vault <<EOF
VAULT_ROLE_ID=$ROLE_ID
VAULT_SECRET_ID=$SECRET_ID
EOF

# Stocker DATABASE_URL dans KV v2
echo "💾 Écriture de secret/app/config.database_url dans Vault..."
docker exec -i devops_calendar_vault sh -lc "VAULT_ADDR=http://127.0.0.1:8200 VAULT_TOKEN=dev-root-token vault kv put secret/app/config database_url=\"$DB_URL_VALUE\""

echo "✅ Vault configuré avec succès!"
echo "📊 Status:"
docker exec -i devops_calendar_vault sh -lc "VAULT_ADDR=http://127.0.0.1:8200 VAULT_TOKEN=dev-root-token vault status"
echo "ℹ️  Ajouté: .env.vault (ROLE_ID/SECRET_ID). Mettez à jour docker-compose si nécessaire."
