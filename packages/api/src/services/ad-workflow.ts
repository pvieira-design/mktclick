import db from "@marketingclickcannabis/db";
import type { AdVideo, AdDeliverable } from "@marketingclickcannabis/db";

/**
 * Type for AdVideo with deliverables relation
 */
export type AdVideoWithDeliverables = AdVideo & {
  deliverables: AdDeliverable[];
};

/**
 * Retorna o status "pronto" esperado para cada fase.
 * Usado para verificar se todos os videos estao prontos.
 */
export function getReadyStatusForPhase(phase: number): string {
  switch (phase) {
    case 1:
      return "PRONTO";
    case 2:
      return "PRONTO";
    case 3:
      return "PRONTO";
    case 4:
      return "ENTREGUE";
    case 5:
      return "PRONTO";
    case 6:
      return "PUBLICADO";
    default:
      throw new Error(`Invalid phase: ${phase}`);
  }
}

/**
 * Valida requisitos para um video ficar PRONTO em cada fase.
 */
export function validateVideoReadyForPhase(
  video: AdVideoWithDeliverables,
  phase: number
): string[] {
  const missing: string[] = [];

  switch (phase) {
    case 1:
      if (!video.nomeDescritivo) missing.push("nomeDescritivo");
      if (!video.tema) missing.push("tema");
      if (!video.estilo) missing.push("estilo");
      if (!video.formato) missing.push("formato");
      break;

    case 2:
      if (!video.roteiro) missing.push("roteiro");
      if (!video.validacaoRoteiroCompliance)
        missing.push("validacaoRoteiroCompliance");
      if (!video.validacaoRoteiroMedico)
        missing.push("validacaoRoteiroMedico");
      break;

    case 3:
      if (!video.criadorId) missing.push("criadorId");
      if (!video.aprovacaoElenco) missing.push("aprovacaoElenco");
      if (!video.aprovacaoPreProducao)
        missing.push("aprovacaoPreProducao");
      if (!video.storyboardUrl && !video.localGravacao)
        missing.push("storyboardUrl ou localGravacao");
      break;

    case 4:
      if (!video.deliverables || video.deliverables.length === 0)
        missing.push("pelo menos 1 deliverable");
      if (video.deliverables) {
        const hasFile = video.deliverables.some((d) => d.fileId);
        if (!hasFile) missing.push("deliverable com arquivo");
      }
      break;

    case 5:
      if (!video.revisaoConteudo) missing.push("revisaoConteudo");
      if (!video.revisaoDesign) missing.push("revisaoDesign");
      if (!video.validacaoFinalCompliance)
        missing.push("validacaoFinalCompliance");
      if (!video.validacaoFinalMedico)
        missing.push("validacaoFinalMedico");
      break;

    case 6:
      if (!video.aprovacaoFinal) missing.push("aprovacaoFinal");
      if (!video.linkAnuncio) missing.push("linkAnuncio");
      if (video.deliverables) {
        const allHaveAd = video.deliverables.every((d) => d.adNumber !== null);
        if (!allHaveAd) missing.push("AD numbers em todos deliverables");
        const allHaveNomenclatura = video.deliverables.every(
          (d) => d.nomenclaturaGerada || d.nomenclaturaEditada
        );
        if (!allHaveNomenclatura)
          missing.push("nomenclatura em todos deliverables");
      }
      break;
  }

  return missing;
}

/**
 * Verifica se pode adicionar videos ao projeto.
 * Regra: so ate o final da Fase 2.
 */
export function canAddVideosToProject(currentPhase: number): boolean {
  return currentPhase <= 2;
}

/**
 * Verifica se o projeto pode avancar de fase.
 * Regra: TODOS os videos devem estar PRONTO (ou equivalente) na fase atual.
 */
export async function canProjectAdvancePhase(projectId: string): Promise<{
  canAdvance: boolean;
  currentPhase: number;
  videosReady: number;
  videosTotal: number;
  blockingVideos: Array<{ id: string; nomeDescritivo: string; phaseStatus: string }>;
}> {
  // Fetch project with videos
  const project = await db.adProject.findUnique({
    where: { id: projectId },
    include: {
      videos: {
        include: {
          deliverables: true,
        },
      },
    },
  });

  if (!project) {
    throw new Error(`Project not found: ${projectId}`);
  }

  // Get ready status for current phase
  const readyStatus = getReadyStatusForPhase(project.currentPhase);

  // Filter videos by phaseStatus === readyStatus
  const videosReady = project.videos.filter(
    (v) => v.phaseStatus === readyStatus
  ).length;
  const videosTotal = project.videos.length;

  // Get blocking videos (not ready)
  const blockingVideos = project.videos
    .filter((v) => v.phaseStatus !== readyStatus)
    .map((v) => ({
      id: v.id,
      nomeDescritivo: v.nomeDescritivo,
      phaseStatus: v.phaseStatus,
    }));

  return {
    canAdvance: videosReady === videosTotal && videosTotal > 0,
    currentPhase: project.currentPhase,
    videosReady,
    videosTotal,
    blockingVideos,
  };
}

/**
 * Avanca o projeto para a proxima fase.
 * Pre-condicao: canProjectAdvancePhase retorna true.
 * Efeito: currentPhase += 1, todos videos resetam phaseStatus para PENDENTE.
 */
export async function advanceProjectPhase(projectId: string): Promise<void> {
  await db.$transaction(async (tx) => {
    // Increment project phase
    await tx.adProject.update({
      where: { id: projectId },
      data: { currentPhase: { increment: 1 } },
    });

    // Reset all videos' phaseStatus to PENDENTE
    await tx.adVideo.updateMany({
      where: { projectId },
      data: { phaseStatus: "PENDENTE" },
    });
  });
}

/**
 * Verifica se um video pode ser marcado como PRONTO na fase atual.
 * Cada fase tem requisitos diferentes (ver regras-de-negocio.md).
 */
export async function canVideoBeReady(videoId: string): Promise<{
  canBeReady: boolean;
  missingRequirements: string[];
}> {
  // Fetch video with deliverables and project
  const video = await db.adVideo.findUnique({
    where: { id: videoId },
    include: {
      deliverables: true,
      project: true,
    },
  });

  if (!video) {
    throw new Error(`Video not found: ${videoId}`);
  }

  // Call validateVideoReadyForPhase
  const missingRequirements = validateVideoReadyForPhase(
    video as AdVideoWithDeliverables,
    video.currentPhase
  );

  return {
    canBeReady: missingRequirements.length === 0,
    missingRequirements,
  };
}

/**
 * Regride um video para uma fase anterior.
 * Pre-condicoes:
 * - Fase destino >= 2 (nao pode voltar para Briefing)
 * - Video nao tem AD numbers atribuidos
 * - Motivo obrigatorio
 */
export async function regressVideo(
  videoId: string,
  targetPhase: number,
  reason: string
): Promise<void> {
  // Validate targetPhase >= 2
  if (targetPhase < 2) {
    throw new Error("Cannot regress to Phase 1 (Briefing)");
  }

  // Fetch video with deliverables
  const video = await db.adVideo.findUnique({
    where: { id: videoId },
    include: {
      deliverables: true,
    },
  });

  if (!video) {
    throw new Error(`Video not found: ${videoId}`);
  }

  // Validate no deliverable has adNumber !== null
  const hasAdNumbers = video.deliverables.some((d) => d.adNumber !== null);
  if (hasAdNumbers) {
    throw new Error(
      "Cannot regress video with AD numbers already assigned"
    );
  }

  // Update video
  await db.adVideo.update({
    where: { id: videoId },
    data: {
      currentPhase: targetPhase,
      phaseStatus: "PENDENTE",
      rejectionReason: reason,
      rejectedToPhase: targetPhase,
    },
  });
}
