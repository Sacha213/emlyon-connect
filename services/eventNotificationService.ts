/**
 * Envoie une notification locale pour un nouvel événement
 * (uniquement pour l'utilisateur qui crée l'événement)
 */
export async function notifyNewEvent(eventId: string, eventTitle: string, eventDate: Date) {
    try {
        // Vérifier si les notifications sont supportées et autorisées
        if (!('Notification' in window) || Notification.permission !== 'granted') {
            console.log('⚠️ Notifications non disponibles ou non autorisées');
            return false;
        }

        // Envoyer une notification locale
        new Notification('🎉 Événement créé !', {
            body: `${eventTitle} - ${eventDate.toLocaleDateString('fr-FR', {
                day: 'numeric',
                month: 'long',
                hour: '2-digit',
                minute: '2-digit'
            })}`,
            icon: '/icons/icon-192x192.png',
            badge: '/icons/icon-96x96.png',
            tag: `event-${eventId}`,
            data: {
                url: '/?view=events',
                eventId
            }
        });

        console.log('✅ Notification locale événement envoyée');
        return true;
    } catch (error) {
        console.error('Erreur notification événement:', error);
        return false;
    }
}

/**
 * Planifie un rappel 2h avant l'événement pour les participants
 * Utilise setTimeout (fonctionne uniquement si l'app est ouverte/en arrière-plan)
 */
export async function scheduleEventReminder(eventId: string, userId: string, eventTitle: string, eventDate: Date) {
    try {
        const now = new Date();
        const reminderTime = new Date(eventDate.getTime() - 2 * 60 * 60 * 1000); // 2h avant

        // Ne pas planifier si l'événement est dans moins de 2h
        if (reminderTime <= now) {
            console.log('⚠️ Événement trop proche, pas de rappel planifié');
            return false;
        }

        // Calculer le délai en millisecondes
        const delay = reminderTime.getTime() - now.getTime();

        console.log(`⏰ Rappel planifié dans ${Math.round(delay / 1000 / 60)} minutes pour ${eventTitle}`);

        // Planifier la notification locale
        setTimeout(() => {
            if ('Notification' in window && Notification.permission === 'granted') {
                new Notification('⏰ Rappel événement', {
                    body: `${eventTitle} commence dans 2h !`,
                    icon: '/icons/icon-192x192.png',
                    badge: '/icons/icon-96x96.png',
                    tag: `reminder-${eventId}`,
                    requireInteraction: true,
                    data: {
                        url: '/?view=events',
                        eventId
                    }
                });
                console.log('✅ Rappel événement envoyé');
            }
        }, delay);

        return true;
    } catch (error) {
        console.error('Erreur planification rappel:', error);
        return false;
    }
}

/**
 * Annuler tous les rappels planifiés pour un événement
 * Note: Avec setTimeout, on ne peut pas vraiment annuler facilement les rappels
 * Cette fonction est gardée pour compatibilité future
 */
export function cancelEventReminders(eventId: string) {
    console.log(`⚠️ Annulation de rappels pour ${eventId} (non implémenté en local)`);
}

