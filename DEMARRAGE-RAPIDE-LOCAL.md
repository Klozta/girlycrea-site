# 🚀 Démarrage Rapide Local - GirlyCrea

**Guide de dépannage et démarrage rapide pour tester localement**

> **📝 Pour tester les nouvelles fonctionnalités (emails, coupons, avis)** : Voir `TEST-LOCAL-MIGRATIONS.md`

---

## ⚠️ Problèmes Détectés et Solutions

### 1. Docker non installé

**Solution Option A: Installer Docker (Recommandé)**

```bash
# Ubuntu/Debian
sudo apt update
sudo apt install -y docker.io docker-compose
sudo systemctl enable docker
sudo systemctl start docker
sudo usermod -aG docker $USER

# Déconnexion/reconnexion nécessaire
# Puis tester:
docker --version
docker-compose --version
```

**Solution Option B: Installation Native (Sans Docker)**

Si vous ne voulez pas installer Docker, utilisez l'installation native:

```bash
# PostgreSQL
sudo apt install -y postgresql postgresql-contrib
sudo -u postgres psql << EOF
CREATE DATABASE girlycrea;
CREATE USER girlycrea_user WITH PASSWORD 'local_dev_password';
GRANT ALL PRIVILEGES ON DATABASE girlycrea TO girlycrea_user;
\q
EOF

# Redis
sudo apt install -y redis-server
sudo systemctl start redis-server
redis-cli ping
```

### 2. Dépendances npm manquantes

```bash
# Backend
cd /home/ghislain/girlycrea-site
npm install

# Frontend
cd frontend
npm install
```

### 3. Port 3002 déjà utilisé

```bash
# Trouver le processus utilisant le port 3002
sudo lsof -i :3002
# Ou
sudo netstat -tulpn | grep 3002

# Tuer le processus si nécessaire
sudo kill -9 <PID>

# Ou changer le port dans frontend/package.json
# "dev": "next dev -p 3000"  (au lieu de 3002)
```

---

## ✅ Démarrage Rapide Corrigé

### Étape 1: Installer les dépendances

```bash
cd /home/ghislain/girlycrea-site

# Backend
npm install

# Frontend
cd frontend
npm install
cd ..
```

### Étape 2: Démarrer les services (Docker OU Native)

**Avec Docker:**
```bash
# Démarrer PostgreSQL et Redis
docker-compose -f docker-compose.local.yml up -d

# Vérifier
docker-compose -f docker-compose.local.yml ps
```

**Sans Docker (Native):**
```bash
# Démarrer PostgreSQL
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Démarrer Redis
sudo systemctl start redis-server
sudo systemctl enable redis-server

# Vérifier
psql -U girlycrea_user -d girlycrea -c "SELECT 1;"
redis-cli ping
```

### Étape 3: Configurer les variables d'environnement

```bash
# Créer .env.local
cat > .env.local << 'EOF'
NODE_ENV=development
DATABASE_URL=postgresql://girlycrea_user:local_dev_password@localhost:5432/girlycrea
SUPABASE_URL=postgresql://girlycrea_user:local_dev_password@localhost:5432/girlycrea
REDIS_URL=redis://localhost:6379
PORT=3001
API_URL=http://localhost:3001
FRONTEND_URL=http://localhost:3000
JWT_SECRET=local_dev_secret_change_in_production
JWT_REFRESH_SECRET=local_dev_refresh_secret_change_in_production
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
EMAIL_PROVIDER=smtp
SMTP_HOST=localhost
SMTP_PORT=1025
ENCRYPTION_KEY=local_dev_encryption_key_32_chars!!
EOF

# Copier vers .env
cp .env.local .env
```

### Étape 4: Démarrer l'application

**Terminal 1 - Backend:**
```bash
cd /home/ghislain/girlycrea-site
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd /home/ghislain/girlycrea-site/frontend
npm run dev
```

**Note:** Si le port 3002 est utilisé, modifiez `frontend/package.json`:
```json
"dev": "next dev -p 3000"
```

### Étape 5: Tester

```bash
# Test API
curl http://localhost:3001/health

# Test Frontend (ouvrir dans navigateur)
# http://localhost:3000 ou http://localhost:3002
```

---

## 🔧 Commandes de Dépannage

### Vérifier les services

```bash
# PostgreSQL
psql -U girlycrea_user -d girlycrea -c "SELECT version();"

# Redis
redis-cli ping

# Ports utilisés
netstat -tuln | grep -E ':(3000|3001|3002|5432|6379)'
```

### Réinitialiser les services

**Docker:**
```bash
docker-compose -f docker-compose.local.yml down
docker-compose -f docker-compose.local.yml up -d
```

**Native:**
```bash
sudo systemctl restart postgresql
sudo systemctl restart redis-server
```

### Nettoyer et réinstaller

```bash
# Supprimer node_modules
rm -rf node_modules frontend/node_modules

# Réinstaller
npm install
cd frontend && npm install && cd ..
```

---

## 📝 Migration Données (Optionnel)

Si vous voulez tester avec vos vraies données:

### Export depuis Supabase

```bash
# Remplacer les valeurs entre < >
pg_dump -h <VOTRE_SUPABASE_HOST> \
        -U postgres \
        -d <VOTRE_DATABASE_NAME> \
        -F c \
        -f backup_supabase.dump \
        --no-owner \
        --no-acl
```

**Exemple réel:**
```bash
pg_dump -h db.abcdefghijklmnop.supabase.co \
        -U postgres \
        -d postgres \
        -F c \
        -f backup_supabase.dump \
        --no-owner \
        --no-acl
```

### Import vers Local

**Avec Docker:**
```bash
docker cp backup_supabase.dump girlycrea-postgres-local:/tmp/
docker exec -i girlycrea-postgres-local pg_restore \
  -U girlycrea_user \
  -d girlycrea \
  -c \
  /tmp/backup_supabase.dump
```

**Sans Docker:**
```bash
pg_restore -U girlycrea_user \
           -d girlycrea \
           -c \
           backup_supabase.dump
```

---

## ✅ Checklist de Vérification

- [ ] Docker installé OU PostgreSQL/Redis installés nativement
- [ ] Dépendances npm installées (`npm install` dans backend et frontend)
- [ ] Fichier `.env` créé avec les bonnes variables
- [ ] PostgreSQL démarré et accessible
- [ ] Redis démarré et accessible
- [ ] Ports libres (3000, 3001, 3002, 5432, 6379)
- [ ] Backend démarre sans erreur (`npm run dev`)
- [ ] Frontend démarre sans erreur (`cd frontend && npm run dev`)
- [ ] API répond (`curl http://localhost:3001/health`)
- [ ] Frontend accessible dans navigateur

---

## 🆘 Problèmes Courants

### "tsx: not found"
```bash
npm install
# tsx devrait être installé dans node_modules/.bin
```

### "Port already in use"
```bash
# Trouver et tuer le processus
sudo lsof -i :3002
sudo kill -9 <PID>
```

### "Connection refused" PostgreSQL
```bash
# Vérifier que PostgreSQL écoute
sudo systemctl status postgresql
sudo systemctl start postgresql
```

### "Connection refused" Redis
```bash
# Vérifier que Redis écoute
sudo systemctl status redis-server
sudo systemctl start redis-server
```

---

---

## 🗄️ Migrations SQL (Nouvelles Fonctionnalités)

Pour tester les nouvelles fonctionnalités (coupons, avis produits), vous devez exécuter les migrations SQL :

```bash
# Avec Docker
docker exec -i girlycrea-postgres-local psql -U girlycrea_user -d girlycrea < migrations/create_coupons_tables.sql
docker exec -i girlycrea-postgres-local psql -U girlycrea_user -d girlycrea < migrations/create_product_reviews_tables.sql

# Ou utiliser le script automatique
./scripts/run-migrations.sh
```

📖 **Guide complet pour tester les nouvelles fonctionnalités** : Voir `TEST-LOCAL-MIGRATIONS.md`

---

**Une fois que tout fonctionne localement, vous pouvez migrer vers le serveur de l'ami! 🚀**



