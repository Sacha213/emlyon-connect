import React, { useState, useEffect } from 'react';
import type { User, CheckIn, Event, Feedback, AppView } from '../types';
import Header from './Header';
import PresenceView from './PresenceView';
import EventsView from './EventsView';
import FeedbackView from './FeedbackView';
import { AvatarUpload } from './AvatarUpload';
import { NotificationPrompt } from './NotificationPrompt';
import BottomNav from './BottomNav';
import InstallPwaPrompt from './InstallPwaPrompt';

interface DashboardProps {
  currentUser: User;
  onLogout: () => void;
  checkIns: CheckIn[];
  addCheckIn: (
    locationName: string,
    coords: { latitude: number; longitude: number } | null,
    statusEmoji: string | null,
  ) => Promise<string | null>;
  updateCheckInStatus: (checkInId: string, statusEmoji: string) => void;
  events: Event[];
  createEvent: (payload: {
    title: string;
    description: string;
    date: number | null;
    category: string;
    pollOptions?: Event['pollOptions'];
    pollType?: Event['pollType'];
    pollClosesAt?: number | null;
  }) => void;
  toggleEventAttendance: (eventId: string) => void;
  removeEvent: (eventId: string) => Promise<void>;
  voteOnPollOption: (eventId: string, optionId: string) => void;
  feedbacks: Feedback[];
  onCreateFeedback: (title: string, description: string, category: string) => void;
  onUpvoteFeedback: (feedbackId: string) => void;
  onAddComment: (feedbackId: string, content: string) => void;
  activeView: 'presence' | 'events' | 'feedback' | 'profile';
  onActiveViewChange: (view: AppView | 'profile') => void;
}

const Dashboard: React.FC<DashboardProps> = ({
  currentUser: initialUser,
  onLogout,
  checkIns,
  addCheckIn,
  updateCheckInStatus,
  events,
  createEvent,
  toggleEventAttendance,
  removeEvent,
  voteOnPollOption,
  feedbacks,
  onCreateFeedback,
  onUpvoteFeedback,
  onAddComment,
  activeView,
  onActiveViewChange,
}) => {
  const [currentUser, setCurrentUser] = useState(initialUser);

  useEffect(() => {
    setCurrentUser(initialUser);
  }, [initialUser]);

  const isProfile = activeView === 'profile';

  const handleAvatarUpdate = (newAvatarUrl: string) => {
    const updatedUser = { ...currentUser, avatarUrl: newAvatarUrl };
    setCurrentUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
  };

  const renderMainContent = () => {
    if (isProfile) {
      return (
        <div className="rounded-2xl border border-brand-secondary/50 bg-brand-dark/90 p-8 shadow-xl backdrop-blur">
          <h2 className="text-2xl font-bold text-brand-light mb-6 text-center">
            Mon Profil
          </h2>
          <div className="flex flex-col items-center">
            <AvatarUpload currentAvatar={currentUser.avatarUrl} onUploadSuccess={handleAvatarUpdate} />
            <div className="mt-6 text-center">
              <h3 className="text-xl font-semibold text-white">{currentUser.name}</h3>
              <p className="text-sm text-brand-subtle">{currentUser.email}</p>
            </div>
          </div>

          <div className="mt-8">
            <h3 className="text-lg font-semibold text-brand-light mb-4">Paramètres</h3>
            <NotificationPrompt userId={currentUser.id} autoPrompt={false} />
          </div>
        </div>
      );
    }

    if (activeView === 'events') {
      return (
        <EventsView
          events={events}
          createEvent={createEvent}
          toggleEventAttendance={toggleEventAttendance}
          removeEvent={removeEvent}
          voteOnPollOption={voteOnPollOption}
          currentUser={currentUser}
        />
      );
    }

    if (activeView === 'feedback') {
      return (
        <FeedbackView
          feedbacks={feedbacks}
          currentUser={currentUser}
          onCreateFeedback={onCreateFeedback}
          onUpvoteFeedback={onUpvoteFeedback}
          onAddComment={onAddComment}
        />
      );
    }

    return (
      <PresenceView
        checkIns={checkIns}
        addCheckIn={addCheckIn}
        updateCheckInStatus={updateCheckInStatus}
        currentUser={currentUser}
      />
    );
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header
        currentUser={currentUser}
        onLogout={onLogout}
        onProfileClick={() => onActiveViewChange('profile')}
      />

      <main className="flex-grow p-4 sm:p-6 md:p-8 pb-24">
        <div className="max-w-4xl mx-auto">
          <InstallPwaPrompt />

          <div className="mb-8 hidden md:block">
            <div className="flex space-x-8">
              <button
                onClick={() => onActiveViewChange('presence')}
                className={`flex items-center justify-center gap-2 text-lg font-bold transition-colors ${activeView === 'presence' ? 'text-brand-dark' : 'text-brand-subtle hover:text-brand-dark'}`}
              >
                Carte
              </button>
              <button
                onClick={() => onActiveViewChange('events')}
                className={`flex items-center justify-center gap-2 text-lg font-bold transition-colors ${activeView === 'events' ? 'text-brand-dark' : 'text-brand-subtle hover:text-brand-dark'}`}
              >
                Événements
              </button>
              <button
                onClick={() => onActiveViewChange('feedback')}
                className={`flex items-center justify-center gap-2 text-lg font-bold transition-colors ${activeView === 'feedback' ? 'text-brand-dark' : 'text-brand-subtle hover:text-brand-dark'}`}
              >
                💬 Feedback
              </button>
              <button
                onClick={() => onActiveViewChange('profile')}
                className={`flex items-center justify-center gap-2 text-lg font-bold transition-colors ${isProfile ? 'text-brand-dark' : 'text-brand-subtle hover:text-brand-dark'}`}
              >
                Mon Profil
              </button>
            </div>
          </div>

          {renderMainContent()}
        </div>
      </main>

      <BottomNav
        active={isProfile ? 'profile' : activeView}
        onChange={(tab) => onActiveViewChange(tab)}
      />
    </div>
  );
};

export default Dashboard;