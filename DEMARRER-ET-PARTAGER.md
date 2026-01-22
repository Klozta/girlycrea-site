# 🚀 Démarrer et Partager l'Application

## 📋 Étapes Rapides

### 1️⃣ Démarrer le Backend

**Terminal 1** :
```bash
cd backend
npm run dev
```

Attendez de voir : `GirlyCrea Backend started` sur `http://localhost:3001`

### 2️⃣ Démarrer le Frontend

**Terminal 2** :
```bash
cd frontend
npm run dev
```

Attendez de voir : `Ready` sur `http://localhost:3000`

### 3️⃣ Configurer le Port Forwarding Windows (WSL2)

**Sur Windows PowerShell (en tant qu'Administrateur)** :

```powershell
# Option 1 : Exécuter le script automatique
cd \\wsl$\Ubuntu\home\ghislain\girlycrea-site
.\port-forward.ps1

# Option 2 : Commandes manuelles
$wslIP = (wsl hostname -I).Trim()
netsh interface portproxy add v4tov4 listenport=3000 listenaddress=0.0.0.0 connectport=3000 connectaddress=$wslIP
netsh interface portproxy add v4tov4 listenport=3001 listenaddress=0.0.0.0 connectport=3001 connectaddress=$wslIP
```

### 4️⃣ Trouver votre IP Windows

**Sur Windows PowerShell** :
```powershell
ipconfig | findstr IPv4
```

Vous obtiendrez quelque chose comme : `192.168.1.xxx` ou `10.x.x.x`

### 5️⃣ Configurer le Frontend avec l'IP Windows

**Dans WSL2 (Terminal 3)** :
```bash
cd frontend
# Remplacez VOTRE_IP_WINDOWS par l'IP trouvée à l'étape 4
echo "NEXT_PUBLIC_API_URL=http://VOTRE_IP_WINDOWS:3001" > .env.local

# Redémarrer le frontend (Ctrl+C puis npm run dev)
```

### 6️⃣ Partager le Lien

**URL à partager** : `http://VOTRE_IP_WINDOWS:3000`

Remplacez `VOTRE_IP_WINDOWS` par l'IP trouvée à l'étape 4.

## ✅ Vérification

**Depuis Windows** :
```powershell
curl http://localhost:3000
curl http://localhost:3001/health
```

**Depuis un autre appareil** :
```bash
curl http://VOTRE_IP_WINDOWS:3000
curl http://VOTRE_IP_WINDOWS:3001/health
```

## 🔧 Dépannage

### Les serveurs ne démarrent pas ?
- Vérifiez que les ports 3000 et 3001 sont libres
- Vérifiez que les dépendances sont installées (`npm install`)

### Le port forwarding ne fonctionne pas ?
- Assurez-vous d'exécuter PowerShell en tant qu'Administrateur
- Vérifiez le firewall Windows

### Le lien ne fonctionne pas depuis un autre appareil ?
- Vérifiez que les appareils sont sur le même réseau Wi-Fi
- Vérifiez que le firewall Windows autorise les connexions entrantes


