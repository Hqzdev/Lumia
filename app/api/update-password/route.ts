import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/app/(auth)/auth';
import { getUserById, updateUser } from '@/lib/db/queries';
import { compare } from 'bcrypt-ts';

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session || !session.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { currentPassword, newPassword } = await req.json();
    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { error: 'Current password and new password are required' },
        { status: 400 }
      );
    }

    if (newPassword.length < 6) {
      return NextResponse.json(
        { error: 'New password must be at least 6 characters long' },
        { status: 400 }
      );
    }

    // Получаем пользователя из базы данных
    const users = await getUserById(session.user.id);
    if (users.length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const userData = users[0];

    // Проверяем, есть ли у пользователя пароль
    if (!userData.password) {
      return NextResponse.json(
        { error: 'Password verification required' },
        { status: 400 }
      );
    }

    // Проверяем текущий пароль
    const passwordsMatch = await compare(currentPassword, userData.password);
    if (!passwordsMatch) {
      return NextResponse.json(
        { error: 'Invalid current password' },
        { status: 401 }
      );
    }

    // Обновляем пароль через updateUser
    await updateUser({
      userId: session.user.id,
      password: newPassword,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating password:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
