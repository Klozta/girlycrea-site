#!/bin/bash
# Script pour résoudre les conflits de ports PostgreSQL et Redis

echo "🔍 Vérification des ports occupés..."
echo ""

# Vérifier PostgreSQL (5432)
if lsof -i :5432 >/dev/null 2>&1 || netstat -tuln 2>/dev/null | grep -q ':5432'; then
    echo "⚠️  Port 5432 (PostgreSQL) est occupé"
    echo "   Solutions:"
    echo "   1. Arrêter le service PostgreSQL local"
    echo "   2. OU changer le port dans docker-compose.yml"
    echo ""
fi

# Vérifier Redis (6379)
if lsof -i :6379 >/dev/null 2>&1 || netstat -tuln 2>/dev/null | grep -q ':6379'; then
    echo "⚠️  Port 6379 (Redis) est occupé"
    echo "   Solutions:"
    echo "   1. Arrêter le service Redis local"
    echo "   2. OU changer le port dans docker-compose.yml"
    echo ""
fi

# Vérifier les conteneurs Docker existants
echo "🔍 Vérification des conteneurs Docker existants..."
if command -v docker &> /dev/null; then
    echo ""
    echo "Conteneurs postgres/redis existants:"
    docker ps -a --filter "name=postgres" --filter "name=redis" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}" 2>/dev/null || echo "   (nécessite sudo ou groupe docker)"
    echo ""
    
    echo "Pour arrêter les conteneurs existants:"
    echo "   docker stop \$(docker ps -q --filter 'name=postgres' --filter 'name=redis')"
    echo "   docker rm \$(docker ps -aq --filter 'name=postgres' --filter 'name=redis')"
fi

echo ""
echo "✅ Solution recommandée:"
echo "   Modifier docker-compose.yml pour utiliser des ports différents"
echo "   Par exemple: 5433:5432 pour PostgreSQL et 6380:6379 pour Redis"

