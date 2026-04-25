import { useState, useEffect } from 'react';
import { collection, query, getDocs, orderBy, limit, addDoc, updateDoc, deleteDoc, doc, where, serverTimestamp } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { CalendarEvent, User } from '../types';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus,
  Calendar as CalendarIcon,
  Clock,
  Bell,
  FileText,
  Globe,
  Lock,
  X,
  Edit2,
  Trash2,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { cn } from '../lib/utils';
import Logo from './Logo';

interface CalendarProps {
  user: User;
}

export default function Calendar({ user }: CalendarProps) {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    date: '',
    time: '',
    type: 'event' as const,
    description: '',
    note: '',
    isPublic: false,
    reminders: [] as string[]
  });

  useEffect(() => {
    fetchEvents();
  }, [user.uid]);

  const fetchEvents = async () => {
    setLoading(true);
    try {
      // Fetch public events + user's private events
      const qPublic = query(
        collection(db, 'calendar'),
        where('isPublic', '==', true),
        orderBy('date', 'asc'),
        limit(50)
      );
      
      const qPrivate = query(
        collection(db, 'calendar'),
        where('creatorId', '==', user.uid),
        where('isPublic', '==', false),
        orderBy('date', 'asc'),
        limit(50)
      );

      const [pubSnap, privSnap] = await Promise.all([getDocs(qPublic), getDocs(qPrivate)]);
      
      const publicData = pubSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as CalendarEvent));
      const privateData = privSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as CalendarEvent));
      
      // Merge and sort
      const allEvents = [...publicData, ...privateData]
        .filter((v, i, a) => a.findIndex(t => t.id === v.id) === i) // Deduplicate
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        
      setEvents(allEvents);
    } catch (error) {
      console.error("Error fetching events:", error);
      handleFirestoreError(error, OperationType.LIST, 'calendar');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (event?: CalendarEvent) => {
    if (event) {
      setEditingEvent(event);
      setFormData({
        title: event.title,
        date: event.date,
        time: event.time || '',
        type: event.type as any,
        description: event.description || '',
        note: event.note || '',
        isPublic: event.isPublic,
        reminders: event.reminders || []
      });
    } else {
      setEditingEvent(null);
      setFormData({
        title: '',
        date: '',
        time: '',
        type: 'event',
        description: '',
        note: '',
        isPublic: false,
        reminders: []
      });
    }
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const data = {
        ...formData,
        creatorId: user.uid,
        creatorName: user.name,
        creatorRole: user.role,
        updatedAt: serverTimestamp(),
      };

      if (editingEvent) {
        await updateDoc(doc(db, 'calendar', editingEvent.id), data);
      } else {
        await addDoc(collection(db, 'calendar'), {
          ...data,
          createdAt: serverTimestamp()
        });
      }
      
      setShowModal(false);
      fetchEvents();
    } catch (error) {
      handleFirestoreError(error, editingEvent ? OperationType.UPDATE : OperationType.CREATE, 'calendar');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this event?")) return;
    try {
      await deleteDoc(doc(db, 'calendar', id));
      fetchEvents();
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, 'calendar');
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 py-4">
      {/* Header Section */}
      <div className="flex items-center justify-between px-2">
        <h1 className="text-3xl font-bold text-[#1e293b] tracking-tight">Oledge Calendar</h1>
        <button 
          onClick={() => handleOpenModal()}
          className="w-12 h-12 bg-blue-600 hover:bg-blue-700 flex items-center justify-center rounded-2xl transition-all group shadow-lg shadow-blue-200"
        >
          <Plus className="w-6 h-6 text-white transition-transform group-hover:scale-110" />
        </button>
      </div>

      {/* Main Container Card */}
      <div className="bg-white rounded-[3rem] border border-slate-100 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.03)] min-h-[600px] p-10 flex flex-col relative overflow-hidden">
        
        {/* Banner Section */}
        <div className="bg-[#eff6ff] rounded-[2rem] p-6 flex items-center gap-6 mb-8">
          <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm">
            <CalendarIcon className="w-6 h-6 text-blue-600" strokeWidth={2.5} />
          </div>
          <div className="flex flex-col">
            <h2 className="text-xl font-bold text-[#1e293b]">Important Milestones</h2>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-600/80">
              Personal & {user.role === 'student' ? 'Academic' : 'Professional'} Dashboard
            </p>
          </div>
        </div>

        {/* Filters/Search placeholder if needed */}

        {/* Content Section */}
        <div className="flex-1">
          {loading ? (
            <div className="grid gap-6 grid-cols-1 md:grid-cols-2">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="h-48 bg-slate-50/50 rounded-[2.5rem] animate-pulse" />
              ))}
            </div>
          ) : events.length === 0 ? (
            <div className="flex flex-col items-center justify-center text-center h-[400px]">
              <div className="w-32 h-32 bg-slate-50 rounded-3xl flex items-center justify-center mb-8">
                <CalendarIcon className="w-16 h-16 text-slate-200" strokeWidth={1.5} />
              </div>
              <h3 className="text-2xl font-bold text-[#94a3b8] uppercase tracking-[0.25em] mb-3">No Events Found</h3>
              <p className="text-slate-400 font-medium text-lg">Your academic and professional path starts here.</p>
            </div>
          ) : (
            <div className="grid gap-6 grid-cols-1 md:grid-cols-2">
              <AnimatePresence>
                {events.map((event, idx) => (
                  <motion.div 
                    key={event.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ delay: idx * 0.05 }}
                    className="p-8 rounded-[2.5rem] border border-slate-50 bg-white shadow-sm hover:shadow-md transition-all group relative overflow-hidden"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          "w-10 h-10 rounded-xl flex items-center justify-center",
                          event.type === 'academic' ? "bg-blue-50 text-blue-600" :
                          event.type === 'exam' ? "bg-red-50 text-red-600" :
                          event.type === 'holiday' ? "bg-green-50 text-green-600" :
                          "bg-purple-50 text-purple-600"
                        )}>
                          <Clock className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="font-bold text-slate-800 text-lg leading-tight">{event.title}</h4>
                          <p className="text-sm text-slate-400 font-medium">{new Date(event.date).toLocaleDateString(undefined, { dateStyle: 'long' })}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {event.isPublic ? (
                          <div title="Public"><Globe className="w-4 h-4 text-blue-400" /></div>
                        ) : (
                          <div title="Private"><Lock className="w-4 h-4 text-slate-300" /></div>
                        )}
                      </div>
                    </div>

                    <div className="space-y-4">
                      <p className="text-slate-500 text-sm line-clamp-2 leading-relaxed">
                        {event.description || event.note || "No additional information provided."}
                      </p>

                      <div className="flex flex-wrap gap-2">
                        {event.time && (
                          <div className="px-3 py-1 bg-slate-50 rounded-lg text-[10px] font-bold text-slate-400 flex items-center gap-1.5 border border-slate-100">
                            <Clock className="w-3 h-3" /> {event.time}
                          </div>
                        )}
                        {event.reminders && event.reminders.length > 0 && (
                          <div className="px-3 py-1 bg-blue-50/50 rounded-lg text-[10px] font-bold text-blue-400 flex items-center gap-1.5 border border-blue-50">
                            <Bell className="w-3 h-3" /> {event.reminders.length} Reminders
                          </div>
                        )}
                      </div>
                    </div>

                    {event.creatorId === user.uid && (
                      <div className="absolute top-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-2">
                        <button 
                          onClick={() => handleOpenModal(event)}
                          className="p-2 bg-slate-50 text-slate-400 hover:text-blue-500 rounded-xl transition-colors"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleDelete(event.id)}
                          className="p-2 bg-red-50/50 text-red-300 hover:text-red-500 rounded-xl transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    )}

                    <div className="mt-6 pt-4 border-t border-slate-50 flex items-center justify-between">
                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-300">Posted by {event.creatorRole}</span>
                      <span className="text-[10px] font-medium text-slate-400 italic">{event.creatorName}</span>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>

        {/* Footer Section */}
        <div className="mt-auto pt-8 flex items-center justify-center gap-2 border-t border-slate-50/50">
          <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">Managed by</span>
          <Logo size="sm" showText={true} className="opacity-40 grayscale" />
        </div>
      </div>

      {/* Action Modal */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowModal(false)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-md"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-2xl bg-white rounded-[3rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
              {/* Modal Header */}
              <div className="px-8 py-6 border-b border-slate-50 flex items-center justify-between bg-white sticky top-0 z-10">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center">
                    <CalendarIcon className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-900">{editingEvent ? 'Edit Event' : 'Create Oledge Milestone'}</h3>
                    <p className="text-xs text-slate-400 font-medium">Capture your important academic or professional dates</p>
                  </div>
                </div>
                <button 
                  onClick={() => setShowModal(false)}
                  className="p-2 hover:bg-slate-50 rounded-xl text-slate-400 transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Modal Form */}
              <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-8 space-y-6">
                <div className="grid sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Event Title</label>
                    <input 
                      type="text" 
                      required
                      placeholder="Graduation Day, Project Deadline..."
                      className="w-full px-6 py-4 bg-slate-50 border-2 border-transparent rounded-2xl focus:border-blue-500 focus:bg-white transition-all font-bold text-slate-900"
                      value={formData.title}
                      onChange={e => setFormData({ ...formData, title: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Category</label>
                    <select 
                      className="w-full px-6 py-4 bg-slate-50 border-2 border-transparent rounded-2xl focus:border-blue-500 focus:bg-white transition-all font-bold text-slate-900 appearance-none"
                      value={formData.type}
                      onChange={e => setFormData({ ...formData, type: e.target.value as any })}
                    >
                      <option value="academic">Academic</option>
                      <option value="exam">Examination</option>
                      <option value="holiday">Holiday</option>
                      <option value="event">Campus Event</option>
                      <option value="personal">Personal Goal</option>
                    </select>
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Date</label>
                    <input 
                      type="date" 
                      required
                      className="w-full px-6 py-4 bg-slate-50 border-2 border-transparent rounded-2xl focus:border-blue-500 focus:bg-white transition-all font-bold text-slate-900"
                      value={formData.date}
                      onChange={e => setFormData({ ...formData, date: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Time (Optional)</label>
                    <input 
                      type="time" 
                      className="w-full px-6 py-4 bg-slate-50 border-2 border-transparent rounded-2xl focus:border-blue-500 focus:bg-white transition-all font-bold text-slate-900"
                      value={formData.time}
                      onChange={e => setFormData({ ...formData, time: e.target.value })}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Detailed Description</label>
                  <textarea 
                    rows={3}
                    placeholder="Provide more context about this milestone..."
                    className="w-full px-6 py-4 bg-slate-50 border-2 border-transparent rounded-2xl focus:border-blue-500 focus:bg-white transition-all font-bold text-slate-900 resize-none"
                    value={formData.description}
                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Private Note</label>
                  <textarea 
                    rows={2}
                    placeholder="Attach secret notes or reminders for yourself..."
                    className="w-full px-6 py-4 bg-slate-50 border-2 border-transparent rounded-2xl focus:border-blue-500 focus:bg-white transition-all font-bold text-slate-900 resize-none"
                    value={formData.note}
                    onChange={e => setFormData({ ...formData, note: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 ml-1 flex items-center gap-2">
                    <Bell className="w-3 h-3" /> Reminders (e.g., 30 mins before, 1 day before)
                  </label>
                  <div className="flex gap-2">
                    <input 
                      type="text" 
                      placeholder="Add a reminder..."
                      className="flex-1 px-6 py-3 bg-slate-50 border-2 border-transparent rounded-2xl focus:border-blue-500 focus:bg-white transition-all font-bold text-slate-900"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          const val = (e.target as HTMLInputElement).value.trim();
                          if (val && !formData.reminders.includes(val)) {
                            setFormData({ ...formData, reminders: [...formData.reminders, val] });
                            (e.target as HTMLInputElement).value = '';
                          }
                        }
                      }}
                    />
                  </div>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {formData.reminders.map(reminder => (
                      <div key={reminder} className="px-3 py-1 bg-slate-100 rounded-lg text-[10px] font-bold text-slate-600 flex items-center gap-2">
                        {reminder}
                        <button 
                          type="button" 
                          onClick={() => setFormData({ ...formData, reminders: formData.reminders.filter(r => r !== reminder) })}
                          className="hover:text-red-500"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Privacy Toggle */}
                <div className="bg-slate-50/50 p-6 rounded-3xl border border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={cn(
                      "w-10 h-10 rounded-xl flex items-center justify-center transition-colors",
                      formData.isPublic ? "bg-blue-100 text-blue-600" : "bg-slate-200 text-slate-500"
                    )}>
                      {formData.isPublic ? <Globe className="w-5 h-5" /> : <Lock className="w-5 h-5" />}
                    </div>
                    <div>
                      <p className="font-bold text-slate-900">Make it Public?</p>
                      <p className="text-[10px] text-slate-400 font-medium">Public events are visible to all Oledge users.</p>
                    </div>
                  </div>
                  <button 
                    type="button"
                    onClick={() => setFormData({ ...formData, isPublic: !formData.isPublic })}
                    className={cn(
                      "w-14 h-8 rounded-full relative transition-colors duration-300",
                      formData.isPublic ? "bg-blue-500" : "bg-slate-300"
                    )}
                  >
                    <motion.div 
                      animate={{ x: formData.isPublic ? 24 : 4 }}
                      className="w-6 h-6 bg-white rounded-full absolute top-1 shadow-sm"
                    />
                  </button>
                </div>

                <button 
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white rounded-3xl font-black uppercase tracking-widest text-sm transition-all shadow-xl shadow-blue-200 flex items-center justify-center gap-3"
                >
                  {isSubmitting ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      {editingEvent ? <CheckCircle2 className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
                      {editingEvent ? 'Save Changes' : 'Post Milestone'}
                    </>
                  )}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
