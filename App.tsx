import React, { useState, useCallback, useEffect, useRef } from 'react';
import type { User, CheckIn, Event, Feedback, Notification } from './types';
import LoginScreen from './components/LoginScreen';
import RegistrationScreen from './components/RegistrationScreen';
import Dashboard from './components/Dashboard';
import NotificationComponent from './components/Notification';
import LandingPage from './components/LandingPage';
import { UpdatePrompt } from './components/UpdatePrompt';
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
  const [activeSection, setActiveSection] = useState<'presence' | 'events' | 'feedback' | 'profile'>(() => {
    if (typeof window === 'undefined') return 'presence';
    const stored = localStorage.getItem('activeSection');
    if (stored === 'presence' || stored === 'events' || stored === 'feedback' || stored === 'profile') {
      return stored;
    }
    return 'presence';
  });
  const hasFetchedOnceRef = useRef(false);

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

  // Polling adaptatif : plus fréquent sur l'écran actif, ralenti en arrière-plan
  useEffect(() => {
    if (!currentUser) return;

    const intervals: Array<ReturnType<typeof setInterval>> = [];

    const runIfVisible = (task: () => void) => {
      if (typeof document !== 'undefined' && document.hidden) {
        return false;
      }
      task();
      return true;
    };

    if (!hasFetchedOnceRef.current) {
      const ran = runIfVisible(() => {
        loadCheckIns();
        loadEvents();
        loadFeedbacks();
      });
      if (ran) {
        hasFetchedOnceRef.current = true;
      }
    } else {
      runIfVisible(() => {
        if (activeSection === 'presence') {
          loadCheckIns();
        } else if (activeSection === 'events') {
          loadEvents();
        } else if (activeSection === 'feedback') {
          loadFeedbacks();
        }
      });
    }

    const schedule = (task: () => void, delay: number) => {
      const id = setInterval(() => runIfVisible(task), delay);
      intervals.push(id);
    };

    schedule(loadCheckIns, activeSection === 'presence' ? 15000 : 90000);
    schedule(loadEvents, activeSection === 'events' ? 45000 : 120000);
    schedule(loadFeedbacks, activeSection === 'feedback' ? 60000 : 180000);

    return () => {
      intervals.forEach(clearInterval);
    };
  }, [currentUser, activeSection, loadCheckIns, loadEvents, loadFeedbacks]);

  // Persister la section active pour conserver l'onglet courant
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('activeSection', activeSection);
    }
  }, [activeSection]);

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
    hasFetchedOnceRef.current = false;
    setActiveSection('presence');
    // Nettoyer le localStorage
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('activeSection');
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

  const exportEventToCalendar = useCallback((event: Event) => {
    if (typeof window === 'undefined') return;

    const escapeIcsText = (text: string) =>
      text
        .replace(/\\/g, '\\\\')
        .replace(/;/g, '\\;')
        .replace(/,/g, '\\,')
        .replace(/\r?\n/g, '\\n');

    const pad = (value: number) => value.toString().padStart(2, '0');
    const toUtcDate = (date: Date) =>
      `${date.getUTCFullYear()}${pad(date.getUTCMonth() + 1)}${pad(date.getUTCDate())}T${pad(date.getUTCHours())}${pad(date.getUTCMinutes())}${pad(date.getUTCSeconds())}Z`;

    const startDate = new Date(event.date);
    const endDate = new Date(event.date + 2 * 60 * 60 * 1000); // Durée par défaut : 2h
    const dtStamp = toUtcDate(new Date());
    const dtStart = toUtcDate(startDate);
    const dtEnd = toUtcDate(endDate);

    const summary = escapeIcsText(event.title);
    const description = escapeIcsText(event.description || '');

    const userAgent = navigator.userAgent || '';
    const isIOS = /iP(hone|od|ad)/i.test(userAgent);
    const isAndroid = /Android/i.test(userAgent);

    if (isAndroid) {
      const googleUrl = new URL('https://calendar.google.com/calendar/render');
      googleUrl.searchParams.set('action', 'TEMPLATE');
      googleUrl.searchParams.set('text', event.title);
      if (event.description) {
        googleUrl.searchParams.set('details', event.description);
      }
      googleUrl.searchParams.set('dates', `${dtStart}/${dtEnd}`);

      const opened = window.open(googleUrl.toString(), '_blank', 'noopener,noreferrer');
      if (!opened) {
        console.warn('Impossible d\'ouvrir Google Calendar, téléchargement ICS en secours.');
      } else {
        return;
      }
    }

    const icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//emlyon connect//FR',
      'CALSCALE:GREGORIAN',
      'BEGIN:VEVENT',
      `UID:${event.id}@emlyon-connect`,
      `SUMMARY:${summary}`,
      `DESCRIPTION:${description}`,
      `DTSTAMP:${dtStamp}`,
      `DTSTART:${dtStart}`,
      `DTEND:${dtEnd}`,
      'END:VEVENT',
      'END:VCALENDAR',
    ].join('\r\n');

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const slug = event.title
      ? event.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 60)
      : 'evenement';

    if (isIOS) {
      window.location.assign(url);
      setTimeout(() => URL.revokeObjectURL(url), 10000);
      return;
    }

    const link = document.createElement('a');
    link.href = url;
    link.download = `${slug || 'evenement'}.ics`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, []);

  const addCheckIn = async (locationName: string, coords: { latitude: number; longitude: number; } | null, statusEmoji: string | null): Promise<string | null> => {
    if (!currentUser) return null;

    try {
      const checkIn = await api.createCheckIn(currentUser.id, locationName, coords, statusEmoji);

      if (!checkIn) {
        throw new Error('Erreur lors de la création du check-in');
      }

      // Recharger les check-ins depuis Supabase
      await loadCheckIns();
      if (coords) {
        showNotification(`Vous êtes maintenant localisé(e) à ${locationName}`, 'success');
      } else {
        showNotification('Localisation indisponible pour le moment. Activez vos services de localisation pour apparaître sur la carte.', 'info');
      }

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

  interface CreateEventPayload {
    title: string;
    description: string;
    date: number | null;
    category: string;
    pollOptions?: Event['pollOptions'];
    pollType?: Event['pollType'];
    pollClosesAt?: number | null;
  }

  const createEvent = async ({ title, description, date, category, pollOptions, pollType, pollClosesAt }: CreateEventPayload) => {
    if (!currentUser) return;

    try {
      const event = await api.createEvent(
        currentUser.id,
        title,
        description,
        date,
        category,
        pollOptions || null,
        pollType ?? null,
        pollClosesAt ?? null
      );

      if (!event) {
        showNotification('Impossible de créer l\'événement pour le moment', 'error');
        return;
      }

      const asyncJobs: Promise<unknown>[] = [loadEvents()];

      console.log('🔔 [DEBUG] Envoi broadcast pour événement:', event.id, event.title);
      asyncJobs.push(
        api.broadcastNewEvent(event)
          .then(success => {
            console.log('✅ [DEBUG] Broadcast terminé, succès:', success);
            return success;
          })
          .catch(err => {
            console.error('❌ [DEBUG] Erreur broadcast événement:', err);
            throw new Error('broadcast');
          })
      );

      if ((!event.pollOptions || event.pollOptions.length === 0) && event.date) {
        asyncJobs.push(
          notifyNewEvent(event.id, title, new Date(event.date)).catch(err => {
            console.warn('Notification locale non envoyée:', err);
          })
        );
      }

      const results = await Promise.allSettled(asyncJobs);
      const broadcastFailed = results.some(result => result.status === 'rejected' && result.reason instanceof Error && result.reason.message === 'broadcast');
      if (broadcastFailed) {
        showNotification('Événement créé, mais envoi des notifications impossible pour le moment.', 'error');
      } else {
        showNotification(`Nouvel événement créé : ${title}`, 'info');
      }
    } catch (error) {
      console.error('Erreur lors de la création de l\'événement:', error);
      if (error instanceof Error && (error as any).code === 'MISSING_POLL_COLUMNS') {
        showNotification('Active les sondages en ajoutant les nouvelles colonnes dans Supabase (voir README)', 'error');
      } else {
        showNotification('Erreur lors de la création de l\'événement', 'error');
      }
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
          if (event.date) {
            exportEventToCalendar(event);
            showNotification('Participation confirmée ! L’événement a été ajouté à votre calendrier 📅', 'success');

            try {
              // 🔔 Planifier un rappel 2h avant l'événement
              await scheduleEventReminder(eventId, currentUser.id, event.title, new Date(event.date));
            } catch (reminderError) {
              console.error('Erreur lors de la planification du rappel:', reminderError);
            }
          } else {
            showNotification('Participation confirmée ! Tu seras notifié quand la date sera fixée.', 'info');
          }
        }
      }

      // Recharger les événements
      await loadEvents();
    } catch (error) {
      console.error('Erreur lors de la gestion de la participation:', error);
      showNotification('Erreur lors de la gestion de la participation', 'error');
    }
  };

  const voteOnEventPollOption = async (eventId: string, optionId: string) => {
    if (!currentUser) return;

    try {
      const success = await api.voteEventPollOption(eventId, optionId, currentUser.id);

      if (!success) {
        throw new Error('Vote non pris en compte');
      }

      await loadEvents();
      showNotification('Ton vote a été enregistré ✅', 'success');
    } catch (error) {
      console.error('Erreur lors du vote pour le sondage:', error);
      showNotification('Erreur lors de l\'enregistrement du vote', 'error');
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
          removeEvent={removeEvent}
          voteOnPollOption={voteOnEventPollOption}
          feedbacks={feedbacks}
          onCreateFeedback={handleCreateFeedback}
          onUpvoteFeedback={handleUpvoteFeedback}
          onAddComment={handleAddComment}
          activeView={activeSection}
          onActiveViewChange={setActiveSection}
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
      <UpdatePrompt />
      {renderContent()}
    </div>
  );
};

export default App;
