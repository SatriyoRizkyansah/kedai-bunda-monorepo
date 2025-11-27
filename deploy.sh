#!/bin/bash

# ================================
# Kedai Bunda - Deployment Script
# ================================

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Functions
log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if docker is running
check_docker() {
    if ! docker info > /dev/null 2>&1; then
        log_error "Docker is not running. Please start Docker first."
        exit 1
    fi
    log_info "Docker is running ✓"
}

# Build images
build() {
    log_info "Building Docker images..."
    docker compose build --no-cache
    log_info "Build completed ✓"
}

# Start services
start() {
    log_info "Starting services..."
    docker compose up -d
    log_info "Services started ✓"
    
    # Wait for services to be ready
    log_info "Waiting for services to be healthy..."
    sleep 10
    
    # Run migrations
    log_info "Running database migrations..."
    docker compose exec -T api php artisan migrate --force
    
    # Cache config
    log_info "Caching configuration..."
    docker compose exec -T api php artisan config:cache
    docker compose exec -T api php artisan route:cache
    docker compose exec -T api php artisan view:cache
    
    log_info "All services are up and running! ✓"
}

# Stop services
stop() {
    log_info "Stopping services..."
    docker compose down
    log_info "Services stopped ✓"
}

# Restart services
restart() {
    stop
    start
}

# View logs
logs() {
    docker compose logs -f
}

# Fresh install (reset everything)
fresh() {
    log_warn "This will delete all data and start fresh!"
    read -p "Are you sure? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        log_info "Stopping and removing all containers..."
        docker compose down -v
        
        log_info "Building fresh images..."
        docker compose build --no-cache
        
        log_info "Starting services..."
        docker compose up -d
        
        sleep 10
        
        log_info "Running fresh migrations with seed..."
        docker compose exec -T api php artisan migrate:fresh --seed --force
        
        log_info "Generating JWT secret..."
        docker compose exec -T api php artisan jwt:secret --force
        
        log_info "Fresh install completed! ✓"
    else
        log_info "Cancelled."
    fi
}

# Update (pull and restart)
update() {
    log_info "Pulling latest changes..."
    git pull origin main
    
    log_info "Pulling latest images..."
    docker compose pull
    
    log_info "Restarting services..."
    docker compose up -d --remove-orphans
    
    log_info "Running migrations..."
    docker compose exec -T api php artisan migrate --force
    
    log_info "Caching configuration..."
    docker compose exec -T api php artisan config:cache
    docker compose exec -T api php artisan route:cache
    docker compose exec -T api php artisan view:cache
    
    log_info "Cleaning up..."
    docker image prune -f
    
    log_info "Update completed! ✓"
}

# Status check
status() {
    log_info "Checking services status..."
    docker compose ps
}

# Shell into container
shell() {
    case $1 in
        api)
            docker compose exec api sh
            ;;
        web)
            docker compose exec web sh
            ;;
        *)
            log_error "Usage: $0 shell [api|web]"
            exit 1
            ;;
    esac
}

# Artisan command
artisan() {
    docker compose exec api php artisan "$@"
}

# Help
help() {
    echo "================================"
    echo "Kedai Bunda Deployment Script"
    echo "================================"
    echo ""
    echo "Usage: ./deploy.sh [command]"
    echo ""
    echo "Commands:"
    echo "  build     Build Docker images"
    echo "  start     Start all services"
    echo "  stop      Stop all services"
    echo "  restart   Restart all services"
    echo "  logs      View logs (follow mode)"
    echo "  fresh     Fresh install (resets all data)"
    echo "  update    Pull & update services"
    echo "  status    Check services status"
    echo "  shell     Shell into container (api|web)"
    echo "  artisan   Run artisan command"
    echo "  help      Show this help"
    echo ""
    echo "Examples:"
    echo "  ./deploy.sh start"
    echo "  ./deploy.sh shell api"
    echo "  ./deploy.sh artisan migrate"
}

# Main
check_docker

case ${1:-help} in
    build)
        build
        ;;
    start)
        start
        ;;
    stop)
        stop
        ;;
    restart)
        restart
        ;;
    logs)
        logs
        ;;
    fresh)
        fresh
        ;;
    update)
        update
        ;;
    status)
        status
        ;;
    shell)
        shell $2
        ;;
    artisan)
        shift
        artisan "$@"
        ;;
    help|*)
        help
        ;;
esac
