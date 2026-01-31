# Fase 1 — Backend Core (Routers + Services)

> **Versao**: 2.0  
> **Data**: 31 de Janeiro de 2026  
> **Pre-requisitos**: Fase 0 completa (schema + seed aplicados)  
> **Objetivo**: Criar toda a logica de backend — tRPC routers, services, validacoes  
> **Padrao de referencia**: `packages/api/src/routers/request.ts` e `packages/api/src/services/workflow-validator.ts`

---

## Arquivos a Criar

| Arquivo | Proposito |
|---------|-----------|
| `packages/api/src/routers/ad-project.ts` | Router tRPC para AdProject (CRUD + workflow) |
| `packages/api/src/routers/ad-video.ts` | Router tRPC para AdVideo (CRUD + status) |
| `packages/api/src/routers/ad-deliverable.ts` | Router tRPC para AdDeliverable (CRUD) |
| `packages/api/src/services/ad-workflow.ts` | Logica de workflow: avancar fase, regredir, validacoes |
| `packages/api/src/services/ad-nomenclatura.ts` | Geracao de nomenclatura automatica |
| `packages/api/src/services/ad-counter.ts` | Operacao atomica de AD numbers |
| `packages/api/src/services/ad-permissions.ts` | Checagem de permissoes (multi-area OR + SUPER_ADMIN bypass) |

## Arquivo a Modificar

| Arquivo | Modificacao |
|---------|-------------|
| `packages/api/src/routers/index.ts` | Registrar os 3 novos routers no appRouter |

---

## 1. Service: ad-permissions.ts

### Proposito
Checar se um usuario pode executar uma acao em uma fase/etapa do workflow de ads.

### Interface

```typescript
// packages/api/src/services/ad-permissions.ts

interface AdAction {
  phase: number;           // Fase (1-6)
  action: string;          // Nome da acao (ex: "aprovar_briefing", "validar_roteiro_compliance")
  approverAreaSlugs: string[];  // Areas que podem aprovar (semantica OR)
  approverPositions: string[];  // Posicoes que podem aprovar
}

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
): Promise<boolean>;
```

### Mapeamento Completo de Acoes

```typescript
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
```

### Implementacao

```typescript
import db from "@marketingclickcannabis/db";

export async function canUserPerformAdAction(
  userId: string,
  userRole: string,
  action: AdAction
): Promise<boolean> {
  // SUPER_ADMIN bypass
  if (userRole === "SUPER_ADMIN") {
    return true;
  }

  // Sem restricao de area
  if (action.approverAreaSlugs.length === 0) {
    return true;
  }

  // Buscar areas pelos slugs
  const areas = await db.area.findMany({
    where: { slug: { in: action.approverAreaSlugs }, isActive: true },
    select: { id: true },
  });

  if (areas.length === 0) return false;

  const areaIds = areas.map((a) => a.id);

  // Buscar membership do usuario em qualquer das areas
  const membership = await db.areaMember.findFirst({
    where: {
      userId,
      areaId: { in: areaIds },
      position: { in: action.approverPositions as any[] },
    },
  });

  return membership !== null;
}
```

---

## 2. Service: ad-counter.ts

### Proposito
Atribuir AD numbers atomicamente.

### Interface e Implementacao

```typescript
// packages/api/src/services/ad-counter.ts

import db from "@marketingclickcannabis/db";

/**
 * Obtem o proximo AD number de forma atomica.
 * Usa UPDATE ... SET currentValue = currentValue + 1 RETURNING currentValue
 * para prevenir race conditions.
 * 
 * DEVE ser chamado dentro de uma transacao Prisma ($transaction).
 */
export async function getNextAdNumber(
  tx: Parameters<Parameters<typeof db.$transaction>[0]>[0]
): Promise<number> {
  // Prisma nao suporta RETURNING diretamente, entao usamos $executeRawUnsafe + findFirst
  await tx.$executeRawUnsafe(
    `UPDATE ad_counter SET "currentValue" = "currentValue" + 1, "updatedAt" = NOW()`
  );

  const counter = await tx.adCounter.findFirstOrThrow();
  return counter.currentValue;
}

/**
 * Atribui AD numbers a todos os deliverables de um video.
 * Chamado na sub-etapa 6A (Aprovacao Final).
 * 
 * @param tx - Transacao Prisma
 * @param videoId - ID do video
 * @returns Array de { deliverableId, adNumber }
 */
export async function assignAdNumbers(
  tx: Parameters<Parameters<typeof db.$transaction>[0]>[0],
  videoId: string
): Promise<Array<{ deliverableId: string; adNumber: number }>> {
  // Buscar deliverables sem AD number, ordenados por hookNumber
  const deliverables = await tx.adDeliverable.findMany({
    where: { videoId, adNumber: null },
    orderBy: { hookNumber: "asc" },
  });

  const results: Array<{ deliverableId: string; adNumber: number }> = [];

  for (const deliverable of deliverables) {
    const adNumber = await getNextAdNumber(tx);

    await tx.adDeliverable.update({
      where: { id: deliverable.id },
      data: { adNumber },
    });

    results.push({ deliverableId: deliverable.id, adNumber });
  }

  return results;
}
```

---

## 3. Service: ad-nomenclatura.ts

### Proposito
Gerar nomenclatura automatica para deliverables.

### Interface e Implementacao

```typescript
// packages/api/src/services/ad-nomenclatura.ts

import db from "@marketingclickcannabis/db";

interface NomenclaturaInput {
  adNumber: number;
  approvalDate: Date;
  originCode: string;       // Ex: "OSLLO"
  creatorCode: string;      // Ex: "BRUNAWT", "NO1", "MULTI"
  nomeDescritivo: string;   // Ex: "ROTINACBDMUDOU"
  tema: string;             // Ex: "ANSIEDADE"
  estilo: string;           // Ex: "UGC"
  formato: string;          // Ex: "VID"
  tempo: string;            // Ex: "T30S" → "30S"
  tamanho: string;          // Ex: "S9X16" → "9X16"
  mostraProduto: boolean;
  hookNumber: number;
  versionNumber: number;
  isPost: boolean;
}

/**
 * Gera nomenclatura no formato:
 * AD####_AAAAMMDD_PRODUTORA_INFLUENCER_NOME_TEMA_ESTILO_FORMATO_TEMPO_TAMANHO[_PROD][_HK#][_V#][_POST]
 */
export function generateNomenclatura(input: NomenclaturaInput): string {
  const parts: string[] = [];

  // 1. AD#### (4 digitos zero-padded)
  parts.push(`AD${String(input.adNumber).padStart(4, "0")}`);

  // 2. AAAAMMDD
  const d = input.approvalDate;
  const dateStr = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, "0")}${String(d.getDate()).padStart(2, "0")}`;
  parts.push(dateStr);

  // 3. PRODUTORA
  parts.push(input.originCode);

  // 4. INFLUENCER
  parts.push(input.creatorCode);

  // 5. NOME (sanitizado)
  parts.push(sanitizeName(input.nomeDescritivo));

  // 6. TEMA
  parts.push(input.tema);

  // 7. ESTILO
  parts.push(input.estilo);

  // 8. FORMATO
  parts.push(input.formato);

  // 9. TEMPO (remover prefixo T do enum)
  parts.push(input.tempo.replace(/^T/, ""));

  // 10. TAMANHO (remover prefixo S do enum)
  parts.push(input.tamanho.replace(/^S/, ""));

  // Sufixos opcionais (nesta ordem)
  if (input.mostraProduto) parts.push("PROD");
  if (input.hookNumber > 1) parts.push(`HK${input.hookNumber}`);
  if (input.versionNumber > 1) parts.push(`V${input.versionNumber}`);
  if (input.isPost) parts.push("POST");

  return parts.join("_");
}

/**
 * Sanitiza nome descritivo:
 * - Maiusculas
 * - Remove acentos
 * - Remove espacos e caracteres especiais
 * - Maximo 25 chars
 */
export function sanitizeName(name: string): string {
  return name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")  // Remove acentos
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "")        // Remove tudo que nao eh alfanumerico
    .slice(0, 25);
}

/**
 * Gera codigo automatico para Creator que nao tem code definido.
 * Regras:
 * 1. Se 1 palavra: primeiros 6 chars
 * 2. Se 2+ palavras: concatenar e preencher ate 6-8 chars
 * 3. Remover acentos, espacos, especiais
 */
export function generateCreatorCode(name: string): string {
  const sanitized = name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toUpperCase()
    .replace(/[^A-Z ]/g, "")
    .trim();

  const words = sanitized.split(/\s+/).filter(Boolean);

  if (words.length === 0) return "UNKNWN";
  if (words.length === 1) return words[0]!.slice(0, 6);

  // Multiplas palavras: pegar primeiras letras + preencher
  const initials = words.map((w) => w.slice(0, 3)).join("");
  return initials.slice(0, 8);
}

/**
 * Gera nomenclatura para todos os deliverables de um video.
 * Chamado na sub-etapa 6B (Nomenclatura).
 */
export async function generateNomenclaturaForVideo(videoId: string): Promise<void> {
  const video = await db.adVideo.findUniqueOrThrow({
    where: { id: videoId },
    include: {
      project: {
        include: { origin: true },
      },
      criador: true,
      deliverables: {
        where: { adNumber: { not: null } },
        orderBy: { hookNumber: "asc" },
      },
    },
  });

  const originCode = video.project.origin.code || "OUTRO";
  let creatorCode = "NO1";
  if (video.criador) {
    creatorCode = video.criador.code || generateCreatorCode(video.criador.name);
  }

  for (const deliverable of video.deliverables) {
    if (!deliverable.adNumber) continue;

    const nomenclatura = generateNomenclatura({
      adNumber: deliverable.adNumber,
      approvalDate: new Date(),
      originCode,
      creatorCode,
      nomeDescritivo: video.nomeDescritivo,
      tema: video.tema,
      estilo: video.estilo,
      formato: video.formato,
      tempo: deliverable.tempo,
      tamanho: deliverable.tamanho,
      mostraProduto: deliverable.mostraProduto,
      hookNumber: deliverable.hookNumber,
      versionNumber: deliverable.versionNumber,
      isPost: deliverable.isPost,
    });

    await db.adDeliverable.update({
      where: { id: deliverable.id },
      data: { nomenclaturaGerada: nomenclatura },
    });
  }
}
```

---

## 4. Service: ad-workflow.ts

### Proposito
Logica central do workflow: validar transicoes, avancar fases, regredir videos.

### Interface

```typescript
// packages/api/src/services/ad-workflow.ts

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
}>;

/**
 * Avanca o projeto para a proxima fase.
 * Pre-condicao: canProjectAdvancePhase retorna true.
 * Efeito: currentPhase += 1, todos videos resetam phaseStatus para PENDENTE.
 */
export async function advanceProjectPhase(projectId: string): Promise<void>;

/**
 * Verifica se um video pode ser marcado como PRONTO na fase atual.
 * Cada fase tem requisitos diferentes (ver regras-de-negocio.md).
 */
export async function canVideoBeReady(videoId: string): Promise<{
  canBeReady: boolean;
  missingRequirements: string[];
}>;

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
): Promise<void>;

/**
 * Verifica se pode adicionar videos ao projeto.
 * Regra: so ate o final da Fase 2.
 */
export function canAddVideosToProject(currentPhase: number): boolean;
```

### Implementacao dos Validadores por Fase

```typescript
/**
 * Retorna o status "pronto" esperado para cada fase.
 * Usado para verificar se todos os videos estao prontos.
 */
function getReadyStatusForPhase(phase: number): string {
  switch (phase) {
    case 1: return "PRONTO";
    case 2: return "PRONTO";
    case 3: return "PRONTO";
    case 4: return "ENTREGUE";
    case 5: return "PRONTO";
    case 6: return "PUBLICADO";
    default: throw new Error(`Invalid phase: ${phase}`);
  }
}

/**
 * Valida requisitos para um video ficar PRONTO em cada fase.
 */
function validateVideoReadyForPhase(video: AdVideoWithDeliverables, phase: number): string[] {
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
      if (!video.validacaoRoteiroCompliance) missing.push("validacaoRoteiroCompliance");
      if (!video.validacaoRoteiroMedico) missing.push("validacaoRoteiroMedico");
      break;

    case 3:
      if (!video.criadorId) missing.push("criadorId");
      if (!video.aprovacaoElenco) missing.push("aprovacaoElenco");
      if (!video.aprovacaoPreProducao) missing.push("aprovacaoPreProducao");
      if (!video.storyboardUrl && !video.localGravacao) missing.push("storyboardUrl ou localGravacao");
      break;

    case 4:
      if (!video.deliverables || video.deliverables.length === 0) missing.push("pelo menos 1 deliverable");
      if (video.deliverables) {
        const hasFile = video.deliverables.some((d) => d.fileId);
        if (!hasFile) missing.push("deliverable com arquivo");
      }
      break;

    case 5:
      if (!video.revisaoConteudo) missing.push("revisaoConteudo");
      if (!video.revisaoDesign) missing.push("revisaoDesign");
      if (!video.validacaoFinalCompliance) missing.push("validacaoFinalCompliance");
      if (!video.validacaoFinalMedico) missing.push("validacaoFinalMedico");
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
        if (!allHaveNomenclatura) missing.push("nomenclatura em todos deliverables");
      }
      break;
  }

  return missing;
}

export function canAddVideosToProject(currentPhase: number): boolean {
  return currentPhase <= 2;
}
```

---

## 5. Router: ad-project.ts

### Procedures

| Procedure | Tipo | Input | Descricao |
|-----------|------|-------|-----------|
| `list` | query | status?, search?, page, limit | Listar projetos com paginacao |
| `getById` | query | id | Detalhe do projeto com videos e deliverables |
| `create` | mutation | title, adTypeId, originId, briefing, deadline?, priority? | Criar projeto (DRAFT) |
| `update` | mutation | id, title?, briefing?, deadline?, priority? | Editar projeto (ate Fase 2) |
| `submit` | mutation | id | Submeter projeto (DRAFT → ACTIVE, entra Fase 1) |
| `cancel` | mutation | id | Cancelar projeto |
| `delete` | mutation | id | Deletar projeto (somente DRAFT) |
| `advancePhase` | mutation | id | Avancar fase do projeto |
| `getPhaseStatus` | query | id | Status detalhado da fase atual |

### Detalhes de Implementacao

#### list

```typescript
list: protectedProcedure
  .input(z.object({
    status: z.nativeEnum(AdProjectStatus).optional(),
    search: z.string().optional(),
    page: z.number().int().positive().default(1),
    limit: z.number().int().positive().max(100).default(20),
  }))
  .query(async ({ input }) => {
    const { status, search, page, limit } = input;
    const skip = (page - 1) * limit;

    const where = {
      ...(status && { status }),
      ...(search && { title: { contains: search, mode: "insensitive" as const } }),
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
```

#### getById

```typescript
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
            criador: { select: { id: true, name: true, imageUrl: true, code: true } },
            deliverables: {
              orderBy: { hookNumber: "asc" },
              include: {
                file: { select: { id: true, name: true, url: true, mimeType: true, size: true, thumbnailUrl: true } },
              },
            },
          },
        },
      },
    });

    if (!project) {
      throw new TRPCError({ code: "NOT_FOUND", message: "Ad project not found" });
    }

    return project;
  }),
```

#### create

```typescript
create: protectedProcedure
  .input(z.object({
    title: z.string().min(3).max(200),
    adTypeId: z.string().cuid(),
    originId: z.string().cuid(),
    briefing: z.string().min(10),
    deadline: z.coerce.date().optional(),
    priority: z.nativeEnum(Priority).optional(),
  }))
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
      },
    });
  }),
```

#### submit

```typescript
submit: protectedProcedure
  .input(z.object({ id: z.string().cuid() }))
  .mutation(async ({ ctx, input }) => {
    const project = await db.adProject.findUnique({
      where: { id: input.id },
      include: { videos: true },
    });

    if (!project) throw new TRPCError({ code: "NOT_FOUND" });
    if (project.status !== "DRAFT") throw new TRPCError({ code: "BAD_REQUEST", message: "Only DRAFT projects can be submitted" });
    if (project.videos.length === 0) throw new TRPCError({ code: "BAD_REQUEST", message: "Project must have at least 1 video" });

    return db.adProject.update({
      where: { id: input.id },
      data: { status: "ACTIVE" },
    });
  }),
```

#### advancePhase

```typescript
advancePhase: protectedProcedure
  .input(z.object({ id: z.string().cuid() }))
  .mutation(async ({ ctx, input }) => {
    const userId = ctx.session.user.id;
    const userRole = ctx.session.user.role;

    // Verificar permissao para a fase atual
    const project = await db.adProject.findUniqueOrThrow({ where: { id: input.id } });
    
    // Determinar acao de aprovacao para a fase
    const phaseActionMap: Record<number, string> = {
      1: "aprovar_briefing",
      // Fases 2-5: avanco eh automatico quando todos videos estao prontos
      // Fase 6: avanco eh automatico quando todos videos estao PUBLICADO
    };

    if (phaseActionMap[project.currentPhase]) {
      const action = AD_ACTIONS[phaseActionMap[project.currentPhase]!];
      if (action) {
        const canPerform = await canUserPerformAdAction(userId, userRole, action);
        if (!canPerform) {
          throw new TRPCError({ code: "FORBIDDEN", message: "You cannot advance this phase" });
        }
      }
    }

    // Verificar se pode avancar
    const status = await canProjectAdvancePhase(input.id);
    if (!status.canAdvance) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: `Cannot advance: ${status.videosReady}/${status.videosTotal} videos ready`,
      });
    }

    // Avancar
    await advanceProjectPhase(input.id);

    return db.adProject.findUniqueOrThrow({ where: { id: input.id } });
  }),
```

---

## 6. Router: ad-video.ts

### Procedures

| Procedure | Tipo | Input | Descricao |
|-----------|------|-------|-----------|
| `create` | mutation | projectId, nomeDescritivo, tema, estilo, formato | Criar video no projeto |
| `update` | mutation | id, campos editaveis | Editar campos do video |
| `delete` | mutation | id | Deletar video (ate Fase 2) |
| `updatePhaseStatus` | mutation | id, phaseStatus | Atualizar status do video na fase |
| `markValidation` | mutation | id, field, value | Marcar/desmarcar validacao (boolean) |
| `regress` | mutation | id, targetPhase, reason | Enviar video de volta para fase anterior |
| `approvePhase6` | mutation | id | Aprovacao final (atribui AD numbers) |
| `setLinkAnuncio` | mutation | id, linkAnuncio | Preencher link do Meta Ads |

### Detalhes Criticos

#### create (com validacao de lock)

```typescript
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
```

#### markValidation (generico para todos os booleans)

```typescript
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
    const userRole = ctx.session.user.role;

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
      data: { [input.field]: input.value },
    });
  }),
```

#### approvePhase6 (atribui AD numbers)

```typescript
approvePhase6: protectedProcedure
  .input(z.object({ id: z.string().cuid() }))
  .mutation(async ({ ctx, input }) => {
    const userId = ctx.session.user.id;
    const userRole = ctx.session.user.role;

    // Checar permissao
    const canPerform = await canUserPerformAdAction(userId, userRole, AD_ACTIONS.aprovacao_final);
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
```

---

## 7. Router: ad-deliverable.ts

### Procedures

| Procedure | Tipo | Input | Descricao |
|-----------|------|-------|-----------|
| `create` | mutation | videoId, fileId, tempo, tamanho, mostraProduto?, descHook? | Criar deliverable |
| `update` | mutation | id, fileId?, tempo?, tamanho?, mostraProduto?, descHook? | Editar deliverable (ate Fase 6A) |
| `updateNomenclatura` | mutation | id, nomenclaturaEditada?, isPost?, versionNumber? | Editar na sub-etapa 6B |
| `delete` | mutation | id | Deletar deliverable (ate Fase 6A) |
| `regenerateNomenclatura` | mutation | videoId | Regenerar nomenclatura para todos deliverables do video |

### Detalhes Criticos

#### create (com hookNumber automatico e limite de 10)

```typescript
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
```

#### update (com checagem de imutabilidade)

```typescript
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
```

#### updateNomenclatura (sub-etapa 6B)

```typescript
updateNomenclatura: protectedProcedure
  .input(z.object({
    id: z.string().cuid(),
    nomenclaturaEditada: z.string().nullable().optional(),
    isPost: z.boolean().optional(),
    versionNumber: z.number().int().positive().optional(),
  }))
  .mutation(async ({ ctx, input }) => {
    const userId = ctx.session.user.id;
    const userRole = ctx.session.user.role;

    // Checar permissao de nomenclatura (Trafego HEAD/COORDINATOR)
    const canPerform = await canUserPerformAdAction(userId, userRole, AD_ACTIONS.nomenclatura);
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
```

---

## 8. Registrar Routers no appRouter

### Modificacao em `packages/api/src/routers/index.ts`

```typescript
// Adicionar imports
import { adProjectRouter } from "./ad-project";
import { adVideoRouter } from "./ad-video";
import { adDeliverableRouter } from "./ad-deliverable";

export const appRouter = router({
  // ... routers existentes ...
  
  // Novos routers para Ads Types
  adProject: adProjectRouter,
  adVideo: adVideoRouter,
  adDeliverable: adDeliverableRouter,
});
```

---

## Checklist Final da Fase 1

- [ ] `packages/api/src/services/ad-permissions.ts` criado com canUserPerformAdAction + AD_ACTIONS
- [ ] `packages/api/src/services/ad-counter.ts` criado com getNextAdNumber + assignAdNumbers
- [ ] `packages/api/src/services/ad-nomenclatura.ts` criado com generateNomenclatura + sanitizeName + generateCreatorCode
- [ ] `packages/api/src/services/ad-workflow.ts` criado com canProjectAdvancePhase + advanceProjectPhase + canVideoBeReady + regressVideo
- [ ] `packages/api/src/routers/ad-project.ts` criado com todas procedures
- [ ] `packages/api/src/routers/ad-video.ts` criado com todas procedures
- [ ] `packages/api/src/routers/ad-deliverable.ts` criado com todas procedures
- [ ] `packages/api/src/routers/index.ts` atualizado com 3 novos routers
- [ ] TypeScript compila sem erros (`npm run check-types`)
- [ ] Build passa (`npm run build`)
- [ ] Nenhum router existente foi modificado
- [ ] Nenhum service existente foi modificado
- [ ] SUPER_ADMIN bypass funciona em todas as acoes
- [ ] Multi-area OR funciona (qualquer area da lista pode aprovar)
- [ ] AD counter eh atomico (testado com requests concorrentes)
- [ ] Nomenclatura gera formato correto
- [ ] Lock de videos funciona (nao pode adicionar apos Fase 2)
- [ ] Imutabilidade de deliverables funciona (nao pode editar apos AD number)
