// Утилиты для кросс-доменного взаимодействия между auth.lumiaai.ru и chat.lumiaai.ru

export const DOMAINS = {
  AUTH: 'auth.lumiaai.ru',
  CHAT: 'chat.lumiaai.ru',
} as const;

// Определяем текущий домен
export function getCurrentDomain(): string {
  if (typeof window === 'undefined') return '';
  return window.location.hostname;
}

// Проверяем, находимся ли мы на домене аутентификации
export function isAuthDomain(): boolean {
  return getCurrentDomain() === DOMAINS.AUTH;
}

// Проверяем, находимся ли мы на домене чата
export function isChatDomain(): boolean {
  return getCurrentDomain() === DOMAINS.CHAT;
}

// Получаем URL для перехода между доменами
export function getAuthUrl(path = '/'): string {
  const protocol =
    typeof window !== 'undefined' ? window.location.protocol : 'https:';
  return `${protocol}//${DOMAINS.AUTH}${path}`;
}

export function getChatUrl(path = '/'): string {
  const protocol =
    typeof window !== 'undefined' ? window.location.protocol : 'https:';
  return `${protocol}//${DOMAINS.CHAT}${path}`;
}

// Функция для перехода на домен чата после успешной аутентификации
export function redirectToChat(redirectPath?: string): void {
  if (typeof window === 'undefined') return;

  const chatUrl = getChatUrl(redirectPath);
  window.location.href = chatUrl;
}

// Функция для перехода на домен аутентификации
export function redirectToAuth(redirectPath?: string): void {
  if (typeof window === 'undefined') return;

  const authUrl = getAuthUrl(redirectPath);
  window.location.href = authUrl;
}

// Импортируем функцию проверки аутентификации
import { isAuthenticated } from './cookies';

// Функция для проверки, нужно ли перенаправить пользователя
export function shouldRedirectToAuth(): boolean {
  // Если мы на домене чата и пользователь не аутентифицирован
  return isChatDomain() && !isAuthenticated();
}

export function shouldRedirectToChat(): boolean {
  // Если мы на домене аутентификации и пользователь аутентифицирован
  return isAuthDomain() && isAuthenticated();
}

// Функция для инициализации кросс-доменного взаимодействия
export function initializeCrossDomain(): void {
  if (typeof window === 'undefined') return;

  // Проверяем, нужно ли перенаправить пользователя
  if (shouldRedirectToAuth()) {
    redirectToAuth();
    return;
  }

  if (shouldRedirectToChat()) {
    redirectToChat();
    return;
  }
}

// Функция для обработки успешной аутентификации
export function handleSuccessfulAuth(
  userData: any,
  rememberMe = false,
  redirectPath?: string,
): void {
  if (typeof window === 'undefined') return;

  // Сохраняем данные пользователя в куки
  import('./cookies').then(({ setAuthenticationData }) => {
    // Генерируем простой токен (в реальном приложении это должен быть JWT)
    const token = `auth_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Устанавливаем все аутентификационные данные
    setAuthenticationData(token, userData, rememberMe);

    // Перенаправляем на домен чата
    redirectToChat(redirectPath);
  });
}

// Функция для выхода из системы
export function handleLogout(): void {
  if (typeof window === 'undefined') return;

  // Очищаем куки
  import('./cookies').then(({ clearLoginCredentials }) => {
    clearLoginCredentials();

    // Перенаправляем на домен аутентификации
    redirectToAuth();
  });
}

// Функция для получения параметра redirect из URL
export function getRedirectParam(): string | null {
  if (typeof window === 'undefined') return null;

  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get('redirect');
}

// Функция для проверки валидности redirect URL
export function isValidRedirectUrl(url: string): boolean {
  try {
    const redirectUrl = new URL(url);
    return redirectUrl.hostname === DOMAINS.CHAT;
  } catch {
    return false;
  }
}

// Функция для создания URL с параметром redirect
export function createAuthUrlWithRedirect(redirectUrl: string): string {
  const authUrl = getAuthUrl();
  const url = new URL(authUrl);
  url.searchParams.set('redirect', redirectUrl);
  return url.toString();
}
