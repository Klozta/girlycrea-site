# 🗄️ Guide Migrations SQL - VM sur Serveur de l'Ami

**Guide spécifique pour exécuter les migrations sur votre VM déployée sur le serveur de votre ami**

---

## 📍 Architecture

```
Votre Machine Locale
    ↓ SSH
Serveur de l'Ami (physique)
    ↓ SSH ou Console
VM (Proxmox/VirtualBox/etc.)
    ├── PostgreSQL (dans la VM ou sur serveur hôte)
    └── Application GirlyCrea
```

---

## 🎯 Scénarios de Configuration

### Scénario A : PostgreSQL dans la VM (recommandé)

**Configuration** :
- PostgreSQL installé directement dans la VM
- Base de données locale à la VM
- `DATABASE_URL=postgresql://user:pass@localhost:5432/girlycrea`

**Avantages** :
- ✅ Isolation complète
- ✅ Facile à sauvegarder (backup de la VM)
- ✅ Portable (peut migrer la VM)

### Scénario B : PostgreSQL sur le serveur hôte

**Configuration** :
- PostgreSQL installé sur le serveur physique de l'ami
- VM se connecte à PostgreSQL du serveur hôte
- `DATABASE_URL=postgresql://user:pass@ip-serveur-hote:5432/girlycrea`

**Avantages** :
- ✅ Une seule instance PostgreSQL pour plusieurs VMs
- ✅ Performance si plusieurs applications

---

## 🔧 Méthode 1 : Via SSH (Scénario A - PostgreSQL dans VM)

### Étape 1 : Connexion au serveur de l'ami

```bash
# Depuis votre machine locale
ssh ami@ip-du-serveur-ami
# ou
ssh ami@domaine-du-serveur-ami
```

### Étape 2 : Accéder à la VM

**Si Proxmox** :
```bash
# Sur le serveur de l'ami, accéder à la console Proxmox
# Ou via SSH directement à la VM si configuré :
ssh root@ip-vm-proxmox
```

**Si VirtualBox** :
```bash
# Si SSH configuré dans la VM :
ssh user@ip-vm-virtualbox

# Sinon, utiliser la console VirtualBox
```

**Si autre hyperviseur** :
- Consultez la documentation de votre hyperviseur
- Généralement via console ou SSH direct à la VM

### Étape 3 : Dans la VM, exécuter les migrations

```bash
# Aller dans le répertoire du projet
cd /chemin/vers/girlycrea-site

# Vérifier que PostgreSQL est accessible
psql -U girlycrea_user -d girlycrea -h localhost -c "SELECT 1;"

# Exécuter les migrations
psql -U girlycrea_user -d girlycrea -h localhost -f migrations/create_coupons_tables.sql
psql -U girlycrea_user -d girlycrea -h localhost -f migrations/create_product_reviews_tables.sql
```

---

## 🔧 Méthode 2 : Via SSH (Scénario B - PostgreSQL sur serveur hôte)

### Étape 1 : Connexion au serveur de l'ami

```bash
ssh ami@ip-du-serveur-ami
```

### Étape 2 : Exécuter directement sur le serveur hôte

```bash
# Sur le serveur de l'ami (pas besoin d'entrer dans la VM)
cd /chemin/vers/girlycrea-site

# Exécuter les migrations
psql -U girlycrea_user -d girlycrea -h localhost -f migrations/create_coupons_tables.sql
psql -U girlycrea_user -d girlycrea -h localhost -f migrations/create_product_reviews_tables.sql
```

**Note** : Les fichiers de migration doivent être accessibles depuis le serveur hôte (copiés depuis la VM ou dans un répertoire partagé).

---

## 🔧 Méthode 3 : Via Docker dans la VM

Si PostgreSQL est dans un conteneur Docker dans la VM :

```bash
# 1. Se connecter au serveur de l'ami
ssh ami@ip-du-serveur-ami

# 2. Accéder à la VM
# ... (selon votre config)

# 3. Dans la VM
cd /chemin/vers/girlycrea-site

# 4. Exécuter via Docker
docker exec -i girlycrea-postgres-prod psql -U girlycrea_user -d girlycrea < migrations/create_coupons_tables.sql
docker exec -i girlycrea-postgres-prod psql -U girlycrea_user -d girlycrea < migrations/create_product_reviews_tables.sql

# Ou via docker-compose
docker-compose exec -T postgres psql -U girlycrea_user -d girlycrea < migrations/create_coupons_tables.sql
docker-compose exec -T postgres psql -U girlycrea_user -d girlycrea < migrations/create_product_reviews_tables.sql
```

---

## 🚀 Méthode 4 : Script Automatique (Recommandé)

Le script `scripts/run-migrations.sh` est déjà configuré. Utilisez-le :

```bash
# 1. Se connecter au serveur de l'ami
ssh ami@ip-du-serveur-ami

# 2. Accéder à la VM (si PostgreSQL est dans la VM)
# ... (selon votre config)

# 3. Dans la VM ou sur le serveur hôte
cd /chemin/vers/girlycrea-site

# 4. Exécuter le script
chmod +x scripts/run-migrations.sh
./scripts/run-migrations.sh
```

Le script :
- ✅ Vérifie la connexion PostgreSQL
- ✅ Propose un backup automatique
- ✅ Exécute les migrations
- ✅ Vérifie que les tables sont créées

---

## 📋 Checklist de Déploiement

Avant d'exécuter les migrations :

- [ ] Accès SSH au serveur de l'ami configuré
- [ ] Accès à la VM (console ou SSH)
- [ ] PostgreSQL installé et démarré
- [ ] Base de données `girlycrea` créée
- [ ] Utilisateur `girlycrea_user` créé avec les permissions
- [ ] Fichiers de migration copiés dans la VM
- [ ] Variables d'environnement `.env.production` configurées

---

## ✅ Vérification Post-Migration

Après avoir exécuté les migrations :

```bash
# Dans la VM ou sur le serveur hôte
psql -U girlycrea_user -d girlycrea -h localhost

# Vérifier les tables
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

---

## 🔐 Configuration .env.production

Dans votre VM, assurez-vous que `.env.production` contient :

```env
# Scénario A : PostgreSQL dans la VM
DATABASE_URL=postgresql://girlycrea_user:password@localhost:5432/girlycrea

# Scénario B : PostgreSQL sur serveur hôte
# DATABASE_URL=postgresql://girlycrea_user:password@192.168.1.100:5432/girlycrea
# (remplacer 192.168.1.100 par l'IP du serveur hôte)
```

---

## 🆘 Dépannage

### Erreur : "could not connect to server"

**Cause** : PostgreSQL n'est pas démarré ou inaccessible

**Solution** :
```bash
# Vérifier que PostgreSQL est démarré
sudo systemctl status postgresql

# Démarrer si nécessaire
sudo systemctl start postgresql
```

### Erreur : "permission denied"

**Cause** : L'utilisateur n'a pas les droits

**Solution** :
```bash
# Se connecter en tant que postgres
sudo -u postgres psql

# Donner les permissions
GRANT ALL PRIVILEGES ON DATABASE girlycrea TO girlycrea_user;
\q
```

### Erreur : "relation already exists"

**Cause** : Les migrations ont déjà été exécutées

**Solution** : C'est normal, les migrations utilisent `CREATE TABLE IF NOT EXISTS`. Vous pouvez ignorer cette erreur ou vérifier que les tables existent.

---

## 📞 Support

Pour toute question sur la configuration VM ou l'accès au serveur de l'ami, consultez :
- `DEPLOIEMENT-SERVEUR-AMI.md` - Guide de déploiement complet
- `CONFIGURATION-RESEAU-DOMICILE.md` - Configuration réseau





