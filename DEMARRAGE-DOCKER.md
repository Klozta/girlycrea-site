# 🐳 Démarrage avec Docker

## 🚀 Développement Local

### Prérequis
- Docker Desktop installé (ou Docker + Docker Compose)
- Variables d'environnement configurées dans `.env`

### Commandes

```bash
# Démarrer tous les services
docker-compose up -d

# Voir les logs
docker-compose logs -f

# Logs d'un service spécifique
docker-compose logs -f backend
docker-compose logs -f frontend

# Rebuild après changement de dépendances
docker-compose up -d --build

# Arrêter tous les services
docker-compose down

# Arrêter et supprimer les volumes (reset DB)
docker-compose down -v
```

### URLs
- Frontend : http://localhost:3000
- Backend : http://localhost:3001
- Redis : localhost:6379
- PostgreSQL : localhost:5432

## 🏭 Production

### Prérequis
- VM/VPS avec Docker installé
- Certificats SSL dans `nginx/ssl/`
- Variables d'environnement dans `.env.prod`

### Commandes

```bash
# Démarrer en production
docker-compose -f docker-compose.prod.yml up -d

# Voir les logs
docker-compose -f docker-compose.prod.yml logs -f

# Rebuild et redémarrer
docker-compose -f docker-compose.prod.yml up -d --build

# Arrêter
docker-compose -f docker-compose.prod.yml down
```

### Setup SSL (Let's Encrypt)

```bash
# Installer certbot
apt-get install -y certbot python3-certbot-nginx

# Générer certificats
certbot certonly --standalone -d girlycrea.com -d www.girlycrea.com

# Copier certificats
cp /etc/letsencrypt/live/girlycrea.com/fullchain.pem nginx/ssl/cert.pem
cp /etc/letsencrypt/live/girlycrea.com/privkey.pem nginx/ssl/key.pem

# Renouvellement automatique (cron)
0 3 * * * certbot renew --quiet && docker-compose -f docker-compose.prod.yml restart nginx
```

## 🔧 Dépannage

### Port déjà utilisé
```bash
# Trouver le processus
lsof -i :3000
lsof -i :3001

# Arrêter le processus
kill -9 PID
```

### Rebuild complet
```bash
docker-compose down -v
docker-compose build --no-cache
docker-compose up -d
```

### Vérifier les containers
```bash
docker-compose ps
docker ps
```

### Accéder à un container
```bash
docker exec -it girlycrea-backend-dev sh
docker exec -it girlycrea-frontend-dev sh
```

