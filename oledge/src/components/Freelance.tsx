import { useState, useEffect } from 'react';
import { collection, query, getDocs, orderBy, limit } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { FreelanceProject, User } from '../types';
import { motion } from 'framer-motion';
import { 
  Zap, 
  DollarSign, 
  Calendar as CalendarIcon, 
  Search, 
  Plus,
  ArrowRight,
  Monitor,
  Smartphone,
  PenTool,
  Database,
  Layout
} from 'lucide-react';
import { cn } from '../lib/utils';

interface FreelanceProps {
  user: User;
}

export default function Freelance({ user }: FreelanceProps) {
  const [projects, setProjects] = useState<FreelanceProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchProjects = async () => {
      setLoading(true);
      try {
        const q = query(
          collection(db, 'freelance_projects'),
          orderBy('createdAt', 'desc'),
          limit(20)
        );
        const snapshot = await getDocs(q);
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as FreelanceProject));
        setProjects(data);
      } catch (error) {
        handleFirestoreError(error, OperationType.LIST, 'freelance_projects');
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

  const filteredProjects = projects.filter(item => 
    item.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    item.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const categories = [
    { name: 'Web Design', icon: Layout, color: 'text-blue-500' },
    { name: 'App Testing', icon: Smartphone, color: 'text-purple-500' },
    { name: 'Social Media', icon: Monitor, color: 'text-pink-500' },
    { name: 'Data Entry', icon: Database, color: 'text-orange-500' },
    { name: 'Content Writing', icon: PenTool, color: 'text-green-500' },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Freelance Marketplace</h2>
          <p className="text-slate-500 font-medium mt-1 uppercase tracking-wider text-xs">Apply for small projects & earn while you learn</p>
        </div>
        {(user.role === 'company' || user.role === 'admin') && (
          <button className="bg-yellow-600 hover:bg-yellow-700 text-white px-6 py-3 rounded-2xl font-bold text-sm transition-all shadow-lg shadow-yellow-200 flex items-center gap-2">
            <Plus className="w-5 h-5" />
            Post Project
          </button>
        )}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {categories.map((cat) => (
          <button
            key={cat.name}
            className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md hover:border-yellow-100 transition-all flex flex-col items-center text-center group"
          >
            <cat.icon className={cn("w-8 h-8 mb-2 group-hover:scale-110 transition-transform", cat.color)} />
            <span className="text-xs font-bold text-slate-700">{cat.name}</span>
          </button>
        ))}
      </div>

      <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
          <input 
            type="text" 
            placeholder="Search freelance projects, skills, budgets..." 
            className="w-full pl-12 pr-4 py-3 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-yellow-500 transition-all font-medium"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <div className="grid md:grid-cols-2 gap-6">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-48 bg-slate-100 rounded-3xl animate-pulse"></div>
          ))}
        </div>
      ) : filteredProjects.length > 0 ? (
        <div className="grid md:grid-cols-2 gap-6">
          {filteredProjects.map((item, idx) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: idx * 0.05 }}
              className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl hover:border-yellow-100 transition-all group"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 bg-yellow-50 rounded-2xl flex items-center justify-center text-yellow-600">
                  <Zap className="w-6 h-6" />
                </div>
                <div className="flex items-center gap-1 bg-green-50 text-green-600 px-3 py-1 rounded-full border border-green-100 text-xs font-black">
                  <DollarSign className="w-3 h-3" />
                  {item.budget}
                </div>
              </div>

              <h4 className="text-xl font-black text-slate-900 leading-tight mb-2">{item.title}</h4>
              <p className="text-sm text-slate-500 font-medium line-clamp-2 mb-6">
                {item.description}
              </p>

              <div className="flex flex-wrap gap-2 mb-6">
                {item.skillsRequired.map(skill => (
                  <span key={skill} className="px-3 py-1 bg-slate-50 text-slate-500 text-xs font-bold rounded-lg border border-slate-100">
                    {skill}
                  </span>
                ))}
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                <div className="flex items-center gap-1 text-xs text-slate-400 font-medium italic">
                  <CalendarIcon className="w-3 h-3" />
                  Deadline: {new Date(item.deadline).toLocaleDateString()}
                </div>
                <button className="bg-slate-900 hover:bg-slate-800 text-white px-6 py-2 rounded-xl font-bold text-sm transition-all flex items-center gap-2">
                  Apply <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-slate-200">
          <Zap className="w-16 h-16 text-slate-200 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-slate-900">No freelance projects found</h3>
          <p className="text-slate-500 mt-1">Check back later for new opportunities</p>
        </div>
      )}
    </div>
  );
}
