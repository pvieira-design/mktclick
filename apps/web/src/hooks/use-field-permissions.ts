"use client";

import { useMemo } from "react";

interface UseFieldPermissionsParams {
  request: {
    id: string;
    status: string;
    currentStepId: string | null;
    creatorId: string;
    contentType: {
      fields: Array<{
        id: string;
        name: string;
        assignedStepId: string | null;
      }>;
    } | null;
  } | null | undefined;
  userId: string;
  userRole: string;
  userAreaMemberships: Array<{
    areaId: string;
    position: string;
  }>;
  fieldValues: Array<{
    fieldId: string;
    value: any;
  }>;
  currentStep?: {
    approverAreaId?: string | null;
    requiredFieldsToExit: string[];
  } | null;
}

interface UseFieldPermissionsResult {
  editableFieldIds: Set<string>;
  requiredFieldIds: Set<string>;
  canAdvance: boolean;
}

/**
 * Hook to determine which fields are editable based on workflow step and user role.
 *
 * Logic:
 * - DRAFT: all fields editable if user is creator
 * - REJECTED: all fields editable if user is creator; area members of current step can edit step's fields + unassigned
 * - IN_REVIEW/PENDING: fields where assignedStepId === currentStepId OR unassigned, ONLY for members of the step's approver area
 * - APPROVED: all fields editable only for admin
 * - CANCELLED: nothing editable
 *
 * requiredFieldIds: fields in currentStep.requiredFieldsToExit that are empty
 * canAdvance: all requiredFieldIds are filled
 */
export function useFieldPermissions(
  params: UseFieldPermissionsParams
): UseFieldPermissionsResult {
  return useMemo(() => {
    const defaultResult: UseFieldPermissionsResult = {
      editableFieldIds: new Set(),
      requiredFieldIds: new Set(),
      canAdvance: true,
    };

    if (!params.request || !params.userId) {
      return defaultResult;
    }

    const { request, userId, userRole, userAreaMemberships, fieldValues, currentStep } = params;
    const isCreator = request.creatorId === userId;
    const isAdmin = userRole === "ADMIN" || userRole === "SUPER_ADMIN";
    const status = request.status;
    const currentStepId = request.currentStepId;
    const fields = request.contentType?.fields || [];

    const fieldValueMap = new Map(fieldValues.map((fv) => [fv.fieldId, fv.value]));

    const isEmpty = (value: any): boolean => {
      if (value === null || value === undefined || value === "") {
        return true;
      }
      if (Array.isArray(value) && value.length === 0) {
        return true;
      }
      return false;
    };

    // Check if user is a member of the current step's approver area
    const stepApproverAreaId = currentStep?.approverAreaId;
    const isStepAreaMember = stepApproverAreaId
      ? userAreaMemberships.some((m) => m.areaId === stepApproverAreaId)
      : userAreaMemberships.length > 0; // If no specific area configured, any area member qualifies

    let editableFieldIds = new Set<string>();

    if (status === "DRAFT") {
      if (isCreator) {
        editableFieldIds = new Set(fields.map((f) => f.id));
      }
    } else if (status === "REJECTED") {
      if (isCreator) {
        // Creator can edit all fields when rejected
        editableFieldIds = new Set(fields.map((f) => f.id));
      } else if (currentStepId && isStepAreaMember) {
        // Area member of the current step can edit: step-assigned fields + unassigned fields
        editableFieldIds = new Set(
          fields
            .filter(
              (f) =>
                f.assignedStepId === currentStepId ||
                f.assignedStepId === null
            )
            .map((f) => f.id)
        );
      }
    } else if (status === "IN_REVIEW" || status === "PENDING") {
      if (currentStepId && isStepAreaMember) {
        // Only members of the step's approver area can edit fields
        editableFieldIds = new Set(
          fields
            .filter(
              (f) =>
                f.assignedStepId === currentStepId ||
                f.assignedStepId === null
            )
            .map((f) => f.id)
        );
      }
    } else if (status === "APPROVED") {
      if (isAdmin) {
        editableFieldIds = new Set(fields.map((f) => f.id));
      }
    }

    // Calculate required field IDs (fields that must be filled to exit the step)
    let requiredFieldIds = new Set<string>();
    if (currentStep?.requiredFieldsToExit && currentStep.requiredFieldsToExit.length > 0) {
      const requiredFieldNames = new Set(currentStep.requiredFieldsToExit);
      requiredFieldIds = new Set(
        fields
          .filter((f) => requiredFieldNames.has(f.name) && isEmpty(fieldValueMap.get(f.id)))
          .map((f) => f.id)
      );
    }

    const canAdvance = requiredFieldIds.size === 0;

    return {
      editableFieldIds,
      requiredFieldIds,
      canAdvance,
    };
  }, [
    params.request,
    params.userId,
    params.userRole,
    params.userAreaMemberships,
    params.fieldValues,
    params.currentStep,
  ]);
}

export default useFieldPermissions;
