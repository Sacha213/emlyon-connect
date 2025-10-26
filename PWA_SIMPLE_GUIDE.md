# 🚀 Guide PWA Simplifié - emlyon Connect

## ✅ Ce qui fonctionne (sans serveur / Edge Functions)

### 1. 📱 Installation PWA
- ✅ App installable sur mobile (iOS, Android) et desktop
- ✅ Fonctionne hors-ligne (cache des cartes OSM)
- ✅ Icône sur l'écran d'accueil
- ✅ Mode standalone (sans navigateur)

### 2. 🔔 Notifications locales
- ✅ **Notification quand tu crées un événement** - Confirmation instantanée
- ✅ **Notification quand tu t'inscris à un événement** - Confirmation d'inscription
- ✅ **Rappel 2h avant un événement** - Si l'app est ouverte ou en arrière-plan (PWA)

### 3. ⚠️ Limitations acceptées (sans serveur)
- ❌ Les **autres utilisateurs** ne reçoivent PAS de notification quand tu crées un événement
- ❌ Le rappel 2h avant ne fonctionne que si l'app est **ouverte en arrière-plan**
- ❌ Pas de notifications push "serveur" multi-utilisateurs

> 💡 **Note** : Pour 95% des cas d'usage étudiants, les notifications locales suffisent !

---

## 🛠️ Déploiement (3 étapes - 10 min)

### Étape 1 : Icônes PWA ✅
**Tu l'as déjà fait !** Les icônes sont dans `/public/icons/`

### Étape 2 : Créer la table PushSubscription (2 min)

1. Va sur **Supabase Dashboard** > **SQL Editor**
2. Crée une **New Query**
3. Copie-colle ce SQL :

```sql
-- Table pour stocker les souscriptions push (optionnel, pour future extension)
CREATE TABLE IF NOT EXISTS "PushSubscription" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES "User"(id) ON DELETE CASCADE,
  endpoint TEXT NOT NULL UNIQUE,
  keys JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT unique_user_subscription UNIQUE(user_id)
);

CREATE INDEX IF NOT EXISTS idx_push_subscription_user ON "PushSubscription"(user_id);

-- Row Level Security
ALTER TABLE "PushSubscription" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own subscriptions"
ON "PushSubscription" FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own subscriptions"
ON "PushSubscription" FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own subscriptions"
ON "PushSubscription" FOR DELETE USING (auth.uid() = user_id);

-- Ajouter la colonne category à Event (si pas déjà fait)
ALTER TABLE "Event" ADD COLUMN IF NOT EXISTS category TEXT DEFAULT '🎉 Autre';
```

4. Clique sur **Run** (ou Ctrl/Cmd + Enter)
5. Vérifie dans **Table Editor** que la table `PushSubscription` existe

### Étape 3 : Build et déployer (5 min)

```bash
# Build de production
npm run build

# Déployer sur Vercel (recommandé)
npx vercel --prod

# OU sur Netlify
npx netlify deploy --prod --dir=dist
```

---

## 🧪 Tester l'application

### Test 1 : Installation PWA

**Desktop (Chrome/Edge)** :
1. Ouvre l'app
2. Cherche l'icône ⊕ dans la barre d'adresse
3. Clique sur "Installer"
4. ✅ L'app s'ouvre en fenêtre standalone

**Android (Chrome)** :
1. Ouvre l'app
2. Menu (⋮) > "Ajouter à l'écran d'accueil"
3. ✅ Icône sur l'écran d'accueil

**iOS (Safari)** :
1. Ouvre l'app
2. Bouton Partager > "Sur l'écran d'accueil"
3. ✅ Icône sur l'écran d'accueil

### Test 2 : Notifications locales

1. **Activer les notifications** :
   - Login ou crée un compte
   - Va dans "Mon Profil"
   - Clique sur **"Activer"** dans la section Notifications push
   - Accepte les permissions du navigateur
   - ✅ Tu devrais voir "Les notifications sont activées ! 🎉"

2. **Tester création d'événement** :
   - Va dans "Événements"
   - Clique sur "+ Créer un événement"
   - Remplis le formulaire et crée
   - ✅ Notification "🎉 Événement créé !"

3. **Tester rappel d'événement** :
   - Crée un événement dans 2h15 (ou plus)
   - Clique sur "Participer"
   - ✅ Dans 15 minutes, tu recevras "⏰ Rappel événement"
   - ⚠️ L'app doit rester ouverte (ou en arrière-plan PWA)

### Test 3 : Mode offline

1. Ouvre l'app
2. **Coupe ta connexion Internet**
3. Rafraîchis la page
4. ✅ La carte et l'app fonctionnent toujours !
5. ✅ Les tuiles OSM sont en cache

---

## 📱 Compatibilité

| Feature | Desktop | Android | iOS 16.4+ |
|---------|---------|---------|-----------|
| Installation PWA | ✅ | ✅ | ✅ |
| Mode Standalone | ✅ | ✅ | ✅ |
| Notifications locales | ✅ | ✅ | ✅ |
| Notifications en arrière-plan | ✅ | ✅ | ⚠️ Limité |
| Cache Offline | ✅ | ✅ | ✅ |

---

## 🔮 Pour aller plus loin (optionnel)

Si plus tard tu veux des **vraies notifications serveur** (notifier tous les utilisateurs) :

### Option 1 : Edge Functions Supabase
- Besoin : Supabase Pro (25$/mois)
- Avantage : Intégration native
- Code : Déjà préparé dans les fichiers supprimés

### Option 2 : Serveur Node.js simple
- Gratuit : Railway, Render, Fly.io
- Avantage : Contrôle total
- Complexité : Moyenne

### Option 3 : Firebase Cloud Messaging
- Gratuit : Quota généreux
- Avantage : Conçu pour ça
- Complexité : Configuration Firebase

---

## ✨ C'est prêt !

Ton app emlyon Connect est maintenant une **PWA fonctionnelle** avec :

- 📱 Installation sur tous les appareils
- 🔔 Notifications locales pour tes événements
- 📶 Mode offline
- ⚡ Service Worker actif
- 🎨 Expérience native

**Prochaine étape** : `npm run build` puis déploie sur Vercel/Netlify ! 🚀

---

## 🐛 Problèmes courants

### ❌ "Service Worker registration failed"
→ Vérifie que tu es en **HTTPS** (ou localhost)

### ❌ "Notification permission denied"
→ Réinitialise les permissions : Settings > Site Settings > Notifications

### ❌ "Icons not loading"
→ Vérifie que les 8 icônes sont bien dans `/public/icons/`
→ Vérifie les noms : `icon-72x72.png`, `icon-96x96.png`, etc.

### ❌ Les notifications ne s'affichent pas
→ Vérifie que tu as accepté les permissions
→ Ouvre DevTools > Console pour voir les logs

---

**Bon déploiement ! 🎉**
