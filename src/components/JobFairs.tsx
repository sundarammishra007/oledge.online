import { useState, useEffect } from 'react';
import { collection, query, getDocs, orderBy, limit } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { JobFair, User } from '../types';
import { motion } from 'framer-motion';
import { 
  MapPin, 
  Calendar as CalendarIcon, 
  Building2, 
  Search, 
  Plus,
  ArrowRight,
  Info
} from 'lucide-react';
import { cn } from '../lib/utils';

interface JobFairsProps {
  user: User;
}

export default function JobFairs({ user }: JobFairsProps) {
  const [jobFairs, setJobFairs] = useState<JobFair[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchJobFairs = async () => {
      setLoading(true);
      try {
        const q = query(
          collection(db, 'jobfairs'),
          orderBy('date', 'asc'),
          limit(20)
        );
        const snapshot = await getDocs(q);
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as JobFair));
        setJobFairs(data);
      } catch (error) {
        handleFirestoreError(error, OperationType.LIST, 'jobfairs');
      } finally {
        setLoading(false);
      }
    };

    fetchJobFairs();
  }, []);

  const filteredJobFairs = jobFairs.filter(item => 
    item.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    item.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Job Fair Locator</h2>
          <p className="text-slate-500 font-medium mt-1 uppercase tracking-wider text-xs">Find hiring events near you</p>
        </div>
        {(user.role === 'college' || user.role === 'company' || user.role === 'govt' || user.role === 'admin') && (
          <button className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-3 rounded-2xl font-bold text-sm transition-all shadow-lg shadow-orange-200 flex items-center gap-2">
            <Plus className="w-5 h-5" />
            Post Hiring Event
          </button>
        )}
      </div>

      <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
          <input 
            type="text" 
            placeholder="Search by location, city, or event name..." 
            className="w-full pl-12 pr-4 py-3 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-orange-500 transition-all font-medium"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-40 bg-slate-100 rounded-3xl animate-pulse"></div>
          ))}
        </div>
      ) : filteredJobFairs.length > 0 ? (
        <div className="space-y-6">
          {filteredJobFairs.map((item, idx) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl hover:border-orange-100 transition-all flex flex-col md:flex-row gap-8 items-center"
            >
              <div className="w-24 h-24 bg-orange-50 rounded-3xl flex flex-col items-center justify-center text-orange-600 border border-orange-100 shrink-0">
                <span className="text-xs font-black uppercase tracking-widest">{new Date(item.date).toLocaleString('default', { month: 'short' })}</span>
                <span className="text-3xl font-black">{new Date(item.date).getDate()}</span>
              </div>

              <div className="flex-1 text-center md:text-left">
                <h4 className="text-2xl font-black text-slate-900 leading-tight mb-2">{item.title}</h4>
                <div className="flex flex-wrap justify-center md:justify-start gap-4 text-sm text-slate-500 font-medium">
                  <div className="flex items-center gap-1">
                    <MapPin className="w-4 h-4 text-orange-500" />
                    {item.location}
                  </div>
                  <div className="flex items-center gap-1">
                    <Building2 className="w-4 h-4 text-orange-500" />
                    {item.organizer}
                  </div>
                </div>
              </div>

              <div className="flex flex-col items-center md:items-end gap-4 shrink-0">
                <div className="flex -space-x-2">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="w-8 h-8 rounded-full bg-slate-100 border-2 border-white flex items-center justify-center text-[10px] font-bold text-slate-400">
                      C{i}
                    </div>
                  ))}
                  <div className="w-8 h-8 rounded-full bg-slate-900 border-2 border-white flex items-center justify-center text-[10px] font-bold text-white">
                    +{item.companies.length}
                  </div>
                </div>
                <button className="bg-slate-900 hover:bg-slate-800 text-white px-8 py-3 rounded-2xl font-bold text-sm transition-all flex items-center gap-2">
                  View Details <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-slate-200">
          <MapPin className="w-16 h-16 text-slate-200 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-slate-900">No job fairs found</h3>
          <p className="text-slate-500 mt-1">Check back later for hiring events near you</p>
        </div>
      )}
    </div>
  );
}
