"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { Organization } from "@/lib/supabase/types";

interface ClientFormProps {
  client?: Organization;
}

export function ClientForm({ client }: ClientFormProps) {
  const router = useRouter();
  const supabase = createClient();
  const isEditing = !!client;

  const [name, setName] = useState(client?.name ?? "");
  const [logoUrl, setLogoUrl] = useState(client?.logo_url ?? "");
  const [brandColor, setBrandColor] = useState(client?.brand_color ?? "");
  const [ownerName, setOwnerName] = useState("");
  const [ownerEmail, setOwnerEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (isEditing) {
        const { error: updateError } = await supabase
          .from("organizations")
          .update({
            name,
            logo_url: logoUrl || null,
            brand_color: brandColor || null,
          })
          .eq("id", client.id);

        if (updateError) throw updateError;
      } else {
        const { data: newOrg, error: insertError } = await supabase
          .from("organizations")
          .insert({
            name,
            logo_url: logoUrl || null,
            brand_color: brandColor || null,
          })
          .select("id")
          .single();

        if (insertError) throw insertError;
        if (!newOrg) throw new Error("Failed to create organization");

        const res = await fetch("/api/admin/invite-user", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: ownerEmail,
            name: ownerName,
            orgId: newOrg.id,
            role: "owner",
          }),
        });

        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          throw new Error(body.error ?? "Failed to invite user");
        }
      }

      router.push("/admin/clients");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-lg space-y-5">
      {error && (
        <div className="rounded-md bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      <div className="space-y-1.5">
        <label className="text-sm font-medium text-foreground">
          Organization Name <span className="text-destructive">*</span>
        </label>
        <input
          type="text"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
          placeholder="Acme Corp"
        />
      </div>

      <div className="space-y-1.5">
        <label className="text-sm font-medium text-foreground">Logo URL</label>
        <input
          type="url"
          value={logoUrl}
          onChange={(e) => setLogoUrl(e.target.value)}
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
          placeholder="https://example.com/logo.png"
        />
      </div>

      <div className="space-y-1.5">
        <label className="text-sm font-medium text-foreground">Brand Color</label>
        <input
          type="text"
          value={brandColor}
          onChange={(e) => setBrandColor(e.target.value)}
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
          placeholder="#3B82F6"
        />
      </div>

      {!isEditing && (
        <>
          <hr className="border-border" />
          <p className="text-sm font-semibold text-foreground">Owner Account</p>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground">
              Owner Name <span className="text-destructive">*</span>
            </label>
            <input
              type="text"
              required
              value={ownerName}
              onChange={(e) => setOwnerName(e.target.value)}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
              placeholder="Jane Smith"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground">
              Owner Email <span className="text-destructive">*</span>
            </label>
            <input
              type="email"
              required
              value={ownerEmail}
              onChange={(e) => setOwnerEmail(e.target.value)}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
              placeholder="jane@acme.com"
            />
          </div>
        </>
      )}

      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          disabled={loading}
          className="rounded-md bg-primary px-5 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition-colors"
        >
          {loading ? "Saving…" : isEditing ? "Save Changes" : "Create Client"}
        </button>
        <button
          type="button"
          onClick={() => router.push("/admin/clients")}
          className="rounded-md border border-border px-5 py-2 text-sm font-medium text-foreground hover:bg-muted transition-colors"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
