import { type SelectHTMLAttributes, type CSSProperties } from 'react';

interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options: SelectOption[];
  error?: string;
  containerStyle?: CSSProperties;
  placeholder?: string;
}

export function Select({
  label,
  options,
  error,
  containerStyle,
  placeholder,
  style,
  ...props
}: SelectProps) {
  return (
    <div style={{ marginBottom: 16, ...containerStyle }}>
      {label && (
        <label
          style={{
            display: 'block',
            fontSize: 13,
            fontWeight: 500,
            color: '#334155',
            marginBottom: 6,
          }}
        >
          {label}
        </label>
      )}
      <select
        style={{
          width: '100%',
          padding: '8px 12px',
          fontSize: 13,
          borderRadius: 8,
          border: `1px solid ${error ? '#EF4444' : '#E2E8F0'}`,
          background: '#FFFFFF',
          color: '#0F172A',
          outline: 'none',
          fontFamily: 'inherit',
          lineHeight: '20px',
          cursor: 'pointer',
          appearance: 'none',
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%2394A3B8' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`,
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'right 12px center',
          paddingRight: 32,
          boxSizing: 'border-box',
          ...style,
        }}
        {...props}
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {error && (
        <div style={{ fontSize: 12, color: '#EF4444', marginTop: 4 }}>{error}</div>
      )}
    </div>
  );
}
