import { useState, useEffect } from 'react';
import { 
  collection, 
  query, 
  getDocs, 
  orderBy, 
  limit, 
  onSnapshot,
  where,
  addDoc,
  serverTimestamp
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { Job, User } from '../types';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Briefcase, 
  Search, 
  Plus,
  ArrowRight,
  MapPin,
  Clock,
  Globe,
  Zap,
  Building,
  DollarSign,
  X,
  Send,
  Filter
} from 'lucide-react';
import { cn } from '../lib/utils';
import { useSearchParams } from 'react-router-dom';

interface JobsProps {
  user: User;
}

export default function Jobs({ user }: JobsProps) {
  const [searchParams] = useSearchParams();
  const initialType = searchParams.get('type') || 'all';
  const initialRemote = searchParams.get('isRemote') === 'true';

  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeType, setActiveType] = useState(initialType);
  const [isRemote, setIsRemote] = useState(initialRemote);
  const [showAddModal, setShowAddModal] = useState(false);
  
  const [newJob, setNewJob] = useState({
    title: '',
    companyName: user.role === 'company' ? user.name : '',
    location: '',
    type: 'full-time' as Job['type'],
    isRemote: false,
    salary: '',
    description: '',
    skillsRequired: '',
    deadline: ''
  });

  useEffect(() => {
    const q = query(
      collection(db, 'jobs'),
      orderBy('createdAt', 'desc'),
      limit(50)
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Job));
      setJobs(data);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'jobs');
    });

    return () => unsubscribe();
  }, []);

  const handleAddJob = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addDoc(collection(db, 'jobs'), {
        ...newJob,
        companyId: user.uid,
        skillsRequired: newJob.skillsRequired.split(',').map(s => s.trim()),
        createdAt: serverTimestamp(),
      });
      setShowAddModal(false);
      setNewJob({
        title: '',
        companyName: user.role === 'company' ? user.name : '',
        location: '',
        type: 'full-time',
        isRemote: false,
        salary: '',
        description: '',
        skillsRequired: '',
        deadline: ''
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'jobs');
    }
  };

  const filteredJobs = jobs.filter(job => {
    const matchesSearch = job.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         job.companyName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = activeType === 'all' || job.type === activeType;
    const matchesRemote = !isRemote || job.isRemote;
    return matchesSearch && matchesType && matchesRemote;
  });

  const jobTypes = [
    { id: 'all', label: 'All Jobs', icon: Briefcase },
    { id: 'full-time', label: 'Full Time', icon: Clock },
    { id: 'part-time', label: 'Part Time', icon: Clock },
    { id: 'freelance', label: 'Freelance', icon: Zap },
    { id: 'internship', label: 'Internship', icon: Building },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-10 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
        <div>
          <h2 className="text-4xl font-black text-slate-900 tracking-tighter">Job Opportunities</h2>
          <p className="text-slate-500 font-bold uppercase tracking-[0.2em] text-[10px] mt-1">Full-time, Part-time, Freelance & Remote roles</p>
        </div>
        {(user.role === 'company' || user.role === 'admin') && (
          <button 
            onClick={() => setShowAddModal(true)}
            className="w-full md:w-auto bg-blue-600 text-white px-8 py-4 rounded-2xl font-black text-sm uppercase tracking-widest transition-all shadow-xl shadow-blue-100 hover:bg-blue-700 active:scale-95 flex items-center justify-center gap-3"
          >
            <Plus className="w-6 h-6" />
            Post New Job
          </button>
        )}
      </div>

      {/* Filters & Search */}
      <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-8">
        <div className="flex flex-col md:flex-row gap-6">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 text-slate-300" />
            <input 
              type="text" 
              placeholder="Search by role, company, or skills..." 
              className="w-full pl-14 pr-6 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500 font-bold text-slate-900 placeholder:text-slate-300 transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button 
            onClick={() => setIsRemote(!isRemote)}
            className={cn(
              "px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all flex items-center gap-3 border",
              isRemote ? "bg-emerald-600 text-white border-emerald-600 shadow-lg" : "bg-white text-slate-400 border-slate-100 hover:border-blue-200"
            )}
          >
            <Globe className="w-5 h-5" />
            Remote Only
          </button>
        </div>

        <div className="flex items-center gap-3 overflow-x-auto pb-2 no-scrollbar">
          <div className="flex items-center gap-2 mr-4 text-[10px] font-black text-slate-300 uppercase tracking-widest">
            <Filter className="w-4 h-4" />
            Job Type
          </div>
          {jobTypes.map((type) => (
            <button
              key={type.id}
              onClick={() => setActiveType(type.id)}
              className={cn(
                "flex items-center gap-2.5 px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all border whitespace-nowrap",
                activeType === type.id 
                  ? "bg-slate-900 text-white border-slate-900 shadow-xl" 
                  : "bg-white text-slate-400 border-slate-100 hover:border-slate-200"
              )}
            >
              <type.icon className="w-4 h-4" />
              {type.label}
            </button>
          ))}
        </div>
      </div>

      {/* Jobs List */}
      {loading ? (
        <div className="grid md:grid-cols-2 gap-8">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-64 bg-slate-100 rounded-[2.5rem] animate-pulse"></div>
          ))}
        </div>
      ) : filteredJobs.length > 0 ? (
        <div className="grid md:grid-cols-2 gap-8">
          {filteredJobs.map((job, idx) => (
            <motion.div
              key={job.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-2xl hover:border-blue-100 transition-all flex flex-col group relative"
            >
              <div className="flex items-start justify-between mb-8">
                <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 group-hover:bg-blue-50 group-hover:text-blue-600 transition-all duration-300">
                  <Building className="w-8 h-8" />
                </div>
                <div className="flex flex-col items-end gap-2">
                  <span className={cn(
                    "px-3 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest border",
                    job.isRemote ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-blue-50 text-blue-600 border-blue-100"
                  )}>
                    {job.isRemote ? 'Remote' : job.location}
                  </span>
                  <span className="px-3 py-1 bg-slate-50 text-slate-400 border border-slate-100 rounded-lg text-[8px] font-black uppercase tracking-widest">
                    {job.type.replace('-', ' ')}
                  </span>
                </div>
              </div>

              <h3 className="text-2xl font-black text-slate-900 leading-tight mb-2 group-hover:text-blue-600 transition-colors uppercase tracking-tight">{job.title}</h3>
              <p className="text-xs text-slate-400 font-bold mb-6 tracking-widest uppercase">{job.companyName}</p>
              
              <p className="text-sm text-slate-500 font-medium line-clamp-3 mb-8 leading-relaxed">
                {job.description}
              </p>

              <div className="flex flex-wrap gap-2 mb-8">
                {job.skillsRequired.map(skill => (
                  <span key={skill} className="px-3 py-1 bg-slate-50 text-slate-500 text-[10px] font-black uppercase tracking-widest rounded-lg border border-slate-100">
                    {skill}
                  </span>
                ))}
              </div>

              <div className="mt-auto pt-6 border-t border-slate-50 flex items-center justify-between">
                <div className="flex items-center gap-2 text-emerald-600">
                  <DollarSign className="w-4 h-4" />
                  <span className="text-sm font-black">{job.salary || 'Competitive'}</span>
                </div>
                <button className="bg-slate-900 text-white px-8 py-3 rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:bg-blue-600 transition-all shadow-xl active:scale-95">
                  Apply Now
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="text-center py-24 bg-white rounded-[3rem] border border-dashed border-slate-200">
          <Briefcase className="w-20 h-20 text-slate-200 mx-auto mb-6" />
          <h3 className="text-2xl font-black text-slate-900 tracking-tighter">No jobs found matching your criteria</h3>
          <p className="text-slate-400 font-medium mt-2 capitalize">Change the filters or search term to discover new roles.</p>
        </div>
      )}

      {/* Add Job Modal */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md">
            <motion.div 
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              className="bg-white rounded-[3rem] p-10 max-w-3xl w-full shadow-2xl overflow-y-auto max-h-[90vh] custom-scrollbar"
            >
              <div className="flex items-center justify-between mb-10">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 shadow-sm">
                    <Briefcase className="w-6 h-6" />
                  </div>
                  <h3 className="text-2xl font-black text-slate-900 tracking-tight">Post a New Opportunity</h3>
                </div>
                <button onClick={() => setShowAddModal(false)} className="p-2 hover:bg-slate-50 rounded-full transition-colors text-slate-400">
                  <X className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleAddJob} className="space-y-8">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Job Title</label>
                    <input 
                      required type="text" placeholder="e.g. Senior Frontend Developer"
                      className="w-full p-4 bg-slate-50 rounded-2xl border-none focus:ring-2 focus:ring-blue-500 font-bold text-slate-900"
                      value={newJob.title}
                      onChange={(e) => setNewJob(prev => ({ ...prev, title: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Job Type</label>
                    <select 
                      className="w-full p-4 bg-slate-50 rounded-2xl border-none focus:ring-2 focus:ring-blue-500 font-bold text-slate-900"
                      value={newJob.type}
                      onChange={(e) => setNewJob(prev => ({ ...prev, type: e.target.value as any }))}
                    >
                      <option value="full-time">Full Time</option>
                      <option value="part-time">Part Time</option>
                      <option value="freelance">Freelance</option>
                      <option value="internship">Internship</option>
                    </select>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Location (or "Remote")</label>
                    <input 
                      required type="text" placeholder="e.g. Noida, Bangalore"
                      className="w-full p-4 bg-slate-50 rounded-2xl border-none focus:ring-2 focus:ring-blue-500 font-bold text-slate-900"
                      value={newJob.location}
                      onChange={(e) => setNewJob(prev => ({ ...prev, location: e.target.value, isRemote: e.target.value.toLowerCase() === 'remote' }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Monthly Salary / Budget</label>
                    <input 
                      type="text" placeholder="e.g. ₹50,000 - ₹80,000"
                      className="w-full p-4 bg-slate-50 rounded-2xl border-none focus:ring-2 focus:ring-blue-500 font-bold text-slate-900"
                      value={newJob.salary}
                      onChange={(e) => setNewJob(prev => ({ ...prev, salary: e.target.value }))}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Skills Required (comma separated)</label>
                  <input 
                    required type="text" placeholder="e.g. React, TypeScript, Tailwind"
                    className="w-full p-4 bg-slate-50 rounded-2xl border-none focus:ring-2 focus:ring-blue-500 font-bold text-slate-900"
                    value={newJob.skillsRequired}
                    onChange={(e) => setNewJob(prev => ({ ...prev, skillsRequired: e.target.value }))}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Job Description</label>
                  <textarea 
                    required rows={5}
                    placeholder="Describe the role and responsibilities..."
                    className="w-full p-6 bg-slate-50 rounded-3xl border-none focus:ring-2 focus:ring-blue-500 font-medium text-slate-700 resize-none"
                    value={newJob.description}
                    onChange={(e) => setNewJob(prev => ({ ...prev, description: e.target.value }))}
                  />
                </div>

                <button type="submit" className="w-full py-5 bg-blue-600 text-white rounded-2xl font-black text-lg shadow-xl shadow-blue-200 hover:bg-blue-700 transition-all flex items-center justify-center gap-3">
                  <Send className="w-6 h-6" />
                  Publish Opportunity
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
