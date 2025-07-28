// Пример использования системы кросс-доменного взаимодействия на chat.lumiaai.ru

import { AuthGuard, useAuth } from '@/components/auth-guard';
import { handleLogout } from '@/lib/utils/cross-domain';

// Основная страница чата с защитой аутентификации
export function ChatPage() {
  return (
    <AuthGuard>
      <ChatApp />
    </AuthGuard>
  );
}

// Компонент чата с данными пользователя
function ChatApp() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Заголовок с информацией о пользователе */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">Lumia Chat</h1>
              <span className="ml-4 text-sm text-gray-500">
                Welcome, {user?.nickname}!
              </span>
              {user?.subscription && (
                <span className="ml-2 px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                  {user.subscription}
                </span>
              )}
            </div>

            {/* Кнопка выхода */}
            <button
              onClick={handleLogout}
              className="px-4 py-2 text-sm font-medium text-red-600 hover:text-red-700"
            >
              Sign Out
            </button>
          </div>
        </div>
      </header>

      {/* Основной контент чата */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow">
          <div className="p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">
              Chat Interface
            </h2>

            {/* Здесь будет интерфейс чата */}
            <div className="border rounded-lg p-4 min-h-96">
              <p className="text-gray-500 text-center">
                Chat interface will be implemented here.
              </p>
              <p className="text-sm text-gray-400 text-center mt-2">
                User: {user?.nickname} | Email: {user?.email}
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

// Пример middleware для проверки аутентификации
export function authMiddleware(request: Request) {
  // Проверяем, что мы на домене чата
  const url = new URL(request.url);
  if (url.hostname !== 'chat.lumiaai.ru') {
    return null; // Пропускаем на других доменах
  }

  // Проверяем наличие токена аутентификации
  const cookies = request.headers.get('cookie');
  if (!cookies) {
    return Response.redirect('https://auth.lumiaai.ru/login');
  }

  // Проверяем наличие аутентификационных куки
  const hasAuthToken = cookies.includes('lumia_auth_token');
  const hasUserData = cookies.includes('lumia_user_data');

  if (!hasAuthToken || !hasUserData) {
    return Response.redirect('https://auth.lumiaai.ru/login');
  }

  return null; // Пропускаем аутентифицированных пользователей
}

// Пример хука для работы с данными пользователя
export function useUserData() {
  const { user, isLoading } = useAuth();

  return {
    user,
    isLoading,
    isPremium: user?.subscription === 'premium',
    isAuthenticated: !!user,
    nickname: user?.nickname || 'Guest',
    email: user?.email || '',
  };
}

// Пример компонента с проверкой подписки
export function PremiumFeature({ children }: { children: React.ReactNode }) {
  const { isPremium } = useUserData();

  if (!isPremium) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg
              className="h-5 w-5 text-yellow-400"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-yellow-800">
              Premium Feature
            </h3>
            <div className="mt-2 text-sm text-yellow-700">
              <p>This feature is only available for premium users.</p>
            </div>
            <div className="mt-4">
              <button
                type="button"
                className="bg-yellow-50 px-2 py-1.5 rounded-md text-sm font-medium text-yellow-800 hover:bg-yellow-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-yellow-50 focus:ring-yellow-600"
              >
                Upgrade to Premium
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
