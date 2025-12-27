import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/app/(auth)/auth';
import { getUserById, updateUser } from '@/lib/db/queries';
import { eq } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { user } from '@/lib/db/schema';

function createDbConnection() {
  if (!process.env.POSTGRES_URL) {
    throw new Error('POSTGRES_URL environment variable is not set');
  }
  return postgres(process.env.POSTGRES_URL);
}

const client = createDbConnection();
const db = drizzle(client);

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session || !session.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { nickname } = await req.json();
    if (!nickname || !nickname.trim()) {
      return NextResponse.json(
        { error: 'Nickname is required' },
        { status: 400 }
      );
    }

    const trimmedNickname = nickname.trim();

    if (trimmedNickname.length < 3 || trimmedNickname.length > 32) {
      return NextResponse.json(
        { error: 'Nickname must be between 3 and 32 characters' },
        { status: 400 }
      );
    }

    // Проверяем, не занят ли nickname другим пользователем
    const existingUsers = await db
      .select()
      .from(user)
      .where(eq(user.nickname, trimmedNickname));

    if (
      existingUsers.length > 0 &&
      existingUsers[0].id !== session.user.id
    ) {
      return NextResponse.json(
        { error: 'Nickname is already taken' },
        { status: 409 }
      );
    }

    // Обновляем nickname через updateUser
    try {
      await updateUser({
        userId: session.user.id,
        nickname: trimmedNickname,
      });
    } catch (error: any) {
      // Проверяем, не является ли ошибка нарушением уникальности
      if (error && typeof error === 'object' && 'code' in error) {
        if (error.code === '23505') {
          // PostgreSQL unique constraint violation
          return NextResponse.json(
            { error: 'Nickname is already taken' },
            { status: 409 }
          );
        }
      }
      throw error;
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating nickname:', error);
    // Проверяем, не является ли ошибка нарушением уникальности
    if (error && typeof error === 'object' && 'code' in error) {
      if (error.code === '23505') {
        // PostgreSQL unique constraint violation
        return NextResponse.json(
          { error: 'Nickname is already taken' },
          { status: 409 }
        );
      }
    }
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
