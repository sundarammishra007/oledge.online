import { useState, useEffect } from 'react';
import { 
  collection, 
  query, 
  where, 
  getDocs, 
  addDoc, 
  updateDoc, 
  doc, 
  serverTimestamp, 
  onSnapshot,
  arrayUnion,
  deleteDoc,
  orderBy,
  limit
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { User, FriendRequest } from '../types';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  UserPlus, 
  Users, 
  Search, 
  Check, 
  X, 
  User as UserIcon,
  MessageCircle,
  UserCheck,
  Clock,
  ArrowLeft
} from 'lucide-react';
import { cn } from '../lib/utils';
import ChatComponent from './Chat';

interface CircleFriendsProps {
  user: User;
}

export default function CircleFriends({ user }: CircleFriendsProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [pendingRequests, setPendingRequests] = useState<FriendRequest[]>([]);
  const [friends, setFriends] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);

  useEffect(() => {
    // Listen for incoming friend requests
    const q = query(
      collection(db, 'friend_requests'),
      where('receiverId', '==', user.uid),
      where('status', '==', 'pending')
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setPendingRequests(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as FriendRequest)));
    });
    return () => unsubscribe();
  }, [user.uid]);

  useEffect(() => {
    // Fetch friends details
    const fetchFriends = async () => {
      if (!user.friends || user.friends.length === 0) {
        setFriends([]);
        return;
      }
      try {
        const q = query(collection(db, 'users'), where('uid', 'in', user.friends));
        const snapshot = await getDocs(q);
        setFriends(snapshot.docs.map(doc => doc.data() as User));
      } catch (error) {
        console.error('Error fetching friends:', error);
      }
    };
    fetchFriends();
  }, [user.friends]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setLoading(true);
    try {
      const q = query(
        collection(db, 'users'),
        where('name', '>=', searchQuery),
        where('name', '<=', searchQuery + '\uf8ff')
      );
      const snapshot = await getDocs(q);
      const results = snapshot.docs
        .map(doc => doc.data() as User)
        .filter(u => u.uid !== user.uid && !user.friends?.includes(u.uid));
      setSearchResults(results);
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, 'users');
    } finally {
      setLoading(false);
    }
  };

  const sendFriendRequest = async (targetUser: User) => {
    try {
      // Check if request already exists
      const q = query(
        collection(db, 'friend_requests'),
        where('senderId', '==', user.uid),
        where('receiverId', '==', targetUser.uid),
        where('status', '==', 'pending')
      );
      const existing = await getDocs(q);
      if (!existing.empty) {
        alert('Request already sent!');
        return;
      }

      await addDoc(collection(db, 'friend_requests'), {
        senderId: user.uid,
        senderName: user.name,
        receiverId: targetUser.uid,
        status: 'pending',
        createdAt: serverTimestamp(),
      });
      alert('Friend request sent!');
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'friend_requests');
    }
  };

  const respondToRequest = async (request: FriendRequest, status: 'accepted' | 'rejected') => {
    try {
      const requestRef = doc(db, 'friend_requests', request.id);
      if (status === 'accepted') {
        await updateDoc(requestRef, { status: 'accepted' });
        
        // Add to both users' friends lists
        const userRef = doc(db, 'users', user.uid);
        const senderRef = doc(db, 'users', request.senderId);
        
        await updateDoc(userRef, { friends: arrayUnion(request.senderId) });
        await updateDoc(senderRef, { friends: arrayUnion(user.uid) });
      } else {
        await deleteDoc(requestRef);
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `friend_requests/${request.id}`);
    }
  };

  const openChatWithFriend = async (friend: User) => {
    try {
      // Check if chat already exists
      const q = query(
        collection(db, 'chats'),
        where('participants', 'array-contains', user.uid)
      );
      const chatsSnap = await getDocs(q);
      let existingChat = chatsSnap.docs.find(doc => {
        const data = doc.data();
        return data.participants.includes(friend.uid);
      });

      if (!existingChat) {
        // Create new chat
        await addDoc(collection(db, 'chats'), {
          participants: [user.uid, friend.uid],
          updatedAt: serverTimestamp(),
          createdAt: serverTimestamp()
        });
      }
      setIsChatOpen(true);
    } catch (error) {
      console.error('Error opening chat:', error);
    }
  };

  if (isChatOpen) {
    return (
      <div className="space-y-4">
        <button 
          onClick={() => setIsChatOpen(false)}
          className="flex items-center gap-2 text-slate-500 hover:text-slate-900 font-bold text-xs uppercase tracking-widest transition-colors mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Circle
        </button>
        <ChatComponent currentUser={user} />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm flex items-center justify-between">
        <div className="flex items-center gap-6">
          <div className="w-16 h-16 bg-pink-500 rounded-3xl flex items-center justify-center text-white shadow-xl shadow-pink-100">
            <Users className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-3xl font-black text-slate-900 tracking-tight">Circle Connect</h2>
            <p className="text-slate-500 font-medium mt-1 uppercase tracking-widest text-[10px]">Connect with your peers</p>
          </div>
        </div>
        <button 
          onClick={() => setIsChatOpen(true)}
          className="p-4 bg-blue-50 text-blue-600 rounded-2xl hover:bg-blue-600 hover:text-white transition-all shadow-sm flex items-center gap-2 font-bold"
        >
          <MessageCircle className="w-6 h-6" />
          <span className="hidden sm:inline">Messenger</span>
        </button>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        {/* Search & Results */}
        <div className="md:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm">
            <form onSubmit={handleSearch} className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
              <input 
                type="text" 
                placeholder="Search for friends by name..." 
                className="w-full pl-12 pr-4 py-3 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-pink-500 transition-all font-medium"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </form>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-black text-slate-900 px-2">Search Results</h3>
            {loading ? (
              <div className="h-32 bg-slate-50 rounded-[2rem] animate-pulse"></div>
            ) : searchResults.length > 0 ? (
              <div className="grid gap-4">
                {searchResults.map(result => (
                  <motion.div 
                    key={result.uid}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="bg-white p-4 rounded-3xl border border-slate-100 shadow-sm flex items-center justify-between"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400">
                        {result.photoURL ? (
                          <img src={result.photoURL} alt={result.name} className="w-full h-full object-cover rounded-2xl" />
                        ) : (
                          <UserIcon className="w-6 h-6" />
                        )}
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-900">{result.name}</h4>
                        <p className="text-xs text-slate-500 font-medium">{result.college || 'No college specified'}</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => sendFriendRequest(result)}
                      className="p-3 bg-pink-50 text-pink-600 rounded-2xl hover:bg-pink-100 transition-all"
                    >
                      <UserPlus className="w-5 h-5" />
                    </button>
                  </motion.div>
                ))}
              </div>
            ) : searchQuery && (
              <p className="text-center py-8 text-slate-400 font-medium">No users found matching "{searchQuery}"</p>
            )}
          </div>

          {/* Friends List */}
          <div className="space-y-4">
            <h3 className="text-lg font-black text-slate-900 px-2">Your Friends</h3>
            {friends.length > 0 ? (
              <div className="grid sm:grid-cols-2 gap-4">
                {friends.map(friend => (
                  <div key={friend.uid} className="bg-white p-4 rounded-3xl border border-slate-100 shadow-sm flex items-center justify-between group">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-400">
                        {friend.photoURL ? (
                          <img src={friend.photoURL} alt={friend.name} className="w-full h-full object-cover rounded-2xl" />
                        ) : (
                          <UserCheck className="w-6 h-6" />
                        )}
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-900 leading-tight">{friend.name}</h4>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{friend.role}</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => openChatWithFriend(friend)}
                      className="p-3 bg-blue-50 text-blue-600 rounded-xl opacity-0 group-hover:opacity-100 transition-all hover:bg-blue-600 hover:text-white"
                    >
                      <MessageCircle className="w-5 h-5" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-slate-50 rounded-[2rem] border border-dashed border-slate-200">
                <Users className="w-12 h-12 text-slate-200 mx-auto mb-3" />
                <p className="text-slate-400 font-medium">You haven't added any friends yet</p>
              </div>
            )}
          </div>
        </div>

        {/* Pending Requests Sidebar */}
        <div className="space-y-6">
          <h3 className="text-lg font-black text-slate-900 px-2 flex items-center gap-2">
            <Clock className="w-5 h-5 text-orange-500" />
            Requests
          </h3>
          <div className="space-y-4">
            {pendingRequests.length > 0 ? (
              pendingRequests.map(request => (
                <motion.div 
                  key={request.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm space-y-4"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400">
                      <UserIcon className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">{request.senderName}</h4>
                      <p className="text-[10px] text-slate-400 font-bold">Wants to be friends</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => respondToRequest(request, 'accepted')}
                      className="flex-1 py-2 bg-pink-500 text-white rounded-xl text-xs font-bold hover:bg-pink-600 transition-all shadow-lg shadow-pink-100"
                    >
                      Accept
                    </button>
                    <button 
                      onClick={() => respondToRequest(request, 'rejected')}
                      className="flex-1 py-2 bg-slate-100 text-slate-600 rounded-xl text-xs font-bold hover:bg-slate-200 transition-all"
                    >
                      Ignore
                    </button>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="bg-slate-50 p-6 rounded-[2rem] border border-dashed border-slate-200 text-center">
                <MessageCircle className="w-8 h-8 text-slate-200 mx-auto mb-2" />
                <p className="text-xs text-slate-400 font-bold">No pending requests</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
