'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { CheckCircle, Loader2, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';

function ApplePayPageContent() {
  const router = useRouter();
  const params = useParams();
  const { data: session, update: updateSession } = useSession();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<'ready' | 'processing' | 'success' | 'error'>('ready');
  const [error, setError] = useState<string | null>(null);
  const [paymentData, setPaymentData] = useState<{
    userId: string;
    subscription: string;
    amount: number;
    paymentId: string;
  } | null>(null);

  useEffect(() => {
    const token = params.token as string;
    if (token) {
      // Декодируем токен через API
      fetch(`/api/payment/decode?token=${encodeURIComponent(token)}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.success && data.data) {
            setPaymentData(data.data);
          } else {
            router.push('/');
          }
        })
        .catch(() => {
          router.push('/');
        });
    }
  }, [params.token, router]);

  const handlePay = async () => {
    if (!paymentData) return;

    setLoading(true);
    setError(null);
    setStep('processing');

    try {
      // Подтверждаем платеж через API
      const res = await fetch('/api/verify-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          paymentId: paymentData.paymentId,
          userId: paymentData.userId,
          subscription: paymentData.subscription,
          amount: paymentData.amount,
        }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setLoading(false);
        setStep('success');
        // Ждем немного чтобы БД успела обновиться, затем обновляем сессию
        setTimeout(async () => {
          try {
            // Обновляем сессию чтобы подписка обновилась в меню
            await updateSession();
            router.refresh();
          } catch (err) {
            console.error('Failed to update session:', err);
          }
        }, 500);
        // На мобильном устройстве НЕ перенаправляем, только показываем успех
        // На десктопе тоже не перенаправляем, так как главная страница обновится через polling
      } else {
        setLoading(false);
        setStep('error');
        
        // Если ошибка retryable (таймаут БД), показываем специальное сообщение
        if (data.retryable && res.status === 503) {
          setError('Database connection timeout. Please try again in a moment.');
        } else {
          setError(data.error || `Payment processing error (${res.status})`);
        }
      }
    } catch (err: any) {
      console.error('Payment error:', err);
      setLoading(false);
      setStep('error');
      setError(err.message || 'Network error. Please try again.');
    }
  };

  if (!paymentData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#fafafa]">
        <Loader2 className="w-12 h-12 animate-spin text-blue-600" />
      </div>
    );
  }

  const subscriptionName = paymentData.subscription === 'premium' ? 'Premium' : paymentData.subscription === 'team' ? 'Team' : 'Free';
  const total = paymentData.amount;

  if (step === 'processing') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#fafafa]">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <Loader2 className="w-16 h-16 animate-spin mx-auto mb-4 text-blue-600" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Processing payment...</h2>
          <p className="text-gray-600">Please wait</p>
        </motion.div>
      </div>
    );
  }

  if (step === 'success') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#fafafa]">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center max-w-md bg-white rounded-lg shadow-lg p-8"
        >
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Payment successful!</h2>
          <p className="text-gray-600 mb-2">
            Your {subscriptionName} subscription has been activated.
          </p>
          <p className="text-sm text-gray-500">
            Your subscription is now active.
          </p>
        </motion.div>
      </div>
    );
  }

  if (step === 'error') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#fafafa] p-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6">
          <div className="text-center">
            <p className="text-red-600 mb-4">{error}</p>
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => router.push('/')}
                className="flex-1"
              >
                Go home
              </Button>
              <Button
                onClick={() => {
                  setStep('ready');
                  setError(null);
                }}
                className="flex-1"
              >
                Try again
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fafafa]">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center gap-4">
          <button
            onClick={() => router.push('/')}
            className="text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center">
              <span className="text-white font-bold text-sm">L</span>
            </div>
            <span className="text-lg font-semibold text-gray-900">Lumia</span>
          </div>
          <div className="ml-auto">
            <span className="bg-yellow-100 text-yellow-800 text-xs font-medium px-2.5 py-0.5 rounded">
              TEST MODE
            </span>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-lg shadow-lg border border-gray-200 p-8"
        >
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-black rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-10 h-10 text-white" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Apple Pay</h1>
            <p className="text-gray-600">Complete your payment</p>
          </div>

          <div className="bg-gray-50 rounded-lg p-6 mb-8">
            <div className="flex justify-between items-center mb-4">
              <span className="text-gray-600">Subscription:</span>
              <span className="font-semibold text-gray-900">{subscriptionName}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Amount:</span>
              <span className="text-2xl font-bold text-gray-900">${total.toFixed(2)}</span>
            </div>
          </div>

          <Button
            onClick={handlePay}
            disabled={loading}
            className="w-full bg-black text-white h-14 rounded-lg font-medium text-lg hover:bg-gray-900 transition-colors flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
                </svg>
                Pay ${total.toFixed(2)}
              </>
            )}
          </Button>

          <p className="text-xs text-gray-500 text-center mt-6">
            By completing this payment, you agree to our Terms of Service and Privacy Policy
          </p>
        </motion.div>
      </div>
    </div>
  );
}

export default function ApplePayPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-[#fafafa]">
          <Loader2 className="w-12 h-12 animate-spin text-blue-600" />
        </div>
      }
    >
      <ApplePayPageContent />
    </Suspense>
  );
}

