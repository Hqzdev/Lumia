// Простое хранилище платежей в памяти (для тестовой системы)
// В продакшене можно использовать Redis или БД

interface Payment {
  id: string;
  userId: string;
  subscription: string;
  amount: number;
  status: 'pending' | 'completed' | 'failed';
  createdAt: number;
}

const payments = new Map<string, Payment>();

export function createPayment(payment: Payment): void {
  payments.set(payment.id, payment);
}

export function getPayment(paymentId: string): Payment | undefined {
  return payments.get(paymentId);
}

export function updatePayment(paymentId: string, updates: Partial<Payment>): void {
  const payment = payments.get(paymentId);
  if (payment) {
    payments.set(paymentId, { ...payment, ...updates });
  }
}

export function deletePayment(paymentId: string): boolean {
  return payments.delete(paymentId);
}

