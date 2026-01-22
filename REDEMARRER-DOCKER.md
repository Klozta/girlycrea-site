# 🔄 Redémarrer Docker avec les secrets

## ✅ Corrections appliquées

1. **Ports modifiés** : PostgreSQL (5433) et Redis (6380)
2. **Secrets ajoutés** dans `docker-compose.yml` avec valeurs par défaut
3. **`env_file: .env`** ajouté pour charger vos secrets depuis `.env`

## 🚀 Redémarrer les services

```bash
# Arrêter tous les conteneurs
sudo docker-compose down

# Redémarrer avec les nouvelles configurations
sudo docker-compose up -d

# Voir les logs du backend
sudo docker-compose logs -f backend
```

## 🔍 Vérifier que ça fonctionne

```bash
# Voir l'état des conteneurs
sudo docker-compose ps

# Tous les conteneurs doivent être "Up" (sauf frontend qui peut avoir un problème)
```

## ❌ Si le backend échoue encore

Vérifiez que votre fichier `.env` contient bien :

```bash
cat .env | grep -E '(JWT_REFRESH_SECRET|ADMIN_TOKEN|REVALIDATE_SECRET)'
```

Si les secrets manquent, ajoutez-les dans `.env` :

```bash
# Générer de nouveaux secrets
openssl rand -hex 32
```

## 🐛 Frontend Exit 128

Le frontend a quitté avec le code 128. Vérifiez les logs :

```bash
sudo docker-compose logs frontend
```

Causes possibles :
- Permissions insuffisantes
- Port 3000 déjà utilisé
- Erreur de build

## 📝 Note importante

Après avoir ajouté votre utilisateur au groupe docker, **redémarrez votre terminal WSL2** pour utiliser `docker-compose` sans `sudo`.

