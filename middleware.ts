import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { auth } from '@/app/(auth)/auth';

// Middleware для настройки Cache-Control заголовков и проверки авторизации
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Игнорируем статические файлы и системные пути
  if (
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/api/auth/') ||
    pathname.startsWith('/favicon.ico') ||
    pathname.startsWith('/icon.png') ||
    pathname.startsWith('/robots.txt') ||
    pathname.startsWith('/sitemap.xml')
  ) {
    return NextResponse.next();
  }

  const session = await auth();

  // Разрешаем доступ к публичным страницам
  const publicPaths = ['/login', '/register', '/policy', '/privacy'];
  const isPublicPath = publicPaths.some(path => pathname.startsWith(path));

  // Если пользователь не авторизован и пытается зайти на защищенную страницу
  if (!session?.user && !isPublicPath) {
    // Перенаправляем на страницу логина
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Если пользователь авторизован и пытается зайти на страницы логина/регистрации
  if (session?.user && (pathname.startsWith('/login') || pathname.startsWith('/register'))) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  const response = NextResponse.next();

  // Кэширование статических файлов
  if (
    pathname.startsWith('/images') ||
    pathname.startsWith('/icon')
  ) {
    response.headers.set(
      'Cache-Control',
      'public, max-age=31536000, immutable'
    );
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
