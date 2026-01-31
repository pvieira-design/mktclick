import { TRPCError } from "@trpc/server";
import { z } from "zod";

import db, {
  AdDeliverableTempo,
  AdDeliverableTamanho,
} from "@marketingclickcannabis/db";

import { protectedProcedure, router } from "../index";
import { canUserPerformAdAction, AD_ACTIONS } from "../services/ad-permissions";
import { generateNomenclaturaForVideo } from "../services/ad-nomenclatura";

export const adDeliverableRouter = router({
  create: protectedProcedure
    .input(z.object({
      videoId: z.string().cuid(),
      fileId: z.string().cuid(),
      tempo: z.nativeEnum(AdDeliverableTempo),
      tamanho: z.nativeEnum(AdDeliverableTamanho),
      mostraProduto: z.boolean().default(false),
      descHook: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const video = await db.adVideo.findUniqueOrThrow({
        where: { id: input.videoId },
        include: { deliverables: { orderBy: { hookNumber: "asc" } } },
      });

      // Verificar fase (so pode criar a partir da Fase 4)
      if (video.currentPhase < 4) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Deliverables can only be created from Phase 4" });
      }

      // Verificar limite de 10
      if (video.deliverables.length >= 10) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Maximum 10 deliverables per video" });
      }

      // Verificar que nao tem AD numbers (imutavel apos)
      const hasAdNumbers = video.deliverables.some((d) => d.adNumber !== null);
      if (hasAdNumbers) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Cannot add deliverables after AD numbers assigned" });
      }

      // Calcular proximo hookNumber (preencher gaps)
      const usedNumbers = new Set(video.deliverables.map((d) => d.hookNumber));
      let nextHook = 1;
      while (usedNumbers.has(nextHook) && nextHook <= 10) {
        nextHook++;
      }

      return db.adDeliverable.create({
        data: {
          videoId: input.videoId,
          hookNumber: nextHook,
          fileId: input.fileId,
          tempo: input.tempo,
          tamanho: input.tamanho,
          mostraProduto: input.mostraProduto,
          descHook: input.descHook,
        },
      });
    }),

  update: protectedProcedure
    .input(z.object({
      id: z.string().cuid(),
      fileId: z.string().cuid().optional(),
      tempo: z.nativeEnum(AdDeliverableTempo).optional(),
      tamanho: z.nativeEnum(AdDeliverableTamanho).optional(),
      mostraProduto: z.boolean().optional(),
      descHook: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const deliverable = await db.adDeliverable.findUniqueOrThrow({
        where: { id: input.id },
      });

      // Se tem AD number, eh imutavel (exceto campos da sub-etapa 6B)
      if (deliverable.adNumber !== null) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Deliverable is immutable after AD number assignment. Use updateNomenclatura for post-approval edits.",
        });
      }

      const { id, ...updateData } = input;
      return db.adDeliverable.update({
        where: { id },
        data: updateData,
      });
    }),

  updateNomenclatura: protectedProcedure
    .input(z.object({
      id: z.string().cuid(),
      nomenclaturaEditada: z.string().nullable().optional(),
      isPost: z.boolean().optional(),
      versionNumber: z.number().int().positive().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;
      const userRole = ctx.session.user.role ?? "";

      const canPerform = await canUserPerformAdAction(userId, userRole, AD_ACTIONS.nomenclatura!);
      if (!canPerform) {
        throw new TRPCError({ code: "FORBIDDEN" });
      }

      const deliverable = await db.adDeliverable.findUniqueOrThrow({
        where: { id: input.id },
        include: { video: true },
      });

      // Deve ter AD number (so editavel apos aprovacao)
      if (deliverable.adNumber === null) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Deliverable must have AD number first" });
      }

      // Video deve estar em status APROVADO ou NOMENCLATURA
      if (!["APROVADO", "NOMENCLATURA"].includes(deliverable.video.phaseStatus)) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Video must be in APROVADO or NOMENCLATURA status" });
      }

      const { id, ...updateData } = input;
      return db.adDeliverable.update({
        where: { id },
        data: updateData,
      });
    }),

  delete: protectedProcedure
    .input(z.object({
      id: z.string().cuid(),
    }))
    .mutation(async ({ input }) => {
      const deliverable = await db.adDeliverable.findUniqueOrThrow({
        where: { id: input.id },
      });

      // Nao pode deletar se tem AD number (imutavel apos aprovacao)
      if (deliverable.adNumber !== null) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Cannot delete deliverable after AD number assignment",
        });
      }

      return db.adDeliverable.delete({
        where: { id: input.id },
      });
    }),

  regenerateNomenclatura: protectedProcedure
    .input(z.object({
      videoId: z.string().cuid(),
    }))
    .mutation(async ({ input }) => {
      await generateNomenclaturaForVideo(input.videoId);
      return { success: true as const };
    }),
});
