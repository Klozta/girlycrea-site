# 🚀 Démarrage Complet - Guide Final

## ✅ État Actuel

- ✅ Port forwarding configuré
- ⚠️ Serveurs à démarrer
- ⚠️ IP Windows à confirmer

## 📋 Étapes à Suivre

### 1️⃣ Démarrer le Backend

**Terminal 1** :
```bash
cd backend
npm run dev
```

Attendez : `GirlyCrea Backend started` sur `http://localhost:3001`

### 2️⃣ Démarrer le Frontend

**Terminal 2** :
```bash
cd frontend
npm run dev
```

Attendez : `Ready` sur `http://localhost:3000`

### 3️⃣ Trouver l'IP Windows Exacte

**Sur Windows PowerShell** :
```powershell
ipconfig | findstr IPv4
```

Vous obtiendrez quelque chose comme :
- `192.168.1.xxx` (réseau local)
- `10.x.x.x` (réseau local)
- `172.x.x.x` (réseau local)

**Note** : Ne prenez PAS l'IP `127.0.0.1` ou `169.254.x.x`

### 4️⃣ Configurer le Frontend avec l'IP Windows

**Dans WSL2 (Terminal 3)** :
```bash
cd frontend

# Remplacez VOTRE_IP_WINDOWS par l'IP trouvée à l'étape 3
echo "NEXT_PUBLIC_API_URL=http://VOTRE_IP_WINDOWS:3001" > .env.local

# Redémarrer le frontend (Ctrl+C puis npm run dev)
```

### 5️⃣ Vérifier

**Depuis Windows PowerShell** :
```powershell
curl http://localhost:3000
curl http://localhost:3001/health
```

**Depuis un autre appareil** :
```
http://VOTRE_IP_WINDOWS:3000
```

## 🔍 IP Probable de Windows

D'après WSL2, votre IP Windows est probablement :
- `172.24.240.1` (gateway WSL2)
- `10.255.255.254` (nameserver)

**Testez d'abord avec** :
```bash
cd frontend
echo "NEXT_PUBLIC_API_URL=http://172.24.240.1:3001" > .env.local
npm run dev
```

Si ça ne fonctionne pas, utilisez l'IP trouvée avec `ipconfig` sur Windows.

## 📱 URL à Partager

Une fois tout configuré :
```
http://VOTRE_IP_WINDOWS:3000
```

## ✅ Checklist Finale

- [ ] Backend démarré (port 3001)
- [ ] Frontend démarré (port 3000)
- [ ] Port forwarding configuré
- [ ] IP Windows trouvée
- [ ] .env.local configuré avec la bonne IP
- [ ] Test depuis Windows : `curl http://localhost:3000`
- [ ] Test depuis autre appareil : `http://IP_WINDOWS:3000`
