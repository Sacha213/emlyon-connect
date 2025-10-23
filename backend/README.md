# 🎓 emlyon connect - Backend API

> API REST complète avec WebSocket pour l'application emlyon connect

[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue.svg)](https://www.typescriptlang.org/)
[![Express](https://img.shields.io/badge/Express-4.18-lightgrey.svg)](https://expressjs.com/)
[![Prisma](https://img.shields.io/badge/Prisma-5.9-2D3748.svg)](https://www.prisma.io/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-336791.svg)](https://www.postgresql.org/)

## ⚡ Démarrage Ultra-Rapide

```bash
./setup.sh
npm run dev
```

✅ Le serveur démarre sur **http://localhost:3001**

📖 **Guides détaillés disponibles :**
- [INSTALL.md](INSTALL.md) - Installation pas à pas
- [QUICKSTART.md](QUICKSTART.md) - Guide de démarrage rapide
- [GETTING_STARTED.md](GETTING_STARTED.md) - Vue d'ensemble complète

---

## 🚀 Démarrage Rapide

### Prérequis

- Node.js 18+ et npm
- PostgreSQL 14+

### Installation

1. **Installer les dépendances**
   ```bash
   npm install
   ```

2. **Configurer les variables d'environnement**
   ```bash
   cp .env.example .env
   ```
   
   Puis modifiez le fichier `.env` avec vos informations :
   ```env
   DATABASE_URL="postgresql://user:password@localhost:5432/emlyon_connect?schema=public"
   JWT_SECRET="votre_secret_jwt_tres_securise"
   JWT_EXPIRES_IN="7d"
   PORT=3001
   FRONTEND_URL="http://localhost:5173"
   ```

3. **Configurer PostgreSQL**
   
   Créez une base de données :
   ```bash
   createdb emlyon_connect
   ```

4. **Initialiser Prisma et créer les tables**
   ```bash
   npm run prisma:generate
   npm run prisma:migrate
   ```

5. **Lancer le serveur en mode développement**
   ```bash
   npm run dev
   ```

Le serveur démarre sur `http://localhost:3001`

## 📚 API Endpoints

### Authentication

#### POST `/api/auth/register`
Inscription d'un nouvel utilisateur.

**Body:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "name": "John Doe",
  "avatarUrl": "https://..." // optionnel
}
```

#### POST `/api/auth/login`
Connexion d'un utilisateur.

**Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

### Check-Ins (Authentification requise)

#### GET `/api/checkins`
Récupère tous les check-ins actifs (dernières 24h).

#### POST `/api/checkins`
Crée un nouveau check-in.

**Headers:**
```
Authorization: Bearer <token>
```

**Body:**
```json
{
  "locationName": "Le Café",
  "latitude": 48.8566,
  "longitude": 2.3522,
  "statusEmoji": "🍻"
}
```

#### DELETE `/api/checkins/:id`
Supprime un check-in.

#### GET `/api/checkins/user/:userId`
Récupère le check-in actif d'un utilisateur.

### Events (Authentification requise)

#### GET `/api/events`
Récupère tous les événements à venir.

#### GET `/api/events/:id`
Récupère un événement spécifique.

#### POST `/api/events`
Crée un nouvel événement.

**Headers:**
```
Authorization: Bearer <token>
```

**Body:**
```json
{
  "title": "Soirée étudiante",
  "description": "Retrouvons-nous au bar",
  "date": "2025-10-25T20:00:00.000Z"
}
```

#### PUT `/api/events/:id`
Met à jour un événement (créateur uniquement).

#### DELETE `/api/events/:id`
Supprime un événement (créateur uniquement).

#### POST `/api/events/:id/attend`
Participer à un événement.

#### DELETE `/api/events/:id/attend`
Se désinscrire d'un événement.

### Users (Authentification requise)

#### GET `/api/users/me`
Récupère le profil de l'utilisateur connecté.

#### GET `/api/users/:id`
Récupère un utilisateur par son ID.

#### GET `/api/users`
Récupère tous les utilisateurs.

### Health Check

#### GET `/api/health`
Vérifie l'état du serveur.

## 🔌 WebSocket

Le serveur WebSocket permet des mises à jour en temps réel.

**Connexion:**
```javascript
const ws = new WebSocket('ws://localhost:3001/ws?token=<your_jwt_token>');

ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  console.log('Received:', data);
};
```

**Messages:**
- `type: 'initial'` - Données initiales (check-ins + événements)
- `type: 'checkIns'` - Mise à jour des check-ins
- `type: 'events'` - Mise à jour des événements

## 🛠️ Scripts NPM

- `npm run dev` - Démarre le serveur en mode développement avec auto-reload
- `npm run build` - Compile le TypeScript en JavaScript
- `npm start` - Démarre le serveur en production
- `npm run prisma:generate` - Génère le client Prisma
- `npm run prisma:migrate` - Exécute les migrations de base de données
- `npm run prisma:studio` - Ouvre Prisma Studio (interface GUI pour la DB)

## 🗄️ Structure de la Base de Données

### Users
- `id` (UUID, PK)
- `email` (String, unique)
- `password` (String, hashé)
- `name` (String)
- `avatarUrl` (String)
- `createdAt` (DateTime)
- `updatedAt` (DateTime)

### CheckIns
- `id` (UUID, PK)
- `userId` (UUID, FK -> Users)
- `locationName` (String)
- `latitude` (Float)
- `longitude` (Float)
- `statusEmoji` (String, optionnel)
- `createdAt` (DateTime)
- `updatedAt` (DateTime)

### Events
- `id` (UUID, PK)
- `title` (String)
- `description` (String)
- `date` (DateTime)
- `creatorId` (UUID, FK -> Users)
- `createdAt` (DateTime)
- `updatedAt` (DateTime)

### EventAttendees
- `eventId` (UUID, FK -> Events)
- `userId` (UUID, FK -> Users)
- PK composite: (eventId, userId)

## 🔐 Sécurité

- Mots de passe hashés avec bcryptjs (12 rounds)
- Authentification JWT
- Validation des entrées avec express-validator
- CORS configuré
- Protection contre les injections SQL via Prisma

## 📝 Notes

- Les check-ins sont automatiquement limités à 24h
- Un utilisateur ne peut avoir qu'un seul check-in actif à la fois
- Le créateur d'un événement y participe automatiquement
- Le créateur d'un événement ne peut pas se désinscrire

## 🐛 Debugging

Pour activer les logs SQL de Prisma en développement, le serveur est déjà configuré pour les afficher.

Pour ouvrir Prisma Studio et visualiser vos données :
```bash
npm run prisma:studio
```
