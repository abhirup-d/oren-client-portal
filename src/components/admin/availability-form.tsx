"use client";

import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { DEFAULT_AVAILABILITY, type AvailabilitySlot } from "@/lib/calendar/client";

const DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

interface AvailabilityFormProps {
  adminId: string;
  initialAvailability: AvailabilitySlot[] | null;
}

export function AvailabilityForm({ adminId, initialAvailability }: AvailabilityFormProps) {
  const [slots, setSlots] = useState<AvailabilitySlot[]>(
    initialAvailability ?? DEFAULT_AVAILABILITY
  );
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function addSlot() {
    setSlots([...slots, { day: 1, startTime: "09:00", endTime: "17:00" }]);
    setSaved(false);
  }

  function removeSlot(index: number) {
    setSlots(slots.filter((_, i) => i !== index));
    setSaved(false);
  }

  function updateSlot(index: number, field: keyof AvailabilitySlot, value: string | number) {
    const updated = [...slots];
    updated[index] = { ...updated[index], [field]: value };
    setSlots(updated);
    setSaved(false);
  }

  async function handleSave() {
    setSaving(true);
    setError(null);
    setSaved(false);

    const supabase = createClient();
    const { error: updateError } = await supabase
      .from("admin_users")
      .update({ calendar_availability: slots as unknown as Record<string, unknown> })
      .eq("id", adminId);

    if (updateError) {
      setError(updateError.message);
    } else {
      setSaved(true);
    }

    setSaving(false);
  }

  return (
    <div className="space-y-4">
      <div className="space-y-3">
        {slots.map((slot, index) => (
          <div
            key={index}
            className="flex items-center gap-3 rounded-md border border-border bg-muted/30 px-3 py-2"
          >
            <select
              value={slot.day}
              onChange={(e) => updateSlot(index, "day", Number(e.target.value))}
              className="rounded-md border border-input bg-background px-2 py-1 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            >
              {DAY_NAMES.map((name, d) => (
                <option key={d} value={d}>
                  {name}
                </option>
              ))}
            </select>

            <span className="text-xs text-muted-foreground">from</span>

            <input
              type="time"
              value={slot.startTime}
              onChange={(e) => updateSlot(index, "startTime", e.target.value)}
              className="rounded-md border border-input bg-background px-2 py-1 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />

            <span className="text-xs text-muted-foreground">to</span>

            <input
              type="time"
              value={slot.endTime}
              onChange={(e) => updateSlot(index, "endTime", e.target.value)}
              className="rounded-md border border-input bg-background px-2 py-1 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />

            <button
              onClick={() => removeSlot(index)}
              className="ml-auto text-muted-foreground hover:text-red-500 transition-colors"
              title="Remove slot"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>

      {slots.length === 0 && (
        <p className="text-sm text-muted-foreground text-center py-4">
          No availability set. Add slots below.
        </p>
      )}

      <div className="flex items-center gap-3">
        <button
          onClick={addSlot}
          className="flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-sm text-muted-foreground hover:bg-muted transition-colors"
        >
          <Plus className="h-3.5 w-3.5" />
          Add Slot
        </button>

        <button
          onClick={handleSave}
          disabled={saving}
          className="rounded-md bg-primary px-4 py-1.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50"
        >
          {saving ? "Saving..." : "Save Availability"}
        </button>

        {saved && (
          <span className="text-sm text-green-600 font-medium">Saved!</span>
        )}
      </div>

      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
}
