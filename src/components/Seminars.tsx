import { useState, useEffect } from 'react';
import { collection, query, getDocs, orderBy, limit, addDoc, serverTimestamp } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { Seminar, User } from '../types';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Video, 
  Users, 
  Calendar, 
  Clock, 
  MapPin, 
  Globe, 
  Plus, 
  X, 
  ExternalLink, 
  Search,
  ArrowRight,
  GraduationCap
} from 'lucide-react';
import { cn } from '../lib/utils';

interface SeminarsProps {
  user: User;
}

export default function Seminars({ user }: SeminarsProps) {
  const [seminars, setSeminars] = useState<Seminar[]>([]);
  const [loading, setLoading] = useState(true);
  const [isPosting, setIsPosting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [newSeminar, setNewSeminar] = useState({
    title: '',
    type: 'seminar' as 'seminar' | 'webinar',
    date: '',
    time: '',
    location: '',
    description: '',
    registrationUrl: '',
  });

  useEffect(() => {
    const fetchSeminars = async () => {
      setLoading(true);
      try {
        const q = query(
          collection(db, 'seminars'),
          orderBy('createdAt', 'desc'),
          limit(30)
        );
        const snapshot = await getDocs(q);
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Seminar));
        setSeminars(data);
      } catch (error) {
        handleFirestoreError(error, OperationType.LIST, 'seminars');
      } finally {
        setLoading(false);
      }
    };

    fetchSeminars();
  }, []);

  const handlePost = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addDoc(collection(db, 'seminars'), {
        ...newSeminar,
        organizer: user.name,
        organizerId: user.uid,
        createdAt: serverTimestamp(),
      });
      setIsPosting(false);
      window.location.reload();
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'seminars');
    }
  };

  const filteredSeminars = seminars.filter(item => 
    item.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    item.organizer.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
        <div className="flex items-center gap-6">
          <div className="w-16 h-16 bg-violet-600 rounded-3xl flex items-center justify-center text-white shadow-xl shadow-violet-100">
            <Video className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-3xl font-black text-slate-900 tracking-tight">Seminars & Webinars</h2>
            <p className="text-slate-500 font-medium mt-1 uppercase tracking-widest text-[10px]">Learn from industry experts</p>
          </div>
        </div>
        {(user.role === 'govt' || user.role === 'college' || user.role === 'company' || user.role === 'admin') && (
          <button 
            onClick={() => setIsPosting(true)}
            className="bg-violet-600 hover:bg-violet-700 text-white px-8 py-4 rounded-2xl font-black text-sm transition-all shadow-xl shadow-violet-100 flex items-center gap-3"
          >
            <Plus className="w-6 h-6" />
            Host an Event
          </button>
        )}
      </div>

      {/* Search */}
      <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
          <input 
            type="text" 
            placeholder="Search by topic, speaker, or organizer..." 
            className="w-full pl-12 pr-4 py-3 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-violet-500 transition-all font-medium"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Posting Modal */}
      <AnimatePresence>
        {isPosting && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-[2.5rem] p-10 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
            >
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-2xl font-black text-slate-900">Host New Event</h3>
                <button onClick={() => setIsPosting(false)} className="p-2 hover:bg-slate-100 rounded-full">
                  <X className="w-6 h-6 text-slate-400" />
                </button>
              </div>
              <form onSubmit={handlePost} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="col-span-2">
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3">Event Title</label>
                    <input 
                      type="text" required
                      className="w-full p-4 bg-slate-50 rounded-2xl border-none focus:ring-2 focus:ring-violet-500 font-bold"
                      value={newSeminar.title}
                      onChange={(e) => setNewSeminar(prev => ({ ...prev, title: e.target.value }))}
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3">Event Type</label>
                    <select 
                      className="w-full p-4 bg-slate-50 rounded-2xl border-none focus:ring-2 focus:ring-violet-500 font-bold"
                      value={newSeminar.type}
                      onChange={(e) => setNewSeminar(prev => ({ ...prev, type: e.target.value as any }))}
                    >
                      <option value="seminar">Seminar (Offline)</option>
                      <option value="webinar">Webinar (Online)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3">Date</label>
                    <input 
                      type="date" required
                      className="w-full p-4 bg-slate-50 rounded-2xl border-none focus:ring-2 focus:ring-violet-500 font-bold"
                      value={newSeminar.date}
                      onChange={(e) => setNewSeminar(prev => ({ ...prev, date: e.target.value }))}
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3">Time</label>
                    <input 
                      type="time" required
                      className="w-full p-4 bg-slate-50 rounded-2xl border-none focus:ring-2 focus:ring-violet-500 font-bold"
                      value={newSeminar.time}
                      onChange={(e) => setNewSeminar(prev => ({ ...prev, time: e.target.value }))}
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3">{newSeminar.type === 'webinar' ? 'Meeting Link' : 'Location'}</label>
                    <input 
                      type="text" required
                      className="w-full p-4 bg-slate-50 rounded-2xl border-none focus:ring-2 focus:ring-violet-500 font-bold"
                      value={newSeminar.location}
                      onChange={(e) => setNewSeminar(prev => ({ ...prev, location: e.target.value }))}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3">Description</label>
                  <textarea 
                    required rows={4}
                    className="w-full p-4 bg-slate-50 rounded-2xl border-none focus:ring-2 focus:ring-violet-500 font-medium"
                    value={newSeminar.description}
                    onChange={(e) => setNewSeminar(prev => ({ ...prev, description: e.target.value }))}
                  />
                </div>
                <button type="submit" className="w-full py-5 bg-violet-600 text-white rounded-2xl font-black text-lg shadow-xl shadow-violet-100 hover:bg-violet-700 transition-all">
                  Publish Event
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Listings */}
      {loading ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-64 bg-slate-100 rounded-[2.5rem] animate-pulse"></div>
          ))}
        </div>
      ) : filteredSeminars.length > 0 ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSeminars.map((item, idx) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-xl hover:border-violet-100 transition-all group relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 p-4">
                <span className={cn(
                  "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest",
                  item.type === 'webinar' ? "bg-green-50 text-green-600" : "bg-blue-50 text-blue-600"
                )}>
                  {item.type}
                </span>
              </div>

              <div className="mb-6">
                <div className="w-14 h-14 bg-violet-50 rounded-2xl flex items-center justify-center text-violet-600 mb-4 group-hover:scale-110 transition-transform">
                  {item.type === 'webinar' ? <Globe className="w-8 h-8" /> : <Users className="w-8 h-8" />}
                </div>
                <h4 className="font-black text-slate-900 text-xl leading-tight mb-2">{item.title}</h4>
                <p className="text-xs text-slate-400 font-bold uppercase tracking-widest flex items-center gap-2">
                  <GraduationCap className="w-4 h-4" />
                  {item.organizer}
                </p>
              </div>

              <div className="space-y-3 mb-8">
                <div className="flex items-center gap-3 text-sm text-slate-600 font-medium">
                  <Calendar className="w-4 h-4 text-slate-400" />
                  {new Date(item.date).toLocaleDateString()}
                </div>
                <div className="flex items-center gap-3 text-sm text-slate-600 font-medium">
                  <Clock className="w-4 h-4 text-slate-400" />
                  {item.time}
                </div>
                <div className="flex items-center gap-3 text-sm text-slate-600 font-medium">
                  <MapPin className="w-4 h-4 text-slate-400" />
                  <span className="truncate">{item.location}</span>
                </div>
              </div>

              <div className="pt-6 border-t border-slate-50">
                <button className="w-full bg-slate-900 hover:bg-slate-800 text-white py-4 rounded-2xl font-black text-sm transition-all flex items-center justify-center gap-2 group/btn">
                  Register Now
                  <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-white rounded-[2.5rem] border border-dashed border-slate-200">
          <Video className="w-16 h-16 text-slate-200 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-slate-900">No events scheduled</h3>
          <p className="text-slate-500 mt-1">Check back later for upcoming seminars and webinars</p>
        </div>
      )}
    </div>
  );
}
