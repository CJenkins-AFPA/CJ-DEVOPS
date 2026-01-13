# Hardened Vault Image based on dhi.io/python (Debian)
# Fallback since dhi.io/alpine does not exist.
FROM dhi.io/python:3.13-dev

USER root

# Install dependencies (runtime + build tools)
RUN apt-get update && apt-get install -y ca-certificates curl unzip gnupg && \
    apt-get clean && rm -rf /var/lib/apt/lists/*

# Securely download and verify Vault
# Version pinned for security and stability
ENV VAULT_VERSION=1.18.3
RUN set -ex; \
    curl -fSL https://releases.hashicorp.com/vault/${VAULT_VERSION}/vault_${VAULT_VERSION}_linux_amd64.zip -o vault.zip && \
    curl -fSL https://releases.hashicorp.com/vault/${VAULT_VERSION}/vault_${VAULT_VERSION}_SHA256SUMS -o vault.sha256 && \
    grep "vault_${VAULT_VERSION}_linux_amd64.zip" vault.sha256 | sha256sum -c - && \
    unzip vault.zip -d /usr/local/bin && \
    rm vault.zip vault.sha256 && \
    chmod +x /usr/local/bin/vault

# Use existing nonroot user
# Setup directories
RUN mkdir -p /vault/logs /vault/file /vault/config && \
    chown -R nonroot:nonroot /vault

USER nonroot
EXPOSE 8200

CMD ["vault", "server", "-dev", "-dev-listen-address=0.0.0.0:8200"]
