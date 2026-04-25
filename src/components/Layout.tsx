import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Briefcase, 
  Code, 
  MapPin, 
  Zap, 
  BookOpen, 
  Calendar as CalendarIcon, 
  User, 
  LogOut,
  Menu,
  X,
  ShieldCheck,
  Megaphone,
  GraduationCap,
  Clock,
  Users,
  Video,
  Sparkles,
  Globe,
  Sun,
  Moon,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { auth } from '../firebase';
import { User as UserType } from '../types';
import { cn } from '../lib/utils';
import { useTheme } from '../context/ThemeContext';
import Logo from './Logo';

interface LayoutProps {
  user: UserType;
}

export default function Layout({ user }: LayoutProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { theme, updateTheme } = useTheme();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  const isDarkMode = theme.darkMode;
  const toggleDarkMode = () => updateTheme({ darkMode: !isDarkMode });

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleLogout = async () => {
    await auth.signOut();
    navigate('/');
  };

  const navItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Notice Board', path: '/noticeboard', icon: Megaphone },
    { 
      name: 'Opportunities', 
      path: '/opportunities', 
      icon: Briefcase,
      subItems: [
        { name: 'Internships', path: '/internships' },
        { name: 'Apprenticeships', path: '/apprenticeships' },
        { name: 'Jobs', path: '/jobs' },
        { name: 'Freelance', path: '/freelance' },
      ]
    },
    { 
      name: 'Events', 
      path: '/events', 
      icon: Sparkles,
      subItems: [
        { name: 'Job Fairs', path: '/jobfairs' },
        { name: 'Walk-ins', path: '/walkins' },
        { name: 'Hackathons', path: '/hackathons' },
        { name: 'Seminars', path: '/seminars' },
        { name: 'Quizzes', path: '/quizzes' },
      ]
    },
    { name: 'Forum', path: '/forum', icon: Globe },
    { name: 'Campus Friends', path: '/friends', icon: Users },
    { name: 'e-Library', path: '/library', icon: BookOpen },
    { name: 'Academic Calendar', path: '/calendar', icon: CalendarIcon },
    { name: 'Profile', path: '/profile', icon: User },
  ];

  const mobileBottomNav = [
    { name: 'Home', path: '/', icon: LayoutDashboard },
    { name: 'Notices', path: '/noticeboard', icon: Megaphone },
    { name: 'Events', path: '/events', icon: Sparkles },
    { name: 'Forum', path: '/forum', icon: Globe },
    { name: 'Profile', path: '/profile', icon: User },
  ];

  if (user.role === 'admin') {
    navItems.push({ name: 'Admin', path: '/admin', icon: ShieldCheck });
  }

  return (
    <div className="min-h-screen bg-white flex flex-col md:flex-row transition-colors duration-300">
      {/* Sidebar for Desktop */}
      <aside className={cn(
        "hidden md:flex flex-col bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 sticky top-0 h-screen transition-all duration-300 relative group",
        isSidebarCollapsed ? "w-24" : "w-64"
      )}>
        {/* Collapse Toggle Button */}
        <button
          onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          className="absolute -right-3 top-24 w-6 h-6 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-full flex items-center justify-center text-slate-400 hover:text-blue-600 shadow-sm z-50 transition-all opacity-0 group-hover:opacity-100"
        >
          {isSidebarCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>

        <div className={cn("p-8 transition-all", isSidebarCollapsed ? "px-4" : "px-8")}>
          <Link to="/" className="flex items-center gap-3 group">
            <Logo size="sm" showText={!isSidebarCollapsed} className="flex-row gap-3" tagline={isSidebarCollapsed ? "" : "Growth"} />
          </Link>
        </div>

        <nav className="flex-1 px-4 space-y-1 overflow-y-auto custom-scrollbar">
          {navItems.map((item) => (
            <div key={item.path} className="space-y-1">
              <Link
                to={item.path}
                title={isSidebarCollapsed ? item.name : ""}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-all duration-200",
                  location.pathname === item.path
                    ? "bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400"
                    : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white",
                  isSidebarCollapsed && "justify-center px-0 h-10 w-10 mx-auto"
                )}
              >
                <item.icon className="w-5 h-5 shrink-0" />
                {!isSidebarCollapsed && <span>{item.name}</span>}
              </Link>
              {item.subItems && !isSidebarCollapsed && (
                <div className="ml-8 space-y-1">
                  {item.subItems.map((sub) => (
                    <Link
                      key={sub.path}
                      to={sub.path}
                      className={cn(
                        "block px-3 py-1.5 rounded-lg text-xs font-bold transition-all",
                        location.pathname === sub.path
                          ? "text-blue-600 bg-blue-50/50"
                          : "text-slate-400 hover:text-slate-900 hover:bg-slate-50 shadow-none"
                      )}
                    >
                      {sub.name}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}
        </nav>

        <div className={cn("p-4 border-t border-slate-200 dark:border-slate-800 space-y-4", isSidebarCollapsed && "px-2")}>
          <button
            type="button"
            onClick={toggleDarkMode}
            title={isSidebarCollapsed ? (isDarkMode ? "Light Mode" : "Dark Mode") : ""}
            className={cn(
              "flex items-center gap-3 w-full px-3 py-2 text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white rounded-lg transition-colors",
              isSidebarCollapsed && "justify-center px-0 h-10 w-10 mx-auto"
            )}
          >
            {isDarkMode ? (
              <Sun className="w-5 h-5 text-amber-500 shrink-0" />
            ) : (
              <Moon className="w-5 h-5 text-indigo-600 shrink-0" />
            )}
            {!isSidebarCollapsed && (isDarkMode ? "Light Mode" : "Dark Mode")}
          </button>

          <div className={cn(
            "flex items-center bg-blue-50/50 dark:bg-blue-900/20 rounded-2xl border border-blue-100/50 dark:border-blue-800/50 transition-all",
            isSidebarCollapsed ? "p-1 justify-center" : "gap-3 px-3 py-4"
          )}>
            <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-blue-600 dark:text-blue-400 border-2 border-white dark:border-slate-800 shadow-sm overflow-hidden shrink-0">
              {user.photoURL ? (
                <img 
                  src={user.photoURL} 
                  alt={user.name} 
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <User className="w-5 h-5" />
              )}
            </div>
            {!isSidebarCollapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-xs font-black text-slate-900 dark:text-white truncate">{user.name}</p>
                <p className="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-widest truncate">{user.role}</p>
              </div>
            )}
          </div>
          
          {!isSidebarCollapsed && (
            <div className="px-3 py-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-3 text-slate-400 dark:text-slate-500 mb-1">
                <Clock className="w-4 h-4" />
                <span className="text-[10px] font-black uppercase tracking-widest">Live Time</span>
              </div>
              <p className="text-lg font-black text-slate-900 dark:text-white leading-none">
                {currentTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })}
              </p>
              <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 mt-1">
                {currentTime.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </p>
            </div>
          )}
          
          <button
            onClick={handleLogout}
            title={isSidebarCollapsed ? "Logout" : ""}
            className={cn(
              "flex items-center gap-3 w-full px-3 py-2 text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-red-50 dark:hover:bg-red-900/30 hover:text-red-600 dark:hover:text-red-400 rounded-lg transition-colors",
              isSidebarCollapsed && "justify-center px-0 h-10 w-10 mx-auto"
            )}
          >
            <LogOut className="w-5 h-5 shrink-0" />
            {!isSidebarCollapsed && "Logout"}
          </button>
        </div>
      </aside>

      {/* Mobile Header */}
      <header className="md:hidden bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 p-4 flex items-center justify-between sticky top-0 z-50 transition-colors duration-300">
        <Link to="/" className="flex items-center gap-2">
          <Logo size="sm" showText={true} className="flex-row gap-2" tagline="Growth" />
        </Link>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={toggleDarkMode}
            className="p-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
          >
            {isDarkMode ? <Sun className="w-5 h-5 text-amber-500" /> : <Moon className="w-5 h-5 text-indigo-600" />}
          </button>
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-40 bg-white dark:bg-slate-900 pt-20 px-6 transition-colors duration-300 overflow-y-auto">
          <div className="grid grid-cols-2 gap-4 mb-8">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setIsMobileMenuOpen(false)}
                className={cn(
                  "flex flex-col items-center justify-center gap-3 p-4 rounded-2xl border transition-all duration-200",
                  location.pathname === item.path
                    ? "bg-blue-50 dark:bg-blue-900/30 border-blue-100 dark:border-blue-800 text-blue-600 dark:text-blue-400"
                    : "bg-slate-50 dark:bg-slate-800/50 border-slate-100 dark:border-slate-700 text-slate-600 dark:text-slate-400"
                )}
              >
                <item.icon className="w-6 h-6" />
                <span className="text-xs font-bold uppercase tracking-widest">{item.name}</span>
              </Link>
            ))}
          </div>
          
          <div className="p-6 bg-slate-50 dark:bg-slate-800/50 rounded-3xl border border-slate-100 dark:border-slate-800 mb-8">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-14 h-14 rounded-2xl bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-blue-600 dark:text-blue-400 border-2 border-white dark:border-slate-800 shadow-sm overflow-hidden">
                {user.photoURL ? (
                  <img src={user.photoURL} alt={user.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                ) : (
                  <User className="w-7 h-7" />
                )}
              </div>
              <div>
                <p className="text-lg font-black text-slate-900 dark:text-white leading-none">{user.name}</p>
                <p className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-widest mt-1">{user.role}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center justify-center gap-3 w-full p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-2xl font-black text-sm transition-colors"
            >
              <LogOut className="w-5 h-5" />
              LOGOUT ACCOUNT
            </button>
          </div>
        </div>
      )}

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-lg border-t border-slate-200 dark:border-slate-800 px-6 py-3 flex items-center justify-between transition-colors duration-300">
        {mobileBottomNav.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={cn(
              "flex flex-col items-center gap-1 transition-all duration-200",
              location.pathname === item.path
                ? "text-blue-600 dark:text-blue-400 scale-110"
                : "text-slate-400 dark:text-slate-500"
            )}
          >
            <item.icon className={cn("w-6 h-6", location.pathname === item.path ? "stroke-[2.5px]" : "stroke-[2px]")} />
            <span className="text-[10px] font-black uppercase tracking-tighter">{item.name}</span>
          </Link>
        ))}
      </nav>

      {/* Main Content */}
      <main 
        id="main-content-area"
        className="flex-1 p-4 md:p-8 pb-24 md:pb-8 overflow-x-hidden flex flex-col min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-300"
      >
        <div className="flex-1">
          <Outlet />
        </div>
        
        {/* Footer */}
        <footer className="mt-12 pt-8 border-t border-slate-200 dark:border-slate-800">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-slate-400 dark:text-slate-500 font-bold uppercase tracking-widest text-[10px]">
            <div className="flex items-center gap-6">
              <Link to="/about" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">About oledge</Link>
              <Link to="/privacy" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Privacy Policy</Link>
            </div>
            <p>© 2026 Oledge Group Pvt Ltd. All rights reserved.</p>
          </div>
        </footer>
      </main>
    </div>
  );
}
