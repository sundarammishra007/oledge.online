import { useState, useEffect } from 'react';
import { 
  collection, 
  query, 
  getDocs, 
  orderBy, 
  limit, 
  onSnapshot,
  addDoc,
  serverTimestamp 
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { User } from '../types';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Trophy, 
  Search, 
  Plus,
  ArrowRight,
  Clock,
  Layout,
  Code,
  Zap,
  Globe,
  Star,
  X,
  Send,
  Timer
} from 'lucide-react';
import { cn } from '../lib/utils';

interface Quiz {
  id: string;
  title: string;
  description: string;
  category: 'tech' | 'aptitude' | 'general' | 'coding';
  questionsCount: number;
  timeLimit: number; // in minutes
  difficulty: 'easy' | 'medium' | 'hard';
  creatorName: string;
  createdAt: any;
}

interface QuizzesProps {
  user: User;
}

export default function Quizzes({ user }: QuizzesProps) {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);

  const [newQuiz, setNewQuiz] = useState({
    title: '',
    description: '',
    category: 'tech' as Quiz['category'],
    questionsCount: 10,
    timeLimit: 15,
    difficulty: 'easy' as Quiz['difficulty']
  });

  useEffect(() => {
    const q = query(
      collection(db, 'quizzes'),
      orderBy('createdAt', 'desc'),
      limit(20)
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Quiz));
      setQuizzes(data);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'quizzes');
    });

    return () => unsubscribe();
  }, []);

  const handleAddQuiz = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addDoc(collection(db, 'quizzes'), {
        ...newQuiz,
        creatorName: user.name,
        creatorId: user.uid,
        createdAt: serverTimestamp(),
      });
      setShowAddModal(false);
      setNewQuiz({
        title: '',
        description: '',
        category: 'tech',
        questionsCount: 10,
        timeLimit: 15,
        difficulty: 'easy'
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'quizzes');
    }
  };

  const categories = [
    { name: 'All Quizzes', id: 'all', icon: Layout },
    { name: 'Tech', id: 'tech', icon: Code },
    { name: 'Aptitude', id: 'aptitude', icon: Zap },
    { name: 'General', id: 'general', icon: Globe },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-10 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm">
        <div className="flex items-center gap-6">
          <div className="w-16 h-16 bg-amber-500 rounded-3xl flex items-center justify-center text-white shadow-xl shadow-amber-100">
            <Trophy className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-4xl font-black text-slate-900 tracking-tighter">Campus Quizzes</h2>
            <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] mt-1">Test your knowledge & climb the leaderboard</p>
          </div>
        </div>
        {(user.role === 'college' || user.role === 'admin') && (
          <button 
            onClick={() => setShowAddModal(true)}
            className="w-full md:w-auto bg-slate-900 text-white px-8 py-4 rounded-2xl font-black text-sm uppercase tracking-widest transition-all hover:bg-amber-500 active:scale-95 flex items-center justify-center gap-3"
          >
            <Plus className="w-6 h-6" />
            Create Quiz
          </button>
        )}
      </div>

      {/* List */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        {loading ? (
          [1, 2, 3].map(i => <div key={i} className="h-64 bg-slate-50 rounded-[2.5rem] animate-pulse"></div>)
        ) : quizzes.length > 0 ? (
          quizzes.map((quiz, idx) => (
            <motion.div
              key={quiz.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: idx * 0.05 }}
              className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-2xl hover:border-amber-100 transition-all flex flex-col group relative overflow-hidden"
            >
              <div className="flex items-start justify-between mb-8">
                <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 group-hover:bg-amber-50 group-hover:text-amber-600 transition-all duration-300">
                  <Star className="w-7 h-7" />
                </div>
                <div className="flex flex-col items-end gap-2">
                  <span className="px-3 py-1 bg-amber-50 text-amber-600 border border-amber-100 rounded-lg text-[8px] font-black uppercase tracking-widest">
                    {quiz.difficulty}
                  </span>
                </div>
              </div>

              <h3 className="text-2xl font-black text-slate-900 leading-tight mb-2 group-hover:text-amber-600 transition-colors uppercase tracking-tight">{quiz.title}</h3>
              <p className="text-[10px] text-slate-400 font-black mb-6 tracking-widest uppercase italic">Organized by {quiz.creatorName}</p>
              
              <p className="text-xs text-slate-500 font-medium line-clamp-2 mb-8 leading-relaxed">
                {quiz.description}
              </p>

              <div className="flex items-center gap-4 mb-8">
                <div className="flex items-center gap-1.5 text-slate-400 text-[10px] font-black uppercase tracking-widest">
                  <Timer className="w-4 h-4 text-amber-500" />
                  {quiz.timeLimit}m
                </div>
                <div className="flex items-center gap-1.5 text-slate-400 text-[10px] font-black uppercase tracking-widest">
                  <Layout className="w-4 h-4 text-amber-500" />
                  {quiz.questionsCount} Qs
                </div>
              </div>

              <div className="mt-auto pt-6 border-t border-slate-50 flex items-center justify-center">
                <button className="w-full bg-slate-50 text-slate-900 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-amber-500 hover:text-white transition-all active:scale-95 flex items-center justify-center gap-2">
                  Start Challenge <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          ))
        ) : (
          <div className="col-span-full text-center py-24 bg-white rounded-[3rem] border border-dashed border-slate-200">
            <Trophy className="w-20 h-20 text-slate-200 mx-auto mb-6" />
            <h3 className="text-2xl font-black text-slate-900 tracking-tighter">No live quizzes at the moment</h3>
            <p className="text-slate-400 font-medium mt-2">Check back later or represent your college by creating one.</p>
          </div>
        )}
      </div>

      {/* Add Quiz Modal */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md">
            <motion.div 
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              className="bg-white rounded-[3rem] p-10 max-w-3xl w-full shadow-2xl overflow-y-auto max-h-[90vh] custom-scrollbar"
            >
              <div className="flex items-center justify-between mb-10">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-600 shadow-sm">
                    <Trophy className="w-6 h-6" />
                  </div>
                  <h3 className="text-2xl font-black text-slate-900 tracking-tight">Create a New Quiz</h3>
                </div>
                <button onClick={() => setShowAddModal(false)} className="p-2 hover:bg-slate-50 rounded-full transition-colors text-slate-400">
                  <X className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleAddQuiz} className="space-y-8">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Quiz Title</label>
                  <input 
                    required type="text" placeholder="e.g. Advanced JavaScript Patterns"
                    className="w-full p-4 bg-slate-50 rounded-2xl border-none focus:ring-2 focus:ring-amber-500 font-bold text-slate-900"
                    value={newQuiz.title}
                    onChange={(e) => setNewQuiz(prev => ({ ...prev, title: e.target.value }))}
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Category</label>
                    <select 
                      className="w-full p-4 bg-slate-50 rounded-2xl border-none focus:ring-2 focus:ring-amber-500 font-bold text-slate-900"
                      value={newQuiz.category}
                      onChange={(e) => setNewQuiz(prev => ({ ...prev, category: e.target.value as any }))}
                    >
                      <option value="tech">Tech</option>
                      <option value="aptitude">Aptitude</option>
                      <option value="coding">Coding</option>
                      <option value="general">General</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Difficulty</label>
                    <select 
                      className="w-full p-4 bg-slate-50 rounded-2xl border-none focus:ring-2 focus:ring-amber-500 font-bold text-slate-900"
                      value={newQuiz.difficulty}
                      onChange={(e) => setNewQuiz(prev => ({ ...prev, difficulty: e.target.value as any }))}
                    >
                      <option value="easy">Easy</option>
                      <option value="medium">Medium</option>
                      <option value="hard">Hard</option>
                    </select>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Questions Count</label>
                    <input 
                      required type="number" 
                      className="w-full p-4 bg-slate-50 rounded-2xl border-none focus:ring-2 focus:ring-amber-500 font-bold text-slate-900"
                      value={newQuiz.questionsCount}
                      onChange={(e) => setNewQuiz(prev => ({ ...prev, questionsCount: parseInt(e.target.value) }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Time Limit (mins)</label>
                    <input 
                      required type="number"
                      className="w-full p-4 bg-slate-50 rounded-2xl border-none focus:ring-2 focus:ring-amber-500 font-bold text-slate-900"
                      value={newQuiz.timeLimit}
                      onChange={(e) => setNewQuiz(prev => ({ ...prev, timeLimit: parseInt(e.target.value) }))}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Description</label>
                  <textarea 
                    required rows={3}
                    placeholder="Briefly describe what this quiz covers..."
                    className="w-full p-6 bg-slate-50 rounded-3xl border-none focus:ring-2 focus:ring-amber-500 font-medium text-slate-700 resize-none"
                    value={newQuiz.description}
                    onChange={(e) => setNewQuiz(prev => ({ ...prev, description: e.target.value }))}
                  />
                </div>

                <button type="submit" className="w-full py-5 bg-amber-500 text-white rounded-2xl font-black text-lg shadow-xl shadow-amber-100 hover:bg-amber-600 transition-all flex items-center justify-center gap-3">
                  <Send className="w-6 h-6" />
                  Publish Quiz
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
