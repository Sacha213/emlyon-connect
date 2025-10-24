# 🎓 emlyon connect

> Réseau social pour les étudiants d'emlyon business school

Application web moderne pour connecter les étudiants avec :
- 📍 **Géolocalisation en temps réel** : Voir où sont les autres étudiants
- 🎉 **Événements** : Créer et participer à des événements
- 👥 **Profils** : Photos de profil et informations de promotion
- ⚡ **Temps réel** : Mises à jour instantanées avec WebSocket

## 🚀 Stack Technique

### Frontend
- React 19 + TypeScript
- Vite 6
- Tailwind CSS
- Leaflet (cartes interactives)

### Backend
- Node.js + Express
- TypeScript
- Prisma ORM
- PostgreSQL (Supabase)
- WebSocket
- JWT Authentication

## ⚡ Démarrage Rapide

### 1. Backend

```bash
cd backend
npm install
npm run dev
```

Le backend démarre sur **http://localhost:3001**

### 2. Frontend

```bash
npm install
npm run dev
```

Le frontend démarre sur **http://localhost:3000**

## 🔑 Compte de test

```
Email: admin@emlyon.com
Mot de passe: password123
```

## 📁 Structure

```
emlyon-connect/
├── backend/          # API Node.js + Supabase
├── components/       # Composants React
├── services/         # Services (Gemini AI)
├── App.tsx           # Application principale
└── README.md         # Ce fichier
```

## 🗄️ Base de données

Ce projet utilise **Supabase** (PostgreSQL cloud) :
- ✅ Pas besoin de PostgreSQL local
- ✅ Backups automatiques
- ✅ Interface web pour gérer les données
- ✅ SSL/TLS activé

## 📚 Fonctionnalités

- ✅ Inscription / Connexion sécurisée
- ✅ Géolocalisation avec carte interactive
- ✅ Check-ins avec statut (emoji)
- ✅ Création d'événements
- ✅ Participation aux événements
- ✅ Upload de photo de profil
- ✅ Mises à jour en temps réel (WebSocket)
- ✅ Système de promotions (EMI, Dev, etc.)

## 🛠️ Développement

### Backend

Voir [backend/README.md](backend/README.md) pour plus de détails.

```bash
cd backend
npm run dev              # Mode développement
npm run prisma:studio    # Interface base de données
npm run test:connection  # Tester Supabase
```

### Frontend

```bash
npm run dev    # Mode développement
npm run build  # Build production
```

## 🔒 Sécurité

- JWT avec expiration (7 jours)
- Mots de passe hashés (bcrypt)
- Validation des entrées
- CORS configuré
- SSL/TLS sur Supabase

## 📄 Licence

MIT

---

Made with ❤️ for emlyon business school students
