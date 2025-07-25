'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { toast } from '@/components/toast';
import { Button } from '@/components/ui/button';
import { Eye, EyeOff, Apple, Phone } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from '@/components/ui/tooltip';
import { register, type RegisterActionState } from '../actions';
import { useActionState } from 'react';
import Link from 'next/link';
import { GoogleIcon, AppleIcon, PhoneIcon } from '@/components/icons';

export default function Page() {
  const router = useRouter();
  const [nickname, setNickname] = useState('');
  const [email, setEmail] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [password, setPassword] = useState('');
  const passwordInputRef = useRef<HTMLInputElement>(null);
  const [isSuccessful, setIsSuccessful] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isLocked, setIsLocked] = useState(false);
  const [showPasswordEye, setShowPasswordEye] = useState(false);
  const [error, setError] = useState('');

  const [state, formAction] = useActionState<RegisterActionState, FormData>(
    register,
    {
      status: 'idle',
    },
  );

  useEffect(() => {
    setMounted(true);
    if (state.status === 'user_exists') {
      setError('User with this email already exists');
      toast({ type: 'error', description: 'Account already exists!' });
    } else if (state.status === 'nickname_exists') {
      setError('Nickname is already taken');
      toast({ type: 'error', description: 'Nickname already taken!' });
    } else if (state.status === 'failed') {
      setError('Failed to create account');
      toast({ type: 'error', description: 'Failed to create account!' });
    } else if (state.status === 'invalid_data') {
      setError('Validation error');
      toast({
        type: 'error',
        description: 'Failed validating your submission!',
      });
    } else if (state.status === 'success') {
      setError('');
      setIsSuccessful(true);
      router.refresh();
    }
  }, [state.status, router]);

  if (!mounted) return null;

  const handleContinue = () => {
    if (!nickname || !email) return;
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setIsLocked(true);
      setShowPassword(true);
      setTimeout(() => passwordInputRef.current?.focus(), 200);
    }, 1200);
  };

  const handleEdit = () => {
    setIsLocked(false);
    setShowPassword(false);
    setTimeout(() => passwordInputRef.current?.blur(), 200);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nickname || !email || !password) return;
    const formData = new FormData();
    formData.append('nickname', nickname);
    formData.append('email', email);
    formData.append('password', password);
    formAction(formData);
  };

  const handleNavigateLogin = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsLeaving(true);
    setTimeout(() => {
      router.push('/login');
    }, 500);
  };

  return (
    <TooltipProvider>
      <div className="relative flex h-dvh w-screen flex-col items-center justify-center overflow-hidden bg-[#fafafa]">
        <div className="absolute left-4 top-4 text-2xl font-bold select-none hidden md:block">
          Lumia
        </div>
        <div className="z-10 w-full max-w-md flex flex-col items-center justify-center gap-6">
          <h1 className="text-3xl font-semibold text-center mt-2 mb-4">
            Create an account
          </h1>
          <form
            className="w-full flex flex-col gap-3 items-center"
            autoComplete="off"
            onSubmit={handleSubmit}
          >
            <div className="relative w-80 flex flex-col gap-1">
              <input
                id="nickname"
                name="nickname"
                type="text"
                placeholder="Enter your nickname"
                autoComplete="username"
                required
                className="w-80 h-14 rounded-full border border-gray-200 px-6 text-base outline-none focus:ring-0 transition pr-24 disabled:bg-gray-100 mb-1"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                disabled={isLocked || isLoading}
              />
              <input
                id="email"
                name="email"
                type="email"
                placeholder="Enter your email"
                autoComplete="email"
                required
                className="w-80 h-14 rounded-full border border-gray-200 px-6 text-base outline-none focus:ring-0 transition pr-24 disabled:bg-gray-100"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLocked || isLoading}
              />
              {isLoading && (
                <div className="absolute right-4 top-1/2 -translate-y-1/2">
                  <svg
                    className="animate-spin h-6 w-6 text-blue-500"
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
                </div>
              )}
              {isLocked && !isLoading && (
                <button
                  type="button"
                  className="absolute right-2 top-1/2 -translate-y-1/2 px-3 py-1 text-xs bg-white border border-blue-300 rounded-full shadow hover:bg-blue-50 transition"
                  onClick={handleEdit}
                  tabIndex={0}
                >
                  Edit
                </button>
              )}
            </div>
            <div
              className={`overflow-hidden transition-all duration-300 ${showPassword && isLocked ? 'max-h-40 opacity-100 mt-1' : 'max-h-0 opacity-0'} flex flex-col w-80`}
            >
              <label className="text-xs text-blue-700 pl-2" htmlFor="password">
                Password
              </label>
              <div className="relative w-full">
                <input
                  id="password"
                  name="password"
                  type={
                    showPassword && isLocked && !showPasswordEye
                      ? 'password'
                      : 'text'
                  }
                  placeholder="Enter your password"
                  autoComplete="new-password"
                  className="w-full h-14 rounded-full border border-blue-200 px-6 text-base outline-none focus:ring-0 transition pr-12"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  ref={passwordInputRef}
                  tabIndex={showPassword && isLocked ? 0 : -1}
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700"
                  tabIndex={showPassword && isLocked ? 0 : -1}
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
              type={showPassword && isLocked ? 'submit' : 'button'}
              className="w-80 h-14 rounded-full bg-black text-white text-base font-medium mt-2 mb-2 hover:bg-neutral-800 transition"
              disabled={
                isLoading ||
                isSuccessful ||
                (showPassword && isLocked && (!nickname || !email || !password))
              }
              onClick={() => {
                if (!showPassword || !isLocked) handleContinue();
              }}
            >
              {showPassword && isLocked
                ? isSuccessful
                  ? 'Done'
                  : isLoading
                    ? 'Loading...'
                    : 'Sign up'
                : isLoading
                  ? 'Loading...'
                  : 'Continue'}
            </Button>
          </form>
          <div className="w-full flex flex-col items-center gap-1">
            <span className="text-sm text-gray-700">
              Already have an account?
            </span>
            <Link
              href="/login"
              onClick={handleNavigateLogin}
              className="text-blue-600 text-sm font-medium hover:underline cursor-pointer"
            >
              Sign in
            </Link>
          </div>
          <div className="w-full flex items-center gap-2 my-1">
            <div className="flex-1 h-px bg-gray-200" />
            <span className="text-gray-400 text-sm">or</span>
            <div className="flex-1 h-px bg-gray-200" />
          </div>
          <div className="w-full flex flex-col gap-2 items-center">
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  className="w-80 h-14 rounded-full border border-gray-200 flex items-center gap-2 px-6 text-base font-medium bg-white text-black cursor-not-allowed justify-start"
                  tabIndex={-1}
                  disabled
                >
                  <GoogleIcon size={20} />
                  Continue with Google
                </button>
              </TooltipTrigger>
              <TooltipContent>coming soon</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  className="w-80 h-14 rounded-full border border-gray-200 flex items-center gap-2 px-6 text-base font-medium bg-white text-black cursor-not-allowed justify-start"
                  tabIndex={-1}
                  disabled
                >
                  <AppleIcon size={20} />
                  Continue with Apple
                </button>
              </TooltipTrigger>
              <TooltipContent>coming soon</TooltipContent>
            </Tooltip>
          </div>
          <div className="w-full flex flex-row justify-center gap-4 mt-4 text-xs text-gray-500">
            <button
              type="button"
              onClick={() => router.push('/privacy')}
              className="hover:underline bg-transparent border-none p-0 m-0 text-inherit cursor-pointer w-40 h-8 rounded-full flex items-center justify-center"
            >
              Privacy Policy
            </button>
            <button
              type="button"
              onClick={() => router.push('/policy')}
              className="hover:underline bg-transparent border-none p-0 m-0 text-inherit cursor-pointer w-40 h-8 rounded-full flex items-center justify-center"
            >
              Terms of Service
            </button>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}
