"use client";

import { Trash2 } from "lucide-react";
import type { User } from "@/lib/supabase/types";

interface TeamMemberRowProps {
  member: User;
  isOwner: boolean;
  onRemove: (id: string) => void;
}

export function TeamMemberRow({ member, isOwner, onRemove }: TeamMemberRowProps) {
  const initial = member.name.charAt(0).toUpperCase();
  const isCurrentMemberOwner = member.role === "owner";

  return (
    <div className="flex items-center justify-between py-3 border-b last:border-0">
      <div className="flex items-center gap-3">
        <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center text-sm font-semibold text-primary">
          {initial}
        </div>
        <div>
          <p className="text-sm font-medium text-foreground">{member.name}</p>
          <p className="text-xs text-muted-foreground">{member.email}</p>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <span
          className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
            isCurrentMemberOwner
              ? "bg-primary/10 text-primary"
              : "bg-muted text-muted-foreground"
          }`}
        >
          {isCurrentMemberOwner ? "Owner" : "Member"}
        </span>
        {isOwner && !isCurrentMemberOwner && (
          <button
            onClick={() => onRemove(member.id)}
            className="text-muted-foreground hover:text-destructive transition-colors"
            aria-label={`Remove ${member.name}`}
          >
            <Trash2 className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  );
}
