import { useState, useEffect } from 'react';
import { collection, query, getDocs, orderBy, limit } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { Book, User } from '../types';
import { motion } from 'framer-motion';
import { 
  BookOpen, 
  Search, 
  Plus,
  ArrowRight,
  Download,
  Bookmark,
  Book as BookIcon,
  Library as LibraryIcon
} from 'lucide-react';
import { cn } from '../lib/utils';

interface LibraryProps {
  user: User;
}

export default function Library({ user }: LibraryProps) {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchBooks = async () => {
      setLoading(true);
      try {
        const q = query(
          collection(db, 'library'),
          orderBy('createdAt', 'desc'),
          limit(20)
        );
        const snapshot = await getDocs(q);
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Book));
        setBooks(data);
      } catch (error) {
        handleFirestoreError(error, OperationType.LIST, 'library');
      } finally {
        setLoading(false);
      }
    };

    fetchBooks();
  }, []);

  const filteredBooks = books.filter(item => 
    item.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    item.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const categories = ['Engineering', 'Medical', 'Arts', 'Commerce', 'Tech', 'Fiction'];

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Oledge Library</h2>
          <p className="text-slate-500 font-medium mt-1 uppercase tracking-wider text-xs">Publish and discover academic resources</p>
        </div>
        <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-2xl font-bold text-sm transition-all shadow-lg shadow-blue-200 flex items-center gap-2">
          <Plus className="w-5 h-5" />
          Publish Book
        </button>
      </div>

      <div className="flex overflow-x-auto gap-3 pb-2 no-scrollbar">
        {categories.map((cat) => (
          <button
            key={cat}
            className="px-6 py-2 bg-white border border-slate-100 rounded-full text-sm font-bold text-slate-600 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-100 transition-all whitespace-nowrap"
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
          <input 
            type="text" 
            placeholder="Search by book title, author, or category..." 
            className="w-full pl-12 pr-4 py-3 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500 transition-all font-medium"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <div className="grid md:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-64 bg-slate-100 rounded-3xl animate-pulse"></div>
          ))}
        </div>
      ) : filteredBooks.length > 0 ? (
        <div className="grid md:grid-cols-4 gap-6">
          {filteredBooks.map((item, idx) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: idx * 0.05 }}
              className="bg-white rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl hover:border-blue-100 transition-all group flex flex-col"
            >
              <div className="h-48 bg-slate-50 p-6 flex items-center justify-center relative overflow-hidden">
                <BookIcon className="w-20 h-20 text-slate-200 group-hover:scale-110 transition-transform" />
                <div className="absolute top-4 right-4">
                  <Bookmark className="w-5 h-5 text-slate-300 hover:text-blue-500 cursor-pointer transition-colors" />
                </div>
                <div className="absolute bottom-4 left-4">
                  <span className="px-3 py-1 bg-white/80 backdrop-blur-sm text-[10px] font-black uppercase tracking-widest text-blue-600 rounded-full border border-blue-50">
                    {item.category}
                  </span>
                </div>
              </div>
              
              <div className="p-6 flex-1 flex flex-col">
                <h4 className="font-black text-slate-900 leading-tight mb-1 line-clamp-2">{item.title}</h4>
                <p className="text-xs text-slate-500 font-medium mb-4 italic">by {item.author}</p>
                
                <p className="text-xs text-slate-400 font-medium line-clamp-2 mb-6 flex-1">
                  {item.description}
                </p>

                <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                  <button className="text-slate-400 hover:text-blue-600 transition-colors">
                    <Download className="w-5 h-5" />
                  </button>
                  <button className="text-blue-600 font-bold text-sm flex items-center gap-1 hover:gap-2 transition-all">
                    Read <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-slate-200">
          <LibraryIcon className="w-16 h-16 text-slate-200 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-slate-900">No books found</h3>
          <p className="text-slate-500 mt-1">Be the first to publish a resource</p>
        </div>
      )}
    </div>
  );
}
