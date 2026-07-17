"use client";

import * as React from "react";
import { motion, useMotionValue, useSpring, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useFeatureFlag } from "@/lib/feature-flags";
import { Button, type ButtonProps } from "@/components/ui/button";

export function RevealOnScroll({
  children,
  className,
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  const reduceMotion = useReducedMotion();
  const motionEnabled = useFeatureFlag("MOTION");

  if (reduceMotion || !motionEnabled) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-10% 0px" }}
      transition={{ duration: 0.48, ease: [0.22, 1, 0.36, 1], delay }}
    >
      {children}
    </motion.div>
  );
}

export function MagneticButton({ className, children, ...props }: ButtonProps) {
  const ref = React.useRef<HTMLButtonElement>(null);
  const reduceMotion = useReducedMotion();
  const motionEnabled = useFeatureFlag("MOTION");
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, { stiffness: 280, damping: 20 });
  const springY = useSpring(y, { stiffness: 280, damping: 20 });

  function onMove(e: React.MouseEvent<HTMLButtonElement>) {
    if (reduceMotion || !motionEnabled || !ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const dx = e.clientX - (rect.left + rect.width / 2);
    const dy = e.clientY - (rect.top + rect.height / 2);
    x.set(dx * 0.18);
    y.set(dy * 0.18);
  }

  function onLeave() {
    x.set(0);
    y.set(0);
  }

  return (
    <motion.div style={{ x: springX, y: springY }} className="inline-flex">
      <Button ref={ref} className={cn(className)} onMouseMove={onMove} onMouseLeave={onLeave} {...props}>
        {children}
      </Button>
    </motion.div>
  );
}
