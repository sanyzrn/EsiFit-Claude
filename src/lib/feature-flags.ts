export const featureFlags = {
  BLOG: true,
  AI_CHAT: true,
  AI_ANALYTICS: true,
  SHOP: true,
  COMMUNITY: true,
  VOICE: true,
  NOTIFICATIONS: true,
  OFFLINE_TRACKERS: true,
  COMMAND_PALETTE: true,
  WEEKLY_RECAP: true,
  READINESS_SCORE: true,
  MUSCLE_HEATMAP: true,
  CALCULATORS: true,
  ANALYTICS: true,
  STORE: true,
  ACHIEVEMENTS: true,
  ANATOMY_VIEW: true,
  MOTION: true,
  BLOG_SEARCH: true,
  EXPERIMENTAL_UI: false,
} as const;

export type FeatureFlag = keyof typeof featureFlags;

export function isFeatureEnabled(flag: FeatureFlag): boolean {
  return featureFlags[flag];
}

export function useFeatureFlag(flag: FeatureFlag): boolean {
  return featureFlags[flag];
}
