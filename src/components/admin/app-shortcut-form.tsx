"use client";

import { useState, useEffect } from "react";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/client";
import type { Organization, AppShortcut } from "@/lib/supabase/types";

const ICON_OPTIONS = [
  { value: "link", label: "Link (External)" },
  { value: "file", label: "File / Document" },
  { value: "message", label: "Message / Chat" },
  { value: "folder", label: "Folder" },
  { value: "globe", label: "Globe / Website" },
];

interface AppShortcutManagerProps {
  orgs: Organization[];
}

export function AppShortcutManager({ orgs }: AppShortcutManagerProps) {
  const [selectedOrgId, setSelectedOrgId] = useState<string>(orgs[0]?.id ?? "");
  const [shortcuts, setShortcuts] = useState<AppShortcut[]>([]);
  const [loadingShortcuts, setLoadingShortcuts] = useState(false);

  const [label, setLabel] = useState("");
  const [url, setUrl] = useState("");
  const [icon, setIcon] = useState("link");
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const supabase = createClient();

  useEffect(() => {
    if (!selectedOrgId) return;
    setLoadingShortcuts(true);
    supabase
      .from("app_shortcuts")
      .select("*")
      .eq("org_id", selectedOrgId)
      .order("sort_order", { ascending: true })
      .then(({ data }) => {
        setShortcuts(data ?? []);
        setLoadingShortcuts(false);
      });
  }, [selectedOrgId]);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    setAdding(true);
    setError(null);
    setSuccess(null);

    const res = await fetch("/api/apps", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        orgId: selectedOrgId,
        label,
        url,
        icon,
        sortOrder: shortcuts.length,
      }),
    });

    const data = await res.json();
    setAdding(false);

    if (!res.ok) {
      setError(data.error ?? "Failed to add shortcut");
      return;
    }

    setShortcuts((prev) => [...prev, data.shortcut]);
    setLabel("");
    setUrl("");
    setIcon("link");
    setSuccess("Shortcut added successfully");
    setTimeout(() => setSuccess(null), 3000);
  }

  async function handleDelete(id: string) {
    const res = await fetch(`/api/apps?id=${id}`, { method: "DELETE" });
    if (res.ok) {
      setShortcuts((prev) => prev.filter((s) => s.id !== id));
    }
  }

  return (
    <div className="space-y-8">
      {/* Org selector */}
      <div className="space-y-2">
        <Label htmlFor="org-select">Select Organisation</Label>
        <select
          id="org-select"
          value={selectedOrgId}
          onChange={(e) => setSelectedOrgId(e.target.value)}
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        >
          {orgs.map((org) => (
            <option key={org.id} value={org.id}>
              {org.name}
            </option>
          ))}
        </select>
      </div>

      {/* Add form */}
      <div className="rounded-lg border border-border p-5 space-y-4">
        <h2 className="font-semibold text-base text-foreground">Add New Shortcut</h2>
        <form onSubmit={handleAdd} className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="sc-label">Label</Label>
              <Input
                id="sc-label"
                placeholder="e.g. Shared Drive"
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="sc-url">URL</Label>
              <Input
                id="sc-url"
                type="url"
                placeholder="https://..."
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                required
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="sc-icon">Icon</Label>
            <select
              id="sc-icon"
              value={icon}
              onChange={(e) => setIcon(e.target.value)}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            >
              {ICON_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          {success && <p className="text-sm text-green-600">{success}</p>}
          <Button type="submit" disabled={adding || !selectedOrgId}>
            {adding ? "Adding..." : "Add Shortcut"}
          </Button>
        </form>
      </div>

      {/* Existing shortcuts */}
      <div className="space-y-3">
        <h2 className="font-semibold text-base text-foreground">
          Existing Shortcuts
          {selectedOrgId && (
            <span className="ml-2 text-sm font-normal text-muted-foreground">
              ({orgs.find((o) => o.id === selectedOrgId)?.name})
            </span>
          )}
        </h2>
        {loadingShortcuts ? (
          <p className="text-sm text-muted-foreground">Loading...</p>
        ) : shortcuts.length === 0 ? (
          <p className="text-sm text-muted-foreground">No shortcuts yet for this organisation.</p>
        ) : (
          <div className="rounded-md border border-border bg-background">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Label</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">URL</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Icon</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Action</th>
                </tr>
              </thead>
              <tbody>
                {shortcuts.map((sc) => (
                  <tr key={sc.id} className="border-b border-border last:border-0 hover:bg-muted/30">
                    <td className="px-4 py-3 font-medium text-foreground">{sc.label}</td>
                    <td className="px-4 py-3 text-muted-foreground max-w-xs truncate">
                      <a href={sc.url} target="_blank" rel="noopener noreferrer" className="hover:underline text-primary">
                        {sc.url}
                      </a>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground capitalize">{sc.icon}</td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => handleDelete(sc.id)}
                        className="flex items-center gap-1 text-destructive hover:text-destructive/80 text-sm font-medium transition-colors"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
