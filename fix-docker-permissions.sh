#!/bin/bash
# Script pour fixer les permissions Docker dans WSL2

echo "🔧 Fix Docker Permissions dans WSL2"
echo ""

# Vérifier si Docker est installé
if ! command -v docker &> /dev/null; then
    echo "❌ Docker n'est pas installé"
    echo "Installez Docker Desktop ou Docker dans WSL2"
    exit 1
fi

echo "✅ Docker trouvé: $(docker --version)"
echo ""

# Vérifier le socket Docker
if [ -S /var/run/docker.sock ]; then
    echo "✅ Socket Docker trouvé: /var/run/docker.sock"
    ls -la /var/run/docker.sock
else
    echo "⚠️  Socket Docker non trouvé"
    echo "Assurez-vous que Docker Desktop est démarré sur Windows"
    exit 1
fi

echo ""

# Vérifier si l'utilisateur est dans le groupe docker
if groups | grep -q docker; then
    echo "✅ Utilisateur déjà dans le groupe docker"
else
    echo "⚠️  Utilisateur pas dans le groupe docker"
    echo ""
    echo "Ajout au groupe docker..."
    sudo usermod -aG docker $USER
    echo ""
    echo "✅ Utilisateur ajouté au groupe docker"
    echo ""
    echo "⚠️  IMPORTANT: Vous devez redémarrer votre terminal WSL2 pour que les changements prennent effet"
    echo "   Fermez et rouvrez votre terminal, puis exécutez: docker ps"
fi

echo ""
echo "🔍 Test Docker..."
if docker ps &> /dev/null; then
    echo "✅ Docker fonctionne correctement!"
    docker ps
else
    echo "❌ Docker ne fonctionne pas encore"
    echo ""
    echo "Solutions:"
    echo "1. Redémarrer le terminal WSL2"
    echo "2. Vérifier que Docker Desktop est démarré sur Windows"
    echo "3. Vérifier Settings → Resources → WSL Integration dans Docker Desktop"
fi

