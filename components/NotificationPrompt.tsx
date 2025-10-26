import React, { useState, useEffect } from 'react';
import {
    subscribeToPushNotifications,
    unsubscribeFromPushNotifications,
    isSubscribedToPush,
    sendTestNotification
} from '../services/notificationService';

interface NotificationPromptProps {
    userId: string;
    autoPrompt?: boolean;
}

type PermissionState = NotificationPermission | 'unsupported';

export const NotificationPrompt: React.FC<NotificationPromptProps> = ({ userId, autoPrompt = true }) => {
    const [isSubscribed, setIsSubscribed] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [showPrompt, setShowPrompt] = useState(false);
    const [permissionState, setPermissionState] = useState<PermissionState>('default');
    const [statusMessage, setStatusMessage] = useState('');

    useEffect(() => {
        checkSubscriptionStatus();
        // Ne jamais afficher le prompt automatisé si désactivé
        if (!autoPrompt) {
            setShowPrompt(false);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [userId, autoPrompt]);

    useEffect(() => {
        if (typeof window === 'undefined') return;
        if (!('Notification' in window)) {
            setPermissionState('unsupported');
            setStatusMessage('Les notifications ne sont pas supportées sur cet appareil.');
            return;
        }
        const permission = Notification.permission;
        setPermissionState(permission);
        if (permission === 'denied') {
            setStatusMessage('Tu as refusé l’autorisation. Active-les dans les réglages du navigateur.');
        }
    }, []);

    const checkSubscriptionStatus = async () => {
        const subscribed = await isSubscribedToPush(userId);
        setIsSubscribed(subscribed);

        if (subscribed) {
            setStatusMessage('Notifications activées 🎉');
            setPermissionState('granted');
        } else if (permissionState !== 'unsupported') {
            const permission = typeof window !== 'undefined' && 'Notification' in window ? Notification.permission : 'default';
            setPermissionState(permission);
            if (permission === 'default') {
                setStatusMessage('Notifications désactivées.');
            } else if (permission === 'denied') {
                setStatusMessage('Autorise les notifications dans les réglages du navigateur.');
            } else {
                setStatusMessage('Notifications désactivées.');
            }
        }

        // Afficher le prompt si pas encore abonné et jamais refusé
        if (autoPrompt) {
            const dismissed = localStorage.getItem('notification-prompt-dismissed');
            if (!subscribed && !dismissed) {
                // Attendre 3 secondes avant d'afficher le prompt
                setTimeout(() => setShowPrompt(true), 3000);
            }
        }
    };

    const handleSubscribe = async () => {
        setIsLoading(true);
        const success = await subscribeToPushNotifications(userId);
        if (success) {
            setIsSubscribed(true);
            setShowPrompt(false);
            setPermissionState('granted');
            setStatusMessage('Notifications activées 🎉');
            // Envoyer une notification de test
            await sendTestNotification();
        } else {
            const permission = typeof window !== 'undefined' && 'Notification' in window ? Notification.permission : 'default';
            setPermissionState(permission === 'default' ? 'default' : permission || 'unsupported');
            if (permission === 'denied') {
                setStatusMessage('Permission refusée. Ouvre les réglages du navigateur pour les autoriser.');
            } else if (permissionState === 'unsupported') {
                setStatusMessage('Notifications push non supportées sur cet appareil.');
            } else {
                setStatusMessage('Impossible d’activer les notifications. Réessaie plus tard.');
            }
        }
        setIsLoading(false);
    };

    const handleUnsubscribe = async () => {
        setIsLoading(true);
        await unsubscribeFromPushNotifications(userId);
        setIsSubscribed(false);
        setStatusMessage('Notifications désactivées.');
        if (typeof window !== 'undefined' && 'Notification' in window) {
            setPermissionState(Notification.permission);
        }
        setIsLoading(false);
    };

    const handleDismiss = () => {
        setShowPrompt(false);
        localStorage.setItem('notification-prompt-dismissed', 'true');
    };

    // Prompt pour demander l'activation
    if (showPrompt && !isSubscribed) {
        return (
            <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 bg-brand-light rounded-lg shadow-2xl p-4 z-[2000] border border-gray-700">
                <div className="flex items-start gap-3">
                    <div className="text-3xl">🔔</div>
                    <div className="flex-1">
                        <h3 className="font-bold text-brand-dark mb-1">
                            Activer les notifications ?
                        </h3>
                        <p className="text-sm text-gray-400 mb-3">
                            Reçois des alertes pour les nouveaux événements et rappels 2h avant !
                        </p>
                        <div className="flex gap-2">
                            <button
                                onClick={handleSubscribe}
                                disabled={isLoading}
                                className="flex-1 bg-brand-emlyon text-white px-4 py-2 rounded-lg font-semibold hover:bg-red-700 disabled:opacity-50 transition-colors"
                            >
                                {isLoading ? 'Activation...' : 'Activer'}
                            </button>
                            <button
                                onClick={handleDismiss}
                                className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
                            >
                                Plus tard
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Bouton de gestion dans les paramètres
    return (
        <div className="flex items-center justify-between gap-4 p-4 bg-brand-light rounded-lg">
            <div className="flex items-center gap-3">
                <div className="text-2xl">{isSubscribed ? '🔔' : '🔕'}</div>
                <div>
                    <h4 className="font-semibold text-brand-dark">Notifications push</h4>
                    <p className="text-sm text-gray-400">
                        {statusMessage || (isSubscribed
                            ? 'Activées - Tu recevras les alertes'
                            : 'Désactivées - Active pour recevoir les alertes')}
                    </p>
                    {!isSubscribed && permissionState === 'unsupported' && (
                        <p className="mt-1 text-xs text-red-400">Non pris en charge sur ce navigateur/appareil.</p>
                    )}
                    {!isSubscribed && permissionState === 'denied' && (
                        <p className="mt-1 text-xs text-red-400">Autorise les notifications dans les réglages du navigateur.</p>
                    )}
                </div>
            </div>
            <button
                onClick={isSubscribed ? handleUnsubscribe : handleSubscribe}
                disabled={isLoading || permissionState === 'unsupported'}
                className={`px-4 py-2 rounded-lg font-semibold transition-colors disabled:opacity-50 ${isSubscribed
                    ? 'bg-gray-700 text-white hover:bg-gray-600'
                    : 'bg-brand-emlyon text-white hover:bg-red-700'
                    }`}
            >
                {isLoading ? '...' : isSubscribed ? 'Désactiver' : 'Activer'}
            </button>
        </div>
    );
};
