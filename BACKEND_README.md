# 🎓 emlyon connect - Projet Complet

## 📁 Structure du Projet

```
emlyon-connect/
├── frontend/                # Application React (existant)
│   ├── components/
│   ├── services/
│   └── ...
│
└── backend/                 # API Node.js/Express (nouveau)
    ├── src/
    │   ├── controllers/
    │   ├── routes/
    │   ├── middleware/
    │   └── server.ts
    ├── prisma/
    │   ├── schema.prisma
    │   └── seed.ts
    └── Documentation complète
```

## 🚀 Démarrage Rapide

### 1. Backend (nouveau)

```bash
cd backend
./setup.sh
npm run dev
```

Le backend démarre sur **http://localhost:3001**

### 2. Frontend (existant)

```bash
cd ..  # revenir à la racine
npm run dev
```

Le frontend démarre sur **http://localhost:5173**

## 📚 Documentation Backend

Le backend dispose d'une documentation complète :

| Fichier | Description |
|---------|-------------|
| **[backend/DOCS_INDEX.md](backend/DOCS_INDEX.md)** | 📚 Index de toute la documentation |
| **[backend/GETTING_STARTED.md](backend/GETTING_STARTED.md)** | 🎯 Vue d'ensemble complète |
| **[backend/INSTALL.md](backend/INSTALL.md)** | 🔧 Guide d'installation détaillé |
| **[backend/QUICKSTART.md](backend/QUICKSTART.md)** | ⚡ Démarrage en 5 minutes |
| **[backend/README.md](backend/README.md)** | 📖 Documentation API complète |
| **[backend/ARCHITECTURE.md](backend/ARCHITECTURE.md)** | 🏗️ Architecture technique |
| **[backend/FRONTEND_INTEGRATION.md](backend/FRONTEND_INTEGRATION.md)** | 🔗 Guide d'intégration React |
| **[backend/API_EXAMPLES.http](backend/API_EXAMPLES.http)** | 🧪 Exemples de requêtes |

👉 **Commencez par : [backend/DOCS_INDEX.md](backend/DOCS_INDEX.md)**

## 🔐 Comptes de Test

Le backend inclut 5 utilisateurs de test :

```
Email: alice@emlyon.com
Mot de passe: password123

(bob, charlie, diana, ethan aussi disponibles)
```

## 🛠️ Technologies

### Frontend
- React + TypeScript
- Tailwind CSS
- Leaflet.js (cartes)
- Google Gemini AI

### Backend
- Node.js + Express
- TypeScript
- PostgreSQL + Prisma ORM
- JWT Authentication
- WebSocket (temps réel)

## 📋 Prochaines Étapes

### Pour démarrer le développement :

1. **Installer le backend** (5 min)
   ```bash
   cd backend
   ./setup.sh
   ```

2. **Démarrer le backend**
   ```bash
   npm run dev
   ```

3. **Tester l'API** (3 min)
   ```bash
   curl http://localhost:3001/api/health
   ```

4. **Intégrer avec le frontend** (30-60 min)
   - Lire [backend/FRONTEND_INTEGRATION.md](backend/FRONTEND_INTEGRATION.md)
   - Installer axios
   - Configurer les services API
   - Implémenter l'authentification
   - Connecter le WebSocket

## 🎯 Fonctionnalités Disponibles

### Backend API
✅ Authentification JWT (inscription/connexion)
✅ Gestion des utilisateurs
✅ Check-ins géolocalisés
✅ Événements (création, participation)
✅ WebSocket pour mises à jour temps réel
✅ Base de données PostgreSQL
✅ Données de test incluses

### Frontend (à connecter)
✅ Interface utilisateur complète
✅ Carte interactive (Leaflet)
✅ Gestion d'événements
✅ Suggestions IA (Gemini)
⏳ À connecter à l'API backend

## 🔧 Commandes Utiles

### Backend
```bash
cd backend
npm run dev              # Démarrer le serveur
npm run prisma:studio    # Interface DB
npm run prisma:seed      # Recharger données test
npm run docker:down      # Arrêter PostgreSQL
```

### Frontend
```bash
npm run dev              # Démarrer le frontend
npm run build            # Build production
```

## 📖 Documentation Détaillée

Pour une documentation complète du backend, consultez :

**👉 [backend/DOCS_INDEX.md](backend/DOCS_INDEX.md)**

Ce fichier contient :
- Plan de lecture recommandé
- Index par sujet
- Référence rapide
- Guide de navigation

## 🐛 Besoin d'Aide ?

### Backend
- [backend/INSTALL.md](backend/INSTALL.md#problèmes-courants) - Dépannage
- [backend/QUICKSTART.md](backend/QUICKSTART.md#dépannage) - Debug rapide
- Logs dans le terminal du serveur

### Frontend
- Consultez le README.md du frontend
- Vérifiez la console du navigateur

## 🚀 Déploiement

### Backend
- Configuration via variables d'environnement
- Compatible avec Heroku, Railway, Render, etc.
- Base de données PostgreSQL requise

### Frontend
- Build avec `npm run build`
- Déploiement sur Vercel, Netlify, etc.

## 📝 TODO

### Backend
- [x] API REST complète
- [x] Authentification JWT
- [x] WebSocket temps réel
- [x] Base de données PostgreSQL
- [x] Documentation complète
- [ ] Tests unitaires
- [ ] Tests d'intégration
- [ ] Rate limiting
- [ ] Upload d'images

### Frontend
- [x] Interface utilisateur
- [x] Composants React
- [ ] Intégration API backend
- [ ] WebSocket client
- [ ] Authentification
- [ ] Tests

## 🤝 Contribution

Le backend est maintenant prêt à l'emploi ! Pour contribuer :

1. Consultez la documentation
2. Créez une branche pour vos modifications
3. Testez vos changements
4. Soumettez une pull request

## 📄 Licence

MIT

---

**🎉 Projet prêt pour le développement !**

Commencez par installer et tester le backend, puis intégrez-le avec le frontend React existant.

Pour toute question, consultez d'abord la documentation complète dans `backend/DOCS_INDEX.md`.
