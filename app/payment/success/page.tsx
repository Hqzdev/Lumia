'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { CheckCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';

function PaymentSuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session, update } = useSession();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [subscriptionName, setSubscriptionName] = useState('');

  useEffect(() => {
    const subscription = searchParams.get('subscription');
    const userId = searchParams.get('userId');

    if (subscription) {
      const name = subscription === 'premium' ? 'Premium' : subscription === 'team' ? 'Team' : 'Free';
      setSubscriptionName(name);
    }

    if (subscription && userId) {
      // Обновляем подписку напрямую (платеж уже прошел)
      fetch('/api/upgrade-subscription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, subscription }),
      })
        .then(async (res) => {
          const data = await res.json();
          if (res.ok) {
            // Обновляем сессию чтобы получить новую подписку
            await update();
            // Обновляем страницу чтобы подписка обновилась везде
            router.refresh();
              setLoading(false);
            // Перенаправляем в чат через 2 секунды
              setTimeout(() => {
                router.push('/');
            }, 2000);
          } else {
            setError(data.error || 'Error updating subscription');
            setLoading(false);
          }
        })
        .catch((err) => {
          console.error('Subscription update error:', err);
          setError('Error updating subscription');
          setLoading(false);
        });
    } else {
      setError('Missing subscription parameters');
      setLoading(false);
    }
  }, [searchParams, router, update]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#fafafa]">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-lg text-gray-600">Activating subscription...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#fafafa]">
        <div className="text-center max-w-md bg-white rounded-lg shadow-lg p-6">
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={() => router.push('/')}>Go to chat</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#fafafa]">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center max-w-md bg-white rounded-lg shadow-lg p-8"
      >
        <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Payment successful!</h1>
        <p className="text-gray-600 mb-2">
          Your {subscriptionName} subscription has been activated.
        </p>
        <p className="text-sm text-gray-500">
          Redirecting to chat...
        </p>
      </motion.div>
    </div>
  );
}

export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-12 h-12 animate-spin text-blue-600" />
      </div>
    }>
      <PaymentSuccessContent />
    </Suspense>
  );
}

