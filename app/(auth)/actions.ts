'use server';

import { z } from 'zod';

import { createUser, getUserByEmail, getUserByNickname } from '@/lib/db/queries';

import { signIn } from './auth';

const authFormSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

const registerFormSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  nickname: z.string().min(3).max(32),
});

const loginFormSchema = z.object({
  nickname: z.string().min(3).max(32),
  password: z.string().min(6),
});

export interface LoginActionState {
  status: 'idle' | 'in_progress' | 'success' | 'failed' | 'invalid_data';
}

export const login = async (
  _: LoginActionState,
  formData: FormData,
): Promise<LoginActionState> => {
  try {
    const validatedData = loginFormSchema.parse({
      nickname: formData.get('nickname'),
      password: formData.get('password'),
    });

    // Получаем пользователя по нику
    const users = await getUserByNickname(validatedData.nickname);
    if (!users.length) {
      return { status: 'failed' };
    }
    const user = users[0];

    await signIn('credentials', {
      nickname: validatedData.nickname,
      password: validatedData.password,
      redirect: false,
    });

    return { status: 'success' };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { status: 'invalid_data' };
    }
    return { status: 'failed' };
  }
};

export interface RegisterActionState {
  status:
    | 'idle'
    | 'in_progress'
    | 'success'
    | 'failed'
    | 'user_exists'
    | 'nickname_exists'
    | 'invalid_data';
}

// Helper function to add timeout to promises with proper cleanup
function withTimeout<T>(promise: Promise<T>, timeoutMs: number): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    let timeoutId: NodeJS.Timeout | undefined;
    let isResolved = false;

    // Set up timeout
    timeoutId = setTimeout(() => {
      if (!isResolved) {
        isResolved = true;
        // Suppress any future errors from the original promise to prevent unhandledRejection
        promise.catch(() => {
          // Silently handle errors after timeout to prevent unhandledRejection
        });
        reject(new Error('Database operation timed out'));
      }
    }, timeoutMs);

    // Handle promise completion
    promise
      .then((result) => {
        if (!isResolved) {
          isResolved = true;
          if (timeoutId) {
            clearTimeout(timeoutId);
          }
          resolve(result);
        }
      })
      .catch((error) => {
        if (!isResolved) {
          isResolved = true;
          if (timeoutId) {
            clearTimeout(timeoutId);
          }
          reject(error);
        } else {
          // If already resolved (timeout occurred), suppress the error to prevent unhandledRejection
          console.warn('Database operation error after timeout (suppressed):', error);
        }
      });
  });
}

export const register = async (
  _: RegisterActionState,
  formData: FormData,
): Promise<RegisterActionState> => {
  try {
    const validatedData = registerFormSchema.parse({
      email: formData.get('email'),
      password: formData.get('password'),
      nickname: formData.get('nickname'),
    });

    // Выполняем проверки параллельно без дополнительных таймаутов
    // Полагаемся на таймауты postgres клиента (10 секунд)
    const [usersByEmail, usersByNickname] = await Promise.all([
      getUserByEmail(validatedData.email),
      getUserByNickname(validatedData.nickname),
    ]);

    const [userByEmail] = usersByEmail;
    if (userByEmail) {
      return { status: 'user_exists' } as RegisterActionState;
    }
    
    const [userByNickname] = usersByNickname;
    if (userByNickname) {
      return { status: 'nickname_exists' } as RegisterActionState;
    }
    
    // Создаем пользователя
    await createUser(validatedData.email, validatedData.password, validatedData.nickname);
    
    // Вход
    await signIn('credentials', {
      nickname: validatedData.nickname,
      password: validatedData.password,
      redirect: false,
    });

    return { status: 'success' };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { status: 'invalid_data' };
    }
    // Check for timeout errors
    if (
      error instanceof Error && 
      (error.message.includes('timed out') || 
       error.message.includes('ETIMEDOUT') || 
       (error as any).code === 'ETIMEDOUT' ||
       (error as any).code === 'ECONNRESET')
    ) {
      console.error('Database connection error during registration:', error);
      return { status: 'failed' };
    }
    console.error('Registration error:', error);
    return { status: 'failed' };
  }
};
