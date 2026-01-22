#!/bin/bash
# Script de configuration PM2 pour GirlyCrea

set -e

echo "⚙️  Configuration PM2 pour GirlyCrea"
echo "====================================="

# Vérifier que PM2 est installé
if ! command -v pm2 &> /dev/null; then
    echo "❌ PM2 n'est pas installé. Installez-le avec: sudo npm install -g pm2"
    exit 1
fi

# Demander le chemin de l'application
read -p "Chemin de l'application [/opt/girlycrea-site]: " APP_PATH
APP_PATH=${APP_PATH:-/opt/girlycrea-site}

if [ ! -d "$APP_PATH" ]; then
    echo "❌ Le répertoire $APP_PATH n'existe pas"
    exit 1
fi

cd "$APP_PATH"

# Vérifier que le build existe
if [ ! -d "dist" ]; then
    echo "⚠️  Le dossier dist n'existe pas. Build nécessaire..."
    read -p "Voulez-vous builder maintenant ? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        npm run build
    else
        echo "❌ Build nécessaire avant de continuer"
        exit 1
    fi
fi

# Arrêter l'application si elle tourne déjà
pm2 delete girlycrea-api 2>/dev/null || true

# Démarrer l'application
echo ""
echo "🚀 Démarrage de l'application avec PM2..."
pm2 start dist/index.js --name girlycrea-api --instances 1 --max-memory-restart 500M

# Sauvegarder la configuration PM2
pm2 save

# Configurer le démarrage automatique
echo ""
echo "🔄 Configuration du démarrage automatique..."
STARTUP_CMD=$(pm2 startup | grep -v "PM2" | grep -v "=" | tail -1)
if [ -n "$STARTUP_CMD" ]; then
    echo "Exécutez cette commande en tant que root :"
    echo "$STARTUP_CMD"
    read -p "Voulez-vous l'exécuter maintenant ? (nécessite sudo) (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        eval "sudo $STARTUP_CMD"
    fi
fi

# Afficher le statut
echo ""
echo "✅ Application démarrée avec PM2"
echo ""
pm2 status
echo ""
echo "📊 Commandes utiles :"
echo "   pm2 logs girlycrea-api      # Voir les logs"
echo "   pm2 monit                   # Monitoring en temps réel"
echo "   pm2 restart girlycrea-api  # Redémarrer"
echo "   pm2 stop girlycrea-api     # Arrêter"
echo ""



