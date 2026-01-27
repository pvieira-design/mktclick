# Request System MVP Completion (Tasks 8-10)

## Context

### Original Request
Complete the remaining tasks (8, 9, 10) for the Marketing Click Cannabis Request & Approval System MVP:
- Task 8: Request Details Page with timeline and conditional actions
- Task 9: Request Create/Edit Pages with form validation
- Task 10: Sidebar update + final polish and commits

### Interview Summary
**Key Discussions**:
- Date picker: Native HTML date input (simpler for MVP)
- Test strategy: Manual QA only with Playwright verification
- Create flow: Save as draft, redirect to details page
- Edit flow: Unified edit page handles both DRAFT (update) and REJECTED (correct)

**Research Findings**:
- tRPC router complete with all 10 procedures
- Form pattern established in `sign-in-form.tsx`
- Portuguese labels partially defined (missing patologiaLabels)
- Dashboard layout already handles auth protection
- User model has `name` field for display

### Gap Analysis (Self-Review)
**Identified Gaps** (addressed in plan):
- patologiaLabels missing: Add to shared labels
- tRPC mutation pattern: Use `useMutation` from tRPC proxy
- Loading states: Include skeleton UI for pages
- Error handling: Toast on mutation success/failure
- Request ID validation: Router uses UUID, need validation

---

## Work Objectives

### Core Objective
Complete the MVP request management UI with details view, create/edit forms, and navigation updates.

### Concrete Deliverables
1. `/requests/[id]/page.tsx` - Details page with history timeline
2. `/requests/new/page.tsx` - Create request form
3. `/requests/[id]/edit/page.tsx` - Edit/correct request form
4. `components/request-form.tsx` - Shared form component
5. `components/request-timeline.tsx` - History timeline component
6. `components/request-actions.tsx` - Conditional action buttons
7. `components/rejection-modal.tsx` - Modal for rejection reason
8. Updated `sidebar.tsx` with Requests navigation

### Definition of Done
- [ ] All pages render without errors
- [ ] Create form saves draft and redirects to details
- [ ] Edit form loads existing data and saves changes
- [ ] Actions execute correct tRPC mutations with toast feedback
- [ ] Rejection modal validates min 10 characters
- [ ] Sidebar shows "Requests" nav item
- [ ] All changes committed with descriptive messages

### Must Have
- All text in Portuguese (labels, buttons, messages, toasts)
- Rounded corners on cards and inputs (TailwindCSS defaults)
- Toast notifications on all mutation success/failure
- Loading states while data fetches
- Error states with retry option

### Must NOT Have (Guardrails)
- NO auto-save functionality (skip for MVP)
- NO file attachments or media uploads
- NO role-based permission checks (all users can do all actions)
- NO comments or discussion threads
- NO email notifications
- NO test file creation (manual QA only)
- NO custom date picker component (use native HTML)
- NO separate correction page (use unified edit)

---

## Verification Strategy (MANDATORY)

### Test Decision
- **Infrastructure exists**: NO
- **User wants tests**: Manual-only
- **Framework**: None (Playwright for manual verification)

### Manual QA Approach
Each TODO includes verification using:
- **Frontend/UI**: Playwright browser navigation, interactions, screenshots
- **Terminal**: Command execution with expected output
- **Visual**: Screenshot evidence for UI changes

---

## Task Flow

```
Task 0 (Shared Labels) ─┬─> Task 1 (Timeline) ─┬─> Task 4 (Details Page)
                        │                       │
                        ├─> Task 2 (Form) ──────┼─> Task 5 (Create Page)
                        │                       │
                        └─> Task 3 (Actions) ───┼─> Task 6 (Edit Page)
                                                │
                                                └─> Task 7 (Rejection Modal)
                                                          │
                                                          v
                                                    Task 8 (Sidebar)
                                                          │
                                                          v
                                                    Task 9 (Commits)
```

## Parallelization

| Group | Tasks | Reason |
|-------|-------|--------|
| A | 1, 2, 3 | Independent components, no dependencies between them |
| B | 5, 6 | Both depend on Task 2 (form), but independent of each other |

| Task | Depends On | Reason |
|------|------------|--------|
| 1 | 0 | Needs label mappings for action display |
| 2 | 0 | Needs label mappings for select options |
| 3 | 0 | Needs label mappings for status display |
| 4 | 1, 3 | Integrates timeline and actions |
| 5 | 2 | Uses shared form component |
| 6 | 2 | Uses shared form component |
| 7 | 3 | Extends actions with modal |
| 8 | 4, 5, 6, 7 | All pages must exist before nav update |
| 9 | 8 | Final commit after all changes |

---

## TODOs

- [ ] 0. Create shared label mappings utility

  **What to do**:
  - Create `apps/web/src/lib/request-labels.ts`
  - Export all label mappings: statusLabels, statusVariants, contentTypeLabels, originLabels, priorityLabels, patologiaLabels, actionLabels
  - Export enum arrays for select options: CONTENT_TYPES, ORIGINS, PRIORITIES, PATOLOGIAS
  - Move existing labels from `request-card.tsx` to this file
  - Update `request-card.tsx` to import from new file

  **Must NOT do**:
  - Don't add new enums not in Prisma schema
  - Don't translate enum values (keep as-is for tRPC)

  **Parallelizable**: NO (foundation for all other tasks)

  **References**:
  - `apps/web/src/components/request-card.tsx:19-59` - Existing label mappings to extract
  - `packages/db/prisma/schema/request.prisma:1-51` - All enum definitions
  - `apps/web/src/components/request-filters.tsx:13-27` - Type definitions pattern

  **Acceptance Criteria**:

  **Manual Verification**:
  - [ ] File exists at `apps/web/src/lib/request-labels.ts`
  - [ ] Contains all 7 label mappings exported
  - [ ] Contains 4 option arrays for selects
  - [ ] `request-card.tsx` still renders correctly (no broken imports)
  - [ ] TypeScript: `npx tsc --noEmit` passes without errors related to this file

  **Commit**: YES
  - Message: `refactor(web): extract request labels to shared utility`
  - Files: `apps/web/src/lib/request-labels.ts`, `apps/web/src/components/request-card.tsx`
  - Pre-commit: `npm run check-types`

---

- [ ] 1. Create RequestTimeline component

  **What to do**:
  - Create `apps/web/src/components/request-timeline.tsx`
  - Accept `history` prop (array from getById response)
  - Display vertical timeline with:
    - Date/time formatted in pt-BR
    - Action label (from actionLabels)
    - User who performed action (changedBy.name)
    - Changed values summary (if oldValues/newValues exist)
  - Use Separator component between entries
  - Most recent at top (already sorted by API)

  **Must NOT do**:
  - Don't fetch data (receive as prop)
  - Don't add expand/collapse (keep simple)

  **Parallelizable**: YES (with 2, 3)

  **References**:
  - `packages/api/src/routers/request.ts:110-133` - getById returns history with changedBy relation
  - `packages/db/prisma/schema/request.prisma:82-98` - RequestHistory model structure
  - `apps/web/src/components/ui/separator.tsx` - Separator component for timeline dividers
  - `apps/web/src/lib/request-labels.ts` - actionLabels mapping (after Task 0)

  **Acceptance Criteria**:

  **Manual Verification**:
  - [ ] Using Playwright, navigate to any existing request details page
  - [ ] Timeline section visible with at least CREATED action
  - [ ] Each entry shows: date, action in Portuguese, user name
  - [ ] If values changed, shows summary of changes
  - [ ] Screenshot: Capture timeline rendering

  **Commit**: NO (groups with Task 4)

---

- [ ] 2. Create RequestForm component

  **What to do**:
  - Create `apps/web/src/components/request-form.tsx`
  - Use TanStack Form with Zod validation
  - Fields:
    - title: Input, required, 3-200 chars
    - description: Textarea, required, 10-5000 chars
    - contentType: Select, required
    - origin: Select, required
    - priority: Select, optional (default MEDIUM)
    - deadline: Native date input, optional
    - patologia: Select, optional
  - Props: `initialValues?`, `onSubmit`, `isSubmitting`, `submitLabel`
  - Display validation errors below each field
  - All labels and placeholders in Portuguese

  **Must NOT do**:
  - Don't call tRPC directly (parent handles submission)
  - Don't add auto-save
  - Don't use custom date picker

  **Parallelizable**: YES (with 1, 3)

  **References**:
  - `apps/web/src/components/sign-in-form.tsx:17-45` - TanStack Form + Zod pattern
  - `apps/web/src/components/sign-in-form.tsx:64-83` - form.Field render prop pattern
  - `apps/web/src/components/request-filters.tsx:75-114` - Select component usage
  - `apps/web/src/components/ui/textarea.tsx` - Textarea component
  - `packages/api/src/routers/request.ts:27-35` - createInputSchema validation rules
  - `apps/web/src/lib/request-labels.ts` - Option arrays for selects (after Task 0)

  **Acceptance Criteria**:

  **Manual Verification**:
  - [ ] Component renders all 7 fields
  - [ ] Title shows error when < 3 or > 200 chars
  - [ ] Description shows error when < 10 chars
  - [ ] ContentType and Origin are required (show error if empty on submit)
  - [ ] Date input accepts date selection
  - [ ] All labels are in Portuguese
  - [ ] Submit button respects `isSubmitting` prop (shows loading state)

  **Commit**: NO (groups with Task 5)

---

- [ ] 3. Create RequestActions component

  **What to do**:
  - Create `apps/web/src/components/request-actions.tsx`
  - Accept props: `request` (full request object), `onAction` callback
  - Render conditional buttons based on status:
    - DRAFT: "Editar", "Enviar para Revisao", "Cancelar"
    - PENDING: "Iniciar Revisao", "Cancelar"
    - IN_REVIEW: "Aprovar", "Rejeitar"
    - REJECTED: "Corrigir", "Cancelar"
    - APPROVED, CANCELLED: No buttons (show status message)
  - Use Button component with appropriate variants
  - "Rejeitar" button should trigger `onAction('reject')` (modal handled by parent)

  **Must NOT do**:
  - Don't execute mutations (parent handles)
  - Don't include rejection modal here
  - Don't add confirmation dialogs for other actions

  **Parallelizable**: YES (with 1, 2)

  **References**:
  - `packages/db/prisma/schema/request.prisma:2-9` - RequestStatus enum values
  - `apps/web/src/components/ui/button.tsx` - Button component with variants
  - `apps/web/src/lib/request-labels.ts` - statusLabels for display (after Task 0)

  **Acceptance Criteria**:

  **Manual Verification**:
  - [ ] For DRAFT request: Shows 3 buttons (Editar, Enviar, Cancelar)
  - [ ] For PENDING request: Shows 2 buttons (Iniciar Revisao, Cancelar)
  - [ ] For IN_REVIEW request: Shows 2 buttons (Aprovar, Rejeitar)
  - [ ] For REJECTED request: Shows 2 buttons (Corrigir, Cancelar)
  - [ ] For APPROVED/CANCELLED: No action buttons visible
  - [ ] Clicking any button calls onAction with correct action type

  **Commit**: NO (groups with Task 4)

---

- [ ] 4. Create Request Details Page

  **What to do**:
  - Create `apps/web/src/app/requests/[id]/page.tsx`
  - Fetch request using `trpc.request.getById.useQuery({ id })`
  - Display all request fields in organized layout:
    - Header: Title + StatusBadge
    - Info grid: contentType, origin, priority, patologia, deadline, dates
    - Description section (full text)
    - Creator and reviewer info
    - If REJECTED: Show rejection reason prominently
  - Include RequestTimeline component
  - Include RequestActions component
  - Handle mutations with useMutation pattern:
    - submit, startReview, approve, cancel
  - Show toast on success/error
  - Invalidate query after mutation
  - Handle loading state with Skeleton
  - Handle 404 (request not found)

  **Must NOT do**:
  - Don't include edit form inline
  - Don't add comments section

  **Parallelizable**: NO (depends on 1, 3)

  **References**:
  - `packages/api/src/routers/request.ts:110-133` - getById response shape with relations
  - `apps/web/src/app/dashboard/page.tsx:17-21` - trpc.useQuery pattern
  - `apps/web/src/utils/trpc.ts:35-38` - trpc proxy setup
  - `apps/web/src/components/status-badge.tsx` - StatusBadge component
  - `apps/web/src/components/request-timeline.tsx` - Timeline component (Task 1)
  - `apps/web/src/components/request-actions.tsx` - Actions component (Task 3)
  - `apps/web/src/components/ui/skeleton.tsx` - Skeleton for loading
  - `apps/web/src/lib/request-labels.ts` - All label mappings

  **Acceptance Criteria**:

  **Manual Verification**:
  - [ ] Using Playwright, navigate to `/requests/{valid-id}`
  - [ ] All request fields display correctly
  - [ ] Timeline shows history entries
  - [ ] Action buttons appear based on status
  - [ ] Click "Enviar para Revisao" on DRAFT: Status changes, toast appears
  - [ ] Navigate to invalid ID: Shows "Request nao encontrado" message
  - [ ] Screenshot: Full details page with all sections visible

  **Commit**: YES
  - Message: `feat(web): add request details page with timeline and actions`
  - Files: `apps/web/src/app/requests/[id]/page.tsx`, components from Tasks 1, 3
  - Pre-commit: `npm run check-types`

---

- [ ] 5. Create Request New Page

  **What to do**:
  - Create `apps/web/src/app/requests/new/page.tsx`
  - Render RequestForm component
  - Handle submission with `trpc.request.create.useMutation`
  - On success:
    - Show toast "Request criado com sucesso"
    - Redirect to `/requests/{newId}`
  - On error:
    - Show toast with error message
  - Include back link to dashboard

  **Must NOT do**:
  - Don't add "submit immediately" option
  - Don't add draft auto-save

  **Parallelizable**: YES (with Task 6, both depend on Task 2)

  **References**:
  - `apps/web/src/components/request-form.tsx` - Form component (Task 2)
  - `packages/api/src/routers/request.ts:135-174` - create mutation input/output
  - `apps/web/src/components/sign-in-form.tsx:22-37` - onSubmit with success/error callbacks pattern
  - `apps/web/src/app/dashboard/page.tsx:32` - Link to /requests/new exists

  **Acceptance Criteria**:

  **Manual Verification**:
  - [ ] Using Playwright, navigate to `/requests/new`
  - [ ] Form renders with all fields empty
  - [ ] Fill valid data, click submit
  - [ ] Toast appears: "Request criado com sucesso"
  - [ ] Redirects to details page of new request
  - [ ] New request visible in dashboard list
  - [ ] Screenshot: Form before and after submission

  **Commit**: YES
  - Message: `feat(web): add request creation page`
  - Files: `apps/web/src/app/requests/new/page.tsx`, `apps/web/src/components/request-form.tsx`
  - Pre-commit: `npm run check-types`

---

- [ ] 6. Create Request Edit Page

  **What to do**:
  - Create `apps/web/src/app/requests/[id]/edit/page.tsx`
  - Fetch existing request with `trpc.request.getById.useQuery`
  - Determine mode based on status:
    - DRAFT: Use `update` mutation
    - REJECTED: Use `correct` mutation
    - Other statuses: Show error "Este request nao pode ser editado"
  - Pre-fill RequestForm with existing values
  - On success:
    - DRAFT: Toast "Request atualizado", stay on edit page
    - REJECTED: Toast "Correcao enviada", redirect to details
  - Handle loading with Skeleton
  - Include cancel link back to details page

  **Must NOT do**:
  - Don't allow editing PENDING, IN_REVIEW, APPROVED, CANCELLED
  - Don't add separate correction UI

  **Parallelizable**: YES (with Task 5)

  **References**:
  - `apps/web/src/components/request-form.tsx` - Form component (Task 2)
  - `packages/api/src/routers/request.ts:176-229` - update mutation (DRAFT only)
  - `packages/api/src/routers/request.ts:415-473` - correct mutation (REJECTED only)
  - `apps/web/src/app/requests/[id]/page.tsx` - getById query pattern (Task 4)

  **Acceptance Criteria**:

  **Manual Verification**:
  - [ ] Using Playwright, navigate to `/requests/{draft-id}/edit`
  - [ ] Form pre-filled with existing values
  - [ ] Modify title, save: Toast "Request atualizado"
  - [ ] Navigate to `/requests/{rejected-id}/edit`
  - [ ] Modify and save: Toast "Correcao enviada", redirects to details
  - [ ] Navigate to `/requests/{approved-id}/edit`
  - [ ] Shows error message, no form
  - [ ] Screenshot: Edit form with pre-filled data

  **Commit**: YES
  - Message: `feat(web): add request edit page with draft/correction modes`
  - Files: `apps/web/src/app/requests/[id]/edit/page.tsx`
  - Pre-commit: `npm run check-types`

---

- [ ] 7. Create Rejection Modal component and integrate

  **What to do**:
  - Create `apps/web/src/components/rejection-modal.tsx`
  - Use Dialog component from shadcn
  - Props: `open`, `onOpenChange`, `onConfirm`, `isSubmitting`
  - Content:
    - Title: "Rejeitar Request"
    - Description: "Informe o motivo da rejeicao (minimo 10 caracteres)"
    - Textarea for reason
    - Validation: min 10 characters, show error if less
    - Buttons: "Cancelar", "Confirmar Rejeicao"
  - Update Request Details Page to:
    - Include modal state management
    - Open modal when "Rejeitar" clicked
    - Call `trpc.request.reject.useMutation` on confirm
    - Show toast and invalidate on success

  **Must NOT do**:
  - Don't add rich text editor
  - Don't store draft rejection reason

  **Parallelizable**: NO (depends on Task 4)

  **References**:
  - `apps/web/src/components/ui/dialog.tsx` - Dialog component (uses @base-ui/react)
  - `apps/web/src/components/ui/textarea.tsx` - Textarea component
  - `packages/api/src/routers/request.ts:365-413` - reject mutation (requires reason min 10)
  - `apps/web/src/app/requests/[id]/page.tsx` - Details page to update (Task 4)

  **Acceptance Criteria**:

  **Manual Verification**:
  - [ ] Using Playwright, navigate to IN_REVIEW request details
  - [ ] Click "Rejeitar" button
  - [ ] Modal opens with textarea
  - [ ] Enter < 10 chars, click confirm: Error shown
  - [ ] Enter >= 10 chars, click confirm: Modal closes, toast appears, status changes to REJECTED
  - [ ] Rejection reason visible on details page
  - [ ] Screenshot: Modal open with validation error

  **Commit**: YES
  - Message: `feat(web): add rejection modal with reason validation`
  - Files: `apps/web/src/components/rejection-modal.tsx`, `apps/web/src/app/requests/[id]/page.tsx`
  - Pre-commit: `npm run check-types`

---

- [ ] 8. Update Sidebar with Requests navigation

  **What to do**:
  - Edit `apps/web/src/components/sidebar.tsx`
  - Import `FileText` icon from lucide-react
  - Add navigation item:
    ```typescript
    { name: "Requests", href: "/dashboard", icon: FileText }
    ```
  - Update Home to point to `/dashboard` (keep as-is)
  - Requests points to `/dashboard` (same list view)
  - Active state should work for both `/dashboard` and `/requests/*` paths

  **Must NOT do**:
  - Don't add nested navigation
  - Don't add badge/count on nav item

  **Parallelizable**: NO (final UI task)

  **References**:
  - `apps/web/src/components/sidebar.tsx:1-54` - Current sidebar structure
  - `apps/web/src/components/sidebar.tsx:11-13` - Navigation array pattern

  **Acceptance Criteria**:

  **Manual Verification**:
  - [ ] Using Playwright, navigate to `/dashboard`
  - [ ] Sidebar shows "Home" and "Requests" nav items
  - [ ] Both have icons
  - [ ] Click "Requests": Navigates (or stays on) dashboard
  - [ ] Navigate to `/requests/{id}`: "Requests" shows active state
  - [ ] Screenshot: Sidebar with both nav items

  **Commit**: YES
  - Message: `feat(web): add Requests navigation to sidebar`
  - Files: `apps/web/src/components/sidebar.tsx`
  - Pre-commit: `npm run check-types`

---

- [ ] 9. Final verification and cleanup commit

  **What to do**:
  - Run full type check: `npm run check-types`
  - Run build: `npm run build`
  - Fix any TypeScript errors
  - Remove any console.log statements
  - Ensure all imports are used
  - Create final commit with any cleanup

  **Must NOT do**:
  - Don't add new features
  - Don't refactor existing code

  **Parallelizable**: NO (final task)

  **References**:
  - `package.json:12` - check-types script
  - `package.json:11` - build script

  **Acceptance Criteria**:

  **Manual Verification**:
  - [ ] `npm run check-types` exits with 0
  - [ ] `npm run build` completes successfully
  - [ ] No warnings about unused imports
  - [ ] Application runs: `npm run dev:web`
  - [ ] Navigate through all new pages without console errors

  **Commit**: YES (if any fixes needed)
  - Message: `chore(web): cleanup and fix types for request system`
  - Files: Any files with fixes
  - Pre-commit: `npm run build`

---

## Commit Strategy

| After Task | Message | Files | Verification |
|------------|---------|-------|--------------|
| 0 | `refactor(web): extract request labels to shared utility` | request-labels.ts, request-card.tsx | `npm run check-types` |
| 4 | `feat(web): add request details page with timeline and actions` | page.tsx, timeline, actions | `npm run check-types` |
| 5 | `feat(web): add request creation page` | new/page.tsx, request-form.tsx | `npm run check-types` |
| 6 | `feat(web): add request edit page with draft/correction modes` | edit/page.tsx | `npm run check-types` |
| 7 | `feat(web): add rejection modal with reason validation` | rejection-modal.tsx, page.tsx | `npm run check-types` |
| 8 | `feat(web): add Requests navigation to sidebar` | sidebar.tsx | `npm run check-types` |
| 9 | `chore(web): cleanup and fix types for request system` | any fixes | `npm run build` |

---

## Success Criteria

### Verification Commands
```bash
npm run check-types  # Expected: exits 0
npm run build        # Expected: completes without errors
npm run dev:web      # Expected: server starts on port 3001
```

### Final Checklist
- [ ] All "Must Have" present:
  - [ ] Portuguese text throughout
  - [ ] Rounded corners (Tailwind defaults)
  - [ ] Toast notifications on mutations
  - [ ] Loading states on pages
  - [ ] Error states with messages
- [ ] All "Must NOT Have" absent:
  - [ ] No auto-save code
  - [ ] No file upload code
  - [ ] No role checks
  - [ ] No test files
  - [ ] No custom date picker
- [ ] All pages functional:
  - [ ] `/requests/[id]` shows details with actions
  - [ ] `/requests/new` creates draft requests
  - [ ] `/requests/[id]/edit` edits drafts and corrections
  - [ ] Sidebar has Requests nav
- [ ] All commits made with conventional messages
