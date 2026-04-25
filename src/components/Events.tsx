import { useState, useEffect } from 'react';
import { 
  collection, 
  query, 
  getDocs, 
  orderBy, 
  addDoc, 
  updateDoc, 
  deleteDoc,
  doc, 
  onSnapshot,
  where
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { Event, User } from '../types';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Calendar, 
  MapPin, 
  Plus, 
  Search, 
  X, 
  Clock, 
  Trophy, 
  PartyPopper, 
  Users, 
  Globe, 
  Award, 
  Heart,
  ExternalLink,
  Trash2,
  Edit2,
  Filter,
  Briefcase,
  Code,
  Video,
  UserCheck
} from 'lucide-react';
import { cn } from '../lib/utils';

interface EventsProps {
  user: User;
}

// Add Sparkles to lucide-react if not already there, using a fallback
const Sparkles = ({ className }: { className?: string }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width="24" 
    height="24" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/>
    <path d="M5 3v4"/><path d="M19 17v4"/><path d="M3 5h4"/><path d="M17 19h4"/>
  </svg>
);

const CATEGORIES = [
  { id: 'all', name: 'All Events', icon: Calendar },
  { id: 'job_fair', name: 'Job Fair', icon: Briefcase },
  { id: 'walk_in', name: 'Walk-ins', icon: UserCheck },
  { id: 'hackathon', name: 'Hackathon', icon: Code },
  { id: 'seminar', name: 'Seminar', icon: Video },
  { id: 'webinar', name: 'Webinar', icon: Globe },
  { id: 'quiz', name: 'Quiz', icon: Trophy },
  { id: 'competition', name: 'Competition', icon: Sparkles },
  { id: 'award_ceremony', name: 'Award Ceremony', icon: Trophy },
  { id: 'farewell', name: 'Farewell', icon: Heart },
  { id: 'annual_function', name: 'Annual Function', icon: PartyPopper },
  { id: 'national_event', name: 'National Event', icon: Globe },
  { id: 'international_event', name: 'International Event', icon: Globe },
  { id: 'celebration', name: 'Celebration', icon: Sparkles },
];

export default function Events({ user }: EventsProps) {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newEvent, setNewEvent] = useState({
    title: '',
    description: '',
    date: '',
    time: '',
    location: '',
    category: 'celebration' as Event['category'],
    registrationUrl: '',
    image: ''
  });

  useEffect(() => {
    const q = query(collection(db, 'events'), orderBy('date', 'asc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const eventsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Event));
      setEvents(eventsData);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'events');
    });

    return () => unsubscribe();
  }, []);

  const handleAddEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const eventData = {
        ...newEvent,
        organizer: user.name,
        organizerId: user.uid,
        createdAt: new Date().toISOString()
      };
      await addDoc(collection(db, 'events'), eventData);
      setShowAddModal(false);
      setNewEvent({
        title: '',
        description: '',
        date: '',
        time: '',
        location: '',
        category: 'celebration',
        registrationUrl: '',
        image: ''
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'events');
    }
  };

  const handleDeleteEvent = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this event?')) return;
    try {
      await deleteDoc(doc(db, 'events', id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `events/${id}`);
    }
  };

  const filteredEvents = events.filter(event => {
    const matchesCategory = activeCategory === 'all' || event.category === activeCategory;
    const matchesSearch = event.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         event.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         event.location.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const canCreate = user.role === 'admin' || user.role === 'college' || user.role === 'govt' || user.role === 'company';

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-2">Campus Events & Hubs</h1>
          <p className="text-slate-500 font-medium">Job fairs, hackathons, seminars, quizzes, and celebrations.</p>
        </div>
        {canCreate && (
          <button 
            onClick={() => setShowAddModal(true)}
            className="flex items-center justify-center gap-3 px-8 py-4 bg-indigo-600 text-white rounded-[1.5rem] font-black shadow-xl shadow-indigo-200 hover:bg-indigo-700 transition-all hover:scale-105 active:scale-95"
          >
            <Plus className="w-6 h-6" />
            Organize Event
          </button>
        )}
      </div>

      {/* Categories Horizontal Scroll */}
      <div className="flex overflow-x-auto pb-4 gap-3 no-scrollbar">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            className={cn(
              "flex items-center gap-2 px-6 py-3 rounded-2xl text-sm font-black whitespace-nowrap transition-all border",
              activeCategory === cat.id 
                ? "bg-indigo-600 text-white border-indigo-600 shadow-lg shadow-indigo-200" 
                : "bg-white text-slate-500 border-slate-100 hover:border-indigo-200"
            )}
          >
            <cat.icon className="w-4 h-4" />
            {cat.name}
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
        <input 
          type="text" 
          placeholder="Search events by title, location, or description..."
          className="w-full pl-12 pr-4 py-4 bg-white rounded-2xl border border-slate-100 focus:ring-2 focus:ring-indigo-500 font-medium text-slate-900 placeholder:text-slate-300 shadow-sm"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Events Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          [1, 2, 3].map(i => <div key={i} className="h-80 bg-white rounded-[2.5rem] animate-pulse border border-slate-100"></div>)
        ) : filteredEvents.length > 0 ? (
          filteredEvents.map((event, idx) => (
            <motion.div
              key={event.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-indigo-200/30 transition-all overflow-hidden flex flex-col group"
            >
              {event.image ? (
                <div className="h-48 overflow-hidden relative">
                  <img 
                    src={event.image} 
                    alt={event.title} 
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute top-4 left-4">
                    <span className="px-3 py-1 bg-white/90 backdrop-blur-sm text-indigo-600 rounded-lg text-[10px] font-black uppercase tracking-widest border border-indigo-100">
                      {event.category.replace('_', ' ')}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="h-48 bg-gradient-to-br from-indigo-50 to-slate-50 flex items-center justify-center relative">
                  <Calendar className="w-16 h-16 text-indigo-200" />
                  <div className="absolute top-4 left-4">
                    <span className="px-3 py-1 bg-white text-indigo-600 rounded-lg text-[10px] font-black uppercase tracking-widest border border-indigo-100">
                      {event.category.replace('_', ' ')}
                    </span>
                  </div>
                </div>
              )}

              <div className="p-6 flex-1 flex flex-col">
                <div className="flex items-center gap-2 text-[10px] font-black text-indigo-600 uppercase tracking-widest mb-2">
                  <Clock className="w-3 h-3" />
                  {new Date(event.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} • {event.time}
                </div>
                <h3 className="text-xl font-black text-slate-900 mb-3 line-clamp-1">{event.title}</h3>
                <p className="text-slate-500 text-sm font-medium line-clamp-3 mb-6 flex-1">{event.description}</p>
                
                <div className="space-y-3 pt-4 border-t border-slate-50">
                  <div className="flex items-center gap-2 text-slate-400 text-xs font-bold">
                    <MapPin className="w-4 h-4 text-indigo-400" />
                    {event.location}
                  </div>
                  <div className="flex items-center gap-2 text-slate-400 text-xs font-bold">
                    <Users className="w-4 h-4 text-indigo-400" />
                    Organized by {event.organizer}
                  </div>
                </div>

                <div className="mt-6 flex items-center justify-between gap-3">
                  {event.registrationUrl ? (
                    <a 
                      href={event.registrationUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex-1 bg-indigo-600 text-white py-3 rounded-xl font-black text-xs text-center shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all flex items-center justify-center gap-2"
                    >
                      Register Now <ExternalLink className="w-3 h-3" />
                    </a>
                  ) : (
                    <div className="flex-1 bg-slate-50 text-slate-400 py-3 rounded-xl font-black text-xs text-center border border-slate-100">
                      No Registration Required
                    </div>
                  )}
                  
                  {(user.uid === event.organizerId || user.role === 'admin') && (
                    <button 
                      onClick={() => handleDeleteEvent(event.id)}
                      className="p-3 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          ))
        ) : (
          <div className="col-span-full text-center py-20 bg-white rounded-[3rem] border border-dashed border-slate-200">
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center text-slate-300 mx-auto mb-6">
              <Calendar className="w-10 h-10" />
            </div>
            <h3 className="text-xl font-black text-slate-900 mb-2">No events found</h3>
            <p className="text-slate-400 font-medium">Check back later for new celebrations and ceremonies.</p>
          </div>
        )}
      </div>

      {/* Add Event Modal */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAddModal(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-2xl bg-white rounded-[3rem] shadow-2xl overflow-hidden"
            >
              <div className="p-8 md:p-12 max-h-[90vh] overflow-y-auto custom-scrollbar">
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-3xl font-black text-slate-900 tracking-tight">Organize Event</h2>
                  <button 
                    onClick={() => setShowAddModal(false)}
                    className="p-3 hover:bg-slate-50 rounded-2xl transition-colors text-slate-400"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <form onSubmit={handleAddEvent} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Event Title</label>
                      <input 
                        required
                        type="text" 
                        placeholder="e.g. Annual Sports Meet"
                        className="w-full p-4 bg-slate-50 rounded-2xl border-none focus:ring-2 focus:ring-indigo-500 font-bold text-slate-900"
                        value={newEvent.title}
                        onChange={(e) => setNewEvent(prev => ({ ...prev, title: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Category</label>
                      <select 
                        required
                        className="w-full p-4 bg-slate-50 rounded-2xl border-none focus:ring-2 focus:ring-indigo-500 font-bold text-slate-900 appearance-none"
                        value={newEvent.category}
                        onChange={(e) => setNewEvent(prev => ({ ...prev, category: e.target.value as Event['category'] }))}
                      >
                        {CATEGORIES.filter(c => c.id !== 'all').map(cat => (
                          <option key={cat.id} value={cat.id}>{cat.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Description</label>
                    <textarea 
                      required
                      rows={4}
                      placeholder="What is this event about?"
                      className="w-full p-4 bg-slate-50 rounded-2xl border-none focus:ring-2 focus:ring-indigo-500 font-medium text-slate-700 resize-none"
                      value={newEvent.description}
                      onChange={(e) => setNewEvent(prev => ({ ...prev, description: e.target.value }))}
                    />
                  </div>

                  <div className="grid md:grid-cols-3 gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Date</label>
                      <input 
                        required
                        type="date" 
                        className="w-full p-4 bg-slate-50 rounded-2xl border-none focus:ring-2 focus:ring-indigo-500 font-bold text-slate-900"
                        value={newEvent.date}
                        onChange={(e) => setNewEvent(prev => ({ ...prev, date: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Time</label>
                      <input 
                        required
                        type="time" 
                        className="w-full p-4 bg-slate-50 rounded-2xl border-none focus:ring-2 focus:ring-indigo-500 font-bold text-slate-900"
                        value={newEvent.time}
                        onChange={(e) => setNewEvent(prev => ({ ...prev, time: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Location</label>
                      <input 
                        required
                        type="text" 
                        placeholder="e.g. Main Auditorium"
                        className="w-full p-4 bg-slate-50 rounded-2xl border-none focus:ring-2 focus:ring-indigo-500 font-bold text-slate-900"
                        value={newEvent.location}
                        onChange={(e) => setNewEvent(prev => ({ ...prev, location: e.target.value }))}
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Image URL (Optional)</label>
                      <input 
                        type="url" 
                        placeholder="https://images.unsplash.com/..."
                        className="w-full p-4 bg-slate-50 rounded-2xl border-none focus:ring-2 focus:ring-indigo-500 font-bold text-slate-900"
                        value={newEvent.image}
                        onChange={(e) => setNewEvent(prev => ({ ...prev, image: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Registration Link (Optional)</label>
                      <input 
                        type="url" 
                        placeholder="https://forms.gle/..."
                        className="w-full p-4 bg-slate-50 rounded-2xl border-none focus:ring-2 focus:ring-indigo-500 font-bold text-slate-900"
                        value={newEvent.registrationUrl}
                        onChange={(e) => setNewEvent(prev => ({ ...prev, registrationUrl: e.target.value }))}
                      />
                    </div>
                  </div>

                  <button type="submit" className="w-full py-5 bg-indigo-600 text-white rounded-[1.5rem] font-black text-lg shadow-xl shadow-indigo-200 hover:bg-indigo-700 transition-all flex items-center justify-center gap-3">
                    <Calendar className="w-6 h-6" />
                    Create Event
                  </button>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
