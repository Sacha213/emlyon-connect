import React, { useState, useCallback, useEffect } from 'react';
import type { User, CheckIn, Event, Notification } from './types';
import LoginScreen from './components/LoginScreen';
import RegistrationScreen from './components/RegistrationScreen';
import Dashboard from './components/Dashboard';
import NotificationComponent from './components/Notification';
import LandingPage from './components/LandingPage';

// Mock Data
const MOCK_USERS: User[] = [
  { id: '1', name: 'Alice Dubois', avatarUrl: 'https://picsum.photos/id/1027/200/200', promotion: 'EMI 2025' },
  { id: '2', name: 'Bob Leclerc', avatarUrl: 'https://picsum.photos/id/1005/200/200', promotion: 'EMI 2025' },
  { id: '3', name: 'Carla Martin', avatarUrl: 'https://picsum.photos/id/1012/200/200', promotion: 'EMI 2026' },
  { id: '4', name: 'David Bernard', avatarUrl: 'https://picsum.photos/id/1013/200/200', promotion: 'EMI 2024' },
  { id: '5', name: 'Eva Petit', avatarUrl: 'https://picsum.photos/id/1015/200/200', promotion: 'EMI 2024' },
  { id: '6', name: 'François Durand', avatarUrl: 'https://picsum.photos/id/1025/200/200', promotion: 'EMI 2025' },
  { id: '7', name: 'Gloria Robert', avatarUrl: 'https://picsum.photos/id/1028/200/200', promotion: 'EMI 2026' },
  { id: '8', name: 'Hugo Moreau', avatarUrl: 'https://picsum.photos/id/103/200/200', promotion: 'EMI Test' },
  { id: '9', name: 'Ines Simon', avatarUrl: 'https://picsum.photos/id/1031/200/200', promotion: 'EMI Test' },
  { id: '10', name: 'Jules Laurent', avatarUrl: 'https://picsum.photos/id/1033/200/200', promotion: 'EMI 2025' },
];


const ME_USER: User = { id: 'user-me', name: 'Jean Dupont', avatarUrl: 'https://picsum.photos/id/1011/200/200', promotion: 'EMI 2025' };

const MOCK_EVENTS: Event[] = [
  {
    id: 'e1',
    title: 'Soirée Bière-Pong',
    description: 'Rendez-vous au bar "Le Truskel" pour un tournoi amical.',
    date: new Date().getTime() + 2 * 24 * 3600 * 1000, // Dans 2 jours
    creator: MOCK_USERS[0],
    attendees: [MOCK_USERS[0], MOCK_USERS[1], MOCK_USERS[3], MOCK_USERS[5]],
  },
  {
    id: 'e2',
    title: 'Session Cinéma : Dune 2',
    description: "Allons voir le dernier chef-d'œuvre de SF ensemble au Grand Rex.",
    date: new Date().getTime() + 4 * 24 * 3600 * 1000, // Dans 4 jours
    creator: MOCK_USERS[1],
    attendees: [MOCK_USERS[1], MOCK_USERS[4]],
  },
  {
    id: 'e3',
    title: 'Pique-nique au Champ de Mars',
    description: 'Apportez à manger, à boire et votre bonne humeur pour un après-midi détente avec vue sur la Tour Eiffel.',
    date: new Date().getTime() + 7 * 24 * 3600 * 1000, // Dans 1 semaine
    creator: MOCK_USERS[2],
    attendees: [MOCK_USERS[2], MOCK_USERS[6], MOCK_USERS[7], MOCK_USERS[8], MOCK_USERS[9]],
  },
  {
    id: 'e4',
    title: 'Visite du Musée d\'Orsay',
    description: 'Explorons ensemble les chefs-d\'œuvre de l\'impressionnisme. Rendez-vous devant l\'entrée principale.',
    date: new Date().getTime() + 10 * 24 * 3600 * 1000, // Dans 10 jours
    creator: MOCK_USERS[8],
    attendees: [MOCK_USERS[8], MOCK_USERS[0]],
  }
];

const MOCK_CHECKINS: CheckIn[] = [
  // Cluster 1: Le Truskel Bar
  { id: 'c1', user: MOCK_USERS[0], locationName: 'Le Truskel Bar', latitude: 48.8733, longitude: 2.3364, timestamp: Date.now() - 3600 * 1000, statusEmoji: '🍻' }, // il y a 1h
  { id: 'c2', user: MOCK_USERS[1], locationName: 'Le Truskel Bar', latitude: 48.8735, longitude: 2.3366, timestamp: Date.now() - 1800 * 1000, statusEmoji: '🍻' }, // il y a 30m
  { id: 'c3', user: MOCK_USERS[2], locationName: 'Le Truskel Bar', latitude: 48.8734, longitude: 2.3365, timestamp: Date.now() - 600 * 1000, statusEmoji: '🎉' },   // il y a 10m

  // Cluster 2: Paname Brewing Company
  { id: 'c4', user: MOCK_USERS[3], locationName: 'Paname Brewing Co.', latitude: 48.8820, longitude: 2.3700, timestamp: Date.now() - 7200 * 1000, statusEmoji: '🍻' }, // il y a 2h
  { id: 'c5', user: MOCK_USERS[4], locationName: 'Paname Brewing Co.', latitude: 48.8821, longitude: 2.3702, timestamp: Date.now() - 5400 * 1000, statusEmoji: '🍽️' }, // il y a 1h30
  { id: 'c6', user: MOCK_USERS[5], locationName: 'Paname Brewing Co.', latitude: 48.8819, longitude: 2.3698, timestamp: Date.now() - 900 * 1000, statusEmoji: '🍻' },  // il y a 15m

  // Individuels
  { id: 'c7', user: MOCK_USERS[6], locationName: 'Musée du Louvre', latitude: 48.8606, longitude: 2.3376, timestamp: Date.now() - 10800 * 1000, statusEmoji: '🎨' }, // il y a 3h
  { id: 'c8', user: MOCK_USERS[7], locationName: 'Tour Eiffel', latitude: 48.8584, longitude: 2.2945, timestamp: Date.now() - 1200 * 1000, statusEmoji: '📸' },   // il y a 20m
  { id: 'c9', user: MOCK_USERS[8], locationName: 'Bibliothèque Sainte-Geneviève', latitude: 48.8465, longitude: 2.3460, timestamp: Date.now() - 14400 * 1000, statusEmoji: '📚' }, // il y a 4h
];

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [checkIns, setCheckIns] = useState<CheckIn[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [notification, setNotification] = useState<Notification | null>(null);
  const [appView, setAppView] = useState<'landing' | 'auth'>('landing');
  const [authView, setAuthView] = useState<'login' | 'register'>('login');

  // Charger les données depuis l'API quand un utilisateur est connecté
  useEffect(() => {
    if (currentUser) {
      loadCheckIns();
      loadEvents();
    }
  }, [currentUser]);

  const loadCheckIns = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch('http://localhost:3001/api/checkins', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setCheckIns(data.data || []);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des check-ins:', error);
    }
  };

  const loadEvents = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch('http://localhost:3001/api/events', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setEvents(data.data || []);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des événements:', error);
    }
  };

  // Restaurer la session au chargement de l'application
  useEffect(() => {
    const token = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');

    if (token && savedUser) {
      try {
        const user = JSON.parse(savedUser);
        setCurrentUser(user);
        setAppView('landing'); // L'utilisateur est connecté, on ne montre pas le landing
        // Charger les données depuis l'API
        loadCheckIns();
        loadEvents();
      } catch (error) {
        console.error('Erreur lors de la restauration de la session:', error);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
  }, []);

  const handleLogin = () => {
    // L'utilisateur a déjà été sauvegardé dans localStorage par LoginScreen
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      try {
        const user = JSON.parse(savedUser);
        setCurrentUser(user);
        showNotification(`Bienvenue, ${user.name} !`, 'success');
        // Charger les données depuis l'API
        loadCheckIns();
        loadEvents();
      } catch (error) {
        console.error('Erreur lors de la lecture de l\'utilisateur:', error);
      }
    }
  };

  const handleRegister = (name: string, email: string) => {
    // L'utilisateur a déjà été sauvegardé dans localStorage par RegistrationScreen
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      try {
        const user = JSON.parse(savedUser);
        setCurrentUser(user);
        showNotification(`Bienvenue, ${user.name} ! Votre compte a été créé.`, 'success');
        // Charger les données depuis l'API
        loadCheckIns();
        loadEvents();
      } catch (error) {
        console.error('Erreur lors de la lecture de l\'utilisateur:', error);
      }
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setCheckIns([]); // Réinitialiser les check-ins
    setEvents([]); // Réinitialiser les événements
    setAppView('landing');
    // Nettoyer le localStorage
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    showNotification('Vous avez été déconnecté', 'info');
  };

  const showNotification = (message: string, type: Notification['type']) => {
    setNotification({ id: `notif-${Date.now()}`, message, type });
  };

  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  const addCheckIn = async (locationName: string, coords: { latitude: number; longitude: number; }, statusEmoji: string | null) => {
    if (!currentUser) return;

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        showNotification('Vous devez être connecté', 'error');
        return;
      }

      // Appeler l'API pour créer le check-in
      const response = await fetch('http://localhost:3001/api/checkins', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          locationName,
          latitude: coords.latitude,
          longitude: coords.longitude,
          statusEmoji
        })
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la création du check-in');
      }

      // Recharger les check-ins depuis l'API
      await loadCheckIns();
      showNotification(`Vous êtes maintenant localisé(e) à ${locationName}`, 'success');
    } catch (error) {
      console.error('Erreur lors de la création du check-in:', error);
      showNotification('Erreur lors de la création du check-in', 'error');
    }
  };

  const createEvent = async (title: string, description: string, date: number) => {
    if (!currentUser) return;

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        showNotification('Vous devez être connecté', 'error');
        return;
      }

      // Appeler l'API pour créer l'événement
      const response = await fetch('http://localhost:3001/api/events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          title,
          description,
          date: new Date(date).toISOString()
        })
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la création de l\'événement');
      }

      // Recharger les événements depuis l'API
      await loadEvents();
      showNotification(`Nouvel événement créé : ${title}`, 'info');
    } catch (error) {
      console.error('Erreur lors de la création de l\'événement:', error);
      showNotification('Erreur lors de la création de l\'événement', 'error');
    }
  };

  const toggleEventAttendance = async (eventId: string) => {
    if (!currentUser) return;

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        showNotification('Vous devez être connecté', 'error');
        return;
      }

      // Trouver l'événement pour savoir si l'utilisateur participe déjà
      const event = events.find(e => e.id === eventId);
      if (!event) {
        console.error('❌ Événement non trouvé:', eventId);
        return;
      }

      console.log('🔍 Event trouvé:', event);
      console.log('👤 CurrentUser ID:', currentUser.id);
      console.log('👥 Attendees:', event.attendees);

      const isAttending = event.attendees.some(a => a.id === currentUser.id);
      console.log('✅ Is attending:', isAttending);

      // Utiliser POST pour participer, DELETE pour quitter
      const method = isAttending ? 'DELETE' : 'POST';
      console.log(`📡 Méthode HTTP utilisée: ${method} pour l'événement ${eventId}`);

      const response = await fetch(`http://localhost:3001/api/events/${eventId}/attend`, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('❌ Erreur API:', errorData);
        throw new Error(errorData.message || 'Erreur lors de la participation à l\'événement');
      }

      console.log('✅ Participation modifiée avec succès');
      // Recharger les événements depuis l'API
      await loadEvents();
      showNotification(isAttending ? 'Participation annulée' : 'Vous participez à l\'événement', 'success');
    } catch (error) {
      console.error('💥 Erreur lors de la participation à l\'événement:', error);
      showNotification('Erreur lors de la participation', 'error');
    }
  };

  const renderAuthFlow = () => {
    if (authView === 'login') {
      return <LoginScreen
        onLogin={handleLogin}
        onSwitchToRegister={() => setAuthView('register')}
        onBack={() => setAppView('landing')}
      />;
    }
    return <RegistrationScreen
      onRegister={handleRegister}
      onSwitchToLogin={() => setAuthView('login')}
      onBack={() => setAppView('landing')}
    />;
  };

  const renderContent = () => {
    if (currentUser) {
      return (
        <Dashboard
          currentUser={currentUser}
          onLogout={handleLogout}
          checkIns={checkIns}
          addCheckIn={addCheckIn}
          events={events}
          createEvent={createEvent}
          toggleEventAttendance={toggleEventAttendance}
        />
      );
    }
    if (appView === 'landing') {
      return <LandingPage onJoin={() => { setAuthView('login'); setAppView('auth'); }} />;
    }
    return renderAuthFlow();
  };

  return (
    <div className="min-h-screen bg-brand-bg">
      {notification && <NotificationComponent notification={notification} onClose={() => setNotification(null)} />}
      {renderContent()}
    </div>
  );
};

export default App;
