# 📚 Documentation emlyon connect Backend

Bienvenue dans la documentation complète du backend emlyon connect !

## 🎯 Par où commencer ?

### Vous débutez ?
👉 [GETTING_STARTED.md](GETTING_STARTED.md) - Vue d'ensemble complète du projet

### Vous voulez installer rapidement ?
👉 [INSTALL.md](INSTALL.md) - Guide d'installation détaillé

### Vous cherchez un guide rapide ?
👉 [QUICKSTART.md](QUICKSTART.md) - Démarrage en 5 minutes

---

## 📖 Documentation Disponible

### 🚀 Mise en route

| Document | Description | Pour qui ? |
|----------|-------------|------------|
| **[GETTING_STARTED.md](GETTING_STARTED.md)** | Présentation générale, fonctionnalités, architecture | Tous |
| **[INSTALL.md](INSTALL.md)** | Installation pas à pas avec dépannage | Développeurs |
| **[QUICKSTART.md](QUICKSTART.md)** | Installation rapide et commandes essentielles | Développeurs expérimentés |

### 🏗️ Architecture & Développement

| Document | Description | Pour qui ? |
|----------|-------------|------------|
| **[README.md](README.md)** | Documentation API complète, tous les endpoints | Tous |
| **[ARCHITECTURE.md](ARCHITECTURE.md)** | Architecture technique détaillée, flux de données | Développeurs backend |
| **[API_EXAMPLES.http](API_EXAMPLES.http)** | Exemples de requêtes HTTP prêtes à l'emploi | Développeurs frontend/backend |

### 🔗 Intégration

| Document | Description | Pour qui ? |
|----------|-------------|------------|
| **[FRONTEND_INTEGRATION.md](FRONTEND_INTEGRATION.md)** | Guide complet pour intégrer le backend avec React | Développeurs frontend |
| **[AVATAR_UPLOAD.md](AVATAR_UPLOAD.md)** | Upload de photos de profil, endpoints et exemples | Développeurs frontend/backend |

---

## 🗺️ Plan de Lecture Recommandé

### Pour un Nouveau Développeur

1. **[GETTING_STARTED.md](GETTING_STARTED.md)** _(5 min)_
   - Comprendre le projet
   - Vue d'ensemble des fonctionnalités

2. **[INSTALL.md](INSTALL.md)** _(10 min)_
   - Installer le backend
   - Vérifier que tout fonctionne

3. **[README.md](README.md)** _(20 min)_
   - Découvrir tous les endpoints
   - Comprendre les paramètres

4. **[API_EXAMPLES.http](API_EXAMPLES.http)** _(10 min)_
   - Tester l'API
   - Voir des exemples concrets

5. **[FRONTEND_INTEGRATION.md](FRONTEND_INTEGRATION.md)** _(30 min)_
   - Connecter le frontend
   - Implémenter l'authentification
   - Gérer le WebSocket

### Pour un Lead Technique

1. **[GETTING_STARTED.md](GETTING_STARTED.md)** _(5 min)_
   - Vue d'ensemble rapide

2. **[ARCHITECTURE.md](ARCHITECTURE.md)** _(15 min)_
   - Comprendre l'architecture
   - Sécurité et performance
   - Flux de données

3. **[README.md](README.md)** _(10 min)_
   - Parcourir l'API
   - Modèle de données

### Pour un Développeur Frontend

1. **[QUICKSTART.md](QUICKSTART.md)** _(5 min)_
   - Installation rapide

2. **[README.md](README.md)** _(15 min)_
   - Endpoints disponibles
   - Format des données

3. **[FRONTEND_INTEGRATION.md](FRONTEND_INTEGRATION.md)** _(45 min)_
   - Configuration axios
   - WebSocket client
   - Gestion d'authentification
   - Exemples de code React

4. **[API_EXAMPLES.http](API_EXAMPLES.http)** _(10 min)_
   - Tester les endpoints
   - Comprendre les réponses

---

## 📋 Référence Rapide

### Commandes Essentielles

```bash
# Installation
./setup.sh                  # Installation complète automatique

# Développement
npm run dev                 # Démarrer le serveur
npm run prisma:studio       # Interface DB

# Base de données
npm run prisma:seed         # Recharger données test
npm run db:setup            # Setup complet DB

# Docker
npm run docker:up           # Démarrer PostgreSQL
npm run docker:down         # Arrêter PostgreSQL
```

### Endpoints Principaux

```
POST   /api/auth/register
POST   /api/auth/login
GET    /api/checkins
POST   /api/checkins
GET    /api/events
POST   /api/events
GET    /api/users/me
```

### Comptes de Test

```
Email: alice@emlyon.com
Mot de passe: password123

(bob, charlie, diana, ethan également disponibles)
```

---

## 🔍 Index par Sujet

### Authentication & Sécurité
- [README.md](README.md#authentication) - Endpoints d'authentification
- [ARCHITECTURE.md](ARCHITECTURE.md#sécurité) - Sécurité JWT, hashing
- [FRONTEND_INTEGRATION.md](FRONTEND_INTEGRATION.md#gestion-de-lauthentification) - Intégration auth frontend

### Check-Ins & Géolocalisation
- [README.md](README.md#check-ins) - API Check-ins
- [ARCHITECTURE.md](ARCHITECTURE.md#check-ins-temps-réel) - Flux temps réel
- [FRONTEND_INTEGRATION.md](FRONTEND_INTEGRATION.md#exemple-créer-un-check-in) - Utilisation frontend

### Événements
- [README.md](README.md#events) - API Événements
- [ARCHITECTURE.md](ARCHITECTURE.md#événements) - Logique métier
- [FRONTEND_INTEGRATION.md](FRONTEND_INTEGRATION.md#exemple-dashboard-avec-websocket) - Affichage frontend

### WebSocket
- [README.md](README.md#websocket) - Connexion WebSocket
- [ARCHITECTURE.md](ARCHITECTURE.md#websocket) - Architecture WebSocket
- [FRONTEND_INTEGRATION.md](FRONTEND_INTEGRATION.md#websocket-client) - Client WebSocket React

### Base de Données
- [README.md](README.md#structure-de-la-base-de-données) - Schéma DB
- [ARCHITECTURE.md](ARCHITECTURE.md#base-de-données) - Relations, index
- [INSTALL.md](INSTALL.md#base-de-données) - Configuration DB

### Déploiement
- [README.md](README.md#scripts-npm) - Scripts disponibles
- [ARCHITECTURE.md](ARCHITECTURE.md#déploiement) - Production build
- [FRONTEND_INTEGRATION.md](FRONTEND_INTEGRATION.md#production) - Config production

### Dépannage
- [INSTALL.md](INSTALL.md#problèmes-courants) - Solutions aux problèmes
- [QUICKSTART.md](QUICKSTART.md#dépannage) - Debugging rapide

---

## 💡 Conseils de Navigation

### Dans VS Code
- Utilisez `Cmd+P` (Mac) ou `Ctrl+P` (Windows/Linux) pour ouvrir rapidement un fichier
- Cliquez sur les liens dans les fichiers Markdown pour naviguer
- Installez l'extension "Markdown All in One" pour une meilleure expérience

### Recherche
- Utilisez `Cmd+F` dans un document pour chercher
- Utilisez `Cmd+Shift+F` pour chercher dans tous les fichiers

### Lecture
- Les 🔗 indiquent des liens cliquables
- Les 📚 indiquent de la documentation complémentaire
- Les ⚠️ indiquent des points importants

---

## 🆘 Besoin d'Aide ?

1. **Consultez d'abord** [INSTALL.md](INSTALL.md#problèmes-courants) pour les problèmes d'installation
2. **Vérifiez** [QUICKSTART.md](QUICKSTART.md#dépannage) pour le debugging
3. **Lisez** [README.md](README.md) pour les questions sur l'API
4. **Explorez** la DB avec `npm run prisma:studio`

---

## 🔄 Mises à Jour

Cette documentation est mise à jour régulièrement. Vérifiez les dates de modification dans Git.

---

**Bon développement ! 🚀**

Si vous trouvez une erreur ou souhaitez améliorer cette documentation, n'hésitez pas à contribuer !
