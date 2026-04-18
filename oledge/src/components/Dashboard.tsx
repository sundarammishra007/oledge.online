import { motion } from 'framer-motion';
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
  Sparkles
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { User } from '../types';
import { cn } from '../lib/utils';

interface DashboardProps {
  user: User;
}

export default function Dashboard({ user }: DashboardProps) {
  const stats = [
    { name: 'Notice Board', count: 14, icon: Megaphone, color: 'bg-rose-500', path: '/noticeboard' },
    { name: 'Campus Events', count: 12, icon: Sparkles, color: 'bg-indigo-500', path: '/events' },
    { name: 'Forum Posts', count: 156, icon: Globe, color: 'bg-blue-500', path: '/forum' },
    { name: 'Campus Friends', count: 28, icon: Users, color: 'bg-pink-500', path: '/friends' },
  ];

  const quickActions = [
    { name: 'Campus Events', icon: Sparkles, path: '/events', description: 'Award ceremonies & more' },
    { name: 'Community Forum', icon: Globe, path: '/forum', description: 'Blogs & Q&A' },
    { name: 'Campus Friends', icon: Users, path: '/friends', description: 'Connect with peers' },
    { name: 'Notice Board', icon: Megaphone, path: '/noticeboard', description: 'Latest announcements' },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-10 pb-12">
      {/* Welcome Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 rounded-[2.5rem] p-8 md:p-12 text-white shadow-2xl shadow-blue-500/20 transition-all duration-500 group">
        {/* Decorative background elements */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 blur-3xl rounded-full -mr-48 -mt-48 transition-transform duration-700 group-hover:scale-110" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-400/20 blur-3xl rounded-full -ml-32 -mb-32 transition-transform duration-700 group-hover:scale-110" />
        
        <div className="relative z-10 flex flex-col md:flex-row items-center gap-10">
          <div className="relative shrink-0">
            <div className="w-28 h-28 md:w-36 md:h-36 rounded-[2rem] bg-white/20 backdrop-blur-xl p-1.5 border border-white/30 shadow-2xl rotate-3 transition-transform duration-500 group-hover:rotate-0">
              {user.photoURL ? (
                <img 
                  src={user.photoURL} 
                  alt={user.name} 
                  className="w-full h-full object-cover rounded-[1.7rem]"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-white bg-blue-500/20 rounded-[1.7rem]">
                  <Users className="w-14 h-14 opacity-50" />
                </div>
              )}
            </div>
            <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-emerald-500 rounded-2xl border-4 border-blue-700 flex items-center justify-center shadow-lg">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex-1 text-center md:text-left"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur-md rounded-full border border-white/20 text-[10px] font-black uppercase tracking-[0.2em] mb-4">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Active Session
            </div>
            <h2 className="text-4xl md:text-5xl font-black tracking-tighter leading-none mb-4">
              Welcome back, <span className="text-blue-200">{user.name.split(' ')[0]}</span>!
            </h2>
            <p className="text-blue-100/80 text-lg font-medium max-w-xl leading-relaxed">
              Your digital headquarters is synchronized. You have <span className="text-white font-black">3 new notices</span> and <span className="text-white font-black">2 upcoming events</span> today.
            </p>
            
            <div className="mt-10 flex flex-wrap justify-center md:justify-start gap-4">
              <Link 
                to="/internships" 
                className="bg-white text-blue-700 hover:bg-blue-50 px-8 py-4 rounded-2xl font-black text-sm uppercase tracking-widest transition-all shadow-xl shadow-blue-900/20 active:scale-95"
              >
                Find Internships
              </Link>
              <Link 
                to="/profile" 
                className="bg-white/10 hover:bg-white/20 backdrop-blur-md px-8 py-4 rounded-2xl font-black text-sm uppercase tracking-widest transition-all border border-white/20 active:scale-95"
              >
                View Profile
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, idx) => (
          <motion.div
            key={stat.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="bg-white dark:bg-slate-900 p-6 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-xl hover:border-blue-100 dark:hover:border-blue-900 transition-all group relative overflow-hidden"
          >
            <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center mb-6 text-white shadow-lg transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3", stat.color)}>
              <stat.icon className="w-7 h-7" />
            </div>
            <p className="text-slate-400 dark:text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] mb-1">{stat.name}</p>
            <div className="flex items-end justify-between">
              <h3 className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter">{stat.count}</h3>
              <Link to={stat.path} className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-400 dark:text-slate-500 group-hover:bg-blue-600 group-hover:text-white transition-all">
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 space-y-8">
          <div className="flex items-center justify-between">
            <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tighter flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400">
                <Zap className="w-6 h-6" />
              </div>
              Quick Access Hubs
            </h3>
            <Link to="/events" className="text-xs font-black text-blue-600 dark:text-blue-400 uppercase tracking-widest hover:underline">View All Hubs</Link>
          </div>
          
          <div className="grid sm:grid-cols-2 gap-6">
            {quickActions.map((action, idx) => (
              <Link
                key={action.name}
                to={action.path}
                className="bg-white dark:bg-slate-900 p-6 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-2xl hover:border-blue-100 dark:hover:border-blue-900 transition-all flex items-center gap-5 group"
              >
                <div className="w-16 h-16 bg-slate-50 dark:bg-slate-800 rounded-2xl flex items-center justify-center text-slate-400 dark:text-slate-500 group-hover:bg-blue-50 dark:group-hover:bg-blue-900/30 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-all duration-300">
                  <action.icon className="w-8 h-8" />
                </div>
                <div>
                  <h4 className="font-black text-slate-900 dark:text-white tracking-tight group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{action.name}</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-bold mt-0.5">{action.description}</p>
                </div>
              </Link>
            ))}
          </div>

          {/* Featured Section */}
          <div className="bg-slate-900 dark:bg-blue-950 rounded-[2.5rem] p-8 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/20 blur-3xl rounded-full -mr-32 -mt-32" />
            <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
              <div className="shrink-0">
                <div className="w-20 h-20 bg-blue-600 rounded-2xl flex items-center justify-center shadow-xl">
                  <Trophy className="w-10 h-10 text-white" />
                </div>
              </div>
              <div className="flex-1 text-center md:text-left">
                <h4 className="text-xl font-black tracking-tight mb-2">Campus Ambassador Program 2026</h4>
                <p className="text-slate-400 dark:text-blue-200/60 text-sm font-medium leading-relaxed">
                  Represent oledge in your campus and unlock exclusive rewards, networking opportunities, and a certificate of excellence.
                </p>
              </div>
              <button className="shrink-0 bg-blue-600 hover:bg-blue-500 px-6 py-3 rounded-xl font-black text-xs uppercase tracking-widest transition-all active:scale-95">
                Apply Now
              </button>
            </div>
          </div>
        </div>

        {/* Sidebar Feed */}
        <div className="space-y-8">
          <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tighter flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center text-orange-600 dark:text-orange-400">
              <Sparkles className="w-6 h-6" />
            </div>
            Active Challenges
          </h3>
          
          <div className="space-y-4">
            {[
              { title: 'Google Solution Challenge', date: '15 days left', type: 'Global', color: 'orange' },
              { title: 'Smart India Hackathon', date: 'Registrations Open', type: 'National', color: 'blue' },
              { title: 'Microsoft Imagine Cup', date: 'Starts in 2 days', type: 'Global', color: 'indigo' },
            ].map((challenge, idx) => (
              <motion.div
                key={challenge.title}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-xl hover:border-blue-100 dark:hover:border-blue-900 transition-all group cursor-pointer"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className={cn(
                    "px-2 py-1 rounded-lg text-[8px] font-black uppercase tracking-[0.2em]",
                    challenge.color === 'orange' ? "bg-orange-50 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400" :
                    challenge.color === 'blue' ? "bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400" :
                    "bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400"
                  )}>
                    {challenge.type}
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-blue-600 transition-colors" />
                </div>
                <h4 className="font-black text-slate-900 dark:text-white tracking-tight mb-1 group-hover:text-blue-600 transition-colors">{challenge.title}</h4>
                <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">{challenge.date}</p>
              </motion.div>
            ))}
            
            <button className="w-full py-4 bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-2xl text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-[0.2em] transition-all border border-dashed border-slate-200 dark:border-slate-700">
              View All Challenges
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
