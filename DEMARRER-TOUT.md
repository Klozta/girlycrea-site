# 🚀 Démarrer Tout - Instructions Simples

**Problème identifié**: Backend et Frontend ne sont pas démarrés

---

## ✅ État Actuel

- ✅ PostgreSQL: Fonctionne
- ✅ Redis: Fonctionne
- ❌ **Backend: NON DÉMARRÉ**
- ❌ **Frontend: NON DÉMARRÉ**

---

## 🚀 Solution: Démarrer Backend et Frontend

### Terminal 1 - Backend

```bash
cd /home/ghislain/girlycrea-site
npm run dev
```

**Vous devriez voir:**
```
✅ GirlyCrea Backend started
[INFO] Server running on port 3001
```

**⚠️ Ne fermez PAS ce terminal!**

### Terminal 2 - Frontend

**Ouvrir un NOUVEAU terminal** et exécuter:

```bash
cd /home/ghislain/girlycrea-site/frontend
npm run dev
```

**Vous devriez voir:**
```
▲ Next.js 15.5.9
- Local:        http://localhost:3000
✓ Ready in 2s
```

**⚠️ Ne fermez PAS ce terminal non plus!**

---

## 🧪 Vérification

Une fois les deux démarrés:

1. **Test Backend:**
   ```bash
   curl http://localhost:3001/health
   ```
   Devrait répondre: `{"status":"ok",...}`

2. **Test Frontend:**
   - Ouvrir http://localhost:3000 dans votre navigateur
   - La page devrait s'afficher

---

## 📋 Checklist

- [ ] Terminal 1 ouvert avec Backend démarré
- [ ] Terminal 2 ouvert avec Frontend démarré
- [ ] Backend répond sur http://localhost:3001/health
- [ ] Frontend accessible sur http://localhost:3000
- [ ] Pas d'erreurs dans les terminaux
- [ ] Site fonctionne dans le navigateur

---

## 🐛 Si ça ne démarre pas

### Backend ne démarre pas

```bash
# Vérifier les dépendances
cd /home/ghislain/girlycrea-site
npm install

# Vérifier les logs
npm run dev
# Copier les erreurs et me les envoyer
```

### Frontend ne démarre pas

```bash
# Vérifier les dépendances
cd /home/ghislain/girlycrea-site/frontend
npm install

# Vérifier les logs
npm run dev
# Copier les erreurs et me les envoyer
```

---

## ⚠️ Important

**Les deux terminaux doivent rester ouverts!**

- Si vous fermez un terminal, l'application correspondante s'arrête
- Pour arrêter: `Ctrl+C` dans le terminal
- Pour redémarrer: relancer `npm run dev`

---

**Démarrez les deux terminaux maintenant! 🚀**



