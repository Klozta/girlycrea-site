# 🔄 Commandes de Redémarrage Complet

**Guide pour redémarrer tous les services GirlyCrea**

---

## 🚀 Méthode Rapide (Script)

```bash
bash scripts/restart-all.sh
```

Ce script va:
1. ✅ Arrêter Backend et Frontend
2. ✅ Redémarrer PostgreSQL
3. ✅ Redémarrer Redis
4. ✅ Vérifier que tout fonctionne

---

## 📋 Méthode Manuelle

### Étape 1: Arrêter Backend et Frontend

Dans les terminaux où ils tournent:
- **Backend**: `Ctrl+C`
- **Frontend**: `Ctrl+C`

Ou tuer les processus:
```bash
pkill -f "tsx.*src/index.ts"
pkill -f "next.*dev"
```

### Étape 2: Redémarrer les Services Système

```bash
# PostgreSQL
sudo systemctl restart postgresql

# Redis
sudo systemctl restart redis-server
```

### Étape 3: Vérifier les Services

```bash
# PostgreSQL
PGPASSWORD=local_dev_password psql -U girlycrea_user -d girlycrea -h localhost -c "SELECT 1;"

# Redis
redis-cli ping
```

### Étape 4: Redémarrer Backend et Frontend

**Terminal 1 - Backend:**
```bash
cd /home/ghislain/girlycrea-site
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd /home/ghislain/girlycrea-site/frontend
npm run dev
```

---

## ✅ Vérification Finale

Une fois tout redémarré:

1. **Backend**: http://localhost:3001/health
   ```bash
   curl http://localhost:3001/health
   ```

2. **Frontend**: http://localhost:3000
   - Ouvrir dans le navigateur
   - Vérifier qu'il n'y a pas d'erreurs

3. **Services**:
   ```bash
   # PostgreSQL
   PGPASSWORD=local_dev_password psql -U girlycrea_user -d girlycrea -h localhost -c "SELECT version();"
   
   # Redis
   redis-cli ping
   ```

---

## 🐛 Si ça ne marche toujours pas

### Réinitialiser complètement

```bash
# 1. Arrêter tout
pkill -f "tsx.*src/index.ts"
pkill -f "next.*dev"

# 2. Redémarrer services
sudo systemctl restart postgresql redis-server

# 3. Attendre 5 secondes
sleep 5

# 4. Vérifier
systemctl is-active postgresql redis-server

# 5. Redémarrer applications
cd /home/ghislain/girlycrea-site && npm run dev &
cd /home/ghislain/girlycrea-site/frontend && npm run dev &
```

---

**Utilisez le script `scripts/restart-all.sh` pour un redémarrage automatique! 🚀**



