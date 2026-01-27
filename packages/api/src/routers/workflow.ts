import { TRPCError } from "@trpc/server";
import { z } from "zod";

import db from "@marketingclickcannabis/db";

import { adminProcedure, publicProcedure, router } from "../index";

export const workflowRouter = router({
  getStepsByContentType: publicProcedure
    .input(z.object({ contentTypeId: z.string().cuid() }))
    .query(async ({ input }) => {
      return db.workflowStep.findMany({
        where: { contentTypeId: input.contentTypeId, isActive: true },
        include: { approverArea: { select: { id: true, name: true, slug: true } } },
        orderBy: { order: "asc" },
      });
    }),

  getStepById: publicProcedure
    .input(z.object({ id: z.string().cuid() }))
    .query(async ({ input }) => {
      const step = await db.workflowStep.findUnique({
        where: { id: input.id },
        include: { approverArea: { select: { id: true, name: true, slug: true } } },
      });

      if (!step) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Workflow step not found" });
      }

      return step;
    }),

  createStep: adminProcedure
    .input(
      z.object({
        contentTypeId: z.string().cuid(),
        name: z.string().min(1).max(100),
        description: z.string().optional(),
        order: z.number().int().min(0),
        requiredFieldsToEnter: z.array(z.string()).default([]),
        requiredFieldsToExit: z.array(z.string()).default([]),
        approverAreaId: z.string().cuid().optional(),
        approverPositions: z
          .array(z.enum(["HEAD", "COORDINATOR", "STAFF"]))
          .default([]),
        isFinalStep: z.boolean().default(false),
      })
    )
    .mutation(async ({ input }) => {
      return db.workflowStep.create({
        data: {
          contentTypeId: input.contentTypeId,
          name: input.name,
          description: input.description,
          order: input.order,
          requiredFieldsToEnter: input.requiredFieldsToEnter,
          requiredFieldsToExit: input.requiredFieldsToExit,
          approverAreaId: input.approverAreaId,
          approverPositions: input.approverPositions,
          isFinalStep: input.isFinalStep,
        },
        include: { approverArea: { select: { id: true, name: true, slug: true } } },
      });
    }),

  updateStep: adminProcedure
    .input(
      z.object({
        id: z.string().cuid(),
        name: z.string().min(1).max(100).optional(),
        description: z.string().optional(),
        order: z.number().int().min(0).optional(),
        requiredFieldsToEnter: z.array(z.string()).optional(),
        requiredFieldsToExit: z.array(z.string()).optional(),
        approverAreaId: z.string().cuid().nullable().optional(),
        approverPositions: z.array(z.enum(["HEAD", "COORDINATOR", "STAFF"])).optional(),
        isFinalStep: z.boolean().optional(),
        isActive: z.boolean().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const { id, ...updateData } = input;

      const step = await db.workflowStep.findUnique({ where: { id } });
      if (!step) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Workflow step not found" });
      }

      return db.workflowStep.update({
        where: { id },
        data: updateData,
        include: { approverArea: { select: { id: true, name: true, slug: true } } },
      });
    }),

  deleteStep: adminProcedure
    .input(z.object({ id: z.string().cuid() }))
    .mutation(async ({ input }) => {
      const requestsOnStep = await db.request.count({
        where: { currentStepId: input.id },
      });

      if (requestsOnStep > 0) {
        throw new TRPCError({
          code: "PRECONDITION_FAILED",
          message: `Cannot delete step: ${requestsOnStep} request(s) are currently on this step`,
        });
      }

      return db.workflowStep.delete({ where: { id: input.id } });
    }),

  reorderSteps: adminProcedure
    .input(
      z.object({
        contentTypeId: z.string().cuid(),
        stepIds: z.array(z.string().cuid()),
      })
    )
    .mutation(async ({ input }) => {
      return db.$transaction(async (tx) => {
        const updates = input.stepIds.map((stepId, index) =>
          tx.workflowStep.update({
            where: { id: stepId },
            data: { order: index },
          })
        );

        await Promise.all(updates);

        return tx.workflowStep.findMany({
          where: { contentTypeId: input.contentTypeId, isActive: true },
          include: { approverArea: { select: { id: true, name: true, slug: true } } },
          orderBy: { order: "asc" },
        });
      });
    }),

  getAreaPermissions: publicProcedure
    .input(z.object({ contentTypeId: z.string().cuid() }))
    .query(async ({ input }) => {
      return db.contentTypeAreaPermission.findMany({
        where: { contentTypeId: input.contentTypeId },
        include: { area: { select: { id: true, name: true, slug: true } } },
      });
    }),

  setAreaPermission: adminProcedure
    .input(
      z.object({
        contentTypeId: z.string().cuid(),
        areaId: z.string().cuid(),
        canCreate: z.boolean(),
      })
    )
    .mutation(async ({ input }) => {
      return db.contentTypeAreaPermission.upsert({
        where: {
          contentTypeId_areaId: {
            contentTypeId: input.contentTypeId,
            areaId: input.areaId,
          },
        },
        create: {
          contentTypeId: input.contentTypeId,
          areaId: input.areaId,
          canCreate: input.canCreate,
        },
        update: {
          canCreate: input.canCreate,
        },
        include: { area: { select: { id: true, name: true, slug: true } } },
      });
    }),

  deleteAreaPermission: adminProcedure
    .input(
      z.object({
        contentTypeId: z.string().cuid(),
        areaId: z.string().cuid(),
      })
    )
    .mutation(async ({ input }) => {
      await db.contentTypeAreaPermission.delete({
        where: {
          contentTypeId_areaId: {
            contentTypeId: input.contentTypeId,
            areaId: input.areaId,
          },
        },
      });

      return { success: true };
    }),
});
