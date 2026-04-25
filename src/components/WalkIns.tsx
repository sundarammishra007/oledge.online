import { useState, useEffect } from 'react';
import { collection, query, getDocs, orderBy, limit } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { WalkIn, User } from '../types';
import { motion } from 'framer-motion';
import { 
  MapPin, 
  Calendar as CalendarIcon, 
  Building2, 
  Search, 
  Plus,
  ArrowRight,
  UserCheck,
  Clock
} from 'lucide-react';
import { cn } from '../lib/utils';

interface WalkInsProps {
  user: User;
}

export default function WalkIns({ user }: WalkInsProps) {
  const [walkIns, setWalkIns] = useState<WalkIn[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchWalkIns = async () => {
      setLoading(true);
      try {
        const q = query(
          collection(db, 'walkins'),
          orderBy('date', 'asc'),
          limit(20)
        );
        const snapshot = await getDocs(q);
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as WalkIn));
        setWalkIns(data);
      } catch (error) {
        handleFirestoreError(error, OperationType.LIST, 'walkins');
      } finally {
        setLoading(false);
      }
    };

    fetchWalkIns();
  }, []);

  const filteredWalkIns = walkIns.filter(item => 
    item.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    item.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.companyName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tighter flex items-center gap-3">
            <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 shadow-sm border border-blue-100">
              <UserCheck className="w-7 h-7" />
            </div>
            Walk-in Drives
          </h2>
          <p className="text-slate-500 font-bold mt-1 uppercase tracking-[0.2em] text-[10px] ml-15">Direct recruitment opportunities</p>
        </div>
        {(user.role === 'company' || user.role === 'admin') && (
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-2xl font-black text-sm transition-all shadow-xl shadow-blue-100 flex items-center gap-3 active:scale-95">
            <Plus className="w-5 h-5" />
            Post Walk-in Drive
          </button>
        )}
      </div>

      {/* Search & Filters */}
      <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
          <input 
            type="text" 
            placeholder="Search by city, company name, or role..." 
            className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all font-black text-sm text-slate-900 placeholder:text-slate-400 placeholder:font-bold"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-64 bg-slate-100 rounded-[2.5rem] animate-pulse"></div>
          ))}
        </div>
      ) : filteredWalkIns.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredWalkIns.map((item, idx) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-2xl hover:border-blue-100 transition-all flex flex-col justify-between group h-full"
            >
              <div className="space-y-6">
                <div className="flex items-start justify-between">
                  <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 group-hover:bg-blue-50 group-hover:text-blue-600 transition-all duration-500 border border-slate-100 group-hover:border-blue-100 shadow-sm">
                    <Building2 className="w-8 h-8" />
                  </div>
                  <div className="px-4 py-2 bg-emerald-50 text-emerald-600 rounded-xl text-[10px] font-black uppercase tracking-widest border border-emerald-100 shadow-sm shadow-emerald-50">
                    Open Drive
                  </div>
                </div>

                <div>
                  <h4 className="text-2xl font-black text-slate-900 leading-tight mb-2 group-hover:text-blue-600 transition-colors uppercase tracking-tight">{item.title}</h4>
                  <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px] flex items-center gap-2">
                    <Building2 className="w-3 h-3" />
                    {item.companyName}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 group-hover:bg-blue-50/30 group-hover:border-blue-100 transition-colors">
                    <div className="flex items-center gap-2 text-slate-400 mb-1">
                      <CalendarIcon className="w-3 h-3" />
                      <span className="text-[10px] font-black uppercase tracking-widest">Date</span>
                    </div>
                    <p className="font-black text-slate-900 text-sm">
                      {new Date(item.date).toLocaleDateString('en-US', { day: 'numeric', month: 'short' })}
                    </p>
                  </div>
                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 group-hover:bg-blue-50/30 group-hover:border-blue-100 transition-colors">
                    <div className="flex items-center gap-2 text-slate-400 mb-1">
                      <Clock className="w-3 h-3" />
                      <span className="text-[10px] font-black uppercase tracking-widest">Starts At</span>
                    </div>
                    <p className="font-black text-slate-900 text-sm">{item.time}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-slate-600 bg-slate-50 p-4 rounded-2xl border border-slate-100 group-hover:bg-blue-50/30 group-hover:border-blue-100 transition-colors">
                  <MapPin className="w-4 h-4 text-orange-500 shrink-0" />
                  <span className="text-xs font-black uppercase tracking-tight truncate">{item.location}</span>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-slate-50 group-hover:border-blue-50 flex items-center justify-between">
                <button className="text-slate-400 font-black text-[10px] uppercase tracking-widest hover:text-blue-600 transition-colors">
                  Save Event
                </button>
                <button className="bg-slate-900 group-hover:bg-blue-600 text-white px-8 py-3 rounded-xl font-black text-xs transition-all flex items-center gap-2 shadow-lg shadow-slate-200 group-hover:shadow-blue-200 active:scale-95">
                  Apply Now <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="text-center py-32 bg-white rounded-[3rem] border border-dashed border-slate-200 shadow-inner">
          <div className="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center text-slate-200 mx-auto mb-6">
            <UserCheck className="w-10 h-10" />
          </div>
          <h3 className="text-2xl font-black text-slate-900 tracking-tight uppercase">No walk-in drives today</h3>
          <p className="text-slate-400 font-bold uppercase tracking-widest text-xs mt-2 italic">Waiting for new hiring opportunities...</p>
        </div>
      )}
    </div>
  );
}
