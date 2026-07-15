import { type HTMLAttributes, type ReactNode } from 'react';

type CardProps = HTMLAttributes<HTMLDivElement> & {
  children: ReactNode;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  elevated?: boolean;
  /** @deprecated Pattern overlays removed for minimal brand; ignored. */
  pattern?: boolean;
};

const paddingClasses = {
  none: '',
  sm: 'p-5',
  md: 'p-7',
  lg: 'p-9',
};

export function Card({
  children,
  padding = 'md',
  elevated = false,
  pattern: _pattern = false,
  className = '',
  ...props
}: CardProps) {
  return (
    <div
      className={[
        'card-premium relative',
        elevated ? 'bg-elevated' : 'bg-surface',
        paddingClasses[padding],
        className,
      ].filter(Boolean).join(' ')}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={`mb-5 ${className}`}>{children}</div>;
}

export function CardTitle({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <h2 className={`text-lg font-bold text-fg font-display ${className}`}>{children}</h2>;
}
