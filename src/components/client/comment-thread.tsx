"use client";

import { useEffect, useState, useCallback } from "react";
import { Send } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { formatDate } from "@/lib/utils";
import type { Comment } from "@/lib/supabase/types";

interface CommentWithUser extends Comment {
  userName: string;
  isAdmin: boolean;
}

interface CommentThreadProps {
  projectId: string;
  targetType: "document" | "approval" | "milestone";
  targetId: string;
}

export function CommentThread({ projectId, targetType, targetId }: CommentThreadProps) {
  const [comments, setComments] = useState<CommentWithUser[]>([]);
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const supabase = createClient();

  const fetchComments = useCallback(async () => {
    setLoading(true);

    const { data: rawComments } = await supabase
      .from("comments")
      .select("*")
      .eq("project_id", projectId)
      .eq("target_type", targetType)
      .eq("target_id", targetId)
      .order("created_at", { ascending: true });

    if (!rawComments || rawComments.length === 0) {
      setComments([]);
      setLoading(false);
      return;
    }

    // Separate client and admin user IDs
    const clientIds = rawComments.filter((c) => c.user_type === "client").map((c) => c.user_id);
    const adminIds = rawComments.filter((c) => c.user_type === "admin").map((c) => c.user_id);

    // Fetch user names in parallel
    const [clientResult, adminResult] = await Promise.all([
      clientIds.length > 0
        ? supabase.from("users").select("id, name").in("id", clientIds)
        : Promise.resolve({ data: [] }),
      adminIds.length > 0
        ? supabase.from("admin_users").select("id, name").in("id", adminIds)
        : Promise.resolve({ data: [] }),
    ]);

    const clientMap = new Map(
      (clientResult.data ?? []).map((u) => [u.id, u.name])
    );
    const adminMap = new Map(
      (adminResult.data ?? []).map((u) => [u.id, u.name])
    );

    const enriched: CommentWithUser[] = rawComments.map((c) => ({
      ...c,
      userName:
        c.user_type === "admin"
          ? (adminMap.get(c.user_id) ?? "Oren Team")
          : (clientMap.get(c.user_id) ?? "Unknown"),
      isAdmin: c.user_type === "admin",
    }));

    setComments(enriched);
    setLoading(false);
  }, [projectId, targetType, targetId, supabase]);

  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!newComment.trim() || submitting) return;

    setSubmitting(true);
    try {
      const response = await fetch("/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId,
          body: newComment.trim(),
          targetType,
          targetId,
        }),
      });

      if (response.ok) {
        setNewComment("");
        await fetchComments();
      }
    } finally {
      setSubmitting(false);
    }
  }

  function getInitial(name: string): string {
    return name.charAt(0).toUpperCase();
  }

  return (
    <div className="space-y-4">
      {/* Comment list */}
      {loading ? (
        <div className="space-y-3 animate-pulse">
          {[1, 2].map((i) => (
            <div key={i} className="flex gap-3">
              <div className="h-8 w-8 rounded-full bg-muted shrink-0" />
              <div className="flex-1 space-y-1">
                <div className="h-3 w-24 bg-muted rounded" />
                <div className="h-4 w-full bg-muted rounded" />
              </div>
            </div>
          ))}
        </div>
      ) : comments.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-4">
          No comments yet. Be the first to comment.
        </p>
      ) : (
        <div className="space-y-4">
          {comments.map((comment) => (
            <div key={comment.id} className="flex gap-3">
              {/* Avatar */}
              <div
                className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-semibold shrink-0 ${
                  comment.isAdmin
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {getInitial(comment.userName)}
              </div>
              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-medium text-foreground">
                    {comment.userName}
                  </span>
                  {comment.isAdmin && (
                    <span className="text-xs bg-primary/10 text-primary rounded px-1.5 py-0.5 font-medium">
                      Oren
                    </span>
                  )}
                  <span className="text-xs text-muted-foreground">
                    {formatDate(comment.created_at)}
                  </span>
                </div>
                <p className="text-sm text-foreground break-words">{comment.body}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* New comment form */}
      <form onSubmit={handleSubmit} className="flex gap-2 pt-2 border-t border-border">
        <input
          type="text"
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Add a comment..."
          className="flex-1 rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
        />
        <button
          type="submit"
          disabled={!newComment.trim() || submitting}
          className="rounded-md bg-primary px-3 py-2 text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition-colors"
        >
          <Send className="h-4 w-4" />
        </button>
      </form>
    </div>
  );
}
