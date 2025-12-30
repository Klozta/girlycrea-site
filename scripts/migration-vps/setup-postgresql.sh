#!/bin/bash
# Script d'installation et configuration PostgreSQL pour VPS Ubuntu

set -e

echo "🐘 Installation PostgreSQL pour GirlyCrea"
echo "=========================================="

# Mettre à jour les paquets
sudo apt update && sudo apt upgrade -y

# Installer PostgreSQL
echo "📦 Installation de PostgreSQL..."
sudo apt install postgresql postgresql-contrib -y

# Vérifier l'installation
echo "✅ Vérification de l'installation..."
sudo systemctl status postgresql --no-pager

# Demander les informations de configuration
read -p "Nom de la base de données [girlycrea]: " DB_NAME
DB_NAME=${DB_NAME:-girlycrea}

read -p "Nom d'utilisateur PostgreSQL [girlycrea_user]: " DB_USER
DB_USER=${DB_USER:-girlycrea_user}

read -sp "Mot de passe PostgreSQL: " DB_PASS
echo ""

# Créer la base de données et l'utilisateur
echo "🔧 Configuration de la base de données..."
sudo -u postgres psql <<EOF
CREATE DATABASE $DB_NAME;
CREATE USER $DB_USER WITH PASSWORD '$DB_PASS';
GRANT ALL PRIVILEGES ON DATABASE $DB_NAME TO $DB_USER;
ALTER USER $DB_USER CREATEDB;
\q
EOF

echo "✅ Base de données créée avec succès !"
echo ""
echo "📝 Variables d'environnement à ajouter dans .env :"
echo "DATABASE_URL=postgresql://$DB_USER:$DB_PASS@localhost:5432/$DB_NAME"
echo "SUPABASE_URL=postgresql://$DB_USER:$DB_PASS@localhost:5432/$DB_NAME"


