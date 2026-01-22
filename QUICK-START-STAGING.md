# 🚀 Quick Start - Docker Staging

Guide de démarrage rapide pour lancer GirlyCrea en staging.

## ✅ Vérification Préalable

```bash
# 1. Vérifier que Docker fonctionne
docker --version
docker-compose --version

# 2. Vérifier que les fichiers existent
ls -la docker-compose.staging.yml env.docker.template docker-staging.sh
```

## 📝 ÉTAPE 1 : Préparer l'Environnement

### 1.1. Créer le fichier .env.docker

```bash
cp env.docker.template .env.docker
```

### 1.2. Générer les secrets JWT

```bash
# Générer JWT_SECRET (64 caractères)
node -e "console.log('JWT_SECRET=' + require('crypto').randomBytes(32).toString('hex'))"

# Générer JWT_REFRESH_SECRET (64 caractères)
node -e "console.log('JWT_REFRESH_SECRET=' + require('crypto').randomBytes(32).toString('hex'))"
```

**Copiez les résultats** et collez-les dans `.env.docker`

### 1.3. Éditer .env.docker

```bash
nano .env.docker
# ou
code .env.docker
# ou
vim .env.docker
```

**À remplir impérativement :**
- `JWT_SECRET` (64 caractères minimum)
- `JWT_REFRESH_SECRET` (64 caractères minimum)
- `POSTGRES_PASSWORD` (mot de passe fort)
- `ADMIN_TOKEN` (32 caractères minimum)
- `REVALIDATE_SECRET` (32 caractères minimum)

**Optionnel (pour tests locaux, peut rester vide) :**
- `STRIPE_SECRET_KEY` (peut être `sk_test_xxx` pour test)
- `STRIPE_WEBHOOK_SECRET` (peut être `whsec_xxx` pour test)
- `RESEND_API_KEY` (peut être `re_xxx` pour test)

## 🏗️ ÉTAPE 2 : Build et Démarrage

### Option A : Avec le script (recommandé)

```bash
# Rendre exécutable (si pas déjà fait)
chmod +x docker-staging.sh

# Build les images
./docker-staging.sh build

# Démarrer tous les services
./docker-staging.sh up

# Vérifier le statut
./docker-staging.sh status

# Voir les logs
./docker-staging.sh logs
```

### Option B : Avec Docker Compose directement

```bash
# Build
docker-compose -f docker-compose.staging.yml build

# Démarrer
docker-compose -f docker-compose.staging.yml up -d

# Vérifier
docker-compose -f docker-compose.staging.yml ps
```

## ⏳ ÉTAPE 3 : Attendre le Démarrage

**PostgreSQL prend ~30 secondes** pour démarrer complètement.

```bash
# Attendre 40 secondes
sleep 40

# OU surveiller les logs
docker-compose -f docker-compose.staging.yml logs -f postgres
# Attendre de voir: "database system is ready to accept connections"
```

## ✅ ÉTAPE 4 : Vérifier Que Tout Fonctionne

### 4.1. Vérifier les containers

```bash
docker-compose -f docker-compose.staging.yml ps
```

**Résultat attendu :**
```
NAME                        STATUS
girlycrea-backend-staging   Up (healthy)
girlycrea-frontend-staging   Up (healthy)
girlycrea-nginx-staging      Up
girlycrea-postgres-staging   Up (healthy)
girlycrea-redis-staging      Up (healthy)
```

### 4.2. Test Health Check

```bash
curl http://localhost/health
```

**Résultat attendu :**
```json
{
  "status": "ok",
  "timestamp": "2026-01-22T...",
  "environment": "production"
}
```

### 4.3. Test Health Check Détaillé

```bash
curl http://localhost/health/detailed
```

**Résultat attendu :**
```json
{
  "status": "healthy",
  "timestamp": "...",
  "uptime": 12.34,
  "services": {
    "database": { "status": "up", "responseTime": 5 },
    "cache": { "status": "up", "responseTime": 2 }
  }
}
```

### 4.4. Accéder au Site

- **Frontend** : http://localhost
- **API Backend** : http://localhost/api
- **API Info** : http://localhost/api

## 🧪 ÉTAPE 5 : Tests des Endpoints

### 5.1. Test API Info

```bash
curl http://localhost/api
```

### 5.2. Test Liste Produits

```bash
curl http://localhost/api/products
```

### 5.3. Test Register (Créer un compte)

```bash
curl -X POST http://localhost/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test1234!",
    "name": "Test User"
  }'
```

### 5.4. Test Login

```bash
curl -X POST http://localhost/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test1234!"
  }'
```

**Copiez le `accessToken`** de la réponse pour les tests suivants.

### 5.5. Test Endpoint Protégé (avec token)

```bash
# Remplacez YOUR_TOKEN par le token reçu
curl http://localhost/api/auth/me \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## 🐛 Dépannage

### Les containers ne démarrent pas

```bash
# Vérifier les logs
docker-compose -f docker-compose.staging.yml logs

# Vérifier les erreurs spécifiques
docker-compose -f docker-compose.staging.yml logs backend
docker-compose -f docker-compose.staging.yml logs postgres
```

### Health check échoue

```bash
# Vérifier que PostgreSQL est prêt
docker-compose -f docker-compose.staging.yml exec postgres pg_isready -U girlycrea_user

# Vérifier que Redis répond
docker-compose -f docker-compose.staging.yml exec redis redis-cli ping

# Tester le backend directement
curl http://localhost:3001/health
```

### Port déjà utilisé

```bash
# Vérifier les ports
lsof -i :80 -i :3000 -i :3001 -i :5433 -i :6380

# Arrêter les processus qui utilisent les ports
# OU modifier les ports dans docker-compose.staging.yml
```

### Rebuild après modification du code

```bash
# Rebuild et redémarrer
docker-compose -f docker-compose.staging.yml up -d --build backend
docker-compose -f docker-compose.staging.yml up -d --build frontend
```

## 📊 Commandes Utiles

```bash
# Voir les logs en temps réel
./docker-staging.sh logs

# Logs d'un service spécifique
./docker-staging.sh logs backend

# Redémarrer un service
./docker-staging.sh restart backend

# Arrêter tout
./docker-staging.sh down

# Arrêter et supprimer les données
./docker-staging.sh down-volumes

# Health check
./docker-staging.sh health

# Status
./docker-staging.sh status
```

## 🎯 Checklist de Démarrage

- [ ] Docker Desktop installé et démarré
- [ ] Fichier `.env.docker` créé depuis `env.docker.template`
- [ ] Secrets JWT générés et configurés (64 caractères)
- [ ] `POSTGRES_PASSWORD` configuré
- [ ] `ADMIN_TOKEN` configuré (32 caractères)
- [ ] Build effectué : `./docker-staging.sh build`
- [ ] Services démarrés : `./docker-staging.sh up`
- [ ] Attendu 40 secondes pour PostgreSQL
- [ ] Health check OK : `curl http://localhost/health`
- [ ] Frontend accessible : http://localhost
- [ ] API accessible : http://localhost/api

---

**Prêt ! 🚀**

Si tout est vert, vous pouvez commencer à tester GirlyCrea en staging !
