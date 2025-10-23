# Étapes d'Installation et Démarrage

## ⚡ Installation Ultra-Rapide

```bash
cd backend
./setup.sh
npm run dev
```

✅ C'est tout ! Le backend est prêt sur http://localhost:3001

---

## 📋 Installation Manuelle (si nécessaire)

### 1. Installer les dépendances

```bash
npm install
```

### 2. Démarrer PostgreSQL

```bash
npm run docker:up
```

Ou si vous avez PostgreSQL installé localement, créez la base :
```bash
createdb emlyon_connect
```

### 3. Configurer l'environnement

```bash
cp .env.example .env
```

Modifiez `.env` avec vos paramètres :
```env
DATABASE_URL="postgresql://emlyon:emlyon2025@localhost:5432/emlyon_connect?schema=public"
JWT_SECRET="votre_secret_securise"
PORT=3001
```

### 4. Initialiser la base de données

```bash
npm run db:setup
```

Cette commande va :
- Générer le client Prisma
- Exécuter les migrations
- Ajouter les données de test

### 5. Démarrer le serveur

```bash
npm run dev
```

Le serveur démarre sur **http://localhost:3001** 🎉

---

## ✅ Vérification

### 1. Health Check

```bash
curl http://localhost:3001/api/health
```

Devrait retourner :
```json
{
  "status": "ok",
  "timestamp": "2024-10-22T..."
}
```

### 2. Test de connexion

```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "alice@emlyon.com",
    "password": "password123"
  }'
```

Devrait retourner un token JWT et les infos utilisateur.

### 3. Ouvrir Prisma Studio

```bash
npm run prisma:studio
```

Visualisez vos données sur http://localhost:5555

---

## 🔧 Commandes Utiles

```bash
# Développement
npm run dev              # Serveur avec hot-reload

# Base de données  
npm run prisma:studio    # Interface DB
npm run prisma:seed      # Recharger données test
npm run prisma:migrate   # Créer migration
npm run db:setup         # Setup complet

# Docker
npm run docker:up        # Démarrer PostgreSQL
npm run docker:down      # Arrêter PostgreSQL
docker ps               # Voir containers actifs
docker logs emlyon_connect_db  # Logs PostgreSQL

# Production
npm run build           # Compiler
npm start              # Lancer en prod
```

---

## 🐛 Problèmes Courants

### ❌ Erreur : "Cannot connect to database"

**Solution :** Vérifier que PostgreSQL est démarré
```bash
docker ps  # Doit afficher emlyon_connect_db
npm run docker:up  # Si non démarré
```

### ❌ Erreur : "Port 3001 already in use"

**Solution 1 :** Tuer le processus
```bash
lsof -ti:3001 | xargs kill -9
```

**Solution 2 :** Changer le port dans `.env`
```env
PORT=3002
```

### ❌ Erreur : "Prisma Client not generated"

**Solution :**
```bash
npm run prisma:generate
```

### ❌ Tables n'existent pas

**Solution :**
```bash
npm run prisma:migrate
```

### ❌ Reset complet nécessaire

```bash
npm run docker:down
docker volume rm emlyon-connect-backend_postgres_data
npm run docker:up
sleep 5
npm run db:setup
```

---

## 📚 Prochaines Étapes

1. ✅ **Backend prêt** - Le serveur tourne sur http://localhost:3001

2. 🔗 **Connecter le frontend**
   - Lisez [FRONTEND_INTEGRATION.md](FRONTEND_INTEGRATION.md)
   - Configurez axios et WebSocket
   - Testez les appels API

3. 🧪 **Tester l'API**
   - Utilisez [API_EXAMPLES.http](API_EXAMPLES.http)
   - Installez l'extension REST Client pour VS Code
   - Ou utilisez Postman/Insomnia

4. 📖 **Documentation**
   - [README.md](README.md) - Documentation API complète
   - [ARCHITECTURE.md](ARCHITECTURE.md) - Architecture technique
   - [QUICKSTART.md](QUICKSTART.md) - Guide rapide

---

## 💡 Conseils

### Développement

- Utilisez `npm run dev` pour le hot-reload automatique
- Les logs SQL sont activés en mode développement
- Prisma Studio est votre ami pour voir/modifier la DB

### Base de Données

- Les check-ins de plus de 24h sont automatiquement filtrés
- Les événements sont triés par date
- La suppression d'un utilisateur supprime ses check-ins/événements (CASCADE)

### WebSocket

- Les clients doivent envoyer le JWT token dans l'URL
- Les mises à jour sont automatiques (pas besoin de polling)
- Reconnexion automatique en cas de déconnexion

---

## 🎯 Checklist de Démarrage

- [ ] PostgreSQL démarré (`docker ps`)
- [ ] Dépendances installées (`node_modules` existe)
- [ ] `.env` configuré
- [ ] Migrations exécutées
- [ ] Données de test chargées
- [ ] Serveur accessible sur http://localhost:3001
- [ ] Health check OK
- [ ] Connexion test réussie
- [ ] Prisma Studio accessible

---

**🎉 Vous êtes prêt ! Le backend emlyon connect est opérationnel.**

Pour toute question, consultez la documentation ou ouvrez une issue.
