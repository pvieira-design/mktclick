"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Button } from "@/components/base/buttons/button";
import { buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/base/input/input";
import { TextArea } from "@/components/base/textarea/textarea";
import { Select } from "@/components/base/select/select";
import { Input as ShadcnInput } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/utils/trpc";
import { ArrowLeft } from "@untitledui/icons";
import { useContentTypes, useOrigins } from "@/hooks/use-metadata";
import { DynamicFieldRenderer } from "@/components/request/dynamic-field-renderer";
import { CreatorParticipationSection, type CreatorParticipation } from "@/components/request/creator-participation-section";
import { useFileUpload } from "@/hooks/use-file-upload";

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

interface RequestData {
  id: string;
  title: string;
  description: string;
  contentType: { id: string; name: string } | null;
  origin: { id: string; name: string } | null;
  status: string;
  priority: Priority;
  deadline: string | null;
  patologia: Patologia | null;
  fieldValues?: Array<{ field: { name: string }; value: any }>;
  creatorParticipations?: Array<{
    id: string;
    creatorId: string;
    participationDate: string;
    location: string | null;
    valuePaid: number | string;
    notes: string | null;
    creator: { id: string; name: string; imageUrl: string | null; type: string };
  }>;
}

export default function EditRequestPage() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const requestId = params.id as string;
  const { uploadFile } = useFileUpload();

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

  const [fieldValues, setFieldValues] = useState<Record<string, any>>({});

  const [creatorParticipations, setCreatorParticipations] = useState<CreatorParticipation[]>([]);

  const [errors, setErrors] = useState<Record<string, string>>({});

  const { data: request, isLoading } = useQuery<RequestData>(
    (trpc.request.getById.queryOptions as any)({ id: requestId })
  );

  const { data: fieldsData } = useQuery({
    ...trpc.contentTypeField.listByContentType.queryOptions({ 
      contentTypeId: request?.contentType?.id ?? "" 
    }),
    enabled: !!request?.contentType?.id,
  });

  useEffect(() => {
    if (request) {
      setFormData({
        title: request.title,
        description: request.description,
        contentTypeId: request.contentType?.id || "",
        originId: request.origin?.id || "",
        priority: request.priority,
        deadline: request.deadline ? request.deadline.split("T")[0] : "",
        patologia: request.patologia || "",
      });

      if (request.fieldValues && request.fieldValues.length > 0) {
        const valuesMap: Record<string, any> = {};
        for (const fv of request.fieldValues) {
          if (fv.field?.name) {
            valuesMap[fv.field.name] = fv.value;
          }
        }
        setFieldValues(valuesMap);
      }

      if (request.creatorParticipations && request.creatorParticipations.length > 0) {
        const participations: CreatorParticipation[] = request.creatorParticipations.map((p) => ({
          id: p.id,
          creatorId: p.creatorId,
          participationDate: new Date(p.participationDate),
          location: p.location || undefined,
          valuePaid: typeof p.valuePaid === "string" ? parseFloat(p.valuePaid) : p.valuePaid,
          notes: p.notes || undefined,
        }));
        setCreatorParticipations(participations);
      }
    }
  }, [request]);

  const isRejected = request?.status === "REJECTED";

  const updateMutation = useMutation({
    ...(trpc.request.update.mutationOptions as any)(),
    onSuccess: () => {
      toast.success("Request atualizado!");
      queryClient.invalidateQueries({ queryKey: ["request"] });
      router.push(`/requests/${requestId}` as any);
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const correctMutation = useMutation({
    ...(trpc.request.correct.mutationOptions as any)(),
    onSuccess: () => {
      toast.success("Request corrigido e resubmetido!");
      queryClient.invalidateQueries({ queryKey: ["request"] });
      router.push(`/requests/${requestId}` as any);
    },
    onError: (error: Error) => toast.error(error.message),
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

    const payload = {
      id: requestId,
      title: formData.title,
      description: formData.description,
      contentTypeId: formData.contentTypeId,
      originId: formData.originId,
      priority: formData.priority,
      deadline: formData.deadline ? new Date(formData.deadline) : undefined,
      patologia: formData.patologia ? formData.patologia as Patologia : undefined,
      fieldValues: Object.keys(fieldValues).length > 0 ? fieldValues : undefined,
      creatorParticipations: validParticipations,
    };

    if (isRejected) {
      correctMutation.mutate(payload as any);
    } else {
      updateMutation.mutate(payload as any);
    }
  };

  const isPending = updateMutation.isPending || correctMutation.isPending;

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/3"></div>
          <div className="h-64 bg-muted rounded"></div>
        </div>
      </div>
    );
  }

  if (!request) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center py-12">
          <p className="text-destructive">Request não encontrado</p>
          <Button color="secondary" className="mt-4" onClick={() => router.push("/dashboard")}>
            Voltar para Dashboard
          </Button>
        </div>
      </div>
    );
  }

  if (request.status !== "DRAFT" && request.status !== "REJECTED") {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center py-12">
          <p className="text-destructive">Este request não pode ser editado</p>
          <Button color="secondary" className="mt-4" onClick={() => router.push(`/requests/${requestId}` as any)}>
            Ver Detalhes
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-3xl">
      <div className="mb-6">
        <Link 
          href={`/requests/${requestId}` as any}
          className={buttonVariants({ variant: "ghost", size: "sm" })}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">
            {isRejected ? "Corrigir Request" : "Editar Request"}
          </CardTitle>
          {isRejected && (
            <p className="text-sm text-muted-foreground">
              Corrija o request e ele será automaticamente resubmetido para revisão.
            </p>
          )}
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

            {request?.contentType?.id && (
              <div className="space-y-6 pt-4 border-t">
                <div>
                  <h3 className="text-sm font-medium mb-4">Custom Fields</h3>
                  {fieldsData?.items && fieldsData.items.length > 0 ? (
                    <DynamicFieldRenderer
                      fields={fieldsData.items as any}
                      values={fieldValues}
                      onChange={handleFieldChange}
                      onFileUpload={uploadFile}
                      disabled={updateMutation.isPending || correctMutation.isPending}
                    />
                  ) : (
                    <div className="text-sm text-muted-foreground">
                      No custom fields configured.
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="space-y-6 pt-4 border-t">
              <CreatorParticipationSection
                participations={creatorParticipations}
                onChange={setCreatorParticipations}
                disabled={updateMutation.isPending || correctMutation.isPending}
              />
            </div>

            <div className="flex justify-end gap-4 pt-4">
              <Button
                type="button"
                color="secondary"
                onClick={() => router.push(`/requests/${requestId}` as any)}
              >
                Cancelar
              </Button>
              <Button type="submit" isDisabled={isPending} isLoading={isPending}>
                {isPending 
                  ? (isRejected ? "Corrigindo..." : "Salvando...") 
                  : (isRejected ? "Corrigir e Resubmeter" : "Salvar Alterações")
                }
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
