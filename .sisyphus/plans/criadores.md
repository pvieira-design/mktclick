# Modulo Criadores - Work Plan

## TL;DR

> **Quick Summary**: Criar modulo completo para gerenciar talentos externos (UGC creators, embaixadores, atletas, influenciadores, atores) com vinculo a Requests e detalhes de participacao.
> 
> **Deliverables**:
> - Modelo Prisma `Creator` e `CreatorParticipation`
> - CRUD completo de criadores (router tRPC + paginas)
> - Integracao inline no formulario de Request
> - Nova opcao "Criadores" no sidebar principal
> 
> **Estimated Effort**: Large (2 fases)
> **Parallel Execution**: YES - 2 waves por fase
> **Critical Path**: Schema -> Router -> List Page -> Form Pages -> Request Integration

---

## Context

### Original Request
Criar nova tab "Criadores" no menu para cadastrar UGC creators, embaixadores, atletas, influenciadores e atores que participam de producoes. Cada criador tem um responsavel interno (usuario do sistema) e pode ser vinculado a multiplos Requests com detalhes da participacao (data, local, valor).

### Interview Summary
**Key Discussions**:
- Nome da tab: "Criadores" (visivel para todos no menu principal)
- Tipos: UGC_CREATOR, EMBAIXADOR, ATLETA, INFLUENCIADOR, ATOR_MODELO
- Responsavel: selecionar dentre Users do sistema
- Dados: nome, foto (URL), contato (email, telefone, Instagram), contrato (datas), notas
- Vinculo: multiplos criadores por Request, multiplas participacoes por criador no mesmo Request
- Detalhes participacao: data da diaria, local, valor pago
- Permissoes: todos veem, apenas admin edita
- Foto: campo URL simples
- UI participacao: inline no formulario do Request
- Faseamento: Fase 1 CRUD, Fase 2 integracao Request

**Research Findings**:
- Prisma usa schemas separados por dominio (`packages/db/prisma/schema/`)
- Padrao de routers: `protectedProcedure` para leitura, `adminProcedure` para escrita
- Padrao de paginas: useState filters + useQuery + table + pagination
- Icones: `@untitledui/icons` (usar `Users01` para Criadores)

### Metis Review
**Identified Gaps** (addressed):
- UI complexity: decidido inline no form (mais complexo mas melhor UX)
- Foto upload: decidido URL simples
- Multiplas participacoes mesmo request: sim, permitido
- Faseamento: sim, 2 fases
- Contract status edge cases: defaults aplicados (ver abaixo)

---

## Work Objectives

### Core Objective
Permitir o cadastro e gerenciamento de talentos externos (criadores) e seu vinculo com Requests de producao, incluindo detalhes de cada participacao.

### Concrete Deliverables
- `packages/db/prisma/schema/creator.prisma` - Schema Prisma
- `packages/api/src/routers/creator.ts` - Router tRPC
- `apps/web/src/app/criadores/page.tsx` - Lista de criadores
- `apps/web/src/app/criadores/new/page.tsx` - Formulario novo criador
- `apps/web/src/app/criadores/[id]/edit/page.tsx` - Formulario edicao
- `apps/web/src/components/sidebar.tsx` - Atualizado com link Criadores
- `apps/web/src/app/requests/new/page.tsx` - Secao participacoes (Fase 2)
- `apps/web/src/components/request/creator-participation-section.tsx` - Componente (Fase 2)

### Definition of Done
- [x] `bun prisma db push` executa sem erros
- [x] CRUD de criadores funcional via tRPC
- [x] Sidebar mostra "Criadores" para todos os usuarios
- [x] Lista de criadores com filtros funciona
- [x] Formularios de criar/editar criador funcionam
- [x] (Fase 2) Selecao de criadores no Request funciona
- [x] (Fase 2) Participacoes salvas com detalhes

### Must Have
- CRUD completo de Creator
- Relacao Creator -> User (responsavel)
- Enum CreatorType com 5 tipos
- Campos de contato: email, phone, instagram
- Campos de contrato: startDate, endDate
- Visibilidade para todos, edicao apenas admin
- (Fase 2) CreatorParticipation com date, location, value
- (Fase 2) Multiplas participacoes por creator/request

### Must NOT Have (Guardrails)
- NO relatorios/analytics de gastos
- NO bulk operations (adicionar criador a multiplos requests)
- NO auto-registro de criadores
- NO notificacoes por email
- NO upload de arquivos (apenas URL para foto)
- NO versionamento/historico de mudancas
- NO deteccao de duplicatas
- NO import/export CSV
- NO campos extras nao especificados (website, portfolio, etc)
- NO classes abstratas ou generics - seguir padroes existentes
- NO middleware customizado - usar adminProcedure/protectedProcedure existentes

---

## Verification Strategy (MANDATORY)

### Test Decision
- **Infrastructure exists**: YES (projeto tem bun test configurado)
- **User wants tests**: Manual verification (testes automatizados opcionais)
- **Framework**: bun test (se necessario)

### Automated Verification (Agent-Executable)

Cada TODO inclui criterios de aceitacao executaveis via curl/Playwright.

---

## Execution Strategy

### Phase 1: Creator CRUD (Tasks 1-7)

```
Wave 1 (Start Immediately):
+-- Task 1: Prisma Schema [no dependencies]
+-- Task 2: Update auth.prisma relations [no dependencies]

Wave 2 (After Wave 1):
+-- Task 3: tRPC Router [depends: 1, 2]
+-- Task 4: Sidebar update [no dependencies, can parallel]

Wave 3 (After Task 3):
+-- Task 5: List Page [depends: 3]
+-- Task 6: Create Page [depends: 3]
+-- Task 7: Edit Page [depends: 3]
```

### Phase 2: Request Integration (Tasks 8-11)

```
Wave 4 (After Phase 1 complete):
+-- Task 8: CreatorParticipation schema [depends: Phase 1]
+-- Task 9: Update Request router [depends: 8]

Wave 5 (After Wave 4):
+-- Task 10: Participation component [depends: 9]
+-- Task 11: Integrate in Request forms [depends: 10]
```

### Dependency Matrix

| Task | Depends On | Blocks | Can Parallelize With |
|------|------------|--------|---------------------|
| 1 | None | 3 | 2, 4 |
| 2 | None | 3 | 1, 4 |
| 3 | 1, 2 | 5, 6, 7 | None |
| 4 | None | None | 1, 2 |
| 5 | 3 | None | 6, 7 |
| 6 | 3 | None | 5, 7 |
| 7 | 3 | None | 5, 6 |
| 8 | 7 | 9 | None |
| 9 | 8 | 10 | None |
| 10 | 9 | 11 | None |
| 11 | 10 | None | None |

---

## TODOs

### FASE 1: Creator CRUD

---

- [x] 1. Criar Prisma Schema para Creator

  **What to do**:
  - Criar arquivo `packages/db/prisma/schema/creator.prisma`
  - Definir enum `CreatorType` com valores: UGC_CREATOR, EMBAIXADOR, ATLETA, INFLUENCIADOR, ATOR_MODELO
  - Definir model `Creator` com campos:
    - id: String @id @default(cuid())
    - name: String
    - imageUrl: String? (URL da foto)
    - type: CreatorType
    - responsibleId: String (FK para User)
    - email: String?
    - phone: String?
    - instagram: String?
    - contractStartDate: DateTime?
    - contractEndDate: DateTime?
    - notes: String? @db.Text
    - isActive: Boolean @default(true)
    - createdAt: DateTime @default(now())
    - updatedAt: DateTime @updatedAt
  - Adicionar relacao `responsible User @relation("CreatorResponsible")`
  - Adicionar indexes em responsibleId, type, isActive

  **Must NOT do**:
  - Nao adicionar campos extras (website, portfolio, etc)
  - Nao criar heranca ou classes abstratas

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: `[]`
    - Tarefa simples de criar arquivo Prisma seguindo padrao existente

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with Task 2, 4)
  - **Blocks**: Task 3
  - **Blocked By**: None

  **References**:
  - `packages/db/prisma/schema/area.prisma:9-24` - Padrao de model com campos basicos, isActive, timestamps
  - `packages/db/prisma/schema/auth.prisma:1-5` - Padrao de enum
  - `packages/db/prisma/schema/request.prisma:11-18` - Padrao de enum com multiplos valores

  **Acceptance Criteria**:
  ```bash
  # Arquivo existe e tem sintaxe valida
  cat packages/db/prisma/schema/creator.prisma | grep "enum CreatorType"
  # Assert: Output contem "enum CreatorType"
  
  cat packages/db/prisma/schema/creator.prisma | grep "model Creator"
  # Assert: Output contem "model Creator"
  ```

  **Commit**: YES
  - Message: `feat(db): add Creator schema with type enum`
  - Files: `packages/db/prisma/schema/creator.prisma`

---

- [x] 2. Atualizar auth.prisma com relacao inversa

  **What to do**:
  - Editar `packages/db/prisma/schema/auth.prisma`
  - Adicionar no model User a relacao inversa: `responsibleForCreators Creator[] @relation("CreatorResponsible")`

  **Must NOT do**:
  - Nao modificar outros campos do User
  - Nao adicionar outras relacoes

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: `[]`

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with Task 1, 4)
  - **Blocks**: Task 3
  - **Blocked By**: None

  **References**:
  - `packages/db/prisma/schema/auth.prisma:21-27` - Relacoes existentes do User (accounts, sessions, etc)

  **Acceptance Criteria**:
  ```bash
  grep "responsibleForCreators" packages/db/prisma/schema/auth.prisma
  # Assert: Output contem "responsibleForCreators Creator[]"
  ```

  **Commit**: YES (junto com Task 1)
  - Message: `feat(db): add Creator schema with type enum`
  - Files: `packages/db/prisma/schema/auth.prisma`

---

- [x] 3. Criar tRPC Router para Creator

  **What to do**:
  - Criar `packages/api/src/routers/creator.ts`
  - Implementar endpoints:
    - `list`: protectedProcedure, paginado, filtros por type, responsibleId, isActive, search
    - `getById`: protectedProcedure
    - `create`: adminProcedure, validacao Zod
    - `update`: adminProcedure
    - `delete`: adminProcedure (soft delete - isActive = false)
    - `toggleActive`: adminProcedure
  - Registrar no `packages/api/src/routers/index.ts`

  **Must NOT do**:
  - Nao criar middleware customizado
  - Nao implementar bulk operations

  **Recommended Agent Profile**:
  - **Category**: `unspecified-low`
  - **Skills**: `[]`
    - Seguir padrao existente de routers

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Wave 2 (sequential)
  - **Blocks**: Tasks 5, 6, 7
  - **Blocked By**: Tasks 1, 2

  **References**:
  - `packages/api/src/routers/user.ts:19-59` - Padrao de list com paginacao e filtros
  - `packages/api/src/routers/area.ts` - Padrao de CRUD completo
  - `packages/api/src/index.ts:27-36` - Definicao de adminProcedure vs protectedProcedure
  - `packages/api/src/routers/index.ts` - Registro de routers

  **Acceptance Criteria**:
  ```bash
  # Arquivo existe
  test -f packages/api/src/routers/creator.ts && echo "exists"
  # Assert: Output "exists"
  
  # Router registrado
  grep "creator:" packages/api/src/routers/index.ts
  # Assert: Output contem "creator: creatorRouter" ou similar
  
  # Apos iniciar servidor (manual):
  # curl http://localhost:3001/api/trpc/creator.list (com auth)
  # Assert: Returns JSON com items array
  ```

  **Commit**: YES
  - Message: `feat(api): add creator router with CRUD endpoints`
  - Files: `packages/api/src/routers/creator.ts`, `packages/api/src/routers/index.ts`
  - Pre-commit: `bun run check-types`

---

- [x] 4. Adicionar "Criadores" ao Sidebar

  **What to do**:
  - Editar `apps/web/src/components/sidebar.tsx`
  - Importar icone `Users01` de `@untitledui/icons`
  - Adicionar ao array `navigation` (linha 11-13): `{ name: "Criadores", href: "/criadores", icon: Users01 }`

  **Must NOT do**:
  - Nao condicionar visibilidade por role (todos devem ver)
  - Nao criar secao separada

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: `[]`

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with Tasks 1, 2)
  - **Blocks**: None
  - **Blocked By**: None

  **References**:
  - `apps/web/src/components/sidebar.tsx:11-13` - Array navigation existente
  - `apps/web/src/components/sidebar.tsx:3` - Import de icones

  **Acceptance Criteria**:
  ```bash
  grep "Criadores" apps/web/src/components/sidebar.tsx
  # Assert: Output contem "Criadores"
  
  grep "Users01" apps/web/src/components/sidebar.tsx
  # Assert: Output contem "Users01"
  
  # Playwright (apos servidor rodando):
  # Navigate to /dashboard
  # Assert: element a[href="/criadores"] exists
  # Assert: text "Criadores" visible
  ```

  **Commit**: YES
  - Message: `feat(web): add Criadores link to sidebar navigation`
  - Files: `apps/web/src/components/sidebar.tsx`

---

- [x] 5. Criar pagina de lista de Criadores

  **What to do**:
  - Criar `apps/web/src/app/criadores/page.tsx`
  - Implementar seguindo padrao de `admin/users/page.tsx`:
    - useState para search, typeFilter, page
    - useQuery com trpc.creator.list
    - Tabela com colunas: Nome/Foto, Tipo, Responsavel, Contato, Status Contrato, Acoes
    - Badge de tipo com cores por categoria
    - Filtro por tipo (Select)
    - Busca por nome
    - Botao "Novo Criador" visivel apenas para admin
    - Acoes: editar (admin only), toggle ativo (admin only)
  - Usar componentes Untitled UI: Button, Badge, Input, Select

  **Must NOT do**:
  - Nao mostrar dados sensiveis (dados fiscais nao existem)
  - Nao implementar bulk selection

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
  - **Skills**: `["frontend-ui-ux"]`
    - Pagina com tabela, filtros, e UI consistente

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 3 (with Tasks 6, 7)
  - **Blocks**: None
  - **Blocked By**: Task 3

  **References**:
  - `apps/web/src/app/admin/users/page.tsx` - Padrao completo de lista com filtros
  - `apps/web/src/app/admin/areas/page.tsx:91-129` - Padrao de tabela com acoes
  - `@untitledui/icons` - Icones disponiveis

  **Acceptance Criteria**:
  ```bash
  # Arquivo existe
  test -f apps/web/src/app/criadores/page.tsx && echo "exists"
  # Assert: Output "exists"
  
  # Playwright (apos servidor):
  # Navigate to /criadores
  # Assert: Page loads without error
  # Assert: Table element exists
  # Assert: Search input exists
  # Assert: Type filter select exists
  ```

  **Commit**: YES
  - Message: `feat(web): add creators list page with filters`
  - Files: `apps/web/src/app/criadores/page.tsx`

---

- [x] 6. Criar pagina de novo Criador

  **What to do**:
  - Criar `apps/web/src/app/criadores/new/page.tsx`
  - Implementar formulario com campos:
    - Nome (obrigatorio)
    - Foto URL (opcional)
    - Tipo (Select com enum)
    - Responsavel (Select de Users)
    - Email, Telefone, Instagram (opcionais)
    - Data inicio/fim contrato (opcionais)
    - Notas (TextArea opcional)
  - Validacao client-side
  - Mutation trpc.creator.create
  - Redirect para /criadores apos sucesso
  - Proteger pagina: apenas admin pode acessar

  **Must NOT do**:
  - Nao adicionar campos extras
  - Nao implementar upload de arquivo

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
  - **Skills**: `["frontend-ui-ux"]`

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 3 (with Tasks 5, 7)
  - **Blocks**: None
  - **Blocked By**: Task 3

  **References**:
  - `apps/web/src/app/admin/users/new/page.tsx` - Padrao de formulario de criacao
  - `apps/web/src/app/admin/areas/new/page.tsx` - Padrao alternativo mais simples
  - `apps/web/src/hooks/use-metadata.ts` - Hook para carregar dados (ex: useUsers se necessario)

  **Acceptance Criteria**:
  ```bash
  # Arquivo existe
  test -f apps/web/src/app/criadores/new/page.tsx && echo "exists"
  # Assert: Output "exists"
  
  # Playwright (apos servidor):
  # Navigate to /criadores/new as ADMIN
  # Assert: Form renders
  # Fill name: "Test Creator"
  # Select type: "UGC_CREATOR"
  # Select responsible: first user
  # Click submit
  # Assert: Redirect to /criadores
  # Assert: "Test Creator" appears in list
  ```

  **Commit**: YES
  - Message: `feat(web): add create creator page`
  - Files: `apps/web/src/app/criadores/new/page.tsx`

---

- [x] 7. Criar pagina de edicao de Criador

  **What to do**:
  - Criar `apps/web/src/app/criadores/[id]/edit/page.tsx`
  - Carregar dados existentes com trpc.creator.getById
  - Formulario identico ao de criacao, pre-preenchido
  - Mutation trpc.creator.update
  - Proteger pagina: apenas admin pode acessar

  **Must NOT do**:
  - Nao permitir edicao de campos de auditoria (createdAt, etc)

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
  - **Skills**: `["frontend-ui-ux"]`

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 3 (with Tasks 5, 6)
  - **Blocks**: Task 8 (Fase 2)
  - **Blocked By**: Task 3

  **References**:
  - `apps/web/src/app/admin/users/[id]/edit/page.tsx` - Padrao de edicao
  - `apps/web/src/app/admin/areas/[id]/edit/page.tsx` - Padrao alternativo

  **Acceptance Criteria**:
  ```bash
  # Arquivo existe
  test -f apps/web/src/app/criadores/[id]/edit/page.tsx && echo "exists"
  # Assert: Output "exists"
  
  # Playwright:
  # Navigate to /criadores
  # Click edit on first creator
  # Assert: Form loads with existing data
  # Change name to "Updated Creator"
  # Click save
  # Assert: Redirect to /criadores
  # Assert: "Updated Creator" appears in list
  ```

  **Commit**: YES
  - Message: `feat(web): add edit creator page`
  - Files: `apps/web/src/app/criadores/[id]/edit/page.tsx`
  - Pre-commit: `bun run check-types`

---

### FASE 2: Request Integration

---

- [x] 8. Adicionar CreatorParticipation ao schema

  **What to do**:
  - Editar `packages/db/prisma/schema/creator.prisma`
  - Adicionar model `CreatorParticipation`:
    - id: String @id @default(cuid())
    - creatorId: String
    - requestId: String
    - participationDate: DateTime
    - location: String?
    - valuePaid: Decimal @db.Decimal(10,2)
    - notes: String?
    - createdAt, updatedAt
  - Relacoes: creator -> Creator, request -> Request
  - NAO adicionar unique constraint em [creatorId, requestId] (multiplas participacoes permitidas)
  - Atualizar model Creator com relacao `participations CreatorParticipation[]`
  - Editar `packages/db/prisma/schema/request.prisma` para adicionar relacao `creatorParticipations CreatorParticipation[]`

  **Must NOT do**:
  - Nao criar constraint unico (multiplas participacoes permitidas)
  - Nao adicionar campos extras

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: `[]`

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Wave 4 (sequential)
  - **Blocks**: Task 9
  - **Blocked By**: Task 7 (Fase 1 completa)

  **References**:
  - `packages/db/prisma/schema/area.prisma:26-44` - Padrao de join table com campos extras (AreaMember)
  - `packages/db/prisma/schema/custom-fields.prisma:44-61` - Padrao de RequestFieldValue (join com campos)

  **Acceptance Criteria**:
  ```bash
  grep "model CreatorParticipation" packages/db/prisma/schema/creator.prisma
  # Assert: Output contem "model CreatorParticipation"
  
  grep "valuePaid" packages/db/prisma/schema/creator.prisma
  # Assert: Output contem "valuePaid"
  
  grep "creatorParticipations" packages/db/prisma/schema/request.prisma
  # Assert: Output contem "creatorParticipations"
  
  # Testar schema valido
  cd packages/db && bun prisma validate
  # Assert: Exit code 0
  ```

  **Commit**: YES
  - Message: `feat(db): add CreatorParticipation model for request integration`
  - Files: `packages/db/prisma/schema/creator.prisma`, `packages/db/prisma/schema/request.prisma`

---

- [x] 9. Atualizar Request router para participacoes

  **What to do**:
  - Editar `packages/api/src/routers/request.ts`
  - Modificar `create` para aceitar array opcional `creatorParticipations`:
    ```typescript
    creatorParticipations?: Array<{
      creatorId: string;
      participationDate: Date;
      location?: string;
      valuePaid: number;
      notes?: string;
    }>
    ```
  - Criar participacoes em transacao junto com request
  - Modificar `getById` para incluir `creatorParticipations` com `creator` incluso
  - Modificar `update` para gerenciar participacoes (delete/create pattern ou upsert)
  - Adicionar endpoint `addParticipation` e `removeParticipation` para operacoes individuais

  **Must NOT do**:
  - Nao quebrar endpoints existentes
  - Nao remover campos existentes

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
  - **Skills**: `[]`
    - Modificacao de router existente com logica complexa

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Wave 4 (sequential after Task 8)
  - **Blocks**: Task 10
  - **Blocked By**: Task 8

  **References**:
  - `packages/api/src/routers/request.ts` - Router existente
  - `packages/api/src/routers/contentTypeField.ts` - Padrao de nested creates

  **Acceptance Criteria**:
  ```bash
  # Verificar que endpoint aceita participations
  grep "creatorParticipations" packages/api/src/routers/request.ts
  # Assert: Output mostra creatorParticipations no schema ou handler
  
  # Teste funcional (apos servidor):
  # Create request with participation via API
  # GET request by id
  # Assert: creatorParticipations array exists in response
  ```

  **Commit**: YES
  - Message: `feat(api): add creator participation support to request router`
  - Files: `packages/api/src/routers/request.ts`

---

- [x] 10. Criar componente CreatorParticipationSection

  **What to do**:
  - Criar `apps/web/src/components/request/creator-participation-section.tsx`
  - Implementar componente para adicionar/remover participacoes:
    - Lista de participacoes atuais
    - Botao "Adicionar Criador"
    - Para cada participacao: Select de Creator, DatePicker, Input location, Input valor
    - Botao remover por participacao
  - Props: `participations`, `onChange`, `disabled`
  - Usar componentes Untitled UI

  **Must NOT do**:
  - Nao fazer chamadas API diretamente (apenas onChange para parent)
  - Nao adicionar logica de validacao complexa

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
  - **Skills**: `["frontend-ui-ux"]`
    - Componente de UI complexo com lista dinamica

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Wave 5 (sequential after Task 9)
  - **Blocks**: Task 11
  - **Blocked By**: Task 9

  **References**:
  - `apps/web/src/components/request/dynamic-field-renderer.tsx` - Padrao de componente dinamico
  - `apps/web/src/app/requests/new/page.tsx:249-268` - Como componentes sao usados no form
  - `docs/Untitledui/Untitled UI - Download Links.md` - Componentes disponiveis

  **Acceptance Criteria**:
  ```bash
  # Arquivo existe
  test -f apps/web/src/components/request/creator-participation-section.tsx && echo "exists"
  # Assert: Output "exists"
  
  # Playwright:
  # Import component in test page
  # Assert: Renders without error
  # Click "Add Creator"
  # Assert: New row appears
  ```

  **Commit**: YES
  - Message: `feat(web): add CreatorParticipationSection component`
  - Files: `apps/web/src/components/request/creator-participation-section.tsx`

---

- [x] 11. Integrar participacoes no formulario de Request

  **What to do**:
  - Editar `apps/web/src/app/requests/new/page.tsx`:
    - Adicionar state para participacoes
    - Importar e renderizar CreatorParticipationSection
    - Incluir participacoes no payload de create
  - Editar `apps/web/src/app/requests/[id]/edit/page.tsx`:
    - Carregar participacoes existentes
    - Permitir edicao
    - Incluir no payload de update

  **Must NOT do**:
  - Nao quebrar funcionalidade existente do form
  - Nao tornar participacoes obrigatorias

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
  - **Skills**: `["frontend-ui-ux"]`

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Wave 5 (sequential, final task)
  - **Blocks**: None
  - **Blocked By**: Task 10

  **References**:
  - `apps/web/src/app/requests/new/page.tsx:249-268` - Onde adicionar a nova secao
  - `apps/web/src/app/requests/[id]/edit/page.tsx` - Formulario de edicao

  **Acceptance Criteria**:
  ```bash
  # Playwright - New Request:
  # Navigate to /requests/new
  # Fill basic fields
  # Scroll to Creator Participation section
  # Assert: Section exists
  # Click "Add Creator"
  # Select creator, fill date, value
  # Submit form
  # Assert: Request created
  # View request
  # Assert: Participation appears
  
  # Playwright - Edit Request:
  # Navigate to edit existing request with participation
  # Assert: Existing participations shown
  # Add new participation
  # Save
  # Assert: Both participations appear
  ```

  **Commit**: YES
  - Message: `feat(web): integrate creator participation in request forms`
  - Files: `apps/web/src/app/requests/new/page.tsx`, `apps/web/src/app/requests/[id]/edit/page.tsx`
  - Pre-commit: `bun run check-types && bun run build`

---

## Commit Strategy

| After Task | Message | Files | Verification |
|------------|---------|-------|--------------|
| 1, 2 | `feat(db): add Creator schema with type enum` | creator.prisma, auth.prisma | prisma validate |
| 3 | `feat(api): add creator router with CRUD endpoints` | creator.ts, index.ts | check-types |
| 4 | `feat(web): add Criadores link to sidebar navigation` | sidebar.tsx | - |
| 5 | `feat(web): add creators list page with filters` | criadores/page.tsx | - |
| 6 | `feat(web): add create creator page` | criadores/new/page.tsx | - |
| 7 | `feat(web): add edit creator page` | criadores/[id]/edit/page.tsx | check-types |
| 8 | `feat(db): add CreatorParticipation model` | creator.prisma, request.prisma | prisma validate |
| 9 | `feat(api): add creator participation to request router` | request.ts | check-types |
| 10 | `feat(web): add CreatorParticipationSection component` | creator-participation-section.tsx | - |
| 11 | `feat(web): integrate creator participation in request forms` | requests/new, requests/[id]/edit | build |

---

## Success Criteria

### Verification Commands
```bash
# Schema valido
cd packages/db && bun prisma validate
# Expected: exit 0

# Types ok
bun run check-types
# Expected: exit 0

# Build ok
bun run build
# Expected: exit 0
```

### Final Checklist
- [x] Enum CreatorType com 5 valores
- [x] Model Creator com todos os campos especificados
- [x] Model CreatorParticipation com date, location, valuePaid
- [x] Router creator com list, getById, create, update, delete, toggleActive
- [x] Sidebar mostra "Criadores" para todos
- [x] Lista de criadores com filtros
- [x] Formularios new/edit funcionais
- [x] Participacoes inline no formulario de Request
- [x] Multiplas participacoes do mesmo criador permitidas
- [x] Apenas admin pode editar criadores
- [x] Todos podem visualizar criadores
- [x] NO features fora do escopo implementadas
