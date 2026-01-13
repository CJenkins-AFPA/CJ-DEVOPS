#!/bin/bash
set -e

# Vault address and token (dev mode)
export VAULT_ADDR=http://127.0.0.1:8300
export VAULT_TOKEN=root

# Wait for Vault to be ready
echo "Waiting for Vault..."
until curl -s $VAULT_ADDR/v1/sys/health > /dev/null; do
    sleep 1
done
echo "Vault is up."

# Enable Database Secrets Engine
echo "Enabling Database Engine..."
# check if enabled first to avoid error?
if ! vault secrets list | grep -q database/; then
    vault secrets enable database
fi

# Configure Postgres Connection
# Vault connects as 'postgres' (superuser) to create dynamic users.
# Host is 'postgres' (docker service name), port 5432.
echo "Configuring Postgres Connection..."
vault write database/config/uhub \
    plugin_name=postgresql-database-plugin \
    allowed_roles="uhub-backend" \
    connection_url="postgresql://{{username}}:{{password}}@postgres:5432/uhub?sslmode=disable" \
    username="postgres" \
    password="changeme" 
    # Note: 'changeme' is the password set in postgres-entrypoint.sh. 
    # In strict prod, this would be injected or rotated immediately.

# Create Role for Backend
# This role creates a user with full privileges on 'uhub' db (or specific grants).
echo "Creating 'uhub-backend' Role..."
vault write database/roles/uhub-backend \
    db_name=uhub \
    creation_statements="CREATE ROLE \"{{name}}\" WITH LOGIN PASSWORD '{{password}}' VALID UNTIL '{{expiration}}'; GRANT ALL PRIVILEGES ON DATABASE uhub TO \"{{name}}\"; GRANT ALL ON SCHEMA public TO \"{{name}}\";" \
    default_ttl="1h" \
    max_ttl="24h"

echo "Vault Setup Complete. Test credential generation:"
vault read database/creds/uhub-backend
