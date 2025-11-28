import type { NextAuthConfig } from 'next-auth';

export const authConfig = {
  pages: {
    signIn: '/login',
    newUser: '/',
  },
  providers: [
    // added later in auth.ts since it requires bcrypt which is only compatible with Node.js
    // while this file is also used in non-Node.js environments
  ],
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const pathname = nextUrl.pathname;
      
      // Публичные страницы, доступные без авторизации
      const publicPaths = ['/login', '/register', '/policy', '/privacy'];
      const isPublicPath = publicPaths.some(path => pathname.startsWith(path));
      
      // API роуты auth доступны всем
      if (pathname.startsWith('/api/auth')) {
        return true;
      }

      // Если пользователь авторизован и пытается зайти на страницы логина/регистрации
      if (isLoggedIn && (pathname.startsWith('/login') || pathname.startsWith('/register'))) {
        return Response.redirect(new URL('/', nextUrl as unknown as URL));
      }

      // Публичные страницы доступны всем
      if (isPublicPath) {
        return true;
      }

      // Все остальные страницы требуют авторизации
      if (!isLoggedIn) {
        return false; // Redirect unauthenticated users to login page
      }

      return true;
    },
  },
} satisfies NextAuthConfig;
