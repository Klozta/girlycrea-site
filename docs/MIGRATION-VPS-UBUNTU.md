# 🚀 Guide de Migration vers VPS Ubuntu Dédié

> **Objectif** : Migrer GirlyCrea d'un environnement avec services externes payants vers un VPS Ubuntu dédié avec toutes les dépendances hébergées localement.

---

## 📊 Services Externes à Remplacer

| Service Externe | Coût | Remplacement VPS | Économie |
|----------------|------|------------------|----------|
| **Supabase** (PostgreSQL) | ~$25/mois | PostgreSQL local | ✅ Gratuit |
| **Upstash Redis** | ~$10/mois | Redis local | ✅ Gratuit |
| **Sentry** (Monitoring) | ~$26/mois | Grafana + Loki | ✅ Gratuit |
| **Resend** (Emails) | ~$20/mois | Postfix/SMTP | ✅ Gratuit |
| **Stripe** (Paiements) | 2.9% + 0.30€ | Stripe (garder) ou alternatives | ⚠️ Garder ou alternatives |
| **Total estimé** | **~$81/mois** | **~$0-5€/mois** | **💰 ~$76/mois économisés** |

---

## 🖥️ Prérequis VPS

### Configuration Recommandée

- **CPU** : 2-4 cores
- **RAM** : 4-8 GB
- **Stockage** : 50-100 GB SSD
- **OS** : Ubuntu 22.04 LTS
- **Prix estimé** : 5-15€/mois (Hetzner, OVH, DigitalOcean)

---

## 📦 Installation des Services

### 1. PostgreSQL (Remplacement Supabase)

#### Installation

```bash
# Mettre à jour les paquets
sudo apt update && sudo apt upgrade -y

# Installer PostgreSQL
sudo apt install postgresql postgresql-contrib -y

# Vérifier l'installation
sudo systemctl status postgresql
```

#### Configuration

```bash
# Passer en utilisateur postgres
sudo -u postgres psql

# Créer la base de données et l'utilisateur
CREATE DATABASE girlycrea;
CREATE USER girlycrea_user WITH PASSWORD 'VOTRE_MOT_DE_PASSE_SECURISE';
GRANT ALL PRIVILEGES ON DATABASE girlycrea TO girlycrea_user;
\q
```

#### Configuration PostgreSQL pour accès distant (optionnel)

```bash
# Éditer postgresql.conf
sudo nano /etc/postgresql/14/main/postgresql.conf

# Décommenter et modifier :
listen_addresses = '*'  # ou 'localhost' pour local uniquement

# Éditer pg_hba.conf
sudo nano /etc/postgresql/14/main/pg_hba.conf

# Ajouter :
host    girlycrea    girlycrea_user    0.0.0.0/0    md5

# Redémarrer PostgreSQL
sudo systemctl restart postgresql
```

#### Migration des données depuis Supabase

```bash
# Exporter depuis Supabase
pg_dump -h db.xxxxx.supabase.co -U postgres -d postgres > backup.sql

# Importer dans PostgreSQL local
psql -U girlycrea_user -d girlycrea < backup.sql
```

#### Variables d'environnement à modifier

```env
# Remplacer dans .env
SUPABASE_URL=postgresql://girlycrea_user:VOTRE_MOT_DE_PASSE@localhost:5432/girlycrea
SUPABASE_KEY=non_necessaire_en_local
DATABASE_URL=postgresql://girlycrea_user:VOTRE_MOT_DE_PASSE@localhost:5432/girlycrea
```

---

### 2. Redis (Remplacement Upstash)

#### Installation

```bash
# Installer Redis
sudo apt install redis-server -y

# Vérifier l'installation
redis-cli ping
# Devrait répondre : PONG
```

#### Configuration

```bash
# Éditer la configuration Redis
sudo nano /etc/redis/redis.conf

# Modifier :
bind 127.0.0.1  # Pour sécurité, écouter uniquement localhost
maxmemory 256mb  # Ajuster selon votre RAM
maxmemory-policy allkeys-lru  # Politique d'éviction

# Redémarrer Redis
sudo systemctl restart redis-server
sudo systemctl enable redis-server
```

#### Test de connexion

```bash
redis-cli
> SET test "Hello Redis"
> GET test
> exit
```

#### Variables d'environnement à modifier

```env
# Remplacer dans .env
REDIS_URL=redis://localhost:6379
UPSTASH_REDIS_URL=redis://localhost:6379
UPSTASH_REDIS_TOKEN=non_necessaire_en_local
```

#### Modification du code (optionnel)

Si vous utilisez `@upstash/redis`, vous pouvez créer un wrapper pour utiliser `ioredis` ou `redis` natif :

```bash
npm install ioredis
```

Créer `src/config/redis.ts` :

```typescript
import Redis from 'ioredis';

const redis = new Redis({
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  password: process.env.REDIS_PASSWORD,
  retryStrategy: (times) => {
    const delay = Math.min(times * 50, 2000);
    return delay;
  },
});

export default redis;
```

---

### 3. Monitoring (Remplacement Sentry)

#### Option 1 : Grafana + Loki + Prometheus (Recommandé)

```bash
# Installer Docker (si pas déjà installé)
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Créer docker-compose.yml pour monitoring
mkdir -p ~/monitoring
cd ~/monitoring
```

Créer `docker-compose.yml` :

```yaml
version: '3.8'

services:
  prometheus:
    image: prom/prometheus:latest
    ports:
      - "9090:9090"
    volumes:
      - ./prometheus.yml:/etc/prometheus/prometheus.yml
      - prometheus-data:/prometheus
    command:
      - '--config.file=/etc/prometheus/prometheus.yml'

  grafana:
    image: grafana/grafana:latest
    ports:
      - "3000:3000"
    environment:
      - GF_SECURITY_ADMIN_PASSWORD=admin
    volumes:
      - grafana-data:/var/lib/grafana

  loki:
    image: grafana/loki:latest
    ports:
      - "3100:3100"
    volumes:
      - ./loki-config.yml:/etc/loki/local-config.yaml
      - loki-data:/loki

  promtail:
    image: grafana/promtail:latest
    volumes:
      - ./promtail-config.yml:/etc/promtail/config.yml
      - /var/log:/var/log:ro
      - /var/lib/docker/containers:/var/lib/docker/containers:ro

volumes:
  prometheus-data:
  grafana-data:
  loki-data:
```

#### Option 2 : Désactiver Sentry (Simple)

```env
# Dans .env, simplement ne pas définir SENTRY_DSN
# Le code gère déjà l'absence de Sentry gracieusement
# SENTRY_DSN=
```

Le code dans `src/config/sentry.ts` vérifie déjà si `SENTRY_DSN` est défini et fonctionne sans Sentry si absent.

---

### 4. Emails (Remplacement Resend)

#### Option 1 : Postfix + SMTP (Recommandé pour production)

```bash
# Installer Postfix
sudo apt install postfix -y

# Pendant l'installation, choisir :
# - Type de configuration : Site Internet
# - Nom de domaine système : votre-domaine.com
```

#### Configuration Postfix

```bash
# Éditer la configuration
sudo nano /etc/postfix/main.cf

# Ajouter/modifier :
myhostname = mail.votre-domaine.com
mydomain = votre-domaine.com
myorigin = $mydomain
inet_interfaces = all
inet_protocols = ipv4
mydestination = $myhostname, localhost.$mydomain, localhost, $mydomain
relayhost = [smtp.gmail.com]:587  # Ou votre fournisseur SMTP
smtp_sasl_auth_enable = yes
smtp_sasl_password_maps = hash:/etc/postfix/sasl_passwd
smtp_sasl_security_options = noanonymous
smtp_tls_security_level = encrypt
header_size_limit = 4096000
```

#### Configuration SMTP avec Gmail (ou autre)

```bash
# Créer le fichier de mots de passe SMTP
sudo nano /etc/postfix/sasl_passwd

# Ajouter :
[smtp.gmail.com]:587    votre-email@gmail.com:VOTRE_MOT_DE_PASSE_APP

# Créer la base de données
sudo postmap /etc/postfix/sasl_passwd

# Sécuriser le fichier
sudo chmod 600 /etc/postfix/sasl_passwd

# Redémarrer Postfix
sudo systemctl restart postfix
```

#### Option 2 : Utiliser Nodemailer avec SMTP direct

```bash
npm install nodemailer
npm install @types/nodemailer --save-dev
```

Modifier `src/services/emailService.ts` pour utiliser Nodemailer au lieu de Resend.

#### Variables d'environnement

```env
# Remplacer dans .env
RESEND_API_KEY=non_necessaire
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=votre-email@gmail.com
SMTP_PASS=VOTRE_MOT_DE_PASSE_APP
SMTP_FROM=noreply@votre-domaine.com
```

---

### 5. Paiements (Stripe - Garder ou Alternatives)

#### Option A : Garder Stripe (Recommandé)

Stripe est un service de qualité avec un coût raisonnable (2.9% + 0.30€ par transaction). Pour un e-commerce, il est recommandé de le garder pour :
- Sécurité PCI-DSS
- Gestion des remboursements
- Support client
- Conformité légale

**Aucune modification nécessaire.**

#### Option B : Alternatives Open-Source

Si vous voulez vraiment éviter Stripe :

1. **PayPal** : API similaire, toujours payant mais alternative
2. **Mollie** : Alternative européenne
3. **Virement bancaire** : Gratuit mais manuel
4. **Cryptomonnaies** : Bitcoin, Ethereum (via BTCPay Server)

---

## 🔧 Configuration du Code

### 1. Modifier `src/config/supabase.ts`

```typescript
import { createClient } from '@supabase/supabase-js';
import pg from 'pg';

// Option 1 : Utiliser directement pg (recommandé)
export const db = new pg.Pool({
  connectionString: process.env.DATABASE_URL || process.env.SUPABASE_URL,
});

// Option 2 : Garder Supabase client mais pointer vers PostgreSQL local
export const supabase = createClient(
  process.env.SUPABASE_URL || 'http://localhost:5432',
  process.env.SUPABASE_KEY || 'local-key-not-needed'
);
```

### 2. Modifier `src/utils/cache.ts`

Remplacer `@upstash/redis` par `ioredis` :

```typescript
import Redis from 'ioredis';

const redis = new Redis({
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  password: process.env.REDIS_PASSWORD,
});

export async function getCache<T>(key: string): Promise<T | null> {
  try {
    const value = await redis.get(key);
    return value ? JSON.parse(value) : null;
  } catch (error) {
    console.error('Redis getCache error:', error);
    return null;
  }
}

export async function setCache<T>(key: string, value: T, ttlSeconds?: number): Promise<void> {
  try {
    const serialized = JSON.stringify(value);
    if (ttlSeconds) {
      await redis.setex(key, ttlSeconds, serialized);
    } else {
      await redis.set(key, serialized);
    }
  } catch (error) {
    console.error('Redis setCache error:', error);
  }
}

export async function deleteCache(key: string): Promise<void> {
  try {
    await redis.del(key);
  } catch (error) {
    console.error('Redis deleteCache error:', error);
  }
}
```

### 3. Modifier `src/services/emailService.ts`

Remplacer Resend par Nodemailer :

```typescript
import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false, // true pour 465, false pour autres ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export async function sendEmail(to: string, subject: string, html: string) {
  try {
    await transporter.sendMail({
      from: process.env.SMTP_FROM || 'noreply@girlycrea.com',
      to,
      subject,
      html,
    });
  } catch (error) {
    console.error('Email send error:', error);
    throw error;
  }
}
```

---

## 🚀 Déploiement sur VPS

### 1. Installation Node.js

```bash
# Installer Node.js 20 LTS
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Vérifier
node --version  # Devrait être v20.x.x
npm --version
```

### 2. Installation PM2 (Gestionnaire de processus)

```bash
# Installer PM2 globalement
sudo npm install -g pm2

# Démarrer l'application
cd /opt/girlycrea-site
npm install
npm run build
pm2 start dist/index.js --name girlycrea-api

# Sauvegarder la configuration PM2
pm2 save
pm2 startup  # Suivre les instructions pour démarrer au boot
```

### 3. Configuration Nginx (Reverse Proxy)

```bash
# Installer Nginx
sudo apt install nginx -y

# Créer la configuration
sudo nano /etc/nginx/sites-available/girlycrea
```

Configuration Nginx :

```nginx
server {
    listen 80;
    server_name votre-domaine.com www.votre-domaine.com;

    # Redirection HTTPS (après configuration SSL)
    # return 301 https://$server_name$request_uri;

    # Backend API
    location /api {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Frontend Next.js
    location / {
        proxy_pass http://localhost:3002;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
# Activer le site
sudo ln -s /etc/nginx/sites-available/girlycrea /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### 4. Configuration SSL avec Let's Encrypt

```bash
# Installer Certbot
sudo apt install certbot python3-certbot-nginx -y

# Obtenir le certificat SSL
sudo certbot --nginx -d votre-domaine.com -d www.votre-domaine.com

# Renouvellement automatique
sudo certbot renew --dry-run
```

---

## 📋 Checklist de Migration

### Avant la migration

- [ ] Sauvegarder la base de données Supabase
- [ ] Exporter les données Redis (si importantes)
- [ ] Documenter les configurations actuelles
- [ ] Tester en local avec PostgreSQL et Redis locaux

### Installation VPS

- [ ] Installer Ubuntu 22.04 LTS
- [ ] Configurer le firewall (UFW)
- [ ] Installer PostgreSQL
- [ ] Installer Redis
- [ ] Installer Node.js 20
- [ ] Installer PM2
- [ ] Installer Nginx
- [ ] Configurer SSL avec Let's Encrypt

### Migration des données

- [ ] Importer la base de données PostgreSQL
- [ ] Vérifier l'intégrité des données
- [ ] Tester les connexions Redis
- [ ] Tester l'envoi d'emails

### Configuration du code

- [ ] Modifier les variables d'environnement
- [ ] Remplacer @upstash/redis par ioredis
- [ ] Remplacer Resend par Nodemailer
- [ ] Désactiver ou remplacer Sentry
- [ ] Tester toutes les fonctionnalités

### Déploiement

- [ ] Cloner le code sur le VPS
- [ ] Installer les dépendances
- [ ] Configurer les variables d'environnement
- [ ] Build l'application
- [ ] Démarrer avec PM2
- [ ] Configurer Nginx
- [ ] Configurer SSL
- [ ] Tester en production

### Post-déploiement

- [ ] Configurer les backups automatiques
- [ ] Configurer le monitoring
- [ ] Configurer les logs
- [ ] Tester les performances
- [ ] Documenter les accès et configurations

---

## 🔒 Sécurité

### Configuration Firewall (UFW)

```bash
# Activer UFW
sudo ufw enable

# Autoriser SSH
sudo ufw allow 22/tcp

# Autoriser HTTP/HTTPS
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# Vérifier
sudo ufw status
```

### Sécurisation PostgreSQL

```bash
# Ne pas exposer PostgreSQL sur Internet
# Garder uniquement localhost dans postgresql.conf
listen_addresses = 'localhost'
```

### Sécurisation Redis

```bash
# Configurer un mot de passe Redis
sudo nano /etc/redis/redis.conf

# Ajouter :
requirepass VOTRE_MOT_DE_PASSE_REDIS_SECURISE

# Redémarrer
sudo systemctl restart redis-server
```

---

## 💾 Backups Automatiques

### Script de backup PostgreSQL

Créer `/opt/scripts/backup-postgres.sh` :

```bash
#!/bin/bash
BACKUP_DIR="/opt/backups/postgres"
DATE=$(date +%Y%m%d_%H%M%S)
mkdir -p $BACKUP_DIR

# Backup
pg_dump -U girlycrea_user girlycrea > $BACKUP_DIR/girlycrea_$DATE.sql

# Compression
gzip $BACKUP_DIR/girlycrea_$DATE.sql

# Garder seulement les 7 derniers jours
find $BACKUP_DIR -name "*.sql.gz" -mtime +7 -delete

echo "Backup PostgreSQL terminé : girlycrea_$DATE.sql.gz"
```

```bash
# Rendre exécutable
chmod +x /opt/scripts/backup-postgres.sh

# Ajouter au cron (tous les jours à 2h du matin)
crontab -e
# Ajouter :
0 2 * * * /opt/scripts/backup-postgres.sh
```

---

## 📊 Monitoring

### PM2 Monitoring

```bash
# Monitoring en temps réel
pm2 monit

# Logs
pm2 logs girlycrea-api

# Statistiques
pm2 status
```

### Prometheus + Grafana

Suivre les instructions dans la section "Monitoring" ci-dessus pour installer Grafana + Prometheus.

---

## 💰 Coûts Finaux

| Service | Coût Mensuel |
|---------|--------------|
| VPS (4GB RAM, 2 CPU) | 5-10€ |
| Domaine (.com) | 1€ |
| **Total** | **6-11€/mois** |

**Économie** : ~70-75€/mois par rapport aux services externes !

---

## 🆘 Support et Dépannage

### Logs importants

```bash
# Logs application
pm2 logs girlycrea-api

# Logs PostgreSQL
sudo tail -f /var/log/postgresql/postgresql-14-main.log

# Logs Redis
sudo tail -f /var/log/redis/redis-server.log

# Logs Nginx
sudo tail -f /var/log/nginx/error.log
```

### Commandes utiles

```bash
# Redémarrer tous les services
sudo systemctl restart postgresql redis-server nginx
pm2 restart all

# Vérifier l'état
sudo systemctl status postgresql
sudo systemctl status redis-server
sudo systemctl status nginx
pm2 status
```

---

**Migration complète ! Votre application est maintenant 100% auto-hébergée sur votre VPS Ubuntu. 🎉**



