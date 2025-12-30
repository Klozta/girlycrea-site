#!/bin/bash
# Script de backup PostgreSQL pour GirlyCrea

set -e

# Configuration
BACKUP_DIR="${BACKUP_DIR:-/opt/backups/postgres}"
DB_NAME="${DB_NAME:-girlycrea}"
DB_USER="${DB_USER:-girlycrea_user}"
RETENTION_DAYS="${RETENTION_DAYS:-7}"

# Créer le répertoire de backup
mkdir -p "$BACKUP_DIR"

# Date pour le nom du fichier
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/${DB_NAME}_${DATE}.sql"

echo "💾 Backup PostgreSQL : $DB_NAME"
echo "================================"

# Backup
echo "📦 Création du backup..."
PGPASSWORD="${DB_PASSWORD:-}" pg_dump -U "$DB_USER" -h localhost "$DB_NAME" > "$BACKUP_FILE"

# Compression
echo "🗜️  Compression..."
gzip "$BACKUP_FILE"
BACKUP_FILE="${BACKUP_FILE}.gz"

# Taille du fichier
SIZE=$(du -h "$BACKUP_FILE" | cut -f1)
echo "✅ Backup créé : $(basename $BACKUP_FILE) ($SIZE)"

# Nettoyage des anciens backups
echo "🧹 Nettoyage des backups de plus de $RETENTION_DAYS jours..."
find "$BACKUP_DIR" -name "${DB_NAME}_*.sql.gz" -mtime +$RETENTION_DAYS -delete

echo "✅ Backup terminé avec succès !"


