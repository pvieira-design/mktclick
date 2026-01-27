# Request & Approval System MVP

## Context

### Original Request
Implementar o sistema de Requests e Aprovacao para o Click Cannabis Marketing System. Um fluxo completo de criacao, submissao, revisao e aprovacao/rejeicao de pedidos de conteudo de marketing.

### Interview Summary
**Key Discussions**:
- **Scope MVP**: Fluxo completo com 6 content types, deadline e patologia opcionais, origin obrigatorio
- **Interface**: Lista substitui home, paginas dedicadas para detalhes e criacao, filtros basicos
- **Behaviors**: Auto-save em draft, timeline de historico, modal de rejeicao com motivo obrigatorio
- **Status Flow**: DRAFT -> PENDING -> IN_REVIEW -> APPROVED/REJECTED, com loop de correcao
- **Tech Stack**: Next.js 16, tRPC 11, Prisma 7, Better Auth, shadcn/ui, Sonner

**Research Findings**:
- tRPC usa `protectedProcedure` com sessao no contexto (`packages/api/src/index.ts:11-25`)
- Prisma multi-file schema em `packages/db/prisma/schema/`
- Forms usam `@tanstack/react-form` com Zod (`sign-in-form.tsx` como referencia)
- Cards atuais tem `rounded-none` - precisa ajustar para rounded corners
- Global error handler ja mostra toasts via Sonner

### Metis Review
**Identified Gaps** (addressed):
- **State Locking**: Implementar transacao atomica para "Start Review" evitando race conditions
- **Draft Validation**: Auto-save nao valida campos obrigatorios, apenas ao submeter
- **User Deletion**: Usar `onDelete: SetNull` para `reviewedById`, manter historico intacto
- **Empty State**: Definir UI para quando nao ha requests
- **Search Behavior**: Partial match, case-insensitive via `contains` + `mode: insensitive`

**Out of Scope** (explicitly excluded):
- Media/Attachments upload (links manuais por enquanto)
- Notifications (email/Slack)
- Comments thread (apenas rejectionReason)
- Bulk actions
- Version control de edicoes (overwrite simples)
- Review timeout/force takeover

---

## Work Objectives

### Core Objective
Criar um sistema completo de solicitacoes de conteudo de marketing com fluxo de aprovacao, permitindo que a equipe crie, submeta, revise e aprove/rejeite pedidos de forma transparente e auditada.

### Concrete Deliverables
1. **Database**: Models `Request` e `RequestHistory` com enums em `packages/db/prisma/schema/request.prisma`
2. **API**: Router tRPC `request` com CRUD + transicoes de status em `packages/api/src/routers/request.ts`
3. **UI Pages**: 
   - `/dashboard` - Lista de requests (substitui home atual)
   - `/requests/new` - Formulario de criacao
   - `/requests/[id]` - Detalhes com timeline e acoes
4. **Components**: RequestForm, RequestCard, StatusBadge, Timeline, Filters, RejectModal
5. **Integration**: Sidebar atualizada com link "Requests"

### Definition of Done
- [ ] `npm run db:push` executa sem erros e cria tabelas
- [ ] `npm run check-types` passa sem erros
- [ ] Fluxo completo funciona: criar draft -> submeter -> iniciar revisao -> aprovar
- [ ] Fluxo de rejeicao funciona: rejeitar com motivo -> corrigir -> re-submeter
- [ ] Timeline mostra todas as acoes com timestamps
- [ ] Filtros funcionam: status, content type, busca por titulo
- [ ] Auto-save funciona em drafts (onBlur)
- [ ] Toasts aparecem para todas as acoes

### Must Have
- Todos os 6 content types funcionando
- Todos os 5 status funcionando com transicoes corretas
- Timeline de historico visivel
- Filtros basicos funcionando
- Design com rounded corners (shadcn/ui padrao)

### Must NOT Have (Guardrails)
- **NO** upload de arquivos/media (fora do escopo MVP)
- **NO** sistema de comentarios (apenas rejectionReason)
- **NO** notificacoes email/Slack
- **NO** RBAC diferenciado (todos sao admin)
- **NO** bulk actions
- **NO** version control de edicoes
- **NO** infinite scroll (usar paginacao simples)
- **NO** dark mode toggle (manter tema atual)

---

## Verification Strategy (MANDATORY)

### Test Decision
- **Infrastructure exists**: NO (sem testes configurados)
- **User wants tests**: MANUAL-ONLY (verificacao via Playwright)
- **Framework**: none

### Manual QA Protocol
Cada TODO inclui procedimentos de verificacao manual usando:
- **Playwright browser**: Para verificacoes de UI
- **curl/terminal**: Para verificacoes de API
- **Prisma Studio**: Para verificacoes de banco de dados

---

## Task Flow

```
Phase 1: Database
  [1] Schema Prisma

Phase 2: API (depends on 1)
  [2] Request Router

Phase 3: UI Foundation (depends on 2)
  [3] shadcn components   ─┬─ parallelizable
  [4] RequestCard         ─┤
  [5] StatusBadge         ─┤
  [6] Filters             ─┘

Phase 4: Pages (depends on 3-6)
  [7] Dashboard (lista)   ─┬─ parallelizable
  [8] Request Details     ─┤
  [9] Request New         ─┘

Phase 5: Integration (depends on 7-9)
  [10] Sidebar + Polish
```

## Parallelization

| Group | Tasks | Reason |
|-------|-------|--------|
| A | 3, 4, 5, 6 | Componentes independentes |
| B | 7, 8, 9 | Paginas independentes (podem ser feitas em paralelo) |

| Task | Depends On | Reason |
|------|------------|--------|
| 2 | 1 | API precisa dos tipos Prisma |
| 3-6 | 2 | Componentes precisam dos tipos da API |
| 7-9 | 3-6 | Paginas usam os componentes |
| 10 | 7-9 | Integracao final |

---

## TODOs

- [ ] 1. Criar Schema Prisma para Request e RequestHistory

  **What to do**:
  - Criar arquivo `packages/db/prisma/schema/request.prisma`
  - Definir enums: `RequestStatus`, `ContentType`, `RequestOrigin`, `Patologia`, `Priority`, `RequestAction`
  - Definir model `Request` com todos os campos especificados
  - Definir model `RequestHistory` para audit trail
  - Rodar `npm run db:push` para aplicar schema

  **Enums a criar**:
  ```prisma
  enum RequestStatus {
    DRAFT
    PENDING
    IN_REVIEW
    APPROVED
    REJECTED
    CANCELLED
  }
  
  enum ContentType {
    VIDEO_UGC
    VIDEO_INSTITUCIONAL
    CARROSSEL
    POST_UNICO
    STORIES
    REELS
  }
  
  enum RequestOrigin {
    OSLO
    INTERNO
    INFLUENCER
  }
  
  enum Patologia {
    INSONIA
    ANSIEDADE
    DOR
    ESTRESSE
    INFLAMACAO
    OUTRO
  }
  
  enum Priority {
    LOW
    MEDIUM
    HIGH
    URGENT
  }
  
  enum RequestAction {
    CREATED
    UPDATED
    SUBMITTED
    REVIEW_STARTED
    APPROVED
    REJECTED
    CORRECTED
    CANCELLED
  }
  ```

  **Model Request**:
  - id: String @id @default(cuid())
  - title: String (3-200 chars - validar na API)
  - description: String (10-5000 chars, Markdown)
  - contentType: ContentType enum
  - origin: RequestOrigin enum
  - status: RequestStatus @default(DRAFT)
  - priority: Priority @default(MEDIUM)
  - deadline: DateTime? (opcional)
  - patologia: Patologia? (opcional)
  - rejectionReason: String? (obrigatorio se REJECTED)
  - createdById: String (FK User)
  - reviewedById: String? (nullable, FK User)
  - createdAt: DateTime @default(now())
  - updatedAt: DateTime @updatedAt
  - Relations: createdBy -> User, reviewedBy -> User (onDelete: SetNull), history -> RequestHistory[]

  **Model RequestHistory**:
  - id: String @id @default(cuid())
  - requestId: String (FK Request)
  - action: RequestAction enum
  - changedById: String (FK User)
  - oldValues: Json? (snapshot antes)
  - newValues: Json? (snapshot depois)
  - createdAt: DateTime @default(now())
  - Relations: request -> Request, changedBy -> User

  **Must NOT do**:
  - NAO adicionar campos de media/attachments
  - NAO criar modelo de Comments

  **Parallelizable**: NO (e a primeira task)

  **References**:

  **Pattern References** (existing code to follow):
  - `packages/db/prisma/schema/auth.prisma:1-17` - Padrao de model User com relations e @@map
  - `packages/db/prisma/schema/auth.prisma:19-33` - Padrao de Session com FK para User e @@index
  - `packages/db/prisma/schema/schema.prisma:1-9` - Configuracao de generator e datasource

  **Documentation References**:
  - Prisma Enums: https://www.prisma.io/docs/concepts/components/prisma-schema/data-model#defining-enums
  - Prisma Relations: https://www.prisma.io/docs/concepts/components/prisma-schema/relations
  - Prisma Json type: https://www.prisma.io/docs/concepts/components/prisma-schema/data-model#json

  **Acceptance Criteria**:

  **Terminal Verification:**
  - [ ] `npm run db:push` executa sem erros
  - [ ] Output contem: "Your database is now in sync with your Prisma schema"

  **Database Verification (Prisma Studio):**
  - [ ] `npm run db:studio` abre interface
  - [ ] Tabela `request` existe com todas as colunas
  - [ ] Tabela `request_history` existe com todas as colunas
  - [ ] Enums aparecem corretamente nos campos

  **Commit**: YES
  - Message: `feat(db): add Request and RequestHistory models with enums`
  - Files: `packages/db/prisma/schema/request.prisma`
  - Pre-commit: `npm run db:push`

---

- [ ] 2. Criar tRPC Router para Requests

  **What to do**:
  - Criar arquivo `packages/api/src/routers/request.ts`
  - Importar prisma de `@marketingclickcannabis/db`
  - Criar Zod schemas para validacao de input
  - Implementar procedures CRUD + transicoes de status
  - Registrar router no `appRouter` em `packages/api/src/routers/index.ts`

  **Procedures a implementar**:
  
  1. `list` (query) - Listar requests com filtros e paginacao
     - Input: { status?, contentType?, search?, page?, limit? }
     - Retorna: { items: Request[], total: number, hasMore: boolean }
     - Ordenar por createdAt DESC
  
  2. `getById` (query) - Buscar request por ID com historico
     - Input: { id: string }
     - Include: createdBy, reviewedBy, history (com changedBy)
     - Retorna: Request com relations
  
  3. `create` (mutation) - Criar novo request (status DRAFT)
     - Input: { title, description, contentType, origin, priority?, deadline?, patologia? }
     - Validacoes: title 3-200 chars, description 10-5000 chars
     - Criar RequestHistory com action CREATED
     - Retorna: Request criado
  
  4. `update` (mutation) - Atualizar request em DRAFT
     - Input: { id, title?, description?, contentType?, origin?, priority?, deadline?, patologia? }
     - Validar: status deve ser DRAFT
     - Criar RequestHistory com action UPDATED, oldValues, newValues
     - Retorna: Request atualizado
  
  5. `submit` (mutation) - Submeter para revisao (DRAFT -> PENDING)
     - Input: { id }
     - Validar: status deve ser DRAFT, campos obrigatorios preenchidos
     - Criar RequestHistory com action SUBMITTED
     - Retorna: Request atualizado
  
  6. `startReview` (mutation) - Iniciar revisao (PENDING -> IN_REVIEW)
     - Input: { id }
     - Validar: status deve ser PENDING
     - **IMPORTANTE**: Usar transacao atomica para evitar race condition
     - Setar reviewedById para usuario atual
     - Criar RequestHistory com action REVIEW_STARTED
     - Retorna: Request atualizado
  
  7. `approve` (mutation) - Aprovar (IN_REVIEW -> APPROVED)
     - Input: { id }
     - Validar: status deve ser IN_REVIEW, usuario deve ser o reviewer
     - Criar RequestHistory com action APPROVED
     - Retorna: Request atualizado
  
  8. `reject` (mutation) - Rejeitar (IN_REVIEW -> REJECTED)
     - Input: { id, reason: string (min 10 chars) }
     - Validar: status deve ser IN_REVIEW, usuario deve ser o reviewer
     - Setar rejectionReason
     - Criar RequestHistory com action REJECTED
     - Retorna: Request atualizado
  
  9. `correct` (mutation) - Corrigir e re-submeter (REJECTED -> PENDING)
     - Input: { id, title?, description?, contentType?, origin?, priority?, deadline?, patologia? }
     - Validar: status deve ser REJECTED
     - Limpar rejectionReason e reviewedById
     - Criar RequestHistory com action CORRECTED
     - Retorna: Request atualizado
  
  10. `cancel` (mutation) - Cancelar request
      - Input: { id }
      - Validar: status NAO pode ser APPROVED
      - Validar: usuario e criador OU admin
      - Criar RequestHistory com action CANCELLED
      - Retorna: Request atualizado

  **Must NOT do**:
  - NAO implementar upload de media
  - NAO implementar notificacoes
  - NAO implementar RBAC complexo (todos sao admin)

  **Parallelizable**: NO (depends on 1)

  **References**:

  **Pattern References** (existing code to follow):
  - `packages/api/src/index.ts:1-25` - Definicao de publicProcedure e protectedProcedure
  - `packages/api/src/routers/index.ts:1-14` - Como registrar procedures no appRouter
  - `packages/api/src/context.ts` - Como acessar session via ctx.session

  **API/Type References** (contracts to implement against):
  - Prisma types gerados em `packages/db/generated/` apos db:push

  **Documentation References**:
  - tRPC procedures: https://trpc.io/docs/server/procedures
  - tRPC input validation: https://trpc.io/docs/server/validators
  - Prisma transactions: https://www.prisma.io/docs/concepts/components/prisma-client/transactions

  **Acceptance Criteria**:

  **TypeScript Verification:**
  - [ ] `npm run check-types` passa sem erros no packages/api

  **API Verification (curl):**
  - [ ] Health check ainda funciona:
    ```bash
    curl http://localhost:3001/api/trpc/healthCheck
    ```
    Expected: `{"result":{"data":"OK"}}`

  **Manual Verification (browser console):**
  - [ ] Abrir http://localhost:3001, logar, abrir DevTools console
  - [ ] Executar: `await fetch('/api/trpc/request.list?input={}', {credentials:'include'}).then(r=>r.json())`
  - [ ] Resposta contem: `{"result":{"data":{"items":[],"total":0,"hasMore":false}}}`

  **Commit**: YES
  - Message: `feat(api): add request router with CRUD and status transitions`
  - Files: `packages/api/src/routers/request.ts`, `packages/api/src/routers/index.ts`
  - Pre-commit: `npm run check-types`

---

- [ ] 3. Adicionar componentes shadcn/ui necessarios

  **What to do**:
  - Instalar componentes shadcn/ui que ainda nao existem:
    - `textarea` - Para descricao do request
    - `select` - Para dropdowns de enum
    - `badge` - Para status badges
    - `dialog` - Para modal de rejeicao
    - `separator` - Para timeline
    - `pagination` - Para lista
  - Ajustar Card component para ter rounded corners (atualmente rounded-none)

  **Commands**:
  ```bash
  cd apps/web
  npx shadcn@latest add textarea select badge dialog separator
  ```

  **Card Adjustment**:
  - Editar `apps/web/src/components/ui/card.tsx`
  - Trocar `rounded-none` por `rounded-lg` ou `rounded-xl`
  - Manter consistencia em CardHeader e CardFooter

  **Must NOT do**:
  - NAO alterar cores ou tema
  - NAO adicionar componentes desnecessarios

  **Parallelizable**: YES (with 4, 5, 6)

  **References**:

  **Pattern References** (existing code to follow):
  - `apps/web/src/components/ui/card.tsx:1-90` - Estrutura atual do Card (precisa ajustar rounded)
  - `apps/web/src/components/ui/button.tsx` - Padrao de componente shadcn

  **Documentation References**:
  - shadcn/ui CLI: https://ui.shadcn.com/docs/cli
  - shadcn/ui components: https://ui.shadcn.com/docs/components

  **Acceptance Criteria**:

  **File Verification:**
  - [ ] Arquivo `apps/web/src/components/ui/textarea.tsx` existe
  - [ ] Arquivo `apps/web/src/components/ui/select.tsx` existe
  - [ ] Arquivo `apps/web/src/components/ui/badge.tsx` existe
  - [ ] Arquivo `apps/web/src/components/ui/dialog.tsx` existe
  - [ ] Arquivo `apps/web/src/components/ui/separator.tsx` existe

  **Visual Verification (Playwright):**
  - [ ] Abrir http://localhost:3001/dashboard
  - [ ] Cards (se existirem) tem cantos arredondados

  **Commit**: YES
  - Message: `feat(ui): add shadcn components and fix card rounded corners`
  - Files: `apps/web/src/components/ui/*.tsx`
  - Pre-commit: `npm run check-types`

---

- [ ] 4. Criar componente RequestCard

  **What to do**:
  - Criar `apps/web/src/components/request-card.tsx`
  - Exibir: titulo, content type badge, status badge, origin, deadline (se existir), criador, data
  - Usar Card component do shadcn
  - Link para pagina de detalhes
  - Design limpo com rounded corners

  **Props**:
  ```typescript
  interface RequestCardProps {
    request: {
      id: string;
      title: string;
      contentType: ContentType;
      status: RequestStatus;
      origin: RequestOrigin;
      priority: Priority;
      deadline: Date | null;
      createdAt: Date;
      createdBy: { name: string };
    };
  }
  ```

  **Layout**:
  - Header: Titulo (link) + Status Badge
  - Content: Content Type | Origin | Priority
  - Footer: Criado por X em DD/MM/YYYY | Deadline: DD/MM/YYYY (se existir)

  **Must NOT do**:
  - NAO incluir acoes no card (acoes ficam na pagina de detalhes)
  - NAO mostrar descricao completa (apenas na pagina de detalhes)

  **Parallelizable**: YES (with 3, 5, 6)

  **References**:

  **Pattern References** (existing code to follow):
  - `apps/web/src/components/ui/card.tsx:1-90` - Componentes Card, CardHeader, CardContent, CardFooter
  - `apps/web/src/components/profile-widget.tsx` - Exemplo de componente que usa session data

  **API/Type References**:
  - Types de Request vem de `@marketingclickcannabis/api` (inferidos do router)

  **Acceptance Criteria**:

  **TypeScript Verification:**
  - [ ] `npm run check-types` passa sem erros

  **Visual Verification (Playwright):**
  - [ ] Criar request de teste via API ou Prisma Studio
  - [ ] Navegar para /dashboard
  - [ ] Card aparece com todas as informacoes
  - [ ] Card tem cantos arredondados
  - [ ] Clicar no titulo navega para /requests/[id]

  **Commit**: YES
  - Message: `feat(ui): add RequestCard component`
  - Files: `apps/web/src/components/request-card.tsx`
  - Pre-commit: `npm run check-types`

---

- [ ] 5. Criar componente StatusBadge

  **What to do**:
  - Criar `apps/web/src/components/status-badge.tsx`
  - Usar Badge component do shadcn
  - Cores diferentes por status:
    - DRAFT: cinza/neutral
    - PENDING: amarelo/warning
    - IN_REVIEW: azul/info
    - APPROVED: verde/success
    - REJECTED: vermelho/destructive
    - CANCELLED: cinza escuro/muted

  **Props**:
  ```typescript
  interface StatusBadgeProps {
    status: RequestStatus;
    size?: 'sm' | 'default';
  }
  ```

  **Labels em Portugues**:
  - DRAFT: "Rascunho"
  - PENDING: "Pendente"
  - IN_REVIEW: "Em Revisao"
  - APPROVED: "Aprovado"
  - REJECTED: "Rejeitado"
  - CANCELLED: "Cancelado"

  **Must NOT do**:
  - NAO adicionar logica de transicao no badge (apenas visual)

  **Parallelizable**: YES (with 3, 4, 6)

  **References**:

  **Pattern References**:
  - `apps/web/src/components/ui/badge.tsx` (apos task 3)
  - Variant pattern do shadcn: default, secondary, destructive, outline

  **Acceptance Criteria**:

  **TypeScript Verification:**
  - [ ] `npm run check-types` passa sem erros

  **Visual Verification:**
  - [ ] Cada status tem cor distinta e legivel
  - [ ] Labels em portugues corretos

  **Commit**: YES
  - Message: `feat(ui): add StatusBadge component with color coding`
  - Files: `apps/web/src/components/status-badge.tsx`
  - Pre-commit: `npm run check-types`

---

- [ ] 6. Criar componente Filters

  **What to do**:
  - Criar `apps/web/src/components/request-filters.tsx`
  - Filtros: Status (select), Content Type (select), Search (input)
  - Usar componentes shadcn: Select, Input
  - Debounce no search (300ms)
  - Callback onChange com valores atuais

  **Props**:
  ```typescript
  interface RequestFiltersProps {
    filters: {
      status?: RequestStatus;
      contentType?: ContentType;
      search?: string;
    };
    onChange: (filters: RequestFiltersProps['filters']) => void;
  }
  ```

  **Layout**: Horizontal em desktop, vertical em mobile (responsive)

  **Labels em Portugues**:
  - "Filtrar por status"
  - "Filtrar por tipo"
  - "Buscar por titulo..."

  **Must NOT do**:
  - NAO adicionar filtros por data
  - NAO adicionar filtros por criador

  **Parallelizable**: YES (with 3, 4, 5)

  **References**:

  **Pattern References**:
  - `apps/web/src/components/ui/select.tsx` (apos task 3)
  - `apps/web/src/components/ui/input.tsx` - Input existente

  **Documentation References**:
  - React hooks para debounce: use setTimeout + useEffect ou useDeferredValue

  **Acceptance Criteria**:

  **TypeScript Verification:**
  - [ ] `npm run check-types` passa sem erros

  **Functional Verification:**
  - [ ] Selecionar status filtra lista
  - [ ] Selecionar content type filtra lista
  - [ ] Digitar no search filtra apos 300ms
  - [ ] Limpar filtro mostra todos

  **Commit**: YES
  - Message: `feat(ui): add RequestFilters component with debounced search`
  - Files: `apps/web/src/components/request-filters.tsx`
  - Pre-commit: `npm run check-types`

---

- [ ] 7. Refatorar Dashboard para Lista de Requests

  **What to do**:
  - Reescrever `apps/web/src/app/dashboard/page.tsx`
  - Usar tRPC `request.list` com TanStack Query
  - Mostrar RequestFilters no topo
  - Mostrar lista de RequestCards
  - Mostrar paginacao simples (Anterior/Proximo)
  - Mostrar empty state quando nao ha requests
  - Botao "Novo Request" que navega para /requests/new

  **Layout**:
  ```
  [Header: "Requests" + Botao "Novo Request"]
  [Filters: Status | Type | Search]
  [Lista de Cards ou Empty State]
  [Paginacao: Anterior | Pagina X de Y | Proximo]
  ```

  **Empty State**:
  - Icone ilustrativo
  - Texto: "Nenhum request encontrado"
  - Sub-texto: "Crie seu primeiro request clicando no botao acima"

  **Must NOT do**:
  - NAO usar infinite scroll
  - NAO mostrar mais de 20 items por pagina

  **Parallelizable**: YES (with 8, 9)

  **References**:

  **Pattern References**:
  - `apps/web/src/app/dashboard/page.tsx:1-17` - Estrutura atual a ser substituida
  - `apps/web/src/utils/trpc.ts:35-38` - Como usar trpc proxy com TanStack Query

  **Component References**:
  - `apps/web/src/components/request-card.tsx` (task 4)
  - `apps/web/src/components/request-filters.tsx` (task 6)

  **Documentation References**:
  - TanStack Query with tRPC: https://trpc.io/docs/client/react/useQuery

  **Acceptance Criteria**:

  **TypeScript Verification:**
  - [ ] `npm run check-types` passa sem erros

  **Visual Verification (Playwright):**
  - [ ] Navegar para http://localhost:3001/dashboard
  - [ ] Pagina carrega sem erros
  - [ ] Filtros aparecem no topo
  - [ ] Botao "Novo Request" visivel
  - [ ] Se nao ha requests, empty state aparece
  - [ ] Se ha requests, cards aparecem
  - [ ] Paginacao funciona (se mais de 20 items)

  **Commit**: YES
  - Message: `feat(pages): replace dashboard home with request list`
  - Files: `apps/web/src/app/dashboard/page.tsx`
  - Pre-commit: `npm run check-types`

---

- [ ] 8. Criar pagina de Detalhes do Request

  **What to do**:
  - Criar `apps/web/src/app/requests/[id]/page.tsx`
  - Usar tRPC `request.getById` com TanStack Query
  - Mostrar todos os campos do request
  - Mostrar timeline de historico
  - Mostrar botoes de acao baseados no status atual
  - Modal de rejeicao com campo de motivo

  **Layout**:
  ```
  [Header: Titulo + StatusBadge]
  [Info: ContentType | Origin | Priority | Deadline | Patologia]
  [Descricao em Markdown]
  [Se REJECTED: Banner com motivo da rejeicao]
  [Acoes: Botoes baseados no status]
  [Timeline: Historico de acoes]
  ```

  **Acoes por Status**:
  - DRAFT: "Editar" (link para /requests/[id]/edit), "Submeter", "Cancelar"
  - PENDING: "Iniciar Revisao", "Cancelar"
  - IN_REVIEW: "Aprovar", "Rejeitar"
  - REJECTED: "Corrigir" (link para /requests/[id]/edit), "Cancelar"
  - APPROVED: Nenhuma acao
  - CANCELLED: Nenhuma acao

  **Modal de Rejeicao**:
  - Dialog component
  - Textarea para motivo (min 10 chars)
  - Botoes: "Cancelar", "Confirmar Rejeicao"

  **Timeline Component**:
  - Lista vertical com linha conectora
  - Cada item: Acao | Usuario | Data/Hora
  - Icones por tipo de acao
  - Ordem: mais recente primeiro

  **Must NOT do**:
  - NAO permitir edicao inline (separar em pagina de edicao)
  - NAO mostrar oldValues/newValues detalhados (apenas acao)

  **Parallelizable**: YES (with 7, 9)

  **References**:

  **Pattern References**:
  - `apps/web/src/app/dashboard/layout.tsx:8-29` - Como paginas usam layout
  - `apps/web/src/components/ui/dialog.tsx` (apos task 3) - Para modal

  **Component References**:
  - `apps/web/src/components/status-badge.tsx` (task 5)

  **Documentation References**:
  - Next.js dynamic routes: https://nextjs.org/docs/app/building-your-application/routing/dynamic-routes

  **Acceptance Criteria**:

  **TypeScript Verification:**
  - [ ] `npm run check-types` passa sem erros

  **Visual Verification (Playwright):**
  - [ ] Criar request de teste
  - [ ] Navegar para /requests/[id]
  - [ ] Todas as informacoes aparecem
  - [ ] Botoes de acao corretos para o status
  - [ ] Timeline mostra historico
  - [ ] Clicar em "Rejeitar" abre modal
  - [ ] Modal valida motivo minimo

  **Functional Verification:**
  - [ ] Clicar "Submeter" muda status para PENDING
  - [ ] Clicar "Iniciar Revisao" muda status para IN_REVIEW
  - [ ] Clicar "Aprovar" muda status para APPROVED
  - [ ] Clicar "Rejeitar" com motivo muda status para REJECTED
  - [ ] Toast aparece apos cada acao

  **Commit**: YES
  - Message: `feat(pages): add request details page with timeline and actions`
  - Files: `apps/web/src/app/requests/[id]/page.tsx`
  - Pre-commit: `npm run check-types`

---

- [ ] 9. Criar pagina de Criacao/Edicao de Request

  **What to do**:
  - Criar `apps/web/src/app/requests/new/page.tsx` - Criacao
  - Criar `apps/web/src/app/requests/[id]/edit/page.tsx` - Edicao
  - Usar @tanstack/react-form com Zod validation
  - Implementar auto-save onBlur para drafts
  - Campos: title, description (textarea), contentType (select), origin (select), priority (select), deadline (date input), patologia (select)
  - Botoes: "Salvar Rascunho", "Submeter para Revisao", "Cancelar"

  **Form Fields**:
  - Title: Input text, required, 3-200 chars
  - Description: Textarea, required, 10-5000 chars, suporte Markdown
  - Content Type: Select dropdown, required
  - Origin: Select dropdown, required
  - Priority: Select dropdown, default MEDIUM
  - Deadline: Date input, optional
  - Patologia: Select dropdown, optional

  **Auto-save Logic**:
  - Apenas em modo edicao de DRAFT
  - Trigger: onBlur de qualquer campo
  - Debounce: 1 segundo
  - Indicador visual: "Salvando..." / "Salvo"
  - NAO validar campos obrigatorios no auto-save

  **Validacao ao Submeter**:
  - Todos campos obrigatorios preenchidos
  - Title: 3-200 chars
  - Description: 10-5000 chars
  - Mostrar erros inline

  **Must NOT do**:
  - NAO adicionar preview de Markdown
  - NAO adicionar upload de arquivos

  **Parallelizable**: YES (with 7, 8)

  **References**:

  **Pattern References**:
  - `apps/web/src/components/sign-in-form.tsx:1-133` - Padrao completo de form com @tanstack/react-form
  - `apps/web/src/components/sign-in-form.tsx:17-45` - useForm config com validators
  - `apps/web/src/components/sign-in-form.tsx:64-83` - Pattern de form.Field

  **Component References**:
  - `apps/web/src/components/ui/select.tsx` (task 3)
  - `apps/web/src/components/ui/textarea.tsx` (task 3)

  **Documentation References**:
  - TanStack Form: https://tanstack.com/form/latest/docs/overview
  - Zod validation: https://zod.dev/

  **Acceptance Criteria**:

  **TypeScript Verification:**
  - [ ] `npm run check-types` passa sem erros

  **Visual Verification (Playwright):**
  - [ ] Navegar para /requests/new
  - [ ] Formulario aparece com todos os campos
  - [ ] Selects funcionam com opcoes corretas
  - [ ] Erros de validacao aparecem inline
  
  **Functional Verification:**
  - [ ] Criar request com campos obrigatorios -> sucesso
  - [ ] Criar request sem titulo -> erro de validacao
  - [ ] Auto-save funciona ao sair de campo (modo draft)
  - [ ] "Salvar Rascunho" salva como DRAFT
  - [ ] "Submeter" valida e muda status para PENDING
  - [ ] Toast de sucesso aparece

  **Edicao Verification:**
  - [ ] Navegar para /requests/[id]/edit (onde status e DRAFT ou REJECTED)
  - [ ] Campos preenchidos com valores atuais
  - [ ] Auto-save funciona
  - [ ] Submeter funciona

  **Commit**: YES
  - Message: `feat(pages): add request create and edit pages with auto-save`
  - Files: `apps/web/src/app/requests/new/page.tsx`, `apps/web/src/app/requests/[id]/edit/page.tsx`
  - Pre-commit: `npm run check-types`

---

- [ ] 10. Integrar Sidebar e Polish Final

  **What to do**:
  - Atualizar `apps/web/src/components/sidebar.tsx` com item "Requests"
  - Adicionar icone apropriado (FileText ou ClipboardList do lucide-react)
  - Verificar navegacao entre todas as paginas
  - Ajustar estilos finais para consistencia
  - Testar fluxo completo end-to-end

  **Sidebar Update**:
  ```typescript
  const navigation = [
    { name: "Requests", href: "/dashboard", icon: ClipboardList },
  ] as const;
  ```

  **Polish Items**:
  - Verificar todos os cantos arredondados
  - Verificar cores dos status badges
  - Verificar responsividade basica
  - Verificar mensagens de toast

  **Must NOT do**:
  - NAO adicionar mais itens no sidebar
  - NAO mudar tema/cores globais

  **Parallelizable**: NO (task final)

  **References**:

  **Pattern References**:
  - `apps/web/src/components/sidebar.tsx:1-53` - Sidebar atual com navigation array

  **Acceptance Criteria**:

  **Visual Verification (Playwright):**
  - [ ] Sidebar mostra "Requests" com icone
  - [ ] Clicar em "Requests" navega para /dashboard
  - [ ] Item ativo tem highlight

  **End-to-End Flow:**
  - [ ] Login -> Dashboard (lista vazia)
  - [ ] Clicar "Novo Request" -> Formulario
  - [ ] Preencher e salvar rascunho -> Volta para lista
  - [ ] Abrir request -> Ver detalhes
  - [ ] Submeter -> Status muda para PENDING
  - [ ] Iniciar Revisao -> Status muda para IN_REVIEW
  - [ ] Aprovar -> Status muda para APPROVED
  - [ ] Timeline mostra todas as acoes

  **Alternative Flow (Rejeicao):**
  - [ ] Criar e submeter request
  - [ ] Iniciar revisao
  - [ ] Rejeitar com motivo
  - [ ] Ver motivo na pagina de detalhes
  - [ ] Corrigir e re-submeter
  - [ ] Aprovar

  **Commit**: YES
  - Message: `feat(ui): update sidebar and final polish`
  - Files: `apps/web/src/components/sidebar.tsx`
  - Pre-commit: `npm run check-types`

---

## Commit Strategy

| After Task | Message | Files | Verification |
|------------|---------|-------|--------------|
| 1 | `feat(db): add Request and RequestHistory models with enums` | `packages/db/prisma/schema/request.prisma` | `npm run db:push` |
| 2 | `feat(api): add request router with CRUD and status transitions` | `packages/api/src/routers/request.ts`, `packages/api/src/routers/index.ts` | `npm run check-types` |
| 3 | `feat(ui): add shadcn components and fix card rounded corners` | `apps/web/src/components/ui/*.tsx` | `npm run check-types` |
| 4 | `feat(ui): add RequestCard component` | `apps/web/src/components/request-card.tsx` | `npm run check-types` |
| 5 | `feat(ui): add StatusBadge component with color coding` | `apps/web/src/components/status-badge.tsx` | `npm run check-types` |
| 6 | `feat(ui): add RequestFilters component with debounced search` | `apps/web/src/components/request-filters.tsx` | `npm run check-types` |
| 7 | `feat(pages): replace dashboard home with request list` | `apps/web/src/app/dashboard/page.tsx` | `npm run check-types` |
| 8 | `feat(pages): add request details page with timeline and actions` | `apps/web/src/app/requests/[id]/page.tsx` | `npm run check-types` |
| 9 | `feat(pages): add request create and edit pages with auto-save` | `apps/web/src/app/requests/new/page.tsx`, `apps/web/src/app/requests/[id]/edit/page.tsx` | `npm run check-types` |
| 10 | `feat(ui): update sidebar and final polish` | `apps/web/src/components/sidebar.tsx` | `npm run check-types` |

---

## Success Criteria

### Verification Commands
```bash
# Database
npm run db:push  # Expected: "Your database is now in sync"

# Type checking
npm run check-types  # Expected: No errors

# Development server
npm run dev  # Expected: Server starts on localhost:3001
```

### Final Checklist
- [ ] Todos os 6 content types funcionando
- [ ] Todos os 5 status com transicoes corretas
- [ ] Timeline de historico visivel em cada request
- [ ] Filtros funcionando (status, type, search)
- [ ] Auto-save funcionando em drafts
- [ ] Modal de rejeicao com validacao de motivo
- [ ] Toasts para todas as acoes
- [ ] Design com rounded corners
- [ ] Sidebar atualizada
- [ ] Fluxo completo testado end-to-end
