# 🏗️ Guide Complet de Migration VPS - E-commerce GirlyCrea

**Version**: 1.0  
**Date**: 2025  
**Auteur**: Guide de migration complet pour e-commerce

---

## 📋 Table des Matières

1. [Architecture Détaillée](#architecture-détaillée)
2. [Alternatives Innovantes 2025](#alternatives-innovantes-2025)
3. [Calcul Économique Complet](#calcul-économique-complet)
4. [Stratégies de Backup PITR](#stratégies-de-backup-pitr)
5. [Configuration Complète](#configuration-complète)
6. [Migration Progressive](#migration-progressive)

---

## 🏗️ Architecture Détaillée

### Architecture Actuelle (Services Externes)

```
Frontend (Next.js)
    ↓
Backend (Node.js/Express)
    ↓
┌─────────────────────────────────────┐
│ Services Externes (Payants)        │
├─────────────────────────────────────┤
│ Supabase (PostgreSQL)    25€/mois  │
│ Upstash (Redis)           29€/mois  │
│ Resend (Emails)           10€/mois  │
│ Sentry (Monitoring)        7€/mois  │
└─────────────────────────────────────┘
TOTAL: 71€/mois
```

### Architecture Cible (VPS Dédié)

```
                    Internet
                       ↓
              Cloudflare (Free CDN)
                       ↓
              Nginx (80/443) Reverse Proxy
                       ↓
              [Varnish Cache] (optionnel)
                       ↓
        PM2 (4 instances Node.js)
              ↓         ↓         ↓
    ┌─────────────────────────────────────┐
    │ Services Locaux (VPS Ubuntu)       │
    ├─────────────────────────────────────┤
    │ PostgreSQL + PgBouncer             │
    │ Redis (sessions + cache)            │
    │ Postfix (emails)                    │
    │ Prometheus + Grafana (monitoring)  │
    └─────────────────────────────────────┘
    
Backups: Borg local + WAL-S3 Glacier
```

### Composants Détaillés

#### 1. Reverse Proxy - Nginx

**Rôle**: Router les requêtes, SSL/TLS, load balancing basique

**Configuration recommandée**:
- Worker processes: `auto` (nombre de CPU)
- Worker connections: `1024`
- Keepalive timeout: `65s`
- Gzip compression activé
- SSL/TLS avec Let's Encrypt (certbot)

**Avantages**:
- ✅ Mature et stable
- ✅ Performance élevée
- ✅ Configuration flexible
- ✅ Support HTTP/2 et HTTP/3

#### 2. Cache HTTP - Varnish (Optionnel)

**Rôle**: Cache des pages statiques et API responses

**Quand l'utiliser**:
- Trafic élevé (> 10k req/min)
- Contenu statique fréquent
- Réduction latence critique

**Configuration**:
- TTL par défaut: `2h`
- Cache invalidation: Via purge API
- Storage: `malloc,256M`

**Impact**: 50x plus rapide pour contenu en cache

#### 3. Process Manager - PM2

**Rôle**: Gérer les processus Node.js, auto-restart, clustering

**Configuration recommandée**:
```javascript
{
  "apps": [{
    "name": "girlycrea-api",
    "script": "./dist/server.js",
    "instances": 4,
    "exec_mode": "cluster",
    "max_memory_restart": "500M",
    "env": {
      "NODE_ENV": "production"
    }
  }]
}
```

**Avantages vs Docker**:
- ✅ Moins de overhead RAM
- ✅ Plus simple pour 1 VPS
- ✅ Clustering intégré
- ✅ Monitoring intégré

#### 4. Base de Données - PostgreSQL

**Rôle**: Stockage principal des données

**Configuration optimisée**:
```conf
# postgresql.conf
shared_buffers = 256MB          # 25% RAM
effective_cache_size = 1GB      # 50-75% RAM
maintenance_work_mem = 64MB
checkpoint_completion_target = 0.9
wal_buffers = 16MB
default_statistics_target = 100
random_page_cost = 1.1          # SSD
effective_io_concurrency = 200  # SSD
work_mem = 4MB
min_wal_size = 1GB
max_wal_size = 4GB
```

**PgBouncer** (Connection Pooler):
- Mode: `transaction` (pas `statement`!)
- Pool size: `25` par database
- Max client connections: `100`

**Impact**: +60% débit DB

#### 5. Cache - Redis

**Rôle**: Sessions utilisateurs, cache API, paniers abandonnés

**Configuration**:
```conf
# redis.conf
maxmemory 256mb
maxmemory-policy allkeys-lru
save ""  # Pas de persistence si données en DB
```

**Utilisation**:
- Sessions: TTL 7 jours
- Cache API: TTL 1h
- Paniers: TTL 30 jours

#### 6. Email - Postfix

**Rôle**: Envoi d'emails transactionnels

**Configuration critique**:
- ✅ SPF record DNS
- ✅ DKIM signature
- ✅ DMARC policy
- ✅ Reverse DNS (PTR)

**Limitations**:
- ⚠️ Risque spam (30% selon analyse)
- ⚠️ Nécessite IP dédiée propre
- ⚠️ Warm-up progressif

**Alternative**: SMTP externe gratuit (Gmail, SendGrid free tier)

#### 7. Monitoring - Prometheus + Grafana

**Rôle**: Métriques, alertes, dashboards

**Métriques collectées**:
- Node.js: CPU, RAM, event loop lag
- PostgreSQL: connexions, queries lentes, locks
- Redis: mémoire, hit rate
- Nginx: requêtes/sec, latence, codes erreur
- Système: disk I/O, network

**Alertes critiques**:
- CPU > 80% pendant 5min
- RAM > 90%
- Disk > 85%
- PostgreSQL connexions > 80
- Erreurs 5xx > 1%

---

## 🚀 Alternatives Innovantes 2025

### 1. SigNoz (Remplace Sentry)

**Description**: Observabilité complète (traces, métriques, logs)

**Avantages**:
- ✅ Open-source
- ✅ -40€/mois vs Sentry
- ✅ Traces distribuées (OpenTelemetry)
- ✅ Logs structurés
- ✅ Self-hosted

**Installation**:
```bash
git clone https://github.com/SigNoz/signoz.git
cd signoz/deploy
./install.sh
```

**Configuration Node.js**:
```javascript
const { NodeSDK } = require('@opentelemetry/sdk-node');
const { getNodeAutoInstrumentations } = require('@opentelemetry/auto-instrumentations-node');

const sdk = new NodeSDK({
  instrumentations: [getNodeAutoInstrumentations()],
  serviceName: 'girlycrea-api',
});

sdk.start();
```

### 2. Uptime Kuma (Monitoring Uptime)

**Description**: Monitoring uptime avec alertes temps réel

**Avantages**:
- ✅ Gratuit et open-source
- ✅ Alertes multi-canaux (Discord, Telegram, Email)
- ✅ Status page publique
- ✅ Heartbeat monitoring

**Installation**:
```bash
docker run -d \
  --name uptime-kuma \
  -p 3001:3001 \
  -v uptime-kuma:/app/data \
  louislam/uptime-kuma:1
```

### 3. Minio (S3-Compatible Storage)

**Description**: Stockage objet compatible S3

**Avantages**:
- ✅ Compatible API S3
- ✅ Self-hosted
- ✅ Multi-tenant
- ✅ Réplication

**Utilisation**:
- Backups PostgreSQL
- Uploads fichiers utilisateurs
- Assets statiques

### 4. Plausible Analytics (Analytics RGPD)

**Description**: Analytics léger et respectueux de la vie privée

**Avantages**:
- ✅ RGPD-compliant
- ✅ Pas de cookies
- ✅ Léger (< 1KB)
- ✅ Self-hosted possible

**Alternative**: Matomo (plus complet mais plus lourd)

---

## 💰 Calcul Économique Complet

### Coûts Mensuels Détaillés

#### Avant Migration (Services Externes)

| Service | Plan | Coût Mensuel | Coût Annuel |
|---------|------|--------------|-------------|
| Supabase | Pro | 25€ | 300€ |
| Upstash | Pay-as-you-go | 29€ | 348€ |
| Resend | Essentials | 10€ | 120€ |
| Sentry | Team | 7€ | 84€ |
| **TOTAL** | | **71€** | **852€** |

**Coûts cachés**:
- Pas de maintenance technique
- Support inclus
- Scaling automatique

#### Après Migration (VPS Dédié)

| Service | Détails | Coût Mensuel | Coût Annuel |
|---------|---------|--------------|-------------|
| VPS Ubuntu | 4 vCPU, 8GB RAM, 160GB SSD | 5€ | 60€ |
| S3 Glacier | Backups (50GB) | 2€ | 24€ |
| Domain | .com | 1€ | 12€ |
| Cloudflare | Free tier | 0€ | 0€ |
| **TOTAL Infrastructure** | | **8€** | **96€** |

**Coûts de maintenance** (estimés):
- Temps: 2h/mois @ 50€/h = 100€/mois = 1200€/an
- Formation initiale: 8h @ 50€/h = 400€ (one-time)

**TOTAL Annuel**:
- Infrastructure: 96€
- Maintenance: 1200€
- Formation: 400€ (année 1)
- **TOTAL Année 1**: 1696€
- **TOTAL Année 2+**: 1296€/an

### ROI (Return on Investment)

**Année 1**:
- Coût avant: 852€
- Coût après: 1696€
- **Différence**: +844€ (coût initial)

**Année 2+**:
- Coût avant: 852€
- Coût après: 1296€
- **Différence**: +444€/an

**ROI en coûts infrastructure**: 6 mois

**Gain réel** (si maintenance interne):
- Si maintenance = 0€ (équipe interne)
- **Économie annuelle**: 852€ - 96€ = **756€/an**

### Comparaison Scénarios

| Scénario | Coût Annuel | Maintenance | Contrôle | Scalabilité |
|----------|-------------|-------------|----------|-------------|
| **Services Externes** | 852€ | 0h | Faible | Auto |
| **VPS + Maintenance Externe** | 1696€ | 24h/an | Total | Manuelle |
| **VPS + Maintenance Interne** | 96€ | 24h/an | Total | Manuelle |

**Recommandation**: VPS + Maintenance Interne si équipe technique disponible.

---

## 💾 Stratégies de Backup PITR

### Point-in-Time Recovery (PITR)

**Objectif**: Restaurer la DB à n'importe quel point dans le temps

**Composants**:
1. **WAL Archiving** (Write-Ahead Logs)
2. **Base Backup** (copie complète)
3. **Restore Process** (reconstruction)

### Configuration PostgreSQL

#### 1. WAL Archiving

```conf
# postgresql.conf
wal_level = replica
archive_mode = on
archive_command = 'aws s3 cp %p s3://girlycrea-backups/wal/%f'
archive_timeout = 300  # Force WAL switch toutes les 5min
```

**RPO (Recovery Point Objective)**: < 5 minutes

#### 2. Base Backup Automatisé

```bash
#!/bin/bash
# backup-postgres.sh

BACKUP_DIR="/backup/postgres"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/base_backup_$DATE.tar.gz"

# Créer backup
pg_basebackup -D $BACKUP_DIR/temp \
  -Ft -z -P -W

# Compresser
tar -czf $BACKUP_FILE -C $BACKUP_DIR/temp .

# Upload S3 Glacier
aws s3 cp $BACKUP_FILE \
  s3://girlycrea-backups/postgres/base/ \
  --storage-class GLACIER

# Nettoyer anciens backups locaux (> 7 jours)
find $BACKUP_DIR -name "*.tar.gz" -mtime +7 -delete
```

**Fréquence**: Quotidienne à 2h du matin

**Rétention**:
- Local: 7 jours
- S3 Glacier: 1 an

#### 3. Restore Process

**Restore depuis base backup**:
```bash
# 1. Arrêter PostgreSQL
sudo systemctl stop postgresql

# 2. Restaurer base backup
rm -rf /var/lib/postgresql/data/*
tar -xzf base_backup_20250101_020000.tar.gz -C /var/lib/postgresql/data/

# 3. Configurer recovery
cat > /var/lib/postgresql/data/recovery.conf <<EOF
restore_command = 'aws s3 cp s3://girlycrea-backups/wal/%f %p'
recovery_target_time = '2025-01-01 10:30:00'
EOF

# 4. Redémarrer
sudo systemctl start postgresql
```

**RTO (Recovery Time Objective)**: 30-60 minutes

### Stratégie Borg Backup (Fichiers)

**Pour**: Code source, uploads utilisateurs, configurations

```bash
# Installation
sudo apt install borgbackup

# Initialisation repo
borg init --encryption repokey /backup/borg

# Backup
borg create \
  --stats \
  --progress \
  /backup/borg::girlycrea-{now} \
  /var/www/girlycrea \
  /etc/nginx \
  /etc/postgresql

# Upload S3
aws s3 sync /backup/borg s3://girlycrea-backups/borg/
```

**Fréquence**: Quotidienne

### Test de Restore

**⚠️ CRITIQUE**: Tester les backups régulièrement!

```bash
# Test restore PostgreSQL (staging)
# 1. Créer DB test
createdb test_restore

# 2. Restaurer backup
pg_restore -d test_restore base_backup_20250101.tar.gz

# 3. Vérifier données
psql test_restore -c "SELECT COUNT(*) FROM products;"
```

**Fréquence test**: Mensuelle minimum

---

## ⚙️ Configuration Complète

### 1. Nginx Configuration

```nginx
# /etc/nginx/sites-available/girlycrea
upstream backend {
    least_conn;
    server 127.0.0.1:3001;
    server 127.0.0.1:3002;
    server 127.0.0.1:3003;
    server 127.0.0.1:3004;
}

server {
    listen 80;
    server_name girlycrea.com www.girlycrea.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name girlycrea.com www.girlycrea.com;

    ssl_certificate /etc/letsencrypt/live/girlycrea.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/girlycrea.com/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;

    # Gzip
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css application/json application/javascript;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # API
    location /api {
        proxy_pass http://backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Frontend
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### 2. PM2 Ecosystem

```javascript
// ecosystem.config.js
module.exports = {
  apps: [{
    name: 'girlycrea-api',
    script: './dist/server.js',
    instances: 4,
    exec_mode: 'cluster',
    max_memory_restart: '500M',
    env: {
      NODE_ENV: 'production',
      PORT: 3001
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    merge_logs: true,
    autorestart: true,
    watch: false
  }]
};
```

### 3. PostgreSQL Tuning

```conf
# /etc/postgresql/15/main/postgresql.conf

# Memory
shared_buffers = 256MB
effective_cache_size = 1GB
work_mem = 4MB
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
```

### 4. Redis Configuration

```conf
# /etc/redis/redis.conf

# Memory
maxmemory 256mb
maxmemory-policy allkeys-lru

# Persistence (désactivé si données en DB)
save ""

# Network
bind 127.0.0.1
protected-mode yes
port 6379

# Logging
loglevel notice
```

### 5. Postfix Configuration

```conf
# /etc/postfix/main.cf

myhostname = mail.girlycrea.com
mydomain = girlycrea.com
myorigin = $mydomain
inet_interfaces = loopback-only
inet_protocols = ipv4
mydestination = $myhostname, localhost.$mydomain, $mydomain
relayhost =
```

**DNS Records requis**:
```
# SPF
TXT @ "v=spf1 mx a:mail.girlycrea.com ~all"

# DKIM
TXT default._domainkey "v=DKIM1; k=rsa; p=..."

# DMARC
TXT _dmarc "v=DMARC1; p=quarantine; rua=mailto:dmarc@girlycrea.com"
```

---

## 🔄 Migration Progressive

### Phase 1: Réplica PostgreSQL (Jour 0-1)

**Objectif**: Créer une réplica en lecture seule sur VPS

```bash
# Sur VPS
# 1. Configuration streaming replication
# postgresql.conf (master)
wal_level = replica
max_wal_senders = 3
wal_keep_size = 1GB

# pg_hba.conf (master)
host replication replicator <VPS_IP>/32 md5

# 2. Créer utilisateur réplication
CREATE USER replicator WITH REPLICATION ENCRYPTED PASSWORD 'secure_password';

# 3. Sur VPS, créer réplica
pg_basebackup -h <SUPABASE_IP> -D /var/lib/postgresql/data \
  -U replicator -P -W -R -S replica1
```

**Durée**: 2-4h selon taille DB

### Phase 2: Switchover (Jour 1)

**Objectif**: Basculer l'écriture vers VPS

```bash
# 1. Arrêter réplication
# Sur master
SELECT pg_stop_replication();

# 2. Promouvoir réplica
# Sur VPS
pg_ctl promote -D /var/lib/postgresql/data

# 3. Mettre à jour DNS/Config
# Changer SUPABASE_URL dans .env
```

**Downtime**: < 5 secondes

### Phase 3: Redis + App (Jour 2)

**Objectif**: Migrer Redis et déployer app

```bash
# 1. Dump Redis Upstash
redis-cli -h <UPSTASH_HOST> --tls -a <PASSWORD> --rdb /tmp/dump.rdb

# 2. Restore sur Redis local
redis-cli --rdb /tmp/dump.rdb

# 3. Déployer app
git pull
npm install
npm run build
pm2 reload ecosystem.config.js
```

**Durée**: 1-2h

### Validation Post-Migration

```bash
# 1. Smoke tests
curl https://girlycrea.com/api/health
curl https://girlycrea.com/api/products

# 2. Vérifier métriques
# Prometheus: http://localhost:9090
# Grafana: http://localhost:3000

# 3. Test transaction complète
# Créer compte → Ajouter panier → Checkout → Paiement test
```

---

## ✅ Checklist Migration

### Pré-Migration

- [ ] VPS provisionné et sécurisé
- [ ] DNS TTL réduit à 300s
- [ ] Backups Supabase exportés
- [ ] Scripts de migration testés en staging
- [ ] Plan de rollback documenté
- [ ] Équipe formée

### Migration

- [ ] PostgreSQL réplica créée
- [ ] Switchover testé
- [ ] Redis migré
- [ ] App déployée
- [ ] DNS basculé
- [ ] Smoke tests passés

### Post-Migration

- [ ] Monitoring actif
- [ ] Backups automatiques configurés
- [ ] Documentation mise à jour
- [ ] Équipe formée aux outils
- [ ] Anciens services désactivés (après 7 jours)

---

**Document créé le**: 2025  
**Dernière mise à jour**: 2025



