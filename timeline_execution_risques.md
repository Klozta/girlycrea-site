# ⏰ Timeline Exécution & Gestion des Risques - Migration VPS

**Version**: 1.0  
**Date**: 2025  
**Auteur**: Timeline détaillée et plan de gestion des risques

---

## 📋 Table des Matières

1. [Timeline Minute-by-Minute](#timeline-minute-by-minute)
2. [QA Checklist](#qa-checklist)
3. [Performance Baselines](#performance-baselines)
4. [Risk Register](#risk-register)
5. [Incident Response Playbooks](#incident-response-playbooks)
6. [Rollback Decision Tree](#rollback-decision-tree)

---

## ⏰ Timeline Minute-by-Minute

### JOUR 0 - MERCREDI (Préparation)

#### 20:00 - 20:30 : Provisionnement VPS

**Actions**:
- [ ] Commande VPS (Hetzner/OVH/Scaleway)
- [ ] Configuration SSH keys
- [ ] Mise à jour système (`apt update && apt upgrade`)
- [ ] Installation outils de base (git, curl, wget)

**Checkpoint**: VPS accessible via SSH

#### 20:30 - 21:00 : Sécurisation Initiale

**Actions**:
- [ ] Configuration firewall (UFW)
- [ ] Désactivation root login SSH
- [ ] Configuration fail2ban
- [ ] Création utilisateur dédié
- [ ] Configuration sudo

**Checkpoint**: VPS sécurisé, accès SSH fonctionnel

#### 21:00 - 21:30 : Installation Services

**Actions**:
- [ ] Installation PostgreSQL 15
- [ ] Installation Redis
- [ ] Installation Nginx
- [ ] Installation Node.js 20+
- [ ] Installation PM2

**Checkpoint**: Tous les services installés

#### 21:30 - 22:00 : Configuration PostgreSQL

**Actions**:
- [ ] Création database `girlycrea`
- [ ] Création utilisateur DB
- [ ] Configuration `postgresql.conf` (tuning)
- [ ] Configuration `pg_hba.conf`
- [ ] Test connexion locale

**Checkpoint**: PostgreSQL opérationnel et optimisé

#### 22:00 - 22:30 : Configuration Redis

**Actions**:
- [ ] Configuration `redis.conf`
- [ ] Test connexion Redis
- [ ] Configuration mémoire (maxmemory)

**Checkpoint**: Redis opérationnel

#### 22:30 - 23:00 : Configuration Nginx

**Actions**:
- [ ] Configuration reverse proxy
- [ ] Configuration SSL (Let's Encrypt)
- [ ] Test configuration (`nginx -t`)
- [ ] **NON ACTIVÉ** (attendre migration)

**Checkpoint**: Nginx configuré mais non actif

#### 23:00 - 23:30 : DNS Préparation

**Actions**:
- [ ] Réduction TTL DNS à 300s
- [ ] Vérification propagation DNS
- [ ] Documentation IPs actuelles

**Checkpoint**: DNS prêt pour basculement rapide

---

### JOUR 1 - JEUDI (Migration)

#### 08:00 - 08:30 : Révision & Préparation

**Actions**:
- [ ] Réunion équipe (15min)
- [ ] Vérification backups Supabase
- [ ] Vérification scripts migration
- [ ] Test connexion VPS
- [ ] Communication utilisateurs (maintenance prévue)

**Checkpoint**: Équipe prête, backups vérifiés

#### 08:30 - 10:00 : Migration PostgreSQL (Phase 1)

**Actions**:
- [ ] Export données Supabase (pg_dump)
- [ ] Transfert vers VPS (scp/rsync)
- [ ] Import dans PostgreSQL local
- [ ] Vérification intégrité données
- [ ] Comparaison compteurs (tables, lignes)

**Checkpoint**: Données PostgreSQL migrées et vérifiées

**Métriques**:
- Taille dump: ___ MB
- Temps export: ___ min
- Temps import: ___ min
- Lignes produits: ___
- Lignes commandes: ___

#### 10:00 - 10:30 : Migration Redis

**Actions**:
- [ ] Export Redis Upstash (RDB dump)
- [ ] Transfert vers VPS
- [ ] Import dans Redis local
- [ ] Vérification clés importantes

**Checkpoint**: Redis migré

**Métriques**:
- Nombre clés: ___
- Taille mémoire: ___ MB

#### 10:30 - 11:30 : Déploiement Application

**Actions**:
- [ ] Clone repository Git
- [ ] Installation dépendances (`npm ci`)
- [ ] Configuration `.env` (variables locales)
- [ ] Build application (`npm run build`)
- [ ] Configuration PM2 (`ecosystem.config.js`)
- [ ] Démarrage PM2 (4 instances)

**Checkpoint**: Application déployée et démarrée

#### 11:30 - 12:00 : Tests Smoke

**Actions**:
- [ ] Test health endpoint (`/api/health`)
- [ ] Test produits (`/api/products`)
- [ ] Test authentification (`/api/auth/login`)
- [ ] Test création compte
- [ ] Test ajout panier
- [ ] Vérification logs (erreurs)

**Checkpoint**: Smoke tests passés

**Résultats**:
- Health: ✅ / ❌
- Products: ✅ / ❌
- Auth: ✅ / ❌
- Logs erreurs: ___

#### 12:00 - 13:00 : Pause Déjeuner

**Actions**:
- [ ] Monitoring passif
- [ ] Documentation notes

#### 13:00 - 13:30 : Tests Fonctionnels Complets

**Actions**:
- [ ] Parcours utilisateur complet:
  - [ ] Inscription
  - [ ] Connexion
  - [ ] Navigation catalogue
  - [ ] Ajout panier
  - [ ] Modification panier
  - [ ] Checkout (test mode)
  - [ ] Vérification commande
- [ ] Tests performance (latence)
- [ ] Tests charge (10-20 requêtes simultanées)

**Checkpoint**: Tests fonctionnels passés

**Métriques Performance**:
- Latence p50: ___ ms
- Latence p95: ___ ms
- Latence p99: ___ ms
- Taux erreurs: ___ %

#### 13:30 - 14:00 : Activation Nginx & DNS Basculement

**Actions**:
- [ ] Activation site Nginx (`ln -s`)
- [ ] Test Nginx (`nginx -t`)
- [ ] Rechargement Nginx (`systemctl reload nginx`)
- [ ] **BASCULEMENT DNS** (changement A record)
- [ ] Vérification propagation DNS (`dig girlycrea.com`)

**Checkpoint**: DNS basculé, site accessible

**Temps basculement**: ___ secondes

#### 14:00 - 14:30 : Validation Post-Basculement

**Actions**:
- [ ] Test site public (depuis navigateur)
- [ ] Test API publique
- [ ] Vérification SSL (certificat valide)
- [ ] Test transaction complète (production)
- [ ] Monitoring métriques (Prometheus)

**Checkpoint**: Site opérationnel en production

#### 14:30 - 18:00 : Monitoring Intensif

**Actions**:
- [ ] Surveillance continue métriques:
  - [ ] CPU usage
  - [ ] RAM usage
  - [ ] Disk I/O
  - [ ] Network traffic
  - [ ] PostgreSQL connexions
  - [ ] Redis mémoire
  - [ ] Erreurs application
  - [ ] Latence API
- [ ] Vérification logs toutes les 30min
- [ ] Test transaction toutes les heures

**Checkpoint**: Système stable après 4h

**Métriques à 18:00**:
- Uptime: ___ %
- Erreurs 5xx: ___
- Latence moyenne: ___ ms
- Transactions réussies: ___

#### 18:00 - 18:30 : Rapport JOUR 1

**Actions**:
- [ ] Documentation incidents
- [ ] Documentation métriques
- [ ] Planification JOUR 2
- [ ] Communication équipe

**Checkpoint**: JOUR 1 terminé, rapport créé

---

### JOUR 2 - VENDREDI (Optimisation)

#### 08:00 - 08:30 : Revue JOUR 1

**Actions**:
- [ ] Analyse métriques nuit
- [ ] Identification optimisations
- [ ] Planification optimisations

**Checkpoint**: Plan optimisations défini

#### 08:30 - 10:00 : Configuration PgBouncer

**Actions**:
- [ ] Installation PgBouncer
- [ ] Configuration `pgbouncer.ini`
- [ ] Test connexions pool
- [ ] Mise à jour `.env` (port 6432)
- [ ] Redémarrage application
- [ ] Tests performance

**Checkpoint**: PgBouncer opérationnel

**Amélioration performance**: ___ %

#### 10:00 - 11:00 : Optimisation Indexes PostgreSQL

**Actions**:
- [ ] Analyse queries lentes (`pg_stat_statements`)
- [ ] Création indexes manquants
- [ ] `ANALYZE` tables
- [ ] Vérification amélioration

**Checkpoint**: Indexes optimisés

#### 11:00 - 12:00 : Configuration Varnish (Optionnel)

**Actions**:
- [ ] Installation Varnish
- [ ] Configuration cache rules
- [ ] Test cache hit rate
- [ ] Intégration Nginx

**Checkpoint**: Varnish opérationnel (si applicable)

#### 12:00 - 13:00 : Configuration Monitoring

**Actions**:
- [ ] Installation Prometheus
- [ ] Installation Grafana
- [ ] Configuration exporters (Node, PostgreSQL, Redis)
- [ ] Création dashboards
- [ ] Configuration alertes

**Checkpoint**: Monitoring complet opérationnel

#### 13:00 - 14:00 : Pause Déjeuner

#### 14:00 - 15:00 : Configuration Backups Automatiques

**Actions**:
- [ ] Configuration WAL archiving PostgreSQL
- [ ] Configuration `pg_basebackup` quotidien
- [ ] Configuration upload S3 Glacier
- [ ] Test restore backup
- [ ] Configuration Borg (fichiers)

**Checkpoint**: Backups automatiques configurés et testés

#### 15:00 - 16:00 : Tests Charge

**Actions**:
- [ ] Test charge modérée (50 req/s)
- [ ] Test charge élevée (100 req/s)
- [ ] Analyse bottlenecks
- [ ] Ajustements si nécessaire

**Checkpoint**: Système validé sous charge

**Résultats**:
- Req/s supportées: ___
- Latence p95 sous charge: ___ ms
- Taux erreurs: ___ %

#### 16:00 - 17:00 : Documentation & Formation

**Actions**:
- [ ] Documentation architecture
- [ ] Documentation procédures
- [ ] Formation équipe:
  - [ ] Accès VPS
  - [ ] Commandes PM2
  - [ ] Monitoring Grafana
  - [ ] Procédures backup/restore
  - [ ] Procédures rollback

**Checkpoint**: Équipe formée

#### 17:00 - 17:30 : Finalisation

**Actions**:
- [ ] Vérification finale tous systèmes
- [ ] Documentation finale
- [ ] Communication réussite migration
- [ ] Planification monitoring semaine 1

**Checkpoint**: Migration complète ✅

---

## ✅ QA Checklist

### Pré-Migration

- [ ] VPS provisionné et accessible
- [ ] Tous services installés
- [ ] Configurations testées
- [ ] DNS TTL réduit
- [ ] Backups Supabase exportés
- [ ] Scripts migration testés
- [ ] Plan rollback documenté
- [ ] Équipe informée

### Post-Migration (JOUR 1)

- [ ] Health endpoint répond
- [ ] API produits fonctionnelle
- [ ] Authentification fonctionnelle
- [ ] Création compte fonctionnelle
- [ ] Panier fonctionnel
- [ ] Checkout fonctionnel (test)
- [ ] SSL valide
- [ ] Pas d'erreurs critiques logs
- [ ] Métriques dans limites acceptables

### Post-Optimisation (JOUR 2)

- [ ] PgBouncer opérationnel
- [ ] Indexes optimisés
- [ ] Monitoring actif
- [ ] Backups automatiques
- [ ] Tests charge passés
- [ ] Documentation complète
- [ ] Équipe formée

---

## 📊 Performance Baselines

### Avant Migration (Services Externes)

| Métrique | Valeur | Unité |
|----------|--------|-------|
| Latence API p50 | ___ | ms |
| Latence API p95 | ___ | ms |
| Latence API p99 | ___ | ms |
| Throughput max | ___ | req/s |
| Taux erreurs 5xx | ___ | % |
| Temps réponse DB | ___ | ms |
| Hit rate Redis | ___ | % |

### Objectifs Post-Migration

| Métrique | Objectif | Unité |
|----------|----------|-------|
| Latence API p50 | < 100 | ms |
| Latence API p95 | < 500 | ms |
| Latence API p99 | < 1000 | ms |
| Throughput max | > 50 | req/s |
| Taux erreurs 5xx | < 0.1 | % |
| Temps réponse DB | < 50 | ms |
| Hit rate Redis | > 80 | % |

### Mesures Post-Migration

| Métrique | JOUR 1 | JOUR 2 | Unité |
|----------|--------|--------|-------|
| Latence API p50 | ___ | ___ | ms |
| Latence API p95 | ___ | ___ | ms |
| Latence API p99 | ___ | ___ | ms |
| Throughput max | ___ | ___ | req/s |
| Taux erreurs 5xx | ___ | ___ | % |
| Temps réponse DB | ___ | ___ | ms |
| Hit rate Redis | ___ | ___ | % |

---

## 🚨 Risk Register

| ID | Risque | Probabilité | Impact | Mitigation | Responsable |
|----|--------|-------------|--------|------------|-------------|
| R1 | Corruption données PostgreSQL | 2% | Critique | Test restore avant migration | DBA |
| R2 | Perte transactions pendant migration | 5% | Élevé | WAL archiving + PITR | DBA |
| R3 | DNS propagation lente | 10% | Moyen | TTL réduit à 300s préalablement | DevOps |
| R4 | Performance dégradée | 15% | Moyen | Indexes + PgBouncer config | DBA |
| R5 | Emails en spam | 30% | Faible | SPF/DKIM/DMARC setup | DevOps |
| R6 | VPS surchargé (RAM) | 10% | Élevé | Monitoring + alertes | DevOps |
| R7 | Erreurs application non détectées | 20% | Moyen | Tests smoke + monitoring | Dev |
| R8 | Rollback nécessaire | 5% | Critique | Plan rollback < 5min | DevOps |
| R9 | Perte données Redis | 5% | Faible | Données principales en DB | Dev |
| R10 | Attaque DDoS | 2% | Élevé | Cloudflare Free activé | DevOps |

### Matrice Risque

```
Impact
  ↑
Critique │ R1, R2, R8
         │
Élevé    │ R2, R6, R10
         │
Moyen    │ R3, R4, R7
         │
Faible   │ R5, R9
         └────────────────────────→ Probabilité
            Faible    Moyen    Élevé
```

---

## 🆘 Incident Response Playbooks

### Playbook 1: Erreurs 5xx Élevées

**Symptômes**:
- Taux erreurs 5xx > 1%
- Logs montrent exceptions

**Actions**:
1. Vérifier logs application (`pm2 logs`)
2. Vérifier métriques système (CPU, RAM)
3. Vérifier PostgreSQL (connexions, locks)
4. Vérifier Redis (mémoire)
5. Si problème critique → Rollback DNS

**Décision Rollback**: Si erreurs > 5% pendant 10min

### Playbook 2: Performance Dégradée

**Symptômes**:
- Latence p95 > 1000ms
- Timeouts fréquents

**Actions**:
1. Vérifier charge système
2. Analyser queries PostgreSQL lentes
3. Vérifier indexes manquants
4. Vérifier PgBouncer pool
5. Optimiser si possible

**Décision Rollback**: Si latence > 2000ms pendant 15min

### Playbook 3: PostgreSQL Surchargé

**Symptômes**:
- Connexions max atteintes
- Locks fréquents
- Queries timeout

**Actions**:
1. Vérifier connexions actives
2. Identifier queries bloquantes
3. Kill queries longues si nécessaire
4. Augmenter PgBouncer pool si possible
5. Vérifier indexes

**Décision Rollback**: Si DB inaccessible > 5min

### Playbook 4: VPS Surchargé (RAM)

**Symptômes**:
- RAM usage > 90%
- Swap utilisé
- Performance dégradée

**Actions**:
1. Identifier processus consommateurs
2. Redémarrer services si nécessaire
3. Ajuster limites mémoire (PM2, Redis)
4. Vérifier fuites mémoire

**Décision Rollback**: Si système instable > 10min

### Playbook 5: Perte Données

**Symptômes**:
- Données manquantes
- Incohérences détectées

**Actions**:
1. **ARRÊT IMMÉDIAT** écritures
2. Vérifier backups disponibles
3. Restaurer depuis backup
4. Analyser cause
5. Corriger problème

**Décision Rollback**: **IMMÉDIAT**

---

## 🔄 Rollback Decision Tree

```
                    Incident Détecté
                           │
                           ↓
              ┌────────────────────────┐
              │ Impact Critique ?      │
              │ (Données, Sécurité)    │
              └────────────────────────┘
                     │          │
            OUI      │          │      NON
                     ↓          ↓
        ┌────────────┐    ┌──────────────┐
        │ ROLLBACK   │    │ Analyser     │
        │ IMMÉDIAT   │    │ Impact       │
        └────────────┘    └──────────────┘
                                │
                                ↓
                   ┌────────────────────────┐
                   │ Erreurs > 5% ?         │
                   │ Latence > 2000ms ?     │
                   │ DB inaccessible ?      │
                   └────────────────────────┘
                          │          │
                  OUI     │          │      NON
                          ↓          ↓
              ┌──────────────┐  ┌──────────────┐
              │ ROLLBACK     │  │ Monitorer    │
              │ (< 5min)     │  │ + Corriger   │
              └──────────────┘  └──────────────┘
```

### Procédure Rollback

**Temps estimé**: < 5 minutes

**Actions**:
1. **DNS Revert** (changer A record vers ancienne IP) - **1 min**
2. Vérifier propagation DNS - **2 min**
3. Vérifier site accessible ancien - **1 min**
4. Analyser cause incident - **En parallèle**
5. Planifier nouvelle tentative - **Après analyse**

**Checklist Rollback**:
- [ ] DNS basculé vers ancien
- [ ] Site accessible ancien
- [ ] Données cohérentes ancien
- [ ] Cause incident identifiée
- [ ] Plan correction défini

---

## 📝 Notes Finales

### Communication

- **Avant migration**: Informer utilisateurs maintenance prévue
- **Pendant migration**: Status page si disponible
- **Après migration**: Confirmation réussite

### Documentation

- Documenter tous incidents
- Documenter toutes décisions
- Documenter métriques clés
- Mettre à jour runbooks

### Post-Migration (Semaine 1)

- Monitoring intensif quotidien
- Revue métriques quotidienne
- Ajustements si nécessaire
- Formation équipe complémentaire

---

**Document créé le**: 2025  
**Dernière mise à jour**: 2025



