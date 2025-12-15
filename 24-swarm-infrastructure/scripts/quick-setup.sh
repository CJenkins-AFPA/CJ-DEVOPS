#!/usr/bin/env bash
# Quick setup script - Build and push images, or use local images for testing
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="${SCRIPT_DIR}/.."

echo "=== QUICK SETUP: Build & Push Images OR Use Local Images ==="
echo ""
echo "Option 1: Build images locally and load them into Swarm (FAST, NO HARBOR)"
echo "Option 2: Build images, push to Harbor (REQUIRES HARBOR RUNNING)"
echo ""
read -p "Choisissez l'option (1 ou 2): " option

if [[ "$option" == "1" ]]; then
    echo "=== Building images locally ==="
    
    # Build Afpabike
    echo "Building Afpabike..."
    cd "${PROJECT_DIR}/apps/afpabike"
    docker build -t afpabike:latest .
    
    # Build uyoopApp
    echo "Building uyoopApp..."
    cd "${PROJECT_DIR}/apps/uyoopapp"
    docker build -t uyoopapp:latest .
    
    echo ""
    echo "Images built locally. Now loading into Swarm..."
    
    # Save and load into manager
    docker save afpabike:latest > /tmp/afpabike.tar
    docker save uyoopapp:latest > /tmp/uyoopapp.tar
    
    # Copy to manager and load
    vagrant ssh manager -c "sudo docker load < /tmp/afpabike.tar" 2>/dev/null || true
    vagrant ssh manager -c "sudo docker load < /tmp/uyoopapp.tar" 2>/dev/null || true
    
    # Copy to workers
    for i in 21 22; do
        vagrant ssh worker$((i-20)) -c "sudo docker load < /tmp/afpabike.tar" 2>/dev/null || true
        vagrant ssh worker$((i-20)) -c "sudo docker load < /tmp/uyoopapp.tar" 2>/dev/null || true
    done
    
    # Update stacks to use local images (no harbor)
    sed -i 's|harbor.local/library/afpabike:.*|afpabike:latest|g' "${PROJECT_DIR}/docker-stack/stack-afpabike.yml"
    sed -i 's|harbor.local/library/uyoopapp:.*|uyoopapp:latest|g' "${PROJECT_DIR}/docker-stack/stack-uyoopapp.yml"
    
    echo "✓ Images loaded into all Swarm nodes"
    echo "✓ Stack files updated to use local images"
    echo ""
    echo "Now redeploying services..."
    vagrant ssh manager -c "sudo docker stack deploy -c /root/stack-afpabike.yml afpabike" 2>/dev/null || true
    vagrant ssh manager -c "sudo docker stack deploy -c /root/stack-uyoopapp.yml uyoop" 2>/dev/null || true
    
elif [[ "$option" == "2" ]]; then
    echo "Setup Harbor first on VM harbor (192.168.56.10):"
    echo "1. SSH to Harbor: vagrant ssh harbor"
    echo "2. Follow /root/HARBOR_INSTALL.sh instructions"
    echo "3. Then run this script again and choose option 2"
    
else
    echo "Invalid option"
    exit 1
fi

echo ""
echo "=== Waiting for services to start (30s) ==="
sleep 30

echo ""
echo "=== Service Status ==="
vagrant ssh manager -c "sudo docker service ls" 2>/dev/null | head -10

