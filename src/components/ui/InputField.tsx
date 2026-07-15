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
        <label htmlFor={inputId} className="block text-sm font-medium text-fg-muted mb-1">
          {label}
        </label>
      )}
      <div className="relative">
        {icon && (
          <span className="absolute inset-y-0 start-3 flex items-center pointer-events-none text-fg-subtle [&>svg]:w-4 [&>svg]:h-4">
            {icon}
          </span>
        )}
        <input
          id={inputId}
          className={[
            'w-full py-2.5 bg-elevated border rounded-lg text-fg outline-none transition-colors',
            'border-strong focus:border-orange-500 focus:ring-1 focus:ring-orange-500',
            'disabled:opacity-50',
            icon ? 'ps-10' : 'ps-4',
            trailing ? 'pe-10' : 'pe-4',
            error ? 'border-red-500/50' : '',
            className,
          ].filter(Boolean).join(' ')}
          aria-invalid={error ? true : undefined}
          aria-describedby={hint || error ? `${inputId}-hint` : undefined}
          {...props}
        />
        {trailing && (
          <span className="absolute inset-y-0 end-3 flex items-center">{trailing}</span>
        )}
      </div>
      {(hint || error) && (
        <p
          id={`${inputId}-hint`}
          className={`text-xs mt-1 ${error ? 'text-red-400' : 'text-fg-subtle'}`}
          aria-live={hint ? 'polite' : undefined}
        >
          {error ?? hint}
        </p>
      )}
    </div>
  );
}
