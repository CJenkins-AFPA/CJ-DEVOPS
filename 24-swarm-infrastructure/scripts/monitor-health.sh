#!/bin/bash

################################################################################
# monitor-health.sh - Monitor Docker Swarm Cluster Health
#
# Purpose:
#   Monitor the health and status of a Docker Swarm cluster
#   Check nodes, services, tasks, and resource utilization
#
# Usage:
#   bash scripts/monitor-health.sh
#   bash scripts/monitor-health.sh continuous  # Continuous monitoring
#
################################################################################

set -euo pipefail

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Configuration
MONITOR_INTERVAL=${MONITOR_INTERVAL:-5}
CONTINUOUS=${1:-false}

# ============================================================================
# Functions
# ============================================================================

header() {
    echo -e "\n${BLUE}╔════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${BLUE}║ $@${NC}"
    echo -e "${BLUE}╚════════════════════════════════════════════════════════════╝${NC}\n"
}

section() {
    echo -e "\n${YELLOW}>>> $@${NC}"
}

success() {
    echo -e "${GREEN}✓ $@${NC}"
}

error() {
    echo -e "${RED}✗ $@${NC}"
}

info() {
    echo -e "${BLUE}ℹ $@${NC}"
}

# ============================================================================
# Health Checks
# ============================================================================

check_swarm_status() {
    section "Swarm Status"
    
    if docker info | grep -q "Swarm: active"; then
        success "Swarm is active"
        docker swarm ca --quiet
    else
        error "Swarm is not active"
        return 1
    fi
}

check_nodes() {
    section "Cluster Nodes"
    
    local ready_nodes=$(docker node ls --filter "status=ready" --quiet | wc -l)
    local total_nodes=$(docker node ls --quiet | wc -l)
    
    if [[ $ready_nodes -eq $total_nodes ]]; then
        success "All $total_nodes nodes are ready"
    else
        error "$ready_nodes/$total_nodes nodes are ready"
    fi
    
    docker node ls --no-trunc
}

check_services() {
    section "Services Status"
    
    local service_count=$(docker service ls --quiet | wc -l)
    
    if [[ $service_count -gt 0 ]]; then
        info "Found $service_count services"
        docker service ls
    else
        info "No services deployed"
    fi
}

check_tasks() {
    section "Task Status"
    
    local running_tasks=$(docker service ps -a --filter "desired-state=running" --quiet 2>/dev/null | wc -l)
    local failed_tasks=$(docker service ps -a --filter "desired-state=shutdown" --quiet 2>/dev/null | wc -l)
    
    success "Running tasks: $running_tasks"
    
    if [[ $failed_tasks -gt 0 ]]; then
        error "Failed/shutdown tasks: $failed_tasks"
    fi
    
    # Show failed tasks if any
    if [[ $failed_tasks -gt 0 ]]; then
        docker service ps -a --filter "desired-state=shutdown"
    fi
}

check_networks() {
    section "Overlay Networks"
    
    local overlay_networks=$(docker network ls --filter "driver=overlay" --quiet | wc -l)
    
    if [[ $overlay_networks -gt 0 ]]; then
        success "Found $overlay_networks overlay networks"
        docker network ls --filter "driver=overlay"
    else
        info "No overlay networks"
    fi
}

check_volumes() {
    section "Docker Volumes"
    
    local volume_count=$(docker volume ls --quiet | wc -l)
    
    if [[ $volume_count -gt 0 ]]; then
        success "Found $volume_count volumes"
        docker volume ls
    else
        info "No volumes"
    fi
}

check_resources() {
    section "Node Resources"
    
    docker node ls --format "table {{.ID}}\t{{.Hostname}}\t{{.Status}}\t{{.Availability}}\t{{.ManagerStatus}}"
    
    echo ""
    docker stats --no-stream --format "table {{.Container}}\t{{.CPUPerc}}\t{{.MemUsage}}" 2>/dev/null | head -10 || info "No running containers"
}

check_logs() {
    section "Recent Docker Logs (last 5 lines per service)"
    
    local services=$(docker service ls --quiet)
    
    if [[ -z "$services" ]]; then
        info "No services to check"
        return
    fi
    
    for service in $services; do
        local service_name=$(docker service ls --filter "id=$service" --format "{{.Name}}")
        echo -e "\n${BLUE}Service: $service_name${NC}"
        docker service logs "$service_name" --tail 5 2>/dev/null || echo "No logs available"
    done
}

# ============================================================================
# Main
# ============================================================================

main() {
    if [[ "$CONTINUOUS" == "continuous" ]]; then
        while true; do
            clear
            header "Docker Swarm Health Monitor (Updated every ${MONITOR_INTERVAL}s)"
            
            check_swarm_status
            check_nodes
            check_services
            check_tasks
            check_networks
            check_resources
            
            echo -e "\n${BLUE}Next update in ${MONITOR_INTERVAL}s... (Ctrl+C to stop)${NC}"
            sleep "$MONITOR_INTERVAL"
        done
    else
        header "Docker Swarm Health Check"
        
        check_swarm_status || exit 1
        check_nodes
        check_services
        check_tasks
        check_networks
        check_volumes
        check_resources
        
        echo -e "\n${GREEN}✅ Health check completed${NC}\n"
    fi
}

main
