# 🌐 Configuration Réseau pour Serveur à Domicile

**Guide spécifique pour configurer l'accès réseau à votre serveur physique**

---

## 📡 Scénarios d'Accès

### Scénario 1 : Accès Local Uniquement (même réseau)

**Cas d'usage** : Test local, développement, réseau privé

**Configuration** :
```bash
# Sur le serveur, trouver l'IP locale
ip addr show | grep "inet " | grep -v 127.0.0.1
# Exemple résultat : 192.168.1.100

# Dans .env.production
CORS_ORIGIN=http://192.168.1.100:3000
FRONTEND_URL=http://192.168.1.100:3000
API_URL=http://192.168.1.100:3001
```

**Accès** :
- Frontend : `http://192.168.1.100:3000`
- Backend : `http://192.168.1.100:3001`
- API : `http://192.168.1.100:3001/api`

**Avantages** :
- ✅ Simple à configurer
- ✅ Pas besoin de configuration routeur
- ✅ Sécurisé (non accessible depuis Internet)

**Inconvénients** :
- ❌ Accessible uniquement sur le réseau local
- ❌ Pas accessible depuis mobile (hors WiFi)

---

### Scénario 2 : Accès Internet avec IP Publique

**Cas d'usage** : Accès depuis n'importe où, production

**Étape 1 : Obtenir l'IP publique**
```bash
# Sur le serveur ou depuis Internet
curl ifconfig.me
# Résultat exemple : 85.123.45.67
```

**Étape 2 : Configurer le routeur**

Dans l'interface du routeur (généralement `192.168.1.1`) :

1. **Port Forwarding** :
   ```
   Port externe 80   → IP locale serveur :80   (HTTP)
   Port externe 443  → IP locale serveur :443  (HTTPS)
   Port externe 22   → IP locale serveur :22   (SSH)
   Port externe 3000 → IP locale serveur :3000 (Frontend direct)
   Port externe 3001 → IP locale serveur :3001 (Backend direct)
   ```

2. **IP Fixe locale** :
   - Réserver une IP fixe pour le serveur dans le routeur
   - Exemple : `192.168.1.100` (DHCP reservation)

**Étape 3 : Configuration .env**
```bash
# Dans .env.production
CORS_ORIGIN=http://85.123.45.67:3000
FRONTEND_URL=http://85.123.45.67:3000
API_URL=http://85.123.45.67:3001
```

**Étape 4 : Gérer l'IP dynamique (si nécessaire)**

Si votre FAI change l'IP régulièrement :

**Option A : DynDNS gratuit (DuckDNS)**
```bash
# Installer DuckDNS sur le serveur
sudo apt install curl
# Créer un compte sur https://www.duckdns.org
# Configurer le script de mise à jour
echo "url=\"https://www.duckdns.org/update?domains=votre-domaine&token=votre-token&ip=\" | curl -k -o ~/duckdns/duck.log -K -"
# Ajouter au crontab pour mise à jour automatique
```

**Option B : No-IP**
```bash
# Installer le client No-IP
wget https://www.noip.com/client/linux/noip-duc-linux.tar.gz
tar xzf noip-duc-linux.tar.gz
cd noip-2.1.9-1/
make install
sudo /usr/local/bin/noip2 -C
```

**Accès** :
- Frontend : `http://85.123.45.67:3000` ou `http://votre-domaine.duckdns.org:3000`
- Backend : `http://85.123.45.67:3001`

**Avantages** :
- ✅ Accessible depuis n'importe où
- ✅ Pas besoin de domaine payant
- ✅ Gratuit avec DynDNS

**Inconvénients** :
- ⚠️ IP peut changer (résolu avec DynDNS)
- ⚠️ Ports exposés sur Internet (sécurité à renforcer)

---

### Scénario 3 : Accès Internet avec Domaine

**Cas d'usage** : Production professionnelle, SSL/TLS

**Étape 1 : Acheter un domaine**
- OVH, Namecheap, Cloudflare, etc.
- Coût : ~10-15€/an

**Étape 2 : Configurer le DNS**

Dans votre registrar DNS :

```
Type    Nom              Valeur           TTL
A       @                85.123.45.67     3600
A       www              85.123.45.67     3600
A       api              85.123.45.67     3600
```

**Étape 3 : Configuration .env**
```bash
# Dans .env.production
CORS_ORIGIN=https://votre-domaine.com
FRONTEND_URL=https://votre-domaine.com
API_URL=https://api.votre-domaine.com
```

**Étape 4 : SSL/TLS avec Let's Encrypt**

```bash
# Installer Certbot
sudo apt update
sudo apt install certbot python3-certbot-nginx

# Obtenir le certificat
sudo certbot --nginx -d votre-domaine.com -d www.votre-domaine.com

# Renouvellement automatique
sudo certbot renew --dry-run
```

**Accès** :
- Frontend : `https://votre-domaine.com`
- Backend : `https://api.votre-domaine.com`

**Avantages** :
- ✅ URL professionnelle
- ✅ SSL/TLS gratuit
- ✅ Meilleur référencement

**Inconvénients** :
- 💰 Coût du domaine (~10-15€/an)
- ⚠️ Configuration DNS nécessaire

---

### Scénario 4 : Tunnel VPN (Recommandé pour Sécurité)

**Cas d'usage** : Accès sécurisé sans exposer les ports

**Option A : WireGuard (Recommandé)**

```bash
# Sur le serveur
sudo apt install wireguard

# Générer les clés
wg genkey | tee privatekey | wg pubkey > publickey

# Configuration serveur
sudo nano /etc/wireguard/wg0.conf
```

**Configuration WireGuard** :
```ini
[Interface]
PrivateKey = SERVEUR_PRIVATE_KEY
Address = 10.0.0.1/24
ListenPort = 51820

[Peer]
PublicKey = CLIENT_PUBLIC_KEY
AllowedIPs = 10.0.0.2/32
```

**Port Forwarding routeur** :
- Port externe 51820/UDP → IP locale serveur :51820

**Avantages** :
- ✅ Très sécurisé (chiffrement)
- ✅ Pas besoin d'exposer les ports applicatifs
- ✅ Accès comme si sur réseau local

**Inconvénients** :
- ⚠️ Configuration plus complexe
- ⚠️ Nécessite client VPN sur chaque appareil

**Option B : Tailscale (Plus Simple)**

```bash
# Sur le serveur
curl -fsSL https://tailscale.com/install.sh | sh
sudo tailscale up

# Sur votre machine
# Installer Tailscale et se connecter au même compte
```

**Avantages** :
- ✅ Configuration très simple
- ✅ Pas besoin de configuration routeur
- ✅ Fonctionne même derrière NAT

---

## 🔒 Sécurité pour Serveur à Domicile

### Checklist Sécurité

- [ ] **Pare-feu configuré** (UFW ou iptables)
- [ ] **SSH avec clés** (désactiver mot de passe)
- [ ] **Ports minimaux ouverts** (22, 80, 443 uniquement)
- [ ] **Mises à jour système** régulières
- [ ] **Fail2ban** installé (protection brute force)
- [ ] **SSL/TLS** activé (Let's Encrypt)
- [ ] **Backups** automatiques configurés
- [ ] **Monitoring** activé (logs, alertes)

### Commandes Sécurité

```bash
# Configurer SSH avec clés uniquement
sudo nano /etc/ssh/sshd_config
# Décommenter : PasswordAuthentication no
sudo systemctl restart sshd

# Installer Fail2ban
sudo apt install fail2ban
sudo systemctl enable fail2ban
sudo systemctl start fail2ban

# Vérifier les ports ouverts
sudo netstat -tulpn | grep LISTEN

# Vérifier les connexions actives
sudo netstat -an | grep ESTABLISHED
```

---

## 🛠️ Dépannage Réseau

### Le serveur n'est pas accessible depuis Internet

```bash
# Vérifier l'IP publique
curl ifconfig.me

# Vérifier le port forwarding
# Tester depuis Internet :
telnet VOTRE_IP_PUBLIQUE 80

# Vérifier le pare-feu local
sudo ufw status
```

### Le domaine ne fonctionne pas

```bash
# Vérifier la résolution DNS
nslookup votre-domaine.com
dig votre-domaine.com

# Vérifier que l'IP correspond
curl ifconfig.me
# Comparer avec l'enregistrement DNS A
```

### Connexion SSH bloquée

```bash
# Vérifier que le port 22 est ouvert
sudo ufw allow 22/tcp

# Vérifier que SSH écoute
sudo netstat -tulpn | grep :22

# Tester depuis une autre machine
ssh -v utilisateur@ip-serveur
```

---

## 📊 Comparaison des Scénarios

| Scénario | Complexité | Coût | Sécurité | Accessibilité |
|----------|------------|------|----------|---------------|
| Local uniquement | ⭐ | Gratuit | ⭐⭐⭐⭐⭐ | ⭐⭐ |
| IP Publique | ⭐⭐ | Gratuit | ⭐⭐⭐ | ⭐⭐⭐⭐ |
| Domaine + SSL | ⭐⭐⭐ | ~10€/an | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| VPN | ⭐⭐⭐⭐ | Gratuit | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ |

---

**💡 Recommandation** : Commencer par l'accès local, puis migrer vers IP publique + DynDNS pour tester, et enfin domaine + SSL pour la production.





