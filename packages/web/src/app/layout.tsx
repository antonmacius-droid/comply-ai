import type { Metadata } from 'next';
import { Providers } from '@/components/providers';

export const metadata: Metadata = {
  title: 'Comply AI — EU AI Act Compliance Engine',
  description:
    'Open-source compliance engine for the EU AI Act. Risk classification, document generation, conformity assessment, and post-market monitoring.',
  openGraph: {
    title: 'Comply AI — EU AI Act Compliance Engine',
    description:
      'Classify, document, and monitor your AI systems. Avoid €35M fines.',
    type: 'website',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body
        style={{
          margin: 0,
          fontFamily:
            '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
          background: '#F8FAFC',
          color: '#0F172A',
          WebkitFontSmoothing: 'antialiased',
          MozOsxFontSmoothing: 'grayscale' as any,
        }}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
