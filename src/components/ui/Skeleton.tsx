import { type HTMLAttributes } from 'react';

type SkeletonProps = HTMLAttributes<HTMLDivElement> & {
  rounded?: 'sm' | 'md' | 'lg' | 'full';
};

const roundedClasses = {
  sm: 'rounded',
  md: 'rounded-lg',
  lg: 'rounded-xl',
  full: 'rounded-full',
};

export function Skeleton({ rounded = 'md', className = '', ...props }: SkeletonProps) {
  return (
    <div
      role="status"
      aria-label="Loading"
      className={[
        'animate-pulse bg-elevated',
        roundedClasses[rounded],
        className,
      ].join(' ')}
      {...props}
    />
  );
}
