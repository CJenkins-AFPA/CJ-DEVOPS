storage "raft" {
  path    = "/vault/data"
  node_id = "vault_1"
}

listener "tcp" {
  address             = "0.0.0.0:8200"
  cluster_address     = "0.0.0.0:8201"
  tls_cert_file       = "/vault/certs/vault-1-cert.pem"
  tls_key_file        = "/vault/certs/vault-1-key.pem"
  tls_client_ca_file  = "/vault/certs/ca-cert.pem"
  tls_disable         = "false"
}

disable_mlock = true

api_addr = "https://vault-1:8200"
cluster_addr = "https://vault-1:8201"

ui = true

# Raft cluster configuration
cluster_name = "uyoop-cal-vault-cluster"

# Telemetry (optionnel)
telemetry {
  prometheus_retention_time = "30s"
  disable_hostname = true
}
