#!/usr/bin/env bash
set -euo pipefail

docker service ls
docker service ps --no-trunc --filter desired-state=shutdown || true
