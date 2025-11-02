// Test script pour vérifier les push notifications
// À exécuter dans la console du navigateur (sur PC ou iPhone via Web Inspector)

console.log('=== TEST PUSH NOTIFICATIONS ===');

// 1. Vérifier l'utilisateur connecté
const user = JSON.parse(localStorage.getItem('user'));
console.log('✅ User:', user?.id, user?.name);

// 2. Vérifier la souscription locale
(async () => {
    try {
        const reg = await navigator.serviceWorker.ready;
        const sub = await reg.pushManager.getSubscription();
        console.log('✅ Local subscription:', sub ? 'OUI' : 'NON');
        if (sub) {
            console.log('  Endpoint:', sub.endpoint);
            console.log('  Type:', sub.endpoint.includes('apple.com') ? 'Apple' : sub.endpoint.includes('google.com') ? 'Google' : 'Autre');
        }
    } catch (e) {
        console.error('❌ Erreur subscription locale:', e);
    }
})();

// 3. Instructions pour tester
console.log('\n📤 Pour tester les notifications push:\n');
console.log('1. Ferme complètement l\'app sur ton iPhone (swipe vers le haut)');
console.log('2. Depuis ton PC, crée un nouvel événement dans l\'app');
console.log('3. Attends 5-10 secondes');
console.log('4. Une notification devrait apparaître sur ton iPhone\n');
console.log('Si ça ne marche pas, vérifie:');
console.log('- Que ton iPhone a bien les notifications activées dans Réglages > Notifications > emlyon connect');
console.log('- Que tu as bien activé les notifications dans le profil de l\'app');
console.log('- Que la table PushSubscription contient bien une ligne pour ton user_id iPhone');
