// app/actions/sign-out.ts
'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export async function signOutAction() {
  // Очищаем аутентификационные куки
  const cookieStore = await cookies();

  // Удаляем все аутентификационные куки
  cookieStore.delete('lumia_remember_me');
  cookieStore.delete('lumia_last_nickname');
  cookieStore.delete('lumia_last_login');
  cookieStore.delete('lumia_login_attempts');
  cookieStore.delete('lumia_auth_token');
  cookieStore.delete('lumia_user_data');

  redirect('/');
}
