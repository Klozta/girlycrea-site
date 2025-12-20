# Dockerfile simple pour Render
FROM node:20-alpine

WORKDIR /app

# Installer TypeScript globalement pour contourner le problème de cache
RUN npm install -g typescript

# Copier package.json
COPY package.json ./

# Installer TOUTES les dépendances (y compris devDependencies pour le build)
RUN npm install

# Copier le code source
COPY . .

# Build TypeScript (tsc est disponible globalement + @types sont installés)
RUN npm run build

# Supprimer les devDependencies après le build pour réduire la taille
RUN npm prune --production

# Exposer le port (Render utilise le port défini dans PORT env var)
EXPOSE 10000

# Démarrer l'application directement avec node (évite les problèmes avec Docker Command)
CMD ["node", "dist/index.js"]
