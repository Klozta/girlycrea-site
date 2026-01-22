#!/bin/bash
# Script de migration des données depuis Supabase vers PostgreSQL local

set -e

echo "📦 Migration des données depuis Supabase"
echo "========================================"
echo ""

# Demander les informations Supabase
read -p "URL Supabase (ex: db.xxxxx.supabase.co): " SUPABASE_HOST
read -p "Port Supabase [5432]: " SUPABASE_PORT
SUPABASE_PORT=${SUPABASE_PORT:-5432}
read -p "Base de données Supabase [postgres]: " SUPABASE_DB
SUPABASE_DB=${SUPABASE_DB:-postgres}
read -p "Utilisateur Supabase [postgres]: " SUPABASE_USER
SUPABASE_USER=${SUPABASE_USER:-postgres}
read -sp "Mot de passe Supabase: " SUPABASE_PASS
echo ""

# Demander les informations PostgreSQL local
read -p "Base de données locale [girlycrea]: " LOCAL_DB
LOCAL_DB=${LOCAL_DB:-girlycrea}
read -p "Utilisateur local [girlycrea_user]: " LOCAL_USER
LOCAL_USER=${LOCAL_USER:-girlycrea_user}
read -sp "Mot de passe local: " LOCAL_PASS
echo ""

# Créer le répertoire de backup
BACKUP_DIR="/tmp/girlycrea-migration"
mkdir -p "$BACKUP_DIR"
BACKUP_FILE="$BACKUP_DIR/backup_$(date +%Y%m%d_%H%M%S).sql"

echo ""
echo "📥 Export depuis Supabase..."
export PGPASSWORD="$SUPABASE_PASS"
pg_dump -h "$SUPABASE_HOST" -p "$SUPABASE_PORT" -U "$SUPABASE_USER" -d "$SUPABASE_DB" \
    --no-owner --no-acl > "$BACKUP_FILE"

if [ $? -ne 0 ]; then
    echo "❌ Erreur lors de l'export depuis Supabase"
    exit 1
fi

echo "✅ Export terminé : $BACKUP_FILE"
echo "   Taille : $(du -h "$BACKUP_FILE" | cut -f1)"

# Compression
echo ""
echo "🗜️  Compression..."
gzip "$BACKUP_FILE"
BACKUP_FILE="${BACKUP_FILE}.gz"
echo "✅ Backup compressé : $BACKUP_FILE"

# Import dans PostgreSQL local
echo ""
echo "📤 Import dans PostgreSQL local..."
export PGPASSWORD="$LOCAL_PASS"
gunzip -c "$BACKUP_FILE" | psql -U "$LOCAL_USER" -d "$LOCAL_DB" -h localhost

if [ $? -ne 0 ]; then
    echo "❌ Erreur lors de l'import"
    echo "⚠️  Vérifiez que la base de données et l'utilisateur existent"
    exit 1
fi

echo ""
echo "✅ Migration terminée avec succès !"
echo ""
echo "📝 Vérifications recommandées :"
echo "   psql -U $LOCAL_USER -d $LOCAL_DB -c 'SELECT COUNT(*) FROM products;'"
echo "   psql -U $LOCAL_USER -d $LOCAL_DB -c 'SELECT COUNT(*) FROM users;'"
echo ""



