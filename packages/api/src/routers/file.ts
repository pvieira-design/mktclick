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
          creator: {
            select: {
              id: true,
              name: true,
              type: true,
            },
          },
          origin: {
            select: {
              id: true,
              name: true,
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
          creator: {
            select: {
              id: true,
              name: true,
              type: true,
            },
          },
          origin: {
            select: {
              id: true,
              name: true,
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
        thumbnailUrl: z.string().url().optional().nullable(),
        tagIds: z.array(z.string().cuid()).optional(),
        creatorId: z.string().cuid().optional().nullable(),
        originId: z.string().cuid().optional().nullable(),
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
            creator: {
              select: {
                id: true,
                name: true,
                type: true,
              },
            },
            origin: {
              select: {
                id: true,
                name: true,
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

  bulkUpdateTags: protectedProcedure
    .input(
      z.object({
        ids: z.array(z.string().cuid()).min(1).max(200),
        tagIds: z.array(z.string().cuid()),
      })
    )
    .mutation(async ({ input }) => {
      const { ids, tagIds } = input;
      return db.$transaction(async (tx) => {
        await tx.fileTagOnFile.deleteMany({ where: { fileId: { in: ids } } });
        if (tagIds.length > 0) {
          await tx.fileTagOnFile.createMany({
            data: ids.flatMap((fileId) =>
              tagIds.map((tagId) => ({ fileId, tagId }))
            ),
          });
        }
        return { count: ids.length };
      });
    }),

  bulkUpdateCreator: protectedProcedure
    .input(
      z.object({
        ids: z.array(z.string().cuid()).min(1).max(200),
        creatorId: z.string().cuid().nullable(),
      })
    )
    .mutation(async ({ input }) => {
      const result = await db.file.updateMany({
        where: { id: { in: input.ids } },
        data: { creatorId: input.creatorId },
      });
      return { count: result.count };
    }),

  bulkArchive: protectedProcedure
    .input(
      z.object({
        ids: z.array(z.string().cuid()).min(1).max(200),
      })
    )
    .mutation(async ({ input }) => {
      const result = await db.file.updateMany({
        where: { id: { in: input.ids } },
        data: { isArchived: true },
      });
      return { count: result.count };
    }),

  bulkRename: protectedProcedure
    .input(
      z.object({
        ids: z.array(z.string().cuid()).min(1).max(200),
        prefix: z.string().max(100).default(""),
        suffix: z.string().max(100).default(""),
      })
    )
    .mutation(async ({ input }) => {
      const { ids, prefix, suffix } = input;
      return db.$transaction(async (tx) => {
        for (let i = 0; i < ids.length; i++) {
          await tx.file.update({
            where: { id: ids[i] },
            data: { name: `${prefix}${i + 1}${suffix}` },
          });
        }
        return { count: ids.length };
      });
    }),
});
