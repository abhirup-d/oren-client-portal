"use client";

import { useState, useEffect } from "react";
import { Calendar, Clock, CheckCircle } from "lucide-react";
import { formatSlotTime, formatSlotDate } from "@/lib/calendar/client";
import type { AdminUser, Project } from "@/lib/supabase/types";

interface TimeSlot {
  start: string;
  end: string;
}

interface MeetingBookingProps {
  pms: AdminUser[];
  projects: Project[];
}

interface GroupedSlots {
  [dateKey: string]: TimeSlot[];
}

export function MeetingBooking({ pms, projects }: MeetingBookingProps) {
  const [selectedPmId, setSelectedPmId] = useState<string>(pms[0]?.id ?? "");
  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [title, setTitle] = useState("");
  const [projectId, setProjectId] = useState<string>("");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!selectedPmId) return;

    setLoadingSlots(true);
    setSlots([]);
    setSelectedSlot(null);

    fetch(`/api/meetings/slots?pmId=${selectedPmId}`)
      .then((res) => res.json())
      .then((data) => {
        setSlots(data.slots ?? []);
        setLoadingSlots(false);
      })
      .catch(() => {
        setLoadingSlots(false);
      });
  }, [selectedPmId]);

  // Group slots by date
  const groupedSlots: GroupedSlots = {};
  for (const slot of slots) {
    const dateKey = new Date(slot.start).toDateString();
    if (!groupedSlots[dateKey]) groupedSlots[dateKey] = [];
    groupedSlots[dateKey].push(slot);
  }

  async function handleBook() {
    if (!selectedSlot || !title.trim()) return;

    setSubmitting(true);
    setError(null);

    const res = await fetch("/api/meetings/book", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        pmId: selectedPmId,
        scheduledAt: selectedSlot.start,
        title: title.trim(),
        notes: notes.trim() || undefined,
        projectId: projectId || undefined,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      setError(data.error ?? "Failed to book meeting");
      setSubmitting(false);
      return;
    }

    setSuccess(true);
    setSubmitting(false);
  }

  if (success) {
    return (
      <div className="rounded-lg border border-border bg-card p-8 text-center space-y-4">
        <CheckCircle className="h-12 w-12 text-green-500 mx-auto" />
        <div>
          <h3 className="text-lg font-semibold text-foreground">Meeting Booked!</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Your meeting has been scheduled. We&apos;ll send a confirmation shortly.
          </p>
        </div>
        <button
          onClick={() => {
            setSuccess(false);
            setSelectedSlot(null);
            setTitle("");
            setNotes("");
            setProjectId("");
          }}
          className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          Book Another
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* PM Selector */}
      <div className="rounded-lg border border-border bg-card p-4 space-y-3">
        <h2 className="text-sm font-semibold text-foreground">Select Project Manager</h2>
        <div className="flex flex-wrap gap-2">
          {pms.map((pm) => (
            <button
              key={pm.id}
              onClick={() => setSelectedPmId(pm.id)}
              className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                selectedPmId === pm.id
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              {pm.name}
            </button>
          ))}
        </div>
      </div>

      {/* Slot Picker */}
      <div className="rounded-lg border border-border bg-card p-4 space-y-4">
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <h2 className="text-sm font-semibold text-foreground">Available Time Slots</h2>
          <span className="text-xs text-muted-foreground">(next 2 weeks)</span>
        </div>

        {loadingSlots ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-16 rounded-md bg-muted animate-pulse" />
            ))}
          </div>
        ) : Object.keys(groupedSlots).length === 0 ? (
          <p className="text-sm text-muted-foreground py-4 text-center">
            No available slots in the next 2 weeks.
          </p>
        ) : (
          <div className="space-y-4 max-h-96 overflow-y-auto pr-1">
            {Object.entries(groupedSlots).map(([dateKey, daySlots]) => (
              <div key={dateKey}>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                  {formatSlotDate(daySlots[0].start)}
                </p>
                <div className="flex flex-wrap gap-2">
                  {daySlots.map((slot) => (
                    <button
                      key={slot.start}
                      onClick={() => setSelectedSlot(slot)}
                      className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm transition-colors ${
                        selectedSlot?.start === slot.start
                          ? "bg-primary text-primary-foreground"
                          : "border border-border bg-background hover:bg-muted text-foreground"
                      }`}
                    >
                      <Clock className="h-3 w-3" />
                      {formatSlotTime(slot.start)}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Booking Form */}
      {selectedSlot && (
        <div className="rounded-lg border border-border bg-card p-4 space-y-4">
          <h2 className="text-sm font-semibold text-foreground">Meeting Details</h2>
          <p className="text-xs text-muted-foreground">
            {formatSlotDate(selectedSlot.start)} at {formatSlotTime(selectedSlot.start)} (30 min)
          </p>

          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">
                Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. DMA Project Kickoff"
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">
                Project (optional)
              </label>
              <select
                value={projectId}
                onChange={(e) => setProjectId(e.target.value)}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="">No project</option>
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.title}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">
                Notes (optional)
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Agenda or context for the meeting..."
                rows={3}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none"
              />
            </div>
          </div>

          {error && (
            <p className="text-sm text-red-500">{error}</p>
          )}

          <button
            onClick={handleBook}
            disabled={!title.trim() || submitting}
            className="w-full rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? "Booking..." : "Confirm Booking"}
          </button>
        </div>
      )}
    </div>
  );
}
