"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/base/buttons/button";
import { AdStatusBadge } from "@/components/ads/ad-status-badge";
import { AdPhaseBadge } from "@/components/ads/ad-phase-badge";
import {
  PRIORITY_LABELS,
  PRIORITY_COLORS,
} from "@/components/ads/ad-constants";
import { PhaseProgressBar } from "@/components/ads/workflow/phase-progress-bar";
import { PhasePanel } from "@/components/ads/workflow/phase-panel";
import { trpc } from "@/utils/trpc";
import { ArrowLeft } from "@untitledui/icons";

export default function AdProjectDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const router = useRouter();
  const queryClient = useQueryClient();
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const {
    data: project,
    isLoading,
    error,
    refetch,
  } = useQuery(trpc.adProject.getById.queryOptions({ id }));

  const { data: phaseStatus } = useQuery(
    trpc.adProject.getPhaseStatus.queryOptions({ id })
  );

  const cancelProject = useMutation({
    ...trpc.adProject.cancel.mutationOptions(),
    onSuccess: () => {
      toast.success("Projeto cancelado");
      setShowCancelDialog(false);
      queryClient.invalidateQueries({ queryKey: [["adProject"]] });
      handleRefresh();
    },
    onError: (err: any) => toast.error(err.message || "Erro ao cancelar projeto"),
  });

  const deleteProject = useMutation({
    ...trpc.adProject.delete.mutationOptions(),
    onSuccess: () => {
      toast.success("Projeto excluido");
      setShowDeleteDialog(false);
      router.push("/ads-requests" as any);
    },
    onError: (err: any) => toast.error(err.message || "Erro ao excluir projeto"),
  });

  const handleRefresh = () => {
    refetch();
    queryClient.invalidateQueries({ queryKey: [["adProject"]] });
  };

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
          <Skeleton className="h-12 w-full rounded-md" />
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

  const isActive = project.status === "ACTIVE";

  return (
    <div className="space-y-6">
      <Link
        href={"/ads-requests" as any}
        className="inline-flex items-center gap-1.5 text-sm text-tertiary hover:text-primary transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Voltar para lista
      </Link>

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
        <div className="flex items-center gap-2 shrink-0">
          {project.status === "ACTIVE" && (
            <Button
              color="secondary-destructive"
              size="sm"
              onClick={() => setShowCancelDialog(true)}
            >
              Cancelar Projeto
            </Button>
          )}
          {project.status === "DRAFT" && (
            <Button
              color="primary-destructive"
              size="sm"
              onClick={() => setShowDeleteDialog(true)}
            >
              Excluir Projeto
            </Button>
          )}
        </div>
      </div>

      <div className="rounded-xl bg-primary p-6 shadow-xs ring-1 ring-border-secondary space-y-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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

      {isActive && (
        <div className="rounded-xl bg-primary p-6 shadow-xs ring-1 ring-border-secondary">
          <PhaseProgressBar
            currentPhase={project.currentPhase}
            totalVideos={project.videos.length}
            videosReadyInCurrentPhase={phaseStatus?.videosReady ?? 0}
          />
        </div>
      )}

      {isActive && (
        <div className="rounded-xl bg-primary p-6 shadow-xs ring-1 ring-border-secondary">
          <PhasePanel
            project={project}
            currentPhase={project.currentPhase}
            onRefresh={handleRefresh}
          />
        </div>
      )}

      {!isActive && (
        <div className="rounded-xl bg-primary p-6 shadow-xs ring-1 ring-border-secondary space-y-4">
          <h2 className="text-lg font-semibold text-primary">
            Briefing
          </h2>
          <p className="text-sm text-tertiary whitespace-pre-wrap">
            {project.briefing}
          </p>

          <h2 className="text-lg font-semibold text-primary pt-4 border-t border-secondary">
            Entregas ({project.videos.length})
          </h2>
          {project.videos.length === 0 ? (
            <p className="text-sm text-tertiary text-center py-4">
              Nenhuma entrega neste projeto
            </p>
          ) : (
            <div className="space-y-3">
              {project.videos.map((video: any, index: number) => (
                <div
                  key={video.id}
                  className="flex items-center gap-3 rounded-lg bg-secondary p-3"
                >
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs font-bold text-secondary ring-1 ring-border-secondary">
                    {index + 1}
                  </span>
                  <span className="text-sm font-medium text-primary">
                    {video.nomeDescritivo}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <AlertDialog open={showCancelDialog} onOpenChange={(open) => !open && setShowCancelDialog(false)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancelar projeto?</AlertDialogTitle>
            <AlertDialogDescription>
              O projeto sera marcado como cancelado. Esta acao nao pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Voltar</AlertDialogCancel>
            <AlertDialogAction onClick={() => cancelProject.mutate({ id })}>
              Confirmar Cancelamento
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={showDeleteDialog} onOpenChange={(open) => !open && setShowDeleteDialog(false)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir projeto?</AlertDialogTitle>
            <AlertDialogDescription>
              O projeto sera excluido permanentemente. Esta acao nao pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Voltar</AlertDialogCancel>
            <AlertDialogAction onClick={() => deleteProject.mutate({ id })}>
              Excluir Projeto
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
