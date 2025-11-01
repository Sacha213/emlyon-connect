# Migration Supabase - Étapes finales

## ✅ Ce qui a été fait

1. **Installation et configuration Supabase**
   - ✅ `@supabase/supabase-js` installé
   - ✅ `services/supabaseClient.ts` créé avec configuration
   - ✅ Types TypeScript pour la base de données

2. **Migration de l'authentification**
   - ✅ Supabase Auth configuré dans le dashboard
   - ✅ LoginScreen migré vers `supabase.auth.signInWithPassword`
   - ✅ RegistrationScreen migré vers `supabase.auth.signUp`
   - ✅ Session management avec `localStorage('supabase_session')`

3. **Migration des données**
   - ✅ `services/api.ts` créé avec toutes les fonctions Supabase
   - ✅ Check-ins : `getAllCheckIns`, `createCheckIn`, `deleteCheckIn`
   - ✅ Événements : `getAllEvents`, `createEvent`, `attendEvent`, `unattendEvent`, `deleteEvent`
   - ✅ Profil : `updateUserProfile` (name, promotion, avatarUrl)

4. **Migration de App.tsx**
   - ✅ Tous les fetch() remplacés par des appels Supabase
   - ✅ loadCheckIns/loadEvents utilisent `api.getAllCheckIns/getAllEvents`
   - ✅ addCheckIn utilise `api.createCheckIn`
   - ✅ createEvent utilise `api.createEvent`
   - ✅ toggleEventAttendance utilise `api.attendEvent/unattendEvent`
   - ✅ removeEvent utilise `api.deleteEvent`

5. **Polling temps réel configuré**
   - ✅ Rechargement automatique toutes les 5 secondes
   - ✅ Alternative à Realtime (qui nécessite early access)
   - ℹ️ Permet de voir les changements des autres utilisateurs quasi en temps réel

6. **Upload de photos migré**
   - ✅ AvatarUpload.tsx migré vers Supabase Storage
   - ✅ Upload dans le bucket 'avatars'

## 🔧 Étapes à faire MAINTENANT dans Supabase Dashboard

### 1. ~~Activer Realtime~~ (NON NÉCESSAIRE)

⚠️ **Realtime nécessite early access** → Remplacé par du **polling** (rechargement auto toutes les 5s)
- ✅ Code de polling déjà implémenté dans App.tsx
- ✅ Fonctionne sans configuration supplémentaire

### 2. Créer le bucket Storage (✅ FAIT)

1. ✅ Bucket `avatars` créé en mode public

### 3. Ajouter les colonnes de sondage pour les événements (⚠️ À faire si ce n'est pas déjà le cas)

Dans le SQL Editor de Supabase, exécute le bloc « Ajouter les colonnes pour les sondages d'événements » présent dans `supabase-migrations.sql`.

Ce bloc :
- Rend `Event.date` nullable (pour les événements en attente de vote)
- Ajoute `pollType`, `pollOptions`, `pollClosesAt` et `selectedPollOptionId`
- Crée une contrainte de vérification pour `pollType`

> Sans ces colonnes, la création d'un événement avec sondage renverra une erreur côté application.

### 3. Configurer Row Level Security (RECOMMANDÉ pour la production)

**IMPORTANT : D'abord, supprimer la colonne password de la table User**

La colonne `password` n'est plus nécessaire car Supabase Auth gère les mots de passe.

```sql
-- Supprimer la colonne password de la table User
ALTER TABLE "User" DROP COLUMN IF EXISTS password;

-- Rendre la colonne updatedAt nullable ou ajouter une valeur par défaut pour User
ALTER TABLE "User" ALTER COLUMN "updatedAt" DROP NOT NULL;
ALTER TABLE "User" ALTER COLUMN "updatedAt" SET DEFAULT NOW();

-- Rendre updatedAt nullable pour CheckIn et Event
ALTER TABLE "CheckIn" ALTER COLUMN "updatedAt" DROP NOT NULL;
ALTER TABLE "CheckIn" ALTER COLUMN "updatedAt" SET DEFAULT NOW();

ALTER TABLE "Event" ALTER COLUMN "updatedAt" DROP NOT NULL;
ALTER TABLE "Event" ALTER COLUMN "updatedAt" SET DEFAULT NOW();

-- Configurer l'auto-génération des IDs pour toutes les tables
ALTER TABLE "CheckIn" ALTER COLUMN id SET DEFAULT gen_random_uuid();
ALTER TABLE "Event" ALTER COLUMN id SET DEFAULT gen_random_uuid();
ALTER TABLE "EventAttendee" ALTER COLUMN id SET DEFAULT gen_random_uuid();
```

**Pour la table User :**
```sql
-- Permettre à chacun de lire tous les profils
CREATE POLICY "Les utilisateurs peuvent voir tous les profils"
ON "User"
FOR SELECT
USING (true);

-- Permettre à chacun de mettre à jour son propre profil
CREATE POLICY "Les utilisateurs peuvent mettre à jour leur propre profil"
ON "User"
FOR UPDATE
USING (auth.uid() = id);
```

**Pour la table CheckIn :**
```sql
-- Permettre à chacun de voir tous les check-ins
CREATE POLICY "Les utilisateurs peuvent voir tous les check-ins"
ON "CheckIn"
FOR SELECT
USING (true);

-- Permettre à chacun de créer son propre check-in
CREATE POLICY "Les utilisateurs peuvent créer leur propre check-in"
ON "CheckIn"
FOR INSERT
WITH CHECK (auth.uid() = "userId");

-- Permettre à chacun de supprimer son propre check-in
CREATE POLICY "Les utilisateurs peuvent supprimer leur propre check-in"
ON "CheckIn"
FOR DELETE
USING (auth.uid() = "userId");
```

**Pour la table Event :**
```sql
-- Permettre à chacun de voir tous les événements
CREATE POLICY "Les utilisateurs peuvent voir tous les événements"
ON "Event"
FOR SELECT
USING (true);

-- Permettre à chacun de créer un événement
CREATE POLICY "Les utilisateurs peuvent créer des événements"
ON "Event"
FOR INSERT
WITH CHECK (auth.uid() = "creatorId");

-- Permettre au créateur de supprimer son événement
CREATE POLICY "Les créateurs peuvent supprimer leurs événements"
ON "Event"
FOR DELETE
USING (auth.uid() = "creatorId");
```

**Pour la table EventAttendee :**
```sql
-- Permettre à chacun de voir tous les participants
CREATE POLICY "Les utilisateurs peuvent voir tous les participants"
ON "EventAttendee"
FOR SELECT
USING (true);

-- Permettre à chacun de s'inscrire à un événement
CREATE POLICY "Les utilisateurs peuvent s'inscrire aux événements"
ON "EventAttendee"
FOR INSERT
WITH CHECK (auth.uid() = "userId");

-- Permettre à chacun de se désinscrire d'un événement
CREATE POLICY "Les utilisateurs peuvent se désinscrire des événements"
ON "EventAttendee"
FOR DELETE
USING (auth.uid() = "userId");
```

**Pour le bucket Storage avatars :**
```sql
-- Permettre à chacun de lire les avatars
CREATE POLICY "Les avatars sont publics"
ON storage.objects FOR SELECT
USING (bucket_id = 'avatars');

-- Permettre à chacun d'uploader son avatar
CREATE POLICY "Les utilisateurs peuvent uploader leur avatar"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);
```

## 🧪 Tests à faire

1. **Test de l'authentification**
   - ✅ Créer un nouveau compte
   - ✅ Se connecter avec ce compte
   - ✅ Vérifier que la session persiste après rafraîchissement

2. **Test des check-ins**
   - ✅ Créer un check-in
   - ✅ Voir les check-ins des autres en temps réel
   - ✅ Supprimer son check-in

3. **Test des événements**
   - ✅ Créer un événement
   - ✅ S'inscrire à un événement
   - ✅ Se désinscrire d'un événement
   - ✅ Voir les mises à jour en temps réel
   - ✅ Supprimer son événement

4. **Test de l'upload photo**
   - ✅ Uploader une photo de profil
   - ✅ Vérifier qu'elle s'affiche correctement
   - ✅ Vérifier qu'elle persiste après rafraîchissement

## 🗑️ Supprimer le backend

Une fois que TOUS les tests passent et que Realtime + Storage sont configurés :

```bash
# Supprimer le dossier backend
rm -rf backend/

# Mettre à jour package.json (supprimer les scripts backend)
# Supprimer "dev:backend", "build:backend", etc.
```

## 📝 Avantages de cette architecture

✅ **Pas de serveur Node.js à maintenir**
✅ **Scalabilité automatique** (Supabase gère tout)
✅ **Temps réel intégré** (pas besoin de WebSocket)
✅ **Authentification sécurisée** (Supabase Auth)
✅ **Base de données PostgreSQL** puissante
✅ **Storage S3-compatible** pour les fichiers
✅ **Row Level Security** pour la sécurité
✅ **Moins de code à écrire et maintenir**

## ⚠️ Points d'attention

- **RLS** : Configurez bien les policies pour la sécurité en production
- **Limites gratuites Supabase** : 
  - 500 MB de base de données
  - 1 GB de storage
  - 2 GB de transfert/mois
  - 50 000 utilisateurs actifs mensuels
- **Backup** : Configurez les backups automatiques dans Supabase
