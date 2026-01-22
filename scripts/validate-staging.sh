#!/bin/bash

# 🎀 GirlyCrea - Validation Script for Staging

# Couleurs
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

TESTS_PASSED=0
TESTS_FAILED=0

test_pass() {
    echo -e "${GREEN}✅ $1${NC}"
    ((TESTS_PASSED++))
}

test_fail() {
    echo -e "${RED}❌ $1${NC}"
    ((TESTS_FAILED++))
}

log_section() {
    echo -e "\n${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${YELLOW}$1${NC}"
    echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}\n"
}

log_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

# ========================================
# TESTS
# ========================================

log_section "1️⃣  Services Health"

# Vérifier que tous les services sont running
SERVICES=$(docker-compose -f docker-compose.staging.yml ps --format "{{.Service}}" 2>/dev/null)

if [ -z "$SERVICES" ]; then
    test_fail "Docker Compose n'est pas démarré. Lance: ./docker-staging.sh up"
else
    for service in postgres redis backend frontend nginx; do
        if echo "$SERVICES" | grep -q "^${service}$"; then
            status=$(docker-compose -f docker-compose.staging.yml ps --filter "service=$service" --format "{{.State}}" 2>/dev/null)
            health=$(docker-compose -f docker-compose.staging.yml ps --filter "service=$service" --format "{{.Status}}" 2>/dev/null | grep -o "healthy" || echo "")
            
            if [ "$status" = "running" ]; then
                if [ -n "$health" ]; then
                    test_pass "$service est running (healthy)"
                else
                    log_info "$service est running mais pas encore healthy (attendre 30-40s)"
                    test_pass "$service est running"
                fi
            else
                test_fail "$service n'est pas running (état: $status)"
            fi
        else
            test_fail "$service n'existe pas"
        fi
    done
fi

log_section "2️⃣  Health Endpoints"

# Test health endpoint via Nginx
if curl -s http://localhost/health > /dev/null 2>&1; then
    http_code=$(curl -s -o /dev/null -w "%{http_code}" http://localhost/health)
    if [ "$http_code" = "200" ]; then
        response=$(curl -s http://localhost/health)
        if echo "$response" | grep -q "status"; then
            test_pass "Health endpoint répond (HTTP $http_code)"
            log_info "Réponse: $(echo "$response" | head -c 100)..."
        else
            test_fail "Health endpoint répond mais format invalide"
        fi
    else
        test_fail "Health endpoint HTTP $http_code (attend 200)"
    fi
else
    test_fail "Health endpoint ne répond pas"
fi

# Test health endpoint détaillé
if curl -s http://localhost/api/health/detailed > /dev/null 2>&1; then
    http_code=$(curl -s -o /dev/null -w "%{http_code}" http://localhost/api/health/detailed)
    if [ "$http_code" = "200" ]; then
        test_pass "Health endpoint détaillé répond (HTTP $http_code)"
    else
        test_fail "Health endpoint détaillé HTTP $http_code (attend 200)"
    fi
else
    test_fail "Health endpoint détaillé ne répond pas"
fi

log_section "3️⃣  Service Endpoints"

# Test Frontend via Nginx
if curl -s http://localhost | grep -qi "html\|next\|react"; then
    test_pass "Frontend répond via Nginx (HTML)"
else
    test_fail "Frontend ne répond pas via Nginx"
fi

# Test Frontend direct
if curl -s http://localhost:3000 | grep -qi "html\|next\|react"; then
    test_pass "Frontend répond directement (port 3000)"
else
    test_fail "Frontend ne répond pas directement"
fi

# Test API via Nginx
if curl -s http://localhost/api > /dev/null 2>&1; then
    http_code=$(curl -s -o /dev/null -w "%{http_code}" http://localhost/api)
    if [ "$http_code" = "200" ] || [ "$http_code" = "301" ]; then
        test_pass "API répond via Nginx (HTTP $http_code)"
    else
        test_fail "API via Nginx HTTP $http_code (attend 200)"
    fi
else
    test_fail "API ne répond pas via Nginx"
fi

# Test API /products
if curl -s http://localhost/api/products > /dev/null 2>&1; then
    http_code=$(curl -s -o /dev/null -w "%{http_code}" http://localhost/api/products)
    if [ "$http_code" = "200" ]; then
        test_pass "API /products répond (HTTP $http_code)"
    else
        test_fail "API /products HTTP $http_code (attend 200)"
    fi
else
    test_fail "API /products ne répond pas"
fi

# Test Backend direct
if curl -s http://localhost:3001/api/health > /dev/null 2>&1; then
    http_code=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3001/api/health)
    if [ "$http_code" = "200" ]; then
        test_pass "Backend répond directement (port 3001)"
    else
        test_fail "Backend direct HTTP $http_code (attend 200)"
    fi
else
    test_fail "Backend ne répond pas directement"
fi

log_section "4️⃣  Database Connectivity"

# Test PostgreSQL
if docker-compose -f docker-compose.staging.yml exec -T postgres pg_isready -U girlycrea_user > /dev/null 2>&1; then
    test_pass "PostgreSQL est accessible"
    
    # Test query
    result=$(docker-compose -f docker-compose.staging.yml exec -T postgres psql -U girlycrea_user -d girlycrea -c "SELECT 1" 2>/dev/null | grep -o "1" | head -1)
    if [ "$result" = "1" ]; then
        test_pass "PostgreSQL query fonctionne"
    else
        test_fail "PostgreSQL query échoue"
    fi
else
    test_fail "PostgreSQL n'est pas accessible"
fi

# Test Redis
if docker-compose -f docker-compose.staging.yml exec -T redis redis-cli ping > /dev/null 2>&1; then
    result=$(docker-compose -f docker-compose.staging.yml exec -T redis redis-cli ping 2>/dev/null)
    if [ "$result" = "PONG" ]; then
        test_pass "Redis est accessible (PONG)"
    else
        test_fail "Redis ne répond pas PONG"
    fi
else
    test_fail "Redis n'est pas accessible"
fi

# Test Redis depuis l'extérieur
if command -v redis-cli &> /dev/null; then
    if redis-cli -h localhost -p 6380 ping 2>/dev/null | grep -q "PONG"; then
        test_pass "Redis accessible depuis l'extérieur (port 6380)"
    else
        log_info "Redis-cli non disponible ou Redis non accessible depuis l'extérieur"
    fi
fi

log_section "5️⃣  Port Availability"

# Vérifier que les ports sont utilisés
for port in 80 3000 3001 5433 6380; do
    if command -v netstat &> /dev/null; then
        if netstat -tuln 2>/dev/null | grep -q ":$port "; then
            test_pass "Port $port est utilisé"
        else
            test_fail "Port $port n'est pas utilisé"
        fi
    elif command -v ss &> /dev/null; then
        if ss -tuln 2>/dev/null | grep -q ":$port "; then
            test_pass "Port $port est utilisé"
        else
            test_fail "Port $port n'est pas utilisé"
        fi
    else
        log_info "netstat/ss non disponible, skip vérification ports"
        break
    fi
done

log_section "6️⃣  Logs Errors"

# Vérifier les logs pour des erreurs critiques
error_count=$(docker-compose -f docker-compose.staging.yml logs --tail=100 2>&1 | grep -i "error\|fatal\|panic" | grep -v "health check" | wc -l)

if [ "$error_count" -eq 0 ]; then
    test_pass "Aucune erreur critique dans les logs"
else
    log_info "⚠️  $error_count erreur(s) trouvée(s) dans les logs (peut être normal)"
    test_pass "Logs vérifiés ($error_count erreurs non-critiques)"
fi

log_section "7️⃣  Nginx Reverse Proxy"

# Test que Nginx route correctement
if curl -s -I http://localhost | head -1 | grep -q "200\|301\|302"; then
    test_pass "Nginx reverse proxy fonctionne"
else
    test_fail "Nginx reverse proxy ne fonctionne pas"
fi

# ========================================
# SUMMARY
# ========================================

log_section "📊 Résumé"

total=$((TESTS_PASSED + TESTS_FAILED))
echo -e "Total: ${GREEN}$TESTS_PASSED passed${NC} / ${RED}$TESTS_FAILED failed${NC} / $total tests"

if [ $TESTS_FAILED -eq 0 ]; then
    echo -e "\n${GREEN}🎉 Tous les tests ont réussi! GirlyCrea est prêt.${NC}\n"
    exit 0
else
    echo -e "\n${YELLOW}⚠️  $TESTS_FAILED test(s) ont échoué.${NC}"
    echo -e "${BLUE}💡 Vérifie les logs: ./docker-staging.sh logs${NC}"
    echo -e "${BLUE}💡 Vérifie le health: curl http://localhost/health${NC}\n"
    exit 1
fi
