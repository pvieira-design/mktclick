"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { trpc } from "@/utils/trpc";
import { Button } from "@/components/base/buttons/button";
import { Input } from "@/components/base/input/input";
import { TextArea } from "@/components/base/textarea/textarea";
import { Select } from "@/components/base/select/select";
import { DatePicker } from "@/components/application/date-picker/date-picker";
import { SlideoutMenu } from "@/components/application/slideout-menus/slideout-menu";
import { FeaturedIcon } from "@/components/foundations/featured-icon/featured-icon";
import { DynamicFieldRenderer } from "@/components/request/dynamic-field-renderer";
import { CreatorParticipationSection, type CreatorParticipation } from "@/components/request/creator-participation-section";
import { FileAttachmentSection } from "@/components/request/file-attachment-section";
import { useContentTypes, useOrigins } from "@/hooks/use-metadata";
import { useFileUpload } from "@/hooks/use-file-upload";
import { toast } from "sonner";
import { Save01, X } from "@untitledui/icons";
import { getLocalTimeZone } from "@internationalized/date";
import type { DateValue } from "react-aria-components";

interface NewRequestDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type Priority = "LOW" | "MEDIUM" | "HIGH" | "URGENT";
type Patologia = "INSONIA" | "ANSIEDADE" | "DOR" | "ESTRESSE" | "INFLAMACAO" | "OUTRO";

const priorityLabels: Record<Priority, string> = {
  LOW: "Baixa",
  MEDIUM: "Média",
  HIGH: "Alta",
  URGENT: "Urgente",
};

const patologiaLabels: Record<Patologia, string> = {
  INSONIA: "Insônia",
  ANSIEDADE: "Ansiedade",
  DOR: "Dor",
  ESTRESSE: "Estresse",
  INFLAMACAO: "Inflamação",
  OUTRO: "Outro",
};

export function NewRequestDrawer({ open, onOpenChange }: NewRequestDrawerProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { uploadFile } = useFileUpload();

  const { data: contentTypes, isLoading: loadingContentTypes } = useContentTypes();
  const { data: origins, isLoading: loadingOrigins } = useOrigins();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [contentTypeId, setContentTypeId] = useState("");
  const [originId, setOriginId] = useState("");
  const [priority, setPriority] = useState<Priority>("MEDIUM");
  const [deadline, setDeadline] = useState<DateValue | null>(null);
  const [patologia, setPatologia] = useState<Patologia | "">("");
  const [fieldValues, setFieldValues] = useState<Record<string, any>>({});
  const [creatorParticipations, setCreatorParticipations] = useState<CreatorParticipation[]>([]);
  const [selectedFileIds, setSelectedFileIds] = useState<string[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!open) {
      setTitle("");
      setDescription("");
      setContentTypeId("");
      setOriginId("");
      setPriority("MEDIUM");
      setDeadline(null);
      setPatologia("");
      setFieldValues({});
      setCreatorParticipations([]);
      setSelectedFileIds([]);
      setErrors({});
    }
  }, [open]);

  const { data: fieldsData, isLoading: loadingFields } = useQuery({
    ...trpc.contentTypeField.listByContentType.queryOptions({
      contentTypeId: contentTypeId,
    }),
    enabled: !!contentTypeId,
  });

  const createMutation = useMutation({
    ...(trpc.request.create.mutationOptions as any)(),
    onSuccess: (data: { id: string }) => {
      toast.success("Request criado com sucesso!");
      queryClient.invalidateQueries({ queryKey: [["request"]] });
      onOpenChange(false);
      router.push(`/requests/${data.id}` as any);
    },
    onError: (error: Error) => {
      toast.error(error.message || "Erro ao criar request");
    },
  });

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!title || title.length < 3) {
      newErrors.title = "Título deve ter pelo menos 3 caracteres";
    }
    if (title.length > 200) {
      newErrors.title = "Título deve ter no máximo 200 caracteres";
    }
    if (!description || description.length < 10) {
      newErrors.description = "Descrição deve ter pelo menos 10 caracteres";
    }
    if (description.length > 5000) {
      newErrors.description = "Descrição deve ter no máximo 5000 caracteres";
    }
    if (!contentTypeId) {
      newErrors.contentTypeId = "Tipo de conteúdo é obrigatório";
    }
    if (!originId) {
      newErrors.originId = "Origem é obrigatória";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleFieldChange = (fieldName: string, value: any) => {
    setFieldValues((prev) => ({ ...prev, [fieldName]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    const validParticipations = creatorParticipations.filter((p) => p.creatorId);

    const payload = {
      title,
      description,
      contentTypeId,
      originId,
      priority,
      deadline: deadline ? deadline.toDate(getLocalTimeZone()) : undefined,
      patologia: patologia || undefined,
      fieldValues: Object.keys(fieldValues).length > 0 ? fieldValues : undefined,
      creatorParticipations: validParticipations.length > 0 ? validParticipations : undefined,
      fileIds: selectedFileIds.length > 0 ? selectedFileIds : undefined,
    };

    (createMutation.mutate as any)(payload);
  };

  const isValid = title.trim().length >= 3 && description.trim().length >= 10 && contentTypeId && originId;

  return (
    <SlideoutMenu isOpen={open} onOpenChange={onOpenChange} className="!max-w-[800px]">
      {({ close }) => (
        <>
          <div className="relative z-1 flex items-start justify-between w-full px-4 pt-6 md:px-6">
            <div className="flex items-start gap-4">
              <button
                type="button"
                onClick={close}
                className="cursor-pointer hover:opacity-80 transition-opacity focus:outline-none"
                aria-label="Fechar"
              >
                <FeaturedIcon icon={X} theme="light" color="gray" size="md" />
              </button>
              <div>
                <h2 className="text-lg font-semibold text-primary">Novo Request</h2>
                <p className="text-sm text-tertiary mt-1">
                  Crie uma nova solicitação de conteúdo.
                </p>
              </div>
            </div>
          </div>

          <SlideoutMenu.Content>
            <form id="new-request-form" onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-primary border-b border-secondary pb-2">
                  Informações Básicas
                </h3>

                <Input
                  label="Título *"
                  value={title}
                  onChange={setTitle}
                  placeholder="Digite o título do request"
                  isRequired
                  isInvalid={!!errors.title}
                  hint={errors.title}
                />

                <TextArea
                  label="Descrição *"
                  value={description}
                  onChange={setDescription}
                  placeholder="Descreva o request em detalhes (mínimo 10 caracteres)"
                  rows={4}
                  isRequired
                  isInvalid={!!errors.description}
                  hint={errors.description || `${description.length}/5000 caracteres`}
                />

                <div className="grid grid-cols-2 gap-4">
                  <Select
                    label="Tipo de Conteúdo *"
                    selectedKey={contentTypeId || null}
                    onSelectionChange={(key) => {
                      setContentTypeId((key as string) || "");
                      setFieldValues({});
                    }}
                    isDisabled={loadingContentTypes}
                    placeholder={loadingContentTypes ? "Carregando..." : "Selecione o tipo"}
                    isInvalid={!!errors.contentTypeId}
                    hint={errors.contentTypeId}
                  >
                    {contentTypes?.map((ct) => (
                      <Select.Item key={ct.id} id={ct.id} label={ct.name} />
                    ))}
                  </Select>

                  <Select
                    label="Origem *"
                    selectedKey={originId || null}
                    onSelectionChange={(key) => setOriginId((key as string) || "")}
                    isDisabled={loadingOrigins}
                    placeholder={loadingOrigins ? "Carregando..." : "Selecione a origem"}
                    isInvalid={!!errors.originId}
                    hint={errors.originId}
                  >
                    {origins?.map((origin) => (
                      <Select.Item key={origin.id} id={origin.id} label={origin.name} />
                    ))}
                  </Select>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-primary border-b border-secondary pb-2">
                  Detalhes Adicionais
                </h3>

                <div className="grid grid-cols-2 gap-4">
                  <Select
                    label="Prioridade"
                    selectedKey={priority}
                    onSelectionChange={(key) => setPriority(key as Priority)}
                    placeholder="Selecione a prioridade"
                  >
                    {(Object.entries(priorityLabels) as [Priority, string][]).map(
                      ([value, label]) => (
                        <Select.Item key={value} id={value} label={label} />
                      )
                    )}
                  </Select>

                  <div>
                    <label className="text-sm font-medium text-secondary mb-1.5 block">
                      Prazo (opcional)
                    </label>
                    <DatePicker value={deadline} onChange={setDeadline} />
                  </div>
                </div>

                <Select
                  label="Patologia (opcional)"
                  selectedKey={patologia || null}
                  onSelectionChange={(key) => setPatologia((key as Patologia) || "")}
                  placeholder="Selecione a patologia"
                >
                  <Select.Item id="" label="Nenhuma" />
                  {(Object.entries(patologiaLabels) as [Patologia, string][]).map(
                    ([value, label]) => (
                      <Select.Item key={value} id={value} label={label} />
                    )
                  )}
                </Select>
              </div>

              {contentTypeId && (
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold text-primary border-b border-secondary pb-2">
                    Campos Personalizados
                  </h3>

                  {loadingFields ? (
                    <div className="text-sm text-tertiary">Carregando campos...</div>
                  ) : fieldsData?.items && fieldsData.items.length > 0 ? (
                    <DynamicFieldRenderer
                      fields={fieldsData.items as any}
                      values={fieldValues}
                      onChange={handleFieldChange}
                      onFileUpload={uploadFile}
                      disabled={createMutation.isPending}
                    />
                  ) : (
                    <div className="text-sm text-tertiary">
                      Nenhum campo personalizado configurado para este tipo de conteúdo.
                    </div>
                  )}
                </div>
              )}

              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-primary border-b border-secondary pb-2">
                  Referências Visuais
                </h3>

                <FileAttachmentSection
                  selectedFileIds={selectedFileIds}
                  onSelectedFileIdsChange={setSelectedFileIds}
                  disabled={createMutation.isPending}
                />
              </div>

              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-primary border-b border-secondary pb-2">
                  Criadores
                </h3>

                <CreatorParticipationSection
                  participations={creatorParticipations}
                  onChange={setCreatorParticipations}
                  disabled={createMutation.isPending}
                />
              </div>
            </form>
          </SlideoutMenu.Content>

          <SlideoutMenu.Footer className="flex items-center justify-end gap-3">
            <Button type="button" color="secondary" onClick={close}>
              Cancelar
            </Button>
            <Button
              type="submit"
              form="new-request-form"
              color="primary"
              isDisabled={!isValid || createMutation.isPending}
              isLoading={createMutation.isPending}
              iconLeading={Save01}
            >
              Criar Request
            </Button>
          </SlideoutMenu.Footer>
        </>
      )}
    </SlideoutMenu>
  );
}
