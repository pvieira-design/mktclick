"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { WorkflowActions, WorkflowProgress } from "@/components/request/workflow-actions";
import { useCurrentUser } from "@/hooks/use-current-user";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
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
import { ArrowLeft, Clock, User, Calendar, FileText, Tag, MapPin, AlertTriangle } from "lucide-react";

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

interface RequestData {
  id: string;
  title: string;
  description: string;
  contentType: { id: string; name: string; slug: string } | null;
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
  history: Array<{
    id: string;
    action: string;
    createdAt: string;
    changedBy: { name: string | null; email: string };
  }>;
  currentStep: {
    id: string;
    name: string;
    order: number;
    approverAreaId: string | null;
    approverPositions: string[];
    isFinalStep: boolean;
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
          <Button variant="outline" className="mt-4" onClick={() => router.push("/dashboard")}>
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
        <Button key="submit" onClick={() => submitMutation.mutate({ id: requestId } as any)} disabled={submitMutation.isPending}>
          {submitMutation.isPending ? "Submetendo..." : "Submeter para Revisão"}
        </Button>,
        <Button key="cancel" variant="destructive" onClick={() => cancelMutation.mutate({ id: requestId } as any)} disabled={cancelMutation.isPending}>
          Cancelar
        </Button>
      );
    }

    if (status === "PENDING") {
      actions.push(
        <Button key="review" onClick={() => startReviewMutation.mutate({ id: requestId } as any)} disabled={startReviewMutation.isPending}>
          {startReviewMutation.isPending ? "Iniciando..." : "Iniciar Revisão"}
        </Button>,
        <Button key="cancel" variant="destructive" onClick={() => cancelMutation.mutate({ id: requestId } as any)} disabled={cancelMutation.isPending}>
          Cancelar
        </Button>
      );
    }

    if (status === "IN_REVIEW") {
      actions.push(
        <Button key="approve" onClick={() => approveMutation.mutate({ id: requestId } as any)} disabled={approveMutation.isPending}>
          {approveMutation.isPending ? "Aprovando..." : "Aprovar"}
        </Button>,
        <Button key="reject" variant="destructive" onClick={() => setRejectDialogOpen(true)}>
          Rejeitar
        </Button>
      );
    }

    if (status === "REJECTED") {
      actions.push(
        <Link key="correct" href={`/requests/${requestId}/edit` as any} className={buttonVariants()}>
          Corrigir e Resubmeter
        </Link>,
        <Button key="cancel" variant="destructive" onClick={() => cancelMutation.mutate({ id: requestId } as any)} disabled={cancelMutation.isPending}>
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
                <FileText className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Tipo</p>
                  <p className="text-sm font-medium">{request.contentType?.name || "Não definido"}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Origem</p>
                  <p className="text-sm font-medium">{request.origin?.name || "Não definido"}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Tag className="h-4 w-4 text-muted-foreground" />
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
                <Badge variant="outline">{patologiaLabels[request.patologia] || request.patologia}</Badge>
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
                <User className="h-4 w-4" />
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
            <Label htmlFor="reason">Motivo (mínimo 10 caracteres)</Label>
            <Textarea
              id="reason"
              value={rejectionReason}
              onChange={(e) => {
                setRejectionReason(e.target.value);
                setRejectionError("");
              }}
              placeholder="Explique o motivo da rejeição..."
              className="min-h-24"
            />
            {rejectionError && (
              <p className="text-sm text-destructive">{rejectionError}</p>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectDialogOpen(false)}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleReject} disabled={rejectMutation.isPending}>
              {rejectMutation.isPending ? "Rejeitando..." : "Confirmar Rejeição"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
