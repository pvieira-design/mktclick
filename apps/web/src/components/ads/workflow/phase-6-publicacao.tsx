"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Button } from "@/components/base/buttons/button";
import { Input } from "@/components/base/input/input";
import { useAdPermission } from "@/hooks/use-ad-permission";
import { DeliverableList } from "../deliverable/deliverable-list";
import { NomenclaturaPreview } from "../nomenclatura/nomenclatura-preview";
import { NomenclaturaEditor } from "../nomenclatura/nomenclatura-editor";
import { NomenclaturaCopy } from "../nomenclatura/nomenclatura-copy";
import { trpc } from "@/utils/trpc";
import { CheckCircle } from "@untitledui/icons";

interface Phase6PublicacaoProps {
  project: any;
  onRefresh: () => void;
}

export function Phase6Publicacao({ project, onRefresh }: Phase6PublicacaoProps) {
  const queryClient = useQueryClient();
  const canAprovacaoFinal = useAdPermission("aprovacao_final");
  const canNomenclatura = useAdPermission("nomenclatura");

  const approvePhase6 = useMutation({
    ...trpc.adVideo.approvePhase6.mutationOptions(),
    onSuccess: () => {
      toast.success("Video aprovado! AD numbers atribuidos");
      queryClient.invalidateQueries({ queryKey: [["adProject"]] });
      onRefresh();
    },
    onError: (err: any) => toast.error(err.message || "Erro ao aprovar"),
  });

  const setLinkAnuncio = useMutation({
    ...trpc.adVideo.setLinkAnuncio.mutationOptions(),
    onSuccess: () => {
      toast.success("Link atualizado");
      queryClient.invalidateQueries({ queryKey: [["adProject"]] });
      onRefresh();
    },
    onError: (err: any) => toast.error(err.message || "Erro ao atualizar link"),
  });

  const updatePhaseStatus = useMutation({
    ...trpc.adVideo.updatePhaseStatus.mutationOptions(),
    onSuccess: () => {
      toast.success("Video marcado como publicado!");
      queryClient.invalidateQueries({ queryKey: [["adProject"]] });
      onRefresh();
    },
    onError: (err: any) => toast.error(err.message || "Erro ao atualizar status"),
  });

  const regenerateNomenclatura = useMutation({
    ...trpc.adDeliverable.regenerateNomenclatura.mutationOptions(),
    onSuccess: () => {
      toast.success("Nomenclatura regenerada");
      queryClient.invalidateQueries({ queryKey: [["adProject"]] });
      onRefresh();
    },
    onError: (err: any) => toast.error(err.message || "Erro ao regenerar"),
  });

  const videosPublicados = project.videos.filter(
    (v: any) => v.phaseStatus === "PUBLICADO"
  ).length;

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-primary">
          Fase 6: Aprovacao & Publicacao
        </h3>
        <p className="text-sm text-tertiary mt-1">
          Progresso: {videosPublicados}/{project.videos.length} videos publicados
        </p>
      </div>

      <div className="space-y-4">
        {project.videos.map((video: any, index: number) => (
          <VideoPublicacaoCard
            key={video.id}
            video={video}
            index={index}
            canAprovacaoFinal={canAprovacaoFinal}
            canNomenclatura={canNomenclatura}
            onApprove={() => approvePhase6.mutate({ id: video.id })}
            onSetLink={(link: string) =>
              setLinkAnuncio.mutate({ id: video.id, linkAnuncio: link })
            }
            onMarkPublished={() =>
              updatePhaseStatus.mutate({
                id: video.id,
                phaseStatus: "PUBLICADO" as any,
              })
            }
            onRegenerateNomenclatura={() =>
              regenerateNomenclatura.mutate({ videoId: video.id })
            }
            onRefresh={onRefresh}
            isPending={
              approvePhase6.isPending ||
              setLinkAnuncio.isPending ||
              updatePhaseStatus.isPending
            }
            isApprovePending={approvePhase6.isPending}
            isPublishPending={updatePhaseStatus.isPending}
          />
        ))}
      </div>
    </div>
  );
}

function VideoPublicacaoCard({
  video,
  index,
  canAprovacaoFinal,
  canNomenclatura,
  onApprove,
  onSetLink,
  onMarkPublished,
  onRegenerateNomenclatura,
  onRefresh,
  isPending,
  isApprovePending,
  isPublishPending,
}: {
  video: any;
  index: number;
  canAprovacaoFinal: boolean;
  canNomenclatura: boolean;
  onApprove: () => void;
  onSetLink: (link: string) => void;
  onMarkPublished: () => void;
  onRegenerateNomenclatura: () => void;
  onRefresh: () => void;
  isPending: boolean;
  isApprovePending: boolean;
  isPublishPending: boolean;
}) {
  const [linkInput, setLinkInput] = useState(video.linkAnuncio || "");

  const isPendente = video.phaseStatus === "PENDENTE";
  const isAprovado = video.phaseStatus === "APROVADO";
  const isNomenclatura = video.phaseStatus === "NOMENCLATURA";
  const isPublicado = video.phaseStatus === "PUBLICADO";

  const hasAdNumbers = video.deliverables?.some((d: any) => d.adNumber);

  const borderColor = isPublicado
    ? "border-success-primary"
    : isAprovado || isNomenclatura
      ? "border-brand-primary"
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
        {isPublicado && (
          <span className="flex items-center gap-1 text-xs font-medium text-success-primary">
            <CheckCircle className="h-4 w-4" /> Publicado
          </span>
        )}
      </div>

      {/* Sub-etapa 6A: Aprovacao */}
      {isPendente && (
        <div className="space-y-3">
          <p className="text-sm text-tertiary">
            Aguardando aprovacao final
          </p>
          <DeliverableList
            videoId={video.id}
            deliverables={video.deliverables || []}
            canEdit={false}
            canAddMore={false}
            onRefresh={onRefresh}
          />
          {canAprovacaoFinal && (
            <Button
              color="primary"
              onClick={onApprove}
              isDisabled={isPending}
            >
              {isApprovePending ? "Aprovando..." : "Aprovar e Atribuir AD Numbers"}
            </Button>
          )}
        </div>
      )}

      {/* Sub-etapa 6B: Nomenclatura */}
      {(isAprovado || isNomenclatura) && (
        <div className="space-y-4">
          <p className="text-xs text-brand-primary font-medium">
            Sub-etapa: Nomenclatura
          </p>

          {video.deliverables?.map((deliverable: any) => (
            <div
              key={deliverable.id}
              className="rounded-lg bg-secondary p-3 space-y-2"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-primary">
                  HK{deliverable.hookNumber}
                  {deliverable.adNumber && (
                    <span className="ml-2 font-mono">
                      AD{String(deliverable.adNumber).padStart(4, "0")}
                    </span>
                  )}
                </span>
                <NomenclaturaCopy deliverable={deliverable} />
              </div>

              <NomenclaturaPreview
                nomenclatura={
                  deliverable.nomenclaturaEditada ||
                  deliverable.nomenclaturaGerada ||
                  ""
                }
              />

              {canNomenclatura && (
                <NomenclaturaEditor
                  deliverable={deliverable}
                  onRefresh={onRefresh}
                />
              )}
            </div>
          ))}

          <div className="flex gap-2">
            <Button
              size="sm"
              color="secondary"
              onClick={onRegenerateNomenclatura}
              isDisabled={isPending}
            >
              Regenerar Nomenclatura
            </Button>
          </div>

          <div className="pt-3 border-t border-secondary space-y-3">
            <Input
              label="Link Meta Ads"
              value={linkInput}
              onChange={(v: string) => setLinkInput(v)}
              placeholder="https://business.facebook.com/ads/..."
            />
            <div className="flex gap-2">
              <Button
                size="sm"
                color="secondary"
                onClick={() => onSetLink(linkInput)}
                isDisabled={isPending || !linkInput}
              >
                Salvar Link
              </Button>
              {video.linkAnuncio && (
                <Button
                  size="sm"
                  color="primary"
                  onClick={onMarkPublished}
                  isDisabled={isPending}
                >
                  {isPublishPending ? "Publicando..." : "Marcar como Publicado"}
                </Button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Sub-etapa 6C: Publicado (read-only) */}
      {isPublicado && (
        <div className="space-y-3">
          {video.deliverables?.map((deliverable: any) => (
            <div
              key={deliverable.id}
              className="flex items-center gap-3 rounded-lg bg-success-secondary p-3"
            >
              <span className="text-xs font-bold text-success-primary">
                AD{String(deliverable.adNumber).padStart(4, "0")}
              </span>
              <span className="text-xs font-mono text-tertiary truncate flex-1">
                {deliverable.nomenclaturaEditada ||
                  deliverable.nomenclaturaGerada}
              </span>
              <NomenclaturaCopy deliverable={deliverable} />
            </div>
          ))}
          {video.linkAnuncio && (
            <a
              href={video.linkAnuncio}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-brand-primary hover:underline"
            >
              {video.linkAnuncio}
            </a>
          )}
        </div>
      )}
    </div>
  );
}
