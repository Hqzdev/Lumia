'use client';

import React, {
  useEffect,
  useState,
  useRef,
  useTransition,
  useActionState,
} from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { toast } from '@/components/toast';

import { Button } from '@/components/ui/button';
import { Eye, EyeOff } from 'lucide-react';
import { login, type LoginActionState } from '../actions';
import { LogoGoogle } from '@/components/icons';

export default function Page() {
  const router = useRouter();

  const [nickname, setNickname] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [password, setPassword] = useState('');
  const passwordInputRef = useRef<HTMLInputElement>(null);
  const [isSuccessful, setIsSuccessful] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);
  const [isNicknameLocked, setIsNicknameLocked] = useState(false);
  const [showPasswordEye, setShowPasswordEye] = useState(false);
  const [error, setError] = useState('');

  const [state, formAction] = useActionState<LoginActionState, FormData>(
    login,
    {
      status: 'idle',
    },
  );
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (state.status === 'failed') {
      setError('Incorrect nickname or password');
      toast({
        type: 'error',
        description: 'Incorrect nickname or password',
      });
    } else if (state.status === 'invalid_data') {
      setError('Failed to validate your submission!');
      toast({
        type: 'error',
        description: 'Failed to validate your submission!',
      });
    } else if (state.status === 'success') {
      setError('');
      setIsSuccessful(true);
      router.refresh();
    }
  }, [state.status, router]);

  const handleContinue = () => {
    if (!nickname) return;
    setIsNicknameLocked(true);
    setShowPassword(true);
    // Фокус на поле пароля без задержек
    setTimeout(() => {
      passwordInputRef.current?.focus();
    }, 0);
  };

  const handleEditNickname = () => {
    setIsNicknameLocked(false);
    setShowPassword(false);
    requestAnimationFrame(() => {
      passwordInputRef.current?.blur();
    });
  };

  const handleNavigateRegister = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsLeaving(true);
    setTimeout(() => {
      router.push('/register');
    }, 500); // match slide-out duration
  };

  return (
    <div className="relative flex min-h-dvh w-screen flex-col items-center justify-center overflow-hidden bg-[#fafafa] px-4 py-8">
      <div className="absolute left-4 top-4 flex items-center gap-2 text-2xl font-bold select-none hidden sm:flex">
        <Image src="/icon.png" alt="Lumia" width={32} height={32} />
        <span>Lumia</span>
      </div>
      <div className="z-10 w-full max-w-md flex flex-col items-center justify-center gap-4">
        <h1 className="text-2xl sm:text-3xl font-semibold text-center mt-1 mb-1 px-4">
          {showPassword && isNicknameLocked
            ? 'Enter your password'
            : 'Welcome back'}
        </h1>
        <div className="text-gray-500 text-sm sm:text-base font-medium text-center mb-2 leading-relaxed px-4">
          You'll get smarter answers
          <br />
          and be able to upload files, images,
          <br />
          and more.
        </div>
        <form
          className="w-full flex flex-col gap-4 items-center px-4"
          autoComplete="off"
          onSubmit={(e) => {
            e.preventDefault();
            if (!showPassword || !isNicknameLocked) {
              handleContinue();
            } else {
              // Только когда оба поля заполнены и пароль виден, отправляем
              if (!nickname || !password) return;
              const formData = new FormData();
              formData.append('nickname', nickname);
              formData.append('password', password);
              startTransition(() => {
                formAction(formData);
              });
            }
          }}
        >
          <div className="relative w-full max-w-80 flex items-center">
            <input
              id="nickname"
              name="nickname"
              type="text"
              placeholder="Enter your nickname"
              autoComplete="username"
              required
              className="w-full h-12 sm:h-14 rounded-full border border-gray-200 px-4 sm:px-6 text-sm sm:text-base outline-none focus:ring-0 transition pr-20 sm:pr-24 disabled:bg-gray-100"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              disabled={isNicknameLocked}
            />
            {isNicknameLocked && (
              <button
                type="button"
                className="absolute right-2 top-1/2 -translate-y-1/2 px-2 sm:px-3 py-1 text-xs bg-white border border-blue-300 rounded-full shadow hover:bg-blue-50 transition"
                onClick={handleEditNickname}
                tabIndex={0}
              >
                Edit
              </button>
            )}
          </div>
          <div
            className={`overflow-hidden transition-all duration-300 ${showPassword && isNicknameLocked ? 'max-h-40 opacity-100 mt-2' : 'max-h-0 opacity-0'} flex flex-col w-full max-w-80 -mt-2`}
          >
            <div className="relative w-full">
              <input
                id="password"
                name="password"
                type={
                  showPassword && isNicknameLocked && !showPasswordEye
                    ? 'password'
                    : 'text'
                }
                placeholder="Enter your password"
                autoComplete="current-password"
                className="w-full h-12 sm:h-14 rounded-full border border-blue-200 px-4 sm:px-6 text-sm sm:text-base outline-none focus:ring-0 transition pr-12"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                ref={passwordInputRef}
                tabIndex={showPassword && isNicknameLocked ? 0 : -1}
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700"
                tabIndex={showPassword && isNicknameLocked ? 0 : -1}
                onClick={() => setShowPasswordEye((v) => !v)}
              >
                {showPasswordEye ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            {error && (
              <div className="text-red-500 text-xs mt-2 pl-2">{error}</div>
            )}
          </div>
          <Button
            type="submit"
            className="w-full max-w-80 h-12 sm:h-14 rounded-full bg-black text-white text-sm sm:text-base font-medium mt-2 mb-2 hover:bg-neutral-800 transition disabled:opacity-70 disabled:cursor-not-allowed"
            disabled={isPending}
          >
            {isPending ? (
              <div className="flex items-center justify-center gap-2">
                <svg
                  className="animate-spin h-5 w-5 text-white"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="none"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                  />
                </svg>
                <span>
                  {showPassword && isNicknameLocked
                    ? 'Signing in...'
                    : 'Loading...'}
                </span>
              </div>
            ) : showPassword && isNicknameLocked ? (
              'Sign in'
            ) : (
              'Continue'
            )}
          </Button>
        </form>
        <div className="w-full flex flex-col items-center gap-2 px-4">
          <span className="text-sm text-gray-700">
            Already have an account?
          </span>
          <a
            href="/register"
            onClick={handleNavigateRegister}
            className="text-blue-600 text-sm font-medium hover:underline cursor-pointer"
          >
            Register
          </a>
        </div>
        <div className="w-full flex items-center gap-4 my-2 px-4">
          <div className="flex-1 h-px bg-gray-200" />
          <span className="text-gray-400 text-sm">or</span>
          <div className="flex-1 h-px bg-gray-200" />
        </div>
        <div className="w-full flex flex-col gap-3 items-center px-4">
          <button
            type="button"
            className="w-full max-w-80 h-12 sm:h-14 rounded-full border border-gray-200 flex items-center gap-2 px-4 sm:px-6 text-sm sm:text-base font-medium bg-white text-black cursor-not-allowed justify-start"
            tabIndex={-1}
            disabled
            title="Coming soon"
          >
            <LogoGoogle size={20} />
            Continue with Google
          </button>
          <button
            type="button"
            className="w-full max-w-80 h-12 sm:h-14 rounded-full border border-gray-200 flex items-center gap-2 px-4 sm:px-6 text-sm sm:text-base font-medium bg-white text-black cursor-not-allowed justify-start"
            tabIndex={-1}
            disabled
            title="Coming soon"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
            </svg>
            Continue with Apple
          </button>
          <button
            type="button"
            className="w-full max-w-80 h-12 sm:h-14 rounded-full border border-gray-200 flex items-center gap-2 px-4 sm:px-6 text-sm sm:text-base font-medium bg-white text-black cursor-not-allowed justify-start"
            tabIndex={-1}
            disabled
            title="Coming soon"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
            </svg>
            Continue with phone number
          </button>
        </div>
        <div className="w-full flex flex-row justify-center gap-1 mt-4 text-xs text-gray-500 items-center px-4">
          <Link
            href="/policy"
            className="underline bg-transparent border-none p-0 m-0 text-inherit cursor-pointer h-8 rounded-full flex items-center justify-center"
          >
            Privacy Policy
          </Link>
          <span className="mx-1 select-none">|</span>
          <Link
            href="/privacy"
            className="underline bg-transparent border-none p-0 m-0 text-inherit cursor-pointer h-8 rounded-full flex items-center justify-center"
          >
            Terms of Service
          </Link>
        </div>
      </div>
    </div>
  );
}
