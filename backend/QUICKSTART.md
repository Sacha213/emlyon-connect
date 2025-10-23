# emlyon connect - Guide de Démarrage Rapide

## 🎯 Installation en 1 commande (MacOS/Linux)

```bash
chmod +x setup.sh && ./setup.sh
```

Ce script va :
- ✅ Installer les dépendances npm
- ✅ Démarrer PostgreSQL avec Docker
- ✅ Créer le fichier `.env`
- ✅ Configurer Prisma
- ✅ Créer les tables de la base de données
- ✅ Ajouter des données de test

## 🚀 Démarrage

Une fois l'installation terminée :

```bash
npm run dev
```

Le serveur démarre sur **http://localhost:3001**

## 🔐 Comptes de test

Tous les comptes utilisent le mot de passe : **password123**

- alice@emlyon.com
- bob@emlyon.com
- charlie@emlyon.com
- diana@emlyon.com
- ethan@emlyon.com

## 📋 Commandes utiles

```bash
# Développement
npm run dev                    # Démarrer le serveur (avec auto-reload)

# Base de données
npm run prisma:studio          # Interface graphique pour la DB
npm run prisma:seed            # Réinitialiser les données de test
npm run db:setup               # Setup complet de la DB

# Docker
npm run docker:up              # Démarrer PostgreSQL
npm run docker:down            # Arrêter PostgreSQL

# Production
npm run build                  # Compiler TypeScript
npm start                      # Démarrer en production
```

## 🧪 Tester l'API

### Inscription

```bash
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@emlyon.com",
    "password": "password123",
    "name": "Test User"
  }'
```

### Connexion

```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "alice@emlyon.com",
    "password": "password123"
  }'
```

### Récupérer les check-ins (avec authentification)

```bash
curl http://localhost:3001/api/checkins \
  -H "Authorization: Bearer VOTRE_TOKEN_JWT"
```

## 🔌 WebSocket

Pour se connecter au WebSocket :

```javascript
const token = 'VOTRE_TOKEN_JWT';
const ws = new WebSocket(`ws://localhost:3001/ws?token=${token}`);

ws.onopen = () => console.log('Connected');
ws.onmessage = (event) => console.log('Message:', JSON.parse(event.data));
```

## 🗄️ Structure de la base de données

Visualisez et modifiez la base de données avec Prisma Studio :

```bash
npm run prisma:studio
```

Ouvre une interface web sur **http://localhost:5555**

## 🐛 Dépannage

### Le serveur ne démarre pas

```bash
# Vérifier que PostgreSQL est bien démarré
docker ps

# Redémarrer PostgreSQL
npm run docker:down
npm run docker:up
```

### Erreur de connexion à la base de données

```bash
# Vérifier le fichier .env
cat .env

# La DATABASE_URL doit être :
# postgresql://emlyon:emlyon2025@localhost:5432/emlyon_connect?schema=public
```

### Réinitialiser complètement la base de données

```bash
npm run docker:down
docker volume rm emlyon-connect-backend_postgres_data
npm run docker:up
sleep 5
npm run db:setup
```

## 📚 Documentation complète

Consultez le [README.md](README.md) pour la documentation complète de l'API.
