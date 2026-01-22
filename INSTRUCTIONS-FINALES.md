# 📋 Instructions Finales - Démarrer le Site

**Le fichier `page.tsx` est correct. Le problème est que les applications ne sont pas démarrées.**

---

## ✅ Vérification

- ✅ Fichier `page.tsx` : Correct
- ✅ `'use client'` : Présent (nécessaire pour Next.js)
- ✅ Services système : PostgreSQL et Redis actifs
- ❌ **Backend : NON DÉMARRÉ**
- ❌ **Frontend : NON DÉMARRÉ**

---

## 🚀 Solution Simple

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

**⚠️ Ne PAS fermer ce terminal!**

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

**⚠️ Ne PAS fermer ce terminal non plus!**

### Étape 3: Ouvrir le Site

**Dans votre navigateur:**
- Aller sur: **http://localhost:3000**
- Le site devrait s'afficher!

---

## 🧪 Test Rapide

Une fois les deux démarrés, tester:

```bash
# Test Backend
curl http://localhost:3001/health
# Devrait répondre: {"status":"ok",...}

# Test Frontend (dans navigateur)
# http://localhost:3000
```

---

## ⚠️ Important

**Les deux terminaux doivent rester ouverts!**

- Si vous fermez un terminal → l'application s'arrête
- Pour arrêter: `Ctrl+C` dans le terminal
- Pour redémarrer: relancer `npm run dev`

---

## 🐛 Si ça ne démarre pas

### Erreur Backend

```bash
cd /home/ghislain/girlycrea-site
npm install  # Si erreur "tsx: not found"
npm run dev
```

### Erreur Frontend

```bash
cd /home/ghislain/girlycrea-site/frontend
npm install  # Si erreur "module not found"
npm run dev
```

---

## 📊 État Attendu

Une fois tout démarré:

| Service | Port | URL |
|---------|------|-----|
| Backend | 3001 | http://localhost:3001 |
| Frontend | 3000 | http://localhost:3000 |

---

**Démarrez les deux terminaux maintenant et le site fonctionnera! 🚀**



