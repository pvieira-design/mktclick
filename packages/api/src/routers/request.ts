import { TRPCError } from "@trpc/server";
import { z } from "zod";

import db, {
  ContentType,
  Patologia,
  Priority,
  RequestAction,
  RequestOrigin,
  RequestStatus,
} from "@marketingclickcannabis/db";

import { protectedProcedure, router } from "../index";

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
  contentType: z.nativeEnum(ContentType),
  origin: z.nativeEnum(RequestOrigin),
  priority: z.nativeEnum(Priority).optional(),
  deadline: z.coerce.date().optional(),
  patologia: z.nativeEnum(Patologia).optional(),
});

const updateInputSchema = z.object({
  id: z.string().cuid(),
  title: z.string().min(3).max(200).optional(),
  description: z.string().min(10).max(5000).optional(),
  contentType: z.nativeEnum(ContentType).optional(),
  origin: z.nativeEnum(RequestOrigin).optional(),
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
  contentType: z.nativeEnum(ContentType).optional(),
  origin: z.nativeEnum(RequestOrigin).optional(),
  priority: z.nativeEnum(Priority).optional(),
  deadline: z.coerce.date().optional(),
  patologia: z.nativeEnum(Patologia).optional(),
});

const cancelInputSchema = z.object({
  id: z.string().cuid(),
});

export const requestRouter = router({
  list: protectedProcedure.input(listInputSchema).query(async ({ input }) => {
    const { status, contentType, search, page, limit } = input;
    const skip = (page - 1) * limit;

    const where = {
      ...(status && { status: status as RequestStatus }),
      ...(contentType && { contentType: contentType as ContentType }),
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
          createdBy: true,
          reviewedBy: true,
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

      return request;
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
            contentType: input.contentType,
            origin: input.origin,
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
              contentType: input.contentType,
              origin: input.origin,
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

        if (!existing.title || !existing.description || !existing.contentType || !existing.origin) {
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
});
