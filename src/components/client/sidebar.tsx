"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { CLIENT_NAV_ITEMS } from "@/lib/constants";
import type { Organization } from "@/lib/supabase/types";

interface SidebarProps {
  org: Organization;
  userName: string;
}

export function Sidebar({ org, userName }: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 z-40 flex h-screen w-60 flex-col border-r border-border bg-background">
      {/* Logo area */}
      <div className="flex h-14 items-center gap-3 border-b border-border px-4">
        <span className="text-lg font-bold tracking-tight text-foreground">OREN</span>
        {org.logo_url && (
          <>
            <span className="text-muted-foreground/40">|</span>
            <Image
              src={org.logo_url}
              alt={`${org.name} logo`}
              width={80}
              height={24}
              className="h-6 w-auto object-contain"
            />
          </>
        )}
      </div>

      {/* Nav items */}
      <nav className="flex-1 overflow-y-auto py-4 px-2">
        <ul className="space-y-0.5">
          {CLIENT_NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  <Icon className="h-4 w-4 flex-shrink-0" />
                  <span>{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Bottom: user info */}
      <div className="border-t border-border px-4 py-3">
        <p className="text-sm font-medium text-foreground truncate">{userName}</p>
        <p className="text-xs text-muted-foreground truncate">{org.name}</p>
      </div>
    </aside>
  );
}
