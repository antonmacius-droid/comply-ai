import { type CSSProperties, type ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  style?: CSSProperties;
  padding?: boolean;
}

export function Card({ children, style, padding = true }: CardProps) {
  return (
    <div
      style={{
        background: '#FFFFFF',
        borderRadius: 12,
        border: '1px solid #E2E8F0',
        boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
        ...(padding ? { padding: '20px 24px' } : {}),
        ...style,
      }}
    >
      {children}
    </div>
  );
}

interface KpiCardProps {
  label: string;
  value: string | number;
  change?: string;
  changeType?: 'positive' | 'negative' | 'neutral';
  icon?: ReactNode;
}

export function KpiCard({ label, value, change, changeType = 'neutral', icon }: KpiCardProps) {
  const changeColors = {
    positive: '#16A34A',
    negative: '#DC2626',
    neutral: '#64748B',
  };

  return (
    <Card>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <div
            style={{
              fontSize: 13,
              fontWeight: 500,
              color: '#64748B',
              marginBottom: 8,
            }}
          >
            {label}
          </div>
          <div
            style={{
              fontSize: 28,
              fontWeight: 700,
              color: '#0F172A',
              letterSpacing: '-0.02em',
              lineHeight: 1,
            }}
          >
            {value}
          </div>
          {change && (
            <div
              style={{
                fontSize: 12,
                color: changeColors[changeType],
                marginTop: 8,
                fontWeight: 500,
              }}
            >
              {change}
            </div>
          )}
        </div>
        {icon && (
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: 10,
              background: '#F1F5F9',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#64748B',
            }}
          >
            {icon}
          </div>
        )}
      </div>
    </Card>
  );
}
