// Проверка на клиентскую среду
const isClient =
  typeof window !== 'undefined' && typeof document !== 'undefined';

export function setCookie(name: string, value: string, days = 30) {
  if (!isClient) return;

  const date = new Date();
  date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
  const expires = `expires=${date.toUTCString()}`;
  document.cookie = `${name}=${value};${expires};path=/`;
}

export function getCookie(name: string): string | null {
  if (!isClient) return null;

  const cookies = document.cookie.split(';');
  for (const cookie of cookies) {
    const [cookieName, cookieValue] = cookie.trim().split('=');
    if (cookieName === name) {
      return cookieValue;
    }
  }
  return null;
}

export function deleteCookie(name: string) {
  if (!isClient) return;

  document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
}

// Аутентификационные куки
export const AUTH_COOKIES = {
  REMEMBER_ME: 'lumia_remember_me',
  LAST_NICKNAME: 'lumia_last_nickname',
  LOGIN_ATTEMPTS: 'lumia_login_attempts',
  LAST_LOGIN: 'lumia_last_login',
};

// Функции для работы с аутентификационными куки
export function setAuthCookie(name: string, value: string, days = 30) {
  if (!isClient) return;

  const date = new Date();
  date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
  const expires = `expires=${date.toUTCString()}`;
  // Добавляем флаги безопасности для аутентификационных куки
  const secure = window.location.protocol === 'https:' ? ';secure' : '';
  const sameSite = ';samesite=strict';
  document.cookie = `${name}=${value};${expires};path=/${secure}${sameSite}`;
}

export function getAuthCookie(name: string): string | null {
  return getCookie(name);
}

export function deleteAuthCookie(name: string) {
  deleteCookie(name);
}

// Специфичные функции для аутентификации
export function saveLoginCredentials(
  nickname: string,
  rememberMe: boolean = false,
) {
  if (!isClient) return;

  if (rememberMe) {
    setAuthCookie(AUTH_COOKIES.REMEMBER_ME, 'true', 365); // 1 год
    setAuthCookie(AUTH_COOKIES.LAST_NICKNAME, nickname, 365);
  } else {
    setAuthCookie(AUTH_COOKIES.LAST_NICKNAME, nickname, 7); // 1 неделя
  }

  // Сохраняем время последнего входа
  setAuthCookie(AUTH_COOKIES.LAST_LOGIN, new Date().toISOString(), 30);
}

export function getSavedCredentials() {
  if (!isClient) {
    return {
      nickname: null,
      rememberMe: false,
    };
  }

  const rememberMe = getAuthCookie(AUTH_COOKIES.REMEMBER_ME) === 'true';
  const nickname = getAuthCookie(AUTH_COOKIES.LAST_NICKNAME);

  return {
    nickname,
    rememberMe,
  };
}

export function clearLoginCredentials() {
  if (!isClient) return;

  deleteAuthCookie(AUTH_COOKIES.REMEMBER_ME);
  deleteAuthCookie(AUTH_COOKIES.LAST_NICKNAME);
  deleteAuthCookie(AUTH_COOKIES.LAST_LOGIN);
  deleteAuthCookie(AUTH_COOKIES.LOGIN_ATTEMPTS);
}

export function incrementLoginAttempts(): number {
  if (!isClient) return 0;

  const attempts = getAuthCookie(AUTH_COOKIES.LOGIN_ATTEMPTS);
  const newAttempts = attempts ? Number.parseInt(attempts) + 1 : 1;
  setAuthCookie(AUTH_COOKIES.LOGIN_ATTEMPTS, newAttempts.toString(), 1); // 1 день
  return newAttempts;
}

export function getLoginAttempts(): number {
  if (!isClient) return 0;

  const attempts = getAuthCookie(AUTH_COOKIES.LOGIN_ATTEMPTS);
  return attempts ? Number.parseInt(attempts) : 0;
}

export function resetLoginAttempts() {
  if (!isClient) return;

  deleteAuthCookie(AUTH_COOKIES.LOGIN_ATTEMPTS);
}
