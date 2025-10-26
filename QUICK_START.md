# ⚡ Quick Start - emlyon Connect PWA

## 🚀 Démarrage rapide (5 min)

### 1. Installation des dépendances

```bash
npm install
```

### 2. Configuration

Crée un fichier `.env` à la racine :

```bash
cp .env.example .env
```

Édite `.env` et ajoute ta clé Gemini (les clés VAPID sont déjà remplies).

### 3. Générer les icônes PWA

**Option rapide** : Va sur https://www.pwabuilder.com/imageGenerator
- Upload ton logo
- Télécharge les icônes
- Place-les dans `public/icons/`

### 4. Configuration Supabase

**Exécuter le SQL** :
1. Ouvre Supabase Dashboard > SQL Editor
2. Copie le contenu de `supabase-migrations.sql`
3. Clique sur "Run"

### 5. Lancer en développement

```bash
npm run dev
```

L'app est accessible sur http://localhost:3000

---

## 🔔 Activer les notifications (optionnel)

Pour tester les notifications push, tu dois déployer l'Edge Function :

```bash
# Installer Supabase CLI
brew install supabase/tap/supabase

# Login
supabase login

# Link projet (récupère ton PROJECT_ID sur Supabase Dashboard)
supabase link --project-ref TON_PROJECT_ID

# Créer la fonction
supabase functions new send-push-notification

# Copie le code de supabase-edge-function-send-push-notification.ts
# dans supabase/functions/send-push-notification/index.ts

# Set secrets
supabase secrets set VAPID_PRIVATE_KEY="SKcwHLaF3ERLz_aEuSCDOdUDOZgTl6d2EZDV4gkgB_k"

# Deploy
supabase functions deploy send-push-notification
```

---

## 📖 Documentation complète

- **Guide complet** : `PWA_DEPLOYMENT_GUIDE.md` (tout ce qu'il faut savoir)
- **Résumé implémentation** : `PWA_IMPLEMENTATION_SUMMARY.md` (ce qui a été fait)
- **Setup Edge Functions** : `EDGE_FUNCTIONS_SETUP.md` (déploiement serveur)

---

## ✅ Checklist de déploiement

- [ ] `npm install` exécuté
- [ ] `.env` créé avec les bonnes clés
- [ ] Icônes PWA générées dans `public/icons/`
- [ ] Script SQL exécuté sur Supabase
- [ ] Edge Function déployée (optionnel pour notifications)
- [ ] `npm run build` fonctionne sans erreur
- [ ] Testé en local avec `npm run dev`

---

## 🎯 Fonctionnalités principales

- 🗺️ **Carte en temps réel** avec check-ins des étudiants
- 📅 **Événements** avec catégories et gestion de participation
- 💬 **Feedback** pour améliorer l'app
- 👻 **Mode fantôme** pour se cacher des autres
- 📱 **PWA installable** sur tous les appareils
- 🔔 **Notifications push** pour nouveaux événements et rappels

---

## 🐛 Problèmes courants

### Build échoue
```bash
rm -rf node_modules package-lock.json
npm install
```

### Service Worker ne se met pas à jour
- Ouvre DevTools > Application > Service Workers
- Coche "Update on reload"
- Rafraîchis la page

### Notifications ne fonctionnent pas
- Vérifie que tu es en HTTPS (localhost OK)
- Vérifie les permissions navigateur
- Vérifie que l'Edge Function est déployée

---

Bon développement ! 🚀
