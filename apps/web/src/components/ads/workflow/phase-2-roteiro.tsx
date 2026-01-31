"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Button } from "@/components/base/buttons/button";
import { Input } from "@/components/base/input/input";
import { Select } from "@/components/base/select/select";
import { TextArea } from "@/components/base/textarea/textarea";
import { useAdPermission } from "@/hooks/use-ad-permission";
import { VideoDetailCard } from "../video/video-detail-card";
import { TEMA_LABELS, ESTILO_LABELS, FORMATO_LABELS } from "../ad-constants";
import { trpc } from "@/utils/trpc";
import { CheckCircle, Plus } from "@untitledui/icons";

interface Phase2RoteiroProps {
  project: any;
  onRefresh: () => void;
}

export function Phase2Roteiro({ project, onRefresh }: Phase2RoteiroProps) {
  const queryClient = useQueryClient();
  const canValidateCompliance = useAdPermission("validar_roteiro_compliance");
  const canValidateMedico = useAdPermission("validar_roteiro_medico");
  const canWriteRoteiro = useAdPermission("escrever_roteiro");
  const [showAddVideo, setShowAddVideo] = useState(false);
  const [newVideo, setNewVideo] = useState({ nomeDescritivo: "", tema: "", estilo: "", formato: "" });

  const updateVideo = useMutation({
    ...trpc.adVideo.update.mutationOptions(),
    onSuccess: () => {
      toast.success("Roteiro atualizado");
      queryClient.invalidateQueries({ queryKey: [["adProject"]] });
      onRefresh();
    },
    onError: (err: any) => toast.error(err.message || "Erro ao atualizar"),
  });

  const markValidation = useMutation({
    ...trpc.adVideo.markValidation.mutationOptions(),
    onSuccess: () => {
      toast.success("Validacao atualizada");
      queryClient.invalidateQueries({ queryKey: [["adProject"]] });
      onRefresh();
    },
    onError: (err: any) => toast.error(err.message || "Erro ao validar"),
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
      toast.success("Avancando para Fase 3!");
      queryClient.invalidateQueries({ queryKey: [["adProject"]] });
      onRefresh();
    },
    onError: (err: any) => toast.error(err.message || "Erro ao avancar fase"),
  });

  const createVideo = useMutation({
    ...trpc.adVideo.create.mutationOptions(),
    onSuccess: () => {
      toast.success("Video adicionado");
      setShowAddVideo(false);
      setNewVideo({ nomeDescritivo: "", tema: "", estilo: "", formato: "" });
      queryClient.invalidateQueries({ queryKey: [["adProject"]] });
      onRefresh();
    },
    onError: (err: any) => toast.error(err.message || "Erro ao adicionar video"),
  });

  const handleNomeChange = (value: string) => {
    const sanitized = value
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, "")
      .slice(0, 25);
    setNewVideo((prev) => ({ ...prev, nomeDescritivo: sanitized }));
  };

  const videosReady = project.videos.filter(
    (v: any) => v.phaseStatus === "PRONTO"
  ).length;
  const allReady = videosReady === project.videos.length && project.videos.length > 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-primary">
            Fase 2: Roteiro & Validacao
          </h3>
          <p className="text-sm text-tertiary mt-1">
            Progresso: {videosReady}/{project.videos.length} videos prontos
          </p>
        </div>
        {project.status === "ACTIVE" && !showAddVideo && (
          <Button
            size="sm"
            color="secondary"
            iconLeading={Plus}
            onClick={() => setShowAddVideo(true)}
          >
            Adicionar Video
          </Button>
        )}
      </div>

      {showAddVideo && (
        <div className="rounded-lg ring-1 ring-border-secondary p-4 space-y-4">
          <h4 className="text-sm font-semibold text-primary">Novo Video</h4>
          <div>
            <Input
              label="Nome Descritivo"
              placeholder="Ex: ROTINACBDMUDOU"
              value={newVideo.nomeDescritivo}
              onChange={handleNomeChange}
              size="md"
            />
            <div className="flex items-center justify-between mt-1">
              <p className="text-xs text-quaternary">Apenas letras maiusculas e numeros</p>
              <p className="text-xs text-quaternary">{newVideo.nomeDescritivo.length}/25</p>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <Select
              label="Tema"
              aria-label="Tema do video"
              selectedKey={newVideo.tema || undefined}
              onSelectionChange={(value) => value && setNewVideo((prev) => ({ ...prev, tema: String(value) }))}
              placeholder="Selecione"
            >
              {Object.entries(TEMA_LABELS).map(([key, label]) => (
                <Select.Item key={key} id={key} label={label} />
              ))}
            </Select>
            <Select
              label="Estilo"
              aria-label="Estilo do video"
              selectedKey={newVideo.estilo || undefined}
              onSelectionChange={(value) => value && setNewVideo((prev) => ({ ...prev, estilo: String(value) }))}
              placeholder="Selecione"
            >
              {Object.entries(ESTILO_LABELS).map(([key, label]) => (
                <Select.Item key={key} id={key} label={label} />
              ))}
            </Select>
            <Select
              label="Formato"
              aria-label="Formato do video"
              selectedKey={newVideo.formato || undefined}
              onSelectionChange={(value) => value && setNewVideo((prev) => ({ ...prev, formato: String(value) }))}
              placeholder="Selecione"
            >
              {Object.entries(FORMATO_LABELS).map(([key, label]) => (
                <Select.Item key={key} id={key} label={label} />
              ))}
            </Select>
          </div>
          <div className="flex gap-2">
            <Button
              size="sm"
              color="primary"
              onClick={() =>
                createVideo.mutate({
                  projectId: project.id,
                  nomeDescritivo: newVideo.nomeDescritivo,
                  tema: newVideo.tema as any,
                  estilo: newVideo.estilo as any,
                  formato: newVideo.formato as any,
                })
              }
              isDisabled={!newVideo.nomeDescritivo || !newVideo.tema || !newVideo.estilo || !newVideo.formato || createVideo.isPending}
            >
              {createVideo.isPending ? "Salvando..." : "Salvar Video"}
            </Button>
            <Button
              size="sm"
              color="secondary"
              onClick={() => {
                setShowAddVideo(false);
                setNewVideo({ nomeDescritivo: "", tema: "", estilo: "", formato: "" });
              }}
            >
              Cancelar
            </Button>
          </div>
        </div>
      )}

      <div className="space-y-4">
        {project.videos.map((video: any, index: number) => (
          <VideoRoteiroCard
            key={video.id}
            video={video}
            index={index}
            canWriteRoteiro={canWriteRoteiro}
            canValidateCompliance={canValidateCompliance}
            canValidateMedico={canValidateMedico}
            onUpdateRoteiro={(roteiro: string) =>
              updateVideo.mutate({ id: video.id, roteiro })
            }
            onMarkValidation={(field: string, value: boolean) =>
              markValidation.mutate({
                id: video.id,
                field: field as any,
                value,
              })
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
            {advancePhase.isPending ? "Avancando..." : "Avancar para Fase 3"}
          </Button>
        </div>
      )}
    </div>
  );
}

function VideoRoteiroCard({
  video,
  index,
  canWriteRoteiro,
  canValidateCompliance,
  canValidateMedico,
  onUpdateRoteiro,
  onMarkValidation,
  onMarkReady,
  isPending,
}: {
  video: any;
  index: number;
  canWriteRoteiro: boolean;
  canValidateCompliance: boolean;
  canValidateMedico: boolean;
  onUpdateRoteiro: (roteiro: string) => void;
  onMarkValidation: (field: string, value: boolean) => void;
  onMarkReady: () => void;
  isPending: boolean;
}) {
  const [roteiro, setRoteiro] = useState(video.roteiro || "");
  const [isEditing, setIsEditing] = useState(false);

  const isReady = video.phaseStatus === "PRONTO";
  const hasCompliance = video.validacaoRoteiroCompliance;
  const hasMedico = video.validacaoRoteiroMedico;
  const canBeReady = video.roteiro && hasCompliance && hasMedico;

  const borderColor = isReady
    ? "border-success-primary"
    : video.phaseStatus === "EM_ANDAMENTO"
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
        {isReady && (
          <span className="flex items-center gap-1 text-xs font-medium text-success-primary">
            <CheckCircle className="h-4 w-4" /> Pronto
          </span>
        )}
      </div>

      <div className="space-y-3">
        <div>
          <label className="text-xs font-medium text-secondary block mb-1">
            Roteiro
          </label>
          {isEditing ? (
            <div className="space-y-2">
              <TextArea
                value={roteiro}
                onChange={(v: string) => setRoteiro(v)}
                rows={4}
                placeholder="Escreva o roteiro do video..."
              />
              <div className="flex gap-2">
                <Button
                  size="sm"
                  color="primary"
                  onClick={() => {
                    onUpdateRoteiro(roteiro);
                    setIsEditing(false);
                  }}
                  isDisabled={isPending}
                >
                  Salvar
                </Button>
                <Button
                  size="sm"
                  color="secondary"
                  onClick={() => {
                    setRoteiro(video.roteiro || "");
                    setIsEditing(false);
                  }}
                >
                  Cancelar
                </Button>
              </div>
            </div>
          ) : (
            <div>
              {video.roteiro ? (
                <p className="text-sm text-tertiary whitespace-pre-wrap rounded-lg bg-secondary p-3">
                  {video.roteiro}
                </p>
              ) : (
                <p className="text-sm text-quaternary italic">Nenhum roteiro</p>
              )}
              {canWriteRoteiro && !isReady && (
                <Button
                  size="sm"
                  color="secondary"
                  onClick={() => setIsEditing(true)}
                  className="mt-2"
                >
                  {video.roteiro ? "Editar Roteiro" : "Escrever Roteiro"}
                </Button>
              )}
            </div>
          )}
        </div>

        <div className="flex items-center gap-4 pt-2 border-t border-secondary">
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={hasCompliance}
              onChange={() =>
                canValidateCompliance &&
                !isReady &&
                onMarkValidation(
                  "validacaoRoteiroCompliance",
                  !hasCompliance
                )
              }
              disabled={!canValidateCompliance || isReady}
              className="h-4 w-4 rounded"
            />
            <span className={hasCompliance ? "text-success-primary" : "text-tertiary"}>
              Compliance
            </span>
          </label>

          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={hasMedico}
              onChange={() =>
                canValidateMedico &&
                !isReady &&
                onMarkValidation("validacaoRoteiroMedico", !hasMedico)
              }
              disabled={!canValidateMedico || isReady}
              className="h-4 w-4 rounded"
            />
            <span className={hasMedico ? "text-success-primary" : "text-tertiary"}>
              Medico
            </span>
          </label>

          {canBeReady && !isReady && (
            <Button size="sm" color="primary" onClick={onMarkReady} className="ml-auto">
              Marcar Pronto
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
