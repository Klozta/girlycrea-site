# 🔍 Diagnostic Complet - GirlyCrea

**Date**: 2025-12-30

---

## 📋 Checklist de Diagnostic

Utilisez cette checklist pour identifier le problème:

### Services Système

- [ ] PostgreSQL démarré (`systemctl is-active postgresql`)
- [ ] Redis démarré (`systemctl is-active redis-server`)

### Applications

- [ ] Backend démarré (processus `tsx` actif)
- [ ] Frontend démarré (processus `next dev` actif)

### Ports

- [ ] Port 5432 (PostgreSQL) utilisé
- [ ] Port 6379 (Redis) utilisé
- [ ] Port 3001 (Backend) utilisé
- [ ] Port 3000 (Frontend) utilisé

### Connexions

- [ ] Backend répond (`curl http://localhost:3001/health`)
- [ ] Frontend répond (`curl http://localhost:3000`)
- [ ] PostgreSQL accessible (`psql -U girlycrea_user -d girlycrea -h localhost`)
- [ ] Redis accessible (`redis-cli ping`)

### Configuration

- [ ] Fichier `.env` existe dans backend
- [ ] Fichier `.env.local` existe dans frontend
- [ ] Variables `PORT`, `DATABASE_URL`, `REDIS_URL` définies
- [ ] Variable `NEXT_PUBLIC_API_URL` définie dans frontend

---

## 🐛 Problèmes Courants et Solutions

### Problème: Backend ne démarre pas

**Symptômes:**
- Port 3001 non utilisé
- `curl http://localhost:3001/health` échoue

**Solutions:**
```bash
# Vérifier les logs
cd /home/ghislain/girlycrea-site
npm run dev

# Erreurs communes:
# - "tsx: not found" → npm install
# - "Cannot connect to database" → Vérifier PostgreSQL démarré
# - "Port already in use" → pkill -f "tsx.*index.ts"
```

### Problème: Frontend ne démarre pas

**Symptômes:**
- Port 3000 non utilisé
- `curl http://localhost:3000` échoue

**Solutions:**
```bash
# Vérifier les logs
cd /home/ghislain/girlycrea-site/frontend
npm run dev

# Erreurs communes:
# - "Port already in use" → pkill -f "next.*dev"
# - "Module not found" → npm install
```

### Problème: Frontend ne se connecte pas au Backend

**Symptômes:**
- `ERR_CONNECTION_REFUSED` dans la console
- BackendStatus rouge

**Solutions:**
```bash
# Vérifier que le backend tourne
curl http://localhost:3001/health

# Vérifier la variable d'environnement
cat frontend/.env.local | grep API_URL
# Devrait être: NEXT_PUBLIC_API_URL=http://localhost:3001

# Redémarrer le frontend après modification
cd frontend && npm run dev
```

### Problème: PostgreSQL non accessible

**Symptômes:**
- Erreur "connection refused" ou "peer authentication failed"

**Solutions:**
```bash
# Vérifier que PostgreSQL est démarré
sudo systemctl status postgresql

# Redémarrer si nécessaire
sudo systemctl restart postgresql

# Vérifier la connexion
PGPASSWORD=local_dev_password psql -U girlycrea_user -d girlycrea -h localhost -c "SELECT 1;"
```

### Problème: Redis non accessible

**Symptômes:**
- Erreur "connection refused"

**Solutions:**
```bash
# Vérifier que Redis est démarré
sudo systemctl status redis-server

# Redémarrer si nécessaire
sudo systemctl restart redis-server

# Vérifier la connexion
redis-cli ping
```

---

## 🚀 Redémarrage Complet

Si rien ne fonctionne, redémarrer tout:

```bash
# 1. Arrêter tout
pkill -f "tsx.*index.ts"
pkill -f "next.*dev"

# 2. Redémarrer services
sudo systemctl restart postgresql redis-server
sleep 3

# 3. Vérifier services
systemctl is-active postgresql redis-server
redis-cli ping
PGPASSWORD=local_dev_password psql -U girlycrea_user -d girlycrea -h localhost -c "SELECT 1;"

# 4. Redémarrer Backend (Terminal 1)
cd /home/ghislain/girlycrea-site
npm run dev

# 5. Redémarrer Frontend (Terminal 2)
cd /home/ghislain/girlycrea-site/frontend
npm run dev
```

---

## 📞 Informations à Fournir pour Aide

Si ça ne marche toujours pas, envoyez-moi:

1. **Résultat du diagnostic:**
   ```bash
   bash scripts/restart-all.sh
   ```

2. **Logs Backend:**
   ```bash
   cd /home/ghislain/girlycrea-site
   npm run dev
   # Copier les erreurs
   ```

3. **Logs Frontend:**
   ```bash
   cd /home/ghislain/girlycrea-site/frontend
   npm run dev
   # Copier les erreurs
   ```

4. **Test de connexion:**
   ```bash
   curl http://localhost:3001/health
   curl http://localhost:3000
   ```

---

**Utilisez cette checklist pour identifier le problème précis! 🔍**



