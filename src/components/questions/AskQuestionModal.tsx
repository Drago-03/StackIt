import { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'react-hot-toast';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { RichTextEditor } from '@/components/editor/RichTextEditor';
import { TagSelector } from '@/components/tags/TagSelector';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';
import { questionSchema, QuestionData } from '@/lib/validations';

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface AskQuestionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function AskQuestionModal({ isOpen, onClose, onSuccess }: AskQuestionModalProps) {
  const { profile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);

  const { control, register, handleSubmit, formState: { errors }, reset, setValue, watch } = useForm<QuestionData>({
    resolver: zodResolver(questionSchema),
    defaultValues: {
      title: '',
      content: '',
      categoryId: '',
      tagIds: [],
    },
  });

  useEffect(() => {
    if (isOpen) {
      fetchCategories();
    }
  }, [isOpen]);

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name');

      if (error) throw error;
      setCategories(data || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const onSubmit = async (data: QuestionData) => {
    if (!profile) return;

    setLoading(true);
    try {
      // Create question
      const { data: question, error: questionError } = await supabase
        .from('questions')
        .insert({
          title: data.title,
          content: data.content,
          category_id: data.categoryId,
          author_id: profile.id,
        })
        .select()
        .single();

      if (questionError) throw questionError;

      // Add tags
      if (data.tagIds.length > 0) {
        const tagInserts = data.tagIds.map(tagId => ({
          question_id: question.id,
          tag_id: tagId,
        }));

        const { error: tagsError } = await supabase
          .from('question_tags')
          .insert(tagInserts);

        if (tagsError) throw tagsError;
      }

      toast.success('Question posted successfully!');
      reset();
      onSuccess();
      onClose();
    } catch (error: any) {
      toast.error(error.message || 'Failed to post question');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Ask a Question" size="lg">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <Input
          label="Title"
          placeholder="What's your question? Be specific."
          {...register('title')}
          error={errors.title?.message}
          helper="5-100 characters"
        />

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Description
          </label>
          <Controller
            name="content"
            control={control}
            render={({ field }) => (
              <RichTextEditor
                content={field.value}
                onChange={field.onChange}
                placeholder="Provide details about your question..."
              />
            )}
          />
          {errors.content && (
            <p className="text-sm text-red-600 mt-1">{errors.content.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Category
          </label>
          <select
            {...register('categoryId')}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Select a category</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
          {errors.categoryId && (
            <p className="text-sm text-red-600 mt-1">{errors.categoryId.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tags
          </label>
          <Controller
            name="tagIds"
            control={control}
            render={({ field }) => (
              <TagSelector
                selectedTagIds={field.value}
                onChange={field.onChange}
                maxTags={5}
              />
            )}
          />
          {errors.tagIds && (
            <p className="text-sm text-red-600 mt-1">{errors.tagIds.message}</p>
          )}
        </div>

        <div className="flex justify-end space-x-3">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" loading={loading}>
            Post Question
          </Button>
        </div>
      </form>
    </Modal>
  );
}