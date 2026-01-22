#!/bin/bash

# =============================================================================
# GirlyCrea - Script d'Alerting Health Check
# =============================================================================
# Usage: ./scripts/health-alert.sh
# 
# Vérifie l'état du site et envoie une alerte email si problème.
# À exécuter toutes les 5 minutes via cron.
#
# Cron: */5 * * * * /chemin/vers/girlycrea-site/scripts/health-alert.sh
# =============================================================================

set -e

# Configuration
HEALTH_URL="${HEALTH_URL:-http://localhost:3001/health}"
ALERT_EMAIL="${ALERT_EMAIL:-admin@girlycrea.local}"
LOG_FILE="${LOG_FILE:-/home/ghislain/girlycrea-site/logs/health-alerts.log}"
STATE_FILE="/tmp/girlycrea-health-state"

# Créer dossier logs si nécessaire
mkdir -p "$(dirname "$LOG_FILE")"

# Fonction de logging
log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

# Fonction d'envoi d'email (via mail ou curl vers API d'email)
send_alert() {
    local subject="$1"
    local message="$2"
    
    log "🚨 ALERTE: $subject"
    
    # Option 1: Via commande mail (si installé)
    if command -v mail &> /dev/null; then
        echo "$message" | mail -s "$subject" "$ALERT_EMAIL"
        log "Email envoyé via mail command"
    fi
    
    # Option 2: Via curl (Resend API si configuré)
    if [ -n "$RESEND_API_KEY" ]; then
        curl -s -X POST https://api.resend.com/emails \
            -H "Authorization: Bearer $RESEND_API_KEY" \
            -H "Content-Type: application/json" \
            -d "{
                \"from\": \"alerts@girlycrea.com\",
                \"to\": \"$ALERT_EMAIL\",
                \"subject\": \"$subject\",
                \"text\": \"$message\"
            }"
        log "Email envoyé via Resend API"
    fi
    
    # Option 3: Notification locale (fichier)
    echo "$(date '+%Y-%m-%d %H:%M:%S') | $subject | $message" >> /tmp/girlycrea-alerts.txt
}

# Vérifier l'état du site
check_health() {
    local response
    local http_code
    local status
    
    # Faire la requête avec timeout de 10 secondes
    response=$(curl -s --max-time 10 -w "\n%{http_code}" "$HEALTH_URL" 2>/dev/null || echo "TIMEOUT")
    
    if [ "$response" = "TIMEOUT" ]; then
        return 1
    fi
    
    # Extraire le code HTTP (dernière ligne)
    http_code=$(echo "$response" | tail -1)
    
    # Extraire le body (tout sauf dernière ligne)
    body=$(echo "$response" | head -n -1)
    
    # Vérifier le code HTTP
    if [ "$http_code" != "200" ]; then
        return 1
    fi
    
    # Vérifier le status dans la réponse JSON
    status=$(echo "$body" | grep -o '"status":"[^"]*"' | cut -d'"' -f4)
    
    if [ "$status" = "ok" ] || [ "$status" = "healthy" ]; then
        return 0
    else
        return 1
    fi
}

# Lire l'état précédent
get_previous_state() {
    if [ -f "$STATE_FILE" ]; then
        cat "$STATE_FILE"
    else
        echo "unknown"
    fi
}

# Sauvegarder l'état actuel
save_state() {
    echo "$1" > "$STATE_FILE"
}

# Main
main() {
    local previous_state=$(get_previous_state)
    local current_state
    
    if check_health; then
        current_state="up"
        
        # Si le site était down et revient up
        if [ "$previous_state" = "down" ]; then
            send_alert "✅ GirlyCrea RÉTABLI" "Le site GirlyCrea est de nouveau opérationnel.

URL: $HEALTH_URL
Timestamp: $(date)
État précédent: DOWN
État actuel: UP

Le monitoring continue."
            log "✅ Site rétabli après incident"
        else
            log "✅ Site opérationnel"
        fi
    else
        current_state="down"
        
        # Si c'est un nouveau problème (pas déjà signalé)
        if [ "$previous_state" != "down" ]; then
            send_alert "🚨 ALERTE: GirlyCrea DOWN" "Le site GirlyCrea est inaccessible!

URL: $HEALTH_URL
Timestamp: $(date)
État précédent: $previous_state
État actuel: DOWN

Actions recommandées:
1. Vérifier les logs: docker logs girlycrea-backend
2. Vérifier PostgreSQL: docker ps
3. Redémarrer si nécessaire: docker-compose restart

Contactez l'équipe technique immédiatement."
            log "🚨 Site DOWN - Première alerte envoyée"
        else
            log "🚨 Site toujours DOWN (alerte déjà envoyée)"
        fi
    fi
    
    save_state "$current_state"
}

main "$@"
