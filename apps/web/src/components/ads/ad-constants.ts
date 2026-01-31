import type { BadgeColors } from "@/components/base/badges/badge-types";

// === Enum Labels (Portuguese) ===

export const TEMA_LABELS: Record<string, string> = {
  GERAL: "Geral",
  SONO: "Sono",
  ANSIEDADE: "Ansiedade",
  DEPRESSAO: "Depressao",
  PESO: "Peso",
  DISF: "Disfuncao",
  DORES: "Dores",
  FOCO: "Foco",
  PERFORM: "Performance",
  PATOLOGIAS: "Patologias",
  TABACO: "Tabaco",
};

export const ESTILO_LABELS: Record<string, string> = {
  UGC: "UGC",
  EDUC: "Educativo",
  COMED: "Comedia",
  DEPOI: "Depoimento",
  POV: "POV",
  STORY: "Storytelling",
  MITOS: "Mitos",
  QA: "Q&A",
  ANTES: "Antes/Depois",
  REVIEW: "Review",
  REACT: "React",
  TREND: "Trend",
  INST: "Institucional",
};

export const FORMATO_LABELS: Record<string, string> = {
  VID: "Video",
  MOT: "Motion",
  IMG: "Imagem",
  CRSEL: "Carrossel",
};

export const TEMPO_LABELS: Record<string, string> = {
  T15S: "15s",
  T30S: "30s",
  T45S: "45s",
  T60S: "60s",
  T90S: "90s",
  T120S: "2min",
  T180S: "3min",
};

export const TAMANHO_LABELS: Record<string, string> = {
  S9X16: "9:16 (Vertical)",
  S1X1: "1:1 (Quadrado)",
  S4X5: "4:5",
  S16X9: "16:9 (Horizontal)",
  S2X3: "2:3",
};

// === Status Configuration ===

export const AD_STATUS_CONFIG: Record<string, { label: string; color: BadgeColors }> = {
  DRAFT: { label: "Rascunho", color: "gray" },
  ACTIVE: { label: "Ativo", color: "blue" },
  COMPLETED: { label: "Concluido", color: "success" },
  CANCELLED: { label: "Cancelado", color: "error" },
};

// === Phase Configuration ===

export const PHASE_CONFIG: Record<number, { label: string; color: BadgeColors }> = {
  1: { label: "Briefing", color: "gray" },
  2: { label: "Roteiro", color: "blue" },
  3: { label: "Elenco", color: "brand" },
  4: { label: "Producao", color: "orange" },
  5: { label: "Revisao", color: "warning" },
  6: { label: "Publicacao", color: "success" },
};

// === Priority Labels ===

export const PRIORITY_LABELS: Record<string, string> = {
  LOW: "Baixa",
  MEDIUM: "Media",
  HIGH: "Alta",
  URGENT: "Urgente",
};

export const PRIORITY_COLORS: Record<string, string> = {
  LOW: "text-success-primary",
  MEDIUM: "text-warning-primary",
  HIGH: "text-error-primary",
  URGENT: "text-error-primary font-bold",
};

// === Video Phase Status Configuration ===

export const VIDEO_PHASE_STATUS_CONFIG: Record<
  string,
  { label: string; color: string; bgColor: string; borderColor: string }
> = {
  PENDENTE: {
    label: "Pendente",
    color: "text-quaternary",
    bgColor: "bg-secondary",
    borderColor: "border-border-secondary",
  },
  EM_ANDAMENTO: {
    label: "Em Andamento",
    color: "text-brand-primary",
    bgColor: "bg-brand-secondary",
    borderColor: "border-brand-primary",
  },
  PRONTO: {
    label: "Pronto",
    color: "text-success-primary",
    bgColor: "bg-success-secondary",
    borderColor: "border-success-primary",
  },
  ELENCO: {
    label: "Elenco",
    color: "text-brand-primary",
    bgColor: "bg-brand-secondary",
    borderColor: "border-brand-primary",
  },
  PRE_PROD: {
    label: "Pre-Producao",
    color: "text-warning-primary",
    bgColor: "bg-warning-secondary",
    borderColor: "border-warning-primary",
  },
  EM_PRODUCAO: {
    label: "Em Producao",
    color: "text-brand-primary",
    bgColor: "bg-brand-secondary",
    borderColor: "border-brand-primary",
  },
  ENTREGUE: {
    label: "Entregue",
    color: "text-success-primary",
    bgColor: "bg-success-secondary",
    borderColor: "border-success-primary",
  },
  EM_REVISAO: {
    label: "Em Revisao",
    color: "text-warning-primary",
    bgColor: "bg-warning-secondary",
    borderColor: "border-warning-primary",
  },
  VALIDANDO: {
    label: "Validando",
    color: "text-brand-primary",
    bgColor: "bg-brand-secondary",
    borderColor: "border-brand-primary",
  },
  APROVADO: {
    label: "Aprovado",
    color: "text-success-primary",
    bgColor: "bg-success-secondary",
    borderColor: "border-success-primary",
  },
  NOMENCLATURA: {
    label: "Nomenclatura",
    color: "text-brand-primary",
    bgColor: "bg-brand-secondary",
    borderColor: "border-brand-primary",
  },
  PUBLICADO: {
    label: "Publicado",
    color: "text-success-primary",
    bgColor: "bg-success-secondary",
    borderColor: "border-success-primary",
  },
};

// === Phase Details (for progress bar and panels) ===

export const PHASE_DETAILS: Record<
  number,
  { label: string; description: string }
> = {
  1: { label: "Briefing", description: "Definicao do projeto e videos" },
  2: {
    label: "Roteiro",
    description: "Roteiros e validacao compliance/medico",
  },
  3: {
    label: "Elenco",
    description: "Casting, storyboard e pre-producao",
  },
  4: { label: "Producao", description: "Gravacao e upload de hooks" },
  5: {
    label: "Revisao",
    description: "Revisao de conteudo, design e compliance",
  },
  6: {
    label: "Publicacao",
    description: "Aprovacao final, nomenclatura e publicacao",
  },
};
