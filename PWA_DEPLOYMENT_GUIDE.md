# 🚀 Guide de Déploiement PWA - emlyon Connect

## ✅ Ce qui a été fait

### Phase 1 : Configuration PWA ✅
- ✅ Dépendances installées (`vite-plugin-pwa`, `workbox-window`)
- ✅ Manifest.json créé avec métadonnées app
- ✅ Configuration Vite avec plugin PWA
- ✅ Meta tags PWA ajoutés dans index.html
- ✅ Service Worker créé (`public/sw.js`)

### Phase 2 : Push Notifications ✅
- ✅ Clés VAPID générées
- ✅ Service de notifications créé (`notificationService.ts`)
- ✅ Composant UI de gestion des notifications (`NotificationPrompt.tsx`)
- ✅ Script SQL pour table PushSubscription prêt

### Phase 3 : Event Notifications ✅
- ✅ Service de notifications d'événements créé (`eventNotificationService.ts`)
- ✅ Intégration dans `App.tsx` pour nouvel événement
- ✅ Intégration dans `App.tsx` pour rappels 2h avant
- ✅ Composant ajouté dans le profil utilisateur

### Phase 4 : Edge Functions ✅
- ✅ Code Edge Function créé (`broadcast-event`)
- ✅ Documentation de déploiement

---

## 📋 Checklist des actions à faire MAINTENANT

### 1. Générer les icônes PWA 🎨

**Option A : Générateur en ligne (RECOMMANDÉ)**
1. Va sur https://www.pwabuilder.com/imageGenerator
2. Upload ton logo emlyon (512x512px minimum)
3. Télécharge le pack d'icônes
4. Copie les fichiers dans `/public/icons/`

**Option B : Avec ImageMagick**
```bash
cd public/icons
# À partir d'un logo source
convert logo.png -resize 72x72 icon-72x72.png
convert logo.png -resize 96x96 icon-96x96.png
convert logo.png -resize 128x128 icon-128x128.png
convert logo.png -resize 144x144 icon-144x144.png
convert logo.png -resize 152x152 icon-152x152.png
convert logo.png -resize 192x192 icon-192x192.png
convert logo.png -resize 384x384 icon-384x384.png
convert logo.png -resize 512x512 icon-512x512.png
```

### 2. Créer le fichier .env 🔐

Crée un fichier `.env` à la racine (copie depuis `.env.example`) :

```bash
cp .env.example .env
```

Puis édite `.env` et ajoute tes vraies clés :
```env
GEMINI_API_KEY=ta_clé_gemini

# Clés VAPID (déjà générées)
VITE_VAPID_PUBLIC_KEY=BIHal8ULGn4aX67TZqRuVrjBN3FSp-CrpFKG-JooRaZLHw_QQomaTmXb_GevuH7KbwtJeHsKbIkfZa2_5dlhbIw
VAPID_PRIVATE_KEY=SKcwHLaF3ERLz_aEuSCDOdUDOZgTl6d2EZDV4gkgB_k
```

⚠️ **IMPORTANT** : Ne JAMAIS commit le fichier `.env` sur Git !

### 3. Exécuter le script SQL sur Supabase 🗄️

1. Va sur **Supabase Dashboard** > **SQL Editor**
2. Clique sur **New Query**
3. Copie le contenu du fichier `supabase-migrations.sql`
4. Clique sur **Run**
5. Vérifie dans **Table Editor** que les tables sont créées :
   - ✅ `PushSubscription`
   - ✅ Colonne `category` dans `Event`

### 4. Installer et configurer Supabase CLI 🛠️

```bash
# Installation (MacOS)
brew install supabase/tap/supabase

# Ou avec npm
npm install -g supabase

# Login
supabase login

# Link au projet (récupère ton Project ID depuis Dashboard > Settings)
supabase link --project-ref TON_PROJECT_ID
```

### 5. Créer et déployer l'Edge Function 📡

```bash
# Générer la fonction (déjà présente dans le repo, mais garde la commande au cas où)
supabase functions new broadcast-event

# Définir les secrets requis
supabase secrets set VAPID_PRIVATE_KEY="SKcwHLaF3ERLz_aEuSCDOdUDOZgTl6d2EZDV4gkgB_k"
supabase secrets set VAPID_PUBLIC_KEY="BIHal8ULGn4aX67TZqRuVrjBN3FSp-CrpFKG-JooRaZLHw_QQomaTmXb_GevuH7KbwtJeHsKbIkfZa2_5dlhbIw"
supabase secrets set VAPID_CONTACT_EMAIL="mailto:toi@em-lyon.com"
# Service Role Key (récupère-la dans Supabase > Settings > API, ne jamais la exposer publiquement)
supabase secrets set SUPABASE_SERVICE_ROLE_KEY="ton_service_role_key"

# Déployer la fonction
supabase functions deploy broadcast-event
```

> ℹ️ Le code de la fonction se trouve dans `supabase/functions/broadcast-event/index.ts`. Il se charge de récupérer toutes les souscriptions push et d’envoyer la notification via les clés VAPID.

### 6. Build et tester l'application 🏗️

```bash
# Build de production
npm run build

# Preview du build
npm run preview

# Ou démarrer en dev
npm run dev
```

### 7. Tester les notifications 📲

1. Ouvre l'app dans un navigateur (Chrome/Edge recommandés)
2. Login ou crée un compte
3. Va dans **Mon Profil**
4. Clique sur **Activer** les notifications
5. Accepte les permissions
6. Tu devrais recevoir une notification de test !

### 8. Tester l'installation PWA 📱

#### Sur Desktop (Chrome/Edge)
1. Ouvre l'app
2. Cherche l'icône d'installation dans la barre d'adresse (⊕)
3. Clique sur "Installer"
4. L'app s'ouvre en fenêtre standalone !

#### Sur Android
1. Ouvre l'app dans Chrome
2. Menu (⋮) > "Ajouter à l'écran d'accueil"
3. L'icône apparaît sur l'écran d'accueil
4. Lance-la : mode standalone !

#### Sur iOS (16.4+)
1. Ouvre l'app dans Safari
2. Bouton Partager > "Sur l'écran d'accueil"
3. L'icône apparaît
4. Lance-la : mode standalone !
5. ⚠️ Les notifications push ne fonctionnent QUE si installée

---

## 🧪 Tests des fonctionnalités

### Test 1 : Notification nouvel événement
1. Utilisateur A active les notifications
2. Utilisateur B crée un événement
3. Utilisateur A doit recevoir une notification "🎉 Nouvel événement !"

### Test 2 : Rappel événement
1. Crée un événement dans 2h15
2. Participe à l'événement
3. Attends (ou change l'heure système pour simuler)
4. Dans 15 min, tu devrais recevoir "⏰ Rappel événement"

⚠️ **Note** : Les rappels avec `setTimeout` ne fonctionnent que si l'app reste ouverte. Pour la production, il faut utiliser Supabase Edge Functions avec des cron jobs.

---

## 🚀 Déploiement en production

### Option 1 : Vercel (RECOMMANDÉ)

```bash
# Installer Vercel CLI
npm i -g vercel

# Déployer
vercel

# Configuration :
# - Framework Preset: Vite
# - Build Command: npm run build
# - Output Directory: dist
# - Install Command: npm install

# Ajouter les variables d'environnement sur Vercel Dashboard
# VITE_VAPID_PUBLIC_KEY
```

### Option 2 : Netlify

```bash
# Installer Netlify CLI
npm i -g netlify-cli

# Déployer
netlify deploy --prod

# Build settings:
# - Build command: npm run build
# - Publish directory: dist
```

### Option 3 : GitHub Pages

```bash
# Modifier vite.config.ts, ajouter:
# base: '/emlyon-connect/'

# Build
npm run build

# Deploy avec gh-pages
npm i -D gh-pages
npx gh-pages -d dist
```

---

## ⚠️ Limitations connues

### iOS
- ✅ PWA installable (Safari)
- ✅ Mode standalone
- ⚠️ Notifications push **uniquement si installée** (iOS 16.4+)
- ❌ Pas de background location tracking

### Android
- ✅ PWA installable (Chrome)
- ✅ Mode standalone
- ✅ Notifications push
- ❌ Pas de background location tracking (nécessite app native)

### Desktop
- ✅ PWA installable (Chrome/Edge)
- ✅ Mode standalone
- ✅ Notifications push
- ✅ Meilleure expérience globale

---

## 🐛 Troubleshooting

### Les notifications ne fonctionnent pas
1. Vérifie que HTTPS est activé (obligatoire)
2. Vérifie les permissions du navigateur
3. Vérifie que l'Edge Function est déployée
4. Vérifie les logs : `supabase functions logs broadcast-event`

### L'app ne s'installe pas
1. Vérifie que le manifest.json est accessible
2. Vérifie que les icônes existent
3. Vérifie que HTTPS est activé
4. Ouvre DevTools > Application > Manifest

### Service Worker ne se met pas à jour
1. Ouvre DevTools > Application > Service Workers
2. Coche "Update on reload"
3. Ou clique "Unregister" puis rafraîchis

---

## 📚 Ressources

- [PWA Builder](https://www.pwabuilder.com/)
- [Supabase Edge Functions](https://supabase.com/docs/guides/functions)
- [Web Push Protocol](https://web.dev/push-notifications-overview/)
- [Vite PWA Plugin](https://vite-pwa-org.netlify.app/)

---

## 🎉 C'est prêt !

Ton app emlyon Connect est maintenant une PWA complète avec :
- ✅ Installation sur tous les appareils
- ✅ Mode offline (cache)
- ✅ Notifications push événements
- ✅ Rappels 2h avant événements
- ✅ Interface native

Félicitations ! 🚀
