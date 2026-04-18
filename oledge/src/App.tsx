import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { auth, db } from './firebase';
import { ThemeProvider } from './context/ThemeContext';
import Layout from './components/Layout';
import Auth from './components/Auth';
import Dashboard from './components/Dashboard';
import Internships from './components/Internships';
import Hackathons from './components/Hackathons';
import JobFairs from './components/JobFairs';
import Freelance from './components/Freelance';
import Library from './components/Library';
import Calendar from './components/Calendar';
import Profile from './components/Profile';
import Admin from './components/Admin';
import Apprenticeships from './components/Apprenticeships';
import NoticeBoard from './components/NoticeBoard';
import Forum from './components/Forum';
import Events from './components/Events';
import CampusFriends from './components/CampusFriends';
import Seminars from './components/Seminars';
import About from './components/About';
import PrivacyPolicy from './components/PrivacyPolicy';
import { User } from './types';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
        if (userDoc.exists()) {
          setUser(userDoc.data() as User);
        } else {
          // New user, redirect to role selection/profile setup
          setUser({
            uid: firebaseUser.uid,
            email: firebaseUser.email || '',
            name: firebaseUser.displayName || '',
            role: 'student', // Default
          } as User);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <ThemeProvider>
      <Router>
        <Routes>
          {!user ? (
            <Route path="*" element={<Auth />} />
          ) : (
            <Route element={<Layout user={user} />}>
              <Route path="/" element={<Dashboard user={user} />} />
              <Route path="/internships" element={<Internships user={user} />} />
              <Route path="/hackathons" element={<Hackathons user={user} />} />
              <Route path="/jobfairs" element={<JobFairs user={user} />} />
              <Route path="/freelance" element={<Freelance user={user} />} />
              <Route path="/library" element={<Library user={user} />} />
              <Route path="/calendar" element={<Calendar user={user} />} />
              <Route path="/apprenticeships" element={<Apprenticeships user={user} />} />
              <Route path="/noticeboard" element={<NoticeBoard user={user} />} />
              <Route path="/forum" element={<Forum user={user} />} />
              <Route path="/events" element={<Events user={user} />} />
              <Route path="/friends" element={<CampusFriends user={user} />} />
              <Route path="/seminars" element={<Seminars user={user} />} />
              <Route path="/about" element={<About />} />
              <Route path="/privacy" element={<PrivacyPolicy />} />
              <Route path="/profile" element={<Profile user={user} />} />
              {user.role === 'admin' && <Route path="/admin" element={<Admin user={user} />} />}
              <Route path="*" element={<Navigate to="/" />} />
            </Route>
          )}
        </Routes>
      </Router>
    </ThemeProvider>
  );
}
