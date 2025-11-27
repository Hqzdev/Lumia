import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/app/(auth)/auth';
import { updateUserSubscription } from '@/lib/db/queries';

// Тестовый платежный endpoint - сразу обновляет подписку
export async function POST(req: NextRequest) {
  try {
    const session = await auth();

    if (!session || !session.user || !session.user.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { userId, subscription, amount } = await req.json();

    if (!userId || !subscription || !amount) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Проверяем, что пользователь обновляет свою собственную подписку
    if (userId !== session.user.id) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      );
    }

    // Проверяем, что subscription валиден
    if (!['premium', 'team'].includes(subscription)) {
      return NextResponse.json(
        { error: 'Invalid subscription type' },
        { status: 400 }
      );
    }

    console.log(`[Test Payment] Processing payment for user ${userId}, subscription: ${subscription}, amount: ${amount}₽`);

    // Тестовая оплата - просто обновляем подписку
    // В реальном сценарии здесь была бы обработка платежа через платежный шлюз
    await updateUserSubscription({
      userId,
      subscription: subscription as 'premium' | 'team',
    });

    console.log(`[Test Payment] ✅ Subscription updated successfully for user ${userId}`);

    return NextResponse.json({
      success: true,
      message: 'Payment processed successfully',
      subscription,
    });
  } catch (error: any) {
    console.error('[Test Payment] Error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to process payment' },
      { status: 500 }
    );
  }
}




