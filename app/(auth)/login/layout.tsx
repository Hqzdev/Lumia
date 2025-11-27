import type { Metadata } from 'next';

// Metadata для SEO оптимизации (ШАГ 7)
export const metadata: Metadata = {
  title: 'Login | Lumia',
  description: 'Login to Lumia - The strongest A.I assistant. Access your account and start chatting with AI.',
  robots: {
    index: false, // Не индексируем страницу логина
    follow: false,
  },
};

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

