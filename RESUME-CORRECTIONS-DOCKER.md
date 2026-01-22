# ✅ Résumé des corrections Docker

## 🔧 Problèmes résolus

### 1. **Ports occupés** ✅
- PostgreSQL : `5432` → `5433` (externe)
- Redis : `6379` → `6380` (externe)
- Ports internes inchangés (les conteneurs communiquent normalement)

### 2. **Secrets manquants** ✅
- Ajout de `env_file: .env` dans `docker-compose.yml`
- Ajout des secrets requis avec valeurs par défaut :
  - `JWT_REFRESH_SECRET`
  - `ADMIN_TOKEN`
  - `REVALIDATE_SECRET`

### 3. **URL API Frontend** ✅
- Changé de `http://localhost:3001` → `http://backend:3001`
- Dans Docker, utiliser le nom du service au lieu de `localhost`

## 🚀 Commandes pour redémarrer

```bash
# Arrêter tous les conteneurs
sudo docker-compose down

# Redémarrer avec les nouvelles configurations
sudo docker-compose up -d

# Voir les logs
sudo docker-compose logs -f backend
sudo docker-compose logs -f frontend
```

## 📊 État attendu

Après redémarrage, vous devriez voir :

```
✅ girlycrea-backend-dev    Up
✅ girlycrea-frontend-dev   Up
✅ girlycrea-postgres-dev   Up (healthy)
✅ girlycrea-redis-dev      Up
```

## 🔍 Vérifications

```bash
# Vérifier l'état
sudo docker-compose ps

# Vérifier les logs du backend (doit démarrer sans erreur)
sudo docker-compose logs backend | tail -20

# Vérifier les logs du frontend
sudo docker-compose logs frontend | tail -20
```

## 🌐 Accès aux services

- **Frontend** : http://localhost:3000
- **Backend** : http://localhost:3001
- **PostgreSQL** : localhost:5433
- **Redis** : localhost:6380

## ⚠️ Note importante

Après avoir ajouté votre utilisateur au groupe docker (`sudo usermod -aG docker $USER`), **redémarrez votre terminal WSL2** pour utiliser `docker-compose` sans `sudo`.

