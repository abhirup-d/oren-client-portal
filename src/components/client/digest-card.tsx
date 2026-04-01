"use client";

import { useEffect, useState } from "react";
import { Sparkles } from "lucide-react";

export function DigestCard() {
  const [digest, setDigest] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDigest() {
      try {
        const response = await fetch("/api/digest");
        if (response.ok) {
          const data = await response.json();
          if (data.digest && data.digest !== "No new activity since your last visit.") {
            setDigest(data.digest);
          }
        }
      } catch {
        // Silently fail — digest is a nice-to-have
      } finally {
        setLoading(false);
      }
    }

    fetchDigest();
  }, []);

  if (loading) {
    return (
      <div className="rounded-lg border border-border bg-card p-4 animate-pulse">
        <div className="flex items-center gap-2 mb-3">
          <div className="h-4 w-4 bg-muted rounded" />
          <div className="h-4 w-24 bg-muted rounded" />
        </div>
        <div className="space-y-2">
          <div className="h-3 w-full bg-muted rounded" />
          <div className="h-3 w-4/5 bg-muted rounded" />
          <div className="h-3 w-3/5 bg-muted rounded" />
        </div>
      </div>
    );
  }

  if (!digest) return null;

  return (
    <div className="rounded-lg border border-primary/20 bg-primary/5 p-4">
      <div className="flex items-center gap-2 mb-3">
        <Sparkles className="h-4 w-4 text-primary" />
        <h2 className="text-sm font-semibold text-foreground">What&apos;s New</h2>
      </div>
      <div className="text-sm text-foreground whitespace-pre-line leading-relaxed">
        {digest}
      </div>
    </div>
  );
}
