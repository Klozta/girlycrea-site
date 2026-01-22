# 🔧 Solution aux Problèmes - Déploiement Local

**Date**: 2025-12-30  
**Problèmes détectés et solutions**

---

## ❌ Problèmes Détectés

### 1. PostgreSQL - Erreur d'authentification
```
psql: error: Peer authentication failed for user "girlycrea_user"
```

**Cause**: PostgreSQL utilise l'authentification "peer" au lieu de "md5"

**Solution**: Modifier `/etc/postgresql/16/main/pg_hba.conf`

### 2. Backend - Dépendances npm manquantes
```
sh: 1: tsx: not found
```

**Cause**: `node_modules` n'existe pas, dépendances non installées

**Solution**: Installer les dépendances avec `npm install`

---

## ✅ Solutions Appliquées

### Solution 1: Corriger PostgreSQL

```bash
# Modifier pg_hba.conf
sudo sed -i 's/local   all             all                                     peer/local   all             all                                     md5/' /etc/postgresql/16/main/pg_hba.conf

# Recharger PostgreSQL
sudo systemctl reload postgresql

# Tester la connexion
PGPASSWORD=local_dev_password psql -U girlycrea_user -d girlycrea -h localhost -c "SELECT 1;"
```

**OU utiliser le script**:
```bash
bash scripts/fix-postgres-auth.sh
```

### Solution 2: Installer les dépendances

```bash
cd /home/ghislain/girlycrea-site
npm install
```

Cela installera toutes les dépendances, y compris `tsx`.

---

## 🧪 Vérification Après Correction

### 1. Vérifier PostgreSQL

```bash
PGPASSWORD=local_dev_password psql -U girlycrea_user -d girlycrea -h localhost -c "SELECT version();"
```

### 2. Vérifier Redis

```bash
redis-cli ping
# Devrait répondre: PONG
```

### 3. Vérifier les dépendances

```bash
cd /home/ghislain/girlycrea-site
ls node_modules/.bin/tsx
# Devrait exister
```

### 4. Démarrer le backend

```bash
cd /home/ghislain/girlycrea-site
npm run dev
```

Le backend devrait démarrer sur http://localhost:3001

---

## 📝 Mise à Jour du Fichier .env

Assurez-vous que votre `.env` contient:

```env
DATABASE_URL=postgresql://girlycrea_user:local_dev_password@localhost:5432/girlycrea
```

**Important**: Utiliser `localhost` et non pas la socket Unix pour éviter les problèmes d'authentification.

---

## 🚀 Démarrage Complet

Une fois les corrections appliquées:

### Terminal 1 - Backend
```bash
cd /home/ghislain/girlycrea-site
npm run dev
```

### Terminal 2 - Frontend
```bash
cd /home/ghislain/girlycrea-site/frontend
npm run dev
```

### Test dans le navigateur
- Frontend: http://localhost:3000
- API: http://localhost:3001/health

---

## ✅ Checklist de Vérification

- [ ] PostgreSQL authentification corrigée (md5 au lieu de peer)
- [ ] Dépendances npm installées (`npm install`)
- [ ] PostgreSQL accessible avec mot de passe
- [ ] Redis fonctionne (`redis-cli ping`)
- [ ] Backend démarre sans erreur
- [ ] Frontend démarre sans erreur
- [ ] Application accessible dans le navigateur

---

## 🆘 Si ça ne marche toujours pas

### Vérifier les logs

```bash
# Logs backend
npm run dev

# Logs PostgreSQL
sudo journalctl -u postgresql -n 50

# Logs Redis
sudo journalctl -u redis-server -n 50
```

### Vérifier les ports

```bash
# Vérifier que les ports sont libres
netstat -tuln | grep -E ':(3000|3001|5432|6379)'
```

### Réinitialiser si nécessaire

```bash
# Réinstaller dépendances
rm -rf node_modules package-lock.json
npm install

# Redémarrer services
sudo systemctl restart postgresql redis-server
```

---

**Une fois ces corrections appliquées, tout devrait fonctionner! 🚀**



