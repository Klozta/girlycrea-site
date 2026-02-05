# GirlyCrea - Guide des Migrations de Base de Données

## 📋 Fichiers Créés

1. **`src/db/migrations/001_init_schema.sql`** - Schéma complet de la base de données
2. **`src/db/seed.sql`** - Données de test (20 produits + 4 coupons)
3. **`src/db/migrate.ts`** - Runner TypeScript pour exécuter les migrations

## 🚀 Utilisation

### Option 1: Exécution automatique au démarrage du serveur

Modifier `src/index.ts` pour appeler les migrations au démarrage:

```typescript
import { runMigrationsAndSeed } from './db/migrate.js';

// ... autres imports ...

async function startServer() {
  try {
    // Exécuter les migrations avant de démarrer le serveur
    if (process.env.RUN_MIGRATIONS !== 'false') {
      await runMigrationsAndSeed();
    }

    // Démarrer le serveur Express
    const PORT = process.env.PORT || 3001;
    app.listen(PORT, () => {
      logger.info(`🚀 Serveur démarré sur le port ${PORT}`);
    });
  } catch (error) {
    logger.error('❌ Erreur au démarrage du serveur', error);
    process.exit(1);
  }
}

startServer();
```

### Option 2: Exécution manuelle

```bash
# Depuis le répertoire backend
cd backend

# Exécuter les migrations manuellement
RUN_SEED=true node --loader ts-node/esm src/db/migrate.ts

# Ou sans seed
RUN_SEED=false node --loader ts-node/esm src/db/migrate.ts
```

### Option 3: Via Docker

```bash
# Exécuter les migrations dans le container backend
docker exec girlycrea-backend-staging node --loader ts-node/esm /app/src/db/migrate.ts

# Ou avec seed
docker exec -e RUN_SEED=true girlycrea-backend-staging node --loader ts-node/esm /app/src/db/migrate.ts
```

## 📊 Structure des Tables

### Tables Principales

- **users** - Utilisateurs et authentification
- **products** - Catalogue produits
- **orders** - Commandes clients
- **order_items** - Items dans les commandes
- **reviews** - Avis produits
- **coupons** - Codes promotionnels
- **coupon_usages** - Historique d'utilisation
- **wishlist** - Liste de souhaits

### Indexes Créés

Tous les indexes nécessaires pour les recherches fréquentes sont créés automatiquement:
- Email, role, status pour users
- Slug, category, price, stock, rating pour products
- User ID, order number, status pour orders
- Product ID, user ID, rating pour reviews
- Code, active, expires_at pour coupons

## 🌱 Seed Data

Le fichier `seed.sql` contient:

- **20 produits de test** répartis en:
  - 4 bijoux
  - 5 mode
  - 4 beauté
  - 4 crochet
  - 4 coques iPhone

- **4 coupons de test**:
  - WELCOME10 (10% - 30 jours)
  - SUMMER20 (20% - 60 jours)
  - VIP30 (30% - 90 jours)
  - NEW15 (15% - 45 jours)

## 🔧 Variables d'Environnement

- `DATABASE_URL` - URL de connexion PostgreSQL (requis)
- `RUN_MIGRATIONS` - Exécuter les migrations au démarrage (défaut: true)
- `RUN_SEED` - Exécuter le seed après les migrations (défaut: true)

## ✅ Vérification

Pour vérifier que les migrations ont été exécutées:

```sql
-- Voir les migrations exécutées
SELECT * FROM migrations ORDER BY executed_at;

-- Vérifier les tables créées
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- Vérifier les produits seedés
SELECT COUNT(*) FROM products;

-- Vérifier les coupons seedés
SELECT code, discount_value, is_active FROM coupons;
```

## 🔄 Idempotence

Les migrations sont **idempotentes**:
- Utilisation de `CREATE TABLE IF NOT EXISTS`
- Utilisation de `ON CONFLICT DO NOTHING` pour les inserts
- Table `migrations` pour tracker les migrations exécutées
- Les migrations déjà exécutées sont ignorées

## 📝 Ajouter une Nouvelle Migration

1. Créer un nouveau fichier dans `src/db/migrations/`:
   ```
   002_add_new_feature.sql
   ```

2. Le fichier sera automatiquement exécuté dans l'ordre alphabétique

3. Utiliser `CREATE TABLE IF NOT EXISTS` pour l'idempotence

4. Les migrations sont trackées dans la table `migrations`

## 🐛 Dépannage

### Erreur: "DATABASE_URL n'est pas défini"
- Vérifier que `.env.docker` contient `DATABASE_URL`
- Vérifier que les variables sont chargées dans le container Docker

### Erreur: "relation already exists"
- Normal si la table existe déjà
- Les migrations utilisent `IF NOT EXISTS` pour éviter cette erreur

### Erreur: "duplicate key value"
- Normal si les données seed existent déjà
- Le seed utilise `ON CONFLICT DO NOTHING`

### Réinitialiser complètement
```sql
-- ATTENTION: Supprime toutes les données!
DROP SCHEMA public CASCADE;
CREATE SCHEMA public;
GRANT ALL ON SCHEMA public TO postgres;
GRANT ALL ON SCHEMA public TO public;
```

Puis réexécuter les migrations.
