# 🚀 GUIDE PRATIQUE: Migration VPS Ubuntu pour GirlyCrea

**Date**: Décembre 2025 | **Version**: 1.0 | **Status**: Production Ready ✅

---

## 📋 TABLE DES MATIÈRES

1. [Résumé Exécutif](#résumé-exécutif)
2. [Recommandations Clés](#recommandations-clés)
3. [Services à Migrer](#services-à-migrer)
4. [Infrastructure Recommandée](#infrastructure-recommandée)
5. [Scripts Prêts à l'Emploi](#scripts-prêts-à-lemploi)
6. [Timeline Détaillée](#timeline-détaillée)
7. [Pièges à Éviter](#pièges-à-éviter)
8. [Dépannage Rapide](#dépannage-rapide)

---

## 📊 RÉSUMÉ EXÉCUTIF

### Économies Projetées

```
AVANT                          APRÈS
─────────────────────────────────────────────────────────────
Supabase        25€/mois  →  PostgreSQL local     0€
Upstash         29€/mois  →  Redis local          0€
Resend          10€/mois  →  Postfix local        0€
Sentry           7€/mois  →  Prometheus+Grafana   0€
─────────────────────────────────────────────────────────────
                71€/mois      VPS Ubuntu          5€
                              S3 Glacier           2€
                              Domain               1€
                              ───────────────────────────────
                              TOTAL               8€/mois

ÉCONOMIES: 63€/mois = 756€/an (-89%)
ROI: 6 mois (break-even infrastructure)
```

### Stack Recommandée

```
🗄️  PostgreSQL 15 (local)
🔴 Redis 7 (local, allkeys-lru)
📧 Postfix (local) ou SMTP externe gratuit
🌐 Nginx (reverse proxy)
⚙️  PM2 (gestion processus, cluster mode)
📊 Prometheus + Grafana (monitoring)
💾 Borg + S3 Glacier (backup 3-2-1)
🔄 GitHub Actions (CI/CD)
```

### Timeline

- **Jour 0**: 3-4h setup infrastructure
- **Jour 1**: 4-6h migration + cutover
- **Jour 2**: 2-3h optimisation
- **Downtime**: < 5 minutes (DNS basculement)

---

## ✅ RECOMMANDATIONS CLÉS

| Composant | Solution | Coûts | Pourquoi |
|-----------|----------|-------|----------|
| **Serveur** | Hetzner CX21 | 4€15/mois | Meilleur prix/perf, 99.9% uptime |
| **DB** | PostgreSQL 15 | Gratuit | Performant, support long terme |
| **Cache** | Redis 7 | Gratuit | Persistance optionnelle, performant |
| **Email** | Postfix local | Gratuit | Acceptable avec SPF/DKIM/DMARC |
| **Reverse Proxy** | Nginx | Gratuit | Mature, performant, flexible |
| **Deploy** | PM2 | Gratuit | Cluster mode, simple, fiable |
| **Monitoring** | Prometheus+Grafana | Gratuit | Granulaire, open-source |
| **Backup** | Borg + S3 Glacier | 2€/mois | Fiabilité, dédup, archivage |
| **CI/CD** | GitHub Actions | Gratuit | Déploiement automatique |

---

## 🔄 SERVICES À MIGRER

### 1. Base de Données: PostgreSQL 15

**Recommandation**: ✅ PostgreSQL 15 local

**Pourquoi**:
- ✅ Gratuit et open-source
- ✅ Performance optimale pour e-commerce
- ✅ Support long terme
- ✅ PgBouncer pour connection pooling (+60% débit)

**Migration**:
```bash
# Export depuis Supabase
pg_dump -h <supabase-host> -U postgres -d girlycrea > backup.sql

# Import vers VPS
psql -U girlycrea_user -d girlycrea < backup.sql
```

### 2. Cache: Redis 7

**Recommandation**: ✅ Redis 7 local

**Pourquoi**:
- ✅ Gratuit et performant
- ✅ Configuration `allkeys-lru` pour e-commerce
- ✅ Pas de persistence nécessaire (données en DB)

**Migration**:
```bash
# Export depuis Upstash
redis-cli -h <upstash-host> --tls -a <password> --rdb /tmp/dump.rdb

# Import vers Redis local
redis-cli --rdb /tmp/dump.rdb
```

### 3. Emails: Postfix

**Recommandation**: ✅ Postfix local (ou SMTP externe gratuit)

**Pourquoi**:
- ✅ Gratuit
- ✅ Acceptable avec configuration SPF/DKIM/DMARC
- ⚠️ Risque spam 30% (mitigation: DNS records corrects)

**Alternative**: Gmail SMTP ou SendGrid free tier (100 emails/jour)

### 4. Monitoring: Prometheus + Grafana

**Recommandation**: ✅ Prometheus + Grafana

**Pourquoi**:
- ✅ Gratuit et granulaire
- ✅ Métriques Node.js, PostgreSQL, Redis, Nginx
- ✅ Alertes configurables

**Alternative innovante**: SigNoz (remplace Sentry, -40€/mois)

---

## 🏗️ INFRASTRUCTURE RECOMMANDÉE

### VPS Recommandé

**Hetzner CX21** (4€15/mois)
- 2 vCPU
- 4GB RAM
- 40GB SSD
- 20TB trafic

**Alternatives**:
- OVH Starter: 5€/mois (2 vCPU, 4GB RAM, 80GB SSD)
- Scaleway DEV1-S: 5€/mois (2 vCPU, 4GB RAM, 20GB SSD)

### Architecture

```
                    Internet
                       ↓
              Cloudflare (Free CDN)
                       ↓
              Nginx (80/443) Reverse Proxy
                       ↓
        PM2 (4 instances Node.js)
              ↓         ↓         ↓
    ┌─────────────────────────────────────┐
    │ Services Locaux (VPS Ubuntu)        │
    ├─────────────────────────────────────┤
    │ PostgreSQL + PgBouncer             │
    │ Redis (sessions + cache)            │
    │ Postfix (emails)                    │
    │ Prometheus + Grafana (monitoring)  │
    └─────────────────────────────────────┘
    
Backups: Borg local + WAL-S3 Glacier
```

---

## 🔧 SCRIPTS PRÊTS À COPIER-COLLER

### 📋 QUICK START COMMAND

```bash
# Option 1: Utiliser le script complet existant
cd /home/ghislain/girlycrea-site
bash scripts/migration-vps/install-all.sh

# Option 2: Installation manuelle étape par étape
bash scripts/migration-vps/setup-postgresql.sh
bash scripts/migration-vps/setup-redis.sh
bash scripts/migration-vps/setup-nginx.sh
bash scripts/migration-vps/setup-pm2.sh
```

### 🚀 Script Complet 1-en-1 (Tous les Setup)

```bash
#!/bin/bash
# /root/complete-setup.sh
# Exécution: bash /root/complete-setup.sh

set -e

echo "🚀 GirlyCrea Complete VPS Setup"
echo "================================"

# ============= 1. SYSTÈME =============
echo "📦 [1/8] System Setup..."
apt update && apt upgrade -y
apt install -y curl wget git htop nano ufw fail2ban

# Firewall
ufw --force enable
ufw allow 22/tcp 80/tcp 443/tcp
ufw default deny incoming

# ============= 2. NODE.JS =============
echo "🟢 [2/8] Node.js Setup..."
curl -fsSL https://deb.nodesource.com/setup_20.x | bash
apt install -y nodejs npm
npm install -g pm2 pm2-logrotate

# ============= 3. POSTGRESQL =============
echo "🗄️  [3/8] PostgreSQL Setup..."
apt install -y postgresql-common
curl https://www.postgresql.org/media/keys/ACCC4CF8.asc | gpg --dearmor | tee /etc/apt/trusted.gpg.d/apt.postgresql.org.gpg
echo "deb [signed-by=/etc/apt/trusted.gpg.d/apt.postgresql.org.gpg] http://apt.postgresql.org/pub/repos/apt $(lsb_release -cs)-pgdg main" | tee /etc/apt/sources.list.d/pgdg.list
apt update && apt install -y postgresql-15 postgresql-contrib-15

# Configuration PostgreSQL
read -sp "Mot de passe PostgreSQL pour girlycrea_user: " DB_PASS
echo ""

sudo -u postgres psql << EOF
CREATE DATABASE girlycrea;
CREATE USER girlycrea_user WITH PASSWORD '$DB_PASS';
ALTER ROLE girlycrea_user SET client_encoding TO 'utf8';
ALTER ROLE girlycrea_user SET default_transaction_isolation TO 'read committed';
GRANT ALL PRIVILEGES ON DATABASE girlycrea TO girlycrea_user;
\q
EOF

# Tuning PostgreSQL
sudo tee -a /etc/postgresql/15/main/postgresql.conf > /dev/null << 'EOF'
# Memory
shared_buffers = 256MB
effective_cache_size = 768MB
work_mem = 8MB
maintenance_work_mem = 64MB

# WAL
wal_level = replica
wal_buffers = 16MB
min_wal_size = 1GB
max_wal_size = 4GB
checkpoint_completion_target = 0.9

# Query Planner
random_page_cost = 1.1
effective_io_concurrency = 200
default_statistics_target = 100

# Connections
max_connections = 100
EOF

systemctl restart postgresql

# ============= 4. REDIS =============
echo "🔴 [4/8] Redis Setup..."
apt install -y redis-server

# Configuration Redis
sudo tee -a /etc/redis/redis.conf > /dev/null << 'EOF'
maxmemory 256mb
maxmemory-policy allkeys-lru
save ""
EOF

systemctl restart redis-server

# ============= 5. NGINX =============
echo "🌐 [5/8] Nginx Setup..."
apt install -y nginx

read -p "Nom de domaine (ex: girlycrea.com): " DOMAIN

# Configuration Nginx de base (sera complétée après)
sudo tee /etc/nginx/sites-available/girlycrea > /dev/null << EOF
server {
    listen 80;
    server_name $DOMAIN www.$DOMAIN;
    
    location /api {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
    }
}
EOF

sudo ln -sf /etc/nginx/sites-available/girlycrea /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t && sudo systemctl reload nginx

# ============= 6. CERTBOT (SSL) =============
echo "🔒 [6/8] SSL Setup..."
apt install -y certbot python3-certbot-nginx
echo "⚠️  Exécuter après DNS configuré: sudo certbot --nginx -d $DOMAIN -d www.$DOMAIN"

# ============= 7. PM2 =============
echo "⚙️  [7/8] PM2 Setup..."
npm install -g pm2
pm2 install pm2-logrotate
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 7

# ============= 8. MONITORING (Optionnel) =============
echo "📊 [8/8] Monitoring Setup (Optionnel)..."
read -p "Installer Prometheus + Grafana? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    # Prometheus
    wget https://github.com/prometheus/prometheus/releases/download/v2.45.0/prometheus-2.45.0.linux-amd64.tar.gz
    tar xvfz prometheus-*.tar.gz
    sudo mv prometheus-2.45.0.linux-amd64 /opt/prometheus
    sudo useradd --no-create-home --shell /bin/false prometheus
    sudo chown -R prometheus:prometheus /opt/prometheus
    
    # Grafana
    sudo apt install -y software-properties-common
    sudo add-apt-repository "deb https://packages.grafana.com/oss/deb stable main"
    wget -q -O - https://packages.grafana.com/gpg.key | sudo apt-key add -
    sudo apt update && sudo apt install -y grafana
    sudo systemctl enable grafana-server
    sudo systemctl start grafana-server
    
    echo "✅ Prometheus: http://localhost:9090"
    echo "✅ Grafana: http://localhost:3000 (admin/admin)"
fi

# ============= RÉSUMÉ =============
echo ""
echo "=================================================="
echo "✅ Installation terminée !"
echo ""
echo "📝 Variables d'environnement à configurer:"
echo "DATABASE_URL=postgresql://girlycrea_user:$DB_PASS@localhost:5432/girlycrea"
echo "REDIS_URL=redis://localhost:6379"
echo ""
echo "📋 Prochaines étapes:"
echo "1. Configurer DNS (A record vers cette IP)"
echo "2. Obtenir SSL: sudo certbot --nginx -d $DOMAIN -d www.$DOMAIN"
echo "3. Cloner projet: git clone <repo> /opt/girlycrea-site"
echo "4. Configurer .env avec les variables ci-dessus"
echo "5. Build et démarrer: npm run build && pm2 start ecosystem.config.js"
echo ""
echo "📖 Consultez GUIDE-PRATIQUE-MIGRATION-VPS.md pour plus de détails"
echo ""
```

### 🔄 Script Migration Données

```bash
#!/bin/bash
# /root/migrate-data.sh
# Migration des données depuis Supabase/Upstash vers VPS

set -e

echo "🔄 Migration des données GirlyCrea"
echo "===================================="

# 1. Migration PostgreSQL
echo "📦 [1/2] Migration PostgreSQL..."
read -p "Host Supabase: " SUPABASE_HOST
read -p "Port Supabase [5432]: " SUPABASE_PORT
SUPABASE_PORT=${SUPABASE_PORT:-5432}
read -p "Database Supabase: " SUPABASE_DB
read -p "User Supabase: " SUPABASE_USER
read -sp "Password Supabase: " SUPABASE_PASS
echo ""

echo "Export depuis Supabase..."
PGPASSWORD=$SUPABASE_PASS pg_dump -h $SUPABASE_HOST -p $SUPABASE_PORT -U $SUPABASE_USER -d $SUPABASE_DB -F c -f /tmp/girlycrea_backup.dump

echo "Import vers PostgreSQL local..."
pg_restore -U girlycrea_user -d girlycrea -c /tmp/girlycrea_backup.dump || echo "⚠️  Certaines erreurs peuvent être normales (tables existantes)"

# 2. Migration Redis
echo ""
echo "🔴 [2/2] Migration Redis..."
read -p "Host Upstash: " UPSTASH_HOST
read -sp "Password Upstash: " UPSTASH_PASS
echo ""

echo "Export depuis Upstash..."
redis-cli -h $UPSTASH_HOST --tls -a $UPSTASH_PASS --rdb /tmp/redis_backup.rdb

echo "Import vers Redis local..."
redis-cli --rdb /tmp/redis_backup.rdb || echo "⚠️  Vérifier que Redis local est démarré"

echo ""
echo "✅ Migration terminée !"
echo "🧪 Vérifier les données:"
echo "   psql -U girlycrea_user -d girlycrea -c 'SELECT COUNT(*) FROM products;'"
echo "   redis-cli DBSIZE"
```

### 💾 Script Backup Automatique

```bash
#!/bin/bash
# /root/backup-postgres.sh
# Backup PostgreSQL quotidien avec upload S3

set -e

BACKUP_DIR="/backup/postgres"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/base_backup_$DATE.tar.gz"

mkdir -p $BACKUP_DIR

echo "💾 Backup PostgreSQL..."
pg_basebackup -D $BACKUP_DIR/temp -Ft -z -P -U girlycrea_user

tar -czf $BACKUP_FILE -C $BACKUP_DIR/temp .

# Upload S3 Glacier (si configuré)
# aws s3 cp $BACKUP_FILE s3://girlycrea-backups/postgres/base/ --storage-class GLACIER

# Nettoyer anciens backups (> 7 jours)
find $BACKUP_DIR -name "*.tar.gz" -mtime +7 -delete

echo "✅ Backup créé: $BACKUP_FILE"
```

### 🧪 Script Test Santé

```bash
#!/bin/bash
# /root/health-check.sh
# Vérification santé système

echo "🏥 Health Check GirlyCrea"
echo "========================"

# PostgreSQL
echo -n "PostgreSQL: "
if sudo -u postgres psql -c "SELECT 1;" > /dev/null 2>&1; then
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

# Nginx
echo -n "Nginx: "
if systemctl is-active --quiet nginx; then
    echo "✅ OK"
else
    echo "❌ ERREUR"
fi

# PM2
echo -n "PM2: "
if pm2 list | grep -q "girlycrea-api"; then
    echo "✅ OK"
else
    echo "❌ ERREUR"
fi

# Disk
echo -n "Disk Space: "
DISK=$(df -h / | awk 'NR==2 {print $5}' | sed 's/%//')
if [ $DISK -lt 85 ]; then
    echo "✅ OK ($DISK% utilisé)"
else
    echo "⚠️  ATTENTION ($DISK% utilisé)"
fi

# Memory
echo -n "Memory: "
MEM=$(free | awk 'NR==2{printf "%.0f", $3*100/$2}')
if [ $MEM -lt 90 ]; then
    echo "✅ OK ($MEM% utilisé)"
else
    echo "⚠️  ATTENTION ($MEM% utilisé)"
fi
```

### 🔒 Script Hardening Sécurité

```bash
#!/bin/bash
# /root/security-hardening.sh
# Hardening sécurité VPS

set -e

echo "🔒 Security Hardening"
echo "====================="

# Fail2ban
apt install -y fail2ban
systemctl enable fail2ban
systemctl start fail2ban

# SSH Hardening
sudo tee -a /etc/ssh/sshd_config > /dev/null << 'EOF'
PermitRootLogin no
PasswordAuthentication no
PubkeyAuthentication yes
Port 2222
EOF

echo "⚠️  IMPORTANT: Configurer SSH keys avant de redémarrer SSH!"
echo "   ssh-copy-id user@server"
read -p "Continuer? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    systemctl restart sshd
fi

# Updates automatiques
apt install -y unattended-upgrades
dpkg-reconfigure -plow unattended-upgrades

echo "✅ Hardening terminé"
```

---

## ⏰ TIMELINE DÉTAILLÉE

### JOUR 0 - Préparation (3-4h)

```
20:00 - 20:30 : Provisionnement VPS
20:30 - 21:00 : Sécurisation initiale
21:00 - 21:30 : Installation services
21:30 - 22:00 : Configuration PostgreSQL
22:00 - 22:30 : Configuration Redis
22:30 - 23:00 : Configuration Nginx
23:00 - 23:30 : DNS préparation (TTL 300s)
```

### JOUR 1 - Migration (4-6h)

```
08:00 - 08:30 : Révision & préparation
08:30 - 10:00 : Migration PostgreSQL (2h)
10:00 - 10:30 : Migration Redis (30min)
10:30 - 11:30 : Déploiement application (1h)
11:30 - 12:00 : Tests smoke (30min)
12:00 - 13:00 : Pause
13:00 - 13:30 : Tests fonctionnels (30min)
13:30 - 14:00 : DNS basculement (1 min!)
14:00 - 18:00 : Monitoring intensif (4h)
```

### JOUR 2 - Optimisation (2-3h)

```
08:00 - 09:30 : Configuration PgBouncer (1h30)
09:30 - 10:30 : Optimisation indexes (1h)
10:30 - 11:30 : Configuration monitoring (1h)
11:30 - 12:30 : Configuration backups (1h)
12:30 - 13:30 : Pause
13:30 - 14:30 : Tests charge (1h)
14:30 - 16:00 : Documentation + formation (1h30)
```

---

## ⚠️ PIÈGES À ÉVITER

### ❌ Erreurs Critiques

1. **PgBouncer pool_mode=statement**
   - ❌ Casse les transactions
   - ✅ Utiliser `transaction` ou `session`

2. **DNS TTL élevé**
   - ❌ Propagation lente (24h)
   - ✅ Réduire à 300s avant cutover

3. **Postfix sans SPF/DKIM**
   - ❌ Emails en spam
   - ✅ Configurer SPF/DKIM/DMARC

4. **Pas de test restore**
   - ❌ Backups inutiles en cas de crash
   - ✅ Tester restore avant migration

5. **Pas de monitoring**
   - ❌ Problèmes non détectés
   - ✅ Prometheus + Grafana dès JOUR 1

6. **Pas de snapshot VPS**
   - ❌ Impossible de rollback
   - ✅ Snapshot avant chaque déploiement

---

## 🔧 DÉPANNAGE RAPIDE

### Problème: PostgreSQL ne démarre pas

```bash
# Vérifier logs
sudo journalctl -u postgresql -n 50

# Vérifier permissions
sudo chown -R postgres:postgres /var/lib/postgresql

# Redémarrer
sudo systemctl restart postgresql
```

### Problème: Redis mémoire pleine

```bash
# Vérifier mémoire
redis-cli info memory

# Nettoyer cache
redis-cli FLUSHALL

# Ajuster maxmemory dans /etc/redis/redis.conf
```

### Problème: Nginx erreur 502

```bash
# Vérifier backend
curl http://localhost:3001/health

# Vérifier logs
sudo tail -f /var/log/nginx/error.log

# Redémarrer backend
pm2 restart girlycrea-api
```

### Problème: PM2 processus morts

```bash
# Vérifier logs
pm2 logs girlycrea-api --lines 50

# Redémarrer
pm2 restart girlycrea-api

# Vérifier mémoire
pm2 monit
```

### Problème: SSL Let's Encrypt expire

```bash
# Renouveler
sudo certbot renew

# Tester renouvellement automatique
sudo certbot renew --dry-run
```

---

## 📚 RESSOURCES

### Documentation Complète

- **RESUME-FINAL-MIGRATION-VPS.md** - Résumé complet avec matrices
- **RESUME-EXECUTIF-MIGRATION-VPS.md** - Vue d'ensemble exécutive
- **migration_vps_e-commerce_guide.md** - Guide complet détaillé
- **configs_techniques_vps.md** - Configurations prêtes à l'emploi
- **timeline_execution_risques.md** - Timeline + gestion risques
- **MIGRATION-VPS-INDEX.md** - Navigation entre documents

### Scripts Disponibles

- `scripts/migration-vps/install-all.sh` - Installation complète
- `scripts/migration-vps/setup-postgresql.sh` - PostgreSQL
- `scripts/migration-vps/setup-redis.sh` - Redis
- `scripts/migration-vps/setup-nginx.sh` - Nginx
- `scripts/migration-vps/setup-pm2.sh` - PM2
- `scripts/migration-vps/migrate-data.sh` - Migration données
- `scripts/migration-vps/backup-postgres.sh` - Backup PostgreSQL

### Liens Utiles

- PostgreSQL: https://www.postgresql.org/docs/
- Redis: https://redis.io/docs/
- Nginx: https://nginx.org/en/docs/
- PM2: https://pm2.keymetrics.io/docs/
- Prometheus: https://prometheus.io/docs/
- Grafana: https://grafana.com/docs/

---

## ✅ CHECKLIST FINALE

### Avant Migration

- [ ] VPS provisionné et accessible
- [ ] Scripts testés en staging
- [ ] Backups Supabase exportés
- [ ] DNS TTL réduit à 300s
- [ ] Plan rollback documenté
- [ ] Équipe formée

### Pendant Migration

- [ ] PostgreSQL migré et vérifié
- [ ] Redis migré et vérifié
- [ ] Application déployée
- [ ] Tests smoke passés
- [ ] DNS basculé
- [ ] Monitoring actif

### Après Migration

- [ ] Monitoring 24h stable
- [ ] Backups automatiques configurés
- [ ] Documentation mise à jour
- [ ] Équipe formée aux outils
- [ ] Anciens services désactivés (après 7 jours)

---

**Félicitations! Vous êtes prêt à migrer GirlyCrea! 🚀**

**Temps estimé**: 3-4h setup + 4-6h migration = **1-2 jours**  
**Downtime**: **< 5 minutes**  
**Économies**: **756€/an**

---

**Document créé le**: 2025  
**Dernière mise à jour**: 2025  
**Version**: 1.0



