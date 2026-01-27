import { TRPCError } from "@trpc/server";
import { z } from "zod";

import db from "@marketingclickcannabis/db";

import { adminProcedure, publicProcedure, router } from "../index";

export const areaRouter = router({
  list: publicProcedure.query(async () => {
    const items = await db.area.findMany({
      where: { isActive: true },
      include: { _count: { select: { members: true } } },
      orderBy: { name: "asc" },
    });
    return { items };
  }),

  getById: publicProcedure
    .input(z.object({ id: z.string().cuid() }))
    .query(async ({ input }) => {
      const area = await db.area.findUnique({
        where: { id: input.id },
        include: { _count: { select: { members: true } } },
      });
      if (!area) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Area not found",
        });
      }
      return area;
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
      const existingSlug = await db.area.findUnique({
        where: { slug: input.slug },
      });
      if (existingSlug) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "Slug already exists",
        });
      }

      const area = await db.area.create({
        data: {
          name: input.name,
          slug: input.slug,
          description: input.description,
          isActive: true,
        },
      });
      return area;
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
      const area = await db.area.findUnique({
        where: { id: input.id },
      });
      if (!area) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Area not found",
        });
      }

      if (input.slug && input.slug !== area.slug) {
        const existingSlug = await db.area.findUnique({
          where: { slug: input.slug },
        });
        if (existingSlug) {
          throw new TRPCError({
            code: "CONFLICT",
            message: "Slug already exists",
          });
        }
      }

      const updated = await db.area.update({
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
      const area = await db.area.findUnique({
        where: { id: input.id },
      });
      if (!area) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Area not found",
        });
      }

      const updated = await db.area.update({
        where: { id: input.id },
        data: { isActive: !area.isActive },
      });
      return updated;
    }),

  getMembers: publicProcedure
    .input(z.object({ areaId: z.string().cuid() }))
    .query(async ({ input }) => {
      const members = await db.areaMember.findMany({
        where: { areaId: input.areaId },
        include: {
          user: {
            select: { id: true, name: true, email: true, image: true },
          },
        },
        orderBy: [
          { position: "asc" },
        ],
      });
      return { members };
    }),

  getAvailableUsers: adminProcedure
    .input(z.object({ areaId: z.string().cuid() }))
    .query(async ({ input }) => {
      // Get users not already in this area
      const existingMemberIds = await db.areaMember.findMany({
        where: { areaId: input.areaId },
        select: { userId: true },
      });
      const memberIds = existingMemberIds.map(m => m.userId);
      
      const users = await db.user.findMany({
        where: {
          id: { notIn: memberIds },
        },
        select: { id: true, name: true, email: true, image: true },
        orderBy: { name: "asc" },
      });
      return { users };
    }),

  addMember: adminProcedure
    .input(
      z.object({
        areaId: z.string().cuid(),
        userId: z.string().cuid(),
        position: z.enum(["HEAD", "COORDINATOR", "STAFF"]),
      })
    )
    .mutation(async ({ input }) => {
      // Check area exists
      const area = await db.area.findUnique({ where: { id: input.areaId } });
      if (!area) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Area not found" });
      }

      // Check user exists
      const user = await db.user.findUnique({ where: { id: input.userId } });
      if (!user) {
        throw new TRPCError({ code: "NOT_FOUND", message: "User not found" });
      }

      // Check user not already in area
      const existingMember = await db.areaMember.findUnique({
        where: { userId_areaId: { userId: input.userId, areaId: input.areaId } },
      });
      if (existingMember) {
        throw new TRPCError({ code: "CONFLICT", message: "User is already a member of this area" });
      }

      // Validate position limits: max 1 HEAD, max 1 COORDINATOR
      if (input.position === "HEAD" || input.position === "COORDINATOR") {
        const existingPosition = await db.areaMember.findFirst({
          where: { areaId: input.areaId, position: input.position },
        });
        if (existingPosition) {
          throw new TRPCError({
            code: "CONFLICT",
            message: `Area already has a ${input.position}. Remove the existing one first.`,
          });
        }
      }

      const member = await db.areaMember.create({
        data: {
          areaId: input.areaId,
          userId: input.userId,
          position: input.position,
        },
        include: {
          user: { select: { id: true, name: true, email: true, image: true } },
        },
      });
      return member;
    }),

  removeMember: adminProcedure
    .input(z.object({ memberId: z.string().cuid() }))
    .mutation(async ({ input }) => {
      const member = await db.areaMember.findUnique({
        where: { id: input.memberId },
      });
      if (!member) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Member not found" });
      }

      await db.areaMember.delete({ where: { id: input.memberId } });
      return { success: true };
    }),

  updateMemberPosition: adminProcedure
    .input(
      z.object({
        memberId: z.string().cuid(),
        position: z.enum(["HEAD", "COORDINATOR", "STAFF"]),
      })
    )
    .mutation(async ({ input }) => {
      return db.$transaction(async (tx) => {
        const member = await tx.areaMember.findUnique({
          where: { id: input.memberId },
          include: { area: true },
        });
        if (!member) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Member not found" });
        }

        // If promoting to HEAD/COORDINATOR, demote existing
        if (input.position !== "STAFF") {
          const existing = await tx.areaMember.findFirst({
            where: { areaId: member.areaId, position: input.position },
          });
          if (existing && existing.id !== input.memberId) {
            await tx.areaMember.update({
              where: { id: existing.id },
              data: { position: "STAFF" },
            });
          }
        }

        return tx.areaMember.update({
          where: { id: input.memberId },
          data: { position: input.position },
          include: {
            user: { select: { id: true, name: true, email: true, image: true } },
          },
        });
      });
    }),
});
