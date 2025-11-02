import { supabase } from './supabaseClient';

const VAPID_PUBLIC_KEY = import.meta.env.VITE_VAPID_PUBLIC_KEY as string | undefined;

export type SubscribeToPushResult =
    | { ok: true; subscription: PushSubscription }
    | {
        ok: false;
        reason:
        | 'unsupported'
        | 'permission-denied'
        | 'service-worker-unavailable'
        | 'push-unavailable'
        | 'ios-settings'
        | 'storage-error'
        | 'unknown';
        error?: unknown;
    };

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
export async function requestNotificationPermission(): Promise<NotificationPermission | 'unsupported'> {
    if (!('Notification' in window)) {
        console.warn('Ce navigateur ne supporte pas les notifications');
        return 'unsupported';
    }

    if (!('serviceWorker' in navigator)) {
        console.warn('Ce navigateur ne supporte pas les Service Workers');
        return 'unsupported';
    }

    return Notification.requestPermission();
}

/**
 * Enregistre le Service Worker et souscrit aux notifications push
 */
export async function subscribeToPushNotifications(userId: string): Promise<SubscribeToPushResult> {
    console.log('🔍 [DEBUG] Début subscribeToPushNotifications');
    console.log('🔍 [DEBUG] VAPID_PUBLIC_KEY présente:', !!VAPID_PUBLIC_KEY);
    console.log('🔍 [DEBUG] Notification in window:', 'Notification' in window);
    console.log('🔍 [DEBUG] serviceWorker in navigator:', 'serviceWorker' in navigator);
    console.log('🔍 [DEBUG] User Agent:', navigator.userAgent);
    console.log('🔍 [DEBUG] Display mode standalone:', window.matchMedia('(display-mode: standalone)').matches);
    console.log('🔍 [DEBUG] Display mode:', window.matchMedia('(display-mode: standalone)').matches ? 'standalone' : window.matchMedia('(display-mode: fullscreen)').matches ? 'fullscreen' : window.matchMedia('(display-mode: minimal-ui)').matches ? 'minimal-ui' : 'browser');

    if (!VAPID_PUBLIC_KEY) {
        console.error('❌ Aucune clé VAPID publique configurée. Vérifie VITE_VAPID_PUBLIC_KEY.');
        return { ok: false, reason: 'unsupported' };
    }

    if (!('Notification' in window)) {
        console.error('❌ Notification API non disponible');
        return { ok: false, reason: 'unsupported' };
    }

    if (!('serviceWorker' in navigator)) {
        console.error('❌ Service Worker API non disponible');
        return { ok: false, reason: 'unsupported' };
    }

    const permission = await requestNotificationPermission();
    if (permission === 'unsupported') {
        return { ok: false, reason: 'unsupported' };
    }
    if (permission !== 'granted') {
        return { ok: false, reason: 'permission-denied' };
    }

    let registration: ServiceWorkerRegistration | undefined | null;
    try {
        console.log('🔍 [DEBUG] Recherche du Service Worker existant...');
        registration = await navigator.serviceWorker.getRegistration();
        console.log('🔍 [DEBUG] Registration existante:', !!registration);
        if (!registration) {
            console.log('🔍 [DEBUG] Enregistrement du Service Worker /sw.js...');
            registration = await navigator.serviceWorker.register('/sw.js', { scope: '/' });
            console.log('✅ Service Worker enregistré:', registration);
        }
    } catch (error) {
        console.error('❌ Erreur lors de l\'enregistrement du Service Worker:', error);
        return { ok: false, reason: 'service-worker-unavailable', error };
    }

    let activeRegistration: ServiceWorkerRegistration | null = null;
    try {
        console.log('🔍 [DEBUG] Attente Service Worker ready...');
        activeRegistration = await navigator.serviceWorker.ready;
        console.log('✅ Service Worker prêt');
    } catch (error) {
        console.warn('⚠️ Service Worker prêt indisponible:', error);
    }

    const finalRegistration = activeRegistration ?? registration;
    if (!finalRegistration) {
        console.error('❌ Aucune registration finale disponible');
        return { ok: false, reason: 'service-worker-unavailable' };
    }

    console.log('🔍 [DEBUG] pushManager disponible:', !!finalRegistration.pushManager);
    if (!finalRegistration.pushManager) {
        console.error('❌ pushManager non disponible sur cette registration');
        return { ok: false, reason: 'push-unavailable' };
    }

    let subscription: PushSubscription | null = null;
    try {
        console.log('🔍 [DEBUG] Vérification subscription existante...');
        subscription = await finalRegistration.pushManager.getSubscription();
        console.log('🔍 [DEBUG] Subscription existante:', !!subscription);

        if (!subscription) {
            console.log('🔍 [DEBUG] Création nouvelle subscription...');
            subscription = await finalRegistration.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY) as BufferSource
            });
            console.log('✅ Subscription créée:', subscription.endpoint);
        }
    } catch (error) {
        console.error('❌ Erreur lors de la souscription push:', error);
        if (error instanceof DOMException) {
            console.error('❌ DOMException name:', error.name);
            console.error('❌ DOMException message:', error.message);
            if (error.name === 'InvalidStateError') {
                return { ok: false, reason: 'ios-settings', error };
            }
            if (error.name === 'NotAllowedError') {
                return { ok: false, reason: 'permission-denied', error };
            }
        }
        console.error('❌ Type d\'erreur:', error?.constructor?.name);
        return { ok: false, reason: 'unknown', error };
    }

    if (!subscription) {
        return { ok: false, reason: 'unknown' };
    }

    const json = subscription.toJSON();
    const { error } = await supabase
        .from('PushSubscription')
        .upsert({
            user_id: userId,
            endpoint: subscription.endpoint,
            keys: {
                p256dh: json.keys?.p256dh ?? null,
                auth: json.keys?.auth ?? null
            }
        }, {
            onConflict: 'user_id'
        });

    if (error) {
        console.error('Erreur sauvegarde souscription:', error);
        return { ok: false, reason: 'storage-error', error };
    }

    console.log('✅ Souscription push enregistrée avec succès');
    return { ok: true, subscription };
}

/**
 * Se désabonner des notifications push
 */
export async function unsubscribeFromPushNotifications(userId: string): Promise<void> {
    try {
        const registration = await navigator.serviceWorker.getRegistration();
        const subscription = await registration?.pushManager.getSubscription();
        if (subscription) {
            await subscription.unsubscribe();
        }

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
    const { data, error } = await supabase
        .from('PushSubscription')
        .select('user_id')
        .eq('user_id', userId)
        .maybeSingle();

    if (error) {
        console.warn('Erreur vérification souscription:', error);
        return false;
    }

    return Boolean(data);
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
