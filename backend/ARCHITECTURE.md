# Architecture Backend - emlyon connect

## 📁 Structure du Projet

```
backend/
├── prisma/
│   ├── migrations/              # Migrations de base de données
│   ├── schema.prisma            # Schéma de la base de données
│   └── seed.ts                  # Données de test
├── src/
│   ├── config/
│   │   └── database.ts          # Configuration Prisma
│   ├── controllers/
│   │   ├── auth.controller.ts   # Authentification
│   │   ├── checkin.controller.ts # Gestion des check-ins
│   │   ├── event.controller.ts  # Gestion des événements
│   │   └── user.controller.ts   # Gestion des utilisateurs
│   ├── middleware/
│   │   ├── auth.ts              # Middleware d'authentification JWT
│   │   ├── errorHandler.ts     # Gestion des erreurs
│   │   └── validate.ts          # Validation des données
│   ├── routes/
│   │   ├── auth.routes.ts       # Routes d'authentification
│   │   ├── checkin.routes.ts    # Routes check-ins
│   │   ├── event.routes.ts      # Routes événements
│   │   └── user.routes.ts       # Routes utilisateurs
│   ├── server.ts                # Point d'entrée serveur
│   └── websocket.ts             # Gestion WebSocket
├── .env                         # Variables d'environnement
├── .env.example                 # Exemple de configuration
├── docker-compose.yml           # Configuration PostgreSQL
├── package.json
├── tsconfig.json
├── setup.sh                     # Script d'installation
├── API_EXAMPLES.http            # Exemples de requêtes
├── QUICKSTART.md                # Guide rapide
└── README.md                    # Documentation complète
```

## 🔄 Flux de Données

### Authentification
1. Client → POST /api/auth/register ou /api/auth/login
2. Serveur valide les données (express-validator)
3. Hash du mot de passe (bcryptjs)
4. Sauvegarde en DB (Prisma)
5. Génération JWT token
6. Réponse avec token + user data

### Check-Ins (temps réel)
1. Client → POST /api/checkins (avec JWT token)
2. Middleware authenticate vérifie le token
3. Controller crée le check-in en DB
4. WebSocket broadcast aux clients connectés
5. Tous les clients reçoivent la mise à jour

### Événements
1. Client → POST /api/events (avec JWT token)
2. Validation des données
3. Création en DB avec relation User
4. Le créateur est ajouté automatiquement comme participant
5. WebSocket broadcast
6. Réponse avec l'événement créé

## 🔐 Sécurité

### JWT (JSON Web Token)
- Token généré à la connexion/inscription
- Expire après 7 jours (configurable)
- Stocké côté client
- Vérifié par middleware sur routes protégées

### Hashing des Mots de Passe
- bcryptjs avec 12 rounds de salting
- Mots de passe jamais stockés en clair
- Comparaison sécurisée lors de la connexion

### Validation des Données
- express-validator sur toutes les routes
- Sanitization automatique
- Messages d'erreur clairs

### CORS
- Configuré pour accepter uniquement le frontend
- Credentials autorisés pour JWT
- Personnalisable via .env

## 🔌 WebSocket

### Connexion
```javascript
ws://localhost:3001/ws?token=JWT_TOKEN
```

### Messages
```json
// Initial data
{
  "type": "initial",
  "checkIns": [...],
  "events": [...]
}

// Updates
{
  "type": "checkIns",
  "data": [...]
}

{
  "type": "events",
  "data": [...]
}
```

### Broadcast
- Automatique lors de création/modification/suppression
- Envoyé à tous les clients connectés
- Pas de polling nécessaire

## 🗄️ Base de Données

### Relations
```
User
  ├── CheckIns (1:N)
  ├── CreatedEvents (1:N)
  └── AttendedEvents (N:N via EventAttendee)

Event
  ├── Creator (N:1 vers User)
  └── Attendees (N:N via EventAttendee)
```

### Index
- `User.email` (unique)
- `CheckIn.userId`
- `CheckIn.createdAt`
- `Event.creatorId`
- `Event.date`

### Cascade Delete
Toutes les relations utilisent ON DELETE CASCADE
- Suppression user → supprime ses check-ins et événements
- Suppression event → supprime les participations

## 🚀 Performance

### Prisma ORM
- Requêtes SQL optimisées
- Type-safe queries
- Connection pooling automatique
- Migrations versionnées

### WebSocket
- Connexions persistantes
- Broadcast efficace
- Authentification à la connexion

### Indexation
- Index sur champs fréquemment recherchés
- Améliore performances des queries

## 🧪 Tests & Debug

### Prisma Studio
```bash
npm run prisma:studio
```
Interface graphique pour visualiser/modifier la DB

### Logs
- Logs SQL en développement
- Error logs en production
- Console logs pour WebSocket

### Données de Test
```bash
npm run prisma:seed
```
Crée 5 utilisateurs + check-ins + événements

## 📦 Déploiement

### Production Build
```bash
npm run build
npm start
```

### Variables d'Environnement
Obligatoires :
- `DATABASE_URL`
- `JWT_SECRET`

Optionnelles :
- `PORT` (défaut: 3001)
- `JWT_EXPIRES_IN` (défaut: 7d)
- `FRONTEND_URL` (pour CORS)
- `NODE_ENV`

### Docker
PostgreSQL fourni via docker-compose
Pour production : utiliser service managé (AWS RDS, etc.)

## 🔄 Migration

### Créer une Migration
```bash
npx prisma migrate dev --name nom_migration
```

### Appliquer en Production
```bash
npx prisma migrate deploy
```

## 📊 Monitoring

### Health Check
```
GET /api/health
```
Retourne le statut du serveur

### Logs Recommandés
- Connexions/déconnexions
- Erreurs d'authentification
- Erreurs de base de données
- WebSocket events

## 🔧 Maintenance

### Reset DB
```bash
npm run docker:down
docker volume rm emlyon-connect-backend_postgres_data
npm run docker:up
npm run db:setup
```

### Update Dependencies
```bash
npm update
npm audit fix
```

### Backup DB
```bash
docker exec emlyon_connect_db pg_dump -U emlyon emlyon_connect > backup.sql
```
