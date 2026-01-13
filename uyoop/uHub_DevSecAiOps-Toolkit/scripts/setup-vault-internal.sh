#!/bin/sh
set -e

# Run inside Vault Container
export VAULT_ADDR=http://127.0.0.1:8200
export VAULT_TOKEN=root

echo "Waiting for Vault..."
until vault status > /dev/null 2>&1; do
    echo "Vault not ready path..."
    sleep 1
done

echo "Enabling Database Engine..."
if ! vault secrets list | grep -q database/; then
    vault secrets enable database
fi

echo "Configuring Postgres Connection..."
# Postgres host is 'postgres'
vault write database/config/uhub \
    plugin_name=postgresql-database-plugin \
    allowed_roles="uhub-backend" \
    connection_url="postgresql://{{username}}:{{password}}@postgres:5432/uhub?sslmode=disable" \
    username="postgres" \
    password="changeme" 

echo "Creating 'uhub-backend' Role..."
vault write database/roles/uhub-backend \
    db_name=uhub \
    creation_statements="CREATE ROLE \"{{name}}\" WITH LOGIN PASSWORD '{{password}}' VALID UNTIL '{{expiration}}'; GRANT ALL PRIVILEGES ON DATABASE uhub TO \"{{name}}\"; GRANT ALL ON SCHEMA public TO \"{{name}}\";" \
    default_ttl="1h" \
    max_ttl="24h"

echo "Vault Configured."
