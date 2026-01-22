# 🐳 GirlyCrea - Docker Production Setup

Guide pour tester GirlyCrea en mode production avec Docker Compose avant déploiement.

## 📋 Prérequis

- Docker et Docker Compose installés
- Ports disponibles : 3000, 3001, 5433, 6380
- Variables d'environnement configurées (voir `env.prod.template`)

## 🚀 Démarrage rapide

### 1. Configurer les variables d'environnement

```bash
# Copier le template
cp env.prod.template .env.prod

# Éditer et remplir les valeurs
nano .env.prod
```

**Variables critiques à configurer :**
- `POSTGRES_PASSWORD` : Mot de passe PostgreSQL (fort)
- `REDIS_PASSWORD` : Mot de passe Redis (optionnel)
- `JWT_SECRET` : Secret JWT (64 caractères aléatoires)
- `JWT_REFRESH_SECRET` : Secret JWT Refresh (64 caractères aléatoires)
- `RESEND_API_KEY` ou `MAILGUN_API_KEY` : Pour les emails

### 2. Builder les images Docker

```bash
docker-compose -f docker-compose.prod.yml build
```

Cela va :
- Builder le backend (TypeScript → JavaScript)
- Builder le frontend (Next.js standalone)
- Préparer les images optimisées

### 3. Démarrer les services

```bash
docker-compose -f docker-compose.prod.yml up -d
```

Services démarrés :
- **PostgreSQL** : Port 5433 (5432 interne)
- **Redis** : Port 6380 (6379 interne)
- **Backend** : Port 3001
- **Frontend** : Port 3000

### 4. Vérifier que tout fonctionne

```bash
./scripts/test-production-docker.sh
```

Ou manuellement :
```bash
# Health check backend
curl http://localhost:3001/health

# Frontend
curl http://localhost:3000

# Health check détaillé
curl http://localhost:3001/health/detailed
```

## 📊 Services et Ports

| Service | Port Externe | Port Interne | Health Check |
|---------|--------------|-------------|--------------|
| PostgreSQL | 5433 | 5432 | `pg_isready` |
| Redis | 6380 | 6379 | `redis-cli ping` |
| Backend | 3001 | 3001 | `/health` |
| Frontend | 3000 | 3000 | `/` |

## 🔍 Commandes utiles

### Voir les logs
```bash
# Tous les services
docker-compose -f docker-compose.prod.yml logs -f

# Un service spécifique
docker-compose -f docker-compose.prod.yml logs -f backend
docker-compose -f docker-compose.prod.yml logs -f frontend
docker-compose -f docker-compose.prod.yml logs -f postgres
```

### Arrêter les services
```bash
docker-compose -f docker-compose.prod.yml down
```

### Arrêter et supprimer les volumes (⚠️ supprime les données)
```bash
docker-compose -f docker-compose.prod.yml down -v
```

### Redémarrer un service
```bash
docker-compose -f docker-compose.prod.yml restart backend
```

### Exécuter des migrations PostgreSQL
```bash
# Se connecter au container PostgreSQL
docker exec -it girlycrea-postgres-prod psql -U girlycrea_user -d girlycrea

# Ou exécuter un script SQL
docker exec -i girlycrea-postgres-prod psql -U girlycrea_user -d girlycrea < migrations/your-migration.sql
```

### Accéder au shell d'un container
```bash
# Backend
docker exec -it girlycrea-backend-prod sh

# Frontend
docker exec -it girlycrea-frontend-prod sh

# PostgreSQL
docker exec -it girlycrea-postgres-prod sh
```

## 🗄️ Base de données

### Connexion PostgreSQL

```bash
# Depuis l'hôte
PGPASSWORD=votre_password psql -h localhost -p 5433 -U girlycrea_user -d girlycrea

# Depuis le container
docker exec -it girlycrea-postgres-prod psql -U girlycrea_user -d girlycrea
```

### Backup PostgreSQL

```bash
# Depuis l'hôte
PGPASSWORD=votre_password pg_dump -h localhost -p 5433 -U girlycrea_user -d girlycrea > backup.sql

# Depuis le container
docker exec girlycrea-postgres-prod pg_dump -U girlycrea_user -d girlycrea > backup.sql
```

### Restore PostgreSQL

```bash
# Depuis l'hôte
PGPASSWORD=votre_password psql -h localhost -p 5433 -U girlycrea_user -d girlycrea < backup.sql

# Depuis le container
docker exec -i girlycrea-postgres-prod psql -U girlycrea_user -d girlycrea < backup.sql
```

## 🔧 Dépannage

### Le backend ne démarre pas

1. Vérifier les logs : `docker-compose -f docker-compose.prod.yml logs backend`
2. Vérifier que PostgreSQL est healthy : `docker ps`
3. Vérifier les variables d'environnement : `docker exec girlycrea-backend-prod env | grep DATABASE_URL`

### Le frontend ne démarre pas

1. Vérifier les logs : `docker-compose -f docker-compose.prod.yml logs frontend`
2. Vérifier que le backend répond : `curl http://localhost:3001/health`
3. Vérifier `NEXT_PUBLIC_API_URL` dans les variables d'environnement

### Erreur de connexion PostgreSQL

1. Vérifier que PostgreSQL est démarré : `docker ps | grep postgres`
2. Vérifier le health check : `docker inspect girlycrea-postgres-prod | grep Health`
3. Vérifier les credentials dans `.env.prod`

### Port déjà utilisé

```bash
# Trouver le processus utilisant le port
lsof -i :3001
lsof -i :3000
lsof -i :5433

# Arrêter le processus ou changer le port dans docker-compose.prod.yml
```

## 📝 Notes importantes

1. **Mode Production** : Les services tournent en `NODE_ENV=production`
   - Pas de hot-reload
   - Code compilé (TypeScript → JavaScript)
   - Optimisations activées

2. **Volumes persistants** :
   - `postgres_data` : Données PostgreSQL
   - `redis_data` : Données Redis
   - Les données persistent même après `docker-compose down`

3. **Health Checks** :
   - Tous les services ont des health checks configurés
   - Docker surveille automatiquement l'état des services
   - Les dépendances (`depends_on`) attendent que les services soient healthy

4. **Ressources** :
   - Backend : 1 CPU max, 1GB RAM max
   - Frontend : 1 CPU max, 1GB RAM max
   - Ajustez selon les besoins dans `docker-compose.prod.yml`

## 🚀 Prêt pour le déploiement

Une fois que tout fonctionne localement :

1. ✅ Tous les tests passent (`./scripts/test-production-docker.sh`)
2. ✅ Les migrations sont appliquées
3. ✅ Les variables d'environnement sont configurées
4. ✅ Les health checks répondent correctement

Vous pouvez maintenant déployer sur le serveur de votre ami ! 🎉
