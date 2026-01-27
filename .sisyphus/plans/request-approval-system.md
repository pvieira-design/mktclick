# Request and Approval System - Implementation Plan

## Context

### Original Request
Implement the Request and Approval system - the MOST IMPORTANT feature. Start with basic functionality:
- Create requests (with content type selection)
- Approval workflow
- Database schema for: User, Roles, Requests, Content Types, Request Flow, Request History

User wants to start SIMPLE and iterate. Focus on core request creation and approval flow first.

### Interview Summary
**Key Discussions**:
- Schema organization: New file `request.prisma` for Request + RequestHistory models
- Enum strategy: Native Prisma enums for type safety and database-level validation
- Testing: Manual QA only for MVP (Playwright for UI, curl/httpie for API)
- UI complexity: Functional basics (clean forms, validation, toasts, simple table)

**Research Findings**:
- Codebase uses Better-T-Stack monorepo: `packages/db`, `packages/api`, `packages/auth`, `apps/web`
- tRPC v11 with `protectedProcedure` in `packages/api/src/index.ts`
- Better-Auth with admin plugin, roles stored as String in User model
- TanStack Form + Zod for forms, shadcn/ui components
- Detailed architecture documentation exists in `docs/mvp/08-arquitetura-tecnica.md`

### Gap Analysis Review
**Identified Gaps** (addressed):
1. Need `roleProcedure` middleware for admin-only operations - Will create in packages/api
2. User.role is String, should work with native enums - Will add Role enum
3. Self-approval prevention needed - Will add check in approve mutation
4. Atomic RequestHistory creation - Will use Prisma transactions
5. State machine integrity - Will implement strict transition map

---

## Work Objectives

### Core Objective
Build a complete request lifecycle system: Create -> Submit -> Review -> Approve/Reject with role-based authorization and full audit trail.

### Concrete Deliverables
1. **Database**: `packages/db/prisma/schema/request.prisma` with Request, RequestHistory models and all enums
2. **API**: `packages/api/src/routers/request.ts` with CRUD + status transitions + authorization
3. **UI Pages**: 
   - `/dashboard/requests` - List all requests
   - `/dashboard/requests/new` - Create new request
   - `/dashboard/requests/[id]` - View request detail with approval actions
4. **UI Components**:
   - `RequestForm.tsx` - Create/edit form
   - `RequestList.tsx` - Table with status badges
   - `RequestDetail.tsx` - Detail view with actions

### Definition of Done
- [ ] `bun run db:push` completes without errors
- [ ] All tRPC procedures respond correctly (verified with curl)
- [ ] User can create, submit, and view requests in browser
- [ ] Admin can approve/reject requests with reason
- [ ] RequestHistory tracks all status changes

### Must Have
- All 6 content types selectable
- All 6 status states implemented with correct transitions
- Role-based authorization (admin/head/super_admin can approve)
- Rejection requires reason (10-2000 chars)
- RequestHistory audit trail for every status change
- Deadline validation (minimum +1 hour)

### Must NOT Have (Guardrails)
- NO file attachments
- NO email/push notifications
- NO rich text editor (plain Markdown textarea)
- NO autosave functionality
- NO bulk operations
- NO advanced filtering/search (simple status filter only)
- NO export functionality
- NO analytics or reporting
- NO self-approval prevention (user CAN approve own requests per docs)
- NO confirmation dialogs beyond browser native

---

## Verification Strategy (MANDATORY)

### Test Decision
- **Infrastructure exists**: NO
- **User wants tests**: Manual-only
- **Framework**: none

### Manual QA Approach

Each TODO includes detailed verification procedures using:

| Type | Verification Tool | Procedure |
|------|------------------|-----------|
| **Database** | Prisma Studio / psql | Run `bun run db:studio`, verify tables exist |
| **API** | curl / httpie | Send requests, verify responses |
| **Frontend** | Playwright browser / manual | Navigate, interact, verify |

---

## Task Flow

```
Task 0 (DB Schema)
    |
    v
Task 1 (Role Middleware) --> Task 2 (Request Router)
                                   |
                                   v
                            Task 3 (Shared Types/Schemas)
                                   |
                                   v
            +-----------+-----------+-----------+
            |           |           |           |
            v           v           v           v
        Task 4      Task 5      Task 6      Task 7
       (Sidebar)   (List Page) (Create)   (Detail)
            |           |           |           |
            +-----------+-----------+-----------+
                                   |
                                   v
                            Task 8 (Integration Test)
```

## Parallelization

| Group | Tasks | Reason |
|-------|-------|--------|
| A | 4, 5 | Independent UI components |
| B | 6, 7 | Can be built in parallel after Task 3 |

| Task | Depends On | Reason |
|------|------------|--------|
| 1 | 0 | Needs User model with Role |
| 2 | 1 | Needs roleProcedure middleware |
| 3 | 2 | Needs tRPC types from router |
| 4-7 | 3 | Need shared types and schemas |
| 8 | 4-7 | Integration test of full flow |

---

## TODOs

- [ ] 0. Database Schema - Create Request and RequestHistory models with enums

  **What to do**:
  - Create `packages/db/prisma/schema/request.prisma`
  - Define enums: `Role`, `RequestStatus`, `ContentType`, `Priority`, `Origin`, `Patologia`, `HistoryAction`
  - Define `Request` model with all fields and relations
  - Define `RequestHistory` model for audit trail
  - Update User model to use Role enum (in `auth.prisma`)
  - Run `bun run db:push` to apply schema

  **Must NOT do**:
  - Do NOT add indexes beyond what's specified (premature optimization)
  - Do NOT create migration files yet (db:push for development)
  - Do NOT add file attachment fields

  **Parallelizable**: NO (foundation task)

  **References**:

  **Pattern References**:
  - `packages/db/prisma/schema/auth.prisma:1-17` - User model structure and @@map convention
  - `packages/db/prisma/schema/schema.prisma:1-9` - Generator and datasource config (prisma-client output)

  **API/Type References**:
  - `docs/mvp/03-modelo-dados.md` - Complete model specification with all fields
  - `docs/mvp/04-content-types.md` - ContentType enum values and descriptions
  - `docs/mvp/05-regras-negocio.md` - Status enum values and transitions

  **Documentation References**:
  - `docs/mvp/08-arquitetura-tecnica.md:183-205` - Zod schemas that mirror Prisma enums

  **WHY Each Reference Matters**:
  - `auth.prisma` shows the @@map convention for table naming (lowercase)
  - `schema.prisma` shows generator output path to `../generated`
  - MVP docs define the exact field requirements and constraints

  **Acceptance Criteria**:

  **Manual Execution Verification:**
  - [ ] `bun run --cwd packages/db db:push` completes with "Your database is now in sync"
  - [ ] `bun run --cwd packages/db db:studio` opens Prisma Studio
  - [ ] In Prisma Studio: `request` table exists with all columns
  - [ ] In Prisma Studio: `request_history` table exists
  - [ ] In Prisma Studio: `user` table has `role` column

  **Evidence Required:**
  - [ ] Terminal output of successful db:push
  - [ ] Screenshot of Prisma Studio showing tables

  **Commit**: YES
  - Message: `feat(db): add Request and RequestHistory models with enums`
  - Files: `packages/db/prisma/schema/request.prisma`, `packages/db/prisma/schema/auth.prisma`
  - Pre-commit: `bun run --cwd packages/db db:push`

---

- [ ] 1. API Middleware - Create role-based procedure middleware

  **What to do**:
  - Edit `packages/api/src/index.ts`
  - Add `adminProcedure` that checks for admin/head/super_admin roles
  - Ensure session.user.role is accessible from context
  - Export `adminProcedure` alongside existing procedures

  **Must NOT do**:
  - Do NOT create separate middleware file (keep simple)
  - Do NOT add complex role hierarchy logic
  - Do NOT modify `context.ts`

  **Parallelizable**: NO (depends on Task 0)

  **References**:

  **Pattern References**:
  - `packages/api/src/index.ts:11-25` - Existing `protectedProcedure` pattern with middleware
  - `packages/auth/src/index.ts:17-22` - Better-Auth admin plugin with defaultRole

  **Documentation References**:
  - `docs/mvp/08-arquitetura-tecnica.md:257-267` - adminProcedure example code
  - `docs/mvp/06-permissoes-roles.md` - Role permission matrix

  **WHY Each Reference Matters**:
  - `index.ts:11-25` shows exact middleware pattern to follow
  - Admin plugin exposes role on `session.user.role`
  - MVP docs show the exact roles that can approve

  **Acceptance Criteria**:

  **Manual Execution Verification:**
  - [ ] TypeScript compiles: `bun run --cwd packages/api check-types` (if exists) OR no red squiggles in VSCode
  - [ ] Import test: Create temp file that imports `adminProcedure` - should resolve

  **Evidence Required:**
  - [ ] Code showing adminProcedure implementation
  - [ ] No TypeScript errors in file

  **Commit**: YES
  - Message: `feat(api): add adminProcedure for role-based authorization`
  - Files: `packages/api/src/index.ts`
  - Pre-commit: `bun tsc --noEmit` in packages/api (if configured)

---

- [ ] 2. API Router - Create request tRPC router with all procedures

  **What to do**:
  - Create `packages/api/src/routers/request.ts`
  - Import Prisma client from `@marketingclickcannabis/db`
  - Implement procedures: `list`, `getById`, `create`, `update`, `submit`, `startReview`, `approve`, `reject`, `correct`, `cancel`
  - Add Zod input validation for each procedure
  - Use transactions for status changes + history creation
  - Register router in `packages/api/src/routers/index.ts`

  **Must NOT do**:
  - Do NOT implement file upload
  - Do NOT add pagination yet (all requests in one query for MVP)
  - Do NOT implement complex filtering (status filter only)
  - Do NOT add caching

  **Parallelizable**: NO (depends on Task 1)

  **References**:

  **Pattern References**:
  - `packages/api/src/routers/index.ts:1-14` - How to structure and merge routers
  - `packages/api/src/index.ts:9` - publicProcedure and protectedProcedure exports
  - `packages/db/src/index.ts:1-9` - How to import Prisma client

  **API/Type References**:
  - `packages/db/prisma/schema/request.prisma` (from Task 0) - Model types

  **Documentation References**:
  - `docs/mvp/08-arquitetura-tecnica.md:107-176` - Complete router structure with all procedures
  - `docs/mvp/08-arquitetura-tecnica.md:183-205` - Zod validation schemas
  - `docs/mvp/05-regras-negocio.md` - Status transition rules and business logic

  **WHY Each Reference Matters**:
  - `routers/index.ts` shows how to merge routers into appRouter
  - MVP docs provide complete procedure signatures and validation schemas
  - Business rules doc defines which transitions are allowed

  **Acceptance Criteria**:

  **Manual Execution Verification:**
  - [ ] Start dev server: `bun run dev` in root
  - [ ] Test healthCheck: `curl http://localhost:3001/api/trpc/healthCheck` -> "OK"
  - [ ] Test create (requires auth cookie - get from browser):
    ```bash
    curl -X POST http://localhost:3001/api/trpc/request.create \
      -H "Content-Type: application/json" \
      -H "Cookie: <session_cookie>" \
      -d '{"json":{"title":"Test Request","description":"Test description with enough chars","contentType":"video_ugc","deadline":"2026-01-28T20:00:00Z"}}'
    ```
    -> Returns request object with id
  - [ ] Test list: `curl http://localhost:3001/api/trpc/request.list` -> Returns array

  **Evidence Required:**
  - [ ] curl output showing successful create response
  - [ ] curl output showing list with created request

  **Commit**: YES
  - Message: `feat(api): add request router with CRUD and status transitions`
  - Files: `packages/api/src/routers/request.ts`, `packages/api/src/routers/index.ts`
  - Pre-commit: `curl http://localhost:3001/api/trpc/healthCheck`

---

- [ ] 3. Shared Types - Create shared Zod schemas and TypeScript types

  **What to do**:
  - Create `apps/web/src/lib/schemas/request.ts`
  - Define Zod schemas: `createRequestSchema`, `updateRequestSchema`, `rejectRequestSchema`
  - Export TypeScript types inferred from schemas
  - Define status badge color mappings
  - Define content type display labels (Portuguese)

  **Must NOT do**:
  - Do NOT duplicate schemas (import from this file in both API and UI)
  - Do NOT add complex validation beyond what's in Zod

  **Parallelizable**: NO (depends on Task 2 for type consistency)

  **References**:

  **Pattern References**:
  - `apps/web/src/components/sign-in-form.tsx:4,39-44` - Zod schema usage with TanStack Form

  **Documentation References**:
  - `docs/mvp/08-arquitetura-tecnica.md:183-205` - Complete Zod schemas
  - `docs/mvp/04-content-types.md` - Content type labels and descriptions

  **WHY Each Reference Matters**:
  - sign-in-form shows how validators integrate with TanStack Form
  - MVP docs have exact schema definitions to copy

  **Acceptance Criteria**:

  **Manual Execution Verification:**
  - [ ] TypeScript compiles in apps/web
  - [ ] Import works: Create temp component that imports from `@/lib/schemas/request`

  **Evidence Required:**
  - [ ] File content showing all schemas
  - [ ] No TypeScript errors

  **Commit**: YES
  - Message: `feat(web): add shared Zod schemas for request forms`
  - Files: `apps/web/src/lib/schemas/request.ts`
  - Pre-commit: none

---

- [ ] 4. UI Navigation - Add Requests link to Sidebar

  **What to do**:
  - Edit `apps/web/src/components/sidebar.tsx`
  - Add "Requests" navigation item with ClipboardList icon
  - Link to `/dashboard/requests`

  **Must NOT do**:
  - Do NOT add nested navigation
  - Do NOT add badge count (future feature)

  **Parallelizable**: YES (with Task 5, independent)

  **References**:

  **Pattern References**:
  - `apps/web/src/components/sidebar.tsx:11-13` - Navigation array structure

  **WHY Each Reference Matters**:
  - Shows exact format for adding navigation items

  **Acceptance Criteria**:

  **Manual Execution Verification:**
  - [ ] Using Playwright or browser: Navigate to `/dashboard`
  - [ ] Verify "Requests" link visible in sidebar
  - [ ] Click link -> navigates to `/dashboard/requests` (may show 404 until page exists)

  **Evidence Required:**
  - [ ] Screenshot showing sidebar with Requests link

  **Commit**: NO (groups with Task 5)

---

- [ ] 5. UI Page - Create Request List page

  **What to do**:
  - Add shadcn components: `bunx shadcn@latest add table badge select`
  - Create `apps/web/src/app/dashboard/requests/page.tsx`
  - Fetch requests using tRPC `request.list`
  - Display in table/card format with columns: Title, Type, Status, Deadline, Creator
  - Add status badges with color coding
  - Add "New Request" button linking to `/dashboard/requests/new`
  - Add simple status filter (dropdown)

  **Must NOT do**:
  - Do NOT add pagination (show all for MVP)
  - Do NOT add sorting
  - Do NOT add search
  - Do NOT add bulk selection

  **Parallelizable**: YES (with Task 4)

  **References**:

  **Pattern References**:
  - `apps/web/src/app/dashboard/page.tsx:1-17` - Server component with session access
  - `apps/web/src/utils/trpc.ts:35-38` - tRPC client usage with createTRPCOptionsProxy
  - `apps/web/src/components/ui/button.tsx` - Button component
  - `apps/web/src/components/ui/card.tsx` - Card component

  **Documentation References**:
  - `docs/mvp/07-interface-ui.md` - UI descriptions and requirements

  **WHY Each Reference Matters**:
  - dashboard/page.tsx shows server component pattern
  - trpc.ts shows how to use tRPC in components
  - UI components are the building blocks

  **Acceptance Criteria**:

  **Manual Execution Verification:**
  - [ ] Using Playwright or browser: Navigate to `/dashboard/requests`
  - [ ] Page loads without errors
  - [ ] If requests exist: Table displays them with all columns
  - [ ] Status badges show correct colors
  - [ ] "New Request" button is visible and clickable

  **Evidence Required:**
  - [ ] Screenshot of request list page (empty state or with data)
  - [ ] Browser console shows no errors

  **Commit**: YES
  - Message: `feat(web): add request list page with status filter`
  - Files: `apps/web/src/app/dashboard/requests/page.tsx`, `apps/web/src/components/sidebar.tsx`
  - Pre-commit: Manual browser verification

---

- [ ] 6. UI Page - Create New Request page with form

  **What to do**:
  - Add shadcn components: `bunx shadcn@latest add textarea`
  - Create `apps/web/src/app/dashboard/requests/new/page.tsx`
  - Create `apps/web/src/components/requests/RequestForm.tsx`
  - Use TanStack Form with Zod validation
  - Fields: title (input), description (textarea), contentType (select), deadline (native datetime-local input), priority (select), origin (select), patologia (optional select)
  - Submit calls `request.create` mutation
  - On success: toast + redirect to `/dashboard/requests`
  - On error: toast with error message

  **Must NOT do**:
  - Do NOT add autosave
  - Do NOT add rich text editor
  - Do NOT add file upload
  - Do NOT add preview mode

  **Parallelizable**: YES (with Task 7, after Task 3)

  **References**:

  **Pattern References**:
  - `apps/web/src/components/sign-in-form.tsx:17-45` - TanStack Form setup with Zod validators
  - `apps/web/src/components/sign-in-form.tsx:64-83` - Field rendering pattern with error display
  - `apps/web/src/components/ui/input.tsx` - Input component
  - `apps/web/src/components/ui/label.tsx` - Label component

  **API/Type References**:
  - `apps/web/src/lib/schemas/request.ts` (from Task 3) - createRequestSchema

  **Documentation References**:
  - `docs/mvp/07-interface-ui.md` - Form field specifications
  - `docs/mvp/04-content-types.md` - Content type options for select

  **WHY Each Reference Matters**:
  - sign-in-form.tsx is the exact pattern to follow for form implementation
  - Schema defines validation rules
  - Content types doc lists all dropdown options

  **Acceptance Criteria**:

  **Manual Execution Verification:**
  - [ ] Using Playwright or browser: Navigate to `/dashboard/requests/new`
  - [ ] Form displays all fields
  - [ ] Validation works: Submit empty form -> shows errors
  - [ ] Fill form with valid data -> Submit
  - [ ] Success toast appears
  - [ ] Redirects to `/dashboard/requests`
  - [ ] New request appears in list

  **Evidence Required:**
  - [ ] Screenshot of form with validation errors
  - [ ] Screenshot of successful submission toast
  - [ ] Screenshot of list showing new request

  **Commit**: YES
  - Message: `feat(web): add request creation form page`
  - Files: `apps/web/src/app/dashboard/requests/new/page.tsx`, `apps/web/src/components/requests/RequestForm.tsx`
  - Pre-commit: Manual form submission test

---

- [ ] 7. UI Page - Create Request Detail page with approval actions

  **What to do**:
  - Create `apps/web/src/app/dashboard/requests/[id]/page.tsx`
  - Create `apps/web/src/components/requests/RequestDetail.tsx`
  - Create `apps/web/src/components/requests/RequestHistory.tsx`
  - Display all request fields in read-only format
  - Show status badge prominently
  - Show action buttons based on status and user role:
    - Draft (own): Edit, Submit, Cancel
    - Pending (admin): Start Review
    - In Review (admin): Approve, Reject
    - Rejected (own): Correct (returns to draft), Cancel
  - Show RequestHistory as timeline
  - Reject action requires reason input (inline or modal)

  **Must NOT do**:
  - Do NOT add comments feature
  - Do NOT add file attachments view
  - Do NOT add complex modal dialogs (use inline or simple prompt)

  **Parallelizable**: YES (with Task 6, after Task 3)

  **References**:

  **Pattern References**:
  - `apps/web/src/app/dashboard/page.tsx:1-17` - Page component with session
  - `apps/web/src/components/ui/card.tsx` - Card for layout
  - `apps/web/src/components/ui/button.tsx` - Action buttons

  **API/Type References**:
  - `packages/api/src/routers/request.ts` (from Task 2) - Available mutations

  **Documentation References**:
  - `docs/mvp/07-interface-ui.md` - Detail page requirements
  - `docs/mvp/06-permissoes-roles.md` - Which roles see which actions
  - `docs/mvp/05-regras-negocio.md` - Status transition rules

  **WHY Each Reference Matters**:
  - Permission matrix determines which buttons to show
  - Business rules define valid transitions

  **Acceptance Criteria**:

  **Manual Execution Verification:**
  - [ ] Using Playwright or browser: Navigate to `/dashboard/requests/[id]` (use real ID from created request)
  - [ ] All request details display correctly
  - [ ] Status badge shows correct status
  - [ ] As creator with draft request: See Submit and Cancel buttons
  - [ ] Click Submit -> Status changes to "pending"
  - [ ] As admin: See "Start Review" button
  - [ ] Click Start Review -> Status changes to "in_review"
  - [ ] See Approve and Reject buttons
  - [ ] Click Reject -> Prompted for reason -> Status changes to "rejected"
  - [ ] Request History shows all transitions

  **Evidence Required:**
  - [ ] Screenshots of detail page in each status
  - [ ] Screenshot of history timeline

  **Commit**: YES
  - Message: `feat(web): add request detail page with approval workflow`
  - Files: `apps/web/src/app/dashboard/requests/[id]/page.tsx`, `apps/web/src/components/requests/RequestDetail.tsx`, `apps/web/src/components/requests/RequestHistory.tsx`
  - Pre-commit: Manual workflow test

---

- [ ] 8. Integration Verification - Full workflow end-to-end test

  **What to do**:
  - Perform complete workflow test in browser
  - Document with screenshots
  - Verify all status transitions work
  - Verify RequestHistory is complete
  - Verify role-based access (if multiple users available)

  **Must NOT do**:
  - This is verification only, no code changes

  **Parallelizable**: NO (final task)

  **References**:

  **Documentation References**:
  - `docs/mvp/09-exemplos-uso.md` - Example workflows to follow

  **WHY Each Reference Matters**:
  - Examples doc has specific scenarios to test

  **Acceptance Criteria**:

  **Full Workflow Test:**
  - [ ] 1. Login as user
  - [ ] 2. Navigate to /dashboard/requests
  - [ ] 3. Click "New Request"
  - [ ] 4. Fill form: Title="Test Video UGC", Type=video_ugc, Description=lorem ipsum (50+ chars), Deadline=tomorrow, Priority=high
  - [ ] 5. Submit form -> Redirected to list
  - [ ] 6. Click on new request -> Detail page shows "draft" status
  - [ ] 7. Click "Submit" -> Status changes to "pending"
  - [ ] 8. Click "Start Review" -> Status changes to "in_review"
  - [ ] 9. Click "Approve" -> Status changes to "approved"
  - [ ] 10. Verify RequestHistory shows: created -> submitted -> review_started -> approved

  **Rejection Flow Test:**
  - [ ] Create another request, submit it
  - [ ] Start review, then click "Reject"
  - [ ] Enter reason (20+ chars)
  - [ ] Status changes to "rejected"
  - [ ] Click "Correct" -> Status returns to "draft"

  **Evidence Required:**
  - [ ] Screenshots documenting each step
  - [ ] Final screenshot showing RequestHistory with all transitions

  **Commit**: NO (verification only)

---

## Commit Strategy

| After Task | Message | Files | Verification |
|------------|---------|-------|--------------|
| 0 | `feat(db): add Request and RequestHistory models with enums` | request.prisma, auth.prisma | db:push |
| 1 | `feat(api): add adminProcedure for role-based authorization` | api/index.ts | TypeScript check |
| 2 | `feat(api): add request router with CRUD and status transitions` | request.ts, routers/index.ts | curl tests |
| 3 | `feat(web): add shared Zod schemas for request forms` | schemas/request.ts | TypeScript check |
| 5 | `feat(web): add request list page with status filter` | requests/page.tsx, sidebar.tsx | Browser |
| 6 | `feat(web): add request creation form page` | new/page.tsx, RequestForm.tsx | Form test |
| 7 | `feat(web): add request detail page with approval workflow` | [id]/page.tsx, components | Workflow test |

---

## Success Criteria

### Verification Commands
```bash
# Database
bun run --cwd packages/db db:push  # Expected: "Your database is now in sync"
bun run --cwd packages/db db:studio  # Expected: Opens Prisma Studio with tables

# API
curl http://localhost:3001/api/trpc/healthCheck  # Expected: "OK"
curl http://localhost:3001/api/trpc/request.list  # Expected: {"result":{"data":{"json":[...]}}}

# Full app
bun run dev  # Expected: App runs on localhost:3001
```

### Final Checklist
- [ ] All "Must Have" requirements present:
  - [ ] 6 content types selectable in form
  - [ ] 6 status states with correct transitions
  - [ ] Role-based authorization working
  - [ ] Rejection requires reason
  - [ ] RequestHistory tracks changes
  - [ ] Deadline validation (+1h minimum)
- [ ] All "Must NOT Have" items absent:
  - [ ] No file attachments
  - [ ] No notifications
  - [ ] No rich text editor
  - [ ] No autosave
  - [ ] No bulk operations
  - [ ] No advanced filtering
- [ ] Manual QA complete with screenshots
