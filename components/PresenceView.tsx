import React, { useState } from 'react';
import type { CheckIn, User } from '../types';
import { MapPinIcon, MapIcon, ListBulletIcon } from './icons';
import MapComponent from './MapComponent';

interface PresenceViewProps {
  checkIns: CheckIn[];
  addCheckIn: (locationName: string, coords: { latitude: number; longitude: number; }, statusEmoji: string | null) => void;
  currentUser: User;
}

const STATUS_EMOJIS = ['🍻', '🍽️', '📚', '🏋️', '☕', '🎉', '🏠', '💼'];

const PresenceView: React.FC<PresenceViewProps> = ({ checkIns, addCheckIn, currentUser }) => {
  const [locationName, setLocationName] = useState('');
  const [selectedEmoji, setSelectedEmoji] = useState<string | null>(null);
  const [coords, setCoords] = useState<{ latitude: number, longitude: number } | null>(null);
  const [isCheckingIn, setIsCheckingIn] = useState(false);
  const [isLoadingGeo, setIsLoadingGeo] = useState(false);
  const [view, setView] = useState<'map' | 'list'>('map');

  // Filtrer automatiquement les check-ins pour ne montrer que la promotion de l'utilisateur
  // Si l'utilisateur n'a pas de promotion, afficher tous les check-ins
  const filteredCheckIns = currentUser.promotion
    ? checkIns.filter(c => c.user.promotion === currentUser.promotion)
    : checkIns;

  // Détecter automatiquement la position de l'utilisateur au chargement
  React.useEffect(() => {
    console.log('🌍 Détection automatique de la position...');

    if (!navigator.geolocation) {
      console.error('❌ Géolocalisation non supportée');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        console.log('✅ Position automatique obtenue:', position.coords.latitude, position.coords.longitude);
        setCoords({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
      },
      (error) => {
        console.error('❌ Erreur de géolocalisation automatique:', error.code, error.message);
        // Ne pas afficher d'alerte pour l'auto-détection, juste logger l'erreur
      },
      {
        enableHighAccuracy: false,
        timeout: 10000,
        maximumAge: 60000
      }
    );
  }, []); // Une seule fois au chargement

  // Debug logs
  React.useEffect(() => {
    console.log('👤 Current user promotion:', currentUser.promotion);
    console.log('📍 Total check-ins:', checkIns.length);
    console.log('🔍 Filtered check-ins:', filteredCheckIns.length);
  }, [currentUser, checkIns, filteredCheckIns]);

  const handleStartCheckIn = () => {
    console.log('🌍 Demande de géolocalisation...');
    setIsLoadingGeo(true);

    if (!navigator.geolocation) {
      console.error('❌ Géolocalisation non supportée par ce navigateur');
      alert('La géolocalisation n\'est pas supportée par votre navigateur.');
      setIsLoadingGeo(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        console.log('✅ Position obtenue:', position.coords.latitude, position.coords.longitude);
        setCoords({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
        setIsLoadingGeo(false);
        setIsCheckingIn(true);
      },
      (error) => {
        console.error('❌ Erreur de géolocalisation:', error.code, error.message);
        setIsLoadingGeo(false);

        // Utiliser automatiquement la position de l'emlyon Business School
        console.log('📍 Utilisation automatique de la position emlyon Business School');
        alert(
          `⚠️ Impossible d'obtenir votre position réelle (erreur ${error.code}).\n\n` +
          `La position emlyon Business School sera utilisée.\n\n` +
          `Pour utiliser votre vraie position:\n` +
          `1. Connectez-vous à un autre réseau WiFi\n` +
          `2. Ou activez les Services de localisation dans Réglages Système\n` +
          `3. Rechargez la page`
        );

        setCoords({
          latitude: 45.74168340731696,
          longitude: 4.838059171567862
        });

        setIsCheckingIn(true);
      },
      {
        enableHighAccuracy: false, // Changé à false pour être plus permissif
        timeout: 10000,
        maximumAge: 60000 // Accepter une position jusqu'à 60 secondes
      }
    );
  };

  const handleConfirmCheckIn = () => {
    if (locationName.trim() && coords) {
      addCheckIn(locationName.trim(), coords, selectedEmoji);
      setLocationName('');
      setCoords(null);
      setIsCheckingIn(false);
      setSelectedEmoji(null);
    } else {
      alert('Veuillez entrer le nom du lieu.');
    }
  };

  const cancelCheckIn = () => {
    setIsCheckingIn(false);
    setLocationName('');
    setCoords(null);
    setSelectedEmoji(null);
  };

  const timeSince = (date: number) => {
    const seconds = Math.floor((Date.now() - date) / 1000);
    let interval = seconds / 31536000;
    if (interval > 1) return `il y a ${Math.floor(interval)} an(s)`;
    interval = seconds / 2592000;
    if (interval > 1) return `il y a ${Math.floor(interval)} mois`;
    interval = seconds / 86400;
    if (interval > 1) return `il y a ${Math.floor(interval)} jour(s)`;
    interval = seconds / 3600;
    if (interval > 1) return `il y a ${Math.floor(interval)} heure(s)`;
    interval = seconds / 60;
    if (interval > 1) return `il y a ${Math.floor(interval)} minute(s)`;
    return `à l'instant`;
  };

  return (
    <div className="space-y-6">
      <div className="bg-brand-light p-4 rounded-lg">
        {isCheckingIn ? (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <input
                type="text"
                value={locationName}
                onChange={(e) => setLocationName(e.target.value)}
                placeholder="Nom du lieu (ex: Le Dôme)"
                className="w-full px-4 py-2 text-brand-dark bg-brand-secondary border-transparent rounded-md focus:outline-none focus:ring-2 focus:ring-brand-emlyon"
              />
              <button
                onClick={handleConfirmCheckIn}
                disabled={!locationName.trim()}
                className="w-full sm:w-auto px-4 py-2 font-semibold text-white bg-brand-emlyon rounded-md hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2 flex-shrink-0"
              >
                Confirmer
              </button>
              <button onClick={cancelCheckIn} className="text-brand-subtle hover:text-brand-dark transition">Annuler</button>
            </div>
            <div className="flex items-center justify-center gap-2 flex-wrap pt-2">
              <p className="text-sm text-brand-subtle mr-2">Statut :</p>
              {STATUS_EMOJIS.map(emoji => (
                <button
                  key={emoji}
                  onClick={() => setSelectedEmoji(emoji)}
                  className={`p-2 text-2xl rounded-full transition-transform transform hover:scale-125 ${selectedEmoji === emoji ? 'bg-brand-emlyon/30 scale-125' : ''}`}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <button
            onClick={handleStartCheckIn}
            disabled={isLoadingGeo}
            className="w-full px-4 py-3 font-bold text-white bg-brand-emlyon rounded-md hover:opacity-90 transition-all transform hover:scale-105 disabled:opacity-50 disabled:scale-100 flex items-center justify-center gap-2"
          >
            {isLoadingGeo ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                Géolocalisation...
              </>
            ) : (
              <>
                <MapPinIcon className="w-6 h-6" />
                Signaler ma position
              </>
            )}
          </button>
        )}
      </div>

      <div className="bg-brand-light rounded-lg overflow-hidden">
        <div className="p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-brand-secondary">
          <div>
            <h2 className="text-2xl font-bold">Actuellement dehors</h2>
            <p className="text-sm text-brand-subtle mt-1">
              Promotion: {currentUser.promotion || 'Non définie'}
              {!currentUser.promotion && ' (affichage de tous les check-ins)'}
            </p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center gap-1 bg-brand-bg p-1 rounded-lg">
              <button onClick={() => setView('map')} className={`p-2 rounded-md transition ${view === 'map' ? 'bg-brand-emlyon text-white' : 'text-brand-subtle hover:text-brand-dark'}`} aria-label="Vue carte"><MapIcon className="w-5 h-5" /></button>
              <button onClick={() => setView('list')} className={`p-2 rounded-md transition ${view === 'list' ? 'bg-brand-emlyon text-white' : 'text-brand-subtle hover:text-brand-dark'}`} aria-label="Vue liste"><ListBulletIcon className="w-5 h-5" /></button>
            </div>
          </div>
        </div>

        {view === 'map' ? (
          <MapComponent checkIns={filteredCheckIns} currentUserLocation={coords} />
        ) : (
          <div className="divide-y divide-brand-secondary">
            {filteredCheckIns.length > 0 ? (
              filteredCheckIns.map(checkIn => (
                <div key={checkIn.id} className="p-4 flex items-center gap-4 hover:bg-brand-secondary/20 transition-colors">
                  <img src={checkIn.user.avatarUrl} alt={checkIn.user.name} className="w-12 h-12 rounded-md object-cover" />
                  <div className="flex-1">
                    <p className="font-bold text-lg text-brand-dark">{checkIn.user.name}</p>
                    <p className="text-brand-subtle flex items-center gap-1.5"><span className="text-lg">{checkIn.statusEmoji}</span> {checkIn.locationName}</p>
                  </div>
                  <p className="text-sm text-brand-subtle">{timeSince(checkIn.timestamp)}</p>
                </div>
              ))
            ) : (
              <p className="text-brand-subtle text-center py-12">Personne n'a encore signalé sa position. Soyez le premier !</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default PresenceView;