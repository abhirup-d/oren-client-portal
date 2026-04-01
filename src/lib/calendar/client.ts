export interface AvailabilitySlot {
  day: number; // 0=Sun, 1=Mon, ..., 6=Sat
  startTime: string; // "09:00"
  endTime: string; // "17:00"
}

export interface TimeSlot {
  start: string; // ISO string
  end: string; // ISO string
}

/**
 * Generates available 30-minute time slots from a PM's weekly availability pattern.
 * Only returns future slots.
 */
export function generateAvailableSlots(
  availability: AvailabilitySlot[],
  durationMinutes: number,
  startDate: Date,
  endDate: Date
): TimeSlot[] {
  const slots: TimeSlot[] = [];
  const now = new Date();

  const current = new Date(startDate);
  current.setHours(0, 0, 0, 0);

  while (current <= endDate) {
    const dayOfWeek = current.getDay();
    const daySlots = availability.filter((a) => a.day === dayOfWeek);

    for (const slot of daySlots) {
      const [startH, startM] = slot.startTime.split(":").map(Number);
      const [endH, endM] = slot.endTime.split(":").map(Number);

      const windowStart = new Date(current);
      windowStart.setHours(startH, startM, 0, 0);

      const windowEnd = new Date(current);
      windowEnd.setHours(endH, endM, 0, 0);

      let cursor = new Date(windowStart);
      while (cursor.getTime() + durationMinutes * 60 * 1000 <= windowEnd.getTime()) {
        const slotEnd = new Date(cursor.getTime() + durationMinutes * 60 * 1000);
        // Only include future slots
        if (cursor > now) {
          slots.push({
            start: cursor.toISOString(),
            end: slotEnd.toISOString(),
          });
        }
        cursor = slotEnd;
      }
    }

    current.setDate(current.getDate() + 1);
  }

  return slots;
}

/**
 * Default Mon-Fri 09:00-17:00 availability
 */
export const DEFAULT_AVAILABILITY: AvailabilitySlot[] = [
  { day: 1, startTime: "09:00", endTime: "17:00" },
  { day: 2, startTime: "09:00", endTime: "17:00" },
  { day: 3, startTime: "09:00", endTime: "17:00" },
  { day: 4, startTime: "09:00", endTime: "17:00" },
  { day: 5, startTime: "09:00", endTime: "17:00" },
];

export function formatSlotTime(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}

export function formatSlotDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("en-IN", {
    weekday: "long",
    month: "short",
    day: "numeric",
  });
}
