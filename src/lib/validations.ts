import { z } from 'zod';

export const signUpSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  displayName: z.string().min(2, 'Display name must be at least 2 characters'),
});

export const signInSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const questionSchema = z.object({
  title: z.string()
    .min(5, 'Title must be at least 5 characters')
    .max(100, 'Title must not exceed 100 characters'),
  content: z.string().min(10, 'Content must be at least 10 characters'),
  categoryId: z.string().uuid('Please select a category'),
  tagIds: z.array(z.string().uuid())
    .min(1, 'At least one tag is required')
    .max(5, 'Maximum 5 tags allowed'),
});

export const answerSchema = z.object({
  content: z.string().min(10, 'Answer must be at least 10 characters'),
});

export type SignUpData = z.infer<typeof signUpSchema>;
export type SignInData = z.infer<typeof signInSchema>;
export type QuestionData = z.infer<typeof questionSchema>;
export type AnswerData = z.infer<typeof answerSchema>;