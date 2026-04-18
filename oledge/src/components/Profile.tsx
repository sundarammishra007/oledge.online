import { useState, useRef, useEffect } from 'react';
import { doc, updateDoc, serverTimestamp, collection, query, where, getDocs, addDoc } from 'firebase/firestore';
import { updatePassword } from 'firebase/auth';
import { db, handleFirestoreError, OperationType, auth } from '../firebase';
import { User, Project, Certification, VolunteerExperience } from '../types';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User as UserIcon, 
  Mail, 
  GraduationCap, 
  Building2, 
  ShieldCheck, 
  Plus, 
  X, 
  Save, 
  Briefcase, 
  Code, 
  Link as LinkIcon,
  Phone,
  Award,
  Heart,
  ExternalLink,
  FileText,
  Trash2,
  Upload,
  Camera,
  Image as ImageIcon,
  Lock,
  Printer,
  Palette
} from 'lucide-react';
import { cn } from '../lib/utils';
import ThemePanel from './ThemePanel';

interface ProfileProps {
  user: User;
}

export default function Profile({ user }: ProfileProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user.name,
    photoURL: user.photoURL || '',
    backgroundURL: user.backgroundURL || '',
    mobileNo: user.mobileNo || '',
    college: user.college || '',
    branch: user.branch || '',
    skills: user.skills || [],
    portfolioLinks: user.portfolioLinks || [],
    interests: user.interests || [],
    projects: user.projects || [],
    certifications: user.certifications || [],
    volunteerExperience: user.volunteerExperience || [],
    summary: user.summary || '',
    education: user.education || [],
  });
  const [newSkill, setNewSkill] = useState('');
  const [loading, setLoading] = useState(false);
  const certificateInputRef = useRef<HTMLInputElement>(null);
  const profilePicInputRef = useRef<HTMLInputElement>(null);
  const backgroundPicInputRef = useRef<HTMLInputElement>(null);

  const [showAddProject, setShowAddProject] = useState(false);
  const [newProject, setNewProject] = useState<Project>({ title: '', description: '', link: '', technologies: [] });
  
  const [showAddCert, setShowAddCert] = useState(false);
  const [newCert, setNewCert] = useState<Certification>({ name: '', issuer: '', issueDate: '', taggedEntityName: '', taggedEntityType: 'company' });

  const [showAddVolunteer, setShowAddVolunteer] = useState(false);
  const [newVolunteer, setNewVolunteer] = useState<VolunteerExperience>({ role: '', organization: '', description: '', startDate: '' });

  const [showAddEducation, setShowAddEducation] = useState(false);
  const [newEducation, setNewEducation] = useState({ school: '', degree: '', fieldOfStudy: '', startDate: '', endDate: '', grade: '' });

  const [showResume, setShowResume] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'experience' | 'education' | 'certifications' | 'theme'>('overview');

  const handleUpdatePassword = async () => {
    if (!newPassword) return;
    setIsUpdatingPassword(true);
    try {
      if (auth.currentUser) {
        await updatePassword(auth.currentUser, newPassword);
        alert('Password updated successfully!');
        setNewPassword('');
      }
    } catch (error: any) {
      if (error.code === 'auth/requires-recent-login') {
        alert('For security, please log out and log back in before changing your password.');
      } else {
        alert('Error updating password: ' + error.message);
      }
    } finally {
      setIsUpdatingPassword(false);
    }
  };
  const [institutions, setInstitutions] = useState<User[]>([]);

  useEffect(() => {
    const fetchInstitutions = async () => {
      try {
        const q = query(collection(db, 'users'), where('role', 'in', ['company', 'college', 'govt']));
        const snapshot = await getDocs(q);
        const list = snapshot.docs.map(doc => ({ uid: doc.id, ...doc.data() } as User));
        setInstitutions(list);
      } catch (error) {
        console.error("Error fetching institutions", error);
      }
    };
    fetchInstitutions();
  }, []);

  const [isCompressing, setIsCompressing] = useState(false);

  const calculateSize = (data: any) => {
    return new TextEncoder().encode(JSON.stringify(data)).length;
  };

  const handleSave = async () => {
    if (isCompressing) {
      alert("Please wait for images to finish processing...");
      return;
    }

    const size = calculateSize(formData);
    if (size > 800000) { // 800KB limit
      alert(`Profile data is too large (${(size / 1024 / 1024).toFixed(2)}MB). Please use smaller images or remove some certifications/projects.`);
      return;
    }

    setLoading(true);
    try {
      // Check for promotion
      const isPromoted = (user.referralCount || 0) >= 50;
      
      await updateDoc(doc(db, 'users', user.uid), {
        ...formData,
        isCampusAmbassador: isPromoted,
        updatedAt: serverTimestamp(),
      });
      setIsEditing(false);
      window.location.reload();
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `users/${user.uid}`);
    } finally {
      setLoading(false);
    }
  };

  const addSkill = () => {
    if (newSkill && !formData.skills.includes(newSkill)) {
      setFormData(prev => ({ ...prev, skills: [...prev.skills, newSkill] }));
      setNewSkill('');
    }
  };

  const removeSkill = (skill: string) => {
    setFormData(prev => ({ ...prev, skills: prev.skills.filter(s => s !== skill) }));
  };

  const compressImage = (file: File, maxWidth: number, maxHeight: number): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target?.result as string;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > maxWidth) {
              height *= maxWidth / width;
              width = maxWidth;
            }
          } else {
            if (height > maxHeight) {
              width *= maxHeight / height;
              height = maxHeight;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL('image/jpeg', 0.5)); // Reduced quality to 0.5
        };
        img.onerror = (err) => reject(err);
      };
      reader.onerror = (err) => reject(err);
    });
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsCompressing(true);
      try {
        const compressed = await compressImage(file, 400, 400); // Even smaller
        setNewCert(prev => ({ ...prev, certificateData: compressed }));
      } catch (error) {
        console.error("Error compressing image", error);
      } finally {
        setIsCompressing(false);
      }
    }
  };

  const handleProfilePicUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsCompressing(true);
      try {
        const compressed = await compressImage(file, 200, 200); // Even smaller
        setFormData(prev => ({ ...prev, photoURL: compressed }));
      } catch (error) {
        console.error("Error compressing image", error);
      } finally {
        setIsCompressing(false);
      }
    }
  };

  const handleBackgroundPicUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsCompressing(true);
      try {
        const compressed = await compressImage(file, 600, 300); // Even smaller
        setFormData(prev => ({ ...prev, backgroundURL: compressed }));
      } catch (error) {
        console.error("Error compressing image", error);
      } finally {
        setIsCompressing(false);
      }
    }
  };

  const addProject = () => {
    if (newProject.title && newProject.description) {
      setFormData(prev => ({ ...prev, projects: [...(prev.projects || []), newProject] }));
      setNewProject({ title: '', description: '', link: '', technologies: [] });
      setShowAddProject(false);
    }
  };

  const removeProject = (index: number) => {
    setFormData(prev => ({ ...prev, projects: prev.projects?.filter((_, i) => i !== index) }));
  };

  const addCertification = async () => {
    if (newCert.name && newCert.issuer) {
      const updatedCerts = [...(formData.certifications || []), newCert];
      setFormData(prev => ({ ...prev, certifications: updatedCerts }));
      
      // Automatically post to feed if tagged
      if (newCert.taggedEntityName) {
        try {
          await addDoc(collection(db, 'notices'), {
            title: `New Certification: ${newCert.name}`,
            content: `${user.name} has earned a new certification from ${newCert.issuer}${newCert.taggedEntityName ? ` (Tagged: ${newCert.taggedEntityName})` : ''}!`,
            authorId: user.uid,
            authorName: user.name,
            authorRole: user.role,
            reactions: { acknowledge: [], inspiring: [], useful: [] },
            reposts: [],
            commentsCount: 0,
            createdAt: serverTimestamp(),
            type: 'achievement'
          });
        } catch (e) {
          console.error("Failed to post achievement", e);
        }
      }

      setNewCert({ name: '', issuer: '', issueDate: '', taggedEntityName: '', taggedEntityType: 'company' });
      setShowAddCert(false);
    }
  };

  const addEducation = () => {
    if (newEducation.school && newEducation.degree) {
      setFormData(prev => ({ ...prev, education: [...(prev.education || []), newEducation] }));
      setNewEducation({ school: '', degree: '', fieldOfStudy: '', startDate: '', endDate: '', grade: '' });
      setShowAddEducation(false);
    }
  };

  const removeEducation = (index: number) => {
    setFormData(prev => ({ ...prev, education: prev.education?.filter((_, i) => i !== index) }));
  };

  const removeCertification = (index: number) => {
    setFormData(prev => ({ ...prev, certifications: prev.certifications?.filter((_, i) => i !== index) }));
  };

  const addVolunteer = () => {
    if (newVolunteer.role && newVolunteer.organization) {
      setFormData(prev => ({ ...prev, volunteerExperience: [...(prev.volunteerExperience || []), newVolunteer] }));
      setNewVolunteer({ role: '', organization: '', description: '', startDate: '' });
      setShowAddVolunteer(false);
    }
  };

  const removeVolunteer = (index: number) => {
    setFormData(prev => ({ ...prev, volunteerExperience: prev.volunteerExperience?.filter((_, i) => i !== index) }));
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 transition-colors duration-300">
      {/* Profile Header with Background */}
      <div className="relative">
        <div className="h-48 md:h-64 bg-slate-100 dark:bg-slate-800 rounded-t-3xl overflow-hidden relative group">
          {formData.backgroundURL ? (
            <img 
              src={formData.backgroundURL} 
              alt="Background" 
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-blue-500 to-indigo-600 opacity-20" />
          )}
          
          {isEditing && (
            <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <div className="bg-white/90 backdrop-blur p-4 rounded-2xl shadow-xl w-full max-w-md mx-4 space-y-4">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Background Image URL</label>
                  <div className="flex gap-2">
                    <input 
                      type="url" 
                      placeholder="https://example.com/image.jpg"
                      className="flex-1 p-2 bg-slate-50 rounded-xl border-none focus:ring-2 focus:ring-blue-500 text-sm"
                      value={formData.backgroundURL}
                      onChange={(e) => setFormData(prev => ({ ...prev, backgroundURL: e.target.value }))}
                    />
                    <ImageIcon className="w-5 h-5 text-slate-400 self-center" />
                  </div>
                </div>
                <div className="relative">
                  <input 
                    type="file" 
                    ref={backgroundPicInputRef}
                    onChange={handleBackgroundPicUpload}
                    className="hidden"
                    accept="image/*"
                  />
                  <button 
                    onClick={() => backgroundPicInputRef.current?.click()}
                    className="w-full p-2 bg-blue-600 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-2 hover:bg-blue-700 transition-colors"
                  >
                    <Upload className="w-4 h-4" />
                    Upload Background
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Profile Header Info */}
        <div className="bg-white dark:bg-slate-900 rounded-b-3xl border-x border-b border-slate-100 dark:border-slate-800 shadow-sm p-8 pt-0 transition-colors duration-300">
          <div className="flex flex-col md:flex-row items-center gap-8 -mt-16 md:-mt-20 relative z-10 px-4">
            <div className="w-32 h-32 md:w-40 md:h-40 bg-white dark:bg-slate-900 rounded-full p-2 shadow-xl relative group transition-colors duration-300">
              <div className="w-full h-full bg-blue-50 dark:bg-blue-900/30 rounded-full flex items-center justify-center text-blue-600 dark:text-blue-400 border-4 border-white dark:border-slate-900 overflow-hidden transition-colors duration-300">
                {formData.photoURL ? (
                  <img 
                    src={formData.photoURL} 
                    alt={user.name} 
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <UserIcon className="w-16 h-16 md:w-20 md:h-20" />
                )}
              </div>
              
              {isEditing && (
                <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                  <div className="flex flex-col gap-2">
                    <div className="bg-white p-2 rounded-full shadow-lg" onClick={() => {
                      const url = prompt("Enter Profile Picture URL:", formData.photoURL);
                      if (url !== null) setFormData(prev => ({ ...prev, photoURL: url }));
                    }}>
                      <LinkIcon className="w-5 h-5 text-blue-600" />
                    </div>
                    <div className="bg-white p-2 rounded-full shadow-lg" onClick={() => profilePicInputRef.current?.click()}>
                      <Camera className="w-5 h-5 text-blue-600" />
                    </div>
                    <input 
                      type="file" 
                      ref={profilePicInputRef}
                      onChange={handleProfilePicUpload}
                      className="hidden"
                      accept="image/*"
                    />
                  </div>
                </div>
              )}

              {user.isCampusAmbassador && (
                <div className="absolute bottom-2 right-2 bg-yellow-400 text-white p-2 rounded-full shadow-lg border-2 border-white" title="Campus Ambassador">
                  <ShieldCheck className="w-5 h-5" />
                </div>
              )}
            </div>
            
            <div className="flex-1 text-center md:text-left mt-4 md:mt-16">
              <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">{user.name}</h2>
              <div className="space-y-1 mt-1">
                <p className="text-slate-500 dark:text-slate-400 font-medium flex items-center justify-center md:justify-start gap-2">
                  <Mail className="w-4 h-4" />
                  {user.email}
                </p>
                <p className="text-slate-500 dark:text-slate-400 font-medium flex items-center justify-center md:justify-start gap-2">
                  <Phone className="w-4 h-4" />
                  {user.mobileNo || 'No mobile number'}
                </p>
              </div>
              <div className="flex flex-wrap justify-center md:justify-start gap-2 mt-4">
                <span className="px-4 py-1 bg-blue-600 text-white text-[10px] font-black uppercase tracking-widest rounded-full shadow-lg shadow-blue-200">
                  {user.role}
                </span>
                {user.isCampusAmbassador && (
                  <span className="px-4 py-1 bg-yellow-500 text-white text-[10px] font-black uppercase tracking-widest rounded-full shadow-lg shadow-yellow-200">
                    Campus Ambassador
                  </span>
                )}
                {user.isVerified && (
                  <span className="px-4 py-1 bg-green-50 text-green-600 text-[10px] font-black uppercase tracking-widest rounded-full border border-green-100 flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3" />
                    Verified
                  </span>
                )}
              </div>
            </div>
            <div className="flex flex-col md:flex-row items-center gap-4 mt-4 md:mt-16">
              <button 
                onClick={() => setShowResume(true)}
                className="px-6 py-3 bg-slate-900 dark:bg-slate-800 text-white rounded-2xl font-bold text-sm shadow-lg flex items-center gap-2 hover:bg-slate-800 dark:hover:bg-slate-700 transition-all w-full md:w-auto"
              >
                <FileText className="w-5 h-5" />
                Generate Resume
              </button>
              <button 
                onClick={() => setIsEditing(!isEditing)}
                className={cn(
                  "px-6 py-3 rounded-2xl font-bold text-sm transition-all flex items-center gap-2 w-full md:w-auto",
                  isEditing 
                    ? "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400" 
                    : "bg-blue-600 text-white shadow-lg shadow-blue-200 dark:shadow-none hover:bg-blue-700"
                )}
              >
                {isEditing ? <X className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
                {isEditing ? 'Cancel' : 'Edit Profile'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex overflow-x-auto no-scrollbar gap-2 p-1 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm sticky top-20 z-30 transition-colors duration-300">
        {[
          { id: 'overview', label: 'Overview', icon: UserIcon },
          { id: 'experience', label: 'Experience', icon: Briefcase },
          { id: 'education', label: 'Education', icon: GraduationCap },
          { id: 'certifications', label: 'Certifications', icon: Award },
          { id: 'theme', label: 'Theme & Style', icon: Palette },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={cn(
              "flex items-center gap-2 px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all whitespace-nowrap",
              activeTab === tab.id
                ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-lg shadow-slate-200 dark:shadow-none"
                : "text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
            )}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'overview' && (
        <>
          {/* Promotion Status */}
      {user.role === 'student' && (
        <div className="bg-gradient-to-r from-yellow-400 to-orange-500 rounded-3xl p-8 text-white shadow-xl shadow-yellow-100">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h3 className="text-2xl font-black">Campus Ambassador Program</h3>
              <p className="text-yellow-50 font-medium mt-1">Refer 50 friends to get promoted and unlock exclusive perks!</p>
            </div>
            <div className="text-center bg-white/20 backdrop-blur-md px-8 py-4 rounded-2xl border border-white/30">
              <p className="text-xs font-black uppercase tracking-widest opacity-80">Referrals</p>
              <p className="text-4xl font-black">{user.referralCount || 0} / 50</p>
            </div>
          </div>
          <div className="mt-6 w-full bg-white/20 rounded-full h-3 overflow-hidden border border-white/10">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(((user.referralCount || 0) / 50) * 100, 100)}%` }}
              className="h-full bg-white"
            />
          </div>
        </div>
      )}

      {/* Professional Summary */}
      <div className="bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-sm p-8 space-y-6 transition-colors duration-300">
        <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tighter flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
            <FileText className="w-6 h-6" />
          </div>
          Professional Summary
        </h3>
        {isEditing ? (
          <textarea 
            className="w-full p-5 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border-2 border-transparent focus:border-emerald-500 focus:bg-white dark:focus:bg-slate-800 transition-all font-bold text-slate-900 dark:text-white h-40 resize-none placeholder:text-slate-400"
            placeholder="Write a brief professional summary about yourself..."
            value={formData.summary}
            onChange={(e) => setFormData(prev => ({ ...prev, summary: e.target.value }))}
          />
        ) : (
          <p className="text-slate-600 dark:text-slate-400 leading-relaxed font-medium text-lg">
            {user.summary || "No professional summary added yet. Tell the world what you're passionate about!"}
          </p>
        )}
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Basic Info */}
        <div className="bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-sm p-8 space-y-8 transition-colors duration-300">
          <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tighter flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400">
              <GraduationCap className="w-6 h-6" />
            </div>
            Basic Details
          </h3>
          <div className="space-y-6">
            <div>
              <label className="block text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2 ml-1">Full Name</label>
              {isEditing ? (
                <input 
                  type="text" 
                  className="w-full p-4 bg-slate-50 dark:bg-slate-800/50 border-2 border-transparent rounded-2xl focus:border-blue-500 focus:bg-white dark:focus:bg-slate-800 transition-all font-bold text-slate-900 dark:text-white"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                />
              ) : (
                <p className="text-slate-900 dark:text-white font-black text-lg ml-1">{user.name}</p>
              )}
            </div>
            <div>
              <label className="block text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2 ml-1">Mobile Number</label>
              {isEditing ? (
                <input 
                  type="tel" 
                  className="w-full p-4 bg-slate-50 dark:bg-slate-800/50 border-2 border-transparent rounded-2xl focus:border-blue-500 focus:bg-white dark:focus:bg-slate-800 transition-all font-bold text-slate-900 dark:text-white"
                  value={formData.mobileNo}
                  onChange={(e) => setFormData(prev => ({ ...prev, mobileNo: e.target.value }))}
                />
              ) : (
                <p className="text-slate-900 dark:text-white font-black text-lg ml-1">{user.mobileNo || 'Not specified'}</p>
              )}
            </div>
            <div>
              <label className="block text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2 ml-1">College Name</label>
              {isEditing ? (
                <input 
                  type="text" 
                  className="w-full p-4 bg-slate-50 dark:bg-slate-800/50 border-2 border-transparent rounded-2xl focus:border-blue-500 focus:bg-white dark:focus:bg-slate-800 transition-all font-bold text-slate-900 dark:text-white"
                  value={formData.college}
                  onChange={(e) => setFormData(prev => ({ ...prev, college: e.target.value }))}
                />
              ) : (
                <p className="text-slate-900 dark:text-white font-black text-lg ml-1">{user.college || 'Not specified'}</p>
              )}
            </div>
            <div>
              <label className="block text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2 ml-1">Academic Branch</label>
              {isEditing ? (
                <input 
                  type="text" 
                  className="w-full p-4 bg-slate-50 dark:bg-slate-800/50 border-2 border-transparent rounded-2xl focus:border-blue-500 focus:bg-white dark:focus:bg-slate-800 transition-all font-bold text-slate-900 dark:text-white"
                  value={formData.branch}
                  onChange={(e) => setFormData(prev => ({ ...prev, branch: e.target.value }))}
                />
              ) : (
                <p className="text-slate-900 dark:text-white font-black text-lg ml-1">{user.branch || 'Not specified'}</p>
              )}
            </div>
          </div>
        </div>

        {/* Skills & Interests */}
        <div className="bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-sm p-8 space-y-8 transition-colors duration-300">
          <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tighter flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center text-purple-600 dark:text-purple-400">
              <Code className="w-6 h-6" />
            </div>
            Skills & Expertise
          </h3>
          <div className="space-y-6">
            <div className="flex flex-wrap gap-3">
              {formData.skills.map(skill => (
                <span key={skill} className="px-4 py-2 bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 text-xs font-black uppercase tracking-widest rounded-xl border border-purple-100 dark:border-purple-800/50 flex items-center gap-2 group">
                  {skill}
                  {isEditing && (
                    <button onClick={() => removeSkill(skill)} className="hover:text-red-500 transition-colors">
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </span>
              ))}
            </div>
            {isEditing && (
              <div className="flex gap-3">
                <input 
                  type="text" 
                  placeholder="Add a skill..."
                  className="flex-1 p-4 bg-slate-50 dark:bg-slate-800/50 border-2 border-transparent rounded-2xl focus:border-purple-500 focus:bg-white dark:focus:bg-slate-800 transition-all font-bold text-slate-900 dark:text-white placeholder:text-slate-400"
                  value={newSkill}
                  onChange={(e) => setNewSkill(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addSkill()}
                />
                <button 
                  onClick={addSkill}
                  className="w-14 h-14 bg-purple-600 text-white rounded-2xl flex items-center justify-center hover:bg-purple-700 transition-all shadow-lg shadow-purple-200 dark:shadow-none active:scale-95"
                >
                  <Plus className="w-7 h-7" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
    )}

    {activeTab === 'education' && (
      <div className="space-y-8">
        {/* Education Section */}
      <div className="bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-sm p-8 space-y-8 transition-colors duration-300">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tighter flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400">
              <GraduationCap className="w-6 h-6" />
            </div>
            Education
          </h3>
          {isEditing && (
            <button 
              onClick={() => setShowAddEducation(true)}
              className="w-10 h-10 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-xl flex items-center justify-center hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors"
            >
              <Plus className="w-6 h-6" />
            </button>
          )}
        </div>

        <div className="grid gap-6">
          {formData.education?.map((edu, index) => (
            <div key={index} className="p-8 bg-slate-50 dark:bg-slate-800/50 rounded-[2rem] border border-slate-100 dark:border-slate-800 relative group transition-all hover:shadow-lg hover:border-blue-100 dark:hover:border-blue-900">
              {isEditing && (
                <button 
                  onClick={() => removeEducation(index)}
                  className="absolute top-6 right-6 p-2 text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              )}
              <h4 className="font-black text-slate-900 dark:text-white text-xl tracking-tight">{edu.degree} in {edu.fieldOfStudy}</h4>
              <p className="text-blue-600 dark:text-blue-400 font-black text-sm uppercase tracking-widest mt-1">{edu.school}</p>
              <div className="flex items-center justify-between mt-6">
                <p className="text-slate-400 dark:text-slate-500 text-[10px] font-black uppercase tracking-[0.2em]">
                  {edu.startDate} — {edu.endDate || 'Present'}
                </p>
                {edu.grade && (
                  <span className="px-4 py-1.5 bg-white dark:bg-slate-800 rounded-xl text-[10px] font-black text-slate-600 dark:text-slate-400 border border-slate-100 dark:border-slate-700 uppercase tracking-widest">
                    Grade: {edu.grade}
                  </span>
                )}
              </div>
            </div>
          ))}
          {formData.education?.length === 0 && !showAddEducation && (
            <div className="text-center py-12 bg-slate-50 dark:bg-slate-800/30 rounded-[2rem] border-2 border-dashed border-slate-200 dark:border-slate-800">
              <p className="text-slate-400 dark:text-slate-500 font-bold uppercase tracking-widest text-xs">No education details added yet</p>
            </div>
          )}
        </div>

        <AnimatePresence>
          {showAddEducation && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="p-6 bg-blue-50/50 rounded-2xl border border-blue-100 space-y-4 overflow-hidden"
            >
              <div className="grid md:grid-cols-2 gap-4">
                <input 
                  type="text" 
                  placeholder="School / University"
                  className="w-full p-3 bg-white rounded-xl border-none focus:ring-2 focus:ring-blue-500 font-medium"
                  value={newEducation.school}
                  onChange={(e) => setNewEducation(prev => ({ ...prev, school: e.target.value }))}
                />
                <input 
                  type="text" 
                  placeholder="Degree (e.g. B.Tech)"
                  className="w-full p-3 bg-white rounded-xl border-none focus:ring-2 focus:ring-blue-500 font-medium"
                  value={newEducation.degree}
                  onChange={(e) => setNewEducation(prev => ({ ...prev, degree: e.target.value }))}
                />
                <input 
                  type="text" 
                  placeholder="Field of Study"
                  className="w-full p-3 bg-white rounded-xl border-none focus:ring-2 focus:ring-blue-500 font-medium"
                  value={newEducation.fieldOfStudy}
                  onChange={(e) => setNewEducation(prev => ({ ...prev, fieldOfStudy: e.target.value }))}
                />
                <input 
                  type="text" 
                  placeholder="Grade / CGPA"
                  className="w-full p-3 bg-white rounded-xl border-none focus:ring-2 focus:ring-blue-500 font-medium"
                  value={newEducation.grade}
                  onChange={(e) => setNewEducation(prev => ({ ...prev, grade: e.target.value }))}
                />
                <input 
                  type="date" 
                  className="w-full p-3 bg-white rounded-xl border-none focus:ring-2 focus:ring-blue-500 font-medium"
                  value={newEducation.startDate}
                  onChange={(e) => setNewEducation(prev => ({ ...prev, startDate: e.target.value }))}
                />
                <input 
                  type="date" 
                  className="w-full p-3 bg-white rounded-xl border-none focus:ring-2 focus:ring-blue-500 font-medium"
                  value={newEducation.endDate}
                  onChange={(e) => setNewEducation(prev => ({ ...prev, endDate: e.target.value }))}
                />
              </div>
              <div className="flex gap-2 justify-end">
                <button 
                  onClick={() => setShowAddEducation(false)}
                  className="px-4 py-2 text-slate-600 font-bold"
                >
                  Cancel
                </button>
                <button 
                  onClick={addEducation}
                  className="px-6 py-2 bg-blue-600 text-white rounded-xl font-bold"
                >
                  Add Education
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
    )}

    {activeTab === 'experience' && (
      <div className="space-y-8">
        {/* Projects Section */}
        <div className="bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-sm p-8 space-y-8 transition-colors duration-300">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tighter flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                <Briefcase className="w-6 h-6" />
              </div>
              Projects
            </h3>
            {isEditing && (
              <button 
                onClick={() => setShowAddProject(true)}
                className="w-10 h-10 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-xl flex items-center justify-center hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-colors"
              >
                <Plus className="w-6 h-6" />
              </button>
            )}
          </div>

        <div className="grid gap-6">
          {formData.projects?.map((project, index) => (
            <div key={index} className="p-8 bg-slate-50 dark:bg-slate-800/50 rounded-[2rem] border border-slate-100 dark:border-slate-800 relative group transition-all hover:shadow-lg hover:border-indigo-100 dark:hover:border-indigo-900">
              {isEditing && (
                <button 
                  onClick={() => removeProject(index)}
                  className="absolute top-6 right-6 p-2 text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              )}
              <h4 className="font-black text-slate-900 dark:text-white text-xl tracking-tight">{project.title}</h4>
              <p className="text-slate-600 dark:text-slate-400 mt-3 leading-relaxed font-medium">{project.description}</p>
              {project.link && (
                <a 
                  href={project.link} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 mt-6 px-5 py-2 bg-white dark:bg-slate-800 rounded-xl text-indigo-600 dark:text-indigo-400 font-black text-xs uppercase tracking-widest border border-slate-100 dark:border-slate-700 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 transition-all"
                >
                  <ExternalLink className="w-4 h-4" />
                  View Project
                </a>
              )}
            </div>
          ))}
          {formData.projects?.length === 0 && !showAddProject && (
            <div className="text-center py-12 bg-slate-50 dark:bg-slate-800/30 rounded-[2rem] border-2 border-dashed border-slate-200 dark:border-slate-800">
              <p className="text-slate-400 dark:text-slate-500 font-bold uppercase tracking-widest text-xs">No projects added yet</p>
            </div>
          )}
        </div>

        <AnimatePresence>
          {showAddProject && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="p-8 bg-indigo-50/50 dark:bg-indigo-900/10 rounded-[2rem] border border-indigo-100 dark:border-indigo-900/30 space-y-6 overflow-hidden"
            >
              <div className="grid gap-6">
                <input 
                  type="text" 
                  placeholder="Project Title"
                  className="w-full p-4 bg-white dark:bg-slate-800 rounded-2xl border-2 border-transparent focus:border-indigo-500 transition-all font-bold text-slate-900 dark:text-white placeholder:text-slate-400"
                  value={newProject.title}
                  onChange={(e) => setNewProject(prev => ({ ...prev, title: e.target.value }))}
                />
                <textarea 
                  placeholder="Project Description"
                  className="w-full p-4 bg-white dark:bg-slate-800 rounded-2xl border-2 border-transparent focus:border-indigo-500 transition-all font-bold text-slate-900 dark:text-white h-32 resize-none placeholder:text-slate-400"
                  value={newProject.description}
                  onChange={(e) => setNewProject(prev => ({ ...prev, description: e.target.value }))}
                />
                <input 
                  type="url" 
                  placeholder="Project Link (Optional)"
                  className="w-full p-4 bg-white dark:bg-slate-800 rounded-2xl border-2 border-transparent focus:border-indigo-500 transition-all font-bold text-slate-900 dark:text-white placeholder:text-slate-400"
                  value={newProject.link}
                  onChange={(e) => setNewProject(prev => ({ ...prev, link: e.target.value }))}
                />
              </div>
              <div className="flex gap-3 justify-end">
                <button 
                  onClick={() => setShowAddProject(false)}
                  className="px-6 py-3 text-slate-500 dark:text-slate-400 font-black text-xs uppercase tracking-widest hover:text-slate-900 dark:hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={addProject}
                  className="px-8 py-3 bg-indigo-600 text-white rounded-xl font-black text-xs uppercase tracking-widest shadow-lg shadow-indigo-200 dark:shadow-none active:scale-95 transition-all"
                >
                  Add Project
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Volunteer Experience Section */}
      <div className="bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-sm p-8 space-y-8 transition-colors duration-300">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tighter flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-100 dark:bg-red-900/30 flex items-center justify-center text-red-600 dark:text-red-400">
              <Heart className="w-6 h-6" />
            </div>
            Volunteer Experience
          </h3>
          {isEditing && (
            <button 
              onClick={() => setShowAddVolunteer(true)}
              className="w-10 h-10 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-xl flex items-center justify-center hover:bg-red-100 dark:hover:bg-red-900/50 transition-colors"
            >
              <Plus className="w-6 h-6" />
            </button>
          )}
        </div>

        <div className="grid gap-6">
          {formData.volunteerExperience?.map((vol, index) => (
            <div key={index} className="p-8 bg-slate-50 dark:bg-slate-800/50 rounded-[2rem] border border-slate-100 dark:border-slate-800 relative group transition-all hover:shadow-lg hover:border-red-100 dark:hover:border-red-900">
              {isEditing && (
                <button 
                  onClick={() => setFormData(prev => ({ ...prev, volunteerExperience: prev.volunteerExperience?.filter((_, i) => i !== index) }))}
                  className="absolute top-6 right-6 p-2 text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
              <div className="flex items-center gap-6 mb-4">
                <div className="w-14 h-14 bg-white dark:bg-slate-800 rounded-2xl flex items-center justify-center text-red-600 dark:text-red-400 shadow-sm border border-slate-100 dark:border-slate-700">
                  <Heart className="w-7 h-7" />
                </div>
                <div>
                  <h4 className="font-black text-slate-900 dark:text-white text-xl tracking-tight">{vol.role}</h4>
                  <p className="text-red-600 dark:text-red-400 font-black text-sm uppercase tracking-widest">{vol.organization}</p>
                </div>
              </div>
              <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed font-medium">{vol.description}</p>
              <p className="text-slate-400 dark:text-slate-500 text-[10px] mt-6 font-black uppercase tracking-[0.2em]">
                {vol.startDate} {vol.endDate ? `— ${vol.endDate}` : '— Present'}
              </p>
            </div>
          ))}
          {formData.volunteerExperience?.length === 0 && !showAddVolunteer && (
            <div className="text-center py-12 bg-slate-50 dark:bg-slate-800/30 rounded-[2rem] border-2 border-dashed border-slate-200 dark:border-slate-800">
              <p className="text-slate-400 dark:text-slate-500 font-bold uppercase tracking-widest text-xs">No volunteer experience added yet</p>
            </div>
          )}
        </div>

        <AnimatePresence>
          {showAddVolunteer && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="p-8 bg-red-50/50 dark:bg-red-900/10 rounded-[2rem] border border-red-100 dark:border-red-900/30 space-y-6 overflow-hidden"
            >
              <div className="grid md:grid-cols-2 gap-6">
                <input 
                  type="text" 
                  placeholder="Role"
                  className="w-full p-4 bg-white dark:bg-slate-800 rounded-2xl border-2 border-transparent focus:border-red-500 transition-all font-bold text-slate-900 dark:text-white placeholder:text-slate-400"
                  value={newVolunteer.role}
                  onChange={(e) => setNewVolunteer(prev => ({ ...prev, role: e.target.value }))}
                />
                <input 
                  type="text" 
                  placeholder="Organization"
                  className="w-full p-4 bg-white dark:bg-slate-800 rounded-2xl border-2 border-transparent focus:border-red-500 transition-all font-bold text-slate-900 dark:text-white placeholder:text-slate-400"
                  value={newVolunteer.organization}
                  onChange={(e) => setNewVolunteer(prev => ({ ...prev, organization: e.target.value }))}
                />
                <textarea 
                  placeholder="Description"
                  className="w-full p-4 bg-white dark:bg-slate-800 rounded-2xl border-2 border-transparent focus:border-red-500 transition-all font-bold text-slate-900 dark:text-white md:col-span-2 h-32 resize-none placeholder:text-slate-400"
                  value={newVolunteer.description}
                  onChange={(e) => setNewVolunteer(prev => ({ ...prev, description: e.target.value }))}
                />
                <input 
                  type="date" 
                  className="w-full p-4 bg-white dark:bg-slate-800 rounded-2xl border-2 border-transparent focus:border-red-500 transition-all font-bold text-slate-900 dark:text-white"
                  value={newVolunteer.startDate}
                  onChange={(e) => setNewVolunteer(prev => ({ ...prev, startDate: e.target.value }))}
                />
                <input 
                  type="date" 
                  className="w-full p-4 bg-white dark:bg-slate-800 rounded-2xl border-2 border-transparent focus:border-red-500 transition-all font-bold text-slate-900 dark:text-white"
                  value={newVolunteer.endDate || ''}
                  onChange={(e) => setNewVolunteer(prev => ({ ...prev, endDate: e.target.value }))}
                />
              </div>
              <div className="flex gap-3 justify-end">
                <button 
                  onClick={() => setShowAddVolunteer(false)}
                  className="px-6 py-3 text-slate-500 dark:text-slate-400 font-black text-xs uppercase tracking-widest hover:text-slate-900 dark:hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={addVolunteer}
                  className="px-8 py-3 bg-red-600 text-white rounded-xl font-black text-xs uppercase tracking-widest shadow-lg shadow-red-200 dark:shadow-none active:scale-95 transition-all"
                >
                  Add Experience
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
    )}

    {activeTab === 'certifications' && (
      <div className="space-y-8">
        {/* Certifications Section */}
      <div className="bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-sm p-8 space-y-8 transition-colors duration-300">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tighter flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center text-amber-600 dark:text-amber-400">
              <Award className="w-6 h-6" />
            </div>
            Certifications
          </h3>
          {isEditing && (
            <button 
              onClick={() => setShowAddCert(true)}
              className="w-10 h-10 bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 rounded-xl flex items-center justify-center hover:bg-amber-100 dark:hover:bg-amber-900/50 transition-colors"
            >
              <Plus className="w-6 h-6" />
            </button>
          )}
        </div>

        <div className="grid gap-6">
          {formData.certifications?.map((cert, index) => (
            <div key={index} className="p-8 bg-slate-50 dark:bg-slate-800/50 rounded-[2rem] border border-slate-100 dark:border-slate-800 flex items-center gap-8 relative group transition-all hover:shadow-lg hover:border-amber-100 dark:hover:border-amber-900">
              {isEditing && (
                <button 
                  onClick={() => removeCertification(index)}
                  className="absolute top-6 right-6 p-2 text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              )}
              <div className="w-20 h-20 bg-white dark:bg-slate-800 rounded-[1.5rem] flex items-center justify-center text-amber-600 dark:text-amber-400 shrink-0 shadow-sm border border-slate-100 dark:border-slate-700">
                <Award className="w-10 h-10" />
              </div>
              <div className="flex-1">
                <h4 className="font-black text-slate-900 dark:text-white text-xl tracking-tight">{cert.name}</h4>
                <p className="text-slate-500 dark:text-slate-400 text-sm font-bold mt-1">{cert.issuer} • {cert.issueDate}</p>
                {cert.taggedEntityName && (
                  <div className="mt-3 flex items-center gap-2 text-[10px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-widest bg-blue-50 dark:bg-blue-900/20 px-3 py-1 rounded-full w-fit">
                    <ShieldCheck className="w-3 h-3" />
                    Verified by {cert.taggedEntityName}
                  </div>
                )}
                {cert.certificateData && (
                  <a 
                    href={cert.certificateData} 
                    download={`${cert.name}_certificate`}
                    className="inline-flex items-center gap-2 mt-4 text-amber-600 dark:text-amber-400 font-black text-xs uppercase tracking-widest hover:underline"
                  >
                    <FileText className="w-4 h-4" />
                    View Certificate
                  </a>
                )}
              </div>
            </div>
          ))}
          {formData.certifications?.length === 0 && !showAddCert && (
            <div className="text-center py-12 bg-slate-50 dark:bg-slate-800/30 rounded-[2rem] border-2 border-dashed border-slate-200 dark:border-slate-800">
              <p className="text-slate-400 dark:text-slate-500 font-bold uppercase tracking-widest text-xs">No certifications added yet</p>
            </div>
          )}
        </div>

        <AnimatePresence>
          {showAddCert && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="p-8 bg-amber-50/50 dark:bg-amber-900/10 rounded-[2rem] border border-amber-100 dark:border-amber-900/30 space-y-6 overflow-hidden"
            >
              <div className="grid md:grid-cols-2 gap-6">
                <input 
                  type="text" 
                  placeholder="Certification Name"
                  className="w-full p-4 bg-white dark:bg-slate-800 rounded-2xl border-2 border-transparent focus:border-amber-500 transition-all font-bold text-slate-900 dark:text-white placeholder:text-slate-400"
                  value={newCert.name}
                  onChange={(e) => setNewCert(prev => ({ ...prev, name: e.target.value }))}
                />
                <input 
                  type="text" 
                  placeholder="Issuer"
                  className="w-full p-4 bg-white dark:bg-slate-800 rounded-2xl border-2 border-transparent focus:border-amber-500 transition-all font-bold text-slate-900 dark:text-white placeholder:text-slate-400"
                  value={newCert.issuer}
                  onChange={(e) => setNewCert(prev => ({ ...prev, issuer: e.target.value }))}
                />
                <input 
                  type="date" 
                  className="w-full p-4 bg-white dark:bg-slate-800 rounded-2xl border-2 border-transparent focus:border-amber-500 transition-all font-bold text-slate-900 dark:text-white"
                  value={newCert.issueDate}
                  onChange={(e) => setNewCert(prev => ({ ...prev, issueDate: e.target.value }))}
                />
                <div className="relative">
                  <input 
                    type="file" 
                    ref={certificateInputRef}
                    onChange={handleFileUpload}
                    className="hidden"
                    accept="image/*,application/pdf"
                  />
                  <button 
                    onClick={() => certificateInputRef.current?.click()}
                    className="w-full p-4 bg-white dark:bg-slate-800 rounded-2xl border-2 border-dashed border-amber-200 dark:border-amber-900/50 text-amber-600 dark:text-amber-400 font-black text-xs uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-amber-50 dark:hover:bg-amber-900/30 transition-all"
                  >
                    <Upload className="w-5 h-5" />
                    {newCert.certificateData ? 'Certificate Uploaded' : 'Upload Certificate'}
                  </button>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-[10px] font-black text-amber-400 dark:text-amber-500 uppercase tracking-widest mb-3 ml-1">Tag Institution (College/Company/Govt)</label>
                  <select 
                    className="w-full p-4 bg-white dark:bg-slate-800 rounded-2xl border-2 border-transparent focus:border-amber-500 transition-all font-bold text-slate-900 dark:text-white"
                    value={newCert.taggedEntityId || ''}
                    onChange={(e) => {
                      const inst = institutions.find(i => i.uid === e.target.value);
                      setNewCert(prev => ({ 
                        ...prev, 
                        taggedEntityId: e.target.value,
                        taggedEntityName: inst?.name || '',
                        taggedEntityType: inst?.role as any
                      }));
                    }}
                  >
                    <option value="">No tagging</option>
                    {institutions.map(inst => (
                      <option key={inst.uid} value={inst.uid}>{inst.name} ({inst.role})</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="flex gap-3 justify-end">
                <button 
                  onClick={() => setShowAddCert(false)}
                  className="px-6 py-3 text-slate-500 dark:text-slate-400 font-black text-xs uppercase tracking-widest hover:text-slate-900 dark:hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={addCertification}
                  className="px-8 py-3 bg-amber-600 text-white rounded-xl font-black text-xs uppercase tracking-widest shadow-lg shadow-amber-200 dark:shadow-none active:scale-95 transition-all"
                >
                  Add Certification
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
    )}

    {activeTab === 'theme' && (
      <div className="bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-sm p-8 transition-colors duration-300">
        <ThemePanel />
      </div>
    )}

    {/* Security Settings */}
      {isEditing && (
        <div className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm space-y-8 transition-colors duration-300">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-5">
              <div className="w-14 h-14 bg-slate-900 dark:bg-slate-800 rounded-2xl flex items-center justify-center text-white dark:text-slate-300 shadow-lg shadow-slate-200 dark:shadow-none">
                <Lock className="w-7 h-7" />
              </div>
              <div>
                <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tighter">Security Settings</h3>
                <p className="text-slate-500 dark:text-slate-400 text-sm font-bold">Update your account password</p>
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-8 items-end">
            <div className="space-y-3">
              <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-4">New Password</label>
              <input 
                type="password" 
                placeholder="Enter new password"
                className="w-full p-5 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border-2 border-transparent focus:border-slate-900 dark:focus:border-slate-700 transition-all font-bold text-slate-900 dark:text-white placeholder:text-slate-400"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
            </div>
            <button 
              onClick={handleUpdatePassword}
              disabled={isUpdatingPassword || !newPassword}
              className="py-5 bg-slate-900 dark:bg-slate-800 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-slate-200 dark:shadow-none hover:bg-slate-800 dark:hover:bg-slate-700 transition-all disabled:opacity-50 active:scale-95"
            >
              {isUpdatingPassword ? 'Updating...' : 'Update Password'}
            </button>
          </div>
          <p className="text-[10px] text-slate-400 dark:text-slate-500 font-black uppercase tracking-widest italic px-4">
            Note: For security reasons, you may need to have recently signed in to update your password.
          </p>
        </div>
      )}

      {/* Save Button */}
      {isEditing && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-center pb-12"
        >
          <button 
            onClick={handleSave}
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 text-white px-16 py-5 rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-2xl shadow-blue-200 dark:shadow-none flex items-center gap-4 disabled:opacity-50 active:scale-95"
          >
            {loading ? (
              <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-white"></div>
            ) : (
              <>
                <Save className="w-6 h-6" />
                Save All Changes
              </>
            )}
          </button>
        </motion.div>
      )}
      {/* Resume Modal */}
      <AnimatePresence>
        {showResume && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-xl overflow-y-auto">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white dark:bg-slate-900 rounded-[3rem] w-full max-w-5xl shadow-2xl overflow-hidden relative my-8 border border-slate-100 dark:border-slate-800"
            >
              {/* Modal Header/Controls */}
              <div className="absolute top-8 right-8 flex items-center gap-3 z-20 print:hidden">
                <button 
                  onClick={() => window.print()}
                  className="p-3 bg-slate-900 dark:bg-slate-800 text-white rounded-2xl hover:bg-slate-800 dark:hover:bg-slate-700 transition-all shadow-lg active:scale-95 flex items-center gap-2 px-6 font-black text-xs uppercase tracking-widest"
                >
                  <Printer className="w-4 h-4" />
                  Print / PDF
                </button>
                <button 
                  onClick={() => setShowResume(false)}
                  className="p-3 bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-2xl hover:bg-slate-100 dark:hover:bg-slate-700 transition-all shadow-lg active:scale-95 border border-slate-100 dark:border-slate-700"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-16 space-y-16 print:p-0 print:space-y-10 bg-white dark:bg-white text-slate-900" id="resume-content">
                {/* Resume Header */}
                <div className="border-b-8 border-slate-900 pb-12 flex justify-between items-end">
                  <div className="space-y-4">
                    <h1 className="text-6xl font-black text-slate-900 tracking-tighter uppercase leading-none">{user.name}</h1>
                    <div className="flex flex-wrap gap-6 text-slate-500 font-bold text-sm">
                      <span className="flex items-center gap-2"><Mail className="w-4 h-4 text-slate-900" /> {user.email}</span>
                      {user.mobileNo && <span className="flex items-center gap-2"><Phone className="w-4 h-4 text-slate-900" /> {user.mobileNo}</span>}
                      {user.college && <span className="flex items-center gap-2"><GraduationCap className="w-4 h-4 text-slate-900" /> {user.college}</span>}
                    </div>
                  </div>
                  <div className="text-right hidden sm:block">
                    <div className="bg-slate-900 text-white px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-[0.3em] inline-block mb-3">
                      Professional Dossier
                    </div>
                    <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">Generated via oledge.app</p>
                  </div>
                </div>

                {/* Summary */}
                {user.summary && (
                  <div className="space-y-4">
                    <h2 className="text-xs font-black text-slate-900 uppercase tracking-[0.4em] border-b-2 border-slate-100 pb-2 w-fit">Professional Summary</h2>
                    <p className="text-slate-700 leading-relaxed font-medium text-lg max-w-4xl">{user.summary}</p>
                  </div>
                )}

                <div className="grid md:grid-cols-12 gap-16">
                  <div className="md:col-span-8 space-y-16">
                    {/* Experience / Projects */}
                    <div className="space-y-8">
                      <h2 className="text-xs font-black text-slate-900 uppercase tracking-[0.4em] border-b-2 border-slate-100 pb-2 w-fit">Key Projects & Initiatives</h2>
                      <div className="space-y-10">
                        {user.projects?.map((project, i) => (
                          <div key={i} className="space-y-3 group">
                            <div className="flex items-center justify-between">
                              <h3 className="font-black text-slate-900 text-2xl tracking-tight">{project.title}</h3>
                              {project.link && <span className="text-blue-600 text-[10px] font-black uppercase tracking-widest">{project.link}</span>}
                            </div>
                            <p className="text-slate-600 text-base leading-relaxed font-medium">{project.description}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Volunteer */}
                    {user.volunteerExperience && user.volunteerExperience.length > 0 && (
                      <div className="space-y-8">
                        <h2 className="text-xs font-black text-slate-900 uppercase tracking-[0.4em] border-b-2 border-slate-100 pb-2 w-fit">Volunteer Experience</h2>
                        <div className="space-y-10">
                          {user.volunteerExperience.map((vol, i) => (
                            <div key={i} className="space-y-3">
                              <div className="flex items-center justify-between">
                                <h3 className="font-black text-slate-900 text-xl tracking-tight">{vol.role}</h3>
                                <span className="text-slate-400 text-[10px] font-black uppercase tracking-widest">{vol.startDate} — {vol.endDate || 'Present'}</span>
                              </div>
                              <p className="text-red-600 font-black text-xs uppercase tracking-widest">{vol.organization}</p>
                              <p className="text-slate-600 text-base leading-relaxed font-medium">{vol.description}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="md:col-span-4 space-y-16">
                    {/* Education */}
                    <div className="space-y-8">
                      <h2 className="text-xs font-black text-slate-900 uppercase tracking-[0.4em] border-b-2 border-slate-100 pb-2 w-fit">Education</h2>
                      <div className="space-y-8">
                        {user.education?.map((edu, i) => (
                          <div key={i} className="space-y-2">
                            <h3 className="font-black text-slate-900 text-lg leading-tight">{edu.degree}</h3>
                            <p className="text-blue-600 font-black text-xs uppercase tracking-widest">{edu.school}</p>
                            <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">{edu.startDate} — {edu.endDate || 'Present'}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Skills */}
                    <div className="space-y-8">
                      <h2 className="text-xs font-black text-slate-900 uppercase tracking-[0.4em] border-b-2 border-slate-100 pb-2 w-fit">Core Expertise</h2>
                      <div className="flex flex-wrap gap-3">
                        {user.skills?.map(skill => (
                          <span key={skill} className="px-4 py-2 bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest rounded-lg">
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Certifications */}
                    <div className="space-y-8">
                      <h2 className="text-xs font-black text-slate-900 uppercase tracking-[0.4em] border-b-2 border-slate-100 pb-2 w-fit">Certifications</h2>
                      <div className="space-y-6">
                        {user.certifications?.map((cert, i) => (
                          <div key={i} className="space-y-2">
                            <h3 className="font-black text-slate-900 text-sm leading-tight">{cert.name}</h3>
                            <p className="text-amber-600 font-black text-[10px] uppercase tracking-widest">{cert.issuer}</p>
                            <p className="text-slate-400 text-[10px] font-bold">{cert.issueDate}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Footer */}
                <div className="pt-16 border-t border-slate-100 flex justify-between items-center text-slate-400 text-[10px] font-black uppercase tracking-[0.3em]">
                  <span>© {new Date().getFullYear()} {user.name}</span>
                  <span>Confidential Professional Document</span>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
