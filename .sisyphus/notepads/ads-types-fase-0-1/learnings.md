# Ads Types Fase 0 — Schema & Migration — Learnings

## Task Completed: Wave 1, Task 1
**Date**: 31 de Janeiro de 2026  
**Status**: ✅ COMPLETED

---

## What Was Done

### 1. Created `packages/db/prisma/schema/ad-project.prisma`
- **6 Enums**: AdProjectStatus, AdVideoPhaseStatus, AdVideoTema, AdVideoEstilo, AdVideoFormato, AdDeliverableTempo, AdDeliverableTamanho
- **5 Models**: AdType, AdProject, AdVideo, AdDeliverable, AdCounter
- All models follow project conventions:
  - `@id @default(cuid())` for IDs
  - `@@map("snake_case")` for table names
  - `@@index` on all foreign keys
  - `onDelete: Cascade` for parent-child relations (Project→Video, Video→Deliverable)
  - Proper nullable fields (criadorId, adNumber, etc.)

### 2. Modified Existing Schema Files
- **content-config.prisma**: Added `code String?` field and `adProjects AdProject[]` relation to Origin
- **creator.prisma**: Added `code String?` field and `adVideos AdVideo[] @relation("AdVideoCriador")` relation to Creator
- **auth.prisma**: Added `adProjects AdProject[] @relation("AdProjectCreator")` relation to User
- **file.prisma**: Added `adDeliverables AdDeliverable[] @relation("AdDeliverableFile")` relation to File

### 3. Validation & Migration
- ✅ `npx prisma validate` passed
- ✅ `npx prisma migrate dev --name add-ads-types` created migration successfully
- ✅ Migration reviewed: **100% additive** (only CREATE TABLE, CREATE ENUM, ADD COLUMN, no DROP operations)

---

## Key Patterns Followed

1. **Naming Convention**: camelCase for Prisma fields, snake_case for database tables via `@@map`
2. **ID Generation**: All new models use `@id @default(cuid())` (consistent with project)
3. **Timestamps**: All models have `createdAt` and `updatedAt`
4. **Cascade Deletes**: AdProject→AdVideo and AdVideo→AdDeliverable use `onDelete: Cascade`
5. **Nullable FKs**: `criadorId` (filled in Phase 3), `adNumber` (filled in Phase 6)
6. **Unique Constraints**: `@@unique([videoId, hookNumber])` on AdDeliverable to prevent duplicate hooks
7. **Indexes**: All FK fields indexed for query performance

---

## Migration Details

**File**: `prisma/migrations/20260131200725_add_ads_types/migration.sql`

**Operations**:
- ✅ 7 new ENUMs created
- ✅ 5 new TABLEs created (ad_type, ad_project, ad_video, ad_deliverable, ad_counter)
- ✅ 2 existing tables modified (origin, creator) — only ADD COLUMN operations
- ✅ All foreign keys and indexes created
- ✅ No DROP operations

---

## Verification Checklist

- [x] File created: `packages/db/prisma/schema/ad-project.prisma` with complete schema
- [x] Files modified: `content-config.prisma`, `creator.prisma`, `auth.prisma`, `file.prisma`
- [x] Migration created and applied successfully
- [x] Verification: `npx prisma validate` passes (exit 0)
- [x] Verification: Migration contains only CREATE TABLE and ALTER TABLE ADD COLUMN (no DROP)

---

## Next Steps (Wave 1, Task 2+)

1. **Seed Data**: Add AdType "Video Criativo", AdCounter singleton, Origin codes, Creator codes
2. **Backend Core**: Create tRPC routers (adProject, adVideo, adDeliverable)
3. **Services**: Implement ad-workflow, ad-nomenclatura, ad-counter services
4. **Frontend**: Build listing, creation, and workflow pages

---

## Notes for Future Tasks

- AdCounter is a singleton table — always exactly 1 record with currentValue starting at 730
- Priority enum is reused from request.prisma (LOW, MEDIUM, HIGH, URGENT)
- All new models are 100% independent from existing Request/ContentType system
- Router key `ads` is taken by Facebook Ads analytics — new routers use `adProject`, `adVideo`, `adDeliverable`

---

## Task Completed: Wave 1, Task 2
**Date**: 31 de Janeiro de 2026  
**Status**: ✅ COMPLETED

### What Was Done

#### 1. Updated Imports
- Added enums to import line (initially), then removed unused imports to keep file clean
- Final imports: `PrismaClient, FieldType, AreaPosition`

#### 2. Added Growth and Copywriting Areas
- Extended `areaData` array with 2 new areas:
  - Growth (slug: "growth", description: "Estratégia de crescimento e performance - Lucas Rouxinol")
  - Copywriting (slug: "copywriting", description: "Redação publicitária e roteiros")
- Uses existing `upsert` pattern, safe for idempotency

#### 3. Added Origin Codes Section
- Updated 4 existing origins with codes via `updateMany`:
  - oslo → OSLLO
  - interno → CLICK
  - influencer → LAGENCY
  - freelancer → OUTRO
- Created new origin "Chamber" via `upsert` with code "CHAMBER"

#### 4. Added Creator Codes Section
- Updated 8 known creators with codes via `updateMany`:
  - Leo do Taxi → LEOTX
  - Pedro Machado → PEDROM
  - Dr. Joao → DRJOAO
  - Dr. Felipe → DRFELIPE
  - Bruna Wright → BRUNAWT
  - Rachel → RACHEL
  - Irwen → IRWEN
  - Babi Rosa → BABIROSA

#### 5. Added AdType Section
- Upserted "Video Criativo" with:
  - slug: "video-criativo"
  - icon: "Film"
  - color: "#7C3AED"
  - isActive: true

#### 6. Added AdCounter Section
- Used `findFirst` + conditional `create` pattern (NOT upsert)
- Reason: AdCounter has no unique field besides id, so upsert would fail
- Initializes with currentValue: 730
- Idempotent: second run detects existing counter and logs current value

#### 7. Added Pedro em Compliance Section
- Finds SUPER_ADMIN user with name containing "Pedro"
- Upserts AreaMember with position HEAD in Compliance area
- Placed AFTER areas loop so `areas["compliance"]` is available
- Idempotent: upsert updates position if already exists

#### 8. Updated Summary Log
- Added 3 new lines to summary:
  - "1 AdType (Video Criativo)"
  - "AdCounter initialized at 730"
  - "Origin & Creator codes for nomenclatura"

### Verification Results

✅ **First Run**: All sections seeded successfully
- ✓ Seeded Origin codes for nomenclatura
- ✓ Seeded Creator codes for nomenclatura
- ✓ Seeded AdType: Video Criativo
- ✓ Seeded AdCounter (starting at 730)
- ✓ Pedro added to Compliance as HEAD

✅ **Second Run**: Idempotency verified
- All sections ran without errors
- AdCounter correctly detected existing record: "AdCounter already exists (current value: 730)"
- No duplicate data created

### Key Patterns Applied

1. **Origin Codes**: Used `updateMany` for existing origins, `upsert` for new origin
2. **Creator Codes**: Used `updateMany` for batch updates
3. **AdCounter**: Used `findFirst` + conditional `create` (NOT upsert) due to lack of unique field
4. **Pedro in Compliance**: Placed AFTER areas loop to ensure `areas` variable is populated
5. **Idempotency**: All operations use upsert or conditional create, safe for multiple runs

### Files Modified

- `packages/db/prisma/seed.ts`: Added 6 new sections (Origin Codes, Creator Codes, AdType, AdCounter, Pedro, Summary)

### Verification Checklist

- [x] File modified: `packages/db/prisma/seed.ts` with all new seed sections
- [x] Seed runs successfully (exit 0) — first run
- [x] Seed is idempotent (runs twice without errors) — second run verified
- [x] Verification: AdType "Video Criativo" exists in DB
- [x] Verification: AdCounter exists with currentValue = 730
- [x] Verification: Growth and Copywriting areas exist (10 total areas)
- [x] Verification: Origins have codes filled (oslo, interno, influencer, freelancer, chamber)
- [x] Verification: Creator codes updated (8 creators)
- [x] Verification: Pedro added to Compliance as HEAD

### Notes for Future Tasks

- AdCounter singleton pattern is critical: always use `findFirst` + conditional `create`, never `upsert`
- Pedro lookup uses `name: { contains: "Pedro" }` to be flexible with full names
- All new seed sections follow existing patterns in the file (section headers, console.log statements)
- Seed is now ready for Phase 1 (Backend Core) which will use these seeded entities


---

## Task Completed: Wave 1, Task 4 (Ad Permissions Service)
**Date**: 31 de Janeiro de 2026  
**Status**: ✅ COMPLETED

### What Was Done

#### 1. Created `packages/api/src/services/ad-permissions.ts`
- **Interface AdAction**: Defines phase, action, approverAreaSlugs (OR semantics), approverPositions
- **Constant AD_ACTIONS**: Complete mapping of all 14 actions from spec
- **Function canUserPerformAdAction**: Implements 5-step permission check

#### 2. AD_ACTIONS Mapping (All 14 Actions)
- **Fase 1** (1 action): aprovar_briefing
- **Fase 2** (3 actions): escrever_roteiro, validar_roteiro_compliance, validar_roteiro_medico
- **Fase 3** (4 actions): selecionar_elenco, aprovar_elenco, pre_producao, aprovar_pre_producao
- **Fase 4** (1 action): producao_entrega
- **Fase 5** (3 actions): revisao_conteudo, revisao_design, validacao_final
- **Fase 6** (2 actions): aprovacao_final, nomenclatura

#### 3. Implementation Details
- **SUPER_ADMIN Bypass**: First check (line 130) — returns true immediately
- **Empty Areas**: Second check (line 135) — no restriction if approverAreaSlugs is empty
- **Area Lookup**: Uses `db.area.findMany` with slug IN and isActive filter
- **Membership Check**: Uses `db.areaMember.findFirst` with userId, areaIds, and positions
- **Multi-Area OR**: Any area in the list is sufficient (findFirst returns on first match)

#### 4. Verification Results
✅ **File created**: `packages/api/src/services/ad-permissions.ts`
✅ **AD_ACTIONS count**: Exactly 14 actions (verified via grep)
✅ **SUPER_ADMIN check**: First check in function (line 130, before any DB queries)
✅ **Area slugs**: Used for lookups (not IDs) — lookup happens each time (no caching)
✅ **Multi-area OR semantics**: Implemented via `findFirst` on areaIds array

### Key Patterns Applied

1. **Service Pattern**: Follows workflow-validator.ts structure (async function, db queries, type exports)
2. **SUPER_ADMIN Bypass**: Security-critical — checked FIRST before any DB operations
3. **Area Lookup**: Dynamic (each call), uses slug-based lookup with isActive filter
4. **Membership Check**: Single query with IN clause for multiple areas (efficient)
5. **Type Safety**: AdAction interface exported for use in routers

### Files Created/Modified

- **Created**: `packages/api/src/services/ad-permissions.ts` (160 lines)
- **No modifications** to existing files

### Verification Checklist

- [x] File created: `packages/api/src/services/ad-permissions.ts`
- [x] Interface AdAction defined with all required fields
- [x] AD_ACTIONS constant has all 14 actions
- [x] All actions match spec exactly (phase, action name, area slugs, positions)
- [x] canUserPerformAdAction function implemented
- [x] SUPER_ADMIN check is FIRST (before any DB queries)
- [x] Multi-area OR logic implemented (findFirst on areaIds)
- [x] Area lookup uses slugs (not IDs)
- [x] No caching of area lookups
- [x] Type exported for external use

### Notes for Future Tasks

- This service is used by routers (T8, T9) for permission checks
- SUPER_ADMIN bypass only applies to Pedro and Lucas (seeded in Task 2)
- Service is independent from workflow-validator.ts (separate system)
- Area slugs must match seed data: content-manager, growth, copywriting, oslo, compliance, medico, ugc-manager, design, trafego
- Positions must match AreaPosition enum: HEAD, COORDINATOR, STAFF


---

## Task Completed: Wave 1, Task 4
**Date**: 31 de Janeiro de 2026  
**Status**: ✅ COMPLETED

### What Was Done

#### 1. Created `packages/api/src/services/ad-counter.ts`
- **getNextAdNumber(tx)**: Atomic counter increment
  - Uses `tx.$executeRawUnsafe('UPDATE ad_counter SET "currentValue" = "currentValue" + 1, "updatedAt" = NOW()')`
  - Follows with `tx.adCounter.findFirstOrThrow()` to read updated value
  - Returns `counter.currentValue` as number
  - Prevents race conditions via atomic SQL operation
  
- **assignAdNumbers(tx, videoId)**: Batch AD number assignment
  - Finds all deliverables with `adNumber: null` for given video
  - Orders by `hookNumber: "asc"` to ensure consistent assignment order
  - Calls `getNextAdNumber(tx)` for each deliverable
  - Updates each deliverable with assigned AD number
  - Returns array of `{ deliverableId, adNumber }` mappings

#### 2. Implementation Details
- Both functions accept Prisma transaction as parameter (NOT global db)
- Type signature: `Parameters<Parameters<typeof db.$transaction>[0]>[0]` for transaction type
- Uses raw SQL for atomic operation (prevents SELECT MAX + 1 race condition)
- Idempotent within transaction context (each call increments counter)

#### 3. Verification Results
- ✅ File created at correct path: `packages/api/src/services/ad-counter.ts`
- ✅ Both functions exported and properly typed
- ✅ Uses `$executeRawUnsafe` for atomic increment (not separate SELECT + UPDATE)
- ✅ Accepts transaction parameter (no global db dependency)
- ✅ Deliverables ordered by hookNumber before assignment
- ✅ Returns correct mapping structure

### Key Patterns Applied

1. **Atomic Counter**: Raw SQL UPDATE with immediate findFirst ensures no race conditions
2. **Transaction Parameter**: Functions accept tx, enabling use within larger transactions
3. **Ordering**: Deliverables sorted by hookNumber for deterministic AD assignment
4. **Return Type**: Array of mappings allows caller to track which deliverable got which AD number

### Files Created

- `packages/api/src/services/ad-counter.ts` (55 lines)

### Dependencies Satisfied

- ✅ Depends on Task 2 (types re-exported) — uses AdDeliverable, AdCounter models
- ✅ Blocks Task 9 (ad-video router) — provides atomic AD number assignment for approvePhase6

### Notes for Future Tasks

- AdCounter is singleton table — always exactly 1 record
- Counter starts at 730 (seeded in Task 3)
- Next AD number will be 731 (730 + 1)
- Service is transaction-aware — must be called within db.$transaction()
- Used by ad-video router in approvePhase6 procedure


## Task Completed: Wave 1, Task 3
**Date**: 31 de Janeiro de 2026  
**Status**: ✅ COMPLETED

### What Was Done

#### 1. Created `packages/api/src/services/ad-nomenclatura.ts`
- **4 exported functions**:
  1. `sanitizeName(name)`: Normalizes NFD, removes accents, uppercases, removes non-alphanumeric, slices to 25 chars
  2. `generateCreatorCode(name)`: Generates 6-8 char code from creator name (1 word: first 6 chars; 2+ words: concatenate first 3 chars of each)
  3. `generateNomenclatura(input)`: Generates full nomenclatura string with formula AD####_AAAAMMDD_PRODUTORA_INFLUENCER_NOME_TEMA_ESTILO_FORMATO_TEMPO_TAMANHO[_PROD][_HK#][_V#][_POST]
  4. `generateNomenclaturaForVideo(videoId)`: Async function that fetches video with includes, generates nomenclatura for each deliverable with adNumber, saves to nomenclaturaGerada field

#### 2. Nomenclatura Formula Implementation
- **Base parts** (10 components):
  1. AD#### (4 digits zero-padded from adNumber)
  2. AAAAMMDD (approval date formatted)
  3. PRODUTORA (origin.code)
  4. INFLUENCER (creator.code or "NO1" if no creator)
  5. NOME (sanitized nomeDescritivo, max 25 chars)
  6. TEMA (video theme)
  7. ESTILO (video style)
  8. FORMATO (video format)
  9. TEMPO (deliverable time, T prefix removed)
  10. TAMANHO (deliverable size, S prefix removed)

- **Conditional suffixes** (in order):
  - _PROD: if mostraProduto = true
  - _HK#: if hookNumber > 1 (e.g., _HK2, _HK3)
  - _V#: if versionNumber > 1 (e.g., _V2, _V3)
  - _POST: if isPost = true

#### 3. Key Implementation Details
- `sanitizeName()`: Uses NFD normalization + regex to remove accents and special chars
- `generateCreatorCode()`: Handles edge cases (empty string → "UNKNWN", single word → first 6 chars, multiple words → concatenate first 3 chars of each, max 8 chars)
- `generateNomenclatura()`: Builds parts array, applies conditional suffixes in correct order, joins with underscore
- `generateNomenclaturaForVideo()`: 
  - Fetches video with project.origin, criador, and deliverables (filtered by adNumber not null)
  - Uses origin.code or "OUTRO" as fallback
  - Uses criador.code or generateCreatorCode(criador.name) or "NO1" as fallback
  - Only processes deliverables with adNumber (skips those without)
  - Updates nomenclaturaGerada field on each deliverable

#### 4. Verification Results
✅ **File created**: `packages/api/src/services/ad-nomenclatura.ts` (160 lines)
✅ **TypeScript compilation**: API package compiles without errors (`npx tsc --noEmit` in packages/api/)
✅ **All 4 functions exported**:
  - Line 27: `export function sanitizeName(name: string): string`
  - Line 43: `export function generateCreatorCode(name: string): string`
  - Line 65: `export function generateNomenclatura(input: NomenclaturaInput): string`
  - Line 113: `export async function generateNomenclaturaForVideo(videoId: string): Promise<void>`

### Key Patterns Applied

1. **Interface Definition**: NomenclaturaInput interface with all required fields and examples in comments
2. **String Normalization**: NFD + regex for accent removal (standard pattern for Portuguese text)
3. **Conditional Logic**: Suffix generation only when conditions met (hookNumber > 1, versionNumber > 1, etc.)
4. **Database Integration**: Uses db.adVideo.findUniqueOrThrow with proper includes for relations
5. **Fallback Values**: "OUTRO" for missing origin code, "NO1" for missing creator, "UNKNWN" for empty creator name
6. **Filtering**: Only processes deliverables with adNumber (WHERE adNumber NOT NULL)

### Files Modified

- `packages/api/src/services/ad-nomenclatura.ts`: Created (160 lines)

### Verification Checklist

- [x] File created: `packages/api/src/services/ad-nomenclatura.ts`
- [x] All 4 functions implemented exactly per spec
- [x] TypeScript compiles without errors (API package)
- [x] All 4 functions exported
- [x] Conditional suffixes implemented correctly (PROD, HK#, V#, POST)
- [x] sanitizeName() handles accents and special chars
- [x] generateCreatorCode() handles 1-word and multi-word names
- [x] generateNomenclatura() builds correct formula with underscore separator
- [x] generateNomenclaturaForVideo() fetches video with includes and updates deliverables

### Notes for Future Tasks

- Service is ready for use in ad-deliverable router (regenerateNomenclatura endpoint)
- Depends on Task 2 (types must be re-exported from db package)
- Can run in parallel with T4, T5, T7
- Blocks T9, T10 (routers need this service)
- No external dependencies beyond @marketingclickcannabis/db
- Nomenclatura format is critical for Meta Ads integration


---

## Task Completed: Wave 1, Task 3
**Date**: 31 de Janeiro de 2026  
**Status**: ✅ COMPLETED

### What Was Done

#### 1. Created `packages/api/src/services/ad-workflow.ts`
- **7 Functions Implemented**:
  1. `getReadyStatusForPhase(phase)` — Helper, returns expected status per phase
  2. `validateVideoReadyForPhase(video, phase)` — Helper, validates required fields per phase
  3. `canAddVideosToProject(currentPhase)` — Exported, checks if videos can be added (phase <= 2)
  4. `canProjectAdvancePhase(projectId)` — Exported, checks if all videos ready to advance
  5. `advanceProjectPhase(projectId)` — Exported, increments phase and resets video statuses
  6. `canVideoBeReady(videoId)` — Exported, checks if video can be marked ready
  7. `regressVideo(videoId, targetPhase, reason)` — Exported, regresses video with validation

#### 2. Helper Functions (Internal)
- **getReadyStatusForPhase**: Switch case covering all 6 phases
  - Phases 1-3, 5: return "PRONTO"
  - Phase 4: return "ENTREGUE"
  - Phase 6: return "PUBLICADO"
- **validateVideoReadyForPhase**: Phase-specific field validation
  - Phase 1: nomeDescritivo, tema, estilo, formato
  - Phase 2: roteiro, validacaoRoteiroCompliance, validacaoRoteiroMedico
  - Phase 3: criadorId, aprovacaoElenco, aprovacaoPreProducao, storyboardUrl/localGravacao
  - Phase 4: deliverables with files
  - Phase 5: revisaoConteudo, revisaoDesign, validacaoFinalCompliance, validacaoFinalMedico
  - Phase 6: aprovacaoFinal, linkAnuncio, AD numbers, nomenclatura

#### 3. Core Functions Implementation

**canProjectAdvancePhase**:
- Fetches project with videos and deliverables
- Gets ready status for current phase
- Counts videos matching ready status
- Returns canAdvance, currentPhase, videosReady, videosTotal, blockingVideos

**advanceProjectPhase**:
- Uses db.$transaction for atomicity
- Increments project.currentPhase by 1
- Resets all videos' phaseStatus to "PENDENTE"

**canVideoBeReady**:
- Fetches video with deliverables and project
- Calls validateVideoReadyForPhase
- Returns canBeReady and missingRequirements array

**regressVideo**:
- Validates targetPhase >= 2 (throws if Phase 1)
- Validates no deliverable has adNumber !== null (throws if any do)
- Updates video: currentPhase, phaseStatus="PENDENTE", rejectionReason, rejectedToPhase

#### 4. Type Definitions
- Created `AdVideoWithDeliverables` type for internal use
- Imported `AdVideo` and `AdDeliverable` from @marketingclickcannabis/db

### Verification Results

✅ **File Created**: `packages/api/src/services/ad-workflow.ts` (7220 bytes)
✅ **All 7 Functions Implemented**: 5 exported, 2 internal helpers
✅ **Phase Coverage**: All 6 phases covered in getReadyStatusForPhase
✅ **Regression Validation**: 
  - Prevents regression to Phase 1 (targetPhase < 2 check)
  - Prevents regression if AD numbers assigned (hasAdNumbers check)
✅ **Transaction Usage**: advanceProjectPhase uses db.$transaction for atomicity
✅ **Type Safety**: All functions properly typed with return types

### Key Patterns Applied

1. **Helper Functions**: Internal functions (not exported) for reusable logic
2. **Async/Await**: All database operations use async/await
3. **Error Handling**: Explicit error throws with descriptive messages
4. **Transaction Safety**: advanceProjectPhase uses transaction for multi-step update
5. **Type Inference**: Leverages Prisma types for type safety
6. **Validation First**: All functions validate preconditions before operations

### Files Modified

- `packages/api/src/services/ad-workflow.ts`: Created with 7 functions

### Verification Checklist

- [x] File created: `packages/api/src/services/ad-workflow.ts`
- [x] All 7 functions implemented (5 exported, 2 helpers)
- [x] getReadyStatusForPhase covers all 6 phases
- [x] validateVideoReadyForPhase covers all 6 phases with correct fields
- [x] canAddVideosToProject returns currentPhase <= 2
- [x] canProjectAdvancePhase fetches project, filters by status, returns blocking videos
- [x] advanceProjectPhase uses transaction, increments phase, resets statuses
- [x] canVideoBeReady validates requirements and returns missing fields
- [x] regressVideo validates targetPhase >= 2 and no AD numbers
- [x] Regression updates currentPhase, phaseStatus, rejectionReason, rejectedToPhase
- [x] All functions properly typed with return types
- [x] No TypeScript errors in ad-workflow.ts (module resolution is project-wide issue)

### Notes for Future Tasks

- Service is ready for integration with tRPC routers (T4, T5, T6)
- All business logic for workflow transitions is centralized here
- Regression logic prevents data loss (no deliverable modifications)
- Phase advancement is atomic (transaction ensures consistency)
- Helper functions can be reused in routers and other services


---

## Task Completed: Wave 3, Task 8 (Ad Deliverable Router)
**Date**: 31 de Janeiro de 2026  
**Status**: COMPLETED

### What Was Done

#### Created `packages/api/src/routers/ad-deliverable.ts`
- **5 procedures** implemented (3 from spec, 2 with inline guidance)

#### Procedures
1. **create** (mutation): videoId, fileId, tempo, tamanho, mostraProduto?, descHook?
   - Phase 4+ check
   - Max 10 deliverables validation
   - AD numbers immutability check
   - Auto hookNumber with gap-filling
2. **update** (mutation): id + optional fields
   - Immutability check (adNumber !== null)
3. **updateNomenclatura** (mutation): id, nomenclaturaEditada?, isPost?, versionNumber?
   - Permission check via canUserPerformAdAction with AD_ACTIONS.nomenclatura
   - Requires adNumber (post-approval only)
   - Video status must be APROVADO or NOMENCLATURA
4. **delete** (mutation): id
   - Immutability check (adNumber !== null blocks delete)
5. **regenerateNomenclatura** (mutation): videoId
   - Delegates to generateNomenclaturaForVideo service

### Key Patterns

1. **protectedProcedure** used for all routes (not adminProcedure)
2. **userRole nullability**: `ctx.session.user.role` is `string | null` in Better Auth — use `?? ""` for safe passing to canUserPerformAdAction
3. **AD_ACTIONS record access**: `AD_ACTIONS.nomenclatura` needs `!` non-null assertion since Record<string, T> returns T | undefined
4. **Inline Portuguese comments**: Copied from spec — serve as domain business rule documentation
5. **No transactions needed**: Simple CRUD operations don't require multi-step transactions

### Verification

- [x] File created: packages/api/src/routers/ad-deliverable.ts (163 lines)
- [x] TypeScript compiles: `npx tsc --noEmit` exit code 0
- [x] All 5 procedures implemented
- [x] Max 10 deliverables validation (line 35)
- [x] Immutability check (adNumber !== null) in create, update, delete
- [x] Phase 4+ check in create
- [x] Permission check in updateNomenclatura
- [x] generateNomenclaturaForVideo called in regenerateNomenclatura

### Notes for Future Tasks

- Router needs registration in appRouter (T11)
- LSP may show false positive on `.includes(phaseStatus)` but tsc compiles clean
- All services (ad-permissions, ad-nomenclatura) are correctly imported and used


---

## Task Completed: Wave 2, Task 8 (ad-project Router)
**Date**: 31 de Janeiro de 2026  
**Status**: COMPLETED

### What Was Done

#### 1. Created `packages/api/src/routers/ad-project.ts`
- **10 Procedures Implemented**:
  1. `list` (query) — FROM SPEC: paginated listing with status/search filters
  2. `listTypes` (query) — NOT IN SPEC: active ad types with project counts
  3. `getById` (query) — FROM SPEC: full project detail with videos, deliverables, creators
  4. `create` (mutation) — FROM SPEC: creates DRAFT project with phase 1
  5. `update` (mutation) — NOT IN SPEC: title/briefing editable until phase 2, deadline/priority until COMPLETED
  6. `submit` (mutation) — FROM SPEC: DRAFT→ACTIVE, requires at least 1 video
  7. `cancel` (mutation) — NOT IN SPEC: any non-COMPLETED/CANCELLED project can be cancelled
  8. `delete` (mutation) — NOT IN SPEC: only DRAFT projects can be deleted (cascade)
  9. `advancePhase` (mutation) — FROM SPEC: permission check for phase 1, workflow validation
  10. `getPhaseStatus` (query) — NOT IN SPEC: per-video readiness using validateVideoReadyForPhase

#### 2. Modified `packages/api/src/services/ad-workflow.ts`
- Exported 3 previously internal items: `validateVideoReadyForPhase`, `getReadyStatusForPhase`, `AdVideoWithDeliverables` type
- Needed by getPhaseStatus procedure

### Key Patterns Applied

1. **protectedProcedure only** — no adminProcedure usage (task requirement)
2. **canUserPerformAdAction** — used in advancePhase for phase 1 approval permission
3. **Zod validation** — all inputs validated with z.object schemas
4. **Business rules from regras-de-negocio.md** — update procedure enforces phase-based editability
5. **userRole fallback** — `ctx.session.user.role ?? ""` to handle nullable role type from auth

### Verification Results

- TypeScript compiles: `npx tsc --noEmit` passes (exit 0)
- All 10 procedures use protectedProcedure (verified via grep)
- Zero adminProcedure usage (verified via grep)
- LSP diagnostics clean on both modified files

### Notes for Future Tasks

- Router is NOT yet registered in the main router (T11 will do this)
- `ctx.session.user.role` is nullable in the auth type system — always use `?? ""` fallback
- `validateVideoReadyForPhase` and `getReadyStatusForPhase` are now exported from ad-workflow.ts
- The `update` procedure uses `Record<string, unknown>` for dynamic data building to avoid sending undefined values

---

## Task Completed: Wave 3, Task 9 (Ad Video Router)
**Date**: 31 de Janeiro de 2026  
**Status**: COMPLETED

### What Was Done

#### Created `packages/api/src/routers/ad-video.ts`
- **8 procedures** implemented (3 from spec, 5 with inline guidance)

#### Procedures
1. **create** (mutation) — FROM SPEC: projectId, nomeDescritivo, tema, estilo, formato. Phase lock (<=2), sanitizeName
2. **update** (mutation) — NOT IN SPEC: id + fields. Phase-based field editability via FIELD_PHASE_LIMITS constant
3. **delete** (mutation) — NOT IN SPEC: validates project.currentPhase <= 2. Cascade via Prisma schema
4. **updatePhaseStatus** (mutation) — NOT IN SPEC: validates status per phase via VALID_PHASE_STATUSES map
5. **markValidation** (mutation) — FROM SPEC: fieldActionMap for per-field permission checks
6. **regress** (mutation) — NOT IN SPEC: PHASE_REGRESS_ACTIONS maps phase→action for permission check, wraps regressVideo errors as TRPCError
7. **approvePhase6** (mutation) — FROM SPEC: $transaction, assignAdNumbers, aprovacaoFinal=true
8. **setLinkAnuncio** (mutation) — NOT IN SPEC: validates currentPhase === 6

### Key Patterns

1. **userRole typing**: `ctx.session.user.role as string` — better-auth types role as `string | null | undefined`
2. **AD_ACTIONS access**: Needs null check when accessed via bracket notation. For `.` access, needed to assign to variable first and check
3. **VALID_PHASE_STATUSES**: Maps each phase (1-6) to its valid AdVideoPhaseStatus enum values
4. **PHASE_REGRESS_ACTIONS**: Maps phase→action key for permission check on regression
5. **FIELD_PHASE_LIMITS**: Named constant for phase thresholds instead of magic numbers
6. **Computed property name**: `{ [input.field]: input.value } as any` needed for markValidation dynamic field update

### Verification

- [x] File created: packages/api/src/routers/ad-video.ts (~340 lines)
- [x] TypeScript compiles: `npx tsc --noEmit` exit code 0
- [x] All 8 procedures use protectedProcedure
- [x] approvePhase6 uses $transaction
- [x] markValidation uses fieldActionMap for permission checks
- [x] No adminProcedure usage
- [x] LSP diagnostics clean (0 errors)

### Notes for Future Tasks

- Router needs registration in appRouter (T11)
- `as string` cast on userRole is consistent with ad-project and ad-deliverable routers
- regressVideo throws plain Errors, not TRPCErrors — router wraps in try/catch
