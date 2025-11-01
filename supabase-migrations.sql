-- ==========================================
-- SCRIPT SQL POUR SUPABASE
-- Ajouter les notifications push à emlyon Connect
-- ==========================================

-- 1. Créer la table PushSubscription
CREATE TABLE IF NOT EXISTS "PushSubscription" (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  user_id TEXT NOT NULL REFERENCES "User"(id) ON DELETE CASCADE,
  endpoint TEXT NOT NULL UNIQUE,
  keys JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT unique_user_subscription UNIQUE(user_id)
);

-- 2. Index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_push_subscription_user 
ON "PushSubscription"(user_id);

-- 3. Fonction pour mettre à jour updated_at automatiquement
CREATE OR REPLACE FUNCTION update_push_subscription_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 4. Trigger pour updated_at
DROP TRIGGER IF EXISTS trigger_push_subscription_updated_at ON "PushSubscription";
CREATE TRIGGER trigger_push_subscription_updated_at
  BEFORE UPDATE ON "PushSubscription"
  FOR EACH ROW
  EXECUTE FUNCTION update_push_subscription_updated_at();

-- 5. Row Level Security (RLS)
ALTER TABLE "PushSubscription" ENABLE ROW LEVEL SECURITY;

-- 6. Policies RLS
-- Les utilisateurs peuvent voir et gérer uniquement leurs propres souscriptions
CREATE POLICY "Users can view their own subscriptions"
ON "PushSubscription"
FOR SELECT
USING (auth.uid()::text = user_id);

CREATE POLICY "Users can insert their own subscriptions"
ON "PushSubscription"
FOR INSERT
WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY "Users can update their own subscriptions"
ON "PushSubscription"
FOR UPDATE
USING (auth.uid()::text = user_id)
WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY "Users can delete their own subscriptions"
ON "PushSubscription"
FOR DELETE
USING (auth.uid()::text = user_id);

-- 7. Ajouter la colonne category à la table Event (si pas déjà fait)
ALTER TABLE "Event" 
ADD COLUMN IF NOT EXISTS category TEXT DEFAULT '🎉 Autre';

-- 8. Ajouter les colonnes pour les sondages d'événements
ALTER TABLE "Event"
  ALTER COLUMN date DROP NOT NULL;

ALTER TABLE "Event"
  ADD COLUMN IF NOT EXISTS "pollType" TEXT;

ALTER TABLE "Event"
  ADD COLUMN IF NOT EXISTS "pollOptions" JSONB DEFAULT '[]'::jsonb;

ALTER TABLE "Event"
  ADD COLUMN IF NOT EXISTS "selectedPollOptionId" TEXT;

ALTER TABLE "Event"
  ADD COLUMN IF NOT EXISTS "pollClosesAt" TIMESTAMP WITH TIME ZONE;

DO $$
BEGIN
  ALTER TABLE "Event"
    ADD CONSTRAINT event_poll_type_check CHECK ("pollType" IN ('date', 'location') OR "pollType" IS NULL);
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- ==========================================
-- INSTRUCTIONS D'EXÉCUTION
-- ==========================================
-- 1. Va sur Supabase Dashboard > SQL Editor
-- 2. Crée une nouvelle requête
-- 3. Copie-colle ce script
-- 4. Exécute (bouton Run)
-- 5. Vérifie que les tables sont créées dans Table Editor
