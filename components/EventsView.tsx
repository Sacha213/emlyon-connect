import React, { useState } from 'react';
import type { Event, User } from '../types';
import CreateEventModal from './CreateEventModal';
import { PlusIcon, CheckIcon, CalendarIcon } from './icons';

interface EventsViewProps {
  events: Event[];
  createEvent: (title: string, description: string, date: number) => void;
  toggleEventAttendance: (eventId: string) => void;
  currentUser: User;
}

const EventsView: React.FC<EventsViewProps> = ({ events, createEvent, toggleEventAttendance, currentUser }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const sortedEvents = [...events].sort((a, b) => a.date - b.date);

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
        {sortedEvents.length > 0 ? (
          sortedEvents.map(event => {
            const isAttending = event.attendees.some(u => u.id === currentUser.id);
            const eventDate = new Date(event.date);

            return (
              <div key={event.id} className="bg-brand-light p-5 rounded-lg">
                <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                  <div>
                    <h3 className="text-xl font-bold text-brand-dark">{event.title}</h3>
                    <p className="text-brand-subtle text-sm flex items-center gap-2 mt-1">
                      <CalendarIcon className="w-4 h-4"/>
                      {eventDate.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })} à {eventDate.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                  <button
                    onClick={() => toggleEventAttendance(event.id)}
                    className={`w-full sm:w-auto flex-shrink-0 px-4 py-2 text-sm font-semibold rounded-md transition-colors flex items-center justify-center gap-2 ${isAttending ? 'bg-transparent border border-brand-subtle text-brand-subtle' : 'bg-brand-emlyon text-white hover:opacity-90'}`}
                  >
                    {isAttending ? <><CheckIcon className="w-4 h-4"/> Je participe</> : "Participer"}
                  </button>
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