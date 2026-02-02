import { TRPCError } from "@trpc/server";
import { z } from "zod";

import db, { AdProjectStatus, Priority } from "@marketingclickcannabis/db";

import { protectedProcedure, router } from "../index";
import { AD_ACTIONS, canUserPerformAdAction } from "../services/ad-permissions";
import {
  canProjectAdvancePhase,
  advanceProjectPhase,
  validateVideoReadyForPhase,
  getReadyStatusForPhase,
} from "../services/ad-workflow";
import type { AdVideoWithDeliverables } from "../services/ad-workflow";

export const adProjectRouter = router({
  list: protectedProcedure
    .input(
      z.object({
        status: z.nativeEnum(AdProjectStatus).optional(),
        search: z.string().optional(),
        page: z.number().int().positive().default(1),
        limit: z.number().int().positive().max(100).default(20),
      })
    )
    .query(async ({ input }) => {
      const { status, search, page, limit } = input;
      const skip = (page - 1) * limit;

      const where = {
        ...(status && { status }),
        ...(search && {
          title: { contains: search, mode: "insensitive" as const },
        }),
      };

      const [items, total] = await Promise.all([
        db.adProject.findMany({
          where,
          skip,
          take: limit,
          orderBy: { createdAt: "desc" },
          include: {
            adType: true,
            origin: true,
            createdBy: { select: { id: true, name: true, image: true } },
            _count: { select: { videos: true } },
          },
        }),
        db.adProject.count({ where }),
      ]);

      return { items, total, hasMore: skip + items.length < total };
    }),

  listTypes: protectedProcedure.query(async () => {
    return db.adType.findMany({
      where: { isActive: true },
      include: { _count: { select: { projects: true } } },
    });
  }),

  getById: protectedProcedure
    .input(z.object({ id: z.string().cuid() }))
    .query(async ({ input }) => {
      const project = await db.adProject.findUnique({
        where: { id: input.id },
        include: {
          adType: true,
          origin: true,
          createdBy: { select: { id: true, name: true, image: true } },
          videos: {
            orderBy: { createdAt: "asc" },
            include: {
              criador: {
                select: {
                  id: true,
                  name: true,
                  imageUrl: true,
                  code: true,
                },
              },
              deliverables: {
                orderBy: { hookNumber: "asc" },
                include: {
                  file: {
                    select: {
                      id: true,
                      name: true,
                      url: true,
                      mimeType: true,
                      size: true,
                      thumbnailUrl: true,
                    },
                  },
                },
              },
            },
          },
          images: {
            orderBy: { createdAt: "asc" },
            include: {
              file: {
                select: {
                  id: true,
                  name: true,
                  url: true,
                  mimeType: true,
                  size: true,
                  thumbnailUrl: true,
                },
              },
            },
          },
        },
      });

      if (!project) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Ad project not found",
        });
      }

      return project;
    }),

  create: protectedProcedure
    .input(
      z.object({
        title: z.string().min(3).max(200),
        adTypeId: z.string().cuid(),
        originId: z.string().cuid(),
        briefing: z.string().min(10),
        deadline: z.coerce.date().optional(),
        priority: z.nativeEnum(Priority).optional(),
        incluiPackFotos: z.boolean().default(false),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;

      return db.adProject.create({
        data: {
          title: input.title,
          adTypeId: input.adTypeId,
          originId: input.originId,
          briefing: input.briefing,
          deadline: input.deadline,
          priority: input.priority,
          status: "DRAFT",
          currentPhase: 1,
          createdById: userId,
          incluiPackFotos: input.incluiPackFotos,
        },
      });
    }),

  update: protectedProcedure
    .input(
      z.object({
        id: z.string().cuid(),
        title: z.string().min(3).max(200).optional(),
        briefing: z.string().min(10).optional(),
        deadline: z.coerce.date().optional().nullable(),
        priority: z.nativeEnum(Priority).optional().nullable(),
      })
    )
    .mutation(async ({ input }) => {
      const project = await db.adProject.findUnique({
        where: { id: input.id },
      });

      if (!project) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Ad project not found",
        });
      }

      if (
        project.status === "COMPLETED" ||
        project.status === "CANCELLED"
      ) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Cannot edit completed or cancelled projects",
        });
      }

      if (input.title !== undefined || input.briefing !== undefined) {
        const canEditTitleBriefing =
          project.status === "DRAFT" || project.currentPhase <= 2;
        if (!canEditTitleBriefing) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message:
              "Title and briefing can only be edited in DRAFT or until Phase 2",
          });
        }
      }

      const { id, ...fields } = input;
      const data: Record<string, unknown> = {};
      if (fields.title !== undefined) data.title = fields.title;
      if (fields.briefing !== undefined) data.briefing = fields.briefing;
      if (fields.deadline !== undefined) data.deadline = fields.deadline;
      if (fields.priority !== undefined) data.priority = fields.priority;

      return db.adProject.update({
        where: { id },
        data,
      });
    }),

  submit: protectedProcedure
    .input(z.object({ id: z.string().cuid() }))
    .mutation(async ({ input }) => {
      const project = await db.adProject.findUnique({
        where: { id: input.id },
        include: { videos: true },
      });

      if (!project) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }
      if (project.status !== "DRAFT") {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Only DRAFT projects can be submitted",
        });
      }
      if (project.videos.length === 0) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Project must have at least 1 video",
        });
      }

      return db.adProject.update({
        where: { id: input.id },
        data: { status: "ACTIVE" },
      });
    }),

  cancel: protectedProcedure
    .input(z.object({ id: z.string().cuid() }))
    .mutation(async ({ input }) => {
      const project = await db.adProject.findUnique({
        where: { id: input.id },
      });

      if (!project) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Ad project not found",
        });
      }

      if (project.status === "COMPLETED") {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Completed projects cannot be cancelled",
        });
      }

      if (project.status === "CANCELLED") {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Project is already cancelled",
        });
      }

      return db.adProject.update({
        where: { id: input.id },
        data: { status: "CANCELLED" },
      });
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string().cuid() }))
    .mutation(async ({ input }) => {
      const project = await db.adProject.findUnique({
        where: { id: input.id },
      });

      if (!project) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Ad project not found",
        });
      }

      if (project.status !== "DRAFT") {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Only DRAFT projects can be deleted",
        });
      }

      return db.adProject.delete({
        where: { id: input.id },
      });
    }),

  advancePhase: protectedProcedure
    .input(z.object({ id: z.string().cuid() }))
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;
      const userRole = ctx.session.user.role ?? "";

      const project = await db.adProject.findUniqueOrThrow({
        where: { id: input.id },
      });

      // Only phase 1 requires manual approval; phases 2-6 advance automatically when all videos are ready
      const phaseActionMap: Record<number, string> = {
        1: "aprovar_briefing",
      };

      if (phaseActionMap[project.currentPhase]) {
        const action = AD_ACTIONS[phaseActionMap[project.currentPhase]!];
        if (action) {
          const canPerform = await canUserPerformAdAction(
            userId,
            userRole,
            action
          );
          if (!canPerform) {
            throw new TRPCError({
              code: "FORBIDDEN",
              message: "You cannot advance this phase",
            });
          }
        }
      }

      const status = await canProjectAdvancePhase(input.id);
      if (!status.canAdvance) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: `Cannot advance: ${status.videosReady}/${status.videosTotal} videos ready`,
        });
      }

      await advanceProjectPhase(input.id);

      return db.adProject.findUniqueOrThrow({ where: { id: input.id } });
    }),

  getPhaseStatus: protectedProcedure
    .input(z.object({ id: z.string().cuid() }))
    .query(async ({ input }) => {
      const project = await db.adProject.findUnique({
        where: { id: input.id },
        include: {
          videos: {
            include: { deliverables: true },
            orderBy: { createdAt: "asc" },
          },
        },
      });

      if (!project) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Ad project not found",
        });
      }

      const readyStatus = getReadyStatusForPhase(project.currentPhase);

      const videos = project.videos.map((video) => {
        const missingRequirements = validateVideoReadyForPhase(
          video as AdVideoWithDeliverables,
          project.currentPhase
        );
        return {
          id: video.id,
          nomeDescritivo: video.nomeDescritivo,
          phaseStatus: video.phaseStatus,
          isReady: video.phaseStatus === readyStatus,
          missingRequirements,
        };
      });

      const videosReady = videos.filter((v) => v.isReady).length;

      return {
        projectId: project.id,
        currentPhase: project.currentPhase,
        status: project.status,
        videosTotal: videos.length,
        videosReady,
        canAdvance: videosReady === videos.length && videos.length > 0,
        videos,
      };
    }),

  uploadPackImage: protectedProcedure
    .input(
      z.object({
        projectId: z.string().cuid(),
        fileId: z.string().cuid(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;

      const project = await db.adProject.findUniqueOrThrow({
        where: { id: input.projectId },
      });

      if (!project.incluiPackFotos) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Project does not have image pack enabled",
        });
      }

      return db.adProjectImage.create({
        data: {
          projectId: input.projectId,
          fileId: input.fileId,
          uploadedById: userId,
        },
        include: {
          file: {
            select: {
              id: true,
              name: true,
              url: true,
              mimeType: true,
              size: true,
              thumbnailUrl: true,
            },
          },
        },
      });
    }),

  deletePackImage: protectedProcedure
    .input(z.object({ id: z.string().cuid() }))
    .mutation(async ({ input }) => {
      return db.adProjectImage.delete({
        where: { id: input.id },
      });
    }),

  listPackImages: protectedProcedure
    .input(z.object({ projectId: z.string().cuid() }))
    .query(async ({ input }) => {
      return db.adProjectImage.findMany({
        where: { projectId: input.projectId },
        orderBy: { createdAt: "asc" },
        include: {
          file: {
            select: {
              id: true,
              name: true,
              url: true,
              mimeType: true,
              size: true,
              thumbnailUrl: true,
            },
          },
        },
      });
    }),
});
