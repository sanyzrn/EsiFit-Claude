import type { PrimaryGoal } from "@/lib/types";

export type BadgeDef = {
  id: string;
  name: string;
  description: string;
  category: "streak" | "volume" | "community" | "nutrition" | "milestone";
  target: number;
  icon: string;
};

export type MissionDef = {
  id: string;
  title: string;
  description: string;
  cadence: "daily" | "weekly" | "monthly";
  target: number;
  xpReward: number;
  resetsAt: string;
};

export type Unlockable = {
  id: string;
  name: string;
  description: string;
  kind: "theme" | "frame";
  requiredLevel: number;
  value: string;
};

export type CommunityAuthor = {
  id: string;
  name: string;
  avatar: string;
};

export type CommunityPost = {
  id: string;
  user_id: string;
  author: CommunityAuthor;
  content: string;
  image_url?: string;
  created_at: string;
  likeCount: number;
  commentCount: number;
  likedByMe: boolean;
  isTransformation?: boolean;
  beforeUrl?: string;
  afterUrl?: string;
  flagged?: boolean;
};

export type Challenge = {
  id: string;
  name: string;
  description: string;
  start_date: string;
  end_date: string;
  status: "Upcoming" | "Active" | "Ended" | "Archived";
  participantCount: number;
  joined: boolean;
  myScore: number;
  leaderboard: { userId: string; name: string; score: number; rankDelta: number }[];
};

export type LeaderboardEntry = {
  userId: string;
  name: string;
  xp: number;
  rank: number;
  rankDelta: number;
  isMe?: boolean;
};

export type ShopProduct = {
  id: string;
  name: string;
  description: string;
  price: number;
  kind: "program" | "subscription" | "bundle" | "gift_card";
  badge?: string;
};

export type NotifKind =
  | "workout"
  | "nutrition"
  | "streak"
  | "milestone"
  | "community"
  | "mission";

export type AppNotif = {
  id: string;
  type: NotifKind;
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
};

export const BADGES: BadgeDef[] = [
  { id: "b_streak_7", name: "Week Warrior", description: "Hit a 7-day streak", category: "streak", target: 7, icon: "🔥" },
  { id: "b_streak_30", name: "Monthly Momentum", description: "Hit a 30-day streak", category: "streak", target: 30, icon: "⚡" },
  { id: "b_vol_10k", name: "Iron Volume", description: "Log 10,000 kg training volume", category: "volume", target: 10000, icon: "🏋️" },
  { id: "b_water_7", name: "Hydration Habit", description: "Hit water goal 7 days", category: "nutrition", target: 7, icon: "💧" },
  { id: "b_post_1", name: "First Share", description: "Publish a community post", category: "community", target: 1, icon: "💬" },
  { id: "b_level_5", name: "Rising Athlete", description: "Reach level 5", category: "milestone", target: 5, icon: "⭐" },
  { id: "b_mission_5", name: "Mission Runner", description: "Claim 5 mission rewards", category: "milestone", target: 5, icon: "🎯" },
  { id: "b_pr_3", name: "PR Hunter", description: "Hit 3 personal records", category: "volume", target: 3, icon: "🏆" },
];

export const UNLOCKABLES: Unlockable[] = [
  {
    id: "u_theme_graphite",
    name: "Graphite Pulse",
    description: "Default dashboard accent wash",
    kind: "theme",
    requiredLevel: 1,
    value: "graphite",
  },
  {
    id: "u_theme_aurora",
    name: "Aurora Mint",
    description: "Mint-forward dashboard accents",
    kind: "theme",
    requiredLevel: 3,
    value: "aurora",
  },
  {
    id: "u_frame_gold",
    name: "Gold Frame",
    description: "Gold profile ring on community posts",
    kind: "frame",
    requiredLevel: 5,
    value: "gold",
  },
];

export function buildMissions(now = new Date()): MissionDef[] {
  const endOfDay = new Date(now);
  endOfDay.setHours(23, 59, 59, 999);
  const endOfWeek = new Date(now);
  endOfWeek.setDate(now.getDate() + (7 - now.getDay()));
  endOfWeek.setHours(23, 59, 59, 999);
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
  return [
    {
      id: "m_daily_workout",
      title: "Train today",
      description: "Complete any workout session",
      cadence: "daily",
      target: 1,
      xpReward: 25,
      resetsAt: endOfDay.toISOString(),
    },
    {
      id: "m_daily_water",
      title: "Hydrate",
      description: "Log water 3 times",
      cadence: "daily",
      target: 3,
      xpReward: 15,
      resetsAt: endOfDay.toISOString(),
    },
    {
      id: "m_weekly_sessions",
      title: "Consistency week",
      description: "Complete 4 workouts this week",
      cadence: "weekly",
      target: 4,
      xpReward: 80,
      resetsAt: endOfWeek.toISOString(),
    },
    {
      id: "m_monthly_community",
      title: "Community spark",
      description: "Post or comment 5 times this month",
      cadence: "monthly",
      target: 5,
      xpReward: 120,
      resetsAt: endOfMonth.toISOString(),
    },
  ];
}

export const SEED_AUTHORS: CommunityAuthor[] = [
  { id: "u_me", name: "You", avatar: "Y" },
  { id: "u_alex", name: "Alex R.", avatar: "A" },
  { id: "u_maya", name: "Maya K.", avatar: "M" },
  { id: "u_jordan", name: "Jordan P.", avatar: "J" },
  { id: "u_sam", name: "Sam T.", avatar: "S" },
];

export const SEED_POSTS: CommunityPost[] = [
  {
    id: "p1",
    user_id: "u_maya",
    author: SEED_AUTHORS[2]!,
    content: "Hit a new squat PR today — 92.5kg × 3. Rest days actually working.",
    created_at: new Date(Date.now() - 1000 * 60 * 40).toISOString(),
    likeCount: 24,
    commentCount: 3,
    likedByMe: false,
  },
  {
    id: "p2",
    user_id: "u_alex",
    author: SEED_AUTHORS[1]!,
    content: "12-week transformation story: sleep and protein fixed more than any fancy program.",
    image_url: "/images/transform-after.svg",
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
    likeCount: 86,
    commentCount: 12,
    likedByMe: true,
    isTransformation: true,
    beforeUrl: "/images/transform-before.svg",
    afterUrl: "/images/transform-after.svg",
  },
  {
    id: "p3",
    user_id: "u_jordan",
    author: SEED_AUTHORS[3]!,
    content: "Anyone else using the muscle heatmap to catch lagging rear delts?",
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 26).toISOString(),
    likeCount: 11,
    commentCount: 7,
    likedByMe: false,
  },
];

export const SEED_CHALLENGES: Challenge[] = [
  {
    id: "c_spring",
    name: "Spring Strength",
    description: "Accumulate 50,000 kg training volume in 21 days.",
    start_date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(),
    end_date: new Date(Date.now() + 1000 * 60 * 60 * 24 * 18).toISOString(),
    status: "Active",
    participantCount: 1284,
    joined: false,
    myScore: 0,
    leaderboard: [
      { userId: "u_maya", name: "Maya K.", score: 18200, rankDelta: 2 },
      { userId: "u_alex", name: "Alex R.", score: 16100, rankDelta: -1 },
      { userId: "u_jordan", name: "Jordan P.", score: 14950, rankDelta: 0 },
      { userId: "u_me", name: "You", score: 4200, rankDelta: 3 },
      { userId: "u_sam", name: "Sam T.", score: 3900, rankDelta: -2 },
    ],
  },
  {
    id: "c_hydrate",
    name: "Hydration Sprint",
    description: "Hit your water goal every day for 7 days.",
    start_date: new Date(Date.now() + 1000 * 60 * 60 * 24 * 2).toISOString(),
    end_date: new Date(Date.now() + 1000 * 60 * 60 * 24 * 9).toISOString(),
    status: "Upcoming",
    participantCount: 402,
    joined: false,
    myScore: 0,
    leaderboard: [],
  },
  {
    id: "c_winter",
    name: "Winter Consistency",
    description: "Train 16 sessions in December.",
    start_date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 40).toISOString(),
    end_date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10).toISOString(),
    status: "Ended",
    participantCount: 2103,
    joined: true,
    myScore: 14,
    leaderboard: [
      { userId: "u_alex", name: "Alex R.", score: 18, rankDelta: 0 },
      { userId: "u_me", name: "You", score: 14, rankDelta: 1 },
    ],
  },
];

export const GLOBAL_LEADERBOARD: LeaderboardEntry[] = [
  { userId: "u_maya", name: "Maya K.", xp: 12840, rank: 1, rankDelta: 0 },
  { userId: "u_alex", name: "Alex R.", xp: 11220, rank: 2, rankDelta: 1 },
  { userId: "u_jordan", name: "Jordan P.", xp: 9980, rank: 3, rankDelta: -1 },
  { userId: "u_sam", name: "Sam T.", xp: 8740, rank: 4, rankDelta: 2 },
  { userId: "u_me", name: "You", xp: 2460, rank: 42, rankDelta: 3, isMe: true },
];

export const SHOP_PRODUCTS: ShopProduct[] = [
  {
    id: "prod_strength",
    name: "Strength Foundations",
    description: "12-week progressive overload program with weekly check-ins.",
    price: 79,
    kind: "program",
    badge: "Popular",
  },
  {
    id: "prod_vip",
    name: "VIP Monthly",
    description: "Full analytics, coach messages, and premium unlocks.",
    price: 19,
    kind: "subscription",
  },
  {
    id: "prod_vip_plus",
    name: "VIP+ Annual",
    description: "Everything in VIP plus priority AI quota and exclusive challenges.",
    price: 149,
    kind: "subscription",
    badge: "Best value",
  },
  {
    id: "prod_bundle",
    name: "Hybrid Athlete Bundle",
    description: "Strength Foundations + Nutrition reset + 4 coaching credits.",
    price: 129,
    kind: "bundle",
  },
  {
    id: "prod_gift_50",
    name: "Gift Card $50",
    description: "Share EsiFit with a friend — redeemable in the store.",
    price: 50,
    kind: "gift_card",
  },
];

export const SEED_NOTIFICATIONS: AppNotif[] = [
  {
    id: "n1",
    type: "streak",
    title: "Streak at risk",
    message: "Train or log activity today to keep your 6-day streak.",
    is_read: false,
    created_at: new Date(Date.now() - 1000 * 60 * 25).toISOString(),
  },
  {
    id: "n2",
    type: "workout",
    title: "Workout reminder",
    message: "Upper Focus is scheduled for this evening.",
    is_read: false,
    created_at: new Date(Date.now() - 1000 * 60 * 90).toISOString(),
  },
  {
    id: "n3",
    type: "community",
    title: "Maya liked your comment",
    message: "Your note on rear-delt volume got a like.",
    is_read: true,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 8).toISOString(),
  },
  {
    id: "n4",
    type: "milestone",
    title: "Level up soon",
    message: "You're 40 XP from level 5 — finish a mission to get there.",
    is_read: false,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 20).toISOString(),
  },
  {
    id: "n5",
    type: "nutrition",
    title: "Hydration nudge",
    message: "You're at 40% of today's water goal.",
    is_read: true,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 30).toISOString(),
  },
];

export type RecapPrivacy = {
  includeStreak: boolean;
  includeWorkouts: boolean;
  includeVolume: boolean;
  includeXp: boolean;
  includeBodyFat: boolean;
};

export const DEFAULT_RECAP_PRIVACY: RecapPrivacy = {
  includeStreak: true,
  includeWorkouts: true,
  includeVolume: true,
  includeXp: true,
  includeBodyFat: false,
};

export type GoalHint = PrimaryGoal;
