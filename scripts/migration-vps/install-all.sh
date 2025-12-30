#!/bin/bash
# Script d'installation complète pour VPS Ubuntu
# Installe tous les services nécessaires pour GirlyCrea

set -e

echo "🚀 Installation complète GirlyCrea sur VPS Ubuntu"
echo "=================================================="
echo ""

# Vérifier que nous sommes sur Ubuntu
if [ ! -f /etc/os-release ]; then
    echo "❌ Ce script est conçu pour Ubuntu"
    exit 1
fi

source /etc/os-release
if [ "$ID" != "ubuntu" ]; then
    echo "⚠️  Ce script est conçu pour Ubuntu. Vous utilisez: $ID"
    read -p "Continuer quand même ? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# Mettre à jour le système
echo "📦 Mise à jour du système..."
sudo apt update && sudo apt upgrade -y

# Installer les outils de base
echo "🔧 Installation des outils de base..."
sudo apt install -y curl wget git build-essential

# 1. Installer Node.js 20 LTS
echo ""
echo "📦 Installation de Node.js 20 LTS..."
if ! command -v node &> /dev/null || [ "$(node -v | cut -d'v' -f2 | cut -d'.' -f1)" -lt 20 ]; then
    curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
    sudo apt install -y nodejs
    echo "✅ Node.js $(node -v) installé"
else
    echo "✅ Node.js $(node -v) déjà installé"
fi

# 2. Installer PostgreSQL
echo ""
echo "🐘 Installation de PostgreSQL..."
if ! command -v psql &> /dev/null; then
    sudo apt install -y postgresql postgresql-contrib
    sudo systemctl enable postgresql
    sudo systemctl start postgresql
    echo "✅ PostgreSQL installé"
else
    echo "✅ PostgreSQL déjà installé"
fi

# 3. Installer Redis
echo ""
echo "🔴 Installation de Redis..."
if ! command -v redis-cli &> /dev/null; then
    sudo apt install -y redis-server
    sudo systemctl enable redis-server
    sudo systemctl start redis-server
    echo "✅ Redis installé"
else
    echo "✅ Redis déjà installé"
fi

# 4. Installer PM2
echo ""
echo "⚙️  Installation de PM2..."
if ! command -v pm2 &> /dev/null; then
    sudo npm install -g pm2
    echo "✅ PM2 installé"
else
    echo "✅ PM2 déjà installé"
fi

# 5. Installer Nginx
echo ""
echo "🌐 Installation de Nginx..."
if ! command -v nginx &> /dev/null; then
    sudo apt install -y nginx
    sudo systemctl enable nginx
    sudo systemctl start nginx
    echo "✅ Nginx installé"
else
    echo "✅ Nginx déjà installé"
fi

# 6. Installer Certbot (pour SSL)
echo ""
echo "🔒 Installation de Certbot (SSL)..."
if ! command -v certbot &> /dev/null; then
    sudo apt install -y certbot python3-certbot-nginx
    echo "✅ Certbot installé"
else
    echo "✅ Certbot déjà installé"
fi

# 7. Configurer le firewall
echo ""
echo "🔥 Configuration du firewall (UFW)..."
if command -v ufw &> /dev/null; then
    sudo ufw --force enable
    sudo ufw allow 22/tcp   # SSH
    sudo ufw allow 80/tcp   # HTTP
    sudo ufw allow 443/tcp  # HTTPS
    echo "✅ Firewall configuré"
else
    echo "⚠️  UFW non disponible, configuration firewall manuelle nécessaire"
fi

# Résumé
echo ""
echo "=================================================="
echo "✅ Installation terminée !"
echo ""
echo "📋 Prochaines étapes :"
echo ""
echo "1. Configurer PostgreSQL :"
echo "   sudo -u postgres psql"
echo "   CREATE DATABASE girlycrea;"
echo "   CREATE USER girlycrea_user WITH PASSWORD 'votre_mot_de_passe';"
echo "   GRANT ALL PRIVILEGES ON DATABASE girlycrea TO girlycrea_user;"
echo ""
echo "2. Configurer Redis (optionnel) :"
echo "   sudo nano /etc/redis/redis.conf"
echo "   # Ajouter: requirepass votre_mot_de_passe"
echo ""
echo "3. Cloner le projet :"
echo "   git clone <votre-repo> /opt/girlycrea-site"
echo "   cd /opt/girlycrea-site"
echo ""
echo "4. Installer les dépendances :"
echo "   npm install"
echo ""
echo "5. Configurer les variables d'environnement :"
echo "   cp .env.vps.example .env"
echo "   nano .env"
echo ""
echo "6. Build et démarrer :"
echo "   npm run build"
echo "   pm2 start dist/index.js --name girlycrea-api"
echo "   pm2 save"
echo "   pm2 startup"
echo ""
echo "📖 Consultez docs/MIGRATION-VPS-UBUNTU.md pour plus de détails"
echo ""


