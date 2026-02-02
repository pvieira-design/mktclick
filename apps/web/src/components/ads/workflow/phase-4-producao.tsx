"use client";

import { useState, useCallback } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Button } from "@/components/base/buttons/button";
import { useAdPermission } from "@/hooks/use-ad-permission";
import { useFileUpload } from "@/hooks/use-file-upload";
import { DeliverableList } from "../deliverable/deliverable-list";
import { FileUpload, getReadableFileSize } from "@/components/application/file-upload/file-upload-base";
import { trpc } from "@/utils/trpc";
import { CheckCircle, Image01, Trash01 } from "@untitledui/icons";

interface Phase4ProducaoProps {
  project: any;
  onRefresh: () => void;
}

export function Phase4Producao({ project, onRefresh }: Phase4ProducaoProps) {
  const queryClient = useQueryClient();
  const canProducao = useAdPermission("producao_entrega");
  const { uploadFileWithMetadata, isUploading } = useFileUpload();
  const [isUploadingPack, setIsUploadingPack] = useState(false);

  const { data: packImages } = useQuery({
    ...trpc.adProject.listPackImages.queryOptions({ projectId: project.id }),
    enabled: !!project.incluiPackFotos,
  });

  const uploadPackImage = useMutation({
    ...trpc.adProject.uploadPackImage.mutationOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [["adProject"]] });
      onRefresh();
      toast.success("Foto adicionada ao pack!");
    },
    onError: (err: any) => toast.error(err.message || "Erro ao adicionar foto"),
  });

  const deletePackImage = useMutation({
    ...trpc.adProject.deletePackImage.mutationOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [["adProject"]] });
      onRefresh();
      toast.success("Foto removida do pack");
    },
    onError: (err: any) => toast.error(err.message || "Erro ao remover foto"),
  });

  const handlePackUpload = useCallback(
    async (files: FileList) => {
      setIsUploadingPack(true);
      try {
        for (let i = 0; i < files.length; i++) {
          const file = files[i];
          if (!file) continue;
          const result = await uploadFileWithMetadata(file);
          if (result?.id) {
            await uploadPackImage.mutateAsync({
              projectId: project.id,
              fileId: result.id,
            });
          }
        }
      } catch {
        toast.error("Erro ao enviar fotos");
      } finally {
        setIsUploadingPack(false);
      }
    },
    [project.id, uploadFileWithMetadata, uploadPackImage]
  );

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

      {project.incluiPackFotos && (
        <div className="space-y-4 pt-4 border-t border-secondary">
          <div className="flex items-center gap-2">
            <Image01 className="h-5 w-5 text-tertiary" />
            <h3 className="text-lg font-semibold text-primary">Pack de Fotos</h3>
            {packImages && packImages.length > 0 && (
              <span className="text-xs text-tertiary">
                ({packImages.length} {packImages.length === 1 ? "foto" : "fotos"})
              </span>
            )}
          </div>

          {packImages && packImages.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {packImages.map((img: any) => (
                <div
                  key={img.id}
                  className="group relative rounded-lg overflow-hidden bg-secondary ring-1 ring-border-secondary"
                >
                  {img.file.mimeType?.startsWith("image/") ? (
                    <img
                      src={img.file.url}
                      alt={img.file.name}
                      className="aspect-square w-full object-cover"
                    />
                  ) : (
                    <div className="aspect-square w-full flex items-center justify-center">
                      <Image01 className="h-8 w-8 text-quaternary" />
                    </div>
                  )}
                  <div className="px-2 py-1.5">
                    <p className="text-xs font-medium text-primary truncate">
                      {img.file.name}
                    </p>
                    <p className="text-[10px] text-tertiary">
                      {getReadableFileSize(img.file.size)}
                    </p>
                  </div>
                  {canProducao && (
                    <button
                      type="button"
                      onClick={() => deletePackImage.mutate({ id: img.id })}
                      className="absolute top-1.5 right-1.5 rounded-md bg-primary/80 p-1 text-error-primary opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer hover:bg-primary"
                    >
                      <Trash01 className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}

          {canProducao && (
            <FileUpload.Root>
              <FileUpload.DropZone
                hint="Imagens JPG, PNG, WebP (max. 50MB cada)"
                accept="image/*"
                maxSize={50 * 1024 * 1024}
                allowsMultiple
                isDisabled={isUploadingPack || isUploading}
                onDropFiles={handlePackUpload}
                onSizeLimitExceed={() =>
                  toast.error("Arquivo muito grande. Maximo: 50MB")
                }
              />
            </FileUpload.Root>
          )}

          {isUploadingPack && (
            <p className="text-sm text-tertiary text-center py-2">
              Enviando fotos...
            </p>
          )}
        </div>
      )}

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
