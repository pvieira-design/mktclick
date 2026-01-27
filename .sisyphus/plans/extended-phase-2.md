# Extended Phase 2: Areas, Users, Custom Fields, Configurable Workflows

## TL;DR

> **Quick Summary**: Implement dynamic content management with custom fields per ContentType and configurable approval workflows. Three phases: (A) Areas/Users improvements, (B) Custom Fields system, (C) Workflow engine.
> 
> **Deliverables**:
> - Area member position change API + UI
> - User management admin module (CRUD with area assignment)
> - ContentTypeField schema + admin UI for field configuration
> - WorkflowStep schema + admin UI for workflow configuration
> - Dynamic request form that renders fields based on ContentType
> - Workflow engine that validates transitions based on step config
> - Permission hook (usePermissions) for UI gating
> 
> **Estimated Effort**: XL (40-60 hours across phases)
> **Parallel Execution**: YES - 5 waves
> **Critical Path**: Schema -> API -> Admin UI -> Request Form -> Workflow Engine

---

## Context

### Original Request
Implement Extended Phase 2 for Click Cannabis Marketing Request Management System:
1. Improve Area member management (position changes without delete/recreate)
2. Add User admin module with area assignments
3. Add Custom Fields per ContentType
4. Add Configurable Workflow steps per ContentType
5. Make permissions dynamic based on workflow config

### Interview Summary
**Key Decisions**:
- User creation: Temporary password, must change on first login
- File upload: Vercel Blob storage
- WYSIWYG: Novel editor (Notion-like, built on Tiptap)
- Workflow rejection: Rejector selects which step to return to
- Approver scope: Specific area per step (e.g., "HEAD of Design area")
- Multiple approvers: YES, any one can approve (OR logic)
- Tests: Manual verification for now

**Research Findings**:
- Existing patterns: tRPC routers in `packages/api/src/routers/`
- Admin pages: `apps/web/src/app/admin/{resource}/`
- Form pattern: useState with controlled inputs
- UI: shadcn/ui components with sonner toasts
- Auth: Better Auth with User, Session, Account models

---

## Work Objectives

### Core Objective
Transform the static request management system into a dynamic, configurable workflow platform where admins can define custom fields and approval flows per content type.

### Concrete Deliverables

**Phase 2A (Areas + Users):**
- `area.updateMemberPosition` tRPC endpoint
- Position change UI in member management page
- User router with CRUD + area assignment
- Admin user list page with filters
- Admin user create/edit pages

**Phase 2B (Custom Fields):**
- `ContentTypeField` Prisma model
- `RequestFieldValue` Prisma model
- `contentTypeField` tRPC router (CRUD)
- Admin UI for configuring fields per ContentType
- Dynamic form renderer component
- Vercel Blob upload integration
- Novel editor integration

**Phase 2C (Workflow Engine):**
- `WorkflowStep` Prisma model
- `ContentTypeAreaPermission` Prisma model
- `workflow` tRPC router (CRUD steps)
- Admin UI for configuring workflow per ContentType
- Workflow validation service
- Request transition API (refactored to use workflow config)
- `usePermissions` hook
- Dynamic action buttons based on permissions

### Definition of Done
- [ ] Admin can change member positions without remove/re-add
- [ ] Admin can create users with temporary passwords
- [ ] Admin can configure custom fields per ContentType
- [ ] Request form dynamically renders fields based on ContentType
- [ ] Admin can configure workflow steps per ContentType
- [ ] Request transitions validate required fields per step
- [ ] Only authorized users (based on area/position) can approve
- [ ] All admin pages accessible and functional

### Must Have
- Position change preserves membership ID
- Temporary password triggers "must change" flag on first login
- Field ordering is drag-and-drop or numeric
- Workflow steps are strictly linear (1 -> 2 -> ... -> N)
- Rejection allows selecting which step to return to
- Approver config supports multiple positions (OR logic)

### Must NOT Have (Guardrails)
- NO parallel/branching workflows (linear only)
- NO Ad reference field implementation (placeholder type only)
- NO email notifications (future scope)
- NO approval chains (single approval per step)
- NO test file creation (manual QA only)
- NO over-abstraction of components
- NO unnecessary utility files

---

## Verification Strategy (MANDATORY)

### Test Decision
- **Infrastructure exists**: NO (manual only for now)
- **User wants tests**: Manual-only
- **Framework**: None

### Manual QA Approach

Each TODO includes detailed verification procedures. For this project:

| Type | Verification Tool | Procedure |
|------|------------------|-----------|
| **Admin UI** | Playwright browser automation | Navigate, interact, verify state changes |
| **API** | curl / tRPC Playground | Call endpoints, verify responses |
| **Database** | Prisma Studio | Verify records created/updated correctly |
| **Form Rendering** | Browser | Create request, verify fields appear |

---

## Execution Strategy

### Parallel Execution Waves

```
Wave 1 (Start Immediately - Schema):
├── Task 1: ContentTypeField + RequestFieldValue schema
├── Task 2: WorkflowStep + ContentTypeAreaPermission schema
└── Task 3: User schema updates (mustChangePassword flag)

Wave 2 (After Wave 1 - API Layer):
├── Task 4: Area updateMemberPosition endpoint
├── Task 5: User router (CRUD + area assignment)
├── Task 6: ContentTypeField router (CRUD)
├── Task 7: WorkflowStep router (CRUD)
└── Task 8: Vercel Blob upload endpoint

Wave 3 (After Wave 2 - Admin UI Phase A):
├── Task 9: Area member position change UI
├── Task 10: User list page
├── Task 11: User create/edit pages

Wave 4 (After Wave 2 - Admin UI Phase B/C):
├── Task 12: ContentType field configuration UI
├── Task 13: ContentType workflow configuration UI
├── Task 14: Novel editor component wrapper

Wave 5 (After Waves 3+4 - Integration):
├── Task 15: Dynamic request form renderer
├── Task 16: Workflow validation service
├── Task 17: Request router refactor (workflow-based transitions)
├── Task 18: usePermissions hook
└── Task 19: Dynamic action buttons in request detail

Critical Path: Task 1 → Task 6 → Task 12 → Task 15 → Task 17
```

### Dependency Matrix

| Task | Depends On | Blocks | Can Parallelize With |
|------|------------|--------|---------------------|
| 1 | None | 6, 8, 15 | 2, 3 |
| 2 | None | 7, 16, 17 | 1, 3 |
| 3 | None | 5, 11 | 1, 2 |
| 4 | None | 9 | 5, 6, 7, 8 |
| 5 | 3 | 10, 11 | 4, 6, 7, 8 |
| 6 | 1 | 12, 15 | 4, 5, 7, 8 |
| 7 | 2 | 13, 16 | 4, 5, 6, 8 |
| 8 | 1 | 15 | 4, 5, 6, 7 |
| 9 | 4 | None | 10, 11 |
| 10 | 5 | None | 9, 11 |
| 11 | 5 | None | 9, 10 |
| 12 | 6 | 15 | 13, 14 |
| 13 | 7 | 16, 17 | 12, 14 |
| 14 | None | 15 | 12, 13 |
| 15 | 1, 6, 8, 12, 14 | 19 | 16 |
| 16 | 2, 7 | 17 | 15 |
| 17 | 2, 7, 13, 16 | 18, 19 | None |
| 18 | 17 | 19 | None |
| 19 | 15, 17, 18 | None | None |

### Agent Dispatch Summary

| Wave | Tasks | Recommended Dispatch |
|------|-------|---------------------|
| 1 | 1, 2, 3 | 3 parallel agents (schema work) |
| 2 | 4, 5, 6, 7, 8 | 5 parallel agents (API work) |
| 3 | 9, 10, 11 | 3 parallel agents (user admin UI) |
| 4 | 12, 13, 14 | 3 parallel agents (config admin UI) |
| 5 | 15, 16, 17, 18, 19 | Sequential (integration) |

---

## TODOs

### PHASE 2A: Areas + Users

---

- [ ] 1. Schema: Add mustChangePassword to User model

  **What to do**:
  - Add `mustChangePassword Boolean @default(false)` to User model in `packages/db/prisma/schema/auth.prisma`
  - Run `npm run db:push` to apply schema
  - Update User type exports if needed

  **Must NOT do**:
  - Do not modify Better Auth core tables (Session, Account, Verification)
  - Do not add email notification fields

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Single schema field addition, minimal complexity
  - **Skills**: []
    - No special skills needed for schema update
  - **Skills Evaluated but Omitted**:
    - `git-master`: Not needed for single file change

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with Tasks 2, 3)
  - **Blocks**: Task 5 (user router needs this field)
  - **Blocked By**: None

  **References**:

  **Pattern References**:
  - `packages/db/prisma/schema/auth.prisma:7-27` - Existing User model structure

  **API/Type References**:
  - None (schema only)

  **Documentation References**:
  - Prisma docs: https://www.prisma.io/docs/concepts/components/prisma-schema

  **Acceptance Criteria**:

  **Manual Execution Verification:**
  - [ ] Run: `npm run db:push`
  - [ ] Expected: "Your database is now in sync with your Prisma schema"
  - [ ] Open Prisma Studio: `npm run db:studio`
  - [ ] Navigate to User table
  - [ ] Verify `mustChangePassword` column exists with default `false`

  **Commit**: YES
  - Message: `feat(db): add mustChangePassword field to User model`
  - Files: `packages/db/prisma/schema/auth.prisma`
  - Pre-commit: `npm run db:push`

---

- [ ] 2. Schema: Add ContentTypeField and RequestFieldValue models

  **What to do**:
  - Create new file `packages/db/prisma/schema/custom-fields.prisma`
  - Add `FieldType` enum with all field types (TEXT, TEXTAREA, WYSIWYG, FILE, DATE, DATETIME, SELECT, NUMBER, CHECKBOX, URL, AD_REFERENCE)
  - Add `ContentTypeField` model with: id, contentTypeId, name, label, fieldType, required, order, options (Json), placeholder, helpText, defaultValue, isActive
  - Add `RequestFieldValue` model with: id, requestId, fieldId, value (Json)
  - Add relations to ContentType in `content-config.prisma`
  - Add relations to Request in `request.prisma`
  - Run `npm run db:push`

  **Must NOT do**:
  - Do not implement AD_REFERENCE logic (placeholder type only)
  - Do not add validation rules to schema (handled in API layer)

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Schema definition, well-documented requirements
  - **Skills**: []
    - No special skills needed
  - **Skills Evaluated but Omitted**:
    - `git-master`: Simple file creation

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with Tasks 1, 3)
  - **Blocks**: Tasks 6, 8, 15
  - **Blocked By**: None

  **References**:

  **Pattern References**:
  - `packages/db/prisma/schema/content-config.prisma:1-17` - ContentType model to add relation
  - `packages/db/prisma/schema/request.prisma:42-71` - Request model to add relation

  **Schema Design** (from interview):
  ```prisma
  enum FieldType {
    TEXT
    TEXTAREA
    WYSIWYG
    FILE
    DATE
    DATETIME
    SELECT
    NUMBER
    CHECKBOX
    URL
    AD_REFERENCE
  }

  model ContentTypeField {
    id             String      @id @default(cuid())
    contentTypeId  String
    name           String
    label          String
    fieldType      FieldType
    required       Boolean     @default(false)
    order          Int         @default(0)
    options        Json?
    placeholder    String?
    helpText       String?
    defaultValue   String?
    isActive       Boolean     @default(true)
    createdAt      DateTime    @default(now())
    updatedAt      DateTime    @updatedAt
    
    contentType    ContentType @relation(fields: [contentTypeId], references: [id], onDelete: Cascade)
    fieldValues    RequestFieldValue[]
    
    @@unique([contentTypeId, name])
    @@index([contentTypeId])
    @@map("content_type_field")
  }

  model RequestFieldValue {
    id            String            @id @default(cuid())
    requestId     String
    fieldId       String
    value         Json
    createdAt     DateTime          @default(now())
    updatedAt     DateTime          @updatedAt
    
    request       Request           @relation(fields: [requestId], references: [id], onDelete: Cascade)
    field         ContentTypeField  @relation(fields: [fieldId], references: [id])
    
    @@unique([requestId, fieldId])
    @@index([requestId])
    @@index([fieldId])
    @@map("request_field_value")
  }
  ```

  **Acceptance Criteria**:

  **Manual Execution Verification:**
  - [ ] Run: `npm run db:push`
  - [ ] Expected: Schema applied successfully
  - [ ] Open Prisma Studio: `npm run db:studio`
  - [ ] Verify `content_type_field` table exists with all columns
  - [ ] Verify `request_field_value` table exists with all columns
  - [ ] Verify unique constraint on `[contentTypeId, name]`

  **Commit**: YES
  - Message: `feat(db): add ContentTypeField and RequestFieldValue models for custom fields`
  - Files: `packages/db/prisma/schema/custom-fields.prisma`, `packages/db/prisma/schema/content-config.prisma`, `packages/db/prisma/schema/request.prisma`
  - Pre-commit: `npm run db:push`

---

- [ ] 3. Schema: Add WorkflowStep and ContentTypeAreaPermission models

  **What to do**:
  - Create new file `packages/db/prisma/schema/workflow.prisma`
  - Add `WorkflowStep` model with: id, contentTypeId, name, description, order, requiredFieldsToEnter (String[]), requiredFieldsToExit (String[]), approverAreaId, approverPositions (String[]), isActive, isFinalStep
  - Add `ContentTypeAreaPermission` model with: id, contentTypeId, areaId, canCreate
  - Add relations to ContentType and Area
  - Add `currentStepId` to Request model
  - Run `npm run db:push`

  **Must NOT do**:
  - Do not add parallel step support
  - Do not add approval chain fields
  - Do not add notification fields

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Schema definition with clear requirements
  - **Skills**: []
    - No special skills needed
  - **Skills Evaluated but Omitted**:
    - `git-master`: Simple file creation

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with Tasks 1, 2)
  - **Blocks**: Tasks 7, 16, 17
  - **Blocked By**: None

  **References**:

  **Pattern References**:
  - `packages/db/prisma/schema/area.prisma:9-22` - Area model to add relation
  - `packages/db/prisma/schema/content-config.prisma:1-17` - ContentType model to add relation
  - `packages/db/prisma/schema/request.prisma:42-71` - Request model to add currentStepId

  **Schema Design** (from interview):
  ```prisma
  model WorkflowStep {
    id                    String      @id @default(cuid())
    contentTypeId         String
    name                  String
    description           String?     @db.Text
    order                 Int
    requiredFieldsToEnter String[]
    requiredFieldsToExit  String[]
    approverAreaId        String?
    approverPositions     String[]    // ["HEAD", "COORDINATOR"]
    isActive              Boolean     @default(true)
    isFinalStep           Boolean     @default(false)
    createdAt             DateTime    @default(now())
    updatedAt             DateTime    @updatedAt
    
    contentType           ContentType @relation(fields: [contentTypeId], references: [id], onDelete: Cascade)
    approverArea          Area?       @relation(fields: [approverAreaId], references: [id])
    currentRequests       Request[]   @relation("CurrentStep")
    
    @@index([contentTypeId])
    @@index([order])
    @@map("workflow_step")
  }

  model ContentTypeAreaPermission {
    id              String      @id @default(cuid())
    contentTypeId   String
    areaId          String
    canCreate       Boolean     @default(true)
    createdAt       DateTime    @default(now())
    updatedAt       DateTime    @updatedAt
    
    contentType     ContentType @relation(fields: [contentTypeId], references: [id], onDelete: Cascade)
    area            Area        @relation(fields: [areaId], references: [id], onDelete: Cascade)
    
    @@unique([contentTypeId, areaId])
    @@index([contentTypeId])
    @@index([areaId])
    @@map("content_type_area_permission")
  }
  ```

  **Request model update:**
  ```prisma
  // Add to Request model:
  currentStepId   String?
  currentStep     WorkflowStep? @relation("CurrentStep", fields: [currentStepId], references: [id])
  ```

  **Acceptance Criteria**:

  **Manual Execution Verification:**
  - [ ] Run: `npm run db:push`
  - [ ] Expected: Schema applied successfully
  - [ ] Open Prisma Studio: `npm run db:studio`
  - [ ] Verify `workflow_step` table exists
  - [ ] Verify `content_type_area_permission` table exists
  - [ ] Verify Request table has `currentStepId` column

  **Commit**: YES
  - Message: `feat(db): add WorkflowStep and ContentTypeAreaPermission models`
  - Files: `packages/db/prisma/schema/workflow.prisma`, `packages/db/prisma/schema/area.prisma`, `packages/db/prisma/schema/content-config.prisma`, `packages/db/prisma/schema/request.prisma`
  - Pre-commit: `npm run db:push`

---

- [ ] 4. API: Add area.updateMemberPosition endpoint

  **What to do**:
  - Add `updateMemberPosition` mutation to `packages/api/src/routers/area.ts`
  - Input: `{ memberId: string, position: "HEAD" | "COORDINATOR" | "STAFF" }`
  - Validate position limits (max 1 HEAD, max 1 COORDINATOR per area)
  - If assigning new HEAD/COORDINATOR when one exists, demote existing to STAFF automatically
  - Return updated member with user info

  **Must NOT do**:
  - Do not delete and recreate member record
  - Do not add confirmation dialogs in API (UI handles this)

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Single endpoint addition following existing patterns
  - **Skills**: []
    - Existing router patterns are clear
  - **Skills Evaluated but Omitted**:
    - `git-master`: Single file change

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 2 (with Tasks 5, 6, 7, 8)
  - **Blocks**: Task 9
  - **Blocked By**: None (uses existing schema)

  **References**:

  **Pattern References**:
  - `packages/api/src/routers/area.ts:166-219` - `addMember` mutation pattern (validation, position check, transaction)
  - `packages/api/src/routers/area.ts:221-233` - `removeMember` mutation (finding member by ID)

  **API/Type References**:
  - `packages/db/prisma/schema/area.prisma:2-6` - AreaPosition enum

  **Implementation Pattern:**
  ```typescript
  updateMemberPosition: adminProcedure
    .input(z.object({
      memberId: z.string().cuid(),
      position: z.enum(["HEAD", "COORDINATOR", "STAFF"]),
    }))
    .mutation(async ({ input }) => {
      return db.$transaction(async (tx) => {
        const member = await tx.areaMember.findUnique({
          where: { id: input.memberId },
          include: { area: true },
        });
        if (!member) throw new TRPCError({ code: "NOT_FOUND" });
        
        // If promoting to HEAD/COORDINATOR, demote existing
        if (input.position !== "STAFF") {
          const existing = await tx.areaMember.findFirst({
            where: { areaId: member.areaId, position: input.position },
          });
          if (existing && existing.id !== input.memberId) {
            await tx.areaMember.update({
              where: { id: existing.id },
              data: { position: "STAFF" },
            });
          }
        }
        
        return tx.areaMember.update({
          where: { id: input.memberId },
          data: { position: input.position },
          include: { user: { select: { id: true, name: true, email: true, image: true } } },
        });
      });
    }),
  ```

  **Acceptance Criteria**:

  **Manual Execution Verification:**
  - [ ] Start dev server: `npm run dev`
  - [ ] Open tRPC playground or use curl
  - [ ] Create test: Add two members to an area (both STAFF)
  - [ ] Call `area.updateMemberPosition({ memberId: "...", position: "HEAD" })`
  - [ ] Expected: Member is now HEAD
  - [ ] Call `area.updateMemberPosition({ memberId: "other...", position: "HEAD" })`
  - [ ] Expected: Second member is HEAD, first member demoted to STAFF
  - [ ] Verify in Prisma Studio: Only one HEAD exists

  **Commit**: YES
  - Message: `feat(api): add area.updateMemberPosition endpoint with auto-demotion`
  - Files: `packages/api/src/routers/area.ts`
  - Pre-commit: None

---

- [ ] 5. API: Create user router with CRUD and area assignment

  **What to do**:
  - Create new file `packages/api/src/routers/user.ts`
  - Add endpoints:
    - `list`: List all users with filters (search, role), pagination
    - `getById`: Get user with area memberships
    - `create`: Create user with email, name, temporary password, optional area assignment
    - `update`: Update user name, role
    - `updatePassword`: Admin reset password (sets mustChangePassword=true)
    - `addToArea`: Add user to area with position
    - `removeFromArea`: Remove user from area
  - Integrate with Better Auth for password hashing
  - Register router in `packages/api/src/routers/index.ts`

  **Must NOT do**:
  - Do not implement email invitation flow
  - Do not add user deletion (soft delete via banned flag exists)
  - Do not expose password in responses

  **Recommended Agent Profile**:
  - **Category**: `ultrabrain`
    - Reason: Complex router with auth integration, multiple endpoints
  - **Skills**: []
    - Auth patterns visible in codebase
  - **Skills Evaluated but Omitted**:
    - `git-master`: Multiple related files

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 2 (with Tasks 4, 6, 7, 8)
  - **Blocks**: Tasks 10, 11
  - **Blocked By**: Task 1 (needs mustChangePassword field)

  **References**:

  **Pattern References**:
  - `packages/api/src/routers/area.ts:1-235` - Full router pattern with CRUD operations
  - `packages/api/src/routers/area.ts:166-219` - Member management pattern (reuse for area assignment)
  - `packages/api/src/routers/index.ts:1-23` - Router registration pattern

  **API/Type References**:
  - `packages/db/prisma/schema/auth.prisma:1-5` - UserRole enum
  - `packages/db/prisma/schema/auth.prisma:7-27` - User model

  **External References**:
  - Better Auth docs: https://www.better-auth.com/docs/concepts/users-accounts
  - Password hashing: Better Auth provides `hashPassword` utility

  **Implementation Structure:**
  ```typescript
  // packages/api/src/routers/user.ts
  export const userRouter = router({
    list: adminProcedure.input(z.object({
      search: z.string().optional(),
      role: z.enum(["USER", "ADMIN", "SUPER_ADMIN"]).optional(),
      page: z.number().default(1),
      limit: z.number().default(20),
    })).query(async ({ input }) => { ... }),
    
    getById: adminProcedure.input(z.object({ id: z.string() }))
      .query(async ({ input }) => { ... }),
    
    create: adminProcedure.input(z.object({
      email: z.string().email(),
      name: z.string().min(2),
      password: z.string().min(8),
      role: z.enum(["USER", "ADMIN", "SUPER_ADMIN"]).default("USER"),
      areaAssignments: z.array(z.object({
        areaId: z.string().cuid(),
        position: z.enum(["HEAD", "COORDINATOR", "STAFF"]),
      })).optional(),
    })).mutation(async ({ input }) => { ... }),
    
    update: adminProcedure.input(z.object({
      id: z.string(),
      name: z.string().min(2).optional(),
      role: z.enum(["USER", "ADMIN", "SUPER_ADMIN"]).optional(),
    })).mutation(async ({ input }) => { ... }),
    
    resetPassword: adminProcedure.input(z.object({
      id: z.string(),
      newPassword: z.string().min(8),
    })).mutation(async ({ input }) => { ... }),
  });
  ```

  **Acceptance Criteria**:

  **Manual Execution Verification:**
  - [ ] Start dev server: `npm run dev`
  - [ ] Test `user.list` - returns paginated users
  - [ ] Test `user.create` with email, name, password
  - [ ] Verify in Prisma Studio: User created with `mustChangePassword=true`
  - [ ] Test `user.create` with areaAssignments
  - [ ] Verify: User added to specified area with correct position
  - [ ] Test `user.update` - changes name and role
  - [ ] Test `user.resetPassword` - sets new password and mustChangePassword=true

  **Commit**: YES
  - Message: `feat(api): add user router with CRUD and area assignment`
  - Files: `packages/api/src/routers/user.ts`, `packages/api/src/routers/index.ts`
  - Pre-commit: None

---

- [ ] 6. API: Create contentTypeField router

  **What to do**:
  - Create new file `packages/api/src/routers/content-type-field.ts`
  - Add endpoints:
    - `listByContentType`: Get all fields for a content type (ordered)
    - `getById`: Get single field
    - `create`: Create field with all properties
    - `update`: Update field properties
    - `delete`: Soft delete (isActive=false) or hard delete if no values exist
    - `reorder`: Update order of multiple fields
  - Register router in index
  - Validate field name uniqueness per content type

  **Must NOT do**:
  - Do not implement AD_REFERENCE field logic
  - Do not add field validation rules (handled in form layer)

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Standard CRUD router following existing patterns
  - **Skills**: []
    - Patterns clear from existing routers
  - **Skills Evaluated but Omitted**:
    - None needed

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 2 (with Tasks 4, 5, 7, 8)
  - **Blocks**: Tasks 12, 15
  - **Blocked By**: Task 2 (needs ContentTypeField schema)

  **References**:

  **Pattern References**:
  - `packages/api/src/routers/content-type.ts:1-135` - ContentType CRUD pattern to follow
  - `packages/api/src/routers/area.ts:64-107` - Update with slug/name uniqueness check

  **API/Type References**:
  - `packages/db/prisma/schema/custom-fields.prisma` - ContentTypeField model (from Task 2)

  **Implementation Structure:**
  ```typescript
  export const contentTypeFieldRouter = router({
    listByContentType: publicProcedure
      .input(z.object({ contentTypeId: z.string().cuid() }))
      .query(async ({ input }) => {
        return db.contentTypeField.findMany({
          where: { contentTypeId: input.contentTypeId, isActive: true },
          orderBy: { order: "asc" },
        });
      }),
    
    create: adminProcedure.input(z.object({
      contentTypeId: z.string().cuid(),
      name: z.string().regex(/^[a-z][a-z0-9_]*$/), // camelCase/snake_case
      label: z.string().min(1),
      fieldType: z.enum(["TEXT", "TEXTAREA", "WYSIWYG", "FILE", "DATE", "DATETIME", "SELECT", "NUMBER", "CHECKBOX", "URL", "AD_REFERENCE"]),
      required: z.boolean().default(false),
      order: z.number().int().default(0),
      options: z.array(z.string()).optional(), // for SELECT
      placeholder: z.string().optional(),
      helpText: z.string().optional(),
      defaultValue: z.string().optional(),
    })).mutation(async ({ input }) => { ... }),
    
    reorder: adminProcedure.input(z.object({
      contentTypeId: z.string().cuid(),
      fieldIds: z.array(z.string().cuid()), // ordered array
    })).mutation(async ({ input }) => { ... }),
  });
  ```

  **Acceptance Criteria**:

  **Manual Execution Verification:**
  - [ ] Test `contentTypeField.create` with TEXT type
  - [ ] Verify in Prisma Studio: Field created with correct properties
  - [ ] Test `contentTypeField.create` with SELECT type and options
  - [ ] Verify: Options stored as JSON array
  - [ ] Test duplicate name for same contentType
  - [ ] Expected: Error "Field name already exists"
  - [ ] Test `contentTypeField.reorder` with new order
  - [ ] Verify: Order values updated correctly

  **Commit**: YES
  - Message: `feat(api): add contentTypeField router for custom field management`
  - Files: `packages/api/src/routers/content-type-field.ts`, `packages/api/src/routers/index.ts`
  - Pre-commit: None

---

- [ ] 7. API: Create workflow router

  **What to do**:
  - Create new file `packages/api/src/routers/workflow.ts`
  - Add endpoints:
    - `getStepsByContentType`: Get all workflow steps for a content type (ordered)
    - `getStepById`: Get single step with approver area details
    - `createStep`: Create workflow step
    - `updateStep`: Update step properties
    - `deleteStep`: Delete step (fail if requests are on this step)
    - `reorderSteps`: Update order of steps
    - `getAreaPermissions`: Get which areas can create this content type
    - `setAreaPermission`: Set/update area permission to create
  - Register router in index

  **Must NOT do**:
  - Do not add parallel step support
  - Do not add step branching logic
  - Do not validate workflow completeness (can have 0 steps)

  **Recommended Agent Profile**:
  - **Category**: `ultrabrain`
    - Reason: Complex relationships between steps, areas, positions
  - **Skills**: []
    - Patterns clear from codebase
  - **Skills Evaluated but Omitted**:
    - None needed

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 2 (with Tasks 4, 5, 6, 8)
  - **Blocks**: Tasks 13, 16, 17
  - **Blocked By**: Task 3 (needs WorkflowStep schema)

  **References**:

  **Pattern References**:
  - `packages/api/src/routers/content-type-field.ts` - Field CRUD pattern (from Task 6)
  - `packages/api/src/routers/area.ts:129-144` - Include relations in queries

  **API/Type References**:
  - `packages/db/prisma/schema/workflow.prisma` - WorkflowStep, ContentTypeAreaPermission models (from Task 3)

  **Implementation Structure:**
  ```typescript
  export const workflowRouter = router({
    getStepsByContentType: publicProcedure
      .input(z.object({ contentTypeId: z.string().cuid() }))
      .query(async ({ input }) => {
        return db.workflowStep.findMany({
          where: { contentTypeId: input.contentTypeId, isActive: true },
          include: { approverArea: true },
          orderBy: { order: "asc" },
        });
      }),
    
    createStep: adminProcedure.input(z.object({
      contentTypeId: z.string().cuid(),
      name: z.string().min(1),
      description: z.string().optional(),
      order: z.number().int(),
      requiredFieldsToEnter: z.array(z.string()).default([]),
      requiredFieldsToExit: z.array(z.string()).default([]),
      approverAreaId: z.string().cuid().optional(),
      approverPositions: z.array(z.enum(["HEAD", "COORDINATOR", "STAFF"])).default([]),
      isFinalStep: z.boolean().default(false),
    })).mutation(async ({ input }) => { ... }),
    
    deleteStep: adminProcedure.input(z.object({
      id: z.string().cuid(),
    })).mutation(async ({ input }) => {
      // Check if any requests are on this step
      const requestsOnStep = await db.request.count({
        where: { currentStepId: input.id },
      });
      if (requestsOnStep > 0) {
        throw new TRPCError({
          code: "PRECONDITION_FAILED",
          message: `Cannot delete step: ${requestsOnStep} request(s) are currently on this step`,
        });
      }
      return db.workflowStep.delete({ where: { id: input.id } });
    }),
    
    setAreaPermission: adminProcedure.input(z.object({
      contentTypeId: z.string().cuid(),
      areaId: z.string().cuid(),
      canCreate: z.boolean(),
    })).mutation(async ({ input }) => {
      return db.contentTypeAreaPermission.upsert({
        where: { contentTypeId_areaId: { contentTypeId: input.contentTypeId, areaId: input.areaId } },
        create: { contentTypeId: input.contentTypeId, areaId: input.areaId, canCreate: input.canCreate },
        update: { canCreate: input.canCreate },
      });
    }),
  });
  ```

  **Acceptance Criteria**:

  **Manual Execution Verification:**
  - [ ] Test `workflow.createStep` for a content type
  - [ ] Verify in Prisma Studio: Step created with correct properties
  - [ ] Test `workflow.createStep` with approverAreaId and positions
  - [ ] Verify: Area relation created
  - [ ] Test `workflow.deleteStep` for step with no requests
  - [ ] Expected: Step deleted
  - [ ] Create a request on a step, then try to delete step
  - [ ] Expected: Error "Cannot delete step: X request(s) on this step"
  - [ ] Test `workflow.setAreaPermission`
  - [ ] Verify: Permission record created/updated

  **Commit**: YES
  - Message: `feat(api): add workflow router for step and permission management`
  - Files: `packages/api/src/routers/workflow.ts`, `packages/api/src/routers/index.ts`
  - Pre-commit: None

---

- [ ] 8. API: Create file upload endpoint with Vercel Blob

  **What to do**:
  - Install `@vercel/blob` package
  - Create upload endpoint in `packages/api/src/routers/upload.ts`
  - Endpoints:
    - `getUploadUrl`: Generate presigned upload URL for client-side upload
    - `confirmUpload`: Confirm upload and return final URL
    - Or: `upload`: Direct server-side upload (simpler but larger payload)
  - Configure allowed file types and size limits
  - Register router in index

  **Must NOT do**:
  - Do not store files in database
  - Do not implement complex file management (delete, rename)
  - Do not add image processing/thumbnails

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Well-documented Vercel Blob API
  - **Skills**: []
    - Vercel Blob docs are clear
  - **Skills Evaluated but Omitted**:
    - `librarian`: Docs are straightforward

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 2 (with Tasks 4, 5, 6, 7)
  - **Blocks**: Task 15
  - **Blocked By**: Task 2 (FILE field type needs upload)

  **References**:

  **Pattern References**:
  - `packages/api/src/routers/area.ts:1-10` - Router setup pattern

  **External References**:
  - Vercel Blob docs: https://vercel.com/docs/storage/vercel-blob
  - Client upload: https://vercel.com/docs/storage/vercel-blob/client-upload

  **Implementation Pattern:**
  ```typescript
  import { put } from '@vercel/blob';
  
  export const uploadRouter = router({
    // Option 1: Server-side upload (simpler)
    upload: protectedProcedure
      .input(z.object({
        filename: z.string(),
        contentType: z.string(),
        // File data comes as base64 or via form data
      }))
      .mutation(async ({ input, ctx }) => {
        const blob = await put(input.filename, fileData, {
          access: 'public',
          contentType: input.contentType,
        });
        return { url: blob.url };
      }),
    
    // Option 2: Client upload token (recommended for large files)
    getUploadToken: protectedProcedure
      .input(z.object({
        filename: z.string(),
        contentType: z.string(),
      }))
      .mutation(async ({ input }) => {
        // Generate client upload token
        // Return { uploadUrl, token }
      }),
  });
  ```

  **Acceptance Criteria**:

  **Manual Execution Verification:**
  - [ ] Install: `cd packages/api && npm install @vercel/blob`
  - [ ] Set BLOB_READ_WRITE_TOKEN in `.env`
  - [ ] Test upload endpoint with small file
  - [ ] Expected: Returns Vercel Blob URL
  - [ ] Open URL in browser
  - [ ] Expected: File accessible

  **Commit**: YES
  - Message: `feat(api): add file upload endpoint with Vercel Blob`
  - Files: `packages/api/src/routers/upload.ts`, `packages/api/src/routers/index.ts`, `packages/api/package.json`
  - Pre-commit: None

---

- [ ] 9. UI: Add position change functionality to area members page

  **What to do**:
  - Modify `apps/web/src/app/admin/areas/[id]/members/page.tsx`
  - Add position dropdown/select in each member row (instead of just showing badge)
  - On change, call `area.updateMemberPosition` mutation
  - Show confirmation dialog if changing to HEAD/COORDINATOR (will demote existing)
  - Invalidate queries on success

  **Must NOT do**:
  - Do not change the overall page layout
  - Do not add bulk position change
  - Do not remove the existing delete button

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
    - Reason: UI modification with user interaction patterns
  - **Skills**: [`frontend-ui-ux`]
    - `frontend-ui-ux`: Better UI/UX decisions for interaction pattern
  - **Skills Evaluated but Omitted**:
    - `playwright`: Not needed for simple UI change

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 3 (with Tasks 10, 11)
  - **Blocks**: None
  - **Blocked By**: Task 4 (needs updateMemberPosition endpoint)

  **References**:

  **Pattern References**:
  - `apps/web/src/app/admin/areas/[id]/members/page.tsx:56-60` - Position badge display to replace with select
  - `apps/web/src/app/admin/areas/[id]/members/page.tsx:83-97` - Mutation pattern to follow
  - `apps/web/src/app/admin/areas/[id]/members/page.tsx:158-223` - Dialog pattern for confirmation

  **UI Components**:
  - `@/components/ui/select` - Already imported in file
  - `@/components/ui/alert-dialog` - For confirmation dialog

  **Implementation Pattern:**
  ```tsx
  // In member row, replace Badge with Select:
  <Select
    value={member.position}
    onValueChange={(newPosition) => handlePositionChange(member.id, newPosition)}
  >
    <SelectTrigger className="w-[140px]">
      <SelectValue />
    </SelectTrigger>
    <SelectContent>
      <SelectItem value="HEAD">Head</SelectItem>
      <SelectItem value="COORDINATOR">Coordinator</SelectItem>
      <SelectItem value="STAFF">Staff</SelectItem>
    </SelectContent>
  </Select>

  // Confirmation dialog for HEAD/COORDINATOR changes
  const handlePositionChange = (memberId: string, position: string) => {
    if (position === "HEAD" || position === "COORDINATOR") {
      // Check if position is taken, show confirmation
      setPendingChange({ memberId, position });
      setShowConfirmDialog(true);
    } else {
      updatePositionMutation.mutate({ memberId, position });
    }
  };
  ```

  **Acceptance Criteria**:

  **Manual Execution Verification:**
  - [ ] Navigate to: `http://localhost:3001/admin/areas/[id]/members`
  - [ ] Verify: Each member row shows position dropdown instead of badge
  - [ ] Change STAFF to COORDINATOR
  - [ ] Expected: Position updated, toast shows success
  - [ ] Change another member to COORDINATOR
  - [ ] Expected: Confirmation dialog appears warning about demotion
  - [ ] Confirm change
  - [ ] Expected: New member is COORDINATOR, previous is STAFF
  - [ ] Refresh page
  - [ ] Verify: Changes persisted

  **Commit**: YES
  - Message: `feat(ui): add inline position change to area members page`
  - Files: `apps/web/src/app/admin/areas/[id]/members/page.tsx`
  - Pre-commit: None

---

- [ ] 10. UI: Create user list admin page

  **What to do**:
  - Create `apps/web/src/app/admin/users/page.tsx`
  - Display table of all users with: name, email, role, area memberships count
  - Add search input (filters by name or email)
  - Add role filter dropdown
  - Add pagination
  - Add "New User" button linking to create page
  - Add row actions: Edit, View memberships

  **Must NOT do**:
  - Do not add delete user button (use ban instead via edit)
  - Do not show passwords
  - Do not add bulk actions

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
    - Reason: New admin page with data table pattern
  - **Skills**: [`frontend-ui-ux`]
    - `frontend-ui-ux`: Polish table layout and filters
  - **Skills Evaluated but Omitted**:
    - `playwright`: Not needed for page creation

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 3 (with Tasks 9, 11)
  - **Blocks**: None
  - **Blocked By**: Task 5 (needs user router)

  **References**:

  **Pattern References**:
  - `apps/web/src/app/admin/areas/page.tsx` - Admin list page pattern (table, actions, new button)
  - `apps/web/src/app/admin/content-types/page.tsx` - Alternative list pattern

  **UI Components**:
  - Table with header, body, pagination
  - Search input with debounce
  - Select for role filter
  - Badge for role display
  - Button for actions

  **Acceptance Criteria**:

  **Manual Execution Verification:**
  - [ ] Navigate to: `http://localhost:3001/admin/users`
  - [ ] Verify: Page loads with user table
  - [ ] Verify: Columns show name, email, role, memberships count
  - [ ] Type in search box
  - [ ] Expected: Table filters by name/email
  - [ ] Select role filter "ADMIN"
  - [ ] Expected: Only admin users shown
  - [ ] Click "New User" button
  - [ ] Expected: Navigates to `/admin/users/new`
  - [ ] Click Edit on a user
  - [ ] Expected: Navigates to `/admin/users/[id]/edit`

  **Commit**: YES
  - Message: `feat(ui): add user list admin page with search and filters`
  - Files: `apps/web/src/app/admin/users/page.tsx`
  - Pre-commit: None

---

- [ ] 11. UI: Create user create and edit pages

  **What to do**:
  - Create `apps/web/src/app/admin/users/new/page.tsx` - Create user form
  - Create `apps/web/src/app/admin/users/[id]/edit/page.tsx` - Edit user form
  - Create form fields: name, email, password (create only), role
  - Add area assignment section: Select area + position, add multiple
  - Show existing memberships in edit mode with remove option
  - Add form validation with Zod
  - Show success toast and redirect on save

  **Must NOT do**:
  - Do not add profile picture upload
  - Do not add email verification toggle
  - Do not add password strength meter

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
    - Reason: Form pages with validation and area management
  - **Skills**: [`frontend-ui-ux`]
    - `frontend-ui-ux`: Form layout and UX
  - **Skills Evaluated but Omitted**:
    - `playwright`: Not needed for form creation

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 3 (with Tasks 9, 10)
  - **Blocks**: None
  - **Blocked By**: Task 5 (needs user router)

  **References**:

  **Pattern References**:
  - `apps/web/src/app/admin/content-types/new/page.tsx` - Create form pattern
  - `apps/web/src/app/admin/content-types/[id]/edit/page.tsx:1-210` - Edit form pattern with data loading
  - `apps/web/src/app/admin/areas/[id]/members/page.tsx:158-223` - Area/position selection dialog pattern

  **UI Components**:
  - Card with form layout
  - Input for name, email, password
  - Select for role
  - Multi-select or list for area assignments
  - Button for save/cancel

  **Acceptance Criteria**:

  **Manual Execution Verification:**
  - [ ] Navigate to: `http://localhost:3001/admin/users/new`
  - [ ] Fill form: name, email, password, role
  - [ ] Add area assignment: select area + position
  - [ ] Click Save
  - [ ] Expected: User created, redirected to users list, toast shows success
  - [ ] Navigate to: `http://localhost:3001/admin/users/[id]/edit`
  - [ ] Verify: Form pre-filled with user data
  - [ ] Verify: Area memberships displayed
  - [ ] Change role, remove an area membership
  - [ ] Click Save
  - [ ] Expected: Changes saved, toast shows success
  - [ ] Verify in Prisma Studio: User updated correctly

  **Commit**: YES
  - Message: `feat(ui): add user create and edit admin pages`
  - Files: `apps/web/src/app/admin/users/new/page.tsx`, `apps/web/src/app/admin/users/[id]/edit/page.tsx`
  - Pre-commit: None

---

### PHASE 2B: Custom Fields

---

- [ ] 12. UI: Create ContentType field configuration page

  **What to do**:
  - Create `apps/web/src/app/admin/content-types/[id]/fields/page.tsx`
  - Display list of fields for this content type (ordered)
  - Add "Add Field" button opening dialog/drawer
  - Field form: name, label, type, required, options (for SELECT), placeholder, helpText
  - Implement drag-and-drop reordering (or up/down arrows)
  - Add edit and delete actions per field
  - Add link from content type edit page to this page

  **Must NOT do**:
  - Do not implement field preview
  - Do not add field validation rules UI
  - Do not add conditional field logic

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
    - Reason: Complex UI with field configuration and ordering
  - **Skills**: [`frontend-ui-ux`]
    - `frontend-ui-ux`: Field configuration UX is critical
  - **Skills Evaluated but Omitted**:
    - `playwright`: Not needed for UI creation

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 4 (with Tasks 13, 14)
  - **Blocks**: Task 15
  - **Blocked By**: Task 6 (needs contentTypeField router)

  **References**:

  **Pattern References**:
  - `apps/web/src/app/admin/areas/[id]/members/page.tsx` - Nested resource management pattern
  - `apps/web/src/app/admin/content-types/[id]/edit/page.tsx` - Parent page to add link from

  **Field Type Configuration:**
  | Type | Additional Config |
  |------|------------------|
  | TEXT | placeholder, maxLength |
  | TEXTAREA | placeholder, rows |
  | WYSIWYG | none |
  | FILE | allowedTypes, maxSize |
  | DATE | minDate, maxDate |
  | DATETIME | minDate, maxDate |
  | SELECT | options[] |
  | NUMBER | min, max, step |
  | CHECKBOX | defaultChecked |
  | URL | placeholder |
  | AD_REFERENCE | disabled (future) |

  **Acceptance Criteria**:

  **Manual Execution Verification:**
  - [ ] Navigate to: `http://localhost:3001/admin/content-types/[id]/fields`
  - [ ] Verify: Page shows "No fields configured" or existing fields
  - [ ] Click "Add Field"
  - [ ] Fill: name="titulo", label="Titulo", type=TEXT, required=true
  - [ ] Save field
  - [ ] Expected: Field appears in list
  - [ ] Add another field: SELECT type with options
  - [ ] Expected: Options input appears when SELECT chosen
  - [ ] Reorder fields (drag or arrows)
  - [ ] Expected: Order updated
  - [ ] Edit a field, change label
  - [ ] Expected: Label updated
  - [ ] Delete a field
  - [ ] Expected: Field removed (or marked inactive)

  **Commit**: YES
  - Message: `feat(ui): add ContentType field configuration page`
  - Files: `apps/web/src/app/admin/content-types/[id]/fields/page.tsx`, `apps/web/src/app/admin/content-types/[id]/edit/page.tsx`
  - Pre-commit: None

---

- [ ] 13. UI: Create ContentType workflow configuration page

  **What to do**:
  - Create `apps/web/src/app/admin/content-types/[id]/workflow/page.tsx`
  - Display list of workflow steps (ordered)
  - Add "Add Step" button
  - Step form: name, description, order, requiredFieldsToEnter, requiredFieldsToExit, approverAreaId, approverPositions, isFinalStep
  - Show field selection as multi-select (from content type's fields)
  - Show area selection dropdown
  - Show position checkboxes (HEAD, COORDINATOR, STAFF)
  - Add "Area Permissions" section: which areas can create this content type
  - Add edit and delete actions per step

  **Must NOT do**:
  - Do not add step branching UI
  - Do not add visual workflow diagram
  - Do not add step templates

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
    - Reason: Complex form with multiple selections
  - **Skills**: [`frontend-ui-ux`]
    - `frontend-ui-ux`: Workflow configuration UX
  - **Skills Evaluated but Omitted**:
    - `playwright`: Not needed

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 4 (with Tasks 12, 14)
  - **Blocks**: Tasks 16, 17
  - **Blocked By**: Task 7 (needs workflow router)

  **References**:

  **Pattern References**:
  - `apps/web/src/app/admin/content-types/[id]/fields/page.tsx` - Similar nested config pattern (from Task 12)
  - `apps/web/src/app/admin/areas/[id]/members/page.tsx` - List with actions pattern

  **UI Components**:
  - Step card/row with order number
  - Multi-select for fields (use combobox or checkbox list)
  - Select for approver area
  - Checkbox group for approver positions
  - Area permission toggle list

  **Acceptance Criteria**:

  **Manual Execution Verification:**
  - [ ] Navigate to: `http://localhost:3001/admin/content-types/[id]/workflow`
  - [ ] Verify: Page shows "No workflow steps" or existing steps
  - [ ] Click "Add Step"
  - [ ] Fill: name="Criacao", order=1, select required fields
  - [ ] Select approver area="Design", positions=["HEAD", "COORDINATOR"]
  - [ ] Save step
  - [ ] Expected: Step appears in list
  - [ ] Add second step as final step
  - [ ] Expected: Final step badge shown
  - [ ] In Area Permissions section, enable "Marketing" area
  - [ ] Expected: Permission saved
  - [ ] Edit step, change required fields
  - [ ] Expected: Changes saved
  - [ ] Delete step (no requests on it)
  - [ ] Expected: Step removed

  **Commit**: YES
  - Message: `feat(ui): add ContentType workflow configuration page`
  - Files: `apps/web/src/app/admin/content-types/[id]/workflow/page.tsx`, `apps/web/src/app/admin/content-types/[id]/edit/page.tsx`
  - Pre-commit: None

---

- [ ] 14. Component: Create Novel editor wrapper

  **What to do**:
  - Install Novel package: `npm install novel`
  - Create reusable component `apps/web/src/components/ui/novel-editor.tsx`
  - Props: value, onChange, placeholder, disabled
  - Integrate with form state (controlled component)
  - Basic toolbar: headings, bold, italic, lists, links
  - Export as named export

  **Must NOT do**:
  - Do not add image upload to editor (use separate FILE field)
  - Do not add collaborative editing
  - Do not add custom extensions

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
    - Reason: Component integration with third-party library
  - **Skills**: [`frontend-ui-ux`]
    - `frontend-ui-ux`: Editor UX considerations
  - **Skills Evaluated but Omitted**:
    - `librarian`: Novel docs are straightforward

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 4 (with Tasks 12, 13)
  - **Blocks**: Task 15
  - **Blocked By**: None

  **References**:

  **External References**:
  - Novel docs: https://novel.sh/docs
  - Novel GitHub: https://github.com/steven-tey/novel

  **Pattern References**:
  - `apps/web/src/components/ui/` - Existing UI component patterns

  **Implementation Pattern:**
  ```tsx
  "use client";
  
  import { Editor } from "novel";
  import { useState, useEffect } from "react";
  
  interface NovelEditorProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    disabled?: boolean;
  }
  
  export function NovelEditor({ value, onChange, placeholder, disabled }: NovelEditorProps) {
    return (
      <Editor
        defaultValue={value}
        onUpdate={(editor) => {
          onChange(editor?.getHTML() || "");
        }}
        disableLocalStorage
        className="min-h-[200px] border rounded-md"
      />
    );
  }
  ```

  **Acceptance Criteria**:

  **Manual Execution Verification:**
  - [ ] Install: `cd apps/web && npm install novel`
  - [ ] Create component file
  - [ ] Import in a test page or Storybook
  - [ ] Verify: Editor renders with toolbar
  - [ ] Type text, apply bold
  - [ ] Verify: onChange called with HTML content
  - [ ] Set initial value
  - [ ] Verify: Content displayed correctly

  **Commit**: YES
  - Message: `feat(ui): add Novel WYSIWYG editor component`
  - Files: `apps/web/src/components/ui/novel-editor.tsx`, `apps/web/package.json`
  - Pre-commit: None

---

### PHASE 2C: Workflow Engine

---

- [ ] 15. Component: Create dynamic request form renderer

  **What to do**:
  - Create `apps/web/src/components/request/dynamic-field-renderer.tsx`
  - Props: fields (ContentTypeField[]), values (Record<string, any>), onChange, disabled
  - Render appropriate input for each field type:
    - TEXT → Input
    - TEXTAREA → Textarea
    - WYSIWYG → NovelEditor
    - FILE → File input with Vercel Blob upload
    - DATE → DatePicker
    - DATETIME → DateTimePicker
    - SELECT → Select with options
    - NUMBER → Input type=number
    - CHECKBOX → Checkbox
    - URL → Input type=url
    - AD_REFERENCE → Disabled placeholder
  - Show required indicator, help text
  - Integrate with request create/edit forms

  **Must NOT do**:
  - Do not add field-level validation (handled by Zod in form)
  - Do not add conditional field display
  - Do not add field grouping

  **Recommended Agent Profile**:
  - **Category**: `ultrabrain`
    - Reason: Complex component with multiple field types and integrations
  - **Skills**: [`frontend-ui-ux`]
    - `frontend-ui-ux`: Form UX for diverse field types
  - **Skills Evaluated but Omitted**:
    - `playwright`: Testing comes later

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 5 (with Task 16)
  - **Blocks**: Task 19
  - **Blocked By**: Tasks 1, 6, 8, 12, 14

  **References**:

  **Pattern References**:
  - `apps/web/src/components/ui/` - UI component imports
  - `apps/web/src/components/ui/novel-editor.tsx` - Novel editor (from Task 14)

  **API/Type References**:
  - `packages/db/prisma/schema/custom-fields.prisma` - FieldType enum, ContentTypeField model

  **Implementation Pattern:**
  ```tsx
  interface DynamicFieldRendererProps {
    fields: ContentTypeField[];
    values: Record<string, any>;
    onChange: (fieldName: string, value: any) => void;
    disabled?: boolean;
  }
  
  export function DynamicFieldRenderer({ fields, values, onChange, disabled }: DynamicFieldRendererProps) {
    const renderField = (field: ContentTypeField) => {
      switch (field.fieldType) {
        case "TEXT":
          return <Input value={values[field.name] || ""} onChange={(e) => onChange(field.name, e.target.value)} />;
        case "SELECT":
          return (
            <Select value={values[field.name]} onValueChange={(v) => onChange(field.name, v)}>
              {field.options?.map((opt) => <SelectItem key={opt} value={opt}>{opt}</SelectItem>)}
            </Select>
          );
        // ... other types
      }
    };
    
    return (
      <div className="space-y-4">
        {fields.map((field) => (
          <div key={field.id} className="space-y-2">
            <Label>{field.label}{field.required && <span className="text-red-500">*</span>}</Label>
            {renderField(field)}
            {field.helpText && <p className="text-sm text-muted-foreground">{field.helpText}</p>}
          </div>
        ))}
      </div>
    );
  }
  ```

  **Acceptance Criteria**:

  **Manual Execution Verification:**
  - [ ] Configure fields for a content type (TEXT, SELECT, WYSIWYG, FILE)
  - [ ] Navigate to request create form for that content type
  - [ ] Verify: All configured fields render correctly
  - [ ] Fill TEXT field
  - [ ] Expected: Value captured
  - [ ] Select option in SELECT field
  - [ ] Expected: Value captured
  - [ ] Type in WYSIWYG field
  - [ ] Expected: HTML content captured
  - [ ] Upload file in FILE field
  - [ ] Expected: File uploaded, URL captured
  - [ ] Submit form
  - [ ] Verify in Prisma Studio: RequestFieldValue records created with correct values

  **Commit**: YES
  - Message: `feat(ui): add dynamic field renderer for request forms`
  - Files: `apps/web/src/components/request/dynamic-field-renderer.tsx`
  - Pre-commit: None

---

- [ ] 16. Service: Create workflow validation service

  **What to do**:
  - Create `packages/api/src/services/workflow-validator.ts`
  - Functions:
    - `canTransitionToStep(request, targetStep, fieldValues)`: Check if required fields are filled
    - `canUserApprove(userId, step)`: Check if user has permission to approve at this step
    - `getNextStep(contentTypeId, currentStepOrder)`: Get next step in workflow
    - `getPreviousSteps(contentTypeId, currentStepOrder)`: Get steps user can return to on rejection
    - `validateRequiredFields(step, fieldValues, direction)`: Validate entry/exit fields
  - Export as module for use in request router

  **Must NOT do**:
  - Do not add caching (keep it simple)
  - Do not add workflow versioning
  - Do not add approval history tracking (use RequestHistory)

  **Recommended Agent Profile**:
  - **Category**: `ultrabrain`
    - Reason: Business logic service with complex validation
  - **Skills**: []
    - Logic is domain-specific, no special skills needed
  - **Skills Evaluated but Omitted**:
    - None needed

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 5 (with Task 15)
  - **Blocks**: Task 17
  - **Blocked By**: Tasks 2, 7

  **References**:

  **Pattern References**:
  - `packages/api/src/routers/request.ts:232-276` - Existing validation patterns in submit/transition

  **API/Type References**:
  - `packages/db/prisma/schema/workflow.prisma` - WorkflowStep model
  - `packages/db/prisma/schema/area.prisma:2-6` - AreaPosition enum

  **Implementation Pattern:**
  ```typescript
  // packages/api/src/services/workflow-validator.ts
  import db from "@marketingclickcannabis/db";
  
  export async function canUserApprove(userId: string, step: WorkflowStep): Promise<boolean> {
    if (!step.approverAreaId || step.approverPositions.length === 0) {
      return false; // No approvers configured
    }
    
    const membership = await db.areaMember.findFirst({
      where: {
        userId,
        areaId: step.approverAreaId,
        position: { in: step.approverPositions as AreaPosition[] },
      },
    });
    
    return !!membership;
  }
  
  export async function validateRequiredFields(
    step: WorkflowStep,
    fieldValues: Record<string, any>,
    direction: "enter" | "exit"
  ): Promise<{ valid: boolean; missingFields: string[] }> {
    const requiredFields = direction === "enter" 
      ? step.requiredFieldsToEnter 
      : step.requiredFieldsToExit;
    
    const missingFields = requiredFields.filter(
      (fieldName) => !fieldValues[fieldName] || fieldValues[fieldName] === ""
    );
    
    return { valid: missingFields.length === 0, missingFields };
  }
  
  export async function getNextStep(contentTypeId: string, currentOrder: number): Promise<WorkflowStep | null> {
    return db.workflowStep.findFirst({
      where: { contentTypeId, order: { gt: currentOrder }, isActive: true },
      orderBy: { order: "asc" },
    });
  }
  ```

  **Acceptance Criteria**:

  **Manual Execution Verification:**
  - [ ] Create test workflow with 3 steps
  - [ ] Step 1: requiredFieldsToExit=["titulo"]
  - [ ] Step 2: approverAreaId="design", approverPositions=["HEAD"]
  - [ ] Test `validateRequiredFields` with empty titulo
  - [ ] Expected: { valid: false, missingFields: ["titulo"] }
  - [ ] Test `canUserApprove` with user who is HEAD of Design
  - [ ] Expected: true
  - [ ] Test `canUserApprove` with user who is STAFF of Design
  - [ ] Expected: false
  - [ ] Test `getNextStep` from step 1
  - [ ] Expected: Returns step 2

  **Commit**: YES
  - Message: `feat(api): add workflow validation service`
  - Files: `packages/api/src/services/workflow-validator.ts`
  - Pre-commit: None

---

- [ ] 17. API: Refactor request router to use workflow engine

  **What to do**:
  - Modify `packages/api/src/routers/request.ts`
  - Update `create` to:
    - Check if user's area can create this content type
    - Set currentStepId to first workflow step
    - Store custom field values in RequestFieldValue
  - Update `submit` to:
    - Validate required fields to exit current step
    - Move to next step
  - Add new `advanceStep` mutation:
    - Validate user can approve current step
    - Validate required fields to exit
    - Move to next step (or mark complete if final)
  - Add new `rejectToStep` mutation:
    - Validate user can approve current step
    - Require rejection reason
    - Require target step selection (from previous steps)
    - Move request to target step
  - Update `getById` to include current step info

  **Must NOT do**:
  - Do not remove existing hardcoded transitions (keep for backward compatibility or remove carefully)
  - Do not add email notifications
  - Do not add approval comments (just rejection reason)

  **Recommended Agent Profile**:
  - **Category**: `ultrabrain`
    - Reason: Complex refactor with business logic integration
  - **Skills**: []
    - Domain logic is specific to this project
  - **Skills Evaluated but Omitted**:
    - `git-master`: Single file, but complex changes

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Sequential
  - **Blocks**: Tasks 18, 19
  - **Blocked By**: Tasks 2, 7, 13, 16

  **References**:

  **Pattern References**:
  - `packages/api/src/routers/request.ts:136-175` - Create mutation pattern
  - `packages/api/src/routers/request.ts:232-276` - Submit mutation pattern
  - `packages/api/src/routers/request.ts:366-414` - Reject mutation pattern
  - `packages/api/src/services/workflow-validator.ts` - Validation service (from Task 16)

  **Implementation Pattern:**
  ```typescript
  // New advanceStep mutation
  advanceStep: protectedProcedure
    .input(z.object({ id: z.string().cuid() }))
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;
      
      return db.$transaction(async (tx) => {
        const request = await tx.request.findUnique({
          where: { id: input.id },
          include: { currentStep: true, fieldValues: true },
        });
        if (!request || !request.currentStep) throw new TRPCError({ code: "NOT_FOUND" });
        
        // Check user can approve
        const canApprove = await canUserApprove(userId, request.currentStep);
        if (!canApprove) throw new TRPCError({ code: "FORBIDDEN", message: "Not authorized to approve" });
        
        // Validate required fields to exit
        const fieldValuesMap = Object.fromEntries(request.fieldValues.map(fv => [fv.fieldId, fv.value]));
        const validation = await validateRequiredFields(request.currentStep, fieldValuesMap, "exit");
        if (!validation.valid) {
          throw new TRPCError({ 
            code: "BAD_REQUEST", 
            message: `Missing required fields: ${validation.missingFields.join(", ")}` 
          });
        }
        
        // Get next step
        if (request.currentStep.isFinalStep) {
          // Mark as complete
          return tx.request.update({
            where: { id: input.id },
            data: { status: "APPROVED", currentStepId: null },
          });
        }
        
        const nextStep = await getNextStep(request.contentTypeId, request.currentStep.order);
        if (!nextStep) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "No next step found" });
        
        return tx.request.update({
          where: { id: input.id },
          data: { currentStepId: nextStep.id },
        });
      });
    }),
  
  // New rejectToStep mutation
  rejectToStep: protectedProcedure
    .input(z.object({
      id: z.string().cuid(),
      reason: z.string().min(10),
      targetStepId: z.string().cuid(),
    }))
    .mutation(async ({ ctx, input }) => {
      // Similar pattern: validate approval permission, validate target step is earlier
      // Update currentStepId to targetStepId, set rejectionReason
    }),
  ```

  **Acceptance Criteria**:

  **Manual Execution Verification:**
  - [ ] Configure workflow for a content type (3 steps)
  - [ ] Create request as user in permitted area
  - [ ] Expected: Request created with currentStepId = step 1
  - [ ] Fill required fields, call advanceStep
  - [ ] Expected: Request moves to step 2
  - [ ] As approver of step 2, call advanceStep
  - [ ] Expected: Request moves to step 3
  - [ ] As approver of step 3, call advanceStep
  - [ ] Expected: Request status = APPROVED
  - [ ] Create new request, advance to step 2
  - [ ] Call rejectToStep with targetStepId = step 1
  - [ ] Expected: Request back at step 1 with rejection reason
  - [ ] Try to approve without permission
  - [ ] Expected: Error "Not authorized to approve"

  **Commit**: YES
  - Message: `feat(api): refactor request router to use workflow engine`
  - Files: `packages/api/src/routers/request.ts`
  - Pre-commit: None

---

- [ ] 18. Hook: Create usePermissions hook

  **What to do**:
  - Create `apps/web/src/hooks/use-permissions.ts`
  - Props: request (with current step), userId
  - Returns:
    - `canAdvance`: boolean - user can approve current step
    - `canReject`: boolean - same as canAdvance (rejecter = approver)
    - `canEdit`: boolean - user is creator and request is at step 1 (or rejected)
    - `canCancel`: boolean - user is creator and not completed
    - `availableActions`: string[] - list of available action names
  - Fetch user's area memberships and compare with step config
  - Export as named export

  **Must NOT do**:
  - Do not cache permissions (keep reactive)
  - Do not add role-based overrides (SUPER_ADMIN bypass etc.)
  - Do not add permission explanations

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Hook following existing patterns
  - **Skills**: []
    - Logic is straightforward
  - **Skills Evaluated but Omitted**:
    - None needed

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Sequential
  - **Blocks**: Task 19
  - **Blocked By**: Task 17

  **References**:

  **Pattern References**:
  - `apps/web/src/hooks/` - Existing hook patterns (if any)
  - `apps/web/src/utils/trpc.ts` - tRPC client for fetching data

  **Implementation Pattern:**
  ```typescript
  import { trpc } from "@/utils/trpc";
  
  interface UsePermissionsProps {
    request: RequestWithStep;
    userId: string;
  }
  
  export function usePermissions({ request, userId }: UsePermissionsProps) {
    // Fetch user's area memberships
    const { data: userAreas } = useQuery(
      trpc.user.getById.queryOptions({ id: userId })
    );
    
    const canAdvance = useMemo(() => {
      if (!request.currentStep || !userAreas) return false;
      const { approverAreaId, approverPositions } = request.currentStep;
      if (!approverAreaId) return false;
      
      return userAreas.areaMemberships.some(
        (m) => m.areaId === approverAreaId && approverPositions.includes(m.position)
      );
    }, [request.currentStep, userAreas]);
    
    const canEdit = request.createdById === userId && 
      (request.currentStep?.order === 1 || request.status === "REJECTED");
    
    const canCancel = request.createdById === userId && request.status !== "APPROVED";
    
    return { canAdvance, canReject: canAdvance, canEdit, canCancel };
  }
  ```

  **Acceptance Criteria**:

  **Manual Execution Verification:**
  - [ ] Import hook in request detail page
  - [ ] Log permissions for current user
  - [ ] As non-approver: canAdvance = false
  - [ ] As approver of current step: canAdvance = true
  - [ ] As request creator at step 1: canEdit = true
  - [ ] As different user: canEdit = false
  - [ ] Verify permissions update when request state changes

  **Commit**: YES
  - Message: `feat(ui): add usePermissions hook for workflow-based authorization`
  - Files: `apps/web/src/hooks/use-permissions.ts`
  - Pre-commit: None

---

- [ ] 19. UI: Add dynamic action buttons to request detail page

  **What to do**:
  - Modify request detail page (find existing or create)
  - Import usePermissions hook
  - Show action buttons based on permissions:
    - "Advance" button if canAdvance
    - "Reject" button if canReject (opens dialog with reason + step selection)
    - "Edit" button if canEdit
    - "Cancel" button if canCancel
  - Show current step info (name, description, who can approve)
  - Show workflow progress indicator (step 1 of 3, etc.)
  - Disable buttons during mutation
  - Show success/error toasts

  **Must NOT do**:
  - Do not add approval comments
  - Do not add request history timeline (keep existing if any)
  - Do not add step-by-step wizard UI

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
    - Reason: UI with conditional rendering and dialogs
  - **Skills**: [`frontend-ui-ux`]
    - `frontend-ui-ux`: Action button UX
  - **Skills Evaluated but Omitted**:
    - `playwright`: Testing later

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Sequential (final task)
  - **Blocks**: None
  - **Blocked By**: Tasks 15, 17, 18

  **References**:

  **Pattern References**:
  - `apps/web/src/app/admin/areas/[id]/members/page.tsx:158-223` - Dialog pattern
  - `apps/web/src/hooks/use-permissions.ts` - Permissions hook (from Task 18)

  **UI Components**:
  - Button group for actions
  - AlertDialog for reject confirmation
  - Select for target step in rejection
  - Textarea for rejection reason
  - Badge/Progress for workflow step indicator

  **Implementation Pattern:**
  ```tsx
  const { canAdvance, canReject, canEdit, canCancel } = usePermissions({ request, userId });
  
  // Workflow progress indicator
  <div className="flex items-center gap-2">
    <span className="text-sm text-muted-foreground">
      Step {request.currentStep?.order} of {totalSteps}
    </span>
    <Badge>{request.currentStep?.name}</Badge>
  </div>
  
  // Action buttons
  <div className="flex gap-2">
    {canEdit && <Button variant="outline" onClick={handleEdit}>Edit</Button>}
    {canAdvance && <Button onClick={handleAdvance}>Approve & Advance</Button>}
    {canReject && (
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button variant="destructive">Reject</Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          {/* Reason textarea + step selection */}
        </AlertDialogContent>
      </AlertDialog>
    )}
    {canCancel && <Button variant="ghost" onClick={handleCancel}>Cancel</Button>}
  </div>
  ```

  **Acceptance Criteria**:

  **Manual Execution Verification:**
  - [ ] Navigate to request detail page
  - [ ] Verify: Current step info displayed
  - [ ] Verify: Workflow progress shown (step X of Y)
  - [ ] As non-approver: Only Cancel button visible (if creator)
  - [ ] As approver: Approve and Reject buttons visible
  - [ ] Click Approve
  - [ ] Expected: Request advances, toast shows success
  - [ ] Click Reject
  - [ ] Expected: Dialog opens with reason input and step selector
  - [ ] Fill reason, select target step, confirm
  - [ ] Expected: Request moves to target step, toast shows success
  - [ ] Refresh page
  - [ ] Verify: Buttons reflect new state

  **Commit**: YES
  - Message: `feat(ui): add dynamic action buttons based on workflow permissions`
  - Files: `apps/web/src/app/requests/[id]/page.tsx` (or similar)
  - Pre-commit: None

---

## Commit Strategy

| After Task(s) | Message | Key Files | Phase |
|---------------|---------|-----------|-------|
| 1 | `feat(db): add mustChangePassword field to User model` | auth.prisma | 2A |
| 2 | `feat(db): add ContentTypeField and RequestFieldValue models` | custom-fields.prisma | 2A |
| 3 | `feat(db): add WorkflowStep and ContentTypeAreaPermission models` | workflow.prisma | 2A |
| 4 | `feat(api): add area.updateMemberPosition endpoint` | area.ts | 2A |
| 5 | `feat(api): add user router with CRUD and area assignment` | user.ts, index.ts | 2A |
| 6 | `feat(api): add contentTypeField router` | content-type-field.ts | 2B |
| 7 | `feat(api): add workflow router` | workflow.ts | 2C |
| 8 | `feat(api): add file upload endpoint with Vercel Blob` | upload.ts | 2B |
| 9 | `feat(ui): add inline position change to area members` | members/page.tsx | 2A |
| 10 | `feat(ui): add user list admin page` | users/page.tsx | 2A |
| 11 | `feat(ui): add user create and edit pages` | users/new, users/[id]/edit | 2A |
| 12 | `feat(ui): add ContentType field configuration page` | fields/page.tsx | 2B |
| 13 | `feat(ui): add ContentType workflow configuration page` | workflow/page.tsx | 2C |
| 14 | `feat(ui): add Novel WYSIWYG editor component` | novel-editor.tsx | 2B |
| 15 | `feat(ui): add dynamic field renderer for request forms` | dynamic-field-renderer.tsx | 2B |
| 16 | `feat(api): add workflow validation service` | workflow-validator.ts | 2C |
| 17 | `feat(api): refactor request router for workflow engine` | request.ts | 2C |
| 18 | `feat(ui): add usePermissions hook` | use-permissions.ts | 2C |
| 19 | `feat(ui): add dynamic action buttons to request detail` | requests/[id]/page.tsx | 2C |

---

## Success Criteria

### Verification Commands
```bash
# Schema applied
npm run db:push  # Should complete without errors

# Server running
npm run dev  # Should start without errors

# Prisma Studio accessible
npm run db:studio  # Should open UI
```

### Final Checklist

**Phase 2A (Areas + Users):**
- [ ] Admin can change member position without removing member
- [ ] Admin can create new users with temporary password
- [ ] Admin can assign users to areas during creation
- [ ] Admin can change user roles
- [ ] User list page shows all users with filters

**Phase 2B (Custom Fields):**
- [ ] Admin can configure custom fields per content type
- [ ] Field types work: TEXT, TEXTAREA, WYSIWYG, FILE, SELECT, DATE, NUMBER, CHECKBOX, URL
- [ ] Request form dynamically renders configured fields
- [ ] Field values saved to RequestFieldValue table
- [ ] File upload works via Vercel Blob

**Phase 2C (Workflow Engine):**
- [ ] Admin can configure workflow steps per content type
- [ ] Steps have required field configuration
- [ ] Steps have approver configuration (area + positions)
- [ ] Request advances through workflow when approved
- [ ] Request can be rejected to any previous step
- [ ] Only authorized users can approve (based on area membership + position)
- [ ] UI shows correct action buttons based on permissions
