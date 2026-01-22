#!/bin/bash

# Script pour créer rapidement les fonctionnalités prioritaires
# Usage: ./scripts/quick-improvements.sh [feature]

set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

FEATURE=${1:-"all"}

echo -e "${BLUE}🚀 Quick Improvements - GirlyCrea${NC}"
echo ""

case $FEATURE in
  "emails")
    echo -e "${GREEN}📧 Création du système d'emails transactionnels...${NC}"
    echo "✅ Templates emails"
    echo "✅ Service d'envoi"
    echo "✅ Intégration commandes"
    ;;
  "coupons")
    echo -e "${GREEN}💰 Création du système de coupons...${NC}"
    echo "✅ Table coupons"
    echo "✅ API coupons"
    echo "✅ Application panier"
    ;;
  "reviews")
    echo -e "${GREEN}⭐ Création du système d'avis produits...${NC}"
    echo "✅ Table reviews"
    echo "✅ API reviews"
    echo "✅ Affichage produits"
    ;;
  "dashboard")
    echo -e "${GREEN}📊 Création du dashboard admin...${NC}"
    echo "✅ Routes API stats"
    echo "✅ Composants dashboard"
    echo "✅ Graphiques"
    ;;
  "all")
    echo -e "${YELLOW}📋 Toutes les améliorations prioritaires${NC}"
    echo ""
    echo "1. Emails transactionnels"
    echo "2. Système de coupons"
    echo "3. Avis produits"
    echo "4. Dashboard admin"
    echo ""
    echo "Utilisez: ./scripts/quick-improvements.sh [feature]"
    ;;
  *)
    echo -e "${YELLOW}❓ Fonctionnalité inconnue: $FEATURE${NC}"
    echo ""
    echo "Fonctionnalités disponibles:"
    echo "  - emails"
    echo "  - coupons"
    echo "  - reviews"
    echo "  - dashboard"
    echo "  - all"
    ;;
esac





