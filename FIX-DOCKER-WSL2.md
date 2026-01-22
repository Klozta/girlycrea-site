# 🔧 Fix Docker Permission Error dans WSL2

## ❌ Erreur

```
PermissionError: [Errno 13] Permission denied
docker.errors.DockerException: Error while fetching server API version
```

## ✅ Solutions

### Solution 1 : Ajouter l'utilisateur au groupe docker

```bash
# Ajouter votre utilisateur au groupe docker
sudo usermod -aG docker $USER

# Redémarrer WSL2 (fermer et rouvrir le terminal)
# OU se déconnecter/reconnecter
newgrp docker

# Vérifier
docker ps
```

### Solution 2 : Vérifier que Docker Desktop est démarré

**Sur Windows** :
1. Ouvrir Docker Desktop
2. Settings → General → ✅ "Use the WSL 2 based engine"
3. Settings → Resources → WSL Integration → ✅ Activer votre distribution Ubuntu

**Dans WSL2** :
```bash
# Vérifier que Docker est accessible
docker ps

# Si erreur, redémarrer Docker Desktop sur Windows
```

### Solution 3 : Démarrer Docker daemon dans WSL2

Si Docker est installé directement dans WSL2 (pas Docker Desktop) :

```bash
# Démarrer Docker
sudo service docker start

# OU
sudo systemctl start docker

# Vérifier
sudo docker ps
```

### Solution 4 : Utiliser sudo (temporaire)

```bash
# Utiliser sudo pour docker-compose
sudo docker-compose up -d

# OU configurer sudo sans mot de passe (moins sécurisé)
sudo visudo
# Ajouter : ghislain ALL=(ALL) NOPASSWD: /usr/bin/docker, /usr/bin/docker-compose
```

## 🔍 Diagnostic

### Vérifier l'installation Docker

```bash
# Vérifier si Docker est installé
which docker
docker --version

# Vérifier si Docker Desktop est utilisé
echo $DOCKER_HOST

# Vérifier les permissions du socket
ls -la /var/run/docker.sock
```

### Vérifier le groupe docker

```bash
# Voir les groupes de l'utilisateur
groups

# Voir les membres du groupe docker
getent group docker
```

## 🚀 Solution Recommandée

**Pour WSL2 avec Docker Desktop** :

1. **Sur Windows** : Démarrer Docker Desktop
2. **Settings → Resources → WSL Integration** : Activer Ubuntu
3. **Dans WSL2** :
```bash
# Ajouter au groupe docker
sudo usermod -aG docker $USER

# Redémarrer le terminal WSL2
exit
# Puis rouvrir

# Vérifier
docker ps
```

## 📝 Alternative : Utiliser Docker Desktop directement

Si les problèmes persistent, utilisez Docker Desktop depuis Windows :

```powershell
# Sur Windows PowerShell
cd \\wsl$\Ubuntu\home\ghislain\girlycrea-site
docker-compose up -d
```

## ✅ Vérification Finale

```bash
# Tester Docker
docker ps

# Tester Docker Compose
docker-compose --version

# Si ça fonctionne, démarrer les services
docker-compose up -d
```

