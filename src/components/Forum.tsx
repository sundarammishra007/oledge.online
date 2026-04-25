import { useState, useEffect } from 'react';
import { 
  collection, 
  query, 
  getDocs, 
  orderBy, 
  addDoc, 
  updateDoc, 
  doc, 
  serverTimestamp, 
  arrayUnion, 
  arrayRemove,
  onSnapshot,
  where,
  increment
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { ForumPost, ForumComment, User } from '../types';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MessageSquare, 
  ThumbsUp, 
  ThumbsDown, 
  Plus, 
  Search, 
  Filter, 
  X, 
  Send, 
  Tag, 
  Clock, 
  User as UserIcon,
  ChevronUp,
  ChevronDown,
  CheckCircle2,
  MoreVertical,
  ArrowLeft,
  Eye,
  BookOpen,
  HelpCircle
} from 'lucide-react';
import { cn } from '../lib/utils';

interface ForumProps {
  user: User;
}

export default function Forum({ user }: ForumProps) {
  const [posts, setPosts] = useState<ForumPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'blog' | 'question'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedPost, setSelectedPost] = useState<ForumPost | null>(null);
  const [comments, setComments] = useState<ForumComment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [newPost, setNewPost] = useState({
    title: '',
    content: '',
    type: 'blog' as 'blog' | 'question',
    tags: ''
  });

  useEffect(() => {
    const q = query(collection(db, 'forum_posts'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const postsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ForumPost));
      setPosts(postsData);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'forum_posts');
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (selectedPost) {
      const q = query(
        collection(db, `forum_posts/${selectedPost.id}/comments`), 
        orderBy('createdAt', 'asc')
      );
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const commentsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ForumComment));
        setComments(commentsData);
      });
      
      // Increment views
      updateDoc(doc(db, 'forum_posts', selectedPost.id), {
        viewsCount: increment(1)
      });

      return () => unsubscribe();
    }
  }, [selectedPost?.id]);

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const postData = {
        title: newPost.title,
        content: newPost.content,
        type: newPost.type,
        tags: newPost.tags.split(',').map(t => t.trim()).filter(t => t),
        authorId: user.uid,
        authorName: user.name,
        authorRole: user.role,
        upvotes: [],
        downvotes: [],
        viewsCount: 0,
        commentsCount: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      await addDoc(collection(db, 'forum_posts'), postData);
      setShowCreateModal(false);
      setNewPost({ title: '', content: '', type: 'blog', tags: '' });
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'forum_posts');
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPost || !newComment.trim()) return;

    try {
      const commentData = {
        postId: selectedPost.id,
        authorId: user.uid,
        authorName: user.name,
        authorRole: user.role,
        content: newComment,
        upvotes: [],
        createdAt: new Date().toISOString()
      };
      await addDoc(collection(db, `forum_posts/${selectedPost.id}/comments`), commentData);
      await updateDoc(doc(db, 'forum_posts', selectedPost.id), {
        commentsCount: increment(1)
      });
      setNewComment('');
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, `forum_posts/${selectedPost.id}/comments`);
    }
  };

  const handleVote = async (postId: string, voteType: 'up' | 'down') => {
    const post = posts.find(p => p.id === postId);
    if (!post) return;

    const upvotes = post.upvotes || [];
    const downvotes = post.downvotes || [];

    let newUpvotes = [...upvotes];
    let newDownvotes = [...downvotes];

    if (voteType === 'up') {
      if (upvotes.includes(user.uid)) {
        newUpvotes = newUpvotes.filter(id => id !== user.uid);
      } else {
        newUpvotes.push(user.uid);
        newDownvotes = newDownvotes.filter(id => id !== user.uid);
      }
    } else {
      if (downvotes.includes(user.uid)) {
        newDownvotes = newDownvotes.filter(id => id !== user.uid);
      } else {
        newDownvotes.push(user.uid);
        newUpvotes = newUpvotes.filter(id => id !== user.uid);
      }
    }

    try {
      await updateDoc(doc(db, 'forum_posts', postId), {
        upvotes: newUpvotes,
        downvotes: newDownvotes
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `forum_posts/${postId}`);
    }
  };

  const filteredPosts = posts.filter(post => {
    const matchesFilter = filter === 'all' || post.type === filter;
    const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         post.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         post.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesFilter && matchesSearch;
  });

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  if (selectedPost) {
    return (
      <div className="max-w-4xl mx-auto space-y-8">
        <button 
          onClick={() => setSelectedPost(null)}
          className="flex items-center gap-2 text-slate-500 hover:text-slate-900 font-bold transition-colors group"
        >
          <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          Back to Forum
        </button>

        <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
          <div className="p-8 md:p-12">
            <div className="flex items-center gap-3 mb-6">
              <span className={cn(
                "px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border",
                selectedPost.type === 'blog' 
                  ? "bg-blue-50 text-blue-600 border-blue-100" 
                  : "bg-amber-50 text-amber-600 border-amber-100"
              )}>
                {selectedPost.type === 'blog' ? <BookOpen className="w-3 h-3 inline mr-1" /> : <HelpCircle className="w-3 h-3 inline mr-1" />}
                {selectedPost.type}
              </span>
              <span className="text-[10px] text-slate-400 font-bold flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {formatTime(selectedPost.createdAt)}
              </span>
            </div>

            <h1 className="text-3xl md:text-4xl font-black text-slate-900 leading-tight mb-6">{selectedPost.title}</h1>
            
            <div className="flex items-center gap-4 mb-8 pb-8 border-b border-slate-50">
              <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-600">
                <UserIcon className="w-6 h-6" />
              </div>
              <div>
                <p className="font-black text-slate-900">{selectedPost.authorName}</p>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{selectedPost.authorRole}</p>
              </div>
            </div>

            <div className="prose prose-slate max-w-none mb-12">
              <p className="text-slate-600 text-lg leading-relaxed whitespace-pre-wrap">{selectedPost.content}</p>
            </div>

            <div className="flex flex-wrap gap-2 mb-8">
              {selectedPost.tags.map(tag => (
                <span key={tag} className="px-3 py-1 bg-slate-50 text-slate-500 rounded-full text-xs font-bold border border-slate-100">
                  #{tag}
                </span>
              ))}
            </div>

            <div className="flex items-center gap-6 pt-8 border-t border-slate-50">
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => handleVote(selectedPost.id, 'up')}
                  className={cn(
                    "p-2 rounded-xl transition-all",
                    selectedPost.upvotes?.includes(user.uid) ? "bg-blue-50 text-blue-600" : "hover:bg-slate-50 text-slate-400"
                  )}
                >
                  <ChevronUp className="w-6 h-6" />
                </button>
                <span className="font-black text-slate-900">
                  {(selectedPost.upvotes?.length || 0) - (selectedPost.downvotes?.length || 0)}
                </span>
                <button 
                  onClick={() => handleVote(selectedPost.id, 'down')}
                  className={cn(
                    "p-2 rounded-xl transition-all",
                    selectedPost.downvotes?.includes(user.uid) ? "bg-red-50 text-red-600" : "hover:bg-slate-50 text-slate-400"
                  )}
                >
                  <ChevronDown className="w-6 h-6" />
                </button>
              </div>
              <div className="flex items-center gap-2 text-slate-400 font-bold text-sm">
                <Eye className="w-5 h-5" />
                {selectedPost.viewsCount} Views
              </div>
              <div className="flex items-center gap-2 text-slate-400 font-bold text-sm">
                <MessageSquare className="w-5 h-5" />
                {selectedPost.commentsCount} {selectedPost.type === 'question' ? 'Answers' : 'Comments'}
              </div>
            </div>
          </div>
        </div>

        {/* Comments Section */}
        <div className="space-y-6">
          <h3 className="text-xl font-black text-slate-900">
            {selectedPost.type === 'question' ? 'Answers' : 'Comments'} ({comments.length})
          </h3>
          
          <form onSubmit={handleAddComment} className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex gap-4">
            <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600 shrink-0">
              <UserIcon className="w-5 h-5" />
            </div>
            <div className="flex-1 space-y-3">
              <textarea 
                required
                placeholder={selectedPost.type === 'question' ? "Write your answer..." : "Add a comment..."}
                className="w-full p-4 bg-slate-50 rounded-2xl border-none focus:ring-2 focus:ring-blue-500 font-medium text-slate-700 placeholder:text-slate-300 resize-none"
                rows={3}
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
              />
              <div className="flex justify-end">
                <button type="submit" className="px-6 py-2 bg-blue-600 text-white rounded-xl font-black text-sm shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all flex items-center gap-2">
                  <Send className="w-4 h-4" />
                  Post {selectedPost.type === 'question' ? 'Answer' : 'Comment'}
                </button>
              </div>
            </div>
          </form>

          <div className="space-y-4">
            {comments.map(comment => (
              <motion.div 
                key={comment.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center text-slate-600">
                      <UserIcon className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="font-black text-slate-900 text-sm">{comment.authorName}</p>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{comment.authorRole}</p>
                    </div>
                  </div>
                  <span className="text-[10px] text-slate-400 font-bold">{formatTime(comment.createdAt)}</span>
                </div>
                <p className="text-slate-600 font-medium leading-relaxed mb-4">{comment.content}</p>
                <div className="flex items-center gap-4">
                  <button className="flex items-center gap-1 text-slate-400 hover:text-blue-600 transition-colors text-xs font-bold">
                    <ThumbsUp className="w-4 h-4" />
                    {comment.upvotes?.length || 0}
                  </button>
                  {selectedPost.type === 'question' && comment.isCorrectAnswer && (
                    <span className="flex items-center gap-1 text-green-600 text-[10px] font-black uppercase tracking-widest">
                      <CheckCircle2 className="w-3 h-3" />
                      Correct Answer
                    </span>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-2">Community Forum</h1>
          <p className="text-slate-500 font-medium">Share knowledge, ask questions, and grow together.</p>
        </div>
        <button 
          onClick={() => setShowCreateModal(true)}
          className="flex items-center justify-center gap-3 px-8 py-4 bg-blue-600 text-white rounded-[1.5rem] font-black shadow-xl shadow-blue-200 hover:bg-blue-700 transition-all hover:scale-105 active:scale-95"
        >
          <Plus className="w-6 h-6" />
          Create New Post
        </button>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
          <input 
            type="text" 
            placeholder="Search blogs, questions, tags..."
            className="w-full pl-12 pr-4 py-4 bg-white rounded-2xl border border-slate-100 focus:ring-2 focus:ring-blue-500 font-medium text-slate-900 placeholder:text-slate-300 shadow-sm"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex bg-white p-1 rounded-2xl border border-slate-100 shadow-sm">
          {(['all', 'blog', 'question'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setFilter(t)}
              className={cn(
                "px-6 py-2 rounded-xl text-sm font-black uppercase tracking-widest transition-all",
                filter === t ? "bg-blue-600 text-white shadow-lg shadow-blue-200" : "text-slate-400 hover:text-slate-600"
              )}
            >
              {t}s
            </button>
          ))}
        </div>
      </div>

      {/* Posts List */}
      <div className="grid gap-6">
        {loading ? (
          [1, 2, 3].map(i => <div key={i} className="h-48 bg-white rounded-[2rem] animate-pulse border border-slate-100"></div>)
        ) : filteredPosts.length > 0 ? (
          filteredPosts.map((post, idx) => (
            <motion.div
              key={post.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              onClick={() => setSelectedPost(post)}
              className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-slate-200/50 transition-all cursor-pointer group relative overflow-hidden"
            >
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                <div className="flex-1 space-y-4">
                  <div className="flex items-center gap-3">
                    <span className={cn(
                      "px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border",
                      post.type === 'blog' 
                        ? "bg-blue-50 text-blue-600 border-blue-100" 
                        : "bg-amber-50 text-amber-600 border-amber-100"
                    )}>
                      {post.type === 'blog' ? <BookOpen className="w-3 h-3 inline mr-1" /> : <HelpCircle className="w-3 h-3 inline mr-1" />}
                      {post.type}
                    </span>
                    <span className="text-[10px] text-slate-400 font-bold flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {formatTime(post.createdAt)}
                    </span>
                  </div>
                  <h3 className="text-2xl font-black text-slate-900 leading-tight group-hover:text-blue-600 transition-colors">{post.title}</h3>
                  <p className="text-slate-500 font-medium line-clamp-2 leading-relaxed">{post.content}</p>
                  <div className="flex flex-wrap gap-2">
                    {post.tags.map(tag => (
                      <span key={tag} className="px-2 py-0.5 bg-slate-50 text-slate-400 rounded-md text-[10px] font-bold uppercase tracking-widest border border-slate-100">
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex md:flex-col items-center justify-between md:justify-start gap-4 md:min-w-[120px]">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400">
                      <UserIcon className="w-5 h-5" />
                    </div>
                    <div className="md:hidden">
                      <p className="font-black text-slate-900 text-sm">{post.authorName}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-slate-400 font-bold text-sm">
                    <div className="flex items-center gap-1">
                      <ChevronUp className="w-4 h-4" />
                      {(post.upvotes?.length || 0) - (post.downvotes?.length || 0)}
                    </div>
                    <div className="flex items-center gap-1">
                      <MessageSquare className="w-4 h-4" />
                      {post.commentsCount}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))
        ) : (
          <div className="text-center py-20 bg-white rounded-[3rem] border border-dashed border-slate-200">
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center text-slate-300 mx-auto mb-6">
              <Search className="w-10 h-10" />
            </div>
            <h3 className="text-xl font-black text-slate-900 mb-2">No posts found</h3>
            <p className="text-slate-400 font-medium">Try adjusting your search or filters.</p>
          </div>
        )}
      </div>

      {/* Create Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowCreateModal(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-2xl bg-white rounded-[3rem] shadow-2xl overflow-hidden"
            >
              <div className="p-8 md:p-12">
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-3xl font-black text-slate-900 tracking-tight">Create New Post</h2>
                  <button 
                    onClick={() => setShowCreateModal(false)}
                    className="p-3 hover:bg-slate-50 rounded-2xl transition-colors text-slate-400"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <form onSubmit={handleCreatePost} className="space-y-6">
                  <div className="flex bg-slate-50 p-1 rounded-2xl border border-slate-100">
                    {(['blog', 'question'] as const).map((t) => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => setNewPost(prev => ({ ...prev, type: t }))}
                        className={cn(
                          "flex-1 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2",
                          newPost.type === t ? "bg-white text-blue-600 shadow-sm" : "text-slate-400 hover:text-slate-600"
                        )}
                      >
                        {t === 'blog' ? <BookOpen className="w-4 h-4" /> : <HelpCircle className="w-4 h-4" />}
                        {t}
                      </button>
                    ))}
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Post Title</label>
                    <input 
                      required
                      type="text" 
                      placeholder="What's on your mind?"
                      className="w-full p-4 bg-slate-50 rounded-2xl border-none focus:ring-2 focus:ring-blue-500 font-bold text-slate-900 placeholder:text-slate-300"
                      value={newPost.title}
                      onChange={(e) => setNewPost(prev => ({ ...prev, title: e.target.value }))}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Content</label>
                    <textarea 
                      required
                      rows={6}
                      placeholder="Share your thoughts or ask a question..."
                      className="w-full p-4 bg-slate-50 rounded-2xl border-none focus:ring-2 focus:ring-blue-500 font-medium text-slate-700 placeholder:text-slate-300 resize-none"
                      value={newPost.content}
                      onChange={(e) => setNewPost(prev => ({ ...prev, content: e.target.value }))}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Tags (comma separated)</label>
                    <div className="relative">
                      <Tag className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                      <input 
                        type="text" 
                        placeholder="e.g. technology, career, help"
                        className="w-full pl-12 pr-4 py-4 bg-slate-50 rounded-2xl border-none focus:ring-2 focus:ring-blue-500 font-medium text-slate-900 placeholder:text-slate-300"
                        value={newPost.tags}
                        onChange={(e) => setNewPost(prev => ({ ...prev, tags: e.target.value }))}
                      />
                    </div>
                  </div>

                  <button type="submit" className="w-full py-5 bg-blue-600 text-white rounded-[1.5rem] font-black text-lg shadow-xl shadow-blue-200 hover:bg-blue-700 transition-all flex items-center justify-center gap-3">
                    <Send className="w-6 h-6" />
                    Publish Post
                  </button>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
