#!/bin/bash
# Script pour trouver l'IP Windows depuis WSL2

echo "🔍 Recherche de l'IP Windows..."
echo ""

# Méthode 1 : Gateway WSL2 (généralement l'IP Windows)
GATEWAY=$(ip route show | grep default | awk '{print $3}')
echo "IP probable de Windows (gateway WSL2): $GATEWAY"
echo ""

# Méthode 2 : Nameserver (peut aussi être l'IP Windows)
NAMESERVER=$(cat /etc/resolv.conf | grep nameserver | awk '{print $2}' | head -1)
echo "Nameserver (peut être l'IP Windows): $NAMESERVER"
echo ""

echo "📋 Pour trouver l'IP Windows exacte, exécutez sur Windows PowerShell:"
echo "   ipconfig | findstr IPv4"
echo ""
echo "💡 Essayez d'abord avec ces IPs pour configurer le frontend:"
echo "   echo \"NEXT_PUBLIC_API_URL=http://$GATEWAY:3001\" > frontend/.env.local"
echo "   OU"
echo "   echo \"NEXT_PUBLIC_API_URL=http://$NAMESERVER:3001\" > frontend/.env.local"

