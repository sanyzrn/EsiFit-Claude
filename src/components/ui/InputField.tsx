import { type InputHTMLAttributes, type ReactNode, useId } from 'react';

type InputFieldProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> & {
  label?: string;
  icon?: ReactNode;
  trailing?: ReactNode;
  hint?: ReactNode;
  error?: string;
};

export function InputField({
  label,
  icon,
  trailing,
  hint,
  error,
  className = '',
  id,
  ...props
}: InputFieldProps) {
  const autoId = useId();
  const inputId = id ?? autoId;

  return (
    <div>
      {label && (
        <label htmlFor={inputId} className="block text-sm font-medium text-fg-muted mb-1.5">
          {label}
        </label>
      )}
      <div className="relative">
        {icon && (
          <span className="absolute inset-y-0 start-3.5 flex items-center pointer-events-none text-fg-subtle [&>svg]:w-4 [&>svg]:h-4">
            {icon}
          </span>
        )}
        <input
          id={inputId}
          className={[
            'w-full py-3 bg-surface border border-border rounded-[12px] text-fg outline-none transition-colors duration-[180ms]',
            'focus:border-brand focus:ring-1 focus:ring-brand/30',
            'disabled:opacity-50 placeholder:text-fg-faint',
            icon ? 'ps-10' : 'ps-4',
            trailing ? 'pe-10' : 'pe-4',
            error ? 'border-danger/50' : '',
            className,
          ].filter(Boolean).join(' ')}
          aria-invalid={error ? true : undefined}
          aria-describedby={hint || error ? `${inputId}-hint` : undefined}
          {...props}
        />
        {trailing && (
          <span className="absolute inset-y-0 end-3.5 flex items-center">{trailing}</span>
        )}
      </div>
      {(hint || error) && (
        <p
          id={`${inputId}-hint`}
          className={`text-xs mt-1.5 ${error ? 'text-danger' : 'text-fg-subtle'}`}
          aria-live={hint ? 'polite' : undefined}
        >
          {error ?? hint}
        </p>
      )}
    </div>
  );
}
