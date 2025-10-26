# ✅ Checklist de déploiement PWA - emlyon Connect

## 📦 Phase 1 : Setup Initial (5 min)

- [x] ✅ Installation des dépendances npm
  ```bash
  npm install
  ```

- [ ] 🔐 Créer le fichier `.env`
  ```bash
  cp .env.example .env
  # Puis édite .env et ajoute ta clé GEMINI_API_KEY
  ```

- [ ] 🎨 Générer les icônes PWA
  - Va sur https://www.pwabuilder.com/imageGenerator
  - Upload ton logo emlyon (512x512px)
  - Télécharge le pack
  - Place dans `/public/icons/` :
    - [ ] icon-72x72.png
    - [ ] icon-96x96.png
    - [ ] icon-128x128.png
    - [ ] icon-144x144.png
    - [ ] icon-152x152.png
    - [ ] icon-192x192.png
    - [ ] icon-384x384.png
    - [ ] icon-512x512.png

---

## 🗄️ Phase 2 : Configuration Supabase (10 min)

### SQL Migration

- [ ] Ouvrir Supabase Dashboard
- [ ] Aller dans **SQL Editor**
- [ ] Créer une **New Query**
- [ ] Copier le contenu de `supabase-migrations.sql`
- [ ] Cliquer sur **Run**
- [ ] Vérifier dans **Table Editor** :
  - [ ] Table `PushSubscription` existe
  - [ ] Table `Event` a la colonne `category`

### Supabase CLI (pour Edge Functions)

- [ ] Installer Supabase CLI
  ```bash
  brew install supabase/tap/supabase
  # Ou: npm install -g supabase
  ```

- [ ] Login
  ```bash
  supabase login
  ```

- [ ] Récupérer le Project ID
  - Supabase Dashboard > Settings > General
  - Copier "Reference ID"

- [ ] Link le projet
  ```bash
  supabase link --project-ref TON_PROJECT_ID
  ```

---

## 🔔 Phase 3 : Edge Function (15 min)

- [ ] Créer la fonction
  ```bash
  supabase functions new send-push-notification
  ```

- [ ] Copier le code
  - Ouvrir `supabase-edge-function-send-push-notification.ts`
  - Copier tout le contenu
  - Coller dans `supabase/functions/send-push-notification/index.ts`

- [ ] Définir les secrets
  ```bash
  supabase secrets set VAPID_PRIVATE_KEY="SKcwHLaF3ERLz_aEuSCDOdUDOZgTl6d2EZDV4gkgB_k"
  supabase secrets set VAPID_PUBLIC_KEY="BIHal8ULGn4aX67TZqRuVrjBN3FSp-CrpFKG-JooRaZLHw_QQomaTmXb_GevuH7KbwtJeHsKbIkfZa2_5dlhbIw"
  ```

- [ ] Déployer
  ```bash
  supabase functions deploy send-push-notification
  ```

- [ ] Vérifier le déploiement
  - Supabase Dashboard > Edge Functions
  - Voir `send-push-notification` listée

---

## 🧪 Phase 4 : Tests locaux (5 min)

- [ ] Build du projet
  ```bash
  npm run build
  ```
  - ✅ Aucune erreur ?

- [ ] Lancer en dev
  ```bash
  npm run dev
  ```
  - ✅ App se lance sur http://localhost:3000 ?

- [ ] Tester l'installation PWA (Desktop Chrome)
  - [ ] Ouvrir l'app
  - [ ] Chercher l'icône ⊕ dans la barre d'adresse
  - [ ] Cliquer "Installer"
  - [ ] L'app s'ouvre en fenêtre standalone ?

- [ ] Tester les notifications
  - [ ] Se connecter / créer un compte
  - [ ] Aller dans "Mon Profil"
  - [ ] Section "Notifications push" visible ?
  - [ ] Cliquer sur "Activer"
  - [ ] Accepter les permissions navigateur
  - [ ] Notification de test reçue "Les notifications sont activées ! 🎉" ?

- [ ] Tester notification événement
  - [ ] Créer un événement (Événements > + Créer)
  - [ ] Avec un 2ème compte, vérifier réception notification
  - [ ] Participer à l'événement
  - [ ] Dans 2h, vérifier réception du rappel ⏰

---

## 🚀 Phase 5 : Déploiement Production (10 min)

### Option A : Vercel (RECOMMANDÉ)

- [ ] Installer Vercel CLI
  ```bash
  npm i -g vercel
  ```

- [ ] Déployer
  ```bash
  vercel
  ```

- [ ] Configuration Vercel Dashboard
  - [ ] Ajouter variable d'environnement :
    - Key: `VITE_VAPID_PUBLIC_KEY`
    - Value: `BIHal8ULGn4aX67TZqRuVrjBN3FSp-CrpFKG-JooRaZLHw_QQomaTmXb_GevuH7KbwtJeHsKbIkfZa2_5dlhbIw`

- [ ] Redéployer après config
  ```bash
  vercel --prod
  ```

### Option B : Netlify

- [ ] Installer Netlify CLI
  ```bash
  npm i -g netlify-cli
  ```

- [ ] Déployer
  ```bash
  netlify deploy --prod
  ```

- [ ] Build settings :
  - Build command: `npm run build`
  - Publish directory: `dist`

---

## ✅ Phase 6 : Validation finale

### Desktop (Chrome/Edge)

- [ ] Ouvrir l'URL de production
- [ ] Installer la PWA (icône ⊕)
- [ ] Vérifier mode standalone
- [ ] Activer les notifications
- [ ] Créer un événement
- [ ] Vérifier réception notification

### Mobile Android

- [ ] Ouvrir dans Chrome
- [ ] Menu > "Ajouter à l'écran d'accueil"
- [ ] Lancer depuis l'icône
- [ ] Activer les notifications
- [ ] Tester événements

### Mobile iOS (16.4+)

- [ ] Ouvrir dans Safari
- [ ] Partager > "Sur l'écran d'accueil"
- [ ] Lancer depuis l'icône
- [ ] Activer les notifications (fonctionne QUE si installée)
- [ ] Tester événements

---

## 🎯 Critères de succès

- ✅ App installable sur Desktop
- ✅ App installable sur Android
- ✅ App installable sur iOS
- ✅ Notifications fonctionnent Desktop
- ✅ Notifications fonctionnent Android
- ✅ Notifications fonctionnent iOS (si installée, iOS 16.4+)
- ✅ Mode offline fonctionne (carte OSM en cache)
- ✅ Création événement envoie notification à tous
- ✅ Participation événement planifie rappel 2h avant
- ✅ Service Worker actif et fonctionnel

---

## 📊 Métriques attendues

| Métrique | Valeur cible |
|----------|--------------|
| Lighthouse PWA Score | > 90 |
| Installation réussie | Desktop + Mobile |
| Délai notification | < 5 secondes |
| Cache offline | Cartes OSM + Assets |
| Taille app | < 500 KB (gzip) |

---

## 🐛 Troubleshooting rapide

### ❌ "Service Worker registration failed"
→ Vérifie que tu es en HTTPS (ou localhost)

### ❌ "Notification permission denied"
→ Réinitialise les permissions navigateur (Settings > Site Settings)

### ❌ "Edge Function not found"
→ Vérifie le déploiement : `supabase functions list`

### ❌ "VAPID key missing"
→ Vérifie le fichier `.env` et les secrets Supabase

### ❌ "Icons not found"
→ Vérifie que les 8 icônes sont dans `public/icons/`

---

## 📞 Support

En cas de problème, consulte :
- `PWA_DEPLOYMENT_GUIDE.md` - Guide détaillé
- `PWA_IMPLEMENTATION_SUMMARY.md` - Résumé technique
- `QUICK_START.md` - Démarrage rapide

---

**Temps estimé total** : 45 minutes - 1 heure

Bonne chance ! 🚀🎉
