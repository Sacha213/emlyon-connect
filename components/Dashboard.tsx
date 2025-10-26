import React, { useState } from 'react';
import type { User, CheckIn, Event, Feedback, AppView } from '../types';
import Header from './Header';
import PresenceView from './PresenceView';
import EventsView from './EventsView';
import FeedbackView from './FeedbackView';
import { AvatarUpload } from './AvatarUpload';
import { NotificationPrompt } from './NotificationPrompt';
import BottomNav from './BottomNav';
import InstallPwaPrompt from './InstallPwaPrompt';
import { UsersIcon, CalendarIcon } from './icons';

interface DashboardProps {
  currentUser: User;
  onLogout: () => void;
  checkIns: CheckIn[];
  addCheckIn: (locationName: string, coords: { latitude: number; longitude: number; }, statusEmoji: string | null) => Promise<string | null>;
  updateCheckInStatus: (checkInId: string, statusEmoji: string) => void;
  events: Event[];
  createEvent: (title: string, description: string, date: number) => void;
  toggleEventAttendance: (eventId: string) => void;
  feedbacks: Feedback[];
  onCreateFeedback: (title: string, description: string, category: string) => void;
  onUpvoteFeedback: (feedbackId: string) => void;
  onAddComment: (feedbackId: string, content: string) => void;
}

const Dashboard: React.FC<DashboardProps> = (props) => {
  const [activeView, setActiveView] = useState<AppView>('presence');
  const [showProfile, setShowProfile] = useState(false);
  const [currentUser, setCurrentUser] = useState(props.currentUser);

  const handleAvatarUpdate = (newAvatarUrl: string) => {
    const updatedUser = { ...currentUser, avatarUrl: newAvatarUrl };
    setCurrentUser(updatedUser);
    // Mettre à jour le localStorage pour persister la photo après reconnexion
    localStorage.setItem('user', JSON.stringify(updatedUser));
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header currentUser={currentUser} onLogout={props.onLogout} />
      <main className="flex-grow p-4 sm:p-6 md:p-8 pb-24">
        <div className="max-w-4xl mx-auto">
          <InstallPwaPrompt />
          <div className="mb-8 hidden md:block">
            <div className="flex space-x-8">
              <button
                onClick={() => {
                  setActiveView('presence');
                  setShowProfile(false);
                }}
                className={`flex items-center justify-center gap-2 text-lg font-bold transition-colors ${activeView === 'presence' && !showProfile ? 'text-brand-dark' : 'text-brand-subtle hover:text-brand-dark'}`}
              >
                Carte
              </button>
              <button
                onClick={() => {
                  setActiveView('events');
                  setShowProfile(false);
                }}
                className={`flex items-center justify-center gap-2 text-lg font-bold transition-colors ${activeView === 'events' && !showProfile ? 'text-brand-dark' : 'text-brand-subtle hover:text-brand-dark'}`}
              >
                Événements
              </button>
              <button
                onClick={() => {
                  setActiveView('feedback');
                  setShowProfile(false);
                }}
                className={`flex items-center justify-center gap-2 text-lg font-bold transition-colors ${activeView === 'feedback' && !showProfile ? 'text-brand-dark' : 'text-brand-subtle hover:text-brand-dark'}`}
              >
                💬 Feedback
              </button>
              <button
                onClick={() => setShowProfile(true)}
                className={`flex items-center justify-center gap-2 text-lg font-bold transition-colors ${showProfile ? 'text-brand-dark' : 'text-brand-subtle hover:text-brand-dark'}`}
              >
                Mon Profil
              </button>
            </div>
          </div>

          {showProfile ? (
            <div className="bg-white rounded-lg shadow-md p-8">
              <h2 className="text-2xl font-bold text-brand-dark mb-6 text-center">
                Mon Profil
              </h2>
              <div className="flex flex-col items-center">
                <AvatarUpload
                  currentAvatar={currentUser.avatarUrl}
                  onUploadSuccess={handleAvatarUpdate}
                />
                <div className="mt-6 text-center">
                  <h3 className="text-xl font-semibold text-brand-dark">{currentUser.name}</h3>
                  <p className="text-gray-500">{currentUser.email}</p>
                </div>
              </div>

              {/* Section notifications push */}
              <div className="mt-8">
                <h3 className="text-lg font-bold text-brand-dark mb-4">Paramètres</h3>
                <NotificationPrompt userId={currentUser.id} autoPrompt={false} />
              </div>
            </div>
          ) : activeView === 'presence' ? (
            <PresenceView
              checkIns={props.checkIns}
              addCheckIn={props.addCheckIn}
              updateCheckInStatus={props.updateCheckInStatus}
              currentUser={props.currentUser}
            />
          ) : activeView === 'events' ? (
            <EventsView
              events={props.events}
              createEvent={props.createEvent}
              toggleEventAttendance={props.toggleEventAttendance}
              currentUser={props.currentUser}
            />
          ) : (
            <FeedbackView
              feedbacks={props.feedbacks}
              currentUser={props.currentUser}
              onCreateFeedback={props.onCreateFeedback}
              onUpvoteFeedback={props.onUpvoteFeedback}
              onAddComment={props.onAddComment}
            />
          )}
        </div>
      </main>
      {/* Mobile Bottom Navigation */}
      <BottomNav
        active={showProfile ? 'profile' : activeView}
        onChange={(tab) => {
          if (tab === 'profile') {
            setShowProfile(true);
          } else {
            setShowProfile(false);
            setActiveView(tab);
          }
        }}
      />
    </div>
  );
};

export default Dashboard;