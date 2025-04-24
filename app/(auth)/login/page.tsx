'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useActionState, useEffect, useState } from 'react';
import { toast } from '@/components/toast';

import { AuthForm } from '@/components/auth-form';
import { SubmitButton } from '@/components/submit-button';
import AnimatedGradient from '@/components/animated-gradient';
import FloatingElements from '@/components/floating-elements';

import { login, type LoginActionState } from '../actions';

export default function Page() {
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [isSuccessful, setIsSuccessful] = useState(false);
  const [mounted, setMounted] = useState(false);

  const [state, formAction] = useActionState<LoginActionState, FormData>(
    login,
    {
      status: 'idle',
    },
  );

  useEffect(() => {
    setMounted(true);

    if (state.status === 'failed') {
      toast({
        type: 'error',
        description: 'Invalid credentials!',
      });
    } else if (state.status === 'invalid_data') {
      toast({
        type: 'error',
        description: 'Failed validating your submission!',
      });
    } else if (state.status === 'success') {
      setIsSuccessful(true);
      router.refresh();
    }
  }, [state.status, router]);

  const handleSubmit = (formData: FormData) => {
    setEmail(formData.get('email') as string);
    formAction(formData);
  };

  if (!mounted) return null;

  return (
    <div className="flex h-dvh w-screen items-start pt-12 md:pt-0 md:items-center justify-center relative overflow-hidden">
      {/* Animated background */}
      <AnimatedGradient />
      <FloatingElements />

      <div className="w-full max-w-md overflow-hidden rounded-[20px] shadow-lg bg-white/80 backdrop-blur-lg  flex flex-col gap-12 p-6 z-10 transition-all duration-300">
        <div className="flex flex-col items-center justify-center gap-2 px-4 text-center sm:px-16">
          <h3 className="text-xl font-semibold text-gray-900">Sign In</h3>
          <p className="text-sm text-gray-500">
            Use your email and{' '}
            <span className="text-blue-600 font-medium">password</span> to
            sign in
          </p>
        </div>
        <AuthForm action={handleSubmit} defaultEmail={email}>
          <SubmitButton
            isSuccessful={isSuccessful}
            className="text-blue-600 hover:text-blue-600 transition-all duration-200 hover:scale-110"
          >
            Sign in
          </SubmitButton>
          <p className="text-center text-sm text-gray-600 mt-4">
            {"Don't have an account? "}
            <Link
              href="/register"
              className="font-medium text-blue-600 hover:text-blue-500 transition-colors"
            >
              Sign up
            </Link>
            {' for free.'}
          </p>
        </AuthForm>
      </div>
    </div>
  );
}
