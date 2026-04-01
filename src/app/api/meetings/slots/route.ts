import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import {
  generateAvailableSlots,
  DEFAULT_AVAILABILITY,
  type AvailabilitySlot,
} from "@/lib/calendar/client";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const pmId = searchParams.get("pmId");

  if (!pmId) {
    return NextResponse.json({ error: "pmId is required" }, { status: 400 });
  }

  const supabase = await createServerSupabaseClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Get PM's calendar availability
  const { data: pm } = await supabase
    .from("admin_users")
    .select("calendar_availability")
    .eq("id", pmId)
    .single();

  const availability = (pm?.calendar_availability as AvailabilitySlot[] | null) ?? DEFAULT_AVAILABILITY;

  // Get existing booked meetings for that PM in next 2 weeks
  const now = new Date();
  const twoWeeksOut = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000);

  const { data: bookedMeetings } = await supabase
    .from("meetings")
    .select("scheduled_at, duration_minutes")
    .eq("pm_id", pmId)
    .eq("status", "scheduled")
    .gte("scheduled_at", now.toISOString())
    .lte("scheduled_at", twoWeeksOut.toISOString());

  // Generate all possible slots
  const allSlots = generateAvailableSlots(availability, 30, now, twoWeeksOut);

  // Filter out already booked slots
  const bookedTimes = new Set(
    (bookedMeetings ?? []).map((m) => new Date(m.scheduled_at).toISOString())
  );

  const availableSlots = allSlots.filter(
    (slot) => !bookedTimes.has(slot.start)
  );

  return NextResponse.json({ slots: availableSlots });
}
