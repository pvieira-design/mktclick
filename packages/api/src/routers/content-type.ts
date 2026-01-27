import { TRPCError } from "@trpc/server";
import { z } from "zod";

import db from "@marketingclickcannabis/db";

import { adminProcedure, publicProcedure, router } from "../index";

export const contentTypeRouter = router({
  list: publicProcedure.query(async () => {
    const items = await db.contentType.findMany({
      where: { isActive: true },
      orderBy: { name: "asc" },
    });
    return { items };
  }),

  getById: publicProcedure
    .input(z.object({ id: z.string().cuid() }))
    .query(async ({ input }) => {
      const contentType = await db.contentType.findUnique({
        where: { id: input.id },
      });
      if (!contentType) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "ContentType not found",
        });
      }
      return contentType;
    }),

  create: adminProcedure
    .input(
      z.object({
        name: z.string().min(3).max(100),
        slug: z.string().regex(/^[a-z0-9-]+$/),
        description: z.string().optional(),
        icon: z.string().optional(),
        color: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
      })
    )
    .mutation(async ({ input }) => {
      const existingSlug = await db.contentType.findUnique({
        where: { slug: input.slug },
      });
      if (existingSlug) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "Slug already exists",
        });
      }

      const contentType = await db.contentType.create({
        data: {
          name: input.name,
          slug: input.slug,
          description: input.description,
          icon: input.icon,
          color: input.color,
          isActive: true,
        },
      });
      return contentType;
    }),

  update: adminProcedure
    .input(
      z.object({
        id: z.string().cuid(),
        name: z.string().min(3).max(100).optional(),
        slug: z.string().regex(/^[a-z0-9-]+$/).optional(),
        description: z.string().optional(),
        icon: z.string().optional(),
        color: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
        isActive: z.boolean().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const contentType = await db.contentType.findUnique({
        where: { id: input.id },
      });
      if (!contentType) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "ContentType not found",
        });
      }

      if (input.slug && input.slug !== contentType.slug) {
        const existingSlug = await db.contentType.findUnique({
          where: { slug: input.slug },
        });
        if (existingSlug) {
          throw new TRPCError({
            code: "CONFLICT",
            message: "Slug already exists",
          });
        }
      }

      const updated = await db.contentType.update({
        where: { id: input.id },
        data: {
          name: input.name,
          slug: input.slug,
          description: input.description,
          icon: input.icon,
          color: input.color,
          isActive: input.isActive,
        },
      });
      return updated;
    }),

  toggleActive: adminProcedure
    .input(z.object({ id: z.string().cuid() }))
    .mutation(async ({ input }) => {
      const contentType = await db.contentType.findUnique({
        where: { id: input.id },
      });
      if (!contentType) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "ContentType not found",
        });
      }

      const updated = await db.contentType.update({
        where: { id: input.id },
        data: { isActive: !contentType.isActive },
      });
      return updated;
    }),
});
