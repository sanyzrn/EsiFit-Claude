import { type ReactNode } from 'react';

export const PAGE_CONTAINER_CLASS = 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8';

interface PageContainerProps {
  children: ReactNode;
  className?: string;
  padY?: 'sm' | 'md' | 'lg';
}

export function PageContainer({ children, className = '', padY = 'lg' }: PageContainerProps) {
  const pads = { sm: 'py-8', md: 'py-12', lg: 'py-16 md:py-20' };
  return (
    <div className={`${PAGE_CONTAINER_CLASS} ${pads[padY]} ${className}`}>
      {children}
    </div>
  );
}
