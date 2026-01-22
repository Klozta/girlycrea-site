# ✅ Dockerfiles Mis à Jour - Production Ready

## 📦 Backend Dockerfile (`backend/Dockerfile.prod`)

### Améliorations apportées:

1. **dumb-init** pour graceful shutdown
   - Gère correctement les signaux SIGTERM
   - Permet l'arrêt propre des containers

2. **Multi-stage build optimisé**
   - Builder: Compile TypeScript avec toutes les dépendances
   - Runtime: Seulement les dépendances de production

3. **Health check amélioré**
   - Teste `/api/health` (au lieu de `/health`)
   - Timeout augmenté à 10s
   - Retries: 3

4. **Sécurité**
   - User non-root (nodejs, UID 1001)
   - Permissions correctes avant changement d'user

5. **Support Playwright**
   - Chromium et dépendances système installées
   - Variables d'environnement configurées

### Structure:
```dockerfile
BUILD STAGE:
- Installe toutes les dépendances (npm ci)
- Compile TypeScript (npm run build)

RUNTIME STAGE:
- Installe dumb-init
- Installe dépendances système (Playwright)
- Crée user non-root
- Copie dist/ et package.json
- Installe dépendances production (npm ci --only=production)
- Change permissions et user
- Health check + CMD
```

---

## 🎨 Frontend Dockerfile (`frontend/Dockerfile.prod`)

### Améliorations apportées:

1. **dumb-init** pour graceful shutdown
   - Gère correctement les signaux SIGTERM

2. **Standalone mode Next.js**
   - Image minimale avec seulement le nécessaire
   - `.next/standalone` contient server.js + node_modules minimaux

3. **Health check avec wget**
   - Teste la page d'accueil
   - wget installé dans l'image

4. **Variables d'environnement**
   - `HOSTNAME="0.0.0.0"` (important pour Docker)
   - `PORT=3000`
   - `NODE_ENV=production`

### Structure:
```dockerfile
BUILD STAGE:
- Installe dépendances (npm ci)
- Build Next.js en mode standalone

RUNTIME STAGE:
- Installe dumb-init et wget
- Crée user non-root
- Copie .next/standalone, .next/static, public/
- Health check + CMD
```

---

## 🔍 Différences Clés

### Backend:
- ✅ Copie `node_modules` depuis builder → **NON**, installe seulement production
- ✅ Health check: `/api/health` (corrigé)
- ✅ dumb-init pour graceful shutdown
- ✅ Support Playwright maintenu

### Frontend:
- ✅ Health check: `wget` au lieu de `node` (plus léger)
- ✅ dumb-init pour graceful shutdown
- ✅ Standalone mode Next.js (image minimale)

---

## 🚀 Utilisation

```bash
# Build
docker-compose -f docker-compose.staging.yml build

# Start
docker-compose -f docker-compose.staging.yml up -d

# Vérifier health
curl http://localhost/health
```

---

## ✅ Avantages

1. **Graceful Shutdown**: dumb-init gère SIGTERM correctement
2. **Images légères**: Multi-stage build, Alpine Linux
3. **Sécurité**: User non-root, permissions correctes
4. **Health checks**: Automatiques, fiables
5. **Production-ready**: Prêt pour déploiement réel

---

**Date**: 2026-01-22  
**Status**: ✅ Production Ready
