import { type HTMLAttributes } from 'react';

type SkeletonProps = HTMLAttributes<HTMLDivElement> & {
  rounded?: 'sm' | 'md' | 'lg' | 'full';
};

const roundedClasses = {
  sm: 'rounded-[8px]',
  md: 'rounded-[12px]',
  lg: 'rounded-[20px]',
  full: 'rounded-full',
};

export function Skeleton({ rounded = 'md', className = '', ...props }: SkeletonProps) {
  return (
    <div
      role="status"
      aria-label="Loading"
      className={[
        'animate-shimmer',
        roundedClasses[rounded],
        className,
      ].join(' ')}
      {...props}
    />
  );
}
