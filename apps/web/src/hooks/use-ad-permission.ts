"use client";

import { useMemo } from "react";
import { useCurrentUser } from "./use-current-user";

// Mirror of AD_ACTIONS from packages/api/src/services/ad-permissions.ts
// Duplicated client-side to avoid importing server code
interface AdAction {
  phase: number;
  action: string;
  approverAreaSlugs: string[];
  approverPositions: string[];
}

// Complete mapping of all 14 ad workflow actions (must match backend exactly)
export const AD_ACTIONS_CLIENT: Record<string, AdAction> = {
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
 * Hook to check if the current user can perform a specific ad workflow action.
 * Mirrors backend canUserPerformAdAction logic for UX (hiding buttons).
 * Backend still enforces security.
 */
export function useAdPermission(actionKey: string): boolean {
  const { user } = useCurrentUser();

  return useMemo(() => {
    if (!user) return false;
    if (user.role === "SUPER_ADMIN") return true;

    const action = AD_ACTIONS_CLIENT[actionKey];
    if (!action) return false;
    if (action.approverAreaSlugs.length === 0) return true;

    return user.areaMemberships.some(
      (m) =>
        action.approverAreaSlugs.includes(m.area.slug) &&
        action.approverPositions.includes(m.position)
    );
  }, [user, actionKey]);
}

/**
 * Convenience hook that checks multiple actions at once.
 * Returns a record of actionKey -> boolean.
 */
export function useAdPermissions(
  actionKeys: string[]
): Record<string, boolean> {
  const { user } = useCurrentUser();

  return useMemo(() => {
    const result: Record<string, boolean> = {};
    for (const key of actionKeys) {
      if (!user) {
        result[key] = false;
        continue;
      }
      if (user.role === "SUPER_ADMIN") {
        result[key] = true;
        continue;
      }
      const action = AD_ACTIONS_CLIENT[key];
      if (!action) {
        result[key] = false;
        continue;
      }
      if (action.approverAreaSlugs.length === 0) {
        result[key] = true;
        continue;
      }
      result[key] = user.areaMemberships.some(
        (m) =>
          action.approverAreaSlugs.includes(m.area.slug) &&
          action.approverPositions.includes(m.position)
      );
    }
    return result;
  }, [user, actionKeys]);
}

export default useAdPermission;
