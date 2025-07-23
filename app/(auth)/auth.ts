import { compare } from 'bcrypt-ts';
import NextAuth, { DefaultSession } from 'next-auth';
import Credentials from 'next-auth/providers/credentials';

import { getUserByNickname } from '@/lib/db/queries';
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

export const {
  handlers: { GET, POST },
  auth,
  signIn,
  signOut,
} = NextAuth({
  ...authConfig,
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
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.nickname = user.nickname;
        token.subscription = user.subscription;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.nickname = token.nickname as string;
        session.user.subscription = token.subscription as string;
      }
      return session;
    },
  },
});
