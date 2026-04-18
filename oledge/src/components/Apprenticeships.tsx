import { useState, useEffect } from 'react';
import { collection, query, getDocs, orderBy, limit, addDoc, serverTimestamp } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { Apprenticeship, User } from '../types';
import { motion } from 'framer-motion';
import { 
  Briefcase, 
  MapPin, 
  Clock, 
  DollarSign, 
  Search, 
  Plus, 
  X,
  ArrowRight,
  Building2,
  Globe
} from 'lucide-react';
import { cn } from '../lib/utils';

interface ApprenticeshipsProps {
  user: User;
}

export default function Apprenticeships({ user }: ApprenticeshipsProps) {
  const [apprenticeships, setApprenticeships] = useState<Apprenticeship[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isPosting, setIsPosting] = useState(false);
  const [newApprenticeship, setNewApprenticeship] = useState({
    title: '',
    location: '',
    duration: '',
    stipend: '',
    description: '',
    skillsRequired: '',
    deadline: '',
  });

  useEffect(() => {
    const fetchApprenticeships = async () => {
      setLoading(true);
      try {
        const q = query(
          collection(db, 'apprenticeships'),
          orderBy('createdAt', 'desc'),
          limit(20)
        );
        const snapshot = await getDocs(q);
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Apprenticeship));
        setApprenticeships(data);
      } catch (error) {
        handleFirestoreError(error, OperationType.LIST, 'apprenticeships');
      } finally {
        setLoading(false);
      }
    };

    fetchApprenticeships();
  }, []);

  const handlePost = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addDoc(collection(db, 'apprenticeships'), {
        ...newApprenticeship,
        skillsRequired: newApprenticeship.skillsRequired.split(',').map(s => s.trim()),
        organizer: user.name,
        organizerId: user.uid,
        organizerRole: user.role,
        createdAt: serverTimestamp(),
      });
      setIsPosting(false);
      window.location.reload();
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'apprenticeships');
    }
  };

  const filteredApprenticeships = apprenticeships.filter(item => 
    item.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    item.organizer.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Apprenticeship Portal</h2>
          <p className="text-slate-500 font-medium mt-1 uppercase tracking-wider text-xs">Government & Industry training programs</p>
        </div>
        {(user.role === 'govt' || user.role === 'company' || user.role === 'college' || user.role === 'admin') && (
          <button 
            onClick={() => setIsPosting(true)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-2xl font-bold text-sm transition-all shadow-lg shadow-indigo-200 flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Post Apprenticeship
          </button>
        )}
      </div>

      {/* Search */}
      <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
          <input 
            type="text" 
            placeholder="Search by title, department, or organization..." 
            className="w-full pl-12 pr-4 py-3 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500 transition-all font-medium"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Posting Modal */}
      {isPosting && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-3xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-slate-900">Post New Apprenticeship</h3>
              <button onClick={() => setIsPosting(false)} className="p-2 hover:bg-slate-100 rounded-full">
                <X className="w-6 h-6 text-slate-400" />
              </button>
            </div>
            <form onSubmit={handlePost} className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Title</label>
                  <input 
                    type="text" required
                    className="w-full p-3 bg-slate-50 rounded-xl border-none focus:ring-2 focus:ring-indigo-500 font-medium"
                    value={newApprenticeship.title}
                    onChange={(e) => setNewApprenticeship(prev => ({ ...prev, title: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Location</label>
                  <input 
                    type="text" required
                    className="w-full p-3 bg-slate-50 rounded-xl border-none focus:ring-2 focus:ring-indigo-500 font-medium"
                    value={newApprenticeship.location}
                    onChange={(e) => setNewApprenticeship(prev => ({ ...prev, location: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Duration</label>
                  <input 
                    type="text" required placeholder="e.g. 6 Months"
                    className="w-full p-3 bg-slate-50 rounded-xl border-none focus:ring-2 focus:ring-indigo-500 font-medium"
                    value={newApprenticeship.duration}
                    onChange={(e) => setNewApprenticeship(prev => ({ ...prev, duration: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Stipend (Optional)</label>
                  <input 
                    type="text"
                    className="w-full p-3 bg-slate-50 rounded-xl border-none focus:ring-2 focus:ring-indigo-500 font-medium"
                    value={newApprenticeship.stipend}
                    onChange={(e) => setNewApprenticeship(prev => ({ ...prev, stipend: e.target.value }))}
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Skills Required (Comma separated)</label>
                <input 
                  type="text" required placeholder="Python, SQL, React..."
                  className="w-full p-3 bg-slate-50 rounded-xl border-none focus:ring-2 focus:ring-indigo-500 font-medium"
                  value={newApprenticeship.skillsRequired}
                  onChange={(e) => setNewApprenticeship(prev => ({ ...prev, skillsRequired: e.target.value }))}
                />
              </div>
              <div>
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Deadline</label>
                <input 
                  type="date" required
                  className="w-full p-3 bg-slate-50 rounded-xl border-none focus:ring-2 focus:ring-indigo-500 font-medium"
                  value={newApprenticeship.deadline}
                  onChange={(e) => setNewApprenticeship(prev => ({ ...prev, deadline: e.target.value }))}
                />
              </div>
              <div>
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Description</label>
                <textarea 
                  required rows={4}
                  className="w-full p-3 bg-slate-50 rounded-xl border-none focus:ring-2 focus:ring-indigo-500 font-medium"
                  value={newApprenticeship.description}
                  onChange={(e) => setNewApprenticeship(prev => ({ ...prev, description: e.target.value }))}
                />
              </div>
              <button type="submit" className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-bold text-lg shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all">
                Publish Apprenticeship
              </button>
            </form>
          </motion.div>
        </div>
      )}

      {/* Listings */}
      {loading ? (
        <div className="grid md:grid-cols-2 gap-6">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-48 bg-slate-100 rounded-3xl animate-pulse"></div>
          ))}
        </div>
      ) : filteredApprenticeships.length > 0 ? (
        <div className="grid md:grid-cols-2 gap-6">
          {filteredApprenticeships.map((item, idx) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl hover:border-indigo-100 transition-all group"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600">
                    {item.organizerRole === 'govt' ? <Globe className="w-8 h-8" /> : <Building2 className="w-8 h-8" />}
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-lg leading-tight">{item.title}</h4>
                    <p className="text-sm text-slate-500 font-medium flex items-center gap-1">
                      {item.organizer}
                      <span className="text-[10px] bg-slate-100 px-1.5 py-0.5 rounded uppercase font-black tracking-tighter">{item.organizerRole}</span>
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap gap-4 text-sm text-slate-600 font-medium mb-6">
                <div className="flex items-center gap-1">
                  <MapPin className="w-4 h-4 text-slate-400" />
                  {item.location}
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4 text-slate-400" />
                  {item.duration}
                </div>
                {item.stipend && (
                  <div className="flex items-center gap-1">
                    <DollarSign className="w-4 h-4 text-slate-400" />
                    {item.stipend}
                  </div>
                )}
              </div>

              <div className="flex flex-wrap gap-2 mb-6">
                {item.skillsRequired.map(skill => (
                  <span key={skill} className="px-3 py-1 bg-indigo-50 text-indigo-600 text-xs font-bold rounded-lg border border-indigo-100">
                    {skill}
                  </span>
                ))}
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                <p className="text-xs text-slate-400 font-medium italic">Deadline: {new Date(item.deadline).toLocaleDateString()}</p>
                <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-xl font-bold text-sm transition-all flex items-center gap-2">
                  View Details <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-slate-200">
          <Briefcase className="w-16 h-16 text-slate-200 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-slate-900">No apprenticeships found</h3>
          <p className="text-slate-500 mt-1">Check back later for new training opportunities</p>
        </div>
      )}
    </div>
  );
}
