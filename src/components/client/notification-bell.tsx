"use client";

import { useEffect, useState, useCallback } from "react";
import { Bell } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn, formatDate } from "@/lib/utils";
import type { Notification } from "@/lib/supabase/types";

interface NotificationBellProps {
  userId: string;
}

export function NotificationBell({ userId }: NotificationBellProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const supabase = createClient();

  const fetchNotifications = useCallback(async () => {
    const { data } = await supabase
      .from("notifications")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(10);

    if (data) setNotifications(data);
  }, [userId, supabase]);

  useEffect(() => {
    fetchNotifications();

    const channel = supabase
      .channel(`notifications:${userId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          setNotifications((prev) => [payload.new as Notification, ...prev].slice(0, 10));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, fetchNotifications, supabase]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  async function markAsRead(notification: Notification) {
    if (notification.read) return;
    await supabase
      .from("notifications")
      .update({ read: true })
      .eq("id", notification.id);

    setNotifications((prev) =>
      prev.map((n) => (n.id === notification.id ? { ...n, read: true } : n))
    );

    if (notification.link) {
      window.location.href = notification.link;
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className="relative inline-flex h-9 w-9 items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
        aria-label="Notifications"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel>Notifications</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {notifications.length === 0 ? (
          <div className="py-6 text-center text-sm text-muted-foreground">
            No notifications yet
          </div>
        ) : (
          notifications.map((notification) => (
            <DropdownMenuItem
              key={notification.id}
              onClick={() => markAsRead(notification)}
              className={cn(
                "flex flex-col items-start gap-1 px-3 py-2 cursor-pointer",
                !notification.read && "bg-muted/50"
              )}
            >
              <div className="flex w-full items-start gap-2">
                {!notification.read && (
                  <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-primary" />
                )}
                <div className={cn("flex-1", notification.read && "ml-3.5")}>
                  <p className="text-sm font-medium leading-tight">{notification.title}</p>
                  <p className="text-xs text-muted-foreground mt-0.5 leading-snug">
                    {notification.body}
                  </p>
                  <p className="text-xs text-muted-foreground/60 mt-1">
                    {formatDate(notification.created_at)}
                  </p>
                </div>
              </div>
            </DropdownMenuItem>
          ))
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
