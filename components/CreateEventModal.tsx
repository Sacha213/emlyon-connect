import React, { useState } from 'react';
import { CloseIcon } from './icons';

interface PollOptionDraft {
  id: string;
  label: string;
  date?: string;
  time?: string;
  location?: string;
}

interface CreateEventModalProps {
  onClose: () => void;
  onCreateEvent: (payload: {
    title: string;
    description: string;
    date: number | null;
    category: string;
    pollOptions?: {
      id: string;
      label: string;
      votes: string[];
      date?: number | null;
      location?: string | null;
    }[];
    pollType?: 'date' | 'location';
    pollClosesAt?: number | null;
  }) => void;
}

const CATEGORIES = ['🍻 Soirée', '🍽️ Restaurant', '☕ Café', '🎭 Culture', '🏋️ Sport', '🎮 Gaming', '🎓 Études', '🎉 Autre'];

const CreateEventModal: React.FC<CreateEventModalProps> = ({ onClose, onCreateEvent }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [pollMode, setPollMode] = useState<'none' | 'date' | 'location'>('none');
  const [pollOptions, setPollOptions] = useState<PollOptionDraft[]>([]);
  const [pollDeadlineDate, setPollDeadlineDate] = useState('');
  const [pollDeadlineTime, setPollDeadlineTime] = useState('');

  const resetDateFields = () => {
    setDate('');
    setTime('');
  };

  const ensurePollOption = () => {
    setPollOptions(prev => (prev.length > 0 ? prev : [{ id: crypto.randomUUID(), label: '', date: '', time: '', location: '' }]));
  };

  const addPollOption = () => {
    setPollOptions(prev => [...prev, { id: crypto.randomUUID(), label: '', date: '', time: '', location: '' }]);
  };

  const updatePollOption = (optionId: string, updates: Partial<PollOptionDraft>) => {
    setPollOptions(prev => prev.map(option => option.id === optionId ? { ...option, ...updates } : option));
  };

  const removePollOption = (optionId: string) => {
    setPollOptions(prev => prev.filter(option => option.id !== optionId));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !description || !category) {
      return;
    }

    if (pollMode === 'none') {
      if (!date || !time) return;
      const dateTime = new Date(`${date}T${time}`).getTime();
      onCreateEvent({
        title,
        description,
        date: dateTime,
        category,
      });
      onClose();
      return;
    }

    if (pollMode === 'date') {
      const validOptions = pollOptions
        .map(option => {
          if (!option.date || !option.time) return null;
          const dateTime = new Date(`${option.date}T${option.time}`).getTime();
          return {
            id: option.id,
            label: option.label || new Date(dateTime).toLocaleString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' }),
            votes: [],
            date: dateTime,
            location: option.location ? option.location : null,
          };
        })
        .filter(Boolean);

      if (!validOptions.length) return;

      const pollClose = pollDeadlineDate && pollDeadlineTime
        ? new Date(`${pollDeadlineDate}T${pollDeadlineTime}`).getTime()
        : null;

      onCreateEvent({
        title,
        description,
        date: null,
        category,
        pollType: 'date',
        pollOptions: validOptions as any,
        pollClosesAt: pollClose,
      });
      onClose();
      return;
    }

    if (pollMode === 'location') {
      const validOptions = pollOptions
        .map(option => {
          if (!option.label && !option.location) return null;
          return {
            id: option.id,
            label: option.label || option.location || 'Lieu proposé',
            votes: [],
            date: option.date && option.time ? new Date(`${option.date}T${option.time}`).getTime() : null,
            location: option.location ? option.location : (option.label || null),
          };
        })
        .filter(Boolean);

      if (!validOptions.length) return;

      const pollClose = pollDeadlineDate && pollDeadlineTime
        ? new Date(`${pollDeadlineDate}T${pollDeadlineTime}`).getTime()
        : null;

      onCreateEvent({
        title,
        description,
        date: null,
        category,
        pollType: 'location',
        pollOptions: validOptions as any,
        pollClosesAt: pollClose,
      });
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="bg-brand-light rounded-lg shadow-2xl shadow-black/50 w-full max-w-lg p-6 relative border border-brand-secondary transform animate-scale-in max-h-[90vh] flex flex-col overflow-hidden">
        <button onClick={onClose} className="absolute top-4 right-4 text-brand-subtle hover:text-brand-dark transition">
          <CloseIcon className="w-6 h-6" />
        </button>
        <h2 className="text-2xl font-bold mb-6 text-brand-dark">Proposer une nouvelle sortie</h2>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 flex-1 overflow-hidden">
          <div className="flex-1 space-y-4 overflow-y-auto pr-1 custom-scroll">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-brand-subtle mb-1">Titre</label>
              <input type="text" id="title" value={title} onChange={e => setTitle(e.target.value)} required className="w-full px-4 py-2 bg-brand-secondary border-transparent rounded-md focus:outline-none focus:ring-2 focus:ring-brand-emlyon transition" />
            </div>
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-brand-subtle mb-1">Description</label>
              <textarea id="description" value={description} onChange={e => setDescription(e.target.value)} required rows={3} className="w-full px-4 py-2 bg-brand-secondary border-transparent rounded-md focus:outline-none focus:ring-2 focus:ring-brand-emlyon transition"></textarea>
            </div>
            <div>
              <label htmlFor="category" className="block text-sm font-medium text-brand-subtle mb-1">Catégorie</label>
              <select id="category" value={category} onChange={e => setCategory(e.target.value)} required className="w-full px-4 py-2 bg-brand-secondary border-transparent rounded-md focus:outline-none focus:ring-2 focus:ring-brand-emlyon transition">
                {CATEGORIES.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-brand-subtle mb-1">Mode de proposition</label>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setPollMode('none');
                    resetDateFields();
                    setPollOptions([]);
                  }}
                  className={`px-3 py-2 text-sm rounded-md border ${pollMode === 'none' ? 'bg-brand-emlyon text-white border-brand-emlyon' : 'bg-brand-secondary text-brand-dark border-transparent'}`}
                >
                  Date fixe
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setPollMode('date');
                    ensurePollOption();
                  }}
                  className={`px-3 py-2 text-sm rounded-md border ${pollMode === 'date' ? 'bg-brand-emlyon text-white border-brand-emlyon' : 'bg-brand-secondary text-brand-dark border-transparent'}`}
                >
                  Sondage de dates
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setPollMode('location');
                    ensurePollOption();
                  }}
                  className={`px-3 py-2 text-sm rounded-md border ${pollMode === 'location' ? 'bg-brand-emlyon text-white border-brand-emlyon' : 'bg-brand-secondary text-brand-dark border-transparent'}`}
                >
                  Sondage de lieux
                </button>
              </div>
            </div>

            {pollMode === 'none' && (
              <div className="flex gap-4">
                <div className="flex-1">
                  <label htmlFor="date" className="block text-sm font-medium text-brand-subtle mb-1">Date</label>
                  <input type="date" id="date" value={date} onChange={e => setDate(e.target.value)} required className="w-full px-4 py-2 bg-brand-secondary border-transparent rounded-md focus:outline-none focus:ring-2 focus:ring-brand-emlyon transition" />
                </div>
                <div className="flex-1">
                  <label htmlFor="time" className="block text-sm font-medium text-brand-subtle mb-1">Heure</label>
                  <input type="time" id="time" value={time} onChange={e => setTime(e.target.value)} required className="w-full px-4 py-2 bg-brand-secondary border-transparent rounded-md focus:outline-none focus:ring-2 focus:ring-brand-emlyon transition" />
                </div>
              </div>
            )}

            {pollMode !== 'none' && (
              <div className="space-y-4">
                <div className="flex flex-wrap items-center gap-3">
                  <h3 className="text-sm font-medium text-brand-subtle">Options proposées</h3>
                  <button type="button" onClick={addPollOption} className="px-3 py-1.5 text-xs font-semibold bg-brand-secondary rounded-md hover:bg-brand-secondary/70">
                    + Ajouter une option
                  </button>
                </div>
                <div className="space-y-3 max-h-64 overflow-y-auto pr-1 custom-scroll">
                  {pollOptions.map(option => (
                    <div key={option.id} className="rounded-lg border border-brand-secondary bg-brand-secondary/60 p-3 space-y-3">
                      <div className="flex gap-3">
                        <div className="flex-1">
                          <label className="block text-xs font-semibold text-brand-subtle mb-1">
                            {pollMode === 'location' ? 'Nom du lieu' : 'Libellé option (facultatif)'}
                          </label>
                          <input
                            type="text"
                            value={option.label}
                            onChange={(e) => updatePollOption(option.id, { label: e.target.value })}
                            placeholder={pollMode === 'location' ? 'Ex: Ninkasi Gerland' : 'Ex: Vendredi 20h'}
                            className="w-full px-3 py-2 text-sm bg-brand-light/80 border border-transparent rounded-md focus:outline-none focus:ring-2 focus:ring-brand-emlyon/60"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => removePollOption(option.id)}
                          className="text-sm text-brand-subtle hover:text-red-500"
                          title="Supprimer"
                        >
                          ✕
                        </button>
                      </div>

                      {pollMode !== 'location' && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-xs font-semibold text-brand-subtle mb-1">Date</label>
                            <input
                              type="date"
                              value={option.date}
                              onChange={(e) => updatePollOption(option.id, { date: e.target.value })}
                              className="w-full px-3 py-2 text-sm bg-brand-light/80 border border-transparent rounded-md focus:outline-none focus:ring-2 focus:ring-brand-emlyon/60"
                              required={pollMode === 'date'}
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-semibold text-brand-subtle mb-1">Heure</label>
                            <input
                              type="time"
                              value={option.time}
                              onChange={(e) => updatePollOption(option.id, { time: e.target.value })}
                              className="w-full px-3 py-2 text-sm bg-brand-light/80 border border-transparent rounded-md focus:outline-none focus:ring-2 focus:ring-brand-emlyon/60"
                              required={pollMode === 'date'}
                            />
                          </div>
                        </div>
                      )}

                      {pollMode === 'location' && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-xs font-semibold text-brand-subtle mb-1">Adresse / détails</label>
                            <input
                              type="text"
                              value={option.location}
                              onChange={(e) => updatePollOption(option.id, { location: e.target.value })}
                              placeholder="Ex: 267 Rue Marcel Mérieux, Lyon"
                              className="w-full px-3 py-2 text-sm bg-brand-light/80 border border-transparent rounded-md focus:outline-none focus:ring-2 focus:ring-brand-emlyon/60"
                            />
                          </div>
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="block text-xs font-semibold text-brand-subtle mb-1">Date (optionnel)</label>
                              <input
                                type="date"
                                value={option.date}
                                onChange={(e) => updatePollOption(option.id, { date: e.target.value })}
                                className="w-full px-3 py-2 text-sm bg-brand-light/80 border border-transparent rounded-md focus:outline-none focus:ring-2 focus:ring-brand-emlyon/60"
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-semibold text-brand-subtle mb-1">Heure (optionnel)</label>
                              <input
                                type="time"
                                value={option.time}
                                onChange={(e) => updatePollOption(option.id, { time: e.target.value })}
                                className="w-full px-3 py-2 text-sm bg-brand-light/80 border border-transparent rounded-md focus:outline-none focus:ring-2 focus:ring-brand-emlyon/60"
                              />
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-brand-subtle mb-1">Clôture du sondage (date)</label>
                    <input
                      type="date"
                      value={pollDeadlineDate}
                      onChange={(e) => setPollDeadlineDate(e.target.value)}
                      className="w-full px-3 py-2 text-sm bg-brand-light/80 border border-transparent rounded-md focus:outline-none focus:ring-2 focus:ring-brand-emlyon/60"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-brand-subtle mb-1">Clôture du sondage (heure)</label>
                    <input
                      type="time"
                      value={pollDeadlineTime}
                      onChange={(e) => setPollDeadlineTime(e.target.value)}
                      className="w-full px-3 py-2 text-sm bg-brand-light/80 border border-transparent rounded-md focus:outline-none focus:ring-2 focus:ring-brand-emlyon/60"
                    />
                  </div>
                </div>
                <p className="text-xs text-brand-subtle">
                  Les participants pourront voter pour l'option de leur choix. Tu pourras décider du résultat final après clôture du sondage.
                </p>
              </div>
            )}
          </div>
          <div className="flex justify-end gap-4 pt-4 border-t border-brand-secondary/60">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-semibold text-brand-subtle hover:text-brand-dark transition">Annuler</button>
            <button type="submit" className="px-6 py-2 text-sm font-bold text-white bg-brand-emlyon rounded-md hover:opacity-90 transition">Créer l'événement</button>
          </div>
        </form>
      </div>
      <style>{`
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-fade-in {
          animation: fade-in 0.3s ease-out forwards;
        }
         @keyframes scale-in {
          from { transform: scale(0.95); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
        .animate-scale-in {
          animation: scale-in 0.3s ease-out forwards;
        }
        .custom-scroll::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scroll::-webkit-scrollbar-thumb {
          background: rgba(229, 9, 20, 0.4);
          border-radius: 9999px;
        }
        .custom-scroll::-webkit-scrollbar-track {
          background: transparent;
        }
      `}</style>
    </div>
  );
};

export default CreateEventModal;