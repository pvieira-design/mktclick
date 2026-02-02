# Refactor: Project Creation Flow & Terminology

## TL;DR

> **Quick Summary**: Remove "Tipo de Ad" from the creation form, rename "Vídeos" to "Entregas" throughout the entire UI, remove the "Formato" select (hardcode VID), and add an optional "Incluir pack de fotos" checkbox at the project level with image upload support in Phase 4.
> 
> **Deliverables**:
> - Simplified project creation form (no AdType select, no Formato select)
> - Consistent "entrega" terminology across all 6 workflow phases
> - New `incluiPackFotos` boolean field on AdProject
> - New `AdProjectImage` model for image pack file uploads
> - Image pack upload section in Phase 4
> 
> **Estimated Effort**: Medium
> **Parallel Execution**: YES - 2 waves
> **Critical Path**: Task 1 (DB) → Task 2 (API) → Tasks 3-5 (UI, parallel) → Task 6 (verification)

---

## Context

### Original Request
The user identified that the project creation flow has conceptual issues:
1. "Tipo de Ad" at the project level makes no sense — a project can contain diverse creative types
2. The "Vídeos" section should be called "Entregas" (deliveries)
3. The "Formato" select inside each video card is redundant — every manually added entry is implicitly a video
4. Every shoot also produces a photo pack, which needs to be represented as an optional deliverable
5. "Estilo" makes no sense for images — only for videos

### Interview Summary
**Key Decisions**:
- Remove AdType select from UI (keep in DB with default value)
- Rename "Vídeos" → "Entregas" everywhere in the UI
- Remove "Formato" select; hardcode `VID` on every create call
- Add "Incluir pack de fotos" checkbox at project level (unchecked by default)
- Image pack = just a flag at creation; actual files uploaded in Phase 4
- Multiple packs possible (multiple file uploads over time)
- Pack accompanies project phases (no independent tracking)
- DB table names stay the same (AdVideo, etc.) — only UI terminology changes
- MVP: only Video + Image, no Motion/Carousel

**Research Findings**:
- "Formato" select exists in 3 locations: `new/page.tsx`, `phase-1-briefing.tsx`, `phase-2-roteiro.tsx`, and `ad-video-form.tsx`
- 60+ user-facing Portuguese strings with "video" across 18 files
- FORMATO_LABELS is imported in 5 files, used in 5 render locations
- AdType select in `new/page.tsx` is already disabled with `isDisabled` prop
- Nomenclatura generation uses `video.formato` — safe since we keep VID in DB
- Phase 4 uses Vercel Blob for file uploads (10MB limit) — suitable for images

### Metis Review
**Identified Gaps** (addressed):
- Phase 1 and Phase 2 have their own inline "Add Video" forms (not just `new/page.tsx`) — all 3 locations covered
- Nomenclatura preview has "Formato" label that refers to DB field — excluded from rename
- Non-ad-workflow pages (library, requests) have "vídeo" in different contexts — excluded from scope
- `adTypes?.[0]?.id` could return empty if no AdType in DB — mitigated by keeping seed data
- AdDeliverable has video-specific fields (hookNumber, tempo, tamanho) — new AdProjectImage model created instead

---

## Work Objectives

### Core Objective
Simplify the project creation flow, establish consistent "entrega" terminology, and add image pack support.

### Concrete Deliverables
- Modified Prisma schema with `incluiPackFotos` on AdProject and new `AdProjectImage` model
- Updated tRPC routes for image pack CRUD operations
- Simplified creation form (no AdType select, no Formato select, new checkbox)
- All 18 UI files updated with "entrega" terminology
- Image upload section in Phase 4 component

### Definition of Done
- [ ] `bun run build` succeeds with 0 errors
- [ ] `bun run check-types` passes with 0 type errors
- [ ] No user-facing Portuguese string in ads workflow still says "video" (verified via grep)
- [ ] Project creation form has no "Tipo de Ad" select and no "Formato" select
- [ ] "Incluir pack de fotos" checkbox appears at project level in creation form
- [ ] Phase 4 shows image upload area when `incluiPackFotos=true`

### Must Have
- All user-facing "video" → "entrega" in ads workflow UI
- Formato select removed from all 3 form locations + `ad-video-form.tsx`
- AdType select removed from creation form
- `incluiPackFotos` checkbox on creation form
- Image upload section in Phase 4
- `formato: "VID"` hardcoded in all create calls

### Must NOT Have (Guardrails)
- DO NOT rename TypeScript variable names, interface names, component file names (e.g., `VideoFormData` stays, `ad-video-form.tsx` stays, `AdVideoForm` stays)
- DO NOT rename anything in the API layer (`adVideoRouter`, `trpc.adVideo.*`)
- DO NOT rename anything in the DB layer (`AdVideo`, `ad_video`, `videos` relation)
- DO NOT change terminology in non-ad-workflow pages (library page, requests page, media-link-dialog "vídeos máx 500MB", ad-detail-modal "Views Vídeo")
- DO NOT change the `NomenclaturaPreview` "Formato" PART_LABEL — it refers to the DB field
- DO NOT remove `AdVideoFormato` enum or `formato` column from Prisma schema
- DO NOT remove `FORMATO_LABELS` constant — still used in display components
- DO NOT add i18n/translation infrastructure
- DO NOT refactor duplicated "Add Video" forms into shared component (separate task)
- DO NOT add Motion/Carousel support
- DO NOT add automated tests
- DO NOT modify workflow logic (6 phases stay identical in behavior)
- DO NOT block phase advancement based on image pack status

---

## Verification Strategy (MANDATORY)

### Test Decision
- **Infrastructure exists**: NO
- **User wants tests**: NO
- **Framework**: none
- **QA approach**: Manual verification via browser + grep verification + build check

### Automated Verification (agent-executable)

**Build Verification:**
```bash
bun run build
# Expected: Build succeeds with 0 errors

bun run check-types
# Expected: 0 type errors
```

**Terminology Verification:**
```bash
grep -rn '"[^"]*[Vv]ideo[^"]*"' apps/web/src/components/ads/ apps/web/src/app/ads-requests/ \
  --include="*.tsx" --include="*.ts" \
  | grep -v "import\|interface\|type \|const \|VideoForm\|AdVideo\|adVideo\|video-\|video_\|videoId\|VideoDetail\|VideoRoteiro\|VideoElenco\|VideoPublicacao\|VideoRegression\|VIDEO_PHASE\|FORMATO_LABELS\|PART_LABELS\|aspect-video\|isVideo\|mimeType\|video/\|VideoRecorder\|/video\|video:\|video)" \
  | grep -v "node_modules"
# Expected: 0 results (all user-facing "video" strings replaced)
```

**Schema Verification:**
```bash
grep -n "incluiPackFotos" packages/db/prisma/schema/ad-project.prisma
# Expected: 1 result

grep -n "model AdProjectImage" packages/db/prisma/schema/ad-project.prisma
# Expected: 1 result
```

**Browser Verification via Playwright:**
```
1. Navigate to http://localhost:3003/ads-requests/new
2. Assert: No "Tipo de Ad" select visible
3. Assert: Section heading says "Entregas" not "Videos"
4. Assert: "Incluir pack de fotos" checkbox visible
5. Click "Adicionar Entrega"
6. Assert: No "Formato" select in the card
7. Assert: Card heading says "Entrega #1" not "Video #1"
8. Fill form and submit project
9. Navigate to project detail page
10. Assert: Phase 1 section uses "entregas" not "videos"
```

---

## Execution Strategy

### Parallel Execution Waves

```
Wave 1 (Start Immediately):
├── Task 1: DB Schema Changes (Prisma)
└── (nothing else — schema must be pushed before anything else)

Wave 2 (After Wave 1):
├── Task 2: API Layer Changes (tRPC)
└── (needs schema to be pushed first)

Wave 3 (After Wave 2):
├── Task 3: Terminology Rename (all 18 UI files) — PARALLEL
├── Task 4: Form Simplification (creation + phase forms) — PARALLEL
└── Task 5: Image Pack UI (Phase 4 + creation form) — PARALLEL

Wave 4 (After Wave 3):
└── Task 6: Full Verification & Data Cleanup
```

### Dependency Matrix

| Task | Depends On | Blocks | Can Parallelize With |
|------|------------|--------|---------------------|
| 1 | None | 2, 3, 4, 5 | None (first) |
| 2 | 1 | 5 | None |
| 3 | 1 | 6 | 4, 5 |
| 4 | 1 | 6 | 3, 5 |
| 5 | 1, 2 | 6 | 3, 4 |
| 6 | 3, 4, 5 | None | None (final) |

### Agent Dispatch Summary

| Wave | Tasks | Recommended Agents |
|------|-------|-------------------|
| 1 | 1 | `category="quick"` — simple schema addition |
| 2 | 2 | `category="quick"` — new tRPC endpoints |
| 3 | 3, 4, 5 | Three parallel agents: `category="quick"` each |
| 4 | 6 | `category="quick"` — verification only |

---

## TODOs

- [ ] 1. Prisma Schema Changes

  **What to do**:
  - Add `incluiPackFotos Boolean @default(false)` field to the `AdProject` model in `packages/db/prisma/schema/ad-project.prisma`
  - Create new `AdProjectImage` model in the same file:
    ```
    model AdProjectImage {
      id          String   @id @default(cuid())
      projectId   String
      fileId      String
      uploadedById String
      createdAt   DateTime @default(now())

      project     AdProject @relation(fields: [projectId], references: [id], onDelete: Cascade)
      file        File      @relation("AdProjectImageFile", fields: [fileId], references: [id])
      uploadedBy  User      @relation("AdProjectImageUploader", fields: [uploadedById], references: [id])

      @@index([projectId])
      @@index([fileId])
      @@map("ad_project_image")
    }
    ```
  - Add `images AdProjectImage[]` relation to the `AdProject` model
  - Add `projectImages AdProjectImage[]` relation with name `"AdProjectImageFile"` to the `File` model in `packages/db/prisma/schema/file.prisma`
  - Add `uploadedProjectImages AdProjectImage[]` relation with name `"AdProjectImageUploader"` to the `User` model in the appropriate schema file
  - Run `npx prisma db push` to apply changes
  - Clean up ads-request test data: delete all records from `ad_deliverable`, `ad_video`, `ad_project` tables (preserve users, creators, files, etc.)

  **Must NOT do**:
  - DO NOT rename any existing tables or columns
  - DO NOT remove any enum values
  - DO NOT modify any existing field types or constraints

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Straightforward schema addition, no complex logic
  - **Skills**: [`git-master`]
    - `git-master`: For committing schema changes

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Wave 1 (solo)
  - **Blocks**: Tasks 2, 3, 4, 5
  - **Blocked By**: None

  **References**:

  **Pattern References**:
  - `packages/db/prisma/schema/ad-project.prisma:194-223` — Existing `AdDeliverable` model pattern (similar junction table with File relation)
  - `packages/db/prisma/schema/ad-project.prisma:111-138` — `AdProject` model where `incluiPackFotos` field will be added

  **API/Type References**:
  - `packages/db/prisma/schema/file.prisma` — File model where new relation `projectImages` needs to be added
  - `packages/db/prisma/schema/` — User model file (find with `grep "model User"`) where `uploadedProjectImages` relation needs to be added

  **Acceptance Criteria**:

  ```bash
  npx prisma db push
  # Expected: Schema changes applied successfully

  grep -n "incluiPackFotos" packages/db/prisma/schema/ad-project.prisma
  # Expected: 1 result showing the new field

  grep -n "model AdProjectImage" packages/db/prisma/schema/ad-project.prisma
  # Expected: 1 result showing the new model
  ```

  **Commit**: YES
  - Message: `feat(db): add incluiPackFotos field and AdProjectImage model`
  - Files: `packages/db/prisma/schema/ad-project.prisma`, `packages/db/prisma/schema/file.prisma`, user schema file
  - Pre-commit: `npx prisma db push`

---

- [ ] 2. API Layer: Image Pack tRPC Endpoints

  **What to do**:
  - Add new endpoints to `packages/api/src/routers/ad-project.ts`:
    - `uploadPackImage` mutation: accepts `{ projectId: string, fileId: string }`, creates `AdProjectImage` record. Validates that `incluiPackFotos` is true on the project.
    - `deletePackImage` mutation: accepts `{ id: string }`, deletes `AdProjectImage` record.
    - `listPackImages` query: accepts `{ projectId: string }`, returns all `AdProjectImage` records with `file` relation included (id, name, url, mimeType, size, thumbnailUrl).
  - Modify the `create` mutation to accept optional `incluiPackFotos` boolean in input schema (default false)
  - Modify the `getById` query to include `images` relation in the response (only the AdProjectImage records with their file data)

  **Must NOT do**:
  - DO NOT modify existing `adVideo` or `adDeliverable` routers
  - DO NOT add phase tracking logic for image packs
  - DO NOT add file upload logic (file upload is handled by existing `upload.upload` tRPC mutation; this endpoint just creates the link record)

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Small tRPC endpoint additions following existing patterns
  - **Skills**: [`git-master`]
    - `git-master`: For committing API changes

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Wave 2 (after Task 1)
  - **Blocks**: Task 5
  - **Blocked By**: Task 1

  **References**:

  **Pattern References**:
  - `packages/api/src/routers/ad-project.ts:113-141` — Existing `create` mutation pattern (input schema + mutation logic)
  - `packages/api/src/routers/ad-project.ts:63-111` — Existing `getById` query with nested includes
  - `packages/api/src/routers/ad-deliverable.ts` — Similar CRUD pattern for deliverables (create, delete, list)

  **API/Type References**:
  - `packages/api/src/routers/ad-project.ts:16` — Router definition where new endpoints are added
  - `packages/api/src/index.ts` — Router exports (if new router needed, but we're adding to existing)

  **Acceptance Criteria**:

  ```bash
  bun run check-types
  # Expected: 0 type errors

  grep -n "uploadPackImage\|deletePackImage\|listPackImages" packages/api/src/routers/ad-project.ts
  # Expected: 3 results (one per endpoint)

  grep -n "incluiPackFotos" packages/api/src/routers/ad-project.ts
  # Expected: at least 2 results (create input + getById include)
  ```

  **Commit**: YES
  - Message: `feat(api): add image pack endpoints and incluiPackFotos to create mutation`
  - Files: `packages/api/src/routers/ad-project.ts`
  - Pre-commit: `bun run check-types`

---

- [ ] 3. Terminology Rename: "video" → "entrega" in All UI Files

  **What to do**:
  - Replace ALL user-facing Portuguese strings containing "video"/"vídeo" with "entrega" equivalents in the ads workflow UI. The complete inventory of changes:

  **`apps/web/src/components/ads/ad-constants.ts`**:
  - Line 182: `"Definicao do projeto e videos"` → `"Definicao do projeto e entregas"`

  **`apps/web/src/components/ads/ad-video-form.tsx`**:
  - Line 44: `Video #{index + 1}` → `Entrega #{index + 1}`
  - Line 78: `aria-label="Tema do video"` → `aria-label="Tema da entrega"`
  - Line 90: `aria-label="Estilo do video"` → `aria-label="Estilo da entrega"`
  - Line 102: `aria-label="Formato do video"` → REMOVE THIS LINE (Formato select removed in Task 4)

  **`apps/web/src/components/ads/ad-project-card.tsx`**:
  - Line 78: `{project._count.videos} {project._count.videos === 1 ? "video" : "videos"}` → `{project._count.videos} {project._count.videos === 1 ? "entrega" : "entregas"}`

  **`apps/web/src/components/ads/video/video-regression-dialog.tsx`**:
  - Line 31: `"Video enviado de volta"` → `"Entrega enviada de volta"`
  - Line 36: `"Erro ao regredir video"` → `"Erro ao regredir entrega"`
  - Line 51: `Enviar Video de Volta` → `Enviar Entrega de Volta`
  - Line 54: `Video: {video.nomeDescritivo}` → `Entrega: {video.nomeDescritivo}`
  - Lines 99-100: `O video voltara...este video voltar` → `A entrega voltara...esta entrega voltar`

  **`apps/web/src/components/ads/workflow/phase-1-briefing.tsx`**:
  - Line 143: `Videos no Projeto ({project.videos.length})` → `Entregas no Projeto ({project.videos.length})`
  - Line 152: `Adicionar Video` → `Adicionar Entrega`
  - Line 159: `Novo Video` → `Nova Entrega`
  - Line 176: `aria-label="Tema do video"` → `aria-label="Tema da entrega"`
  - Line 187: `aria-label="Estilo do video"` → `aria-label="Estilo da entrega"`
  - Line 198: `aria-label="Formato do video"` → REMOVE (Formato select removed in Task 4)
  - Line 223: `"Salvar Video"` → `"Salvar Entrega"`
  - Line 241: `Nenhum video adicionado` → `Nenhuma entrega adicionada`

  **`apps/web/src/components/ads/workflow/phase-2-roteiro.tsx`**:
  - Line 103: `videos prontos` → `entregas prontas`
  - Line 113: `Adicionar Video` → `Adicionar Entrega`
  - Line 120: `Novo Video` → `Nova Entrega`
  - Line 137: `aria-label="Tema do video"` → `aria-label="Tema da entrega"`
  - Line 148: `aria-label="Estilo do video"` → `aria-label="Estilo da entrega"`
  - Line 159: `aria-label="Formato do video"` → REMOVE (Formato select removed in Task 4)
  - Line 184: `"Salvar Video"` → `"Salvar Entrega"`

  **`apps/web/src/components/ads/workflow/phase-3-elenco.tsx`**:
  - Line 32: `"Video atualizado"` → `"Entrega atualizada"`
  - Line 80: `videos prontos` → `entregas prontas`
  - Line 87: `Lista de videos travada — nao eh possivel adicionar novos videos` → `Lista de entregas travada — nao eh possivel adicionar novas entregas`

  **`apps/web/src/components/ads/workflow/phase-4-producao.tsx`**:
  - Line 51: `videos entregues` → `entregas concluidas`

  **`apps/web/src/components/ads/workflow/phase-5-revisao.tsx`**:
  - Line 66: `videos prontos` → `entregas prontas`

  **`apps/web/src/components/ads/workflow/phase-6-publicacao.tsx`**:
  - Line 29: `"Video aprovado! AD numbers atribuidos"` → `"Entrega aprovada! AD numbers atribuidos"`
  - Line 49: `"Video marcado como publicado!"` → `"Entrega marcada como publicada!"`
  - Line 77: `videos publicados` → `entregas publicadas`

  **`apps/web/src/app/ads-requests/new/page.tsx`**:
  - Line 74: `"Adicione pelo menos 1 video para submeter"` → `"Adicione pelo menos 1 entrega para submeter"`
  - Line 207: `Videos` (h2 heading) → `Entregas`
  - Line 208: `Adicione os videos do projeto` → `Adicione as entregas do projeto`
  - Line 211: `Adicionar Video` → `Adicionar Entrega`
  - Line 217: `Nenhum video adicionado` → `Nenhuma entrega adicionada`
  - Line 219: `Adicionar Video` (in instruction text) → `Adicionar Entrega`

  **`apps/web/src/app/ads-requests/[id]/page.tsx`**:
  - Line 238: `Videos ({project.videos.length})` → `Entregas ({project.videos.length})`
  - Line 242: `Nenhum video neste projeto` → `Nenhuma entrega neste projeto`

  **DO NOT CHANGE** (these refer to file types/MIME types/code, not ad deliverables):
  - `ad-detail-modal.tsx` line 261: `"Views Vídeo"` — refers to video view metrics
  - `media-link-dialog.tsx` line 397: `"vídeos"` — refers to video file upload limit
  - `ad-card.tsx`: `isVideo`, `video/` MIME type checks
  - `ad-constants.ts` line 36: `VID: "Video"` in FORMATO_LABELS — refers to the DB format type
  - Any `NomenclaturaPreview` "Formato" labels
  - Any TypeScript variable names, interface names, imports

  **Must NOT do**:
  - DO NOT rename TypeScript identifiers (variable names, function names, component names, file names)
  - DO NOT change non-ad-workflow pages
  - DO NOT change FORMATO_LABELS constant values

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
    - Reason: High volume of precise string replacements across many files, needs attention to detail
  - **Skills**: [`frontend-ui-ux`]
    - `frontend-ui-ux`: Understanding JSX context to correctly identify user-facing vs code strings

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 3 (with Tasks 4, 5)
  - **Blocks**: Task 6
  - **Blocked By**: Task 1 (schema must be pushed for type safety)

  **References**:

  **Pattern References**:
  - `apps/web/src/components/ads/ad-constants.ts:182` — PHASE_DETAILS with "videos" description
  - `apps/web/src/components/ads/ad-project-card.tsx:78` — Singular/plural pattern for count display

  **Acceptance Criteria**:

  ```bash
  grep -rn '"[^"]*[Vv]ideo[^"]*"' apps/web/src/components/ads/ apps/web/src/app/ads-requests/ \
    --include="*.tsx" --include="*.ts" \
    | grep -vi "import\|interface\|type \|const \|VideoForm\|AdVideo\|adVideo\|videoId\|VideoDetail\|VideoRoteiro\|VideoElenco\|VideoPublicacao\|VideoRegression\|VIDEO_PHASE\|FORMATO_LABELS\|PART_LABELS\|aspect-video\|isVideo\|mimeType\|video/\|VideoRecorder\|video:\|video)" \
    | grep -v "Views V"
  # Expected: 0 results

  bun run check-types
  # Expected: 0 type errors
  ```

  **Commit**: YES
  - Message: `refactor(ui): rename "video" to "entrega" across ads workflow`
  - Files: All 12 files listed above
  - Pre-commit: `bun run check-types`

---

- [ ] 4. Form Simplification: Remove Formato Select + Hide AdType

  **What to do**:

  **A. Remove Formato Select from `ad-video-form.tsx` (lines 100-110)**:
  - Delete the entire `<Select label="Formato" ...>` block
  - Remove `FORMATO_LABELS` from the import on line 7 (keep `TEMA_LABELS`, `ESTILO_LABELS`)
  - Change the grid from `grid-cols-3` to `grid-cols-2` on line 75
  - In the `VideoFormData` interface (line 9-14), keep `formato` field but make it optional: `formato?: string`
  - In the `handleSelectChange` function, keep it — still used for tema and estilo

  **B. Remove Formato Select from `phase-1-briefing.tsx` (lines ~197-203)**:
  - Delete the `<Select label="Formato" ...>` block
  - Remove `FORMATO_LABELS` from the import (keep `TEMA_LABELS`, `ESTILO_LABELS`)
  - Change the grid from `grid-cols-3` to `grid-cols-2`
  - In the `newVideo` state initialization, remove `formato: ""`
  - In the `createVideo.mutateAsync` call, hardcode `formato: "VID" as const`

  **C. Remove Formato Select from `phase-2-roteiro.tsx` (lines ~158-164)**:
  - Same changes as phase-1: delete Select block, remove FORMATO_LABELS import, change grid cols, hardcode VID

  **D. Hardcode VID in `new/page.tsx`**:
  - Line 39: Remove `formato: ""` from `addVideo` initial state
  - Line 64: Remove `if (!video.formato)` validation
  - Line 95: Change `formato: video.formato as ...` to `formato: "VID" as const`

  **E. Hide AdType Select in `new/page.tsx` (lines 142-154)**:
  - Delete the entire `<div>` containing the AdType `<Select>` (lines 142-154)
  - The `defaultAdTypeId` variable and `adTypes` query stay — still used in `handleSave` for the API call
  - Since AdType occupied 1 column in a 2-col grid, the Origin select now either fills full width or stays in a 2-col grid with Deadline or Priority. Best approach: make Origin full width above the Deadline+Priority grid.

  **Must NOT do**:
  - DO NOT remove `FORMATO_LABELS` from `ad-constants.ts` — still used in display components
  - DO NOT remove `formato` field from `AdVideo` Prisma model
  - DO NOT change `adVideo.create` tRPC mutation input schema — it still requires `formato`
  - DO NOT remove `adTypes` query or `defaultAdTypeId` from new/page.tsx

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Targeted removals and modifications in specific file locations
  - **Skills**: [`frontend-ui-ux`]
    - `frontend-ui-ux`: For proper form layout adjustments after removing elements

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 3 (with Tasks 3, 5)
  - **Blocks**: Task 6
  - **Blocked By**: Task 1

  **References**:

  **Pattern References**:
  - `apps/web/src/components/ads/ad-video-form.tsx:75-110` — Current 3-column grid with Formato select to be modified
  - `apps/web/src/app/ads-requests/new/page.tsx:38-39` — addVideo function with formato in initial state
  - `apps/web/src/app/ads-requests/new/page.tsx:89-96` — createVideo call where formato needs hardcoding
  - `apps/web/src/app/ads-requests/new/page.tsx:142-154` — AdType select block to remove
  - `apps/web/src/components/ads/workflow/phase-1-briefing.tsx:197-210` — Formato select in Phase 1
  - `apps/web/src/components/ads/workflow/phase-2-roteiro.tsx:158-170` — Formato select in Phase 2

  **API/Type References**:
  - `packages/api/src/routers/ad-video.ts` — `create` mutation input still requires `formato: z.nativeEnum(AdVideoFormato)` — DO NOT CHANGE
  - `apps/web/src/components/ads/ad-video-form.tsx:9-14` — `VideoFormData` interface to modify

  **Acceptance Criteria**:

  ```bash
  grep -rn 'label="Formato"' apps/web/src/components/ads/ad-video-form.tsx apps/web/src/components/ads/workflow/phase-1-briefing.tsx apps/web/src/components/ads/workflow/phase-2-roteiro.tsx
  # Expected: 0 results

  grep -rn 'label="Tipo de Ad"' apps/web/src/app/ads-requests/new/page.tsx
  # Expected: 0 results

  grep -rn '"VID"' apps/web/src/app/ads-requests/new/page.tsx apps/web/src/components/ads/workflow/phase-1-briefing.tsx apps/web/src/components/ads/workflow/phase-2-roteiro.tsx
  # Expected: 3 results (one hardcoded VID per file)

  bun run check-types
  # Expected: 0 type errors
  ```

  **Commit**: YES
  - Message: `refactor(ui): remove Formato select, hide AdType, hardcode VID`
  - Files: `ad-video-form.tsx`, `new/page.tsx`, `phase-1-briefing.tsx`, `phase-2-roteiro.tsx`
  - Pre-commit: `bun run check-types`

---

- [ ] 5. Image Pack UI: Checkbox on Creation + Upload in Phase 4

  **What to do**:

  **A. Creation Form Checkbox (`new/page.tsx`)**:
  - Add state: `const [incluiPackFotos, setIncluiPackFotos] = useState(false)`
  - Add a checkbox in the "Dados do Projeto" card section (below Priority select, above the Entregas section):
    ```tsx
    <label className="flex items-center gap-2 cursor-pointer">
      <input
        type="checkbox"
        checked={incluiPackFotos}
        onChange={(e) => setIncluiPackFotos(e.target.checked)}
        className="h-4 w-4 rounded"
      />
      <span className="text-sm text-primary">Incluir pack de fotos da diaria</span>
    </label>
    ```
  - Pass `incluiPackFotos` in the `createProject.mutateAsync` call

  **B. Phase 4 Image Upload Section (`phase-4-producao.tsx`)**:
  - After the existing video deliverable sections, add a new section that only shows when `project.incluiPackFotos === true`
  - Section title: "Pack de Fotos"
  - Display existing uploaded images as a grid of thumbnails with delete button
  - Add "Enviar Fotos" button that opens the existing file upload flow (use `upload.upload` tRPC mutation for Vercel Blob)
  - After file is uploaded and File record created, call `adProject.uploadPackImage` to create the link
  - Each image card shows: thumbnail, filename, file size, delete button
  - No blocking behavior — image pack status does NOT affect phase advancement

  **C. Project Detail Display (`[id]/page.tsx`)**:
  - When project is COMPLETED, show "Pack de Fotos" section below the videos section if `project.incluiPackFotos === true`
  - Display uploaded images as thumbnail grid

  **Must NOT do**:
  - DO NOT add phase tracking for image packs
  - DO NOT block any phase advancement based on image pack status
  - DO NOT add image editing, cropping, or processing
  - DO NOT create a new upload mechanism — reuse existing Vercel Blob `upload.upload` tRPC mutation

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
    - Reason: New UI component with thumbnail grid, file upload flow, responsive layout
  - **Skills**: [`frontend-ui-ux`]
    - `frontend-ui-ux`: For designing the image upload area and thumbnail grid

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 3 (with Tasks 3, 4)
  - **Blocks**: Task 6
  - **Blocked By**: Tasks 1, 2

  **References**:

  **Pattern References**:
  - `apps/web/src/components/ads/deliverable/deliverable-list.tsx` — Pattern for listing items with delete buttons within a phase
  - `apps/web/src/components/ads/deliverable/deliverable-form.tsx` — Pattern for inline form within phase component
  - `apps/web/src/components/ads/media-link-dialog.tsx` — Existing file upload pattern with Vercel Blob
  - `apps/web/src/components/ads/workflow/phase-4-producao.tsx` — Phase 4 component where image upload section will be added

  **API/Type References**:
  - `packages/api/src/routers/ad-project.ts` — Where `uploadPackImage`, `deletePackImage`, `listPackImages` endpoints live (from Task 2)
  - `packages/api/src/routers/upload.ts` — Existing upload mutation for Vercel Blob (creates File record)

  **Acceptance Criteria**:

  ```bash
  grep -n "incluiPackFotos\|pack.*fotos\|Pack.*Fotos" apps/web/src/app/ads-requests/new/page.tsx
  # Expected: at least 3 results (state, checkbox, API call)

  grep -n "incluiPackFotos\|ImagePack\|pack.*fotos\|Pack.*Fotos" apps/web/src/components/ads/workflow/phase-4-producao.tsx
  # Expected: at least 2 results (conditional render + upload section)

  bun run check-types
  # Expected: 0 type errors
  ```

  **Browser Verification via Playwright**:
  ```
  1. Navigate to http://localhost:3003/ads-requests/new
  2. Assert: "Incluir pack de fotos da diaria" checkbox visible
  3. Check the checkbox
  4. Fill required fields, add 1 entrega, submit project
  5. Navigate to project detail
  6. Advance to Phase 4
  7. Assert: "Pack de Fotos" section visible in Phase 4
  8. Assert: Upload button available
  ```

  **Commit**: YES
  - Message: `feat(ui): add image pack checkbox and Phase 4 upload section`
  - Files: `new/page.tsx`, `phase-4-producao.tsx`, `[id]/page.tsx`
  - Pre-commit: `bun run check-types`

---

- [ ] 6. Full Verification & Data Cleanup

  **What to do**:
  - Run full build: `bun run build`
  - Run type check: `bun run check-types`
  - Run terminology grep verification (see Verification Strategy section)
  - Run Formato removal verification
  - Run schema verification
  - Browser test via Playwright: full creation flow (create project with pack de fotos checkbox checked, 1 entrega, submit, advance through all 6 phases)
  - Verify no regressions in existing workflow behavior

  **Must NOT do**:
  - DO NOT make any code changes in this task — verification only
  - If issues found, report them for fixing in a follow-up

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Just running verification commands and browser checks
  - **Skills**: [`playwright`]
    - `playwright`: For browser-based verification of the full flow

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Wave 4 (final)
  - **Blocks**: None
  - **Blocked By**: Tasks 3, 4, 5

  **References**:

  **Pattern References**:
  - `packages/db/prisma/set-video-pronto.ts` — Utility script for DB workaround in Phase 1 (still needed — Phase 1 "Mark Ready" UI bug persists)
  - `packages/db/prisma/create-deliverable.ts` — Utility script for Phase 4 deliverable creation (still needed — Phase 4 fileId bug persists)

  **Acceptance Criteria**:

  ```bash
  bun run build
  # Expected: Build succeeds with 0 errors

  bun run check-types
  # Expected: 0 type errors
  ```

  **Browser Verification via Playwright**:
  ```
  1. Navigate to http://localhost:3003/ads-requests/new
  2. Assert: No "Tipo de Ad" select
  3. Assert: Section says "Entregas" not "Videos"
  4. Assert: "Incluir pack de fotos" checkbox present
  5. Check pack de fotos checkbox
  6. Click "Adicionar Entrega"
  7. Assert: Card says "Entrega #1"
  8. Assert: No "Formato" select in card (only Tema + Estilo in 2-col grid)
  9. Fill: Nome=TESTREFACTOR, Tema=Ansiedade, Estilo=UGC
  10. Fill project: Title, Origin, Briefing
  11. Click "Submeter Projeto"
  12. Assert: Redirected to project detail page
  13. Assert: Phase 1 shows "entregas" not "videos"
  14. Advance through phases (using DB workaround scripts for Phase 1 and Phase 4)
  15. In Phase 4: Assert "Pack de Fotos" section visible
  16. Complete all phases to COMPLETED
  17. Assert: Final state shows "Concluido"
  ```

  **Commit**: NO (verification only)

---

## Commit Strategy

| After Task | Message | Files | Verification |
|------------|---------|-------|--------------|
| 1 | `feat(db): add incluiPackFotos field and AdProjectImage model` | schema files | `prisma db push` |
| 2 | `feat(api): add image pack endpoints and incluiPackFotos to create mutation` | ad-project.ts | `check-types` |
| 3 | `refactor(ui): rename "video" to "entrega" across ads workflow` | 12 UI files | `check-types` + grep |
| 4 | `refactor(ui): remove Formato select, hide AdType, hardcode VID` | 4 form files | `check-types` + grep |
| 5 | `feat(ui): add image pack checkbox and Phase 4 upload section` | 3 UI files | `check-types` |
| 6 | (no commit — verification only) | — | `build` + `check-types` + browser |

---

## Success Criteria

### Verification Commands
```bash
bun run build          # Expected: 0 errors
bun run check-types    # Expected: 0 type errors
```

### Final Checklist
- [ ] All "Must Have" present
- [ ] All "Must NOT Have" absent (verified via grep)
- [ ] Build passes
- [ ] Type check passes
- [ ] Browser flow works end-to-end
