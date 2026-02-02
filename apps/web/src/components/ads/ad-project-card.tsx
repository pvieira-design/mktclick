import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";
import { AdStatusBadge } from "@/components/ads/ad-status-badge";
import { AdPhaseBadge } from "@/components/ads/ad-phase-badge";
import { PRIORITY_LABELS, PRIORITY_COLORS } from "@/components/ads/ad-constants";

interface AdProjectCardProps {
  project: {
    id: string;
    title: string;
    status: string;
    currentPhase: number;
    priority: string | null;
    deadline: Date | null;
    createdAt: Date;
    adType: { name: string; color: string | null };
    origin: { name: string };
    createdBy: { name: string | null; image: string | null };
    _count: { videos: number };
  };
}

export function AdProjectCardSkeleton() {
  return (
    <div className="rounded-xl bg-primary shadow-xs ring-1 ring-border-secondary">
      <div className="flex items-center justify-between gap-3 px-5 pt-5 pb-2">
        <Skeleton className="h-5 w-28 rounded-full" />
        <Skeleton className="h-5 w-24 rounded-full" />
      </div>
      <div className="px-5 pb-2">
        <Skeleton className="h-5 w-3/4 rounded-md" />
      </div>
      <div className="flex items-center gap-2 px-5 pb-4">
        <Skeleton className="h-4 w-16 rounded-md" />
        <Skeleton className="h-4 w-20 rounded-md" />
        <Skeleton className="h-4 w-16 rounded-md" />
      </div>
      <div className="flex items-center justify-between border-t border-secondary px-5 py-3">
        <Skeleton className="h-5 w-20 rounded-full" />
        <Skeleton className="h-3.5 w-28 rounded-md" />
      </div>
    </div>
  );
}

export function AdProjectCard({ project }: AdProjectCardProps) {
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("pt-BR").format(new Date(date));
  };

  return (
    <Link
      href={`/ads-requests/${project.id}` as any}
      className="block rounded-xl bg-primary shadow-xs ring-1 ring-border-secondary transition-all hover:shadow-md hover:ring-border-primary"
    >
      <div className="flex items-center justify-between gap-3 px-5 pt-5 pb-2">
        <span
          className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium"
          style={{
            backgroundColor: project.adType.color ? `${project.adType.color}20` : "#f3f4f6",
            color: project.adType.color || "#6b7280",
          }}
        >
          {project.adType.name}
        </span>
        <AdPhaseBadge phase={project.currentPhase} />
      </div>

      <div className="px-5 pb-2">
        <h3 className="text-md font-semibold text-primary leading-tight">
          {project.title}
        </h3>
      </div>

      <div className="flex flex-wrap items-center gap-1.5 px-5 pb-4 text-sm text-tertiary">
        <span>{project.origin.name}</span>
        <span className="text-quaternary">·</span>
        <span>{project._count.videos} {project._count.videos === 1 ? "entrega" : "entregas"}</span>
        <span className="text-quaternary">·</span>
        <span>{project.createdBy.name || "Desconhecido"}</span>
      </div>

      <div className="flex items-center justify-between border-t border-secondary px-5 py-3">
        <div className="flex items-center gap-2">
          <AdStatusBadge status={project.status} />
          {project.priority && (
            <span className={`text-xs font-medium ${PRIORITY_COLORS[project.priority] || ""}`}>
              {PRIORITY_LABELS[project.priority] || project.priority}
            </span>
          )}
        </div>
        {project.deadline ? (
          <p className="text-xs font-medium text-tertiary">
            Prazo: {formatDate(project.deadline)}
          </p>
        ) : (
          <p className="text-xs text-quaternary">Sem prazo</p>
        )}
      </div>
    </Link>
  );
}
