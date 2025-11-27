'use client';

import { useRouter } from 'next/navigation';
import { XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function PaymentCancelPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center max-w-md">
        <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
        <h1 className="text-2xl font-bold mb-2">Оплата отменена</h1>
        <p className="text-gray-600 mb-4">
          Оплата была отменена. Деньги не списаны.
        </p>
        <Button onClick={() => router.push('/')}>На главную</Button>
      </div>
    </div>
  );
}

