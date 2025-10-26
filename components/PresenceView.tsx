import React, { useState, useEffect, useRef } from 'react';
import type { CheckIn, User } from '../types';
import MapComponent from './MapComponent';
import StatusPickerSheet from './StatusPickerSheet';

interface PresenceViewProps {
  checkIns: CheckIn[];
  addCheckIn: (locationName: string, coords: { latitude: number; longitude: number; }, statusEmoji: string | null) => Promise<string | null>;
  updateCheckInStatus: (checkInId: string, statusEmoji: string) => void;
  currentUser: User;
}

const STATUS_EMOJIS = ['🍻', '🍽️', '📚', '🏋️', '☕', '🎉', '🏠', '💼', '👻'];

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

const PresenceView: React.FC<PresenceViewProps> = ({ checkIns, addCheckIn, updateCheckInStatus, currentUser }) => {
  const [selectedEmoji, setSelectedEmoji] = useState<string | null>(() => {
    // Initialiser le statut depuis le localStorage
    return localStorage.getItem('lastStatus') || null;
  });
  const [coords, setCoords] = useState<{ latitude: number, longitude: number } | null>(null);
  const [currentCheckInId, setCurrentCheckInId] = useState<string | null>(null);
  const [showStatusSelector, setShowStatusSelector] = useState(false);
  const [showStatusSheet, setShowStatusSheet] = useState(false);

  // Utiliser useRef pour persister l'état même après démontage du composant
  const hasAutoCheckedInRef = useRef(false);

  // Filtrer automatiquement les check-ins pour ne montrer que la promotion de l'utilisateur
  // Si l'utilisateur n'a pas de promotion, afficher tous les check-ins
  // Exclure les utilisateurs en mode fantôme (sauf soi-même)
  const filteredCheckIns = currentUser.promotion
    ? checkIns.filter(c =>
      c.user.promotion === currentUser.promotion &&
      (c.statusEmoji !== '👻' || c.user.id === currentUser.id)
    )
    : checkIns.filter(c => c.statusEmoji !== '👻' || c.user.id === currentUser.id);

  // Effet pour synchroniser l'état local avec les check-ins chargés
  useEffect(() => {
    const userCheckIn = checkIns.find(c => c.user.id === currentUser.id);
    if (userCheckIn) {
      // Si un check-in existe, on met à jour l'état local
      hasAutoCheckedInRef.current = true;
      setCurrentCheckInId(userCheckIn.id);
      // Utiliser le statut du check-in, sinon le statut local, sinon '📚'
      const newStatus = userCheckIn.statusEmoji || selectedEmoji || '📚';
      setSelectedEmoji(newStatus);
      localStorage.setItem('lastStatus', newStatus); // Mettre à jour le localStorage
      setShowStatusSelector(true);
      setCoords({ latitude: userCheckIn.latitude, longitude: userCheckIn.longitude });
    }
  }, [checkIns, currentUser.id, selectedEmoji]);

  // Effet pour créer le check-in initial, ne s'exécute qu'une fois
  useEffect(() => {
    // Si un check-in a déjà été trouvé ou créé, on ne fait rien
    if (hasAutoCheckedInRef.current) {
      return;
    }

    // Marquer comme "en cours" pour ne pas le lancer plusieurs fois
    hasAutoCheckedInRef.current = true;
    console.log('🌍 Aucun check-in existant, tentative de création...');

    const performAutoCheckIn = async (coords: { latitude: number; longitude: number }, locationName: string) => {
      console.log('🚀 Création du check-in en cours...');
      // Utiliser le dernier statut connu ou '📚' par défaut
      const statusToSet = localStorage.getItem('lastStatus') || '📚';
      await addCheckIn(locationName, coords, statusToSet);
      // Pas besoin de mettre à jour l'état ici, l'effet de synchronisation le fera
      // quand le nouveau check-in arrivera avec le prochain polling.
      console.log('✅ Commande de création de check-in envoyée avec le statut:', statusToSet);
    };

    if (!navigator.geolocation) {
      console.error('❌ Géolocalisation non supportée, utilisation de la position par défaut.');
      const defaultCoords = { latitude: 45.74168340731696, longitude: 4.838059171567862 };
      performAutoCheckIn(defaultCoords, 'emlyon Business School');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        console.log('✅ Position obtenue:', position.coords);
        const coords = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        };
        setCoords(coords); // Mettre à jour l'état local immédiatement
        performAutoCheckIn(coords, 'Ma position');
      },
      (error) => {
        console.error('❌ Erreur de géolocalisation:', error.message);
        console.error('❌ Code d\'erreur:', error.code);
        console.error('❌ Détails:', {
          PERMISSION_DENIED: error.code === 1,
          POSITION_UNAVAILABLE: error.code === 2,
          TIMEOUT: error.code === 3
        });
        console.log('📍 Utilisation de la position emlyon par défaut.');
        const defaultCoords = {
          latitude: 45.74168340731696,
          longitude: 4.838059171567862
        };
        setCoords(defaultCoords); // Mettre à jour l'état local pour la position par défaut aussi
        performAutoCheckIn(defaultCoords, 'emlyon Business School');
      },
      {
        enableHighAccuracy: true,  // Activé pour une meilleure précision
        timeout: 30000,            // 30 secondes au lieu de 10
        maximumAge: 0              // Pas de cache, toujours une position fraîche
      }
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Le tableau vide est CRUCIAL pour ne l'exécuter qu'une fois

  // Debug logs et synchronisation du check-in existant
  React.useEffect(() => {
    console.log('👤 Current user promotion:', currentUser.promotion);
    console.log('📍 Total check-ins:', checkIns.length);
    console.log('🔍 Filtered check-ins:', filteredCheckIns.length);
    console.log('�️ Current coords:', coords);
  }, [currentUser.promotion, checkIns.length, filteredCheckIns.length, coords]);

  const handleUpdateStatus = (emoji: string) => {
    if (!currentCheckInId) {
      console.error('❌ Pas de check-in actuel à mettre à jour');
      return;
    }

    console.log('🔄 Mise à jour du statut vers:', emoji);
    updateCheckInStatus(currentCheckInId, emoji);
    setSelectedEmoji(emoji);
    localStorage.setItem('lastStatus', emoji); // Sauvegarder le statut
    setShowStatusSheet(false);
  };

  const currentStatusLabel = selectedEmoji ? STATUS_LABELS[selectedEmoji] || '' : '';

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
    <div className="space-y-4">
      {/* Carte et sélecteur de statut côte à côte */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Carte principale (2/3 de la largeur sur grand écran) */}
        <div className="lg:col-span-2 bg-brand-light rounded-lg overflow-hidden shadow-lg relative z-0">
          <MapComponent
            checkIns={filteredCheckIns}
            currentUserLocation={coords}
          />

        </div>

        {/* Sélecteur de statut à droite (1/3 de la largeur) */}
        {showStatusSelector && (
          <div className="hidden md:flex bg-brand-light rounded-lg p-4 flex-col justify-center">
            <h3 className="text-sm font-semibold text-brand-dark mb-3 text-center">
              Mon statut {selectedEmoji && `: ${selectedEmoji}`}
            </h3>
            <div className="grid grid-cols-2 gap-3">
              {STATUS_EMOJIS.map(emoji => (
                <button
                  key={emoji}
                  onClick={() => handleUpdateStatus(emoji)}
                  className={`p-3 text-3xl rounded-lg transition-all transform hover:scale-110 hover:bg-brand-emlyon/20 ${selectedEmoji === emoji ? 'bg-brand-emlyon/30 scale-110 ring-2 ring-brand-emlyon' : 'bg-brand-secondary'
                    }`}
                  title={
                    emoji === '🍻' ? 'Soirée' :
                      emoji === '🍽️' ? 'Restaurant' :
                        emoji === '📚' ? 'Étude' :
                          emoji === '🏋️' ? 'Sport' :
                            emoji === '☕' ? 'Café' :
                              emoji === '🎉' ? 'Fête' :
                                emoji === '🏠' ? 'Maison' :
                                  emoji === '💼' ? 'Travail' :
                                    emoji === '👻' ? 'Mode Fantôme (invisible)' : ''
                  }
                >
                  {emoji}
                </button>
              ))}
            </div>
            <p className="text-xs text-brand-subtle text-center mt-3">
              🍻 Soirée • 🍽️ Restaurant<br />
              📚 Étude • 🏋️ Sport<br />
              ☕ Café • 🎉 Fête<br />
              🏠 Maison • 💼 Travail<br />
              👻 Mode Fantôme
            </p>
          </div>
        )}
      </div>

      {showStatusSelector && (
        <div className="md:hidden">
          <button
            onClick={() => setShowStatusSheet(true)}
            className="fixed right-4 z-[1150] flex items-center gap-3 rounded-full bg-brand-dark/95 text-brand-bg shadow-2xl px-5 py-3 text-sm font-semibold ring-1 ring-white/10 backdrop-blur"
            style={{ bottom: `calc(env(safe-area-inset-bottom) + 88px)` }}
          >
            <span className="text-xl" aria-hidden>{selectedEmoji || '📍'}</span>
            <div className="text-left leading-tight">
              <p className="text-xs uppercase tracking-wide text-brand-subtle">Mon statut</p>
              <p>{currentStatusLabel || 'Choisir un statut'}</p>
            </div>
          </button>
        </div>
      )}

      {/* Liste des personnes actuellement dehors */}
      <div className="bg-brand-light rounded-lg overflow-hidden">

        {showStatusSelector && showStatusSheet && (
          <StatusPickerSheet
            options={STATUS_EMOJIS}
            selected={selectedEmoji}
            onSelect={handleUpdateStatus}
            onClose={() => setShowStatusSheet(false)}
          />
        )}
        <div className="p-4 border-b border-brand-secondary">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <span>👥</span>
            Actuellement dehors
            <span className="ml-auto text-sm font-normal text-brand-subtle">
              {filteredCheckIns.length} personne{filteredCheckIns.length > 1 ? 's' : ''}
            </span>
          </h2>
          <p className="text-sm text-brand-subtle mt-1">
            Promotion: {currentUser.promotion || 'Toutes'}
          </p>
        </div>
        <div className="divide-y divide-brand-secondary max-h-96 overflow-y-auto">
          {filteredCheckIns.length > 0 ? (
            filteredCheckIns.map(checkIn => (
              <div key={checkIn.id} className="p-4 flex items-center gap-4 hover:bg-brand-secondary/20 transition-colors">
                <img src={checkIn.user.avatarUrl} alt={checkIn.user.name} className="w-12 h-12 rounded-md object-cover" />
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-brand-dark">{checkIn.user.name}</p>
                  <p className="text-brand-subtle flex items-center gap-1.5 truncate">
                    <span className="text-lg">{checkIn.statusEmoji}</span>
                    {checkIn.locationName}
                  </p>
                </div>
                <p className="text-sm text-brand-subtle whitespace-nowrap">{timeSince(checkIn.timestamp)}</p>
              </div>
            ))
          ) : (
            <p className="text-brand-subtle text-center py-12">Personne n'a encore signalé sa position.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default PresenceView;