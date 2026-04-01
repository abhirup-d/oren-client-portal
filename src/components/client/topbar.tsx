"use client";

import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { NotificationBell } from "./notification-bell";

interface TopbarProps {
  userId: string;
}

export function Topbar({ userId }: TopbarProps) {
  const router = useRouter();

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
  }

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center justify-end gap-2 border-b border-border bg-background px-4">
      <NotificationBell userId={userId} />
      <Button variant="ghost" size="icon" onClick={handleSignOut} title="Sign out">
        <LogOut className="h-5 w-5" />
      </Button>
    </header>
  );
}
