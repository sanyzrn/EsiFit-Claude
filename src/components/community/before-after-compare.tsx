"use client";

import { useRef, useState } from "react";

/** Compact before/after compare for community transformation stories. */
export function BeforeAfterCompare({
  beforeSrc = "/images/transform-before.svg",
  afterSrc = "/images/transform-after.svg",
  altBefore = "Before",
  altAfter = "After",
}: {
  beforeSrc?: string;
  afterSrc?: string;
  altBefore?: string;
  altAfter?: string;
}) {
  const [pos, setPos] = useState(52);
  const trackRef = useRef<HTMLDivElement>(null);

  function updateFromClientX(clientX: number) {
    const el = trackRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const next = ((clientX - rect.left) / rect.width) * 100;
    setPos(Math.max(4, Math.min(96, next)));
  }

  return (
    <div
      ref={trackRef}
      className="relative aspect-[16/10] w-full overflow-hidden rounded-[var(--radius-md)] border border-[var(--surface-glass-border)] select-none"
      onPointerMove={(e) => e.buttons === 1 && updateFromClientX(e.clientX)}
      onPointerDown={(e) => {
        (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
        updateFromClientX(e.clientX);
      }}
      role="img"
      aria-label="Before and after comparison"
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={beforeSrc} alt={altBefore} className="absolute inset-0 size-full object-cover" draggable={false} />
      <div className="absolute inset-0" style={{ clipPath: `inset(0 ${100 - pos}% 0 0)` }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={afterSrc} alt={altAfter} className="absolute inset-0 size-full object-cover" draggable={false} />
      </div>
      <div className="absolute inset-y-0 z-10 w-0.5 bg-[var(--mint)]" style={{ left: `${pos}%` }} aria-hidden>
        <div className="absolute left-1/2 top-1/2 size-8 -translate-x-1/2 -translate-y-1/2 rounded-full border border-[var(--mint)] bg-[var(--surface-1)]" />
      </div>
    </div>
  );
}
