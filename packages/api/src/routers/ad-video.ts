import { TRPCError } from "@trpc/server";
import { z } from "zod";

import db, {
  AdVideoTema,
  AdVideoEstilo,
  AdVideoFormato,
  AdVideoPhaseStatus,
} from "@marketingclickcannabis/db";

import { protectedProcedure, router } from "../index";
import {
  canUserPerformAdAction,
  AD_ACTIONS,
} from "../services/ad-permissions";
import {
  canAddVideosToProject,
  regressVideo,
} from "../services/ad-workflow";
import { assignAdNumbers } from "../services/ad-counter";
import { sanitizeName } from "../services/ad-nomenclatura";

const VALID_PHASE_STATUSES: Record<number, AdVideoPhaseStatus[]> = {
  1: [AdVideoPhaseStatus.PENDENTE, AdVideoPhaseStatus.EM_ANDAMENTO, AdVideoPhaseStatus.PRONTO],
  2: [AdVideoPhaseStatus.PENDENTE, AdVideoPhaseStatus.EM_ANDAMENTO, AdVideoPhaseStatus.PRONTO],
  3: [AdVideoPhaseStatus.PENDENTE, AdVideoPhaseStatus.ELENCO, AdVideoPhaseStatus.PRE_PROD, AdVideoPhaseStatus.PRONTO],
  4: [AdVideoPhaseStatus.PENDENTE, AdVideoPhaseStatus.EM_PRODUCAO, AdVideoPhaseStatus.ENTREGUE],
  5: [AdVideoPhaseStatus.PENDENTE, AdVideoPhaseStatus.EM_REVISAO, AdVideoPhaseStatus.VALIDANDO, AdVideoPhaseStatus.PRONTO],
  6: [AdVideoPhaseStatus.PENDENTE, AdVideoPhaseStatus.APROVADO, AdVideoPhaseStatus.NOMENCLATURA, AdVideoPhaseStatus.PUBLICADO],
};

const PHASE_REGRESS_ACTIONS: Record<number, string> = {
  2: "validar_roteiro_compliance",
  3: "aprovar_pre_producao",
  4: "producao_entrega",
  5: "revisao_conteudo",
  6: "aprovacao_final",
};

const FIELD_PHASE_LIMITS = {
  basicFields: 2,
  roteiro: 5,
  criadorId: 3,
  productionFields: 4,
} as const;

export const adVideoRouter = router({
  create: protectedProcedure
    .input(z.object({
      projectId: z.string().cuid(),
      nomeDescritivo: z.string().min(1).max(25).regex(/^[A-Z0-9]+$/, "Apenas letras maiusculas e numeros"),
      tema: z.nativeEnum(AdVideoTema),
      estilo: z.nativeEnum(AdVideoEstilo),
      formato: z.nativeEnum(AdVideoFormato),
    }))
    .mutation(async ({ input }) => {
      const project = await db.adProject.findUniqueOrThrow({ where: { id: input.projectId } });

      // Verificar lock de videos
      if (!canAddVideosToProject(project.currentPhase)) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Cannot add videos after Phase 2",
        });
      }

      return db.adVideo.create({
        data: {
          projectId: input.projectId,
          nomeDescritivo: sanitizeName(input.nomeDescritivo),
          tema: input.tema,
          estilo: input.estilo,
          formato: input.formato,
          currentPhase: project.currentPhase,
          phaseStatus: "PENDENTE",
        },
      });
    }),

  update: protectedProcedure
    .input(z.object({
      id: z.string().cuid(),
      nomeDescritivo: z.string().min(1).max(25).regex(/^[A-Z0-9]+$/, "Apenas letras maiusculas e numeros").optional(),
      tema: z.nativeEnum(AdVideoTema).optional(),
      estilo: z.nativeEnum(AdVideoEstilo).optional(),
      formato: z.nativeEnum(AdVideoFormato).optional(),
      roteiro: z.string().optional(),
      criadorId: z.string().cuid().optional(),
      storyboardUrl: z.string().url().optional(),
      localGravacao: z.string().optional(),
      dataGravacao: z.coerce.date().optional(),
    }))
    .mutation(async ({ input }) => {
      const video = await db.adVideo.findUniqueOrThrow({
        where: { id: input.id },
        include: { project: true },
      });

      const phase = video.currentPhase;
      const { id, ...fields } = input;

      if ((fields.nomeDescritivo !== undefined || fields.tema !== undefined || fields.estilo !== undefined || fields.formato !== undefined) && phase > FIELD_PHASE_LIMITS.basicFields) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Cannot edit nomeDescritivo/tema/estilo/formato after Phase 2",
        });
      }

      if (fields.roteiro !== undefined && phase > FIELD_PHASE_LIMITS.roteiro) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Cannot edit roteiro after Phase 5",
        });
      }

      if (fields.criadorId !== undefined && phase > FIELD_PHASE_LIMITS.criadorId) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Cannot edit criadorId after Phase 3",
        });
      }

      if ((fields.storyboardUrl !== undefined || fields.localGravacao !== undefined || fields.dataGravacao !== undefined) && phase > FIELD_PHASE_LIMITS.productionFields) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Cannot edit storyboard/locacao/dataGravacao after Phase 4",
        });
      }

      const data = {
        ...fields,
        ...(fields.nomeDescritivo !== undefined
          ? { nomeDescritivo: sanitizeName(fields.nomeDescritivo) }
          : {}),
      };

      return db.adVideo.update({
        where: { id: input.id },
        data,
      });
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string().cuid() }))
    .mutation(async ({ input }) => {
      const video = await db.adVideo.findUniqueOrThrow({
        where: { id: input.id },
        include: { project: true },
      });

      if (video.project.currentPhase > 2) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Cannot delete video after Phase 2",
        });
      }

      return db.adVideo.delete({ where: { id: input.id } });
    }),

  updatePhaseStatus: protectedProcedure
    .input(z.object({
      id: z.string().cuid(),
      phaseStatus: z.nativeEnum(AdVideoPhaseStatus),
    }))
    .mutation(async ({ input }) => {
      const video = await db.adVideo.findUniqueOrThrow({
        where: { id: input.id },
        include: { project: true },
      });

      const validStatuses = VALID_PHASE_STATUSES[video.currentPhase];
      if (!validStatuses || !validStatuses.includes(input.phaseStatus)) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: `Status "${input.phaseStatus}" is not valid for Phase ${video.currentPhase}`,
        });
      }

      return db.adVideo.update({
        where: { id: input.id },
        data: { phaseStatus: input.phaseStatus },
      });
    }),

  markValidation: protectedProcedure
    .input(z.object({
      id: z.string().cuid(),
      field: z.enum([
        "validacaoRoteiroCompliance",
        "validacaoRoteiroMedico",
        "aprovacaoElenco",
        "aprovacaoPreProducao",
        "revisaoConteudo",
        "revisaoDesign",
        "validacaoFinalCompliance",
        "validacaoFinalMedico",
        "aprovacaoFinal",
      ]),
      value: z.boolean(),
    }))
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;
      const userRole = ctx.session.user.role as string;

      // Mapear field → action para checagem de permissao
      const fieldActionMap: Record<string, string> = {
        validacaoRoteiroCompliance: "validar_roteiro_compliance",
        validacaoRoteiroMedico: "validar_roteiro_medico",
        aprovacaoElenco: "aprovar_elenco",
        aprovacaoPreProducao: "aprovar_pre_producao",
        revisaoConteudo: "revisao_conteudo",
        revisaoDesign: "revisao_design",
        validacaoFinalCompliance: "validacao_final",
        validacaoFinalMedico: "validacao_final",
        aprovacaoFinal: "aprovacao_final",
      };

      const actionKey = fieldActionMap[input.field];
      if (actionKey) {
        const action = AD_ACTIONS[actionKey];
        if (action) {
          const canPerform = await canUserPerformAdAction(userId, userRole, action);
          if (!canPerform) {
            throw new TRPCError({ code: "FORBIDDEN", message: `You cannot perform: ${input.field}` });
          }
        }
      }

      return db.adVideo.update({
        where: { id: input.id },
        data: { [input.field]: input.value } as any,
      });
    }),

  regress: protectedProcedure
    .input(z.object({
      id: z.string().cuid(),
      targetPhase: z.number().int().min(2).max(5),
      reason: z.string().min(1),
    }))
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;
      const userRole = ctx.session.user.role as string;

      const video = await db.adVideo.findUniqueOrThrow({
        where: { id: input.id },
        include: { project: true },
      });

      const actionKey = PHASE_REGRESS_ACTIONS[video.currentPhase];
      if (actionKey) {
        const action = AD_ACTIONS[actionKey];
        if (action) {
          const canPerform = await canUserPerformAdAction(userId, userRole, action);
          if (!canPerform) {
            throw new TRPCError({
              code: "FORBIDDEN",
              message: "You do not have permission to regress this video",
            });
          }
        }
      }

      try {
        await regressVideo(input.id, input.targetPhase, input.reason);
      } catch (error) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: error instanceof Error ? error.message : "Failed to regress video",
        });
      }

      return { success: true };
    }),

  approvePhase6: protectedProcedure
    .input(z.object({ id: z.string().cuid() }))
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;
      const userRole = ctx.session.user.role as string;

      // Checar permissao
      const aprovacaoFinalAction = AD_ACTIONS.aprovacao_final;
      if (!aprovacaoFinalAction) {
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Action not found" });
      }
      const canPerform = await canUserPerformAdAction(userId, userRole, aprovacaoFinalAction);
      if (!canPerform) {
        throw new TRPCError({ code: "FORBIDDEN" });
      }

      return db.$transaction(async (tx) => {
        const video = await tx.adVideo.findUniqueOrThrow({
          where: { id: input.id },
          include: { deliverables: true },
        });

        if (video.currentPhase !== 6) {
          throw new TRPCError({ code: "BAD_REQUEST", message: "Video must be in Phase 6" });
        }

        if (video.deliverables.length === 0) {
          throw new TRPCError({ code: "BAD_REQUEST", message: "Video must have at least 1 deliverable" });
        }

        // Atribuir AD numbers atomicamente
        const assigned = await assignAdNumbers(tx, input.id);

        // Marcar aprovacao e atualizar status
        await tx.adVideo.update({
          where: { id: input.id },
          data: {
            aprovacaoFinal: true,
            phaseStatus: "APROVADO",
          },
        });

        return { videoId: input.id, assignedAdNumbers: assigned };
      });
    }),

  setLinkAnuncio: protectedProcedure
    .input(z.object({
      id: z.string().cuid(),
      linkAnuncio: z.string().url(),
    }))
    .mutation(async ({ input }) => {
      const video = await db.adVideo.findUniqueOrThrow({
        where: { id: input.id },
      });

      if (video.currentPhase !== 6) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Can only set link in Phase 6",
        });
      }

      return db.adVideo.update({
        where: { id: input.id },
        data: { linkAnuncio: input.linkAnuncio },
      });
    }),
});
