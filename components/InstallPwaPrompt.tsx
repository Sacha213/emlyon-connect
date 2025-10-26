import React, { useEffect, useState } from 'react';

const STORAGE_KEY = 'pwa-install-dismissed-v1';

const isStandaloneMode = () => {
    if (typeof window === 'undefined') return false;
    const mq = window.matchMedia('(display-mode: standalone)');
    return mq.matches || (navigator as unknown as { standalone?: boolean }).standalone === true;
};

const getPlatform = () => {
    if (typeof navigator === 'undefined') return 'unknown';
    const ua = navigator.userAgent.toLowerCase();
    if (/iphone|ipad|ipod/.test(ua)) return 'ios';
    if (/android/.test(ua)) return 'android';
    return 'unknown';
};

const InstallPwaPrompt: React.FC = () => {
    const [visible, setVisible] = useState(false);
    const [platform, setPlatform] = useState<'ios' | 'android' | 'unknown'>('unknown');

    useEffect(() => {
        if (typeof window === 'undefined') return;

        const dismissed = localStorage.getItem(STORAGE_KEY);
        if (dismissed === 'true') return;
        if (isStandaloneMode()) return;

        const currentPlatform = getPlatform();
        setPlatform(currentPlatform);

        const isMobile = /mobile|android|iphone|ipad|ipod/.test(navigator.userAgent.toLowerCase());

        if (isMobile && currentPlatform !== 'unknown') {
            setVisible(true);
        }
    }, []);

    useEffect(() => {
        const handleBeforeInstall = () => {
            if (!visible) {
                setVisible(true);
            }
        };

        window.addEventListener('beforeinstallprompt', handleBeforeInstall);
        return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
    }, [visible]);

    if (!visible) return null;

    const dismiss = () => {
        setVisible(false);
        try {
            localStorage.setItem(STORAGE_KEY, 'true');
        } catch (error) {
            console.warn('Impossible de persister le rejet du prompt PWA:', error);
        }
    };

    const renderInstructions = () => {
        if (platform === 'ios') {
            return (
                <ol className="mt-4 space-y-2 text-sm text-brand-subtle list-decimal list-inside">
                    <li>Ouvre l'app dans Safari.</li>
                    <li>Appuie sur <span className="font-semibold">Partager</span> (icone carré + flèche).</li>
                    <li>Sélectionne <span className="font-semibold">"Sur l'écran d'accueil"</span>.</li>
                    <li>Valide avec <span className="font-semibold">Ajouter</span>.</li>
                </ol>
            );
        }

        if (platform === 'android') {
            return (
                <ol className="mt-4 space-y-2 text-sm text-brand-subtle list-decimal list-inside">
                    <li>Depuis Chrome, appuie sur <span className="font-semibold">⋮</span> (menu en haut à droite).</li>
                    <li>Choisis <span className="font-semibold">"Ajouter à l'écran d'accueil"</span>.</li>
                    <li>Confirme en appuyant sur <span className="font-semibold">Ajouter</span>.</li>
                </ol>
            );
        }

        return (
            <p className="mt-4 text-sm text-brand-subtle">
                Pour une meilleure expérience, ajoute l'application à votre écran d'accueil via le menu de votre navigateur.
            </p>
        );
    };

    return (
        <aside className="mb-6 rounded-2xl border border-brand-secondary bg-brand-light/80 p-5 shadow-lg backdrop-blur">
            <div className="flex items-start gap-4">
                <div className="shrink-0 text-3xl" aria-hidden>
                    📱
                </div>
                <div className="flex-1">
                    <h2 className="text-base font-semibold text-brand-dark">
                        Installe l'application sur ton écran d'accueil 👇
                    </h2>
                    <p className="mt-1 text-sm text-brand-subtle">
                        Tu accèderas à emlyon connect comme une vraie app mobile, en mode plein écran et avec un lancement ultra-rapide.
                    </p>
                    {renderInstructions()}
                </div>
                <button
                    type="button"
                    onClick={dismiss}
                    className="rounded-full p-2 text-brand-subtle transition-colors hover:bg-brand-secondary/40 hover:text-brand-dark"
                    aria-label="Masquer ce message"
                >
                    ✕
                </button>
            </div>
        </aside>
    );
};

export default InstallPwaPrompt;
