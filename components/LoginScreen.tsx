import React, { useState } from 'react';
import { ArrowLeftIcon } from './icons';

interface LoginScreenProps {
  onLogin: () => void;
  onSwitchToRegister: () => void;
  onBack: () => void;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin, onSwitchToRegister, onBack }) => {
  const [email, setEmail] = useState('alice@emlyon.com');
  const [password, setPassword] = useState('password123');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('http://localhost:3001/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Erreur de connexion');
      }

      // Sauvegarder le token et l'utilisateur
      localStorage.setItem('token', data.data.token);
      localStorage.setItem('user', JSON.stringify(data.data.user));

      onLogin();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur de connexion. Vérifiez vos identifiants.');
      console.error('Erreur de connexion:', err);
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
            <span className="text-brand-emlyon">emlyon</span> connect
          </h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
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
              placeholder="Adresse e-mail"
            />
          </div>

          <div>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 w-full px-4 py-3 bg-brand-secondary border-transparent rounded-md focus:outline-none focus:ring-2 focus:ring-brand-emlyon transition"
              placeholder="Mot de passe"
            />
          </div>

          {error && (
            <p className="text-sm text-red-500 text-center">{error}</p>
          )}

          <div className="text-xs text-gray-500 text-center bg-blue-50 p-2 rounded">
            💡 Identifiants de test : <code className="font-mono bg-white px-1">alice@emlyon.com</code> / <code className="font-mono bg-white px-1">password123</code>
          </div>

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
                  Connexion...
                </>
              ) : (
                'Se connecter'
              )}
            </button>
          </div>
        </form>
        <p className="text-center text-sm text-brand-subtle">
          Nouveau sur emlyon connect ?{' '}
          <button onClick={onSwitchToRegister} className="font-semibold text-brand-dark hover:underline">
            Inscrivez-vous maintenant.
          </button>
        </p>
      </div>
    </div>
  );
};

export default LoginScreen;
