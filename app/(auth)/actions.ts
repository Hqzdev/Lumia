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

    const [userByEmail] = await getUserByEmail(validatedData.email);
    if (userByEmail) {
      return { status: 'user_exists' } as RegisterActionState;
    }
    const [userByNickname] = await getUserByNickname(validatedData.nickname);
    if (userByNickname) {
      return { status: 'nickname_exists' } as RegisterActionState;
    }
    await createUser(validatedData.email, validatedData.password, validatedData.nickname);
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
