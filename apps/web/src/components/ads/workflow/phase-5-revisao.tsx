"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Button } from "@/components/base/buttons/button";
import { useAdPermission } from "@/hooks/use-ad-permission";
import { VideoRegressionDialog } from "../video/video-regression-dialog";
import { DeliverableList } from "../deliverable/deliverable-list";
import { trpc } from "@/utils/trpc";
import { CheckCircle } from "@untitledui/icons";

interface Phase5RevisaoProps {
  project: any;
  onRefresh: () => void;
}

export function Phase5Revisao({ project, onRefresh }: Phase5RevisaoProps) {
  const queryClient = useQueryClient();
  const canRevisaoConteudo = useAdPermission("revisao_conteudo");
  const canRevisaoDesign = useAdPermission("revisao_design");
  const canValidacaoFinal = useAdPermission("validacao_final");
  const [regressionVideo, setRegressionVideo] = useState<any>(null);

  const markValidation = useMutation({
    ...trpc.adVideo.markValidation.mutationOptions(),
    onSuccess: () => {
      toast.success("Revisao atualizada");
      queryClient.invalidateQueries({ queryKey: [["adProject"]] });
      onRefresh();
    },
    onError: (err: any) => toast.error(err.message || "Erro ao atualizar"),
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
      toast.success("Avancando para Fase 6!");
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
          Fase 5: Revisao & Validacao Final
        </h3>
        <p className="text-sm text-tertiary mt-1">
          Progresso: {videosReady}/{project.videos.length} videos prontos
        </p>
      </div>

      <div className="space-y-4">
        {project.videos.map((video: any, index: number) => {
          const isReady = video.phaseStatus === "PRONTO";
          const hasConteudo = video.revisaoConteudo;
          const hasDesign = video.revisaoDesign;
          const hasCompliance = video.validacaoFinalCompliance;
          const hasMedico = video.validacaoFinalMedico;
          const canBeReady = hasConteudo && hasDesign && hasCompliance && hasMedico;

          return (
            <div
              key={video.id}
              className={`rounded-lg border p-4 ${
                isReady ? "border-success-primary" : "border-border-secondary"
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
                </div>
                <div className="flex items-center gap-2">
                  {isReady && (
                    <span className="flex items-center gap-1 text-xs font-medium text-success-primary">
                      <CheckCircle className="h-4 w-4" /> Pronto
                    </span>
                  )}
                  {!isReady && (
                    <Button
                      size="sm"
                      color="secondary-destructive"
                      onClick={() => setRegressionVideo(video)}
                    >
                      Enviar de Volta
                    </Button>
                  )}
                </div>
              </div>

              <DeliverableList
                videoId={video.id}
                deliverables={video.deliverables || []}
                canEdit={!isReady}
                canAddMore={!isReady && (video.deliverables?.length || 0) < 10}
                onRefresh={onRefresh}
              />

              <div className="grid grid-cols-2 gap-3 mt-3 pt-3 border-t border-secondary">
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={hasConteudo}
                    onChange={() =>
                      canRevisaoConteudo &&
                      !isReady &&
                      markValidation.mutate({
                        id: video.id,
                        field: "revisaoConteudo" as any,
                        value: !hasConteudo,
                      })
                    }
                    disabled={!canRevisaoConteudo || isReady}
                    className="h-4 w-4 rounded"
                  />
                  <span className={hasConteudo ? "text-success-primary" : "text-tertiary"}>
                    Conteudo
                  </span>
                </label>

                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={hasDesign}
                    onChange={() =>
                      canRevisaoDesign &&
                      !isReady &&
                      markValidation.mutate({
                        id: video.id,
                        field: "revisaoDesign" as any,
                        value: !hasDesign,
                      })
                    }
                    disabled={!canRevisaoDesign || isReady}
                    className="h-4 w-4 rounded"
                  />
                  <span className={hasDesign ? "text-success-primary" : "text-tertiary"}>
                    Design
                  </span>
                </label>

                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={hasCompliance}
                    onChange={() =>
                      canValidacaoFinal &&
                      !isReady &&
                      markValidation.mutate({
                        id: video.id,
                        field: "validacaoFinalCompliance" as any,
                        value: !hasCompliance,
                      })
                    }
                    disabled={!canValidacaoFinal || isReady}
                    className="h-4 w-4 rounded"
                  />
                  <span className={hasCompliance ? "text-success-primary" : "text-tertiary"}>
                    Compliance Final
                  </span>
                </label>

                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={hasMedico}
                    onChange={() =>
                      canValidacaoFinal &&
                      !isReady &&
                      markValidation.mutate({
                        id: video.id,
                        field: "validacaoFinalMedico" as any,
                        value: !hasMedico,
                      })
                    }
                    disabled={!canValidacaoFinal || isReady}
                    className="h-4 w-4 rounded"
                  />
                  <span className={hasMedico ? "text-success-primary" : "text-tertiary"}>
                    Medico Final
                  </span>
                </label>
              </div>

              {canBeReady && !isReady && (
                <div className="flex justify-end mt-3">
                  <Button
                    size="sm"
                    color="primary"
                    onClick={() =>
                      updatePhaseStatus.mutate({
                        id: video.id,
                        phaseStatus: "PRONTO" as any,
                      })
                    }
                    isDisabled={updatePhaseStatus.isPending}
                  >
                    Marcar Pronto
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
            {advancePhase.isPending ? "Avancando..." : "Avancar para Fase 6"}
          </Button>
        </div>
      )}

      {regressionVideo && (
        <VideoRegressionDialog
          video={regressionVideo}
          isOpen={!!regressionVideo}
          onClose={() => setRegressionVideo(null)}
          onRefresh={onRefresh}
        />
      )}
    </div>
  );
}
