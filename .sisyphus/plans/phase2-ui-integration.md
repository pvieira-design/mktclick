# Phase 2 UI Integration - Marketing Click Cannabis

## TL;DR

> **Quick Summary**: Integrate existing dynamic field and workflow components into request pages, add missing admin navigation links, and update API to handle field values and workflow initialization.
> 
> **Deliverables**:
> - DynamicFieldRenderer integrated in new/edit request pages
> - WorkflowActions integrated in request detail page
> - Admin sidebar Users link added
> - Content type edit page links to fields/workflow config
> - API updated for fieldValues and workflow initialization
> 
> **Estimated Effort**: Medium (7 tasks across 3 waves)
> **Parallel Execution**: YES - 3 waves
> **Critical Path**: Task 3 (API) -> Task 1 (New Request) -> Task 2 (Edit Request)

---

## Context

### Original Request
Complete Phase 2 Extended UI integration for the Marketing Click Cannabis request management platform. All backend components and UI components exist but are not connected. The dynamic content type fields, workflow actions, and admin navigation need to be wired together.

### Interview Summary
**Key Discussions**:
- Verified all components exist and are fully implemented
- Confirmed API patterns and existing mutation structures
- Identified 7 specific integration gaps

**Research Findings**:
- `DynamicFieldRenderer` component is complete with support for all field types (TEXT, TEXTAREA, WYSIWYG, FILE, DATE, DATETIME, SELECT, NUMBER, CHECKBOX, URL)
- `WorkflowActions` component handles step advancement, rejection, and cancellation with proper permission checks
- `usePermissions` hook calculates `canAdvance`, `canReject`, `canEdit`, `canCancel` based on user area memberships
- API `contentTypeField.listByContentType` returns fields by contentTypeId
- API `request.getById` already includes `fieldValues` and `workflowSteps` in response

### Metis Review
**Identified Gaps** (addressed):
- Field values type safety in API: Use `z.record(z.string(), z.any()).optional()`
- User area memberships access: Create protected endpoint or use session context
- Handle empty custom fields gracefully: DynamicFieldRenderer already handles this case
- WorkflowActions requires user context: Fetch via session in page component

---

## Work Objectives

### Core Objective
Connect existing UI components (DynamicFieldRenderer, WorkflowActions) to request pages and ensure the complete data flow from form submission through workflow initialization.

### Concrete Deliverables
1. `/requests/new/page.tsx` - Integrated with DynamicFieldRenderer
2. `/requests/[id]/page.tsx` - Integrated with WorkflowActions
3. `/requests/[id]/edit/page.tsx` - Integrated with DynamicFieldRenderer
4. `/admin/layout.tsx` - Users link added
5. `/admin/content-types/[id]/edit/page.tsx` - Fields/Workflow links added
6. `request.ts` router - fieldValues in create, workflow init in submit
7. New hook: `useCurrentUser` for fetching user with area memberships

### Definition of Done
- [ ] Creating a new request shows dynamic fields based on selected content type
- [ ] Field values are saved to RequestFieldValue table on creation
- [ ] Request detail page shows workflow step and appropriate actions
- [ ] Users link visible in admin sidebar
- [ ] Content type edit page has links to Fields and Workflow configuration
- [ ] Submitting a DRAFT request initializes the workflow

### Must Have
- Type-safe API mutations
- Error handling for missing fields
- Loading states during data fetching
- Existing functionality preserved

### Must NOT Have (Guardrails)
- NO breaking changes to existing request creation flow
- NO `as any` type assertions without justification
- NO new component creation (use existing components)
- NO schema/database changes
- NO removal of existing hardcoded fields (title, description, priority, etc.)

---

## Verification Strategy (MANDATORY)

### Test Decision
- **Infrastructure exists**: NO (no test framework configured)
- **User wants tests**: Manual-only (per project state)
- **Framework**: None
- **QA approach**: Manual verification with Playwright browser automation

### Manual QA Procedures

Each task includes verification via:
1. **Browser Testing**: Navigate to pages, interact with forms
2. **API Verification**: Check network requests in dev tools
3. **Database Verification**: Use Prisma Studio to verify data persistence

---

## Task Dependency Graph

| Task | Depends On | Reason |
|------|------------|--------|
| Task 1 | Task 3 | New request page needs API to accept fieldValues |
| Task 2 | Task 3, Task 7 | Edit request page needs API + user hook |
| Task 3 | None | API changes are foundational |
| Task 4 | Task 3, Task 7 | Detail page needs WorkflowActions which needs user data |
| Task 5 | None | Admin sidebar is independent |
| Task 6 | None | Content type links are independent |
| Task 7 | None | User hook is foundational |

---

## Parallel Execution Graph

```
Wave 1 (Start immediately - no dependencies):
├── Task 3: Update request.ts API router (fieldValues + workflow init)
├── Task 5: Add Users link to admin sidebar
├── Task 6: Add Fields/Workflow links to content type edit page
└── Task 7: Create useCurrentUser hook

Wave 2 (After Wave 1 completes):
├── Task 1: Integrate DynamicFieldRenderer in /requests/new
└── Task 4: Integrate WorkflowActions in /requests/[id]

Wave 3 (After Wave 2 completes):
└── Task 2: Integrate DynamicFieldRenderer in /requests/[id]/edit

Critical Path: Task 3 → Task 1 → Task 2
Estimated Parallel Speedup: ~50% faster than sequential
```

---

## Execution Strategy

### Parallel Execution Waves

**Wave 1** - Foundation (4 tasks, independent)
- Task 3: API changes
- Task 5: Admin sidebar link
- Task 6: Content type edit links
- Task 7: User hook creation

**Wave 2** - Primary Integration (2 tasks)
- Task 1: New request page (needs API from Wave 1)
- Task 4: Request detail page (needs hook from Wave 1)

**Wave 3** - Final Integration (1 task)
- Task 2: Edit request page (shares patterns with Task 1)

### Dependency Matrix

| Task | Depends On | Blocks | Can Parallelize With |
|------|------------|--------|---------------------|
| 3 | None | 1, 2, 4 | 5, 6, 7 |
| 5 | None | None | 3, 6, 7 |
| 6 | None | None | 3, 5, 7 |
| 7 | None | 2, 4 | 3, 5, 6 |
| 1 | 3 | 2 | 4 |
| 4 | 3, 7 | None | 1 |
| 2 | 1 | None | None (final) |

### Agent Dispatch Summary

| Wave | Tasks | Recommended Dispatch |
|------|-------|---------------------|
| 1 | 3, 5, 6, 7 | 4 parallel agents with `run_in_background=true` |
| 2 | 1, 4 | 2 parallel agents after Wave 1 completes |
| 3 | 2 | Single agent, final integration |

---

## TODOs

### Task 1: Integrate DynamicFieldRenderer in /requests/new/page.tsx

**What to do**:
1. Import `DynamicFieldRenderer` from `@/components/request/dynamic-field-renderer`
2. Add state for `fieldValues: Record<string, any>`
3. Fetch fields when `contentTypeId` changes using `trpc.contentTypeField.listByContentType`
4. Render `DynamicFieldRenderer` below existing form fields when `contentTypeId` is selected
5. Include `fieldValues` in the create mutation payload
6. Handle file uploads via the existing upload router pattern

**Must NOT do**:
- Remove existing hardcoded fields (title, description, priority, patologia, deadline)
- Break validation logic
- Change the form's visual layout significantly

**Recommended Agent Profile**:
- **Category**: `visual-engineering`
  - Reason: Frontend form integration with dynamic UI rendering
- **Skills**: [`frontend-ui-ux`, `typescript-programmer`]
  - `frontend-ui-ux`: Form UX patterns, loading states, error handling
  - `typescript-programmer`: Type-safe tRPC integration

**Skills Evaluated but Omitted**:
- `svelte-programmer`: Project uses React/Next.js
- `agent-browser`: Not needed for implementation

**Parallelization**:
- **Can Run In Parallel**: YES (with Task 4)
- **Parallel Group**: Wave 2 (with Task 4)
- **Blocks**: Task 2
- **Blocked By**: Task 3

**References**:

**Pattern References**:
- `apps/web/src/app/admin/content-types/[id]/fields/page.tsx:110-116` - How to fetch fields by contentTypeId
- `apps/web/src/components/request/dynamic-field-renderer.tsx:55-62` - DynamicFieldRenderer props interface
- `apps/web/src/app/requests/new/page.tsx:60-68` - Current formData state pattern

**API/Type References**:
- `packages/api/src/routers/content-type-field.ts:9-20` - `listByContentType` query returns `{ items: Field[] }`
- `packages/api/src/routers/request.ts:35-43` - Current createInputSchema (needs fieldValues added)

**Documentation References**:
- `apps/web/src/components/request/dynamic-field-renderer.tsx:46-53` - Props interface documentation

**Acceptance Criteria**:

**Manual Execution Verification:**
- [ ] Using playwright browser automation:
  - Navigate to: `http://localhost:3001/requests/new`
  - Select a content type that has custom fields configured
  - Verify: Dynamic fields appear below the base form fields
  - Fill all required fields including dynamic ones
  - Click "Criar Request"
  - Verify: Toast shows success, redirects to detail page
- [ ] Using Prisma Studio:
  - Run: `npm run db:studio`
  - Navigate to RequestFieldValue table
  - Verify: New field values exist for the created request

**Commit**: YES
- Message: `feat(requests): integrate DynamicFieldRenderer in new request page`
- Files: `apps/web/src/app/requests/new/page.tsx`
- Pre-commit: Manual verification

---

### Task 2: Integrate DynamicFieldRenderer in /requests/[id]/edit/page.tsx

**What to do**:
1. Import `DynamicFieldRenderer` from `@/components/request/dynamic-field-renderer`
2. Load existing field values from `request.fieldValues` (already included in getById response)
3. Transform `fieldValues` array to `Record<string, any>` for the component
4. Add state for editing field values
5. Fetch fresh fields using `trpc.contentTypeField.listByContentType`
6. Include updated field values in update/correct mutation

**Must NOT do**:
- Break the REJECTED -> correct flow
- Remove ability to edit base fields
- Change status transition logic

**Recommended Agent Profile**:
- **Category**: `visual-engineering`
  - Reason: Frontend form integration with data loading
- **Skills**: [`frontend-ui-ux`, `typescript-programmer`]
  - `frontend-ui-ux`: Edit form patterns, data hydration
  - `typescript-programmer`: Type transformations for field values

**Skills Evaluated but Omitted**:
- `data-scientist`: No data processing needed
- `svelte-programmer`: Wrong framework

**Parallelization**:
- **Can Run In Parallel**: NO
- **Parallel Group**: Wave 3 (sequential)
- **Blocks**: None (final task)
- **Blocked By**: Task 1 (shares similar patterns)

**References**:

**Pattern References**:
- `apps/web/src/app/requests/new/page.tsx` (after Task 1) - Field integration pattern
- `apps/web/src/app/requests/[id]/edit/page.tsx:80-92` - Current useEffect for loading existing data
- `packages/api/src/routers/request.ts:153-156` - fieldValues included in getById response

**API/Type References**:
- `packages/api/src/routers/request.ts:45-54` - updateInputSchema structure
- `packages/api/src/routers/request.ts:73-82` - correctInputSchema structure

**Acceptance Criteria**:

**Manual Execution Verification:**
- [ ] Using playwright browser automation:
  - Navigate to: `http://localhost:3001/requests/[existing-draft-id]/edit`
  - Verify: Existing field values are pre-populated
  - Modify a dynamic field value
  - Click "Salvar Alteracoes"
  - Verify: Toast shows success, values persisted
- [ ] For REJECTED request:
  - Navigate to: `http://localhost:3001/requests/[rejected-id]/edit`
  - Verify: Can edit and click "Corrigir e Resubmeter"
  - Verify: Status changes to PENDING

**Commit**: YES
- Message: `feat(requests): integrate DynamicFieldRenderer in edit request page`
- Files: `apps/web/src/app/requests/[id]/edit/page.tsx`
- Pre-commit: Manual verification

---

### Task 3: Update request.ts API router for fieldValues and workflow initialization

**What to do**:
1. Add `fieldValues: z.record(z.string(), z.any()).optional()` to `createInputSchema`
2. In `create` mutation, after creating request, save field values if provided (use pattern from `saveFieldValues`)
3. In `submit` mutation, call `getFirstStep` and set `currentStepId` if not already set
4. Add `fieldValues` to `updateInputSchema` and `correctInputSchema`
5. In `update` and `correct` mutations, save field values if provided

**Must NOT do**:
- Break existing create/update/submit flows
- Change transaction boundaries inappropriately
- Remove existing validation

**Recommended Agent Profile**:
- **Category**: `ultrabrain`
  - Reason: Complex API logic with transactions and workflow initialization
- **Skills**: [`typescript-programmer`]
  - `typescript-programmer`: Zod schemas, tRPC mutations, Prisma transactions

**Skills Evaluated but Omitted**:
- `frontend-ui-ux`: Backend task
- `python-programmer`: Wrong language
- `data-scientist`: Not data processing

**Parallelization**:
- **Can Run In Parallel**: YES (with Tasks 5, 6, 7)
- **Parallel Group**: Wave 1
- **Blocks**: Tasks 1, 2, 4
- **Blocked By**: None

**References**:

**Pattern References**:
- `packages/api/src/routers/request.ts:561-608` - `saveFieldValues` mutation pattern (COPY THIS)
- `packages/api/src/routers/request.ts:784-811` - `initializeWorkflow` mutation pattern
- `packages/api/src/routers/request.ts:182-221` - Current create mutation transaction

**API/Type References**:
- `packages/api/src/routers/request.ts:35-43` - createInputSchema to modify
- `packages/api/src/services/workflow-validator.ts:getFirstStep` - Function to get first workflow step

**Acceptance Criteria**:

**API Verification:**
- [ ] Create request with fieldValues:
  ```bash
  # After implementation, test via UI or curl:
  # Expected: Request created with field values in RequestFieldValue table
  ```
- [ ] Submit request initializes workflow:
  ```bash
  # After submitting a DRAFT request:
  # Verify: currentStepId is set to first workflow step
  # Verify: status is PENDING (or IN_REVIEW depending on workflow)
  ```

**Commit**: YES
- Message: `feat(api): add fieldValues to request create/update and workflow init to submit`
- Files: `packages/api/src/routers/request.ts`
- Pre-commit: TypeScript compilation check

---

### Task 4: Integrate WorkflowActions in /requests/[id]/page.tsx

**What to do**:
1. Import `WorkflowActions` and `WorkflowProgress` from `@/components/request/workflow-actions`
2. Import `useCurrentUser` hook (from Task 7)
3. Fetch current user with area memberships
4. Replace `renderActions()` function with `WorkflowActions` component
5. Add `WorkflowProgress` component to show workflow timeline
6. Pass required props: `request`, `userId`, `userAreaMemberships`
7. Keep existing rejection dialog for non-workflow rejection (legacy support)

**Must NOT do**:
- Remove existing status-based action buttons entirely (keep as fallback)
- Break the rejection reason modal
- Remove history timeline

**Recommended Agent Profile**:
- **Category**: `visual-engineering`
  - Reason: Complex UI integration with permission-based rendering
- **Skills**: [`frontend-ui-ux`, `typescript-programmer`]
  - `frontend-ui-ux`: Conditional UI rendering, user feedback
  - `typescript-programmer`: Type-safe prop passing

**Skills Evaluated but Omitted**:
- `agent-browser`: Not for implementation
- `data-scientist`: No data processing

**Parallelization**:
- **Can Run In Parallel**: YES (with Task 1)
- **Parallel Group**: Wave 2
- **Blocks**: None
- **Blocked By**: Task 3, Task 7

**References**:

**Pattern References**:
- `apps/web/src/components/request/workflow-actions.tsx:55-60` - WorkflowActionsProps interface
- `apps/web/src/components/request/workflow-actions.tsx:277-324` - WorkflowProgress component
- `apps/web/src/hooks/use-permissions.ts:46-119` - Permission calculation logic

**API/Type References**:
- `packages/api/src/routers/request.ts:134-180` - getById response includes workflowSteps, currentStep
- `packages/api/src/routers/user.ts:61-92` - getById with areaMemberships

**Acceptance Criteria**:

**Manual Execution Verification:**
- [ ] Using playwright browser automation:
  - Navigate to: `http://localhost:3001/requests/[id-with-workflow]`
  - Verify: WorkflowProgress shows current step
  - Verify: Appropriate action buttons shown based on user permissions
  - If user can advance: Click "Aprovar e Avancar"
  - Verify: Step advances, toast shows success
- [ ] Test rejection flow:
  - Click "Rejeitar"
  - Verify: Dialog shows previous steps to return to
  - Select step, enter reason, confirm
  - Verify: Request status changes to REJECTED

**Commit**: YES
- Message: `feat(requests): integrate WorkflowActions in request detail page`
- Files: `apps/web/src/app/requests/[id]/page.tsx`
- Pre-commit: Manual verification

---

### Task 5: Add Users link to admin sidebar

**What to do**:
1. Add a `<Link>` for `/admin/users` in the admin layout navigation
2. Place it after the "Areas" link to maintain logical order
3. Use the same styling as existing links

**Must NOT do**:
- Change existing navigation structure
- Add complex conditional rendering
- Modify permissions (layout already checks SUPER_ADMIN)

**Recommended Agent Profile**:
- **Category**: `quick`
  - Reason: Single-file, trivial change (~3 lines)
- **Skills**: []
  - No skills needed for simple link addition

**Skills Evaluated but Omitted**:
- All skills: Task is too trivial to need specialized knowledge

**Parallelization**:
- **Can Run In Parallel**: YES (with Tasks 3, 6, 7)
- **Parallel Group**: Wave 1
- **Blocks**: None
- **Blocked By**: None

**References**:

**Pattern References**:
- `apps/web/src/app/admin/layout.tsx:32-49` - Existing navigation link pattern

**Acceptance Criteria**:

**Manual Execution Verification:**
- [ ] Using playwright browser automation:
  - Navigate to: `http://localhost:3001/admin`
  - Verify: "Users" link visible in sidebar
  - Click "Users" link
  - Verify: Navigates to `/admin/users` successfully
  - Verify: Users list page loads

**Commit**: YES (groups with Task 6)
- Message: `feat(admin): add Users link to admin sidebar`
- Files: `apps/web/src/app/admin/layout.tsx`
- Pre-commit: Visual verification

---

### Task 6: Add Fields/Workflow links to content type edit page

**What to do**:
1. Add a section with links to Fields and Workflow configuration
2. Add after the form, before the footer buttons
3. Use Card component for visual grouping
4. Include descriptive text for each link

**Must NOT do**:
- Change the edit form functionality
- Add conditional logic for new vs existing content types
- Break the save flow

**Recommended Agent Profile**:
- **Category**: `quick`
  - Reason: Simple UI addition (~20 lines)
- **Skills**: [`frontend-ui-ux`]
  - `frontend-ui-ux`: Card layout patterns

**Skills Evaluated but Omitted**:
- `typescript-programmer`: No complex types needed
- `svelte-programmer`: Wrong framework

**Parallelization**:
- **Can Run In Parallel**: YES (with Tasks 3, 5, 7)
- **Parallel Group**: Wave 1
- **Blocks**: None
- **Blocked By**: None

**References**:

**Pattern References**:
- `apps/web/src/app/admin/content-types/[id]/edit/page.tsx:108-206` - Current page structure
- `apps/web/src/app/admin/content-types/[id]/fields/page.tsx:254-258` - Link back pattern (reverse this)

**File References**:
- Target pages exist: `apps/web/src/app/admin/content-types/[id]/fields/page.tsx`
- Target pages exist: `apps/web/src/app/admin/content-types/[id]/workflow/page.tsx`

**Acceptance Criteria**:

**Manual Execution Verification:**
- [ ] Using playwright browser automation:
  - Navigate to: `http://localhost:3001/admin/content-types/[id]/edit`
  - Verify: Section with "Fields" and "Workflow" links visible
  - Click "Configure Fields" link
  - Verify: Navigates to `/admin/content-types/[id]/fields`
  - Navigate back, click "Configure Workflow"
  - Verify: Navigates to `/admin/content-types/[id]/workflow`

**Commit**: YES (groups with Task 5)
- Message: `feat(admin): add Fields and Workflow links to content type edit page`
- Files: `apps/web/src/app/admin/content-types/[id]/edit/page.tsx`
- Pre-commit: Visual verification

---

### Task 7: Create useCurrentUser hook for fetching user with area memberships

**What to do**:
1. Create new hook at `apps/web/src/hooks/use-current-user.ts`
2. Use better-auth's `useSession` to get current user ID
3. Fetch full user data including `areaMemberships` via tRPC
4. Return loading state, user data, and area memberships
5. Memoize the result to prevent unnecessary re-fetches

**Must NOT do**:
- Expose sensitive user data unnecessarily
- Create redundant API endpoints
- Bypass authentication checks

**Recommended Agent Profile**:
- **Category**: `unspecified-low`
  - Reason: Hook creation with auth and tRPC integration
- **Skills**: [`typescript-programmer`]
  - `typescript-programmer`: React hooks, tRPC queries, type inference

**Skills Evaluated but Omitted**:
- `frontend-ui-ux`: No UI rendering
- `python-programmer`: Wrong language

**Parallelization**:
- **Can Run In Parallel**: YES (with Tasks 3, 5, 6)
- **Parallel Group**: Wave 1
- **Blocks**: Tasks 2, 4
- **Blocked By**: None

**References**:

**Pattern References**:
- `apps/web/src/hooks/use-metadata.ts` - Existing hook patterns in the project
- `packages/auth/src/index.ts` - Better-auth session handling

**API/Type References**:
- `packages/api/src/routers/user.ts:61-92` - getById includes areaMemberships

**Note**: Need to check if a user can query their own data, or if we need a new endpoint. The current `user.getById` is `adminProcedure`.

**Solution**: Create a new `user.me` endpoint that returns current user's data including area memberships:

```typescript
// Add to packages/api/src/routers/user.ts
me: protectedProcedure.query(async ({ ctx }) => {
  const user = await db.user.findUnique({
    where: { id: ctx.session.user.id },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      areaMemberships: {
        include: {
          area: { select: { id: true, name: true, slug: true } },
        },
      },
    },
  });
  return user;
}),
```

**Acceptance Criteria**:

**Manual Execution Verification:**
- [ ] Create hook file and verify TypeScript compiles
- [ ] Import hook in a test component
- [ ] Using browser dev tools:
  - Verify: Network request made to user.me endpoint
  - Verify: Response includes areaMemberships array
- [ ] Test in request detail page (Task 4)

**Commit**: YES
- Message: `feat(auth): add user.me endpoint and useCurrentUser hook`
- Files: 
  - `packages/api/src/routers/user.ts`
  - `apps/web/src/hooks/use-current-user.ts`
- Pre-commit: TypeScript compilation

---

## Commit Strategy

| After Task | Message | Files | Verification |
|------------|---------|-------|--------------|
| 3 | `feat(api): add fieldValues to request create/update and workflow init to submit` | `packages/api/src/routers/request.ts` | TypeScript compiles |
| 5+6 | `feat(admin): add Users link and content type config links` | `apps/web/src/app/admin/layout.tsx`, `apps/web/src/app/admin/content-types/[id]/edit/page.tsx` | Visual verification |
| 7 | `feat(auth): add user.me endpoint and useCurrentUser hook` | `packages/api/src/routers/user.ts`, `apps/web/src/hooks/use-current-user.ts` | TypeScript compiles |
| 1 | `feat(requests): integrate DynamicFieldRenderer in new request page` | `apps/web/src/app/requests/new/page.tsx` | Manual QA |
| 4 | `feat(requests): integrate WorkflowActions in request detail page` | `apps/web/src/app/requests/[id]/page.tsx` | Manual QA |
| 2 | `feat(requests): integrate DynamicFieldRenderer in edit request page` | `apps/web/src/app/requests/[id]/edit/page.tsx` | Manual QA |

---

## Success Criteria

### Verification Commands
```bash
# Build check (no TypeScript errors)
npm run check-types

# Start dev server
npm run dev

# Open Prisma Studio to verify data
npm run db:studio
```

### Final Checklist
- [ ] All "Must Have" requirements present
- [ ] All "Must NOT Have" guardrails respected
- [ ] New request page shows dynamic fields when content type selected
- [ ] Edit request page loads existing field values
- [ ] Request detail page shows workflow actions based on permissions
- [ ] Admin sidebar has Users link
- [ ] Content type edit has Fields/Workflow links
- [ ] Submitting a request initializes workflow
- [ ] No TypeScript errors
- [ ] No console errors in browser
