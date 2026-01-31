import { TRPCError } from "@trpc/server";
import { z } from "zod";

import db from "@marketingclickcannabis/db";
import { protectedProcedure, router } from "../index";

export const fileFolderRouter = router({
  list: protectedProcedure
    .input(
      z.object({
        parentId: z.string().cuid().nullable().optional(),
      }).optional()
    )
    .query(async ({ input }) => {
      const parentId = input?.parentId ?? null;

      const folders = await db.fileFolder.findMany({
        where: { parentId },
        orderBy: { name: "asc" },
        include: {
          _count: {
            select: {
              children: true,
              files: true,
            },
          },
        },
      });

      return { items: folders };
    }),

  getBreadcrumbs: protectedProcedure
    .input(z.object({ folderId: z.string().cuid() }))
    .query(async ({ input }) => {
      const breadcrumbs: Array<{ id: string; name: string }> = [];
      let currentId: string | null = input.folderId;

      while (currentId) {
        const result = await (db.fileFolder.findUnique as Function)({
          where: { id: currentId },
          select: { id: true, name: true, parentId: true },
        }) as { id: string; name: string; parentId: string | null } | null;

        if (!result) break;

        breadcrumbs.unshift({ id: result.id, name: result.name });
        currentId = result.parentId;
      }

      return breadcrumbs;
    }),

  create: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1).max(255),
        parentId: z.string().cuid().nullable().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const { name, parentId } = input;

      if (parentId) {
        const parent = await db.fileFolder.findUnique({ where: { id: parentId } });
        if (!parent) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Pasta pai não encontrada",
          });
        }
      }

      return db.fileFolder.create({
        data: {
          name,
          parentId: parentId ?? null,
        },
        include: {
          _count: {
            select: {
              children: true,
              files: true,
            },
          },
        },
      });
    }),

  rename: protectedProcedure
    .input(
      z.object({
        id: z.string().cuid(),
        name: z.string().min(1).max(255),
      })
    )
    .mutation(async ({ input }) => {
      const folder = await db.fileFolder.findUnique({ where: { id: input.id } });

      if (!folder) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Pasta não encontrada",
        });
      }

      return db.fileFolder.update({
        where: { id: input.id },
        data: { name: input.name },
      });
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string().cuid() }))
    .mutation(async ({ input }) => {
      const folder = await db.fileFolder.findUnique({ where: { id: input.id } });

      if (!folder) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Pasta não encontrada",
        });
      }

      await moveFilesToParentRecursively(input.id, folder.parentId);

      await db.fileFolder.delete({ where: { id: input.id } });

      return { success: true };
    }),

  moveFiles: protectedProcedure
    .input(
      z.object({
        fileIds: z.array(z.string().cuid()).min(1).max(200),
        folderId: z.string().cuid().nullable(),
      })
    )
    .mutation(async ({ input }) => {
      const { fileIds, folderId } = input;

      if (folderId) {
        const folder = await db.fileFolder.findUnique({ where: { id: folderId } });
        if (!folder) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Pasta de destino não encontrada",
          });
        }
      }

      const result = await db.file.updateMany({
        where: { id: { in: fileIds } },
        data: { folderId },
      });

      return { count: result.count };
    }),

  moveFolder: protectedProcedure
    .input(
      z.object({
        id: z.string().cuid(),
        parentId: z.string().cuid().nullable(),
      })
    )
    .mutation(async ({ input }) => {
      const { id, parentId } = input;

      const folder = await db.fileFolder.findUnique({ where: { id } });
      if (!folder) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Pasta não encontrada",
        });
      }

      if (parentId) {
        const isDescendant = await checkIsDescendant(parentId, id);
        if (isDescendant) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Não é possível mover uma pasta para dentro de si mesma",
          });
        }
      }

      return db.fileFolder.update({
        where: { id },
        data: { parentId },
      });
    }),
});

async function moveFilesToParentRecursively(folderId: string, targetParentId: string | null) {
  await db.file.updateMany({
    where: { folderId },
    data: { folderId: targetParentId },
  });

  const subfolders = await db.fileFolder.findMany({
    where: { parentId: folderId },
    select: { id: true },
  });

  for (const subfolder of subfolders) {
    await moveFilesToParentRecursively(subfolder.id, targetParentId);
  }
}

async function checkIsDescendant(potentialDescendantId: string, ancestorId: string): Promise<boolean> {
  if (potentialDescendantId === ancestorId) return true;

  let currentId: string | null = potentialDescendantId;
  const visited = new Set<string>();

  while (currentId) {
    if (visited.has(currentId)) break;
    visited.add(currentId);

    if (currentId === ancestorId) return true;

    const result = await (db.fileFolder.findUnique as Function)({
      where: { id: currentId },
      select: { parentId: true },
    }) as { parentId: string | null } | null;

    currentId = result?.parentId ?? null;
  }

  return false;
}
