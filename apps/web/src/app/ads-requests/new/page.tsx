"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/base/buttons/button";
import { Input } from "@/components/base/input/input";
import { Select } from "@/components/base/select/select";
import { TextArea } from "@/components/base/textarea/textarea";
import { AdVideoForm, type VideoFormData } from "@/components/ads/ad-video-form";
import { trpc } from "@/utils/trpc";
import { ArrowLeft, Plus } from "@untitledui/icons";
import { toast } from "sonner";
import Link from "next/link";

export default function NewAdProjectPage() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const [title, setTitle] = useState("");
  const [originId, setOriginId] = useState("");
  const [briefing, setBriefing] = useState("");
  const [deadline, setDeadline] = useState("");
  const [priority, setPriority] = useState("");
  const [videos, setVideos] = useState<VideoFormData[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: adTypes } = useQuery(trpc.adProject.listTypes.queryOptions());
  const { data: originsData } = useQuery(trpc.origin.list.queryOptions());

  const createProject = useMutation(trpc.adProject.create.mutationOptions());
  const createVideo = useMutation(trpc.adVideo.create.mutationOptions());
  const submitProject = useMutation(trpc.adProject.submit.mutationOptions());

  const defaultAdTypeId = adTypes?.[0]?.id || "";

  const addVideo = () => {
    setVideos([...videos, { nomeDescritivo: "", tema: "", estilo: "", formato: "" }]);
  };

  const updateVideo = (index: number, video: VideoFormData) => {
    const updated = [...videos];
    updated[index] = video;
    setVideos(updated);
  };

  const removeVideo = (index: number) => {
    setVideos(videos.filter((_, i) => i !== index));
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!title || title.length < 3) newErrors.title = "Titulo deve ter pelo menos 3 caracteres";
    if (title.length > 200) newErrors.title = "Titulo deve ter no maximo 200 caracteres";
    if (!originId) newErrors.originId = "Selecione uma origin";
    if (!briefing || briefing.length < 10) newErrors.briefing = "Briefing deve ter pelo menos 10 caracteres";

    videos.forEach((video, i) => {
      if (!video.nomeDescritivo) newErrors[`video_${i}_nome`] = "Nome obrigatorio";
      if (!video.tema) newErrors[`video_${i}_tema`] = "Tema obrigatorio";
      if (!video.estilo) newErrors[`video_${i}_estilo`] = "Estilo obrigatorio";
      if (!video.formato) newErrors[`video_${i}_formato`] = "Formato obrigatorio";
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async (shouldSubmit: boolean) => {
    if (!validate()) return;
    if (shouldSubmit && videos.length === 0) {
      toast.error("Adicione pelo menos 1 entrega para submeter");
      return;
    }

    setIsSubmitting(true);
    try {
      const project = await createProject.mutateAsync({
        title,
        adTypeId: defaultAdTypeId,
        originId,
        briefing,
        deadline: deadline ? new Date(deadline) : undefined,
        priority: priority ? (priority as "LOW" | "MEDIUM" | "HIGH" | "URGENT") : undefined,
      });

      for (const video of videos) {
        await createVideo.mutateAsync({
          projectId: project.id,
          nomeDescritivo: video.nomeDescritivo,
          tema: video.tema as "GERAL" | "SONO" | "ANSIEDADE" | "DEPRESSAO" | "PESO" | "DISF" | "DORES" | "FOCO" | "PERFORM" | "PATOLOGIAS" | "TABACO",
          estilo: video.estilo as "UGC" | "EDUC" | "COMED" | "DEPOI" | "POV" | "STORY" | "MITOS" | "QA" | "ANTES" | "REVIEW" | "REACT" | "TREND" | "INST",
          formato: video.formato as "VID" | "MOT" | "IMG" | "CRSEL",
        });
      }

      if (shouldSubmit) {
        await submitProject.mutateAsync({ id: project.id });
        toast.success("Projeto submetido com sucesso!");
      } else {
        toast.success("Rascunho salvo com sucesso!");
      }

      queryClient.invalidateQueries({ queryKey: [["adProject"]] });
      router.push(`/ads-requests/${project.id}` as any);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erro ao criar projeto");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <div>
        <Link
          href={"/ads-requests" as any}
          className="inline-flex items-center gap-1.5 text-sm text-tertiary hover:text-primary mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar
        </Link>
        <h1 className="text-3xl font-bold tracking-tight text-primary">Novo Projeto de Ad</h1>
        <p className="text-tertiary">Crie um novo projeto de anuncio criativo.</p>
      </div>

      <div className="space-y-4 rounded-xl bg-primary p-6 shadow-xs ring-1 ring-border-secondary">
        <h2 className="text-lg font-semibold text-primary">Dados do Projeto</h2>

        <Input
          label="Titulo"
          placeholder="Ex: Campanha Ansiedade Janeiro"
          value={title}
          onChange={setTitle}
          size="md"
        />
        {errors.title && <p className="text-xs text-error-primary -mt-2">{errors.title}</p>}

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Select
              label="Tipo de Ad"
              aria-label="Tipo de Ad"
              selectedKey={defaultAdTypeId || undefined}
              isDisabled
              placeholder="Video Criativo"
            >
              {(adTypes || []).map((type) => (
                <Select.Item key={type.id} id={type.id} label={type.name} />
              ))}
            </Select>
          </div>

          <div>
            <Select
              label="Origin"
              aria-label="Origin"
              selectedKey={originId || undefined}
              onSelectionChange={(key) => key && setOriginId(String(key))}
              placeholder="Selecione a origin"
            >
              {(originsData?.items ?? []).map((origin) => (
                <Select.Item key={origin.id} id={origin.id} label={origin.name} />
              ))}
            </Select>
            {errors.originId && <p className="text-xs text-error-primary mt-1">{errors.originId}</p>}
          </div>
        </div>

        <TextArea
          label="Briefing"
          placeholder="Descreva o briefing do projeto..."
          value={briefing}
          onChange={setBriefing}
        />
        {errors.briefing && <p className="text-xs text-error-primary mt-1">{errors.briefing}</p>}

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Deadline"
            type="date"
            value={deadline}
            onChange={setDeadline}
            size="md"
          />

          <Select
            label="Prioridade"
            aria-label="Prioridade"
            selectedKey={priority || undefined}
            onSelectionChange={(key) => key && setPriority(String(key))}
            placeholder="Selecione (opcional)"
          >
            <Select.Item id="LOW" label="Baixa" />
            <Select.Item id="MEDIUM" label="Media" />
            <Select.Item id="HIGH" label="Alta" />
            <Select.Item id="URGENT" label="Urgente" />
          </Select>
        </div>
      </div>

      <div className="space-y-4 rounded-xl bg-primary p-6 shadow-xs ring-1 ring-border-secondary">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-primary">Entregas</h2>
            <p className="text-sm text-tertiary">Adicione as entregas do projeto</p>
          </div>
          <Button color="secondary" size="sm" iconLeading={Plus} onClick={addVideo}>
            Adicionar Entrega
          </Button>
        </div>

        {videos.length === 0 && (
          <div className="text-center py-8 text-tertiary">
            <p>Nenhuma entrega adicionada</p>
            <p className="text-sm text-quaternary mt-1">
              Clique em &quot;Adicionar Entrega&quot; para comecar
            </p>
          </div>
        )}

        <div className="space-y-3">
          {videos.map((video, index) => (
            <AdVideoForm
              key={index}
              index={index}
              video={video}
              onChange={updateVideo}
              onRemove={removeVideo}
            />
          ))}
        </div>
      </div>

      <div className="flex items-center justify-end gap-3 pb-8">
        <Button
          color="secondary"
          onClick={() => handleSave(false)}
          isDisabled={isSubmitting}
        >
          Salvar Rascunho
        </Button>
        <Button
          onClick={() => handleSave(true)}
          isDisabled={isSubmitting || videos.length === 0}
        >
          Submeter Projeto
        </Button>
      </div>
    </div>
  );
}
