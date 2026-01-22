# ⚙️ Configurations Techniques VPS - GirlyCrea

**Version**: 1.0  
**Date**: 2025  
**Auteur**: Configurations complètes pour migration VPS

---

## 📋 Table des Matières

1. [Nginx Reverse Proxy](#nginx-reverse-proxy)
2. [PM2 vs Systemd](#pm2-vs-systemd)
3. [PostgreSQL Tuning](#postgresql-tuning)
4. [PgBouncer Configuration](#pgbouncer-configuration)
5. [Redis Configuration](#redis-configuration)
6. [Postfix Configuration](#postfix-configuration)
7. [Prometheus & Grafana](#prometheus--grafana)
8. [Docker Compose Alternative](#docker-compose-alternative)
9. [GitHub Actions CI/CD](#github-actions-cicd)
10. [Sécurité & Hardening](#sécurité--hardening)

---

## 🌐 Nginx Reverse Proxy

### Installation

```bash
sudo apt update
sudo apt install nginx
sudo systemctl enable nginx
sudo systemctl start nginx
```

### Configuration Principale

```nginx
# /etc/nginx/nginx.conf
user www-data;
worker_processes auto;
pid /run/nginx.pid;

events {
    worker_connections 1024;
    use epoll;
    multi_accept on;
}

http {
    include /etc/nginx/mime.types;
    default_type application/octet-stream;

    # Logging
    log_format main '$remote_addr - $remote_user [$time_local] "$request" '
                    '$status $body_bytes_sent "$http_referer" '
                    '"$http_user_agent" "$http_x_forwarded_for"';

    access_log /var/log/nginx/access.log main;
    error_log /var/log/nginx/error.log warn;

    # Performance
    sendfile on;
    tcp_nopush on;
    tcp_nodelay on;
    keepalive_timeout 65;
    types_hash_max_size 2048;
    client_max_body_size 20M;

    # Gzip
    gzip on;
    gzip_vary on;
    gzip_proxied any;
    gzip_comp_level 6;
    gzip_types text/plain text/css text/xml text/javascript 
               application/json application/javascript application/xml+rss 
               application/rss+xml font/truetype font/opentype 
               application/vnd.ms-fontobject image/svg+xml;

    # Rate limiting
    limit_req_zone $binary_remote_addr zone=api_limit:10m rate=10r/s;
    limit_req_zone $binary_remote_addr zone=login_limit:10m rate=5r/m;

    # Upstream backend
    upstream backend_api {
        least_conn;
        server 127.0.0.1:3001 max_fails=3 fail_timeout=30s;
        server 127.0.0.1:3002 max_fails=3 fail_timeout=30s;
        server 127.0.0.1:3003 max_fails=3 fail_timeout=30s;
        server 127.0.0.1:3004 max_fails=3 fail_timeout=30s;
    }

    # Upstream frontend
    upstream frontend {
        server 127.0.0.1:3000;
    }

    # HTTP → HTTPS redirect
    server {
        listen 80;
        listen [::]:80;
        server_name girlycrea.com www.girlycrea.com;
        
        # Let's Encrypt challenge
        location /.well-known/acme-challenge/ {
            root /var/www/html;
        }
        
        location / {
            return 301 https://$server_name$request_uri;
        }
    }

    # HTTPS Server
    server {
        listen 443 ssl http2;
        listen [::]:443 ssl http2;
        server_name girlycrea.com www.girlycrea.com;

        # SSL Configuration
        ssl_certificate /etc/letsencrypt/live/girlycrea.com/fullchain.pem;
        ssl_certificate_key /etc/letsencrypt/live/girlycrea.com/privkey.pem;
        ssl_protocols TLSv1.2 TLSv1.3;
        ssl_ciphers 'ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384';
        ssl_prefer_server_ciphers off;
        ssl_session_cache shared:SSL:10m;
        ssl_session_timeout 10m;
        ssl_stapling on;
        ssl_stapling_verify on;

        # Security Headers
        add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
        add_header X-Frame-Options "SAMEORIGIN" always;
        add_header X-Content-Type-Options "nosniff" always;
        add_header X-XSS-Protection "1; mode=block" always;
        add_header Referrer-Policy "no-referrer-when-downgrade" always;
        add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;

        # API Routes
        location /api {
            limit_req zone=api_limit burst=20 nodelay;
            
            proxy_pass http://backend_api;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
            proxy_cache_bypass $http_upgrade;
            proxy_read_timeout 300s;
            proxy_connect_timeout 75s;
        }

        # Login endpoint - stricter rate limit
        location /api/auth/login {
            limit_req zone=login_limit burst=3 nodelay;
            
            proxy_pass http://backend_api;
            proxy_http_version 1.1;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }

        # Frontend
        location / {
            proxy_pass http://frontend;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
            proxy_cache_bypass $http_upgrade;
        }

        # Static files caching
        location ~* \.(jpg|jpeg|png|gif|ico|css|js|svg|woff|woff2|ttf|eot)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
            access_log off;
        }
    }
}
```

### SSL avec Let's Encrypt

```bash
# Installation Certbot
sudo apt install certbot python3-certbot-nginx

# Obtention certificat
sudo certbot --nginx -d girlycrea.com -d www.girlycrea.com

# Renouvellement automatique
sudo certbot renew --dry-run
```

### Activation Configuration

```bash
# Tester configuration
sudo nginx -t

# Activer site
sudo ln -s /etc/nginx/sites-available/girlycrea /etc/nginx/sites-enabled/
sudo rm /etc/nginx/sites-enabled/default

# Recharger Nginx
sudo systemctl reload nginx
```

---

## 🔄 PM2 vs Systemd

### PM2 (Recommandé)

#### Installation

```bash
npm install -g pm2
```

#### Configuration Ecosystem

```javascript
// ecosystem.config.js
module.exports = {
  apps: [{
    name: 'girlycrea-api',
    script: './dist/server.js',
    instances: 4,
    exec_mode: 'cluster',
    max_memory_restart: '500M',
    min_uptime: '10s',
    max_restarts: 10,
    restart_delay: 4000,
    env: {
      NODE_ENV: 'production',
      PORT: 3001
    },
    env_production: {
      NODE_ENV: 'production',
      PORT: 3001
    },
    error_file: './logs/pm2-error.log',
    out_file: './logs/pm2-out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    merge_logs: true,
    autorestart: true,
    watch: false,
    ignore_watch: ['node_modules', 'logs'],
    instance_var: 'INSTANCE_ID'
  }]
};
```

#### Commandes PM2

```bash
# Démarrer
pm2 start ecosystem.config.js --env production

# Status
pm2 status

# Logs
pm2 logs girlycrea-api

# Monitoring
pm2 monit

# Reload zero-downtime
pm2 reload girlycrea-api

# Stop
pm2 stop girlycrea-api

# Delete
pm2 delete girlycrea-api

# Sauvegarder configuration
pm2 save

# Setup startup script
pm2 startup systemd
```

#### PM2 avec Systemd (Auto-start)

```bash
# Générer script systemd
pm2 startup systemd -u $USER --hp /home/$USER

# Sauvegarder processus
pm2 save
```

### Systemd (Alternative)

#### Service File

```ini
# /etc/systemd/system/girlycrea-api.service
[Unit]
Description=GirlyCrea API Server
After=network.target postgresql.service redis.service

[Service]
Type=simple
User=www-data
WorkingDirectory=/var/www/girlycrea/backend
Environment=NODE_ENV=production
Environment=PORT=3001
ExecStart=/usr/bin/node dist/server.js
Restart=always
RestartSec=10
StandardOutput=journal
StandardError=journal
SyslogIdentifier=girlycrea-api

# Security
NoNewPrivileges=true
PrivateTmp=true
ProtectSystem=strict
ProtectHome=true
ReadWritePaths=/var/www/girlycrea

# Resource limits
LimitNOFILE=65536
MemoryMax=2G

[Install]
WantedBy=multi-user.target
```

#### Commandes Systemd

```bash
# Activer service
sudo systemctl enable girlycrea-api
sudo systemctl start girlycrea-api

# Status
sudo systemctl status girlycrea-api

# Logs
sudo journalctl -u girlycrea-api -f

# Reload (nécessite restart)
sudo systemctl restart girlycrea-api
```

### Comparaison

| Feature | PM2 | Systemd |
|---------|-----|---------|
| Clustering | ✅ Intégré | ❌ Non |
| Zero-downtime reload | ✅ Oui | ❌ Non |
| Monitoring intégré | ✅ Oui | ⚠️ Basique |
| Logs structurés | ✅ Oui | ⚠️ Journal |
| Simplicité | ✅ Simple | ⚠️ Plus complexe |
| Overhead RAM | ⚠️ ~50MB | ✅ Minimal |

**Recommandation**: PM2 pour clustering et zero-downtime.

---

## 🗄️ PostgreSQL Tuning

### Configuration Optimisée

```conf
# /etc/postgresql/15/main/postgresql.conf

#------------------------------------------------------------------------------
# MEMORY SETTINGS
#------------------------------------------------------------------------------
shared_buffers = 256MB              # 25% RAM (8GB total)
effective_cache_size = 1GB          # 50-75% RAM
work_mem = 4MB                      # Par connexion
maintenance_work_mem = 64MB         # Opérations maintenance
huge_pages = try                     # Utiliser huge pages si disponible

#------------------------------------------------------------------------------
# WAL SETTINGS
#------------------------------------------------------------------------------
wal_level = replica                  # Pour réplication + backups
wal_buffers = 16MB                   # Buffer WAL
min_wal_size = 1GB                   # Taille minimale WAL
max_wal_size = 4GB                   # Taille maximale WAL
checkpoint_completion_target = 0.9   # Étaler checkpoints
checkpoint_timeout = 15min           # Checkpoint toutes les 15min

#------------------------------------------------------------------------------
# QUERY PLANNER
#------------------------------------------------------------------------------
random_page_cost = 1.1               # SSD (défaut: 4.0 pour HDD)
effective_io_concurrency = 200       # SSD parallélisme
default_statistics_target = 100      # Statistiques (défaut: 100)

#------------------------------------------------------------------------------
# CONNECTION SETTINGS
#------------------------------------------------------------------------------
max_connections = 100                # Connexions max (PgBouncer gère pool)
superuser_reserved_connections = 3

#------------------------------------------------------------------------------
# LOGGING
#------------------------------------------------------------------------------
logging_collector = on
log_directory = 'log'
log_filename = 'postgresql-%Y-%m-%d_%H%M%S.log'
log_rotation_age = 1d
log_rotation_size = 100MB
log_min_duration_statement = 1000    # Log queries > 1s
log_line_prefix = '%t [%p]: [%l-1] user=%u,db=%d,app=%a,client=%h '
log_checkpoints = on
log_connections = on
log_disconnections = on
log_lock_waits = on
log_temp_files = 0

#------------------------------------------------------------------------------
# AUTOVACUUM
#------------------------------------------------------------------------------
autovacuum = on
autovacuum_max_workers = 3
autovacuum_naptime = 10s
autovacuum_vacuum_threshold = 50
autovacuum_analyze_threshold = 50
autovacuum_vacuum_scale_factor = 0.2
autovacuum_analyze_scale_factor = 0.1
```

### Indexes Recommandés

```sql
-- Indexes pour performance
CREATE INDEX CONCURRENTLY idx_products_category ON products(category_id);
CREATE INDEX CONCURRENTLY idx_products_status ON products(status);
CREATE INDEX CONCURRENTLY idx_orders_user_id ON orders(user_id);
CREATE INDEX CONCURRENTLY idx_orders_created_at ON orders(created_at DESC);
CREATE INDEX CONCURRENTLY idx_order_items_order_id ON order_items(order_id);
CREATE INDEX CONCURRENTLY idx_users_email ON users(email);
CREATE INDEX CONCURRENTLY idx_sessions_user_id ON sessions(user_id);
```

### Maintenance

```sql
-- Analyser tables régulièrement
ANALYZE;

-- Vacuum complet mensuel
VACUUM FULL ANALYZE;

-- Statistiques
SELECT schemaname, tablename, 
       n_live_tup, n_dead_tup,
       last_vacuum, last_autovacuum,
       last_analyze, last_autoanalyze
FROM pg_stat_user_tables
ORDER BY n_dead_tup DESC;
```

---

## 🏊 PgBouncer Configuration

### Installation

```bash
sudo apt install pgbouncer
```

### Configuration

```conf
# /etc/pgbouncer/pgbouncer.ini

[databases]
girlycrea = host=127.0.0.1 port=5432 dbname=girlycrea

[pgbouncer]
listen_addr = 127.0.0.1
listen_port = 6432
auth_type = md5
auth_file = /etc/pgbouncer/userlist.txt

# Pool settings
pool_mode = transaction              # CRITIQUE: transaction, pas statement!
max_client_conn = 100
default_pool_size = 25
min_pool_size = 5
reserve_pool_size = 5
reserve_pool_timeout = 3
max_db_connections = 25
max_user_connections = 25

# Connection settings
server_connect_timeout = 15
server_idle_timeout = 600
server_lifetime = 3600
query_timeout = 300
query_wait_timeout = 120

# Logging
log_connections = 1
log_disconnections = 1
log_pooler_errors = 1
```

### Userlist

```bash
# /etc/pgbouncer/userlist.txt
# Format: "username" "password_hash"
"girlycrea_user" "md5hash_here"
```

**Générer hash**:
```bash
echo -n "passwordusername" | md5sum
```

### Connexion depuis App

```env
# .env
DATABASE_URL=postgresql://girlycrea_user:password@127.0.0.1:6432/girlycrea
```

### Monitoring

```sql
-- Connexions actives
SHOW POOLS;

-- Statistiques
SHOW STATS;

-- Clients
SHOW CLIENTS;

-- Serveurs
SHOW SERVERS;
```

---

## 🔴 Redis Configuration

### Installation

```bash
sudo apt install redis-server
```

### Configuration

```conf
# /etc/redis/redis.conf

# Network
bind 127.0.0.1
protected-mode yes
port 6379
tcp-backlog 511
timeout 0
tcp-keepalive 300

# Memory
maxmemory 256mb
maxmemory-policy allkeys-lru

# Persistence (désactivé si données en DB)
save ""
# save 900 1
# save 300 10
# save 60 10000

# Logging
loglevel notice
logfile /var/log/redis/redis-server.log

# Slow log
slowlog-log-slower-than 10000
slowlog-max-len 128

# Security
# requirepass your_secure_password_here
```

### Commandes Utiles

```bash
# Status
redis-cli ping

# Info mémoire
redis-cli info memory

# Stats
redis-cli info stats

# Monitor en temps réel
redis-cli monitor

# Flush (attention!)
redis-cli FLUSHALL
```

---

## 📧 Postfix Configuration

### Installation

```bash
sudo apt install postfix mailutils
```

### Configuration de Base

```conf
# /etc/postfix/main.cf

# Basic
myhostname = mail.girlycrea.com
mydomain = girlycrea.com
myorigin = $mydomain
inet_interfaces = loopback-only
inet_protocols = ipv4
mydestination = $myhostname, localhost.$mydomain, $mydomain

# Network
mynetworks = 127.0.0.0/8 [::ffff:127.0.0.0]/104 [::1]/128

# TLS
smtpd_tls_cert_file = /etc/ssl/certs/ssl-cert-snakeoil.pem
smtpd_tls_key_file = /etc/ssl/private/ssl-cert-snakeoil.key
smtpd_use_tls = yes
smtpd_tls_session_cache_database = btree:${data_directory}/smtpd_scache
smtp_tls_session_cache_database = btree:${data_directory}/smtp_scache

# Restrictions
smtpd_helo_restrictions = permit_mynetworks, warn_if_reject reject_non_fqdn_helo_hostname, reject_invalid_helo_hostname
smtpd_recipient_restrictions = permit_mynetworks, warn_if_reject reject_non_fqdn_recipient, reject_unknown_recipient_domain, reject_unauth_destination, permit
smtpd_sender_restrictions = permit_mynetworks, warn_if_reject reject_non_fqdn_sender, reject_unknown_sender_domain

# Limits
message_size_limit = 10485760
mailbox_size_limit = 0
```

### DNS Records Requis

```
# SPF Record
TXT @ "v=spf1 mx a:mail.girlycrea.com ~all"

# DKIM (générer avec opendkim)
TXT default._domainkey "v=DKIM1; k=rsa; p=..."

# DMARC
TXT _dmarc "v=DMARC1; p=quarantine; rua=mailto:dmarc@girlycrea.com"

# MX Record
MX @ mail.girlycrea.com 10

# Reverse DNS (PTR) - Configurer chez hébergeur VPS
```

### Test Envoi

```bash
echo "Test email" | mail -s "Test" your@email.com
```

---

## 📊 Prometheus & Grafana

### Prometheus Installation

```bash
# Télécharger
wget https://github.com/prometheus/prometheus/releases/download/v2.45.0/prometheus-2.45.0.linux-amd64.tar.gz
tar xvfz prometheus-*.tar.gz
sudo mv prometheus-2.45.0.linux-amd64 /opt/prometheus

# Créer utilisateur
sudo useradd --no-create-home --shell /bin/false prometheus
sudo chown -R prometheus:prometheus /opt/prometheus
```

### Configuration Prometheus

```yaml
# /opt/prometheus/prometheus.yml
global:
  scrape_interval: 15s
  evaluation_interval: 15s

scrape_configs:
  - job_name: 'prometheus'
    static_configs:
      - targets: ['localhost:9090']

  - job_name: 'node-exporter'
    static_configs:
      - targets: ['localhost:9100']

  - job_name: 'postgres'
    static_configs:
      - targets: ['localhost:9187']

  - job_name: 'redis'
    static_configs:
      - targets: ['localhost:9121']

  - job_name: 'girlycrea-api'
    static_configs:
      - targets: ['localhost:3001']
```

### Service Systemd Prometheus

```ini
# /etc/systemd/system/prometheus.service
[Unit]
Description=Prometheus
After=network.target

[Service]
User=prometheus
Group=prometheus
Type=simple
ExecStart=/opt/prometheus/prometheus \
  --config.file=/opt/prometheus/prometheus.yml \
  --storage.tsdb.path=/var/lib/prometheus/ \
  --web.console.templates=/opt/prometheus/consoles \
  --web.console.libraries=/opt/prometheus/console_libraries

[Install]
WantedBy=multi-user.target
```

### Grafana Installation

```bash
sudo apt install -y software-properties-common
sudo add-apt-repository "deb https://packages.grafana.com/oss/deb stable main"
wget -q -O - https://packages.grafana.com/gpg.key | sudo apt-key add -
sudo apt update
sudo apt install grafana
sudo systemctl enable grafana-server
sudo systemctl start grafana-server
```

### Dashboards Recommandés

- Node Exporter Full: `1860`
- PostgreSQL Database: `9628`
- Redis Dashboard: `11835`
- Node.js Application: `11159`

---

## 🐳 Docker Compose Alternative

**Note**: Non recommandé pour 1 VPS, mais fourni comme alternative.

```yaml
# docker-compose.yml
version: '3.8'

services:
  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: girlycrea
      POSTGRES_USER: girlycrea_user
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "127.0.0.1:5432:5432"
    restart: unless-stopped

  redis:
    image: redis:7-alpine
    command: redis-server --maxmemory 256mb --maxmemory-policy allkeys-lru
    ports:
      - "127.0.0.1:6379:6379"
    restart: unless-stopped

  api:
    build: ./backend
    environment:
      NODE_ENV: production
      DATABASE_URL: postgresql://girlycrea_user:${DB_PASSWORD}@postgres:5432/girlycrea
      REDIS_URL: redis://redis:6379
    ports:
      - "3001:3001"
    depends_on:
      - postgres
      - redis
    restart: unless-stopped

volumes:
  postgres_data:
```

---

## 🔄 GitHub Actions CI/CD

```yaml
# .github/workflows/deploy.yml
name: Deploy to VPS

on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '20'
      - run: npm ci
      - run: npm run test
      - run: npm run build

  deploy:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Deploy to VPS
        uses: appleboy/ssh-action@master
        with:
          host: ${{ secrets.VPS_HOST }}
          username: ${{ secrets.VPS_USER }}
          key: ${{ secrets.VPS_SSH_KEY }}
          script: |
            cd /var/www/girlycrea
            git pull origin main
            npm ci
            npm run build
            pm2 reload ecosystem.config.js
```

---

## 🔒 Sécurité & Hardening

### Firewall (UFW)

```bash
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow 22/tcp    # SSH
sudo ufw allow 80/tcp    # HTTP
sudo ufw allow 443/tcp   # HTTPS
sudo ufw enable
```

### Fail2Ban

```bash
sudo apt install fail2ban

# Configuration SSH
# /etc/fail2ban/jail.local
[sshd]
enabled = true
port = 22
maxretry = 3
bantime = 3600
```

### SSH Hardening

```conf
# /etc/ssh/sshd_config
PermitRootLogin no
PasswordAuthentication no
PubkeyAuthentication yes
Port 2222  # Changer port par défaut
```

### Updates Automatiques

```bash
sudo apt install unattended-upgrades
sudo dpkg-reconfigure -plow unattended-upgrades
```

---

**Document créé le**: 2025  
**Dernière mise à jour**: 2025



