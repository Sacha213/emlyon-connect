import React from 'react';
import type { User } from '../types';
import { LogoutIcon } from './icons';

interface HeaderProps {
  currentUser: User;
  onLogout: () => void;
}

const Header: React.FC<HeaderProps> = ({ currentUser, onLogout }) => {
  return (
    <header className="bg-brand-bg/90 backdrop-blur-sm sticky top-0 z-40 p-4 flex justify-between items-center border-b border-brand-secondary">
      <div className="text-2xl font-bold text-brand-dark">
        <span className="font-black text-brand-emlyon uppercase tracking-wide">emlyon</span>
        <span className="font-light"> connect</span>
      </div>
      <div className="flex items-center gap-4">
        <div className="text-right hidden sm:block">
          <p className="font-semibold text-brand-dark">{currentUser.name}</p>
        </div>
        <img
          key={currentUser.avatarUrl}
          src={currentUser.avatarUrl}
          alt={currentUser.name}
          className="w-10 h-10 rounded-md object-cover ring-2 ring-brand-secondary"
        />
        <button onClick={onLogout} className="p-2 rounded-full hover:bg-brand-light transition-colors" title="Déconnexion">
          <LogoutIcon className="w-6 h-6 text-brand-subtle" />
        </button>
      </div>
    </header>
  );
};

export default Header;