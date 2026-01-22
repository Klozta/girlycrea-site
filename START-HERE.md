# 🚀 GirlyCrea - Démarrage Rapide (Copy/Paste)

Guide étape par étape avec toutes les commandes prêtes à copier/coller.

---

## ✅ Étape 1: Rendre les scripts exécutables

```bash
chmod +x docker-staging.sh
chmod +x scripts/validate-staging.sh
```

---

## ✅ Étape 2: Préparer l'environnement

```bash
# Copier le template
cp env.docker.template .env.docker

# Générer les secrets JWT
node -e "console.log('JWT_SECRET=' + require('crypto').randomBytes(32).toString('hex'))"
node -e "console.log('JWT_REFRESH_SECRET=' + require('crypto').randomBytes(32).toString('hex'))"
```

**📝 Copier les deux valeurs générées et les coller dans `.env.docker`**

---

## ✅ Étape 3: Configurer .env.docker

```bash
# Éditer le fichier
nano .env.docker
# ou ouvre dans ton éditeur favori (VS Code, etc.)
```

**Remplace dans `.env.docker`:**
- `JWT_SECRET=your_jwt_secret...` → `JWT_SECRET=<valeur copiée>`
- `JWT_REFRESH_SECRET=your_refresh...` → `JWT_REFRESH_SECRET=<valeur copiée>`

**💡 Les autres variables (Stripe, Resend) peuvent rester avec des valeurs placeholder pour test local.**

---

## ✅ Étape 4: Build et Start

```bash
# Build les images Docker
./docker-staging.sh build

# Démarrer tous les services
./docker-staging.sh up

# Attendre 30-40 secondes (PostgreSQL démarre lentement)
sleep 40

# Vérifier le health endpoint
./docker-staging.sh health
```

**✅ Si tu vois `{"status":"healthy",...}` → C'EST BON! 🎉**

---

## ✅ Étape 5: Validation Complète (Optionnel)

```bash
# Validation automatique complète
./scripts/validate-staging.sh
```

Le script teste automatiquement tous les services, endpoints, et connexions.

---

## 🌐 Accès aux Services

Une fois que tout est démarré:

| Service | URL |
|---------|-----|
| **Frontend** | http://localhost |
| **Backend API** | http://localhost/api |
| **Health Check** | http://localhost/health |
| **Frontend Direct** | http://localhost:3000 |
| **Backend Direct** | http://localhost:3001 |

---

## 📝 Commandes Utiles

```bash
# Voir l'état des services
./docker-staging.sh status

# Voir les logs
./docker-staging.sh logs

# Voir les logs d'un service spécifique
./docker-staging.sh logs backend

# Redémarrer un service
./docker-staging.sh restart backend

# Arrêter tous les services
./docker-staging.sh down

# Nettoyer complètement (⚠️ supprime les données!)
./docker-staging.sh clean
```

---

## 🔍 Troubleshooting Rapide

### Les services ne démarrent pas?

```bash
# Vérifier les logs
./docker-staging.sh logs

# Vérifier l'état
./docker-staging.sh status
```

### Health check échoue?

```bash
# Attendre plus longtemps (PostgreSQL peut être lent)
sleep 60
./docker-staging.sh health
```

### Port déjà utilisé?

```bash
# Vérifier les ports
netstat -tuln | grep LISTEN | grep -E "80|3000|3001|5433|6380"

# Arrêter les services qui utilisent ces ports
# ou modifier les ports dans docker-compose.staging.yml
```

---

## ✅ Checklist Rapide

- [ ] Scripts exécutables (`chmod +x`)
- [ ] `.env.docker` créé avec secrets JWT
- [ ] Build réussi (`./docker-staging.sh build`)
- [ ] Services démarrés (`./docker-staging.sh up`)
- [ ] Health check OK (`./docker-staging.sh health` → `{"status":"healthy"}`)
- [ ] Frontend accessible (http://localhost)
- [ ] Backend accessible (http://localhost/api)

---

## 🎯 Commandes en Une Ligne

```bash
# Démarrage complet automatique
chmod +x docker-staging.sh scripts/validate-staging.sh && \
cp env.docker.template .env.docker && \
./docker-staging.sh build && \
./docker-staging.sh up && \
echo "⏳ Attente 40 secondes..." && \
sleep 40 && \
./docker-staging.sh health
```

**⚠️ N'oublie pas d'éditer `.env.docker` avec les secrets JWT avant de lancer!**

---

**Prêt à démarrer! 🚀**
