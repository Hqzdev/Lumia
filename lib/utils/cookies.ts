// Проверка на клиентскую среду
const isClient =
  typeof window !== 'undefined' && typeof document !== 'undefined';

// Определяем домен для куки
const getCookieDomain = () => {
  if (!isClient) return '';

  const hostname = window.location.hostname;

  // Если мы на поддомене lumiaai.ru, устанавливаем куки для основного домена
  if (hostname.includes('lumiaai.ru')) {
    return '.lumiaai.ru'; // Точка в начале позволяет использовать куки на всех поддоменах
  }

  // Для локальной разработки
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return '';
  }

  return '';
};

export function setCookie(name: string, value: string, days = 30) {
  if (!isClient) return;

  const date = new Date();
  date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
  const expires = `expires=${date.toUTCString()}`;
  const domain = getCookieDomain();
  const domainPart = domain ? `;domain=${domain}` : '';
  const secure = window.location.protocol === 'https:' ? ';secure' : '';
  const sameSite = ';samesite=lax'; // lax для кросс-доменного взаимодействия
  document.cookie = `${name}=${value};${expires};path=/${domainPart}${secure}${sameSite}`;
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

  const domain = getCookieDomain();
  const domainPart = domain ? `;domain=${domain}` : '';
  const secure = window.location.protocol === 'https:' ? ';secure' : '';
  const sameSite = ';samesite=lax';
  document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/${domainPart}${secure}${sameSite}`;
}

// Аутентификационные куки
export const AUTH_COOKIES = {
  REMEMBER_ME: 'lumia_remember_me',
  LAST_NICKNAME: 'lumia_last_nickname',
  LOGIN_ATTEMPTS: 'lumia_login_attempts',
  LAST_LOGIN: 'lumia_last_login',
  AUTH_TOKEN: 'lumia_auth_token', // Токен для кросс-доменной аутентификации
  USER_DATA: 'lumia_user_data', // Данные пользователя
};

// Функции для работы с аутентификационными куки
export function setAuthCookie(name: string, value: string, days = 30) {
  if (!isClient) return;

  const date = new Date();
  date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
  const expires = `expires=${date.toUTCString()}`;
  const domain = getCookieDomain();
  const domainPart = domain ? `;domain=${domain}` : '';
  // Добавляем флаги безопасности для аутентификационных куки
  const secure = window.location.protocol === 'https:' ? ';secure' : '';
  const sameSite = ';samesite=lax'; // lax для кросс-доменного взаимодействия
  document.cookie = `${name}=${value};${expires};path=/${domainPart}${secure}${sameSite}`;
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
  rememberMe = false,
  userData?: any, // Данные пользователя
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

  // Сохраняем данные пользователя если переданы
  if (userData) {
    setAuthCookie(
      AUTH_COOKIES.USER_DATA,
      JSON.stringify(userData),
      rememberMe ? 365 : 7,
    );
  }
}

export function getSavedCredentials() {
  if (!isClient) {
    return {
      nickname: null,
      rememberMe: false,
      userData: null,
    };
  }

  const rememberMe = getAuthCookie(AUTH_COOKIES.REMEMBER_ME) === 'true';
  const nickname = getAuthCookie(AUTH_COOKIES.LAST_NICKNAME);
  const userDataStr = getAuthCookie(AUTH_COOKIES.USER_DATA);

  let userData = null;
  if (userDataStr) {
    try {
      userData = JSON.parse(userDataStr);
    } catch (e) {
      console.warn('Failed to parse user data from cookie:', e);
    }
  }

  return {
    nickname,
    rememberMe,
    userData,
  };
}

export function clearLoginCredentials() {
  if (!isClient) return;

  deleteAuthCookie(AUTH_COOKIES.REMEMBER_ME);
  deleteAuthCookie(AUTH_COOKIES.LAST_NICKNAME);
  deleteAuthCookie(AUTH_COOKIES.LAST_LOGIN);
  deleteAuthCookie(AUTH_COOKIES.LOGIN_ATTEMPTS);
  deleteAuthCookie(AUTH_COOKIES.AUTH_TOKEN);
  deleteAuthCookie(AUTH_COOKIES.USER_DATA);
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

// Новые функции для кросс-доменного взаимодействия
export function setAuthToken(token: string, days = 30) {
  if (!isClient) return;
  setAuthCookie(AUTH_COOKIES.AUTH_TOKEN, token, days);
}

export function getAuthToken(): string | null {
  return getAuthCookie(AUTH_COOKIES.AUTH_TOKEN);
}

export function setUserData(userData: any, days = 30) {
  if (!isClient) return;
  setAuthCookie(AUTH_COOKIES.USER_DATA, JSON.stringify(userData), days);
}

export function getUserData(): any {
  const userDataStr = getAuthCookie(AUTH_COOKIES.USER_DATA);
  if (!userDataStr) return null;

  try {
    return JSON.parse(userDataStr);
  } catch (e) {
    console.warn('Failed to parse user data from cookie:', e);
    return null;
  }
}

// Функция для проверки аутентификации на chat домене
export function isAuthenticated(): boolean {
  const token = getAuthToken();
  const userData = getUserData();
  return !!(token && userData);
}

// Функция для установки всех аутентификационных данных сразу
export function setAuthenticationData(
  token: string,
  userData: any,
  rememberMe = false,
) {
  if (!isClient) return;

  const days = rememberMe ? 365 : 7;

  // Устанавливаем токен
  setAuthToken(token, days);

  // Устанавливаем данные пользователя
  setUserData(userData, days);

  // Сохраняем дополнительные данные
  if (userData.nickname) {
    setAuthCookie(AUTH_COOKIES.LAST_NICKNAME, userData.nickname, days);
  }

  if (rememberMe) {
    setAuthCookie(AUTH_COOKIES.REMEMBER_ME, 'true', 365);
  }

  // Сохраняем время последнего входа
  setAuthCookie(AUTH_COOKIES.LAST_LOGIN, new Date().toISOString(), 30);
}
