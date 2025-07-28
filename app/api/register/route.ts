import { type NextRequest, NextResponse } from 'next/server';
import { createUser } from '@/lib/db/queries';
import { cookies } from 'next/headers';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, nickname, password, rememberMe = false } = body;

    if (!email || !nickname || !password) {
      return NextResponse.json(
        { error: 'Email, nickname and password are required' },
        { status: 400 },
      );
    }

    // Проверяем, что пользователь с таким email или nickname не существует
    // TODO: Добавить проверку существующих пользователей

    // Создаем нового пользователя
    const newUser = await createUser(
      email,
      password, // В реальном приложении пароль должен быть хеширован
      nickname,
    );

    // Генерируем токен аутентификации
    const token = `auth_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Подготавливаем данные пользователя для куки
    const userData = {
      id: newUser.id,
      nickname: newUser.nickname,
      email: newUser.email,
      subscription: newUser.subscription,
    };

    // Устанавливаем куки
    const cookieStore = await cookies();
    const days = rememberMe ? 365 : 7;

    // Устанавливаем токен аутентификации
    cookieStore.set('lumia_auth_token', token, {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      domain: '.lumiaai.ru',
      path: '/',
      maxAge: days * 24 * 60 * 60,
    });

    // Устанавливаем данные пользователя
    cookieStore.set('lumia_user_data', JSON.stringify(userData), {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      domain: '.lumiaai.ru',
      path: '/',
      maxAge: days * 24 * 60 * 60,
    });

    // Если есть rememberMe, устанавливаем дополнительные куки
    if (rememberMe) {
      cookieStore.set('lumia_remember_me', 'true', {
        httpOnly: false,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        domain: '.lumiaai.ru',
        path: '/',
        maxAge: 365 * 24 * 60 * 60,
      });
    }

    // Устанавливаем время последнего входа
    cookieStore.set('lumia_last_login', new Date().toISOString(), {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      domain: '.lumiaai.ru',
      path: '/',
      maxAge: 30 * 24 * 60 * 60,
    });

    // Возвращаем успешный ответ с редиректом на чат
    return NextResponse.json({
      success: true,
      user: userData,
      redirectUrl: 'https://chat.lumiaai.ru/',
    });
  } catch (error) {
    console.error('Error in register POST:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}
