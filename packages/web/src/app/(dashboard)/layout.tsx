'use client';

import { useState } from 'react';
import { Sidebar } from '@/components/ui/sidebar';

function UnlicensedBanner() {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  return (
    <div
      style={{
        background: '#fbbf24',
        color: '#78350f',
        padding: '10px 20px',
        fontSize: 14,
        fontWeight: 600,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'sticky',
        top: 0,
        zIndex: 9999,
      }}
    >
      <span>
        Unlicensed — commercial production use requires a license.{' '}
        <a
          href="https://afkzonagroup.lt/license"
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: '#78350f', textDecoration: 'underline' }}
        >
          Get one at afkzonagroup.lt
        </a>
      </span>
      <button
        onClick={() => setDismissed(true)}
        style={{
          background: 'none',
          border: 'none',
          color: '#78350f',
          fontSize: 18,
          cursor: 'pointer',
          padding: '0 4px',
          lineHeight: 1,
        }}
        aria-label="Dismiss"
      >
        x
      </button>
    </div>
  );
}

const showBanner =
  process.env.NODE_ENV === 'production' &&
  !process.env.COMPLY_LICENSE_KEY;

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
        {showBanner && <UnlicensedBanner />}
        <div style={{ padding: '32px 40px', maxWidth: 1280 }}>
          {children}
        </div>
      </main>
    </div>
  );
}
