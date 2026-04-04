import { type InputHTMLAttributes, type CSSProperties } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  containerStyle?: CSSProperties;
}

export function Input({ label, error, containerStyle, style, ...props }: InputProps) {
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
      <input
        style={{
          width: '100%',
          padding: '8px 12px',
          fontSize: 13,
          borderRadius: 8,
          border: `1px solid ${error ? '#EF4444' : '#E2E8F0'}`,
          background: '#FFFFFF',
          color: '#0F172A',
          outline: 'none',
          transition: 'border-color 0.15s ease',
          fontFamily: 'inherit',
          lineHeight: '20px',
          boxSizing: 'border-box',
          ...style,
        }}
        {...props}
      />
      {error && (
        <div style={{ fontSize: 12, color: '#EF4444', marginTop: 4 }}>{error}</div>
      )}
    </div>
  );
}

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export function Textarea({ label, error, style, ...props }: TextareaProps) {
  return (
    <div style={{ marginBottom: 16 }}>
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
      <textarea
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
          resize: 'vertical',
          minHeight: 80,
          boxSizing: 'border-box',
          ...style,
        }}
        {...props}
      />
      {error && (
        <div style={{ fontSize: 12, color: '#EF4444', marginTop: 4 }}>{error}</div>
      )}
    </div>
  );
}
