import { type NextRequest, NextResponse } from 'next/server';
import { decodePaymentToken } from '@/lib/payment-token';
import { createPayment, getPayment } from '@/lib/payment-store';

// Декодирование токена платежа
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const token = searchParams.get('token');

    if (!token) {
      return NextResponse.json(
        { error: 'Token is required' },
        { status: 400 },
      );
    }

    // Декодируем токен
    const data = decodePaymentToken(token);

    if (!data) {
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 400 },
      );
    }

    // Создаем или получаем платеж
    const paymentId = `test_${data.userId}_${data.subscription}_${data.timestamp}`;
    let payment = getPayment(paymentId);

    if (!payment) {
      createPayment({
        id: paymentId,
        userId: data.userId,
        subscription: data.subscription,
        amount: data.amount,
        status: 'pending',
        createdAt: data.timestamp,
      });
      payment = getPayment(paymentId);
    }

    return NextResponse.json({
      success: true,
      data: {
        userId: data.userId,
        subscription: data.subscription,
        amount: data.amount,
        paymentId: payment?.id || paymentId,
      },
    });
  } catch (error: any) {
    console.error('Token decode error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to decode token' },
      { status: 500 },
    );
  }
}

