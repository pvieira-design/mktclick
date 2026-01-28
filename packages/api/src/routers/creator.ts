import { TRPCError } from "@trpc/server";
import { z } from "zod";

import db, { CreatorType } from "@marketingclickcannabis/db";

import { adminProcedure, protectedProcedure, router } from "../index";

export const creatorRouter = router({
  list: protectedProcedure
    .input(
      z.object({
        search: z.string().optional(),
        type: z.nativeEnum(CreatorType).optional(),
        responsibleId: z.string().optional(),
        isActive: z.boolean().optional(),
        page: z.number().int().positive().default(1),
        limit: z.number().int().positive().max(100).default(20),
      })
    )
    .query(async ({ input }) => {
      const { search, type, responsibleId, isActive, page, limit } = input;
      const skip = (page - 1) * limit;

      const where = {
        ...(search && {
          OR: [
            { name: { contains: search, mode: "insensitive" as const } },
            { email: { contains: search, mode: "insensitive" as const } },
            { instagram: { contains: search, mode: "insensitive" as const } },
          ],
        }),
        ...(type && { type }),
        ...(responsibleId && { responsibleId }),
        ...(isActive !== undefined && { isActive }),
      };

      const [items, total] = await Promise.all([
        db.creator.findMany({
          where,
          skip,
          take: limit,
          orderBy: { createdAt: "desc" },
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            instagram: true,
            type: true,
            isActive: true,
            responsibleId: true,
            responsible: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
            createdAt: true,
            updatedAt: true,
          },
        }),
        db.creator.count({ where }),
      ]);

      return {
        items,
        total,
        hasMore: skip + items.length < total,
      };
    }),

  getById: protectedProcedure
    .input(z.object({ id: z.string().cuid() }))
    .query(async ({ input }) => {
      const creator = await db.creator.findUnique({
        where: { id: input.id },
        include: {
          responsible: {
            select: {
              id: true,
              name: true,
              email: true,
              image: true,
            },
          },
        },
      });

      if (!creator) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Creator not found",
        });
      }

      return creator;
    }),

  create: adminProcedure
    .input(
      z.object({
        name: z.string().min(2).max(100),
        email: z.string().email().optional(),
        phone: z.string().optional(),
        instagram: z.string().optional(),
        type: z.nativeEnum(CreatorType),
        responsibleId: z.string().cuid(),
        notes: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const responsible = await db.user.findUnique({
        where: { id: input.responsibleId },
      });

      if (!responsible) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Responsible user not found",
        });
      }

      if (input.email) {
        const existingEmail = await db.creator.findFirst({
          where: { email: input.email },
        });

        if (existingEmail) {
          throw new TRPCError({
            code: "CONFLICT",
            message: "Email already in use by another creator",
          });
        }
      }

      const creator = await db.creator.create({
        data: {
          name: input.name,
          email: input.email,
          phone: input.phone,
          instagram: input.instagram,
          type: input.type,
          responsibleId: input.responsibleId,
          notes: input.notes,
          isActive: true,
        },
        include: {
          responsible: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      });

      return creator;
    }),

  update: adminProcedure
    .input(
      z.object({
        id: z.string().cuid(),
        name: z.string().min(2).max(100).optional(),
        email: z.string().email().optional(),
        phone: z.string().optional(),
        instagram: z.string().optional(),
        type: z.nativeEnum(CreatorType).optional(),
        responsibleId: z.string().cuid().optional(),
        notes: z.string().optional(),
        isActive: z.boolean().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const { id, ...updateData } = input;

      const creator = await db.creator.findUnique({ where: { id } });
      if (!creator) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Creator not found",
        });
      }

      if (updateData.responsibleId) {
        const responsible = await db.user.findUnique({
          where: { id: updateData.responsibleId },
        });

        if (!responsible) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Responsible user not found",
          });
        }
      }

      if (updateData.email && updateData.email !== creator.email) {
        const existingEmail = await db.creator.findFirst({
          where: { email: updateData.email, id: { not: id } },
        });

        if (existingEmail) {
          throw new TRPCError({
            code: "CONFLICT",
            message: "Email already in use by another creator",
          });
        }
      }

      const updated = await db.creator.update({
        where: { id },
        data: updateData,
        include: {
          responsible: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      });

      return updated;
    }),

  delete: adminProcedure
    .input(z.object({ id: z.string().cuid() }))
    .mutation(async ({ input }) => {
      const creator = await db.creator.findUnique({
        where: { id: input.id },
      });

      if (!creator) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Creator not found",
        });
      }

      const updated = await db.creator.update({
        where: { id: input.id },
        data: { isActive: false },
      });

      return updated;
    }),

  toggleActive: adminProcedure
    .input(z.object({ id: z.string().cuid() }))
    .mutation(async ({ input }) => {
      const creator = await db.creator.findUnique({
        where: { id: input.id },
      });

      if (!creator) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Creator not found",
        });
      }

      const updated = await db.creator.update({
        where: { id: input.id },
        data: { isActive: !creator.isActive },
      });

      return updated;
    }),
});
