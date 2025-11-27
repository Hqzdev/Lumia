import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Middleware для настройки Cache-Control заголовков (ШАГ 5)
export function middleware(request: NextRequest) {
  const response = NextResponse.next();

  // Кэширование статических файлов
  if (
    request.nextUrl.pathname.startsWith('/_next/static') ||
    request.nextUrl.pathname.startsWith('/images') ||
    request.nextUrl.pathname.startsWith('/icon')
  ) {
    response.headers.set(
      'Cache-Control',
      'public, max-age=31536000, immutable'
    );
  }

  // Кэширование для API роутов (если не установлено в самом роуте)
  if (request.nextUrl.pathname.startsWith('/api/')) {
    // Для API роутов кэш устанавливается в самих роутах
    // Здесь можно добавить общие заголовки если нужно
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
