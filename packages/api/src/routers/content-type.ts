import { TRPCError } from "@trpc/server";
import { z } from "zod";

import db from "@marketingclickcannabis/db";

import { adminProcedure, publicProcedure, router } from "../index";

export const contentTypeRouter = router({
  list: publicProcedure
    .input(
      z.object({
        search: z.string().optional(),
        isActive: z.enum(["all", "active", "inactive"]).optional().default("all"),
        page: z.number().int().positive().optional().default(1),
        limit: z.number().int().positive().max(100).optional().default(50),
      }).optional()
    )
    .query(async ({ input }) => {
      const { search, isActive, page, limit } = input ?? { isActive: "all", page: 1, limit: 50 };
      
      const where: any = {};
      
      if (search) {
        where.OR = [
          { name: { contains: search, mode: "insensitive" } },
          { slug: { contains: search, mode: "insensitive" } },
          { description: { contains: search, mode: "insensitive" } },
        ];
      }
      
      if (isActive === "active") {
        where.isActive = true;
      } else if (isActive === "inactive") {
        where.isActive = false;
      }
      
      const [items, total] = await Promise.all([
        db.contentType.findMany({
          where,
          orderBy: { name: "asc" },
          skip: ((page ?? 1) - 1) * (limit ?? 50),
          take: limit ?? 50,
        }),
        db.contentType.count({ where }),
      ]);
      
      return { 
        items, 
        total,
        page: page ?? 1,
        limit: limit ?? 50,
        hasMore: ((page ?? 1) * (limit ?? 50)) < total,
      };
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
