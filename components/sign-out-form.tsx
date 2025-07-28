'use client';
import Form from 'next/form';
import { signOutAction } from '@/app/actions/sign-out';
import { handleLogout } from '@/lib/utils/cross-domain';

export const SignOutForm = () => {
  const handleSignOut = async (formData: FormData) => {
    // Сначала выполняем стандартный выход
    await signOutAction();

    // Затем обрабатываем кросс-доменный выход
    handleLogout();
  };

  return (
    <Form className="w-full" action={handleSignOut}>
      <button
        type="submit"
        className="w-full text-left px-1 py-0.5 text-red-500"
      >
        Sign out
      </button>
    </Form>
  );
};
