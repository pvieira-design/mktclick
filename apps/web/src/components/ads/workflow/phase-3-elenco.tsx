"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Button } from "@/components/base/buttons/button";
import { Input } from "@/components/base/input/input";
import { useAdPermission } from "@/hooks/use-ad-permission";
import { VideoComments } from "../video/video-comments";
import { trpc } from "@/utils/trpc";
import { CheckCircle, AlertTriangle } from "@untitledui/icons";
import { PHASE_CONFIG } from "../ad-constants";

interface Phase3ElencoProps {
  project: any;
  onRefresh: () => void;
}

export function Phase3Elenco({ project, onRefresh }: Phase3ElencoProps) {
  const queryClient = useQueryClient();
  const canSelectElenco = useAdPermission("selecionar_elenco");
  const canApproveElenco = useAdPermission("aprovar_elenco");
  const canPreProducao = useAdPermission("pre_producao");
  const canApprovePreProducao = useAdPermission("aprovar_pre_producao");

  const { data: creators } = useQuery(
    (trpc.creator.list.queryOptions as any)({ limit: 100 })
  );

  const updateVideo = useMutation({
    ...trpc.adVideo.update.mutationOptions(),
    onSuccess: () => {
      toast.success("Entrega atualizada");
      queryClient.invalidateQueries({ queryKey: [["adProject"]] });
      onRefresh();
    },
    onError: (err: any) => toast.error(err.message || "Erro ao atualizar"),
  });

  const markValidation = useMutation({
    ...trpc.adVideo.markValidation.mutationOptions(),
    onSuccess: () => {
      toast.success("Aprovacao atualizada");
      queryClient.invalidateQueries({ queryKey: [["adProject"]] });
      onRefresh();
    },
    onError: (err: any) => toast.error(err.message || "Erro ao aprovar"),
  });

  const updatePhaseStatus = useMutation({
    ...trpc.adVideo.updatePhaseStatus.mutationOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [["adProject"]] });
      onRefresh();
    },
    onError: (err: any) => toast.error(err.message || "Erro ao atualizar status"),
  });

  const advancePhase = useMutation({
    ...trpc.adProject.advancePhase.mutationOptions(),
    onSuccess: () => {
      toast.success("Avancando para Fase 4!");
      queryClient.invalidateQueries({ queryKey: [["adProject"]] });
      onRefresh();
    },
    onError: (err: any) => toast.error(err.message || "Erro ao avancar fase"),
  });

  const videosReady = project.videos.filter(
    (v: any) => v.phaseStatus === "PRONTO"
  ).length;
  const allReady = videosReady === project.videos.length && project.videos.length > 0;

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-primary">
          Fase 3: Elenco & Pre-Producao
        </h3>
        <p className="text-sm text-tertiary mt-1">
          Progresso: {videosReady}/{project.videos.length} entregas prontas
        </p>
      </div>

      <div className="flex items-center gap-2 rounded-lg bg-warning-secondary p-3">
        <AlertTriangle className="h-4 w-4 text-warning-primary shrink-0" />
        <p className="text-xs text-warning-primary">
          Lista de entregas travada — nao eh possivel adicionar novas entregas
        </p>
      </div>

      <div className="space-y-4">
        {project.videos.map((video: any, index: number) => (
          <VideoElencoCard
            key={video.id}
            video={video}
            index={index}
            creators={(creators as any)?.items || creators || []}
            canSelectElenco={canSelectElenco}
            canApproveElenco={canApproveElenco}
            canPreProducao={canPreProducao}
            canApprovePreProducao={canApprovePreProducao}
            onUpdateVideo={(data: any) =>
              updateVideo.mutate({ id: video.id, ...data })
            }
            onMarkValidation={(field: string, value: boolean) =>
              markValidation.mutate({ id: video.id, field: field as any, value })
            }
            onMarkReady={() =>
              updatePhaseStatus.mutate({
                id: video.id,
                phaseStatus: "PRONTO" as any,
              })
            }
            isPending={updateVideo.isPending || markValidation.isPending}
          />
        ))}
      </div>

      {allReady && (
        <div className="flex justify-end pt-4 border-t border-secondary">
          <Button
            color="primary"
            onClick={() => advancePhase.mutate({ id: project.id })}
            isDisabled={advancePhase.isPending}
          >
            {advancePhase.isPending ? "Avancando..." : "Avancar para Fase 4"}
          </Button>
        </div>
      )}
    </div>
  );
}

function VideoElencoCard({
  video,
  index,
  creators,
  canSelectElenco,
  canApproveElenco,
  canPreProducao,
  canApprovePreProducao,
  onUpdateVideo,
  onMarkValidation,
  onMarkReady,
  isPending,
}: {
  video: any;
  index: number;
  creators: any[];
  canSelectElenco: boolean;
  canApproveElenco: boolean;
  canPreProducao: boolean;
  canApprovePreProducao: boolean;
  onUpdateVideo: (data: any) => void;
  onMarkValidation: (field: string, value: boolean) => void;
  onMarkReady: () => void;
  isPending: boolean;
}) {
  const isReady = video.phaseStatus === "PRONTO";
  const hasElenco = video.aprovacaoElenco;
  const hasPreProd = video.aprovacaoPreProducao;
  const canBeReady = video.criadorId && hasElenco && hasPreProd;

  const borderColor = isReady
    ? "border-success-primary"
    : "border-border-secondary";

  return (
    <div className={`rounded-lg border p-4 ${borderColor}`}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-secondary text-xs font-bold text-secondary">
            {index + 1}
          </span>
          <span className="text-sm font-semibold text-primary">
            {video.nomeDescritivo}
          </span>
        </div>
        {isReady && (
          <span className="flex items-center gap-1 text-xs font-medium text-success-primary">
            <CheckCircle className="h-4 w-4" /> Pronto
          </span>
        )}
      </div>

      <div className="space-y-3">
        <div>
          <label className="text-xs font-medium text-secondary block mb-1">
            Criador
          </label>
          {canSelectElenco && !isReady ? (
            <select
              value={video.criadorId || ""}
              onChange={(e) =>
                onUpdateVideo({ criadorId: e.target.value || undefined })
              }
              className="w-full rounded-lg border border-border-secondary bg-primary px-3 py-2 text-sm text-primary"
            >
              <option value="">Selecionar criador...</option>
              {creators.map((c: any) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          ) : (
            <p className="text-sm text-primary">
              {video.criador?.name || "Nao selecionado"}
            </p>
          )}
        </div>

        {canPreProducao && !isReady && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Input
              label="Storyboard URL"
              value={video.storyboardUrl || ""}
              onChange={(v: string) => onUpdateVideo({ storyboardUrl: v })}
              placeholder="https://..."
            />
            <Input
              label="Local de Gravacao"
              value={video.localGravacao || ""}
              onChange={(v: string) => onUpdateVideo({ localGravacao: v })}
              placeholder="Local..."
            />
          </div>
        )}

        <div className="flex items-center gap-4 pt-2 border-t border-secondary">
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={hasElenco}
              onChange={() =>
                canApproveElenco &&
                !isReady &&
                onMarkValidation("aprovacaoElenco", !hasElenco)
              }
              disabled={!canApproveElenco || isReady}
              className="h-4 w-4 rounded"
            />
            <span className={hasElenco ? "text-success-primary" : "text-tertiary"}>
              Elenco Aprovado
            </span>
          </label>

          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={hasPreProd}
              onChange={() =>
                canApprovePreProducao &&
                !isReady &&
                onMarkValidation("aprovacaoPreProducao", !hasPreProd)
              }
              disabled={!canApprovePreProducao || isReady}
              className="h-4 w-4 rounded"
            />
            <span className={hasPreProd ? "text-success-primary" : "text-tertiary"}>
              Pre-Producao Aprovada
            </span>
          </label>

          {canBeReady && !isReady && (
            <Button size="sm" color="primary" onClick={onMarkReady} className="ml-auto">
              Marcar Pronto
            </Button>
          )}
        </div>

        <VideoComments videoId={video.id} />
      </div>
    </div>
  );
}
