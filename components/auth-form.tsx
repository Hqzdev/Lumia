import Form from 'next/form';
import { useState } from 'react';

import { Input } from './ui/input';
import { Label } from './ui/label';

// Глазик-иконка (можно заменить на свою или использовать lucide-react)
function EyeIcon({ open }: { open: boolean }) {
  return open ? (
    // open eye
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="lucide lucide-eye-icon lucide-eye transition-all duration-200 scale-100 opacity-100"
      style={{
        transition: 'opacity 0.2s, transform 0.2s',
        opacity: 1,
        transform: 'scale(1)',
      }}
    >
      <path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  ) : (
    // closed eye
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="lucide lucide-eye-closed-icon lucide-eye-closed transition-all duration-200 scale-90 opacity-70"
      style={{
        transition: 'opacity 0.2s, transform 0.2s',
        opacity: 0.7,
        transform: 'scale(0.9)',
      }}
    >
      <path d="m15 18-.722-3.25" />
      <path d="M2 8a10.645 10.645 0 0 0 20 0" />
      <path d="m20 15-1.726-2.05" />
      <path d="m4 15 1.726-2.05" />
      <path d="m9 18 .722-3.25" />
    </svg>
  );
}

export function AuthForm({
  action,
  children,
  defaultEmail = '',
  mode = 'register',
}: {
  action: NonNullable<
    string | ((formData: FormData) => void | Promise<void>) | undefined
  >;
  children: React.ReactNode;
  defaultEmail?: string;
  mode?: 'register' | 'login';
}) {
  const [showPassword, setShowPassword] = useState(false);
  const [animating, setAnimating] = useState(false);

  // Анимация для поля пароля
  const handleTogglePassword = () => {
    setAnimating(true);
    setShowPassword((prev) => !prev);
    setTimeout(() => setAnimating(false), 200); // длительность анимации
  };

  return (
    <Form action={action} className="flex flex-col gap-4 px-4 sm:px-16">
      {mode === 'register' && (
        <div className="flex flex-col gap-2">
          <Label
            htmlFor="email"
            className="text-gray-600 font-normal dark:text-gray-500"
          >
            Email Address
          </Label>
          <Input
            id="email"
            name="email"
            className="bg-muted text-md md:text-sm"
            type="email"
            placeholder="Example@Lumia.com"
            autoComplete="email"
            required
            autoFocus
            defaultValue={defaultEmail}
          />
        </div>
      )}
      <div className="flex flex-col gap-2">
        <Label
          htmlFor="nickname"
          className="text-gray-600 font-normal dark:text-gray-500"
        >
          Nickname
        </Label>
        <Input
          id="nickname"
          name="nickname"
          className="bg-muted text-md md:text-sm"
          type="text"
          placeholder="Username"
          autoComplete="username"
          required
          autoFocus={mode === 'login'}
        />
      </div>
      <div className="flex flex-col gap-2">
        <Label
          htmlFor="password"
          className="text-gray-600 font-normal dark:text-gray-500"
        >
          Password
        </Label>
        <div className="relative">
          <Input
            id="password"
            name="password"
            placeholder="Password"
            className={`bg-muted text-md md:text-sm pr-10 transition-all duration-200 ${
              animating
                ? showPassword
                  ? 'ring-2 ring-blue-400'
                  : 'ring-2 ring-gray-300'
                : ''
            }`}
            type={showPassword ? 'text' : 'password'}
            required
            style={{
              transition: 'box-shadow 0.2s, border-color 0.2s',
              boxShadow: animating
                ? showPassword
                  ? '0 0 0 2px #60a5fa'
                  : '0 0 0 2px #d1d5db'
                : undefined,
            }}
          />
          <button
            type="button"
            tabIndex={-1}
            aria-label={showPassword ? 'Hide password' : 'Show password'}
            onClick={handleTogglePassword}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-gray-500 hover:text-gray-700 focus:outline-none"
            style={{
              transition: 'color 0.2s',
              color: showPassword ? '#2563eb' : undefined,
            }}
          >
            <EyeIcon open={showPassword} />
          </button>
        </div>
      </div>
      {children}
    </Form>
  );
}
