# 🗄️ Guide d'exécution des migrations SQL sur PostgreSQL (VM sur serveur de l'ami)

**IMPORTANT** : Vous déployez sur une **VM sur le serveur de votre ami**. Les migrations doivent être exécutées **dans la VM** où PostgreSQL est installé, pas dans Supabase.

## 📍 Configuration

- **Serveur** : Serveur physique de votre ami
- **VM** : Machine virtuelle sur ce serveur (Proxmox, VirtualBox, etc.)
- **PostgreSQL** : Installé dans la VM ou sur le serveur hôte
- **Accès** : Via SSH au serveur de l'ami, puis dans la VM

## 📋 Migrations à exécuter

1. **Coupons** : `migrations/create_coupons_tables.sql`
2. **Avis produits** : `migrations/create_product_reviews_tables.sql`

---

## 🔧 Méthode 1 : Via SSH au serveur de l'ami puis dans la VM

### Étape 1 : Se connecter au serveur de l'ami

```bash
# Depuis votre machine locale
ssh ami@ip-du-serveur-ami
# ou
ssh ami@domaine-du-serveur-ami
```

### Étape 2 : Accéder à la VM

**Option A : Si PostgreSQL est dans la VM (recommandé)**

```bash
# Sur le serveur de l'ami, se connecter à la VM
# Méthode dépend de votre hyperviseur :

# Proxmox
ssh root@ip-vm-proxmox

# VirtualBox (via SSH si configuré)
ssh user@ip-vm

# Ou directement si vous êtes déjà dans la VM
```

**Option B : Si PostgreSQL est sur le serveur hôte**

```bash
# Restez sur le serveur de l'ami (pas besoin d'entrer dans la VM)
```

### Étape 3 : Exécuter les migrations

```bash
# Dans la VM (ou sur le serveur hôte selon votre config)
cd /chemin/vers/girlycrea-site

# Exécuter les migrations
psql -U girlycrea_user -d girlycrea -h localhost -f migrations/create_coupons_tables.sql
psql -U girlycrea_user -d girlycrea -h localhost -f migrations/create_product_reviews_tables.sql
```

---

## 🔧 Méthode 2 : Via Docker (si PostgreSQL dans Docker dans la VM)

```bash
# 1. Se connecter au serveur de l'ami
ssh ami@ip-du-serveur-ami

# 2. Accéder à la VM (si nécessaire)
# ... (voir Méthode 1, Étape 2)

# 3. Dans la VM, exécuter les migrations via Docker
cd /chemin/vers/girlycrea-site

# Si PostgreSQL est dans un conteneur Docker
docker exec -i girlycrea-postgres-prod psql -U girlycrea_user -d girlycrea < migrations/create_coupons_tables.sql
docker exec -i girlycrea-postgres-prod psql -U girlycrea_user -d girlycrea < migrations/create_product_reviews_tables.sql

# Ou si vous utilisez docker-compose
docker-compose exec -T postgres psql -U girlycrea_user -d girlycrea < migrations/create_coupons_tables.sql
docker-compose exec -T postgres psql -U girlycrea_user -d girlycrea < migrations/create_product_reviews_tables.sql
```

---

## 🔧 Méthode 3 : Via script d'automatisation (dans la VM)

Le script `scripts/run-migrations.sh` est déjà créé. Pour l'utiliser :

```bash
# 1. Se connecter au serveur de l'ami
ssh ami@ip-du-serveur-ami

# 2. Accéder à la VM (si PostgreSQL est dans la VM)
# ... (voir Méthode 1, Étape 2)

# 3. Dans la VM, aller dans le projet
cd /chemin/vers/girlycrea-site

# 4. Exécuter le script
chmod +x scripts/run-migrations.sh
./scripts/run-migrations.sh
```

Le script vous guidera et proposera de faire un backup avant les migrations.

---

## ✅ Vérification

Après avoir exécuté les migrations, vérifiez que les tables ont été créées :

```sql
-- Se connecter à PostgreSQL
psql -U girlycrea_user -d girlycrea -h localhost

-- Vérifier les tables coupons
\dt coupons
\dt coupon_usage

-- Vérifier les tables avis
\dt product_reviews
\dt review_helpful_votes
\dt review_responses

-- Vérifier les fonctions
\df is_coupon_valid
\df calculate_coupon_discount
\df calculate_product_rating
```

Ou via une requête SQL :

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN ('coupons', 'coupon_usage', 'product_reviews', 'review_helpful_votes', 'review_responses')
ORDER BY table_name;
```

---

## 🔐 Variables d'environnement

Assurez-vous que votre `.env.production` dans la VM contient :

```env
# PostgreSQL (dans la VM ou sur le serveur hôte)
DATABASE_URL=postgresql://girlycrea_user:password@localhost:5432/girlycrea

# Si PostgreSQL est sur le serveur hôte (pas dans la VM)
# DATABASE_URL=postgresql://girlycrea_user:password@ip-serveur-hote:5432/girlycrea

# Note: Ne pas utiliser Supabase si vous avez PostgreSQL sur le serveur de l'ami
```

---

## ⚠️ Notes importantes

1. **Permissions** : Assurez-vous que l'utilisateur PostgreSQL (`girlycrea_user`) a les droits nécessaires pour créer des tables, fonctions et triggers.

2. **Backup** : Faites un backup avant d'exécuter les migrations :
   ```bash
   pg_dump -U girlycrea_user -d girlycrea -h localhost > backup_avant_migrations_$(date +%Y%m%d).sql
   ```

3. **RLS** : Les migrations activent Row Level Security (RLS) sur les nouvelles tables. Assurez-vous que les policies sont correctement configurées.

4. **Erreurs** : Si vous obtenez des erreurs de type "relation already exists", c'est normal si vous réexécutez les migrations (elles utilisent `CREATE TABLE IF NOT EXISTS`).

---

## 🚀 Exécution rapide (copier-coller)

```bash
# 1. Se connecter au serveur de l'ami
ssh ami@ip-du-serveur-ami

# 2. Accéder à la VM (si PostgreSQL est dans la VM)
# ... (selon votre configuration Proxmox/VirtualBox/etc.)

# 3. Dans la VM, aller dans le projet
cd /chemin/vers/girlycrea-site

# 4. Backup
pg_dump -U girlycrea_user -d girlycrea -h localhost > backup_$(date +%Y%m%d_%H%M%S).sql

# 5. Migrations
psql -U girlycrea_user -d girlycrea -h localhost -f migrations/create_coupons_tables.sql
psql -U girlycrea_user -d girlycrea -h localhost -f migrations/create_product_reviews_tables.sql

# 6. Vérification
psql -U girlycrea_user -d girlycrea -h localhost -c "\dt coupons; \dt product_reviews;"
```

**Ou utilisez le script automatique** :
```bash
# Dans la VM
./scripts/run-migrations.sh
```

---

## 📞 En cas de problème

Si vous rencontrez des erreurs :

1. **Erreur de connexion** : Vérifiez que PostgreSQL est démarré et accessible
2. **Erreur de permissions** : Vérifiez les droits de l'utilisateur PostgreSQL
3. **Erreur de syntaxe** : Vérifiez la version de PostgreSQL (recommandé : PostgreSQL 14+)

Pour vérifier la version :
```sql
SELECT version();
```

