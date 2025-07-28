import { NextRequest, NextResponse } from 'next/server';

export function middleware(req: NextRequest) {
  const hostname = req.headers.get('host') || '';
  const url = req.nextUrl;

  if (hostname.startsWith('auth.')) {
    // Пропускать только /auth маршруты
    if (!url.pathname.startsWith('/auth')) {
      url.pathname = '/auth/login'; // редирект по умолчанию
      return NextResponse.redirect(url);
    }
  } else if (hostname.startsWith('chat.')) {
    // Блокировать доступ к /auth с chat-домена
    if (url.pathname.startsWith('/auth')) {
      url.pathname = '/404';
      return NextResponse.rewrite(url);
    }
  } else {
    // Неподдерживаемый поддомен
    url.pathname = '/not-supported';
    return NextResponse.rewrite(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|robots.txt|manifest.json|service-worker.js).*)',
  ],
};
