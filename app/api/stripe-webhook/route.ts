import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { updateUserSubscription } from '@/lib/db/queries';

// Инициализация Stripe
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

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || '';

// Webhook для обработки событий Stripe (оплата успешна, подписка отменена и т.д.)
export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = req.headers.get('stripe-signature');

  // Если webhook secret не настроен, пропускаем проверку подписи (только для тестирования!)
  if (!webhookSecret) {
    console.warn('⚠️ STRIPE_WEBHOOK_SECRET not set - skipping signature verification (OK for testing)');
    try {
      const event = JSON.parse(body) as Stripe.Event;
      return handleStripeEvent(event);
    } catch (err: any) {
      console.error('Failed to parse webhook body:', err);
      return NextResponse.json(
        { error: 'Invalid webhook body' },
        { status: 400 }
      );
    }
  }

  if (!signature) {
    return NextResponse.json(
      { error: 'No signature' },
      { status: 400 }
    );
  }

  const stripe = getStripeClient();
  if (!stripe) {
    return NextResponse.json(
      { error: 'Stripe is not configured' },
      { status: 500 }
    );
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err: any) {
    console.error('Webhook signature verification failed:', err.message);
    return NextResponse.json(
      { error: `Webhook Error: ${err.message}` },
      { status: 400 }
    );
  }

  return handleStripeEvent(event);
}

// Обработка событий Stripe
async function handleStripeEvent(event: Stripe.Event) {

  // Обработка успешной оплаты
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;
    const userId = session.metadata?.userId || session.client_reference_id;
    const subscription = session.metadata?.subscription;

    console.log('✅ Checkout completed:', { userId, subscription, sessionId: session.id });

    if (userId && subscription) {
      try {
        await updateUserSubscription({ userId, subscription: subscription as 'free' | 'premium' | 'team' });
        console.log(`✅ Subscription updated for user ${userId} to ${subscription}`);
      } catch (error) {
        console.error('❌ Error updating subscription:', error);
        return NextResponse.json(
          { error: 'Failed to update subscription' },
          { status: 500 }
        );
      }
    } else {
      console.warn('⚠️ Missing userId or subscription in session metadata');
    }
  }

  // Обработка отмены подписки
  if (event.type === 'customer.subscription.deleted') {
    const subscription = event.data.object as Stripe.Subscription;
    const userId = subscription.metadata?.userId;

    console.log('❌ Subscription deleted:', { userId, subscriptionId: subscription.id });

    if (userId) {
      try {
        await updateUserSubscription({ userId, subscription: 'free' });
        console.log(`✅ Subscription cancelled for user ${userId}, set to free`);
      } catch (error) {
        console.error('❌ Error updating subscription to free:', error);
      }
    }
  }

  return NextResponse.json({ received: true });
}

