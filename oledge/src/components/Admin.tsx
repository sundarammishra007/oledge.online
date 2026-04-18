import { useState, useEffect } from 'react';
import { collection, query, getDocs, orderBy, limit, doc, updateDoc } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { User, Internship, Hackathon } from '../types';
import { motion } from 'framer-motion';
import { 
  ShieldCheck, 
  Users, 
  Briefcase, 
  Code, 
  CheckCircle2, 
  XCircle, 
  AlertCircle,
  ArrowRight
} from 'lucide-react';
import { cn } from '../lib/utils';

interface AdminProps {
  user: User;
}

export default function Admin({ user }: AdminProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'users' | 'listings'>('users');

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const q = query(collection(db, 'users'), limit(50));
        const snapshot = await getDocs(q);
        const data = snapshot.docs.map(doc => ({ uid: doc.id, ...doc.data() } as User));
        setUsers(data);
      } catch (error) {
        handleFirestoreError(error, OperationType.LIST, 'users');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleVerify = async (userId: string, status: boolean) => {
    try {
      await updateDoc(doc(db, 'users', userId), { isVerified: status });
      setUsers(prev => prev.map(u => u.uid === userId ? { ...u, isVerified: status } : u));
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `users/${userId}`);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-slate-900 tracking-tight flex items-center gap-3">
            <ShieldCheck className="w-10 h-10 text-blue-600" />
            Admin Dashboard
          </h2>
          <p className="text-slate-500 font-medium mt-1 uppercase tracking-wider text-xs">Manage the oledge ecosystem</p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
          <Users className="w-8 h-8 text-blue-500 mb-2" />
          <h4 className="text-sm font-bold text-slate-500 uppercase tracking-widest">Total Users</h4>
          <p className="text-3xl font-black text-slate-900 mt-1">{users.length}</p>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
          <Briefcase className="w-8 h-8 text-green-500 mb-2" />
          <h4 className="text-sm font-bold text-slate-500 uppercase tracking-widest">Active Jobs</h4>
          <p className="text-3xl font-black text-slate-900 mt-1">24</p>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
          <Code className="w-8 h-8 text-purple-500 mb-2" />
          <h4 className="text-sm font-bold text-slate-500 uppercase tracking-widest">Hackathons</h4>
          <p className="text-3xl font-black text-slate-900 mt-1">12</p>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
          <AlertCircle className="w-8 h-8 text-orange-500 mb-2" />
          <h4 className="text-sm font-bold text-slate-500 uppercase tracking-widest">Pending Verification</h4>
          <p className="text-3xl font-black text-slate-900 mt-1">
            {users.filter(u => (u.role === 'college' || u.role === 'company' || u.role === 'govt') && !u.isVerified).length}
          </p>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="flex border-b border-slate-100">
          <button 
            onClick={() => setActiveTab('users')}
            className={cn(
              "px-8 py-4 font-bold text-sm transition-all",
              activeTab === 'users' ? "text-blue-600 border-b-2 border-blue-600 bg-blue-50/50" : "text-slate-500 hover:bg-slate-50"
            )}
          >
            User Management
          </button>
          <button 
            onClick={() => setActiveTab('listings')}
            className={cn(
              "px-8 py-4 font-bold text-sm transition-all",
              activeTab === 'listings' ? "text-blue-600 border-b-2 border-blue-600 bg-blue-50/50" : "text-slate-500 hover:bg-slate-50"
            )}
          >
            Listing Moderation
          </button>
        </div>

        <div className="p-8">
          {activeTab === 'users' ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="text-xs font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">
                    <th className="pb-4 px-4">User</th>
                    <th className="pb-4 px-4">Role</th>
                    <th className="pb-4 px-4">Status</th>
                    <th className="pb-4 px-4">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u.uid} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center text-slate-600 font-bold">
                            {u.name.charAt(0)}
                          </div>
                          <div>
                            <p className="font-bold text-slate-900">{u.name}</p>
                            <p className="text-xs text-slate-500">{u.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <span className="px-3 py-1 bg-slate-100 text-slate-600 text-[10px] font-black uppercase tracking-widest rounded-full">
                          {u.role}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        {u.isVerified ? (
                          <span className="flex items-center gap-1 text-green-600 text-xs font-bold">
                            <CheckCircle2 className="w-4 h-4" /> Verified
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-orange-600 text-xs font-bold">
                            <AlertCircle className="w-4 h-4" /> Pending
                          </span>
                        )}
                      </td>
                      <td className="py-4 px-4">
                        {(u.role === 'college' || u.role === 'company' || u.role === 'govt') && (
                          <button 
                            onClick={() => handleVerify(u.uid, !u.isVerified)}
                            className={cn(
                              "px-4 py-2 rounded-xl text-xs font-bold transition-all",
                              u.isVerified ? "bg-red-50 text-red-600 hover:bg-red-100" : "bg-green-50 text-green-600 hover:bg-green-100"
                            )}
                          >
                            {u.isVerified ? 'Revoke' : 'Approve'}
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-20">
              <AlertCircle className="w-16 h-16 text-slate-200 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-slate-900">No pending listings</h3>
              <p className="text-slate-500 mt-1">All internships and hackathons are moderated</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
