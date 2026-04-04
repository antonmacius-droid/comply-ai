'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

const GoogleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24">
    <path
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
      fill="#4285F4"
    />
    <path
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      fill="#34A853"
    />
    <path
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      fill="#FBBC05"
    />
    <path
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      fill="#EA4335"
    />
  </svg>
);

const LogoIcon = () => (
  <div
    style={{
      width: 44,
      height: 44,
      borderRadius: 12,
      background: 'linear-gradient(135deg, #6366F1, #8B5CF6)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 8,
    }}
  >
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="white"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      <path d="M9 12l2 2 4-4" />
    </svg>
  </div>
);

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, name }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Registration failed');
        setLoading(false);
        return;
      }

      router.push('/registry');
    } catch {
      setError('Something went wrong. Please try again.');
      setLoading(false);
    }
  };

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '12px 14px',
    borderRadius: 10,
    border: '1.5px solid #E2E8F0',
    background: '#F8FAFC',
    color: '#0F172A',
    fontSize: 14,
    outline: 'none',
    boxSizing: 'border-box',
    transition: 'border-color 0.2s, box-shadow 0.2s',
  };

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    e.currentTarget.style.borderColor = '#6366F1';
    e.currentTarget.style.boxShadow = '0 0 0 3px rgba(99,102,241,0.08)';
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    e.currentTarget.style.borderColor = '#E2E8F0';
    e.currentTarget.style.boxShadow = 'none';
  };

  return (
    <div
      style={{
        background: 'white',
        borderRadius: 16,
        padding: 40,
        width: '100%',
        maxWidth: 420,
        boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
      }}
    >
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          marginBottom: 32,
        }}
      >
        <LogoIcon />
        <h1
          style={{
            fontSize: 22,
            fontWeight: 700,
            color: '#0F172A',
            margin: '12px 0 4px',
            letterSpacing: '-0.02em',
          }}
        >
          Create your account
        </h1>
        <p style={{ fontSize: 14, color: '#64748B', margin: 0 }}>
          Start your 14-day free trial
        </p>
      </div>

      <a
        href="/api/auth/google"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 10,
          width: '100%',
          padding: '12px 16px',
          borderRadius: 10,
          border: '1.5px solid #E2E8F0',
          background: 'white',
          color: '#1E293B',
          fontSize: 14,
          fontWeight: 600,
          cursor: 'pointer',
          textDecoration: 'none',
          transition: 'all 0.2s',
          boxSizing: 'border-box',
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLElement).style.background = '#F8FAFC';
          (e.currentTarget as HTMLElement).style.borderColor = '#CBD5E1';
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLElement).style.background = 'white';
          (e.currentTarget as HTMLElement).style.borderColor = '#E2E8F0';
        }}
      >
        <GoogleIcon />
        Sign up with Google
      </a>

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          margin: '24px 0',
        }}
      >
        <div style={{ flex: 1, height: 1, background: '#E2E8F0' }} />
        <span style={{ fontSize: 12, color: '#94A3B8', fontWeight: 500 }}>or</span>
        <div style={{ flex: 1, height: 1, background: '#E2E8F0' }} />
      </div>

      <form onSubmit={handleSubmit}>
        {error && (
          <div
            style={{
              padding: '10px 14px',
              borderRadius: 8,
              background: '#FEF2F2',
              border: '1px solid #FECACA',
              color: '#DC2626',
              fontSize: 13,
              marginBottom: 16,
            }}
          >
            {error}
          </div>
        )}

        <div style={{ marginBottom: 16 }}>
          <label
            style={{
              display: 'block',
              fontSize: 13,
              fontWeight: 600,
              color: '#334155',
              marginBottom: 6,
            }}
          >
            Full name
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Jane Smith"
            required
            style={inputStyle}
            onFocus={handleFocus}
            onBlur={handleBlur}
          />
        </div>

        <div style={{ marginBottom: 16 }}>
          <label
            style={{
              display: 'block',
              fontSize: 13,
              fontWeight: 600,
              color: '#334155',
              marginBottom: 6,
            }}
          >
            Email
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@company.com"
            required
            style={inputStyle}
            onFocus={handleFocus}
            onBlur={handleBlur}
          />
        </div>

        <div style={{ marginBottom: 24 }}>
          <label
            style={{
              display: 'block',
              fontSize: 13,
              fontWeight: 600,
              color: '#334155',
              marginBottom: 6,
            }}
          >
            Password
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Min. 8 characters"
            required
            minLength={8}
            style={inputStyle}
            onFocus={handleFocus}
            onBlur={handleBlur}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          style={{
            width: '100%',
            padding: '12px 16px',
            borderRadius: 10,
            border: 'none',
            background: loading
              ? '#94A3B8'
              : 'linear-gradient(135deg, #6366F1, #4F46E5)',
            color: 'white',
            fontSize: 14,
            fontWeight: 600,
            cursor: loading ? 'not-allowed' : 'pointer',
            transition: 'all 0.2s',
            boxShadow: '0 2px 8px rgba(99,102,241,0.25)',
          }}
        >
          {loading ? 'Creating account...' : 'Start 14-day free trial'}
        </button>
      </form>

      <p
        style={{
          textAlign: 'center',
          fontSize: 12,
          color: '#94A3B8',
          marginTop: 16,
          marginBottom: 0,
        }}
      >
        No credit card required. Full access for 14 days.
      </p>

      <p
        style={{
          textAlign: 'center',
          fontSize: 13,
          color: '#64748B',
          marginTop: 16,
          marginBottom: 0,
        }}
      >
        Already have an account?{' '}
        <a
          href="/login"
          style={{
            color: '#6366F1',
            fontWeight: 600,
            textDecoration: 'none',
          }}
        >
          Sign in
        </a>
      </p>
    </div>
  );
}
