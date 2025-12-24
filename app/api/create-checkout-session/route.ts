import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

// Функция для получения Stripe клиента
function getStripeClient(): Stripe | null {
  if (!process.env.STRIPE_SECRET_KEY) {
    return null;
  }
  
  try {
    return new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2025-11-17.clover',
    });
  } catch (error) {
    console.error('Failed to initialize Stripe:', error);
    return null;
  }
}

// Создание Stripe Checkout Session для оплаты подписки
export async function POST(req: NextRequest) {
  try {
    // Проверяем наличие Stripe ключа
    if (!process.env.STRIPE_SECRET_KEY) {
      console.error('STRIPE_SECRET_KEY is not set');
      return NextResponse.json(
        { error: 'Stripe is not configured. Please contact support.' },
        { status: 500 }
      );
    }

    const { userId, subscription, priceId } = await req.json();

    if (!userId || !subscription) {
      return NextResponse.json(
        { error: 'Missing userId or subscription' },
        { status: 400 }
      );
    }

    // Получаем price ID из окружения или используем переданный
    const stripePriceId = priceId || getStripePriceId(subscription);

    if (!stripePriceId) {
      console.error(`Price ID not found for subscription: ${subscription}`);
      return NextResponse.json(
        { 
          error: `Price ID not configured for ${subscription} plan. Please set STRIPE_${subscription.toUpperCase()}_PRICE_ID in environment variables.` 
        },
        { status: 400 }
      );
    }

    // Создаем Checkout Session
    const stripe = getStripeClient();
    if (!stripe) {
      return NextResponse.json(
        { error: 'Stripe is not configured. Please set STRIPE_SECRET_KEY in environment variables.' },
        { status: 500 }
      );
    }

    console.log('Creating Stripe checkout session for:', { userId, subscription, stripePriceId });
    
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price: stripePriceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/payment/cancel`,
      client_reference_id: userId,
      metadata: {
        userId,
        subscription,
      },
    });

    console.log('Stripe session created:', { sessionId: session.id, url: session.url });

    if (!session.url) {
      return NextResponse.json(
        { error: 'Failed to get checkout URL from Stripe' },
        { status: 500 }
      );
    }

    return NextResponse.json({ sessionId: session.id, url: session.url });
  } catch (error: any) {
    console.error('Stripe error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}

// Получение Stripe Price ID для подписки
function getStripePriceId(subscription: string): string | null {
  // Эти price ID нужно создать в Stripe Dashboard и добавить в .env
  const priceIds: Record<string, string> = {
    premium: process.env.STRIPE_PREMIUM_PRICE_ID || '',
    team: process.env.STRIPE_TEAM_PRICE_ID || '',
  };

  return priceIds[subscription] || null;
}

