export const motionPresets = {
  snappy: {
    duration: 0.16,
    ease: [0.2, 0.8, 0.2, 1] as const,
  },
  smooth: {
    duration: 0.32,
    ease: [0.22, 1, 0.36, 1] as const,
  },
  spring: {
    type: "spring" as const,
    stiffness: 380,
    damping: 28,
  },
  counter: {
    duration: 0.6,
    ease: [0.22, 1, 0.36, 1] as const,
  },
} as const;

export type MotionPreset = keyof typeof motionPresets;
