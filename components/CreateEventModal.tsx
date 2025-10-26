import React, { useState } from 'react';
import { CloseIcon } from './icons';

interface CreateEventModalProps {
  onClose: () => void;
  onCreateEvent: (title: string, description: string, date: number, category: string) => void;
}

const CATEGORIES = ['🍻 Soirée', '🍽️ Restaurant', '☕ Café', '🎭 Culture', '🏋️ Sport', '🎮 Gaming', '🎓 Études', '🎉 Autre'];

const CreateEventModal: React.FC<CreateEventModalProps> = ({ onClose, onCreateEvent }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [category, setCategory] = useState(CATEGORIES[0]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (title && description && date && time && category) {
      const dateTime = new Date(`${date}T${time}`).getTime();
      onCreateEvent(title, description, dateTime, category);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="bg-brand-light rounded-lg shadow-2xl shadow-black/50 w-full max-w-lg p-6 relative border border-brand-secondary transform animate-scale-in">
        <button onClick={onClose} className="absolute top-4 right-4 text-brand-subtle hover:text-brand-dark transition">
          <CloseIcon className="w-6 h-6" />
        </button>
        <h2 className="text-2xl font-bold mb-6 text-brand-dark">Proposer une nouvelle sortie</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
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
          <div className="flex justify-end gap-4 pt-6">
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
      `}</style>
    </div>
  );
};

export default CreateEventModal;