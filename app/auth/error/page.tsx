'use client';

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';

export default function AuthErrorPage() {
  const searchParams = useSearchParams();
  const error = searchParams.get('error');

  const errorMessages: Record<string, string> = {
    Configuration: 'Произошла ошибка конфигурации. Пожалуйста, свяжитесь с поддержкой.',
    AccessDenied: 'Доступ запрещен. Убедитесь, что вы используете правильный аккаунт.',
    Verification: 'Проблема с верификацией. Попробуйте еще раз.',
    Default: 'Произошла ошибка при авторизации. Пожалуйста, попробуйте еще раз.',
  };

  const errorMessage = error ? errorMessages[error] || errorMessages.Default : errorMessages.Default;

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-white px-4">
      <div className="w-full max-w-md">
        <div className="mb-8 flex items-center justify-center gap-2">
          <Image src="/icon.png" alt="Lumia" width={32} height={32} />
          <span className="text-2xl font-bold">Lumia</span>
        </div>

        <div className="rounded-lg border border-red-200 bg-red-50 p-6">
          <h1 className="mb-4 text-xl font-semibold text-red-900">Ошибка авторизации</h1>
          <p className="mb-4 text-sm text-red-800">{errorMessage}</p>
          
          {error && (
            <div className="mb-4 rounded bg-red-100 p-3">
              <p className="text-xs font-mono text-red-900">
                Код ошибки: <strong>{error}</strong>
              </p>
            </div>
          )}

          <div className="space-y-2">
            <Link
              href="/login"
              className="block w-full rounded-lg bg-red-600 px-4 py-2 text-center text-sm font-medium text-white transition hover:bg-red-700"
            >
              Вернуться к входу
            </Link>
            <Link
              href="/register"
              className="block w-full rounded-lg border border-red-300 bg-white px-4 py-2 text-center text-sm font-medium text-red-700 transition hover:bg-red-50"
            >
              Зарегистрироваться
            </Link>
          </div>

          <div className="mt-6 border-t border-red-200 pt-4">
            <p className="text-xs text-red-700">
              Если проблема сохраняется, проверьте:
            </p>
            <ul className="mt-2 list-inside list-disc space-y-1 text-xs text-red-600">
              <li>Подключение к интернету</li>
              <li>Настройки браузера (разрешения для cookies)</li>
              <li>Правильность email адреса</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}


