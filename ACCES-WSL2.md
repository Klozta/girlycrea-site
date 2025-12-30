# 🌐 Accès Réseau Local - WSL2

**⚠️ PROBLÈME : WSL2 isole le réseau, les ports ne sont pas accessibles directement**

## 🔍 Diagnostic

Vous êtes sur **WSL2** qui utilise un réseau virtuel isolé. L'IP `172.24.241.227` n'est **pas accessible** depuis Windows ou d'autres appareils.

## ✅ Solution : Port Forwarding Windows

### Étape 1 : Exécuter le script PowerShell sur Windows

**Sur Windows PowerShell (en tant qu'Administrateur)** :

```powershell
cd \\wsl$\Ubuntu\home\ghislain\girlycrea-site
.\port-forward.ps1
```

**OU copiez le script sur Windows** et exécutez-le :
```powershell
# Copier depuis WSL vers Windows
cp /home/ghislain/girlycrea-site/port-forward.ps1 /mnt/c/Users/VotreNom/Desktop/
```

Puis sur Windows :
```powershell
cd C:\Users\VotreNom\Desktop
.\port-forward.ps1
```

### Étape 2 : Trouver l'IP Windows

Sur Windows PowerShell :
```powershell
ipconfig | findstr IPv4
```

Vous obtiendrez quelque chose comme : `192.168.1.xxx` ou `10.x.x.x`

### Étape 3 : Configurer le frontend avec l'IP Windows

**Dans WSL2** :
```bash
cd frontend
# Remplacez 192.168.1.xxx par votre IP Windows
echo "NEXT_PUBLIC_API_URL=http://192.168.1.xxx:3001" > .env.local
```

### Étape 4 : Démarrer les serveurs

Les serveurs doivent déjà être démarrés et écouter sur `0.0.0.0`.

## 🔗 URLs à partager

**Depuis Windows** : `http://localhost:3000`  
**Depuis autres appareils** : `http://IP_WINDOWS:3000`

Remplacez `IP_WINDOWS` par l'IP trouvée à l'étape 2.

## 🧪 Test

**Depuis Windows** :
```powershell
curl http://localhost:3001/health
```

**Depuis un autre appareil** :
```bash
curl http://IP_WINDOWS:3001/health
```

## 🔧 Alternative : Script manuel

Si le script PowerShell ne fonctionne pas, exécutez manuellement sur Windows (PowerShell Admin) :

```powershell
$wslIP = (wsl hostname -I).Trim()
netsh interface portproxy add v4tov4 listenport=3000 listenaddress=0.0.0.0 connectport=3000 connectaddress=$wslIP
netsh interface portproxy add v4tov4 listenport=3001 listenaddress=0.0.0.0 connectport=3001 connectaddress=$wslIP
```

## ❌ Annuler le port forwarding

```powershell
netsh interface portproxy delete v4tov4 listenport=3000 listenaddress=0.0.0.0
netsh interface portproxy delete v4tov4 listenport=3001 listenaddress=0.0.0.0
```
