# 🚀 Commandes de Démarrage Complet

**Guide étape par étape pour démarrer l'application**

---

## 📋 Prérequis

Avant de démarrer, vérifiez que les services sont actifs:

```bash
# PostgreSQL
sudo systemctl status postgresql
# Devrait être: active

# Redis
sudo systemctl status redis-server
# Devrait être: active
```

Si non actifs, démarrer:
```bash
sudo systemctl start postgresql
sudo systemctl start redis-server
```

---

## 🚀 Démarrage en 2 Terminaux

### Terminal 1 - Backend

```bash
# Aller dans le dossier backend
cd /home/ghislain/girlycrea-site

# Vérifier que .env existe
ls -la .env

# Démarrer le backend
npm run dev
```

**Vous devriez voir:**
```
✅ GirlyCrea Backend started
[INFO] Server running on port 3001
```

**Si erreur**, vérifier:
- Fichier `.env` existe
- Dépendances installées: `npm install`
- PostgreSQL et Redis démarrés

### Terminal 2 - Frontend

```bash
# Aller dans le dossier frontend
cd /home/ghislain/girlycrea-site/frontend

# Vérifier que .env.local existe
ls -la .env.local

# Démarrer le frontend
npm run dev
```

**Vous devriez voir:**
```
▲ Next.js 15.5.9
- Local:        http://localhost:3000
✓ Ready in 2s
```

**Si erreur**, vérifier:
- Fichier `.env.local` existe avec `NEXT_PUBLIC_API_URL=http://localhost:3001`
- Dépendances installées: `npm install`

---

## 🧪 Tests de Vérification

### Dans un Terminal 3 (optionnel):

```bash
# Test Backend
curl http://localhost:3001/health
# Devrait répondre: {"status":"ok",...}

# Test Frontend
curl http://localhost:3000
# Devrait retourner du HTML

# Test PostgreSQL
PGPASSWORD=local_dev_password psql -U girlycrea_user -d girlycrea -h localhost -c "SELECT 1;"
# Devrait répondre: 1

# Test Redis
redis-cli ping
# Devrait répondre: PONG
```

---

## 🌐 Accès à l'Application

Une fois les deux terminaux démarrés:

1. **Ouvrir le navigateur**: http://localhost:3000
2. **Vérifier**:
   - Page s'affiche
   - Pas d'erreurs `ERR_CONNECTION_REFUSED`
   - BackendStatus devrait être vert

---

## 🐛 Problèmes Courants

### Backend ne démarre pas

```bash
# Vérifier les logs
npm run dev

# Erreurs communes:
# - "tsx: not found" → npm install
# - "Cannot connect to database" → Vérifier PostgreSQL démarré
# - "Port 3001 already in use" → Trouver et tuer le processus
```

### Frontend ne démarre pas

```bash
# Vérifier les logs
cd frontend && npm run dev

# Erreurs communes:
# - "Port 3000 already in use" → Trouver et tuer le processus
# - "Module not found" → npm install dans frontend/
```

### Frontend ne se connecte pas au backend

```bash
# Vérifier que le backend tourne
curl http://localhost:3001/health

# Vérifier la variable d'environnement
cat frontend/.env.local | grep API_URL
# Devrait être: NEXT_PUBLIC_API_URL=http://localhost:3001
```

---

## ✅ Checklist Finale

- [ ] PostgreSQL démarré et accessible
- [ ] Redis démarré et accessible
- [ ] Backend démarré sur port 3001
- [ ] Frontend démarré sur port 3000
- [ ] Application accessible sur http://localhost:3000
- [ ] Pas d'erreurs `ERR_CONNECTION_REFUSED`

---

## 📞 Si ça ne marche toujours pas

Envoyez-moi:
1. Les logs du terminal backend
2. Les logs du terminal frontend
3. Le résultat de `curl http://localhost:3001/health`
4. Le résultat de `curl http://localhost:3000`

---

**Suivez ces étapes dans l'ordre et dites-moi où ça bloque! 🚀**



