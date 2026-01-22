#!/bin/bash
# Script pour redémarrer tous les services GirlyCrea
# Usage: bash scripts/restart-all.sh

set -e

echo "🔄 Redémarrage Complet GirlyCrea"
echo "=================================="
echo ""

# Couleurs
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# 1. Arrêter les processus Node.js
echo "1️⃣  Arrêt des processus Node.js..."
pkill -f "tsx.*src/index.ts" 2>/dev/null && echo -e "${GREEN}✅ Backend arrêté${NC}" || echo -e "${YELLOW}⚠️  Backend déjà arrêté${NC}"
pkill -f "next.*dev" 2>/dev/null && echo -e "${GREEN}✅ Frontend arrêté${NC}" || echo -e "${YELLOW}⚠️  Frontend déjà arrêté${NC}"
sleep 2

# 2. Redémarrer PostgreSQL
echo ""
echo "2️⃣  Redémarrage PostgreSQL..."
sudo systemctl restart postgresql
sleep 2
if systemctl is-active --quiet postgresql; then
    echo -e "${GREEN}✅ PostgreSQL démarré${NC}"
else
    echo -e "${RED}❌ Erreur PostgreSQL${NC}"
fi

# 3. Redémarrer Redis
echo ""
echo "3️⃣  Redémarrage Redis..."
sudo systemctl restart redis-server
sleep 2
if systemctl is-active --quiet redis-server; then
    echo -e "${GREEN}✅ Redis démarré${NC}"
else
    echo -e "${RED}❌ Erreur Redis${NC}"
fi

# 4. Vérifier les services
echo ""
echo "4️⃣  Vérification des services..."
echo -n "PostgreSQL: "
PGPASSWORD=local_dev_password psql -U girlycrea_user -d girlycrea -h localhost -c "SELECT 1;" > /dev/null 2>&1 && echo -e "${GREEN}✅ OK${NC}" || echo -e "${RED}❌ ERREUR${NC}"

echo -n "Redis: "
redis-cli ping > /dev/null 2>&1 && echo -e "${GREEN}✅ OK${NC}" || echo -e "${RED}❌ ERREUR${NC}"

# 5. Instructions pour démarrer Backend et Frontend
echo ""
echo "=================================="
echo -e "${GREEN}✅ Services système redémarrés!${NC}"
echo ""
echo "📋 Prochaines étapes:"
echo ""
echo "Terminal 1 - Backend:"
echo "  cd /home/ghislain/girlycrea-site"
echo "  npm run dev"
echo ""
echo "Terminal 2 - Frontend:"
echo "  cd /home/ghislain/girlycrea-site/frontend"
echo "  npm run dev"
echo ""
echo "Puis ouvrir: http://localhost:3000"



