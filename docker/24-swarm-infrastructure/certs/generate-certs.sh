#!/usr/bin/env bash
set -euo pipefail

# Self-signed certificates generation for *.local domains
# Usage: ./generate-certs.sh

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
DOMAINS=("harbor.local" "traefik.local" "portainer.local" "afpabike.local" "uyoop.local" "swarm-manager.local")

echo "=== Génération certificats self-signed ==="

# 1) CA root
if [[ ! -f "${SCRIPT_DIR}/ca.key" ]]; then
    echo "Création CA root..."
    openssl genrsa -out "${SCRIPT_DIR}/ca.key" 4096
    openssl req -new -x509 -days 3650 -key "${SCRIPT_DIR}/ca.key" \
        -out "${SCRIPT_DIR}/ca.crt" \
        -subj "/C=FR/ST=Occitanie/L=Toulouse/O=AFPA/OU=DevOps/CN=AFPA-CA"
    echo "✓ CA créée: ca.key, ca.crt"
fi

# 2) Certificats par domaine
for domain in "${DOMAINS[@]}"; do
    if [[ -f "${SCRIPT_DIR}/${domain}.crt" ]]; then
        echo "✓ ${domain}.crt existe déjà"
        continue
    fi
    
    echo "Génération certificat pour ${domain}..."
    openssl genrsa -out "${SCRIPT_DIR}/${domain}.key" 2048
    openssl req -new -key "${SCRIPT_DIR}/${domain}.key" \
        -out "${SCRIPT_DIR}/${domain}.csr" \
        -subj "/C=FR/ST=Occitanie/L=Toulouse/O=AFPA/OU=DevOps/CN=${domain}"
    
    # Signature par la CA
    openssl x509 -req -days 365 \
        -in "${SCRIPT_DIR}/${domain}.csr" \
        -CA "${SCRIPT_DIR}/ca.crt" \
        -CAkey "${SCRIPT_DIR}/ca.key" \
        -CAcreateserial \
        -out "${SCRIPT_DIR}/${domain}.crt"
    
    rm "${SCRIPT_DIR}/${domain}.csr"
    echo "✓ ${domain}.crt généré"
done

echo ""
echo "=== Certificats générés ==="
ls -lh "${SCRIPT_DIR}"/*.crt "${SCRIPT_DIR}"/*.key
echo ""
echo "Pour faire confiance à ces certificats:"
echo "  - Importer ca.crt dans les autorités de certification de confiance"
echo "  - Copier les .crt/.key vers Traefik/Harbor/etc."
