import { TRPCError } from "@trpc/server";
import { z } from "zod";

import db, {
  Patologia,
  Priority,
  RequestAction,
  RequestStatus,
} from "@marketingclickcannabis/db";

import { protectedProcedure, router } from "../index";
import {
  canUserApprove,
  validateRequiredFields,
  getNextStep,
  getPreviousSteps,
  getFirstStep,
  getAllSteps,
  buildFieldValuesMap,
  validateStepBelongsToContentType,
} from "../services/workflow-validator";

const listInputSchema = z.object({
  status: z.string().optional(),
  contentType: z.string().optional(),
  search: z.string().optional(),
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().max(100).default(20),
});

const getByIdInputSchema = z.object({
  id: z.string().cuid(),
});

const createInputSchema = z.object({
  title: z.string().min(3).max(200),
  description: z.string().min(10).max(5000),
  contentTypeId: z.string().cuid(),
  originId: z.string().cuid(),
  priority: z.nativeEnum(Priority).optional(),
  deadline: z.coerce.date().optional(),
  patologia: z.nativeEnum(Patologia).optional(),
});

const updateInputSchema = z.object({
  id: z.string().cuid(),
  title: z.string().min(3).max(200).optional(),
  description: z.string().min(10).max(5000).optional(),
  contentTypeId: z.string().cuid().optional(),
  originId: z.string().cuid().optional(),
  priority: z.nativeEnum(Priority).optional(),
  deadline: z.coerce.date().optional(),
  patologia: z.nativeEnum(Patologia).optional(),
});

const submitInputSchema = z.object({
  id: z.string().cuid(),
});

const startReviewInputSchema = z.object({
  id: z.string().cuid(),
});

const approveInputSchema = z.object({
  id: z.string().cuid(),
});

const rejectInputSchema = z.object({
  id: z.string().cuid(),
  reason: z.string().min(10).max(2000),
});

const correctInputSchema = z.object({
  id: z.string().cuid(),
  title: z.string().min(3).max(200).optional(),
  description: z.string().min(10).max(5000).optional(),
  contentTypeId: z.string().cuid().optional(),
  originId: z.string().cuid().optional(),
  priority: z.nativeEnum(Priority).optional(),
  deadline: z.coerce.date().optional(),
  patologia: z.nativeEnum(Patologia).optional(),
});

const cancelInputSchema = z.object({
  id: z.string().cuid(),
});

const advanceStepInputSchema = z.object({
  id: z.string().cuid(),
});

const rejectToStepInputSchema = z.object({
  id: z.string().cuid(),
  reason: z.string().min(10).max(2000),
  targetStepId: z.string().cuid(),
});

const saveFieldValuesInputSchema = z.object({
  requestId: z.string().cuid(),
  fieldValues: z.record(z.string(), z.any()),
});

export const requestRouter = router({
  list: protectedProcedure.input(listInputSchema).query(async ({ input }) => {
    const { status, contentType, search, page, limit } = input;
    const skip = (page - 1) * limit;

     const where = {
       ...(status && { status: status as RequestStatus }),
       ...(contentType && { contentTypeId: contentType }),
       ...(search && {
         title: { contains: search, mode: "insensitive" as const },
       }),
     };

     const [items, total] = await Promise.all([
       db.request.findMany({
         where,
         skip,
         take: limit,
         orderBy: { createdAt: "desc" },
         include: { contentType: true, origin: true, createdBy: true },
       }),
       db.request.count({ where }),
     ]);

    return {
      items,
      total,
      hasMore: skip + items.length < total,
    };
  }),

  getById: protectedProcedure
    .input(getByIdInputSchema)
    .query(async ({ input }) => {
      const request = await db.request.findUnique({
        where: { id: input.id },
        include: {
          contentType: {
            include: {
              fields: { where: { isActive: true }, orderBy: { order: "asc" } },
            },
          },
          origin: true,
          createdBy: true,
          reviewedBy: true,
          currentStep: {
            include: {
              approverArea: { select: { id: true, name: true, slug: true } },
            },
          },
          fieldValues: {
            include: {
              field: { select: { id: true, name: true, label: true, fieldType: true } },
            },
          },
          history: {
            include: { changedBy: true },
            orderBy: { createdAt: "desc" },
          },
        },
      });

      if (!request) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Request not found",
        });
      }

      const workflowSteps = await getAllSteps(request.contentTypeId);

      return {
        ...request,
        workflowSteps,
        totalSteps: workflowSteps.length,
        currentStepOrder: request.currentStep?.order ?? null,
      };
    }),

  create: protectedProcedure
    .input(createInputSchema)
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;

      return db.$transaction(async (tx) => {
         const request = await tx.request.create({
           data: {
             title: input.title,
             description: input.description,
             contentTypeId: input.contentTypeId,
             originId: input.originId,
             priority: input.priority,
             deadline: input.deadline,
             patologia: input.patologia,
             status: RequestStatus.DRAFT,
             createdById: userId,
           },
         });

         await tx.requestHistory.create({
           data: {
             requestId: request.id,
             action: RequestAction.CREATED,
             changedById: userId,
             newValues: {
               title: input.title,
               description: input.description,
               contentTypeId: input.contentTypeId,
               originId: input.originId,
               priority: input.priority,
               deadline: input.deadline?.toISOString(),
               patologia: input.patologia,
             },
           },
         });

        return request;
      });
    }),

  update: protectedProcedure
    .input(updateInputSchema)
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;
      const { id, ...updateData } = input;

      return db.$transaction(async (tx) => {
        const existing = await tx.request.findUnique({ where: { id } });

        if (!existing) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Request not found",
          });
        }

        if (existing.status !== RequestStatus.DRAFT) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Only draft requests can be updated",
          });
        }

        const oldValues: Record<string, string | number | boolean | null> = {};
        const newValues: Record<string, string | number | boolean | null> = {};

        for (const [key, value] of Object.entries(updateData)) {
          if (value !== undefined) {
            const existingValue = existing[key as keyof typeof existing];
            oldValues[key] = existingValue instanceof Date 
              ? existingValue.toISOString() 
              : (existingValue as string | number | boolean | null);
            newValues[key] = value instanceof Date ? value.toISOString() : (value as string | number | boolean | null);
          }
        }

        const request = await tx.request.update({
          where: { id },
          data: updateData,
        });

        await tx.requestHistory.create({
          data: {
            requestId: id,
            action: RequestAction.UPDATED,
            changedById: userId,
            oldValues: Object.keys(oldValues).length > 0 ? oldValues : undefined,
            newValues: Object.keys(newValues).length > 0 ? newValues : undefined,
          },
        });

        return request;
      });
    }),

  submit: protectedProcedure
    .input(submitInputSchema)
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;

      return db.$transaction(async (tx) => {
        const existing = await tx.request.findUnique({ where: { id: input.id } });

        if (!existing) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Request not found",
          });
        }

        if (existing.status !== RequestStatus.DRAFT) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Only draft requests can be submitted",
          });
        }

         if (!existing.title || !existing.description || !existing.contentTypeId || !existing.originId) {
           throw new TRPCError({
             code: "BAD_REQUEST",
             message: "All required fields must be filled before submission",
           });
         }

        const request = await tx.request.update({
          where: { id: input.id },
          data: { status: RequestStatus.PENDING },
        });

        await tx.requestHistory.create({
          data: {
            requestId: input.id,
            action: RequestAction.SUBMITTED,
            changedById: userId,
          },
        });

        return request;
      });
    }),

  startReview: protectedProcedure
    .input(startReviewInputSchema)
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;

      return db.$transaction(async (tx) => {
        const existing = await tx.request.findUnique({ where: { id: input.id } });

        if (!existing) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Request not found",
          });
        }

        if (existing.status !== RequestStatus.PENDING) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Only pending requests can be reviewed",
          });
        }

        const request = await tx.request.update({
          where: { id: input.id },
          data: {
            status: RequestStatus.IN_REVIEW,
            reviewedById: userId,
          },
        });

        await tx.requestHistory.create({
          data: {
            requestId: input.id,
            action: RequestAction.REVIEW_STARTED,
            changedById: userId,
          },
        });

        return request;
      });
    }),

  approve: protectedProcedure
    .input(approveInputSchema)
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;

      return db.$transaction(async (tx) => {
        const existing = await tx.request.findUnique({ where: { id: input.id } });

        if (!existing) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Request not found",
          });
        }

        if (existing.status !== RequestStatus.IN_REVIEW) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Only requests in review can be approved",
          });
        }

        if (existing.reviewedById !== userId) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "Only the assigned reviewer can approve this request",
          });
        }

        const request = await tx.request.update({
          where: { id: input.id },
          data: { status: RequestStatus.APPROVED },
        });

        await tx.requestHistory.create({
          data: {
            requestId: input.id,
            action: RequestAction.APPROVED,
            changedById: userId,
          },
        });

        return request;
      });
    }),

  reject: protectedProcedure
    .input(rejectInputSchema)
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;

      return db.$transaction(async (tx) => {
        const existing = await tx.request.findUnique({ where: { id: input.id } });

        if (!existing) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Request not found",
          });
        }

        if (existing.status !== RequestStatus.IN_REVIEW) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Only requests in review can be rejected",
          });
        }

        if (existing.reviewedById !== userId) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "Only the assigned reviewer can reject this request",
          });
        }

        const request = await tx.request.update({
          where: { id: input.id },
          data: {
            status: RequestStatus.REJECTED,
            rejectionReason: input.reason,
          },
        });

        await tx.requestHistory.create({
          data: {
            requestId: input.id,
            action: RequestAction.REJECTED,
            changedById: userId,
            newValues: { rejectionReason: input.reason },
          },
        });

        return request;
      });
    }),

  correct: protectedProcedure
    .input(correctInputSchema)
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;
      const { id, ...updateData } = input;

      return db.$transaction(async (tx) => {
        const existing = await tx.request.findUnique({ where: { id } });

        if (!existing) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Request not found",
          });
        }

        if (existing.status !== RequestStatus.REJECTED) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Only rejected requests can be corrected",
          });
        }

        const oldValues: Record<string, string | number | boolean | null> = {};
        const newValues: Record<string, string | number | boolean | null> = {};

        for (const [key, value] of Object.entries(updateData)) {
          if (value !== undefined) {
            const existingValue = existing[key as keyof typeof existing];
            oldValues[key] = existingValue instanceof Date 
              ? existingValue.toISOString() 
              : (existingValue as string | number | boolean | null);
            newValues[key] = value instanceof Date ? value.toISOString() : (value as string | number | boolean | null);
          }
        }

        const request = await tx.request.update({
          where: { id },
          data: {
            ...updateData,
            status: RequestStatus.PENDING,
            rejectionReason: null,
            reviewedById: null,
          },
        });

        await tx.requestHistory.create({
          data: {
            requestId: id,
            action: RequestAction.CORRECTED,
            changedById: userId,
            oldValues: Object.keys(oldValues).length > 0 ? oldValues : undefined,
            newValues: Object.keys(newValues).length > 0 ? newValues : undefined,
          },
        });

        return request;
      });
    }),

  cancel: protectedProcedure
    .input(cancelInputSchema)
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;

      return db.$transaction(async (tx) => {
        const existing = await tx.request.findUnique({ where: { id: input.id } });

        if (!existing) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Request not found",
          });
        }

        if (existing.status === RequestStatus.APPROVED) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Approved requests cannot be cancelled",
          });
        }

        const request = await tx.request.update({
          where: { id: input.id },
          data: { status: RequestStatus.CANCELLED },
        });

        await tx.requestHistory.create({
          data: {
            requestId: input.id,
            action: RequestAction.CANCELLED,
            changedById: userId,
          },
        });

        return request;
      });
    }),

  saveFieldValues: protectedProcedure
    .input(saveFieldValuesInputSchema)
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;
      const { requestId, fieldValues } = input;

      const request = await db.request.findUnique({
        where: { id: requestId },
        include: {
          contentType: {
            include: { fields: { where: { isActive: true } } },
          },
        },
      });

      if (!request) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Request not found" });
      }

      if (request.createdById !== userId) {
        throw new TRPCError({ code: "FORBIDDEN", message: "Only the creator can update field values" });
      }

      const fieldMap = new Map(request.contentType.fields.map((f) => [f.name, f]));

      return db.$transaction(async (tx) => {
        for (const [fieldName, value] of Object.entries(fieldValues)) {
          const field = fieldMap.get(fieldName);
          if (!field) continue;

          await tx.requestFieldValue.upsert({
            where: {
              requestId_fieldId: { requestId, fieldId: field.id },
            },
            create: {
              requestId,
              fieldId: field.id,
              value,
            },
            update: {
              value,
            },
          });
        }

        return { success: true };
      });
    }),

  advanceStep: protectedProcedure
    .input(advanceStepInputSchema)
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;

      return db.$transaction(async (tx) => {
        const request = await tx.request.findUnique({
          where: { id: input.id },
          include: {
            currentStep: {
              include: { approverArea: true },
            },
            fieldValues: {
              include: { field: { select: { id: true, name: true } } },
            },
            contentType: {
              include: { fields: { where: { isActive: true } } },
            },
          },
        });

        if (!request) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Request not found" });
        }

        if (!request.currentStep) {
          throw new TRPCError({ code: "BAD_REQUEST", message: "Request has no current workflow step" });
        }

        const canApprove = await canUserApprove(userId, request.currentStep);
        if (!canApprove) {
          throw new TRPCError({ code: "FORBIDDEN", message: "You are not authorized to approve this step" });
        }

        const fieldValuesMap = buildFieldValuesMap(
          request.fieldValues,
          request.contentType.fields
        );
        const validation = validateRequiredFields(request.currentStep, fieldValuesMap, "exit");
        if (!validation.valid) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: `Missing required fields: ${validation.missingFields.join(", ")}`,
          });
        }

        if (request.currentStep.isFinalStep) {
          const updated = await tx.request.update({
            where: { id: input.id },
            data: {
              status: RequestStatus.APPROVED,
              currentStepId: null,
            },
          });

          await tx.requestHistory.create({
            data: {
              requestId: input.id,
              action: RequestAction.APPROVED,
              changedById: userId,
              newValues: { completedStep: request.currentStep.name },
            },
          });

          return updated;
        }

        const nextStep = await getNextStep(request.contentTypeId, request.currentStep.order);
        if (!nextStep) {
          throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "No next step found in workflow" });
        }

        const updated = await tx.request.update({
          where: { id: input.id },
          data: {
            currentStepId: nextStep.id,
            status: RequestStatus.IN_REVIEW,
          },
        });

        await tx.requestHistory.create({
          data: {
            requestId: input.id,
            action: RequestAction.APPROVED,
            changedById: userId,
            newValues: {
              fromStep: request.currentStep.name,
              toStep: nextStep.name,
            },
          },
        });

        return updated;
      });
    }),

  rejectToStep: protectedProcedure
    .input(rejectToStepInputSchema)
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;

      return db.$transaction(async (tx) => {
        const request = await tx.request.findUnique({
          where: { id: input.id },
          include: {
            currentStep: {
              include: { approverArea: true },
            },
          },
        });

        if (!request) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Request not found" });
        }

        if (!request.currentStep) {
          throw new TRPCError({ code: "BAD_REQUEST", message: "Request has no current workflow step" });
        }

        const canApprove = await canUserApprove(userId, request.currentStep);
        if (!canApprove) {
          throw new TRPCError({ code: "FORBIDDEN", message: "You are not authorized to reject this step" });
        }

        const targetStep = await validateStepBelongsToContentType(input.targetStepId, request.contentTypeId);
        if (!targetStep) {
          throw new TRPCError({ code: "BAD_REQUEST", message: "Invalid target step" });
        }

        if (targetStep.order >= request.currentStep.order) {
          throw new TRPCError({ code: "BAD_REQUEST", message: "Can only reject to an earlier step" });
        }

        const updated = await tx.request.update({
          where: { id: input.id },
          data: {
            currentStepId: input.targetStepId,
            status: RequestStatus.REJECTED,
            rejectionReason: input.reason,
          },
        });

        await tx.requestHistory.create({
          data: {
            requestId: input.id,
            action: RequestAction.REJECTED,
            changedById: userId,
            newValues: {
              fromStep: request.currentStep.name,
              toStep: targetStep.name,
              rejectionReason: input.reason,
            },
          },
        });

        return updated;
      });
    }),

  getPreviousStepsForReject: protectedProcedure
    .input(z.object({ requestId: z.string().cuid() }))
    .query(async ({ input }) => {
      const request = await db.request.findUnique({
        where: { id: input.requestId },
        include: { currentStep: true },
      });

      if (!request || !request.currentStep) {
        return [];
      }

      return getPreviousSteps(request.contentTypeId, request.currentStep.order);
    }),

  initializeWorkflow: protectedProcedure
    .input(z.object({ requestId: z.string().cuid() }))
    .mutation(async ({ input }) => {
      const request = await db.request.findUnique({
        where: { id: input.requestId },
      });

      if (!request) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Request not found" });
      }

      if (request.currentStepId) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Request already has a workflow step" });
      }

      const firstStep = await getFirstStep(request.contentTypeId);
      if (!firstStep) {
        return request;
      }

      return db.request.update({
        where: { id: input.requestId },
        data: {
          currentStepId: firstStep.id,
          status: RequestStatus.PENDING,
        },
      });
    }),
});
