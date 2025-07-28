import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getUserByNickname, updateUserLastLogin } from '@/lib/db/queries';

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const authToken = cookieStore.get('lumia_auth_token')?.value;
    const userDataCookie = cookieStore.get('lumia_user_data')?.value;

    if (!authToken || !userDataCookie) {
      return NextResponse.json(
        { error: 'No authentication data found' },
        { status: 401 },
      );
    }

    // Парсим данные пользователя из куки
    const userData = JSON.parse(userDataCookie);
    const nickname = userData.nickname;

    if (!nickname) {
      return NextResponse.json({ error: 'Invalid user data' }, { status: 400 });
    }

    // Получаем пользователя из базы данных
    const users = await getUserByNickname(nickname);
    if (users.length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const user = users[0];

    // Обновляем время последнего входа
    await updateUserLastLogin(user.id);

    // Возвращаем данные пользователя
    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        nickname: user.nickname,
        email: user.email,
        subscription: user.subscription,
        lastLoginAt: user.lastLoginAt,
      },
    });
  } catch (error) {
    console.error('Error in auto-login:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}
