import { NextRequest, NextResponse } from 'next/server';
import { updateUserSubscription } from '@/lib/db/queries';
import crypto from 'crypto';

// Webhook для обработки уведомлений от ЮKassa
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const signature = req.headers.get('x-yookassa-signature');

    // Проверка подписи (опционально, для безопасности)
    if (process.env.YOOKASSA_SECRET_KEY && signature) {
      const expectedSignature = crypto
        .createHmac('sha256', process.env.YOOKASSA_SECRET_KEY)
        .update(JSON.stringify(body))
        .digest('hex');
      
      if (signature !== expectedSignature) {
        console.error('Invalid signature');
        return NextResponse.json(
          { error: 'Invalid signature' },
          { status: 400 }
        );
      }
    }

    const event = body.event;
    const payment = body.object;

    console.log('YooKassa webhook event:', event, 'payment:', payment.id);

    // Обработка успешной оплаты
    if (event === 'payment.succeeded') {
      const userId = payment.metadata?.userId;
      const subscription = payment.metadata?.subscription;

      if (userId && subscription && payment.status === 'succeeded') {
        try {
          await updateUserSubscription({
            userId,
            subscription: subscription as 'free' | 'premium' | 'team',
          });
          console.log(`✅ Subscription updated for user ${userId} to ${subscription}`);
        } catch (error) {
          console.error('❌ Error updating subscription:', error);
          return NextResponse.json(
            { error: 'Failed to update subscription' },
            { status: 500 }
          );
        }
      }
    }

    // Обработка отмены платежа
    if (event === 'payment.canceled') {
      console.log('Payment canceled:', payment.id);
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { error: error.message || 'Webhook processing failed' },
      { status: 500 }
    );
  }
}

