// app/actions/sign-out.ts
'use server';

import { signOut } from '@/app/(auth)/auth';
import { cookies } from 'next/headers';

export async function signOutAction() {
  // Очищаем аутентификационные куки
  const cookieStore = await cookies();

  // Удаляем все аутентификационные куки
  cookieStore.delete('lumia_remember_me');
  cookieStore.delete('lumia_last_nickname');
  cookieStore.delete('lumia_last_login');
  cookieStore.delete('lumia_login_attempts');

  await signOut({ redirectTo: '/' });
}
