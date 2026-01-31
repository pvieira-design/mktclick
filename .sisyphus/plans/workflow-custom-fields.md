# Workflow Custom Fields — Edição Inline, Versionamento e Agrupamento por Step

## TL;DR

> **Quick Summary**: Tornar campos personalizados editáveis inline na view page durante o workflow, com permissões por step/área, auto-save, histórico de versões por campo, e agrupamento visual por step.
>
> **Deliverables**:
> - Schema: `assignedStepId` em ContentTypeField + modelo `FieldValueVersion`
> - Backend: endpoint `saveFieldValue` + `getFieldVersions` + validação `requiredFieldsToEnter`
> - Frontend: campos inline editáveis na view page agrupados por step, auto-save, indicador visual, histórico por campo
> - Admin: UI para associar fields a steps no drawer de workflow step + badge de step na lista de fields
>
> **Estimated Effort**: Large
> **Parallel Execution**: YES — 3 waves
> **Critical Path**: Task 1 → Task 2 → Task 3 → Task 5 → Task 7 → Task 9

---

## Context

### Original Request
O usuário quer que campos personalizados possam ser preenchidos durante o workflow (não só no DRAFT), com regras claras de quem pode editar o quê em cada step, e com visualização adequada na view page.

### Interview Summary
**Key Discussions**:
- Qualquer membro da área aprovadora pode preencher campos do step atual
- Campos editáveis diretamente na view page (inline), sem sair para outra página
- Todos os campos sempre visíveis, agrupados por step
- Auto-save onBlur (exceto WYSIWYG que tem botão salvar)
- Histórico de versões por campo com seção dedicada
- Campos de steps anteriores ficam read-only (exceto rejeição)
- Na rejeição: todos os campos editáveis, criador + área podem editar
- Criador só visualiza após sair do DRAFT (exceto se rejeitado)
- Admin pode editar após aprovação
- Validar requiredFieldsToEnter + requiredFieldsToExit
- Botão avançar desabilitado se campos obrigatórios faltam
- Last-write-wins para concorrência

### Metis Review
**Identified Gaps** (addressed):
- Concorrência: last-write-wins confirmado
- Reenvio após rejeição: advanceStep normal, sem botão especial
- Admin UI para assignedStepId: incluído no escopo
- WYSIWYG auto-save: botão salvar dedicado
- Falha no auto-save: ícone vermelho + retry
- Fields sem assignedStepId: grupo "Geral" no topo
- Content types sem workflow: lista flat (comportamento atual)

---

## Work Objectives

### Core Objective
Permitir que membros de áreas aprovadoras preencham campos personalizados inline durante cada step do workflow, com auto-save, versionamento e agrupamento visual por step.

### Concrete Deliverables
- Novo campo `assignedStepId` no model `ContentTypeField`
- Novo model `FieldValueVersion` para audit trail
- Endpoint tRPC `saveFieldValue` (individual, com permissões por step)
- Endpoint tRPC `getFieldVersions` (histórico por campo)
- Validação `requiredFieldsToEnter` no `advanceStep`
- Seção de campos inline editáveis na view page agrupados por step
- Auto-save com feedback visual (check verde / vermelho + retry)
- Histórico de versões acessível por ícone em cada campo
- Admin UI: associar fields a steps no drawer de workflow step
- Admin UI: badge de step na lista de fields

### Definition of Done
- [ ] Membro de área pode editar campos do step atual inline na view page
- [ ] Campos de steps anteriores ficam read-only
- [ ] Auto-save funciona em onBlur (campos normais) e botão (WYSIWYG)
- [ ] Botão "Avançar" desabilitado quando campos obrigatórios faltam
- [ ] Histórico de versões registrado e acessível por campo
- [ ] Campos agrupados visualmente por step
- [ ] Admin pode editar após aprovação
- [ ] Criador não pode editar após sair do DRAFT (exceto rejeição)

### Must Have
- Permissões por step/área validadas no backend
- Auto-save com feedback visual
- Agrupamento por step com headers
- Versionamento de campos
- Validação requiredFieldsToEnter + requiredFieldsToExit

### Must NOT Have (Guardrails)
- WebSocket / real-time sync
- Diff viewer para versões (lista flat apenas)
- Campos fixos (título, descrição, prioridade) editáveis inline
- Notifications on field change
- Field-level comments
- Undo functionality
- Bulk save button (auto-save only)
- Modificações na edit page (/requests/[id]/edit)

---

## Verification Strategy (MANDATORY)

### Test Decision
- **Infrastructure exists**: NO
- **User wants tests**: Manual-only
- **Framework**: none

### Manual Verification
Each TODO includes executable verification via Playwright browser or curl commands.

---

## Execution Strategy

### Parallel Execution Waves

```
Wave 1 (Start Immediately):
├── Task 1: Schema (assignedStepId + FieldValueVersion)
└── Task 4: Admin UI — associar fields a steps

Wave 2 (After Wave 1):
├── Task 2: Backend saveFieldValue + getFieldVersions endpoints
├── Task 3: Backend validação requiredFieldsToEnter no advanceStep
└── Task 5: Permission hook (useFieldPermissions)

Wave 3 (After Wave 2):
├── Task 6: InlineFieldEditor component (auto-save wrapper)
├── Task 7: View page — seção de campos agrupados por step
├── Task 8: Histórico de versões UI (ícone + popover por campo)
└── Task 9: Validação visual — botão avançar desabilitado + highlight vermelho
```

### Dependency Matrix

| Task | Depends On | Blocks | Can Parallelize With |
|------|-----------|--------|---------------------|
| 1 | None | 2, 3, 4, 5, 6 | 4 |
| 2 | 1 | 5, 6, 7 | 3, 4 |
| 3 | 1 | 9 | 2, 4 |
| 4 | 1 | None | 2, 3 |
| 5 | 1, 2 | 7, 9 | 3 |
| 6 | 2 | 7 | 5 |
| 7 | 5, 6 | 8, 9 | None |
| 8 | 2, 7 | None | 9 |
| 9 | 3, 5, 7 | None | 8 |

### Agent Dispatch Summary

| Wave | Tasks | Recommended Agents |
|------|-------|--------------------|
| 1 | 1, 4 | category: quick (T1), visual-engineering (T4) |
| 2 | 2, 3, 5 | category: unspecified-high (T2, T3), quick (T5) |
| 3 | 6, 7, 8, 9 | category: visual-engineering (T6, T7, T8, T9) |

---

## TODOs

- [ ] 1. Schema: assignedStepId + FieldValueVersion

  **What to do**:
  - Add optional field `assignedStepId String?` to `ContentTypeField` model with relation to `WorkflowStep`
  - Add `@@index([assignedStepId])` to `ContentTypeField`
  - Create new model `FieldValueVersion` with: `id`, `fieldValueId` (relation to `RequestFieldValue`), `oldValue Json?`, `newValue Json`, `changedById` (relation to `User`), `stepId String?` (which step was active), `createdAt DateTime`
  - Add `@@index([fieldValueId])` and `@@index([changedById])` to `FieldValueVersion`
  - Add `versions FieldValueVersion[]` relation to `RequestFieldValue`
  - Export new types from `packages/db/src/index.ts` if needed
  - Run `npx prisma generate` and `npx prisma db push`

  **Must NOT do**:
  - Change WorkflowStep schema
  - Change RequestFieldValue's existing fields
  - Add any non-optional fields that would break existing data

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Schema-only change, no complex logic
  - **Skills**: [`frontend-ui-ux`]
    - `frontend-ui-ux`: Not needed, but no better skill available

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with Task 4)
  - **Blocks**: Tasks 2, 3, 4, 5, 6
  - **Blocked By**: None

  **References**:

  **Pattern References**:
  - `packages/db/prisma/schema/file.prisma` — Example of model with relations, @@map, @@index conventions
  - `packages/db/prisma/schema/custom-fields.prisma` — The ContentTypeField model to modify
  - `packages/db/prisma/schema/workflow.prisma` — WorkflowStep model (target of the new relation)

  **API/Type References**:
  - `packages/db/src/index.ts` — Where enums/types are exported, may need to add new exports

  **WHY Each Reference Matters**:
  - `file.prisma` shows the project convention for @@map table names, @@index patterns, and relation definitions
  - `custom-fields.prisma` is the file being modified — understand existing structure before adding
  - `workflow.prisma` shows the WorkflowStep model structure for the foreign key relation

  **Acceptance Criteria**:

  ```bash
  # Agent runs:
  npx prisma db push 2>&1
  # Assert: Output contains "Your database is now in sync" (no errors)

  npx prisma generate 2>&1
  # Assert: Output contains "Generated Prisma Client"

  # Verify schema:
  bun -e "
    const db = require('@marketingclickcannabis/db').default;
    const field = await db.contentTypeField.findFirst({ include: { assignedStep: true } });
    console.log('assignedStepId exists:', 'assignedStepId' in (field || {}));
  "
  # Assert: Output contains "assignedStepId exists: true"
  ```

  **Commit**: YES
  - Message: `feat(db): add assignedStepId to ContentTypeField and FieldValueVersion model`
  - Files: `packages/db/prisma/schema/custom-fields.prisma`, `packages/db/src/index.ts`
  - Pre-commit: `npx prisma generate`

---

- [ ] 2. Backend: saveFieldValue + getFieldVersions endpoints

  **What to do**:
  - Create `saveFieldValue` procedure in `request.ts` router:
    - Input: `{ requestId, fieldId, value }`
    - Authorization logic:
      1. If request status is DRAFT → only creator can save
      2. If request status is REJECTED → creator OR member of target step area can save
      3. If request status is IN_REVIEW/PENDING → only member of current step area can save
      4. If request status is APPROVED → only admin can save
      5. If CANCELLED → nobody
    - Field-level authorization:
      1. In DRAFT: any field
      2. In REJECTED: any field
      3. In workflow (IN_REVIEW/PENDING): field must have `assignedStepId === currentStepId` OR `assignedStepId === null` (unassigned) OR field is currently empty (not filled by a previous step)
      4. As admin (APPROVED): any field
    - On save: upsert `RequestFieldValue`, create `FieldValueVersion` with old/new value + userId + stepId
  - Create `getFieldVersions` procedure:
    - Input: `{ requestId, fieldId }`
    - Returns: list of versions ordered by createdAt desc, including changedBy user info

  **Must NOT do**:
  - Accept bulk saves of multiple fields at once
  - Modify existing `update` or `saveFieldValues` endpoints (keep them working for edit page)
  - Add any side effects beyond save + version record

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
    - Reason: Complex authorization logic with multiple permission paths
  - **Skills**: [`frontend-ui-ux`]
    - `frontend-ui-ux`: Not needed for backend, but no backend-specific skill

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 2 (with Tasks 3, 4)
  - **Blocks**: Tasks 5, 6, 7
  - **Blocked By**: Task 1

  **References**:

  **Pattern References**:
  - `packages/api/src/routers/request.ts:322-365` — Existing file linking pattern in create mutation (transaction + loop)
  - `packages/api/src/routers/request.ts:237-335` — Create mutation pattern (protectedProcedure, transaction, validation flow)
  - `packages/api/src/services/workflow-validator.ts:37-61` — `canUserApprove` function: exact permission check logic to reuse

  **API/Type References**:
  - `packages/db/prisma/schema/custom-fields.prisma:44-61` — RequestFieldValue model (upsert target)
  - `packages/db/prisma/schema/custom-fields.prisma:17-41` — ContentTypeField model (field ownership via assignedStepId)

  **WHY Each Reference Matters**:
  - `canUserApprove` is the exact function to reuse for checking area membership at a step
  - Request create pattern shows how to use transactions with multiple related writes
  - RequestFieldValue has a unique constraint on `[requestId, fieldId]` — use upsert, not create

  **Acceptance Criteria**:

  ```bash
  # 1. Area member saves field in current step
  curl -s -X POST http://localhost:3001/api/trpc/request.saveFieldValue \
    -H "Content-Type: application/json" \
    -H "Cookie: $AREA_MEMBER_SESSION" \
    -d '{"json":{"requestId":"<ID>","fieldId":"<FIELD_ID>","value":"test"}}' \
    | jq '.result.data.json.success'
  # Assert: Output is "true"

  # 2. Creator cannot save after DRAFT
  curl -s -X POST http://localhost:3001/api/trpc/request.saveFieldValue \
    -H "Cookie: $CREATOR_SESSION" \
    -d '{"json":{"requestId":"<ID>","fieldId":"<FIELD_ID>","value":"hacked"}}' \
    | jq '.error.data.code'
  # Assert: Output is "FORBIDDEN"

  # 3. Version created
  curl -s "http://localhost:3001/api/trpc/request.getFieldVersions?input=$(echo '{"json":{"requestId":"<ID>","fieldId":"<FIELD_ID>"}}' | jq -sRr @uri)" \
    -H "Cookie: $AREA_MEMBER_SESSION" \
    | jq '.result.data.json | length'
  # Assert: Output >= 1
  ```

  **Commit**: YES
  - Message: `feat(api): add saveFieldValue and getFieldVersions endpoints with step-based authorization`
  - Files: `packages/api/src/routers/request.ts`
  - Pre-commit: `tsc --noEmit`

---

- [ ] 3. Backend: validar requiredFieldsToEnter no advanceStep

  **What to do**:
  - In `advanceStep` mutation, after the existing `requiredFieldsToExit` validation:
    - Get the NEXT step using `getNextStep()`
    - If next step exists and has `requiredFieldsToEnter`, validate those fields are filled
    - Use `validateRequiredFields(nextStep, fieldValuesMap, "enter")` which already exists
    - If validation fails, throw TRPCError with missing field names
  - Update error message to distinguish "exit" vs "enter" field validation failures

  **Must NOT do**:
  - Change `validateRequiredFields` function signature
  - Change any existing validation for `requiredFieldsToExit`
  - Add any other validations not discussed

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Small surgical change in existing function
  - **Skills**: [`frontend-ui-ux`]

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 2 (with Tasks 2, 4)
  - **Blocks**: Task 9
  - **Blocked By**: Task 1

  **References**:

  **Pattern References**:
  - `packages/api/src/routers/request.ts` — `advanceStep` mutation (find the existing `requiredFieldsToExit` validation block)
  - `packages/api/src/services/workflow-validator.ts:66-91` — `validateRequiredFields` function (already handles "enter" direction)
  - `packages/api/src/services/workflow-validator.ts:96-111` — `getNextStep` function (already exists)

  **WHY Each Reference Matters**:
  - `advanceStep` is the exact location to add the new validation — find the `requiredFieldsToExit` check and add `requiredFieldsToEnter` validation right after
  - `validateRequiredFields` already accepts `"enter"` direction — just call it
  - `getNextStep` already fetches the next step with all required data

  **Acceptance Criteria**:

  ```bash
  # Try to advance when next step's requiredFieldsToEnter are missing
  curl -s -X POST http://localhost:3001/api/trpc/request.advanceStep \
    -H "Cookie: $APPROVER_SESSION" \
    -d '{"json":{"id":"<ID>"}}' \
    | jq '.error.message'
  # Assert: Output contains "required fields" or "Missing required fields to enter"
  ```

  **Commit**: YES
  - Message: `feat(api): validate requiredFieldsToEnter when advancing workflow step`
  - Files: `packages/api/src/routers/request.ts`
  - Pre-commit: `tsc --noEmit`

---

- [ ] 4. Admin UI: associar fields a steps no drawer do workflow step + badge na lista de fields

  **What to do**:
  - Find the admin page for managing workflow steps (likely in `/admin/content-types/` or similar)
  - In the workflow step edit drawer: add a multi-select to choose which ContentTypeFields are assigned to this step
    - On save: update `assignedStepId` on selected fields to this step's ID, clear `assignedStepId` on deselected fields
  - In the admin fields list (ContentTypeField management):
    - Next to each field name, show a badge with the assigned step name (or "Sem step" if null)
    - Badge should use existing `Badge` component with `color="gray"` for unassigned, `color="brand"` for assigned

  **Must NOT do**:
  - Change the ContentTypeField create/edit form structure beyond adding the badge
  - Add drag-and-drop ordering of fields
  - Modify workflow step creation flow

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
    - Reason: UI-heavy admin changes
  - **Skills**: [`frontend-ui-ux`]
    - `frontend-ui-ux`: Admin forms and visual badge styling

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with Task 1) — Note: depends on Task 1 schema being done first
  - **Blocks**: None
  - **Blocked By**: Task 1

  **References**:

  **Pattern References**:
  - `apps/web/src/app/admin/tags/page.tsx` — Admin list page pattern (table with badges)
  - `apps/web/src/components/tag/tag-drawer.tsx` — Drawer with form pattern (SlideoutMenu + form)
  - `apps/web/src/components/base/select/multi-select.tsx` — Multi-select component for field selection
  - `apps/web/src/components/base/badges/badges.tsx` — Badge component for step name display

  **Documentation References**:
  - Find the admin content type / workflow step management pages by searching for `workflowStep` or `contentType` in `apps/web/src/app/admin/`

  **WHY Each Reference Matters**:
  - `admin/tags/page.tsx` shows the exact table + badge pattern to follow for displaying step badges next to fields
  - `tag-drawer.tsx` shows the SlideoutMenu drawer form pattern used consistently in admin pages
  - `multi-select.tsx` is needed to select multiple fields in the workflow step drawer

  **Acceptance Criteria**:

  ```
  # Via Playwright:
  1. Navigate to admin workflow step editor
  2. Open a workflow step drawer
  3. Assert: Multi-select for "Campos" is visible
  4. Select 2 fields
  5. Save
  6. Assert: Toast "Step atualizado" appears
  7. Navigate to admin fields list
  8. Assert: Selected fields show badge with step name
  9. Assert: Unselected fields show "Sem step" badge
  ```

  **Commit**: YES
  - Message: `feat(admin): add field-to-step assignment UI in workflow step drawer and field list badges`
  - Files: admin pages + components
  - Pre-commit: `tsc --noEmit`

---

- [ ] 5. Permission hook: useFieldPermissions

  **What to do**:
  - Create `apps/web/src/hooks/use-field-permissions.ts`
  - Hook signature: `useFieldPermissions({ request, userId, userRole, userAreaMemberships, contentTypeFields })`
  - Returns: `{ editableFieldIds: Set<string>, requiredFieldIds: Set<string>, canAdvance: boolean }`
  - Logic:
    - DRAFT: all fields editable (if creator)
    - REJECTED: all fields editable (if creator OR member of target step area)
    - IN_REVIEW/PENDING: fields where `assignedStepId === currentStepId` OR `assignedStepId === null` AND field is empty — editable only for area members of current step
    - APPROVED: all fields editable only for admin
    - CANCELLED: nothing editable
  - `requiredFieldIds`: fields in `requiredFieldsToExit` of current step that are empty
  - `canAdvance`: all `requiredFieldIds` are filled + existing `canAdvance` logic from `usePermissions`

  **Must NOT do**:
  - Modify existing `usePermissions` hook (keep backward compatible)
  - Add server calls from this hook (pure client-side computation)
  - Import from backend packages

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Pure logic hook, no UI, no backend
  - **Skills**: [`frontend-ui-ux`]

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 2
  - **Blocks**: Tasks 7, 9
  - **Blocked By**: Tasks 1, 2

  **References**:

  **Pattern References**:
  - `apps/web/src/hooks/use-permissions.ts` — Existing permission hook pattern (useMemo, interface structure, return type)
  - `packages/api/src/services/workflow-validator.ts:37-61` — `canUserApprove` server logic to mirror on client

  **WHY Each Reference Matters**:
  - `use-permissions.ts` is the exact pattern to follow: same interface style, useMemo, same area membership checking logic
  - `canUserApprove` shows the backend permission logic that the hook must mirror client-side

  **Acceptance Criteria**:

  ```bash
  # LSP diagnostics check
  # Assert: No TypeScript errors in use-field-permissions.ts

  # Via Playwright:
  1. Login as area member of step 2
  2. Navigate to request at step 2
  3. Assert: Fields assigned to step 2 render as inputs (editable)
  4. Assert: Fields assigned to step 1 render as static text (read-only)
  5. Login as creator
  6. Navigate to same request
  7. Assert: ALL fields render as static text (read-only) — creator cannot edit in workflow
  ```

  **Commit**: YES
  - Message: `feat(hooks): add useFieldPermissions hook for step-based field editability`
  - Files: `apps/web/src/hooks/use-field-permissions.ts`
  - Pre-commit: `tsc --noEmit`

---

- [ ] 6. InlineFieldEditor component (auto-save wrapper)

  **What to do**:
  - Create `apps/web/src/components/request/inline-field-editor.tsx`
  - Wraps individual fields from `DynamicFieldRenderer` for single-field inline editing
  - Props: `{ field, value, isEditable, isRequired, isMissing, onSave, onFileUpload? }`
  - Behavior:
    - If `isEditable === false`: render read-only display (same as current view page rendering)
    - If `isEditable === true`:
      - Render appropriate input control based on `field.fieldType`
      - For non-WYSIWYG: auto-save onBlur. Show subtle green check icon on success, red icon + "Tentar novamente" on failure
      - For WYSIWYG: show a small "Salvar" button below the editor. Same success/failure indicators
    - If `isMissing === true` (required but empty): red border + "Campo obrigatório" hint
  - `onSave` calls `trpc.request.saveFieldValue.mutate`

  **Must NOT do**:
  - Modify existing `DynamicFieldRenderer` component
  - Add bulk save logic
  - Add debounce for non-WYSIWYG fields (blur is already a single event)

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
    - Reason: Component with states, animations, visual feedback
  - **Skills**: [`frontend-ui-ux`]
    - `frontend-ui-ux`: Complex interactive component with status indicators

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Sequential (Wave 3)
  - **Blocks**: Task 7
  - **Blocked By**: Task 2

  **References**:

  **Pattern References**:
  - `apps/web/src/components/request/dynamic-field-renderer.tsx:151-346` — `renderField` switch for each field type (reuse the rendering logic)
  - `apps/web/src/components/base/input/input.tsx` — Input component (isInvalid prop for red border)
  - `apps/web/src/components/base/textarea/textarea.tsx` — TextArea component

  **WHY Each Reference Matters**:
  - `renderField` in DynamicFieldRenderer has the complete switch/case for rendering each field type — extract and adapt for single-field inline mode
  - Input and TextArea components already support `isInvalid` prop for red border styling

  **Acceptance Criteria**:

  ```
  # Via Playwright:
  1. Navigate to request view with editable fields
  2. Click on an editable TEXT field
  3. Type "new value"
  4. Click outside (blur)
  5. Assert: Green check icon appears within 2s
  6. Assert: API call to saveFieldValue was made (check network tab)
  7. Reload page
  8. Assert: Field shows "new value"

  # WYSIWYG field:
  1. Find a WYSIWYG field
  2. Type content
  3. Assert: "Salvar" button is visible below editor
  4. Click "Salvar"
  5. Assert: Green check icon appears

  # Failure case:
  1. Disconnect network
  2. Edit a field and blur
  3. Assert: Red icon appears with "Tentar novamente" button
  ```

  **Commit**: YES
  - Message: `feat(components): add InlineFieldEditor with auto-save and visual feedback`
  - Files: `apps/web/src/components/request/inline-field-editor.tsx`
  - Pre-commit: `tsc --noEmit`

---

- [ ] 7. View page: seção de campos agrupados por step

  **What to do**:
  - In `apps/web/src/app/requests/[id]/page.tsx`:
    - Replace the current flat "Campos Personalizados" section
    - Group fields by their `assignedStepId` → show step name as section header
    - Fields with `assignedStepId === null` go in a "Geral" group at the top
    - Within each group, fields sorted by `order`
    - Each field rendered via `InlineFieldEditor` with:
      - `isEditable` from `useFieldPermissions` hook
      - `isRequired` if field is in current step's `requiredFieldsToExit`
      - `isMissing` if required AND empty
  - Update `RequestData` interface to include `contentType.fields[].assignedStepId` and `contentType.fields[].assignedStep`
  - Fetch `fieldValues` and pass to `useFieldPermissions`
  - Current step header should be visually highlighted (bolder, accent color)

  **Must NOT do**:
  - Make fixed fields (title, description, etc.) editable
  - Add a "Save All" button
  - Modify the edit page

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
    - Reason: UI restructuring with grouped sections
  - **Skills**: [`frontend-ui-ux`]
    - `frontend-ui-ux`: Layout restructuring and visual hierarchy

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Sequential (Wave 3)
  - **Blocks**: Tasks 8, 9
  - **Blocked By**: Tasks 5, 6

  **References**:

  **Pattern References**:
  - `apps/web/src/app/requests/[id]/page.tsx:415-480` — Current "Campos Personalizados" section to replace
  - `apps/web/src/components/request/workflow-actions.tsx:261-308` — `WorkflowProgress` component as visual reference for step-based UI

  **API/Type References**:
  - `packages/api/src/routers/request.ts:164-235` — `getById` query: already returns `contentType.fields` and `fieldValues`

  **WHY Each Reference Matters**:
  - The current flat section is the exact code to replace with the grouped version
  - `WorkflowProgress` shows how steps are already displayed visually (numbering, current highlight)
  - `getById` returns all needed data — may need to add `assignedStep` include to the query

  **Acceptance Criteria**:

  ```
  # Via Playwright:
  1. Navigate to /requests/<id> where content type has fields assigned to different steps
  2. Assert: Section headers exist matching step names (e.g., "Criação", "Design Review")
  3. Assert: Fields are grouped under their respective step headers
  4. Assert: Fields without step show under "Geral" header
  5. Assert: Current step header has accent styling (different from others)
  6. Login as area member of current step
  7. Assert: Fields in current step group are editable (input elements)
  8. Assert: Fields in other groups are read-only (static text)
  ```

  **Commit**: YES
  - Message: `feat(view): group custom fields by workflow step with inline editing`
  - Files: `apps/web/src/app/requests/[id]/page.tsx`
  - Pre-commit: `tsc --noEmit`

---

- [ ] 8. Histórico de versões UI (ícone + popover por campo)

  **What to do**:
  - Add a small clock/history icon button next to each field that has version history
  - On click: open a popover/dropdown showing list of versions:
    - Each entry: `[User name] • [date] — "old value" → "new value"`
    - Ordered by most recent first
    - Limit to last 10 versions with "Ver mais" link
  - Fetch versions using `trpc.request.getFieldVersions` lazily (only when popover opens)
  - If field has no versions: don't show the icon

  **Must NOT do**:
  - Build a diff viewer (just show old → new as text)
  - Add rollback functionality
  - Show versions for fields that were never modified

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
    - Reason: Popover UI with lazy loading
  - **Skills**: [`frontend-ui-ux`]
    - `frontend-ui-ux`: Popover design and interaction

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 3 (with Task 9)
  - **Blocks**: None
  - **Blocked By**: Tasks 2, 7

  **References**:

  **Pattern References**:
  - `apps/web/src/components/request/workflow-actions.tsx:209-256` — Dialog/popover pattern with lazy-loaded data
  - `apps/web/src/app/requests/[id]/page.tsx:454-470` — History timeline rendering (similar list format)

  **WHY Each Reference Matters**:
  - Workflow actions dialog shows the pattern for lazy-fetching data when a dialog/popover opens
  - History timeline shows the existing visual pattern for timestamp + user + action lists

  **Acceptance Criteria**:

  ```
  # Via Playwright:
  1. Navigate to request where a field was modified
  2. Assert: Clock icon visible next to the modified field
  3. Click clock icon
  4. Assert: Popover opens with version list
  5. Assert: Each version shows user name, date, old value → new value
  6. For a field never modified: Assert no clock icon
  ```

  **Commit**: YES
  - Message: `feat(view): add per-field version history popover`
  - Files: `apps/web/src/components/request/field-version-history.tsx`, `apps/web/src/app/requests/[id]/page.tsx`
  - Pre-commit: `tsc --noEmit`

---

- [ ] 9. Validação visual: botão avançar desabilitado + highlight vermelho

  **What to do**:
  - In `WorkflowActions` component: use `useFieldPermissions` to get `canAdvance` (which factors in required fields)
  - If `canAdvance === false` due to missing required fields:
    - Disable "Aprovar e Avançar" button
    - Show tooltip on hover: "Preencha os campos obrigatórios para avançar"
  - In `InlineFieldEditor`: when `isMissing === true`:
    - Red border on the field
    - Red text below: "Campo obrigatório para avançar"
  - When all required fields are filled: button becomes enabled, red highlights disappear
  - Also validate `requiredFieldsToEnter` of next step (show those fields as required too)

  **Must NOT do**:
  - Show validation errors for fields of other steps
  - Add a separate validation summary panel
  - Block the page from loading if fields are missing

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
    - Reason: Visual states and conditional UI
  - **Skills**: [`frontend-ui-ux`]
    - `frontend-ui-ux`: Validation UX patterns

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 3 (with Task 8)
  - **Blocks**: None
  - **Blocked By**: Tasks 3, 5, 7

  **References**:

  **Pattern References**:
  - `apps/web/src/components/request/workflow-actions.tsx:170-184` — Advance button rendering (add disabled state)
  - `apps/web/src/components/request/dynamic-field-renderer.tsx:352-370` — Field label with required asterisk pattern
  - `apps/web/src/hooks/use-field-permissions.ts` — The hook from Task 5 that provides `canAdvance` and `requiredFieldIds`

  **WHY Each Reference Matters**:
  - Workflow actions component is where the advance button lives — must integrate the new `canAdvance` logic
  - DynamicFieldRenderer shows the existing required field label pattern to follow
  - use-field-permissions provides the data needed to drive the visual states

  **Acceptance Criteria**:

  ```
  # Via Playwright:
  1. Navigate to request with empty required fields for current step
  2. Assert: Required fields have red border
  3. Assert: Red text "Campo obrigatório para avançar" below each
  4. Assert: "Aprovar e Avançar" button is DISABLED
  5. Fill all required fields
  6. Assert: Red borders disappear
  7. Assert: "Aprovar e Avançar" button is ENABLED
  8. Click button
  9. Assert: Request advances to next step
  ```

  **Commit**: YES
  - Message: `feat(view): add required field validation with disabled advance button`
  - Files: `apps/web/src/components/request/workflow-actions.tsx`, `apps/web/src/components/request/inline-field-editor.tsx`
  - Pre-commit: `tsc --noEmit`

---

## Commit Strategy

| After Task | Message | Files | Verification |
|------------|---------|-------|--------------|
| 1 | `feat(db): add assignedStepId and FieldValueVersion` | schema, index.ts | `prisma db push` |
| 2 | `feat(api): add saveFieldValue and getFieldVersions` | request.ts | `tsc --noEmit` |
| 3 | `feat(api): validate requiredFieldsToEnter` | request.ts | `tsc --noEmit` |
| 4 | `feat(admin): field-to-step assignment UI` | admin pages | `tsc --noEmit` |
| 5 | `feat(hooks): add useFieldPermissions` | hooks/ | `tsc --noEmit` |
| 6 | `feat(components): InlineFieldEditor` | components/ | `tsc --noEmit` |
| 7 | `feat(view): grouped fields by step` | page.tsx | `tsc --noEmit` |
| 8 | `feat(view): field version history` | components/ + page | `tsc --noEmit` |
| 9 | `feat(view): required field validation` | workflow-actions + inline-editor | `tsc --noEmit` |

---

## Success Criteria

### Verification Commands
```bash
npx prisma db push       # Schema sync
tsc --noEmit              # TypeScript passes
```

### Final Checklist
- [ ] Membro de área edita campo do step atual inline (auto-save)
- [ ] Campos de steps anteriores são read-only
- [ ] Criador não edita após sair do DRAFT
- [ ] Admin edita após aprovação
- [ ] Rejeição: todos campos editáveis para criador + área
- [ ] Botão avançar desabilitado se campos obrigatórios faltam
- [ ] requiredFieldsToEnter validado ao avançar
- [ ] Histórico de versões por campo acessível
- [ ] Campos agrupados por step com headers visuais
- [ ] WYSIWYG tem botão salvar dedicado
- [ ] Feedback visual: check verde (sucesso), vermelho + retry (falha)
- [ ] Admin pode associar fields a steps na UI
- [ ] Badge de step visível na lista de fields
