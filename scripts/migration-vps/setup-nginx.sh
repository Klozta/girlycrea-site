#!/bin/bash
# Script de configuration Nginx pour GirlyCrea

set -e

echo "🌐 Configuration Nginx pour GirlyCrea"
echo "======================================"

# Demander les informations
read -p "Nom de domaine (ex: girlycrea.com): " DOMAIN
read -p "Port backend API [3001]: " BACKEND_PORT
BACKEND_PORT=${BACKEND_PORT:-3001}
read -p "Port frontend [3002]: " FRONTEND_PORT
FRONTEND_PORT=${FRONTEND_PORT:-3002}

# Créer la configuration Nginx
CONFIG_FILE="/etc/nginx/sites-available/girlycrea"

sudo tee "$CONFIG_FILE" > /dev/null <<EOF
server {
    listen 80;
    server_name $DOMAIN www.$DOMAIN;

    # Redirection HTTPS (décommenter après configuration SSL)
    # return 301 https://\$server_name\$request_uri;

    # Backend API
    location /api {
        proxy_pass http://localhost:$BACKEND_PORT;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        
        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # Health check
    location /health {
        proxy_pass http://localhost:$BACKEND_PORT;
        proxy_set_header Host \$host;
    }

    # Frontend Next.js
    location / {
        proxy_pass http://localhost:$FRONTEND_PORT;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }

    # Fichiers statiques (si nécessaire)
    location /_next/static {
        proxy_pass http://localhost:$FRONTEND_PORT;
        proxy_cache_valid 200 60m;
        add_header Cache-Control "public, immutable";
    }
}
EOF

# Activer le site
sudo ln -sf "$CONFIG_FILE" /etc/nginx/sites-enabled/girlycrea

# Supprimer la config par défaut si elle existe
sudo rm -f /etc/nginx/sites-enabled/default

# Tester la configuration
echo ""
echo "🧪 Test de la configuration Nginx..."
sudo nginx -t

if [ $? -eq 0 ]; then
    echo "✅ Configuration valide"
    sudo systemctl reload nginx
    echo "✅ Nginx rechargé"
    
    echo ""
    echo "📝 Configuration créée : $CONFIG_FILE"
    echo ""
    echo "🔒 Pour configurer SSL avec Let's Encrypt :"
    echo "   sudo certbot --nginx -d $DOMAIN -d www.$DOMAIN"
    echo ""
    echo "⚠️  N'oubliez pas de décommenter la redirection HTTPS dans la config après avoir configuré SSL"
else
    echo "❌ Erreur dans la configuration Nginx"
    exit 1
fi


