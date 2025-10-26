import { supabase } from './supabaseClient';

const VAPID_PUBLIC_KEY = import.meta.env.VITE_VAPID_PUBLIC_KEY as string;

/**
 * Convertit une clé VAPID en Uint8Array
 */
function urlBase64ToUint8Array(base64String: string): Uint8Array {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding)
        .replace(/\-/g, '+')
        .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray as unknown as Uint8Array;
}

/**
 * Demande la permission pour les notifications
 */
export async function requestNotificationPermission(): Promise<boolean> {
    if (!('Notification' in window)) {
        console.warn('Ce navigateur ne supporte pas les notifications');
        return false;
    }

    if (!('serviceWorker' in navigator)) {
        console.warn('Ce navigateur ne supporte pas les Service Workers');
        return false;
    }

    const permission = await Notification.requestPermission();
    return permission === 'granted';
}

/**
 * Enregistre le Service Worker et souscrit aux notifications push
 */
export async function subscribeToPushNotifications(userId: string): Promise<boolean> {
    try {
        // Vérifier la permission
        const hasPermission = await requestNotificationPermission();
        if (!hasPermission) {
            console.log('Permission de notification refusée');
            return false;
        }

        // Enregistrer le Service Worker
        const registration = await navigator.serviceWorker.register('/sw.js');
        console.log('Service Worker enregistré:', registration);

        // Attendre que le Service Worker soit prêt
        await navigator.serviceWorker.ready;

        // Souscrire aux notifications push
        const subscription = await registration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY) as BufferSource
        });

        console.log('Souscription push créée:', subscription);

        // Sauvegarder la souscription dans Supabase
        const { error } = await supabase
            .from('PushSubscription')
            .upsert({
                user_id: userId,
                endpoint: subscription.endpoint,
                keys: {
                    p256dh: subscription.toJSON().keys?.p256dh,
                    auth: subscription.toJSON().keys?.auth
                }
            }, {
                onConflict: 'user_id'
            });

        if (error) {
            console.error('Erreur sauvegarde souscription:', error);
            return false;
        }

        console.log('✅ Souscription push enregistrée avec succès');
        return true;

    } catch (error) {
        console.error('Erreur souscription push:', error);
        return false;
    }
}

/**
 * Se désabonner des notifications push
 */
export async function unsubscribeFromPushNotifications(userId: string): Promise<void> {
    try {
        const registration = await navigator.serviceWorker.getRegistration();
        if (!registration) return;

        const subscription = await registration.pushManager.getSubscription();
        if (subscription) {
            await subscription.unsubscribe();
        }

        // Supprimer de la base de données
        await supabase
            .from('PushSubscription')
            .delete()
            .eq('user_id', userId);

        console.log('✅ Désabonné des notifications push');
    } catch (error) {
        console.error('Erreur désabonnement push:', error);
    }
}

/**
 * Vérifier si l'utilisateur est déjà abonné
 */
export async function isSubscribedToPush(userId: string): Promise<boolean> {
    try {
        const { data } = await supabase
            .from('PushSubscription')
            .select('user_id')
            .eq('user_id', userId)
            .single();

        return !!data;
    } catch {
        return false;
    }
}

/**
 * Envoyer une notification de test
 */
export async function sendTestNotification(): Promise<void> {
    if (!('Notification' in window)) return;

    if (Notification.permission === 'granted') {
        new Notification('emlyon Connect', {
            body: 'Les notifications sont activées ! 🎉',
            icon: '/icons/icon-192x192.png',
            badge: '/icons/icon-96x96.png',
            tag: 'test-notification',
            requireInteraction: false
        });
    }
}
