import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Eye, MessageCircle, Clock, Check } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { toast } from 'react-hot-toast';
import { Button } from '@/components/ui/Button';
import { Avatar } from '@/components/ui/Avatar';
import { RichTextEditor } from '@/components/editor/RichTextEditor';
import { AnswerCard } from '@/components/answers/AnswerCard';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';

interface Question {
  id: string;
  title: string;
  content: string;
  view_count: number;
  created_at: string;
  accepted_answer_id: string | null;
  profiles: {
    id: string;
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
}

interface Answer {
  id: string;
  content: string;
  vote_score: number;
  is_accepted: boolean;
  created_at: string;
  profiles: {
    id: string;
    display_name: string;
    avatar_seed: string;
  };
  user_vote?: 'up' | 'down' | null;
}

interface QuestionDetailProps {
  questionId: string;
  onBack: () => void;
}

export function QuestionDetail({ questionId, onBack }: QuestionDetailProps) {
  const { profile } = useAuth();
  const [question, setQuestion] = useState<Question | null>(null);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [loading, setLoading] = useState(true);
  const [submittingAnswer, setSubmittingAnswer] = useState(false);
  const [answerContent, setAnswerContent] = useState('');

  useEffect(() => {
    fetchQuestion();
    fetchAnswers();
    incrementViewCount();
  }, [questionId]);

  const fetchQuestion = async () => {
    try {
      const { data, error } = await supabase
        .from('questions')
        .select(`
          *,
          profiles:author_id (id, display_name, avatar_seed),
          categories:category_id (name),
          question_tags (
            tags (name)
          )
        `)
        .eq('id', questionId)
        .single();

      if (error) throw error;
      setQuestion(data);
    } catch (error) {
      console.error('Error fetching question:', error);
      toast.error('Failed to load question');
    } finally {
      setLoading(false);
    }
  };

  const fetchAnswers = async () => {
    try {
      const { data, error } = await supabase
        .from('answers')
        .select(`
          *,
          profiles:author_id (id, display_name, avatar_seed)
        `)
        .eq('question_id', questionId)
        .order('is_accepted', { ascending: false })
        .order('vote_score', { ascending: false });

      if (error) throw error;

      // Fetch user votes if authenticated
      if (profile && data) {
        const answerIds = data.map(answer => answer.id);
        const { data: votes, error: votesError } = await supabase
          .from('votes')
          .select('answer_id, vote_type')
          .eq('user_id', profile.id)
          .in('answer_id', answerIds);

        if (!votesError) {
          const answersWithVotes = data.map(answer => ({
            ...answer,
            user_vote: votes?.find(vote => vote.answer_id === answer.id)?.vote_type || null,
          }));
          setAnswers(answersWithVotes);
        } else {
          setAnswers(data);
        }
      } else {
        setAnswers(data || []);
      }
    } catch (error) {
      console.error('Error fetching answers:', error);
    }
  };

  const incrementViewCount = async () => {
    try {
      await supabase.rpc('increment_question_views', { question_uuid: questionId });
    } catch (error) {
      console.error('Error incrementing view count:', error);
    }
  };

  const submitAnswer = async () => {
    if (!profile || !answerContent.trim()) return;

    setSubmittingAnswer(true);
    try {
      const { error } = await supabase
        .from('answers')
        .insert({
          content: answerContent,
          question_id: questionId,
          author_id: profile.id,
        });

      if (error) throw error;

      toast.success('Answer submitted successfully!');
      setAnswerContent('');
      fetchAnswers();
    } catch (error: any) {
      toast.error(error.message || 'Failed to submit answer');
    } finally {
      setSubmittingAnswer(false);
    }
  };

  const handleVote = async (answerId: string, voteType: 'up' | 'down') => {
    if (!profile) {
      toast.error('Please sign in to vote');
      return;
    }

    try {
      const answer = answers.find(a => a.id === answerId);
      if (!answer) return;

      // Check if user already voted
      if (answer.user_vote === voteType) {
        // Remove vote
        await supabase
          .from('votes')
          .delete()
          .eq('user_id', profile.id)
          .eq('answer_id', answerId);
      } else if (answer.user_vote) {
        // Update existing vote
        await supabase
          .from('votes')
          .update({ vote_type: voteType })
          .eq('user_id', profile.id)
          .eq('answer_id', answerId);
      } else {
        // Create new vote
        await supabase
          .from('votes')
          .insert({
            user_id: profile.id,
            answer_id: answerId,
            vote_type: voteType,
          });
      }

      fetchAnswers();
    } catch (error: any) {
      toast.error(error.message || 'Failed to vote');
    }
  };

  const acceptAnswer = async (answerId: string) => {
    if (!profile || !question || question.profiles.id !== profile.id) return;

    try {
      // Update question to set accepted answer
      await supabase
        .from('questions')
        .update({ accepted_answer_id: answerId })
        .eq('id', questionId);

      // Update answer to mark as accepted
      await supabase
        .from('answers')
        .update({ is_accepted: true })
        .eq('id', answerId);

      // Unmark other answers
      await supabase
        .from('answers')
        .update({ is_accepted: false })
        .eq('question_id', questionId)
        .neq('id', answerId);

      toast.success('Answer accepted!');
      fetchQuestion();
      fetchAnswers();
    } catch (error: any) {
      toast.error(error.message || 'Failed to accept answer');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg text-gray-600">Loading question...</div>
      </div>
    );
  }

  if (!question) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600">Question not found</p>
        <Button onClick={onBack} className="mt-4">
          Go Back
        </Button>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      {/* Back Button */}
      <Button variant="ghost" onClick={onBack} className="flex items-center space-x-2">
        <ArrowLeft size={16} />
        <span>Back to Questions</span>
      </Button>

      {/* Question */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-start justify-between">
            <h1 className="text-2xl font-bold text-gray-900">{question.title}</h1>
            <span className="text-sm bg-gray-100 text-gray-600 px-3 py-1 rounded-full">
              {question.categories.name}
            </span>
          </div>

          {/* Content */}
          <div 
            className="prose prose-sm max-w-none"
            dangerouslySetInnerHTML={{ __html: question.content }}
          />

          {/* Tags */}
          {question.question_tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {question.question_tags.map((qt, index) => (
                <span
                  key={index}
                  className="inline-block px-3 py-1 text-sm bg-blue-100 text-blue-800 rounded-full"
                >
                  {qt.tags.name}
                </span>
              ))}
            </div>
          )}

          {/* Footer */}
          <div className="flex items-center justify-between pt-4 border-t border-gray-100">
            <div className="flex items-center space-x-2">
              <Avatar seed={question.profiles.avatar_seed} size="md" />
              <div>
                <p className="text-sm font-medium text-gray-900">{question.profiles.display_name}</p>
                <p className="text-xs text-gray-500">
                  Asked {formatDistanceToNow(new Date(question.created_at), { addSuffix: true })}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-4 text-sm text-gray-500">
              <div className="flex items-center space-x-1">
                <Eye size={16} />
                <span>{question.view_count} views</span>
              </div>
              <div className="flex items-center space-x-1">
                <MessageCircle size={16} />
                <span>{answers.length} answers</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Answers */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-900">
          {answers.length} {answers.length === 1 ? 'Answer' : 'Answers'}
        </h2>

        {answers.map((answer) => (
          <AnswerCard
            key={answer.id}
            answer={answer}
            onVote={handleVote}
            onAccept={question.profiles.id === profile?.id ? acceptAnswer : undefined}
            canAccept={question.profiles.id === profile?.id && !answer.is_accepted}
          />
        ))}
      </div>

      {/* Answer Form */}
      {profile && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Answer</h3>
          <div className="space-y-4">
            <RichTextEditor
              content={answerContent}
              onChange={setAnswerContent}
              placeholder="Write your answer here..."
            />
            <div className="flex justify-end">
              <Button
                onClick={submitAnswer}
                loading={submittingAnswer}
                disabled={!answerContent.trim()}
              >
                Submit Answer
              </Button>
            </div>
          </div>
        </div>
      )}

      {!profile && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
          <p className="text-blue-800">
            Please sign in to submit an answer
          </p>
        </div>
      )}
    </motion.div>
  );
}