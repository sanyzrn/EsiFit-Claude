import type { HTMLAttributes, ReactNode } from 'react';

/**
 * Canonical page content width — use on every top-level page section
 * so horizontal padding and max-width stay consistent across routes.
 */
export const PAGE_CONTAINER_CLASS =
  'max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8';

type PageContainerProps = HTMLAttributes<HTMLDivElement> & {
  children: ReactNode;
  /** Vertical padding: default py-8 (dashboard-like) or py-12 (marketing/list) */
  padY?: 'sm' | 'md' | 'lg';
};

const padYClass = {
  sm: 'py-6',
  md: 'py-8',
  lg: 'py-12',
} as const;

export function PageContainer({
  children,
  padY = 'lg',
  className = '',
  ...props
}: PageContainerProps) {
  return (
    <div
      className={[PAGE_CONTAINER_CLASS, padYClass[padY], className].filter(Boolean).join(' ')}
      {...props}
    >
      {children}
    </div>
  );
}
