import { useState, useEffect } from 'react';
import { Toaster } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { ErrorBoundary } from '@/components/ui/ErrorBoundary';
import { OfflineIndicator } from '@/components/layout/OfflineIndicator';
import { SkeletonList, PageLoader } from '@/components/ui/LoadingStates';
import { Header } from '@/components/layout/Header';
import { QuestionCard } from '@/components/questions/QuestionCard';
import { QuestionDetail } from '@/components/questions/QuestionDetail';
import { AskQuestionModal } from '@/components/questions/AskQuestionModal';
import { useAuth } from '@/hooks/useAuth';
import { useDebounce } from '@/hooks/useDebounce';
import { supabase } from '@/lib/supabase';
import { initPerformanceMonitoring, markPerformance } from '@/lib/performance';
import { initMonitoring } from '@/lib/monitoring';

interface Question {
  id: string;
  title: string;
  content: string;
  view_count: number;
  created_at: string;
  profiles: {
    display_name: string;
    avatar_seed: string;
  };
  categories: {
    name: string;
  };
  question_tags: Array<{
    tags: {
      name: string;
    };
  }>;
  answers: Array<{ id: string }>;
}

function App() {
  const { loading: authLoading } = useAuth();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearchQuery = useDebounce(searchQuery, 300);
  const [selectedQuestionId, setSelectedQuestionId] = useState<string | null>(null);
  const [askQuestionOpen, setAskQuestionOpen] = useState(false);

  // Initialize monitoring
  useEffect(() => {
    initPerformanceMonitoring();
    initMonitoring();
    markPerformance('app-initialized');
  }, []);

  useEffect(() => {
    fetchQuestions();
    
    // Subscribe to real-time updates
    const subscription = supabase
      .channel('questions')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'questions' },
        () => {
          fetchQuestions();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Use debounced search for better performance
  const fetchQuestions = async () => {
    try {
      const { data, error } = await supabase
        .from('questions')
        .select(`
          *,
          profiles:author_id (display_name, avatar_seed),
          categories:category_id (name),
          question_tags (
            tags (name)
          ),
          answers (id)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setQuestions(data || []);
    } catch (error) {
      console.error('Error fetching questions:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredQuestions = questions.filter(question =>
    question.title.toLowerCase().includes(debouncedSearchQuery.toLowerCase()) ||
    question.content.toLowerCase().includes(debouncedSearchQuery.toLowerCase()) ||
    question.question_tags.some(qt => 
      qt.tags.name.toLowerCase().includes(debouncedSearchQuery.toLowerCase())
    )
  );

  if (authLoading) {
    return <PageLoader />;
  }

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gray-50">
        <OfflineIndicator />
        <Header
          onAskQuestion={() => setAskQuestionOpen(true)}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
        />

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <AnimatePresence mode="wait">
            {selectedQuestionId ? (
              <QuestionDetail
                key="question-detail"
                questionId={selectedQuestionId}
                onBack={() => setSelectedQuestionId(null)}
              />
            ) : (
              <motion.div
                key="questions-list"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-6"
              >
                {/* Header */}
                <div className="flex items-center justify-between">
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900">Questions</h1>
                    <p className="text-gray-600 mt-1">
                      {debouncedSearchQuery ? `Found ${filteredQuestions.length} results` : `${questions.length} questions`}
                    </p>
                  </div>
                </div>

                {/* Questions */}
                {loading ? (
                  <SkeletonList count={5} />
                ) : filteredQuestions.length === 0 ? (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-center py-12"
                    >
                      <div className="text-gray-400 mb-4">
                        <svg className="mx-auto h-24 w-24" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <h3 className="text-lg font-medium text-gray-900 mb-2">
                        {debouncedSearchQuery ? 'No questions found' : 'No questions yet'}
                      </h3>
                      <p className="text-gray-600 mb-6">
                        {debouncedSearchQuery 
                          ? 'Try adjusting your search terms.' 
                          : 'Be the first to ask a question in the community!'
                        }
                      </p>
                    </motion.div>
                ) : (
                  <div className="space-y-4">
                    {filteredQuestions.map((question, index) => (
                      <motion.div
                        key={question.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                      >
                        <QuestionCard
                          question={question}
                          onClick={() => setSelectedQuestionId(question.id)}
                        />
                      </motion.div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </main>

        <AskQuestionModal
          isOpen={askQuestionOpen}
          onClose={() => setAskQuestionOpen(false)}
          onSuccess={fetchQuestions}
        />

        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#363636',
              color: '#fff',
            },
          }}
        />
      </div>
    </ErrorBoundary>
  );
}

export default App;