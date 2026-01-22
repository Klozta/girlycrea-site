# 🚀 GirlyCrea - Guide de Démarrage Rapide Docker

Guide étape par étape pour démarrer GirlyCrea en staging local avec Docker Compose.

---

## 📋 Prérequis

- ✅ Docker Desktop installé et démarré
- ✅ Ports disponibles: 80, 3000, 3001, 5433, 6380
- ✅ Node.js installé (pour générer les secrets)

---

## 🔧 Installation

### Step 1: Préparer l'environnement

```bash
# Aller dans le dossier du projet
cd ~/girlycrea-site

# Copier le template d'environnement
cp env.docker.template .env.docker
```

### Step 2: Générer les secrets JWT

```bash
# Générer JWT_SECRET (64 caractères)
node -e "console.log('JWT_SECRET=' + require('crypto').randomBytes(32).toString('hex'))"

# Générer JWT_REFRESH_SECRET (64 caractères)
node -e "console.log('JWT_REFRESH_SECRET=' + require('crypto').randomBytes(32).toString('hex'))"
```

**Copier les deux valeurs générées.**

### Step 3: Configurer .env.docker

```bash
# Éditer le fichier
nano .env.docker
# ou ouvre dans ton éditeur favori

# Remplace:
# JWT_SECRET=your_jwt_secret... → JWT_SECRET=<valeur copiée>
# JWT_REFRESH_SECRET=your_refresh... → JWT_REFRESH_SECRET=<valeur copiée>

# Les autres variables (Stripe, Resend) peuvent rester avec des valeurs placeholder pour test
```

### Step 4: Rendre le script exécutable

```bash
chmod +x docker-staging.sh
```

---

## 🚀 Démarrage

### Démarrage Rapide

```bash
# 1. Construire les images
./docker-staging.sh build

# 2. Démarrer les services
./docker-staging.sh up

# 3. Attendre 30-40 secondes (PostgreSQL démarre lentement)
sleep 40

# 4. Vérifier que tout marche
./docker-staging.sh health

# ✅ Si le résultat est {"status":"healthy",...} c'est bon!
```

### Démarrage Manuel (sans script)

```bash
# Build
docker-compose -f docker-compose.staging.yml build

# Up
docker-compose -f docker-compose.staging.yml up -d

# Attendre 40 secondes
sleep 40

# Vérifier
curl http://localhost/health
```

---

## 📝 Commandes

### Script Shell (./docker-staging.sh)

```bash
./docker-staging.sh help        # Afficher l'aide
./docker-staging.sh build       # Construire les images
./docker-staging.sh up          # Démarrer les services
./docker-staging.sh down        # Arrêter les services
./docker-staging.sh logs        # Logs de tous les services
./docker-staging.sh logs backend # Logs du backend seulement
./docker-staging.sh status      # État des services
./docker-staging.sh restart     # Redémarrer tous les services
./docker-staging.sh restart backend # Redémarrer le backend
./docker-staging.sh health      # Tester le health endpoint
./docker-staging.sh clean       # Supprimer tout (données perdues!)
```

### Docker Compose Direct

```bash
# Build
docker-compose -f docker-compose.staging.yml build

# Up (background)
docker-compose -f docker-compose.staging.yml up -d

# Up (foreground, voir logs)
docker-compose -f docker-compose.staging.yml up

# Down
docker-compose -f docker-compose.staging.yml down

# Logs
docker-compose -f docker-compose.staging.yml logs -f

# Logs d'un service
docker-compose -f docker-compose.staging.yml logs -f backend

# Status
docker-compose -f docker-compose.staging.yml ps

# Restart
docker-compose -f docker-compose.staging.yml restart backend
```

---

## 🌐 Accès aux Services

Une fois que tous les services sont "healthy":

| Service | URL | Description |
|---------|-----|-------------|
| **Frontend (via Nginx)** | http://localhost | Next.js frontend via reverse proxy |
| **Frontend (direct)** | http://localhost:3000 | Next.js frontend direct |
| **Backend (direct)** | http://localhost:3001 | Express API direct |
| **Backend (via Nginx)** | http://localhost/api | Express API via reverse proxy |
| **Health Check** | http://localhost/health | Status des services |
| **PostgreSQL** | localhost:5433 | Database (client SQL: psql) |
| **Redis** | localhost:6380 | Cache (client: redis-cli) |

### Tester les Services

```bash
# Frontend
curl http://localhost
# → Retourne le HTML Next.js

# Backend Health
curl http://localhost/api/health
# → {"status":"healthy","services":{...}}

# Backend API (produits)
curl http://localhost/api/products
# → Liste des produits

# PostgreSQL
psql -h localhost -p 5433 -U girlycrea_user -d girlycrea
# → Connecte à PostgreSQL

# Redis
redis-cli -p 6380
# → Connecte à Redis
```

---

## 🔍 Troubleshooting

### Services qui ne démarrent pas

```bash
# 1. Vérifier les logs
./docker-staging.sh logs

# 2. Vérifier l'état
./docker-staging.sh status

# 3. Si un service est "Exited (1)", voir pourquoi
docker-compose -f docker-compose.staging.yml logs backend

# 4. Problèmes courants:
# - Erreur: Port already in use → Un autre service utilise le port
#   Solution: Arrêter les autres services ou changer les ports
# - Erreur: Database connection refused → PostgreSQL n'a pas démarré
#   Solution: Attendre 40+ secondes, puis retry
```

### Health Check échoue

```bash
# 1. Vérifier que tous les services sont "Up"
./docker-staging.sh status

# 2. Attendre plus longtemps (PostgreSQL peut être lent)
sleep 60
./docker-staging.sh health

# 3. Vérifier les logs backend
./docker-staging.sh logs backend

# 4. Vérifier la connexion à PostgreSQL
docker-compose -f docker-compose.staging.yml exec backend \
  node -e "require('pg').connect('postgresql://girlycrea_user:local_dev_password@postgres:5432/girlycrea', (e,c) => console.log(e ? 'Fail: '+e : 'OK'))"

# 5. Vérifier la connexion à Redis
docker-compose -f docker-compose.staging.yml exec backend \
  redis-cli -h redis ping
```

### Frontend ne charge pas

```bash
# 1. Vérifier que frontend est running
./docker-staging.sh status

# 2. Voir les logs frontend
./docker-staging.sh logs frontend

# 3. Vérifier Nginx
./docker-staging.sh logs nginx

# 4. Tester accès direct
curl http://localhost:3000

# 5. Si l'erreur est "NEXT_PUBLIC_API_URL not set", vérifier .env.docker
grep NEXT_PUBLIC_API_URL .env.docker
```

### PostgreSQL lent au démarrage

```bash
# C'est NORMAL - PostgreSQL peut prendre 30-60 secondes
# Attends simplement plus longtemps:
sleep 60
./docker-staging.sh health

# Ou vérifier directement:
docker-compose -f docker-compose.staging.yml exec postgres \
  pg_isready -U girlycrea_user
```

### "Permission denied" avec docker-staging.sh

```bash
# Rendre le script exécutable
chmod +x docker-staging.sh

# Puis retry
./docker-staging.sh up
```

---

## 🏗️ Architecture

### Services et Ports

```
┌─────────────────────────────────────────────────────────────┐
│                         Docker Network                        │
│               (girlycrea-staging-network)                     │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌─────────────────┐  ┌──────────────────┐                 │
│  │    Nginx        │  │    Frontend      │                 │
│  │ (port 80)       │  │  (port 3000)     │                 │
│  │ Reverse Proxy   │──│  Next.js         │                 │
│  └────────┬────────┘  └──────────────────┘                 │
│           │                                                 │
│           │ /api                                           │
│           ▼                                                 │
│  ┌──────────────────┐                                      │
│  │    Backend       │                                      │
│  │  (port 3001)     │                                      │
│  │  Express API     │                                      │
│  └────────┬─────────┘                                      │
│           │                                                 │
│      ┌────┼────┐                                           │
│      ▼    ▼                                                 │
│  ┌──────────────┐  ┌───────────────┐                      │
│  │ PostgreSQL   │  │     Redis     │                      │
│  │ (port 5432)  │  │ (port 6379)   │                      │
│  │ Database     │  │ Cache         │                      │
│  └──────────────┘  └───────────────┘                      │
│                                                              │
└─────────────────────────────────────────────────────────────┘

Ports exposés à la machine hôte:
- 80 (Nginx)
- 3000 (Frontend direct)
- 3001 (Backend direct)
- 5433 (PostgreSQL)
- 6380 (Redis)
```

### Volumes Persistants

```
postgres_staging_data/   → Données PostgreSQL
redis_staging_data/      → Données Redis
```

Les données persistent après `docker-compose down` (sauf si tu fais `docker-compose down -v`).

### Health Checks

Tous les services incluent un health check:

```
healthcheck:
  interval: 30s      # Vérifier tous les 30 secondes
  timeout: 10s       # Timeout après 10 secondes
  retries: 3         # Marquer comme "unhealthy" après 3 échecs
  start_period: 40s  # Attendre 40 secondes avant le 1er check
```

**Status des services:**

- ✅ **"Up (healthy)"** = le service fonctionne et répond bien
- ⏳ **"Up"** = le service tourne mais le health check n'a pas commencé
- ❌ **"Exited"** = le service s'est arrêté (vérifier les logs)

---

## ✅ Checklist de Validation

### Avant le démarrage
- [ ] Docker Desktop installé et démarré
- [ ] Fichier `.env.docker` créé
- [ ] Secrets JWT générés et configurés
- [ ] Script `docker-staging.sh` exécutable (`chmod +x`)

### Après le démarrage

**Validation Automatique (Recommandé):**
```bash
# Lancer le script de validation
./scripts/validate-staging.sh
```

**Validation Manuelle:**
- [ ] `./docker-staging.sh status` → Tous les services "Up (healthy)"
- [ ] `curl http://localhost/health` → HTTP 200 + JSON healthy
- [ ] `http://localhost` → Frontend Next.js chargé
- [ ] `http://localhost:3001` → Backend API accessible
- [ ] `curl http://localhost/api/products` → Liste des produits (JSON)
- [ ] `curl http://localhost/api/auth/login` → Accepte POST requests
- [ ] PostgreSQL: `psql -h localhost -p 5433 -U girlycrea_user -d girlycrea -c "SELECT 1"` → Retourne 1
- [ ] Redis: `redis-cli -p 6380 ping` → Retourne PONG
- [ ] Logs sans erreurs critiques: `./docker-staging.sh logs | grep -i error`
- [ ] Nginx reverse proxy: `curl -I http://localhost` → HTTP 200

---

## 🎯 Commandes Rapides

```bash
# Démarrage complet en une ligne
./docker-staging.sh build && ./docker-staging.sh up && sleep 40 && ./docker-staging.sh health

# Voir les logs en temps réel
./docker-staging.sh logs

# Redémarrer après modification
./docker-staging.sh restart backend

# Nettoyer complètement (⚠️ supprime les données!)
./docker-staging.sh clean
```

---

## 📊 Performance et Ressources

### Utilisation Ressources

Les services utilisent approximativement:

- **CPU**: 200-500m (au repos) / 1-2 CPU (sous charge)
- **RAM**: 800MB-1.2GB (au repos)
- **Disque**: 5-10GB (dépend des données)

### Optimisations

Déjà appliquées:

- ✅ Alpine Linux pour images minimales
- ✅ Multi-stage builds
- ✅ User non-root
- ✅ Gzip compression Nginx
- ✅ Connection pooling

---

## 🎯 Prochaines Étapes

Une fois que ton environnement staging est stable:

### Tester les 5 flows critiques:

1. **Register → Login → Product → Cart → Checkout**
2. **Create Review**
3. **Validate Coupon**
4. **Admin Dashboard**

### Tester les Endpoints API:

- Authentification (register, login, refresh)
- Produits (list, get, search, filters)
- Commandes (create, list, get)
- Avis (create, list)
- Coupons (validate)

### Préparer la Production:

- Configurer SSL/HTTPS
- Configurer les secrets réels (Stripe, Email)
- Backups PostgreSQL automatisés
- Monitoring Prometheus/Grafana

### Soft Launch Beta:

- Inviter 50 utilisateurs
- Monitorer 24/7
- Itérer sur les retours

---

## 📞 Support

Si tu as des problèmes:

1. Vérifier les logs: `./docker-staging.sh logs`
2. Vérifier la section Troubleshooting ci-dessus
3. Vérifier le health endpoint: `curl http://localhost/health`
4. Vérifier les ports disponibles: `netstat -tuln | grep LISTEN`
5. Lancer le script de validation: `./scripts/validate-staging.sh`

---

**Prêt à démarrer! 🚀**
