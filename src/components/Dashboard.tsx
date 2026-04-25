import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Briefcase, 
  Code, 
  MapPin, 
  Zap, 
  Trophy, 
  GraduationCap, 
  ArrowRight, 
  BookOpen, 
  Calendar as CalendarIcon,
  Megaphone,
  Users,
  Video,
  Globe,
  Sparkles,
  Clock,
  UserCheck,
  Bell,
  Navigation
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { User, CalendarEvent } from '../types';
import { cn } from '../lib/utils';
import { collection, query, where, limit, orderBy, getDocs } from 'firebase/firestore';
import { db } from '../firebase';

interface DashboardProps {
  user: User;
}

export default function Dashboard({ user }: DashboardProps) {
  const [publicEvents, setPublicEvents] = useState<CalendarEvent[]>([]);

  useEffect(() => {
    const fetchPublicEvents = async () => {
      try {
        const q = query(
          collection(db, 'calendar'),
          where('isPublic', '==', true),
          orderBy('date', 'asc'),
          limit(3)
        );
        const snapshot = await getDocs(q);
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as CalendarEvent));
        setPublicEvents(data);
      } catch (error) {
        console.error("Error fetching public events:", error);
      }
    };
    fetchPublicEvents();
  }, []);

  const stats = [
    { name: 'Notice Board', count: 14, icon: Megaphone, color: 'bg-rose-500', path: '/noticeboard' },
    { name: 'Events', count: 12, icon: Sparkles, color: 'bg-indigo-500', path: '/events' },
    { name: 'Opportunities', count: 45, icon: Briefcase, color: 'bg-emerald-500', path: '/opportunities' },
    { name: 'e-Library', count: 156, icon: BookOpen, color: 'bg-blue-500', path: '/library' },
  ];

  const opportunities = [
    { name: 'Internships', icon: Briefcase, path: '/internships', description: 'Kickstart your career' },
    { name: 'Apprenticeships', icon: GraduationCap, path: '/apprenticeships', description: 'Earn while you learn' },
    { name: 'Freelance', icon: Zap, path: '/freelance', description: 'Flexible projects' },
    { name: 'Full-time Jobs', icon: Briefcase, path: '/jobs?type=full-time', description: 'Dedicated roles' },
    { name: 'Part-time Jobs', icon: Clock, path: '/jobs?type=part-time', description: 'Flexible hours' },
    { name: 'Remote Roles', icon: Globe, path: '/jobs?isRemote=true', description: 'Work from anywhere' },
  ];

  const events = [
    { name: 'Job Fairs', icon: MapPin, path: '/jobfairs', description: 'Meet top recruiters' },
    { name: 'Walk-ins', path: '/walkins', icon: UserCheck, description: 'Direct hiring drives' },
    { name: 'Hackathons', icon: Code, path: '/hackathons', description: 'Build & Win' },
    { name: 'Seminars', icon: Video, path: '/seminars', description: 'Expert insights' },
    { name: 'Quizzes', icon: Trophy, path: '/quizzes', description: 'Test your knowledge' },
    { name: 'Competitions', icon: Sparkles, path: '/competitions', description: 'Showcase talent' },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-12 pb-12">
      {/* Welcome Section */}
      <section className="relative overflow-hidden bg-white rounded-[3rem] p-8 md:p-12 border border-slate-100 shadow-xl group">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-50/50 blur-3xl rounded-full -mr-48 -mt-48 transition-transform duration-700 group-hover:scale-110" />
        
        <div className="relative z-10 flex flex-col md:flex-row items-center gap-10">
          <div className="relative shrink-0">
            <div className="w-28 h-28 md:w-36 md:h-36 rounded-[2.5rem] bg-slate-50 p-1.5 border border-slate-100 shadow-xl rotate-3 transition-transform duration-500 group-hover:rotate-0 overflow-hidden">
              {user.photoURL ? (
                <img 
                  src={user.photoURL} 
                  alt={user.name} 
                  className="w-full h-full object-cover rounded-[2rem]"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-slate-300 bg-white rounded-[2rem]">
                  <Users className="w-14 h-14 opacity-50" />
                </div>
              )}
            </div>
            <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-blue-600 rounded-2xl border-4 border-white flex items-center justify-center shadow-lg">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex-1 text-center md:text-left"
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-blue-50 rounded-full border border-blue-100 text-[10px] font-black uppercase tracking-[0.2em] mb-4 text-blue-600">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Bharat's Growth Hub
            </div>
            <h2 className="text-4xl md:text-5xl font-black tracking-tighter leading-none mb-4 text-slate-900">
              Welcome back, <span className="text-blue-600">{user.name.split(' ')[0]}</span>!
            </h2>
            <p className="text-slate-500 text-lg font-medium max-w-xl leading-relaxed">
              Your dashboard is ready. Explore new <span className="text-slate-900 font-black">Opportunities</span>, join upcoming <span className="text-slate-900 font-black">Events</span>, and share knowledge in <span className="text-slate-900 font-black">e-Library</span>.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
        {stats.map((stat, idx) => (
          <motion.div
            key={stat.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-2xl hover:border-blue-200 transition-all group relative overflow-hidden"
          >
            <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center mb-6 text-white shadow-lg transition-transform duration-500 group-hover:scale-110", stat.color)}>
              <stat.icon className="w-7 h-7" />
            </div>
            <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] mb-1">{stat.name}</p>
            <div className="flex items-end justify-between">
              <h3 className="text-4xl font-black text-slate-900 tracking-tighter">{stat.count}</h3>
              <Link to={stat.path} className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-blue-600 group-hover:text-white transition-all">
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Opportunities Section */}
      <section className="space-y-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600">
              <Briefcase className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-3xl font-black text-slate-900 tracking-tighter">Opportunities</h3>
              <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mt-0.5">Internships, Apprenticeships & Jobs</p>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {opportunities.map((opp, idx) => (
            <Link
              key={opp.name}
              to={opp.path}
              className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-2xl hover:border-emerald-100 transition-all flex items-center gap-5 group"
            >
              <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 group-hover:bg-emerald-50 group-hover:text-emerald-600 transition-all duration-300">
                <opp.icon className="w-8 h-8" />
              </div>
              <div>
                <h4 className="font-black text-slate-900 tracking-tight group-hover:text-emerald-600 transition-colors">{opp.name}</h4>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">{opp.description}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Events Section */}
      <section className="space-y-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-3xl font-black text-slate-900 tracking-tighter">Events Hub</h3>
              <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mt-0.5">Competitions, Hackathons & Sessions</p>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
          {events.map((event, idx) => (
            <Link
              key={event.name}
              to={event.path}
              className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-2xl hover:border-indigo-100 transition-all flex flex-col items-center text-center gap-4 group"
            >
              <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-all duration-300">
                <event.icon className="w-7 h-7" />
              </div>
              <div>
                <h4 className="font-black text-slate-900 tracking-tight group-hover:text-indigo-600 transition-colors text-sm">{event.name}</h4>
                <p className="text-[8px] text-slate-400 font-black uppercase tracking-[0.2em] mt-1">{event.description}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Main Content Grid */}
      <div className="grid lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 space-y-12">
          {/* Featured Section */}
          <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/20 blur-3xl rounded-full -mr-32 -mt-32" />
            <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
              <div className="shrink-0">
                <div className="w-20 h-20 bg-blue-600 rounded-2xl flex items-center justify-center shadow-xl">
                  <Trophy className="w-10 h-10 text-white" />
                </div>
              </div>
              <div className="flex-1 text-center md:text-left">
                <h4 className="text-xl font-black tracking-tight mb-2">Campus Ambassador Program 2026</h4>
                <p className="text-slate-400 text-sm font-medium leading-relaxed">
                  Represent oledge in your campus and unlock exclusive rewards, networking opportunities, and a certificate of excellence.
                </p>
              </div>
              <button className="shrink-0 bg-blue-600 hover:bg-blue-500 px-6 py-3 rounded-xl font-black text-xs uppercase tracking-widest transition-all active:scale-95 text-white">
                Apply Now
              </button>
            </div>
          </div>
        </div>

          {/* Sidebar Feed */}
        <div className="space-y-8">
          <h3 className="text-2xl font-black text-slate-900 tracking-tighter flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center text-blue-600">
              <CalendarIcon className="w-6 h-6" />
            </div>
            Public Milestones
          </h3>
          
          <div className="space-y-4">
            {publicEvents.length > 0 ? (
              publicEvents.map((event, idx) => (
                <motion.div
                  key={event.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl hover:border-blue-100 transition-all group cursor-pointer"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="px-2 py-1 bg-blue-50 rounded-lg text-[8px] font-black uppercase tracking-[0.2em] text-blue-600">
                      {event.type}
                    </div>
                    <Navigation className="w-4 h-4 text-slate-300 group-hover:text-blue-600 transition-colors" />
                  </div>
                  <h4 className="font-black text-slate-900 tracking-tight mb-1 group-hover:text-blue-600 transition-colors">{event.title}</h4>
                  <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    <span>{new Date(event.date).toLocaleDateString()}</span>
                    {event.time && (
                      <>
                        <span className="w-1 h-1 rounded-full bg-slate-300" />
                        <span>{event.time}</span>
                      </>
                    )}
                  </div>
                  <div className="mt-3 pt-3 border-t border-slate-50 flex items-center justify-between text-[8px] font-medium text-slate-400">
                    <span>By {event.creatorName}</span>
                    <span className="bg-slate-50 px-1.5 py-0.5 rounded uppercase">{event.creatorRole}</span>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="p-10 text-center bg-slate-50/50 rounded-3xl border border-dashed border-slate-200">
                <CalendarIcon className="w-8 h-8 text-slate-200 mx-auto mb-2" />
                <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">No public events</p>
              </div>
            )}
            
            <Link to="/calendar" className="block w-full py-4 bg-slate-50 hover:bg-slate-100 rounded-2xl text-xs font-black text-center text-slate-500 uppercase tracking-[0.2em] transition-all border border-dashed border-slate-200">
              View Oledge Calendar
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
