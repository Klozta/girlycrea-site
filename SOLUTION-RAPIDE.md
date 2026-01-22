# ⚡ Solution Rapide - Site Ne Fonctionne Pas

**Diagnostic et solution immédiate**

---

## 🔍 Diagnostic Automatique

Exécutez cette commande pour voir l'état:

```bash
cd /home/ghislain/girlycrea-site
bash scripts/test-local.sh
```

---

## 🚀 Solution en 2 Étapes

### Étape 1: Démarrer le Backend

**Ouvrir Terminal 1:**

```bash
cd /home/ghislain/girlycrea-site
npm run dev
```

**Attendre de voir:**
```
✅ GirlyCrea Backend started
[INFO] Server running on port 3001
```

### Étape 2: Démarrer le Frontend

**Ouvrir Terminal 2 (NOUVEAU terminal):**

```bash
cd /home/ghislain/girlycrea-site/frontend
npm run dev
```

**Attendre de voir:**
```
▲ Next.js 15.5.9
- Local:        http://localhost:3000
✓ Ready in 2s
```

---

## ✅ Vérification

Une fois les deux démarrés:

1. **Test Backend:**
   ```bash
   curl http://localhost:3001/health
   ```
   Devrait répondre: `{"status":"ok",...}`

2. **Ouvrir le navigateur:**
   - Aller sur: http://localhost:3000
   - Le site devrait s'afficher

---

## 🐛 Erreurs Courantes

### "tsx: not found"
```bash
cd /home/ghislain/girlycrea-site
npm install
npm run dev
```

### "Port 3001 already in use"
```bash
pkill -f "tsx.*index.ts"
npm run dev
```

### "Port 3000 already in use"
```bash
pkill -f "next.*dev"
cd frontend && npm run dev
```

### "Cannot connect to database"
```bash
sudo systemctl restart postgresql
sleep 2
npm run dev
```

### "ERR_CONNECTION_REFUSED" dans le navigateur
- Vérifier que le backend tourne: `curl http://localhost:3001/health`
- Si non accessible, démarrer le backend (Terminal 1)

---

## 📋 Checklist Complète

- [ ] Terminal 1 ouvert avec Backend démarré (`npm run dev`)
- [ ] Terminal 2 ouvert avec Frontend démarré (`cd frontend && npm run dev`)
- [ ] Backend répond: `curl http://localhost:3001/health`
- [ ] Frontend accessible: http://localhost:3000
- [ ] Pas d'erreurs dans les terminaux
- [ ] Site s'affiche dans le navigateur

---

## 🆘 Si Rien Ne Fonctionne

Envoyez-moi les résultats de:

```bash
# 1. État des ports
netstat -tuln | grep -E ':(3000|3001)' || ss -tuln | grep -E ':(3000|3001)'

# 2. Processus actifs
ps aux | grep -E 'tsx|next' | grep -v grep

# 3. Test Backend
curl http://localhost:3001/health

# 4. Test Frontend
curl http://localhost:3000

# 5. Logs Backend (dans Terminal 1)
# Copier les dernières lignes après npm run dev

# 6. Logs Frontend (dans Terminal 2)
# Copier les dernières lignes après npm run dev
```

---

**Démarrez les deux terminaux maintenant! 🚀**



