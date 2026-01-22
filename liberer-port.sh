#!/bin/bash
# Script pour libérer les ports 3000 et 3001

echo "🔍 Recherche des processus utilisant les ports 3000 et 3001..."

# Port 3000
PID_3000=$(lsof -ti:3000 2>/dev/null)
if [ ! -z "$PID_3000" ]; then
    echo "Port 3000 utilisé par le processus: $PID_3000"
    kill $PID_3000 2>/dev/null && echo "✅ Processus $PID_3000 arrêté" || echo "❌ Impossible d'arrêter le processus"
else
    echo "✅ Port 3000 libre"
fi

# Port 3001
PID_3001=$(lsof -ti:3001 2>/dev/null)
if [ ! -z "$PID_3001" ]; then
    echo "Port 3001 utilisé par le processus: $PID_3001"
    kill $PID_3001 2>/dev/null && echo "✅ Processus $PID_3001 arrêté" || echo "❌ Impossible d'arrêter le processus"
else
    echo "✅ Port 3001 libre"
fi

echo ""
echo "💡 Si les processus ne s'arrêtent pas, utilisez: kill -9 PID"

