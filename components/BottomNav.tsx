import React from 'react';
import { MapIcon, CalendarIcon, ListBulletIcon, UsersIcon } from './icons';

type Tab = 'presence' | 'events' | 'feedback' | 'profile';

interface BottomNavProps {
    active: Tab;
    onChange: (tab: Tab) => void;
}

const Item: React.FC<{
    active: boolean;
    label: string;
    onClick: () => void;
    children: React.ReactNode;
}> = ({ active, label, onClick, children }) => (
    <button
        onClick={onClick}
        className={`flex-1 flex flex-col items-center justify-center gap-1 py-2 ${active ? 'text-brand-dark' : 'text-brand-subtle hover:text-brand-dark'}`}
        aria-current={active ? 'page' : undefined}
    >
        <div className={`w-6 h-6 ${active ? '' : 'opacity-80'}`}>{children}</div>
        <span className="text-[11px] leading-none">{label}</span>
    </button>
);

const BottomNav: React.FC<BottomNavProps> = ({ active, onChange }) => {
    return (
        <nav
            className="fixed bottom-0 inset-x-0 z-[1000] md:hidden bg-brand-light/90 backdrop-blur border-t border-brand-secondary shadow-[0_-8px_20px_rgba(0,0,0,0.25)]"
            style={{
                paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 12px)',
                paddingTop: '10px'
            }}
            role="navigation"
            aria-label="Navigation principale"
        >
            <div className="max-w-4xl mx-auto flex">
                <Item active={active === 'presence'} label="Carte" onClick={() => onChange('presence')}>
                    <MapIcon className="w-6 h-6" />
                </Item>
                <Item active={active === 'events'} label="Événements" onClick={() => onChange('events')}>
                    <CalendarIcon className="w-6 h-6" />
                </Item>
                <Item active={active === 'feedback'} label="Feedback" onClick={() => onChange('feedback')}>
                    <ListBulletIcon className="w-6 h-6" />
                </Item>
                <Item active={active === 'profile'} label="Profil" onClick={() => onChange('profile')}>
                    <UsersIcon className="w-6 h-6" />
                </Item>
            </div>
        </nav>
    );
};

export default BottomNav;
