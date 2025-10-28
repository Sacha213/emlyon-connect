import React, { useState } from 'react';
import type { Event, User } from '../types';
import CreateEventModal from './CreateEventModal';
import { PlusIcon, CheckIcon, CalendarIcon } from './icons';

interface EventsViewProps {
  events: Event[];
  createEvent: (title: string, description: string, date: number, category: string) => void;
  toggleEventAttendance: (eventId: string) => void;
  removeEvent: (eventId: string) => Promise<void>;
  currentUser: User;
}

const EventsView: React.FC<EventsViewProps> = ({ events, createEvent, toggleEventAttendance, removeEvent, currentUser }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showPastEvents, setShowPastEvents] = useState(false);

  const now = Date.now();
  const upcomingEvents = events.filter(e => e.date >= now).sort((a, b) => a.date - b.date);
  const pastEvents = events.filter(e => e.date < now).sort((a, b) => b.date - a.date); // Les plus récents d'abord

  const confirmAndRemoveEvent = async (eventId: string) => {
    if (typeof window !== 'undefined') {
      const confirmed = window.confirm('Supprimer cet événement ? Cette action est définitive.');
      if (!confirmed) return;
    }
    await removeEvent(eventId);
  };

  return (
    <div className="space-y-6">
      <button
        onClick={() => setIsModalOpen(true)}
        className="w-full px-4 py-3 font-bold text-white bg-brand-emlyon rounded-md hover:opacity-90 transition-all transform hover:scale-105 flex items-center justify-center gap-2"
      >
        <PlusIcon className="w-6 h-6" />
        Proposer une sortie
      </button>

      <div className="space-y-4">
        <h2 className="text-2xl font-bold">Sorties à venir</h2>
        {upcomingEvents.length > 0 ? (
          upcomingEvents.map(event => {
            const isAttending = event.attendees.some(u => u.id === currentUser.id);
            const isCreator = event.creator.id === currentUser.id;
            const eventDate = new Date(event.date);

            return (
              <div key={event.id} className="bg-brand-light p-5 rounded-lg">
                <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-xl font-bold text-brand-dark">{event.title}</h3>
                      {event.category && (
                        <span className="px-2 py-1 text-xs font-semibold bg-brand-emlyon/20 text-brand-emlyon rounded-full">
                          {event.category}
                        </span>
                      )}
                    </div>
                    <p className="text-brand-subtle text-sm flex items-center gap-2 mt-1">
                      <CalendarIcon className="w-4 h-4" />
                      {eventDate.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })} à {eventDate.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                    <button
                      onClick={() => toggleEventAttendance(event.id)}
                      className={`w-full sm:w-auto flex-shrink-0 px-4 py-2 text-sm font-semibold rounded-md transition-colors flex items-center justify-center gap-2 ${isAttending ? 'bg-transparent border border-brand-subtle text-brand-subtle' : 'bg-brand-emlyon text-white hover:opacity-90'}`}
                    >
                      {isAttending ? <><CheckIcon className="w-4 h-4" /> Je participe</> : "Participer"}
                    </button>
                    {isCreator && (
                      <button
                        onClick={() => confirmAndRemoveEvent(event.id)}
                        className="w-full sm:w-auto flex-shrink-0 px-4 py-2 text-sm font-semibold rounded-md border border-red-200 text-red-600 bg-white/70 hover:bg-white"
                      >
                        Supprimer
                      </button>
                    )}
                  </div>
                </div>
                <p className="mt-4 text-brand-dark/80">{event.description}</p>
                <div className="mt-4 border-t border-brand-secondary pt-4">
                  <p className="text-sm text-brand-subtle mb-2">Participants ({event.attendees.length}) :</p>
                  <div className="flex flex-wrap gap-2">
                    {event.attendees.map(attendee => (
                      <div key={attendee.id} className="flex items-center" title={attendee.name}>
                        <img src={attendee.avatarUrl} alt={attendee.name} className="w-8 h-8 rounded-full object-cover ring-2 ring-brand-light" />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <p className="text-brand-subtle text-center py-12">Aucun événement prévu pour le moment. Proposez une sortie !</p>
        )}
      </div>

      {/* Section événements passés */}
      {pastEvents.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-brand-subtle">Événements passés ({pastEvents.length})</h2>
            <button
              onClick={() => setShowPastEvents(!showPastEvents)}
              className="text-sm text-brand-emlyon hover:underline"
            >
              {showPastEvents ? 'Masquer' : 'Afficher'}
            </button>
          </div>

          {showPastEvents && pastEvents.map(event => {
            const isAttending = event.attendees.some(u => u.id === currentUser.id);
            const isCreator = event.creator.id === currentUser.id;
            const eventDate = new Date(event.date);

            return (
              <div key={event.id} className="bg-brand-light/50 p-5 rounded-lg opacity-60">
                <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-xl font-bold text-brand-dark">{event.title}</h3>
                      {event.category && (
                        <span className="px-2 py-1 text-xs font-semibold bg-brand-emlyon/20 text-brand-emlyon rounded-full">
                          {event.category}
                        </span>
                      )}
                    </div>
                    <p className="text-brand-subtle text-sm flex items-center gap-2 mt-1">
                      <CalendarIcon className="w-4 h-4" />
                      {eventDate.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })} à {eventDate.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                    <div className="w-full sm:w-auto flex-shrink-0 px-4 py-2 text-sm font-semibold rounded-md bg-brand-secondary text-brand-subtle text-center">
                      Terminé
                    </div>
                    {isCreator && (
                      <button
                        onClick={() => confirmAndRemoveEvent(event.id)}
                        className="w-full sm:w-auto flex-shrink-0 px-4 py-2 text-sm font-semibold rounded-md border border-red-200 text-red-600 bg-white/80 hover:bg-white"
                      >
                        Supprimer
                      </button>
                    )}
                  </div>
                </div>
                <p className="mt-4 text-brand-dark/60">{event.description}</p>
                <div className="mt-4 border-t border-brand-secondary pt-4">
                  <p className="text-sm text-brand-subtle mb-2">Participants ({event.attendees.length}) :</p>
                  <div className="flex flex-wrap gap-2">
                    {event.attendees.map(attendee => (
                      <div key={attendee.id} className="flex items-center" title={attendee.name}>
                        <img src={attendee.avatarUrl} alt={attendee.name} className="w-8 h-8 rounded-full object-cover ring-2 ring-brand-light" />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {isModalOpen && (
        <CreateEventModal
          onClose={() => setIsModalOpen(false)}
          onCreateEvent={createEvent}
        />
      )}
    </div>
  );
};

export default EventsView;