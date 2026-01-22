# 🪟 Instructions pour Windows PowerShell

## ⚠️ IMPORTANT

Les commandes PowerShell doivent être exécutées **sur Windows**, pas dans WSL2 !

## 🚀 Méthode 1 : Script Automatique (Recommandé)

### Étape 1 : Copier le script sur Windows

**Dans WSL2** :
```bash
cp /home/ghislain/girlycrea-site/port-forward.ps1 /mnt/c/Users/VotreNom/Desktop/
```

Remplacez `VotreNom` par votre nom d'utilisateur Windows.

### Étape 2 : Exécuter sur Windows PowerShell (Admin)

1. Ouvrez **PowerShell** en tant qu'**Administrateur** sur Windows
2. Naviguez vers le Desktop :
```powershell
cd C:\Users\VotreNom\Desktop
```
3. Exécutez le script :
```powershell
.\port-forward.ps1
```

## 🔧 Méthode 2 : Commandes Manuelles

**Sur Windows PowerShell (Admin)** :

```powershell
# Récupérer l'IP WSL2
$wslIP = (wsl hostname -I).Trim()

# Forwarder les ports
netsh interface portproxy add v4tov4 listenport=3000 listenaddress=0.0.0.0 connectport=3000 connectaddress=$wslIP
netsh interface portproxy add v4tov4 listenport=3001 listenaddress=0.0.0.0 connectport=3001 connectaddress=$wslIP

# Vérifier
netsh interface portproxy show all
```

## 📍 Méthode 3 : Depuis WSL2 (Génère les commandes)

**Dans WSL2** :
```bash
./setup-port-forward.sh
```

Puis copiez les commandes PowerShell affichées et exécutez-les sur Windows.

## ✅ Vérification

**Sur Windows PowerShell** :
```powershell
# Vérifier que les ports sont forwardés
netsh interface portproxy show all

# Tester depuis Windows
curl http://localhost:3001/health
```

## 🔗 Trouver votre IP Windows

**Sur Windows PowerShell** :
```powershell
ipconfig | findstr IPv4
```

Vous obtiendrez quelque chose comme : `192.168.1.xxx` ou `10.x.x.x`

## 📱 URL à Partager

Une fois le port forwarding configuré :
```
http://VOTRE_IP_WINDOWS:3000
```

Remplacez `VOTRE_IP_WINDOWS` par l'IP trouvée ci-dessus.


