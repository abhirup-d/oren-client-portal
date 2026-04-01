"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { PROJECT_TYPES } from "@/lib/constants";
import type { Project, Organization, AdminUser } from "@/lib/supabase/types";

interface ProjectFormProps {
  project?: Project;
  organizations: Organization[];
  adminUsers: AdminUser[];
}

type ProjectStatus = "active" | "completed" | "on_hold" | "cancelled";

const PROJECT_STATUSES: { value: ProjectStatus; label: string }[] = [
  { value: "active", label: "Active" },
  { value: "completed", label: "Completed" },
  { value: "on_hold", label: "On Hold" },
  { value: "cancelled", label: "Cancelled" },
];

export function ProjectForm({ project, organizations, adminUsers }: ProjectFormProps) {
  const router = useRouter();
  const supabase = createClient();
  const isEditing = !!project;

  const [orgId, setOrgId] = useState(project?.org_id ?? "");
  const [title, setTitle] = useState(project?.title ?? "");
  const [type, setType] = useState<keyof typeof PROJECT_TYPES>(
    (project?.type as keyof typeof PROJECT_TYPES) ?? "dma"
  );
  const [status, setStatus] = useState<ProjectStatus>(project?.status ?? "active");
  const [assignedPmId, setAssignedPmId] = useState(project?.assigned_pm_id ?? "");
  const [description, setDescription] = useState(project?.description ?? "");
  const [startDate, setStartDate] = useState(project?.start_date ?? "");
  const [endDate, setEndDate] = useState(project?.target_end_date ?? "");
  const [phases, setPhases] = useState<string[]>(
    project?.phases?.map((p) => p.name) ?? [""]
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function addPhase() {
    setPhases((prev) => [...prev, ""]);
  }

  function removePhase(index: number) {
    setPhases((prev) => prev.filter((_, i) => i !== index));
  }

  function updatePhase(index: number, value: string) {
    setPhases((prev) => prev.map((p, i) => (i === index ? value : p)));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const filteredPhases = phases.filter((p) => p.trim() !== "");
    const phasesPayload = filteredPhases.map((name, order) => ({
      name,
      status: "pending",
      order,
      started_at: null,
      completed_at: null,
    }));

    try {
      if (isEditing) {
        const { error: updateError } = await supabase
          .from("projects")
          .update({
            org_id: orgId,
            title,
            type,
            status,
            assigned_pm_id: assignedPmId || null,
            description: description || null,
            start_date: startDate || null,
            target_end_date: endDate || null,
            phases: phasesPayload,
          })
          .eq("id", project.id);

        if (updateError) throw updateError;
      } else {
        const { error: insertError } = await supabase.from("projects").insert({
          org_id: orgId,
          title,
          type,
          status,
          assigned_pm_id: assignedPmId || null,
          description: description || null,
          start_date: startDate || null,
          target_end_date: endDate || null,
          phases: phasesPayload,
        });

        if (insertError) throw insertError;
      }

      router.push("/admin/projects");
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
          Client <span className="text-destructive">*</span>
        </label>
        <select
          required
          value={orgId}
          onChange={(e) => setOrgId(e.target.value)}
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
        >
          <option value="">Select client…</option>
          {organizations.map((org) => (
            <option key={org.id} value={org.id}>
              {org.name}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-1.5">
        <label className="text-sm font-medium text-foreground">
          Project Title <span className="text-destructive">*</span>
        </label>
        <input
          type="text"
          required
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
          placeholder="Q1 DMA Assessment"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-foreground">
            Type <span className="text-destructive">*</span>
          </label>
          <select
            required
            value={type}
            onChange={(e) => setType(e.target.value as keyof typeof PROJECT_TYPES)}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
          >
            {Object.entries(PROJECT_TYPES).map(([key, val]) => (
              <option key={key} value={key}>
                {val.label}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium text-foreground">Status</label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as ProjectStatus)}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
          >
            {PROJECT_STATUSES.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="space-y-1.5">
        <label className="text-sm font-medium text-foreground">Assigned PM</label>
        <select
          value={assignedPmId}
          onChange={(e) => setAssignedPmId(e.target.value)}
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
        >
          <option value="">Unassigned</option>
          {adminUsers.map((admin) => (
            <option key={admin.id} value={admin.id}>
              {admin.name}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-1.5">
        <label className="text-sm font-medium text-foreground">Description</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring resize-none"
          placeholder="Brief description of the project…"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-foreground">Start Date</label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-foreground">End Date</label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
      </div>

      {/* Phases */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">Phases</label>
        <div className="space-y-2">
          {phases.map((phase, i) => (
            <div key={i} className="flex gap-2">
              <input
                type="text"
                value={phase}
                onChange={(e) => updatePhase(i, e.target.value)}
                className="flex-1 rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
                placeholder={`Phase ${i + 1} name`}
              />
              <button
                type="button"
                onClick={() => removePhase(i)}
                className="rounded-md border border-border px-3 py-2 text-sm text-muted-foreground hover:text-destructive hover:border-destructive transition-colors"
              >
                Remove
              </button>
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={addPhase}
          className="text-sm text-primary hover:underline"
        >
          + Add Phase
        </button>
      </div>

      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          disabled={loading}
          className="rounded-md bg-primary px-5 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition-colors"
        >
          {loading ? "Saving…" : isEditing ? "Save Changes" : "Create Project"}
        </button>
        <button
          type="button"
          onClick={() => router.push("/admin/projects")}
          className="rounded-md border border-border px-5 py-2 text-sm font-medium text-foreground hover:bg-muted transition-colors"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
