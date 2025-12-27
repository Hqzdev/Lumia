import { NextRequest, NextResponse } from 'next/server';
import {
  getUserCustomization,
  updateUserCustomization,
  getUserById,
} from '@/lib/db/queries';

// Кэширование для часто запрашиваемых данных (ШАГ 5 и ШАГ 6)
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get('userId');
  if (!userId) {
    return NextResponse.json({ error: 'Missing userId' }, { status: 400 });
  }
  try {
    const customization = await getUserCustomization(userId);
    const users = await getUserById(userId);
    const user = users[0];
    
    return NextResponse.json(
      {
        customization,
        email: user?.email || null,
        hasPassword: !!user?.password,
      },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
        },
      }
    );
  } catch (e) {
    return NextResponse.json({ error: 'DB error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const { userId, customization } = await req.json();
  if (!userId || customization === undefined) {
    return NextResponse.json({ error: 'Missing data' }, { status: 400 });
  }
  try {
    await updateUserCustomization({ userId, customization });
    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json({ error: 'DB error' }, { status: 500 });
  }
} 