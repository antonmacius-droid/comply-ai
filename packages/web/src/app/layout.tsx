import type { Metadata } from 'next';
import { Sidebar } from '@/components/ui/sidebar';

export const metadata: Metadata = {
  title: 'Comply AI — EU AI Act Compliance',
  description: 'Enterprise AI compliance management for the EU AI Act',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          fontFamily:
            '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
          background: '#F8FAFC',
          color: '#0F172A',
          WebkitFontSmoothing: 'antialiased',
        }}
      >
        <div style={{ display: 'flex', minHeight: '100vh' }}>
          <Sidebar />
          <main
            style={{
              flex: 1,
              marginLeft: 260,
              minHeight: '100vh',
            }}
          >
            <div style={{ padding: '32px 40px', maxWidth: 1280 }}>
              {children}
            </div>
          </main>
        </div>
      </body>
    </html>
  );
}
