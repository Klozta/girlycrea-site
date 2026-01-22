# 🧪 Guide Test Local - Migrations et Nouvelles Fonctionnalités

**Guide pour tester les 3 nouvelles fonctionnalités (emails, coupons, avis) en local avant déploiement**

---

## 📋 Prérequis

- ✅ PostgreSQL installé et démarré (local ou Docker)
- ✅ Redis installé et démarré (local ou Docker)
- ✅ Node.js installé
- ✅ Projet cloné et dépendances installées

---

## 🗄️ Étape 1 : Exécuter les Migrations SQL en Local

### Option A : PostgreSQL Local (installé sur votre machine)

```bash
# 1. Vérifier que PostgreSQL est démarré
sudo systemctl status postgresql
# ou sur macOS
brew services list | grep postgresql

# 2. Se connecter à PostgreSQL
psql -U postgres
# ou
psql -U votre_utilisateur -d postgres

# 3. Créer la base de données si elle n'existe pas
CREATE DATABASE girlycrea;
CREATE USER girlycrea_user WITH PASSWORD 'votre_mot_de_passe';
GRANT ALL PRIVILEGES ON DATABASE girlycrea TO girlycrea_user;
\q

# 4. Exécuter les migrations
cd /home/ghislain/girlycrea-site
psql -U girlycrea_user -d girlycrea -h localhost -f migrations/create_coupons_tables.sql
psql -U girlycrea_user -d girlycrea -h localhost -f migrations/create_product_reviews_tables.sql
```

### Option B : PostgreSQL dans Docker (docker-compose.local.yml)

```bash
# 1. Démarrer PostgreSQL via Docker Compose
docker-compose -f docker-compose.local.yml up -d postgres

# 2. Attendre que PostgreSQL soit prêt (quelques secondes)
sleep 5

# 3. Exécuter les migrations via Docker
docker exec -i girlycrea-postgres-dev psql -U admin -d girlycrea < migrations/create_coupons_tables.sql
docker exec -i girlycrea-postgres-dev psql -U admin -d girlycrea < migrations/create_product_reviews_tables.sql

# Ou utiliser le script automatique (adapté pour Docker)
DB_USER=admin DB_NAME=girlycrea DB_HOST=localhost DB_PORT=5432 ./scripts/run-migrations.sh
```

### Option C : Script Automatique (Recommandé)

```bash
# Le script détecte automatiquement votre configuration
cd /home/ghislain/girlycrea-site

# Si PostgreSQL local
./scripts/run-migrations.sh

# Si PostgreSQL dans Docker, définir les variables
DB_USER=admin DB_NAME=girlycrea DB_HOST=localhost DB_PORT=5432 ./scripts/run-migrations.sh
```

---

## ✅ Étape 2 : Vérifier les Migrations

```bash
# Se connecter à PostgreSQL
psql -U girlycrea_user -d girlycrea -h localhost
# ou pour Docker
docker exec -it girlycrea-postgres-dev psql -U admin -d girlycrea

# Vérifier les tables créées
\dt coupons
\dt coupon_usage
\dt product_reviews
\dt review_helpful_votes
\dt review_responses

# Vérifier les fonctions
\df is_coupon_valid
\df calculate_coupon_discount
\df calculate_product_rating

# Quitter
\q
```

Vous devriez voir :
- ✅ `coupons`
- ✅ `coupon_usage`
- ✅ `product_reviews`
- ✅ `review_helpful_votes`
- ✅ `review_responses`

---

## 🔧 Étape 3 : Configurer les Variables d'Environnement

Vérifiez votre fichier `.env` local :

```env
# Database (local)
DATABASE_URL=postgresql://girlycrea_user:password@localhost:5432/girlycrea
# ou pour Docker
# DATABASE_URL=postgresql://admin:password@localhost:5432/girlycrea

# Redis (local)
REDIS_URL=redis://localhost:6379

# Emails (pour tests locaux, vous pouvez utiliser un service de test)
EMAIL_PROVIDER=smtp
SMTP_HOST=localhost
SMTP_PORT=1025
SMTP_FROM=noreply@girlycrea.local
# Ou utiliser Mailtrap pour tests : https://mailtrap.io

# JWT Secrets (générer de nouveaux pour le local)
JWT_SECRET=votre_secret_local
JWT_REFRESH_SECRET=votre_refresh_secret_local
ADMIN_TOKEN=votre_admin_token_local
REVALIDATE_SECRET=votre_revalidate_secret_local

# Frontend URL (local)
FRONTEND_URL=http://localhost:3000
CORS_ORIGIN=http://localhost:3000
```

---

## 🚀 Étape 4 : Démarrer l'Application

### Backend

```bash
cd /home/ghislain/girlycrea-site
npm install
npm run dev
```

Le backend devrait démarrer sur `http://localhost:3001`

### Frontend

```bash
cd /home/ghislain/girlycrea-site/frontend
npm install
npm run dev
```

Le frontend devrait démarrer sur `http://localhost:3000`

---

## 🧪 Étape 5 : Tester les Nouvelles Fonctionnalités

### 1. Tester les Coupons

**Via l'API** :
```bash
# Créer un coupon (admin)
curl -X POST http://localhost:3001/api/coupons \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer VOTRE_ADMIN_TOKEN" \
  -d '{
    "code": "TEST10",
    "description": "Code de test -10%",
    "discount_type": "percentage",
    "discount_value": 10,
    "min_purchase_amount": 20,
    "valid_until": null
  }'

# Valider un coupon
curl -X POST http://localhost:3001/api/coupons/validate \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer VOTRE_TOKEN_USER" \
  -d '{
    "code": "TEST10",
    "order_total": 50
  }'
```

**Via le Frontend** :
1. Aller sur `http://localhost:3000`
2. Ajouter des produits au panier
3. Aller au checkout
4. Entrer le code `TEST10`
5. Vérifier que la réduction s'applique

### 2. Tester les Avis Produits

**Via l'API** :
```bash
# Créer un avis
curl -X POST http://localhost:3001/api/products/PRODUCT_ID/reviews \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer VOTRE_TOKEN_USER" \
  -d '{
    "product_id": "PRODUCT_ID",
    "rating": 5,
    "title": "Excellent produit !",
    "comment": "Très satisfait de mon achat"
  }'

# Récupérer les avis d'un produit
curl http://localhost:3001/api/products/PRODUCT_ID/reviews

# Récupérer les statistiques
curl http://localhost:3001/api/products/PRODUCT_ID/reviews/stats
```

**Via le Frontend** :
1. Aller sur une page produit : `http://localhost:3000/products/[id]`
2. Scroller jusqu'à la section "Avis clients"
3. Voir les statistiques (note moyenne, distribution)
4. Laisser un avis (si connecté et après achat)

### 3. Tester les Emails

**Configuration pour tests locaux** :

**Option A : Mailtrap (recommandé pour tests)**
1. Créer un compte gratuit sur https://mailtrap.io
2. Configurer dans `.env` :
```env
EMAIL_PROVIDER=smtp
SMTP_HOST=smtp.mailtrap.io
SMTP_PORT=2525
SMTP_USER=votre_username_mailtrap
SMTP_PASS=votre_password_mailtrap
SMTP_FROM=noreply@girlycrea.local
```

**Option B : MailHog (local)**
```bash
# Installer MailHog
go install github.com/mailhog/MailHog@latest
# ou via Docker
docker run -d -p 1025:1025 -p 8025:8025 mailhog/mailhog

# Configurer dans .env
EMAIL_PROVIDER=smtp
SMTP_HOST=localhost
SMTP_PORT=1025
SMTP_FROM=noreply@girlycrea.local
```

**Tester l'envoi d'email** :
```bash
# S'inscrire (devrait envoyer un email de bienvenue)
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "name": "Test User"
  }'

# Vérifier dans Mailtrap ou MailHog (http://localhost:8025)
```

---

## 🔍 Étape 6 : Vérifier les Logs

### Backend

```bash
# Voir les logs en temps réel
npm run dev
# ou si en background
tail -f /tmp/backend.log
```

### Frontend

```bash
# Les logs apparaissent dans la console du navigateur
# Ouvrir DevTools (F12) → Console
```

### PostgreSQL

```bash
# Voir les requêtes SQL
# Dans psql :
SET log_statement = 'all';
# ou vérifier les logs PostgreSQL
tail -f /var/log/postgresql/postgresql-*.log
```

---

## 🐛 Dépannage Local

### Erreur : "relation does not exist"

**Cause** : Les migrations n'ont pas été exécutées

**Solution** :
```bash
# Réexécuter les migrations
./scripts/run-migrations.sh
```

### Erreur : "could not connect to database"

**Cause** : PostgreSQL n'est pas démarré ou mauvaise configuration

**Solution** :
```bash
# Vérifier que PostgreSQL est démarré
sudo systemctl status postgresql
# ou pour Docker
docker ps | grep postgres

# Vérifier la connexion
psql -U girlycrea_user -d girlycrea -h localhost -c "SELECT 1;"
```

### Erreur : "email not sent"

**Cause** : Configuration email incorrecte ou service non démarré

**Solution** :
- Vérifier les variables `SMTP_*` dans `.env`
- Utiliser Mailtrap ou MailHog pour les tests
- Vérifier les logs backend pour plus de détails

### Erreur : "coupon not found"

**Cause** : Aucun coupon créé en base

**Solution** :
```bash
# Créer un coupon de test via l'API admin
# Voir section "Tester les Coupons" ci-dessus
```

---

## ✅ Checklist de Test Local

Avant de déployer sur le serveur de l'ami, vérifiez :

- [ ] Migrations SQL exécutées avec succès
- [ ] Tables créées (coupons, product_reviews, etc.)
- [ ] Backend démarre sans erreur
- [ ] Frontend démarre sans erreur
- [ ] Connexion PostgreSQL fonctionne
- [ ] Connexion Redis fonctionne
- [ ] Création de compte utilisateur fonctionne
- [ ] Email de bienvenue envoyé (vérifié dans Mailtrap/MailHog)
- [ ] Création de coupon fonctionne (admin)
- [ ] Validation de coupon fonctionne (utilisateur)
- [ ] Application de coupon dans le panier fonctionne
- [ ] Création d'avis produit fonctionne
- [ ] Affichage des avis sur la page produit fonctionne
- [ ] Statistiques d'avis fonctionnent

---

## 📝 Notes Importantes

1. **Données de test** : Les données créées en local ne seront pas transférées au serveur de production
2. **Secrets** : Utilisez des secrets différents pour le local et la production
3. **Emails** : Les emails en local ne sont pas envoyés réellement (utilisez Mailtrap/MailHog)
4. **Base de données** : Vous pouvez réinitialiser la base locale à tout moment pour retester

---

## 🚀 Une fois les Tests Locaux OK

Quand tout fonctionne en local :

1. ✅ Exécuter les migrations sur le serveur de l'ami (voir `MIGRATIONS-VM-SERVEUR-AMI.md`)
2. ✅ Déployer l'application (voir `DEPLOIEMENT-SERVEUR-AMI.md`)
3. ✅ Configurer les variables d'environnement de production
4. ✅ Tester sur le serveur de production

---

**Bon test ! 🧪**





