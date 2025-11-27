import { type NextRequest, NextResponse } from 'next/server';
import { encodePaymentToken } from '@/lib/payment-token';

// Создание тестового платежа с закодированным токеном
export async function POST(req: NextRequest) {
  try {
    const { userId, subscription, amount } = await req.json();

    if (!userId || !subscription || !amount) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 },
      );
    }

    // Создаем токен с данными платежа
    const token = encodePaymentToken({
      userId,
      subscription,
      amount: Number.parseFloat(amount.toString()),
      timestamp: Date.now(),
    });

    console.log('Payment token created:', token);

    // Возвращаем URL для редиректа на страницу оплаты с токеном
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    const paymentUrl = `${baseUrl}/payment/${token}`;

    return NextResponse.json({
      token,
      url: paymentUrl,
    });
  } catch (error: any) {
    console.error('Payment creation error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create payment' },
      { status: 500 },
    );
  }
}
