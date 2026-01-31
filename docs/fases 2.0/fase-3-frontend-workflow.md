# Fase 3 — Frontend: Workflow e Fases

> **Versao**: 2.0  
> **Data**: 31 de Janeiro de 2026  
> **Pre-requisitos**: Fase 2 completa (paginas basicas funcionando)  
> **Objetivo**: Implementar visualizacao de fases, progresso por video, deliverables, nomenclatura  
> **Complexidade**: ALTA — esta eh a fase mais complexa do frontend

---

## Visao Geral

Esta fase transforma a pagina de detalhe (`/ads-requests/[id]`) de uma visualizacao basica para o hub completo de workflow. Inclui:

1. **Barra de progresso de fases** (6 fases com indicador visual)
2. **Painel de fase atual** (conteudo muda por fase)
3. **Cards de video com status** (progresso individual)
4. **Secao de deliverables** (CRUD de hooks com upload)
5. **Preview de nomenclatura** (geracao automatica)
6. **Acoes de aprovacao** (botoes contextuais por permissao)

---

## Componentes a Criar

```
apps/web/src/components/ads/
  workflow/
    phase-progress-bar.tsx      # Barra horizontal com 6 fases
    phase-panel.tsx             # Painel que renderiza conteudo da fase atual
    phase-1-briefing.tsx        # Conteudo especifico da Fase 1
    phase-2-roteiro.tsx         # Conteudo especifico da Fase 2
    phase-3-elenco.tsx          # Conteudo especifico da Fase 3
    phase-4-producao.tsx        # Conteudo especifico da Fase 4
    phase-5-revisao.tsx         # Conteudo especifico da Fase 5
    phase-6-publicacao.tsx      # Conteudo especifico da Fase 6
  video/
    video-detail-card.tsx       # Card expandivel de video com todas infos
    video-status-tracker.tsx    # Indicador de status do video na fase
    video-regression-dialog.tsx # Dialog para enviar video de volta
  deliverable/
    deliverable-list.tsx        # Lista de hooks/deliverables
    deliverable-form.tsx        # Formulario de criacao/edicao de hook
    deliverable-card.tsx        # Card individual de deliverable
    file-upload-zone.tsx        # Zona de upload de arquivo de video
  nomenclatura/
    nomenclatura-preview.tsx    # Preview da nomenclatura gerada
    nomenclatura-editor.tsx     # Editor manual de nomenclatura
    nomenclatura-copy.tsx       # Botao de copiar nomenclatura
```

---

## 1. Barra de Progresso de Fases

### Design

```
[1 Briefing] ──── [2 Roteiro] ──── [3 Elenco] ──── [4 Producao] ──── [5 Revisao] ──── [6 Publicacao]
   ✓ done          ● current         ○ pending       ○ pending        ○ pending        ○ pending
```

### Componente: phase-progress-bar.tsx

```typescript
interface PhaseProgressBarProps {
  currentPhase: number;  // 1-6
  totalVideos: number;
  videosReadyInCurrentPhase: number;
}

// Cada fase eh um circulo + label + linha conectora
// Fases completas: circulo verde com check
// Fase atual: circulo azul pulsante com progresso (X/Y videos)
// Fases futuras: circulo cinza outline

const PHASES = [
  { number: 1, label: "Briefing", icon: FileText },
  { number: 2, label: "Roteiro", icon: PenTool },
  { number: 3, label: "Elenco", icon: Users },
  { number: 4, label: "Producao", icon: Video },
  { number: 5, label: "Revisao", icon: Eye },
  { number: 6, label: "Publicacao", icon: Globe },
];
```

### Comportamento

- Clicar em fase completa: mostra resumo daquela fase (read-only)
- Clicar em fase atual: mostra painel de trabalho
- Clicar em fase futura: nada (desabilitado)
- Tooltip em cada fase: "Fase X: [nome] — Y/Z videos prontos"

---

## 2. Painel de Fase Atual

### Componente: phase-panel.tsx

```typescript
interface PhasePanelProps {
  project: AdProjectWithVideos;
  currentPhase: number;
  userRole: string;
  userId: string;
}

// Renderiza o componente especifico da fase
function PhasePanel({ project, currentPhase, userRole, userId }: PhasePanelProps) {
  switch (currentPhase) {
    case 1: return <Phase1Briefing project={project} />;
    case 2: return <Phase2Roteiro project={project} />;
    case 3: return <Phase3Elenco project={project} />;
    case 4: return <Phase4Producao project={project} />;
    case 5: return <Phase5Revisao project={project} />;
    case 6: return <Phase6Publicacao project={project} />;
  }
}
```

---

## 3. Conteudo por Fase

### Fase 1: Briefing

```
+--------------------------------------------------+
| FASE 1: BRIEFING                                  |
+--------------------------------------------------+
| Briefing do Projeto                               |
| [Texto do briefing — editavel se DRAFT]           |
|                                                   |
| Videos no Projeto (3)          [+ Adicionar Video]|
| +----------------------------------------------+ |
| | ROTINACBDMUDOU | ANSIEDADE | UGC | VID       | |
| | CBDPARADORMR   | SONO      | DEPOI | VID     | |
| | COMOFUNCIONA   | GERAL     | INST | MOT      | |
| +----------------------------------------------+ |
|                                                   |
| [Aprovar Briefing] ← so aparece para CM/Growth    |
+--------------------------------------------------+
```

**Acoes**:
- Editar briefing (se DRAFT ou Fase 1)
- Adicionar/remover videos
- Aprovar briefing (Content Manager ou Growth, HEAD/COORDINATOR)

### Fase 2: Roteiro & Validacao

```
+--------------------------------------------------+
| FASE 2: ROTEIRO & VALIDACAO                       |
| Progresso: 1/3 videos prontos                     |
+--------------------------------------------------+
| Video: ROTINACBDMUDOU [EM_ANDAMENTO]              |
| +----------------------------------------------+ |
| | Roteiro:                                      | |
| | [Textarea editavel — Copywriting/Oslo]        | |
| |                                               | |
| | Validacoes:                                   | |
| | [x] Compliance  [ ] Medico                    | |
| +----------------------------------------------+ |
|                                                   |
| Video: CBDPARADORMR [PRONTO] ✓                    |
| +----------------------------------------------+ |
| | Roteiro: "Oi gente, hoje vou contar..."       | |
| | [x] Compliance  [x] Medico                    | |
| +----------------------------------------------+ |
|                                                   |
| [+ Adicionar Video] ← ultima chance!              |
+--------------------------------------------------+
```

**Acoes por video**:
- Escrever/editar roteiro (Copywriting ou Oslo)
- Marcar validacao Compliance (Compliance ou Medico)
- Marcar validacao Medico (Compliance ou Medico)
- Adicionar novos videos (ultima chance antes do lock)

**Indicadores visuais**:
- Video PENDENTE: borda cinza
- Video EM_ANDAMENTO: borda azul
- Video PRONTO: borda verde com check

### Fase 3: Elenco & Pre-Producao

```
+--------------------------------------------------+
| FASE 3: ELENCO & PRE-PRODUCAO                    |
| Progresso: 0/3 videos prontos                     |
| ⚠ Lista de videos TRAVADA                         |
+--------------------------------------------------+
| Video: ROTINACBDMUDOU [PENDENTE]                  |
| +----------------------------------------------+ |
| | Criador: [Select Creator ▼]                   | |
| | [Aguardando aprovacao de elenco]              | |
| |                                               | |
| | Storyboard: [URL input]                       | |
| | Locacao: [Text input]                         | |
| | Data Gravacao: [Date picker]                  | |
| |                                               | |
| | [Aprovar Elenco] [Aprovar Pre-Producao]       | |
| +----------------------------------------------+ |
+--------------------------------------------------+
```

**Acoes por video**:
- Selecionar criador (UGC Manager ou Oslo)
- Aprovar elenco (Growth HEAD — Lucas)
- Preencher storyboard/locacao/data (Oslo ou Design)
- Aprovar pre-producao (Growth HEAD — Lucas)

**Aviso visual**: Banner amarelo "Lista de videos travada — nao eh possivel adicionar novos videos"

### Fase 4: Producao & Entrega

```
+--------------------------------------------------+
| FASE 4: PRODUCAO & ENTREGA                       |
| Progresso: 1/3 videos entregues                   |
+--------------------------------------------------+
| Video: ROTINACBDMUDOU [EM_PRODUCAO]               |
| +----------------------------------------------+ |
| | Criador: Bruna Wright                         | |
| | Data Gravacao: 15 Fev 2026                    | |
| |                                               | |
| | Deliverables (Hooks):                         | |
| | (nenhum ainda)                                | |
| |                                               | |
| | [+ Adicionar Hook]                            | |
| +----------------------------------------------+ |
|                                                   |
| Video: CBDPARADORMR [ENTREGUE] ✓                  |
| +----------------------------------------------+ |
| | Deliverables (2):                             | |
| | HK1: video_hook1.mp4 | 30s | 9:16            | |
| | HK2: video_hook2.mp4 | 30s | 9:16            | |
| +----------------------------------------------+ |
+--------------------------------------------------+
```

**Acoes por video**:
- Adicionar deliverable (hook) com upload de arquivo
- Editar deliverable (trocar arquivo, tempo, tamanho)
- Deletar deliverable

### Fase 5: Revisao & Validacao Final

```
+--------------------------------------------------+
| FASE 5: REVISAO & VALIDACAO FINAL                 |
| Progresso: 0/3 videos prontos                     |
+--------------------------------------------------+
| Video: ROTINACBDMUDOU [EM_REVISAO]                |
| +----------------------------------------------+ |
| | Deliverables (2 hooks):                       | |
| | HK1: [Preview video] 30s 9:16                 | |
| | HK2: [Preview video] 30s 9:16                 | |
| |                                               | |
| | Revisoes:                                     | |
| | [ ] Conteudo (Growth/Trafego)                 | |
| | [ ] Design (Design)                           | |
| | [ ] Compliance Final (Compliance/Medico)      | |
| | [ ] Medico Final (Compliance/Medico)          | |
| |                                               | |
| | [+ Adicionar Hook] [Editar Hooks]             | |
| +----------------------------------------------+ |
+--------------------------------------------------+
```

**Acoes por video**:
- Marcar revisao de conteudo (Growth ou Trafego)
- Marcar revisao de design (Design)
- Marcar validacao final Compliance (Compliance ou Medico)
- Marcar validacao final Medico (Compliance ou Medico)
- Editar deliverables (ainda permitido)
- Adicionar novos hooks (se nao tem AD numbers)
- Enviar video de volta (regressao) com motivo

### Fase 6: Aprovacao & Publicacao

```
+--------------------------------------------------+
| FASE 6: APROVACAO & PUBLICACAO                    |
| Progresso: 1/3 videos publicados                  |
+--------------------------------------------------+
| Video: ROTINACBDMUDOU [PENDENTE]                  |
| +----------------------------------------------+ |
| | Sub-etapa: Aguardando Aprovacao Final          | |
| |                                               | |
| | Deliverables (2 hooks):                       | |
| | HK1: video_hook1.mp4 | 30s | 9:16            | |
| | HK2: video_hook2.mp4 | 30s | 9:16            | |
| |                                               | |
| | [Aprovar e Atribuir AD Numbers]               | |
| +----------------------------------------------+ |
|                                                   |
| Video: CBDPARADORMR [NOMENCLATURA]                |
| +----------------------------------------------+ |
| | Sub-etapa: Nomenclatura                        | |
| |                                               | |
| | HK1: AD0731                                   | |
| | AD0731_20260131_OSLLO_BRUNAWT_CBDPARADORMR... | |
| | [Copiar] [Editar] [Resetar]                   | |
| |                                               | |
| | HK2: AD0732                                   | |
| | AD0732_20260131_OSLLO_BRUNAWT_CBDPARADORMR... | |
| | [Copiar] [Editar] [Resetar]                   | |
| |                                               | |
| | [ ] Post impulsionado                         | |
| | Versao: [1 ▼]                                 | |
| |                                               | |
| | Link Meta Ads: [URL input]                    | |
| | [Marcar como Publicado]                       | |
| +----------------------------------------------+ |
|                                                   |
| Video: COMOFUNCIONA [PUBLICADO] ✓                  |
| +----------------------------------------------+ |
| | AD0733: AD0733_20260131_CLICK_NO1_COMOFUN...  | |
| | Link: https://business.facebook.com/ads/...   | |
| | (read-only)                                   | |
| +----------------------------------------------+ |
+--------------------------------------------------+
```

**Sub-etapas da Fase 6**:

| Sub-etapa | Status | Acoes |
|-----------|--------|-------|
| 6A: Aprovacao | PENDENTE → APROVADO | Botao "Aprovar" (atribui AD numbers automaticamente) |
| 6B: Nomenclatura | APROVADO → NOMENCLATURA | Editar nomenclatura, isPost, versionNumber |
| 6C: Publicacao | NOMENCLATURA → PUBLICADO | Preencher link Meta Ads, marcar publicado |

---

## 4. Deliverables (Hooks) — CRUD Completo

### Componente: deliverable-list.tsx

Lista de hooks de um video com acoes contextuais.

```typescript
interface DeliverableListProps {
  videoId: string;
  deliverables: AdDeliverable[];
  videoPhase: number;
  videoPhaseStatus: string;
  canEdit: boolean;
  canAddMore: boolean;  // false se >= 10 ou tem AD numbers
}
```

### Componente: deliverable-form.tsx (Dialog/Drawer)

Formulario para criar ou editar um deliverable:

```
+------------------------------------------+
| Novo Hook                                 |
+------------------------------------------+
| Arquivo de Video:                         |
| [Zona de Upload — drag & drop]            |
| ou [Selecionar da Biblioteca]             |
|                                           |
| Duracao:  [30s ▼]                         |
| Tamanho:  [9:16 ▼]                        |
| Mostra Produto: [ ]                       |
| Descricao do Hook: [textarea]             |
|                                           |
| [Cancelar]  [Salvar Hook]                 |
+------------------------------------------+
```

**Upload de arquivo**:
- Usa o sistema de upload existente (Vercel Blob via `trpc.upload`)
- Cria registro File, depois associa ao deliverable via fileId
- Preview de video inline apos upload
- Aceita: .mp4, .mov, .webm

### Componente: deliverable-card.tsx

Card individual de um hook:

```
+------------------------------------------+
| HK1  |  AD0731  |  30s  |  9:16          |
| [Preview thumbnail do video]              |
| Mostra Produto: Sim                       |
| AD0731_20260131_OSLLO_BRUNAWT_ROTINA...   |
| [Editar] [Deletar] [Copiar Nomenclatura]  |
+------------------------------------------+
```

**Estados do card**:
- Sem AD number: editavel, deletavel
- Com AD number: imutavel (exceto nomenclatura na sub-etapa 6B)
- Publicado: totalmente read-only

---

## 5. Nomenclatura — Preview e Edicao

### Componente: nomenclatura-preview.tsx

Mostra a nomenclatura gerada automaticamente com destaque de cada parte:

```
AD0731 _ 20260131 _ OSLLO _ BRUNAWT _ ROTINACBDMUDOU _ ANSIEDADE _ UGC _ VID _ 30S _ 9X16
 ^^^^    ^^^^^^^^    ^^^^^   ^^^^^^^   ^^^^^^^^^^^^^^    ^^^^^^^^^   ^^^   ^^^   ^^^   ^^^^
 AD#     Data        Origin  Creator   Nome              Tema       Estilo Fmt  Tempo  Tam
```

Cada parte tem cor diferente e tooltip explicativo.

### Componente: nomenclatura-editor.tsx

Campo de texto para edicao manual:

```
+------------------------------------------+
| Nomenclatura Gerada:                      |
| AD0731_20260131_OSLLO_BRUNAWT_ROTINA...   |
|                                           |
| Nomenclatura Editada (opcional):          |
| [input text — se vazio, usa a gerada]     |
|                                           |
| [Resetar para Gerada]                     |
+------------------------------------------+
```

### Componente: nomenclatura-copy.tsx

Botao que copia a nomenclatura final (editada ou gerada) para o clipboard:

```typescript
function NomenclaturaCopy({ deliverable }: { deliverable: AdDeliverable }) {
  const nomenclatura = deliverable.nomenclaturaEditada || deliverable.nomenclaturaGerada;
  
  const handleCopy = () => {
    navigator.clipboard.writeText(nomenclatura || "");
    toast.success("Nomenclatura copiada!");
  };

  return (
    <button onClick={handleCopy} title="Copiar nomenclatura">
      <CopyIcon />
    </button>
  );
}
```

---

## 6. Regressao de Video

### Componente: video-regression-dialog.tsx

Dialog para enviar video de volta para fase anterior:

```
+------------------------------------------+
| Enviar Video de Volta                     |
+------------------------------------------+
| Video: ROTINACBDMUDOU                     |
| Fase atual: 5 (Revisao)                  |
|                                           |
| Enviar para qual fase?                    |
| ( ) Fase 2 - Roteiro                     |
| ( ) Fase 3 - Elenco                      |
| ( ) Fase 4 - Producao                    |
|                                           |
| Motivo (obrigatorio):                     |
| [textarea — min 10 chars]                 |
|                                           |
| ⚠ O video voltara para a fase selecionada|
| com status PENDENTE. O projeto nao        |
| avancara ate este video voltar a PRONTO.  |
|                                           |
| [Cancelar]  [Enviar de Volta]             |
+------------------------------------------+
```

**Regras**:
- Nao pode voltar para Fase 1
- Nao pode regredir se tem AD numbers (Fase 6A ja passou)
- Motivo obrigatorio (min 10 chars)
- So aparece para aprovadores da fase atual ou SUPER_ADMIN

---

## 7. Acoes Contextuais por Permissao

### Logica de Exibicao de Botoes

Cada botao de acao so aparece se o usuario tem permissao. A checagem eh feita no frontend para UX (esconder botoes) e no backend para seguranca (rejeitar requests).

```typescript
// Hook customizado para checar permissoes
function useAdPermission(actionKey: string): boolean {
  const { data: session } = useSession();
  const { data: memberships } = useQuery(
    trpc.area.getUserMemberships.queryOptions({ userId: session?.user.id })
  );

  if (!session) return false;
  if (session.user.role === "SUPER_ADMIN") return true;

  const action = AD_ACTIONS[actionKey];
  if (!action) return false;
  if (action.approverAreaSlugs.length === 0) return true;

  // Checar se usuario eh membro de alguma area com posicao correta
  return memberships?.some(
    (m) =>
      action.approverAreaSlugs.includes(m.area.slug) &&
      action.approverPositions.includes(m.position)
  ) ?? false;
}
```

### Mapeamento Botao → Acao

| Botao | Acao | Fase | Aparece para |
|-------|------|------|-------------|
| Aprovar Briefing | aprovar_briefing | 1 | CM/Growth HEAD/COORD |
| Marcar Compliance (roteiro) | validar_roteiro_compliance | 2 | Compliance/Medico HEAD/COORD |
| Marcar Medico (roteiro) | validar_roteiro_medico | 2 | Compliance/Medico HEAD/COORD |
| Aprovar Elenco | aprovar_elenco | 3 | Growth HEAD |
| Aprovar Pre-Producao | aprovar_pre_producao | 3 | Growth HEAD |
| Marcar Revisao Conteudo | revisao_conteudo | 5 | Growth/Trafego HEAD/COORD |
| Marcar Revisao Design | revisao_design | 5 | Design HEAD/COORD |
| Marcar Compliance Final | validacao_final | 5 | Compliance/Medico HEAD/COORD |
| Marcar Medico Final | validacao_final | 5 | Compliance/Medico HEAD/COORD |
| Aprovar Final (AD numbers) | aprovacao_final | 6 | Growth/Trafego/CM HEAD |
| Editar Nomenclatura | nomenclatura | 6 | Trafego HEAD/COORD |
| Avancar Fase | (fase atual) | * | Depende da fase |

---

## 8. Layout Completo da Pagina de Detalhe

```
+================================================================+
| [< Voltar]  Campanha Ansiedade Janeiro  [Editar] [Cancelar]    |
| [ACTIVE] [Video Criativo] [Oslo] [HIGH] [Deadline: 31 Jan]    |
+================================================================+
|                                                                 |
| [1 ✓] ─── [2 ●] ─── [3 ○] ─── [4 ○] ─── [5 ○] ─── [6 ○]    |
| Brief    Roteiro   Elenco   Producao  Revisao   Publicacao     |
|                    2/3 videos prontos                           |
|                                                                 |
+================================================================+
|                                                                 |
| FASE 2: ROTEIRO & VALIDACAO                                    |
| ─────────────────────────────────────────────────────────       |
|                                                                 |
| ┌─ Video 1: ROTINACBDMUDOU ──────────── [EM_ANDAMENTO] ─┐     |
| │ Roteiro: [textarea editavel]                            │     |
| │ Validacoes: [x] Compliance  [ ] Medico                  │     |
| └─────────────────────────────────────────────────────────┘     |
|                                                                 |
| ┌─ Video 2: CBDPARADORMR ──────────────────── [PRONTO] ✓ ┐     |
| │ Roteiro: "Oi gente, hoje vou contar como..."            │     |
| │ Validacoes: [x] Compliance  [x] Medico                  │     |
| └─────────────────────────────────────────────────────────┘     |
|                                                                 |
| ┌─ Video 3: COMOFUNCIONA ──────────────── [PENDENTE] ─── ┐     |
| │ Roteiro: (vazio)                                        │     |
| │ Validacoes: [ ] Compliance  [ ] Medico                  │     |
| └─────────────────────────────────────────────────────────┘     |
|                                                                 |
| [+ Adicionar Video]                                             |
|                                                                 |
+================================================================+
| Progresso: 1/3 videos prontos                                   |
| [Avancar para Fase 3] ← desabilitado (faltam 2 videos)        |
+================================================================+
```

---

## 9. Responsividade

### Desktop (>= 1024px)
- Layout completo como descrito acima
- Barra de fases horizontal
- Cards de video lado a lado (2 colunas)

### Tablet (768px - 1023px)
- Barra de fases compacta (numeros sem labels)
- Cards de video em coluna unica
- Formularios full-width

### Mobile (< 768px)
- Barra de fases como stepper vertical
- Cards de video empilhados
- Botoes de acao full-width
- Deliverables em lista vertical

---

## Checklist Final da Fase 3

- [ ] `phase-progress-bar.tsx` criado e funcional
- [ ] `phase-panel.tsx` criado com switch por fase
- [ ] Componentes de fase 1-6 criados
- [ ] `video-detail-card.tsx` criado com status visual
- [ ] `video-regression-dialog.tsx` criado
- [ ] `deliverable-list.tsx` criado
- [ ] `deliverable-form.tsx` criado com upload de arquivo
- [ ] `deliverable-card.tsx` criado com preview de video
- [ ] `nomenclatura-preview.tsx` criado com destaque de partes
- [ ] `nomenclatura-editor.tsx` criado
- [ ] `nomenclatura-copy.tsx` criado
- [ ] Hook `useAdPermission` criado
- [ ] Botoes de acao aparecem/escondem por permissao
- [ ] Fase 1: aprovar briefing funciona
- [ ] Fase 2: roteiro + validacoes funcionam
- [ ] Fase 3: elenco + pre-producao funcionam
- [ ] Fase 4: upload de hooks funciona
- [ ] Fase 5: revisoes + validacoes finais funcionam
- [ ] Fase 6A: aprovacao final atribui AD numbers
- [ ] Fase 6B: nomenclatura gerada e editavel
- [ ] Fase 6C: link Meta Ads + marcar publicado
- [ ] Regressao de video funciona
- [ ] Lock de videos visivel (banner na Fase 3+)
- [ ] Imutabilidade de deliverables apos AD numbers
- [ ] Avancar fase funciona quando todos videos prontos
- [ ] Projeto marca COMPLETED quando todos PUBLICADO
- [ ] Responsivo (desktop, tablet, mobile)
- [ ] Build passa (`npm run build`)
