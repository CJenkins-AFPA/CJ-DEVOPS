#!/bin/bash
set -e

echo "🔧 Vault HA Cluster - Script d'initialisation"

# Attendre que vault-1 soit prêt
echo "⏳ Attente démarrage Vault node 1..."
until curl -s --cacert /vault/certs/ca-cert.pem https://vault-1:8200/v1/sys/health | grep -q "initialized"; do
  sleep 2
done

# Vérifier si déjà initialisé
INIT_STATUS=$(curl -s --cacert /vault/certs/ca-cert.pem https://vault-1:8200/v1/sys/init | jq -r '.initialized')

if [ "$INIT_STATUS" = "false" ]; then
  echo "🔐 Initialisation du cluster Vault..."
  
  # Initialiser avec 5 clés, seuil 3
  INIT_RESPONSE=$(curl -s --cacert /vault/certs/ca-cert.pem -X PUT https://vault-1:8200/v1/sys/init -d '{
    "secret_shares": 5,
    "secret_threshold": 3
  }')
  
  # Sauvegarder les clés (ATTENTION: En prod, utiliser Vault transit ou HSM)
  echo "$INIT_RESPONSE" > /vault/shared/init-keys.json
  echo "✅ Clés sauvegardées dans /vault/shared/init-keys.json"
  
  # Extraire root token et unseal keys
  ROOT_TOKEN=$(echo "$INIT_RESPONSE" | jq -r '.root_token')
  UNSEAL_KEY_1=$(echo "$INIT_RESPONSE" | jq -r '.keys[0]')
  UNSEAL_KEY_2=$(echo "$INIT_RESPONSE" | jq -r '.keys[1]')
  UNSEAL_KEY_3=$(echo "$INIT_RESPONSE" | jq -r '.keys[2]')
  
  echo "🔓 Unsealing Vault node 1..."
  curl -s --cacert /vault/certs/ca-cert.pem -X PUT https://vault-1:8200/v1/sys/unseal -d "{\"key\": \"$UNSEAL_KEY_1\"}" > /dev/null
  curl -s --cacert /vault/certs/ca-cert.pem -X PUT https://vault-1:8200/v1/sys/unseal -d "{\"key\": \"$UNSEAL_KEY_2\"}" > /dev/null
  curl -s --cacert /vault/certs/ca-cert.pem -X PUT https://vault-1:8200/v1/sys/unseal -d "{\"key\": \"$UNSEAL_KEY_3\"}" > /dev/null
  
  echo "✅ Vault node 1 initialisé et unsealé"
  
  # Attendre que vault-2 et vault-3 soient prêts
  echo "⏳ Attente démarrage nodes 2 et 3..."
  sleep 5
  
  # Joindre les nœuds 2 et 3 au cluster Raft
  echo "🔗 Ajout node 2 au cluster..."
  curl -s --cacert /vault/certs/ca-cert.pem -X PUT https://vault-2:8200/v1/sys/storage/raft/join -d '{
    "leader_api_addr": "https://vault-1:8200"
  }' > /dev/null
  
  echo "🔗 Ajout node 3 au cluster..."
  curl -s --cacert /vault/certs/ca-cert.pem -X PUT https://vault-3:8200/v1/sys/storage/raft/join -d '{
    "leader_api_addr": "https://vault-1:8200"
  }' > /dev/null
  
  # Unseal nodes 2 et 3
  echo "🔓 Unsealing node 2..."
  curl -s --cacert /vault/certs/ca-cert.pem -X PUT https://vault-2:8200/v1/sys/unseal -d "{\"key\": \"$UNSEAL_KEY_1\"}" > /dev/null
  curl -s --cacert /vault/certs/ca-cert.pem -X PUT https://vault-2:8200/v1/sys/unseal -d "{\"key\": \"$UNSEAL_KEY_2\"}" > /dev/null
  curl -s --cacert /vault/certs/ca-cert.pem -X PUT https://vault-2:8200/v1/sys/unseal -d "{\"key\": \"$UNSEAL_KEY_3\"}" > /dev/null
  
  echo "🔓 Unsealing node 3..."
  curl -s --cacert /vault/certs/ca-cert.pem -X PUT https://vault-3:8200/v1/sys/unseal -d "{\"key\": \"$UNSEAL_KEY_1\"}" > /dev/null
  curl -s --cacert /vault/certs/ca-cert.pem -X PUT https://vault-3:8200/v1/sys/unseal -d "{\"key\": \"$UNSEAL_KEY_2\"}" > /dev/null
  curl -s --cacert /vault/certs/ca-cert.pem -X PUT https://vault-3:8200/v1/sys/unseal -d "{\"key\": \"$UNSEAL_KEY_3\"}" > /dev/null
  
  echo "✅ Cluster Vault HA initialisé avec succès!"
  echo "📊 Root Token: $ROOT_TOKEN"
  echo "⚠️  Clés unseal sauvegardées dans /vault/init-keys.json"
  
  # Configurer AppRole sur le leader
  echo "🔧 Configuration AppRole sur le cluster..."
  export VAULT_TOKEN="$ROOT_TOKEN"
  export VAULT_ADDR="https://vault-1:8200"
  export VAULT_CACERT="/vault/certs/ca-cert.pem"
  
  # Activer KV v2
  vault secrets enable -path=secret kv-v2 || echo "KV v2 déjà activé"
  
  # Activer TOTP
  vault auth enable totp || echo "TOTP déjà activé"
  
  # Créer policy app-policy
  vault policy write app-policy - <<EOF
path "secret/data/app/*" {
  capabilities = ["read"]
}
path "totp/*" {
  capabilities = ["create", "read", "update", "delete", "list"]
}
EOF
  
  # Activer AppRole
  vault auth enable approle || echo "AppRole déjà activé"
  
  # Créer rôle uyoop-cal
  vault write auth/approle/role/uyoop-cal \
    token_ttl=1h \
    token_max_ttl=24h \
    token_policies="app-policy" \
    secret_id_ttl=168h \
    secret_id_num_uses=0
  
  # Générer ROLE_ID et SECRET_ID
  ROLE_ID=$(vault read -field=role_id auth/approle/role/uyoop-cal/role-id)
  SECRET_ID=$(vault write -field=secret_id -f auth/approle/role/uyoop-cal/secret-id)
  
  # Stocker DATABASE_URL
  vault kv put secret/app/config database_url="postgresql://devops_calendar:devops_calendar@postgres:5432/devops_calendar"
  
  # Créer .env.vault
  cat > /vault/shared/.env.vault <<ENVEOF
VAULT_ADDR=https://vault-1:8200
VAULT_APPROLE_ROLE_ID=$ROLE_ID
VAULT_APPROLE_SECRET_ID=$SECRET_ID
VAULT_ROOT_TOKEN=$ROOT_TOKEN
VAULT_CACERT=/vault/certs/ca-cert.pem
ENVEOF
  
  echo "✅ Configuration AppRole terminée"
  echo "📝 Fichier .env.vault créé dans /vault/shared"
  echo "⚠️  Clés unseal dans /vault/shared/init-keys.json"
  
else
  echo "ℹ️  Cluster déjà initialisé, unseal si nécessaire..."
  
  # Charger les clés depuis init-keys.json
  if [ -f /vault/shared/init-keys.json ]; then
    UNSEAL_KEY_1=$(jq -r '.keys[0]' /vault/shared/init-keys.json)
    UNSEAL_KEY_2=$(jq -r '.keys[1]' /vault/shared/init-keys.json)
    UNSEAL_KEY_3=$(jq -r '.keys[2]' /vault/shared/init-keys.json)
    
    # Unseal tous les nœuds si nécessaire
    for node in vault-1 vault-2 vault-3; do
      SEALED=$(curl -s --cacert /vault/shared/../certs/ca-cert.pem https://$node:8200/v1/sys/seal-status | jq -r '.sealed')
      if [ "$SEALED" = "true" ]; then
        echo "🔓 Unsealing $node..."
        curl -s --cacert /vault/shared/../certs/ca-cert.pem -X PUT https://$node:8200/v1/sys/unseal -d "{\"key\": \"$UNSEAL_KEY_1\"}" > /dev/null
        curl -s --cacert /vault/shared/../certs/ca-cert.pem -X PUT https://$node:8200/v1/sys/unseal -d "{\"key\": \"$UNSEAL_KEY_2\"}" > /dev/null
        curl -s --cacert /vault/shared/../certs/ca-cert.pem -X PUT https://$node:8200/v1/sys/unseal -d "{\"key\": \"$UNSEAL_KEY_3\"}" > /dev/null
      fi
    done
  fi
fi

echo ""
echo "======================================"
echo "🎉 Vault HA Cluster opérationnel!"
echo "======================================"
echo "Nœuds: vault-1:8200, vault-2:8200, vault-3:8200"
echo "UI: http://localhost:8200/ui"
echo "======================================"
