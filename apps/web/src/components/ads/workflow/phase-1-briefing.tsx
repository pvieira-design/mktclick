"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Button } from "@/components/base/buttons/button";
import { Input } from "@/components/base/input/input";
import { Select } from "@/components/base/select/select";
import { TextArea } from "@/components/base/textarea/textarea";
import { useAdPermission } from "@/hooks/use-ad-permission";
import { useCurrentUser } from "@/hooks/use-current-user";
import { VideoDetailCard } from "../video/video-detail-card";
import { TEMA_LABELS, ESTILO_LABELS } from "../ad-constants";
import { trpc } from "@/utils/trpc";
import { Plus } from "@untitledui/icons";

interface Phase1BriefingProps {
  project: any;
  onRefresh: () => void;
}

export function Phase1Briefing({ project, onRefresh }: Phase1BriefingProps) {
  const queryClient = useQueryClient();
  const { user } = useCurrentUser();
  const canApproveBriefing = useAdPermission("aprovar_briefing");
  const [briefing, setBriefing] = useState(project.briefing || "");
  const [isEditing, setIsEditing] = useState(false);
  const [showAddVideo, setShowAddVideo] = useState(false);
  const [newVideo, setNewVideo] = useState({ nomeDescritivo: "", tema: "", estilo: "" });

  const updateProject = useMutation({
    ...trpc.adProject.update.mutationOptions(),
    onSuccess: () => {
      toast.success("Briefing atualizado");
      setIsEditing(false);
      queryClient.invalidateQueries({ queryKey: [["adProject"]] });
      onRefresh();
    },
    onError: (err: any) => toast.error(err.message || "Erro ao atualizar"),
  });

  const advancePhase = useMutation({
    ...trpc.adProject.advancePhase.mutationOptions(),
    onSuccess: () => {
      toast.success("Briefing aprovado! Avancando para Fase 2");
      queryClient.invalidateQueries({ queryKey: [["adProject"]] });
      onRefresh();
    },
    onError: (err: any) => toast.error(err.message || "Erro ao avancar fase"),
  });

  const createVideo = useMutation({
    ...trpc.adVideo.create.mutationOptions(),
    onSuccess: () => {
       toast.success("Entrega adicionada");
       setShowAddVideo(false);
       setNewVideo({ nomeDescritivo: "", tema: "", estilo: "" });
       queryClient.invalidateQueries({ queryKey: [["adProject"]] });
       onRefresh();
    },
    onError: (err: any) => toast.error(err.message || "Erro ao adicionar entrega"),
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

  const isDraft = project.status === "DRAFT";
  const canEdit = isDraft || project.currentPhase <= 2;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-primary">
          Fase 1: Briefing
        </h3>
      </div>

      <div className="space-y-4">
        <div>
          <label className="text-sm font-medium text-secondary mb-1 block">
            Briefing do Projeto
          </label>
          {isEditing ? (
            <div className="space-y-2">
              <TextArea
                value={briefing}
                onChange={(v: string) => setBriefing(v)}
                rows={6}
                placeholder="Descreva o briefing do projeto..."
              />
              <div className="flex gap-2">
                <Button
                  size="sm"
                  color="primary"
                  onClick={() =>
                    updateProject.mutate({ id: project.id, briefing })
                  }
                  isDisabled={updateProject.isPending}
                >
                  Salvar
                </Button>
                <Button
                  size="sm"
                  color="secondary"
                  onClick={() => {
                    setBriefing(project.briefing || "");
                    setIsEditing(false);
                  }}
                >
                  Cancelar
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <p className="text-sm text-tertiary whitespace-pre-wrap rounded-lg bg-secondary p-4">
                {project.briefing || "Nenhum briefing definido"}
              </p>
              {canEdit && (
                <Button
                  size="sm"
                  color="secondary"
                  onClick={() => setIsEditing(true)}
                >
                  Editar Briefing
                </Button>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-semibold text-primary">
            Entregas no Projeto ({project.videos.length})
          </h4>
          {(project.status === "DRAFT" || project.status === "ACTIVE") && !showAddVideo && (
            <Button
              size="sm"
              color="secondary"
              iconLeading={Plus}
              onClick={() => setShowAddVideo(true)}
            >
              Adicionar Entrega
            </Button>
          )}
        </div>

        {showAddVideo && (
          <div className="rounded-lg ring-1 ring-border-secondary p-4 space-y-4">
            <h4 className="text-sm font-semibold text-primary">Nova Entrega</h4>
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
            <div className="grid grid-cols-2 gap-3">
               <Select
                 label="Tema"
                 aria-label="Tema da entrega"
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
                 aria-label="Estilo da entrega"
                 selectedKey={newVideo.estilo || undefined}
                 onSelectionChange={(value) => value && setNewVideo((prev) => ({ ...prev, estilo: String(value) }))}
                 placeholder="Selecione"
               >
                 {Object.entries(ESTILO_LABELS).map(([key, label]) => (
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
                     formato: "VID" as const,
                   })
                 }
                 isDisabled={!newVideo.nomeDescritivo || !newVideo.tema || !newVideo.estilo || createVideo.isPending}
               >
                {createVideo.isPending ? "Salvando..." : "Salvar Entrega"}
              </Button>
               <Button
                 size="sm"
                 color="secondary"
                 onClick={() => {
                   setShowAddVideo(false);
                   setNewVideo({ nomeDescritivo: "", tema: "", estilo: "" });
                 }}
               >
                Cancelar
              </Button>
            </div>
          </div>
        )}

        {project.videos.length === 0 ? (
          <p className="text-sm text-tertiary py-4 text-center">
            Nenhuma entrega adicionada
          </p>
        ) : (
          <div className="space-y-3">
            {project.videos.map((video: any, index: number) => (
              <VideoDetailCard
                key={video.id}
                video={video}
                index={index}
                project={project}
                onRefresh={onRefresh}
              />
            ))}
          </div>
        )}
      </div>

      {canApproveBriefing && project.status === "ACTIVE" && project.videos.length > 0 && (
        <div className="flex justify-end pt-4 border-t border-secondary">
          <Button
            color="primary"
            onClick={() => advancePhase.mutate({ id: project.id })}
            isDisabled={advancePhase.isPending}
          >
            {advancePhase.isPending ? "Aprovando..." : "Aprovar Briefing e Avancar"}
          </Button>
        </div>
      )}
    </div>
  );
}
