import { type HTMLAttributes, type ReactNode } from 'react';
import { PersianPattern } from './PersianPattern';

type CardProps = HTMLAttributes<HTMLDivElement> & {
  children: ReactNode;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  elevated?: boolean;
  pattern?: boolean;
};

const paddingClasses = {
  none: '',
  sm: 'p-4',
  md: 'p-6',
  lg: 'p-8',
};

export function Card({
  children,
  padding = 'md',
  elevated = false,
  pattern = false,
  className = '',
  ...props
}: CardProps) {
  return (
    <div
      className={[
        'card-iranian relative overflow-hidden',
        elevated ? 'bg-elevated' : 'bg-surface',
        paddingClasses[padding],
        className,
      ].filter(Boolean).join(' ')}
      {...props}
    >
      {pattern && <PersianPattern opacity={0.5} />}
      <div className="relative z-10">{children}</div>
    </div>
  );
}

export function CardHeader({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={`mb-4 ${className}`}>{children}</div>;
}

export function CardTitle({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <h2 className={`text-lg font-bold text-fg font-display ${className}`}>{children}</h2>;
}
