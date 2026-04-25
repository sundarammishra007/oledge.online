import { useState, useEffect } from 'react';
import { 
  collection, 
  query, 
  getDocs, 
  orderBy, 
  limit, 
  addDoc, 
  serverTimestamp, 
  updateDoc, 
  doc, 
  arrayUnion, 
  arrayRemove,
  onSnapshot
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { EBook, User } from '../types';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BookOpen, 
  Search, 
  Plus,
  ArrowRight,
  Download,
  Bookmark,
  Book as BookIcon,
  Library as LibraryIcon,
  X,
  Send,
  MessageSquare,
  Share2,
  ThumbsUp,
  Heart,
  Sparkles,
  FileText,
  PenTool,
  Quote,
  Users
} from 'lucide-react';
import { cn } from '../lib/utils';

interface LibraryProps {
  user: User;
}

export default function Library({ user }: LibraryProps) {
  const [books, setBooks] = useState<EBook[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isPublishing, setIsPublishing] = useState(false);
  const [newBook, setNewBook] = useState({ 
    title: '', 
    description: '', 
    category: 'book' as EBook['category'],
    content: ''
  });

  useEffect(() => {
    const q = query(
      collection(db, 'library'),
      orderBy('createdAt', 'desc'),
      limit(50)
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as EBook));
      setBooks(data);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'library');
    });

    return () => unsubscribe();
  }, []);

  const handlePublish = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addDoc(collection(db, 'library'), {
        ...newBook,
        author: user.name,
        authorId: user.uid,
        authorName: user.name,
        reactions: {
          impactful: [],
          motivational: [],
          inspiring: []
        },
        reposts: [],
        commentsCount: 0,
        createdAt: serverTimestamp(),
      });
      setIsPublishing(false);
      setNewBook({ title: '', description: '', category: 'book', content: '' });
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'library');
    }
  };

  const handleReaction = async (bookId: string, type: 'impactful' | 'motivational' | 'inspiring', hasReacted: boolean) => {
    try {
      const bookRef = doc(db, 'library', bookId);
      await updateDoc(bookRef, {
        [`reactions.${type}`]: hasReacted ? arrayRemove(user.uid) : arrayUnion(user.uid)
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `library/${bookId}`);
    }
  };

  const handleRepublish = async (bookId: string, thoughts: string = '') => {
    try {
      const bookRef = doc(db, 'library', bookId);
      await updateDoc(bookRef, {
        reposts: arrayUnion({
          userId: user.uid,
          userName: user.name,
          thoughts,
          createdAt: new Date().toISOString()
        })
      });
      alert('Republished to your dashboard!');
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `library/${bookId}`);
    }
  };

  const filteredBooks = books.filter(item => 
    item.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    item.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const categories = [
    { label: 'Books', id: 'book', icon: BookIcon },
    { label: 'Research', id: 'research_paper', icon: FileText },
    { label: 'Poems', id: 'poem', icon: Quote },
    { label: 'Stories', id: 'kahani', icon: BookOpen },
    { label: 'Plays', id: 'natak', icon: Users },
    { label: 'Articles', id: 'lekh', icon: PenTool },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12">
      {/* Header */}
      <div className="bg-slate-900 rounded-[2.5rem] p-10 text-white relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/20 blur-[100px] rounded-full -mr-48 -mt-48" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
          <div className="flex items-center gap-6">
            <div className="w-16 h-16 bg-blue-600 rounded-3xl flex items-center justify-center shadow-xl shadow-blue-500/20">
              <BookOpen className="w-8 h-8" />
            </div>
            <div>
              <h2 className="text-4xl font-black tracking-tight">e-Library</h2>
              <p className="text-blue-200/60 font-bold mt-1 uppercase tracking-[0.2em] text-xs">Publish, Read & React to knowledge</p>
            </div>
          </div>
          <button 
            onClick={() => setIsPublishing(true)}
            className="w-full md:w-auto bg-white text-slate-900 hover:bg-blue-50 px-8 py-4 rounded-2xl font-black text-sm uppercase tracking-widest transition-all shadow-xl active:scale-95 flex items-center justify-center gap-3"
          >
            <Plus className="w-5 h-5" />
            Publish Entry
          </button>
        </div>
      </div>

      {/* Categories & Search */}
      <div className="grid md:grid-cols-4 gap-6">
        <div className="md:col-span-3 space-y-6">
          <div className="bg-white p-4 rounded-[2rem] border border-slate-100 shadow-sm flex items-center gap-4">
            <Search className="text-slate-400 w-6 h-6 ml-2" />
            <input 
              type="text" 
              placeholder="Search by title, author, or category..." 
              className="flex-1 bg-transparent border-none focus:ring-0 font-bold text-slate-900 placeholder:text-slate-300"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="flex overflow-x-auto gap-4 pb-2 no-scrollbar">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSearchTerm(cat.id === searchTerm ? '' : cat.id)}
                className={cn(
                  "flex items-center gap-3 px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest transition-all whitespace-nowrap border",
                  searchTerm === cat.id 
                    ? "bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-200" 
                    : "bg-white text-slate-400 border-slate-100 hover:border-blue-200 hover:text-blue-600"
                )}
              >
                <cat.icon className="w-4 h-4" />
                {cat.label}
              </button>
            ))}
          </div>
        </div>
        
        <div className="bg-blue-50 rounded-[2rem] p-6 border border-blue-100 flex flex-col justify-center">
          <div className="flex items-center gap-3 mb-2">
            <Sparkles className="w-5 h-5 text-blue-600" />
            <h4 className="font-black text-slate-900 text-sm italic uppercase tracking-tight">Daily Inspiration</h4>
          </div>
          <p className="text-blue-600/70 text-xs font-bold leading-relaxed">
            "Knowledge is power. Sharing it is the key to collective growth."
          </p>
        </div>
      </div>

      {/* Main List */}
      {loading ? (
        <div className="grid md:grid-cols-3 gap-8">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-80 bg-slate-100 rounded-[2.5rem] animate-pulse"></div>
          ))}
        </div>
      ) : filteredBooks.length > 0 ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredBooks.map((item, idx) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-2xl hover:border-blue-100 transition-all group flex flex-col overflow-hidden"
            >
              <div className="h-44 bg-slate-50 p-8 flex items-center justify-center relative group-hover:bg-blue-50 transition-colors">
                <div className="w-20 h-24 bg-white rounded-lg shadow-md border border-slate-100 flex items-center justify-center rotate-[-4deg] group-hover:rotate-0 transition-transform">
                  {getCategoryIcon(item.category)}
                </div>
                <div className="absolute top-6 right-6">
                  <Bookmark className="w-5 h-5 text-slate-300 hover:text-blue-500 cursor-pointer transition-colors" />
                </div>
                <div className="absolute bottom-6 left-6">
                  <span className="px-3 py-1 bg-white shadow-sm text-[8px] font-black uppercase tracking-[0.2em] text-blue-600 rounded-lg border border-blue-100">
                    {item.category.replace('_', ' ')}
                  </span>
                </div>
              </div>
              
              <div className="p-8 flex-1 flex flex-col">
                <h4 className="text-xl font-black text-slate-900 leading-tight mb-2 line-clamp-2">{item.title}</h4>
                <div className="flex items-center gap-2 mb-6">
                  <div className="w-5 h-5 bg-slate-100 rounded-full flex items-center justify-center text-[10px] font-black text-slate-400">
                    {item.authorName[0]}
                  </div>
                  <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">{item.authorName}</p>
                </div>
                
                <p className="text-sm text-slate-500 font-medium line-clamp-3 mb-8 leading-relaxed">
                  {item.description}
                </p>

                <div className="mt-auto space-y-6">
                  {/* Reactions */}
                  <div className="flex items-center gap-2">
                    <ReactionBadge 
                      icon={ThumbsUp} 
                      count={item.reactions.impactful.length} 
                      active={item.reactions.impactful.includes(user.uid)}
                      onClick={() => handleReaction(item.id, 'impactful', item.reactions.impactful.includes(user.uid))}
                      color="text-blue-600"
                    />
                    <ReactionBadge 
                      icon={Heart} 
                      count={item.reactions.motivational.length} 
                      active={item.reactions.motivational.includes(user.uid)}
                      onClick={() => handleReaction(item.id, 'motivational', item.reactions.motivational.includes(user.uid))}
                      color="text-rose-500"
                    />
                    <ReactionBadge 
                      icon={Sparkles} 
                      count={item.reactions.inspiring.length} 
                      active={item.reactions.inspiring.includes(user.uid)}
                      onClick={() => handleReaction(item.id, 'inspiring', item.reactions.inspiring.includes(user.uid))}
                      color="text-amber-500"
                    />
                  </div>

                  <div className="flex items-center justify-between pt-6 border-t border-slate-50">
                    <div className="flex items-center gap-3">
                      <button className="flex items-center gap-1.5 text-slate-400 hover:text-slate-900 transition-colors">
                        <MessageSquare className="w-4 h-4" />
                        <span className="text-[10px] font-black tracking-widest">{item.commentsCount}</span>
                      </button>
                      <button 
                        onClick={() => handleRepublish(item.id)}
                        className="flex items-center gap-1.5 text-slate-400 hover:text-blue-600 transition-colors"
                      >
                        <Share2 className="w-4 h-4" />
                        <span className="text-[10px] font-black tracking-widest">{item.reposts.length}</span>
                      </button>
                    </div>
                    <button className="bg-slate-900 text-white px-5 py-2 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-blue-600 transition-all flex items-center gap-2">
                      Read Now <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="text-center py-24 bg-white rounded-[2.5rem] border border-dashed border-slate-200">
          <LibraryIcon className="w-20 h-20 text-slate-200 mx-auto mb-6" />
          <h3 className="text-2xl font-black text-slate-900">The library is quiet...</h3>
          <p className="text-slate-400 font-medium mt-2">Share your first book, poem, or research paper with the community.</p>
        </div>
      )}

      {/* Publishing Modal */}
      <AnimatePresence>
        {isPublishing && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md">
            <motion.div 
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              className="bg-white rounded-[2.5rem] p-10 max-w-3xl w-full shadow-2xl border border-white/20 max-h-[90vh] overflow-y-auto custom-scrollbar"
            >
              <div className="flex items-center justify-between mb-10">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600">
                    <BookOpen className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-black text-slate-900">Publish to e-Library</h3>
                    <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-0.5">Share your creative or academic work</p>
                  </div>
                </div>
                <button onClick={() => setIsPublishing(false)} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                  <X className="w-6 h-6 text-slate-400" />
                </button>
              </div>

              <form onSubmit={handlePublish} className="space-y-8">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3">Title of Work</label>
                    <input 
                      type="text" required
                      placeholder="e.g. The Future of AI in Bharat"
                      className="w-full p-4 bg-slate-50 rounded-2xl border-none focus:ring-2 focus:ring-blue-500 font-bold text-slate-900 placeholder:text-slate-300"
                      value={newBook.title}
                      onChange={(e) => setNewBook(prev => ({ ...prev, title: e.target.value }))}
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3">Category</label>
                    <select 
                      className="w-full p-4 bg-slate-50 rounded-2xl border-none focus:ring-2 focus:ring-blue-500 font-bold text-slate-900 appearance-none"
                      value={newBook.category}
                      onChange={(e) => setNewBook(prev => ({ ...prev, category: e.target.value as any }))}
                    >
                      <option value="book">Book</option>
                      <option value="research_paper">Research Paper</option>
                      <option value="poem">Poem</option>
                      <option value="kahani">Kahani (Story)</option>
                      <option value="natak">Natak (Play)</option>
                      <option value="lekh">Lekh (Article)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3">Snippet or Description</label>
                  <textarea 
                    required rows={3}
                    placeholder="Small summary to entice readers..."
                    className="w-full p-4 bg-slate-50 rounded-2xl border-none focus:ring-2 focus:ring-blue-500 font-medium text-slate-700 placeholder:text-slate-300 resize-none"
                    value={newBook.description}
                    onChange={(e) => setNewBook(prev => ({ ...prev, description: e.target.value }))}
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3">Full Content (Text)</label>
                  <textarea 
                    required rows={8}
                    placeholder="Write your poem, story or research content here..."
                    className="w-full p-6 bg-slate-50 rounded-[2rem] border-none focus:ring-2 focus:ring-blue-500 font-medium text-slate-700 placeholder:text-slate-300 resize-none"
                    value={newBook.content}
                    onChange={(e) => setNewBook(prev => ({ ...prev, content: e.target.value }))}
                  />
                </div>

                <div className="flex gap-4 pt-4">
                  <button type="submit" className="flex-1 py-5 bg-blue-600 text-white rounded-2xl font-black text-lg shadow-xl shadow-blue-200 hover:bg-blue-700 transition-all flex items-center justify-center gap-3">
                    <Send className="w-6 h-6" />
                    Publish to e-Library
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function ReactionBadge({ icon: Icon, count, active, onClick, color }: any) {
  return (
    <button 
      onClick={onClick}
      className={cn(
        "flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[10px] font-black transition-all",
        active ? `bg-slate-900 ${color}` : "bg-slate-50 text-slate-400 hover:bg-slate-100"
      )}
    >
      <Icon className="w-3 h-3" />
      {count}
    </button>
  );
}

function getCategoryIcon(cat: EBook['category']) {
  switch (cat) {
    case 'poem': return <Quote className="w-10 h-10 text-slate-400" />;
    case 'research_paper': return <FileText className="w-10 h-10 text-slate-400" />;
    case 'lekh': return <PenTool className="w-10 h-10 text-slate-400" />;
    default: return <BookIcon className="w-10 h-10 text-slate-400" />;
  }
}
