#!/bin/bash
# Script pour configurer l'accès réseau local

IP=$(hostname -I 2>/dev/null | awk '{print $1}' || ip addr show | grep -E 'inet.*192\.168\.' | head -1 | awk '{print $2}' | cut -d'/' -f1)

if [ -z "$IP" ]; then
    echo "❌ IP non trouvée automatiquement"
    read -p "Entrez votre IP locale (ex: 192.168.1.100): " IP
fi

echo "🌐 Configuration Accès Réseau Local"
echo "===================================="
echo ""
echo "IP détectée: $IP"
echo ""

# Modifier frontend/.env.local
if [ -f frontend/.env.local ]; then
    # Sauvegarder l'ancien
    cp frontend/.env.local frontend/.env.local.backup
    
    # Modifier API_URL
    if grep -q "NEXT_PUBLIC_API_URL" frontend/.env.local; then
        sed -i "s|NEXT_PUBLIC_API_URL=.*|NEXT_PUBLIC_API_URL=http://$IP:3001|" frontend/.env.local
    else
        echo "NEXT_PUBLIC_API_URL=http://$IP:3001" >> frontend/.env.local
    fi
    
    echo "✅ frontend/.env.local mis à jour"
else
    echo "NEXT_PUBLIC_API_URL=http://$IP:3001" > frontend/.env.local
    echo "✅ frontend/.env.local créé"
fi

# Vérifier backend HOST
if grep -q "^HOST=" .env 2>/dev/null; then
    echo "✅ Backend HOST déjà configuré"
else
    echo "HOST=0.0.0.0" >> .env
    echo "✅ Backend HOST ajouté dans .env"
fi

echo ""
echo "📋 Prochaines étapes:"
echo ""
echo "1. Redémarrer Backend:"
echo "   cd /home/ghislain/girlycrea-site"
echo "   npm run dev"
echo ""
echo "2. Redémarrer Frontend avec accès réseau:"
echo "   cd /home/ghislain/girlycrea-site/frontend"
echo "   npm run dev -- -H 0.0.0.0"
echo ""
echo "3. Ouvrir le firewall (si nécessaire):"
echo "   sudo ufw allow 3000/tcp"
echo "   sudo ufw allow 3001/tcp"
echo ""
echo "4. URL à partager:"
echo "   http://$IP:3000"
echo ""



