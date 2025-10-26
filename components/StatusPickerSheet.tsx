import React from 'react';

interface StatusPickerSheetProps {
    options: string[];
    selected: string | null;
    onSelect: (emoji: string) => void;
    onClose: () => void;
}

const STATUS_LABELS: Record<string, string> = {
    '🍻': 'Soirée',
    '🍽️': 'Restaurant',
    '📚': 'Étude',
    '🏋️': 'Sport',
    '☕': 'Café',
    '🎉': 'Fête',
    '🏠': 'Maison',
    '💼': 'Travail',
    '👻': 'Mode Fantôme',
};

const StatusPickerSheet: React.FC<StatusPickerSheetProps> = ({ options, selected, onSelect, onClose }) => {
    return (
        <div
            className="fixed inset-0 z-[1200] flex items-end justify-center md:hidden"
            aria-modal="true"
            role="dialog"
        >
            <button className="absolute inset-0 bg-black/40" onClick={onClose} aria-label="Fermer" />
            <div className="relative w-full max-w-md rounded-t-3xl bg-brand-light shadow-xl p-6 pb-10" style={{ paddingBottom: `calc(env(safe-area-inset-bottom) + 2rem)` }}>
                <div className="mx-auto mb-4 h-1.5 w-14 rounded-full bg-brand-secondary/60" />
                <h2 className="text-center text-lg font-semibold text-brand-dark">Choisir un statut</h2>
                <p className="text-center text-sm text-brand-subtle mb-6">Touchez un emoji pour mettre à jour votre statut</p>
                <div className="grid grid-cols-4 gap-3">
                    {options.map((emoji) => (
                        <button
                            key={emoji}
                            onClick={() => onSelect(emoji)}
                            className={`flex flex-col items-center gap-1 rounded-2xl py-3 text-3xl transition-all ${selected === emoji ? 'bg-brand-emlyon/20 ring-2 ring-brand-emlyon' : 'bg-brand-secondary/60 hover:bg-brand-secondary/80'}`}
                        >
                            <span>{emoji}</span>
                            <span className="text-[11px] font-medium leading-tight text-brand-dark/80">{STATUS_LABELS[emoji] || ''}</span>
                        </button>
                    ))}
                </div>
                <button
                    onClick={onClose}
                    className="mt-6 w-full rounded-xl border border-brand-secondary bg-transparent py-3 text-sm font-semibold text-brand-dark hover:bg-brand-secondary/30"
                >
                    Fermer
                </button>
            </div>
        </div>
    );
};

export default StatusPickerSheet;
