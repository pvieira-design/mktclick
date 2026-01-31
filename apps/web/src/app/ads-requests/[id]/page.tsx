"use client";

import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";
import { AdStatusBadge } from "@/components/ads/ad-status-badge";
import { AdPhaseBadge } from "@/components/ads/ad-phase-badge";
import { AdVideoCard } from "@/components/ads/ad-video-card";
import {
  PRIORITY_LABELS,
  PRIORITY_COLORS,
} from "@/components/ads/ad-constants";
import { trpc } from "@/utils/trpc";
import { ArrowLeft } from "@untitledui/icons";

export default function AdProjectDetailPage() {
  const params = useParams();
  const id = params.id as string;

  const {
    data: project,
    isLoading,
    error,
  } = useQuery(trpc.adProject.getById.queryOptions({ id }));

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-4 w-32 rounded-md" />
        <Skeleton className="h-8 w-64 rounded-md" />
        <Skeleton className="h-4 w-48 rounded-md" />
        <div className="rounded-xl bg-primary p-6 shadow-xs ring-1 ring-border-secondary space-y-4">
          <Skeleton className="h-6 w-1/3 rounded-md" />
          <Skeleton className="h-20 w-full rounded-md" />
          <div className="grid grid-cols-4 gap-4">
            <Skeleton className="h-10 w-full rounded-md" />
            <Skeleton className="h-10 w-full rounded-md" />
            <Skeleton className="h-10 w-full rounded-md" />
            <Skeleton className="h-10 w-full rounded-md" />
          </div>
        </div>
        <div className="rounded-xl bg-primary p-6 shadow-xs ring-1 ring-border-secondary space-y-3">
          <Skeleton className="h-6 w-40 rounded-md" />
          <Skeleton className="h-16 w-full rounded-md" />
          <Skeleton className="h-16 w-full rounded-md" />
        </div>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="text-center py-12">
        <p className="text-error-primary">Erro ao carregar projeto</p>
        <Link
          href={"/ads-requests" as any}
          className="text-sm text-brand-primary hover:underline mt-2 inline-block"
        >
          Voltar para lista
        </Link>
      </div>
    );
  }

  const formatDate = (date: Date | string) => {
    return new Intl.DateTimeFormat("pt-BR").format(new Date(date));
  };

  return (
    <div className="space-y-6">
      {/* Back link */}
      <Link
        href={"/ads-requests" as any}
        className="inline-flex items-center gap-1.5 text-sm text-tertiary hover:text-primary transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Voltar para lista
      </Link>

      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-primary">
            {project.title}
          </h1>
          <div className="flex items-center gap-3 mt-2">
            <AdStatusBadge status={project.status} />
            <AdPhaseBadge phase={project.currentPhase} />
            {project.priority && (
              <span
                className={`text-sm font-medium ${PRIORITY_COLORS[project.priority] || ""}`}
              >
                {PRIORITY_LABELS[project.priority] || project.priority}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Project Info Card */}
      <div className="rounded-xl bg-primary p-6 shadow-xs ring-1 ring-border-secondary space-y-4">
        <h2 className="text-lg font-semibold text-primary">
          Informacoes do Projeto
        </h2>

        <div>
          <h3 className="text-sm font-medium text-secondary mb-1">Briefing</h3>
          <p className="text-sm text-tertiary whitespace-pre-wrap">
            {project.briefing}
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-2 border-t border-secondary">
          <div>
            <p className="text-xs text-quaternary">Tipo</p>
            <p className="text-sm font-medium text-primary">
              {project.adType.name}
            </p>
          </div>
          <div>
            <p className="text-xs text-quaternary">Origem</p>
            <p className="text-sm font-medium text-primary">
              {project.origin.name}
            </p>
          </div>
          <div>
            <p className="text-xs text-quaternary">Deadline</p>
            <p className="text-sm font-medium text-primary">
              {project.deadline ? formatDate(project.deadline) : "Sem prazo"}
            </p>
          </div>
          <div>
            <p className="text-xs text-quaternary">Criado por</p>
            <p className="text-sm font-medium text-primary">
              {project.createdBy.name || "Desconhecido"}
            </p>
          </div>
        </div>

        <div className="pt-2 border-t border-secondary">
          <p className="text-xs text-quaternary">
            Criado em {formatDate(project.createdAt)}
          </p>
        </div>
      </div>

      {/* Videos Section */}
      <div className="rounded-xl bg-primary p-6 shadow-xs ring-1 ring-border-secondary space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-primary">
            Videos ({project.videos.length})
          </h2>
        </div>

        {project.videos.length === 0 ? (
          <div className="text-center py-8 text-tertiary">
            <p>Nenhum video neste projeto</p>
          </div>
        ) : (
          <div className="space-y-3">
            {project.videos.map((video, index) => (
              <AdVideoCard key={video.id} video={video} index={index} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
