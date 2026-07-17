"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { toast } from "sonner";
import { sanitizeUserText, validateImageFile } from "@/lib/sanitize";
import {
  SEED_CHALLENGES,
  SEED_POSTS,
  GLOBAL_LEADERBOARD,
  type Challenge,
  type CommunityPost,
  type LeaderboardEntry,
} from "@/lib/mock/growth";
import { useGamificationStore } from "@/stores/gamification-store";

type Comment = {
  id: string;
  post_id: string;
  user_id: string;
  authorName: string;
  content: string;
  created_at: string;
};

type ModerationReport = {
  id: string;
  targetType: "post" | "comment";
  targetId: string;
  reason: string;
  created_at: string;
};

type CommunityState = {
  posts: CommunityPost[];
  comments: Record<string, Comment[]>;
  challenges: Challenge[];
  leaderboardScope: "global" | "friends";
  leaderboard: LeaderboardEntry[];
  reports: ModerationReport[];
  lastPostAt: number;
  likePost: (postId: string) => void;
  addComment: (postId: string, content: string) => void;
  createPost: (content: string, imageFile?: File | null) => Promise<boolean>;
  joinChallenge: (id: string) => void;
  leaveChallenge: (id: string) => void;
  setLeaderboardScope: (scope: "global" | "friends") => void;
  report: (targetType: "post" | "comment", targetId: string, reason: string) => void;
};

export const useCommunityStore = create<CommunityState>()(
  persist(
    (set, get) => ({
      posts: SEED_POSTS,
      comments: {
        p1: [
          {
            id: "c1",
            post_id: "p1",
            user_id: "u_alex",
            authorName: "Alex R.",
            content: "Huge — how long was the deload?",
            created_at: new Date(Date.now() - 1000 * 60 * 20).toISOString(),
          },
        ],
      },
      challenges: SEED_CHALLENGES,
      leaderboardScope: "global",
      leaderboard: GLOBAL_LEADERBOARD,
      reports: [],
      lastPostAt: 0,

      likePost: (postId) => {
        set({
          posts: get().posts.map((p) => {
            if (p.id !== postId) return p;
            const likedByMe = !p.likedByMe;
            return {
              ...p,
              likedByMe,
              likeCount: Math.max(0, p.likeCount + (likedByMe ? 1 : -1)),
            };
          }),
        });
      },

      addComment: (postId, content) => {
        const cleaned = sanitizeUserText(content, 500);
        if (!cleaned) {
          toast.error("Comment can't be empty");
          return;
        }
        const comment: Comment = {
          id: `cm_${Date.now()}`,
          post_id: postId,
          user_id: "u_me",
          authorName: "You",
          content: cleaned,
          created_at: new Date().toISOString(),
        };
        const list = get().comments[postId] ?? [];
        set({
          comments: { ...get().comments, [postId]: [...list, comment] },
          posts: get().posts.map((p) =>
            p.id === postId ? { ...p, commentCount: p.commentCount + 1 } : p,
          ),
        });
        useGamificationStore.getState().bumpMission("m_monthly_community");
      },

      createPost: async (content, imageFile) => {
        const now = Date.now();
        if (now - get().lastPostAt < 4000) {
          toast.message("Slow down — posting cooldown (mock rate limit)");
          return false;
        }
        const cleaned = sanitizeUserText(content, 1000);
        if (!cleaned) {
          toast.error("Write something before posting");
          return false;
        }
        let image_url: string | undefined;
        if (imageFile) {
          const check = validateImageFile(imageFile);
          if (!check.ok) {
            toast.error(check.reason);
            return false;
          }
          image_url = URL.createObjectURL(imageFile);
        }
        const post: CommunityPost = {
          id: `p_${now}`,
          user_id: "u_me",
          author: { id: "u_me", name: "You", avatar: "Y" },
          content: cleaned,
          image_url,
          created_at: new Date().toISOString(),
          likeCount: 0,
          commentCount: 0,
          likedByMe: false,
        };
        set({ posts: [post, ...get().posts], lastPostAt: now });
        useGamificationStore.getState().bumpBadge("b_post_1");
        useGamificationStore.getState().bumpMission("m_monthly_community");
        toast.success("Post published");
        return true;
      },

      joinChallenge: (id) => {
        set({
          challenges: get().challenges.map((c) =>
            c.id === id
              ? {
                  ...c,
                  joined: true,
                  participantCount: c.joined ? c.participantCount : c.participantCount + 1,
                }
              : c,
          ),
        });
        useGamificationStore.getState().awardXp("challenge", 10, "Joined challenge");
        toast.success("Challenge joined");
      },

      leaveChallenge: (id) => {
        set({
          challenges: get().challenges.map((c) =>
            c.id === id
              ? {
                  ...c,
                  joined: false,
                  participantCount: Math.max(0, c.participantCount - (c.joined ? 1 : 0)),
                }
              : c,
          ),
        });
      },

      setLeaderboardScope: (scope) => {
        if (scope === "friends") {
          set({
            leaderboardScope: scope,
            leaderboard: GLOBAL_LEADERBOARD.filter(
              (e) => e.isMe || ["u_maya", "u_alex", "u_jordan"].includes(e.userId),
            ).map((e, i) => ({ ...e, rank: i + 1 })),
          });
        } else {
          set({ leaderboardScope: scope, leaderboard: GLOBAL_LEADERBOARD });
        }
      },

      report: (targetType, targetId, reason) => {
        const cleaned = sanitizeUserText(reason, 280) || "Inappropriate content";
        set({
          reports: [
            {
              id: `r_${Date.now()}`,
              targetType,
              targetId,
              reason: cleaned,
              created_at: new Date().toISOString(),
            },
            ...get().reports,
          ],
          posts:
            targetType === "post"
              ? get().posts.map((p) => (p.id === targetId ? { ...p, flagged: true } : p))
              : get().posts,
        });
        toast.message("Report submitted (mock moderation queue)");
      },
    }),
    { name: "esifit-community" },
  ),
);
