import { useState, useEffect } from 'react';
import { collection, query, getDocs, orderBy, limit } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { Hackathon, User } from '../types';
import { motion } from 'framer-motion';
import { 
  Trophy, 
  Calendar as CalendarIcon, 
  ExternalLink, 
  Search, 
  Plus,
  ArrowRight
} from 'lucide-react';
import { cn } from '../lib/utils';

interface HackathonsProps {
  user: User;
}

export default function Hackathons({ user }: HackathonsProps) {
  const [hackathons, setHackathons] = useState<Hackathon[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchHackathons = async () => {
      setLoading(true);
      try {
        const q = query(
          collection(db, 'hackathons'),
          orderBy('deadline', 'asc'),
          limit(20)
        );
        const snapshot = await getDocs(q);
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Hackathon));
        setHackathons(data);
      } catch (error) {
        handleFirestoreError(error, OperationType.LIST, 'hackathons');
      } finally {
        setLoading(false);
      }
    };

    fetchHackathons();
  }, []);

  const filteredHackathons = hackathons.filter(item => 
    item.eventName.toLowerCase().includes(searchTerm.toLowerCase()) || 
    item.organizer.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Hackathon & Competition Hub</h2>
          <p className="text-slate-500 font-medium mt-1 uppercase tracking-wider text-xs">Showcase your skills on a global stage</p>
        </div>
        {(user.role === 'college' || user.role === 'company' || user.role === 'govt') && (
          <button className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-2xl font-bold text-sm transition-all shadow-lg shadow-purple-200 flex items-center gap-2">
            <Plus className="w-5 h-5" />
            Host Competition
          </button>
        )}
      </div>

      <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
          <input 
            type="text" 
            placeholder="Search competitions, hackathons, coding contests..." 
            className="w-full pl-12 pr-4 py-3 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-purple-500 transition-all font-medium"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <div className="grid md:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-64 bg-slate-100 rounded-3xl animate-pulse"></div>
          ))}
        </div>
      ) : filteredHackathons.length > 0 ? (
        <div className="grid md:grid-cols-3 gap-6">
          {filteredHackathons.map((item, idx) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="bg-white rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl hover:border-purple-100 transition-all overflow-hidden flex flex-col"
            >
              <div className="h-32 bg-gradient-to-br from-purple-500 to-indigo-600 p-6 flex items-end">
                <Trophy className="w-12 h-12 text-white/20 absolute top-4 right-4" />
                <h4 className="text-white font-black text-xl leading-tight line-clamp-2">{item.eventName}</h4>
              </div>
              
              <div className="p-6 flex-1 flex flex-col">
                <div className="flex items-center gap-2 text-slate-600 font-bold text-sm mb-4">
                  <div className="w-8 h-8 bg-slate-50 rounded-lg flex items-center justify-center text-purple-600">
                    <Trophy className="w-4 h-4" />
                  </div>
                  {item.organizer}
                </div>

                <p className="text-sm text-slate-500 font-medium line-clamp-3 mb-6 flex-1">
                  {item.description}
                </p>

                <div className="space-y-3 pt-4 border-t border-slate-50">
                  <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider">
                    <span className="text-slate-400 flex items-center gap-1">
                      <CalendarIcon className="w-3 h-3" />
                      Deadline
                    </span>
                    <span className="text-red-500">{new Date(item.deadline).toLocaleDateString()}</span>
                  </div>
                  
                  <a 
                    href={item.applyUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="w-full bg-slate-900 hover:bg-slate-800 text-white py-3 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2"
                  >
                    Apply Now <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-slate-200">
          <Trophy className="w-16 h-16 text-slate-200 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-slate-900">No competitions found</h3>
          <p className="text-slate-500 mt-1">Check back later for new challenges</p>
        </div>
      )}
    </div>
  );
}
