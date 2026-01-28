"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { DynamicFieldRenderer } from "@/components/request/dynamic-field-renderer";
import { CreatorParticipationSection, type CreatorParticipation } from "@/components/request/creator-participation-section";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Button } from "@/components/base/buttons/button";
import { Input } from "@/components/base/input/input";
import { TextArea } from "@/components/base/textarea/textarea";
import { Select } from "@/components/base/select/select";
import { Input as ShadcnInput } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/utils/trpc";
import { ArrowLeft } from "@untitledui/icons";
import { useContentTypes, useOrigins } from "@/hooks/use-metadata";

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

interface CreateRequestPayload {
  title: string;
  description: string;
  contentTypeId: string;
  originId: string;
  priority?: Priority;
  deadline?: Date;
  patologia?: Patologia;
  fieldValues?: Record<string, any>;
  creatorParticipations?: Array<{
    creatorId: string;
    participationDate: Date;
    location?: string;
    valuePaid: number;
    notes?: string;
  }>;
}

export default function NewRequestPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  
  const { data: contentTypes, isLoading: loadingContentTypes } = useContentTypes();
  const { data: origins, isLoading: loadingOrigins } = useOrigins();
  
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    contentTypeId: "",
    originId: "",
    priority: "MEDIUM" as Priority,
    deadline: "",
    patologia: "" as Patologia | "",
  });

  const { data: fieldsData, isLoading: loadingFields } = useQuery({
    ...trpc.contentTypeField.listByContentType.queryOptions({ 
      contentTypeId: formData.contentTypeId 
    }),
    enabled: !!formData.contentTypeId,
  });

  const [fieldValues, setFieldValues] = useState<Record<string, any>>({});

  const [creatorParticipations, setCreatorParticipations] = useState<CreatorParticipation[]>([]);

  const [errors, setErrors] = useState<Record<string, string>>({});

  const createMutation = useMutation({
    ...(trpc.request.create.mutationOptions as any)(),
    onSuccess: (data: { id: string }) => {
      toast.success("Request criado com sucesso!");
      queryClient.invalidateQueries({ queryKey: ["request", "list"] });
      router.push(`/requests/${data.id}` as any);
    },
    onError: (error: Error) => {
      toast.error(error.message || "Erro ao criar request");
    },
  });

  const validate = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.title || formData.title.length < 3) {
      newErrors.title = "Título deve ter pelo menos 3 caracteres";
    }
    if (formData.title.length > 200) {
      newErrors.title = "Título deve ter no máximo 200 caracteres";
    }
    if (!formData.description || formData.description.length < 10) {
      newErrors.description = "Descrição deve ter pelo menos 10 caracteres";
    }
    if (formData.description.length > 5000) {
      newErrors.description = "Descrição deve ter no máximo 5000 caracteres";
    }
    if (!formData.contentTypeId) {
      newErrors.contentTypeId = "Tipo de conteúdo é obrigatório";
    }
    if (!formData.originId) {
      newErrors.originId = "Origem é obrigatória";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleFieldChange = (fieldName: string, value: any) => {
    setFieldValues(prev => ({ ...prev, [fieldName]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validate()) return;

    const validParticipations = creatorParticipations.filter(p => p.creatorId);

    const payload: CreateRequestPayload = {
      title: formData.title,
      description: formData.description,
      contentTypeId: formData.contentTypeId,
      originId: formData.originId,
      priority: formData.priority,
      deadline: formData.deadline ? new Date(formData.deadline) : undefined,
      patologia: formData.patologia ? formData.patologia as Patologia : undefined,
      fieldValues: Object.keys(fieldValues).length > 0 ? fieldValues : undefined,
      creatorParticipations: validParticipations.length > 0 ? validParticipations : undefined,
    };

    createMutation.mutate(payload as any);
  };

  return (
    <div className="container mx-auto p-6 max-w-3xl">
      <div className="mb-6">
        <Link href="/dashboard">
          <Button color="tertiary" size="sm" iconLeading={ArrowLeft}>
            Voltar
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Novo Request</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Input
                label="Título *"
                value={formData.title}
                onChange={(value) => setFormData({ ...formData, title: value })}
                placeholder="Digite o título do request"
                isInvalid={!!errors.title}
                hint={errors.title}
              />
            </div>

            <div>
              <TextArea
                label="Descrição *"
                value={formData.description}
                onChange={(value) => setFormData({ ...formData, description: value })}
                placeholder="Descreva o request em detalhes (mínimo 10 caracteres)"
                rows={5}
                isInvalid={!!errors.description}
                hint={errors.description || `${formData.description.length}/5000 caracteres`}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Select
                  label="Tipo de Conteúdo *"
                  selectedKey={formData.contentTypeId}
                  onSelectionChange={(key) => setFormData({ ...formData, contentTypeId: key as string || "" })}
                  isDisabled={loadingContentTypes}
                  placeholder={loadingContentTypes ? "Carregando..." : "Selecione o tipo"}
                  isInvalid={!!errors.contentTypeId}
                  hint={errors.contentTypeId}
                >
                  {contentTypes?.map((ct) => (
                    <Select.Item key={ct.id} id={ct.id} label={ct.name} />
                  ))}
                </Select>
              </div>

              <div>
                <Select
                  label="Origem *"
                  selectedKey={formData.originId}
                  onSelectionChange={(key) => setFormData({ ...formData, originId: key as string || "" })}
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Select
                  label="Prioridade"
                  selectedKey={formData.priority}
                  onSelectionChange={(key) => setFormData({ ...formData, priority: key as Priority })}
                  placeholder="Selecione a prioridade"
                >
                  {(Object.entries(priorityLabels) as [Priority, string][]).map(([value, label]) => (
                    <Select.Item key={value} id={value} label={label} />
                  ))}
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium text-secondary mb-1.5 block">Prazo (opcional)</label>
                <ShadcnInput
                  type="date"
                  value={formData.deadline}
                  onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                />
              </div>
            </div>

            <div>
              <Select
                label="Patologia (opcional)"
                selectedKey={formData.patologia}
                onSelectionChange={(key) => setFormData({ ...formData, patologia: key as Patologia })}
                placeholder="Selecione a patologia"
              >
                <Select.Item id="" label="Nenhuma" />
                {(Object.entries(patologiaLabels) as [Patologia, string][]).map(([value, label]) => (
                  <Select.Item key={value} id={value} label={label} />
                ))}
              </Select>
            </div>

            {formData.contentTypeId && (
              <div className="space-y-6 pt-4 border-t">
                <div>
                  <h3 className="text-sm font-medium mb-4">Custom Fields</h3>
                  {loadingFields ? (
                    <div className="text-sm text-muted-foreground">Loading fields...</div>
                  ) : fieldsData?.items && fieldsData.items.length > 0 ? (
                    <DynamicFieldRenderer
                      fields={fieldsData.items as any}
                      values={fieldValues}
                      onChange={handleFieldChange}
                      disabled={createMutation.isPending}
                    />
                  ) : (
                    <div className="text-sm text-muted-foreground">
                      No custom fields configured for this content type.
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="space-y-6 pt-4 border-t">
              <CreatorParticipationSection
                participations={creatorParticipations}
                onChange={setCreatorParticipations}
                disabled={createMutation.isPending}
              />
            </div>

            <div className="flex justify-end gap-4 pt-4">
              <Button
                type="button"
                color="secondary"
                onClick={() => router.push("/dashboard")}
              >
                Cancelar
              </Button>
              <Button 
                type="submit" 
                isDisabled={createMutation.isPending}
                isLoading={createMutation.isPending}
              >
                Criar Request
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
