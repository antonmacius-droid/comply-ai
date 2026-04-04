import { type ButtonHTMLAttributes, type CSSProperties } from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
}

const variantMap: Record<ButtonVariant, CSSProperties> = {
  primary: {
    background: '#6366F1',
    color: '#FFFFFF',
    border: '1px solid #6366F1',
  },
  secondary: {
    background: '#FFFFFF',
    color: '#334155',
    border: '1px solid #E2E8F0',
  },
  danger: {
    background: '#EF4444',
    color: '#FFFFFF',
    border: '1px solid #EF4444',
  },
  ghost: {
    background: 'transparent',
    color: '#64748B',
    border: '1px solid transparent',
  },
};

const sizeMap: Record<ButtonSize, CSSProperties> = {
  sm: { padding: '5px 12px', fontSize: 12 },
  md: { padding: '8px 16px', fontSize: 13 },
  lg: { padding: '10px 20px', fontSize: 14 },
};

export function Button({
  variant = 'primary',
  size = 'md',
  style,
  disabled,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      disabled={disabled}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        borderRadius: 8,
        fontWeight: 500,
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.5 : 1,
        transition: 'all 0.15s ease',
        fontFamily: 'inherit',
        lineHeight: '20px',
        whiteSpace: 'nowrap',
        ...variantMap[variant],
        ...sizeMap[size],
        ...style,
      }}
      {...props}
    >
      {children}
    </button>
  );
}
