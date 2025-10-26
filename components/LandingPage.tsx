import React from 'react';
import { MapPinIcon, CalendarIcon, UsersIcon } from './icons';

interface LandingPageProps {
  onJoin: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onJoin }) => {
  return (
    <div className="min-h-screen w-full bg-brand-bg text-brand-dark flex flex-col">
      {/* Header */}
      <header
        className="px-4 pb-4 flex justify-between items-center"
        style={{ paddingTop: 'calc(env(safe-area-inset-top, 0px) + 12px)' }}
      >
        <div className="text-2xl font-bold">
          <span className="font-black text-brand-emlyon uppercase tracking-wide">emlyon</span>
          <span className="font-light"> connect</span>
        </div>
        <button
          onClick={onJoin}
          className="px-5 py-2 text-sm font-semibold bg-brand-emlyon text-white rounded-md hover:opacity-90 transition-opacity"
        >
          Se connecter
        </button>
      </header>

      {/* Hero Section */}
      <main className="flex-grow flex flex-col items-center justify-center text-center px-4 py-20">
        <h1 className="text-4xl md:text-6xl font-black max-w-4xl leading-tight">
          La vie étudiante, connectée. Retrouvez-vous. Sortez. Partagez.
        </h1>
        <p className="text-lg md:text-xl text-brand-subtle mt-6 max-w-2xl">
          L'application exclusive pour les étudiants d'emlyon. Ne manquez plus une seule occasion de vous retrouver.
        </p>
        <button
          onClick={onJoin}
          className="mt-10 px-8 py-4 font-bold text-lg text-white bg-brand-emlyon rounded-md hover:opacity-90 transition-all transform hover:scale-105"
        >
          Rejoindre maintenant
        </button>
      </main>

      {/* Features Section */}
      <section className="w-full py-20 bg-brand-light border-t border-brand-secondary">
        <div className="max-w-6xl mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
          <div className="flex flex-col items-center">
            <div className="p-4 bg-brand-secondary rounded-full">
              <MapPinIcon className="w-8 h-8 text-brand-emlyon" />
            </div>
            <h3 className="text-xl font-bold mt-4">Retrouvez-vous Simplement</h3>
            <p className="text-brand-subtle mt-2">
              Visualisez en un clin d'œil qui est sorti sur la carte interactive. Rejoignez vos amis ou découvrez de nouveaux lieux.
            </p>
          </div>
          <div className="flex flex-col items-center">
            <div className="p-4 bg-brand-secondary rounded-full">
              <CalendarIcon className="w-8 h-8 text-brand-emlyon" />
            </div>
            <h3 className="text-xl font-bold mt-4">Organisez des Sorties Mémorables</h3>
            <p className="text-brand-subtle mt-2">
              Proposez une soirée, un pique-nique ou une session d'étude. Créez des événements et invitez vos amis facilement.
            </p>
          </div>
          <div className="flex flex-col items-center">
            <div className="p-4 bg-brand-secondary rounded-full">
              <UsersIcon className="w-8 h-8 text-brand-emlyon" />
            </div>
            <h3 className="text-xl font-bold mt-4">Ne Manquez Plus Rien</h3>
            <p className="text-brand-subtle mt-2">
              Fini les soirées en solo par manque d'info. Restez connecté à la vie de votre promo et renforcez les liens.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="text-center p-6 text-brand-subtle text-sm">
        <p>&copy; {new Date().getFullYear()} emlyon connect. Un projet étudiant.</p>
      </footer>
    </div>
  );
};

export default LandingPage;
