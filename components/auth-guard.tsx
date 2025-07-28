'use client';

import { useEffect, useState } from 'react';
import { isAuthenticated, getUserData } from '@/lib/utils/cookies';
import { redirectToAuth, isChatDomain } from '@/lib/utils/cross-domain';

interface AuthGuardProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function AuthGuard({ children, fallback }: AuthGuardProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuth, setIsAuth] = useState(false);
  const [userData, setUserData] = useState<any>(null);

  useEffect(() => {
    // Проверяем аутентификацию только на домене чата
    if (isChatDomain()) {
      const auth = isAuthenticated();
      const user = getUserData();

      setIsAuth(auth);
      setUserData(user);

      if (!auth) {
        // Если пользователь не аутентифицирован, перенаправляем на домен аутентификации
        redirectToAuth();
        return;
      }
    } else {
      // На других доменах просто показываем контент
      setIsAuth(true);
    }

    setIsLoading(false);
  }, []);

  if (isLoading) {
    return (
      fallback || (
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
        </div>
      )
    );
  }

  if (!isAuth) {
    return (
      fallback || (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">Authentication Required</h2>
            <p className="text-gray-600 mb-4">
              Please log in to access this page.
            </p>
            <button
              type="button"
              onClick={() => redirectToAuth()}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Go to Login
            </button>
          </div>
        </div>
      )
    );
  }

  return <>{children}</>;
}

// Хук для получения данных пользователя
export function useAuth() {
  const [userData, setUserData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (isChatDomain()) {
      const user = getUserData();
      setUserData(user);
    }
    setIsLoading(false);
  }, []);

  return {
    user: userData,
    isLoading,
    isAuthenticated: !!userData,
  };
}
