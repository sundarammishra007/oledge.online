import { useState, useEffect, useRef } from 'react';
import { 
  collection, 
  query, 
  where, 
  orderBy, 
  onSnapshot, 
  addDoc, 
  serverTimestamp, 
  doc, 
  updateDoc,
  getDocs,
  limit
} from 'firebase/firestore';
import { db } from '../firebase';
import { User, Chat, Message } from '../types';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Send, 
  ChevronLeft, 
  MessageCircle,
  Clock,
  User as UserIcon,
  Search,
  MoreVertical,
  Check,
  CheckCheck,
  UserCheck
} from 'lucide-react';
import { cn } from '../lib/utils';

interface ChatProps {
  currentUser: User;
  onBack?: () => void;
}

export default function ChatComponent({ currentUser, onBack }: ChatProps) {
  const [chats, setChats] = useState<Chat[]>([]);
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [chatPartners, setChatPartners] = useState<Record<string, User>>({});
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Fetch chats
  useEffect(() => {
    const q = query(
      collection(db, 'chats'),
      where('participants', 'array-contains', currentUser.uid),
      orderBy('updatedAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, async (snapshot) => {
      const chatData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Chat));
      setChats(chatData);
      setLoading(false);

      // Fetch partner info for each chat
      const partnerIds = new Set<string>();
      chatData.forEach(chat => {
        const partnerId = chat.participants.find(p => p !== currentUser.uid);
        if (partnerId) partnerIds.add(partnerId);
      });

      if (partnerIds.size > 0) {
        const partnersQ = query(
          collection(db, 'users'),
          where('uid', 'in', Array.from(partnerIds))
        );
        const partnersSnapshot = await getDocs(partnersQ);
        const partnersMap: Record<string, User> = {};
        partnersSnapshot.docs.forEach(doc => {
          const u = doc.data() as User;
          partnersMap[u.uid] = u;
        });
        setChatPartners(prev => ({ ...prev, ...partnersMap }));
      }
    });

    return () => unsubscribe();
  }, [currentUser.uid]);

  // Fetch messages for selected chat
  useEffect(() => {
    if (!selectedChat) return;

    const q = query(
      collection(db, 'chats', selectedChat.id, 'messages'),
      orderBy('createdAt', 'asc'),
      limit(100)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Message));
      setMessages(msgData);
    });

    return () => unsubscribe();
  }, [selectedChat]);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedChat) return;

    const text = newMessage.trim();
    setNewMessage('');

    try {
      // Add message
      await addDoc(collection(db, 'chats', selectedChat.id, 'messages'), {
        chatId: selectedChat.id,
        senderId: currentUser.uid,
        senderName: currentUser.name,
        text,
        createdAt: serverTimestamp()
      });

      // Update chat last message
      await updateDoc(doc(db, 'chats', selectedChat.id), {
        lastMessage: text,
        lastSenderId: currentUser.uid,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const getPartnerInChat = (chat: Chat) => {
    const partnerId = chat.participants.find(p => p !== currentUser.uid);
    return partnerId ? chatPartners[partnerId] : null;
  };

  return (
    <div className="max-w-5xl mx-auto h-[calc(100vh-12rem)] flex bg-white rounded-[3rem] border border-slate-100 shadow-xl overflow-hidden mt-4">
      {/* Sidebar - Chat List */}
      <div className={cn(
        "w-full md:w-80 flex-col border-r border-slate-50",
        selectedChat ? "hidden md:flex" : "flex"
      )}>
        <div className="p-6 border-b border-slate-50 flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-900">Connections</h2>
          <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
            <MessageCircle className="w-5 h-5" />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto overflow-x-hidden p-4 space-y-2">
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-20 bg-slate-50 rounded-2xl animate-pulse" />
              ))}
            </div>
          ) : chats.length > 0 ? (
            chats.map(chat => {
              const partner = getPartnerInChat(chat);
              const isActive = selectedChat?.id === chat.id;
              return (
                <motion.div
                  key={chat.id}
                  whileHover={{ x: 4 }}
                  onClick={() => setSelectedChat(chat)}
                  className={cn(
                    "p-4 rounded-2xl cursor-pointer transition-all flex items-center gap-4 group",
                    isActive ? "bg-blue-600 shadow-lg shadow-blue-100" : "hover:bg-slate-50"
                  )}
                >
                  <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center text-slate-400 group-hover:bg-white/20 transition-colors">
                    {partner?.photoURL ? (
                      <img src={partner.photoURL} alt={partner.name} className="w-full h-full object-cover rounded-xl" />
                    ) : (
                      <UserIcon className="w-6 h-6" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h4 className={cn("font-bold truncate", isActive ? "text-white" : "text-slate-900")}>
                        {partner?.name || 'Loading...'}
                      </h4>
                    </div>
                    <p className={cn("text-xs truncate", isActive ? "text-white/70" : "text-slate-400")}>
                      {chat.lastMessage || 'No messages yet'}
                    </p>
                  </div>
                </motion.div>
              );
            })
          ) : (
            <div className="text-center py-12 px-4">
              <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <MessageCircle className="w-8 h-8 text-slate-200" />
              </div>
              <p className="text-slate-400 text-sm font-medium">No active chats yet. Connect with campus friends to start chatting!</p>
            </div>
          )}
        </div>
      </div>

      {/* Main - Chat Window */}
      <div className={cn(
        "flex-1 flex flex-col bg-slate-50/30",
        !selectedChat ? "hidden md:flex items-center justify-center" : "flex"
      )}>
        {selectedChat ? (
          <>
            {/* Chat Header */}
            <div className="p-6 bg-white border-b border-slate-50 flex items-center justify-between sticky top-0 z-10">
              <div className="flex items-center gap-4">
                <button 
                  onClick={() => setSelectedChat(null)}
                  className="p-2 hover:bg-slate-50 rounded-xl md:hidden text-slate-400 transition-colors"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center text-slate-400">
                  {getPartnerInChat(selectedChat)?.photoURL ? (
                    <img 
                      src={getPartnerInChat(selectedChat)?.photoURL} 
                      alt="Partner" 
                      className="w-full h-full object-cover rounded-xl" 
                    />
                  ) : (
                    <UserIcon className="w-5 h-5" />
                  )}
                </div>
                <div>
                  <h3 className="font-bold text-slate-900">{getPartnerInChat(selectedChat)?.name || 'Loading...'}</h3>
                  <div className="flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Connected</span>
                  </div>
                </div>
              </div>
              <button className="p-2 hover:bg-slate-50 rounded-xl text-slate-400 transition-colors">
                <MoreVertical className="w-5 h-5" />
              </button>
            </div>

            {/* Message Area */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {messages.length > 0 ? (
                messages.map((msg, idx) => {
                  const isOwn = msg.senderId === currentUser.uid;
                  return (
                    <motion.div
                      key={msg.id}
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      className={cn(
                        "flex flex-col max-w-[80%] space-y-1",
                        isOwn ? "ml-auto items-end" : "mr-auto items-start"
                      )}
                    >
                      <div className={cn(
                        "p-4 rounded-2xl text-sm font-medium leading-relaxed shadow-sm",
                        isOwn 
                          ? "bg-blue-600 text-white rounded-tr-none" 
                          : "bg-white text-slate-700 rounded-tl-none border border-slate-50"
                      )}>
                        {msg.text}
                      </div>
                      <span className="text-[9px] font-medium text-slate-400 px-1">
                        {msg.createdAt ? new Date((msg.createdAt as any).toDate()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '...'}
                      </span>
                    </motion.div>
                  );
                })
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-center space-y-4">
                  <div className="w-16 h-16 bg-blue-50/50 rounded-2xl flex items-center justify-center text-blue-300">
                    <MessageCircle className="w-8 h-8" />
                  </div>
                  <p className="text-slate-400 text-xs font-bold uppercase tracking-widest leading-loose">
                    Start a new conversation<br/>with your friend
                  </p>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-6 bg-white border-t border-slate-50">
              <form onSubmit={sendMessage} className="flex gap-4">
                <input 
                  type="text" 
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type your message here..."
                  className="flex-1 px-6 py-3 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500 transition-all font-medium text-slate-900"
                />
                <button 
                  type="submit"
                  disabled={!newMessage.trim()}
                  className="w-12 h-12 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-200 text-white rounded-2xl flex items-center justify-center transition-all shadow-lg shadow-blue-100 flex-shrink-0"
                >
                  <Send className="w-5 h-5" />
                </button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center text-center space-y-6">
            <div className="w-32 h-32 bg-slate-50/50 rounded-3xl flex items-center justify-center text-slate-200 relative">
              <MessageCircle className="w-16 h-16" strokeWidth={1.5} />
              <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-white rounded-2xl shadow-lg border border-slate-50 flex items-center justify-center text-blue-500">
                <UserCheck className="w-6 h-6" />
              </div>
            </div>
            <div className="space-y-2">
              <h3 className="text-2xl font-black text-slate-900 tracking-tight">Oledge Campus Messenger</h3>
              <p className="text-slate-400 font-medium max-w-xs uppercase tracking-widest text-[10px]">Select a friend from the left sidebar to start chatting</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
