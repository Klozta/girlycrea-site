# 🌐 Accès Réseau Local

## 🚀 Configuration Rapide

### 1. Trouver votre IP
```bash
hostname -I
```

### 2. Configurer Frontend
```bash
# Modifier frontend/.env.local
NEXT_PUBLIC_API_URL=http://VOTRE_IP:3001
```

### 3. Démarrer avec accès réseau
```bash
# Terminal 1 - Backend (déjà OK)
cd /home/ghislain/girlycrea-site
npm run dev

# Terminal 2 - Frontend
cd frontend
npm run dev -- -H 0.0.0.0
```

### 4. Ouvrir Firewall
```bash
sudo ufw allow 3000/tcp
sudo ufw allow 3001/tcp
```

## 📱 URL à Partager
```
http://VOTRE_IP:3000
```

**Remplacez VOTRE_IP par l'IP trouvée à l'étape 1**
