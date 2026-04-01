"use client";

import { useEffect, useState } from "react";
import { UserPlus, ChevronDown, ChevronUp } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { TeamMemberRow } from "@/components/client/team-member-row";
import type { User } from "@/lib/supabase/types";

export default function TeamPage() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [members, setMembers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [showInviteForm, setShowInviteForm] = useState(false);
  const [inviteName, setInviteName] = useState("");
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteLoading, setInviteLoading] = useState(false);
  const [inviteError, setInviteError] = useState<string | null>(null);
  const [inviteSuccess, setInviteSuccess] = useState(false);

  const supabase = createClient();

  useEffect(() => {
    async function load() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;

      const { data: profile } = await supabase
        .from("users")
        .select("*")
        .eq("id", user.id)
        .single();

      if (!profile) return;

      setCurrentUser(profile);

      const { data: orgMembers } = await supabase
        .from("users")
        .select("*")
        .eq("org_id", profile.org_id)
        .order("created_at", { ascending: true });

      setMembers(orgMembers ?? []);
      setLoading(false);
    }
    load();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const isOwner = currentUser?.role === "owner";

  async function handleInvite(e: React.FormEvent) {
    e.preventDefault();
    setInviteLoading(true);
    setInviteError(null);
    setInviteSuccess(false);

    const res = await fetch("/api/team/invite", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: inviteEmail, name: inviteName }),
    });

    const json = await res.json();

    if (!res.ok) {
      setInviteError(json.error ?? "Failed to send invite");
      setInviteLoading(false);
      return;
    }

    setInviteSuccess(true);
    setInviteName("");
    setInviteEmail("");
    setInviteLoading(false);
    setShowInviteForm(false);

    // Refresh members list
    if (currentUser) {
      const { data: orgMembers } = await supabase
        .from("users")
        .select("*")
        .eq("org_id", currentUser.org_id)
        .order("created_at", { ascending: true });
      setMembers(orgMembers ?? []);
    }
  }

  async function handleRemove(memberId: string) {
    if (!confirm("Are you sure you want to remove this member?")) return;

    const res = await fetch(`/api/team/${memberId}`, { method: "DELETE" });
    const json = await res.json();

    if (!res.ok) {
      alert(json.error ?? "Failed to remove member");
      return;
    }

    setMembers((prev) => prev.filter((m) => m.id !== memberId));
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 bg-muted animate-pulse rounded" />
        <div className="h-64 bg-muted animate-pulse rounded-lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Team Members</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {members.length} {members.length === 1 ? "member" : "members"} in your organization
          </p>
        </div>
        {isOwner && (
          <button
            onClick={() => {
              setShowInviteForm((v) => !v);
              setInviteError(null);
              setInviteSuccess(false);
            }}
            className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            <UserPlus className="h-4 w-4" />
            Invite Member
            {showInviteForm ? (
              <ChevronUp className="h-3 w-3" />
            ) : (
              <ChevronDown className="h-3 w-3" />
            )}
          </button>
        )}
      </div>

      {/* Invite form */}
      {isOwner && showInviteForm && (
        <div className="rounded-lg border bg-card p-5">
          <h2 className="text-base font-semibold text-foreground mb-4">Invite a new team member</h2>
          {inviteSuccess && (
            <p className="text-sm text-green-600 mb-3">Invite sent successfully!</p>
          )}
          {inviteError && (
            <p className="text-sm text-destructive mb-3">{inviteError}</p>
          )}
          <form onSubmit={handleInvite} className="flex flex-col gap-3 sm:flex-row sm:items-end">
            <div className="flex-1">
              <label className="block text-xs font-medium text-muted-foreground mb-1">
                Full name
              </label>
              <input
                type="text"
                value={inviteName}
                onChange={(e) => setInviteName(e.target.value)}
                required
                placeholder="Jane Doe"
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>
            <div className="flex-1">
              <label className="block text-xs font-medium text-muted-foreground mb-1">
                Email address
              </label>
              <input
                type="email"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                required
                placeholder="jane@company.com"
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>
            <button
              type="submit"
              disabled={inviteLoading}
              className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              {inviteLoading ? "Sending..." : "Send Invite"}
            </button>
          </form>
        </div>
      )}

      {/* Members list */}
      <div className="rounded-lg border bg-card px-5 py-2">
        {members.length === 0 ? (
          <p className="py-4 text-sm text-muted-foreground text-center">No members found.</p>
        ) : (
          members.map((member) => (
            <TeamMemberRow
              key={member.id}
              member={member}
              isOwner={isOwner}
              onRemove={handleRemove}
            />
          ))
        )}
      </div>
    </div>
  );
}
