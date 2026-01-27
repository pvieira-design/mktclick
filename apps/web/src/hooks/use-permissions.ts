"use client";

import { useMemo } from "react";

interface WorkflowStep {
  id: string;
  name: string;
  order: number;
  approverAreaId: string | null;
  approverPositions: string[];
  isFinalStep: boolean;
}

interface AreaMembership {
  areaId: string;
  position: string;
  area: {
    id: string;
    name: string;
  };
}

interface RequestWithWorkflow {
  id: string;
  status: string;
  createdById: string;
  currentStep: WorkflowStep | null;
  currentStepOrder: number | null;
}

interface UsePermissionsProps {
  request: RequestWithWorkflow | null | undefined;
  userId: string | null | undefined;
  userAreaMemberships: AreaMembership[] | null | undefined;
}

interface PermissionsResult {
  canAdvance: boolean;
  canReject: boolean;
  canEdit: boolean;
  canCancel: boolean;
  isCreator: boolean;
  availableActions: string[];
}

export function usePermissions({
  request,
  userId,
  userAreaMemberships,
}: UsePermissionsProps): PermissionsResult {
  return useMemo(() => {
    const defaultResult: PermissionsResult = {
      canAdvance: false,
      canReject: false,
      canEdit: false,
      canCancel: false,
      isCreator: false,
      availableActions: [],
    };

    if (!request || !userId) {
      return defaultResult;
    }

    const isCreator = request.createdById === userId;
    const currentStep = request.currentStep;
    const status = request.status;

    const isTerminalStatus = ["APPROVED", "CANCELLED"].includes(status);
    if (isTerminalStatus) {
      return { ...defaultResult, isCreator };
    }

    let canApproveCurrentStep = false;

    if (currentStep && userAreaMemberships) {
      if (!currentStep.approverAreaId) {
        canApproveCurrentStep = true;
      } else {
        const positionsToCheck =
          currentStep.approverPositions.length > 0
            ? currentStep.approverPositions
            : ["HEAD", "COORDINATOR", "STAFF"];

        canApproveCurrentStep = userAreaMemberships.some(
          (m) =>
            m.areaId === currentStep.approverAreaId &&
            positionsToCheck.includes(m.position)
        );
      }
    }

    const canAdvance = canApproveCurrentStep && status !== "DRAFT";
    const canReject = canApproveCurrentStep && status !== "DRAFT" && (request.currentStepOrder ?? 0) > 0;

    const canEdit =
      isCreator &&
      (status === "DRAFT" ||
        status === "REJECTED" ||
        (currentStep !== null && currentStep.order === 0));

    const canCancel = isCreator && !isTerminalStatus;

    const availableActions: string[] = [];
    if (canEdit) availableActions.push("edit");
    if (canAdvance) availableActions.push("advance");
    if (canReject) availableActions.push("reject");
    if (canCancel) availableActions.push("cancel");

    return {
      canAdvance,
      canReject,
      canEdit,
      canCancel,
      isCreator,
      availableActions,
    };
  }, [request, userId, userAreaMemberships]);
}

export default usePermissions;
