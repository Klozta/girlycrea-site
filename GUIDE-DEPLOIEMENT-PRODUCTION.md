# 🚀 Guide Complet de Déploiement Production - GirlyCrea

Date : Décembre 2025  
Stack : Node.js 20+ / Next.js 15 / Express / Supabase / TypeScript  
Infrastructure : Docker / VM/VPS

📋 Table des Matières
1. Comparaison Docker vs PM2 vs Autres
2. Architecture Recommandée
3. Setup Development Local
4. Production Deployment
5. Migration des Services Externes
6. Monitoring & Maintenance
7. Checklists & Coûts

## 🔄 Comparaison Docker vs PM2 vs Autres

### Tableau Comparatif

| Critère | Docker | PM2 | systemd | Kubernetes |
|---------|--------|-----|---------|------------|
| **Isolation** | ⭐⭐⭐⭐⭐ (complète) | ⭐ (aucune) | ⭐ (aucune) | ⭐⭐⭐⭐⭐ |
| **Portabilité** | ⭐⭐⭐⭐⭐ | ⭐⭐ | ⭐ | ⭐⭐⭐⭐⭐ |
| **Facilité Setup** | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐ |
| **Dev/Prod Parity** | ⭐⭐⭐⭐⭐ | ⭐⭐ | ⭐⭐ | ⭐⭐⭐⭐⭐ |
| **Scaling Horizontal** | ⭐⭐⭐⭐⭐ | ⭐⭐ | ⭐⭐ | ⭐⭐⭐⭐⭐ |
| **Scaling Vertical** | ⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐ |
| **Learning Curve** | ⭐⭐⭐ (modéré) | ⭐⭐⭐⭐⭐ (très facile) | ⭐⭐⭐⭐ | ⭐ (difficile) |
| **Maintenance** | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐ |
| **Coût Infrastructure** | ⭐⭐⭐⭐ (économique) | ⭐⭐⭐⭐⭐ (très bas) | ⭐⭐⭐⭐⭐ (très bas) | ⭐⭐ (coûteux) |
| **Logs Natifs** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| **Hot Reload** | ⭐⭐⭐ (volumes) | ⭐⭐⭐⭐⭐ | N/A | ⭐⭐⭐ |
| **Rollback** | ⭐⭐⭐⭐ (images) | ⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ |

### Recommandation pour GirlyCrea

✅ **DOCKER est le meilleur choix pour votre cas**

**Raisons** :
- ✓ Dev/Prod Parity : Même environnement everywhere
- ✓ Multi-service : Backend + Frontend + Redis + PostgreSQL (composable)
- ✓ Scalabilité future : Facile de migrer vers cloud (AWS, GCP, Heroku)
- ✓ Hot reload : Volumes pour développement local
- ✓ Isolation : Chaque service indépendant
- ✓ Learning curve : Pas trop steep pour votre équipe

## 🏗️ Architecture Recommandée

### Architecture Générale

```
┌─────────────────────────────────────────────────────────┐
│                    PRODUCTION VM/VPS                    │
├─────────────────────────────────────────────────────────┤
│  ┌─────────────────┐  ┌──────────────┐  ┌────────────┐ │
│  │  Docker Compose │  │   Nginx      │  │  Prometheus│ │
│  │   (Orchestr.)   │  │  (Reverse    │  │  (Metrics) │ │
│  │                 │  │   Proxy)     │  │            │ │
│  └────────┬────────┘  └──────┬───────┘  └─────┬──────┘ │
│           │                  │                │        │
│  ┌────────┴──────┬──────────┬┴──────┬───────┴────┐   │
│  │               │          │       │            │   │
│  ▼               ▼          ▼       ▼            ▼   │
│ ┌───────┐  ┌──────────┐  ┌──┐  ┌────────┐  ┌─────┐│
│ │Backend│  │ Frontend │  │DB│  │ Redis  │  │Logs ││
│ │:3001  │  │  :3000   │  │:5│  │:6379   │  │     ││
│ │Node   │  │Next.js   │  │43│  │        │  │Prom ││
│ │Expr   │  │React     │  │2 │  │Upstash ││  │Loki ││
│ └───────┘  └──────────┘  └──┘  └────────┘  └─────┘│
│                                                     │
│  Services: Supabase (cloud), Stripe, Mailgun, etc. │
└─────────────────────────────────────────────────────┘
          │
          └─ Local Dev (docker-compose up)
```

### Stack Proposée

**Local Development** :
- Backend (Node.js Express, hot-reload)
- Frontend (Next.js, hot-reload)
- Redis (local)
- PostgreSQL (local, optionnel - sinon Supabase)

**Production** :
- Backend (Docker container)
- Frontend (Docker container, standalone Next.js)
- Redis (Upstash ou Docker)
- PostgreSQL (Supabase cloud)
- Nginx (reverse proxy, SSL)
- Prometheus/Grafana (monitoring)

## 💻 Setup Development Local

Voir les fichiers :
- `docker-compose.yml` (développement)
- `backend/Dockerfile.dev`
- `frontend/Dockerfile.dev`

## 🚀 Production Deployment

Voir les fichiers :
- `docker-compose.prod.yml` (production)
- `backend/Dockerfile.prod`
- `frontend/Dockerfile.prod`
- `nginx/nginx.conf`
- `nginx/conf.d/girlycrea.conf`

## 🔄 Migration des Services Externes

### 1. Recherche Produits (SerpAPI → Scraping Interne)

**Avant** : SerpAPI (coûteux, limité)  
**Après** : Playwright Interne (déjà implémenté)

### 2. Emails (Mailgun → Nodemailer/SMTP)

**Avant** : Mailgun API  
**Après** : Nodemailer + SMTP (Brevo, Gmail, etc.)

### 3. Images (Cloudflare → Supabase Storage)

**Avant** : Cloudflare Images  
**Après** : Supabase Storage (déjà disponible)

## 📊 Monitoring & Maintenance

- Health checks (`/health`, `/health/db`)
- Prometheus metrics
- Logs centralisés (Docker logging)
- Backup automatique (PostgreSQL daily)

## 📋 Checklists & Coûts

### Checklist Déploiement Production

- [ ] VPS/VM avec 2CPU, 4GB RAM min
- [ ] Domain name configuré
- [ ] Certificat SSL (Let's Encrypt)
- [ ] DNS pointant vers serveur
- [ ] Firewall configuré
- [ ] SSH key-based auth
- [ ] .env variables sécurisées
- [ ] Health checks configurés
- [ ] Monitoring setup
- [ ] Backup automatique

### Estimations Coûts Mensuels

| Service | Coût | Notes |
|---------|------|-------|
| VPS (Vultr/Linode) | $5-12/mois | 2CPU, 4GB RAM |
| Domain | $1-3/mois | Renouvellement annuel |
| Supabase | Gratuit-$10/mois | Free tier inclut 500MB |
| Redis (Upstash) | Gratuit-$5/mois | Free tier 10GB |
| Stripe | 2.9% + $0.30/tx | Payment processing |
| Mailgun/Brevo | Gratuit-$10/mois | SMTP emails |
| **TOTAL** | **~$25-60/mois** | |

## 🎯 Recommandations Finales

1. **Dev Local** : Docker Compose ✅
2. **Production** : Docker + Docker Compose ✅
3. **Services** : Migration vers internes (Playwright, Nodemailer, Supabase Storage)
4. **Monitoring** : Prometheus + Grafana (basique)
5. **Backup** : Daily PostgreSQL dumps

---

*Dernière mise à jour : Décembre 2025*

