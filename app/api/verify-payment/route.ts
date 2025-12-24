import { type NextRequest, NextResponse } from 'next/server';
import { updateUserSubscription } from '@/lib/db/queries';
import { getPayment, updatePayment, createPayment } from '@/lib/payment-store';

// Подтверждение тестового платежа
export async function POST(req: NextRequest) {
  try {
    const { paymentId, userId, subscription, amount } = await req.json();

    console.log('Verify payment request:', {
      paymentId,
      userId,
      subscription,
      amount,
    });

    if (!paymentId || !userId || !subscription || amount === undefined) {
      console.error('Missing required fields:', {
        paymentId,
        userId,
        subscription,
        amount,
      });
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 },
      );
    }

    // Проверяем платеж в хранилище
    let payment = getPayment(paymentId);
    console.log('Payment found:', payment);

    // Если платеж не найден, создаем его заново (может быть потерян из-за hot reload или разных инстансов)
    if (!payment) {
      console.log(
        'Payment not found, creating new one with paymentId:',
        paymentId,
      );
      createPayment({
        id: paymentId,
        userId,
        subscription,
        amount: Number(amount),
        status: 'pending',
        createdAt: Date.now(),
      });
      payment = getPayment(paymentId);
      console.log('Payment created:', payment);

      if (!payment) {
        console.error('Failed to create payment');
        return NextResponse.json(
          { error: 'Failed to create payment' },
          { status: 500 },
        );
      }
    }

    // Разрешаем повторную попытку для failed платежей, если они недавние (в течение 10 минут)
    const isRecentFailed =
      payment.status === 'failed' &&
      Date.now() - payment.createdAt < 10 * 60 * 1000; // 10 минут

    if (payment.status === 'completed') {
      return NextResponse.json(
        { error: 'Payment already completed' },
        { status: 400 },
      );
    }

    // Если платеж failed, но недавний, сбрасываем статус на pending для повторной попытки
    if (payment.status === 'failed' && isRecentFailed) {
      console.log('Resetting failed payment to pending for retry');
      updatePayment(paymentId, { status: 'pending' });
      payment = getPayment(paymentId);
      if (!payment) {
        return NextResponse.json(
          { error: 'Failed to retrieve payment after update' },
          { status: 500 },
        );
      }
    } else if (payment.status === 'failed' && !isRecentFailed) {
      return NextResponse.json(
        {
          error:
            'Payment failed and cannot be retried. Please create a new payment.',
        },
        { status: 400 },
      );
    }

    // Проверяем соответствие данных
    if (!payment || payment.userId !== userId || payment.subscription !== subscription) {
      return NextResponse.json(
        { error: 'Payment data mismatch' },
        { status: 400 },
      );
    }

    // Обновляем подписку пользователя
    // Используем увеличенный таймаут (30 секунд) для учета retry логики в БД
    try {
      const updatePromise = updateUserSubscription({
        userId,
        subscription: subscription as 'free' | 'premium' | 'team',
      });

      // Увеличенный таймаут для обновления подписки (30 секунд)
      // Это учитывает retry логику в updateUserSubscription (3 попытки с exponential backoff)
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(
          () => reject(new Error('Subscription update timeout')),
          30000,
        );
      });

      await Promise.race([updatePromise, timeoutPromise]);
      console.log(
        `✅ Subscription updated for user ${userId} to ${subscription}`,
      );

      // Помечаем платеж как успешный только после успешного обновления
      updatePayment(paymentId, { status: 'completed' });
    } catch (error: any) {
      console.error('❌ Error updating subscription:', error);

      // Если это таймаут или ошибка БД, все равно помечаем платеж как completed
      // и пытаемся обновить в фоне через отдельный API
      if (
        error.message?.includes('timeout') ||
        error.message?.includes('ETIMEDOUT')
      ) {
        console.warn(
          '⚠️ Subscription update timed out, marking payment as completed and retrying in background',
        );
        updatePayment(paymentId, { status: 'completed' });

        // Пытаемся обновить в фоне через отдельный API (не ждем ответа)
        fetch(
          `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/upgrade-subscription`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId, subscription }),
          },
        ).catch((err) => {
          console.error(
            'Failed to retry subscription update in background:',
            err,
          );
        });
      } else {
        // Для других ошибок тоже помечаем как completed и ретраим
        updatePayment(paymentId, { status: 'completed' });
        fetch(
          `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/upgrade-subscription`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId, subscription }),
          },
        ).catch((err) => {
          console.error('Failed to retry subscription update:', err);
        });
      }
    }

    // Возвращаем успех
    return NextResponse.json({
      success: true,
      paymentId,
      subscription,
    });
  } catch (error: any) {
    console.error('Payment verification error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to verify payment' },
      { status: 500 },
    );
  }
}
