import { TRPCError } from "@trpc/server";
import { z } from "zod";

import db from "@marketingclickcannabis/db";
import { protectedProcedure, router } from "../index";

const listInputSchema = z.object({
  type: z.string().optional(),
  tagId: z.string().cuid().optional(),
  isArchived: z.boolean().optional(),
  search: z.string().optional(),
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().max(100).default(20),
});

export const fileRouter = router({
  list: protectedProcedure.input(listInputSchema).query(async ({ input }) => {
    const { type, tagId, isArchived, search, page, limit } = input;
    const skip = (page - 1) * limit;

    const where = {
      ...(type && { mimeType: { startsWith: type } }),
      ...(tagId && {
        tags: {
          some: { tagId },
        },
      }),
      ...(isArchived !== undefined && { isArchived }),
      ...(search && {
        OR: [
          { name: { contains: search, mode: "insensitive" as const } },
          { description: { contains: search, mode: "insensitive" as const } },
        ],
      }),
    };

    const [items, total] = await Promise.all([
      db.file.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          tags: {
            include: {
              tag: true,
            },
          },
          uploadedBy: {
            select: {
              id: true,
              name: true,
              email: true,
              image: true,
            },
          },
        },
      }),
      db.file.count({ where }),
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
      const file = await db.file.findUnique({
        where: { id: input.id },
        include: {
          tags: {
            include: {
              tag: true,
            },
          },
          uploadedBy: {
            select: {
              id: true,
              name: true,
              email: true,
              image: true,
            },
          },
          requests: {
            include: {
              request: {
                select: {
                  id: true,
                  title: true,
                  status: true,
                },
              },
            },
          },
        },
      });

      if (!file) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "File not found",
        });
      }

      return file;
    }),

  getByRequestId: protectedProcedure
    .input(z.object({ requestId: z.string().cuid() }))
    .query(async ({ input }) => {
      const files = await db.requestFile.findMany({
        where: { requestId: input.requestId },
        include: {
          file: {
            include: {
              tags: {
                include: {
                  tag: true,
                },
              },
            },
          },
        },
        orderBy: { createdAt: "asc" },
      });

      return files.map((rf) => rf.file);
    }),

  update: protectedProcedure
    .input(
      z.object({
        id: z.string().cuid(),
        name: z.string().min(1).max(255).optional(),
        description: z.string().max(2000).optional().nullable(),
        tagIds: z.array(z.string().cuid()).optional(),
      })
    )
    .mutation(async ({ input }) => {
      const { id, tagIds, ...updateData } = input;

      const file = await db.file.findUnique({ where: { id } });
      if (!file) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "File not found",
        });
      }

      return db.$transaction(async (tx) => {
        if (tagIds !== undefined) {
          await tx.fileTagOnFile.deleteMany({ where: { fileId: id } });
          if (tagIds.length > 0) {
            await tx.fileTagOnFile.createMany({
              data: tagIds.map((tagId) => ({
                fileId: id,
                tagId,
              })),
            });
          }
        }

        const updated = await tx.file.update({
          where: { id },
          data: updateData,
          include: {
            tags: {
              include: {
                tag: true,
              },
            },
            uploadedBy: {
              select: {
                id: true,
                name: true,
                email: true,
                image: true,
              },
            },
          },
        });

        return updated;
      });
    }),

  archive: protectedProcedure
    .input(z.object({ id: z.string().cuid() }))
    .mutation(async ({ input }) => {
      const file = await db.file.findUnique({ where: { id: input.id } });

      if (!file) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "File not found",
        });
      }

      return db.file.update({
        where: { id: input.id },
        data: { isArchived: true },
      });
    }),

  unarchive: protectedProcedure
    .input(z.object({ id: z.string().cuid() }))
    .mutation(async ({ input }) => {
      const file = await db.file.findUnique({ where: { id: input.id } });

      if (!file) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "File not found",
        });
      }

      return db.file.update({
        where: { id: input.id },
        data: { isArchived: false },
      });
    }),
});
