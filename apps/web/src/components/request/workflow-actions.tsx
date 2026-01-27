"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { trpc } from "@/utils/trpc";
import { usePermissions } from "@/hooks/use-permissions";
import { CheckCircle, XCircle, ArrowRight, Flag } from "lucide-react";

interface WorkflowStep {
  id: string;
  name: string;
  order: number;
  approverAreaId: string | null;
  approverPositions: string[];
  isFinalStep: boolean;
  approverArea?: { id: string; name: string; slug: string } | null;
}

interface AreaMembership {
  areaId: string;
  position: string;
  area: { id: string; name: string };
}

interface RequestData {
  id: string;
  status: string;
  createdById: string;
  currentStep: WorkflowStep | null;
  currentStepOrder: number | null;
  totalSteps: number;
  workflowSteps: WorkflowStep[];
}

interface WorkflowActionsProps {
  request: RequestData;
  userId: string;
  userAreaMemberships: AreaMembership[];
  onActionComplete?: () => void;
}

export function WorkflowActions({
  request,
  userId,
  userAreaMemberships,
  onActionComplete,
}: WorkflowActionsProps) {
  const queryClient = useQueryClient();
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [targetStepId, setTargetStepId] = useState("");

  const permissions = usePermissions({
    request,
    userId,
    userAreaMemberships,
  });

  const { data: previousSteps } = useQuery({
    ...(trpc.request.getPreviousStepsForReject.queryOptions as any)({
      requestId: request.id,
    }),
    enabled: permissions.canReject && rejectDialogOpen,
  });

  const invalidateAndRefetch = () => {
    queryClient.invalidateQueries({ queryKey: ["request"] });
    onActionComplete?.();
  };

  const advanceStepMutation = useMutation({
    ...(trpc.request.advanceStep.mutationOptions as any)(),
    onSuccess: () => {
      toast.success(
        request.currentStep?.isFinalStep
          ? "Request aprovado e finalizado!"
          : "Avançado para próxima etapa!"
      );
      invalidateAndRefetch();
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const rejectToStepMutation = useMutation({
    ...(trpc.request.rejectToStep.mutationOptions as any)(),
    onSuccess: () => {
      toast.success("Request rejeitado");
      setRejectDialogOpen(false);
      setRejectionReason("");
      setTargetStepId("");
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
      toast.error("O motivo deve ter pelo menos 10 caracteres");
      return;
    }
    if (!targetStepId) {
      toast.error("Selecione uma etapa para retornar");
      return;
    }
    rejectToStepMutation.mutate({
      id: request.id,
      reason: rejectionReason,
      targetStepId,
    } as any);
  };

  const hasWorkflow = request.workflowSteps && request.workflowSteps.length > 0;
  const currentStep = request.currentStep;

  if (!hasWorkflow) {
    return null;
  }

  return (
    <div className="space-y-4">
      {currentStep && (
        <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg">
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Etapa atual:</span>
              <Badge variant="outline" className="font-medium">
                {currentStep.order + 1} de {request.totalSteps}
              </Badge>
              <span className="font-medium">{currentStep.name}</span>
              {currentStep.isFinalStep && (
                <Badge variant="default" className="ml-2">
                  <Flag className="mr-1 h-3 w-3" />
                  Final
                </Badge>
              )}
            </div>
            {currentStep.approverArea && (
              <p className="text-xs text-muted-foreground mt-1">
                Aprovadores: {currentStep.approverArea.name}
                {currentStep.approverPositions.length > 0 && (
                  <> ({currentStep.approverPositions.join(", ")})</>
                )}
              </p>
            )}
          </div>

          <div className="flex gap-2">
            {permissions.canAdvance && (
              <Button
                onClick={() => advanceStepMutation.mutate({ id: request.id } as any)}
                disabled={advanceStepMutation.isPending}
              >
                {advanceStepMutation.isPending ? (
                  "Processando..."
                ) : currentStep.isFinalStep ? (
                  <>
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Aprovar e Finalizar
                  </>
                ) : (
                  <>
                    <ArrowRight className="mr-2 h-4 w-4" />
                    Aprovar e Avançar
                  </>
                )}
              </Button>
            )}

            {permissions.canReject && (
              <Button
                variant="destructive"
                onClick={() => setRejectDialogOpen(true)}
              >
                <XCircle className="mr-2 h-4 w-4" />
                Rejeitar
              </Button>
            )}
          </div>
        </div>
      )}

      {permissions.canCancel && request.status !== "APPROVED" && (
        <Button
          variant="outline"
          className="text-destructive"
          onClick={() => cancelMutation.mutate({ id: request.id } as any)}
          disabled={cancelMutation.isPending}
        >
          {cancelMutation.isPending ? "Cancelando..." : "Cancelar Request"}
        </Button>
      )}

      <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rejeitar Request</DialogTitle>
            <DialogDescription>
              Selecione para qual etapa o request deve retornar e informe o motivo.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Retornar para etapa</Label>
              <Select value={targetStepId} onValueChange={(val) => setTargetStepId(val || "")}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione uma etapa..." />
                </SelectTrigger>
                <SelectContent>
                  {Array.isArray(previousSteps) && previousSteps.map((step: WorkflowStep) => (
                    <SelectItem key={step.id} value={step.id}>
                      {step.order + 1}. {step.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Motivo da rejeição (mínimo 10 caracteres)</Label>
              <Textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Explique o motivo da rejeição..."
                className="min-h-24"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectDialogOpen(false)}>
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={handleReject}
              disabled={rejectToStepMutation.isPending}
            >
              {rejectToStepMutation.isPending ? "Rejeitando..." : "Confirmar Rejeição"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export function WorkflowProgress({
  steps,
  currentStepOrder,
}: {
  steps: WorkflowStep[];
  currentStepOrder: number | null;
}) {
  if (!steps || steps.length === 0) return null;

  return (
    <div className="flex items-center gap-2 overflow-x-auto py-2">
      {steps.map((step, index) => {
        const isCompleted = currentStepOrder !== null && step.order < currentStepOrder;
        const isCurrent = step.order === currentStepOrder;

        return (
          <div key={step.id} className="flex items-center">
            <div
              className={`flex items-center justify-center w-8 h-8 rounded-full text-xs font-medium ${
                isCompleted
                  ? "bg-green-500 text-white"
                  : isCurrent
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              {isCompleted ? <CheckCircle className="h-4 w-4" /> : index + 1}
            </div>
            <span
              className={`ml-2 text-sm whitespace-nowrap ${
                isCurrent ? "font-medium" : "text-muted-foreground"
              }`}
            >
              {step.name}
            </span>
            {index < steps.length - 1 && (
              <div
                className={`w-8 h-0.5 mx-2 ${
                  isCompleted ? "bg-green-500" : "bg-muted"
                }`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

export default WorkflowActions;
