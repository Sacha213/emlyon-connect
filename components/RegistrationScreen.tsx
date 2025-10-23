import React, { useState } from 'react';
import { ArrowLeftIcon } from './icons';

interface RegistrationScreenProps {
  onRegister: (name: string, email: string) => void;
  onSwitchToLogin: () => void;
  onBack: () => void;
}

const PROMOTIONS = ['EMI', 'Dev'];

const RegistrationScreen: React.FC<RegistrationScreenProps> = ({ onRegister, onSwitchToLogin, onBack }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [promotion, setPromotion] = useState('EMI');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Le nom est requis.');
      return;
    }
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('http://localhost:3001/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password, name, promotion }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Erreur lors de l\'inscription');
      }

      // Sauvegarder le token et l'utilisateur
      localStorage.setItem('token', data.data.token);
      localStorage.setItem('user', JSON.stringify(data.data.user));

      onRegister(name, email);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de l\'inscription');
      console.error('Erreur inscription:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-brand-bg p-4 relative">
      <button onClick={onBack} className="absolute top-6 left-6 p-2 rounded-full text-brand-subtle hover:text-brand-dark hover:bg-brand-light transition-colors" title="Retour">
        <ArrowLeftIcon className="w-6 h-6" />
      </button>
      <div className="w-full max-w-md p-8 space-y-8">
        <div className="text-center mb-10">
          <h1 className="text-5xl font-black uppercase tracking-wider text-brand-dark">
            Inscription
          </h1>
          <p className="text-brand-subtle mt-2">Rejoignez emlyon connect</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <input
              id="name"
              name="name"
              type="text"
              autoComplete="name"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 w-full px-4 py-3 bg-brand-secondary border-transparent rounded-md focus:outline-none focus:ring-2 focus:ring-brand-emlyon transition"
              placeholder="Nom complet"
            />
          </div>
          <div>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full px-4 py-3 bg-brand-secondary border-transparent rounded-md focus:outline-none focus:ring-2 focus:ring-brand-emlyon transition"
              placeholder="Adresse e-mail emlyon"
            />
          </div>

          <div>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="new-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 w-full px-4 py-3 bg-brand-secondary border-transparent rounded-md focus:outline-none focus:ring-2 focus:ring-brand-emlyon transition"
              placeholder="Mot de passe"
            />
          </div>

          <div>
            <label htmlFor="promotion" className="block text-sm font-medium text-brand-subtle mb-2">
              Promotion
            </label>
            <select
              id="promotion"
              name="promotion"
              value={promotion}
              onChange={(e) => setPromotion(e.target.value)}
              className="w-full px-4 py-3 bg-brand-secondary border-transparent rounded-md focus:outline-none focus:ring-2 focus:ring-brand-emlyon transition text-brand-dark"
            >
              {PROMOTIONS.map((promo) => (
                <option key={promo} value={promo}>
                  {promo}
                </option>
              ))}
            </select>
          </div>

          {error && (
            <p className="text-sm text-red-500 text-center">{error}</p>
          )}

          <div className="pt-4">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 px-4 py-4 font-bold text-lg text-white bg-brand-emlyon rounded-md hover:opacity-90 transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-wait disabled:scale-100"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Création du compte...
                </>
              ) : (
                "S'inscrire"
              )}
            </button>
          </div>
        </form>
        <p className="text-center text-sm text-brand-subtle">
          Déjà un compte ?{' '}
          <button onClick={onSwitchToLogin} className="font-semibold text-brand-dark hover:underline">
            Se connecter
          </button>
        </p>
      </div>
    </div>
  );
};

export default RegistrationScreen;
