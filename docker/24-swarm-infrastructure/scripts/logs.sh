#!/usr/bin/env bash
set -euo pipefail

service=${1:-traefik}
if [[ -z "$service" ]]; then
  echo "Usage: $0 <service-name>"; exit 1;
fi

docker service logs -f "$service"
