import { NextRequest, NextResponse } from 'next/server';
import { getUserCustomization, updateUserCustomization } from '@/lib/db/queries';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get('userId');
  if (!userId) {
    return NextResponse.json({ error: 'Missing userId' }, { status: 400 });
  }
  try {
    const customization = await getUserCustomization(userId);
    return NextResponse.json({ customization });
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