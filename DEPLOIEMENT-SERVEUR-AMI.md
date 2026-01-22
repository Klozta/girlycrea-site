# 🚀 Guide de Déploiement sur Serveur Physique à Domicile

**Guide simple pour déployer GirlyCrea sur le serveur physique de votre ami chez lui**

---

## 📋 Prérequis

### Sur le serveur physique de votre ami :
- ✅ Serveur physique avec Linux installé (Ubuntu/Debian recommandé)
- ✅ Docker et Docker Compose installés
- ✅ Accès réseau local (même réseau) ou SSH via Internet
- ✅ Ports disponibles : 80, 443, 3000, 3001 (ou autres selon accord)
- ✅ IP locale accessible (192.168.x.x ou 10.x.x.x)
- ✅ Optionnel : IP publique fixe ou DynDNS pour accès externe
- ✅ Optionnel : Domaine configuré avec DNS

### Sur votre machine locale :
- ✅ Code source du projet
- ✅ Fichier `.env.production` avec vos secrets

---

## 🌐 Configuration Réseau (Important pour serveur à domicile)

### Option A : Accès local uniquement (même réseau)

Si vous êtes sur le même réseau local que le serveur :

```bash
# Trouver l'IP locale du serveur
# Sur le serveur :
ip addr show | grep "inet " | grep -v 127.0.0.1

# Exemple : 192.168.1.100
# Vous pourrez accéder via : http://192.168.1.100:3000
```

### Option B : Accès depuis Internet (recommandé pour production)

Pour rendre le site accessible depuis Internet :

1. **Configurer le routeur** :
   - Ouvrir les ports 80, 443, 22 (SSH) dans le routeur
   - Rediriger vers l'IP locale du serveur
   - Optionnel : Configurer DynDNS si IP dynamique

2. **Obtenir l'IP publique** :
   ```bash
   curl ifconfig.me
   ```

3. **Configurer le DNS** (si domaine) :
   - Pointer votre domaine vers l'IP publique
   - Ou utiliser un service comme DuckDNS (gratuit)

### Option C : Tunnel VPN (sécurisé)

Pour un accès sécurisé sans exposer les ports :

- Utiliser WireGuard ou Tailscale
- Créer un réseau VPN privé
- Accéder au serveur via l'IP VPN

---

## 🎯 Étape 1 : Préparer les fichiers de configuration

### 1.1 Créer le fichier `.env.production`

Créez un fichier `.env.production` à la racine du projet avec vos variables d'environnement :

```bash
# Copier le template
cp .env .env.production
```

Puis éditez `.env.production` avec vos vraies valeurs :

```env
NODE_ENV=production
PORT=3001

# Database (PostgreSQL dans la VM ou sur le serveur hôte)
# Si PostgreSQL dans la VM :
DATABASE_URL=postgresql://girlycrea_user:password@localhost:5432/girlycrea
# Si PostgreSQL sur le serveur hôte :
# DATABASE_URL=postgresql://girlycrea_user:password@192.168.1.100:5432/girlycrea
REDIS_URL=redis://localhost:6379

# Supabase (si utilisé)
SUPABASE_URL=https://votre-projet.supabase.co
SUPABASE_KEY=votre-cle-supabase

# JWT Secrets (générer de nouveaux secrets pour la production)
JWT_SECRET=<générer avec: node -e "console.log(require('crypto').randomBytes(64).toString('hex'))">
JWT_REFRESH_SECRET=<générer avec: node -e "console.log(require('crypto').randomBytes(64).toString('hex'))">
ADMIN_TOKEN=<générer avec: node -e "console.log(require('crypto').randomBytes(64).toString('hex'))">
REVALIDATE_SECRET=<générer avec: node -e "console.log(require('crypto').randomBytes(64).toString('hex'))">

# CORS (URL de votre site - adapter selon votre configuration)
# Option 1 : Accès local uniquement
CORS_ORIGIN=http://192.168.1.100:3000
FRONTEND_URL=http://192.168.1.100:3000
API_URL=http://192.168.1.100:3001

# Option 2 : Accès Internet avec domaine
# CORS_ORIGIN=https://votre-domaine.com
# FRONTEND_URL=https://votre-domaine.com
# API_URL=https://api.votre-domaine.com

# Option 3 : Accès Internet sans domaine (IP publique)
# CORS_ORIGIN=http://VOTRE_IP_PUBLIQUE:3000
# FRONTEND_URL=http://VOTRE_IP_PUBLIQUE:3000
# API_URL=http://VOTRE_IP_PUBLIQUE:3001

# Stripe (si utilisé)
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Redis Password (si Redis local)
REDIS_PASSWORD=votre-mot-de-passe-redis
```

### 1.2 Vérifier les Dockerfiles

Les fichiers suivants doivent exister :
- ✅ `docker-compose.prod.yml` (déjà présent)
- ✅ `backend/Dockerfile.prod` (à vérifier)
- ✅ `frontend/Dockerfile.prod` (à vérifier)

---

## 🚀 Étape 2 : Déployer sur le serveur

### Option A : Déploiement manuel (recommandé pour débuter)

#### 2.1 Se connecter au serveur

**Si sur le même réseau local** :
```bash
ssh utilisateur@192.168.1.100  # IP locale du serveur
```

**Si depuis Internet** :
```bash
ssh utilisateur@ip-publique-du-serveur
# Ou avec port personnalisé :
ssh -p 2222 utilisateur@ip-publique-du-serveur
```

**Si via VPN** :
```bash
ssh utilisateur@10.0.0.100  # IP VPN du serveur
```

#### 2.2 Créer le dossier du projet

```bash
mkdir -p ~/girlycrea-site
cd ~/girlycrea-site
```

#### 2.3 Transférer les fichiers

**Depuis votre machine locale** :

```bash
# Créer une archive du projet (sans node_modules)
tar --exclude='node_modules' \
    --exclude='.git' \
    --exclude='.next' \
    --exclude='dist' \
    -czf girlycrea-site.tar.gz .

# Transférer vers le serveur
scp girlycrea-site.tar.gz utilisateur@ip-du-serveur:~/girlycrea-site/
scp .env.production utilisateur@ip-du-serveur:~/girlycrea-site/.env
```

**Sur le serveur** :

```bash
cd ~/girlycrea-site
tar -xzf girlycrea-site.tar.gz
rm girlycrea-site.tar.gz
```

#### 2.4 Configurer les variables d'environnement

```bash
# Vérifier que le fichier .env existe
cat .env | head -10

# Si besoin, créer depuis .env.production
cp .env.production .env
```

#### 2.5 Démarrer avec Docker Compose

```bash
# Démarrer tous les services
docker-compose -f docker-compose.prod.yml up -d

# Vérifier que tout fonctionne
docker-compose -f docker-compose.prod.yml ps
docker-compose -f docker-compose.prod.yml logs --tail=50
```

### Option B : Déploiement avec Git (recommandé pour mises à jour)

#### 2.1 Cloner le projet sur le serveur

```bash
cd ~
git clone https://github.com/votre-username/girlycrea-site.git
cd girlycrea-site
```

#### 2.2 Créer le fichier .env

```bash
# Créer .env depuis votre template
nano .env
# Coller le contenu de .env.production
```

#### 2.3 Démarrer

```bash
docker-compose -f docker-compose.prod.yml up -d --build
```

---

## 🔧 Étape 3 : Configuration Réseau et Nginx

### 3.1 Configuration du pare-feu local

Sur le serveur, ouvrir les ports nécessaires :

```bash
# Ubuntu/Debian avec UFW
sudo ufw allow 22/tcp   # SSH
sudo ufw allow 80/tcp   # HTTP
sudo ufw allow 443/tcp  # HTTPS
sudo ufw allow 3000/tcp # Frontend (si accès direct)
sudo ufw allow 3001/tcp # Backend (si accès direct)
sudo ufw enable
```

### 3.2 Configuration du routeur (pour accès Internet)

Dans le routeur de votre ami :

1. **Port Forwarding** :
   - Port externe 80 → IP locale serveur :80
   - Port externe 443 → IP locale serveur :443
   - Port externe 22 → IP locale serveur :22 (SSH)

2. **DynDNS** (si IP dynamique) :
   - Configurer un service comme DuckDNS, No-IP, ou DynDNS
   - Mettre à jour automatiquement l'IP publique

### 3.3 Configuration Nginx (si domaine personnalisé)

### 3.1 Installer Certbot (pour SSL)

```bash
sudo apt update
sudo apt install certbot python3-certbot-nginx
```

### 3.2 Configurer Nginx

Le fichier `nginx/conf.d/girlycrea.conf` devrait contenir :

```nginx
server {
    listen 80;
    server_name votre-domaine.com www.votre-domaine.com;

    # Redirection vers HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name votre-domaine.com www.votre-domaine.com;

    ssl_certificate /etc/letsencrypt/live/votre-domaine.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/votre-domaine.com/privkey.pem;

    # Frontend
    location / {
        proxy_pass http://frontend:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # Backend API
    location /api {
        proxy_pass http://backend:3001;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### 3.3 Obtenir le certificat SSL

```bash
sudo certbot --nginx -d votre-domaine.com -d www.votre-domaine.com
```

---

## ✅ Étape 4 : Vérification

### 4.1 Vérifier les services

```bash
# Vérifier que tous les conteneurs tournent
docker-compose -f docker-compose.prod.yml ps

# Vérifier les logs
docker-compose -f docker-compose.prod.yml logs backend --tail=20
docker-compose -f docker-compose.prod.yml logs frontend --tail=20
```

### 4.2 Tester les endpoints

```bash
# Health check backend
curl http://localhost:3001/health

# Health check frontend
curl http://localhost:3000

# Si domaine configuré
curl https://votre-domaine.com/health
```

---

## 🔄 Étape 5 : Mises à jour futures

### Mettre à jour le code

```bash
# Sur le serveur
cd ~/girlycrea-site
git pull origin main

# Reconstruire et redémarrer
docker-compose -f docker-compose.prod.yml up -d --build
```

### Voir les logs en temps réel

```bash
docker-compose -f docker-compose.prod.yml logs -f
```

---

## 🛠️ Commandes utiles

### Gestion des conteneurs

```bash
# Arrêter tous les services
docker-compose -f docker-compose.prod.yml down

# Redémarrer un service spécifique
docker-compose -f docker-compose.prod.yml restart backend

# Voir l'utilisation des ressources
docker stats

# Nettoyer les images inutilisées
docker system prune -a
```

### Sauvegarde

```bash
# Sauvegarder la base de données (si PostgreSQL local)
docker exec girlycrea-postgres-prod pg_dump -U user database > backup.sql

# Sauvegarder les volumes
docker run --rm -v girlycrea_redis_data:/data -v $(pwd):/backup alpine tar czf /backup/redis-backup.tar.gz /data
```

---

## 💰 Coûts estimés

### Sur le serveur physique de votre ami :
- **Coût partagé** : Selon accord avec votre ami
- **Électricité** : ~5-10€/mois (selon consommation)
- **Ressources utilisées** :
  - RAM : ~2-3 GB
  - CPU : ~1-2 cores
  - Stockage : ~5-10 GB

### Services externes (à payer séparément) :
- Supabase : Gratuit (tier gratuit) ou ~$10/mois
- Redis Upstash : Gratuit (tier gratuit) ou ~$5/mois
- Stripe : 2.9% + $0.30 par transaction
- Domaine : ~$10-15/an (optionnel)
- DynDNS : Gratuit (DuckDNS) ou ~$5/an

**Total estimé** : **~5-20€/mois** (selon accord avec votre ami + services)

### Avantages serveur à domicile :
- ✅ Coût très réduit (juste électricité)
- ✅ Contrôle total sur les données
- ✅ Pas de limite de bande passante (selon FAI)
- ✅ Apprentissage et expérience technique

---

## 🔒 Sécurité

### Checklist sécurité :

- [ ] Fichier `.env` avec permissions restrictives (`chmod 600 .env`)
- [ ] Firewall configuré (ports 80, 443 uniquement)
- [ ] SSL/TLS activé (Let's Encrypt)
- [ ] Mots de passe forts pour toutes les bases de données
- [ ] Secrets JWT générés aléatoirement
- [ ] Backups réguliers configurés
- [ ] Logs surveillés

### Commandes sécurité :

```bash
# Protéger le fichier .env
chmod 600 .env

# Vérifier les ports ouverts
sudo netstat -tulpn | grep LISTEN

# Configurer le firewall (UFW)
sudo ufw allow 22/tcp   # SSH
sudo ufw allow 80/tcp   # HTTP
sudo ufw allow 443/tcp  # HTTPS
sudo ufw enable
```

---

## 🆘 Dépannage

### Le backend ne démarre pas

```bash
# Vérifier les logs
docker-compose -f docker-compose.prod.yml logs backend

# Vérifier les variables d'environnement
docker-compose -f docker-compose.prod.yml config
```

### Le frontend ne se connecte pas au backend

```bash
# Vérifier NEXT_PUBLIC_API_URL dans .env
# Doit pointer vers l'URL publique du backend
```

### Problèmes de connexion à la base de données

```bash
# Tester la connexion PostgreSQL
# Si PostgreSQL dans Docker :
docker exec -it girlycrea-postgres-prod psql -U girlycrea_user -d girlycrea

# Si PostgreSQL installé directement dans la VM :
psql -U girlycrea_user -d girlycrea -h localhost

# Vérifier REDIS
docker exec -it girlycrea-redis-prod redis-cli ping
```

---

## 📞 Support

En cas de problème :
1. Vérifier les logs : `docker-compose -f docker-compose.prod.yml logs`
2. Vérifier l'état des conteneurs : `docker-compose -f docker-compose.prod.yml ps`
3. Vérifier les ressources : `docker stats`
4. Vérifier le réseau : Voir `CONFIGURATION-RESEAU-DOMICILE.md`

---

## 🗄️ Étape Finale : Exécuter les Migrations SQL

**IMPORTANT** : Après le déploiement, vous devez exécuter les migrations SQL pour créer les tables nécessaires aux nouvelles fonctionnalités (coupons, avis produits).

### Méthode rapide

```bash
# 1. Se connecter au serveur de l'ami
ssh ami@ip-du-serveur-ami

# 2. Accéder à la VM (selon votre config Proxmox/VirtualBox)
# Si Proxmox : accéder via console ou SSH direct à la VM
# Si VirtualBox : utiliser la console ou SSH si configuré

# 3. Dans la VM, exécuter les migrations
cd /chemin/vers/girlycrea-site
chmod +x scripts/run-migrations.sh
./scripts/run-migrations.sh
```

### Migrations à exécuter

1. **Coupons** : `migrations/create_coupons_tables.sql`
2. **Avis produits** : `migrations/create_product_reviews_tables.sql`

### Vérification

Après les migrations, vérifiez que les tables sont créées :

```bash
# Dans la VM
psql -U girlycrea_user -d girlycrea -h localhost -c "\dt coupons; \dt product_reviews;"
```

📖 **Guide complet** : Voir `MIGRATIONS-VM-SERVEUR-AMI.md` pour toutes les méthodes, scénarios et dépannage.

---

## 📚 Documentation Complémentaire

- **Configuration réseau détaillée** : `CONFIGURATION-RESEAU-DOMICILE.md`
- **Guide production général** : `GUIDE-DEPLOIEMENT-PRODUCTION.md`
- **Guide migrations VM** : `MIGRATIONS-VM-SERVEUR-AMI.md` ⭐

---

**🎉 Votre site est maintenant déployé sur le serveur physique de votre ami !**

*Dernière mise à jour : Janvier 2026*

