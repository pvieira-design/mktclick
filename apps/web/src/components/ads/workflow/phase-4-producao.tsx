"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Button } from "@/components/base/buttons/button";
import { useAdPermission } from "@/hooks/use-ad-permission";
import { DeliverableList } from "../deliverable/deliverable-list";
import { trpc } from "@/utils/trpc";
import { CheckCircle } from "@untitledui/icons";

interface Phase4ProducaoProps {
  project: any;
  onRefresh: () => void;
}

export function Phase4Producao({ project, onRefresh }: Phase4ProducaoProps) {
  const queryClient = useQueryClient();
  const canProducao = useAdPermission("producao_entrega");

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
      toast.success("Avancando para Fase 5!");
      queryClient.invalidateQueries({ queryKey: [["adProject"]] });
      onRefresh();
    },
    onError: (err: any) => toast.error(err.message || "Erro ao avancar fase"),
  });

  const videosReady = project.videos.filter(
    (v: any) => v.phaseStatus === "ENTREGUE"
  ).length;
  const allReady = videosReady === project.videos.length && project.videos.length > 0;

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-primary">
          Fase 4: Producao & Entrega
        </h3>
        <p className="text-sm text-tertiary mt-1">
          Progresso: {videosReady}/{project.videos.length} entregas concluidas
        </p>
      </div>

      <div className="space-y-4">
        {project.videos.map((video: any, index: number) => {
          const isEntregue = video.phaseStatus === "ENTREGUE";
          const hasDeliverables = video.deliverables && video.deliverables.length > 0;

          return (
            <div
              key={video.id}
              className={`rounded-lg border p-4 ${
                isEntregue ? "border-success-primary" : "border-border-secondary"
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-secondary text-xs font-bold text-secondary">
                    {index + 1}
                  </span>
                  <span className="text-sm font-semibold text-primary">
                    {video.nomeDescritivo}
                  </span>
                  {video.criador && (
                    <span className="text-xs text-tertiary">
                      · {video.criador.name}
                    </span>
                  )}
                </div>
                {isEntregue && (
                  <span className="flex items-center gap-1 text-xs font-medium text-success-primary">
                    <CheckCircle className="h-4 w-4" /> Entregue
                  </span>
                )}
              </div>

              <DeliverableList
                videoId={video.id}
                deliverables={video.deliverables || []}
                canEdit={canProducao && !isEntregue}
                canAddMore={
                  canProducao &&
                  !isEntregue &&
                  (video.deliverables?.length || 0) < 10
                }
                onRefresh={onRefresh}
              />

              {hasDeliverables && !isEntregue && canProducao && (
                <div className="flex justify-end mt-3 pt-3 border-t border-secondary">
                  <Button
                    size="sm"
                    color="primary"
                    onClick={() =>
                      updatePhaseStatus.mutate({
                        id: video.id,
                        phaseStatus: "ENTREGUE" as any,
                      })
                    }
                    isDisabled={updatePhaseStatus.isPending}
                  >
                    {updatePhaseStatus.isPending ? "Marcando..." : "Marcar como Entregue"}
                  </Button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {allReady && (
        <div className="flex justify-end pt-4 border-t border-secondary">
          <Button
            color="primary"
            onClick={() => advancePhase.mutate({ id: project.id })}
            isDisabled={advancePhase.isPending}
          >
            {advancePhase.isPending ? "Avancando..." : "Avancar para Fase 5"}
          </Button>
        </div>
      )}
    </div>
  );
}
