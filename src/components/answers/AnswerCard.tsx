import { motion } from 'framer-motion';
import { ChevronUp, ChevronDown, Check } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';

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

interface AnswerCardProps {
  answer: Answer;
  onVote: (answerId: string, voteType: 'up' | 'down') => void;
  onAccept?: (answerId: string) => void;
  canAccept?: boolean;
}

export function AnswerCard({ answer, onVote, onAccept, canAccept }: AnswerCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-white rounded-lg border p-6 ${
        answer.is_accepted ? 'border-green-200 bg-green-50' : 'border-gray-200'
      }`}
    >
      <div className="flex space-x-4">
        {/* Voting */}
        <div className="flex flex-col items-center space-y-2">
          <button
            onClick={() => onVote(answer.id, 'up')}
            className={`p-2 rounded-full transition-colors ${
              answer.user_vote === 'up'
                ? 'bg-green-100 text-green-600'
                : 'hover:bg-gray-100 text-gray-400'
            }`}
          >
            <ChevronUp size={20} />
          </button>
          
          <span className={`text-lg font-semibold ${
            answer.vote_score > 0 ? 'text-green-600' : 
            answer.vote_score < 0 ? 'text-red-600' : 'text-gray-600'
          }`}>
            {answer.vote_score}
          </span>
          
          <button
            onClick={() => onVote(answer.id, 'down')}
            className={`p-2 rounded-full transition-colors ${
              answer.user_vote === 'down'
                ? 'bg-red-100 text-red-600'
                : 'hover:bg-gray-100 text-gray-400'
            }`}
          >
            <ChevronDown size={20} />
          </button>

          {answer.is_accepted && (
            <div className="text-green-600 mt-2">
              <Check size={24} />
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 space-y-4">
          <div 
            className="prose prose-sm max-w-none"
            dangerouslySetInnerHTML={{ __html: answer.content }}
          />

          {/* Footer */}
          <div className="flex items-center justify-between pt-4 border-t border-gray-100">
            <div className="flex items-center space-x-2">
              <Avatar seed={answer.profiles.avatar_seed} size="sm" />
              <div>
                <p className="text-sm font-medium text-gray-900">
                  {answer.profiles.display_name}
                </p>
                <p className="text-xs text-gray-500">
                  Answered {formatDistanceToNow(new Date(answer.created_at), { addSuffix: true })}
                </p>
              </div>
            </div>

            {canAccept && onAccept && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => onAccept(answer.id)}
                className="flex items-center space-x-1"
              >
                <Check size={16} />
                <span>Accept Answer</span>
              </Button>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}