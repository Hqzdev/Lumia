import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/app/(auth)/auth';
import { getUserById, deleteUserById } from '@/lib/db/queries';
import { compare } from 'bcrypt-ts';

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session || !session.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { password } = await req.json();
    if (!password) {
      return NextResponse.json(
        { error: 'Password is required' },
        { status: 400 }
      );
    }

    // Получаем пользователя из базы данных
    const users = await getUserById(session.user.id);
    if (users.length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const user = users[0];

    // Проверяем, есть ли у пользователя пароль (OAuth пользователи могут не иметь пароля)
    if (!user.password) {
      // Для OAuth пользователей можно разрешить удаление без пароля
      // или требовать другую проверку
      return NextResponse.json(
        { error: 'Password verification required for account deletion' },
        { status: 400 }
      );
    }

    // Проверяем пароль
    const passwordsMatch = await compare(password, user.password);
    if (!passwordsMatch) {
      return NextResponse.json(
        { error: 'Invalid password' },
        { status: 401 }
      );
    }

    // Удаляем пользователя и все связанные данные
    await deleteUserById({ id: session.user.id });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting account:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
