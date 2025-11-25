'use client';
import Form from 'next/form';
import { signOutAction } from '@/app/actions/sign-out';

export const SignOutForm = () => {
  return (
    <Form className="w-full" action={signOutAction}>
      <button
        type="submit"
        className="w-full text-left px-1 py-0.5 text-red-500"
      >
        Sign out
      </button>
    </Form>
  );
};
