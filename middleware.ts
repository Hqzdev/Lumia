import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const AUTH_COOKIE = 'lumia_auth_token';
const AUTH_DOMAIN = 'auth.lumiaai.ru';

export function middleware(request: NextRequest) {
  const token = request.cookies.get(AUTH_COOKIE)?.value;

  // Если нет токена — редирект на auth.lumiaai.ru
  if (!token) {
    const redirectUrl = new URL(request.nextUrl);
    redirectUrl.hostname = AUTH_DOMAIN;
    redirectUrl.protocol = 'https:';
    redirectUrl.port = '';
    // Сохраняем intended URL для возврата после логина
    redirectUrl.searchParams.set('redirect', request.nextUrl.href);
    return NextResponse.redirect(redirectUrl);
  }

  // Если токен есть — пропускаем дальше
  return NextResponse.next();
}

export const config = {
  matcher: [
    // Все страницы и API, кроме статических ассетов и служебных файлов
    '/((?!_next/static|_next/image|favicon.ico|robots.txt|manifest.json|service-worker.js).*)',
  ],
};
