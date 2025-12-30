# 🚀 Démarrage Rapide - Frontend GirlyCrea

## ⚡ Installation en 3 étapes

### 1. Installer les dépendances

```bash
cd frontend
npm install
```

### 2. Configurer l'environnement

Créez un fichier `.env.local` à la racine du dossier `frontend` :

```bash
NEXT_PUBLIC_API_URL=http://localhost:3001
```

**Important** : Assurez-vous que le backend tourne sur le port 3001.

### 3. Lancer le serveur de développement

```bash
npm run dev
```

Le site sera accessible sur `http://localhost:3002`

---

## ✅ Vérifications

### Backend accessible

Vérifiez que le backend répond :

```bash
curl http://localhost:3001/health
```

### Frontend accessible

Ouvrez votre navigateur sur `http://localhost:3002`

Vous devriez voir la page d'accueil avec :
- Hero section
- Catégories
- Produits en vedette

---

## 🐛 Dépannage

### Erreur "Module not found"

```bash
# Supprimer node_modules et réinstaller
rm -rf node_modules package-lock.json
npm install
```

### Erreur de connexion API

Vérifiez que :
1. Le backend est lancé (`npm run dev` dans le dossier racine)
2. Le port 3001 est libre
3. La variable `NEXT_PUBLIC_API_URL` dans `.env.local` est correcte

### Erreur TypeScript

```bash
# Vérifier les types
npm run type-check
```

---

## 📝 Première utilisation

1. **Créer un compte** : Cliquez sur "Connexion" → "Créer un compte"
2. **Parcourir les produits** : Cliquez sur "Boutique"
3. **Ajouter au panier** : Cliquez sur un produit → "Ajouter au panier"
4. **Passer commande** : Panier → "Passer la commande"

---

## 🎨 Personnalisation

### Modifier les couleurs

Éditez `tailwind.config.js` :

```js
colors: {
  primary: {
    500: '#votre-couleur',
    // ...
  }
}
```

### Modifier le logo

Remplacez le texte "GirlyCrea" dans `components/Header.tsx` par votre logo.

---

**Frontend prêt ! 🎉**


