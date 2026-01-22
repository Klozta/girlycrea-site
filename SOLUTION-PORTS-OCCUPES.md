# 🔧 Solution : Ports PostgreSQL et Redis occupés

## ❌ Problème

Les ports **5432** (PostgreSQL) et **6379** (Redis) sont déjà utilisés sur votre machine.

## ✅ Solution appliquée

J'ai modifié `docker-compose.yml` pour utiliser des ports différents :

- **PostgreSQL** : `5433:5432` (externe:interne)
- **Redis** : `6380:6379` (externe:interne)

**Note importante** : Les ports **internes** restent les mêmes (5432 et 6379), seul le port **externe** change. Les conteneurs communiquent entre eux via les ports internes.

## 🚀 Pour démarrer maintenant

```bash
# Redémarrer les services avec les nouveaux ports
sudo docker-compose down
sudo docker-compose up -d
```

## 📝 Connexion aux services

- **PostgreSQL** : `localhost:5433` (au lieu de 5432)
- **Redis** : `localhost:6380` (au lieu de 6379)

## 🔍 Vérifier les ports occupés

```bash
# Voir ce qui utilise les ports
sudo lsof -i :5432 -i :6379
# OU
sudo netstat -tulpn | grep -E ':(5432|6379)'
```

## 🛑 Arrêter les services locaux (si nécessaire)

Si vous avez PostgreSQL ou Redis installés localement et que vous voulez les arrêter :

```bash
# PostgreSQL
sudo systemctl stop postgresql
# OU
sudo service postgresql stop

# Redis
sudo systemctl stop redis
# OU
sudo service redis stop
```

## ✅ Vérification

```bash
# Voir les conteneurs en cours
sudo docker-compose ps

# Voir les logs
sudo docker-compose logs -f
```

