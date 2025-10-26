import React, { useState, useCallback, useEffect } from 'react';
import type { User, CheckIn, Event, Feedback, Notification } from './types';
import LoginScreen from './components/LoginScreen';
import RegistrationScreen from './components/RegistrationScreen';
import Dashboard from './components/Dashboard';
import NotificationComponent from './components/Notification';
import LandingPage from './components/LandingPage';
import { supabase } from './services/supabaseClient';
import * as api from './services/api';
import { notifyNewEvent, scheduleEventReminder } from './services/eventNotificationService';

// Données de démonstration pour la carte (remplacées par l'API au runtime)
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
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [notification, setNotification] = useState<Notification | null>(null);
  const [appView, setAppView] = useState<'landing' | 'auth'>('landing');
  const [authView, setAuthView] = useState<'login' | 'register'>('login');

  // Note: Pas de useEffect ici pour éviter les boucles infinies
  // Les données sont chargées manuellement après login/register

  const loadCheckIns = useCallback(async () => {
    try {
      const checkIns = await api.getAllCheckIns();
      setCheckIns(checkIns);
    } catch (error) {
      console.error('Erreur lors du chargement des check-ins:', error);
    }
  }, []);

  const loadEvents = useCallback(async () => {
    try {
      const events = await api.getAllEvents();
      setEvents(events);
    } catch (error) {
      console.error('Erreur lors du chargement des événements:', error);
    }
  }, []);

  const loadFeedbacks = useCallback(async () => {
    try {
      const feedbacks = await api.getAllFeedbacks();
      setFeedbacks(feedbacks);
    } catch (error) {
      console.error('Erreur lors du chargement des feedbacks:', error);
    }
  }, []);

  // Restaurer la session au chargement de l'application
  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    const savedSession = localStorage.getItem('supabase_session');

    if (savedUser && savedSession) {
      try {
        const user = JSON.parse(savedUser);
        setCurrentUser(user);
        setAppView('landing');
        // Charger les données depuis Supabase
        loadCheckIns();
        loadEvents();
        loadFeedbacks();
      } catch (error) {
        console.error('Erreur lors de la restauration de la session:', error);
        localStorage.removeItem('user');
        localStorage.removeItem('supabase_session');
      }
    }
  }, [loadCheckIns, loadEvents, loadFeedbacks]);

  // Polling : Recharger les données toutes les 5 secondes pour simuler le temps réel
  // (Alternative à Realtime qui nécessite early access)
  useEffect(() => {
    if (!currentUser) return;

    // Charger immédiatement
    loadCheckIns();
    loadEvents();
    loadFeedbacks();

    // Puis recharger toutes les 5 secondes
    const intervalId = setInterval(() => {
      loadCheckIns();
      loadEvents();
      loadFeedbacks();
    }, 5000); // 5 secondes

    return () => {
      clearInterval(intervalId);
    };
  }, [currentUser, loadCheckIns, loadEvents, loadFeedbacks]);

  const handleLogin = () => {
    // L'utilisateur a déjà été sauvegardé dans localStorage par LoginScreen
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      try {
        const user = JSON.parse(savedUser);
        setCurrentUser(user);
        showNotification(`Bienvenue, ${user.name} !`, 'success');
        // Charger les données depuis Supabase
        loadCheckIns();
        loadEvents();
        loadFeedbacks();
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
        // Charger les données depuis Supabase
        loadCheckIns();
        loadEvents();
        loadFeedbacks();
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

  const addCheckIn = async (locationName: string, coords: { latitude: number; longitude: number; }, statusEmoji: string | null): Promise<string | null> => {
    if (!currentUser) return null;

    try {
      const checkIn = await api.createCheckIn(currentUser.id, locationName, coords, statusEmoji);

      if (!checkIn) {
        throw new Error('Erreur lors de la création du check-in');
      }

      // Recharger les check-ins depuis Supabase
      await loadCheckIns();
      showNotification(`Vous êtes maintenant localisé(e) à ${locationName}`, 'success');

      // Retourner l'ID du check-in créé
      return checkIn.id;
    } catch (error) {
      console.error('Erreur lors de la création du check-in:', error);
      showNotification('Erreur lors de la création du check-in', 'error');
      return null;
    }
  };

  const updateCheckInStatus = async (checkInId: string, statusEmoji: string) => {
    if (!currentUser) return;

    try {
      const success = await api.updateCheckInStatus(checkInId, statusEmoji);

      if (!success) {
        throw new Error('Erreur lors de la mise à jour du statut');
      }

      // Recharger les check-ins depuis Supabase
      await loadCheckIns();
      showNotification('Statut mis à jour 😊', 'success');
    } catch (error) {
      console.error('Erreur lors de la mise à jour du statut:', error);
      showNotification('Erreur lors de la mise à jour du statut', 'error');
    }
  };

  const createEvent = async (title: string, description: string, date: number, category: string) => {
    if (!currentUser) return;

    try {
      const event = await api.createEvent(currentUser.id, title, description, date, category);

      if (!event) {
        throw new Error('Erreur lors de la création de l\'événement');
      }

      // Recharger les événements depuis Supabase
      await loadEvents();
      showNotification(`Nouvel événement créé : ${title}`, 'info');
      
      // 🔔 Envoyer une notification push à tous les utilisateurs
      await notifyNewEvent(event.id, title, new Date(date));
    } catch (error) {
      console.error('Erreur lors de la création de l\'événement:', error);
      showNotification('Erreur lors de la création de l\'événement', 'error');
    }
  };

  const toggleEventAttendance = async (eventId: string) => {
    if (!currentUser) return;

    try {
      // Trouver l'événement pour savoir si l'utilisateur participe déjà
      const event = events.find(e => e.id === eventId);
      if (!event) {
        console.error('❌ Événement non trouvé:', eventId);
        return;
      }

      const isAttending = event.attendees.some(a => a.id === currentUser.id);

      if (isAttending) {
        // Annuler la participation
        const success = await api.unattendEvent(eventId, currentUser.id);
        if (success) {
          showNotification('Vous ne participez plus à cet événement', 'info');
        }
      } else {
        // S'inscrire
        const success = await api.attendEvent(eventId, currentUser.id);
        if (success) {
          showNotification('Vous participez maintenant à cet événement !', 'success');
          
          // 🔔 Planifier un rappel 2h avant l'événement
          await scheduleEventReminder(eventId, currentUser.id, event.title, new Date(event.date));
        }
      }

      // Recharger les événements
      await loadEvents();
    } catch (error) {
      console.error('Erreur lors de la gestion de la participation:', error);
      showNotification('Erreur lors de la gestion de la participation', 'error');
    }
  };

  const removeEvent = async (eventId: string) => {
    if (!currentUser) return;

    try {
      const success = await api.deleteEvent(eventId);

      if (success) {
        await loadEvents();
        showNotification('Événement supprimé', 'info');
      } else {
        throw new Error('Erreur lors de la suppression');
      }
    } catch (error) {
      console.error('Erreur lors de la suppression de l\'événement:', error);
      showNotification('Erreur lors de la suppression de l\'événement', 'error');
    }
  };

  const handleCreateFeedback = async (title: string, description: string, category: string) => {
    if (!currentUser) return;

    try {
      const feedback = await api.createFeedback(title, description, category, currentUser.id);

      if (!feedback) {
        throw new Error('Erreur lors de la création du feedback');
      }

      await loadFeedbacks();
      showNotification(`Feedback créé : ${title}`, 'success');
    } catch (error) {
      console.error('Erreur lors de la création du feedback:', error);
      showNotification('Erreur lors de la création du feedback', 'error');
    }
  };

  const handleUpvoteFeedback = async (feedbackId: string) => {
    if (!currentUser) return;

    try {
      const success = await api.upvoteFeedback(feedbackId, currentUser.id);

      if (success) {
        await loadFeedbacks();
      }
    } catch (error) {
      console.error('Erreur lors du vote:', error);
      showNotification('Erreur lors du vote', 'error');
    }
  };

  const handleAddComment = async (feedbackId: string, content: string) => {
    if (!currentUser) return;

    try {
      const comment = await api.addFeedbackComment(feedbackId, currentUser.id, content);

      if (!comment) {
        throw new Error('Erreur lors de l\'ajout du commentaire');
      }

      await loadFeedbacks();
      showNotification('Commentaire ajouté', 'success');
    } catch (error) {
      console.error('Erreur lors de l\'ajout du commentaire:', error);
      showNotification('Erreur lors de l\'ajout du commentaire', 'error');
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
          updateCheckInStatus={updateCheckInStatus}
          events={events}
          createEvent={createEvent}
          toggleEventAttendance={toggleEventAttendance}
          feedbacks={feedbacks}
          onCreateFeedback={handleCreateFeedback}
          onUpvoteFeedback={handleUpvoteFeedback}
          onAddComment={handleAddComment}
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
