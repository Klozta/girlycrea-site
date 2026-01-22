# 🎀 GirlyCrea - Documentation Docker Staging

Guide complet pour tester GirlyCrea en local avec Docker Compose, simulant le déploiement production.

## 📋 Table of Contents

1. [Prérequis](#prérequis)
2. [Installation](#installation)
3. [Démarrage](#démarrage)
4. [Commandes](#commandes)
5. [Accès aux Services](#accès-aux-services)
6. [Troubleshooting](#troubleshooting)
7. [Architecture](#architecture)
8. [Checklist de Validation](#checklist-de-validation)

---

## 🔧 Prérequis

### Requis
- **Docker Desktop** (macOS/Windows) ou **Docker Engine** (Linux)
- **Docker Compose** v2.0+ (généralement inclus avec Docker Desktop)
- **Ports disponibles**: 80, 3000, 3001, 5433, 6380
- **Espace disque**: minimum 10GB

### Vérification
```bash
docker --version
# Docker version 24.0.0+

docker-compose --version
# Docker Compose version v2.20.0+
```

### Systèmes d'exploitation
- ✅ macOS (avec Docker Desktop)
- ✅ Windows (avec Docker Desktop + WSL2)
- ✅ Linux (avec Docker + Docker Compose)

---

## 📦 Installation

### Step 1: Préparer l'environnement

```bash
# Cloner / accéder au projet
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

**Copier les résultats dans `.env.docker`**

### Step 3: Remplir les variables d'environnement

Éditer `.env.docker` et remplir:

- ✅ `JWT_SECRET` et `JWT_REFRESH_SECRET` (générés ci-dessus)
- ✅ `STRIPE_SECRET_KEY` (clé de test: `sk_test_...`)
- ✅ `STRIPE_WEBHOOK_SECRET` (secret webhook: `whsec_...`)
- ✅ `RESEND_API_KEY` (clé Resend: `re_...`)
- ✅ `EMAIL_FROM` (ex: `noreply@girlycrea.com`)

**Variables optionnelles** (peuvent rester vides pour staging):
- `SUPABASE_URL` et `SUPABASE_KEY` (si PostgreSQL direct, utiliser placeholder)
- `SENTRY_DSN` (error tracking)
- `ANALYTICS_TOKEN`

---

## 🚀 Démarrage

### Méthode 1: Script Automation (Recommandé)

```bash
# Rendre le script exécutable
chmod +x docker-staging.sh

# Build les images
./docker-staging.sh build

# Démarrer les services
./docker-staging.sh up

# Vérifier le statut
./docker-staging.sh status

# Tester le health endpoint
./docker-staging.sh health
```

### Méthode 2: Docker Compose Direct

```bash
# Build les images
docker-compose -f docker-compose.staging.yml build

# Démarrer tous les services
docker-compose -f docker-compose.staging.yml up -d

# Vérifier l'état
docker-compose -f docker-compose.staging.yml ps

# Tester le health check
curl http://localhost/health
```

### Attendre le démarrage complet

**Important**: PostgreSQL prend 30-40 secondes pour démarrer. Attendez que tous les services soient "healthy":

```bash
# Surveiller l'état
watch -n 2 'docker-compose -f docker-compose.staging.yml ps'

# Ou vérifier manuellement
docker-compose -f docker-compose.staging.yml ps
```

Tous les services doivent afficher `Up (healthy)` avant de tester.

---

## 📝 Commandes

### Script `docker-staging.sh`

```bash
./docker-staging.sh help      # Afficher l'aide
./docker-staging.sh build     # Construire les images
./docker-staging.sh up        # Démarrer les services
./docker-staging.sh down      # Arrêter les services
./docker-staging.sh logs      # Logs de tous les services
./docker-staging.sh logs backend  # Logs d'un service spécifique
./docker-staging.sh status    # État des services
./docker-staging.sh restart backend  # Redémarrer un service
./docker-staging.sh health    # Tester le health endpoint
./docker-staging.sh clean     # Supprimer tout (volumes inclus)
```

### Docker Compose Direct

```bash
# Logs
docker-compose -f docker-compose.staging.yml logs -f
docker-compose -f docker-compose.staging.yml logs -f backend

# Redémarrer
docker-compose -f docker-compose.staging.yml restart backend

# Rebuild après modification
docker-compose -f docker-compose.staging.yml up -d --build backend

# Arrêter
docker-compose -f docker-compose.staging.yml down

# Arrêter + supprimer volumes (⚠️ supprime les données!)
docker-compose -f docker-compose.staging.yml down -v
```

---

## 🌐 Accès aux Services

| Service | URL | Description |
|---------|-----|-------------|
| **Frontend** | http://localhost | Next.js via Nginx |
| **Backend API** | http://localhost/api | Express API via Nginx |
| **Backend Direct** | http://localhost:3001 | API directement |
| **Frontend Direct** | http://localhost:3000 | Next.js directement |
| **Health Check** | http://localhost/health | Health endpoint |
| **PostgreSQL** | localhost:5433 | Base de données |
| **Redis** | localhost:6380 | Cache |

### Tests Rapides

```bash
# Health check simple
curl http://localhost/health

# Health check détaillé
curl http://localhost/api/health/detailed

# Info API
curl http://localhost/api

# Liste des produits
curl http://localhost/api/products
```

---

## 🐛 Troubleshooting

### Les services ne démarrent pas

**1. Vérifier les logs:**
```bash
./docker-staging.sh logs
# Ou
docker-compose -f docker-compose.staging.yml logs
```

**2. Vérifier que les ports ne sont pas occupés:**
```bash
# Linux/Mac
lsof -i :80 -i :3000 -i :3001 -i :5433 -i :6380

# Windows
netstat -ano | findstr :80
```

**3. Vérifier Docker:**
```bash
docker ps
docker info
```

### Le backend ne se connecte pas à PostgreSQL

**1. Vérifier que PostgreSQL est healthy:**
```bash
docker-compose -f docker-compose.staging.yml ps postgres
# Doit afficher: Up (healthy)
```

**2. Vérifier les variables d'environnement:**
```bash
docker-compose -f docker-compose.staging.yml exec backend env | grep DATABASE
```

**3. Vérifier les logs PostgreSQL:**
```bash
docker-compose -f docker-compose.staging.yml logs postgres
```

### Le frontend ne se connecte pas au backend

**1. Vérifier `NEXT_PUBLIC_API_URL`:**
```bash
# Dans .env.docker, doit être:
NEXT_PUBLIC_API_URL=http://localhost/api
```

**2. Vérifier que le backend répond:**
```bash
curl http://localhost:3001/api/health
```

**3. Vérifier les logs frontend:**
```bash
./docker-staging.sh logs frontend
```

### Nginx retourne 502 Bad Gateway

**1. Vérifier que backend et frontend sont démarrés:**
```bash
./docker-staging.sh status
```

**2. Tester directement les services:**
```bash
# Backend
curl http://localhost:3001/api/health

# Frontend
curl http://localhost:3000
```

**3. Vérifier les logs Nginx:**
```bash
./docker-staging.sh logs nginx
```

### Health check échoue

**1. Attendre que PostgreSQL démarre (30-40s):**
```bash
# Surveiller
watch -n 2 'docker-compose -f docker-compose.staging.yml ps'
```

**2. Vérifier les logs backend:**
```bash
./docker-staging.sh logs backend
```

**3. Tester manuellement:**
```bash
# Dans le container backend
docker-compose -f docker-compose.staging.yml exec backend node -e "require('http').get('http://localhost:3001/api/health', (r) => console.log(r.statusCode))"
```

### Erreur "Cannot connect to database"

**1. Vérifier DATABASE_URL:**
```bash
docker-compose -f docker-compose.staging.yml exec backend env | grep DATABASE_URL
# Doit être: postgresql://girlycrea_user:password@postgres:5432/girlycrea
```

**2. Tester la connexion PostgreSQL:**
```bash
docker-compose -f docker-compose.staging.yml exec postgres psql -U girlycrea_user -d girlycrea -c "SELECT NOW();"
```

**3. Vérifier que PostgreSQL est dans le même réseau:**
```bash
docker network inspect girlycrea-site_girlycrea-staging-network
```

---

## 🏗️ Architecture

### Services Docker

```
┌─────────────────────────────────────────┐
│           Nginx (Port 80)               │
│         Reverse Proxy                   │
└──────────────┬──────────────────────────┘
               │
       ┌───────┴───────┐
       │               │
┌──────▼──────┐  ┌─────▼──────┐
│  Frontend   │  │  Backend   │
│  Next.js    │  │  Express   │
│  Port 3000  │  │  Port 3001 │
└─────────────┘  └─────┬──────┘
                       │
            ┌──────────┴──────────┐
            │                     │
    ┌───────▼──────┐    ┌─────────▼──────┐
    │  PostgreSQL  │    │     Redis       │
    │  Port 5432   │    │   Port 6379     │
    └──────────────┘    └─────────────────┘
```

### Volumes Persistants

- `postgres_staging_data`: Données PostgreSQL (persistent après `down`)
- `redis_staging_data`: Données Redis (persistent après `down`)

### Networks

- `girlycrea-staging-network`: Réseau isolé pour tous les services

### Health Checks

Tous les services ont des health checks automatiques:
- **PostgreSQL**: `pg_isready` (toutes les 10s)
- **Redis**: `redis-cli ping` (toutes les 10s)
- **Backend**: `GET /api/health` (toutes les 30s)
- **Frontend**: `wget http://localhost:3000` (toutes les 30s)
- **Nginx**: `wget http://localhost/health` (toutes les 30s)

---

## ✅ Checklist de Validation

### Avant le démarrage
- [ ] Docker Desktop installé et démarré
- [ ] Fichier `.env.docker` créé depuis `env.docker.template`
- [ ] Secrets JWT générés et configurés (64 caractères minimum)
- [ ] Clés Stripe configurées (test: `sk_test_...`)
- [ ] Clé Resend configurée (email: `re_...`)
- [ ] Ports disponibles (80, 3000, 3001, 5433, 6380)

### Après le démarrage
- [ ] Build réussi: `./docker-staging.sh build` → Exit code 0
- [ ] Services démarrés: `./docker-staging.sh up` → Exit code 0
- [ ] Tous les services "healthy": `./docker-staging.sh status` → Tous `Up (healthy)`
- [ ] Health endpoint répond: `curl http://localhost/health` → HTTP 200
- [ ] Frontend accessible: http://localhost → HTML Next.js
- [ ] Backend accessible: http://localhost/api → JSON API
- [ ] PostgreSQL accessible: `psql -h localhost -p 5433 -U girlycrea_user -d girlycrea`
- [ ] Redis accessible: `redis-cli -h localhost -p 6380 ping` → PONG

### Tests fonctionnels
- [ ] Health check simple: `curl http://localhost/health`
- [ ] Health check détaillé: `curl http://localhost/api/health/detailed`
- [ ] API info: `curl http://localhost/api`
- [ ] Liste produits: `curl http://localhost/api/products`
- [ ] Frontend charge sans erreurs dans le navigateur

---

## 🔒 Sécurité

⚠️ **Ce setup est pour staging/local uniquement!**

### Pour la production:

1. **HTTPS/SSL**: Activer SSL dans Nginx (Let's Encrypt)
2. **Secrets forts**: Utiliser des secrets générés aléatoirement (64+ caractères)
3. **Firewall**: Configurer un firewall (UFW, iptables)
4. **Rate limiting**: Activer les rate limits stricts
5. **CSRF**: Activer CSRF protection (`SKIP_CSRF_PROTECTION=false`)
6. **CORS**: Limiter les origines autorisées
7. **Secrets management**: Utiliser un gestionnaire de secrets (Vault, AWS Secrets Manager)

---

## 📚 Structure des Fichiers

```
girlycrea-site/
├── docker-compose.staging.yml    # Configuration Docker Compose
├── docker-staging.sh              # Script automation
├── env.docker.template            # Template variables d'environnement
├── .env.docker                    # Variables réelles (ne pas commiter!)
├── nginx/
│   └── nginx.staging.conf        # Configuration Nginx
├── backend/
│   └── Dockerfile.prod           # Image Docker backend
└── frontend/
    └── Dockerfile.prod            # Image Docker frontend
```

---

## 🎯 Commandes Rapides

```bash
# Démarrage complet
./docker-staging.sh build && ./docker-staging.sh up && sleep 40 && ./docker-staging.sh health

# Voir les logs en temps réel
./docker-staging.sh logs

# Redémarrer après modification
./docker-staging.sh restart backend

# Nettoyer complètement (⚠️ supprime les données!)
./docker-staging.sh clean
```

---

## 📞 Support

En cas de problème:
1. Vérifier les logs: `./docker-staging.sh logs`
2. Vérifier l'état: `./docker-staging.sh status`
3. Consulter la section [Troubleshooting](#troubleshooting)
4. Vérifier que tous les prérequis sont remplis

---

**Prêt à déployer! 🚀**
