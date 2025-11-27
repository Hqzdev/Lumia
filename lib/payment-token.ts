import crypto from 'crypto';

const SECRET_KEY = process.env.PAYMENT_SECRET_KEY || 'default-secret-key-change-in-production';

interface PaymentTokenData {
  userId: string;
  subscription: string;
  amount: number;
  timestamp: number;
}

// Кодирование данных платежа в токен
export function encodePaymentToken(data: PaymentTokenData): string {
  const payload = JSON.stringify(data);
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(
    'aes-256-cbc',
    crypto.scryptSync(SECRET_KEY, 'salt', 32),
    iv,
  );

  let encrypted = cipher.update(payload, 'utf8', 'base64');
  encrypted += cipher.final('base64');

  // Объединяем IV и зашифрованные данные
  const token = `${iv.toString('base64')}:${encrypted}`;
  
  // Кодируем в base64 для URL
  return Buffer.from(token).toString('base64url');
}

// Декодирование токена в данные платежа
export function decodePaymentToken(token: string): PaymentTokenData | null {
  try {
    // Декодируем из base64url
    const decoded = Buffer.from(token, 'base64url').toString('utf8');
    const [ivBase64, encrypted] = decoded.split(':');

    if (!ivBase64 || !encrypted) {
      return null;
    }

    const iv = Buffer.from(ivBase64, 'base64');
    const decipher = crypto.createDecipheriv(
      'aes-256-cbc',
      crypto.scryptSync(SECRET_KEY, 'salt', 32),
      iv,
    );

    let decrypted = decipher.update(encrypted, 'base64', 'utf8');
    decrypted += decipher.final('utf8');

    const data = JSON.parse(decrypted) as PaymentTokenData;

    // Проверяем срок действия токена (24 часа)
    const now = Date.now();
    const maxAge = 24 * 60 * 60 * 1000; // 24 часа
    if (now - data.timestamp > maxAge) {
      return null;
    }

    return data;
  } catch (error) {
    console.error('Token decode error:', error);
    return null;
  }
}

