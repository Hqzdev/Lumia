'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Lock, CheckCircle, XCircle, Loader2, Shield, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { motion } from 'framer-motion';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

// Test card data
const TEST_CARDS = [
  { number: '4111 1111 1111 1111', name: 'Success' },
  { number: '4000 0000 0000 0002', name: 'Declined' },
];

// Card brand icons component
const CardIcons = () => (
  <div className="absolute right-3 top-1/2 -translate-y-1/2 flex gap-1 items-center">
    {/* Visa */}
    <div className="w-9 h-6 bg-[#1a1f71] rounded flex items-center justify-center shadow-sm">
      <span className="text-white text-[9px] font-bold tracking-tight">
        VISA
      </span>
    </div>
    {/* Mastercard */}
    <div className="w-9 h-6 rounded flex items-center justify-center relative overflow-hidden shadow-sm">
      <div className="absolute left-0 w-1/2 h-full bg-[#eb001b]" />
      <div className="absolute right-0 w-1/2 h-full bg-[#f79e1b]" />
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-3 h-3 rounded-full bg-white/20" />
      </div>
    </div>
    {/* Amex */}
    <div className="w-9 h-6 bg-[#006fcf] rounded flex items-center justify-center shadow-sm">
      <div className="w-5 h-3 bg-white rounded-sm flex items-center justify-center">
        <div className="w-3 h-2 bg-[#006fcf] rounded-sm" />
      </div>
    </div>
    {/* Discover */}
    <div className="w-9 h-6 bg-[#ff6000] rounded flex items-center justify-center shadow-sm">
      <div className="w-4 h-4 border-2 border-white rounded-sm" />
    </div>
  </div>
);

function PaymentPageContent() {
  const router = useRouter();
  const params = useParams();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<'form' | 'processing' | 'success' | 'error'>(
    'form',
  );
  const [error, setError] = useState<string | null>(null);
  const [paymentData, setPaymentData] = useState<{
    userId: string;
    subscription: string;
    amount: number;
    paymentId: string;
  } | null>(null);

  const [cardNumber, setCardNumber] = useState('');
  const [cardName, setCardName] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [email, setEmail] = useState('');
  const [showQRCode, setShowQRCode] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [validationErrors, setValidationErrors] = useState<{
    email?: string;
    cardNumber?: string;
    cardName?: string;
    cardExpiry?: string;
    cardCvv?: string;
  }>({});

  useEffect(() => {
    const token = params.token as string;
    if (token) {
      // Декодируем токен через API
      fetch(`/api/payment/decode?token=${encodeURIComponent(token)}`)
        .then(async (res) => {
          // Проверяем, что ответ JSON
          const contentType = res.headers.get('content-type');
          if (!contentType || !contentType.includes('application/json')) {
            throw new Error('Expected JSON response');
          }
          return res.json();
        })
        .then((data) => {
          if (data.success && data.data) {
            setPaymentData(data.data);
          } else {
            router.push('/');
          }
        })
        .catch((err) => {
          console.error('Failed to decode payment token:', err);
          router.push('/');
        });
    }
  }, [params.token, router]);

  // Polling для проверки статуса платежа (если оплата через Apple Pay на другом устройстве)
  useEffect(() => {
    if (!paymentData || step !== 'form') return;

    const checkPaymentStatus = async () => {
      try {
        const res = await fetch(
          `/api/payment/status?paymentId=${paymentData.paymentId}`,
        );

        // Проверяем, что ответ JSON
        const contentType = res.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
          console.error('Expected JSON response, got:', contentType);
          return;
        }

        const data = await res.json();

        if (res.ok && data.success && data.status === 'completed') {
          // Платеж завершен (возможно через Apple Pay на другом устройстве)
          setStep('success');
          // Перенаправляем в чат через 2 секунды с полной перезагрузкой для обновления сессии
          setTimeout(() => {
            window.location.href = '/';
          }, 2000);
        }
      } catch (err) {
        // Игнорируем ошибки парсинга JSON при polling
        if (err instanceof SyntaxError) {
          console.warn('Payment status check: non-JSON response, retrying...');
        } else {
          console.error('Error checking payment status:', err);
        }
      }
    };

    // Проверяем статус каждые 2 секунды
    const intervalId = setInterval(checkPaymentStatus, 2000);

    return () => clearInterval(intervalId);
  }, [paymentData, step, router]);

  const formatCardNumber = (value: string) => {
    const cleaned = value.replace(/\s/g, '');
    const formatted = cleaned.match(/.{1,4}/g)?.join(' ') || cleaned;
    return formatted.slice(0, 19);
  };

  const formatExpiry = (value: string) => {
    const cleaned = value.replace(/\D/g, '');
    if (cleaned.length >= 2) {
      return `${cleaned.slice(0, 2)}/${cleaned.slice(2, 4)}`;
    }
    return cleaned;
  };

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, ''); // Only digits
    setCardNumber(formatCardNumber(value));
    if (validationErrors.cardNumber) {
      setValidationErrors((prev) => ({ ...prev, cardNumber: undefined }));
    }
  };

  const handleCardNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^a-zA-Z\s]/g, ''); // Only letters and spaces
    setCardName(value.toUpperCase());
    if (validationErrors.cardName) {
      setValidationErrors((prev) => ({ ...prev, cardName: undefined }));
    }
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    if (validationErrors.email) {
      setValidationErrors((prev) => ({ ...prev, email: undefined }));
    }
  };

  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCardExpiry(formatExpiry(e.target.value));
    if (validationErrors.cardExpiry) {
      setValidationErrors((prev) => ({ ...prev, cardExpiry: undefined }));
    }
  };

  const handleCvvChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 3);
    setCardCvv(value);
    if (validationErrors.cardCvv) {
      setValidationErrors((prev) => ({ ...prev, cardCvv: undefined }));
    }
  };

  const validateForm = (): boolean => {
    const errors: typeof validationErrors = {};

    // Email validation - must contain @
    if (!email || !email.includes('@')) {
      errors.email = 'Email must contain @ symbol';
    }

    // Card number validation - only digits, must be 13-19 digits
    const cardNumberClean = cardNumber.replace(/\s/g, '');
    if (
      !cardNumberClean ||
      !/^\d+$/.test(cardNumberClean) ||
      cardNumberClean.length < 13 ||
      cardNumberClean.length > 19
    ) {
      errors.cardNumber = 'Card number must contain only digits (13-19 digits)';
    }

    // Card name validation - only letters
    if (!cardName || !/^[a-zA-Z\s]+$/.test(cardName)) {
      errors.cardName = 'Name must contain only letters';
    }

    // Expiry validation
    if (!cardExpiry || !/^\d{2}\/\d{2}$/.test(cardExpiry)) {
      errors.cardExpiry = 'Invalid expiry date format (MM/YY)';
    }

    // CVV validation - only digits, 3-4 digits
    if (!cardCvv || !/^\d+$/.test(cardCvv) || cardCvv.length < 3) {
      errors.cardCvv = 'CVV must contain only digits (3-4 digits)';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const generateQRCode = () => {
    if (!paymentData) return;

    // Генерируем URL для страницы Apple Pay с тем же токеном
    const token = params.token as string;
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
    const applePayUrl = `${baseUrl}/payment/apple-pay/${token}`;

    // Создаем QR код с URL страницы Apple Pay
    const encodedData = encodeURIComponent(applePayUrl);
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodedData}`;
    setQrCodeUrl(qrUrl);
    setShowQRCode(true);
  };

  const handleApplePay = () => {
    if (!paymentData) return;
    generateQRCode();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!paymentData) {
      setError('Payment data not loaded. Please refresh the page.');
      return;
    }

    // Validate form
    if (!validateForm()) {
      setError('Please fill all fields correctly');
      return;
    }

    setLoading(true);
    setError(null);
    setStep('processing');

    // Симуляция обработки платежа
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // Таймаут для предотвращения бесконечной загрузки
    let timeoutId: NodeJS.Timeout | null = null;

    try {
      timeoutId = setTimeout(() => {
        setLoading(false);
        setStep('error');
        setError('Payment processing timeout. Please try again.');
      }, 10000); // 10 секунд таймаут
      // Проверяем номер карты для тестовых сценариев
      const cardNumberClean = cardNumber.replace(/\s/g, '');
      const isDeclined = cardNumberClean === '4000000000000002';

      if (isDeclined) {
        if (timeoutId) clearTimeout(timeoutId);
        setStep('error');
        setError('Payment declined by bank. Please check your card details.');
        setLoading(false);
        return;
      }

      // Подтверждаем платеж через API
      console.log('Verifying payment:', {
        paymentId: paymentData.paymentId,
        userId: paymentData.userId,
        subscription: paymentData.subscription,
        amount: paymentData.amount,
      });

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

      // Проверяем, что ответ JSON
      const contentType = res.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const text = await res.text();
        console.error(
          'Expected JSON response, got:',
          contentType,
          text.substring(0, 200),
        );
        throw new Error(`Server returned ${contentType} instead of JSON`);
      }

      const data = await res.json();
      console.log('Payment verification response:', {
        status: res.status,
        data,
      });

      if (timeoutId) clearTimeout(timeoutId);

      if (res.ok && data.success) {
        setLoading(false);
        setStep('success');
        // Ждем немного чтобы БД успела обновиться, затем перенаправляем с полной перезагрузкой
        // Полная перезагрузка гарантирует обновление сессии с сервера
        setTimeout(() => {
          // Используем window.location для полной перезагрузки страницы и обновления сессии
          window.location.href = '/';
        }, 2000);
      } else {
        if (timeoutId) clearTimeout(timeoutId);
        setLoading(false);
        setStep('error');

        // Если ошибка retryable (таймаут БД), показываем специальное сообщение
        if (data.retryable && res.status === 503) {
          setError(
            'Database connection timeout. Please try again in a moment.',
          );
        } else {
          setError(data.error || `Payment processing error (${res.status})`);
        }
      }
    } catch (err: any) {
      if (timeoutId) clearTimeout(timeoutId);
      console.error('Payment error:', err);
      setLoading(false);
      setStep('error');
      setError(err.message || 'Network error. Please try again.');
    }
  };

  if (!paymentData) {
    return (
      <div className="min-h-screen flex items-center justify-center relative">
        {/* Background */}
        <div
          className="fixed inset-0"
          style={{
            background:
              'linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(99, 102, 241, 0.1) 50%, rgba(168, 85, 247, 0.1) 100%)',
          }}
        >
          <div
            className="absolute top-0 left-1/4 w-96 h-96 rounded-full animate-pulse"
            style={{
              background:
                'radial-gradient(circle, rgba(59, 130, 246, 0.3) 0%, rgba(59, 130, 246, 0) 70%)',
              filter: 'blur(80px)',
            }}
          />
          <div
            className="absolute bottom-0 right-1/4 w-96 h-96 rounded-full animate-pulse"
            style={{
              background:
                'radial-gradient(circle, rgba(168, 85, 247, 0.3) 0%, rgba(168, 85, 247, 0) 70%)',
              filter: 'blur(80px)',
              animationDelay: '1s',
            }}
          />
        </div>
        <div
          className="relative z-10 rounded-2xl p-8"
          style={{
            backdropFilter: 'blur(10px)',
            background: 'rgba(255, 255, 255, 0.2)',
            border: '1px solid rgba(255, 255, 255, 0.3)',
            boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
          }}
        >
          <Loader2 className="w-12 h-12 animate-spin text-blue-600" />
        </div>
      </div>
    );
  }

  const subscriptionName =
    paymentData.subscription === 'premium'
      ? 'Premium'
      : paymentData.subscription === 'team'
        ? 'Team'
        : 'Free';
  // Amount is already in dollars from API
  const subtotal = paymentData.amount;
  const total = paymentData.amount;

  if (step === 'processing') {
    return (
      <div className="min-h-screen flex items-center justify-center relative">
        {/* Background */}
        <div
          className="fixed inset-0"
          style={{
            background:
              'linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(99, 102, 241, 0.1) 50%, rgba(168, 85, 247, 0.1) 100%)',
          }}
        >
          <div
            className="absolute top-0 left-1/4 w-96 h-96 rounded-full animate-pulse"
            style={{
              background:
                'radial-gradient(circle, rgba(59, 130, 246, 0.3) 0%, rgba(59, 130, 246, 0) 70%)',
              filter: 'blur(80px)',
            }}
          />
          <div
            className="absolute bottom-0 right-1/4 w-96 h-96 rounded-full animate-pulse"
            style={{
              background:
                'radial-gradient(circle, rgba(168, 85, 247, 0.3) 0%, rgba(168, 85, 247, 0) 70%)',
              filter: 'blur(80px)',
              animationDelay: '1s',
            }}
          />
        </div>
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center relative z-10 rounded-2xl p-8"
          style={{
            backdropFilter: 'blur(10px)',
            background: 'rgba(255, 255, 255, 0.2)',
            border: '1px solid rgba(255, 255, 255, 0.3)',
            boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
          }}
        >
          <Loader2 className="w-16 h-16 animate-spin mx-auto mb-4 text-blue-600" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Processing payment...
          </h2>
          <p className="text-gray-600 mb-4">Please wait</p>
          {error && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}
        </motion.div>
      </div>
    );
  }

  if (step === 'success') {
    return (
      <div className="min-h-screen flex items-center justify-center relative">
        {/* Background */}
        <div
          className="fixed inset-0"
          style={{
            background:
              'linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(99, 102, 241, 0.1) 50%, rgba(168, 85, 247, 0.1) 100%)',
          }}
        >
          <div
            className="absolute top-0 left-1/4 w-96 h-96 rounded-full animate-pulse"
            style={{
              background:
                'radial-gradient(circle, rgba(59, 130, 246, 0.3) 0%, rgba(59, 130, 246, 0) 70%)',
              filter: 'blur(80px)',
            }}
          />
          <div
            className="absolute bottom-0 right-1/4 w-96 h-96 rounded-full animate-pulse"
            style={{
              background:
                'radial-gradient(circle, rgba(168, 85, 247, 0.3) 0%, rgba(168, 85, 247, 0) 70%)',
              filter: 'blur(80px)',
              animationDelay: '1s',
            }}
          />
        </div>
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center max-w-md relative z-10 rounded-2xl p-8"
          style={{
            backdropFilter: 'blur(10px)',
            background: 'rgba(255, 255, 255, 0.2)',
            border: '1px solid rgba(255, 255, 255, 0.3)',
            boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
          }}
        >
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Payment successful!
          </h2>
          <p className="text-gray-600 mb-2">
            Your {subscriptionName} subscription has been activated.
          </p>
          <p className="text-sm text-gray-500">Redirecting to chat...</p>
        </motion.div>
      </div>
    );
  }

  if (step === 'error') {
    return (
      <div className="min-h-screen flex items-center justify-center relative p-4">
        {/* Background */}
        <div
          className="fixed inset-0"
          style={{
            background:
              'linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(99, 102, 241, 0.1) 50%, rgba(168, 85, 247, 0.1) 100%)',
          }}
        >
          <div
            className="absolute top-0 left-1/4 w-96 h-96 rounded-full animate-pulse"
            style={{
              background:
                'radial-gradient(circle, rgba(59, 130, 246, 0.3) 0%, rgba(59, 130, 246, 0) 70%)',
              filter: 'blur(80px)',
            }}
          />
          <div
            className="absolute bottom-0 right-1/4 w-96 h-96 rounded-full animate-pulse"
            style={{
              background:
                'radial-gradient(circle, rgba(168, 85, 247, 0.3) 0%, rgba(168, 85, 247, 0) 70%)',
              filter: 'blur(80px)',
              animationDelay: '1s',
            }}
          />
        </div>
        <div
          className="max-w-md w-full relative z-10 rounded-2xl p-6"
          style={{
            backdropFilter: 'blur(10px)',
            background: 'rgba(255, 255, 255, 0.2)',
            border: '1px solid rgba(255, 255, 255, 0.3)',
            boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
          }}
        >
          <div className="text-center">
            <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Payment error
            </h2>
            <p className="text-gray-600 mb-6">{error}</p>
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
                  setStep('form');
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
    <div className="min-h-screen relative overflow-hidden">
      {/* Liquid Glass Background with animated gradient */}
      <div
        className="fixed inset-0"
        style={{
          background:
            'linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(99, 102, 241, 0.1) 50%, rgba(168, 85, 247, 0.1) 100%)',
        }}
      >
        {/* Animated gradient orbs */}
        <div
          className="absolute top-0 left-1/4 w-96 h-96 rounded-full animate-pulse"
          style={{
            background:
              'radial-gradient(circle, rgba(59, 130, 246, 0.3) 0%, rgba(59, 130, 246, 0) 70%)',
            filter: 'blur(80px)',
          }}
        />
        <div
          className="absolute bottom-0 right-1/4 w-96 h-96 rounded-full animate-pulse"
          style={{
            background:
              'radial-gradient(circle, rgba(168, 85, 247, 0.3) 0%, rgba(168, 85, 247, 0) 70%)',
            filter: 'blur(80px)',
            animationDelay: '1s',
          }}
        />
        <div
          className="absolute top-1/2 left-1/2 w-96 h-96 rounded-full animate-pulse"
          style={{
            background:
              'radial-gradient(circle, rgba(99, 102, 241, 0.2) 0%, rgba(99, 102, 241, 0) 70%)',
            filter: 'blur(80px)',
            animationDelay: '0.5s',
          }}
        />
      </div>

      {/* Header with glass effect */}
      <div
        className="relative z-10 border-b shadow-lg"
        style={{
          backdropFilter: 'blur(10px)',
          background: 'rgba(255, 255, 255, 0.2)',
          borderColor: 'rgba(255, 255, 255, 0.3)',
          boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
        }}
      />

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Левая колонка - Детали заказа */}
          <div className="order-2 lg:order-1">
            <div
              className="rounded-2xl p-6 sticky top-8 transition-all glass-card"
              style={{
                backdropFilter: 'blur(10px)',
                background: 'rgba(255, 255, 255, 0.2)',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
              }}
            >
              <h2 className="text-lg font-semibold text-gray-900 mb-6">
                Pay Lumia
              </h2>

              <div className="mb-6">
                <div className="text-4xl font-bold text-gray-900 mb-6">
                  ${total.toFixed(2)}
                </div>
              </div>

              {/* Order details */}
              <div className="space-y-4 mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded flex items-center justify-center">
                    <span className="text-blue-600 font-semibold text-sm">
                      {subscriptionName[0]}
                    </span>
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-medium text-gray-900">
                      {subscriptionName} subscription
                    </div>
                    <div className="text-xs text-gray-500">Qty 1</div>
                  </div>
                  <div className="text-sm font-medium text-gray-900">
                    ${subtotal.toFixed(2)}
                  </div>
                </div>
              </div>

              <div className="border-t border-gray-200 pt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="text-gray-900">${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Shipping</span>
                  <span className="text-gray-900">Free</span>
                </div>
                <div className="border-t border-gray-200 pt-2 mt-2">
                  <div className="flex justify-between">
                    <span className="font-semibold text-gray-900">
                      Total due
                    </span>
                    <span className="font-semibold text-gray-900">
                      ${total.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Правая колонка - Форма оплаты */}
          <div className="order-1 lg:order-2">
            <form
              onSubmit={handleSubmit}
              className="rounded-2xl p-6 transition-all"
              style={{
                backdropFilter: 'blur(10px)',
                background: 'rgba(255, 255, 255, 0.2)',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
              }}
            >
              {/* Apple Pay Button */}
              <button
                type="button"
                onClick={handleApplePay}
                className="w-full text-white h-12 rounded-xl font-medium mb-3 flex items-center justify-center gap-2 transition-all"
                style={{
                  backdropFilter: 'blur(10px)',
                  background: 'rgba(0, 0, 0, 0.6)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  boxShadow: '0 4px 16px 0 rgba(0, 0, 0, 0.3)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(0, 0, 0, 0.7)';
                  e.currentTarget.style.boxShadow =
                    '0 6px 20px 0 rgba(0, 0, 0, 0.4)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(0, 0, 0, 0.6)';
                  e.currentTarget.style.boxShadow =
                    '0 4px 16px 0 rgba(0, 0, 0, 0.3)';
                }}
              >
                <svg
                  className="w-5 h-5"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
                </svg>
                <span>Pay</span>
              </button>

              <div className="flex items-center gap-2 mb-6">
                <div className="flex-1 h-px bg-gray-200" />
                <span className="text-sm text-gray-500">Or pay with card</span>
                <div className="flex-1 h-px bg-gray-200" />
              </div>

              {/* Email */}
              <div className="mb-6">
                <label
                  htmlFor="payment-email"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Email
                </label>
                <Input
                  id="payment-email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={handleEmailChange}
                  className={`w-full transition-all ${validationErrors.email ? 'border-red-500' : ''}`}
                  style={{
                    backdropFilter: 'blur(10px)',
                    background: 'rgba(255, 255, 255, 0.3)',
                    border: validationErrors.email
                      ? '1px solid rgb(239, 68, 68)'
                      : '1px solid rgba(255, 255, 255, 0.4)',
                    boxShadow: '0 2px 8px 0 rgba(31, 38, 135, 0.2)',
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.background =
                      'rgba(255, 255, 255, 0.5)';
                    e.currentTarget.style.boxShadow =
                      '0 4px 12px 0 rgba(31, 38, 135, 0.3)';
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.background =
                      'rgba(255, 255, 255, 0.3)';
                    e.currentTarget.style.boxShadow =
                      '0 2px 8px 0 rgba(31, 38, 135, 0.2)';
                  }}
                  required
                />
                {validationErrors.email && (
                  <p className="text-red-500 text-xs mt-1">
                    {validationErrors.email}
                  </p>
                )}
              </div>

              <div className="mb-6">
                <h3 className="text-sm font-medium text-gray-900 mb-4">
                  Payment details
                </h3>

                {/* Card information */}
                <div className="mb-4">
                  <label
                    htmlFor="payment-card-number"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Card information
                  </label>
                  <div className="relative">
                    <Input
                      id="payment-card-number"
                      type="text"
                      placeholder="1234 1234 1234 1234"
                      value={cardNumber}
                      onChange={handleCardNumberChange}
                      className={`w-full pr-32 transition-all ${validationErrors.cardNumber ? 'border-red-500' : ''}`}
                      style={{
                        backdropFilter: 'blur(10px)',
                        background: 'rgba(255, 255, 255, 0.3)',
                        border: validationErrors.cardNumber
                          ? '1px solid rgb(239, 68, 68)'
                          : '1px solid rgba(255, 255, 255, 0.4)',
                        boxShadow: '0 2px 8px 0 rgba(31, 38, 135, 0.2)',
                      }}
                      onFocus={(e) => {
                        e.currentTarget.style.background =
                          'rgba(255, 255, 255, 0.5)';
                        e.currentTarget.style.boxShadow =
                          '0 4px 12px 0 rgba(31, 38, 135, 0.3)';
                      }}
                      onBlur={(e) => {
                        e.currentTarget.style.background =
                          'rgba(255, 255, 255, 0.3)';
                        e.currentTarget.style.boxShadow =
                          '0 2px 8px 0 rgba(31, 38, 135, 0.2)';
                      }}
                      maxLength={19}
                      required
                    />
                    <CardIcons />
                  </div>
                  {validationErrors.cardNumber && (
                    <p className="text-red-500 text-xs mt-1">
                      {validationErrors.cardNumber}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <label htmlFor="payment-card-expiry" className="sr-only">
                      Expiry date
                    </label>
                    <Input
                      id="payment-card-expiry"
                      type="text"
                      placeholder="MM / YY"
                      value={cardExpiry}
                      onChange={handleExpiryChange}
                      className={`w-full transition-all ${validationErrors.cardExpiry ? 'border-red-500' : ''}`}
                      style={{
                        backdropFilter: 'blur(10px)',
                        background: 'rgba(255, 255, 255, 0.3)',
                        border: validationErrors.cardExpiry
                          ? '1px solid rgb(239, 68, 68)'
                          : '1px solid rgba(255, 255, 255, 0.4)',
                        boxShadow: '0 2px 8px 0 rgba(31, 38, 135, 0.2)',
                      }}
                      onFocus={(e) => {
                        e.currentTarget.style.background =
                          'rgba(255, 255, 255, 0.5)';
                        e.currentTarget.style.boxShadow =
                          '0 4px 12px 0 rgba(31, 38, 135, 0.3)';
                      }}
                      onBlur={(e) => {
                        e.currentTarget.style.background =
                          'rgba(255, 255, 255, 0.3)';
                        e.currentTarget.style.boxShadow =
                          '0 2px 8px 0 rgba(31, 38, 135, 0.2)';
                      }}
                      maxLength={5}
                      required
                    />
                    {validationErrors.cardExpiry && (
                      <p className="text-red-500 text-xs mt-1">
                        {validationErrors.cardExpiry}
                      </p>
                    )}
                  </div>
                  <div className="relative">
                    <label htmlFor="payment-card-cvv" className="sr-only">
                      CVV
                    </label>
                    <Input
                      id="payment-card-cvv"
                      type="text"
                      placeholder="CVC"
                      value={cardCvv}
                      onChange={handleCvvChange}
                      className={`w-full pr-10 transition-all ${validationErrors.cardCvv ? 'border-red-500' : ''}`}
                      style={{
                        backdropFilter: 'blur(10px)',
                        background: 'rgba(255, 255, 255, 0.3)',
                        border: validationErrors.cardCvv
                          ? '1px solid rgb(239, 68, 68)'
                          : '1px solid rgba(255, 255, 255, 0.4)',
                        boxShadow: '0 2px 8px 0 rgba(31, 38, 135, 0.2)',
                      }}
                      onFocus={(e) => {
                        e.currentTarget.style.background =
                          'rgba(255, 255, 255, 0.5)';
                        e.currentTarget.style.boxShadow =
                          '0 4px 12px 0 rgba(31, 38, 135, 0.3)';
                      }}
                      onBlur={(e) => {
                        e.currentTarget.style.background =
                          'rgba(255, 255, 255, 0.3)';
                        e.currentTarget.style.boxShadow =
                          '0 2px 8px 0 rgba(31, 38, 135, 0.2)';
                      }}
                      maxLength={3}
                      required
                    />
                    <Shield className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    {validationErrors.cardCvv && (
                      <p className="text-red-500 text-xs mt-1 absolute -bottom-5 left-0">
                        {validationErrors.cardCvv}
                      </p>
                    )}
                  </div>
                </div>

                <div className="mb-4">
                  <Input
                    type="text"
                    placeholder="Name on card"
                    value={cardName}
                    onChange={handleCardNameChange}
                    className={`w-full transition-all ${validationErrors.cardName ? 'border-red-500' : ''}`}
                    style={{
                      backdropFilter: 'blur(10px)',
                      background: 'rgba(255, 255, 255, 0.3)',
                      border: validationErrors.cardName
                        ? '1px solid rgb(239, 68, 68)'
                        : '1px solid rgba(255, 255, 255, 0.4)',
                      boxShadow: '0 2px 8px 0 rgba(31, 38, 135, 0.2)',
                    }}
                    onFocus={(e) => {
                      e.currentTarget.style.background =
                        'rgba(255, 255, 255, 0.5)';
                      e.currentTarget.style.boxShadow =
                        '0 4px 12px 0 rgba(31, 38, 135, 0.3)';
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.background =
                        'rgba(255, 255, 255, 0.3)';
                      e.currentTarget.style.boxShadow =
                        '0 2px 8px 0 rgba(31, 38, 135, 0.2)';
                    }}
                    required
                  />
                  {validationErrors.cardName && (
                    <p className="text-red-500 text-xs mt-1">
                      {validationErrors.cardName}
                    </p>
                  )}
                </div>
              </div>

              {/* Test cards */}
              <div
                className="rounded-xl p-3 mb-6"
                style={{
                  backdropFilter: 'blur(10px)',
                  background: 'rgba(59, 130, 246, 0.15)',
                  border: '1px solid rgba(59, 130, 246, 0.3)',
                  boxShadow: '0 4px 16px 0 rgba(59, 130, 246, 0.2)',
                }}
              >
                <p className="text-xs font-semibold text-blue-900 mb-2">
                  💳 Test cards:
                </p>
                <div className="space-y-1 text-xs text-blue-700">
                  {TEST_CARDS.map((card) => (
                    <div key={card.number} className="flex justify-between">
                      <span>{card.number}</span>
                      <span className="font-medium">{card.name}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Payment button */}
              <Button
                type="submit"
                disabled={loading}
                className="w-full text-white h-12 text-base font-medium rounded-xl transition-all"
                style={{
                  backdropFilter: 'blur(10px)',
                  background:
                    'linear-gradient(135deg, rgba(99, 91, 255, 0.9) 0%, rgba(88, 81, 234, 0.9) 100%)',
                  border: '1px solid rgba(255, 255, 255, 0.3)',
                  boxShadow: '0 4px 16px 0 rgba(99, 91, 255, 0.4)',
                }}
                onMouseEnter={(e) => {
                  if (!loading) {
                    e.currentTarget.style.background =
                      'linear-gradient(135deg, rgba(88, 81, 234, 1) 0%, rgba(79, 70, 229, 1) 100%)';
                    e.currentTarget.style.boxShadow =
                      '0 6px 20px 0 rgba(99, 91, 255, 0.5)';
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background =
                    'linear-gradient(135deg, rgba(99, 91, 255, 0.9) 0%, rgba(88, 81, 234, 0.9) 100%)';
                  e.currentTarget.style.boxShadow =
                    '0 4px 16px 0 rgba(99, 91, 255, 0.4)';
                }}
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    Processing...
                  </>
                ) : (
                  `Pay $${total.toFixed(2)}`
                )}
              </Button>

              {/* Footer */}
              <div className="mt-6 pt-6 border-t border-gray-200 flex items-center justify-between text-xs text-gray-500">
                <div className="flex items-center gap-1">
                  <Lock className="w-3 h-3" />
                  <span>Secured by</span>
                  <span className="font-semibold">Lumia</span>
                </div>
                <div className="flex items-center gap-2">
                  <a href="/policy" className="hover:underline">
                    Terms
                  </a>
                  <span>|</span>
                  <a href="/privacy" className="hover:underline">
                    Privacy
                  </a>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* QR Code Dialog for Apple Pay */}
      <Dialog open={showQRCode} onOpenChange={setShowQRCode}>
        <DialogContent
          className="sm:max-w-md"
          style={{
            backdropFilter: 'blur(10px)',
            background: 'rgba(255, 255, 255, 0.25)',
            border: '1px solid rgba(255, 255, 255, 0.3)',
            boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
          }}
        >
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span>Scan QR Code to Pay</span>
              <button
                type="button"
                onClick={() => setShowQRCode(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </DialogTitle>
          </DialogHeader>
          <div className="flex flex-col items-center justify-center p-6">
            {qrCodeUrl && (
              <div className="bg-white p-4 rounded-lg border-2 border-gray-200 mb-4">
                <img
                  src={qrCodeUrl}
                  alt="Payment QR Code"
                  className="w-64 h-64"
                />
              </div>
            )}
            <p className="text-sm text-gray-600 text-center mb-2">
              Scan this QR code to open the payment page
            </p>
            <p className="text-xs text-gray-500 text-center mb-4">
              Then click the "Pay" button to complete your {subscriptionName}{' '}
              subscription
            </p>
            <p className="text-lg font-semibold text-gray-900">
              ${total.toFixed(2)}
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function PaymentPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-[#fafafa]">
          <Loader2 className="w-12 h-12 animate-spin text-blue-600" />
        </div>
      }
    >
      <PaymentPageContent />
    </Suspense>
  );
}
