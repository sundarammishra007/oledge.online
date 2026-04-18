import { motion } from 'framer-motion';
import { ShieldCheck, Lock, Eye, FileText, Globe, UserCheck } from 'lucide-react';

export default function PrivacyPolicy() {
  const sections = [
    {
      title: "Data Collection",
      icon: Eye,
      content: "We collect information you provide directly to us, such as when you create or modify your account, request services, contact customer support, or otherwise communicate with us. This information may include: name, email, phone number, academic records, and professional interests."
    },
    {
      title: "How We Use Data",
      icon: FileText,
      content: "We use the information we collect to provide, maintain, and improve our services, such as to facilitate connections between students and organizations, to send you technical notices, updates, security alerts, and support and administrative messages."
    },
    {
      title: "Data Sharing",
      icon: Globe,
      content: "We may share the information we collect about you as described in this statement or at the time of collection or sharing, including: with vendors, consultants, and other service providers who need access to such information to carry out work on our behalf."
    },
    {
      title: "Security Measures",
      icon: Lock,
      content: "We take reasonable measures to help protect information about you from loss, theft, misuse and unauthorized access, disclosure, alteration and destruction. We use industry-standard encryption and security protocols to safeguard your data."
    },
    {
      title: "Your Choices",
      icon: UserCheck,
      content: "You may update, correct or delete information about you at any time by logging into your online account or emailing us. If you wish to delete your account, please email us, but note that we may retain certain information as required by law."
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
        <p className="text-slate-500 font-medium mt-1 uppercase tracking-widest text-[10px]">Last updated: March 31, 2026</p>
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
          If you have any questions about this Privacy Policy, please contact us at privacy@oledge.com.
        </p>
        <button className="bg-white text-slate-900 px-8 py-4 rounded-2xl font-black text-sm hover:bg-slate-100 transition-all">
          Contact Support
        </button>
      </div>
    </div>
  );
}
