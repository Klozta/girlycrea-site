#!/bin/bash
# Script pour corriger les problèmes de démarrage local
# Usage: bash scripts/fix-local-setup.sh

set -e

echo "🔧 Correction Setup Local GirlyCrea"
echo "===================================="
echo ""

# Couleurs
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# 1. Installer les dépendances
echo "📦 [1/5] Installation dépendances..."
cd /home/ghislain/girlycrea-site
npm install > /dev/null 2>&1 || npm install
cd frontend
npm install > /dev/null 2>&1 || npm install
cd ..
echo -e "${GREEN}✅ Dépendances installées${NC}"

# 2. Vérifier Docker
echo ""
echo "🐳 [2/5] Vérification Docker..."
if command -v docker &> /dev/null && command -v docker-compose &> /dev/null; then
    echo -e "${GREEN}✅ Docker installé${NC}"
    DOCKER_AVAILABLE=true
else
    echo -e "${YELLOW}⚠️  Docker non installé${NC}"
    echo "   Option A: Installer Docker"
    echo "   Option B: Utiliser installation native (PostgreSQL + Redis)"
    read -p "Installer Docker maintenant? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo "Installation Docker..."
        sudo apt update
        sudo apt install -y docker.io docker-compose
        sudo systemctl enable docker
        sudo systemctl start docker
        sudo usermod -aG docker $USER
        echo -e "${GREEN}✅ Docker installé${NC}"
        echo -e "${YELLOW}⚠️  Déconnexion/reconnexion nécessaire pour appliquer les permissions${NC}"
        DOCKER_AVAILABLE=true
    else
        DOCKER_AVAILABLE=false
    fi
fi

# 3. Libérer le port 3002
echo ""
echo "🔌 [3/5] Vérification ports..."
if lsof -i :3002 > /dev/null 2>&1 || netstat -tuln 2>/dev/null | grep -q ':3002'; then
    echo -e "${YELLOW}⚠️  Port 3002 utilisé${NC}"
    echo "Tentative de libération..."
    PID=$(lsof -ti :3002 2>/dev/null || netstat -tuln 2>/dev/null | grep ':3002' | awk '{print $7}' | cut -d'/' -f1 | head -1)
    if [ ! -z "$PID" ] && [ "$PID" != "-" ]; then
        kill -9 $PID 2>/dev/null || sudo kill -9 $PID 2>/dev/null
        echo -e "${GREEN}✅ Port 3002 libéré${NC}"
    else
        echo -e "${YELLOW}⚠️  Impossible de libérer automatiquement${NC}"
        echo "   Modifiez frontend/package.json pour utiliser le port 3000"
    fi
else
    echo -e "${GREEN}✅ Ports libres${NC}"
fi

# 4. Créer fichier .env si absent
echo ""
echo "📝 [4/5] Configuration .env..."
if [ ! -f .env ]; then
    if [ -f .env.local ]; then
        cp .env.local .env
        echo -e "${GREEN}✅ .env créé depuis .env.local${NC}"
    else
        cat > .env << 'EOF'
NODE_ENV=development
DATABASE_URL=postgresql://girlycrea_user:local_dev_password@localhost:5432/girlycrea
SUPABASE_URL=postgresql://girlycrea_user:local_dev_password@localhost:5432/girlycrea
REDIS_URL=redis://localhost:6379
PORT=3001
API_URL=http://localhost:3001
FRONTEND_URL=http://localhost:3000
JWT_SECRET=local_dev_secret_change_in_production
JWT_REFRESH_SECRET=local_dev_refresh_secret_change_in_production
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
EMAIL_PROVIDER=smtp
SMTP_HOST=localhost
SMTP_PORT=1025
ENCRYPTION_KEY=local_dev_encryption_key_32_chars!!
EOF
        echo -e "${GREEN}✅ .env créé${NC}"
        echo -e "${YELLOW}⚠️  Modifiez .env avec vos vraies valeurs${NC}"
    fi
else
    echo -e "${GREEN}✅ .env existe déjà${NC}"
fi

# 5. Démarrer services (Docker ou instructions)
echo ""
echo "🚀 [5/5] Instructions démarrage..."
if [ "$DOCKER_AVAILABLE" = true ]; then
    echo ""
    echo "Pour démarrer avec Docker:"
    echo "  docker-compose -f docker-compose.local.yml up -d"
    echo ""
    echo "Pour démarrer l'application:"
    echo "  Terminal 1: npm run dev"
    echo "  Terminal 2: cd frontend && npm run dev"
else
    echo ""
    echo "Pour démarrer sans Docker:"
    echo "  1. Installer PostgreSQL et Redis:"
    echo "     sudo apt install -y postgresql postgresql-contrib redis-server"
    echo ""
    echo "  2. Créer la base de données:"
    echo "     sudo -u postgres psql"
    echo "     CREATE DATABASE girlycrea;"
    echo "     CREATE USER girlycrea_user WITH PASSWORD 'local_dev_password';"
    echo "     GRANT ALL PRIVILEGES ON DATABASE girlycrea TO girlycrea_user;"
    echo ""
    echo "  3. Démarrer les services:"
    echo "     sudo systemctl start postgresql redis-server"
    echo ""
    echo "  4. Démarrer l'application:"
    echo "     Terminal 1: npm run dev"
    echo "     Terminal 2: cd frontend && npm run dev"
fi

echo ""
echo "===================================="
echo -e "${GREEN}✅ Setup corrigé!${NC}"
echo ""
echo "📖 Consultez DEMARRAGE-RAPIDE-LOCAL.md pour plus de détails"



