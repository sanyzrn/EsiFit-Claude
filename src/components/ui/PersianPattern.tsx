import type { HTMLAttributes } from 'react';

type PersianPatternProps = HTMLAttributes<HTMLDivElement> & {
  fade?: boolean;
  opacity?: number;
};

/** Decorative girih-inspired tile pattern — use as absolute overlay. */
export function PersianPattern({
  fade = true,
  opacity = 1,
  className = '',
  ...props
}: PersianPatternProps) {
  return (
    <div
      aria-hidden="true"
      className={[
        'pointer-events-none absolute inset-0 persian-pattern',
        fade ? 'persian-pattern-fade' : '',
        className,
      ].filter(Boolean).join(' ')}
      style={{ opacity }}
      {...props}
    />
  );
}
