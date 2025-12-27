'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { toast } from '@/components/toast';
import { Button } from '@/components/ui/button';
import { Eye, EyeOff, Phone } from 'lucide-react';
import { register, type RegisterActionState } from '../actions';
import { useActionState, useTransition } from 'react';
import Link from 'next/link';
import { LogoGoogle } from '@/components/icons';
import { signIn } from 'next-auth/react';

export default function Page() {
  const router = useRouter();
  const [nickname, setNickname] = useState('');
  const [email, setEmail] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [password, setPassword] = useState('');
  const passwordInputRef = useRef<HTMLInputElement>(null);
  const [isSuccessful, setIsSuccessful] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);
  const [isLocked, setIsLocked] = useState(false);
  const [showPasswordEye, setShowPasswordEye] = useState(false);
  const [error, setError] = useState('');
  const [showStrongPasswordSuggestion, setShowStrongPasswordSuggestion] =
    useState(false);
  const [suggestedPassword, setSuggestedPassword] = useState('');

  const [state, formAction] = useActionState<RegisterActionState, FormData>(
    register,
    {
      status: 'idle',
    },
  );
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
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

  const generateStrongPassword = () => {
    const length = 16;
    const charset =
      'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
    let password = '';
    for (let i = 0; i < length; i++) {
      password += charset.charAt(Math.floor(Math.random() * charset.length));
    }
    return password;
  };

  const handleContinue = () => {
    if (!nickname.trim() || !email.trim()) return;
    setIsLocked(true);
    setShowPassword(true);
    // Предлагаем сильный пароль когда показывается поле пароля
    const strongPassword = generateStrongPassword();
    setSuggestedPassword(strongPassword);
    setShowStrongPasswordSuggestion(true);
    // Фокус на поле пароля без задержек
    setTimeout(() => {
      passwordInputRef.current?.focus();
    }, 0);
  };

  const handleUseStrongPassword = () => {
    setPassword(suggestedPassword);
    setShowStrongPasswordSuggestion(false);
  };

  const handleDismissSuggestion = () => {
    setShowStrongPasswordSuggestion(false);
  };

  const handleEdit = () => {
    setIsLocked(false);
    setShowPassword(false);
    requestAnimationFrame(() => {
      passwordInputRef.current?.blur();
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nickname || !email || !password) return;
    const formData = new FormData();
    formData.append('nickname', nickname);
    formData.append('email', email);
    formData.append('password', password);
    startTransition(() => {
      formAction(formData);
    });
  };

  const handleNavigateLogin = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsLeaving(true);
    setTimeout(() => {
      router.push('/login');
    }, 500);
  };

  const handleGoogleSignIn = () => {
    const hostname = typeof window !== 'undefined' ? window.location.hostname : '';
    const isAuthSubdomain = hostname.startsWith('auth.');
    
    // По умолчанию перенаправляем на /chat
    let callbackUrl = '/chat';
    
    // Если мы на поддомене auth, перенаправляем на chat поддомен
    if (isAuthSubdomain) {
      callbackUrl = 'https://chat.lumiaai.ru/chat';
    }
    
    signIn('google', { callbackUrl });
  };

  return (
    <div className="relative flex min-h-dvh w-screen flex-col items-center justify-center overflow-hidden bg-white px-4 py-8">
      {/* Desktop Logo */}
      <div className="absolute left-4 top-4 hidden items-center gap-2 text-2xl font-bold select-none sm:flex">
        <Image src="/icon.png" alt="Lumia" width={32} height={32} />
        <span>Lumia</span>
      </div>

      {/* Mobile Version */}
      <div className="w-full max-w-md flex flex-col items-center justify-center gap-4 sm:hidden">
        <h1 className="text-2xl text-black font-semibold text-center mt-8 mb-2 px-4">
          Create an account
        </h1>
        <div className="text-gray-600 text-sm font-normal text-center mb-4 leading-relaxed px-4">
          You'll get smarter answers and
          <br />
          be able to upload files, images
          <br />
          and more.
        </div>

        {/* Social Buttons */}
        <div className="w-full flex flex-col gap-3 items-center px-4">
          <button
            type="button"
            onClick={handleGoogleSignIn}
            className="w-full h-12 rounded-full border border-gray-200 flex items-center gap-3 px-4 text-sm font-normal bg-white text-black hover:bg-gray-50 transition cursor-pointer justify-start"
          >
            <LogoGoogle size={20} />
            Continue with Google
          </button>
          <button
            type="button"
            className="w-full h-12 rounded-full border border-gray-200 flex items-center gap-3 px-4 text-sm font-normal bg-white text-black cursor-not-allowed justify-start"
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
            className="w-full h-12 rounded-full border border-gray-200 flex items-center gap-3 px-4 text-sm font-normal bg-white text-black cursor-not-allowed justify-start"
            tabIndex={-1}
            disabled
            title="Coming soon"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M0 0h11.377v11.372H0z" fill="#f35325" />
              <path d="M12.623 0H24v11.372H12.623z" fill="#81bc06" />
              <path d="M0 12.628h11.377V24H0z" fill="#05a6f0" />
              <path d="M12.623 12.628H24V24H12.623z" fill="#ffba08" />
            </svg>
            Continue with Microsoft
          </button>
          <button
            type="button"
            className="w-full h-12 rounded-full border border-gray-200 flex items-center gap-3 px-4 text-sm font-normal bg-white text-black cursor-not-allowed justify-start"
            tabIndex={-1}
            disabled
            title="Coming soon"
          >
            <Phone className="w-5 h-5" />
            Continue with phone number
          </button>
        </div>

        {/* Divider */}
        <div className="w-full flex items-center gap-4 my-2 px-4">
          <div className="flex-1 h-px bg-gray-200" />
          <span className="text-gray-400 text-sm">or</span>
          <div className="flex-1 h-px bg-gray-200" />
        </div>

        {/* Registration Form */}
        <form
          className="w-full flex flex-col gap-4 items-center px-4"
          autoComplete="off"
          onSubmit={(e) => {
            e.preventDefault();
            // Если нет nickname или email, ничего не делаем
            if (!nickname.trim() || !email.trim()) {
              return;
            }
            // Если nickname и email есть, но пароль еще не показан или не заблокирован, показываем его
            if (!showPassword || !isLocked) {
              handleContinue();
              return;
            }
            // Если пароль не введен, фокусируемся на поле пароля
            if (!password.trim()) {
              setTimeout(() => {
                passwordInputRef.current?.focus();
              }, 0);
              return;
            }
            // Если все заполнено, отправляем форму
            handleSubmit(e);
          }}
        >
          <input
            id="nickname-mobile"
            name="nickname"
            type="text"
            placeholder="Enter your nickname"
            autoComplete="username"
            required
            className="w-full h-12 rounded-full border border-gray-200 bg-white px-4 text-sm text-black caret-black outline-none focus:ring-0 transition"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
          />
          <input
            id="email-mobile"
            name="email"
            type="email"
            placeholder="Email address"
            autoComplete="email"
            required
            className="w-full h-12 rounded-full border border-gray-200 bg-white px-4 text-sm text-black caret-black outline-none focus:ring-0 transition"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <div
            className={`overflow-hidden transition-all duration-300 ${showPassword && isLocked ? 'max-h-96 opacity-100 mt-2' : 'max-h-0 opacity-0'} flex flex-col w-full`}
          >
            {showStrongPasswordSuggestion && !password && (
              <div className="mb-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="text-xs text-blue-800 font-medium mb-2">
                  Create a strong password?
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={handleUseStrongPassword}
                    className="flex-1 px-3 py-1.5 text-xs font-medium bg-blue-600 text-white rounded-full hover:bg-blue-700 transition"
                  >
                    Use strong password
                  </button>
                  <button
                    type="button"
                    onClick={handleDismissSuggestion}
                    className="px-3 py-1.5 text-xs font-medium text-blue-600 hover:text-blue-700 transition"
                  >
                    No, thanks
                  </button>
                </div>
              </div>
            )}
            <div className="relative w-full">
              <input
                id="password-mobile"
                name="password"
                type={
                  showPassword && isLocked && !showPasswordEye
                    ? 'password'
                    : 'text'
                }
                placeholder="Enter your password"
                autoComplete="new-password"
                className="w-full h-12 rounded-full border border-gray-200 bg-white px-4 text-sm text-black caret-black outline-none focus:ring-0 transition pr-12"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (e.target.value && showStrongPasswordSuggestion) {
                    setShowStrongPasswordSuggestion(false);
                  }
                }}
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
            type="submit"
            className="w-full h-12 rounded-full !bg-black !text-white text-sm font-medium mt-2 mb-2 hover:!bg-neutral-800 transition disabled:opacity-70 disabled:cursor-not-allowed"
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
                <span>Loading...</span>
              </div>
            ) : (
              'Continue'
            )}
          </Button>
          <div className="w-full flex flex-col items-center gap-2 mt-2">
            <span className="text-sm text-gray-600">
              Already have an account?
            </span>
            <Link
              href="/login"
              className="text-blue-600 text-sm font-medium hover:underline cursor-pointer"
            >
              Sign in
            </Link>
          </div>
        </form>
      </div>

      {/* Desktop Version */}
      <div className="z-10 w-full max-w-md hidden sm:flex flex-col items-center justify-center gap-4">
        <h1 className="text-2xl sm:text-3xl font-semibold text-center mt-1 mb-1 px-4">
          {showPassword && isLocked
            ? 'Enter your password'
            : 'Create an account'}
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
            if (!showPassword || !isLocked) {
              handleContinue();
            } else {
              // Только когда все поля заполнены и пароль виден, отправляем
              if (!nickname || !email || !password) return;
              const formData = new FormData();
              formData.append('nickname', nickname);
              formData.append('email', email);
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
              className="w-full h-12 sm:h-14 rounded-full border border-gray-200 bg-white px-4 sm:px-6 text-sm sm:text-base text-black outline-none focus:ring-0 transition pr-20 sm:pr-24 disabled:bg-gray-100"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              disabled={isLocked}
            />
            {isLocked && (
              <button
                type="button"
                className="absolute right-2 top-1/2 -translate-y-1/2 px-2 sm:px-3 py-1 text-xs bg-white border border-blue-300 rounded-full shadow hover:bg-blue-50 transition"
                onClick={handleEdit}
                tabIndex={0}
              >
                Edit
              </button>
            )}
          </div>
          <div className="relative w-full max-w-80 flex items-center -mt-2">
            <input
              id="email"
              name="email"
              type="email"
              placeholder="Enter your email"
              autoComplete="email"
              required
              className="w-full h-12 sm:h-14 rounded-full border border-gray-200 bg-white px-4 sm:px-6 text-sm sm:text-base text-black outline-none focus:ring-0 transition pr-20 sm:pr-24 disabled:bg-gray-100"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLocked}
            />
          </div>
          <div
            className={`overflow-hidden transition-all duration-300 ${showPassword && isLocked ? 'max-h-96 opacity-100 mt-2' : 'max-h-0 opacity-0'} flex flex-col w-full max-w-80`}
          >
            {showStrongPasswordSuggestion && !password && (
              <div className="mb-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="text-xs text-blue-800 font-medium mb-2">
                  Create a strong password?
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={handleUseStrongPassword}
                    className="flex-1 px-3 py-1.5 text-xs font-medium bg-blue-600 text-white rounded-full hover:bg-blue-700 transition"
                  >
                    Use strong password
                  </button>
                  <button
                    type="button"
                    onClick={handleDismissSuggestion}
                    className="px-3 py-1.5 text-xs font-medium text-blue-600 hover:text-blue-700 transition"
                  >
                    No thanks
                  </button>
                </div>
              </div>
            )}
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
                className="w-full h-12 sm:h-14 rounded-full border border-blue-200 bg-white px-4 sm:px-6 text-sm sm:text-base text-black outline-none focus:ring-0 transition pr-12"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  // Скрываем предложение если пользователь начал вводить свой пароль
                  if (e.target.value && showStrongPasswordSuggestion) {
                    setShowStrongPasswordSuggestion(false);
                  }
                }}
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
            type="submit"
            className="w-full max-w-80 h-12 sm:h-14 rounded-full !bg-black !text-white text-sm sm:text-base font-medium mt-2 mb-2 hover:!bg-neutral-800 transition disabled:opacity-70 disabled:cursor-not-allowed"
            disabled={isPending || isSuccessful}
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
                  {showPassword && isLocked ? 'Signing up...' : 'Loading...'}
                </span>
              </div>
            ) : showPassword && isLocked ? (
              'Sign up'
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
            href="/login"
            onClick={handleNavigateLogin}
            className="text-blue-600 text-sm font-medium hover:underline cursor-pointer"
          >
            Sign in
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
            onClick={handleGoogleSignIn}
            className="w-full max-w-80 h-12 sm:h-14 rounded-full border border-gray-200 flex items-center gap-2 px-4 sm:px-6 text-sm sm:text-base font-medium bg-white text-black hover:bg-gray-50 transition cursor-pointer justify-start"
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
