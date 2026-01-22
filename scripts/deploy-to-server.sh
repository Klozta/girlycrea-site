#!/bin/bash

# Script de déploiement sur serveur partagé
# Usage: ./scripts/deploy-to-server.sh [user@host]

set -e

# Couleurs
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Configuration
SERVER_USER_HOST=${1:-"user@server-ip"}
PROJECT_DIR="~/girlycrea-site"
REMOTE_DIR="~/girlycrea-site"

echo -e "${GREEN}🚀 Déploiement GirlyCrea sur serveur partagé${NC}"
echo ""

# Vérifier que .env.production existe
if [ ! -f .env.production ]; then
    echo -e "${YELLOW}⚠️  Fichier .env.production non trouvé${NC}"
    echo "Création depuis .env..."
    if [ -f .env ]; then
        cp .env .env.production
        echo -e "${YELLOW}⚠️  N'oubliez pas de mettre à jour .env.production avec les vraies valeurs de production !${NC}"
    else
        echo -e "${RED}❌ Fichier .env non trouvé non plus${NC}"
        exit 1
    fi
fi

# Créer l'archive
echo -e "${GREEN}📦 Création de l'archive...${NC}"
tar --exclude='node_modules' \
    --exclude='.git' \
    --exclude='.next' \
    --exclude='dist' \
    --exclude='*.log' \
    --exclude='.env' \
    -czf /tmp/girlycrea-site.tar.gz .

# Transférer vers le serveur
echo -e "${GREEN}📤 Transfert vers le serveur...${NC}"
scp /tmp/girlycrea-site.tar.gz ${SERVER_USER_HOST}:${REMOTE_DIR}/
scp .env.production ${SERVER_USER_HOST}:${REMOTE_DIR}/.env

# Nettoyer l'archive locale
rm /tmp/girlycrea-site.tar.gz

# Exécuter les commandes sur le serveur
echo -e "${GREEN}🔧 Configuration sur le serveur...${NC}"
ssh ${SERVER_USER_HOST} << 'ENDSSH'
cd ~/girlycrea-site

# Extraire l'archive
if [ -f girlycrea-site.tar.gz ]; then
    echo "Extraction de l'archive..."
    tar -xzf girlycrea-site.tar.gz
    rm girlycrea-site.tar.gz
fi

# Vérifier Docker
if ! command -v docker &> /dev/null; then
    echo "❌ Docker n'est pas installé sur le serveur"
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose n'est pas installé sur le serveur"
    exit 1
fi

# Arrêter les anciens conteneurs
echo "Arrêt des anciens conteneurs..."
docker-compose -f docker-compose.prod.yml down 2>/dev/null || true

# Reconstruire et démarrer
echo "Démarrage des services..."
docker-compose -f docker-compose.prod.yml up -d --build

# Attendre que les services démarrent
echo "Attente du démarrage des services..."
sleep 10

# Vérifier l'état
echo ""
echo "=== État des conteneurs ==="
docker-compose -f docker-compose.prod.yml ps

echo ""
echo "=== Test health check ==="
curl -s http://localhost:3001/health || echo "Backend non accessible"

ENDSSH

echo ""
echo -e "${GREEN}✅ Déploiement terminé !${NC}"
echo ""
echo "Pour voir les logs :"
echo "  ssh ${SERVER_USER_HOST} 'cd ${REMOTE_DIR} && docker-compose -f docker-compose.prod.yml logs -f'"





