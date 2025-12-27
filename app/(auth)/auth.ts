import { compare } from 'bcrypt-ts';
import NextAuth, { type DefaultSession } from 'next-auth';
import type { NextAuthConfig } from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import Google from 'next-auth/providers/google';

import {
  getUserByNickname,
  getUserByEmail,
  createOAuthUser,
} from '@/lib/db/queries';
import { authConfig } from './auth.config';

interface AppUser {
  id: string;
  nickname: string;
  subscription: string;
}

declare module 'next-auth' {
  interface User {
    id?: string;
    nickname: string;
    subscription?: string;
  }

  interface Session {
    user: {
      id?: string;
      nickname: string;
      subscription?: string;
    } & DefaultSession['user'];
  }
}

// Проверка переменных окружения при загрузке
if (process.env.NODE_ENV !== 'production') {
  console.log('[NextAuth] Initializing NextAuth...');
  if (!process.env.GOOGLE_CLIENT_ID) {
    console.warn('[NextAuth] Warning: GOOGLE_CLIENT_ID is not set');
  } else {
    console.log('[NextAuth] GOOGLE_CLIENT_ID is set');
  }
  if (!process.env.GOOGLE_CLIENT_SECRET) {
    console.warn('[NextAuth] Warning: GOOGLE_CLIENT_SECRET is not set');
  } else {
    console.log('[NextAuth] GOOGLE_CLIENT_SECRET is set');
  }
  if (!process.env.NEXTAUTH_URL && !process.env.NEXTAUTH_SECRET) {
    console.warn(
      '[NextAuth] Warning: NEXTAUTH_URL is recommended for OAuth providers',
    );
  }
}

// Конфигурация NextAuth - экспортируем как authOptions
export const authOptions: NextAuthConfig = {
  ...authConfig,
  trustHost: true, // Разрешаем работу с поддоменами
  cookies: {
    sessionToken: {
      name: `${process.env.NODE_ENV === 'production' ? '__Secure-' : ''}next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
        // КРИТИЧНО: domain=.lumiaai.ru позволяет cookie работать на всех поддоменах
        domain:
          process.env.NODE_ENV === 'production' ? '.lumiaai.ru' : undefined,
      },
    },
    callbackUrl: {
      name: `${process.env.NODE_ENV === 'production' ? '__Secure-' : ''}next-auth.callback-url`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
        domain:
          process.env.NODE_ENV === 'production' ? '.lumiaai.ru' : undefined,
      },
    },
    csrfToken: {
      // Для поддоменов не используем __Host- префикс, так как он требует отсутствие domain
      name: `${process.env.NODE_ENV === 'production' ? '__Secure-' : ''}next-auth.csrf-token`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
        // Для работы на поддоменах нужен domain
        domain:
          process.env.NODE_ENV === 'production' ? '.lumiaai.ru' : undefined,
      },
    },
  },
  providers: [
    Credentials({
      credentials: {},
      async authorize(credentials) {
        const { nickname, password } = credentials as {
          nickname: string;
          password: string;
        };

        const users = await getUserByNickname(nickname);

        if (users.length === 0) return null;

        const user = users[0];

        if (!user || !user.password) return null;

        const passwordsMatch = await compare(password, user.password);
        if (!passwordsMatch) return null;

        // Важно: вернуть только нужные поля
        return {
          id: user.id,
          nickname: user.nickname,
          email: user.email,
          subscription: user.subscription,
        } as AppUser;
      },
    }),
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      allowDangerousEmailAccountLinking: true, // Разрешаем связывание аккаунтов по email
    }),
  ],
  callbacks: {
    async signIn({
      user,
      account,
      profile,
    }: {
      user: any;
      account: any;
      profile?: any;
    }) {
      // Handle Google OAuth sign in
      if (account?.provider === 'google') {
        try {
          console.log('[Google OAuth] Sign in callback started');
          console.log('[Google OAuth] User:', {
            email: user.email,
            name: user.name,
          });
          console.log('[Google OAuth] Account:', {
            provider: account.provider,
            type: account.type,
          });

          const email = user.email;
          if (!email) {
            console.error('[Google OAuth] No email provided');
            return false;
          }

          // Check if user exists
          console.log(
            '[Google OAuth] Checking for existing user with email:',
            email,
          );
          const existingUsers = await getUserByEmail(email);

          if (existingUsers.length === 0) {
            // Create new OAuth user
            console.log('[Google OAuth] Creating new OAuth user');
            const newUser = await createOAuthUser(
              email,
              user.name || profile?.name,
            );
            user.id = newUser.id;
            user.nickname = newUser.nickname;
            user.subscription = newUser.subscription;
            console.log('[Google OAuth] New user created:', {
              id: newUser.id,
              nickname: newUser.nickname,
            });
          } else {
            // User exists, use their data
            const existingUser = existingUsers[0];
            user.id = existingUser.id;
            user.nickname = existingUser.nickname;
            user.subscription = existingUser.subscription;
            console.log('[Google OAuth] Existing user found:', {
              id: existingUser.id,
              nickname: existingUser.nickname,
            });
          }

          console.log('[Google OAuth] Sign in successful');
          return true;
        } catch (error) {
          console.error('[Google OAuth] Error during sign in:', error);
          if (error instanceof Error) {
            console.error('[Google OAuth] Error message:', error.message);
            console.error('[Google OAuth] Error stack:', error.stack);
          }
          return false;
        }
      }

      // For credentials provider, allow sign in
      return true;
    },
    async jwt({
      token,
      user,
      trigger,
    }: {
      token: any;
      user?: any;
      trigger?: string;
    }) {
      if (user) {
        token.id = user.id;
        token.nickname = user.nickname;
        token.subscription = user.subscription;
      }

      // При обновлении сессии (trigger === 'update') загружаем актуальные данные из БД
      if (trigger === 'update' && token.id) {
        try {
          const { getUserById } = await import('@/lib/db/queries');
          const users = await getUserById(token.id as string);
          if (users && users.length > 0) {
            token.subscription = users[0].subscription;
          }
        } catch (error) {
          console.error('Failed to refresh subscription from DB:', error);
          // В случае ошибки оставляем старое значение
        }
      }

      return token;
    },
    async session({
      session,
      token,
    }: {
      session: any;
      token: any;
    }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.nickname = token.nickname as string;
        session.user.subscription = token.subscription as string;
      }
      return session;
    },
  },
};

// Создаем instance NextAuth для использования auth, signIn, signOut
const handler = NextAuth(authOptions);

// Экспортируем функции для использования в компонентах и серверных функциях
export const { auth, signIn, signOut } = handler;
