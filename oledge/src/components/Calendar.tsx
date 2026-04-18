import { useState, useEffect } from 'react';
import { collection, query, getDocs, orderBy, limit } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { CalendarEvent, User } from '../types';
import { motion } from 'framer-motion';
import { 
  Calendar as CalendarIcon, 
  Plus,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Clock,
  Info
} from 'lucide-react';
import { cn } from '../lib/utils';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, addMonths, subMonths } from 'date-fns';

interface CalendarProps {
  user: User;
}

export default function Calendar({ user }: CalendarProps) {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentMonth, setCurrentMonth] = useState(new Date());

  useEffect(() => {
    const fetchEvents = async () => {
      setLoading(true);
      try {
        const q = query(
          collection(db, 'calendar'),
          orderBy('date', 'asc'),
          limit(50)
        );
        const snapshot = await getDocs(q);
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as CalendarEvent));
        setEvents(data);
      } catch (error) {
        handleFirestoreError(error, OperationType.LIST, 'calendar');
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));

  const getEventColor = (type: string) => {
    switch (type) {
      case 'academic': return 'bg-blue-500';
      case 'exam': return 'bg-red-500';
      case 'holiday': return 'bg-green-500';
      case 'event': return 'bg-purple-500';
      default: return 'bg-slate-500';
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Academic Calendar</h2>
          <p className="text-slate-500 font-medium mt-1 uppercase tracking-wider text-xs">Stay updated with college and government schedules</p>
        </div>
        {(user.role === 'college' || user.role === 'govt' || user.role === 'admin') && (
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-2xl font-bold text-sm transition-all shadow-lg shadow-blue-200 flex items-center gap-2">
            <Plus className="w-5 h-5" />
            Add Event
          </button>
        )}
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Calendar Grid */}
        <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-100 shadow-sm p-8">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-2xl font-black text-slate-900">{format(currentMonth, 'MMMM yyyy')}</h3>
            <div className="flex items-center gap-2">
              <button onClick={prevMonth} className="p-2 hover:bg-slate-50 rounded-xl transition-colors">
                <ChevronLeft className="w-6 h-6 text-slate-600" />
              </button>
              <button onClick={nextMonth} className="p-2 hover:bg-slate-50 rounded-xl transition-colors">
                <ChevronRight className="w-6 h-6 text-slate-600" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-2 mb-4">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="text-center text-xs font-black text-slate-400 uppercase tracking-widest py-2">
                {day}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-2">
            {/* Empty days before start of month */}
            {Array.from({ length: monthStart.getDay() }).map((_, i) => (
              <div key={`empty-${i}`} className="h-24 bg-slate-50/50 rounded-2xl"></div>
            ))}
            
            {days.map((day) => {
              const dayEvents = events.filter(e => isSameDay(new Date(e.date), day));
              return (
                <div key={day.toString()} className="h-24 bg-white border border-slate-50 rounded-2xl p-2 hover:border-blue-100 transition-all group relative overflow-hidden">
                  <span className="text-sm font-bold text-slate-400 group-hover:text-blue-600 transition-colors">{format(day, 'd')}</span>
                  <div className="mt-1 space-y-1">
                    {dayEvents.map((e, idx) => (
                      <div 
                        key={e.id} 
                        className={cn("h-1.5 rounded-full", getEventColor(e.type))}
                        title={e.title}
                      ></div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Upcoming Events List */}
        <div className="space-y-6">
          <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Clock className="w-6 h-6 text-blue-500" />
            Upcoming Events
          </h3>
          <div className="space-y-4">
            {loading ? (
              [1, 2, 3].map(i => <div key={i} className="h-24 bg-slate-100 rounded-3xl animate-pulse"></div>)
            ) : events.length > 0 ? (
              events.map((event, idx) => (
                <motion.div
                  key={event.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-all flex items-start gap-4 group"
                >
                  <div className={cn("w-3 h-3 rounded-full mt-1.5 shrink-0", getEventColor(event.type))}></div>
                  <div className="flex-1">
                    <h4 className="font-bold text-slate-900 text-sm leading-tight group-hover:text-blue-600 transition-colors">{event.title}</h4>
                    <p className="text-xs text-slate-500 font-medium mt-1">{format(new Date(event.date), 'PPP')}</p>
                    <div className="flex items-center gap-2 mt-3">
                      <span className="px-2 py-0.5 bg-slate-50 text-slate-400 text-[10px] font-black uppercase tracking-widest rounded-md border border-slate-100">
                        {event.type}
                      </span>
                      <span className="text-[10px] text-slate-400 font-medium italic">by {event.creatorRole}</span>
                    </div>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="text-center py-10 bg-white rounded-3xl border border-dashed border-slate-200">
                <Info className="w-10 h-10 text-slate-200 mx-auto mb-2" />
                <p className="text-sm text-slate-500 font-medium">No upcoming events</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
