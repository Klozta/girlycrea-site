#!/bin/bash
# Script pour corriger l'authentification PostgreSQL
# Usage: bash scripts/fix-postgres-auth.sh

set -e

echo "🔧 Correction Authentification PostgreSQL"
echo "=========================================="

# Modifier pg_hba.conf pour permettre md5 au lieu de peer
sudo sed -i 's/local   all             all                                     peer/local   all             all                                     md5/' /etc/postgresql/16/main/pg_hba.conf

# Recharger PostgreSQL
sudo systemctl reload postgresql

echo "✅ Authentification PostgreSQL corrigée"
echo ""
echo "Test connexion:"
PGPASSWORD=local_dev_password psql -U girlycrea_user -d girlycrea -h localhost -c "SELECT version();"



