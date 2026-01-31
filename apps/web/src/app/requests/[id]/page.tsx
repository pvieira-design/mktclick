"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { WorkflowActions, WorkflowProgress } from "@/components/request/workflow-actions";
import { RequestFilesSection } from "@/components/request/request-files-section";
import { InlineFieldEditor } from "@/components/request/inline-field-editor";
import { FieldVersionHistory } from "@/components/request/field-version-history";
import { useCurrentUser } from "@/hooks/use-current-user";
import { useFieldPermissions } from "@/hooks/use-field-permissions";
import { Button } from "@/components/base/buttons/button";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/base/badges/badges";
import { Separator } from "@/components/ui/separator";
import { TextArea } from "@/components/base/textarea/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { StatusBadge, type RequestStatus } from "@/components/status-badge";
import { trpc } from "@/utils/trpc";
import { ArrowLeft, Clock, User01, Calendar, File04, Tag01, MarkerPin01, AlertTriangle, CheckSquare, Link01 } from "@untitledui/icons";

const contentTypeLabels: Record<string, string> = {
  VIDEO_UGC: "Vídeo UGC",
  VIDEO_INSTITUCIONAL: "Vídeo Institucional",
  CARROSSEL: "Carrossel",
  POST_UNICO: "Post Único",
  STORIES: "Stories",
  REELS: "Reels",
};

const originLabels: Record<string, string> = {
  OSLO: "Oslo",
  INTERNO: "Interno",
  INFLUENCER: "Influencer",
};

const priorityLabels: Record<string, string> = {
  LOW: "Baixa",
  MEDIUM: "Média",
  HIGH: "Alta",
  URGENT: "Urgente",
};

const patologiaLabels: Record<string, string> = {
  INSONIA: "Insônia",
  ANSIEDADE: "Ansiedade",
  DOR: "Dor",
  ESTRESSE: "Estresse",
  INFLAMACAO: "Inflamação",
  OUTRO: "Outro",
};

const actionLabels: Record<string, string> = {
  CREATED: "Criado",
  UPDATED: "Atualizado",
  SUBMITTED: "Submetido",
  REVIEW_STARTED: "Revisão iniciada",
  APPROVED: "Aprovado",
  REJECTED: "Rejeitado",
  CORRECTED: "Corrigido",
  CANCELLED: "Cancelado",
};

interface ContentTypeField {
  id: string;
  name: string;
  label: string;
  fieldType: string;
  required: boolean;
  order: number;
  options: string[] | null;
  placeholder: string | null;
  helpText: string | null;
  defaultValue: string | null;
  assignedStepId: string | null;
  assignedStep: { id: string; name: string } | null;
}

interface FieldValue {
  id: string;
  value: any;
  field: {
    id: string;
    name: string;
    label: string;
    fieldType: string;
  };
}

interface RequestData {
  id: string;
  title: string;
  description: string;
  contentType: {
    id: string;
    name: string;
    slug: string;
    fields: ContentTypeField[];
  } | null;
  status: RequestStatus;
  origin: { id: string; name: string; slug: string } | null;
  priority: string;
  deadline: string | null;
  patologia: string | null;
  rejectionReason: string | null;
  createdAt: string;
  updatedAt: string;
  createdBy: { id: string; name: string | null; email: string };
  reviewedBy: { id: string; name: string | null; email: string } | null;
  fieldValues: FieldValue[];
  history: Array<{
    id: string;
    action: string;
    createdAt: string;
    changedBy: { name: string | null; email: string };
  }>;
  files: Array<{
    file: {
      id: string;
      name: string;
      url: string;
      mimeType: string;
      size: number;
      isArchived: boolean;
      tags: Array<{ tag: { id: string; name: string } }>;
    };
  }>;
  currentStep: {
    id: string;
    name: string;
    order: number;
    approverAreaId: string | null;
    approverPositions: string[];
    isFinalStep: boolean;
    requiredFieldsToExit: string[];
    approverArea?: { id: string; name: string; slug: string } | null;
  } | null;
  currentStepId: string | null;
  workflowSteps: Array<{
    id: string;
    name: string;
    order: number;
    approverAreaId: string | null;
    approverPositions: string[];
    isFinalStep: boolean;
    requiredFieldsToExit: string[];
    approverArea?: { id: string; name: string; slug: string } | null;
  }>;
  totalSteps: number;
  currentStepOrder: number | null;
}

const formatDate = (dateStr: string) => {
  const date = new Date(dateStr);
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
};

const formatDateShort = (dateStr: string) => {
  const date = new Date(dateStr);
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
};

export default function RequestDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user: currentUser, areaMemberships, isLoading: loadingUser } = useCurrentUser();
  const requestId = params.id as string;

  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [rejectionError, setRejectionError] = useState("");

  const { data: request, isLoading, error } = useQuery<RequestData>(
    (trpc.request.getById.queryOptions as any)({ id: requestId })
  );

  const { editableFieldIds, requiredFieldIds, canAdvance: canAdvanceFields } = useFieldPermissions({
    request: request ? {
      id: request.id,
      status: request.status,
      currentStepId: request.currentStepId,
      creatorId: request.createdBy.id,
      contentType: request.contentType ? {
        fields: request.contentType.fields.map(f => ({
          id: f.id,
          name: f.name,
          assignedStepId: f.assignedStepId,
        })),
      } : null,
    } : null,
    userId: currentUser?.id || "",
    userRole: currentUser?.role || "",
    userAreaMemberships: areaMemberships.map(m => ({
      areaId: m.areaId,
      position: m.position,
    })),
    fieldValues: request?.fieldValues?.map(fv => ({
      fieldId: fv.field.id,
      value: fv.value,
    })) || [],
    currentStep: request?.currentStep ? {
      approverAreaId: request.currentStep.approverAreaId,
      requiredFieldsToExit: request.currentStep.requiredFieldsToExit || [],
    } : null,
  });

  const invalidateAndRefetch = () => {
    queryClient.invalidateQueries({ queryKey: ["request"] });
  };

  const submitMutation = useMutation({
    ...(trpc.request.submit.mutationOptions as any)(),
    onSuccess: () => {
      toast.success("Request submetido para revisão!");
      invalidateAndRefetch();
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const startReviewMutation = useMutation({
    ...(trpc.request.startReview.mutationOptions as any)(),
    onSuccess: () => {
      toast.success("Revisão iniciada!");
      invalidateAndRefetch();
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const approveMutation = useMutation({
    ...(trpc.request.approve.mutationOptions as any)(),
    onSuccess: () => {
      toast.success("Request aprovado!");
      invalidateAndRefetch();
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const rejectMutation = useMutation({
    ...(trpc.request.reject.mutationOptions as any)(),
    onSuccess: () => {
      toast.success("Request rejeitado");
      setRejectDialogOpen(false);
      setRejectionReason("");
      invalidateAndRefetch();
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const cancelMutation = useMutation({
    ...(trpc.request.cancel.mutationOptions as any)(),
    onSuccess: () => {
      toast.success("Request cancelado");
      invalidateAndRefetch();
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const handleReject = () => {
    if (rejectionReason.length < 10) {
      setRejectionError("O motivo deve ter pelo menos 10 caracteres");
      return;
    }
    rejectMutation.mutate({ id: requestId, reason: rejectionReason } as any);
  };

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

  if (error || !request) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center py-12">
          <p className="text-destructive">Erro ao carregar request</p>
          <Button color="secondary" className="mt-4" onClick={() => router.push("/dashboard")}>
            Voltar para Dashboard
          </Button>
        </div>
      </div>
    );
  }

  const renderActions = () => {
    const status = request.status;
    const hasWorkflow = request.workflowSteps && request.workflowSteps.length > 0;
    
    if (hasWorkflow && request.currentStep && currentUser) {
      return (
        <WorkflowActions
          request={{
            id: request.id,
            status: request.status,
            createdById: request.createdBy.id,
            currentStep: request.currentStep,
            currentStepOrder: request.currentStepOrder,
            totalSteps: request.totalSteps,
            workflowSteps: request.workflowSteps,
          }}
          userId={currentUser.id}
          userAreaMemberships={areaMemberships.map(m => ({
            areaId: m.areaId,
            position: m.position,
            area: m.area,
          }))}
          canAdvanceFields={canAdvanceFields}
          pendingRequiredFieldCount={requiredFieldIds.size}
          onActionComplete={invalidateAndRefetch}
        />
      );
    }

    const actions: React.ReactNode[] = [];

    if (status === "DRAFT") {
      actions.push(
        <Link key="edit" href={`/requests/${requestId}/edit` as any} className={buttonVariants({ variant: "outline" })}>
          Editar
        </Link>,
        <Button key="submit" onClick={() => submitMutation.mutate({ id: requestId } as any)} isDisabled={submitMutation.isPending}>
          {submitMutation.isPending ? "Submetendo..." : "Submeter para Revisão"}
        </Button>,
        <Button key="cancel" color="primary-destructive" onClick={() => cancelMutation.mutate({ id: requestId } as any)} isDisabled={cancelMutation.isPending}>
          Cancelar
        </Button>
      );
    }

    if (status === "PENDING") {
      actions.push(
        <Button key="review" onClick={() => startReviewMutation.mutate({ id: requestId } as any)} isDisabled={startReviewMutation.isPending}>
          {startReviewMutation.isPending ? "Iniciando..." : "Iniciar Revisão"}
        </Button>,
        <Button key="cancel" color="primary-destructive" onClick={() => cancelMutation.mutate({ id: requestId } as any)} isDisabled={cancelMutation.isPending}>
          Cancelar
        </Button>
      );
    }

    if (status === "IN_REVIEW") {
      actions.push(
        <Button key="approve" onClick={() => approveMutation.mutate({ id: requestId } as any)} isDisabled={approveMutation.isPending}>
          {approveMutation.isPending ? "Aprovando..." : "Aprovar"}
        </Button>,
        <Button key="reject" color="primary-destructive" onClick={() => setRejectDialogOpen(true)}>
          Rejeitar
        </Button>
      );
    }

    if (status === "REJECTED") {
      actions.push(
        <Link key="correct" href={`/requests/${requestId}/edit` as any} className={buttonVariants()}>
          Corrigir e Resubmeter
        </Link>,
        <Button key="cancel" color="primary-destructive" onClick={() => cancelMutation.mutate({ id: requestId } as any)} isDisabled={cancelMutation.isPending}>
          Cancelar
        </Button>
      );
    }

    return actions;
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-6">
        <Link href="/dashboard" className={buttonVariants({ variant: "ghost", size: "sm" })}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar
        </Link>
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <CardTitle className="text-2xl">{request.title}</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Criado por {request.createdBy.name || request.createdBy.email}
                </p>
              </div>
              <StatusBadge status={request.status} />
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="flex items-center gap-2">
                <File04 className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Tipo</p>
                  <p className="text-sm font-medium">{request.contentType?.name || "Não definido"}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <MarkerPin01 className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Origem</p>
                  <p className="text-sm font-medium">{request.origin?.name || "Não definido"}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Tag01 className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Prioridade</p>
                  <p className={`text-sm font-medium ${request.priority === "URGENT" ? "text-destructive" : ""}`}>
                    {priorityLabels[request.priority] || request.priority}
                  </p>
                </div>
              </div>
              {request.deadline && (
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">Prazo</p>
                    <p className="text-sm font-medium">{formatDateShort(request.deadline)}</p>
                  </div>
                </div>
              )}
            </div>

            {request.patologia && (
              <div>
                <p className="text-xs text-muted-foreground mb-1">Patologia</p>
                <Badge color="gray">{patologiaLabels[request.patologia] || request.patologia}</Badge>
              </div>
            )}

            {request.workflowSteps && request.workflowSteps.length > 0 && (
              <div className="py-2">
                <WorkflowProgress
                  steps={request.workflowSteps}
                  currentStepOrder={request.currentStepOrder}
                />
              </div>
            )}

            <Separator />

            <div>
              <p className="text-sm font-medium mb-2">Descrição</p>
              <div className="bg-muted/50 p-4 rounded-lg whitespace-pre-wrap text-sm">
                {request.description}
              </div>
            </div>

            {request.contentType?.fields && request.contentType.fields.length > 0 && (
              <>
                <Separator />
                <div>
                  <p className="text-sm font-medium mb-4">Campos Personalizados</p>
                  
                  {/* Agrupar campos por step */}
                  {(() => {
                    const fieldsByStep = new Map<string | null, typeof request.contentType.fields>();
                    request.contentType.fields.forEach((field) => {
                      const stepId = field.assignedStepId;
                      if (!fieldsByStep.has(stepId)) {
                        fieldsByStep.set(stepId, []);
                      }
                      fieldsByStep.get(stepId)!.push(field);
                    });

                    // Ordenar: Desagrupado primeiro, depois outros
                    const sortedEntries = Array.from(fieldsByStep.entries()).sort((a, b) => {
                      if (a[0] === null) return -1;
                      if (b[0] === null) return 1;
                      return 0;
                    });

                    return (
                      <div className="space-y-6">
                        {sortedEntries.map(([stepId, stepFields]) => {
                          const stepName = stepId 
                            ? stepFields[0]?.assignedStep?.name || "Step"
                            : "Desagrupado";
                          const isCurrentStep = stepId === request.currentStep?.id;

                          return (
                            <div 
                              key={stepId || "ungrouped"} 
                              className={`space-y-3 p-4 rounded-lg ${
                                isCurrentStep ? "bg-brand-50 border border-brand-200" : "bg-muted/30"
                              }`}
                            >
                              <h4 className={`font-semibold text-sm ${
                                isCurrentStep ? "text-brand-700" : "text-muted-foreground"
                              }`}>
                                {stepName}
                                {isCurrentStep && (
                                  <span className="ml-2 text-xs font-normal">(Etapa atual)</span>
                                )}
                              </h4>
                              <div className="space-y-4">
                                {stepFields
                                  .sort((a, b) => a.order - b.order)
                                  .map((field) => {
                                    const fieldValue = request.fieldValues?.find(
                                      (fv) => fv.field.id === field.id
                                    );
                                    const isEditable = editableFieldIds.has(field.id);
                                    const isRequired = requiredFieldIds.has(field.id);
                                    const isMissing = isRequired && !fieldValue?.value;

                                    return (
                                      <div key={field.id} className="flex items-start gap-2">
                                        <div className="flex-1">
                                          <InlineFieldEditor
                                            field={{
                                              id: field.id,
                                              name: field.name,
                                              label: field.label,
                                              fieldType: field.fieldType as any,
                                              required: field.required,
                                              options: field.options,
                                              placeholder: field.placeholder,
                                            }}
                                            value={fieldValue?.value}
                                            isEditable={isEditable}
                                            isRequired={field.required}
                                            isMissing={isMissing}
                                            requestId={request.id}
                                          />
                                        </div>
                                        <div className="pt-6">
                                          <FieldVersionHistory
                                            requestId={request.id}
                                            fieldId={field.id}
                                            fieldLabel={field.label}
                                          />
                                        </div>
                                      </div>
                                    );
                                  })}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    );
                  })()}
                </div>
              </>
            )}

            {request.files && request.files.length > 0 && (
              <>
                <Separator />
                <RequestFilesSection
                  requestId={request.id}
                  files={request.files}
                  canEdit={request.status === "DRAFT" && currentUser?.id === request.createdBy.id}
                />
              </>
            )}

            {request.rejectionReason && (
              <div className="bg-destructive/10 border border-destructive/20 p-4 rounded-lg">
                <div className="flex items-center gap-2 text-destructive mb-2">
                  <AlertTriangle className="h-4 w-4" />
                  <p className="font-medium">Motivo da Rejeição</p>
                </div>
                <p className="text-sm">{request.rejectionReason}</p>
              </div>
            )}

            {request.reviewedBy && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <User01 className="h-4 w-4" />
                <span>Revisor: {request.reviewedBy.name || request.reviewedBy.email}</span>
              </div>
            )}

            <Separator />

            <div className="flex flex-wrap gap-3">
              {loadingUser ? (
                <div className="text-sm text-muted-foreground">Loading...</div>
              ) : (
                renderActions()
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Histórico
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {request.history.map((entry, index) => (
                <div key={entry.id} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
                    {index < request.history.length - 1 && (
                      <div className="w-0.5 h-full bg-border flex-1 mt-1"></div>
                    )}
                  </div>
                  <div className="pb-4">
                    <p className="font-medium text-sm">{actionLabels[entry.action] || entry.action}</p>
                    <p className="text-xs text-muted-foreground">
                      {entry.changedBy.name || entry.changedBy.email} • {formatDate(entry.createdAt)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rejeitar Request</DialogTitle>
            <DialogDescription>
              Informe o motivo da rejeição. O criador poderá corrigir e resubmeter.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <TextArea
              label="Motivo (mínimo 10 caracteres)"
              value={rejectionReason}
              onChange={(value) => {
                setRejectionReason(value);
                setRejectionError("");
              }}
              placeholder="Explique o motivo da rejeição..."
              rows={4}
              isInvalid={!!rejectionError}
              hint={rejectionError}
            />
          </div>
          <DialogFooter>
            <Button color="secondary" onClick={() => setRejectDialogOpen(false)}>
              Cancelar
            </Button>
            <Button color="primary-destructive" onClick={handleReject} isDisabled={rejectMutation.isPending}>
              {rejectMutation.isPending ? "Rejeitando..." : "Confirmar Rejeição"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
