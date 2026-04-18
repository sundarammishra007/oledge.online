import { motion } from 'framer-motion';
import { GraduationCap, Target, Users, ShieldCheck, Globe, Sparkles } from 'lucide-react';

export default function About() {
  return (
    <div className="max-w-4xl mx-auto space-y-12 py-8">
      {/* Hero Section */}
      <div className="text-center space-y-6">
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="w-28 h-28 mx-auto mb-8 relative"
        >
          {/* Main Icon Container - Squircle shape with premium gradient */}
          <div className="relative w-full h-full bg-white dark:bg-slate-800 rounded-[28%] shadow-[0_20px_50px_-12px_rgba(37,99,235,0.5)] flex items-center justify-center overflow-hidden ring-1 ring-slate-200 dark:ring-slate-700">
            <img 
              src="/logo.svg" 
              alt="oledge logo" 
              className="w-full h-full object-contain relative z-10"
              referrerPolicy="no-referrer"
            />
          </div>
        </motion.div>
        <h1 className="text-5xl font-black text-slate-900 tracking-tighter">About oledge</h1>
        <p className="text-xl text-slate-500 font-medium max-w-2xl mx-auto leading-relaxed">
          The Digital Headquarters for your career and college life. We bridge the gap between students, government, and industry.
        </p>
      </div>

      {/* Mission & Vision */}
      <div className="grid md:grid-cols-2 gap-8">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm space-y-4"
        >
          <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600">
            <Target className="w-8 h-8" />
          </div>
          <h3 className="text-2xl font-black text-slate-900">Our Mission</h3>
          <p className="text-slate-600 leading-relaxed font-medium">
            To empower every student with the right opportunities, guidance, and network to build a successful career, regardless of their background or location.
          </p>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm space-y-4"
        >
          <div className="w-14 h-14 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600">
            <Globe className="w-8 h-8" />
          </div>
          <h3 className="text-2xl font-black text-slate-900">Our Vision</h3>
          <p className="text-slate-600 leading-relaxed font-medium">
            To become the global standard for academic and professional networking, creating a seamless ecosystem for talent discovery and growth.
          </p>
        </motion.div>
      </div>

      {/* Core Values */}
      <div className="bg-slate-900 text-white p-12 rounded-[4rem] space-y-12 shadow-2xl shadow-slate-200">
        <div className="text-center">
          <h2 className="text-3xl font-black tracking-tight">Why oledge?</h2>
          <p className="text-slate-400 mt-2 font-bold uppercase tracking-widest text-xs">Our core pillars</p>
        </div>

        <div className="grid md:grid-cols-3 gap-12">
          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-white/10 rounded-3xl flex items-center justify-center mx-auto text-blue-400 backdrop-blur-md">
              <Users className="w-8 h-8" />
            </div>
            <h4 className="text-xl font-bold">Community First</h4>
            <p className="text-slate-400 text-sm leading-relaxed">Building meaningful connections between students and mentors across the globe.</p>
          </div>

          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-white/10 rounded-3xl flex items-center justify-center mx-auto text-indigo-400 backdrop-blur-md">
              <ShieldCheck className="w-8 h-8" />
            </div>
            <h4 className="text-xl font-bold">Verified Trust</h4>
            <p className="text-slate-400 text-sm leading-relaxed">Every organization and opportunity is verified to ensure the highest quality standards.</p>
          </div>

          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-white/10 rounded-3xl flex items-center justify-center mx-auto text-pink-400 backdrop-blur-md">
              <Sparkles className="w-8 h-8" />
            </div>
            <h4 className="text-xl font-bold">Innovation Driven</h4>
            <p className="text-slate-400 text-sm leading-relaxed">Constantly evolving our platform with cutting-edge tools for the modern student.</p>
          </div>
        </div>
      </div>

      {/* Footer Note */}
      <div className="text-center py-12">
        <p className="text-slate-400 font-medium">© 2026 oledge. All rights reserved.</p>
      </div>
    </div>
  );
}
