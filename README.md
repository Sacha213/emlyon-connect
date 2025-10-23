# emlyon connect

L'application web pour les étudiants d'emlyon business school. Retrouvez-vous, planifiez des sorties et renforcez les liens au sein de la promo.

## 🚀 Démarrage Rapide

### Backend (API)
```bash
cd backend
npm install
npm run dev
# Serveur sur http://localhost:3001
```

### Frontend (React)
```bash
npm install
npm run dev
# Application sur http://localhost:3000
```

📖 **Documentation complète** : [backend/DOCS_INDEX.md](backend/DOCS_INDEX.md)

---

## Aperçu

**emlyon connect** est une application moderne et interactive conçue pour dynamiser la vie étudiante. Inspirée par une esthétique "Netflix", l'interface est sombre, immersive et intuitive. Elle permet aux étudiants de voir en temps réel qui est sorti et où, de s'organiser pour des événements et de ne jamais manquer une occasion de se retrouver.

## Fonctionnalités Principales

*   📍 **Géolocalisation en Temps Réel** : Visualisez sur une carte interactive où se trouvent vos amis. Les groupes de personnes au même endroit sont intelligemment clusterisés pour une meilleure lisibilité.
*   😎 **Statuts Emoji** : Ajoutez un emoji à votre localisation pour indiquer votre activité (🍻 verre, 📚 études, 🍽️ restaurant, etc.).
*   📅 **Gestion d'Événements** : Créez, consultez et participez à des événements organisés par et pour les étudiants.
*   📸 **Photos de Profil** : Uploadez et gérez votre photo de profil personnalisée (formats JPG, PNG, GIF, WEBP - max 5MB)
*   ✨ **Suggestions par IA** : En manque d'inspiration ? Laissez l'IA Gemini vous suggérer des idées de sorties originales à Paris.
*   🎨 **Design Moderne** : Une interface sombre et élégante inspirée de Netflix pour une expérience utilisateur agréable.
*   📱 **Responsive** : L'application est conçue pour fonctionner aussi bien sur ordinateur que sur mobile.

## Stack Technique

### Frontend
*   **Framework** : React 19 (avec TypeScript)
*   **Build Tool** : Vite 6.2
*   **Styling** : Tailwind CSS
*   **Cartographie** : Leaflet.js avec Leaflet.markercluster
*   **API IA** : Google Gemini API

### Backend
*   **Runtime** : Node.js 18+
*   **Framework** : Express 4.18
*   **Language** : TypeScript 5.3
*   **ORM** : Prisma 5.9
*   **Database** : PostgreSQL 15
*   **Auth** : JWT avec bcryptjs
*   **Real-time** : WebSocket
*   **Upload** : Multer

---

## Guide pour la Création du Backend

L'application actuelle fonctionne avec des données "mock" (factices) directement dans le code. Pour la rendre pleinement fonctionnelle, un backend est nécessaire pour gérer la persistance des données, l'authentification des utilisateurs et la logique métier.

Voici les étapes clés pour construire ce backend. Nous suggérons ici une stack **Node.js avec Express et TypeScript**, mais les principes s'appliquent à d'autres technologies (Python/Django, Ruby/Rails, etc.).

### Étape 1 : Configuration du Projet Backend

1.  **Initialisez un projet Node.js** :
    ```bash
    mkdir emlyon-connect-backend
    cd emlyon-connect-backend
    npm init -y
    npm install express cors dotenv jsonwebtoken bcryptjs
    npm install -D typescript @types/express @types/cors @types/node @types/bcryptjs ts-node-dev
    ```
2.  **Configurez TypeScript** : Créez un fichier `tsconfig.json` à la racine du projet.
    ```json
    {
      "compilerOptions": {
        "target": "ES6",
        "module": "commonjs",
        "rootDir": "./src",
        "outDir": "./dist",
        "esModuleInterop": true,
        "strict": true
      }
    }
    ```
3.  **Structure du Projet** : Organisez vos fichiers.
    ```
    /src
    ├── api
    │   ├── routes
    │   │   ├── auth.routes.ts
    │   │   ├── events.routes.ts
    │   │   └── checkins.routes.ts
    │   ├── controllers
    │   └── middlewares
    ├── config
    ├── models
    └── server.ts
    ```

### Étape 2 : Conception de la Base de Données

Vous aurez besoin d'une base de données pour stocker les informations. PostgreSQL avec un ORM comme Prisma ou TypeORM est un excellent choix.

**Schéma des tables :**

*   **Users**
    *   `id` (PK)
    *   `email` (UNIQUE)
    *   `password` (hash)
    *   `name`
    *   `avatarUrl`
    *   `createdAt`
*   **CheckIns**
    *   `id` (PK)
    *   `userId` (FK -> Users.id)
    *   `locationName`
    *   `latitude`
    *   `longitude`
    *   `statusEmoji`
    *   `createdAt` (pour le timestamp)
*   **Events**
    *   `id` (PK)
    *   `creatorId` (FK -> Users.id)
    *   `title`
    *   `description`
    *   `date`
    *   `createdAt`
*   **EventAttendees** (Table de liaison)
    *   `eventId` (FK -> Events.id)
    *   `userId` (FK -> Users.id)
    *   `joinedAt`

### Étape 3 : Authentification des Utilisateurs

Implémentez un système de connexion sécurisé avec des JSON Web Tokens (JWT).

1.  **Route d'inscription (Optionnel)** : `POST /api/auth/register` pour créer un nouvel utilisateur (en hashant le mot de passe avec `bcryptjs`).
2.  **Route de connexion** : `POST /api/auth/login`.
    *   Vérifiez l'email et le mot de passe (comparaison du hash).
    *   Si valides, générez un JWT contenant l'ID de l'utilisateur.
    *   Renvoyez ce token au client.
3.  **Middleware de protection** : Créez un middleware qui vérifie la validité du JWT dans l'en-tête `Authorization` de chaque requête nécessitant d'être authentifié.

### Étape 4 : Développement des Endpoints de l'API

Créez les routes RESTful pour que le frontend puisse interagir avec les données.

*   `GET /api/checkins` : Récupère tous les check-ins récents.
*   `POST /api/checkins` : Crée ou met à jour le check-in de l'utilisateur authentifié (protégé par le middleware).
*   `GET /api/events` : Récupère tous les événements à venir.
*   `POST /api/events` : Crée un nouvel événement (protégé).
*   `POST /api/events/:id/attend` : Permet à l'utilisateur authentifié de s'inscrire ou de se désinscrire d'un événement (protégé).
*   `GET /api/users/me` : Récupère les informations de l'utilisateur authentifié (protégé).

### Étape 5 : Intégration Sécurisée de l'API Gemini

L'appel à l'API Gemini doit se faire côté serveur pour ne pas exposer votre clé API.

1.  Stockez votre `API_KEY` dans un fichier `.env`.
2.  Créez un nouvel endpoint : `POST /api/suggest-activity`.
3.  Dans ce endpoint, appelez l'API Gemini comme c'est fait actuellement dans le frontend.
4.  Renvoyez la suggestion au format JSON au client.

### Étape 6 (Bonus) : Mises à Jour en Temps Réel

Pour que la carte se mette à jour instantanément lorsqu'un utilisateur signale sa position, intégrez les **WebSockets** (avec une librairie comme `Socket.IO`).

1.  Lorsqu'un utilisateur fait un `POST /api/checkins`, après avoir enregistré en base de données, le serveur émet un événement WebSocket (ex: `new_checkin`) à tous les clients connectés.
2.  Le frontend écoute cet événement et met à jour son état local (la liste des `checkIns`), ce qui rafraîchit la carte sans avoir besoin de recharger la page.

### Étape 7 : Sécurité et Déploiement

*   **Variables d'environnement** : Utilisez toujours un fichier `.env` pour les informations sensibles (clé API, secret JWT, chaîne de connexion à la base de données). Ne commitez jamais ce fichier sur Git.
*   **CORS** : Configurez le middleware `cors` pour n'autoriser que les requêtes provenant du domaine de votre frontend.
*   **Déploiement** : Vous pouvez déployer votre backend sur des plateformes comme Vercel (pour les serverless functions), Heroku, Render, ou sur un VPS (DigitalOcean, AWS EC2).

En suivant ces étapes, vous transformerez **emlyon connect** en une application web complète, robuste et prête à être utilisée par toute la promo !
