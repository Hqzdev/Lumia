import type { Metadata } from 'next';

// Metadata для SEO оптимизации (ШАГ 7)
export const metadata: Metadata = {
  title: 'Register | Lumia',
  description: 'Create your Lumia account - The strongest A.I assistant. Start your journey with AI-powered conversations.',
  robots: {
    index: false, // Не индексируем страницу регистрации
    follow: false,
  },
};

export default function RegisterLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

