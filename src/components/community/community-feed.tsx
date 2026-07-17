"use client";

import { useState } from "react";
import { Heart, Flag, MessageCircle } from "lucide-react";
import { GlassCard } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TextInput } from "@/components/ui/form";
import { BeforeAfterCompare } from "@/components/community/before-after-compare";
import { useCommunityStore } from "@/stores/community-store";
import { sanitizeUserText } from "@/lib/sanitize";
import { useFeatureFlag } from "@/lib/feature-flags";

export function CommunityFeed() {
  const enabled = useFeatureFlag("COMMUNITY");
  const posts = useCommunityStore((s) => s.posts);
  const comments = useCommunityStore((s) => s.comments);
  const likePost = useCommunityStore((s) => s.likePost);
  const addComment = useCommunityStore((s) => s.addComment);
  const createPost = useCommunityStore((s) => s.createPost);
  const report = useCommunityStore((s) => s.report);
  const [draft, setDraft] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [openComments, setOpenComments] = useState<string | null>(null);
  const [commentDraft, setCommentDraft] = useState("");
  const [visible, setVisible] = useState(5);

  if (!enabled) {
    return <p className="type-body-md text-[var(--foreground-muted)]">Community is disabled.</p>;
  }

  return (
    <div className="space-y-6">
      <GlassCard className="p-4">
        <label className="type-caption font-semibold">Share an update</label>
        <textarea
          className="mt-2 min-h-24 w-full rounded-[var(--radius-md)] border border-[var(--surface-glass-border)] bg-[var(--surface-2)] p-3 type-body-sm outline-none focus:border-[var(--mint)]"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="What's moving this week?"
          maxLength={1000}
        />
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            className="type-caption text-[var(--foreground-muted)]"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          />
          <Button
            size="sm"
            onClick={() => {
              void createPost(draft, file).then((ok) => {
                if (ok) {
                  setDraft("");
                  setFile(null);
                }
              });
            }}
          >
            Post
          </Button>
        </div>
      </GlassCard>

      {posts.length === 0 ? (
        <GlassCard className="p-8 text-center">
          <p className="type-h4">No posts yet</p>
          <p className="type-body-sm mt-2 text-[var(--foreground-muted)]">Be the first to share a win.</p>
        </GlassCard>
      ) : (
        posts.slice(0, visible).map((p) => (
          <GlassCard key={p.id} className={`p-5 ${p.flagged ? "opacity-60" : ""}`}>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--mint-dim)] font-bold text-[var(--mint)]">
                {p.author.avatar}
              </div>
              <div>
                <p className="type-body-sm font-semibold">{p.author.name}</p>
                <p className="type-caption text-[var(--foreground-subtle)]">
                  {new Date(p.created_at).toLocaleString()}
                </p>
              </div>
            </div>
            <p className="type-body-md mt-4 whitespace-pre-wrap">{sanitizeUserText(p.content)}</p>
            {p.isTransformation && p.beforeUrl && p.afterUrl ? (
              <div className="mt-4">
                <BeforeAfterCompare beforeSrc={p.beforeUrl} afterSrc={p.afterUrl} />
              </div>
            ) : p.image_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={p.image_url} alt="" className="mt-4 max-h-72 w-full rounded-[var(--radius-md)] object-cover" />
            ) : null}
            <div className="mt-4 flex flex-wrap gap-2">
              <Button size="sm" variant={p.likedByMe ? "primary" : "ghost"} onClick={() => likePost(p.id)}>
                <Heart className="size-3.5" /> {p.likeCount}
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setOpenComments(openComments === p.id ? null : p.id)}
              >
                <MessageCircle className="size-3.5" /> {p.commentCount}
              </Button>
              <Button size="sm" variant="ghost" onClick={() => report("post", p.id, "Inappropriate")}>
                <Flag className="size-3.5" /> Report
              </Button>
            </div>
            {openComments === p.id ? (
              <div className="mt-4 space-y-3 border-t border-[var(--surface-glass-border)] pt-4">
                {(comments[p.id] ?? []).map((c) => (
                  <div key={c.id} className="type-body-sm">
                    <span className="font-semibold">{c.authorName}</span>{" "}
                    <span className="text-[var(--foreground-muted)]">{sanitizeUserText(c.content)}</span>
                  </div>
                ))}
                <div className="flex gap-2">
                  <TextInput
                    value={commentDraft}
                    onChange={(e) => setCommentDraft(e.target.value)}
                    placeholder="Add a comment"
                  />
                  <Button
                    size="sm"
                    onClick={() => {
                      addComment(p.id, commentDraft);
                      setCommentDraft("");
                    }}
                  >
                    Send
                  </Button>
                </div>
              </div>
            ) : null}
          </GlassCard>
        ))
      )}

      {visible < posts.length ? (
        <Button variant="secondary" className="w-full" onClick={() => setVisible((v) => v + 5)}>
          Load more
        </Button>
      ) : null}
    </div>
  );
}
