'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useActionState, useEffect, useState, useRef } from 'react';
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
  const [isLeaving, setIsLeaving] = useState(false);
  const formRef = useRef<HTMLDivElement>(null);

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

  const handleNavigateRegister = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsLeaving(true);
    setTimeout(() => {
      router.push('/register');
    }, 500); // match slide-out duration
  };

  return (
    <div className="relative flex h-dvh w-screen items-start pt-12 md:pt-0 md:items-center justify-center overflow-hidden">
      {/* Animated background */}
      <AnimatedGradient />
      <FloatingElements />

      <div
        ref={formRef}
        className={`z-10 w-full max-w-md overflow-hidden rounded-[20px] border border-gray-300 bg-white/80 backdrop-blur-lg flex flex-col gap-12 p-6 transition-all duration-300 animate-fade-in ${isLeaving ? 'animate-slide-out' : 'animate-slide-in'}`}
      >
        <div className="flex flex-col items-center justify-center gap-2 px-4 text-center sm:px-16">
          <h3 className="text-xl font-semibold text-gray-900">Sign In</h3>
          <p className="text-sm text-gray-500">
            Use your email and <span className="text-blue-600 font-medium">password</span> to sign in
          </p>
        </div>
        <AuthForm action={handleSubmit} defaultEmail={email}>
          <SubmitButton
            isSuccessful={isSuccessful}
            className="bg-blue-600 hover:bg-blue-700 transition-all duration-200 hover:scale-[1.02] text-white"
          >
            Sign In
          </SubmitButton>
          <p className="mt-4 text-center text-sm text-gray-600 transition-all duration-300">
            {"Don't have an account? "}
            <a
              href="/register"
              onClick={handleNavigateRegister}
              className="font-medium text-blue-600 hover:text-blue-500 transition-colors cursor-pointer"
            >
              Sign up
            </a>
            {' for free.'}
          </p>
        </AuthForm>
      </div>
    </div>
  );
}
