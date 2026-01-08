#!/bin/bash
set -e

echo "🔐 Génération certificats TLS pour Vault HA Cluster"

CERTS_DIR="./vault/certs"
mkdir -p "$CERTS_DIR"

# Configuration
COUNTRY="FR"
STATE="France"
CITY="Paris"
ORG="UYOOP-CAL"
OU="DevOps"
DAYS=3650  # 10 ans

echo "📁 Répertoire certificats: $CERTS_DIR"

# 1. Générer CA (Certificate Authority)
echo "1️⃣  Génération CA privée key..."
openssl genrsa -out "$CERTS_DIR/ca-key.pem" 4096

echo "2️⃣  Génération CA certificat..."
# Créer fichier de configuration pour extensions CA
cat > "$CERTS_DIR/ca-ext.cnf" <<EOF
[req]
distinguished_name = req_distinguished_name
x509_extensions = v3_ca

[req_distinguished_name]

[v3_ca]
basicConstraints = critical,CA:TRUE
keyUsage = critical,keyCertSign,cRLSign
subjectKeyIdentifier = hash
authorityKeyIdentifier = keyid:always,issuer:always
EOF

openssl req -new -x509 -sha256 \
  -key "$CERTS_DIR/ca-key.pem" \
  -out "$CERTS_DIR/ca-cert.pem" \
  -days $DAYS \
  -config "$CERTS_DIR/ca-ext.cnf" \
  -subj "/C=$COUNTRY/ST=$STATE/L=$CITY/O=$ORG/OU=$OU/CN=Vault-CA"

rm "$CERTS_DIR/ca-ext.cnf"
echo "✅ CA créée: ca-cert.pem (valide $DAYS jours)"

# 2. Fonction pour générer certificat nœud
generate_node_cert() {
  local NODE_NAME=$1
  local NODE_NUM=$2
  
  echo ""
  echo "🔑 Génération certificat pour $NODE_NAME..."
  
  # Clé privée du nœud
  openssl genrsa -out "$CERTS_DIR/$NODE_NAME-key.pem" 2048
  
  # CSR (Certificate Signing Request)
  openssl req -new -sha256 \
    -key "$CERTS_DIR/$NODE_NAME-key.pem" \
    -out "$CERTS_DIR/$NODE_NAME.csr" \
    -subj "/C=$COUNTRY/ST=$STATE/L=$CITY/O=$ORG/OU=$OU/CN=$NODE_NAME"
  
  # Extensions SAN (Subject Alternative Names)
  cat > "$CERTS_DIR/$NODE_NAME-ext.cnf" <<EOF
[req]
req_extensions = v3_req
distinguished_name = req_distinguished_name

[req_distinguished_name]

[v3_req]
basicConstraints = CA:FALSE
keyUsage = critical,digitalSignature,keyEncipherment
extendedKeyUsage = serverAuth,clientAuth
subjectAltName = @alt_names

[alt_names]
DNS.1 = $NODE_NAME
DNS.2 = localhost
DNS.3 = *.vault-network
IP.1 = 127.0.0.1
EOF
  
  # Signer le certificat avec la CA
  openssl x509 -req -sha256 \
    -in "$CERTS_DIR/$NODE_NAME.csr" \
    -CA "$CERTS_DIR/ca-cert.pem" \
    -CAkey "$CERTS_DIR/ca-key.pem" \
    -CAcreateserial \
    -out "$CERTS_DIR/$NODE_NAME-cert.pem" \
    -days $DAYS \
    -extensions v3_req \
    -extfile "$CERTS_DIR/$NODE_NAME-ext.cnf"
  
  # Nettoyer fichiers temporaires
  rm "$CERTS_DIR/$NODE_NAME.csr" "$CERTS_DIR/$NODE_NAME-ext.cnf"
  
  # Vérifier le certificat
  echo "✅ $NODE_NAME certificat créé et signé"
  openssl x509 -in "$CERTS_DIR/$NODE_NAME-cert.pem" -noout -subject -dates
}

# 3. Générer certificats pour chaque nœud
generate_node_cert "vault-1" 1
generate_node_cert "vault-2" 2
generate_node_cert "vault-3" 3

# 4. Permissions
echo ""
echo "🔒 Configuration permissions..."
chmod 600 "$CERTS_DIR"/*-key.pem
chmod 644 "$CERTS_DIR"/*-cert.pem "$CERTS_DIR/ca-cert.pem"

# 5. Résumé
echo ""
echo "======================================"
echo "🎉 Certificats TLS générés avec succès!"
echo "======================================"
echo "Fichiers créés dans $CERTS_DIR:"
ls -lh "$CERTS_DIR"
echo ""
echo "⚠️  CA Key (ca-key.pem) = À PROTÉGER ABSOLUMENT"
echo "📜 CA Cert (ca-cert.pem) = À distribuer aux clients"
echo "🔐 Certificats valides: $DAYS jours ($(date -d "+$DAYS days" +%Y-%m-%d))"
echo "======================================"
