#!/bin/bash

# =============================================================================
# GirlyCrea - Script de Backup PostgreSQL
# =============================================================================
# Usage: ./scripts/backup-database.sh
# 
# Ce script effectue une sauvegarde complète de la base de données PostgreSQL.
# À exécuter quotidiennement via cron.
#
# Cron exemple (tous les jours à 3h du matin):
# 0 3 * * * /chemin/vers/girlycrea-site/scripts/backup-database.sh
# =============================================================================

set -e

# Configuration
BACKUP_DIR="${BACKUP_DIR:-/home/ghislain/girlycrea-site/backups}"
DB_HOST="${DB_HOST:-localhost}"
DB_PORT="${DB_PORT:-5433}"
DB_NAME="${DB_NAME:-girlycrea}"
DB_USER="${DB_USER:-girlycrea_user}"
RETENTION_DAYS="${RETENTION_DAYS:-7}"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="${BACKUP_DIR}/girlycrea_${DATE}.sql.gz"

# Couleurs
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}  GirlyCrea Database Backup${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""

# Créer le répertoire de backup s'il n'existe pas
if [ ! -d "$BACKUP_DIR" ]; then
    echo -e "${YELLOW}📁 Création du répertoire de backup: $BACKUP_DIR${NC}"
    mkdir -p "$BACKUP_DIR"
fi

# Vérifier que PostgreSQL est accessible
echo -e "${YELLOW}🔍 Vérification de la connexion à PostgreSQL...${NC}"
if ! pg_isready -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" > /dev/null 2>&1; then
    # Essayer via Docker
    if docker exec girlycrea-postgres-local pg_isready -U "$DB_USER" > /dev/null 2>&1; then
        echo -e "${GREEN}✅ PostgreSQL accessible via Docker${NC}"
        USE_DOCKER=true
    else
        echo -e "${RED}❌ PostgreSQL non accessible${NC}"
        exit 1
    fi
else
    echo -e "${GREEN}✅ PostgreSQL accessible${NC}"
    USE_DOCKER=false
fi

# Effectuer la sauvegarde
echo -e "${YELLOW}📦 Backup en cours...${NC}"
echo "   → Fichier: $BACKUP_FILE"

if [ "$USE_DOCKER" = true ]; then
    # Backup via Docker
    docker exec girlycrea-postgres-local pg_dump -U "$DB_USER" -d "$DB_NAME" --no-owner --no-acl | gzip > "$BACKUP_FILE"
else
    # Backup direct
    PGPASSWORD="${DB_PASSWORD:-local_dev_password}" pg_dump -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" --no-owner --no-acl | gzip > "$BACKUP_FILE"
fi

# Vérifier que le backup a été créé
if [ -f "$BACKUP_FILE" ]; then
    BACKUP_SIZE=$(du -h "$BACKUP_FILE" | cut -f1)
    echo -e "${GREEN}✅ Backup créé avec succès!${NC}"
    echo "   → Taille: $BACKUP_SIZE"
else
    echo -e "${RED}❌ Erreur: le fichier de backup n'a pas été créé${NC}"
    exit 1
fi

# Supprimer les vieux backups
echo -e "${YELLOW}🧹 Nettoyage des anciens backups (> ${RETENTION_DAYS} jours)...${NC}"
DELETED_COUNT=$(find "$BACKUP_DIR" -name "girlycrea_*.sql.gz" -type f -mtime +$RETENTION_DAYS -delete -print | wc -l)
echo "   → $DELETED_COUNT ancien(s) backup(s) supprimé(s)"

# Lister les backups existants
echo ""
echo -e "${GREEN}📋 Backups disponibles:${NC}"
ls -lh "$BACKUP_DIR"/girlycrea_*.sql.gz 2>/dev/null | tail -5 || echo "   Aucun backup trouvé"

echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}  Backup terminé avec succès!${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo "📝 Pour restaurer ce backup:"
echo "   gunzip -c $BACKUP_FILE | psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME"
echo ""
echo "📝 Ou via Docker:"
echo "   gunzip -c $BACKUP_FILE | docker exec -i girlycrea-postgres-local psql -U $DB_USER -d $DB_NAME"
