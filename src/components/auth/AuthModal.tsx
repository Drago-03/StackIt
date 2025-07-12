import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useAuth } from '@/hooks/useAuth';
import { signUpSchema, signInSchema, SignUpData, SignInData } from '@/lib/validations';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: 'signin' | 'signup';
  onModeChange: (mode: 'signin' | 'signup') => void;
}

export function AuthModal({ isOpen, onClose, mode, onModeChange }: AuthModalProps) {
  const [loading, setLoading] = useState(false);
  const { signIn, signUp } = useAuth();

  const signInForm = useForm<SignInData>({
    resolver: zodResolver(signInSchema),
  });

  const signUpForm = useForm<SignUpData>({
    resolver: zodResolver(signUpSchema),
  });

  const handleSignIn = async (data: SignInData) => {
    setLoading(true);
    try {
      await signIn(data.email, data.password);
      toast.success('Signed in successfully!');
      onClose();
    } catch (error: any) {
      toast.error(error.message || 'Failed to sign in');
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (data: SignUpData) => {
    setLoading(true);
    try {
      await signUp(data.email, data.password, data.displayName);
      toast.success('Account created successfully!');
      onClose();
    } catch (error: any) {
      toast.error(error.message || 'Failed to create account');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={mode === 'signin' ? 'Sign In' : 'Create Account'}>
      <div className="space-y-6">
        {mode === 'signin' ? (
          <form onSubmit={signInForm.handleSubmit(handleSignIn)} className="space-y-4">
            <Input
              label="Email"
              type="email"
              {...signInForm.register('email')}
              error={signInForm.formState.errors.email?.message}
            />
            <Input
              label="Password"
              type="password"
              {...signInForm.register('password')}
              error={signInForm.formState.errors.password?.message}
            />
            <Button type="submit" loading={loading} className="w-full">
              Sign In
            </Button>
          </form>
        ) : (
          <form onSubmit={signUpForm.handleSubmit(handleSignUp)} className="space-y-4">
            <Input
              label="Display Name"
              {...signUpForm.register('displayName')}
              error={signUpForm.formState.errors.displayName?.message}
            />
            <Input
              label="Email"
              type="email"
              {...signUpForm.register('email')}
              error={signUpForm.formState.errors.email?.message}
            />
            <Input
              label="Password"
              type="password"
              {...signUpForm.register('password')}
              error={signUpForm.formState.errors.password?.message}
            />
            <Button type="submit" loading={loading} className="w-full">
              Create Account
            </Button>
          </form>
        )}

        <div className="text-center">
          <button
            type="button"
            onClick={() => onModeChange(mode === 'signin' ? 'signup' : 'signin')}
            className="text-blue-500 hover:text-blue-600 transition-colors"
          >
            {mode === 'signin' 
              ? "Don't have an account? Sign up" 
              : "Already have an account? Sign in"
            }
          </button>
        </div>
      </div>
    </Modal>
  );
}