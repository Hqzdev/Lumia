'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

/**
 * Страница /auth - редирект на /login
 * Используется для поддомена auth.lumiaai.ru
 */
export default function AuthPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/login');
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
    </div>
  );
}

