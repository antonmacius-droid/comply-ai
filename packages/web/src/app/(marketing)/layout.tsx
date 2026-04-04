'use client';

import Link from 'next/link';

function Logo() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <div
        style={{
          width: 34,
          height: 34,
          borderRadius: 9,
          background: 'linear-gradient(135deg, #6366F1, #818CF8)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 15,
          fontWeight: 800,
          color: '#fff',
          letterSpacing: '-0.02em',
        }}
      >
        C
      </div>
      <span
        style={{
          fontSize: 17,
          fontWeight: 700,
          color: '#F8FAFC',
          letterSpacing: '-0.02em',
        }}
      >
        Comply AI
      </span>
    </div>
  );
}

function GitHubIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
    </svg>
  );
}

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ minHeight: '100vh', background: '#0F172A' }}>
      {/* Top Navigation */}
      <nav
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 100,
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          background: 'rgba(15, 23, 42, 0.85)',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
        }}
      >
        <div
          style={{
            maxWidth: 1200,
            margin: '0 auto',
            padding: '0 32px',
            height: 64,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <Link href="/" style={{ textDecoration: 'none' }}>
            <Logo />
          </Link>

          <div style={{ display: 'flex', alignItems: 'center', gap: 32 }}>
            <Link
              href="/docs"
              style={{
                fontSize: 14,
                fontWeight: 500,
                color: '#94A3B8',
                textDecoration: 'none',
                transition: 'color 0.15s',
              }}
            >
              Documentation
            </Link>
            <a
              href="https://github.com/afkzona/comply-ai"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                fontSize: 14,
                fontWeight: 500,
                color: '#94A3B8',
                textDecoration: 'none',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
              }}
            >
              <GitHubIcon />
              GitHub
            </a>
            <Link
              href="/registry"
              style={{
                fontSize: 13,
                fontWeight: 600,
                color: '#fff',
                textDecoration: 'none',
                padding: '8px 18px',
                borderRadius: 8,
                background: 'linear-gradient(135deg, #6366F1, #4F46E5)',
                boxShadow: '0 0 20px rgba(99, 102, 241, 0.3)',
                transition: 'all 0.2s',
              }}
            >
              Sign In
            </Link>
          </div>
        </div>
      </nav>

      {/* Page content */}
      <main>{children}</main>
    </div>
  );
}
