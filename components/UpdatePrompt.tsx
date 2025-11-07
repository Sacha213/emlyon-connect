import { useEffect, useState } from 'react';

export function UpdatePrompt() {
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    if (!('serviceWorker' in navigator)) return;

    // Écouter les mises à jour du Service Worker
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      console.log('[PWA] Nouveau Service Worker activé');
      setShowPrompt(true);
    });

    // Vérifier les mises à jour périodiquement
    const checkForUpdates = async () => {
      try {
        const registration = await navigator.serviceWorker.getRegistration();
        if (registration) {
          console.log('[PWA] Vérification des mises à jour...');
          await registration.update();
        }
      } catch (error) {
        console.error('[PWA] Erreur vérification mises à jour:', error);
      }
    };

    // Vérifier toutes les heures
    const interval = setInterval(checkForUpdates, 60 * 60 * 1000);
    
    // Vérifier au chargement
    checkForUpdates();

    return () => clearInterval(interval);
  }, []);

  const handleUpdate = () => {
    setShowPrompt(false);
    window.location.reload();
  };

  const handleDismiss = () => {
    setShowPrompt(false);
  };    if (!showPrompt) return null;

    return (
        <div
            style={{
                position: 'fixed',
                bottom: '20px',
                left: '50%',
                transform: 'translateX(-50%)',
                backgroundColor: '#1a1a1a',
                color: 'white',
                padding: '16px 24px',
                borderRadius: '12px',
                boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
                zIndex: 10000,
                maxWidth: '90%',
                width: '400px',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
            }}
        >
            <div style={{ fontSize: '16px', fontWeight: '600' }}>
                🎉 Nouvelle version disponible !
            </div>
            <div style={{ fontSize: '14px', opacity: 0.9 }}>
                Une mise à jour est disponible avec de nouvelles fonctionnalités.
            </div>
            <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
                <button
                    onClick={handleUpdate}
                    style={{
                        flex: 1,
                        padding: '10px 16px',
                        backgroundColor: '#e30613',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        fontSize: '14px',
                        fontWeight: '600',
                        cursor: 'pointer',
                    }}
                >
                    Mettre à jour
                </button>
                <button
                    onClick={handleDismiss}
                    style={{
                        padding: '10px 16px',
                        backgroundColor: 'transparent',
                        color: 'white',
                        border: '1px solid rgba(255,255,255,0.2)',
                        borderRadius: '8px',
                        fontSize: '14px',
                        cursor: 'pointer',
                    }}
                >
                    Plus tard
                </button>
            </div>
        </div>
    );
}
