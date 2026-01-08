#!/bin/bash
set -e

echo "🔓 Auto-unseal script pour Vault HA avec TLS"

# Récupérer les clés unseal
KEYS_FILE="/vault/shared/init-keys.json"

if [ ! -f "$KEYS_FILE" ]; then
  echo "⚠️  Fichier $KEYS_FILE non trouvé. Cluster non initialisé?"
  exit 1
fi

UNSEAL_KEY_1=$(jq -r '.keys[0]' "$KEYS_FILE")
UNSEAL_KEY_2=$(jq -r '.keys[1]' "$KEYS_FILE")
UNSEAL_KEY_3=$(jq -r '.keys[2]' "$KEYS_FILE")

echo "🔑 Clés unseal chargées"

# Unseal tous les nœuds
for node in vault-1 vault-2 vault-3; do
  echo ""
  echo "🔓 Unsealing $node..."
  
  SEALED=$(curl -s --cacert /vault/certs/ca-cert.pem https://$node:8200/v1/sys/seal-status | jq -r '.sealed')
  
  if [ "$SEALED" = "true" ]; then
    curl -s --cacert /vault/certs/ca-cert.pem -X PUT https://$node:8200/v1/sys/unseal -d "{\"key\": \"$UNSEAL_KEY_1\"}" > /dev/null
    curl -s --cacert /vault/certs/ca-cert.pem -X PUT https://$node:8200/v1/sys/unseal -d "{\"key\": \"$UNSEAL_KEY_2\"}" > /dev/null
    curl -s --cacert /vault/certs/ca-cert.pem -X PUT https://$node:8200/v1/sys/unseal -d "{\"key\": \"$UNSEAL_KEY_3\"}" > /dev/null
    echo "✅ $node unsealed"
  else
    echo "ℹ️  $node déjà unsealed"
  fi
done

echo ""
echo "======================================"
echo "🎉 Tous les nœuds Vault sont unsealés!"
echo "======================================"
