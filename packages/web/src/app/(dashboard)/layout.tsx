'use client';

import { Sidebar } from '@/components/ui/sidebar';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
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
  );
}
