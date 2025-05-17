import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { format } from 'date-fns';
import { useAuth } from '../../contexts/AuthContext';

interface Props {
  date: Date;
  onClose: () => void;
  onCreated: () => void;
  editingEvent?: {
    id: string;
    title: string;
    type: string;
    description: string;
    date: string;
  };
}

const eventTypeOptions = [
  { value: 'training', label: 'Training', icon: '⚽' },
  { value: 'game', label: 'Game', icon: '🏆' },
  { value: 'gym', label: 'Gym', icon: '💪' },
  { value: 'meeting', label: 'Meeting', icon: '🗣️' },
  { value: 'concentration', label: 'Concentration', icon: '🧘' },
];

export default function CreateEventModal({ date, onClose, onCreated, editingEvent }: Props) {
  const { token } = useAuth();

  const [title, setTitle] = useState('');
  const [type, setType] = useState('training');
  const [hour, setHour] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState<{[key: string]: string}>({});

  useEffect(() => {
    if (editingEvent) {
      setTitle(editingEvent.title);
      setType(editingEvent.type);
      setDescription(editingEvent.description);
      const d = new Date(editingEvent.date);
      setHour(d.toISOString().substring(11, 16));
    } else {
      setHour('14:00');
    }
  }, [editingEvent]);

  const validateForm = () => {
    const errors: {[key: string]: string} = {};
    
    if (!title.trim()) {
      errors.title = 'Title is required';
    }
    
    if (!hour) {
      errors.hour = 'Hour is required';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);

    try {
      const dateTime = new Date(date);
      const [h, m] = hour.split(':');
      dateTime.setHours(Number(h), Number(m));

      const payload = {
        title,
        type,
        description,
        date: dateTime.toISOString(),
      };

      if (editingEvent) {
        await api.put(`/events/${editingEvent.id}`, payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
      } else {
        await api.post('/events', payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
      }

      onCreated();
      onClose();
    } catch (error) {
      console.error('Erro ao salvar evento', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div 
        className="bg-white rounded-xl p-4 sm:p-6 w-full max-w-xs sm:max-w-md shadow-xl border border-amber-100"
        onClick={(e) => e.stopPropagation()}
      >
        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
          <div className="text-center">
            <span className="inline-flex items-center justify-center h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-amber-100 text-amber-800 mx-auto mb-2">
              {editingEvent ? '✏️' : '📝'}
            </span>
            <h2 className="text-lg sm:text-xl font-bold text-gray-800">
              {editingEvent ? 'Edit Event' : `New Event`}
            </h2>
            <p className="text-gray-500 text-xs sm:text-sm mt-1">
              {format(date, 'EEEE, dd/MM/yyyy')}
            </p>
          </div>

          <div className="space-y-3 sm:space-y-4">
            <div>
              <label htmlFor="event-title" className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Title</label>
              <input
                id="event-title"
                type="text"
                placeholder="Ex: Tactical training"
                className={`w-full border ${formErrors.title ? 'border-red-300 bg-red-50' : 'border-gray-300'} p-2 sm:p-3 rounded-lg focus:ring-2 focus:ring-amber-400 focus:border-transparent transition-colors text-sm`}
                value={title}
                onChange={e => setTitle(e.target.value)}
              />
              {formErrors.title && <p className="mt-1 text-xs sm:text-sm text-red-600">{formErrors.title}</p>}
            </div>

            <div>
              <label htmlFor="event-type" className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Event Type</label>
              <div className="grid grid-cols-5 gap-1 sm:gap-2">
                {eventTypeOptions.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    className={`flex flex-col items-center justify-center p-1 sm:p-2 rounded-lg ${
                      type === option.value 
                        ? 'bg-amber-100 border-2 border-amber-500 text-amber-800' 
                        : 'bg-gray-50 border border-gray-200 hover:bg-gray-100'
                    } transition-colors`}
                    onClick={() => setType(option.value)}
                  >
                    <span className="text-base sm:text-xl mb-0.5 sm:mb-1">{option.icon}</span>
                    <span className=" sm:text-xs font-medium" style={{fontSize: "10px"}}>{option.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label htmlFor="event-time" className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Hour</label>
              <input
                id="event-time"
                type="time"
                className={`w-full border ${formErrors.hour ? 'border-red-300 bg-red-50' : 'border-gray-300'} p-2 sm:p-3 rounded-lg focus:ring-2 focus:ring-amber-400 focus:border-transparent transition-colors text-sm`}
                value={hour}
                onChange={e => setHour(e.target.value)}
              />
              {formErrors.hour && <p className="mt-1 text-xs sm:text-sm text-red-600">{formErrors.hour}</p>}
            </div>

            <div>
              <label htmlFor="event-description" className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                Description <span className="text-gray-400 text-xxs sm:text-xs">(opcional)</span>
              </label>
              <textarea
                id="event-description"
                className="w-full border border-gray-300 p-2 sm:p-3 rounded-lg focus:ring-2 focus:ring-amber-400 focus:border-transparent transition-colors min-h-20 sm:min-h-24 text-sm"
                placeholder="Additional details about the event"
                value={description}
                onChange={e => setDescription(e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 sm:gap-3 pt-1 sm:pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3 sm:px-4 py-2 sm:py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-gray-300 text-xs sm:text-sm"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-3 sm:px-4 py-2 sm:py-2.5 bg-amber-500 text-white rounded-lg hover:bg-amber-600 font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-amber-500 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center text-xs sm:text-sm"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <span className="animate-spin inline-block h-3 w-3 sm:h-4 sm:w-4 border-2 border-white border-t-transparent rounded-full mr-1 sm:mr-2"></span>
                  Saving...
                </>
              ) : (
                editingEvent ? 'Save changes' : 'Create event'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}