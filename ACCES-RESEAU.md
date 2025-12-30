# 🌐 Accès Réseau Local - GirlyCrea

**Rendre l'application accessible depuis d'autres appareils sur votre réseau**

## 🚀 Étapes Rapides

### 1. Trouver votre IP locale
```bash
hostname -I | awk '{print $1}'
```
**Votre IP** : `172.24.241.227`

### 2. Configurer le Backend (CORS)
Le backend accepte déjà les requêtes en développement. Vérifiez que `.env` contient :
```bash
NODE_ENV=development
HOST=0.0.0.0
```

### 3. Configurer le Frontend
```bash
cd frontend
echo "NEXT_PUBLIC_API_URL=http://172.24.241.227:3001" >> .env.local
```

### 4. Démarrer les serveurs

**Backend** (déjà configuré pour écouter sur toutes les interfaces) :
```bash
cd backend
npm run dev
```

**Frontend** (écouter sur toutes les interfaces) :
```bash
cd frontend
npm run dev -- -H 0.0.0.0
```

### 5. Ouvrir les ports (si firewall actif)
```bash
sudo ufw allow 3000/tcp
sudo ufw allow 3001/tcp
```

## 🔗 URL à partager

**Frontend** : `http://172.24.241.227:3000`  
**Backend API** : `http://172.24.241.227:3001`

## 🚀 Script automatique

Utilisez le script pour démarrer facilement :
```bash
./demarrer-reseau-local.sh
```

Puis dans **2 terminaux séparés** :
```bash
# Terminal 1 - Backend
cd backend && npm run dev

# Terminal 2 - Frontend  
cd frontend && npm run dev
```

## ✅ Vérification

Depuis un autre appareil sur le même réseau :
```bash
curl http://172.24.241.227:3001/health
```

## 📝 Notes

- Les deux serveurs doivent être démarrés
- Les appareils doivent être sur le même réseau Wi-Fi/Ethernet
- En développement, le backend accepte toutes les origines
