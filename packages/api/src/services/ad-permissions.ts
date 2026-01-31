import db from "@marketingclickcannabis/db";

/**
 * Represents an action that can be performed in the ad workflow.
 * Defines which areas and positions can approve/perform the action.
 */
interface AdAction {
  phase: number; // Fase (1-6)
  action: string; // Nome da acao (ex: "aprovar_briefing", "validar_roteiro_compliance")
  approverAreaSlugs: string[]; // Areas que podem aprovar (semantica OR)
  approverPositions: string[]; // Posicoes que podem aprovar
}

/**
 * Complete mapping of all 14 ad workflow actions.
 * Each action defines which areas and positions can approve it.
 */
export const AD_ACTIONS: Record<string, AdAction> = {
  // Fase 1
  aprovar_briefing: {
    phase: 1,
    action: "aprovar_briefing",
    approverAreaSlugs: ["content-manager", "growth"],
    approverPositions: ["HEAD", "COORDINATOR"],
  },

  // Fase 2
  escrever_roteiro: {
    phase: 2,
    action: "escrever_roteiro",
    approverAreaSlugs: ["copywriting", "oslo"],
    approverPositions: ["HEAD", "COORDINATOR", "STAFF"],
  },
  validar_roteiro_compliance: {
    phase: 2,
    action: "validar_roteiro_compliance",
    approverAreaSlugs: ["compliance", "medico"],
    approverPositions: ["HEAD", "COORDINATOR"],
  },
  validar_roteiro_medico: {
    phase: 2,
    action: "validar_roteiro_medico",
    approverAreaSlugs: ["compliance", "medico"],
    approverPositions: ["HEAD", "COORDINATOR"],
  },

  // Fase 3
  selecionar_elenco: {
    phase: 3,
    action: "selecionar_elenco",
    approverAreaSlugs: ["ugc-manager", "oslo"],
    approverPositions: ["HEAD", "COORDINATOR"],
  },
  aprovar_elenco: {
    phase: 3,
    action: "aprovar_elenco",
    approverAreaSlugs: ["growth"],
    approverPositions: ["HEAD"],
  },
  pre_producao: {
    phase: 3,
    action: "pre_producao",
    approverAreaSlugs: ["oslo", "design"],
    approverPositions: ["HEAD", "COORDINATOR", "STAFF"],
  },
  aprovar_pre_producao: {
    phase: 3,
    action: "aprovar_pre_producao",
    approverAreaSlugs: ["growth"],
    approverPositions: ["HEAD"],
  },

  // Fase 4
  producao_entrega: {
    phase: 4,
    action: "producao_entrega",
    approverAreaSlugs: ["oslo", "ugc-manager"],
    approverPositions: ["HEAD", "COORDINATOR", "STAFF"],
  },

  // Fase 5
  revisao_conteudo: {
    phase: 5,
    action: "revisao_conteudo",
    approverAreaSlugs: ["growth", "trafego"],
    approverPositions: ["HEAD", "COORDINATOR"],
  },
  revisao_design: {
    phase: 5,
    action: "revisao_design",
    approverAreaSlugs: ["design"],
    approverPositions: ["HEAD", "COORDINATOR"],
  },
  validacao_final: {
    phase: 5,
    action: "validacao_final",
    approverAreaSlugs: ["compliance", "medico"],
    approverPositions: ["HEAD", "COORDINATOR"],
  },

  // Fase 6
  aprovacao_final: {
    phase: 6,
    action: "aprovacao_final",
    approverAreaSlugs: ["growth", "trafego", "content-manager"],
    approverPositions: ["HEAD"],
  },
  nomenclatura: {
    phase: 6,
    action: "nomenclatura",
    approverAreaSlugs: ["trafego"],
    approverPositions: ["HEAD", "COORDINATOR"],
  },
};

/**
 * Checa se usuario pode executar uma acao no workflow de ads.
 *
 * PASSO 1: Se userRole === "SUPER_ADMIN" → return true (bypass total)
 * PASSO 2: Se approverAreaSlugs vazio → return true (sem restricao)
 * PASSO 3: Buscar AreaMember do usuario em QUALQUER das areas listadas
 * PASSO 4: Checar se position do membro esta nas approverPositions
 * PASSO 5: Se encontrou match → return true. Senao → return false.
 */
export async function canUserPerformAdAction(
  userId: string,
  userRole: string,
  action: AdAction
): Promise<boolean> {
  // PASSO 1: SUPER_ADMIN bypass (first check)
  if (userRole === "SUPER_ADMIN") {
    return true;
  }

  // PASSO 2: Sem restricao de area
  if (action.approverAreaSlugs.length === 0) {
    return true;
  }

  // PASSO 3: Buscar areas pelos slugs
  const areas = await db.area.findMany({
    where: { slug: { in: action.approverAreaSlugs }, isActive: true },
    select: { id: true },
  });

  if (areas.length === 0) return false;

  const areaIds = areas.map((a) => a.id);

  // PASSO 4 & 5: Buscar membership do usuario em qualquer das areas
  const membership = await db.areaMember.findFirst({
    where: {
      userId,
      areaId: { in: areaIds },
      position: { in: action.approverPositions as any[] },
    },
  });

  return membership !== null;
}

export type { AdAction };
