# 🎓 emlyon connect - Backend API

> Backend complet pour l'application emlyon connect - Réseau social étudiant avec géolocalisation en temps réel

## ✨ Fonctionnalités

- ✅ **Authentification JWT** - Inscription et connexion sécurisées
- ✅ **Check-ins en temps réel** - Géolocalisation des étudiants avec WebSocket
- ✅ **Gestion d'événements** - Création, participation, notifications
- ✅ **API REST complète** - Endpoints pour utilisateurs, check-ins, événements
- ✅ **Base de données PostgreSQL** - Avec Prisma ORM
- ✅ **WebSocket** - Mises à jour en temps réel
- ✅ **Données de test** - Script de seeding inclus
- ✅ **Docker** - PostgreSQL préconfigurée

## 🚀 Installation Rapide (5 minutes)

### Prérequis
- Node.js 18+
- Docker Desktop
- npm ou yarn

### Installation Automatique

```bash
cd backend
chmod +x setup.sh
./setup.sh
```

Ce script installe tout automatiquement :
- ✅ Dépendances npm
- ✅ PostgreSQL (Docker)
- ✅ Configuration (.env)
- ✅ Base de données
- ✅ Données de test

### Démarrage

```bash
npm run dev
```

Le serveur démarre sur **http://localhost:3001** 🎉

## 🔐 Comptes de Test

Tous utilisent le mot de passe : **password123**

```
alice@emlyon.com
bob@emlyon.com
charlie@emlyon.com
diana@emlyon.com
ethan@emlyon.com
```

## 📚 Documentation

| Document | Description |
|----------|-------------|
| [QUICKSTART.md](QUICKSTART.md) | Guide de démarrage rapide |
| [README.md](README.md) | Documentation complète de l'API |
| [ARCHITECTURE.md](ARCHITECTURE.md) | Architecture technique détaillée |
| [FRONTEND_INTEGRATION.md](FRONTEND_INTEGRATION.md) | Guide d'intégration avec React |
| [API_EXAMPLES.http](API_EXAMPLES.http) | Exemples de requêtes API |

## 🔌 API Endpoints

### Authentification
```
POST /api/auth/register  - Inscription
POST /api/auth/login     - Connexion
```

### Check-Ins (Auth requise)
```
GET    /api/checkins              - Liste des check-ins
POST   /api/checkins              - Créer un check-in
DELETE /api/checkins/:id          - Supprimer un check-in
GET    /api/checkins/user/:userId - Check-in d'un utilisateur
```

### Événements (Auth requise)
```
GET    /api/events           - Liste des événements
POST   /api/events           - Créer un événement
GET    /api/events/:id       - Détails d'un événement
PUT    /api/events/:id       - Modifier un événement
DELETE /api/events/:id       - Supprimer un événement
POST   /api/events/:id/attend   - Participer
DELETE /api/events/:id/attend   - Se désinscrire
```

### Utilisateurs (Auth requise)
```
GET /api/users/me  - Mon profil
GET /api/users/:id - Profil utilisateur
GET /api/users     - Liste des utilisateurs
```

### Health Check
```
GET /api/health - Statut du serveur
```

## 🔌 WebSocket

```javascript
const ws = new WebSocket('ws://localhost:3001/ws?token=YOUR_JWT_TOKEN');

ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  // data.type: 'initial' | 'checkIns' | 'events'
  console.log('Update:', data);
};
```

## 📦 Scripts NPM

```bash
# Développement
npm run dev              # Démarrer avec auto-reload

# Base de données
npm run prisma:studio    # Interface graphique DB
npm run prisma:seed      # Réinitialiser données test
npm run db:setup         # Setup complet DB

# Docker
npm run docker:up        # Démarrer PostgreSQL
npm run docker:down      # Arrêter PostgreSQL

# Production
npm run build            # Compiler TypeScript
npm start                # Production
```

## 🏗️ Structure

```
backend/
├── src/
│   ├── controllers/     # Logique métier
│   ├── routes/          # Définition des routes
│   ├── middleware/      # Auth, validation, erreurs
│   ├── config/          # Configuration DB
│   ├── server.ts        # Point d'entrée
│   └── websocket.ts     # Gestion WebSocket
├── prisma/
│   ├── schema.prisma    # Schéma DB
│   ├── seed.ts          # Données test
│   └── migrations/      # Migrations
├── docker-compose.yml   # PostgreSQL
├── setup.sh            # Installation auto
└── package.json
```

## 🗄️ Base de Données

### Schéma
- **Users** - Utilisateurs (email, password, name, avatar)
- **CheckIns** - Géolocalisations (location, lat/lng, emoji)
- **Events** - Événements (titre, description, date)
- **EventAttendees** - Participants aux événements

### Technologies
- PostgreSQL 15
- Prisma ORM
- Migrations versionnées
- Index optimisés

## 🔐 Sécurité

- **JWT** - Authentification stateless
- **bcryptjs** - Hash de mots de passe (12 rounds)
- **express-validator** - Validation des entrées
- **CORS** - Protection cross-origin
- **Prisma** - Protection injection SQL

## 🧪 Tester l'API

### Avec cURL

```bash
# Connexion
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"alice@emlyon.com","password":"password123"}'

# Check-ins (avec token)
curl http://localhost:3001/api/checkins \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Avec Prisma Studio

```bash
npm run prisma:studio
```
Ouvre une interface web sur http://localhost:5555

## 🚀 Déploiement

### Variables d'Environnement

```env
DATABASE_URL="postgresql://..."
JWT_SECRET="votre_secret_securise"
JWT_EXPIRES_IN="7d"
PORT=3001
FRONTEND_URL="https://votre-frontend.com"
NODE_ENV="production"
```

### Build Production

```bash
npm run build
npm start
```

## 🐛 Dépannage

### Le serveur ne démarre pas

```bash
# Vérifier PostgreSQL
docker ps

# Redémarrer
npm run docker:down
npm run docker:up
```

### Reset complet de la DB

```bash
npm run docker:down
docker volume rm emlyon-connect-backend_postgres_data
npm run docker:up
sleep 5
npm run db:setup
```

### Logs

Les logs SQL sont activés en développement dans `src/config/database.ts`

## 📖 Ressources

- [Documentation Prisma](https://www.prisma.io/docs)
- [Express.js](https://expressjs.com/)
- [JWT.io](https://jwt.io/)
- [WebSocket API](https://developer.mozilla.org/en-US/docs/Web/API/WebSocket)

## 🤝 Contribution

### Ajouter une route

1. Créer le controller dans `src/controllers/`
2. Créer la route dans `src/routes/`
3. Importer dans `src/server.ts`
4. Documenter dans `README.md`

### Modifier le schéma DB

```bash
# 1. Modifier prisma/schema.prisma
# 2. Créer la migration
npx prisma migrate dev --name nom_de_la_migration
# 3. Regénérer le client
npm run prisma:generate
```

## 📝 TODO

- [ ] Tests unitaires (Jest)
- [ ] Tests d'intégration
- [ ] Rate limiting
- [ ] Pagination des résultats
- [ ] Upload d'images (avatars)
- [ ] Notifications push
- [ ] Logs structurés (Winston)
- [ ] Monitoring (Prometheus/Grafana)

## 📄 Licence

Ce projet est sous licence MIT.

## 👥 Auteur

Développé pour emlyon business school

---

**🎉 Backend prêt à l'emploi ! Consultez [FRONTEND_INTEGRATION.md](FRONTEND_INTEGRATION.md) pour connecter votre frontend React.**
