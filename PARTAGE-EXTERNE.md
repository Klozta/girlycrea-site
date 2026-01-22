# 🌐 Partager avec quelqu'un hors de votre réseau

## ⚠️ Problème Local d'abord

Avant de partager à distance, vérifions que ça fonctionne localement.

## 🔍 Diagnostic Local

### 1. Vérifier que les serveurs tournent

**Dans WSL2** :
```bash
ps aux | grep -E "(next|node.*3000|node.*3001)" | grep -v grep
ss -tuln | grep -E ':(3000|3001)'
```

### 2. Vérifier le firewall Windows

**Sur Windows PowerShell (Admin)** :
```powershell
# Vérifier les règles de firewall
netsh advfirewall firewall show rule name=all | findstr "3000\|3001"

# Autoriser les ports si nécessaire
netsh advfirewall firewall add rule name="GirlyCrea Frontend" dir=in action=allow protocol=TCP localport=3000
netsh advfirewall firewall add rule name="GirlyCrea Backend" dir=in action=allow protocol=TCP localport=3001
```

### 3. Tester depuis Windows

**Sur Windows PowerShell** :
```powershell
curl http://localhost:3000
curl http://localhost:3001/health
curl http://192.168.1.40:3000
```

## 🌍 Solution pour Partager Hors Réseau

### Option 1 : ngrok (Recommandé - Simple et Rapide)

**Installation** :
```bash
# Sur Windows, téléchargez depuis : https://ngrok.com/download
# OU dans WSL2 :
wget https://bin.equinox.io/c/bNyj1mQVY4c/ngrok-v3-stable-linux-amd64.tgz
tar xvzf ngrok-v3-stable-linux-amd64.tgz
sudo mv ngrok /usr/local/bin/
```

**Utilisation** :
```bash
# Terminal 3 - Tunnel pour le frontend
ngrok http 3000

# Terminal 4 - Tunnel pour le backend (si nécessaire)
ngrok http 3001
```

**Partagez l'URL** : `https://xxxx-xxxx.ngrok-free.app`

### Option 2 : Cloudflare Tunnel (Gratuit, Plus Stable)

**Installation** :
```bash
# Dans WSL2
wget https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64
chmod +x cloudflared-linux-amd64
sudo mv cloudflared-linux-amd64 /usr/local/bin/cloudflared
```

**Utilisation** :
```bash
# Tunnel pour le frontend
cloudflared tunnel --url http://localhost:3000
```

**Partagez l'URL** : `https://xxxx.trycloudflare.com`

### Option 3 : localtunnel (Simple, Gratuit)

**Installation** :
```bash
npm install -g localtunnel
```

**Utilisation** :
```bash
# Tunnel pour le frontend
lt --port 3000

# Tunnel pour le backend
lt --port 3001
```

**Partagez l'URL** : `https://xxxx.loca.lt`

## ⚙️ Configuration Frontend pour Tunnel

Si vous utilisez un tunnel, le frontend doit pointer vers le tunnel du backend :

```bash
cd frontend
# Remplacez par l'URL du tunnel backend
echo "NEXT_PUBLIC_API_URL=https://BACKEND_TUNNEL_URL" > .env.local
```

## 🔧 Solution Alternative : Port Forwarding Routeur

Si vous avez accès à votre routeur :

1. Accédez à l'interface admin du routeur (généralement `192.168.1.1`)
2. Configurez le port forwarding :
   - Port externe 3000 → Port interne 3000 → IP 192.168.1.40
   - Port externe 3001 → Port interne 3001 → IP 192.168.1.40
3. Trouvez votre IP publique : `curl ifconfig.me`
4. Partagez : `http://VOTRE_IP_PUBLIQUE:3000`

**⚠️ Attention** : Cette méthode expose votre serveur à Internet. Utilisez uniquement pour des tests.

## ✅ Recommandation

**Pour un test rapide** : Utilisez **ngrok** ou **Cloudflare Tunnel**
**Pour un déploiement** : Utilisez un service cloud (Vercel, Netlify, etc.)

