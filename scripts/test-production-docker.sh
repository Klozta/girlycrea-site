#!/bin/bash

# =============================================================================
# Script de test pour Docker Production Setup
# GirlyCrea - Vérifie que tous les services fonctionnent
# =============================================================================

set -e

echo "=========================================="
echo "  🐳 Test Docker Production Setup"
echo "=========================================="
echo ""

# Couleurs
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Fonction de test
test_endpoint() {
    local name=$1
    local url=$2
    local expected_status=${3:-200}
    
    echo -n "Testing $name... "
    
    if response=$(curl -s -w "\n%{http_code}" "$url" 2>/dev/null); then
        http_code=$(echo "$response" | tail -n1)
        body=$(echo "$response" | head -n-1)
        
        if [ "$http_code" = "$expected_status" ]; then
            echo -e "${GREEN}✅ OK${NC} (HTTP $http_code)"
            return 0
        else
            echo -e "${RED}❌ FAILED${NC} (HTTP $http_code, expected $expected_status)"
            echo "Response: $body"
            return 1
        fi
    else
        echo -e "${RED}❌ FAILED${NC} (Connection error)"
        return 1
    fi
}

# Vérifier que Docker Compose est installé
if ! command -v docker-compose &> /dev/null && ! command -v docker &> /dev/null; then
    echo -e "${RED}❌ Docker/Docker Compose non installé${NC}"
    exit 1
fi

# Vérifier que les containers sont en cours d'exécution
echo "📦 Vérification des containers..."
containers=("girlycrea-postgres-prod" "girlycrea-redis-prod" "girlycrea-backend-prod" "girlycrea-frontend-prod")
all_running=true

for container in "${containers[@]}"; do
    if docker ps --format '{{.Names}}' | grep -q "^${container}$"; then
        echo -e "  ${GREEN}✅${NC} $container est en cours d'exécution"
    else
        echo -e "  ${RED}❌${NC} $container n'est PAS en cours d'exécution"
        all_running=false
    fi
done

if [ "$all_running" = false ]; then
    echo ""
    echo -e "${YELLOW}⚠️  Certains containers ne sont pas démarrés.${NC}"
    echo "Lancez: docker-compose -f docker-compose.prod.yml up -d"
    exit 1
fi

echo ""
echo "⏳ Attente que les services soient prêts (10 secondes)..."
sleep 10

echo ""
echo "=========================================="
echo "  🧪 Tests des endpoints"
echo "=========================================="
echo ""

# Tests
failed=0

# Test 1: Health check backend
if ! test_endpoint "Backend Health" "http://localhost:3001/health" 200; then
    failed=$((failed + 1))
fi

# Test 2: API Info
if ! test_endpoint "API Info" "http://localhost:3001/api" 200; then
    failed=$((failed + 1))
fi

# Test 3: Frontend
if ! test_endpoint "Frontend" "http://localhost:3000" 200; then
    failed=$((failed + 1))
fi

# Test 4: PostgreSQL (via backend health detailed)
if response=$(curl -s http://localhost:3001/health/detailed 2>/dev/null); then
    if echo "$response" | grep -q '"database".*"status":"up"'; then
        echo -e "PostgreSQL via Backend... ${GREEN}✅ OK${NC}"
    else
        echo -e "PostgreSQL via Backend... ${RED}❌ FAILED${NC}"
        failed=$((failed + 1))
    fi
else
    echo -e "PostgreSQL via Backend... ${RED}❌ FAILED${NC} (Connection error)"
    failed=$((failed + 1))
fi

# Test 5: Redis (via backend health detailed)
if response=$(curl -s http://localhost:3001/health/detailed 2>/dev/null); then
    if echo "$response" | grep -q '"redis"'; then
        echo -e "Redis via Backend... ${GREEN}✅ OK${NC}"
    else
        echo -e "Redis via Backend... ${YELLOW}⚠️  Non vérifié${NC}"
    fi
else
    echo -e "Redis via Backend... ${RED}❌ FAILED${NC} (Connection error)"
    failed=$((failed + 1))
fi

echo ""
echo "=========================================="
if [ $failed -eq 0 ]; then
    echo -e "  ${GREEN}✅ Tous les tests sont passés !${NC}"
    echo "=========================================="
    echo ""
    echo "🎉 GirlyCrea est prêt pour la production !"
    echo ""
    echo "📋 URLs disponibles:"
    echo "  - Frontend: http://localhost:3000"
    echo "  - Backend API: http://localhost:3001"
    echo "  - Health Check: http://localhost:3001/health"
    echo ""
    exit 0
else
    echo -e "  ${RED}❌ $failed test(s) ont échoué${NC}"
    echo "=========================================="
    echo ""
    echo "🔍 Vérifiez les logs:"
    echo "  docker-compose -f docker-compose.prod.yml logs backend"
    echo "  docker-compose -f docker-compose.prod.yml logs frontend"
    echo ""
    exit 1
fi
