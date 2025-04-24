'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useActionState, useEffect, useState } from 'react';
import { toast } from '@/components/toast';

import { AuthForm } from '@/components/auth-form';
import { SubmitButton } from '@/components/submit-button';
import AnimatedGradient from '@/components/animated-gradient';
import FloatingElements from '@/components/floating-elements';

import { register, type RegisterActionState } from '../actions';

export default function Page() {
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [nickname, setNickname] = useState('');       // Новое поле
  const [isSuccessful, setIsSuccessful] = useState(false);
  const [mounted, setMounted] = useState(false);

  const [state, formAction] = useActionState<RegisterActionState, FormData>(
    register,
    {
      status: 'idle',
    },
  );

  useEffect(() => {
    setMounted(true);

    // Обработка различных состояний (ошибок, успеха и т.д.)
    if (state.status === 'user_exists') {
      toast({ type: 'error', description: 'Account already exists!' });
    } else if (state.status === 'failed') {
      toast({ type: 'error', description: 'Failed to create account!' });
    } else if (state.status === 'invalid_data') {
      toast({
        type: 'error',
        description: 'Failed validating your submission!',
      });
    } else if (state.status === 'success') {
      toast({ type: 'success', description: 'Account created successfully!' });

      setIsSuccessful(true);
      router.refresh();
    }
  }, [state.status, router]);

  // Пока компонент не смонтирован, ничего не рендерим (для предотвращения проблем с SSR/hydration)
  if (!mounted) return null;

  const handleSubmit = (formData: FormData) => {
    setEmail(formData.get('email') as string);
    setNickname(formData.get('nickname') as string); // Считываем nickname из формы
    formAction(formData);
  };

  return (
    <div className="relative flex h-dvh w-screen items-start pt-12 md:pt-0 md:items-center justify-center overflow-hidden">
      {/* Анимированный градиент и плавающие элементы на фоне */}
      <AnimatedGradient />
      <FloatingElements />

      <div className="z-10 w-full max-w-md overflow-hidden rounded-[20px] border border-gray-300 bg-white/80 backdrop-blur-lg flex flex-col gap-12 p-6 transition-all duration-300">
        <div className="flex flex-col items-center justify-center gap-2 px-4 text-center sm:px-16">
          <h3 className="text-xl font-semibold text-gray-900">Sign Up</h3>
          <p className="text-sm text-gray-500">
            Create an account with your email, password, and nickname
          </p>
        </div>

        {/* Форма, которая внутри отрисует Email, Password, Nickname и т.д. */}
        <AuthForm action={handleSubmit} defaultEmail={email}>
          {/* Submit-кнопка */}
          <SubmitButton
            isSuccessful={isSuccessful}
            className="bg-blue-600 hover:bg-blue-700 transition-all duration-200 hover:scale-[1.02]"
          >
            Sign Up
          </SubmitButton>

          <p className="mt-4 text-center text-sm text-gray-600">
            {'Already have an account? '}
            <Link
              href="/login"
              className="font-medium text-blue-600 hover:text-blue-500 transition-colors"
            >
              Sign in
            </Link>
            {' instead.'}
          </p>
        </AuthForm>
      </div>
    </div>
  );
}
