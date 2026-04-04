import { type CSSProperties, type ReactNode } from 'react';

type RiskLevel = 'unacceptable' | 'high' | 'limited' | 'minimal' | 'gpai';
type BadgeVariant = RiskLevel | 'default' | 'success' | 'warning' | 'danger' | 'info';

const variantStyles: Record<BadgeVariant, { bg: string; color: string; border: string }> = {
  unacceptable: { bg: '#FEF2F2', color: '#DC2626', border: '#FECACA' },
  high: { bg: '#FFF7ED', color: '#EA580C', border: '#FED7AA' },
  limited: { bg: '#FEFCE8', color: '#CA8A04', border: '#FEF08A' },
  minimal: { bg: '#F0FDF4', color: '#16A34A', border: '#BBF7D0' },
  gpai: { bg: '#EFF6FF', color: '#2563EB', border: '#BFDBFE' },
  default: { bg: '#F1F5F9', color: '#475569', border: '#E2E8F0' },
  success: { bg: '#F0FDF4', color: '#16A34A', border: '#BBF7D0' },
  warning: { bg: '#FFFBEB', color: '#D97706', border: '#FDE68A' },
  danger: { bg: '#FEF2F2', color: '#DC2626', border: '#FECACA' },
  info: { bg: '#EFF6FF', color: '#2563EB', border: '#BFDBFE' },
};

interface BadgeProps {
  variant?: BadgeVariant;
  children: ReactNode;
  style?: CSSProperties;
}

export function Badge({ variant = 'default', children, style }: BadgeProps) {
  const v = variantStyles[variant] || variantStyles.default;
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        padding: '2px 8px',
        borderRadius: 9999,
        fontSize: 11,
        fontWeight: 500,
        lineHeight: '18px',
        background: v.bg,
        color: v.color,
        border: `1px solid ${v.border}`,
        whiteSpace: 'nowrap',
        ...style,
      }}
    >
      {children}
    </span>
  );
}

export function RiskBadge({ level }: { level: RiskLevel }) {
  const labels: Record<RiskLevel, string> = {
    unacceptable: 'Prohibited',
    high: 'High Risk',
    limited: 'Limited Risk',
    minimal: 'Minimal Risk',
    gpai: 'GPAI',
  };
  return <Badge variant={level}>{labels[level]}</Badge>;
}
