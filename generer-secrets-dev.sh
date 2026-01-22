#!/bin/bash
# Script pour générer les secrets manquants pour le développement

echo "🔐 Génération des secrets pour le développement..."
echo ""

# Fonction pour générer un secret aléatoire
generate_secret() {
    openssl rand -hex 32
}

echo "# Secrets générés pour le développement Docker"
echo "# Ajoutez ces lignes à votre .env ou docker-compose.yml"
echo ""
echo "JWT_REFRESH_SECRET=$(generate_secret)"
echo "ADMIN_TOKEN=$(generate_secret)"
echo "REVALIDATE_SECRET=$(generate_secret)"
echo ""
echo "✅ Secrets générés !"
echo ""
echo "⚠️  IMPORTANT: En production, utilisez des secrets forts et uniques !"

