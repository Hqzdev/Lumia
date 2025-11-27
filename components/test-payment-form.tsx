'use client';

import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CreditCard, Lock, CheckCircle, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useSession } from 'next-auth/react';

interface TestPaymentFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string;
  subscription: 'premium' | 'team';
  amount: number;
  planName: string;
  onSuccess?: () => void;
}

export function TestPaymentForm({
  open,
  onOpenChange,
  userId,
  subscription,
  amount,
  planName,
  onSuccess,
}: TestPaymentFormProps) {
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<'form' | 'processing' | 'success'>('form');
  const [formData, setFormData] = useState({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardholderName: '',
  });
  const { update } = useSession();

  const handleInputChange = (field: string, value: string) => {
    let formattedValue = value;

    // Форматирование номера карты (добавляем пробелы каждые 4 цифры)
    if (field === 'cardNumber') {
      formattedValue = value.replace(/\s/g, '').replace(/(.{4})/g, '$1 ').trim();
      if (formattedValue.length > 19) formattedValue = formattedValue.slice(0, 19);
    }

    // Форматирование даты (MM/YY)
    if (field === 'expiryDate') {
      formattedValue = value.replace(/\D/g, '');
      if (formattedValue.length >= 2) {
        formattedValue = formattedValue.slice(0, 2) + '/' + formattedValue.slice(2, 4);
      }
      if (formattedValue.length > 5) formattedValue = formattedValue.slice(0, 5);
    }

    // CVV только цифры, максимум 3
    if (field === 'cvv') {
      formattedValue = value.replace(/\D/g, '').slice(0, 3);
    }

    setFormData((prev) => ({ ...prev, [field]: formattedValue }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Валидация
    if (
      formData.cardNumber.replace(/\s/g, '').length !== 16 ||
      formData.expiryDate.length !== 5 ||
      formData.cvv.length !== 3 ||
      !formData.cardholderName.trim()
    ) {
      return;
    }

    setLoading(true);
    setStep('processing');

    try {
      // Тестовая оплата - сразу обновляем подписку
      const res = await fetch('/api/test-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          subscription,
          amount,
          paymentMethod: 'test_card', // Тестовый метод оплаты
        }),
      });

      const data = await res.json();

      if (res.ok) {
        // Обновляем сессию
        await update();
        setStep('success');

        // Закрываем форму через 2 секунды
        setTimeout(() => {
          setStep('form');
          setFormData({
            cardNumber: '',
            expiryDate: '',
            cvv: '',
            cardholderName: '',
          });
          onOpenChange(false);
          if (onSuccess) {
            onSuccess();
          }
        }, 2000);
      } else {
        alert(data.error || 'Ошибка при обработке платежа');
        setStep('form');
      }
    } catch (error: any) {
      console.error('Payment error:', error);
      alert(`Ошибка: ${error.message || 'Не удалось обработать платеж'}`);
      setStep('form');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-blue-600 flex items-center gap-2">
            <CreditCard className="w-6 h-6" />
            Тестовая оплата
          </DialogTitle>
          <DialogDescription>
            Подписка {planName} — {amount}₽/месяц
          </DialogDescription>
        </DialogHeader>

        {step === 'form' && (
          <form onSubmit={handleSubmit} className="space-y-6">
            <Card className="border-blue-200 bg-blue-50/50 dark:bg-blue-950/20">
              <CardHeader>
                <CardTitle className="text-sm font-medium text-blue-700 dark:text-blue-400">
                  💳 Тестовые данные карты
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-xs text-blue-600 dark:text-blue-400">
                <p>Номер: <code className="bg-white dark:bg-black px-1 rounded">4242 4242 4242 4242</code></p>
                <p>Срок: <code className="bg-white dark:bg-black px-1 rounded">Любая будущая дата</code></p>
                <p>CVV: <code className="bg-white dark:bg-black px-1 rounded">Любые 3 цифры</code></p>
              </CardContent>
            </Card>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="cardNumber">Номер карты</Label>
                <Input
                  id="cardNumber"
                  type="text"
                  placeholder="4242 4242 4242 4242"
                  value={formData.cardNumber}
                  onChange={(e) => handleInputChange('cardNumber', e.target.value)}
                  maxLength={19}
                  required
                  className="text-lg tracking-widest"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="expiryDate">Срок действия</Label>
                  <Input
                    id="expiryDate"
                    type="text"
                    placeholder="MM/YY"
                    value={formData.expiryDate}
                    onChange={(e) => handleInputChange('expiryDate', e.target.value)}
                    maxLength={5}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cvv">CVV</Label>
                  <Input
                    id="cvv"
                    type="text"
                    placeholder="123"
                    value={formData.cvv}
                    onChange={(e) => handleInputChange('cvv', e.target.value)}
                    maxLength={3}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="cardholderName">Имя на карте</Label>
                <Input
                  id="cardholderName"
                  type="text"
                  placeholder="IVAN IVANOV"
                  value={formData.cardholderName}
                  onChange={(e) => handleInputChange('cardholderName', e.target.value.toUpperCase())}
                  required
                />
              </div>
            </div>

            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
              <Lock className="w-4 h-4" />
              <span>Платеж обрабатывается безопасно (тестовый режим)</span>
            </div>

            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={() => onOpenChange(false)}
                disabled={loading}
              >
                Отмена
              </Button>
              <Button
                type="submit"
                className="flex-1 bg-blue-600 hover:bg-blue-700"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Обработка...
                  </>
                ) : (
                  <>
                    Оплатить {amount}₽
                  </>
                )}
              </Button>
            </div>
          </form>
        )}

        {step === 'processing' && (
          <div className="flex flex-col items-center justify-center py-8 space-y-4">
            <Loader2 className="w-12 h-12 animate-spin text-blue-600" />
            <p className="text-lg font-medium">Обработка платежа...</p>
            <p className="text-sm text-gray-500">Пожалуйста, подождите</p>
          </div>
        )}

        {step === 'success' && (
          <div className="flex flex-col items-center justify-center py-8 space-y-4">
            <CheckCircle className="w-16 h-16 text-green-500" />
            <p className="text-lg font-medium">Оплата успешна!</p>
            <p className="text-sm text-gray-500">Ваша подписка активирована</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}




