import { type InputHTMLAttributes, type ReactNode } from 'react';

interface InputFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: ReactNode;
}

export function InputField({ label, error, icon, className = '', ...props }: InputFieldProps) {
  return (
    <div className="space-y-1.5">
      {label && (
        <label className="block text-sm font-medium" style={{ color: 'var(--theme-fg-muted)' }}>
          {label}
        </label>
      )}
      <div className="relative">
        {icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--theme-fg-subtle)' }}>
            {icon}
          </div>
        )}
        <input
          className={`w-full px-3 py-2.5 text-sm transition-all duration-[180ms] outline-none ${
            icon ? 'pl-10' : ''
          } ${className}`}
          style={{
            backgroundColor: 'var(--theme-elevated)',
            border: `1px solid ${error ? 'var(--theme-error)' : 'var(--theme-border)'}`,
            borderRadius: 'var(--radius-input)',
            color: 'var(--theme-fg)',
          }}
          {...props}
        />
      </div>
      {error && (
        <p className="text-xs" style={{ color: 'var(--theme-error)' }}>{error}</p>
      )}
    </div>
  );
}
