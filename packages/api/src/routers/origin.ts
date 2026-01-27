import { TRPCError } from "@trpc/server";
import { z } from "zod";

import db from "@marketingclickcannabis/db";

import { adminProcedure, publicProcedure, router } from "../index";

export const originRouter = router({
  list: publicProcedure.query(async () => {
    const items = await db.origin.findMany({
      where: { isActive: true },
      orderBy: { name: "asc" },
    });
    return { items };
  }),

  getById: publicProcedure
    .input(z.object({ id: z.string().cuid() }))
    .query(async ({ input }) => {
      const origin = await db.origin.findUnique({
        where: { id: input.id },
      });
      if (!origin) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Origin not found",
        });
      }
      return origin;
    }),

  create: adminProcedure
    .input(
      z.object({
        name: z.string().min(3).max(100),
        slug: z.string().regex(/^[a-z0-9-]+$/),
        description: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const existingSlug = await db.origin.findUnique({
        where: { slug: input.slug },
      });
      if (existingSlug) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "Slug already exists",
        });
      }

      const origin = await db.origin.create({
        data: {
          name: input.name,
          slug: input.slug,
          description: input.description,
          isActive: true,
        },
      });
      return origin;
    }),

  update: adminProcedure
    .input(
      z.object({
        id: z.string().cuid(),
        name: z.string().min(3).max(100).optional(),
        slug: z.string().regex(/^[a-z0-9-]+$/).optional(),
        description: z.string().optional(),
        isActive: z.boolean().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const origin = await db.origin.findUnique({
        where: { id: input.id },
      });
      if (!origin) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Origin not found",
        });
      }

      if (input.slug && input.slug !== origin.slug) {
        const existingSlug = await db.origin.findUnique({
          where: { slug: input.slug },
        });
        if (existingSlug) {
          throw new TRPCError({
            code: "CONFLICT",
            message: "Slug already exists",
          });
        }
      }

      const updated = await db.origin.update({
        where: { id: input.id },
        data: {
          name: input.name,
          slug: input.slug,
          description: input.description,
          isActive: input.isActive,
        },
      });
      return updated;
    }),

  toggleActive: adminProcedure
    .input(z.object({ id: z.string().cuid() }))
    .mutation(async ({ input }) => {
      const origin = await db.origin.findUnique({
        where: { id: input.id },
      });
      if (!origin) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Origin not found",
        });
      }

      const updated = await db.origin.update({
        where: { id: input.id },
        data: { isActive: !origin.isActive },
      });
      return updated;
    }),
});
