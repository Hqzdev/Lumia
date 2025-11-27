'use client';

import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Check, X, Zap, Award, Crown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useSession } from 'next-auth/react';

const pricingTiers = [
  {
    id: 1,
    name: 'Free',
    price: '$0',
    period: 'Forever free',
    leads: 'Unlimited*',
    popular: false,
    buttonText: 'Get Started',
    buttonLink: '/signup',
    icon: 'F',
    dbValue: 'free',
    features: [
      {
        name: 'Model: Lumia V2 (legacy, less powerful version)',
        included: true,
      },
      {
        name: 'Unlimited usage* (may be limited during peak hours)',
        included: true,
      },
      { name: 'Slower response speed', included: true },
      { name: 'Lower understanding of complex queries', included: true },
      { name: 'Sometimes struggles with long tasks', included: true },
      { name: 'No image analysis, file uploads, or plugins', included: true },
      { name: 'No team features', included: false },
      { name: 'No advanced security', included: false },
      { name: 'No API integrations', included: false },
      { name: 'No priority support', included: false },
    ],
  },
  {
    id: 2,
    name: 'Premium',
    price: '$15',
    period: '/month',
    leads: 'Unlimited*',
    popular: true,
    buttonText: 'Upgrade Now',
    buttonLink: '/signup',
    icon: 'P',
    dbValue: 'premium',
    features: [
      {
        name: 'Access to all latest models (Lumia V4, GPT-4, etc.)',
        included: true,
      },
      { name: 'Image analysis & file uploads', included: true },
      { name: 'Fast response speed, almost no queue', included: true },
      {
        name: 'Best quality for complex tasks (code, business, SEO, essays)',
        included: true,
      },
      { name: 'Hourly request limit: 80 messages per 3 hours', included: true },
      { name: 'No team workspace', included: false },
      { name: 'No advanced security', included: false },
      { name: 'No private model API integration', included: false },
      { name: 'Priority support', included: true },
      { name: 'Most popular for power users', included: true },
    ],
  },
  {
    id: 3,
    name: 'Team',
    price: '$20',
    period: '/месяц/пользователь',
    leads: 'Unlimited*',
    popular: false,
    buttonText: 'Upgrade Now',
    buttonLink: '/signup',
    icon: 'T',
    dbValue: 'team',
    features: [
      { name: 'Everything in Premium', included: true },
      { name: 'Shared workspace for your team', included: true },
      { name: 'Custom folders & project management', included: true },
      { name: 'Advanced security settings', included: true },
      { name: 'Private model API integration', included: true },
      { name: 'Admin controls & permissions', included: true },
      { name: 'Best for business & startups', included: true },
      { name: 'Custom pricing for large teams', included: true },
      { name: 'Dedicated account manager', included: true },
    ],
  },
];

const getIconComponent = (tierName: string) => {
  switch (tierName) {
    case 'Free':
      return <Zap className="w-6 h-6 text-green-500" />;
    case 'Premium':
      return <Award className="w-6 h-6 text-purple-500" />;
    case 'Team':
      return <Crown className="w-6 h-6 text-red-500" />;
    default:
      return null;
  }
};

export function UpgradePlanDialog({
  open,
  onOpenChange,
  userId,
}: { open: boolean; onOpenChange: (open: boolean) => void; userId: string }) {
  const [loading, setLoading] = useState<string | null>(null);
  const { data: session, update } = useSession();
  // По умолчанию показываем free как активную подписку
  const currentSubscription = session?.user?.subscription || 'free';

  // Обновляем сессию при открытии диалога, чтобы показывать актуальную подписку
  useEffect(() => {
    if (open) {
      update().catch((err) => {
        console.error('Failed to update session:', err);
      });
    }
  }, [open, update]);

  async function handleSelectPlan(planName: string, dbValue: string) {
    // Если выбран free план, просто обновляем в БД без оплаты
    if (dbValue === 'free') {
      setLoading(dbValue);
      try {
        const res = await fetch('/api/upgrade-subscription', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId, subscription: dbValue }),
        });
        const data = await res.json();
        if (res.ok) {
          await update();
          window.location.reload();
        } else {
          console.error('Ошибка при обновлении подписки', data);
          setLoading(null);
        }
      } catch (e) {
        console.error('Ошибка сети при обновлении подписки', e);
        setLoading(null);
      }
      return;
    }

    // Для платных планов создаем платеж и перенаправляем на страницу оплаты
    setLoading(dbValue);
    try {
      // Amounts in dollars: Premium $15, Team $20
      // We'll store in cents for precision, but display in dollars
      const amount = dbValue === 'premium' ? 15 : 20; // $15 for Premium, $20 for Team

      const res = await fetch('/api/create-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, subscription: dbValue, amount }),
      });

      if (!res.ok) {
        const errorData = await res
          .json()
          .catch(() => ({ error: `HTTP ${res.status}` }));
        console.error('Ошибка при создании платежа:', errorData);
        alert(errorData.error || 'Ошибка при создании платежа');
        setLoading(null);
        return;
      }

      const data = await res.json();
      if (data.url) {
        // Перенаправляем на страницу оплаты с закодированным токеном
        window.location.href = data.url;
      } else {
        alert('Не удалось получить URL для оплаты');
        setLoading(null);
      }
    } catch (e: any) {
      console.error('Ошибка сети при создании платежа:', e);
      alert(`Ошибка сети: ${e.message || 'Проверьте подключение к интернету'}`);
      setLoading(null);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[900px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-blue-600">
            Upgrade Plan
          </DialogTitle>
          <DialogDescription>
            Lumia.ai outperforms human salespeople at 1/10th the cost. Choose
            the plan that fits your needs.
          </DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
          {pricingTiers.map((tier) => (
            <Card
              key={tier.id}
              className={cn(
                'border-blue-100',
                tier.popular && 'border-t-4 border-t-blue-500',
              )}
            >
              <CardHeader>
                <div className="flex items-center gap-2 mb-2">
                  {getIconComponent(tier.name)}
                  <CardTitle className="text-blue-600 text-lg">
                    {tier.name}
                  </CardTitle>
                </div>
                <CardDescription className="text-2xl font-bold text-gray-900">
                  {tier.price}{' '}
                  <span className="text-base font-normal text-gray-400">
                    {tier.period}
                  </span>
                </CardDescription>
                <div className="text-sm text-gray-400 mt-1">
                  {tier.leads} leads/mo
                </div>
                {tier.popular && (
                  <div className="mt-2">
                    <span className="bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full text-xs font-medium">
                      MOST POPULAR
                    </span>
                  </div>
                )}
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 mb-4">
                  {tier.features.map((feature) => (
                    <li
                      key={feature.name}
                      className="flex items-center gap-2 text-sm"
                    >
                      {feature.included ? (
                        <Check className="w-4 h-4 text-green-500" />
                      ) : (
                        <X className="w-4 h-4 text-red-400" />
                      )}
                      <span>{feature.name}</span>
                    </li>
                  ))}
                </ul>
                <button
                  type="button"
                  className={cn(
                    'block w-full text-center py-2 px-4 rounded-lg font-medium transition-colors border disabled:opacity-50 disabled:cursor-not-allowed',
                    currentSubscription === tier.dbValue
                      ? 'bg-white border-blue-600 text-blue-600'
                      : 'bg-blue-600 text-white border-transparent hover:bg-blue-700',
                  )}
                  onClick={() => handleSelectPlan(tier.name, tier.dbValue)}
                  disabled={loading === tier.dbValue}
                >
                  {loading === tier.dbValue
                    ? 'Loading...'
                    : currentSubscription === tier.dbValue
                      ? 'Current Plan'
                      : tier.buttonText}
                </button>
              </CardContent>
            </Card>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
