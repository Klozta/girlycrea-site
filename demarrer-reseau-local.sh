#!/bin/bash
# Script pour démarrer l'application en mode réseau local

IP=$(hostname -I 2>/dev/null | awk '{print $1}' || ip addr show | grep -E 'inet.*192\.168\.|inet.*172\.|inet.*10\.' | head -1 | awk '{print $2}' | cut -d'/' -f1)

if [ -z "$IP" ]; then
  echo "❌ Impossible de trouver l'IP locale"
  exit 1
fi

echo "🌐 IP locale détectée: $IP"
echo ""
echo "📋 Configuration:"
echo "   Frontend: http://$IP:3000"
echo "   Backend:  http://$IP:3001"
echo ""
echo "🚀 Démarrage des serveurs..."
echo ""

# Vérifier que .env.local est configuré
if ! grep -q "NEXT_PUBLIC_API_URL=http://$IP:3001" frontend/.env.local 2>/dev/null; then
  echo "NEXT_PUBLIC_API_URL=http://$IP:3001" > frontend/.env.local
  echo "✅ Configuration frontend mise à jour"
fi

echo "💡 Pour arrêter: Ctrl+C dans chaque terminal"
echo ""
echo "📱 Partagez ce lien: http://$IP:3000"
echo ""



