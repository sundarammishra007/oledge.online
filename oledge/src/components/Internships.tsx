import { useState, useEffect } from 'react';
import { collection, query, getDocs, where, orderBy, limit } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { Internship, User } from '../types';
import { motion } from 'framer-motion';
import { 
  Briefcase, 
  MapPin, 
  Globe, 
  DollarSign, 
  Search, 
  Filter, 
  Plus, 
  X,
  ArrowRight
} from 'lucide-react';
import { cn } from '../lib/utils';

interface InternshipsProps {
  user: User;
}

export default function Internships({ user }: InternshipsProps) {
  const [internships, setInternships] = useState<Internship[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState({
    remote: false,
    paid: false,
    skill: '',
  });

  useEffect(() => {
    const fetchInternships = async () => {
      setLoading(true);
      try {
        const q = query(
          collection(db, 'internships'),
          orderBy('createdAt', 'desc'),
          limit(20)
        );
        const snapshot = await getDocs(q);
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Internship));
        setInternships(data);
      } catch (error) {
        handleFirestoreError(error, OperationType.LIST, 'internships');
      } finally {
        setLoading(false);
      }
    };

    fetchInternships();
  }, []);

  const filteredInternships = internships.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         item.companyName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRemote = !filter.remote || item.isRemote;
    const matchesPaid = !filter.paid || (item.stipend !== 'Unpaid' && item.stipend !== '0');
    const matchesSkill = !filter.skill || item.skillsRequired.some(s => s.toLowerCase().includes(filter.skill.toLowerCase()));
    
    return matchesSearch && matchesRemote && matchesPaid && matchesSkill;
  });

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Internship Marketplace</h2>
          <p className="text-slate-500 font-medium mt-1 uppercase tracking-wider text-xs">Find your next big opportunity</p>
        </div>
        {user.role === 'company' && (
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-2xl font-bold text-sm transition-all shadow-lg shadow-blue-200 flex items-center gap-2">
            <Plus className="w-5 h-5" />
            Post Internship
          </button>
        )}
      </div>

      {/* Search & Filter */}
      <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
            <input 
              type="text" 
              placeholder="Search by title or company..." 
              className="w-full pl-12 pr-4 py-3 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500 transition-all font-medium"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setFilter(prev => ({ ...prev, remote: !prev.remote }))}
              className={cn(
                "px-4 py-3 rounded-2xl font-bold text-sm transition-all flex items-center gap-2",
                filter.remote ? "bg-blue-600 text-white shadow-lg shadow-blue-200" : "bg-slate-50 text-slate-600 hover:bg-slate-100"
              )}
            >
              <Globe className="w-4 h-4" />
              Remote
            </button>
            <button 
              onClick={() => setFilter(prev => ({ ...prev, paid: !prev.paid }))}
              className={cn(
                "px-4 py-3 rounded-2xl font-bold text-sm transition-all flex items-center gap-2",
                filter.paid ? "bg-blue-600 text-white shadow-lg shadow-blue-200" : "bg-slate-50 text-slate-600 hover:bg-slate-100"
              )}
            >
              <DollarSign className="w-4 h-4" />
              Paid
            </button>
          </div>
        </div>
      </div>

      {/* Listings */}
      {loading ? (
        <div className="grid md:grid-cols-2 gap-6">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-48 bg-slate-100 rounded-3xl animate-pulse"></div>
          ))}
        </div>
      ) : filteredInternships.length > 0 ? (
        <div className="grid md:grid-cols-2 gap-6">
          {filteredInternships.map((item, idx) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: idx * 0.05 }}
              className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl hover:border-blue-100 transition-all group"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 font-black text-xl">
                    {item.companyName.charAt(0)}
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-lg leading-tight">{item.title}</h4>
                    <p className="text-sm text-slate-500 font-medium">{item.companyName}</p>
                  </div>
                </div>
                {item.isRemote && (
                  <span className="px-3 py-1 bg-green-50 text-green-600 text-[10px] font-black uppercase tracking-widest rounded-full border border-green-100">
                    Remote
                  </span>
                )}
              </div>

              <div className="flex flex-wrap gap-4 text-sm text-slate-600 font-medium mb-6">
                <div className="flex items-center gap-1">
                  <MapPin className="w-4 h-4 text-slate-400" />
                  {item.location}
                </div>
                <div className="flex items-center gap-1">
                  <DollarSign className="w-4 h-4 text-slate-400" />
                  {item.stipend}
                </div>
              </div>

              <div className="flex flex-wrap gap-2 mb-6">
                {item.skillsRequired.map(skill => (
                  <span key={skill} className="px-3 py-1 bg-slate-50 text-slate-500 text-xs font-bold rounded-lg border border-slate-100">
                    {skill}
                  </span>
                ))}
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                <p className="text-xs text-slate-400 font-medium italic">Deadline: {new Date(item.deadline).toLocaleDateString()}</p>
                <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-xl font-bold text-sm transition-all flex items-center gap-2">
                  Apply Now <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-slate-200">
          <Briefcase className="w-16 h-16 text-slate-200 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-slate-900">No internships found</h3>
          <p className="text-slate-500 mt-1">Try adjusting your search or filters</p>
        </div>
      )}
    </div>
  );
}
