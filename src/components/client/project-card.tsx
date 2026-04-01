import Link from "next/link";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { TypeBadge } from "@/components/shared/type-badge";
import { PROJECT_TYPES } from "@/lib/constants";
import type { Project } from "@/lib/supabase/types";

interface ProjectCardProps {
  project: Project;
}

export function ProjectCard({ project }: ProjectCardProps) {
  const typeConfig = PROJECT_TYPES[project.type];

  const sortedPhases = [...project.phases].sort((a, b) => a.order - b.order);
  const totalPhases = sortedPhases.length;
  const completedPhases = sortedPhases.filter((p) => p.status === "completed").length;
  const activePhase = sortedPhases.find((p) => p.status === "active") ?? sortedPhases[completedPhases];
  const currentPhaseIndex = activePhase ? activePhase.order : completedPhases;
  const progressPercent = totalPhases > 0 ? Math.round((completedPhases / totalPhases) * 100) : 0;

  return (
    <Link href={`/projects/${project.id}`} className="block group">
      <Card className="h-full transition-colors group-hover:border-primary/40">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-semibold text-sm leading-tight line-clamp-2 text-foreground group-hover:text-primary transition-colors">
              {project.title}
            </h3>
            <TypeBadge label={typeConfig.label} color={typeConfig.color} />
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {activePhase && (
            <p className="text-xs text-muted-foreground truncate">
              {activePhase.name}
            </p>
          )}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">
                Phase {Math.min(currentPhaseIndex + 1, totalPhases)} of {totalPhases}
              </span>
              <span className="text-xs text-muted-foreground">{progressPercent}%</span>
            </div>
            <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
              <div
                className="h-full rounded-full bg-primary transition-all"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
