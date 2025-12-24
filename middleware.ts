import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { auth } from '@/app/(auth)/auth';

/**
 * Middleware для маршрутизации на основе поддоменов
 * 
 * Поддомены:
 * - auth.lumiaai.ru → /auth (регистрация/логин)
 * - chat.lumiaai.ru → /chat (основное приложение)
 * 
 * Использует rewrite (не redirect), чтобы URL в браузере оставался с поддоменом
 */
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hostname = request.headers.get('host') || '';
  
  // Исключаем статические файлы и системные пути
  if (
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/api/') || // Все API маршруты пропускаем без обработки поддоменов
    pathname.startsWith('/favicon.ico') ||
    pathname.startsWith('/icon.png') ||
    pathname.startsWith('/robots.txt') ||
    pathname.startsWith('/sitemap.xml') ||
    pathname.match(/\.(ico|png|jpg|jpeg|svg|gif|webp|woff|woff2|ttf|eot)$/i)
  ) {
    return NextResponse.next();
  }

  // Определяем поддомен
  // Формат: subdomain.lumiaai.ru или subdomain.lumiaai.ru:port
  // Для localhost:3000 или 127.0.0.1:3000 - пропускаем поддоменную логику
  const isLocalhost = hostname.includes('localhost') || hostname.includes('127.0.0.1');
  
  let subdomain: string | null = null;
  let isAuthSubdomain = false;
  let isChatSubdomain = false;
  
  if (!isLocalhost) {
    // Извлекаем поддомен: auth.lumiaai.ru -> auth
    const parts = hostname.split('.');
    if (parts.length >= 3) {
      subdomain = parts[0];
      isAuthSubdomain = subdomain === 'auth';
      isChatSubdomain = subdomain === 'chat';
    }
  }
  
  // Если это не один из наших поддоменов, пропускаем дальше
  // (для локальной разработки или основного домена)
  if (!isAuthSubdomain && !isChatSubdomain) {
    // Для основного домена применяем стандартную логику авторизации
    return handleStandardAuth(request, pathname);
  }

  // Обработка поддомена auth.lumiaai.ru
  if (isAuthSubdomain) {
    // Если пользователь уже авторизован, перенаправляем на чат
    const session = await auth();
    if (session?.user) {
      // Создаем URL для чата с правильным поддоменом
      const protocol = request.nextUrl.protocol;
      const chatUrl = new URL(`${protocol}//chat.lumiaai.ru/chat`);
      return NextResponse.redirect(chatUrl);
    }

    // Rewrite на страницу авторизации
    // Если путь уже /login или /register, оставляем как есть
    if (pathname === '/' || pathname === '/auth') {
      const loginUrl = request.nextUrl.clone();
      loginUrl.pathname = '/login';
      return NextResponse.rewrite(loginUrl);
    }
    
    // Если путь /login или /register, просто пропускаем
    if (pathname.startsWith('/login') || pathname.startsWith('/register')) {
      return NextResponse.next();
    }

    // Для всех остальных путей на auth поддомене → rewrite на /login
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = '/login';
    return NextResponse.rewrite(loginUrl);
  }

  // Обработка поддомена chat.lumiaai.ru
  if (isChatSubdomain) {
    const session = await auth();
    
    // Если пользователь не авторизован, перенаправляем на auth поддомен
    if (!session?.user) {
      const protocol = request.nextUrl.protocol;
      const authUrl = new URL(`${protocol}//auth.lumiaai.ru/login`);
      return NextResponse.redirect(authUrl);
    }

    // Если пользователь авторизован и пытается зайти на /login или /register
    if (pathname.startsWith('/login') || pathname.startsWith('/register')) {
      const homeUrl = request.nextUrl.clone();
      homeUrl.pathname = '/chat';
      return NextResponse.redirect(homeUrl);
    }

    // Rewrite на страницу чата
    if (pathname === '/') {
      const chatUrl = request.nextUrl.clone();
      chatUrl.pathname = '/chat';
      return NextResponse.rewrite(chatUrl);
    }

    // Если путь уже /chat, просто пропускаем
    if (pathname === '/chat' || pathname.startsWith('/chat/')) {
      return NextResponse.next();
    }

    // Для всех остальных путей просто пропускаем
    return NextResponse.next();
  }

  return NextResponse.next();
}

/**
 * Стандартная обработка авторизации для основного домена
 */
async function handleStandardAuth(request: NextRequest, pathname: string) {
  const session = await auth();

  // Разрешаем доступ к публичным страницам
  const publicPaths = ['/login', '/register', '/policy', '/privacy'];
  const isPublicPath = publicPaths.some(path => pathname.startsWith(path));

  // Если пользователь не авторизован и пытается зайти на защищенную страницу
  if (!session?.user && !isPublicPath) {
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
  if (pathname.startsWith('/images') || pathname.startsWith('/icon')) {
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
     * - static files (images, fonts, etc.)
     */
    '/((?!_next/static|_next/image|favicon\\.ico|.*\\.(?:ico|png|jpg|jpeg|svg|gif|webp|woff|woff2|ttf|eot)$).*)',
  ],
};
