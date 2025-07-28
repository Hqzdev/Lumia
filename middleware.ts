import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const AUTH_COOKIE = 'lumia_auth_token';
const USER_DATA_COOKIE = 'lumia_user_data';
const AUTH_DOMAIN = 'auth.lumiaai.ru';

export function middleware(request: NextRequest) {
  const token = request.cookies.get(AUTH_COOKIE)?.value;
  const userData = request.cookies.get(USER_DATA_COOKIE)?.value;

  // Проверяем, что мы на домене чата
  const isChatDomain = request.nextUrl.hostname === 'chat.lumiaai.ru';

  // Если мы на домене чата и нет токена или данных пользователя
  if (isChatDomain && (!token || !userData)) {
    const redirectUrl = new URL(request.nextUrl);
    redirectUrl.hostname = AUTH_DOMAIN;
    redirectUrl.protocol = 'https:';
    redirectUrl.port = '';
    // Сохраняем intended URL для возврата после логина
    redirectUrl.searchParams.set('redirect', request.nextUrl.href);
    return NextResponse.redirect(redirectUrl);
  }

  // Если мы на домене аутентификации и есть валидные куки, перенаправляем на чат
  if (request.nextUrl.hostname === AUTH_DOMAIN && token && userData) {
    // Проверяем, есть ли параметр redirect
    const redirectParam = request.nextUrl.searchParams.get('redirect');
    if (redirectParam) {
      try {
        const redirectUrl = new URL(redirectParam);
        // Убеждаемся, что редирект ведет на домен чата
        if (redirectUrl.hostname === 'chat.lumiaai.ru') {
          return NextResponse.redirect(redirectUrl);
        }
      } catch (e) {
        console.error('Invalid redirect URL:', e);
      }
    }

    // Если нет redirect параметра, идем на главную страницу чата
    const chatUrl = new URL('https://chat.lumiaai.ru/');
    return NextResponse.redirect(chatUrl);
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
