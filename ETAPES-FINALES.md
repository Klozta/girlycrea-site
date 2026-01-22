# ✅ Port Forwarding Configuré - Étapes Finales

## 🎉 Félicitations !

Le port forwarding est maintenant configuré. Suivez ces dernières étapes :

## 1️⃣ Démarrer les Serveurs (si pas déjà fait)

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

## 2️⃣ Trouver votre IP Windows

**Sur Windows PowerShell** :
```powershell
ipconfig | findstr IPv4
```

Vous obtiendrez quelque chose comme :
- `192.168.1.xxx` 
- `10.x.x.x`
- `172.x.x.x`

## 3️⃣ Configurer le Frontend avec l'IP Windows

**Dans WSL2 (Terminal 3)** :
```bash
cd frontend

# Remplacez VOTRE_IP_WINDOWS par l'IP trouvée à l'étape 2
echo "NEXT_PUBLIC_API_URL=http://VOTRE_IP_WINDOWS:3001" > .env.local

# Redémarrer le frontend (Ctrl+C puis npm run dev)
```

## 4️⃣ Vérifier que tout fonctionne

**Depuis Windows PowerShell** :
```powershell
curl http://localhost:3000
curl http://localhost:3001/health
```

**Depuis un autre appareil sur le même réseau** :
```bash
curl http://VOTRE_IP_WINDOWS:3000
curl http://VOTRE_IP_WINDOWS:3001/health
```

## 5️⃣ Partager le Lien

**URL à partager** :
```
http://VOTRE_IP_WINDOWS:3000
```

Remplacez `VOTRE_IP_WINDOWS` par l'IP trouvée à l'étape 2.

## 📝 Notes Importantes

- Les deux serveurs (backend et frontend) doivent être démarrés
- Les appareils doivent être sur le même réseau Wi-Fi/Ethernet
- Le port forwarding reste actif jusqu'à redémarrage de Windows

## 🔧 Vérifier le Port Forwarding

**Sur Windows PowerShell** :
```powershell
netsh interface portproxy show all
```

Vous devriez voir :
```
Écoute sur IPv4              : Connecter à IPv4
0.0.0.0:3000                 : 172.24.241.227:3000
0.0.0.0:3001                 : 172.24.241.227:3001
```
