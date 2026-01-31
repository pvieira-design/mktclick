# Ads Types — Fase 0 (Schema + Seed) & Fase 1 (Backend Core)

## TL;DR

> **Quick Summary**: Criar os modelos Prisma, migration, seed e todo o backend (services + tRPC routers) para a feature "Ads Types & Ads Request" — uma feature 100% independente do sistema existente de Requests/ContentTypes.
> 
> **Deliverables**:
> - Novo schema Prisma `ad-project.prisma` com 5 modelos e 7 enums
> - Campos aditivos em Origin e Creator (nullable `code`)
> - Relacoes aditivas em User e File
> - Seed atualizado: AdType, AdCounter, Origin codes, Creator codes, areas Growth/Copywriting
> - 4 services: ad-permissions, ad-counter, ad-nomenclatura, ad-workflow
> - 3 tRPC routers: adProject, adVideo, adDeliverable
> - Re-export de enums/types em packages/db/src/index.ts
> 
> **Estimated Effort**: Medium-Large (2-3 days)
> **Parallel Execution**: YES - 2 waves
> **Critical Path**: Schema (T1) -> Generate + Seed (T2,T3) -> Services (T4-T7) -> Routers (T8-T10) -> Registration (T11)

---

## Context

### Original Request
Implementar a feature "Ads Types & Ads Request" para o sistema de marketing da Click Cannabis. A feature gerencia projetos de anuncios criativos com workflow de 6 fases, multiplos videos por projeto, hooks/variacoes (deliverables) e nomenclatura automatica para Meta Ads.

### Interview Summary
**Key Discussions**:
- Feature 100% separada do sistema de Requests/ContentTypes (zero impacto)
- Hierarquia: AdProject -> AdVideo -> AdDeliverable (hooks)
- 6 fases hibridas: Briefing, Roteiro, Elenco, Producao, Revisao, Publicacao
- Multi-area approval com semantica OR (qualquer area da lista pode aprovar sozinha)
- SUPER_ADMIN bypass (apenas Pedro + Lucas, NAO ADMIN)
- AD Counter atomico iniciando em 730
- Nomenclatura auto-gerada: AD####_AAAAMMDD_PRODUTORA_INFLUENCER_NOME_TEMA_ESTILO_FORMATO_TEMPO_TAMANHO[_PROD][_HK#][_V#][_POST]
- Upload via Cloudflare R2 mas para Fase 1 (backend) apenas aceitar fileId como FK
- Escopo parcial: apenas Fase 0 + Fase 1 (sem frontend)

**Research Findings**:
- Router key `ads` ja esta ocupada (Facebook Ads analytics) -> novos routers usam `adProject`, `adVideo`, `adDeliverable`
- `packages/db/src/index.ts` precisa re-exportar novos enums e types
- Unico service existente: `workflow-validator.ts` (pattern: funcoes exportadas standalone)
- Seed roda via `bun ./prisma/seed.ts` com PrismaPg adapter
- Areas `growth` e `copywriting` existem no banco mas NAO no seed (adicionar)
- Origin `chamber` NAO existe no seed (adicionar)
- Modelo File ja tem relacao `adCreatives AdCreativeMedia[]` (analytics, nao conflita)

### Metis Review
**Identified Gaps** (addressed):
- Router namespace collision: resolvido usando `adProject`, `adVideo`, `adDeliverable` como keys distintas
- Re-export de enums/types: adicionado como task explicita (T2)
- R2 upload nao tem funcionalidade de upload: confirmado que Fase 1 apenas aceita `fileId` como FK. Upload real eh concern de Fase 2 (frontend)
- Seed idempotency: seed usa pattern `upsert` existente + checagem `findFirst` para AdCounter

---

## Work Objectives

### Core Objective
Criar toda a infraestrutura de dados e logica de backend para a feature Ads Types, de forma que o frontend (Fase 2+) possa simplesmente chamar os tRPC procedures para CRUD e workflow.

### Concrete Deliverables
1. `packages/db/prisma/schema/ad-project.prisma` — 7 enums + 5 modelos
2. Campos `code String?` em `content-config.prisma` (Origin) e `creator.prisma` (Creator)
3. Relacoes adicionadas em `auth.prisma` (User) e `file.prisma` (File)
4. Migration SQL aplicada
5. `packages/db/src/index.ts` atualizado com re-exports
6. Seed atualizado com: Growth, Copywriting, Chamber, Origin codes, Creator codes, AdType, AdCounter, Pedro em Compliance
7. `packages/api/src/services/ad-permissions.ts`
8. `packages/api/src/services/ad-counter.ts`
9. `packages/api/src/services/ad-nomenclatura.ts`
10. `packages/api/src/services/ad-workflow.ts`
11. `packages/api/src/routers/ad-project.ts`
12. `packages/api/src/routers/ad-video.ts`
13. `packages/api/src/routers/ad-deliverable.ts`
14. `packages/api/src/routers/index.ts` atualizado com 3 novos routers

### Definition of Done
- [x] `npx prisma validate` passa sem erros
- [x] Migration aplicada com sucesso (so cria, nao deleta)
- [x] Seed roda 2x sem erro (idempotente)
- [x] `npm run check-types` passa
- [x] `npm run build` passa
- [x] `npm run dev` inicia sem crash (build passou, tipos OK)
- [x] Sistema existente (Requests, Ads analytics, etc.) funciona normalmente (nenhum arquivo existente modificado indevidamente)

### Must Have
- Todos 5 modelos Prisma com campos, relacoes, indexes e constraints conforme modelo-de-dados.md
- AD Counter atomico (raw SQL dentro de $transaction)
- Nomenclatura com formula completa incluindo sufixos opcionais
- Multi-area OR com SUPER_ADMIN bypass
- Validacoes de workflow: campos obrigatorios por fase, lock de videos apos Fase 2, imutabilidade apos AD numbers
- Regressao de video com restricoes (nao pode Fase 1, nao pode apos AD numbers)

### Must NOT Have (Guardrails)
- NAO modificar `workflow-validator.ts` nem `canUserApprove()` existente
- NAO modificar router `ads.ts` existente (Facebook Ads analytics)
- NAO modificar nenhuma tabela existente alem de adicionar campos nullable em Origin/Creator e relacoes em User/File
- NAO criar componentes frontend, paginas ou sidebar entries
- NAO criar infraestrutura de testes
- NAO usar `adminProcedure` para routers de ad (permissao eh via service `ad-permissions`)
- NAO usar router key `ads` (ja ocupada)
- NAO implementar upload de arquivos (Fase 1 aceita `fileId` como FK)
- NAO usar `SELECT MAX() + 1` para AD numbers (race condition)
- NAO criar mais de 3 routers (sem router "utils" ou "admin" separado)

---

## Verification Strategy (MANDATORY)

### Test Decision
- **Infrastructure exists**: NAO
- **User wants tests**: NAO (decisao #15 — manual via browser + queries SQL)
- **Framework**: none
- **QA approach**: Automated CLI verification (bash commands, prisma CLI, tsc)

### Automated Verification (Agent-Executable)

Cada TODO inclui comandos verificaveis que o agente pode executar diretamente:

| Type | Verification Tool | Procedure |
|------|------------------|-----------|
| Schema | `npx prisma validate` | Exit code 0 |
| Migration | `npx prisma migrate dev` | Exit code 0, output inclui "applied" |
| Seed | `bun ./prisma/seed.ts` | Exit code 0, run 2x |
| TypeScript | `npx tsc --noEmit` | Exit code 0 no packages/api |
| Build | `npm run build` | Exit code 0 |
| Dev server | `npm run dev` | Starts without crash |

---

## Execution Strategy

### Parallel Execution Waves

```
Wave 1 (Start Immediately):
└── Task 1: Create Prisma schema + modify existing schemas

Wave 2 (After Task 1):
├── Task 2: Update db index.ts re-exports + run prisma generate
└── Task 3: Update seed file

Wave 3 (After Task 2):
├── Task 4: Service ad-permissions
├── Task 5: Service ad-counter
├── Task 6: Service ad-nomenclatura
└── Task 7: Service ad-workflow

Wave 4 (After Wave 3):
├── Task 8: Router ad-project
├── Task 9: Router ad-video
└── Task 10: Router ad-deliverable

Wave 5 (After Wave 4):
└── Task 11: Register routers + final verification

Critical Path: T1 -> T2 -> T4/T5/T6/T7 -> T8/T9/T10 -> T11
```

### Dependency Matrix

| Task | Depends On | Blocks | Can Parallelize With |
|------|------------|--------|---------------------|
| T1 (Schema) | None | T2, T3 | None |
| T2 (DB index + generate) | T1 | T4-T10 | T3 |
| T3 (Seed) | T1 | None (seed can run after migration) | T2 |
| T4 (ad-permissions) | T2 | T8, T9 | T5, T6, T7 |
| T5 (ad-counter) | T2 | T9 | T4, T6, T7 |
| T6 (ad-nomenclatura) | T2 | T9, T10 | T4, T5, T7 |
| T7 (ad-workflow) | T2 | T8, T9 | T4, T5, T6 |
| T8 (router ad-project) | T4, T7 | T11 | T9, T10 |
| T9 (router ad-video) | T4, T5, T6, T7 | T11 | T8, T10 |
| T10 (router ad-deliverable) | T4, T6 | T11 | T8, T9 |
| T11 (registration + verify) | T8, T9, T10 | None | None |

### Agent Dispatch Summary

| Wave | Tasks | Recommended Config |
|------|-------|--------------------|
| 1 | T1 | `category="quick", load_skills=[]` |
| 2 | T2, T3 | Parallel: two `category="quick", load_skills=[]` tasks |
| 3 | T4, T5, T6, T7 | Parallel: four `category="quick", load_skills=[]` tasks |
| 4 | T8, T9, T10 | Parallel: three `category="unspecified-high", load_skills=[]` tasks |
| 5 | T11 | `category="quick", load_skills=["playwright"]` (playwright para verificar dev server no browser) |

---

## TODOs

- [x] 1. Criar schema Prisma e modificar modelos existentes

  **What to do**:
  - Criar `packages/db/prisma/schema/ad-project.prisma` com TODOS os enums e modelos conforme spec
  - 7 enums: `AdProjectStatus`, `AdVideoPhaseStatus`, `AdVideoTema`, `AdVideoEstilo`, `AdVideoFormato`, `AdDeliverableTempo`, `AdDeliverableTamanho` (NOTA: modelo-de-dados.md header diz "6 enums" mas sao 7 — contar na tabela, nao no header)
  - 5 modelos: `AdType`, `AdProject`, `AdVideo`, `AdDeliverable`, `AdCounter`
  - Adicionar `code String?` em Origin (`packages/db/prisma/schema/content-config.prisma`)
  - Adicionar relacao `adProjects AdProject[]` em Origin (`content-config.prisma`)
  - Adicionar `code String?` em Creator (`packages/db/prisma/schema/creator.prisma`)
  - Adicionar relacao `adVideos AdVideo[] @relation("AdVideoCriador")` em Creator (`creator.prisma`)
  - Adicionar relacao `adProjects AdProject[] @relation("AdProjectCreator")` em User (`packages/db/prisma/schema/auth.prisma`)
  - Adicionar relacao `adDeliverables AdDeliverable[] @relation("AdDeliverableFile")` em File (`packages/db/prisma/schema/file.prisma`)
  - Rodar `npx prisma validate` para confirmar schema valido
  - Rodar `npx prisma migrate dev --name add-ads-types` para criar e aplicar migration
  - REVISAR migration gerada: deve APENAS criar tabelas novas + adicionar colunas nullable + criar indexes/FKs. NAO deve dropar/alterar nada existente.

  **Must NOT do**:
  - NAO modificar `ad-creative.prisma` (analytics de Facebook Ads, completamente separado)
  - NAO modificar campos existentes em Origin, Creator, User, File — APENAS ADICIONAR campos/relacoes
  - NAO usar IDs auto-increment (usar `@id @default(cuid())`)
  - NAO esquecer `@@map("snake_case")` em todos os novos modelos
  - NAO esquecer `@@index` em todas as FKs

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: `[]` (schema/migration — nenhuma skill browser necessaria)

  **Parallelization**:
  - **Can Run In Parallel**: NO (primeiro task, tudo depende dele)
  - **Parallel Group**: Wave 1 (solo)
  - **Blocks**: T2, T3, T4-T11
  - **Blocked By**: None

  **References**:

  **Pattern References**:
  - `packages/db/prisma/schema/content-config.prisma` — Pattern de modelo com `@@map`, `@unique`, relacoes. Origin model que recebe campo `code`
  - `packages/db/prisma/schema/creator.prisma` — Pattern de modelo Creator que recebe campo `code` e nova relacao
  - `packages/db/prisma/schema/auth.prisma:7-35` — Pattern de User model com multiplas relacoes usando `@relation("NomeExplicito")`
  - `packages/db/prisma/schema/file.prisma:25-60` — Pattern de File model com relacoes nomeadas e indexes por FK
  - `packages/db/prisma/schema/request.prisma` — Pattern geral de modelo com enum, `Priority` enum reutilizado, `@@index` em FKs
  - `packages/db/prisma/schema/ad-creative.prisma` — NAO MODIFICAR. So ver que existe para evitar conflito de nomes

  **Spec References (FONTE DE VERDADE para schema)**:
  - `docs/fases 2.0/modelo-de-dados.md` — Schema Prisma COMPLETO. Copiar enums, modelos, relacoes, indexes e constraints EXATAMENTE como documentado. Inclui: AdType (linhas 156-173), AdProject (183-211), AdVideo (223-276), AdDeliverable (290-320), AdCounter (336-343), modificacoes em Origin (357-381), Creator (383-418), User (421-434), File (436-449)
  - `docs/fases 2.0/modelo-de-dados.md:524-535` — Mapeamento Fase -> Status validos (referencia para entender os enum values)

  **Acceptance Criteria**:

  ```bash
  # 1. Schema valida
  cd packages/db && npx prisma validate
  # Assert: Exit code 0

  # 2. Migration gerada e aplicada
  npx prisma migrate dev --name add-ads-types
  # Assert: Exit code 0, output contem "Your database is now in sync"

  # 3. Verificar que migration so CRIA (nao deleta)
  # Inspecionar ultimo arquivo em packages/db/prisma/migrations/
  # Assert: Contem CREATE TABLE ad_type, ad_project, ad_video, ad_deliverable, ad_counter
  # Assert: Contem ALTER TABLE origin ADD COLUMN code
  # Assert: Contem ALTER TABLE creator ADD COLUMN code
  # Assert: NAO contem DROP TABLE ou DROP COLUMN
  
  # 4. Prisma generate
  npx prisma generate
  # Assert: Exit code 0
  ```

  **Commit**: YES
  - Message: `feat(db): add ads-types schema with 5 models and 7 enums`
  - Files: `packages/db/prisma/schema/ad-project.prisma`, `packages/db/prisma/schema/content-config.prisma`, `packages/db/prisma/schema/creator.prisma`, `packages/db/prisma/schema/auth.prisma`, `packages/db/prisma/schema/file.prisma`, `packages/db/prisma/migrations/*/`
  - Pre-commit: `npx prisma validate`

---

- [x] 2. Atualizar re-exports em packages/db e rodar prisma generate

  **What to do**:
  - Editar `packages/db/src/index.ts`
  - Adicionar re-export dos 7 novos enums no bloco de enums (linhas 15-25):
    `AdProjectStatus`, `AdVideoPhaseStatus`, `AdVideoTema`, `AdVideoEstilo`, `AdVideoFormato`, `AdDeliverableTempo`, `AdDeliverableTamanho`
  - Adicionar re-export dos 5 novos types no bloco de types (linhas 28-42):
    `AdType`, `AdProject`, `AdVideo`, `AdDeliverable`, `AdCounter`
  - Confirmar que `npx prisma generate` ja foi executado (na Task 1)
  - Rodar `npx tsc --noEmit` em `packages/db` para verificar tipos

  **Must NOT do**:
  - NAO remover nenhum export existente
  - NAO modificar a instancia do PrismaClient
  - NAO modificar `external-db.ts`

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: `[]` (re-exports — nenhuma skill browser necessaria)

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 2 (with T3)
  - **Blocks**: T4, T5, T6, T7, T8, T9, T10
  - **Blocked By**: T1

  **References**:

  **Pattern References**:
  - `packages/db/src/index.ts:14-42` — Pattern EXATO de re-export de enums e types. Novos enums vao no bloco de enums (linha 15-25), novos types vao no bloco de types (linhas 28-42)
  - `packages/db/prisma/generated/enums.ts` — Arquivo GERADO por `prisma generate` (NAO existe no git, so apos rodar `npx prisma generate`). Verificar que novos enums existem nele apos generate

  **Acceptance Criteria**:

  ```bash
  # 1. TypeScript compila packages/db sem erros
  cd packages/db && npx tsc --noEmit
  # Assert: Exit code 0

  # 2. Novos enums sao importaveis
  cd packages/api && node -e "const { AdProjectStatus } = require('@marketingclickcannabis/db'); console.log(AdProjectStatus)"
  # Assert: Output mostra enum values (DRAFT, ACTIVE, COMPLETED, CANCELLED)
  ```

  **Commit**: YES (groups with T3)
  - Message: `feat(db): re-export ads-types enums and types`
  - Files: `packages/db/src/index.ts`

---

- [x] 3. Atualizar seed com dados de Ads Types

  **What to do**:
  - Editar `packages/db/prisma/seed.ts`
  - Adicionar import dos novos enums: `AdVideoTema, AdVideoEstilo, AdVideoFormato` (no import existente na linha 6)
  - Adicionar areas Growth e Copywriting ao array `areaData` (linhas 69-78) usando mesmo pattern
  - Adicionar secao "ORIGIN CODES" apos as areas: atualizar Origin records existentes com campo `code` via `updateMany` (oslo->OSLLO, interno->CLICK, influencer->LAGENCY, freelancer->OUTRO)
  - Criar Origin "Chamber" via `upsert` (slug: "chamber", code: "CHAMBER")
  - Adicionar secao "CREATOR CODES": atualizar Creators conhecidos com `code` via `updateMany` (8 creators com codes pre-definidos)
  - Adicionar secao "AD TYPE": upsert AdType "Video Criativo" (slug: video-criativo, icon: Film, color: #7C3AED)
  - Adicionar secao "AD COUNTER": criar singleton com `findFirst` + conditional `create` (currentValue: 730). NAO usar upsert (sem unique field para where)
  - Adicionar secao "PEDRO EM COMPLIANCE": upsert AreaMember para Pedro (SUPER_ADMIN, name contains "Pedro") em Compliance como HEAD. **IMPORTANTE: esta secao deve ficar APOS o loop de areas (depois da linha ~88 no seed.ts) para garantir que a variavel `areas` ja contem o registro de compliance**
  - Atualizar summary log no final
  - Rodar seed 2 vezes para verificar idempotencia

  **Must NOT do**:
  - NAO modificar entries existentes de ContentTypes, Origins (exceto adicionar code), Areas existentes, Users
  - NAO criar AdCounter com valor diferente de 730
  - NAO usar `prisma.adCounter.upsert` (modelo nao tem campo unique alem de id)
  - NAO hardcodar IDs de usuarios ou areas

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: `[]` (seed — nenhuma skill browser necessaria)

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 2 (with T2)
  - **Blocks**: None (seed eh dado, nao bloqueia codigo)
  - **Blocked By**: T1 (migration deve existir antes do seed)

  **References**:

  **Pattern References**:
  - `packages/db/prisma/seed.ts:69-88` — Pattern EXATO de como adicionar areas (upsert por slug)
  - `packages/db/prisma/seed.ts:50-63` — Pattern de como seed Origins (upsert por slug)
  - `packages/db/prisma/seed.ts:139-157` — Pattern de como criar AreaMember (upsert por userId_areaId composite key)
  - `packages/db/prisma/seed.ts:96-136` — Pattern de como criar Users (upsert por email)

  **Spec References (FONTE DE VERDADE para seed)**:
  - `docs/fases 2.0/fase-0-schema-seed.md:127-293` — Passo 4 completo com TODO o codigo de seed. Seguir EXATAMENTE: secoes 4.1 (imports), 4.2 (areas), 4.3 (origin codes), 4.4 (creator codes), 4.5 (AdType), 4.6 (AdCounter), 4.7 (Pedro em Compliance), 4.8 (summary)
  - `docs/fases 2.0/regras-de-negocio.md:599-641` — Origin codes e Creator codes exatos

  **Acceptance Criteria**:

  ```bash
  # 1. Seed roda sem erro
  cd packages/db && bun ./prisma/seed.ts
  # Assert: Exit code 0, output contem todos os "checkmarks"

  # 2. Seed eh idempotente (rodar 2a vez)
  cd packages/db && bun ./prisma/seed.ts
  # Assert: Exit code 0, sem erros de unique constraint

  # 3. Verificar via prisma studio ou query SQL
  # AdType: 1 registro "Video Criativo"
  # AdCounter: 1 registro com currentValue >= 730
  # Areas: growth e copywriting existem
  # Origins: todos com code preenchido (oslo=OSLLO, etc.)
  ```

  **Commit**: YES (groups with T2)
  - Message: `feat(db): seed ads-types data (AdType, AdCounter, codes, areas)`
  - Files: `packages/db/prisma/seed.ts`

---

- [x] 4. Criar service ad-permissions.ts

  **What to do**:
  - Criar `packages/api/src/services/ad-permissions.ts`
  - Definir interface `AdAction` com: `phase`, `action`, `approverAreaSlugs`, `approverPositions`
  - Definir constante `AD_ACTIONS` com mapeamento completo de todas 14 acoes (conforme spec)
  - Implementar `canUserPerformAdAction(userId, userRole, action)`:
    1. Se `userRole === "SUPER_ADMIN"` -> return true (bypass total)
    2. Se `approverAreaSlugs` vazio -> return true
    3. Buscar areas pelos slugs (db.area.findMany where slug in + isActive)
    4. Buscar AreaMember do usuario em qualquer das areas com posicao correta
    5. Return membership !== null

  **Must NOT do**:
  - NAO importar nada de `workflow-validator.ts` (sistema independente)
  - NAO usar `adminProcedure` ou checar role `ADMIN` — APENAS `SUPER_ADMIN` tem bypass
  - NAO hardcodar area IDs (usar slugs e buscar IDs dinamicamente)
  - NAO cache area IDs (buscar a cada chamada para refletir mudancas)

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: `[]` (service — nenhuma skill browser necessaria)

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 3 (with T5, T6, T7)
  - **Blocks**: T8, T9
  - **Blocked By**: T2

  **References**:

  **Pattern References**:
  - `packages/api/src/services/workflow-validator.ts` — Unico service existente. Seguir pattern: import db, export async functions, sem classes
  - `packages/db/prisma/schema/area.prisma` — Modelo Area e AreaMember com `position` (AreaPosition enum)

  **Spec References (FONTE DE VERDADE)**:
  - `docs/fases 2.0/fase-1-backend-core.md:31-207` — Secao 1 completa: interface AdAction, AD_ACTIONS com todos 14 mappings, implementacao de canUserPerformAdAction. Copiar EXATAMENTE os area slugs e positions de cada acao
  - `docs/fases 2.0/regras-de-negocio.md:270-340` — Secao 3 (Multi-Area Approval) e Secao 4 (SUPER_ADMIN Bypass) com regras detalhadas

  **Acceptance Criteria**:

  ```bash
  # 1. TypeScript compila
  cd packages/api && npx tsc --noEmit
  # Assert: Exit code 0

  # 2. AD_ACTIONS contem todas 14 acoes
  grep -c "phase:" packages/api/src/services/ad-permissions.ts
  # Assert: Output >= 14

  # 3. SUPER_ADMIN bypass eh o PRIMEIRO check
  grep -n "SUPER_ADMIN" packages/api/src/services/ad-permissions.ts
  # Assert: Aparece ANTES de qualquer query ao banco
  ```

  **Commit**: YES (groups with T5, T6, T7)
  - Message: `feat(api): add ad-permissions service with multi-area OR + SUPER_ADMIN bypass`
  - Files: `packages/api/src/services/ad-permissions.ts`

---

- [x] 5. Criar service ad-counter.ts

  **What to do**:
  - Criar `packages/api/src/services/ad-counter.ts`
  - Implementar `getNextAdNumber(tx)` — aceita transacao Prisma como parametro
    - Usa `tx.$executeRawUnsafe('UPDATE ad_counter SET "currentValue" = "currentValue" + 1, "updatedAt" = NOW()')` 
    - Depois `tx.adCounter.findFirstOrThrow()` para ler o valor atualizado
    - Retorna `counter.currentValue`
  - Implementar `assignAdNumbers(tx, videoId)`:
    - Buscar deliverables do video com `adNumber = null`, ordenados por `hookNumber asc`
    - Para cada um, chamar `getNextAdNumber(tx)` e atualizar o deliverable
    - Retornar array de `{ deliverableId, adNumber }`

  **Must NOT do**:
  - NUNCA usar `SELECT MAX(adNumber) + 1` (race condition)
  - NUNCA chamar fora de uma `db.$transaction()` (deve receber `tx` como parametro)
  - NAO fazer update one-by-one sem transacao (todos AD numbers de um video devem ser atomicos)

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: `[]` (service — nenhuma skill browser necessaria)

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 3 (with T4, T6, T7)
  - **Blocks**: T9
  - **Blocked By**: T2

  **References**:

  **Pattern References**:
  - `packages/api/src/services/workflow-validator.ts` — Pattern de service standalone

  **Spec References (FONTE DE VERDADE)**:
  - `docs/fases 2.0/fase-1-backend-core.md:210-275` — Secao 2 completa com implementacao de getNextAdNumber e assignAdNumbers. Copiar logica EXATAMENTE
  - `docs/fases 2.0/regras-de-negocio.md:345-378` — Secao 5 (Regras de AD Counter) com valor inicial, operacao atomica, regras de gaps

  **Acceptance Criteria**:

  ```bash
  # 1. TypeScript compila
  cd packages/api && npx tsc --noEmit
  # Assert: Exit code 0

  # 2. Usa $executeRawUnsafe (nao findFirst+update separados)
  grep -c "executeRawUnsafe\|executeRaw" packages/api/src/services/ad-counter.ts
  # Assert: >= 1

  # 3. Funcao aceita tx como parametro (nao usa db global)
  grep "function getNextAdNumber" packages/api/src/services/ad-counter.ts
  # Assert: Parametro inclui tx
  ```

  **Commit**: YES (groups with T4, T6, T7)
  - Message: `feat(api): add ad-counter service with atomic AD number assignment`
  - Files: `packages/api/src/services/ad-counter.ts`

---

- [x] 6. Criar service ad-nomenclatura.ts

  **What to do**:
  - Criar `packages/api/src/services/ad-nomenclatura.ts`
  - Implementar `sanitizeName(name)`: normalize NFD, remove acentos, uppercase, remove nao-alfanumericos, slice(0,25)
  - Implementar `generateCreatorCode(name)`: normalize, uppercase, split words, concatenar
  - Implementar `generateNomenclatura(input)`: concatenar partes com underscore
    - Formula: AD####_AAAAMMDD_PRODUTORA_INFLUENCER_NOME_TEMA_ESTILO_FORMATO_TEMPO_TAMANHO[_PROD][_HK#][_V#][_POST]
    - AD number: 4 digitos zero-padded
    - Tempo: remover prefixo "T" do enum (T30S -> 30S)
    - Tamanho: remover prefixo "S" do enum (S9X16 -> 9X16)
    - Sufixos opcionais na ordem: PROD (se mostraProduto), HK# (se hookNumber > 1), V# (se versionNumber > 1), POST (se isPost)
  - Implementar `generateNomenclaturaForVideo(videoId)`: buscar video com includes, gerar nomenclatura para cada deliverable com adNumber, salvar em nomenclaturaGerada

  **Must NOT do**:
  - NAO gerar nomenclatura para deliverables sem adNumber (so gera na Fase 6B)
  - NAO incluir HK1 na nomenclatura (HK so aparece para hookNumber > 1)
  - NAO incluir V1 na nomenclatura (V so aparece para versionNumber > 1)
  - NAO incluir PROD se mostraProduto eh false

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: `[]` (service — nenhuma skill browser necessaria)

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 3 (with T4, T5, T7)
  - **Blocks**: T9, T10
  - **Blocked By**: T2

  **References**:

  **Pattern References**:
  - `packages/api/src/services/workflow-validator.ts` — Pattern de service standalone

  **Spec References (FONTE DE VERDADE)**:
  - `docs/fases 2.0/fase-1-backend-core.md:279-447` — Secao 3 completa com implementacao de sanitizeName, generateCreatorCode, generateNomenclatura, generateNomenclaturaForVideo. Copiar EXATAMENTE
  - `docs/fases 2.0/regras-de-negocio.md:382-449` — Secao 6 (Regras de Nomenclatura) com formula, componentes, sufixos, exemplos completos, regras de formatacao

  **Acceptance Criteria**:

  ```bash
  # 1. TypeScript compila
  cd packages/api && npx tsc --noEmit
  # Assert: Exit code 0

  # 2. Funcao generateNomenclatura existe e eh exportada
  grep "export function generateNomenclatura" packages/api/src/services/ad-nomenclatura.ts
  # Assert: Match found

  # 3. sanitizeName existe e eh exportada
  grep "export function sanitizeName" packages/api/src/services/ad-nomenclatura.ts
  # Assert: Match found

  # 4. Sufixos sao condicionais (PROD, HK, V, POST)
  grep -c "PROD\|HK\|POST" packages/api/src/services/ad-nomenclatura.ts
  # Assert: >= 4
  ```

  **Commit**: YES (groups with T4, T5, T7)
  - Message: `feat(api): add ad-nomenclatura service with auto-generation formula`
  - Files: `packages/api/src/services/ad-nomenclatura.ts`

---

- [x] 7. Criar service ad-workflow.ts

  **What to do**:
  - Criar `packages/api/src/services/ad-workflow.ts`
  - Implementar `getReadyStatusForPhase(phase)`: switch case retornando status esperado (1-3,5: "PRONTO", 4: "ENTREGUE", 6: "PUBLICADO"). Codigo COMPLETO disponivel no spec
  - Implementar `validateVideoReadyForPhase(video, phase)`: switch por fase com checagens de campos obrigatorios. Codigo COMPLETO disponivel no spec
  - Implementar `canAddVideosToProject(currentPhase)`: `return currentPhase <= 2`. Codigo COMPLETO disponivel no spec
  - Implementar `canProjectAdvancePhase(projectId)` — **NOTA: spec so define interface, implementar conforme logica abaixo**:
    1. `db.adProject.findUniqueOrThrow({ where: { id: projectId }, include: { videos: true } })`
    2. Chamar `getReadyStatusForPhase(project.currentPhase)` para obter status esperado
    3. Filtrar videos cujo `phaseStatus === readyStatus` → `videosReady`
    4. Filtrar videos cujo `phaseStatus !== readyStatus` → `blockingVideos` (retornar `{ id, nomeDescritivo, phaseStatus }`)
    5. `canAdvance = blockingVideos.length === 0 && videos.length > 0`
    6. Retornar `{ canAdvance, currentPhase: project.currentPhase, videosReady: videosReady.length, videosTotal: videos.length, blockingVideos }`
  - Implementar `advanceProjectPhase(projectId)` — **NOTA: spec so define interface, implementar conforme logica abaixo**:
    1. Dentro de `db.$transaction(async (tx) => { ... })`
    2. `tx.adProject.update({ where: { id: projectId }, data: { currentPhase: { increment: 1 } } })`
    3. `tx.adVideo.updateMany({ where: { projectId }, data: { phaseStatus: "PENDENTE" } })`
  - Implementar `canVideoBeReady(videoId)` — **NOTA: spec so define interface, implementar conforme logica abaixo**:
    1. `db.adVideo.findUniqueOrThrow({ where: { id: videoId }, include: { deliverables: true, project: true } })`
    2. Chamar `validateVideoReadyForPhase(video, video.project.currentPhase)`
    3. Retornar `{ canBeReady: missingRequirements.length === 0, missingRequirements }`
  - Implementar `regressVideo(videoId, targetPhase, reason)` — **NOTA: spec so define interface, implementar conforme logica abaixo**:
    1. `db.adVideo.findUniqueOrThrow({ where: { id: videoId }, include: { deliverables: true } })`
    2. Validar `targetPhase >= 2` (senao throw TRPCError BAD_REQUEST "Cannot regress to Phase 1")
    3. Validar que nenhum deliverable tem `adNumber !== null` (senao throw TRPCError BAD_REQUEST "Cannot regress after AD numbers assigned")
    4. `db.adVideo.update({ where: { id: videoId }, data: { currentPhase: targetPhase, phaseStatus: "PENDENTE", rejectionReason: reason, rejectedToPhase: targetPhase } })`

  **Must NOT do**:
  - NAO permitir regressao para Fase 1 (so >= 2)
  - NAO permitir regressao se video tem deliverables com adNumber (Fase 6A ja passou)
  - NAO regredir o PROJETO inteiro (so videos individuais)
  - NAO alterar deliverables durante regressao (manter para referencia)
  - NAO duplicar logica de `workflow-validator.ts` (sistema independente)

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: `[]` (service — nenhuma skill browser necessaria)

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 3 (with T4, T5, T6)
  - **Blocks**: T8, T9
  - **Blocked By**: T2

  **References**:

  **Pattern References**:
  - `packages/api/src/services/workflow-validator.ts` — Pattern de service standalone. NAO copiar logica, apenas pattern de export

  **Spec References (FONTE DE VERDADE)**:
  - `docs/fases 2.0/fase-1-backend-core.md:452-591` — Secao 4 com IMPLEMENTACAO COMPLETA para 3 helpers (getReadyStatusForPhase linhas 517-527, validateVideoReadyForPhase linhas 532-586, canAddVideosToProject linha 588-590) + APENAS INTERFACES para 4 funcoes (canProjectAdvancePhase, advanceProjectPhase, canVideoBeReady, regressVideo — linhas 460-508). As 4 funcoes com apenas interface devem ser implementadas seguindo a logica descrita em "What to do" acima.
  - `docs/fases 2.0/regras-de-negocio.md:105-267` — Secao 2 (Workflow 6 Fases) com TODOS os status validos por fase, campos obrigatorios, regras de avanco
  - `docs/fases 2.0/regras-de-negocio.md:538-562` — Secao 9 (Regras de Regressao) com restricoes: nao pode Fase 1, nao pode apos AD numbers, motivo obrigatorio, video individual (nao projeto)

  **Acceptance Criteria**:

  ```bash
  # 1. TypeScript compila
  cd packages/api && npx tsc --noEmit
  # Assert: Exit code 0

  # 2. Todas funcoes exportadas
  grep -c "export.*function\|export async function" packages/api/src/services/ad-workflow.ts
  # Assert: >= 5 (canProjectAdvancePhase, advanceProjectPhase, canVideoBeReady, regressVideo, canAddVideosToProject)

  # 3. getReadyStatusForPhase cobre todas 6 fases
  grep -c "case " packages/api/src/services/ad-workflow.ts
  # Assert: >= 12 (6 em getReadyStatus + 6 em validateVideoReady)

  # 4. Restricao de regressao para fase >= 2
  grep "targetPhase.*<.*2\|>= 2\|< 2" packages/api/src/services/ad-workflow.ts
  # Assert: Match found
  ```

  **Commit**: YES (groups with T4, T5, T6)
  - Message: `feat(api): add ad-workflow service with phase validation and video regression`
  - Files: `packages/api/src/services/ad-workflow.ts`

---

- [x] 8. Criar router ad-project.ts

  **What to do**:
  - Criar `packages/api/src/routers/ad-project.ts`
  - Procedures:
    - `list` (query): status?, search?, page, limit. Retorna projetos com paginacao, includes: adType, origin, createdBy, _count.videos
    - `listTypes` (query): **NOTA: NAO esta no spec — eh adição necessaria para frontend poder listar AdTypes na criacao de projetos**. Implementar como: `db.adType.findMany({ where: { isActive: true }, include: { _count: { select: { projects: true } } } })`
    - `getById` (query): id. Retorna projeto completo com videos -> deliverables -> file, criador
    - `create` (mutation): title, adTypeId, originId, briefing, deadline?, priority?. Cria como DRAFT, currentPhase=1
    - `update` (mutation): id + campos editaveis. Valida que projeto esta em DRAFT ou fase <= 2 para titulo/briefing
    - `submit` (mutation): id. Muda DRAFT -> ACTIVE. Valida que tem >= 1 video
    - `cancel` (mutation): id. Muda para CANCELLED. Valida que nao eh COMPLETED
    - `delete` (mutation): id. Deleta (cascade). Valida que eh DRAFT
    - `advancePhase` (mutation): id. Checa permissao via canUserPerformAdAction, checa canProjectAdvancePhase, avanca via advanceProjectPhase
    - `getPhaseStatus` (query): id. Retorna status detalhado da fase com progresso por video

  **Must NOT do**:
  - NAO usar `adminProcedure` — usar `protectedProcedure` com checagem via `ad-permissions` service
  - NAO permitir submit sem videos
  - NAO permitir delete de projeto nao-DRAFT
  - NAO permitir cancel de projeto COMPLETED
  - NAO importar nada do router `ads.ts` existente

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
  - **Skills**: `[]` (router complexo com 10 procedures — nenhuma skill browser necessaria)

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 4 (with T9, T10)
  - **Blocks**: T11
  - **Blocked By**: T4, T7

  **References**:

  **Pattern References**:
  - `packages/api/src/routers/request.ts` — Pattern PRINCIPAL de router tRPC. Seguir: import pattern (linha 1-10), Zod schemas para input, protectedProcedure, TRPCError handling, db queries com includes
  - `packages/api/src/routers/content-type.ts` — Pattern de router mais simples (CRUD basico)
  - `packages/api/src/index.ts` — Definicao de `protectedProcedure` e `router`

  **Spec References (FONTE DE VERDADE)**:
  - `docs/fases 2.0/fase-1-backend-core.md:595-783` — Secao 5 com IMPLEMENTACAO COMPLETA para 5 procedures: list (615-649), getById (654-684), create (689-716), submit (721-738), advancePhase (743-783). Copiar logica e Zod schemas EXATAMENTE. **NOTA: 5 procedures NAO tem implementacao no spec** (listTypes, update, cancel, delete, getPhaseStatus) — implementar com logica simples:
    - `listTypes`: ver "What to do" acima
    - `update`: find project, validar DRAFT ou currentPhase <= 2 para title/briefing, deadline/priority editaveis ate COMPLETED. Usar `z.object({ id, title?, briefing?, deadline?, priority? })` + `db.adProject.update()`
    - `cancel`: find project, validar status !== "COMPLETED", `db.adProject.update({ data: { status: "CANCELLED" } })`
    - `delete`: find project, validar status === "DRAFT", `db.adProject.delete()` (cascade)
    - `getPhaseStatus`: find project com videos, para cada video calcular readiness via `validateVideoReadyForPhase`, retornar `{ currentPhase, videosReady, videosTotal, videos: [...statusPerVideo] }`
  - `docs/fases 2.0/regras-de-negocio.md:489-534` — Secao 8 (Regras de Lock e Imutabilidade) — edicao de campos do projeto

  **Acceptance Criteria**:

  ```bash
  # 1. TypeScript compila
  cd packages/api && npx tsc --noEmit
  # Assert: Exit code 0

  # 2. Router exporta corretamente
  grep "export.*adProjectRouter\|export const adProjectRouter" packages/api/src/routers/ad-project.ts
  # Assert: Match found

  # 3. Todas 10 procedures existem
  grep -c "protectedProcedure" packages/api/src/routers/ad-project.ts
  # Assert: >= 10

  # 4. Usa canUserPerformAdAction (nao adminProcedure)
  grep "canUserPerformAdAction" packages/api/src/routers/ad-project.ts
  # Assert: Match found
  grep "adminProcedure" packages/api/src/routers/ad-project.ts
  # Assert: NO match (exit code 1)
  ```

  **Commit**: YES (groups with T9, T10)
  - Message: `feat(api): add ad-project router with CRUD and workflow procedures`
  - Files: `packages/api/src/routers/ad-project.ts`

---

- [x] 9. Criar router ad-video.ts

  **What to do**:
  - Criar `packages/api/src/routers/ad-video.ts`
  - Procedures:
    - `create` (mutation): projectId, nomeDescritivo, tema, estilo, formato. Valida lock (canAddVideosToProject), sanitiza nomeDescritivo
    - `update` (mutation): id + campos editaveis. Valida fase para cada campo conforme regras de imutabilidade
    - `delete` (mutation): id. Valida que projeto esta em fase <= 2
    - `updatePhaseStatus` (mutation): id, phaseStatus. Valida que status eh valido para a fase atual
    - `markValidation` (mutation): id, field (enum de 9 booleans), value. Checa permissao via canUserPerformAdAction com fieldActionMap
    - `regress` (mutation): id, targetPhase, reason. Checa permissao, chama regressVideo do workflow service
    - `approvePhase6` (mutation): id. Checa permissao aprovacao_final, dentro de $transaction atribui AD numbers via assignAdNumbers, marca aprovacaoFinal=true e phaseStatus=APROVADO
    - `setLinkAnuncio` (mutation): id, linkAnuncio. Valida que video esta em fase 6

  **Must NOT do**:
  - NAO permitir criar video em projeto com fase > 2 (lock)
  - NAO permitir regex invalido no nomeDescritivo (so A-Z0-9, max 25 chars)
  - NAO permitir markValidation sem permissao da area correspondente
  - NAO atribuir AD numbers fora de uma $transaction
  - NAO permitir regress para fase 1 ou apos AD numbers

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
  - **Skills**: `[]` (router complexo com workflow — nenhuma skill browser necessaria)

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 4 (with T8, T10)
  - **Blocks**: T11
  - **Blocked By**: T4, T5, T6, T7

  **References**:

  **Pattern References**:
  - `packages/api/src/routers/request.ts` — Pattern de router tRPC com Zod, protectedProcedure, TRPCError, $transaction
  - `packages/api/src/routers/ad-project.ts` — Router irmao criado em T8 (seguir mesmo pattern de imports e estrutura)

  **Spec References (FONTE DE VERDADE)**:
  - `docs/fases 2.0/fase-1-backend-core.md:787-938` — Secao 6 com IMPLEMENTACAO COMPLETA para 3 procedures: create (807-838), markValidation (843-892), approvePhase6 (897-938). Copiar logica EXATAMENTE. **NOTA: 5 procedures NAO tem implementacao no spec** (update, delete, updatePhaseStatus, regress, setLinkAnuncio) — implementar com logica simples:
    - `update`: find video, validar campos conforme regras-de-negocio.md secao 8.2 (nomeDescritivo/tema/estilo/formato ate Fase 2; roteiro ate Fase 5; criadorId ate Fase 3; storyboard/locacao/dataGravacao ate Fase 4). Input: `z.object({ id, nomeDescritivo?, tema?, estilo?, formato?, roteiro?, criadorId?, storyboardUrl?, localGravacao?, dataGravacao? })`. Buscar video com project para saber currentPhase.
    - `delete`: find video com project, validar `project.currentPhase <= 2`, `db.adVideo.delete()` (cascade deliverables)
    - `updatePhaseStatus`: find video com project, validar que novo status eh valido para fase atual (PENDENTE, EM_ANDAMENTO, PRONTO, ENTREGUE, APROVADO, etc conforme regras-de-negocio.md), `db.adVideo.update({ data: { phaseStatus } })`
    - `regress`: checar permissao via `canUserPerformAdAction`, chamar `regressVideo(videoId, targetPhase, reason)` do workflow service
    - `setLinkAnuncio`: find video, validar `video.currentPhase === 6`, `db.adVideo.update({ data: { linkAnuncio } })`
  - `docs/fases 2.0/regras-de-negocio.md:36-102` — Secao 1.2 (AdVideo) — campos, regras, validacoes
  - `docs/fases 2.0/regras-de-negocio.md:488-526` — Secao 8.2 (Edicao de Campos do Video) — quem pode editar o que ate quando

  **Acceptance Criteria**:

  ```bash
  # 1. TypeScript compila
  cd packages/api && npx tsc --noEmit
  # Assert: Exit code 0

  # 2. Router exporta corretamente
  grep "export.*adVideoRouter\|export const adVideoRouter" packages/api/src/routers/ad-video.ts
  # Assert: Match found

  # 3. approvePhase6 usa $transaction
  grep -A5 "approvePhase6" packages/api/src/routers/ad-video.ts | grep "transaction"
  # Assert: Match found

  # 4. markValidation checa permissao por field
  grep "fieldActionMap\|canUserPerformAdAction" packages/api/src/routers/ad-video.ts
  # Assert: >= 2 matches
  ```

  **Commit**: YES (groups with T8, T10)
  - Message: `feat(api): add ad-video router with workflow, validations and AD number assignment`
  - Files: `packages/api/src/routers/ad-video.ts`

---

- [x] 10. Criar router ad-deliverable.ts

  **What to do**:
  - Criar `packages/api/src/routers/ad-deliverable.ts`
  - Procedures:
    - `create` (mutation): videoId, fileId, tempo, tamanho, mostraProduto?, descHook?. Valida: fase >= 4, max 10 deliverables, sem AD numbers existentes, calcula hookNumber automatico (proximo disponivel, preenchendo gaps)
    - `update` (mutation): id + campos editaveis (fileId, tempo, tamanho, mostraProduto, descHook). Valida: deliverable nao tem adNumber
    - `updateNomenclatura` (mutation): id, nomenclaturaEditada?, isPost?, versionNumber?. Checa permissao "nomenclatura" (Trafego HEAD/COORD), valida que adNumber existe e video esta em status APROVADO ou NOMENCLATURA
    - `delete` (mutation): id. Valida que deliverable nao tem adNumber
    - `regenerateNomenclatura` (mutation): videoId. Chama generateNomenclaturaForVideo do service

  **Must NOT do**:
  - NAO permitir criar deliverable antes da Fase 4
  - NAO permitir mais de 10 deliverables por video
  - NAO permitir editar deliverable com adNumber (imutavel exceto campos de nomenclatura)
  - NAO permitir deletar deliverable com adNumber
  - NAO permitir hookNumber duplicado no mesmo video
  - NAO permitir updateNomenclatura sem permissao de Trafego

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
  - **Skills**: `[]` (router — nenhuma skill browser necessaria)

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 4 (with T8, T9)
  - **Blocks**: T11
  - **Blocked By**: T4, T6 (T4 para ad-permissions/AD_ACTIONS imports usados em updateNomenclatura)

  **References**:

  **Pattern References**:
  - `packages/api/src/routers/request.ts` — Pattern de router tRPC
  - `packages/api/src/routers/ad-project.ts` — Router irmao (T8)

  **Spec References (FONTE DE VERDADE)**:
  - `docs/fases 2.0/fase-1-backend-core.md:942-1085` — Secao 7 com IMPLEMENTACAO COMPLETA para 3 procedures: create (959-1009), update (1014-1042), updateNomenclatura (1047-1085). Copiar logica EXATAMENTE. **NOTA: 2 procedures NAO tem implementacao no spec** (delete, regenerateNomenclatura) — implementar:
    - `delete`: find deliverable, validar `deliverable.adNumber === null` (imutavel apos AD number), `db.adDeliverable.delete()`. Input: `z.object({ id: z.string().cuid() })`
    - `regenerateNomenclatura`: `z.object({ videoId: z.string().cuid() })`, chamar `generateNomenclaturaForVideo(videoId)` do service ad-nomenclatura
  - `docs/fases 2.0/regras-de-negocio.md:452-485` — Secao 7 (Regras de Deliverables) — criacao, edicao, delecao, listagem com todas regras
  - `docs/fases 2.0/regras-de-negocio.md:513-525` — Secao 8.3 (Edicao de Deliverables) — tabela de campos editaveis ate quando

  **Acceptance Criteria**:

  ```bash
  # 1. TypeScript compila
  cd packages/api && npx tsc --noEmit
  # Assert: Exit code 0

  # 2. Router exporta corretamente
  grep "export.*adDeliverableRouter\|export const adDeliverableRouter" packages/api/src/routers/ad-deliverable.ts
  # Assert: Match found

  # 3. Validacao de max 10 deliverables
  grep "10\|deliverables.length" packages/api/src/routers/ad-deliverable.ts
  # Assert: Match found

  # 4. Imutabilidade apos adNumber
  grep "adNumber.*null\|adNumber !== null\|immutable" packages/api/src/routers/ad-deliverable.ts
  # Assert: Match found
  ```

  **Commit**: YES (groups with T8, T9)
  - Message: `feat(api): add ad-deliverable router with hooks CRUD and nomenclatura`
  - Files: `packages/api/src/routers/ad-deliverable.ts`

---

- [x] 11. Registrar routers no appRouter e verificacao final

  **What to do**:
  - Editar `packages/api/src/routers/index.ts`
  - Adicionar imports dos 3 novos routers
  - Registrar com keys: `adProject`, `adVideo`, `adDeliverable` (NAO usar `ads` — ja ocupada)
  - Rodar verificacao completa:
    1. `npm run check-types` — deve passar
    2. `npm run build` — deve passar
    3. `npm run dev` — deve iniciar sem crash
    4. Verificar que rotas existentes (`ads`, `request`, `workflow`, etc.) continuam funcionando
    5. Verificar que novos routers aparecem no tipo AppRouter

  **Must NOT do**:
  - NAO renomear ou mover o router `ads` existente (Facebook Ads analytics)
  - NAO usar key `ads` para nenhum dos novos routers
  - NAO remover nenhum router existente
  - NAO modificar `healthCheck` ou `privateData`

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: [`playwright`] (playwright para verificar dev server no browser apos registro)

  **Parallelization**:
  - **Can Run In Parallel**: NO (task final de integracao)
  - **Parallel Group**: Wave 5 (solo)
  - **Blocks**: None
  - **Blocked By**: T8, T9, T10

  **References**:

  **Pattern References**:
  - `packages/api/src/routers/index.ts:1-45` — Arquivo EXATO a modificar. Seguir pattern de imports (linhas 1-16) e registro (linhas 18-43). Novos imports vao no mesmo estilo. Novos registros vao no bloco do appRouter

  **Spec References**:
  - `docs/fases 2.0/fase-1-backend-core.md:1089-1107` — Secao 8 com exemplo exato de como registrar

  **Acceptance Criteria**:

  ```bash
  # 1. TypeScript compila todo o projeto
  npm run check-types
  # Assert: Exit code 0

  # 2. Build completo passa
  npm run build
  # Assert: Exit code 0

  # 3. Dev server inicia sem crash
  timeout 15 npm run dev 2>&1 | head -20
  # Assert: Output contem "ready" ou "started", sem "Error" ou "crash"

  # 4. Novos routers registrados
  grep "adProject\|adVideo\|adDeliverable" packages/api/src/routers/index.ts
  # Assert: 6 matches (3 imports + 3 registrations)

  # 5. Router ads existente NAO foi tocado
  grep "ads: adsRouter" packages/api/src/routers/index.ts
  # Assert: Match found (inalterado)

  # 6. Nenhum arquivo existente modificado indevidamente
  git diff --name-only | grep -v "ad-project\|ad-video\|ad-deliverable\|ad-permissions\|ad-counter\|ad-nomenclatura\|ad-workflow\|content-config\|creator\|auth\|file\|index\|seed"
  # Assert: NO output (nenhum arquivo inesperado modificado)
  ```

  **Commit**: YES
  - Message: `feat(api): register ad-project, ad-video, ad-deliverable routers in appRouter`
  - Files: `packages/api/src/routers/index.ts`

---

## Commit Strategy

| After Task(s) | Message | Files | Verification |
|------------|---------|-------|--------------|
| T1 | `feat(db): add ads-types schema with 5 models and 7 enums` | ad-project.prisma, content-config.prisma, creator.prisma, auth.prisma, file.prisma, migrations/ | `npx prisma validate` |
| T2+T3 | `feat(db): seed ads-types data and re-export types` | index.ts, seed.ts | `bun ./prisma/seed.ts` (2x) |
| T4+T5+T6+T7 | `feat(api): add ads-types services (permissions, counter, nomenclatura, workflow)` | 4 service files | `npx tsc --noEmit` |
| T8+T9+T10 | `feat(api): add ads-types routers (project, video, deliverable)` | 3 router files | `npx tsc --noEmit` |
| T11 | `feat(api): register ad-project, ad-video, ad-deliverable routers` | index.ts | `npm run build` |

---

## Success Criteria

### Verification Commands
```bash
# 1. Schema valido
cd packages/db && npx prisma validate  # Expected: exit 0

# 2. Seed idempotente
cd packages/db && bun ./prisma/seed.ts && bun ./prisma/seed.ts  # Expected: exit 0 both times

# 3. TypeScript compila
npm run check-types  # Expected: exit 0

# 4. Build passa
npm run build  # Expected: exit 0

# 5. Dev server inicia
npm run dev  # Expected: starts on localhost:3001

# 6. Sistema existente intacto (manual via curl ou browser)
# - Login funciona
# - Requests carregam
# - /ads (analytics) funciona
# - Admin pages funcionam
```

### Final Checklist
- [x] All "Must Have" present (5 modelos, 4 services, 3 routers)
- [x] All "Must NOT Have" absent (nenhum arquivo existente modificado indevidamente)
- [x] Migration eh 100% aditiva para novas tabelas (CREATE TABLE ad_*, ADD COLUMN code)
- [x] SUPER_ADMIN bypass funciona (primeiro check em ad-permissions)
- [x] Multi-area OR funciona (qualquer area da lista pode aprovar)
- [x] AD Counter eh atomico (raw SQL dentro de $transaction)
- [x] Nomenclatura gera formato correto com sufixos condicionais
- [x] Lock de videos funciona (canAddVideosToProject retorna false apos Fase 2)
- [x] Imutabilidade de deliverables funciona (erro se adNumber != null)
- [x] Regressao tem restricoes (nao Fase 1, nao apos AD numbers)
- [x] Router keys sao `adProject`, `adVideo`, `adDeliverable` (nao `ads`)
- [x] Enums e types re-exportados em packages/db/src/index.ts
