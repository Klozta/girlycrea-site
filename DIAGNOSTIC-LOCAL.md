# 🔍 Diagnostic Problème Local

## Checklist de Vérification

### 1. Serveurs Démarrés ?

```bash
# Vérifier les processus
ps aux | grep -E "(next|node.*3000|node.*3001)" | grep -v grep

# Vérifier les ports
ss -tuln | grep -E ':(3000|3001)'
```

**Si rien ne s'affiche** : Les serveurs ne sont pas démarrés.

### 2. Port Forwarding Actif ?

**Sur Windows PowerShell (Admin)** :
```powershell
netsh interface portproxy show all
```

Vous devriez voir :
```
0.0.0.0:3000                 : 172.24.241.227:3000
0.0.0.0:3001                 : 172.24.241.227:3001
```

### 3. Firewall Windows ?

**Sur Windows PowerShell (Admin)** :
```powershell
# Autoriser les ports
netsh advfirewall firewall add rule name="GirlyCrea Frontend" dir=in action=allow protocol=TCP localport=3000
netsh advfirewall firewall add rule name="GirlyCrea Backend" dir=in action=allow protocol=TCP localport=3001
```

### 4. Test depuis Windows

**Sur Windows PowerShell** :
```powershell
# Test localhost
curl http://localhost:3000
curl http://localhost:3001/health

# Test IP locale
curl http://192.168.1.40:3000
curl http://192.168.1.40:3001/health
```

### 5. Test depuis Autre Appareil

**Sur l'autre ordinateur** :
```bash
# Vérifier qu'il est sur le même réseau
ping 192.168.1.40

# Tester l'accès
curl http://192.168.1.40:3000
curl http://192.168.1.40:3001/health
```

## 🐛 Problèmes Courants

### "Connection refused"
- Les serveurs ne sont pas démarrés
- Le firewall bloque les connexions

### "Connection timeout"
- Le port forwarding n'est pas configuré
- Le firewall bloque les connexions
- Les appareils ne sont pas sur le même réseau

### "This site can't be reached"
- Mauvaise IP
- Les serveurs ne sont pas démarrés

