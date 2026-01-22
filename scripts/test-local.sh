#!/bin/bash
# Script de test santé système local
# Usage: bash scripts/test-local.sh

set -e

echo "🧪 Tests Locaux GirlyCrea"
echo "========================="
echo ""

# Couleurs
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# PostgreSQL
echo -n "PostgreSQL: "
if psql -U girlycrea_user -d girlycrea -c "SELECT 1;" > /dev/null 2>&1; then
    echo -e "${GREEN}✅ OK${NC}"
    # Compter les tables
    TABLE_COUNT=$(psql -U girlycrea_user -d girlycrea -t -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public';" | xargs)
    echo "   Tables: $TABLE_COUNT"
else
    echo -e "${RED}❌ ERREUR${NC}"
    echo "   Vérifier: docker-compose -f docker-compose.local.yml ps"
fi

# Redis
echo -n "Redis: "
if redis-cli ping > /dev/null 2>&1; then
    echo -e "${GREEN}✅ OK${NC}"
    KEY_COUNT=$(redis-cli DBSIZE)
    echo "   Clés: $KEY_COUNT"
else
    echo -e "${RED}❌ ERREUR${NC}"
    echo "   Vérifier: docker-compose -f docker-compose.local.yml ps"
fi

# API Backend
echo -n "API Backend: "
if curl -s http://localhost:3001/health > /dev/null 2>&1; then
    echo -e "${GREEN}✅ OK${NC}"
    RESPONSE=$(curl -s http://localhost:3001/health)
    echo "   Response: $RESPONSE"
else
    echo -e "${RED}❌ ERREUR${NC}"
    echo "   Vérifier: npm run dev (backend)"
fi

# Frontend
echo -n "Frontend: "
if curl -s http://localhost:3000 > /dev/null 2>&1; then
    echo -e "${GREEN}✅ OK${NC}"
else
    echo -e "${RED}❌ ERREUR${NC}"
    echo "   Vérifier: cd frontend && npm run dev"
fi

# Ports utilisés
echo ""
echo "Ports utilisés:"
echo -n "   Port 5432 (PostgreSQL): "
if lsof -i :5432 > /dev/null 2>&1; then
    echo -e "${GREEN}✅${NC}"
else
    echo -e "${RED}❌${NC}"
fi

echo -n "   Port 6379 (Redis): "
if lsof -i :6379 > /dev/null 2>&1; then
    echo -e "${GREEN}✅${NC}"
else
    echo -e "${RED}❌${NC}"
fi

echo -n "   Port 3001 (Backend): "
if lsof -i :3001 > /dev/null 2>&1; then
    echo -e "${GREEN}✅${NC}"
else
    echo -e "${RED}❌${NC}"
fi

echo -n "   Port 3000 (Frontend): "
if lsof -i :3000 > /dev/null 2>&1; then
    echo -e "${GREEN}✅${NC}"
else
    echo -e "${RED}❌${NC}"
fi

echo ""
echo "✅ Tests terminés"
echo ""
echo "📋 Prochaines étapes:"
echo "   1. Vérifier que tous les services sont ✅"
echo "   2. Tester l'application dans le navigateur: http://localhost:3000"
echo "   3. Tester l'API: curl http://localhost:3001/api/products"
echo "   4. Une fois tout OK localement, migrer vers le VPS"



