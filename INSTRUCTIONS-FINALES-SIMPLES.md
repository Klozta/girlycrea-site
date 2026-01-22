# ✅ Instructions Finales - Version Simple

## 🔧 Problème : Port 3000 déjà utilisé

### Solution Rapide

**Dans WSL2** :
```bash
# Libérer le port 3000
./liberer-port.sh

# OU manuellement
kill $(lsof -ti:3000)
```

## 🚀 Démarrage des Serveurs

### Terminal 1 - Backend :
```bash
cd backend
npm run dev
```

### Terminal 2 - Frontend :
```bash
cd frontend
npm run dev
```

## 🔍 Trouver l'IP Windows

**⚠️ IMPORTANT : Cette commande doit être exécutée sur Windows PowerShell, PAS dans WSL2 !**

**Sur Windows PowerShell** :
```powershell
ipconfig | findstr IPv4
```

Vous obtiendrez quelque chose comme :
- `192.168.1.xxx`
- `10.x.x.x`
- `172.x.x.x`

**Note** : Ne prenez PAS `127.0.0.1` ou `169.254.x.x`

## ⚙️ Configurer le Frontend

**Dans WSL2** (une fois l'IP Windows trouvée) :
```bash
cd frontend
echo "NEXT_PUBLIC_API_URL=http://VOTRE_IP_WINDOWS:3001" > .env.local
```

**IP probable à tester d'abord** : `172.24.240.1`

## 📱 URL à Partager

```
http://VOTRE_IP_WINDOWS:3000
```

## ✅ Vérification

**Depuis Windows PowerShell** :
```powershell
curl http://localhost:3000
curl http://localhost:3001/health
```

**Depuis un autre appareil** :
```
http://VOTRE_IP_WINDOWS:3000
```

