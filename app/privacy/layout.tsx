import type { Metadata } from 'next';

// Metadata для SEO оптимизации (ШАГ 1 и ШАГ 7)
export const metadata: Metadata = {
  title: 'Terms of Service | Lumia',
  description: 'Lumia Terms of Service - Read our terms and conditions for using our AI assistant service.',
  openGraph: {
    title: 'Terms of Service | Lumia',
    description: 'Lumia Terms of Service - Read our terms and conditions for using our AI assistant service.',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Terms of Service | Lumia',
    description: 'Lumia Terms of Service - Read our terms and conditions.',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function PrivacyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

