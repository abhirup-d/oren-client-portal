import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Project } from "@/lib/supabase/types";

interface PhaseTimelineProps {
  phases: Project["phases"];
}

export function PhaseTimeline({ phases }: PhaseTimelineProps) {
  const sorted = [...phases].sort((a, b) => a.order - b.order);

  return (
    <div className="relative flex items-start overflow-x-auto pb-2">
      {sorted.map((phase, index) => {
        const isCompleted = phase.status === "completed";
        const isActive = phase.status === "active";
        const isPending = !isCompleted && !isActive;
        const isLast = index === sorted.length - 1;

        return (
          <div key={phase.order} className="flex flex-col items-center" style={{ minWidth: 100 }}>
            <div className="relative flex items-center w-full">
              {/* Connector line before */}
              {index > 0 && (
                <div
                  className={cn(
                    "h-0.5 flex-1",
                    isCompleted || isActive ? "bg-primary" : "bg-muted"
                  )}
                />
              )}

              {/* Circle */}
              <div
                className={cn(
                  "flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full border-2 transition-colors",
                  isCompleted && "border-primary bg-primary text-primary-foreground",
                  isActive && "border-primary bg-background text-primary",
                  isPending && "border-muted bg-background text-muted-foreground"
                )}
              >
                {isCompleted ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <span className="text-xs font-semibold">{index + 1}</span>
                )}
              </div>

              {/* Connector line after */}
              {!isLast && (
                <div
                  className={cn(
                    "h-0.5 flex-1",
                    isCompleted ? "bg-primary" : "bg-muted"
                  )}
                />
              )}
            </div>

            {/* Phase name */}
            <p
              className={cn(
                "mt-2 text-center text-xs leading-snug px-1",
                isCompleted && "text-foreground font-medium",
                isActive && "text-primary font-semibold",
                isPending && "text-muted-foreground"
              )}
            >
              {phase.name}
            </p>
          </div>
        );
      })}
    </div>
  );
}
