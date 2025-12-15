#!/bin/bash

################################################################################
# build-push.sh - Intelligent Docker Build & Push Script
# 
# Purpose:
#   - Récupère le commit hash (7 premiers caractères)
#   - Récupère la date/heure ISO
#   - Détecte la branche git
#   - Génère un tag cohérent (dev/prod/hotfix)
#   - Build l'image Docker
#   - Applique tags (specific + latest)
#   - Push vers Harbor
#   - Gère les erreurs et retry
#
# Usage:
#   ./build-push.sh <image-name> [registry-url] [dockerfile-path]
#
# Examples:
#   ./build-push.sh myapp
#   ./build-push.sh myapp harbor.local/project
#   ./build-push.sh myapp harbor.local/project ./Dockerfile.prod
#
# Environment Variables (optional):
#   REGISTRY_URL       - Harbor registry URL (default: harbor.local)
#   REGISTRY_USER      - Registry username (default: admin)
#   REGISTRY_PASSWORD  - Registry password (required if private)
#   LOG_FILE          - Log file path (default: ./build-push.log)
#   RETRY_COUNT       - Number of retries (default: 3)
#   DRY_RUN           - Don't execute, just show (default: false)
#
################################################################################

set -euo pipefail

# ============================================================================
# Configuration
# ============================================================================

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
LOG_FILE="${LOG_FILE:-${SCRIPT_DIR}/build-push.log}"
RETRY_COUNT="${RETRY_COUNT:-3}"
DRY_RUN="${DRY_RUN:-false}"
TIMESTAMP="$(date -u +'%Y-%m-%d-%H%M%S')"

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# ============================================================================
# Logging Functions
# ============================================================================

log() {
    local level="$1"
    shift
    local message="$@"
    local timestamp="$(date '+%Y-%m-%d %H:%M:%S')"
    
    echo "[${timestamp}] [${level}] ${message}" | tee -a "${LOG_FILE}"
}

log_info() {
    echo -e "${BLUE}[INFO]${NC} $@" | tee -a "${LOG_FILE}"
}

log_success() {
    echo -e "${GREEN}[✓]${NC} $@" | tee -a "${LOG_FILE}"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $@" | tee -a "${LOG_FILE}"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $@" | tee -a "${LOG_FILE}"
}

log_debug() {
    if [[ "${DEBUG:-false}" == "true" ]]; then
        echo -e "${BLUE}[DEBUG]${NC} $@" | tee -a "${LOG_FILE}"
    fi
}

# ============================================================================
# Utility Functions
# ============================================================================

print_header() {
    echo -e "\n${BLUE}=================================================================================${NC}"
    echo -e "${BLUE}$@${NC}"
    echo -e "${BLUE}=================================================================================${NC}\n" | tee -a "${LOG_FILE}"
}

print_section() {
    echo -e "\n${YELLOW}>>> $@${NC}" | tee -a "${LOG_FILE}"
}

# ============================================================================
# Validation Functions
# ============================================================================

check_prerequisites() {
    print_section "Vérification des pré-requis"
    
    local required_commands=("git" "docker" "date")
    
    for cmd in "${required_commands[@]}"; do
        if ! command -v "$cmd" &> /dev/null; then
            log_error "Commande requise '$cmd' non trouvée"
            return 1
        fi
        log_success "✓ $cmd trouvé"
    done
    
    # Check if in git repository
    if ! git rev-parse --git-dir > /dev/null 2>&1; then
        log_error "Pas dans un repository git"
        return 1
    fi
    log_success "✓ Repository git détecté"
    
    # Check Docker daemon
    if ! docker ps &> /dev/null; then
        log_error "Impossible de se connecter au daemon Docker"
        return 1
    fi
    log_success "✓ Docker daemon accessible"
    
    return 0
}

check_dockerfile() {
    local dockerfile_path="$1"
    
    if [[ ! -f "$dockerfile_path" ]]; then
        log_error "Dockerfile non trouvé: $dockerfile_path"
        return 1
    fi
    
    log_success "Dockerfile trouvé: $dockerfile_path"
    return 0
}

# ============================================================================
# Git Information Functions
# ============================================================================

get_commit_hash() {
    git rev-parse --short=7 HEAD 2>/dev/null || echo "unknown"
}

get_branch_name() {
    git rev-parse --abbrev-ref HEAD 2>/dev/null || echo "unknown"
}

get_git_status() {
    if [[ -n $(git status --porcelain) ]]; then
        echo "dirty"
    else
        echo "clean"
    fi
}

get_current_tag() {
    git describe --tags --exact-match 2>/dev/null || echo ""
}

# ============================================================================
# Tag Generation Functions
# ============================================================================

generate_tag() {
    local branch="$1"
    local commit="$2"
    local timestamp="$3"
    local current_tag="$4"
    local git_status="$5"
    
    local tag=""
    local version_suffix="-${commit}-${timestamp}"
    
    # Si on est sur une version tag exacte
    if [[ -n "$current_tag" ]]; then
        tag="${current_tag}${version_suffix}"
        log_info "📌 Tag de version détecté: ${current_tag}" >&2
    
    # Production branch (main, release/*)
    elif [[ "$branch" =~ ^(main|master|production|release/.*)$ ]]; then
        tag="prod${version_suffix}"
        log_info "🏭 Branch production détectée: $branch" >&2
    
    # Develop branch
    elif [[ "$branch" =~ ^develop$ ]]; then
        tag="dev-dev${version_suffix}"
        log_info "🔧 Branch develop détectée" >&2
    
    # Feature branch
    elif [[ "$branch" =~ ^feature/.* ]]; then
        local feature_name="${branch#feature/}"
        feature_name="${feature_name//\//-}"  # Replace / with -
        feature_name="${feature_name%%-*}"    # Keep only first part
        tag="feature-${feature_name}${version_suffix}"
        log_info "✨ Branch feature détectée: $branch" >&2
    
    # Hotfix branch
    elif [[ "$branch" =~ ^hotfix/.* ]]; then
        local hotfix_name="${branch#hotfix/}"
        hotfix_name="${hotfix_name//\//-}"
        tag="hotfix-${hotfix_name}${version_suffix}"
        log_info "🔥 Branch hotfix détectée: $branch" >&2
    
    # Bugfix branch
    elif [[ "$branch" =~ ^bugfix/.* ]]; then
        local bugfix_name="${branch#bugfix/}"
        bugfix_name="${bugfix_name//\//-}"
        tag="bugfix-${bugfix_name}${version_suffix}"
        log_info "🐛 Branch bugfix détectée: $branch" >&2
    
    # Default: custom branch name
    else
        local sanitized_branch="${branch//\//-}"
        tag="branch-${sanitized_branch}${version_suffix}"
        log_warning "Branch custom détectée: $branch" >&2
    fi
    
    # Add dirty flag if needed
    if [[ "$git_status" == "dirty" ]]; then
        tag="${tag}-dirty"
        log_warning "⚠️  Modifications locales détectées (tag: dirty)" >&2
    fi
    
    echo "$tag"
}

# ============================================================================
# Docker Functions
# ============================================================================

docker_login() {
    local registry_url="$1"
    local registry_user="$2"
    local registry_password="$3"
    
    print_section "Connexion à Harbor"
    
    if [[ -z "$registry_password" ]]; then
        log_info "Pas de mot de passe fourni, en utilisant ~/.docker/config.json existant"
        return 0
    fi
    
    log_info "Authentification à $registry_url..."
    
    if [[ "$DRY_RUN" == "true" ]]; then
        log_debug "[DRY-RUN] docker login -u $registry_user -p ******* $registry_url"
        return 0
    fi
    
    if echo "$registry_password" | docker login -u "$registry_user" --password-stdin "$registry_url" &>/dev/null; then
        log_success "✓ Authentification réussie"
        return 0
    else
        log_error "Échec de l'authentification Harbor"
        return 1
    fi
}

docker_build() {
    local dockerfile_path="$1"
    local image_name="$2"
    local tag="$3"
    local build_context="${4:-.}"
    
    print_section "Construction de l'image Docker"
    
    local full_image="${image_name}:${tag}"
    
    log_info "Dockerfile: $dockerfile_path"
    log_info "Image: $full_image"
    log_info "Contexte: $build_context"
    
    if [[ "$DRY_RUN" == "true" ]]; then
        log_debug "[DRY-RUN] docker build -f $dockerfile_path -t $full_image $build_context"
        return 0
    fi
    
    if docker build -f "$dockerfile_path" -t "$full_image" "$build_context"; then
        log_success "✓ Image construite: $full_image"
        return 0
    else
        log_error "Échec de la construction Docker"
        return 1
    fi
}

docker_tag_latest() {
    local image_name="$1"
    local tag="$2"
    
    local current_image="${image_name}:${tag}"
    local latest_image="${image_name}:latest"
    
    log_info "Tagging en tant que latest: $latest_image"
    
    if [[ "$DRY_RUN" == "true" ]]; then
        log_debug "[DRY-RUN] docker tag $current_image $latest_image"
        return 0
    fi
    
    if docker tag "$current_image" "$latest_image"; then
        log_success "✓ Tag 'latest' appliqué"
        return 0
    else
        log_error "Échec du tagging 'latest'"
        return 1
    fi
}

docker_push_with_retry() {
    local image_name="$1"
    local tag="$2"
    local retry_count="$3"
    
    local full_image="${image_name}:${tag}"
    local attempt=1
    
    while [[ $attempt -le $retry_count ]]; do
        log_info "Push [$attempt/$retry_count] : $full_image"
        
        if [[ "$DRY_RUN" == "true" ]]; then
            log_debug "[DRY-RUN] docker push $full_image"
            return 0
        fi
        
        if docker push "$full_image"; then
            log_success "✓ Push réussi: $full_image"
            return 0
        fi
        
        if [[ $attempt -lt $retry_count ]]; then
            local wait_time=$((attempt * 5))
            log_warning "Push échoué. Nouvelle tentative dans ${wait_time}s..."
            sleep "$wait_time"
        fi
        
        ((attempt++))
    done
    
    log_error "Échec du push après $retry_count tentatives"
    return 1
}

docker_push_latest_with_retry() {
    local image_name="$1"
    local retry_count="$2"
    
    local full_image="${image_name}:latest"
    local attempt=1
    
    while [[ $attempt -le $retry_count ]]; do
        log_info "Push latest [$attempt/$retry_count] : $full_image"
        
        if [[ "$DRY_RUN" == "true" ]]; then
            log_debug "[DRY-RUN] docker push $full_image"
            return 0
        fi
        
        if docker push "$full_image"; then
            log_success "✓ Push latest réussi: $full_image"
            return 0
        fi
        
        if [[ $attempt -lt $retry_count ]]; then
            local wait_time=$((attempt * 5))
            log_warning "Push latest échoué. Nouvelle tentative dans ${wait_time}s..."
            sleep "$wait_time"
        fi
        
        ((attempt++))
    done
    
    log_error "Échec du push latest après $retry_count tentatives"
    return 1
}

# ============================================================================
# Display Information
# ============================================================================

print_info_table() {
    local image_name="$1"
    local registry_url="$2"
    local branch="$3"
    local commit="$4"
    local tag="$5"
    local timestamp="$6"
    local dockerfile_path="$7"
    local git_status="$8"
    
    print_section "Informations du build"
    
    cat << EOF | tee -a "${LOG_FILE}"

📦 Image Information:
   Nom local:      ${image_name}:${tag}
   Registre:       ${registry_url}/${image_name}:${tag}
   Latest:         ${registry_url}/${image_name}:latest

🌿 Git Information:
   Branch:         $branch
   Commit:         $commit
   Status:         $git_status
   Timestamp:      $timestamp
   Dockerfile:     $dockerfile_path

EOF
}

# ============================================================================
# Usage
# ============================================================================

usage() {
    cat << EOF

${BLUE}Usage:${NC} $(basename "$0") <image-name> [registry-url] [dockerfile-path]

${BLUE}Arguments:${NC}
    image-name         Nom de l'image Docker (ex: myapp, backend, api-service)
    registry-url       URL du registre Harbor (défaut: harbor.local)
                       Format: registry.com/project
    dockerfile-path    Chemin vers le Dockerfile (défaut: ./Dockerfile)

${BLUE}Options (Environment Variables):${NC}
    REGISTRY_USER      Utilisateur registry (défaut: admin)
    REGISTRY_PASSWORD  Mot de passe registry (optionnel)
    LOG_FILE          Chemin du fichier log (défaut: ./build-push.log)
    RETRY_COUNT       Nombre de tentatives (défaut: 3)
    DRY_RUN           Mode simulation (défaut: false)
    DEBUG             Afficher messages debug (défaut: false)

${BLUE}Exemples:${NC}

  # Build et push avec defaults
  ./build-push.sh myapp

  # Spécifier une autre registry
  ./build-push.sh backend my-registry.com/myproject

  # Dockerfile personnalisé
  ./build-push.sh api ./Dockerfile.prod

  # Avec authentification
  REGISTRY_PASSWORD=secret123 ./build-push.sh myapp harbor.local

  # Mode dry-run (test)
  DRY_RUN=true ./build-push.sh myapp

${BLUE}Tags générés automatiquement:${NC}

  • Branch main/master/production
    → prod-<commit>-<timestamp>
    → prod-<commit>-<timestamp>-latest

  • Branch develop
    → dev-dev-<commit>-<timestamp>
    → dev-dev-<commit>-<timestamp>-latest

  • Branch feature/*
    → feature-<name>-<commit>-<timestamp>
    → feature-<name>-<commit>-<timestamp>-latest

  • Branch hotfix/*
    → hotfix-<issue>-<commit>-<timestamp>
    → hotfix-<issue>-<commit>-<timestamp>-latest

  • Branch bugfix/*
    → bugfix-<name>-<commit>-<timestamp>
    → bugfix-<name>-<commit>-<timestamp>-latest

  • Avec modifications locales
    → tag-*-dirty (pour identifier les builds locaux)

EOF
}

# ============================================================================
# Main Function
# ============================================================================

main() {
    print_header "🐳 Docker Build & Push Automation"
    
    # ========================================================================
    # Parse Arguments
    # ========================================================================
    
    if [[ $# -lt 1 ]]; then
        usage
        exit 1
    fi
    
    local image_name="$1"
    local registry_url="${2:-harbor.local}"
    local dockerfile_path="${3:-./Dockerfile}"
    local registry_user="${REGISTRY_USER:-admin}"
    local registry_password="${REGISTRY_PASSWORD:-}"
    
    # ========================================================================
    # Pre-flight Checks
    # ========================================================================
    
    if ! check_prerequisites; then
        log_error "Vérification des pré-requis échouée"
        exit 1
    fi
    
    if ! check_dockerfile "$dockerfile_path"; then
        exit 1
    fi
    
    # ========================================================================
    # Gather Information
    # ========================================================================
    
    local branch=$(get_branch_name)
    local commit=$(get_commit_hash)
    local git_status=$(get_git_status)
    local current_tag=$(get_current_tag)
    local timestamp=$(date -u +'%Y-%m-%d-%H%M%S')
    local tag=$(generate_tag "$branch" "$commit" "$timestamp" "$current_tag" "$git_status")
    
    # ========================================================================
    # Display Configuration
    # ========================================================================
    
    if [[ "$DRY_RUN" == "true" ]]; then
        log_warning "🔄 MODE DRY-RUN ACTIVÉ (pas d'exécution réelle)"
    fi
    
    print_info_table "$image_name" "$registry_url" "$branch" "$commit" "$tag" "$timestamp" "$dockerfile_path" "$git_status"
    
    # ========================================================================
    # Execution
    # ========================================================================
    
    # Login
    if [[ -n "$registry_password" ]] || [[ ! -f ~/.docker/config.json ]]; then
        if ! docker_login "$registry_url" "$registry_user" "$registry_password"; then
            exit 1
        fi
    else
        log_info "Utilisation des credentials Docker existantes"
    fi
    
    # Build
    if ! docker_build "$dockerfile_path" "$image_name" "$tag"; then
        exit 1
    fi
    
    # Tag latest
    if ! docker_tag_latest "$image_name" "$tag"; then
        exit 1
    fi
    
    # Re-tag for registry before push
    local registry_image="${registry_url}/${image_name}"
    log_info "Re-tagging pour registry: $registry_image:$tag"
    if ! docker tag "${image_name}:${tag}" "${registry_image}:${tag}"; then
        log_error "Échec du re-tagging pour registry"
        exit 1
    fi
    
    log_info "Re-tagging latest pour registry: $registry_image:latest"
    if ! docker tag "${image_name}:latest" "${registry_image}:latest"; then
        log_error "Échec du re-tagging latest pour registry"
        exit 1
    fi
    
    # Push specific tag
    if ! docker_push_with_retry "${registry_image}" "$tag" "$RETRY_COUNT"; then
        exit 1
    fi
    
    # Push latest tag
    if ! docker_push_latest_with_retry "${registry_image}" "$RETRY_COUNT"; then
        exit 1
    fi
    
    # ========================================================================
    # Summary
    # ========================================================================
    
    print_header "✅ Succès !"
    
    cat << EOF | tee -a "${LOG_FILE}"

📊 Résumé:
   Image publiée:  ${registry_url}/${image_name}:${tag}
   Latest tag:     ${registry_url}/${image_name}:latest
   
   Build time:     $(date)
   Log file:       ${LOG_FILE}

🎯 Prochaines étapes:
   1. Vérifier dans Harbor Web UI: http://harbor.local
   2. Scanner Trivy pour vulnérabilités
   3. Déployer en Swarm si validé

EOF
    
    return 0
}

# ============================================================================
# Run Main
# ============================================================================

main "$@"
exit $?
