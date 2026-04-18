import { useState, useEffect } from 'react';
import { 
  collection, 
  query, 
  getDocs, 
  orderBy, 
  limit, 
  addDoc, 
  updateDoc, 
  doc, 
  serverTimestamp, 
  arrayUnion, 
  arrayRemove,
  onSnapshot
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { Notice, User, Comment } from '../types';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Megaphone, 
  MessageSquare, 
  Share2, 
  ThumbsUp, 
  Lightbulb, 
  CheckCircle2, 
  Send, 
  X, 
  MoreVertical,
  Clock,
  Calendar,
  Plus,
  User as UserIcon,
  Globe,
  Building2,
  ShieldCheck,
  Award
} from 'lucide-react';
import { cn } from '../lib/utils';

interface NoticeBoardProps {
  user: User;
}

export default function NoticeBoard({ user }: NoticeBoardProps) {
  const [notices, setNotices] = useState<Notice[]>([]);
  const [loading, setLoading] = useState(true);
  const [isPosting, setIsPosting] = useState(false);
  const [newNotice, setNewNotice] = useState({ title: '', content: '' });
  const [activeComments, setActiveComments] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const q = query(collection(db, 'notices'), orderBy('createdAt', 'desc'), limit(50));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Notice));
      setNotices(data);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'notices');
    });

    return () => unsubscribe();
  }, []);

  const handlePostNotice = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addDoc(collection(db, 'notices'), {
        ...newNotice,
        authorId: user.uid,
        authorName: user.name,
        authorRole: user.role,
        reactions: {
          acknowledge: [],
          inspiring: [],
          useful: []
        },
        reposts: [],
        commentsCount: 0,
        createdAt: serverTimestamp(),
      });
      setIsPosting(false);
      setNewNotice({ title: '', content: '' });
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'notices');
    }
  };

  const handleReaction = async (noticeId: string, type: 'acknowledge' | 'inspiring' | 'useful', hasReacted: boolean) => {
    try {
      const noticeRef = doc(db, 'notices', noticeId);
      await updateDoc(noticeRef, {
        [`reactions.${type}`]: hasReacted ? arrayRemove(user.uid) : arrayUnion(user.uid)
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `notices/${noticeId}`);
    }
  };

  const handleRepost = async (noticeId: string) => {
    try {
      const noticeRef = doc(db, 'notices', noticeId);
      await updateDoc(noticeRef, {
        reposts: arrayUnion(user.uid)
      });
      alert('Notice reposted on oledge!');
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `notices/${noticeId}`);
    }
  };

  const handleFollow = async (targetUserId: string) => {
    try {
      const isFollowing = user.following?.includes(targetUserId);
      const userRef = doc(db, 'users', user.uid);
      const targetRef = doc(db, 'users', targetUserId);

      await updateDoc(userRef, {
        following: isFollowing ? arrayRemove(targetUserId) : arrayUnion(targetUserId)
      });
      await updateDoc(targetRef, {
        followers: isFollowing ? arrayRemove(user.uid) : arrayUnion(user.uid)
      });
      alert(isFollowing ? 'Unfollowed!' : 'Following!');
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `users/${user.uid}`);
    }
  };

  const shareToSocial = (notice: Notice) => {
    const text = `Check out this notice on oledge: ${notice.title}`;
    const url = window.location.href;
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`, '_blank');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header with Clock */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
        <div className="flex items-center gap-6">
          <div className="w-16 h-16 bg-blue-600 rounded-3xl flex items-center justify-center text-white shadow-xl shadow-blue-100">
            <Megaphone className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-3xl font-black text-slate-900 tracking-tight">Notice Board</h2>
            <p className="text-slate-500 font-medium mt-1 uppercase tracking-widest text-[10px]">Official announcements & updates</p>
          </div>
        </div>
        <div className="flex items-center gap-4 bg-slate-50 px-6 py-3 rounded-2xl border border-slate-100">
          <div className="text-right">
            <p className="text-lg font-black text-slate-900 leading-none">{formatTime(currentTime)}</p>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">{formatDate(currentTime)}</p>
          </div>
          <Clock className="w-6 h-6 text-blue-500" />
        </div>
      </div>

      {/* Post Action */}
      {(user.role === 'govt' || user.role === 'college' || user.role === 'company' || user.role === 'admin') && (
        <button 
          onClick={() => setIsPosting(true)}
          className="w-full bg-white p-6 rounded-[2rem] border border-dashed border-slate-200 text-slate-400 font-bold hover:border-blue-400 hover:text-blue-600 transition-all flex items-center justify-center gap-3 group"
        >
          <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center group-hover:bg-blue-50 transition-colors">
            <Plus className="w-6 h-6" />
          </div>
          Post an official announcement...
        </button>
      )}

      {/* Posting Modal */}
      <AnimatePresence>
        {isPosting && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md">
            <motion.div 
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              className="bg-white rounded-[2.5rem] p-10 max-w-2xl w-full shadow-2xl border border-white/20"
            >
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600">
                    <Megaphone className="w-6 h-6" />
                  </div>
                  <h3 className="text-2xl font-black text-slate-900">Create Notice</h3>
                </div>
                <button onClick={() => setIsPosting(false)} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                  <X className="w-6 h-6 text-slate-400" />
                </button>
              </div>
              <form onSubmit={handlePostNotice} className="space-y-6">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3">Notice Title</label>
                  <input 
                    type="text" required
                    placeholder="e.g. Important Exam Update"
                    className="w-full p-4 bg-slate-50 rounded-2xl border-none focus:ring-2 focus:ring-blue-500 font-bold text-slate-900 placeholder:text-slate-300"
                    value={newNotice.title}
                    onChange={(e) => setNewNotice(prev => ({ ...prev, title: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3">Announcement Content</label>
                  <textarea 
                    required rows={6}
                    placeholder="Provide detailed information here..."
                    className="w-full p-4 bg-slate-50 rounded-2xl border-none focus:ring-2 focus:ring-blue-500 font-medium text-slate-700 placeholder:text-slate-300 resize-none"
                    value={newNotice.content}
                    onChange={(e) => setNewNotice(prev => ({ ...prev, content: e.target.value }))}
                  />
                </div>
                <button type="submit" className="w-full py-5 bg-blue-600 text-white rounded-2xl font-black text-lg shadow-xl shadow-blue-200 hover:bg-blue-700 transition-all flex items-center justify-center gap-3">
                  <Send className="w-6 h-6" />
                  Publish Announcement
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Notices List */}
      <div className="space-y-6">
        {loading ? (
          [1, 2, 3].map(i => <div key={i} className="h-64 bg-slate-100 rounded-[2.5rem] animate-pulse"></div>)
        ) : notices.map((notice, idx) => (
          <motion.div
            key={notice.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
            className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden"
          >
            <div className="p-8">
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-600 border border-slate-100">
                    {getRoleIcon(notice.authorRole)}
                  </div>
                  <div>
                    <div className="flex items-center gap-3">
                      <h4 className="font-black text-slate-900 text-lg leading-tight">{notice.authorName}</h4>
                      {notice.authorId !== user.uid && (
                        <button 
                          onClick={() => handleFollow(notice.authorId)}
                          className="text-[10px] font-black text-blue-600 hover:text-blue-700 uppercase tracking-widest"
                        >
                          {user.following?.includes(notice.authorId) ? 'Following' : '+ Follow'}
                        </button>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[10px] bg-blue-50 text-blue-600 px-2 py-0.5 rounded-md font-black uppercase tracking-widest border border-blue-100">
                        {notice.authorRole}
                      </span>
                      <span className="text-[10px] text-slate-400 font-bold flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {formatTimestamp(notice.createdAt)}
                      </span>
                    </div>
                  </div>
                </div>
                <button className="p-2 hover:bg-slate-50 rounded-xl transition-colors">
                  <MoreVertical className="w-5 h-5 text-slate-400" />
                </button>
              </div>

              <div className="space-y-4">
                {notice.type === 'achievement' && (
                  <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-50 text-amber-600 rounded-lg text-[10px] font-black uppercase tracking-widest border border-amber-100 mb-2">
                    <Award className="w-3 h-3" />
                    New Achievement
                  </div>
                )}
                <h3 className="text-2xl font-black text-slate-900 leading-tight">{notice.title}</h3>
                <p className="text-slate-600 font-medium leading-relaxed whitespace-pre-wrap">{notice.content}</p>
              </div>

              {/* Reactions & Actions */}
              <div className="mt-8 pt-6 border-t border-slate-50 flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <ReactionButton 
                    icon={CheckCircle2} 
                    label="Acknowledge" 
                    count={notice.reactions.acknowledge.length}
                    active={notice.reactions.acknowledge.includes(user.uid)}
                    onClick={() => handleReaction(notice.id, 'acknowledge', notice.reactions.acknowledge.includes(user.uid))}
                    color="text-green-600"
                    bgColor="bg-green-50"
                  />
                  <ReactionButton 
                    icon={Lightbulb} 
                    label="Inspiring" 
                    count={notice.reactions.inspiring.length}
                    active={notice.reactions.inspiring.includes(user.uid)}
                    onClick={() => handleReaction(notice.id, 'inspiring', notice.reactions.inspiring.includes(user.uid))}
                    color="text-yellow-600"
                    bgColor="bg-yellow-50"
                  />
                  <ReactionButton 
                    icon={ThumbsUp} 
                    label="Useful" 
                    count={notice.reactions.useful.length}
                    active={notice.reactions.useful.includes(user.uid)}
                    onClick={() => handleReaction(notice.id, 'useful', notice.reactions.useful.includes(user.uid))}
                    color="text-blue-600"
                    bgColor="bg-blue-50"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => setActiveComments(activeComments === notice.id ? null : notice.id)}
                    className={cn(
                      "flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all",
                      activeComments === notice.id ? "bg-slate-900 text-white" : "text-slate-500 hover:bg-slate-50"
                    )}
                  >
                    <MessageSquare className="w-4 h-4" />
                    {notice.commentsCount} Remarks
                  </button>
                  <div className="relative group">
                    <button className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold text-slate-500 hover:bg-slate-50 transition-all">
                      <Share2 className="w-4 h-4" />
                      Repost
                    </button>
                    <div className="absolute bottom-full right-0 mb-2 hidden group-hover:block bg-white rounded-2xl shadow-2xl border border-slate-100 p-2 min-w-[160px] z-10">
                      <button 
                        onClick={() => handleRepost(notice.id)}
                        className="w-full text-left px-4 py-2 text-xs font-bold text-slate-600 hover:bg-blue-50 hover:text-blue-600 rounded-xl transition-all flex items-center gap-2"
                      >
                        <Megaphone className="w-3 h-3" /> Repost on oledge
                      </button>
                      <button 
                        onClick={() => shareToSocial(notice)}
                        className="w-full text-left px-4 py-2 text-xs font-bold text-slate-600 hover:bg-blue-50 hover:text-blue-600 rounded-xl transition-all flex items-center gap-2"
                      >
                        <Share2 className="w-3 h-3" /> Social Media
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Comment Section */}
            <AnimatePresence>
              {activeComments === notice.id && (
                <motion.div 
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="bg-slate-50/50 border-t border-slate-50 overflow-hidden"
                >
                  <CommentSection noticeId={notice.id} user={user} />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function CommentSection({ noticeId, user }: { noticeId: string, user: User }) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const q = query(collection(db, 'notices', noticeId, 'comments'), orderBy('createdAt', 'asc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Comment));
      setComments(data);
    });
    return () => unsubscribe();
  }, [noticeId]);

  const handlePostComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    setLoading(true);
    try {
      await addDoc(collection(db, 'notices', noticeId, 'comments'), {
        noticeId,
        authorId: user.uid,
        authorName: user.name,
        content: newComment,
        createdAt: serverTimestamp(),
      });
      // Update comments count on notice
      const noticeRef = doc(db, 'notices', noticeId);
      await updateDoc(noticeRef, {
        commentsCount: comments.length + 1
      });
      setNewComment('');
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, `notices/${noticeId}/comments`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 space-y-6">
      <div className="space-y-4">
        {comments.map(comment => (
          <div key={comment.id} className="flex gap-4">
            <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center text-slate-400 border border-slate-100 shrink-0">
              <UserIcon className="w-4 h-4" />
            </div>
            <div className="flex-1 bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-black text-slate-900">{comment.authorName}</span>
                <span className="text-[10px] text-slate-400 font-bold">{formatTimestamp(comment.createdAt)}</span>
              </div>
              <p className="text-sm text-slate-600 font-medium">{comment.content}</p>
            </div>
          </div>
        ))}
      </div>
      <form onSubmit={handlePostComment} className="flex gap-3">
        <input 
          type="text" 
          placeholder="Add a remark..."
          className="flex-1 p-4 bg-white rounded-2xl border border-slate-100 focus:ring-2 focus:ring-blue-500 font-medium text-sm shadow-sm"
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
        />
        <button 
          type="submit" 
          disabled={loading || !newComment.trim()}
          className="p-4 bg-blue-600 text-white rounded-2xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-100 disabled:opacity-50"
        >
          <Send className="w-5 h-5" />
        </button>
      </form>
    </div>
  );
}

function ReactionButton({ icon: Icon, label, count, active, onClick, color, bgColor }: any) {
  return (
    <button 
      onClick={onClick}
      className={cn(
        "flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all border",
        active ? `${bgColor} ${color} border-current` : "bg-white text-slate-400 border-slate-100 hover:bg-slate-50"
      )}
    >
      <Icon className={cn("w-4 h-4", active ? color : "text-slate-300")} />
      {label}
      <span className="ml-1 opacity-60">{count}</span>
    </button>
  );
}

function getRoleIcon(role: string) {
  switch (role) {
    case 'govt': return <Globe className="w-6 h-6" />;
    case 'college': return <Building2 className="w-6 h-6" />;
    case 'company': return <ShieldCheck className="w-6 h-6" />;
    case 'admin': return <ShieldCheck className="w-6 h-6" />;
    default: return <UserIcon className="w-6 h-6" />;
  }
}

function formatTime(date: Date) {
  return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true });
}

function formatDate(date: Date) {
  return date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
}

function formatTimestamp(timestamp: any) {
  if (!timestamp) return '';
  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}
