// packages/api/src/services/workflow-validator.ts
import db, { AreaPosition } from "@marketingclickcannabis/db";

// Type for WorkflowStep with relations
interface WorkflowStepWithArea {
  id: string;
  contentTypeId: string;
  name: string;
  description: string | null;
  order: number;
  requiredFieldsToEnter: string[];
  requiredFieldsToExit: string[];
  approverAreaId: string | null;
  approverPositions: string[];
  isActive: boolean;
  isFinalStep: boolean;
  approverArea?: { id: string; name: string; slug: string } | null;
}

interface RequestFieldValue {
  id: string;
  requestId: string;
  fieldId: string;
  value: unknown;
  field?: {
    id: string;
    name: string;
  };
}

/**
 * Check if a user can approve at the given workflow step.
 * Returns true if:
 * - The step has no approver configured (anyone can advance), OR
 * - The user is a member of the approver area with one of the allowed positions
 */
export async function canUserApprove(
  userId: string,
  step: WorkflowStepWithArea
): Promise<boolean> {
  // If no approver area configured, step can be advanced by anyone
  if (!step.approverAreaId) {
    return true;
  }

  // If no positions specified, any member of the area can approve
  const positionsToCheck =
    step.approverPositions.length > 0
      ? (step.approverPositions as AreaPosition[])
      : Object.values(AreaPosition);

  const membership = await db.areaMember.findFirst({
    where: {
      userId,
      areaId: step.approverAreaId,
      position: { in: positionsToCheck },
    },
  });

  return !!membership;
}

/**
 * Validate that required fields are filled for entering or exiting a step.
 */
export function validateRequiredFields(
  step: WorkflowStepWithArea,
  fieldValues: Record<string, unknown>,
  direction: "enter" | "exit"
): { valid: boolean; missingFields: string[] } {
  const requiredFields =
    direction === "enter"
      ? step.requiredFieldsToEnter
      : step.requiredFieldsToExit;

  const missingFields = requiredFields.filter((fieldName) => {
    const value = fieldValues[fieldName];
    if (value === null || value === undefined || value === "") {
      return true;
    }
    if (Array.isArray(value) && value.length === 0) {
      return true;
    }
    return false;
  });

  return {
    valid: missingFields.length === 0,
    missingFields,
  };
}

/**
 * Get the next active workflow step after the given order.
 */
export async function getNextStep(
  contentTypeId: string,
  currentOrder: number
): Promise<WorkflowStepWithArea | null> {
  return db.workflowStep.findFirst({
    where: {
      contentTypeId,
      order: { gt: currentOrder },
      isActive: true,
    },
    include: {
      approverArea: { select: { id: true, name: true, slug: true } },
    },
    orderBy: { order: "asc" },
  });
}

/**
 * Get all previous active workflow steps (for rejection target selection).
 */
export async function getPreviousSteps(
  contentTypeId: string,
  currentOrder: number
): Promise<WorkflowStepWithArea[]> {
  return db.workflowStep.findMany({
    where: {
      contentTypeId,
      order: { lt: currentOrder },
      isActive: true,
    },
    include: {
      approverArea: { select: { id: true, name: true, slug: true } },
    },
    orderBy: { order: "asc" },
  });
}

/**
 * Get the first active workflow step for a content type.
 */
export async function getFirstStep(
  contentTypeId: string
): Promise<WorkflowStepWithArea | null> {
  return db.workflowStep.findFirst({
    where: {
      contentTypeId,
      isActive: true,
    },
    include: {
      approverArea: { select: { id: true, name: true, slug: true } },
    },
    orderBy: { order: "asc" },
  });
}

/**
 * Get all active workflow steps for a content type.
 */
export async function getAllSteps(
  contentTypeId: string
): Promise<WorkflowStepWithArea[]> {
  return db.workflowStep.findMany({
    where: {
      contentTypeId,
      isActive: true,
    },
    include: {
      approverArea: { select: { id: true, name: true, slug: true } },
    },
    orderBy: { order: "asc" },
  });
}

/**
 * Check if user's area has permission to create requests of this content type.
 */
export async function canUserCreateRequestOfType(
  userId: string,
  contentTypeId: string
): Promise<boolean> {
  const userMemberships = await db.areaMember.findMany({
    where: { userId },
    select: { areaId: true },
  });

  if (userMemberships.length === 0) {
    return false;
  }

  const userAreaIds = userMemberships.map((m) => m.areaId);

  const permission = await db.contentTypeAreaPermission.findFirst({
    where: {
      contentTypeId,
      areaId: { in: userAreaIds },
      canCreate: true,
    },
  });

  // If no permissions are configured at all, allow any user
  if (!permission) {
    const anyPermission = await db.contentTypeAreaPermission.findFirst({
      where: { contentTypeId },
    });
    if (!anyPermission) {
      return true;
    }
    return false;
  }

  return true;
}

/**
 * Convert RequestFieldValue array to a map keyed by field name.
 */
export function buildFieldValuesMap(
  fieldValues: RequestFieldValue[],
  fields: Array<{ id: string; name: string }>
): Record<string, unknown> {
  const fieldIdToName = new Map(fields.map((f) => [f.id, f.name]));

  const map: Record<string, unknown> = {};
  for (const fv of fieldValues) {
    const fieldName = fv.field?.name || fieldIdToName.get(fv.fieldId);
    if (fieldName) {
      map[fieldName] = fv.value;
    }
  }
  return map;
}

/**
 * Validate a step exists and belongs to the given content type.
 */
export async function validateStepBelongsToContentType(
  stepId: string,
  contentTypeId: string
): Promise<WorkflowStepWithArea | null> {
  return db.workflowStep.findFirst({
    where: {
      id: stepId,
      contentTypeId,
      isActive: true,
    },
    include: {
      approverArea: { select: { id: true, name: true, slug: true } },
    },
  });
}

// Export type for external use
export type { WorkflowStepWithArea, RequestFieldValue };
