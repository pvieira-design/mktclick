import { TRPCError } from "@trpc/server";
import { z } from "zod";

import db from "@marketingclickcannabis/db";
import { adminProcedure, protectedProcedure, router } from "../index";

export const fileTagRouter = router({
  list: protectedProcedure.query(async () => {
    const items = await db.fileTag.findMany({
      orderBy: { name: "asc" },
      include: {
        _count: {
          select: { files: true },
        },
      },
    });
    return { items };
  }),

  create: protectedProcedure
    .input(z.object({ name: z.string().min(1).max(50) }))
    .mutation(async ({ input }) => {
      const existing = await db.fileTag.findUnique({
        where: { name: input.name },
      });

      if (existing) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "Tag with this name already exists",
        });
      }

      return db.fileTag.create({
        data: { name: input.name },
      });
    }),

  update: adminProcedure
    .input(
      z.object({
        id: z.string().cuid(),
        name: z.string().min(1).max(50),
      })
    )
    .mutation(async ({ input }) => {
      const tag = await db.fileTag.findUnique({ where: { id: input.id } });

      if (!tag) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Tag not found",
        });
      }

      const existing = await db.fileTag.findFirst({
        where: { name: input.name, id: { not: input.id } },
      });

      if (existing) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "Tag with this name already exists",
        });
      }

      return db.fileTag.update({
        where: { id: input.id },
        data: { name: input.name },
      });
    }),

  delete: adminProcedure
    .input(z.object({ id: z.string().cuid() }))
    .mutation(async ({ input }) => {
      const tag = await db.fileTag.findUnique({
        where: { id: input.id },
        include: {
          _count: { select: { files: true } },
        },
      });

      if (!tag) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Tag not found",
        });
      }

      if (tag._count.files > 0) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: `Tag is in use by ${tag._count.files} file(s). Remove the tag from all files before deleting.`,
        });
      }

      await db.fileTag.delete({ where: { id: input.id } });
      return { success: true };
    }),

  getUsageCount: protectedProcedure
    .input(z.object({ id: z.string().cuid() }))
    .query(async ({ input }) => {
      const tag = await db.fileTag.findUnique({
        where: { id: input.id },
        include: {
          _count: { select: { files: true } },
        },
      });

      if (!tag) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Tag not found",
        });
      }

      return { count: tag._count.files };
    }),
});
