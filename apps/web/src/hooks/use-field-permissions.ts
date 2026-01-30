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
 * - REJECTED: all fields editable if user is creator OR member of target step area
 * - IN_REVIEW/PENDING: fields where assignedStepId === currentStepId are editable for area members
 *   OR fields where assignedStepId === null (unassigned) are editable for area members
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
      canAdvance: false,
    };

    if (!params.request || !params.userId) {
      return defaultResult;
    }

    const { request, userId, userRole, userAreaMemberships, fieldValues, currentStep } = params;
    const isCreator = request.creatorId === userId;
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

    let editableFieldIds = new Set<string>();

    if (status === "DRAFT") {
      if (isCreator) {
        editableFieldIds = new Set(fields.map((f) => f.id));
      }
    } else if (status === "REJECTED") {
      if (isCreator) {
        editableFieldIds = new Set(fields.map((f) => f.id));
      } else if (currentStepId) {
        editableFieldIds = new Set(
          fields.filter((f) => f.assignedStepId === null).map((f) => f.id)
        );
      }
    } else if (status === "IN_REVIEW" || status === "PENDING") {
      if (currentStepId && userAreaMemberships.length > 0) {
        editableFieldIds = new Set(
          fields
            .filter(
              (f) =>
                f.assignedStepId === currentStepId ||
                (f.assignedStepId === null && userAreaMemberships.length > 0)
            )
            .map((f) => f.id)
        );
      }
    } else if (status === "APPROVED") {
      if (userRole === "ADMIN" || userRole === "SUPER_ADMIN") {
        editableFieldIds = new Set(fields.map((f) => f.id));
      }
    }

    let requiredFieldIds = new Set<string>();
    if (currentStep?.requiredFieldsToExit) {
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
