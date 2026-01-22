# 🚀 Démarrage Rapide - Migration VPS Ubuntu

Guide rapide pour migrer GirlyCrea vers un VPS Ubuntu dédié.

---

## ⚡ Installation en 5 Minutes

### 1. Préparer le VPS

```bash
# Se connecter au VPS
ssh root@votre-vps-ip

# Mettre à jour
apt update && apt upgrade -y
```

### 2. Installation Automatique

```bash
# Cloner le projet
git clone <votre-repo> /opt/girlycrea-site
cd /opt/girlycrea-site

# Exécuter le script d'installation
chmod +x scripts/migration-vps/*.sh
sudo ./scripts/migration-vps/install-all.sh
```

### 3. Configuration PostgreSQL

```bash
# Exécuter le script de configuration
sudo ./scripts/migration-vps/setup-postgresql.sh

# Ou manuellement :
sudo -u postgres psql
CREATE DATABASE girlycrea;
CREATE USER girlycrea_user WITH PASSWORD 'VOTRE_MOT_DE_PASSE';
GRANT ALL PRIVILEGES ON DATABASE girlycrea TO girlycrea_user;
\q
```

### 4. Configuration Redis

```bash
# Exécuter le script
sudo ./scripts/migration-vps/setup-redis.sh

# Ou laisser les paramètres par défaut (pas de mot de passe)
```

### 5. Configuration Application

```bash
cd /opt/girlycrea-site

# Copier le template d'environnement
cp .env.vps.example .env

# Éditer la configuration
nano .env

# Remplir les valeurs :
# - DATABASE_URL
# - REDIS_HOST
# - SMTP_* (si vous utilisez SMTP)
# - JWT_SECRET
# - etc.
```

### 6. Installation Dépendances et Build

```bash
# Installer les dépendances
npm install

# Installer ioredis pour Redis local (si pas déjà fait)
npm install ioredis nodemailer

# Build l'application
npm run build
```

### 7. Démarrer avec PM2

```bash
# Utiliser le script
./scripts/migration-vps/setup-pm2.sh

# Ou manuellement :
pm2 start dist/index.js --name girlycrea-api
pm2 save
pm2 startup  # Suivre les instructions
```

### 8. Configuration Nginx

```bash
# Utiliser le script
sudo ./scripts/migration-vps/setup-nginx.sh

# Configurer SSL
sudo certbot --nginx -d votre-domaine.com -d www.votre-domaine.com
```

### 9. Démarrer le Frontend (si nécessaire)

```bash
cd /opt/girlycrea-site/frontend
npm install
npm run build
pm2 start npm --name girlycrea-frontend -- start
pm2 save
```

---

## 📋 Checklist Rapide

- [ ] VPS Ubuntu 22.04 LTS configuré
- [ ] Scripts d'installation exécutés
- [ ] PostgreSQL installé et configuré
- [ ] Redis installé et configuré
- [ ] Variables d'environnement configurées (.env)
- [ ] Application buildée (npm run build)
- [ ] PM2 configuré et application démarrée
- [ ] Nginx configuré
- [ ] SSL configuré (Let's Encrypt)
- [ ] Firewall configuré (UFW)
- [ ] Backups configurés (cron)

---

## 🔧 Commandes Utiles

### Vérifier les services

```bash
# PostgreSQL
sudo systemctl status postgresql
psql -U girlycrea_user -d girlycrea -c "SELECT version();"

# Redis
sudo systemctl status redis-server
redis-cli ping

# PM2
pm2 status
pm2 logs girlycrea-api

# Nginx
sudo systemctl status nginx
sudo nginx -t
```

### Redémarrer les services

```bash
sudo systemctl restart postgresql redis-server nginx
pm2 restart all
```

### Voir les logs

```bash
# Application
pm2 logs girlycrea-api

# PostgreSQL
sudo tail -f /var/log/postgresql/postgresql-14-main.log

# Redis
sudo tail -f /var/log/redis/redis-server.log

# Nginx
sudo tail -f /var/log/nginx/error.log
sudo tail -f /var/log/nginx/access.log
```

---

## 💾 Migration des Données

Si vous migrez depuis Supabase :

```bash
# Utiliser le script de migration
./scripts/migration-vps/migrate-data.sh

# Ou manuellement :
pg_dump -h db.xxxxx.supabase.co -U postgres -d postgres > backup.sql
psql -U girlycrea_user -d girlycrea < backup.sql
```

---

## 🔒 Sécurité

### Firewall

```bash
sudo ufw enable
sudo ufw allow 22/tcp   # SSH
sudo ufw allow 80/tcp   # HTTP
sudo ufw allow 443/tcp  # HTTPS
```

### PostgreSQL (ne pas exposer sur Internet)

```bash
# Vérifier que PostgreSQL écoute uniquement localhost
sudo nano /etc/postgresql/14/main/postgresql.conf
# listen_addresses = 'localhost'
```

### Redis (mot de passe recommandé)

```bash
sudo nano /etc/redis/redis.conf
# requirepass VOTRE_MOT_DE_PASSE_SECURISE
sudo systemctl restart redis-server
```

---

## 📊 Monitoring

### PM2 Monitoring

```bash
pm2 monit
pm2 status
```

### Backups Automatiques

```bash
# Ajouter au cron
crontab -e

# Backup quotidien à 2h du matin
0 2 * * * /opt/girlycrea-site/scripts/migration-vps/backup-postgres.sh
```

---

## 🆘 Dépannage

### Application ne démarre pas

```bash
# Vérifier les logs
pm2 logs girlycrea-api --lines 50

# Vérifier les variables d'environnement
pm2 env girlycrea-api

# Redémarrer
pm2 restart girlycrea-api
```

### Erreur de connexion PostgreSQL

```bash
# Vérifier que PostgreSQL tourne
sudo systemctl status postgresql

# Tester la connexion
psql -U girlycrea_user -d girlycrea -h localhost
```

### Erreur de connexion Redis

```bash
# Vérifier que Redis tourne
sudo systemctl status redis-server

# Tester la connexion
redis-cli ping
```

---

## 📖 Documentation Complète

Pour plus de détails, consultez :
- `docs/MIGRATION-VPS-UBUNTU.md` - Guide complet de migration
- `scripts/migration-vps/` - Scripts d'installation et configuration

---

**Votre application est maintenant hébergée sur votre VPS ! 🎉**



