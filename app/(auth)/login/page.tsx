'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useRef } from 'react';
import { toast } from '@/components/toast';

import { AuthForm } from '@/components/auth-form';
import { SubmitButton } from '@/components/submit-button';
import { LogoGoogle } from '@/components/icons';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from '@/components/ui/tooltip';
import { Mail, Phone, Apple, Eye, EyeOff } from 'lucide-react';
import { signIn } from 'next-auth/react';
import { useActionState } from 'react';
import { login, type LoginActionState } from '../actions';
import { useCookies } from '@/hooks/use-cookies';

export default function Page() {
  const router = useRouter();
  const {
    savedCredentials,
    saveCredentials,
    incrementAttempts,
    resetAttempts,
  } = useCookies();

  const [nickname, setNickname] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const passwordInputRef = useRef<HTMLInputElement>(null);
  const [isSuccessful, setIsSuccessful] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isNicknameLocked, setIsNicknameLocked] = useState(false);
  const [showPasswordEye, setShowPasswordEye] = useState(false);
  const [error, setError] = useState('');

  const [state, formAction] = useActionState<LoginActionState, FormData>(
    login,
    {
      status: 'idle',
    },
  );

  // Загружаем сохраненные данные при монтировании компонента
  useEffect(() => {
    setMounted(true);

    if (savedCredentials.nickname) {
      setNickname(savedCredentials.nickname);
      setRememberMe(savedCredentials.rememberMe);

      // Если включен "запомнить меня", сразу показываем поле пароля
      if (savedCredentials.rememberMe) {
        setIsNicknameLocked(true);
        setShowPassword(true);
      }
    }
  }, [savedCredentials]);

  useEffect(() => {
    if (state.status === 'failed') {
      setError('Incorrect nickname or password');
      toast({
        type: 'error',
        description: 'Incorrect nickname or password',
      });

      // Увеличиваем счетчик попыток входа
      const attempts = incrementAttempts();
      if (attempts >= 5) {
        toast({
          type: 'error',
          description: 'Too many failed attempts. Please try again later.',
        });
      }
    } else if (state.status === 'invalid_data') {
      setError('Failed to validate your submission!');
      toast({
        type: 'error',
        description: 'Failed to validate your submission!',
      });
    } else if (state.status === 'success') {
      setError('');
      setIsSuccessful(true);

      // Сохраняем данные входа в куки
      saveCredentials(nickname, rememberMe);

      // Сбрасываем счетчик попыток при успешном входе
      resetAttempts();

      router.refresh();
    }
  }, [state.status, router, nickname, rememberMe]);

  const handleSubmit = (formData: FormData) => {
    // This function is no longer used as the form is not connected to a backend action
    // It's kept here for now, but will be removed if not used elsewhere.
    console.log('Form submitted with data:', formData);
    // Example: setIsSuccessful(true); // This would trigger the useEffect
  };

  const handleContinue = () => {
    if (!nickname) return;
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setIsNicknameLocked(true);
      setShowPassword(true);
      setTimeout(() => passwordInputRef.current?.focus(), 200);
    }, 1200); // имитация загрузки
  };

  const handleEditNickname = () => {
    setIsNicknameLocked(false);
    setShowPassword(false);
    setTimeout(() => passwordInputRef.current?.blur(), 200);
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
    <TooltipProvider>
      <div className="relative flex h-dvh w-screen flex-col items-center justify-center overflow-hidden bg-[#fafafa]">
        <div className="absolute left-4 top-4 text-2xl font-bold select-none">
          Lumia
        </div>
        <div className="z-10 w-full max-w-md flex flex-col items-center justify-center gap-8">
          <h1 className="text-3xl font-semibold text-center mt-2 mb-6">
            {showPassword && isNicknameLocked
              ? 'Enter your password'
              : 'Welcome back'}
          </h1>
          <form
            className="w-full flex flex-col gap-4 items-center"
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
                formAction(formData);
              }
            }}
          >
            <div className="relative w-80 flex items-center">
              <input
                id="nickname"
                name="nickname"
                type="text"
                placeholder="Enter your nickname"
                autoComplete="username"
                required
                className="w-80 h-14 rounded-full border border-gray-200 px-6 text-base outline-none focus:ring-0 transition pr-24 disabled:bg-gray-100"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                disabled={isNicknameLocked || isLoading}
              />
              {isLoading && (
                <div className="absolute right-4">
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
              {isNicknameLocked && !isLoading && (
                <button
                  type="button"
                  className="absolute right-2 top-1/2 -translate-y-1/2 px-3 py-1 text-xs bg-white border border-blue-300 rounded-full shadow hover:bg-blue-50 transition"
                  onClick={handleEditNickname}
                  tabIndex={0}
                >
                  Edit
                </button>
              )}
            </div>
            <div
              className={`overflow-hidden transition-all duration-300 ${showPassword && isNicknameLocked ? 'max-h-40 opacity-100 mt-2' : 'max-h-0 opacity-0'} flex flex-col w-80`}
            >
              <label className="text-xs text-blue-700 pl-2" htmlFor="password">
                Password
              </label>
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
                  className="w-full h-14 rounded-full border border-blue-200 px-6 text-base outline-none focus:ring-0 transition pr-12"
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

              {/* Чекбокс "Запомнить меня" */}
              {showPassword && isNicknameLocked && (
                <div className="flex items-center gap-2 mt-3 pl-2">
                  <input
                    type="checkbox"
                    id="remember-me"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                  />
                  <label
                    htmlFor="remember-me"
                    className="text-xs text-gray-600"
                  >
                    Remember me on this device
                  </label>
                </div>
              )}
            </div>
            <Button
              type="submit"
              className="w-80 h-14 rounded-full bg-black text-white text-base font-medium mt-2 mb-2 hover:bg-neutral-800 transition"
              disabled={isLoading}
            >
              {showPassword && isNicknameLocked
                ? 'Sign in'
                : isLoading
                  ? 'Loading...'
                  : 'Continue'}
            </Button>
          </form>
          <div className="w-full flex flex-col items-center gap-2">
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
          <div className="w-full flex items-center gap-4 my-2">
            <div className="flex-1 h-px bg-gray-200" />
            <span className="text-gray-400 text-sm">or</span>
            <div className="flex-1 h-px bg-gray-200" />
          </div>
          <div className="w-full flex flex-col gap-3 items-center">
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  className="w-80 h-14 rounded-full border border-gray-200 flex items-center gap-2 px-6 text-base font-medium bg-white text-black cursor-not-allowed justify-start"
                  tabIndex={-1}
                  disabled
                >
                  Continue with Google
                </button>
              </TooltipTrigger>
              <TooltipContent>soon</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  className="w-80 h-14 rounded-full border border-gray-200 flex items-center gap-2 px-6 text-base font-medium bg-white text-black cursor-not-allowed justify-start"
                  tabIndex={-1}
                  disabled
                >
                  Continue with Apple
                </button>
              </TooltipTrigger>
              <TooltipContent>soon</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  className="w-80 h-14 rounded-full border border-gray-200 flex items-center gap-2 px-6 text-base font-medium bg-white text-black cursor-not-allowed justify-start"
                  tabIndex={-1}
                  disabled
                >
                  Continue with phone number
                </button>
              </TooltipTrigger>
              <TooltipContent>soon</TooltipContent>
            </Tooltip>
          </div>
          <div className="w-full flex flex-row justify-center gap-4 mt-4 text-xs text-gray-500">
            <Link
              href="/policy"
              className="hover:underline bg-transparent border-none p-0 m-0 text-inherit cursor-pointer w-40 h-8 rounded-full flex items-center justify-center"
            >
              Privacy Policy
            </Link>
            <Link
              href="/privacy"
              className="hover:underline bg-transparent border-none p-0 m-0 text-inherit cursor-pointer w-40 h-8 rounded-full flex items-center justify-center"
            >
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}
