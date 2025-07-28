import { useState, useEffect } from 'react';
import {
  getSavedCredentials,
  saveLoginCredentials,
  clearLoginCredentials,
  getLoginAttempts,
  incrementLoginAttempts,
  resetLoginAttempts,
} from '@/lib/utils/cookies';

export function useCookies() {
  const [savedCredentials, setSavedCredentials] = useState(() =>
    getSavedCredentials(),
  );
  const [loginAttempts, setLoginAttempts] = useState(() => getLoginAttempts());
  const [isClient, setIsClient] = useState(false);

  // Проверяем, что мы на клиенте
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Обновляем состояние при изменении куки только на клиенте
  useEffect(() => {
    if (!isClient) return;

    const updateCredentials = () => {
      setSavedCredentials(getSavedCredentials());
    };

    const updateLoginAttempts = () => {
      setLoginAttempts(getLoginAttempts());
    };

    // Слушаем изменения в куки (можно добавить более сложную логику)
    window.addEventListener('storage', updateCredentials);
    window.addEventListener('storage', updateLoginAttempts);

    return () => {
      window.removeEventListener('storage', updateCredentials);
      window.removeEventListener('storage', updateLoginAttempts);
    };
  }, [isClient]);

  const saveCredentials = (nickname: string, rememberMe: boolean) => {
    if (!isClient) return;

    saveLoginCredentials(nickname, rememberMe);
    setSavedCredentials({ nickname, rememberMe });
  };

  const clearCredentials = () => {
    if (!isClient) return;

    clearLoginCredentials();
    setSavedCredentials({ nickname: null, rememberMe: false });
  };

  const incrementAttempts = () => {
    if (!isClient) return 0;

    const attempts = incrementLoginAttempts();
    setLoginAttempts(attempts);
    return attempts;
  };

  const resetAttempts = () => {
    if (!isClient) return;

    resetLoginAttempts();
    setLoginAttempts(0);
  };

  return {
    savedCredentials,
    loginAttempts,
    isClient,
    saveCredentials,
    clearCredentials,
    incrementAttempts,
    resetAttempts,
  };
}
