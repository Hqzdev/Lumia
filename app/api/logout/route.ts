import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST() {
  try {
    const cookieStore = await cookies();

    // Очищаем все аутентификационные куки
    cookieStore.delete('lumia_auth_token');
    cookieStore.delete('lumia_user_data');
    cookieStore.delete('lumia_remember_me');
    cookieStore.delete('lumia_last_nickname');
    cookieStore.delete('lumia_last_login');

    // Возвращаем успешный ответ с редиректом на домен аутентификации
    return NextResponse.json({
      success: true,
      redirectUrl: 'https://auth.lumiaai.ru/login',
    });
  } catch (error) {
    console.error('Error in logout:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}
