'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navItems = [
  { href: '/', label: 'Dashboard', icon: 'grid' },
  { href: '/registry', label: 'Registry', icon: 'box' },
  { href: '/risk', label: 'Risk Assessment', icon: 'shield' },
  { href: '/documents', label: 'Documents', icon: 'file' },
  { href: '/conformity', label: 'Conformity', icon: 'check-circle' },
  { href: '/monitoring', label: 'Monitoring', icon: 'activity' },
  { href: '/incidents', label: 'Incidents', icon: 'alert' },
  { href: '/settings', label: 'Settings', icon: 'settings' },
];

const iconPaths: Record<string, string> = {
  grid: 'M3 3h7v7H3V3zm11 0h7v7h-7V3zm0 11h7v7h-7v-7zM3 14h7v7H3v-7z',
  box: 'M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z',
  shield:
    'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z',
  file: 'M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z M14 2v6h6',
  'check-circle':
    'M22 11.08V12a10 10 0 11-5.93-9.14 M22 4L12 14.01l-3-3',
  activity:
    'M22 12h-4l-3 9L9 3l-3 9H2',
  alert:
    'M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z M12 9v4 M12 17h.01',
  settings:
    'M12 15a3 3 0 100-6 3 3 0 000 6z M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z',
};

function NavIcon({ name }: { name: string }) {
  const paths = (iconPaths[name] || '').split(' M');
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {paths.map((d, i) => (
        <path key={i} d={i === 0 ? d : 'M' + d} />
      ))}
    </svg>
  );
}

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside
      style={{
        width: 260,
        minHeight: '100vh',
        background: '#0F172A',
        color: '#E2E8F0',
        display: 'flex',
        flexDirection: 'column',
        position: 'fixed',
        left: 0,
        top: 0,
        bottom: 0,
        zIndex: 50,
      }}
    >
      {/* Logo */}
      <div
        style={{
          padding: '24px 20px 20px',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: 8,
              background: 'linear-gradient(135deg, #6366F1, #818CF8)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 14,
              fontWeight: 700,
              color: '#fff',
            }}
          >
            C
          </div>
          <div>
            <div
              style={{
                fontSize: 15,
                fontWeight: 600,
                color: '#F8FAFC',
                letterSpacing: '-0.01em',
              }}
            >
              Comply AI
            </div>
            <div style={{ fontSize: 11, color: '#64748B', marginTop: 1 }}>
              EU AI Act Compliance
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav style={{ flex: 1, padding: '12px 8px', overflowY: 'auto' }}>
        <div
          style={{
            fontSize: 10,
            fontWeight: 600,
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
            color: '#475569',
            padding: '8px 12px 6px',
          }}
        >
          Main Menu
        </div>
        {navItems.map((item) => {
          const isActive =
            item.href === '/'
              ? pathname === '/'
              : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '9px 12px',
                borderRadius: 6,
                fontSize: 13,
                fontWeight: isActive ? 500 : 400,
                color: isActive ? '#F8FAFC' : '#94A3B8',
                background: isActive ? 'rgba(99, 102, 241, 0.15)' : 'transparent',
                textDecoration: 'none',
                marginBottom: 2,
                transition: 'all 0.15s ease',
              }}
            >
              <span style={{ color: isActive ? '#818CF8' : '#64748B', display: 'flex' }}>
                <NavIcon name={item.icon} />
              </span>
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* User section */}
      <div
        style={{
          padding: '16px 16px',
          borderTop: '1px solid rgba(255,255,255,0.06)',
          display: 'flex',
          alignItems: 'center',
          gap: 10,
        }}
      >
        <div
          style={{
            width: 32,
            height: 32,
            borderRadius: '50%',
            background: '#1E293B',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 12,
            fontWeight: 600,
            color: '#94A3B8',
          }}
        >
          AK
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              fontSize: 13,
              fontWeight: 500,
              color: '#E2E8F0',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            Anton K.
          </div>
          <div style={{ fontSize: 11, color: '#64748B' }}>Admin</div>
        </div>
      </div>
    </aside>
  );
}
