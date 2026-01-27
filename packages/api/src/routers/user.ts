import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { createId } from "@paralleldrive/cuid2";

import db, { UserRole, AreaPosition } from "@marketingclickcannabis/db";

import { adminProcedure, protectedProcedure, router } from "../index";

export const userRouter = router({
  list: adminProcedure
    .input(
      z.object({
        search: z.string().optional(),
        role: z.nativeEnum(UserRole).optional(),
        page: z.number().int().positive().default(1),
        limit: z.number().int().positive().max(100).default(20),
      })
    )
    .query(async ({ input }) => {
      const { search, role, page, limit } = input;
      const skip = (page - 1) * limit;

      const where = {
        ...(search && {
          OR: [
            { name: { contains: search, mode: "insensitive" as const } },
            { email: { contains: search, mode: "insensitive" as const } },
          ],
        }),
        ...(role && { role }),
      };

      const [items, total] = await Promise.all([
        db.user.findMany({
          where,
          skip,
          take: limit,
          orderBy: { createdAt: "desc" },
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            image: true,
            banned: true,
            mustChangePassword: true,
            createdAt: true,
            _count: { select: { areaMemberships: true } },
          },
        }),
        db.user.count({ where }),
      ]);

      return {
        items,
        total,
        hasMore: skip + items.length < total,
      };
    }),

  getById: adminProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => {
      const user = await db.user.findUnique({
        where: { id: input.id },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          image: true,
          banned: true,
          banReason: true,
          banExpires: true,
          mustChangePassword: true,
          emailVerified: true,
          createdAt: true,
          updatedAt: true,
          areaMemberships: {
            include: {
              area: { select: { id: true, name: true, slug: true } },
            },
          },
        },
      });

      if (!user) {
        throw new TRPCError({ code: "NOT_FOUND", message: "User not found" });
      }

      return user;
    }),

  create: adminProcedure
    .input(
      z.object({
        email: z.string().email(),
        name: z.string().min(2).max(100),
        password: z.string().min(8),
        role: z.nativeEnum(UserRole).default(UserRole.USER),
        areaAssignments: z
          .array(
            z.object({
              areaId: z.string().cuid(),
              position: z.nativeEnum(AreaPosition),
            })
          )
          .optional(),
      })
    )
    .mutation(async ({ input }) => {
      const existingUser = await db.user.findUnique({
        where: { email: input.email },
      });

      if (existingUser) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "Email already in use",
        });
      }

      const userId = createId();
      const { hashPassword } = await import("better-auth/crypto");
      const hashedPassword = await hashPassword(input.password);

      return db.$transaction(async (tx) => {
        const user = await tx.user.create({
          data: {
            id: userId,
            name: input.name,
            email: input.email,
            role: input.role,
            mustChangePassword: true,
            emailVerified: false,
          },
        });

        await tx.account.create({
          data: {
            id: createId(),
            userId: userId,
            accountId: userId,
            providerId: "credential",
            password: hashedPassword,
          },
        });

        if (input.areaAssignments && input.areaAssignments.length > 0) {
          for (const assignment of input.areaAssignments) {
            if (assignment.position !== AreaPosition.STAFF) {
              const existing = await tx.areaMember.findFirst({
                where: {
                  areaId: assignment.areaId,
                  position: assignment.position,
                },
              });
              if (existing) {
                await tx.areaMember.update({
                  where: { id: existing.id },
                  data: { position: AreaPosition.STAFF },
                });
              }
            }

            await tx.areaMember.create({
              data: {
                userId: userId,
                areaId: assignment.areaId,
                position: assignment.position,
              },
            });
          }
        }

        return user;
      });
    }),

  update: adminProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string().min(2).max(100).optional(),
        role: z.nativeEnum(UserRole).optional(),
        banned: z.boolean().optional(),
        banReason: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const { id, ...updateData } = input;

      const user = await db.user.findUnique({ where: { id } });
      if (!user) {
        throw new TRPCError({ code: "NOT_FOUND", message: "User not found" });
      }

      return db.user.update({
        where: { id },
        data: updateData,
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          banned: true,
          banReason: true,
        },
      });
    }),

  resetPassword: adminProcedure
    .input(
      z.object({
        id: z.string(),
        newPassword: z.string().min(8),
      })
    )
    .mutation(async ({ input }) => {
      const user = await db.user.findUnique({ where: { id: input.id } });
      if (!user) {
        throw new TRPCError({ code: "NOT_FOUND", message: "User not found" });
      }

      const { hashPassword } = await import("better-auth/crypto");
      const hashedPassword = await hashPassword(input.newPassword);

      await db.$transaction(async (tx) => {
        await tx.account.updateMany({
          where: { userId: input.id, providerId: "credential" },
          data: { password: hashedPassword },
        });

        await tx.user.update({
          where: { id: input.id },
          data: { mustChangePassword: true },
        });
      });

      return { success: true };
    }),

  addToArea: adminProcedure
    .input(
      z.object({
        userId: z.string(),
        areaId: z.string().cuid(),
        position: z.nativeEnum(AreaPosition),
      })
    )
    .mutation(async ({ input }) => {
      const existing = await db.areaMember.findUnique({
        where: {
          userId_areaId: { userId: input.userId, areaId: input.areaId },
        },
      });

      if (existing) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "User is already a member of this area",
        });
      }

      return db.$transaction(async (tx) => {
        if (input.position !== AreaPosition.STAFF) {
          const existingPosition = await tx.areaMember.findFirst({
            where: { areaId: input.areaId, position: input.position },
          });
          if (existingPosition) {
            await tx.areaMember.update({
              where: { id: existingPosition.id },
              data: { position: AreaPosition.STAFF },
            });
          }
        }

        return tx.areaMember.create({
          data: {
            userId: input.userId,
            areaId: input.areaId,
            position: input.position,
          },
          include: {
            area: { select: { id: true, name: true, slug: true } },
          },
        });
      });
    }),

  removeFromArea: adminProcedure
    .input(
      z.object({
        userId: z.string(),
        areaId: z.string().cuid(),
      })
    )
    .mutation(async ({ input }) => {
      const membership = await db.areaMember.findUnique({
        where: {
          userId_areaId: { userId: input.userId, areaId: input.areaId },
        },
      });

      if (!membership) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "User is not a member of this area",
        });
      }

      await db.areaMember.delete({
        where: { id: membership.id },
      });

      return { success: true };
    }),

  me: protectedProcedure.query(async ({ ctx }) => {
    const user = await db.user.findUnique({
      where: { id: ctx.session.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        areaMemberships: {
          include: {
            area: { select: { id: true, name: true, slug: true } },
          },
        },
      },
    });

    if (!user) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "User not found",
      });
    }

    return user;
  }),
});
