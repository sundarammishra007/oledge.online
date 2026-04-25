import { motion } from 'framer-motion';
import { 
  Briefcase, 
  GraduationCap, 
  Zap, 
  Building,
  Clock,
  Globe,
  ArrowRight,
  TrendingUp,
  Award
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { User } from '../types';
import { cn } from '../lib/utils';

interface OpportunitiesProps {
  user: User;
}

export default function Opportunities({ user }: OpportunitiesProps) {
  const sections = [
    { 
      name: 'Internships', 
      icon: Building, 
      path: '/internships', 
      count: 24,
      color: 'bg-blue-600',
      description: 'Gain industry experience and build your resume with top companies.'
    },
    { 
      name: 'Apprenticeships', 
      icon: GraduationCap, 
      path: '/apprenticeships', 
      count: 12,
      color: 'bg-emerald-600',
      description: 'Formal vocational training programs combined with on-the-job work.'
    },
    { 
      name: 'Freelance Marketplace', 
      icon: Zap, 
      path: '/freelance', 
      count: 56,
      color: 'bg-amber-500',
      description: 'Short-term projects and gigs for students to earn while they learn.'
    },
    { 
      name: 'Full-time & Part-time Jobs', 
      icon: Briefcase, 
      path: '/jobs', 
      count: 89,
      color: 'bg-rose-600',
      description: 'Browse career roles including remote, hybrid, and on-site positions.'
    },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-12 pb-12">
      {/* Hero Section */}
      <div className="bg-slate-900 rounded-[3rem] p-8 md:p-16 text-white relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/20 blur-[100px] rounded-full -mr-48 -mt-48" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-500/10 blur-[100px] rounded-full -ml-32 -mb-32" />
        
        <div className="relative z-10 flex flex-col md:flex-row items-center gap-12">
          <div className="flex-1 space-y-6 text-center md:text-left">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 rounded-full border border-white/20 text-[10px] font-black uppercase tracking-[0.2em]">
              <TrendingUp className="w-4 h-4 text-emerald-400" />
              Career Launchpad
            </div>
            <h2 className="text-4xl md:text-6xl font-black tracking-tighter leading-none">
              Your Next Big <span className="text-blue-400 italic">Opportunity</span>
            </h2>
            <p className="text-slate-400 text-lg font-medium max-w-xl leading-relaxed">
              From first internships to full-career roles, discover pathways curated for Bharat's brightest talent.
            </p>
          </div>
          <div className="shrink-0 w-full md:w-auto">
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 space-y-6 shadow-2xl">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center">
                  <Award className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h4 className="font-black text-sm">Verified Listings</h4>
                  <p className="text-xs text-slate-400">100% Legit Postings</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-emerald-600 rounded-2xl flex items-center justify-center">
                  <Globe className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h4 className="font-black text-sm">Remote First</h4>
                  <p className="text-xs text-slate-400">Global Opportunities</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Opportunities Grid */}
      <div className="grid md:grid-cols-2 gap-8">
        {sections.map((section, idx) => (
          <motion.div
            key={section.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
          >
            <Link 
              to={section.path}
              className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-2xl hover:border-blue-100 transition-all flex flex-col group h-full"
            >
              <div className="flex items-start justify-between mb-8">
                <div className={cn("w-16 h-16 rounded-[1.5rem] flex items-center justify-center text-white shadow-xl group-hover:scale-110 transition-transform duration-500", section.color)}>
                  <section.icon className="w-8 h-8" />
                </div>
                <div className="text-right">
                  <span className="text-3xl font-black text-slate-900 tracking-tighter">{section.count}</span>
                  <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mt-1">Total Active</p>
                </div>
              </div>

              <h3 className="text-2xl font-black text-slate-900 tracking-tighter mb-3 group-hover:text-blue-600 transition-colors uppercase">{section.name}</h3>
              <p className="text-sm text-slate-500 font-medium leading-relaxed mb-8 flex-1">
                {section.description}
              </p>

              <div className="flex items-center justify-between pt-6 border-t border-slate-50">
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Live Hiring</span>
                </div>
                <button className="flex items-center gap-2 text-blue-600 font-black text-xs uppercase tracking-widest group-hover:gap-4 transition-all">
                  Explore Now <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>

      {/* Featured Company Banner */}
      <section className="bg-blue-50 rounded-[2.5rem] p-10 border border-blue-100 flex flex-col md:flex-row items-center justify-between gap-8">
        <div className="space-y-2 text-center md:text-left">
          <h4 className="text-xl font-black text-slate-900 tracking-tight">Are you an Employer?</h4>
          <p className="text-slate-500 text-sm font-medium">Connect with top-tier student talent from across the country.</p>
        </div>
        <button className="bg-slate-900 text-white px-10 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-blue-600 transition-all shadow-xl active:scale-95 whitespace-nowrap">
          Post an Opportunity
        </button>
      </section>
    </div>
  );
}
