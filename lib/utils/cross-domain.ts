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
export function getAuthUrl(path: string = '/'): string {
  const protocol =
    typeof window !== 'undefined' ? window.location.protocol : 'https:';
  return `${protocol}//${DOMAINS.AUTH}${path}`;
}

export function getChatUrl(path: string = '/'): string {
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

// Функция для проверки, нужно ли перенаправить пользователя
export function shouldRedirectToAuth(): boolean {
  // Если мы на домене чата и пользователь не аутентифицирован
  return isChatDomain() && !isAuthenticated();
}

export function shouldRedirectToChat(): boolean {
  // Если мы на домене аутентификации и пользователь аутентифицирован
  return isAuthDomain() && isAuthenticated();
}

// Импортируем функцию проверки аутентификации
import { isAuthenticated } from './cookies';

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
  rememberMe: boolean = false,
): void {
  if (typeof window === 'undefined') return;

  // Сохраняем данные пользователя в куки
  import('./cookies').then(({ saveLoginCredentials, setAuthToken }) => {
    // Генерируем простой токен (в реальном приложении это должен быть JWT)
    const token = `auth_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    setAuthToken(token, rememberMe ? 365 : 7);
    saveLoginCredentials(
      userData.nickname || userData.email,
      rememberMe,
      userData,
    );

    // Перенаправляем на домен чата
    redirectToChat();
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
