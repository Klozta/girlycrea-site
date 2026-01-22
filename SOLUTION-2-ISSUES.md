# 🔧 Solution aux 2 Issues

**Date**: 2025-12-30

---

## ❌ Issue 1: Backend Non Accessible (CRITIQUE)

### Problème
```
ERR_CONNECTION_REFUSED sur http://localhost:3001
Error: Impossible de se connecter au backend
```

### Cause
Le backend n'est **pas démarré**. Le port 3001 n'est pas utilisé.

### Solution

**Démarrer le backend dans un terminal:**

```bash
cd /home/ghislain/girlycrea-site
npm run dev
```

Vous devriez voir:
```
✅ GirlyCrea Backend started
[INFO] Server running on port 3001
```

### Vérification

Une fois le backend démarré:
```bash
# Test dans un autre terminal
curl http://localhost:3001/health
# Devrait répondre: {"status":"ok",...}
```

---

## ⚠️ Issue 2: Erreurs MetaMask (NON BLOQUANT)

### Problème
```
Uncaught TypeError: Cannot set property ethereum of #<Window>
MetaMask encountered an error setting the global Ethereum provider
```

### Cause
Ces erreurs sont **normales** et causées par:
- Extensions de navigateur (MetaMask, autres wallets)
- Conflits entre extensions Ethereum
- **Ce n'est PAS un problème de votre code**

### Solution

**Ces erreurs peuvent être IGNORÉES** car:
- ✅ Elles n'affectent pas votre application
- ✅ Elles sont causées par les extensions du navigateur
- ✅ Votre application fonctionne quand même

**Si vous voulez les masquer** (optionnel):
- Désactiver temporairement les extensions MetaMask/autres wallets
- Ou les ignorer complètement (recommandé)

---

## 📋 Checklist Complète

### Pour que le site fonctionne:

- [ ] **Backend démarré** (Terminal 1)
  ```bash
  cd /home/ghislain/girlycrea-site
  npm run dev
  ```

- [ ] **Frontend démarré** (Terminal 2)
  ```bash
  cd /home/ghislain/girlycrea-site/frontend
  npm run dev
  ```

- [ ] **Services système actifs**
  - PostgreSQL: `sudo systemctl status postgresql`
  - Redis: `sudo systemctl status redis-server`

### Vérification finale:

1. **Backend**: http://localhost:3001/health
2. **Frontend**: http://localhost:3000
3. **Pas d'erreurs** dans la console (sauf MetaMask - normal)

---

## 🚀 Commandes Rapides

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

### Terminal 3 - Tests (optionnel)
```bash
# Test backend
curl http://localhost:3001/health

# Test Redis
redis-cli ping

# Test PostgreSQL
PGPASSWORD=local_dev_password psql -U girlycrea_user -d girlycrea -h localhost -c "SELECT 1;"
```

---

## ✅ Résultat Attendu

Une fois les deux terminaux démarrés:

- ✅ Backend accessible sur http://localhost:3001
- ✅ Frontend accessible sur http://localhost:3000
- ✅ Pas d'erreurs de connexion
- ⚠️ Erreurs MetaMask peuvent apparaître (normal, ignorer)

---

## 🐛 Si ça ne marche toujours pas

### Backend ne démarre pas

```bash
# Vérifier les logs
npm run dev

# Vérifier le fichier .env
cat .env | grep -E "PORT|DATABASE_URL|REDIS"
```

### Frontend ne se connecte pas au backend

```bash
# Vérifier que le backend tourne
curl http://localhost:3001/health

# Vérifier la variable d'environnement frontend
cat frontend/.env.local | grep API_URL
```

---

**Démarrez le backend maintenant et le site devrait fonctionner! 🚀**



