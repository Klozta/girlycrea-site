#!/bin/bash

# 🎀 GirlyCrea - Docker Staging Management Script
# Automatise les commandes Docker Compose pour staging local

set -e

# Couleurs pour l'output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
DOCKER_COMPOSE_FILE="docker-compose.staging.yml"
ENV_FILE=".env.docker"
PROJECT_NAME="girlycrea"

# ========================================
# HELPERS
# ========================================

log_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

log_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

log_error() {
    echo -e "${RED}❌ $1${NC}"
}

log_warn() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

check_docker() {
    if ! command -v docker &> /dev/null; then
        log_error "Docker n'est pas installé. Visite https://docker.com"
        exit 1
    fi
    
    if ! docker ps &> /dev/null; then
        log_error "Docker daemon n'est pas en cours d'exécution"
        exit 1
    fi
    
    log_success "Docker est prêt"
}

check_env() {
    if [ ! -f "$ENV_FILE" ]; then
        log_error "Fichier $ENV_FILE manquant"
        log_info "Crée-le avec: cp env.docker.template $ENV_FILE"
        exit 1
    fi
    log_success "Fichier $ENV_FILE trouvé"
}

# ========================================
# COMMANDS
# ========================================

cmd_help() {
    cat << EOF
🎀 GirlyCrea Docker Staging - Commandes Disponibles

Usage: ./docker-staging.sh [commande]

Commandes:
  build      Construire les images Docker
  up         Démarrer tous les services
  down       Arrêter tous les services
  logs       Afficher les logs (suivi en temps réel)
  status     Afficher l'état des services
  restart    Redémarrer un service (optionnel: [service])
  health     Tester le health endpoint
  clean      Arrêter et supprimer tout (données perdues!)
  help       Afficher cette aide

Exemples:
  ./docker-staging.sh build
  ./docker-staging.sh up
  ./docker-staging.sh logs backend
  ./docker-staging.sh restart backend
  ./docker-staging.sh health
EOF
}

cmd_build() {
    log_info "Construction des images Docker..."
    check_docker
    check_env
    
    if docker-compose -f "$DOCKER_COMPOSE_FILE" build; then
        log_success "Images construites avec succès"
    else
        log_error "Erreur lors de la construction des images"
        exit 1
    fi
}

cmd_up() {
    log_info "Démarrage des services..."
    check_docker
    check_env
    
    if docker-compose -f "$DOCKER_COMPOSE_FILE" up -d; then
        log_success "Services démarrés"
        log_info "Attends 30-40 secondes pour que PostgreSQL démarre..."
        log_info "Puis teste avec: ./docker-staging.sh health"
    else
        log_error "Erreur lors du démarrage des services"
        exit 1
    fi
}

cmd_down() {
    log_warn "Arrêt des services..."
    
    if docker-compose -f "$DOCKER_COMPOSE_FILE" down; then
        log_success "Services arrêtés"
    else
        log_error "Erreur lors de l'arrêt des services"
        exit 1
    fi
}

cmd_logs() {
    check_docker
    
    local service=${1:-""}
    
    if [ -z "$service" ]; then
        log_info "Affichage des logs de tous les services"
        docker-compose -f "$DOCKER_COMPOSE_FILE" logs -f
    else
        log_info "Affichage des logs de $service"
        docker-compose -f "$DOCKER_COMPOSE_FILE" logs -f "$service"
    fi
}

cmd_status() {
    check_docker
    
    log_info "État des services:"
    docker-compose -f "$DOCKER_COMPOSE_FILE" ps
}

cmd_restart() {
    check_docker
    
    local service=${1:-""}
    
    if [ -z "$service" ]; then
        log_warn "Redémarrage de tous les services..."
        docker-compose -f "$DOCKER_COMPOSE_FILE" restart
    else
        log_warn "Redémarrage de $service..."
        docker-compose -f "$DOCKER_COMPOSE_FILE" restart "$service"
    fi
    
    log_success "Service(s) redémarré(s)"
}

cmd_health() {
    log_info "Test du health endpoint..."
    
    # Attendre que le serveur soit prêt
    sleep 2
    
    # Tester 5 fois avec 5 secondes d'intervalle
    for i in {1..5}; do
        if curl -s http://localhost/health > /dev/null; then
            response=$(curl -s http://localhost/health)
            log_success "Health endpoint répond:"
            echo "$response" | python3 -m json.tool 2>/dev/null || echo "$response"
            return 0
        fi
        log_warn "Tentative $i/5 échouée, réessai..."
        sleep 5
    done
    
    log_error "Health endpoint ne répond pas après 5 tentatives"
    log_info "Vérife les logs: ./docker-staging.sh logs backend"
    exit 1
}

cmd_clean() {
    log_warn "⚠️  ATTENTION: Cela va SUPPRIMER tous les containers et volumes!"
    read -p "Tapez 'oui' pour confirmer: " confirm
    
    if [ "$confirm" != "oui" ]; then
        log_info "Opération annulée"
        return
    fi
    
    log_warn "Suppression de tous les services et volumes..."
    docker-compose -f "$DOCKER_COMPOSE_FILE" down -v
    
    log_success "Tous les services et volumes ont été supprimés"
}

# ========================================
# MAIN
# ========================================

main() {
    local command=${1:-"help"}
    
    case "$command" in
        help)
            cmd_help
            ;;
        build)
            cmd_build
            ;;
        up)
            cmd_up
            ;;
        down)
            cmd_down
            ;;
        logs)
            cmd_logs "$2"
            ;;
        status)
            cmd_status
            ;;
        restart)
            cmd_restart "$2"
            ;;
        health)
            cmd_health
            ;;
        clean)
            cmd_clean
            ;;
        *)
            log_error "Commande inconnue: $command"
            log_info "Utilise './docker-staging.sh help' pour l'aide"
            exit 1
            ;;
    esac
}

main "$@"
