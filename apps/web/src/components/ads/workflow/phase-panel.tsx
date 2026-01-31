"use client";

import { Phase1Briefing } from "./phase-1-briefing";
import { Phase2Roteiro } from "./phase-2-roteiro";
import { Phase3Elenco } from "./phase-3-elenco";
import { Phase4Producao } from "./phase-4-producao";
import { Phase5Revisao } from "./phase-5-revisao";
import { Phase6Publicacao } from "./phase-6-publicacao";

interface PhasePanelProps {
  project: any;
  currentPhase: number;
  onRefresh: () => void;
}

export function PhasePanel({ project, currentPhase, onRefresh }: PhasePanelProps) {
  switch (currentPhase) {
    case 1:
      return <Phase1Briefing project={project} onRefresh={onRefresh} />;
    case 2:
      return <Phase2Roteiro project={project} onRefresh={onRefresh} />;
    case 3:
      return <Phase3Elenco project={project} onRefresh={onRefresh} />;
    case 4:
      return <Phase4Producao project={project} onRefresh={onRefresh} />;
    case 5:
      return <Phase5Revisao project={project} onRefresh={onRefresh} />;
    case 6:
      return <Phase6Publicacao project={project} onRefresh={onRefresh} />;
    default:
      return null;
  }
}
