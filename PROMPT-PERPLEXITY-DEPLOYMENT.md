# 🎀 GirlyCrea - Full Production Deployment Prompt for Perplexity

## Contexte du Projet

GirlyCrea est une plateforme e-commerce française spécialisée dans les bijoux, créations crochet, produits de beauté, mode et cours de crochet.

**Stack Technique:**
- Backend: Node.js 20, Express.js, TypeScript (ESM modules), port 3001
- Frontend: Next.js 15, React 18.3, Tailwind CSS, port 3000
- Database: PostgreSQL 15, port 5433 (externe) / 5432 (interne)
- Cache: Redis 7, port 6380 (externe) / 6379 (interne)
- Reverse Proxy: Nginx (port 80/443)
- Containers: Docker Compose pour orchestration

**Structure du Projet:**
```
girlycrea-site/
├── backend/
│   ├── src/
│   │   ├── index.ts (point d'entrée ESM)
│   │   ├── routes/
│   │   ├── services/
│   │   └── config/
│   ├── package.json (type: "module")
│   └── tsconfig.json
├── frontend/
│   ├── app/ (Next.js 15 App Router)
│   ├── package.json
│   └── next.config.js
├── nginx/
│   └── nginx.staging.conf
├── docker-compose.staging.yml
└── .env.docker
```

**État Actuel:**
- ✅ docker-compose.staging.yml existe (5 services: postgres, redis, backend, frontend, nginx)
- ✅ nginx/nginx.staging.conf existe (reverse proxy basique)
- ✅ Health endpoint partiel existe
- ✅ docker-staging.sh existe (script automation)
- ❌ Dockerfiles manquants ou incomplets
- ❌ Health endpoint complet manquant
- ❌ Documentation incomplète

---

## Objectif Principal

Créer un **déploiement Docker Compose complet et production-ready** qui permet de:

1. `docker-compose -f docker-compose.staging.yml build` → Build réussit
2. `docker-compose -f docker-compose.staging.yml up -d` → Tous les services démarrent
3. `curl http://localhost/health` → Retourne `{"status":"healthy",...}`
4. `http://localhost` → Frontend Next.js accessible via Nginx
5. `http://localhost:3001` → Backend API accessible directement
6. Tous les services sont "healthy" après 30-40 secondes

---

## PARTIE 1 : Dockerfiles (CRITIQUE)

### backend/Dockerfile.prod

**Requirements:**
- Multi-stage build (builder + runtime)
- Base: `node:20-alpine`
- Support ESM modules (type: "module" dans package.json)
- Build TypeScript: `npm run build` (génère `dist/`)
- Runtime: `node dist/index.js`
- User non-root: `nodejs` (UID 1001)
- Health check: `GET http://localhost:3001/health`
- Variables d'environnement: PORT=3001, NODE_ENV=production
- Installer dépendances système pour Playwright (chromium, etc.)
- Exposer port 3001
- CMD: `["node", "dist/index.js"]`

**Structure attendue:**
```dockerfile
# BUILD STAGE
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# RUNTIME STAGE
FROM node:20-alpine
# ... (détails complets)
```

### frontend/Dockerfile.prod

**Requirements:**
- Multi-stage build (builder + runtime)
- Base: `node:20-alpine`
- Build Next.js: `npm run build` avec `output: 'standalone'`
- Copier `.next/standalone`, `.next/static`, `public/`
- User non-root: `nodejs` (UID 1001)
- Health check: `GET http://localhost:3000`
- Variables: HOSTNAME="0.0.0.0", PORT=3000, NODE_ENV=production
- Exposer port 3000
- CMD: `["node", "server.js"]`

**Important:** Next.js 15 avec App Router, support des images externes, TypeScript strict.

---

## PARTIE 2 : Backend Health Endpoint

### backend/src/routes/health.routes.ts

**Requirements:**
- Route: `GET /api/health` et `GET /api/health/detailed`
- Tests automatiques:
  - **PostgreSQL**: `SELECT NOW()` via `pgPool` (si DATABASE_URL existe)
  - **Redis**: `PING` via `ioredis` (détecte automatiquement local vs Upstash)
  - **Email**: Vérifie si RESEND_API_KEY ou MAILGUN_API_KEY configuré
  - **Stripe**: Vérifie si STRIPE_SECRET_KEY configuré
- Retour JSON:
  ```json
  {
    "status": "healthy" | "degraded" | "unhealthy",
    "timestamp": "ISO 8601",
    "uptime": 123.45,
    "services": {
      "database": {"status": "up"|"down", "responseTime": 12},
      "cache": {"status": "up"|"down", "responseTime": 5},
      "email": {"status": "up"|"down", "error": "..."},
      "stripe": {"status": "up"|"down", "error": "..."}
    },
    "version": "1.0.0"
  }
  ```
- HTTP 200 si healthy, 503 si unhealthy
- Timeout: 5s max par service
- Logs clairs avec `logger`

**Détection Redis:**
- Si `REDIS_HOST` ou `REDIS_URL` → Redis local (ioredis)
- Si `UPSTASH_REDIS_URL` → Upstash Redis
- Si aucun → cache = "not configured"

---

## PARTIE 3 : Nginx Configuration

### nginx/nginx.staging.conf

**Requirements:**
- Reverse proxy: `http://localhost` → `frontend:3000`
- API proxy: `http://localhost/api` → `backend:3001`
- Health proxy: `http://localhost/health` → `backend:3001/health`
- Rate limiting: `limit_req zone=api burst=100 nodelay;`
- Headers de sécurité:
  - `X-Content-Type-Options: nosniff`
  - `X-Frame-Options: SAMEORIGIN`
  - `X-XSS-Protection: 1; mode=block`
- Gzip compression activé
- Proxy headers: `X-Real-IP`, `X-Forwarded-For`, `X-Forwarded-Proto`
- Timeout: 60s pour API
- Commentaires pour SSL/HTTPS (prêt pour production)

**Structure:**
```nginx
http {
  limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;
  
  server {
    listen 80;
    server_name localhost;
    
    # Frontend
    location / {
      proxy_pass http://frontend:3000;
      # ...
    }
    
    # API
    location /api/ {
      limit_req zone=api burst=100 nodelay;
      proxy_pass http://backend:3001;
      # ...
    }
  }
}
```

---

## PARTIE 4 : Environment Variables

### .env.docker.template

**Requirements:**
- Toutes les variables nécessaires avec commentaires explicatifs
- Sections organisées:
  - PostgreSQL
  - Redis
  - JWT Secrets (avec instructions pour générer)
  - Supabase (optionnel, peut pointer vers PostgreSQL local)
  - Stripe
  - Email (Resend ou Mailgun)
  - Frontend (NEXT_PUBLIC_*)
  - CORS
  - Security (SKIP_CSRF pour staging)
- Instructions pour générer secrets:
  ```bash
  # JWT_SECRET (64 caractères)
  node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
  ```

**Variables critiques:**
- `POSTGRES_DB`, `POSTGRES_USER`, `POSTGRES_PASSWORD`
- `DATABASE_URL` (auto-généré si PostgreSQL dans Docker)
- `REDIS_URL` (auto-généré si Redis dans Docker)
- `JWT_SECRET`, `JWT_REFRESH_SECRET` (64 chars min)
- `SUPABASE_URL`, `SUPABASE_KEY` (peut être placeholder si PostgreSQL direct)
- `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`
- `RESEND_API_KEY` ou `MAILGUN_API_KEY`
- `NEXT_PUBLIC_API_URL` (http://localhost/api pour staging)

---

## PARTIE 5 : Documentation

### DOCKER-STAGING-README.md

**Sections requises:**
1. **Introduction** - Qu'est-ce que ce setup
2. **Prérequis** - Docker, Docker Compose, ports disponibles
3. **Installation Step-by-Step:**
   - Copier `.env.docker.template` → `.env.docker`
   - Générer les secrets JWT
   - Remplir les variables (Stripe, Email, etc.)
   - Build: `docker-compose build`
   - Start: `docker-compose up -d`
   - Vérifier: `docker-compose ps`
4. **Commandes Utiles:**
   - Build, up, down, logs, restart, status
   - Health check manuel
   - Accès aux services
5. **Troubleshooting:**
   - Services qui ne démarrent pas
   - Erreurs de connexion DB
   - Health check échoue
   - Logs à vérifier
6. **Architecture:**
   - Schéma des services
   - Ports exposés
   - Volumes persistants
   - Networks
7. **Checklist de Validation:**
   - ✅ Tous les services healthy
   - ✅ Health endpoint répond
   - ✅ Frontend accessible
   - ✅ Backend accessible
   - ✅ API fonctionne
   - ✅ PostgreSQL persiste
   - ✅ Redis persiste

### docker-staging.sh

**Commands à implémenter:**
- `./docker-staging.sh help` - Aide
- `./docker-staging.sh build` - Build toutes les images
- `./docker-staging.sh up` - Démarrer tous les services
- `./docker-staging.sh down` - Arrêter et supprimer
- `./docker-staging.sh logs [service]` - Logs (suivi en temps réel)
- `./docker-staging.sh status` - État des services
- `./docker-staging.sh restart [service]` - Redémarrer
- `./docker-staging.sh health` - Test health endpoint
- `./docker-staging.sh clean` - Nettoyer tout (down + volumes + images)

**Features:**
- Vérification Docker running
- Vérification `.env.docker` existe
- Messages colorés (✅ ❌ 🚀)
- Gestion d'erreurs

---

## PARTIE 6 : Docker Compose Configuration

### docker-compose.staging.yml

**Vérifications à faire:**
- ✅ 5 services: postgres, redis, backend, frontend, nginx
- ✅ Health checks pour TOUS les services
- ✅ Volumes persistants: `postgres_staging_data`, `redis_staging_data`
- ✅ Network isolé: `girlycrea-staging-network`
- ✅ Restart policies: `unless-stopped`
- ✅ Depends_on avec `condition: service_healthy`
- ✅ Ports exposés corrects (5433, 6380, 80, 3000, 3001)
- ✅ Environment variables depuis `.env.docker`
- ✅ Resource limits (CPU, memory)
- ✅ Logging configuré (max-size, max-file)

**Health Checks:**
```yaml
healthcheck:
  test: ["CMD", "pg_isready", "-U", "girlycrea_user"]
  interval: 10s
  timeout: 5s
  retries: 5
  start_period: 30s
```

---

## PARTIE 7 : Production Readiness

### Requirements Généraux

1. **Security:**
   - User non-root dans containers
   - Secrets dans `.env.docker` (pas dans code)
   - Headers de sécurité Nginx
   - Rate limiting API

2. **Reliability:**
   - Health checks automatiques
   - Restart policies
   - Graceful shutdown (SIGTERM)
   - Timeouts configurés

3. **Observability:**
   - Logs structurés
   - Health endpoint détaillé
   - Status des services visibles

4. **Performance:**
   - Multi-stage builds (images légères)
   - Alpine Linux
   - Gzip compression
   - Connection pooling

5. **Maintainability:**
   - Documentation complète
   - Scripts d'automation
   - Commentaires clairs
   - Structure organisée

---

## PARTIE 8 : Validation & Testing

### Script de Validation (optionnel)

Créer `scripts/validate-staging.sh` qui teste:
1. Tous les services sont "Up (healthy)"
2. `curl http://localhost/health` → status 200
3. `curl http://localhost/api` → réponse JSON
4. `curl http://localhost` → HTML Next.js
5. PostgreSQL accessible (port 5433)
6. Redis accessible (port 6380)

### docker-compose.test.yml (optionnel)

Version de test avec:
- Base de données de test séparée
- Redis de test
- Pas de volumes persistants
- Pour tests avant déploiement

---

## Critères de Succès

✅ **Build:**
- `docker-compose -f docker-compose.staging.yml build` → Exit code 0
- Toutes les images construites sans erreurs
- Pas d'avertissements critiques

✅ **Startup:**
- `docker-compose -f docker-compose.staging.yml up -d` → Exit code 0
- Tous les services démarrés
- Après 30-40s, tous "healthy"

✅ **Health Check:**
- `curl http://localhost/health` → HTTP 200
- JSON: `{"status":"healthy",...}`
- Tous les services testés (database, cache)

✅ **Accessibilité:**
- `http://localhost` → Frontend Next.js (via Nginx)
- `http://localhost:3000` → Frontend direct
- `http://localhost:3001` → Backend API direct
- `http://localhost/api` → Backend via Nginx

✅ **Persistence:**
- PostgreSQL: données persistent après `docker-compose down`
- Redis: données persistent après `docker-compose down`

✅ **Scripts:**
- `./docker-staging.sh build` → Fonctionne
- `./docker-staging.sh up` → Fonctionne
- `./docker-staging.sh status` → Affiche état
- `./docker-staging.sh health` → Test health endpoint

---

## Instructions pour Perplexity

**Génère TOUS les fichiers suivants avec le code complet:**

1. `backend/Dockerfile.prod` - Dockerfile backend complet
2. `frontend/Dockerfile.prod` - Dockerfile frontend complet
3. `backend/src/routes/health.routes.ts` - Health endpoint complet
4. `.env.docker.template` - Template avec toutes les variables
5. `DOCKER-STAGING-README.md` - Documentation complète
6. `docker-staging.sh` - Script automation amélioré
7. `scripts/validate-staging.sh` - Script de validation (optionnel)

**Vérifie et améliore si nécessaire:**
- `docker-compose.staging.yml` - Vérifier health checks, volumes, networks
- `nginx/nginx.staging.conf` - Vérifier rate limiting, headers, proxy

**Style:**
- Commentaires en FRANÇAIS
- Code production-ready (pas de shortcuts)
- Error handling complet
- Logs clairs et utiles
- Security best practices

**Important:**
- Backend utilise ESM modules (`import/export`)
- TypeScript strict mode
- Next.js 15 avec App Router
- Alpine Linux pour images légères
- User non-root dans containers

---

## Exemple de Structure de Réponse Attendu

Pour chaque fichier, fournir:
1. **Chemin complet du fichier**
2. **Code complet** (pas de "// ... reste du code")
3. **Commentaires explicatifs en français**
4. **Explications des choix techniques**

**Format:**
```markdown
## backend/Dockerfile.prod

```dockerfile
# Code complet ici
```

**Explications:**
- Pourquoi multi-stage build
- Pourquoi Alpine
- Pourquoi user non-root
- etc.
```

---

## Questions à Résoudre

1. **Backend Health Check:**
   - Comment détecter automatiquement Redis local vs Upstash?
   - Comment tester PostgreSQL sans Supabase?
   - Comment gérer les timeouts?

2. **Frontend Build:**
   - Comment configurer Next.js standalone mode?
   - Comment gérer les variables d'environnement publiques?
   - Comment optimiser la taille de l'image?

3. **Nginx:**
   - Comment configurer rate limiting efficacement?
   - Comment gérer les WebSockets si nécessaire?
   - Comment préparer pour SSL/HTTPS?

4. **Docker Compose:**
   - Comment gérer les dépendances entre services?
   - Comment configurer les health checks correctement?
   - Comment optimiser les ressources?

---

## Notes Finales

- **Production-ready**: Même si c'est pour staging local, tout doit être prêt pour production
- **Zero manual coding**: Tous les fichiers doivent être générés automatiquement
- **Documentation complète**: Un développeur doit pouvoir setup en 5 minutes
- **Error handling**: Tous les cas d'erreur doivent être gérés
- **Security first**: Pas de compromis sur la sécurité

**Objectif final:** Après avoir généré tous les fichiers, l'utilisateur doit pouvoir exécuter:
```bash
cp .env.docker.template .env.docker
# Remplir .env.docker
./docker-staging.sh build
./docker-staging.sh up
# Attendre 40 secondes
curl http://localhost/health
# → {"status":"healthy",...}
```

Et tout fonctionne! 🎉
