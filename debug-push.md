# Debug Push Notifications

## Étapes de diagnostic

### 1. Vérifier les souscriptions dans Supabase

Va sur Supabase Studio → Table `PushSubscription` et vérifie :
- Combien de lignes il y a (devrait y avoir une ligne par appareil abonné)
- Si ton `user_id` iPhone est présent
- Si l'`endpoint` ressemble à une URL Apple (contient `push.apple.com`)

### 2. Vérifier les secrets Supabase Edge Function

```bash
# Lister les secrets
npx supabase secrets list

# Vérifier que ces secrets existent :
# - VAPID_PUBLIC_KEY
# - VAPID_PRIVATE_KEY
# - VAPID_CONTACT_EMAIL (optionnel)
```

Si les secrets ne sont pas là, les ajouter :
```bash
npx supabase secrets set VAPID_PUBLIC_KEY=BP1-mqJmcA2ajma8ywVi5hauklrl-r47KOAEdLygLNLSLnp3aCgsZwvxgd-PNLE06umD410wwJuxUceDSBL5gQE

npx supabase secrets set VAPID_PRIVATE_KEY=<ta_clé_privée>

npx supabase secrets set VAPID_CONTACT_EMAIL=mailto:contact@emlyon-connect.com
```

### 3. Tester la fonction Edge manuellement

Depuis la console de ton navigateur (sur PC où ça marche) :

```javascript
// Récupérer ton user_id
const userId = JSON.parse(localStorage.getItem('user')).id;
console.log('User ID:', userId);

// Créer un événement test
const testEvent = {
  event: {
    id: 'test-' + Date.now(),
    title: 'Test Push Notification',
    description: 'Ceci est un test',
    category: '🎉 Test',
    date: Date.now() + 3600000
  }
};

// Appeler la fonction Edge directement
fetch('https://reetmakfmlwhpsglgnqo.supabase.co/functions/v1/broadcast-event', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify(testEvent)
})
.then(r => r.json())
.then(data => console.log('Résultat:', data))
.catch(err => console.error('Erreur:', err));
```

Regarde la réponse :
- `delivered: X` → nombre de notifications envoyées avec succès
- `stale: Y` → nombre de souscriptions expirées/supprimées

### 4. Vérifier les logs Edge Function

Va sur : https://supabase.com/dashboard/project/reetmakfmlwhpsglgnqo/functions/broadcast-event/logs

Cherche les erreurs type :
- `❌ Missing VAPID keys in secrets`
- `❌ Unable to fetch subscriptions`
- `⚠️ Push send error`

### 5. Problème spécifique iOS

Sur iOS, les notifications push Web ne fonctionnent que si :
- iOS ≥ 16.4
- App installée en PWA (mode standalone)
- Notifications autorisées dans Réglages > Notifications > emlyon connect
- **Important** : L'appareil doit avoir une connexion Internet active quand la notification est envoyée
- **Important** : Sur iOS, si l'app est complètement fermée (swipe up depuis le sélecteur d'apps), les notifications peuvent ne pas s'afficher immédiatement

### 6. Test de diagnostic complet

Depuis l'iPhone, ouvre la console Web Inspector et exécute :

```javascript
// Vérifier que la souscription existe
const reg = await navigator.serviceWorker.ready;
const sub = await reg.pushManager.getSubscription();
console.log('Subscription:', sub);
console.log('Endpoint:', sub?.endpoint);

// Vérifier dans Supabase
const userId = JSON.parse(localStorage.getItem('user')).id;
const { data } = await supabase
  .from('PushSubscription')
  .select('*')
  .eq('user_id', userId);
console.log('Supabase subscription:', data);
```

## Solution probable

Le plus probable est que **les clés VAPID ne sont pas configurées dans les secrets Supabase Edge Function**.

Exécute ces commandes :

```bash
# Depuis ton terminal Mac
cd /Users/sachamontel/Documents/Projets/emlyon-connect

# Lister les secrets actuels
npx supabase secrets list

# Si les clés VAPID ne sont pas là, les ajouter
npx supabase secrets set VAPID_PUBLIC_KEY=BP1-mqJmcA2ajma8ywVi5hauklrl-r47KOAEdLygLNLSLnp3aCgsZwvxgd-PNLE06umD410wwJuxUceDSBL5gQE

# Tu dois aussi ajouter la clé PRIVÉE (pas dans .env.local actuellement)
# Si tu ne l'as pas, régénère les clés VAPID :
npx web-push generate-vapid-keys

# Puis configure les deux clés
```
