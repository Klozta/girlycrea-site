# 💻 Guide Déploiement Local - GirlyCrea

**Objectif**: Tester la migration localement avant de déployer sur le VPS de votre ami  
**Avantages**: Valider la configuration, tester les scripts, éviter les erreurs en production

---

## 📋 Table des Matières

1. [Prérequis](#prérequis)
2. [Installation Services Locaux](#installation-services-locaux)
3. [Configuration Environnement Local](#configuration-environnement-local)
4. [Migration Données Locale](#migration-données-locale)
5. [Déploiement Application](#déploiement-application)
6. [Tests Locaux](#tests-locaux)
7. [Préparation Migration VPS](#préparation-migration-vps)

---

## ✅ Prérequis

### Système d'Exploitation

- ✅ **Linux** (Ubuntu/Debian recommandé)
- ✅ **macOS** (avec Homebrew)
- ✅ **Windows** (WSL2 recommandé)

### Outils Nécessaires

- Node.js 20+ (`node --version`)
- npm ou yarn
- Git
- Docker (optionnel, pour simplifier)

---

## 🐳 Option 1: Docker Compose (Recommandé - Plus Simple)

### Installation Docker

**Ubuntu/Debian**:
```bash
sudo apt update
sudo apt install -y docker.io docker-compose
sudo systemctl enable docker
sudo systemctl start docker
sudo usermod -aG docker $USER
# Déconnexion/reconnexion nécessaire pour appliquer le groupe
```

**macOS**:
```bash
brew install docker docker-compose
# Ou installer Docker Desktop depuis https://www.docker.com/products/docker-desktop
```

**Windows (WSL2)**:
```bash
# Dans PowerShell (admin)
wsl --install
# Puis dans WSL2 Ubuntu
sudo apt update && sudo apt install -y docker.io docker-compose
```

### Docker Compose pour Services Locaux

Créez le fichier `docker-compose.local.yml`:

```yaml
version: '3.8'

services:
  postgres:
    image: postgres:15-alpine
    container_name: girlycrea-postgres-local
    environment:
      POSTGRES_DB: girlycrea
      POSTGRES_USER: girlycrea_user
      POSTGRES_PASSWORD: local_dev_password
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U girlycrea_user"]
      interval: 10s
      timeout: 5s
      retries: 5

  redis:
    image: redis:7-alpine
    container_name: girlycrea-redis-local
    ports:
      - "6379:6379"
    command: redis-server --maxmemory 256mb --maxmemory-policy allkeys-lru
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 5s
      retries: 5

volumes:
  postgres_data:
```

### Démarrer les Services

```bash
# Démarrer PostgreSQL et Redis
docker-compose -f docker-compose.local.yml up -d

# Vérifier que les services sont démarrés
docker-compose -f docker-compose.local.yml ps

# Voir les logs
docker-compose -f docker-compose.local.yml logs -f
```

### Arrêter les Services

```bash
# Arrêter les services
docker-compose -f docker-compose.local.yml down

# Arrêter et supprimer les données (attention!)
docker-compose -f docker-compose.local.yml down -v
```

---

## 🔧 Option 2: Installation Native (Plus Proche du VPS)

### Ubuntu/Debian

#### 1. PostgreSQL

```bash
# Installation
sudo apt update
sudo apt install -y postgresql postgresql-contrib

# Créer base de données
sudo -u postgres psql << EOF
CREATE DATABASE girlycrea;
CREATE USER girlycrea_user WITH PASSWORD 'local_dev_password';
GRANT ALL PRIVILEGES ON DATABASE girlycrea TO girlycrea_user;
ALTER USER girlycrea_user CREATEDB;
\q
EOF

# Vérifier
psql -U girlycrea_user -d girlycrea -c "SELECT version();"
```

#### 2. Redis

```bash
# Installation
sudo apt install -y redis-server

# Configuration
sudo nano /etc/redis/redis.conf
# Modifier: maxmemory 256mb
# Modifier: maxmemory-policy allkeys-lru

# Redémarrer
sudo systemctl restart redis-server

# Vérifier
redis-cli ping
```

### macOS (avec Homebrew)

```bash
# PostgreSQL
brew install postgresql@15
brew services start postgresql@15
createdb girlycrea
createuser -s girlycrea_user

# Redis
brew install redis
brew services start redis
redis-cli ping
```

### Windows (WSL2)

```bash
# Suivre les instructions Ubuntu ci-dessus dans WSL2
```

---

## ⚙️ Configuration Environnement Local

### Fichier `.env.local`

Créez un fichier `.env.local` à la racine du projet:

```env
# Environnement
NODE_ENV=development

# Base de données (Docker ou local)
DATABASE_URL=postgresql://girlycrea_user:local_dev_password@localhost:5432/girlycrea
SUPABASE_URL=postgresql://girlycrea_user:local_dev_password@localhost:5432/girlycrea

# Redis
REDIS_URL=redis://localhost:6379
REDIS_HOST=localhost
REDIS_PORT=6379

# Application
PORT=3001
API_URL=http://localhost:3001
FRONTEND_URL=http://localhost:3000

# JWT
JWT_SECRET=local_dev_secret_change_in_production
JWT_REFRESH_SECRET=local_dev_refresh_secret_change_in_production

# Stripe (utiliser clés test)
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Email (local - pas d'envoi réel)
EMAIL_PROVIDER=smtp
SMTP_HOST=localhost
SMTP_PORT=1025
SMTP_USER=
SMTP_PASS=
SMTP_FROM=noreply@girlycrea.local

# Autres
ENCRYPTION_KEY=local_dev_encryption_key_32_chars!!
```

### Utiliser `.env.local`

```bash
# Copier .env.local vers .env pour développement
cp .env.local .env

# Ou utiliser dotenv-cli
npm install -g dotenv-cli
dotenv -e .env.local -- npm run dev
```

---

## 🔄 Migration Données Locale

### 1. Export depuis Supabase (Production)

```bash
# Installer pg_dump si nécessaire
# Ubuntu: sudo apt install postgresql-client
# macOS: brew install postgresql

# Export depuis Supabase
pg_dump -h <supabase-host> \
        -U postgres \
        -d <database-name> \
        -F c \
        -f backup_supabase.dump \
        --no-owner \
        --no-acl

# Ou export SQL simple
pg_dump -h <supabase-host> \
        -U postgres \
        -d <database-name> \
        -f backup_supabase.sql
```

### 2. Import vers PostgreSQL Local

**Avec Docker**:
```bash
# Copier le dump dans le conteneur
docker cp backup_supabase.dump girlycrea-postgres-local:/tmp/

# Importer
docker exec -i girlycrea-postgres-local pg_restore \
  -U girlycrea_user \
  -d girlycrea \
  -c \
  /tmp/backup_supabase.dump
```

**Sans Docker**:
```bash
# Import
pg_restore -U girlycrea_user \
           -d girlycrea \
           -c \
           backup_supabase.dump

# Ou si fichier SQL
psql -U girlycrea_user -d girlycrea < backup_supabase.sql
```

### 3. Migration Redis (Optionnel)

```bash
# Export depuis Upstash
redis-cli -h <upstash-host> \
          --tls \
          -a <password> \
          --rdb /tmp/redis_backup.rdb

# Import vers Redis local
redis-cli --rdb /tmp/redis_backup.rdb
```

---

## 🚀 Déploiement Application

### 1. Installation Dépendances

```bash
# Backend
cd /home/ghislain/girlycrea-site
npm install

# Frontend
cd frontend
npm install
```

### 2. Configuration Base de Données

```bash
# Créer les tables (si migrations)
npm run migrate
# Ou
npx prisma migrate dev  # Si vous utilisez Prisma
```

### 3. Build Application

```bash
# Backend
npm run build

# Frontend
cd frontend
npm run build
```

### 4. Démarrer l'Application

**Mode Développement**:
```bash
# Terminal 1 - Backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm run dev
```

**Mode Production (local)**:
```bash
# Backend avec PM2
npm install -g pm2
npm run build
pm2 start dist/server.js --name girlycrea-api-local
pm2 logs girlycrea-api-local

# Frontend (production)
cd frontend
npm run build
npm run start
```

---

## 🧪 Tests Locaux

### 1. Test Connexion Base de Données

```bash
# PostgreSQL
psql -U girlycrea_user -d girlycrea -c "SELECT COUNT(*) FROM products;"

# Redis
redis-cli ping
redis-cli DBSIZE
```

### 2. Test API Backend

```bash
# Health check
curl http://localhost:3001/health

# Produits
curl http://localhost:3001/api/products

# Avec authentification
curl -H "Authorization: Bearer YOUR_TOKEN" http://localhost:3001/api/products
```

### 3. Test Frontend

```bash
# Ouvrir dans navigateur
http://localhost:3000

# Vérifier console navigateur (F12)
# Vérifier Network tab pour les appels API
```

### 4. Test Transaction Complète

1. ✅ Créer un compte utilisateur
2. ✅ Se connecter
3. ✅ Parcourir les produits
4. ✅ Ajouter au panier
5. ✅ Passer commande (mode test Stripe)
6. ✅ Vérifier la commande dans la base de données

### 5. Script de Test Automatisé

Créez `scripts/test-local.sh`:

```bash
#!/bin/bash
# Test santé système local

echo "🧪 Tests Locaux GirlyCrea"
echo "========================="

# PostgreSQL
echo -n "PostgreSQL: "
if psql -U girlycrea_user -d girlycrea -c "SELECT 1;" > /dev/null 2>&1; then
    echo "✅ OK"
else
    echo "❌ ERREUR"
fi

# Redis
echo -n "Redis: "
if redis-cli ping > /dev/null 2>&1; then
    echo "✅ OK"
else
    echo "❌ ERREUR"
fi

# API Backend
echo -n "API Backend: "
if curl -s http://localhost:3001/health > /dev/null; then
    echo "✅ OK"
else
    echo "❌ ERREUR"
fi

# Frontend
echo -n "Frontend: "
if curl -s http://localhost:3000 > /dev/null; then
    echo "✅ OK"
else
    echo "❌ ERREUR"
fi

echo ""
echo "✅ Tests terminés"
```

---

## 📊 Comparaison Local vs VPS

| Aspect | Local (Test) | VPS (Production) |
|--------|--------------|-------------------|
| **PostgreSQL** | localhost:5432 | VPS_IP:5432 |
| **Redis** | localhost:6379 | VPS_IP:6379 |
| **URL API** | http://localhost:3001 | https://girlycrea.com/api |
| **URL Frontend** | http://localhost:3000 | https://girlycrea.com |
| **SSL** | ❌ Non | ✅ Oui (Let's Encrypt) |
| **Email** | Mock/Local | Postfix/SMTP réel |
| **Monitoring** | Basique | Prometheus + Grafana |
| **Backups** | Manuel | Automatique |

---

## 🔄 Préparation Migration VPS

### Checklist Avant Migration VPS

Une fois que tout fonctionne localement:

- [ ] ✅ Tous les tests locaux passent
- [ ] ✅ Base de données migrée et vérifiée
- [ ] ✅ Redis migré et vérifié
- [ ] ✅ Application démarre sans erreur
- [ ] ✅ API répond correctement
- [ ] ✅ Frontend fonctionne
- [ ] ✅ Transactions complètes testées
- [ ] ✅ Scripts de migration testés
- [ ] ✅ Variables d'environnement documentées
- [ ] ✅ Backups testés (export/import)

### Variables d'Environnement pour VPS

Préparez un fichier `.env.vps` avec les valeurs de production:

```env
# VPS Production
NODE_ENV=production
DATABASE_URL=postgresql://girlycrea_user:PROD_PASSWORD@localhost:5432/girlycrea
REDIS_URL=redis://localhost:6379
API_URL=https://girlycrea.com/api
FRONTEND_URL=https://girlycrea.com
JWT_SECRET=PRODUCTION_SECRET_STRONG_RANDOM
# ... etc
```

---

## 🐛 Dépannage Local

### Problème: PostgreSQL ne démarre pas

**Docker**:
```bash
docker-compose -f docker-compose.local.yml logs postgres
docker-compose -f docker-compose.local.yml restart postgres
```

**Native**:
```bash
sudo systemctl status postgresql
sudo systemctl restart postgresql
sudo journalctl -u postgresql -n 50
```

### Problème: Port déjà utilisé

```bash
# Vérifier ports utilisés
sudo lsof -i :5432  # PostgreSQL
sudo lsof -i :6379  # Redis
sudo lsof -i :3001  # Backend
sudo lsof -i :3000  # Frontend

# Tuer processus si nécessaire
sudo kill -9 <PID>
```

### Problème: Connexion refusée

```bash
# Vérifier que les services écoutent
netstat -tulpn | grep 5432  # PostgreSQL
netstat -tulpn | grep 6379  # Redis

# Vérifier firewall local
sudo ufw status
```

---

## 📚 Prochaines Étapes

Une fois que tout fonctionne localement:

1. ✅ **Documenter** les différences locales vs VPS
2. ✅ **Préparer** les scripts de migration VPS
3. ✅ **Tester** les scripts sur votre machine locale
4. ✅ **Migrer** vers le VPS de votre ami
5. ✅ **Suivre** le GUIDE-PRATIQUE-MIGRATION-VPS.md

---

## 🎯 Résumé

### Avantages Déploiement Local

- ✅ **Test sans risque** avant production
- ✅ **Validation** de la configuration
- ✅ **Débogage** plus facile
- ✅ **Apprentissage** des outils
- ✅ **Confiance** avant migration VPS

### Commandes Rapides

```bash
# Démarrer services (Docker)
docker-compose -f docker-compose.local.yml up -d

# Démarrer application
npm run dev  # Backend
cd frontend && npm run dev  # Frontend

# Tests
bash scripts/test-local.sh

# Arrêter services
docker-compose -f docker-compose.local.yml down
```

---

**Document créé le**: 2025  
**Dernière mise à jour**: 2025  
**Version**: 1.0



