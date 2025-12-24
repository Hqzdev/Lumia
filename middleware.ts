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
  // ВАЖНО: API маршруты должны быть обработаны ПЕРВЫМИ, до любой логики поддоменов
  if (
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/api/') || // Все API маршруты пропускаем без обработки поддоменов
    pathname.startsWith('/favicon.ico') ||
    pathname.startsWith('/icon.png') ||
    pathname.startsWith('/robots.txt') ||
    pathname.startsWith('/sitemap.xml') ||
    pathname.match(/\.(ico|png|jpg|jpeg|svg|gif|webp|woff|woff2|ttf|eot)$/i)
  ) {
    // Для API маршрутов просто пропускаем без изменений
    return NextResponse.next();
  }

  // Определяем поддомен
  // Формат: subdomain.lumiaai.ru или subdomain.lumiaai.ru:port
  // Для localhost:3000 или 127.0.0.1:3000 - пропускаем поддоменную логику
  const isLocalhost =
    hostname.includes('localhost') || hostname.includes('127.0.0.1');

  let isAuthSubdomain = false;
  let isChatSubdomain = false;

  if (!isLocalhost && hostname) {
    // Убираем порт если есть: auth.lumiaai.ru:3000 -> auth.lumiaai.ru
    const hostnameWithoutPort = hostname.split(':')[0];
    // Извлекаем поддомен: auth.lumiaai.ru -> auth
    const parts = hostnameWithoutPort.split('.');
    // Проверяем, что это действительно поддомен (минимум 3 части: subdomain.domain.tld)
    if (parts.length >= 3) {
      const subdomainLower = parts[0].toLowerCase();
      isAuthSubdomain = subdomainLower === 'auth';
      isChatSubdomain = subdomainLower === 'chat';
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
    // Если путь /login или /register, НЕ проверяем авторизацию сразу
    // Это позволяет пользователю остаться на странице логина даже после успешного входа
    // Редирект будет выполнен на клиенте после обновления сессии
    if (pathname.startsWith('/login') || pathname.startsWith('/register')) {
      return NextResponse.next();
    }

    // Если пользователь уже авторизован, перенаправляем на чат (только для корня и /auth)
    if (pathname === '/' || pathname === '/auth') {
      const session = await auth();
      if (session?.user) {
        // Создаем URL для чата с правильным поддоменом
        const protocol = request.nextUrl.protocol;
        const chatUrl = new URL(`${protocol}//chat.lumiaai.ru/chat`);
        return NextResponse.redirect(chatUrl);
      }
    }

    // Rewrite на страницу авторизации
    if (pathname === '/' || pathname === '/auth') {
      const loginUrl = request.nextUrl.clone();
      loginUrl.pathname = '/login';
      return NextResponse.rewrite(loginUrl);
    }

    // Для всех остальных путей на auth поддомене → rewrite на /login
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = '/login';
    return NextResponse.rewrite(loginUrl);
  }

  // Обработка поддомена chat.lumiaai.ru
  if (isChatSubdomain) {
    // Если путь /login или /register, всегда редиректим на auth поддомен
    // Это предотвращает бесконечные редиректы
    if (pathname.startsWith('/login') || pathname.startsWith('/register')) {
      const protocol = request.nextUrl.protocol;
      const authUrl = new URL(`${protocol}//auth.lumiaai.ru${pathname}`);
      return NextResponse.redirect(authUrl);
    }

    // Проверяем авторизацию только для корня и /chat
    if (
      pathname === '/' ||
      pathname === '/chat' ||
      pathname.startsWith('/chat/')
    ) {
      const session = await auth();

      // Если пользователь не авторизован, перенаправляем на auth поддомен
      // Но добавляем небольшую задержку для проверки, чтобы избежать редиректов во время обновления сессии
      if (!session?.user) {
        const protocol = request.nextUrl.protocol;
        const authUrl = new URL(`${protocol}//auth.lumiaai.ru/login`);
        // Добавляем callbackUrl для возврата после логина
        authUrl.searchParams.set('callbackUrl', encodeURIComponent(request.url));
        return NextResponse.redirect(authUrl);
      }
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
  const isPublicPath = publicPaths.some((path) => pathname.startsWith(path));

  // Если пользователь не авторизован и пытается зайти на защищенную страницу
  if (!session?.user && !isPublicPath) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Если пользователь авторизован и пытается зайти на страницы логина/регистрации
  if (
    session?.user &&
    (pathname.startsWith('/login') || pathname.startsWith('/register'))
  ) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  const response = NextResponse.next();

  // Кэширование статических файлов
  if (pathname.startsWith('/images') || pathname.startsWith('/icon')) {
    response.headers.set(
      'Cache-Control',
      'public, max-age=31536000, immutable',
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
