#!/bin/bash
# Script pour exécuter les migrations SQL sur PostgreSQL
# Configuration : VM sur serveur de l'ami
# Usage : Exécuter ce script DANS LA VM où PostgreSQL est installé
set -e

# Couleurs
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Configuration depuis les variables d'environnement ou valeurs par défaut
# Pour PostgreSQL local : utiliser les valeurs par défaut
# Pour Docker : définir DB_USER=admin DB_NAME=girlycrea
DB_USER="${DB_USER:-girlycrea_user}"
DB_NAME="${DB_NAME:-girlycrea}"
DB_HOST="${DB_HOST:-localhost}"
DB_PORT="${DB_PORT:-5432}"
MIGRATIONS_DIR="${MIGRATIONS_DIR:-migrations}"

# Détection automatique : si on est dans Docker, utiliser admin
if [ -f /.dockerenv ] || [ -n "$DOCKER_CONTAINER" ]; then
    DB_USER="${DB_USER:-admin}"
fi

echo -e "${YELLOW}🗄️  Exécution des migrations SQL sur PostgreSQL${NC}"
echo ""

# Vérifier que les fichiers de migration existent
if [ ! -f "$MIGRATIONS_DIR/create_coupons_tables.sql" ]; then
    echo -e "${RED}❌ Fichier de migration introuvable: $MIGRATIONS_DIR/create_coupons_tables.sql${NC}"
    exit 1
fi

if [ ! -f "$MIGRATIONS_DIR/create_product_reviews_tables.sql" ]; then
    echo -e "${RED}❌ Fichier de migration introuvable: $MIGRATIONS_DIR/create_product_reviews_tables.sql${NC}"
    exit 1
fi

# Vérifier la connexion PostgreSQL
echo "🔍 Vérification de la connexion PostgreSQL..."
if ! psql -U "$DB_USER" -d "$DB_NAME" -h "$DB_HOST" -p "$DB_PORT" -c "SELECT 1;" > /dev/null 2>&1; then
    echo -e "${RED}❌ Impossible de se connecter à PostgreSQL${NC}"
    echo "   Vérifiez :"
    echo "   - Que PostgreSQL est démarré"
    echo "   - Les variables DB_USER, DB_NAME, DB_HOST, DB_PORT"
    echo "   - Les permissions de l'utilisateur $DB_USER"
    exit 1
fi
echo -e "${GREEN}✅ Connexion PostgreSQL OK${NC}"
echo ""

# Backup optionnel
read -p "Voulez-vous faire un backup avant les migrations ? (o/N) " -n 1 -r
echo
if [[ $REPLY =~ ^[Oo]$ ]]; then
    BACKUP_FILE="backup_avant_migrations_$(date +%Y%m%d_%H%M%S).sql"
    echo "💾 Création du backup: $BACKUP_FILE"
    pg_dump -U "$DB_USER" -d "$DB_NAME" -h "$DB_HOST" -p "$DB_PORT" > "$BACKUP_FILE"
    echo -e "${GREEN}✅ Backup créé: $BACKUP_FILE${NC}"
    echo ""
fi

# Migration 1: Coupons
echo -e "${YELLOW}📦 Migration coupons...${NC}"
if psql -U "$DB_USER" -d "$DB_NAME" -h "$DB_HOST" -p "$DB_PORT" -f "$MIGRATIONS_DIR/create_coupons_tables.sql"; then
    echo -e "${GREEN}✅ Migration coupons terminée${NC}"
else
    echo -e "${RED}❌ Erreur lors de la migration coupons${NC}"
    exit 1
fi
echo ""

# Migration 2: Avis produits
echo -e "${YELLOW}⭐ Migration avis produits...${NC}"
if psql -U "$DB_USER" -d "$DB_NAME" -h "$DB_HOST" -p "$DB_PORT" -f "$MIGRATIONS_DIR/create_product_reviews_tables.sql"; then
    echo -e "${GREEN}✅ Migration avis produits terminée${NC}"
else
    echo -e "${RED}❌ Erreur lors de la migration avis produits${NC}"
    exit 1
fi
echo ""

# Vérification
echo -e "${YELLOW}🔍 Vérification des tables créées...${NC}"
TABLES=$(psql -U "$DB_USER" -d "$DB_NAME" -h "$DB_HOST" -p "$DB_PORT" -t -c "
SELECT COUNT(*) 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN ('coupons', 'coupon_usage', 'product_reviews', 'review_helpful_votes', 'review_responses');
")

if [ "$TABLES" -eq 5 ]; then
    echo -e "${GREEN}✅ Toutes les tables ont été créées (5/5)${NC}"
else
    echo -e "${YELLOW}⚠️  Nombre de tables trouvées: $TABLES/5${NC}"
fi

echo ""
echo -e "${GREEN}✅ Migrations terminées avec succès !${NC}"
echo ""
echo "Pour vérifier manuellement :"
echo "  psql -U $DB_USER -d $DB_NAME -h $DB_HOST -p $DB_PORT -c \"\\dt coupons; \\dt product_reviews;\""

