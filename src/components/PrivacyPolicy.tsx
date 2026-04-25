import { motion } from 'framer-motion';
import { ShieldCheck, Lock, Eye, FileText, Globe, UserCheck } from 'lucide-react';

export default function PrivacyPolicy() {
  const sections = [
    {
      title: "Data Collection & Compliance",
      icon: Eye,
      content: "We strictly follow the rule of government as data protection laws as per the Indian Govt. We collect information you provide directly to us at oledge.online, including name, email, academic records, and skills, ensuring full compliance with national standards."
    },
    {
      title: "How We Use Your Data",
      icon: FileText,
      content: "Your data is utilized exclusively for your career growth. We analyze your academic and professional profile to surface the best internships, jobs, and networking opportunities that align with your talent and ambitions."
    },
    {
      title: "Our Commitment: No Sale of Data",
      icon: Globe,
      content: "We do not sell your data to any third party. Oledge is a platform where talent meets growth—we provide the space for recruiters and organizations who are waiting for talent like yours, without ever compromising your privacy for profit."
    },
    {
      title: "Security Measures",
      icon: Lock,
      content: "Oledge Group Pvt Ltd employs industry-standard encryption and security protocols to safeguard your information from unauthorized access. Our priority is maintaining a secure environment for Bharat's future workforce."
    },
    {
      title: "Your Choices",
      icon: UserCheck,
      content: "You have complete control over your data. You may update, correct, or delete your information at any time via your account settings. For detailed queries, you can reach out to our legal and support team at support@oledge.online."
    }
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-12 py-8">
      {/* Header */}
      <div className="bg-white p-12 rounded-[3rem] border border-slate-100 shadow-sm flex flex-col items-center text-center space-y-6">
        <div className="w-20 h-20 bg-blue-600 rounded-[1.5rem] flex items-center justify-center text-white shadow-xl shadow-blue-100">
          <ShieldCheck className="w-10 h-10" />
        </div>
        <h1 className="text-4xl font-black text-slate-900 tracking-tighter leading-none">Privacy Policy</h1>
        <p className="text-slate-500 font-bold mt-1 uppercase tracking-widest text-[10px]">Oledge Group Pvt Ltd | oledge.online</p>
      </div>

      {/* Content Sections */}
      <div className="grid gap-8">
        {sections.map((section, idx) => (
          <motion.div 
            key={idx}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-col md:flex-row gap-8 items-start"
          >
            <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 flex-shrink-0">
              <section.icon className="w-7 h-7" />
            </div>
            <div className="space-y-4">
              <h3 className="text-2xl font-black text-slate-900">{section.title}</h3>
              <p className="text-slate-600 leading-relaxed font-medium">{section.content}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Contact Section */}
      <div className="bg-slate-900 text-white p-12 rounded-[3rem] text-center space-y-6 shadow-2xl shadow-slate-200">
        <h2 className="text-2xl font-black tracking-tight">Questions about our policy?</h2>
        <p className="text-slate-400 font-medium max-w-xl mx-auto">
          If you have any questions about this Privacy Policy or data handling at oledge.online, please contact us at support@oledge.online.
        </p>
        <button className="bg-white text-slate-900 px-8 py-4 rounded-2xl font-black text-sm hover:bg-slate-100 transition-all">
          Contact Support
        </button>
      </div>
    </div>
  );
}
