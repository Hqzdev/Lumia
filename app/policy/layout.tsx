import type { Metadata } from 'next';

// Metadata для SEO оптимизации (ШАГ 1 и ШАГ 7)
export const metadata: Metadata = {
  title: 'Privacy Policy | Lumia',
  description: 'Lumia Privacy Policy - Learn how we collect, use, and protect your information when using our AI assistant service.',
  openGraph: {
    title: 'Privacy Policy | Lumia',
    description: 'Lumia Privacy Policy - Learn how we collect, use, and protect your information.',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Privacy Policy | Lumia',
    description: 'Lumia Privacy Policy - Learn how we collect, use, and protect your information.',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function PolicyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

