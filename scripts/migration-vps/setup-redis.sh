#!/bin/bash
# Script d'installation et configuration Redis pour VPS Ubuntu

set -e

echo "🔴 Installation Redis pour GirlyCrea"
echo "====================================="

# Installer Redis
echo "📦 Installation de Redis..."
sudo apt update
sudo apt install redis-server -y

# Configuration Redis
echo "🔧 Configuration de Redis..."
sudo sed -i 's/^# maxmemory <bytes>/maxmemory 256mb/' /etc/redis/redis.conf
sudo sed -i 's/^# maxmemory-policy noeviction/maxmemory-policy allkeys-lru/' /etc/redis/redis.conf

# Optionnel : Configurer un mot de passe
read -p "Voulez-vous configurer un mot de passe Redis ? (y/n) [n]: " SET_PASSWORD
if [[ $SET_PASSWORD == "y" || $SET_PASSWORD == "Y" ]]; then
    read -sp "Mot de passe Redis: " REDIS_PASS
    echo ""
    sudo sed -i "s/^# requirepass foobared/requirepass $REDIS_PASS/" /etc/redis/redis.conf
    echo "✅ Mot de passe Redis configuré"
    echo "📝 REDIS_PASSWORD=$REDIS_PASS"
fi

# Redémarrer Redis
echo "🔄 Redémarrage de Redis..."
sudo systemctl restart redis-server
sudo systemctl enable redis-server

# Test de connexion
echo "🧪 Test de connexion..."
redis-cli ping

echo ""
echo "✅ Redis installé et configuré avec succès !"
echo ""
echo "📝 Variables d'environnement à ajouter dans .env :"
echo "REDIS_URL=redis://localhost:6379"
if [[ $SET_PASSWORD == "y" || $SET_PASSWORD == "Y" ]]; then
    echo "REDIS_PASSWORD=$REDIS_PASS"
fi


