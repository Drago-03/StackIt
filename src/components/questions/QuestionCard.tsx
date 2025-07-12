import { motion } from 'framer-motion';
import { Eye, MessageCircle, Clock } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { Avatar } from '@/components/ui/Avatar';

interface QuestionCardProps {
  question: {
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
  };
  onClick: () => void;
}

export function QuestionCard({ question, onClick }: QuestionCardProps) {
  const answerCount = question.answers?.length || 0;
  const hasAcceptedAnswer = false; // TODO: Implement accepted answer logic

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      className="bg-white rounded-lg border border-gray-200 p-6 cursor-pointer hover:shadow-md transition-shadow"
      onClick={onClick}
    >
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between">
          <h3 className="text-lg font-semibold text-gray-900 hover:text-blue-600 transition-colors">
            {question.title}
          </h3>
          <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
            {question.categories.name}
          </span>
        </div>

        {/* Content Preview */}
        <div 
          className="text-gray-600 text-sm line-clamp-3"
          dangerouslySetInnerHTML={{ 
            __html: question.content.replace(/<[^>]*>/g, '').substring(0, 200) + '...' 
          }}
        />

        {/* Tags */}
        {question.question_tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {question.question_tags.map((qt, index) => (
              <span
                key={index}
                className="inline-block px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full"
              >
                {qt.tags.name}
              </span>
            ))}
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
          {/* Author */}
          <div className="flex items-center space-x-2">
            <Avatar seed={question.profiles.avatar_seed} size="sm" />
            <span className="text-sm text-gray-600">{question.profiles.display_name}</span>
          </div>

          {/* Stats */}
          <div className="flex items-center space-x-4 text-sm text-gray-500">
            <div className="flex items-center space-x-1">
              <Eye size={16} />
              <span>{question.view_count}</span>
            </div>
            <div className={`flex items-center space-x-1 ${hasAcceptedAnswer ? 'text-green-600' : ''}`}>
              <MessageCircle size={16} />
              <span>{answerCount}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Clock size={16} />
              <span>{formatDistanceToNow(new Date(question.created_at), { addSuffix: true })}</span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}