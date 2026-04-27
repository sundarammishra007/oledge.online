import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  collection, 
  query, 
  where, 
  getDocs, 
  addDoc, 
  updateDoc, 
  doc, 
  getDoc,
  onSnapshot,
  or,
  and,
  limit,
  serverTimestamp
} from "firebase/firestore";
import { db } from "../lib/firebase";
import { useAuth } from "../hooks/useAuth";
import { UserProfile, Peership } from "../types";
import { Layout } from "../components/Layout";
import { 
  UserPlus, 
  UserCheck, 
  UserX, 
  Search, 
  Users, 
  Clock, 
  Check, 
  MessageSquare,
  ShieldCheck,
  ChevronRight,
  GraduationCap
} from "lucide-react";
import { cn } from "../lib/utils";
import { toast } from "sonner";

export const CircleConnects: React.FC = () => {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [discoverUsers, setDiscoverUsers] = useState<UserProfile[]>([]);
  const [Peerships, setPeerships] = useState<Peership[]>([]);
  const [friendProfiles, setFriendProfiles] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (!user) return;

    // Fetch Peerships involving the current user
    const qF = query(
      collection(db, "Peerships"), 
      where("userIds", "array-contains", user.uid)
    );
    
    const unsubscribeF = onSnapshot(qF, (snapshot) => {
      setPeerships(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Peership)));
    });

    // Fetch some users to discover (excluding self)
    const fetchDiscovery = async () => {
      const qU = query(collection(db, "users"), limit(20));
      const snapshot = await getDocs(qU);
      setDiscoverUsers(snapshot.docs
        .map(doc => doc.data() as UserProfile)
        .filter(u => u.uid !== user.uid && u.role === "student")
      );
      setLoading(false);
    };

    fetchDiscovery();
    return () => unsubscribeF();
  }, [user]);

  useEffect(() => {
    const fetchFriendProfiles = async () => {
      const accepted = Peerships.filter(f => f.status === "accepted");
      const uids = accepted.map(f => f.userIds.find(id => id !== user?.uid)).filter(Boolean) as string[];
      
      if (uids.length === 0) {
        setFriendProfiles([]);
        return;
      }

      const profiles: UserProfile[] = [];
      for (const uid of uids) {
        const docRef = doc(db, "users", uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          profiles.push({ uid: docSnap.id, ...docSnap.data() } as UserProfile);
        }
      }
      setFriendProfiles(profiles);
    };

    if (Peerships.length > 0) fetchFriendProfiles();
  }, [Peerships, user]);

  const getPeershipWith = (otherUid: string) => {
    return Peerships.find(f => f.userIds.includes(otherUid));
  };

  const sendFriendRequest = async (targetUser: UserProfile) => {
    if (!user || !profile) return;
    try {
      await addDoc(collection(db, "Peerships"), {
        userIds: [user.uid, targetUser.uid].sort(),
        status: "pending",
        requesterId: user.uid,
        updatedAt: new Date().toISOString()
      });
      toast.success(`Request sent to ${targetUser.displayName}`);
    } catch (err: any) {
      toast.error("Failed to send request");
    }
  };

  const respondToRequest = async (PeershipId: string, accept: boolean) => {
    try {
      const fRef = doc(db, "Peerships", PeershipId);
      if (accept) {
        await updateDoc(fRef, { status: "accepted", updatedAt: new Date().toISOString() });
        toast.success("Connection accepted!");
      } else {
        // Just delete for rejection
        toast("Request declined");
      }
    } catch (err: any) {
      toast.error("Failed to update status");
    }
  };

  const startChat = async (otherUid: string) => {
    if (!user) return;
    try {
      // Check if chat already exists
      const q = query(
        collection(db, "chats"),
        where("participantIds", "array-contains", user.uid)
      );
      const snapshot = await getDocs(q);
      const existingChat = snapshot.docs.find(doc => 
        (doc.data().participantIds as string[]).includes(otherUid)
      );

      if (existingChat) {
        navigate("/messages");
      } else {
        await addDoc(collection(db, "chats"), {
          participantIds: [user.uid, otherUid].sort(),
          updatedAt: serverTimestamp(),
          createdAt: serverTimestamp()
        });
        navigate("/messages");
      }
    } catch (err) {
      console.error("Error starting chat:", err);
      toast.error("Could not start chat");
    }
  };

  const incomingRequests = Peerships.filter(f => f.status === "pending" && f.requesterId !== user?.uid);
  const myPeers = Peerships.filter(f => f.status === "accepted");

  return (
    <Layout>
      <div className="space-y-8">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Campus Peers</h1>
            <p className="text-slate-500 mt-1">Connect with fellow students and build your network.</p>
          </div>
          <div className="bg-blue-600 text-white px-5 py-2.5 rounded-2xl font-bold flex items-center gap-2 shadow-lg shadow-blue-200">
            <Users size={18} />
            <span>{myPeers.length} Connections</span>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            {/* Incoming Requests */}
            {incomingRequests.length > 0 && (
              <section className="bg-white rounded-3xl p-6 border border-blue-100 shadow-sm shadow-blue-50">
                <h2 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
                  <Clock className="text-blue-600" size={20} /> Pending Requests
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {incomingRequests.map((req) => {
                    const otherId = req.userIds.find(id => id !== user?.uid);
                    const userData = discoverUsers.find(u => u.uid === otherId);
                    return (
                      <div key={req.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center font-bold text-slate-400 border border-slate-200">
                            {userData?.displayName?.[0] || "?"}
                          </div>
                          <div>
                            <p className="text-sm font-bold text-slate-900">{userData?.displayName || "New Peer"}</p>
                            <p className="text-[10px] text-blue-600 font-bold uppercase">Incoming</p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button 
                            onClick={() => respondToRequest(req.id, true)}
                            className="w-8 h-8 bg-blue-600 text-white rounded-lg flex items-center justify-center shadow-md shadow-blue-100 hover:bg-blue-700 transition-all"
                          >
                            <Check size={16} strokeWidth={3} />
                          </button>
                          <button 
                            className="w-8 h-8 bg-white border border-slate-200 text-slate-400 rounded-lg flex items-center justify-center hover:text-red-500 transition-all"
                          >
                            <UserX size={16} />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            )}

            {/* Discovery Section */}
            <section className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <h2 className="text-xl font-bold text-slate-900">Discover Peers</h2>
                <div className="relative w-full sm:w-64">
                  <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input 
                    type="text" 
                    placeholder="Search by name..."
                    className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-2xl text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {loading ? (
                  [1, 2, 4, 6].map(i => <div key={i} className="h-32 bg-slate-100 animate-pulse rounded-3xl" />)
                ) : (
                  discoverUsers.map((targetUser) => {
                    const Peership = getPeershipWith(targetUser.uid);
                    return (
                      <div key={targetUser.uid} className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-all group">
                        <div className="flex items-center gap-4 mb-4">
                          <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center border border-slate-50 overflow-hidden shadow-inner group-hover:bg-blue-50 transition-colors">
                             {targetUser.photoURL ? (
                               <img src={targetUser.photoURL} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                             ) : (
                               <Users size={24} className="text-slate-300 group-hover:text-blue-400" />
                             )}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-1.5">
                              <h4 className="font-bold text-slate-900">{targetUser.displayName}</h4>
                              <ShieldCheck size={14} className="text-blue-600" />
                            </div>
                            <p className="text-xs text-slate-500 font-medium line-clamp-1">
                              {targetUser.studentData?.college || "Global Student"}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                          <div className="flex items-center gap-1">
                             <GraduationCap size={14} className="text-slate-400" />
                             <span className="text-[10px] text-slate-500 font-bold uppercase tracking-tight truncate max-w-[80px]">
                               {targetUser.studentData?.branch || "Student"}
                             </span>
                          </div>
                          
                          {Peership ? (
                            Peership.status === "accepted" ? (
                              <button 
                                onClick={() => startChat(targetUser.uid)}
                                className="flex items-center gap-1.5 px-4 py-2 bg-emerald-50 text-emerald-600 rounded-xl text-xs font-bold hover:bg-emerald-100 transition-all"
                              >
                                <MessageSquare size={16} /> Chat
                              </button>
                            ) : (
                              <button className="flex items-center gap-1.5 px-4 py-2 bg-slate-50 text-slate-400 rounded-xl text-xs font-bold transition-all cursor-default">
                                <Clock size={16} /> Pending
                              </button>
                            )
                          ) : (
                            <button 
                              onClick={() => sendFriendRequest(targetUser)}
                              className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-700 transition-all shadow-md shadow-blue-100"
                            >
                              <UserPlus size={16} /> Add Friend
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </section>
          </div>

          <aside className="space-y-8">
             <div className="bg-gradient-to-br from-indigo-600 to-blue-700 p-8 rounded-3xl text-white shadow-xl shadow-blue-200 overflow-hidden relative">
                <div className="relative z-10">
                  <h3 className="text-xl font-bold">Build Your Network</h3>
                  <p className="text-blue-100 text-sm mt-3 mb-6">Connecting with seniors and peers leads to 3x more internship referrals.</p>
                  <div className="flex -space-x-3 mb-6">
                    {[1,2,3,4].map(i => (
                      <div key={i} className="w-10 h-10 rounded-full border-2 border-indigo-400 bg-white overflow-hidden">
                        <img src={`https://picsum.photos/seed/peer${i}/100/100`} alt="" referrerPolicy="no-referrer" />
                      </div>
                    ))}
                    <div className="w-10 h-10 rounded-full border-2 border-indigo-400 bg-indigo-500 flex items-center justify-center text-[10px] font-bold">
                      +42
                    </div>
                  </div>
                </div>
                <div className="absolute -right-8 -bottom-8 opacity-20 rotate-12">
                   <Users size={180} />
                </div>
             </div>

             <section className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm">
                <h3 className="font-bold text-slate-900 mb-4">My Connections</h3>
                <div className="space-y-4">
                  {friendProfiles.length > 0 ? (
                    friendProfiles.map((friend) => (
                      <div 
                        key={friend.uid} 
                        onClick={() => startChat(friend.uid)}
                        className="flex items-center justify-between p-3 rounded-2xl hover:bg-slate-50 transition-all group cursor-pointer"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center font-bold text-blue-600 overflow-hidden">
                             {friend.photoURL ? (
                               <img src={friend.photoURL} alt="" className="w-full h-full object-cover" />
                             ) : (
                               friend.displayName[0]
                             )}
                          </div>
                          <div>
                            <p className="text-sm font-bold text-slate-900">{friend.displayName}</p>
                            <p className="text-[10px] text-emerald-500 font-bold uppercase truncate max-w-[100px]">{friend.studentData?.branch || "Student"}</p>
                          </div>
                        </div>
                        <MessageSquare size={18} className="text-slate-300 group-hover:text-blue-600 transition-colors" />
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-6 opacity-50">
                      <p className="text-xs font-medium">No connection profiles found.</p>
                    </div>
                  )}
                </div>
                <button className="w-full mt-6 text-blue-600 text-xs font-bold flex items-center justify-center gap-1 hover:underline">
                  Manage Network <ChevronRight size={14} />
                </button>
             </section>
          </aside>
        </div>
      </div>
    </Layout>
  );
};
