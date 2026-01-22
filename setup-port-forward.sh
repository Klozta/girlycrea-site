#!/bin/bash
# Script pour configurer le port forwarding depuis WSL2
# Ce script génère les commandes PowerShell à exécuter sur Windows

echo "🔧 Configuration Port Forwarding WSL2"
echo ""
echo "⚠️  IMPORTANT: Ces commandes doivent être exécutées sur Windows PowerShell (Admin)"
echo ""

# Récupérer l'IP WSL2
WSL_IP=$(hostname -I | awk '{print $1}')
echo "IP WSL2 détectée: $WSL_IP"
echo ""

echo "📋 Copiez et exécutez ces commandes dans Windows PowerShell (Admin):"
echo ""
echo "---"
echo "\$wslIP = \"$WSL_IP\""
echo "netsh interface portproxy add v4tov4 listenport=3000 listenaddress=0.0.0.0 connectport=3000 connectaddress=\$wslIP"
echo "netsh interface portproxy add v4tov4 listenport=3001 listenaddress=0.0.0.0 connectport=3001 connectaddress=\$wslIP"
echo "Write-Host \"✅ Ports forwardés avec succès!\""
echo "---"
echo ""

echo "💡 Pour copier le script PowerShell sur Windows:"
echo "cp port-forward.ps1 /mnt/c/Users/\$USER/Desktop/"
echo ""
echo "Puis sur Windows PowerShell (Admin):"
echo "cd C:\Users\$USER\Desktop"
echo ".\port-forward.ps1"


