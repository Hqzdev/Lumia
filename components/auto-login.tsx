'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getAuthToken, getUserData } from '@/lib/utils/cookies';

interface AutoLoginProps {
  children: React.ReactNode;
}

export function AutoLogin({ children }: AutoLoginProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const performAutoLogin = async () => {
      try {
        // Проверяем наличие куки аутентификации
        const authToken = getAuthToken();
        const userData = getUserData();

        if (!authToken || !userData) {
          console.log(
            'No authentication data found, redirecting to auth domain',
          );
          // Перенаправляем на домен аутентификации
          window.location.href = 'https://auth.lumiaai.ru';
          return;
        }

        // Выполняем автоматический вход через API
        const response = await fetch('/api/auto-login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (response.ok) {
          const data = await response.json();
          console.log('Auto-login successful:', data.user.nickname);
          setIsAuthenticated(true);

          // Обновляем localStorage с данными пользователя
          localStorage.setItem('selectedSubscription', data.user.subscription);

          // Можно также обновить другие данные в localStorage если нужно
        } else {
          console.log('Auto-login failed, redirecting to auth domain');
          // Если автоматический вход не удался, перенаправляем на домен аутентификации
          window.location.href = 'https://auth.lumiaai.ru';
          return;
        }
      } catch (error) {
        console.error('Error during auto-login:', error);
        // При ошибке перенаправляем на домен аутентификации
        window.location.href = 'https://auth.lumiaai.ru';
        return;
      } finally {
        setIsLoading(false);
      }
    };

    performAutoLogin();
  }, [router]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Автоматический вход...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // Не показываем ничего, пока происходит редирект
  }

  return <>{children}</>;
}
