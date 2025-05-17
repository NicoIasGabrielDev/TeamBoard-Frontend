import { useEffect, useState } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { format, isSameDay } from 'date-fns';
import api from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import CreateEventModal from './CreateEventModal';

interface Event {
  id: string;
  title: string;
  type: 'training' | 'game' | 'meeting' | 'concentration' | 'gym';
  date: string;
  description: string;
}

const typeColorMap = {
  training: 'bg-blue-100 text-blue-800 border-l-4 border-blue-500',
  game: 'bg-green-100 text-green-800 border-l-4 border-green-500',
  meeting: 'bg-amber-100 text-amber-800 border-l-4 border-amber-500',
  concentration: 'bg-purple-100 text-purple-800 border-l-4 border-purple-500',
  gym: 'bg-rose-100 text-rose-800 border-l-4 border-rose-500',
};

const typeIcons = {
  training: '⚽',
  game: '🏆',
  meeting: '🗣️',
  concentration: '🧘',
  gym: '💪',
};

export default function CalendarBoard() {
  const { user, token } = useAuth();
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
  const [events, setEvents] = useState<Event[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [deletingEvent, setDeletingEvent] = useState<Event | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchEvents = async () => {
    setIsLoading(true);
    try {
      const response = await api.get('/events', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setEvents(response.data.events);
    } catch (err) {
      console.error('Error finding events', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  },[]);

  const handleDayClick = (date: Date) => {
    setSelectedDate(date);
  };

  const handleConfirmDelete = async () => {
    if (!deletingEvent) return;
    try {
      setIsLoading(true);
      await api.delete(`/events/${deletingEvent.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setDeletingEvent(null);
      await fetchEvents();
    } catch (error) {
      console.error('Error while delete event', error);
    } finally {
      setIsLoading(false);
    }
  };

  const eventsOfDay = selectedDate
    ? events.filter(event => isSameDay(new Date(event.date), selectedDate))
    : [];

  return (
    <div className="p-3 sm:p-6 max-w-5xl mx-auto">
      <h2 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-8 text-center text-gray-800">
        Club's Calendar
      </h2>

      {isLoading && (
        <div className="flex justify-center my-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500"></div>
        </div>
      )}

      {/* Layout responsivo - muda para 1 coluna em dispositivos pequenos */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        <div className="bg-white shadow-lg rounded-2xl p-2 sm:p-4 border border-amber-100">
          <style>{`
            .react-calendar {
              border: none;
              font-family: 'Inter', sans-serif;
              width: 100% !important; /* Garante que o calendário preencha o contêiner */
              max-width: 100%;
            }
            
            /* Ajustes para mobile */
            @media (max-width: 640px) {
              .react-calendar__month-view__days__day {
                padding: 0.6em 0.5em !important;
              }
              .react-calendar__navigation button {
                padding: 0.3em !important;
              }
            }
            
            .react-calendar__tile--active {
              background: #eec95e !important;
              color: #000 !important;
            }
            .react-calendar__tile--now {
              background: #fef3c7 !important;
            }
            .react-calendar__navigation button:enabled:hover,
            .react-calendar__navigation button:enabled:focus,
            .react-calendar__tile:enabled:hover,
            .react-calendar__tile:enabled:focus {
              background-color: #fef9e7 !important;
            }
            .react-calendar__month-view__days__day--weekend {
              color: #b45309;
            }
          `}</style>
          <Calendar
            onClickDay={handleDayClick}
            tileClassName={({ date }) => {
              const eventOnDay = events.find(e => isSameDay(new Date(e.date), date));
              if (!eventOnDay) return '';
              
              return `relative event-marker`;
            }}
            tileContent={({ date }) => {
              const eventTypes = events
                .filter(e => isSameDay(new Date(e.date), date))
                .map(e => e.type);
              
              if (eventTypes.length === 0) return null;
              
              return (
                <div className="flex justify-center mt-1">
                  {eventTypes.length > 0 && (
                    <span className="h-1.5 w-1.5 rounded-full bg-amber-500"></span>
                  )}
                </div>
              );
            }}
            className="w-full border-none"
            locale="pt-BR"
            value={selectedDate}
          />
        </div>

        {selectedDate && (
          <div className="bg-white rounded-2xl p-3 sm:p-5 shadow-lg border border-amber-100">
            <h3 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4 flex items-center gap-2 text-gray-800 flex-wrap">
              <span className="inline-block w-8 h-8 sm:w-10 sm:h-10 bg-amber-100 rounded-full flex items-center justify-center text-amber-800">
                {format(selectedDate, 'dd')}
              </span>
              <span className="text-sm sm:text-base">
                {format(selectedDate, 'EEEE, dd/MM/yyyy')}
              </span>
            </h3>

            {eventsOfDay.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-32 sm:h-40 text-gray-400 bg-gray-50 rounded-xl">
                <span className="text-3xl sm:text-4xl mb-2">📭</span>
                <p>No events.</p>
              </div>
            ) : (
              <ul className="space-y-2 sm:space-y-3 mt-3 sm:mt-4">
                {eventsOfDay.map(event => (
                  <li
                    key={event.id}
                    className={`p-2 sm:p-3 rounded-lg ${typeColorMap[event.type]} flex justify-between items-center shadow-sm`}
                  >
                    <div className="flex items-center gap-2 sm:gap-3">
                      <span className="text-lg sm:text-xl">{typeIcons[event.type]}</span>
                      <div className="min-w-0 flex-1"> {/* Prevenção de overflow */}
                        <strong className="font-medium text-sm sm:text-base line-clamp-1">{event.title}</strong>
                        <div className="text-xs sm:text-sm text-gray-600 line-clamp-1">
                          {format(new Date(event.date), 'HH:mm')}h {event.description ? `- ${event.description}` : ''}
                        </div>
                      </div>
                    </div>
                    {user?.role === 'manager' && (
                      <div className="flex gap-1 sm:gap-2 ml-2 flex-shrink-0">
                        <button
                          className="p-1 sm:p-1.5 text-blue-600 hover:bg-blue-50 rounded-full"
                          onClick={() => setEditingEvent(event)}
                          aria-label="Editar"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                          </svg>
                        </button>
                        <button
                          className="p-1 sm:p-1.5 text-red-600 hover:bg-red-50 rounded-full"
                          onClick={() => setDeletingEvent(event)}
                          aria-label="Excluir"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                          </svg>
                        </button>
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            )}

            {user?.role === 'manager' && (
              <button
                className="mt-4 sm:mt-6 px-3 sm:px-4 py-2 sm:py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-medium rounded-lg flex items-center justify-center gap-2 transition-colors w-full shadow-sm text-sm sm:text-base"
                onClick={() => setShowModal(true)}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                </svg>
                Add Event
              </button>
            )}
          </div>
        )}
      </div>

      {showModal && selectedDate && (
        <CreateEventModal
          date={selectedDate}
          onClose={() => setShowModal(false)}
          onCreated={fetchEvents}
        />
      )}

      {editingEvent && (
        <CreateEventModal
          date={new Date(editingEvent.date)}
          onClose={() => setEditingEvent(null)}
          onCreated={fetchEvents}
          editingEvent={editingEvent}
        />
      )}

      {deletingEvent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-4 sm:p-6 w-full max-w-xs sm:max-w-sm shadow-xl space-y-3 sm:space-y-4">
            <div className="flex justify-center">
              <span className="inline-flex items-center justify-center h-12 w-12 sm:h-14 sm:w-14 rounded-full bg-red-100 text-red-500">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 sm:h-6 sm:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </span>
            </div>
            <h3 className="text-base sm:text-lg font-semibold text-center">Confirm Delete</h3>
            <p className="text-center text-gray-600 text-sm sm:text-base">
              Really want to delete this event <strong className="text-gray-800">"{deletingEvent.title}"</strong>?
            </p>
            <div className="grid grid-cols-2 gap-2 sm:gap-3 pt-1 sm:pt-2">
              <button
                onClick={() => setDeletingEvent(null)}
                className="px-3 sm:px-4 py-2 sm:py-2.5 border rounded-lg hover:bg-gray-50 font-medium transition-colors text-sm sm:text-base"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                className="px-3 sm:px-4 py-2 sm:py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium transition-colors text-sm sm:text-base"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}