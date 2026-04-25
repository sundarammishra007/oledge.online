import { useState } from 'react';
import { 
  signInWithPopup, 
  GoogleAuthProvider, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  updateProfile
} from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db, googleProvider } from '../firebase';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LogIn, 
  UserPlus, 
  GraduationCap, 
  Building2, 
  UserCircle, 
  ShieldCheck, 
  Mail, 
  Lock, 
  Phone, 
  User as UserIcon,
  Globe,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Eye,
  EyeOff,
  Briefcase,
  History,
  Navigation
} from 'lucide-react';
import { cn } from '../lib/utils';
import Logo from './Logo';

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [showAuthForm, setShowAuthForm] = useState(false);
  const [role, setRole] = useState<'student' | 'govt' | 'college' | 'company'>('student');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [mobileNo, setMobileNo] = useState('');

  // Additional fields for specific roles
  const [collegeName, setCollegeName] = useState(''); // For Student
  const [officialPhone, setOfficialPhone] = useState(''); // For College, Govt
  const [website, setWebsite] = useState(''); // For College
  const [establishedYear, setEstablishedYear] = useState(''); // For College (optional)
  const [ministryName, setMinistryName] = useState(''); // For Govt
  const [officerName, setOfficerName] = useState(''); // For Govt
  const [designation, setDesignation] = useState(''); // For Govt
  const [companyName, setCompanyName] = useState(''); // For Company
  const [employeeName, setEmployeeName] = useState(''); // For Company
  const [employeeRole, setEmployeeRole] = useState<'Founder' | 'HR' | 'CEO' | 'Manager'>('Founder'); // For Company

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (!isLogin && password !== confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        const result = await createUserWithEmailAndPassword(auth, email, password);
        const user = result.user;

        const displayName = role === 'student' ? name : 
                           role === 'college' ? collegeName :
                           role === 'govt' ? officerName :
                           role === 'company' ? employeeName : name;

        await updateProfile(user, { displayName });

        let userData: any = {
          uid: user.uid,
          email: email,
          role: role,
          createdAt: serverTimestamp(),
          isVerified: false,
        };

        if (role === 'student') {
          userData = { ...userData, name, mobileNo, college: collegeName };
        } else if (role === 'college') {
          userData = { ...userData, name: collegeName, mobileNo: officialPhone, website, establishedYear };
        } else if (role === 'govt') {
          userData = { ...userData, name: ministryName, officerName, designation, mobileNo: officialPhone, website };
        } else if (role === 'company') {
          userData = { ...userData, name: companyName, employeeName, employeeRole, mobileNo, website };
        }

        await setDoc(doc(db, 'users', user.uid), userData);
      }
    } catch (err: any) {
      if (err.code === 'auth/operation-not-allowed') {
        setError("Email/Password login is not enabled. Go to Firebase Console > Authentication > Sign-in method and enable 'Email/Password'.");
      } else {
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;

      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (!userDoc.exists()) {
        await setDoc(doc(db, 'users', user.uid), {
          uid: user.uid,
          name: user.displayName || '',
          email: user.email || '',
          role: role,
          referralCount: 0,
          isCampusAmbassador: false,
          createdAt: serverTimestamp(),
          isVerified: false,
        });
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const roles = [
    { id: 'student', name: 'Student', icon: GraduationCap, description: 'Discover internships & hackathons' },
    { id: 'govt', name: 'Govt', icon: Globe, description: 'Post apprenticeships & job fairs' },
    { id: 'college', name: 'College', icon: Building2, description: 'Post announcements & drives' },
    { id: 'company', name: 'Company', icon: ShieldCheck, description: 'Hire interns & freshers' },
  ];

  if (!showAuthForm) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 text-center relative overflow-hidden">
        {/* Abstract background elements for that "premium" feel */}
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-50/50 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-50/50 rounded-full blur-[120px] pointer-events-none" />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="max-w-4xl w-full flex flex-col items-center z-10"
        >
          <Logo size="xl" className="mb-12 flex-col" tagline="Original Growth" />
          
          <motion.h2 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-2xl md:text-3xl font-bold text-slate-900 mb-6 tracking-tight"
          >
            Digital career headquarters for the youth of Bharat.
          </motion.h2>
          
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-slate-500 text-lg md:text-xl max-w-2xl mx-auto mb-12 leading-relaxed"
          >
            A campus ecosystem platform for internships, hackathons, job fairs, and freelance work.
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <button
              onClick={() => { setIsLogin(false); setShowAuthForm(true); }}
              className="w-full sm:w-auto px-10 py-4 bg-blue-600 text-white rounded-2xl font-bold text-lg hover:bg-blue-700 transition-all shadow-xl shadow-blue-600/20 flex items-center justify-center gap-2 group"
            >
              Get Started
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
            <button
              onClick={() => { setIsLogin(true); setShowAuthForm(true); }}
              className="w-full sm:w-auto px-10 py-4 bg-slate-100 text-slate-900 rounded-2xl font-bold text-lg hover:bg-slate-200 transition-all"
            >
              Sign In
            </button>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-8 opacity-60"
          >
            {[
              { id: 'internships', text: 'Internships' },
              { id: 'hackathons', text: 'Hackathons' },
              { id: 'jobfairs', text: 'Job Fairs' },
              { id: 'freelance', text: 'Freelance' }
            ].map(item => (
              <div key={item.id} className="flex flex-col items-center gap-2">
                <CheckCircle2 className="w-6 h-6 text-blue-600" />
                <span className="text-slate-600 text-xs font-bold uppercase tracking-[0.2em]">{item.text}</span>
              </div>
            ))}
          </motion.div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-4 transition-colors duration-300">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-xl w-full bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl shadow-blue-500/10 dark:shadow-none p-8 md:p-12 border border-slate-100 dark:border-slate-800 transition-colors duration-300 relative overflow-hidden"
      >
        <button 
          onClick={() => setShowAuthForm(false)}
          className="absolute top-8 left-8 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
        >
          <ArrowRight className="w-6 h-6 rotate-180" />
        </button>

        <div className="text-center mb-10 flex flex-col items-center">
          <Logo size="md" className="mb-4 flex-col" tagline="Original Growth" />
        </div>

        <div className="flex bg-slate-100 dark:bg-slate-800/50 p-1.5 rounded-2xl mb-10">
          <button 
            onClick={() => setIsLogin(true)}
            className={cn(
              "flex-1 py-3 rounded-xl text-sm font-black uppercase tracking-widest transition-all duration-300", 
              isLogin 
                ? "bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-md scale-[1.02]" 
                : "text-slate-500 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
            )}
          >
            Login
          </button>
          <button 
            onClick={() => setIsLogin(false)}
            className={cn(
              "flex-1 py-3 rounded-xl text-sm font-black uppercase tracking-widest transition-all duration-300", 
              !isLogin 
                ? "bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-md scale-[1.02]" 
                : "text-slate-500 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
            )}
          >
            Signup
          </button>
        </div>

        <form onSubmit={handleAuth} className="space-y-5">
          {!isLogin && (
            <div className="space-y-6 mb-8">
              <div>
                <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-3 block ml-1">Select Your Role</label>
                <div className="grid grid-cols-2 gap-3">
                  {roles.map((r) => (
                    <button
                      key={r.id}
                      type="button"
                      onClick={() => setRole(r.id as any)}
                      className={cn(
                        "flex flex-col items-start p-4 rounded-2xl border-2 transition-all group relative overflow-hidden",
                        role === r.id 
                          ? "border-blue-600 bg-blue-50/50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400" 
                          : "border-slate-100 dark:border-slate-800 hover:border-blue-200 dark:hover:border-blue-900/40 text-slate-600 dark:text-slate-400"
                      )}
                    >
                      <r.icon className={cn("w-6 h-6 mb-2 transition-transform duration-300", role === r.id ? "scale-110" : "group-hover:scale-110")} />
                      <span className="font-black text-xs uppercase tracking-wider">{r.name}</span>
                      <span className="text-[10px] font-medium opacity-60 leading-tight mt-1">{r.description}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                {role === 'student' && (
                  <>
                    <div className="relative group">
                      <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors w-5 h-5" />
                      <input 
                        type="text" 
                        placeholder="Full Name" 
                        required
                        className="w-full pl-12 pr-4 py-4 bg-slate-50 dark:bg-slate-800/50 border-2 border-transparent rounded-2xl focus:border-blue-500 focus:bg-white dark:focus:bg-slate-800 transition-all font-bold text-slate-900 dark:text-white placeholder:text-slate-400"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                      />
                    </div>
                    <div className="relative group">
                      <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors w-5 h-5" />
                      <input 
                        type="tel" 
                        placeholder="Mobile Number" 
                        required
                        className="w-full pl-12 pr-4 py-4 bg-slate-50 dark:bg-slate-800/50 border-2 border-transparent rounded-2xl focus:border-blue-500 focus:bg-white dark:focus:bg-slate-800 transition-all font-bold text-slate-900 dark:text-white placeholder:text-slate-400"
                        value={mobileNo}
                        onChange={(e) => setMobileNo(e.target.value)}
                      />
                    </div>
                    <div className="relative group">
                      <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors w-5 h-5" />
                      <input 
                        type="text" 
                        placeholder="Name of College/Institute" 
                        required
                        className="w-full pl-12 pr-4 py-4 bg-slate-50 dark:bg-slate-800/50 border-2 border-transparent rounded-2xl focus:border-blue-500 focus:bg-white dark:focus:bg-slate-800 transition-all font-bold text-slate-900 dark:text-white placeholder:text-slate-400"
                        value={collegeName}
                        onChange={(e) => setCollegeName(e.target.value)}
                      />
                    </div>
                  </>
                )}

                {role === 'college' && (
                  <>
                    <div className="relative group">
                      <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors w-5 h-5" />
                      <input 
                        type="text" 
                        placeholder="Name of College/University" 
                        required
                        className="w-full pl-12 pr-4 py-4 bg-slate-50 dark:bg-slate-800/50 border-2 border-transparent rounded-2xl focus:border-blue-500 focus:bg-white dark:focus:bg-slate-800 transition-all font-bold text-slate-900 dark:text-white placeholder:text-slate-400"
                        value={collegeName}
                        onChange={(e) => setCollegeName(e.target.value)}
                      />
                    </div>
                    <div className="relative group">
                      <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors w-5 h-5" />
                      <input 
                        type="tel" 
                        placeholder="Official Phone No" 
                        required
                        className="w-full pl-12 pr-4 py-4 bg-slate-50 dark:bg-slate-800/50 border-2 border-transparent rounded-2xl focus:border-blue-500 focus:bg-white dark:focus:bg-slate-800 transition-all font-bold text-slate-900 dark:text-white placeholder:text-slate-400"
                        value={officialPhone}
                        onChange={(e) => setOfficialPhone(e.target.value)}
                      />
                    </div>
                    <div className="relative group">
                      <Globe className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors w-5 h-5" />
                      <input 
                        type="url" 
                        placeholder="Website" 
                        required
                        className="w-full pl-12 pr-4 py-4 bg-slate-50 dark:bg-slate-800/50 border-2 border-transparent rounded-2xl focus:border-blue-500 focus:bg-white dark:focus:bg-slate-800 transition-all font-bold text-slate-900 dark:text-white placeholder:text-slate-400"
                        value={website}
                        onChange={(e) => setWebsite(e.target.value)}
                      />
                    </div>
                    <div className="relative group">
                      <History className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors w-5 h-5" />
                      <input 
                        type="text" 
                        placeholder="Established Year (Optional)" 
                        className="w-full pl-12 pr-4 py-4 bg-slate-50 dark:bg-slate-800/50 border-2 border-transparent rounded-2xl focus:border-blue-500 focus:bg-white dark:focus:bg-slate-800 transition-all font-bold text-slate-900 dark:text-white placeholder:text-slate-400"
                        value={establishedYear}
                        onChange={(e) => setEstablishedYear(e.target.value)}
                      />
                    </div>
                  </>
                )}

                {role === 'govt' && (
                  <>
                    <div className="relative group">
                      <Globe className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors w-5 h-5" />
                      <input 
                        type="text" 
                        placeholder="Name of Ministry" 
                        required
                        className="w-full pl-12 pr-4 py-4 bg-slate-50 dark:bg-slate-800/50 border-2 border-transparent rounded-2xl focus:border-blue-500 focus:bg-white dark:focus:bg-slate-800 transition-all font-bold text-slate-900 dark:text-white placeholder:text-slate-400"
                        value={ministryName}
                        onChange={(e) => setMinistryName(e.target.value)}
                      />
                    </div>
                    <div className="relative group">
                      <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors w-5 h-5" />
                      <input 
                        type="text" 
                        placeholder="Officer Name" 
                        required
                        className="w-full pl-12 pr-4 py-4 bg-slate-50 dark:bg-slate-800/50 border-2 border-transparent rounded-2xl focus:border-blue-500 focus:bg-white dark:focus:bg-slate-800 transition-all font-bold text-slate-900 dark:text-white placeholder:text-slate-400"
                        value={officerName}
                        onChange={(e) => setOfficerName(e.target.value)}
                      />
                    </div>
                    <div className="relative group">
                      <Navigation className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors w-5 h-5" />
                      <input 
                        type="text" 
                        placeholder="Designation" 
                        required
                        className="w-full pl-12 pr-4 py-4 bg-slate-50 dark:bg-slate-800/50 border-2 border-transparent rounded-2xl focus:border-blue-500 focus:bg-white dark:focus:bg-slate-800 transition-all font-bold text-slate-900 dark:text-white placeholder:text-slate-400"
                        value={designation}
                        onChange={(e) => setDesignation(e.target.value)}
                      />
                    </div>
                    <div className="relative group">
                      <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors w-5 h-5" />
                      <input 
                        type="tel" 
                        placeholder="Official Phone No" 
                        required
                        className="w-full pl-12 pr-4 py-4 bg-slate-50 dark:bg-slate-800/50 border-2 border-transparent rounded-2xl focus:border-blue-500 focus:bg-white dark:focus:bg-slate-800 transition-all font-bold text-slate-900 dark:text-white placeholder:text-slate-400"
                        value={officialPhone}
                        onChange={(e) => setOfficialPhone(e.target.value)}
                      />
                    </div>
                    <div className="relative group">
                      <Globe className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors w-5 h-5" />
                      <input 
                        type="url" 
                        placeholder="Website (Optional)" 
                        className="w-full pl-12 pr-4 py-4 bg-slate-50 dark:bg-slate-800/50 border-2 border-transparent rounded-2xl focus:border-blue-500 focus:bg-white dark:focus:bg-slate-800 transition-all font-bold text-slate-900 dark:text-white placeholder:text-slate-400"
                        value={website}
                        onChange={(e) => setWebsite(e.target.value)}
                      />
                    </div>
                  </>
                )}

                {role === 'company' && (
                  <>
                    <div className="relative group">
                      <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors w-5 h-5" />
                      <input 
                        type="text" 
                        placeholder="Name of the Company" 
                        required
                        className="w-full pl-12 pr-4 py-4 bg-slate-50 dark:bg-slate-800/50 border-2 border-transparent rounded-2xl focus:border-blue-500 focus:bg-white dark:focus:bg-slate-800 transition-all font-bold text-slate-900 dark:text-white placeholder:text-slate-400"
                        value={companyName}
                        onChange={(e) => setCompanyName(e.target.value)}
                      />
                    </div>
                    <div className="relative group">
                      <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors w-5 h-5" />
                      <input 
                        type="text" 
                        placeholder="Employee Name" 
                        required
                        className="w-full pl-12 pr-4 py-4 bg-slate-50 dark:bg-slate-800/50 border-2 border-transparent rounded-2xl focus:border-blue-500 focus:bg-white dark:focus:bg-slate-800 transition-all font-bold text-slate-900 dark:text-white placeholder:text-slate-400"
                        value={employeeName}
                        onChange={(e) => setEmployeeName(e.target.value)}
                      />
                    </div>
                    <div className="relative group">
                      <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors w-5 h-5" />
                      <select 
                        required
                        className="w-full pl-12 pr-4 py-4 bg-slate-50 dark:bg-slate-800/50 border-2 border-transparent rounded-2xl focus:border-blue-500 focus:bg-white dark:focus:bg-slate-800 transition-all font-bold text-slate-900 dark:text-white appearance-none"
                        value={employeeRole}
                        onChange={(e) => setEmployeeRole(e.target.value as any)}
                      >
                        <option value="Founder">Founder</option>
                        <option value="HR">HR</option>
                        <option value="CEO">CEO</option>
                        <option value="Manager">Manager</option>
                      </select>
                    </div>
                    <div className="relative group">
                      <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors w-5 h-5" />
                      <input 
                        type="tel" 
                        placeholder="Official Phone Number" 
                        required
                        className="w-full pl-12 pr-4 py-4 bg-slate-50 dark:bg-slate-800/50 border-2 border-transparent rounded-2xl focus:border-blue-500 focus:bg-white dark:focus:bg-slate-800 transition-all font-bold text-slate-900 dark:text-white placeholder:text-slate-400"
                        value={mobileNo}
                        onChange={(e) => setMobileNo(e.target.value)}
                      />
                    </div>
                    <div className="relative group">
                      <Globe className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors w-5 h-5" />
                      <input 
                        type="url" 
                        placeholder="Company Website" 
                        required
                        className="w-full pl-12 pr-4 py-4 bg-slate-50 dark:bg-slate-800/50 border-2 border-transparent rounded-2xl focus:border-blue-500 focus:bg-white dark:focus:bg-slate-800 transition-all font-bold text-slate-900 dark:text-white placeholder:text-slate-400"
                        value={website}
                        onChange={(e) => setWebsite(e.target.value)}
                      />
                    </div>
                  </>
                )}
              </div>
            </div>
          )}

          <div className="space-y-4">
            <div className="relative group">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors w-5 h-5" />
              <input 
                type="email" 
                placeholder={role === 'company' || role === 'govt' ? "Official Email Address" : "Email Address"}
                required
                className="w-full pl-12 pr-4 py-4 bg-slate-50 dark:bg-slate-800/50 border-2 border-transparent rounded-2xl focus:border-blue-500 focus:bg-white dark:focus:bg-slate-800 transition-all font-bold text-slate-900 dark:text-white placeholder:text-slate-400"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="relative group">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors w-5 h-5" />
              <input 
                type={showPassword ? "text" : "password"} 
                placeholder="Password" 
                required
                className="w-full pl-12 pr-12 py-4 bg-slate-50 dark:bg-slate-800/50 border-2 border-transparent rounded-2xl focus:border-blue-500 focus:bg-white dark:focus:bg-slate-800 transition-all font-bold text-slate-900 dark:text-white placeholder:text-slate-400"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button 
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-blue-500 transition-colors"
                title={showPassword ? "Hide password" : "See password"}
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>

            {!isLogin && (
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors w-5 h-5" />
                <input 
                  type={showPassword ? "text" : "password"} 
                  placeholder="Confirm Password" 
                  required
                  className="w-full pl-12 pr-4 py-4 bg-slate-50 dark:bg-slate-800/50 border-2 border-transparent rounded-2xl focus:border-blue-500 focus:bg-white dark:focus:bg-slate-800 transition-all font-bold text-slate-900 dark:text-white placeholder:text-slate-400"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>
            )}
          </div>

          {error && (
            <motion.div 
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-xs font-bold rounded-2xl border border-red-100 dark:border-red-900/30 flex items-center gap-3"
            >
              <div className="w-1.5 h-1.5 rounded-full bg-red-600 animate-pulse" />
              {error}
            </motion.div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-5 px-6 bg-[#1a2b5a] hover:bg-[#0f1a3a] text-white rounded-[1.5rem] font-black text-sm uppercase tracking-[0.2em] transition-all shadow-xl shadow-blue-900/25 dark:shadow-none disabled:opacity-50 active:scale-[0.98]"
          >
            {loading ? (
              <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mx-auto"></div>
            ) : (
              isLogin ? 'Sign In' : 'Create Account'
            )}
          </button>
        </form>

        <div className="relative my-10">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-100 dark:border-slate-800"></div>
          </div>
          <div className="relative flex justify-center text-[10px] uppercase font-black tracking-[0.3em]">
            <span className="bg-white dark:bg-slate-900 px-4 text-slate-400 dark:text-slate-500">Secure Connect</span>
          </div>
        </div>

        <button
          onClick={handleGoogleLogin}
          disabled={loading}
          className="w-full flex items-center justify-center gap-4 py-4 px-6 bg-white dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 hover:border-blue-500 dark:hover:border-blue-500 text-slate-700 dark:text-slate-200 rounded-[1.5rem] font-black text-xs uppercase tracking-widest transition-all group"
        >
          <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" className="w-5 h-5 group-hover:scale-110 transition-transform" alt="Google" />
          Continue with Google
        </button>

        <p className="text-center text-[10px] text-slate-400 dark:text-slate-600 font-bold uppercase tracking-widest mt-12">
          Protected by oledge Secure Layer © 2026
        </p>
      </motion.div>
    </div>
  );
}
