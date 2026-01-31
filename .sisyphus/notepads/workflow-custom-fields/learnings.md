# Workflow Custom Fields - Learnings & Conventions

## Project Conventions

### Prisma Schema Patterns
- Use `@@map("table_name")` for table naming
- Use `@@index([field])` for foreign key indexes
- Relations use `fields: [fieldId], references: [id]` pattern
- Enums exported from `packages/db/src/index.ts`

### File Locations
- Schema: `packages/db/prisma/schema/*.prisma`
- DB exports: `packages/db/src/index.ts`
- Backend routers: `packages/api/src/routers/*.ts`
- Frontend hooks: `apps/web/src/hooks/*.ts`
- Frontend components: `apps/web/src/components/**/*.tsx`
- Admin pages: `apps/web/src/app/admin/**/*.tsx`

### Key Decisions
- **Unassigned fields label**: "Desagrupado" (not "Geral") - per user preference
- **Auto-save**: onBlur for all fields except WYSIWYG (dedicated save button)
- **Concurrency**: Last-write-wins
- **Permissions**: Area members edit fields of their step; creator only in DRAFT/REJECTED; admin after APPROVED
- **Validation**: Both requiredFieldsToEnter AND requiredFieldsToExit validated

## Reference Files
- `packages/db/prisma/schema/custom-fields.prisma` - ContentTypeField model
- `packages/db/prisma/schema/workflow.prisma` - WorkflowStep model
- `packages/api/src/routers/request.ts` - Request router (saveFieldValue, getFieldVersions)
- `apps/web/src/hooks/use-permissions.ts` - Existing permission hook pattern
- `apps/web/src/components/request/dynamic-field-renderer.tsx` - Field rendering patterns

## Wave 1, Task 1: Schema Implementation (2026-01-30)

### Completed Changes
- Added `assignedStepId String?` field to `ContentTypeField` model
- Added `@@index([assignedStepId])` to `ContentTypeField`
- Created `FieldValueVersion` model with:
  - `id String @id @default(uuid())`
  - `fieldValueId String` (relation to RequestFieldValue)
  - `oldValue Json?` and `newValue Json`
  - `changedById String` (relation to User)
  - `stepId String?` (optional workflow step context)
  - `createdAt DateTime @default(now())`
  - Proper indexes on fieldValueId and changedById
  - `@@map("field_value_versions")`
- Added `versions FieldValueVersion[]` relation to `RequestFieldValue`
- Added opposite relations:
  - `assignedFields ContentTypeField[]` to `WorkflowStep`
  - `fieldValueVersions FieldValueVersion[]` to `User`
- Exported `FieldValueVersion` type from `packages/db/src/index.ts`

### Key Learnings
- **Relation Validation**: Prisma requires opposite relation fields on both sides of a relation. When adding a relation from ContentTypeField → WorkflowStep, must add the reverse relation in WorkflowStep.
- **UUID vs CUID**: Used `@default(uuid())` for FieldValueVersion.id (not cuid) to match versioning pattern
- **Prisma Config**: Project uses `prisma.config.ts` with schema path as `prisma/schema` (directory, not file)
- **Prisma Commands**: Must run from `packages/db` directory where prisma.config.ts is located
- **Opposite Relations**: Both User and WorkflowStep needed opposite relation fields added to satisfy Prisma validation

### Verification Results
- ✅ `npx prisma generate` succeeded - Generated Prisma Client (7.3.0)
- ✅ `npx prisma db push` succeeded - Database now in sync with schema
- ✅ LSP diagnostics clean - No TypeScript errors in index.ts

### Files Modified
- `packages/db/prisma/schema/custom-fields.prisma` - Added assignedStepId and FieldValueVersion
- `packages/db/prisma/schema/workflow.prisma` - Added assignedFields relation
- `packages/db/prisma/schema/auth.prisma` - Added fieldValueVersions relation
- `packages/db/src/index.ts` - Exported FieldValueVersion type

## Wave 1, Task 4: Field-to-Step Assignment UI (2026-01-30)

### Completed Changes
- Added `assignToStep` procedure to content-type-field router:
  - Input: `{ fieldIds: string[], stepId: string | null }`
  - Updates all fields in fieldIds to have assignedStepId = stepId (or null to unassign)
  - Returns { updated: number }
- Updated `listByContentType` query to include assignedStep relation:
  - Added `include: { assignedStep: { select: { id: true, name: true } } }`
  - Allows UI to display step names for assigned fields
- Updated workflow page (workflow/page.tsx):
  - Added `assignedFields: string[]` to StepFormData
  - Populated assignedFields in openEditStepDialog from fields with matching assignedStepId
  - Added toggleAssignedField function for checkbox handling
  - Added assignFieldsToStepMutation for API calls
  - Updated handleStepSubmit to call assignToStep for both assign and unassign operations
  - Added "Campos deste Step" multi-select UI section with checkboxes
  - Updated Field interface to include assignedStep relation
- Updated fields page (fields/page.tsx):
  - Updated Field interface to include assignedStep: { id: string; name: string } | null
  - Added step badge column showing:
    - Brand-colored badge with step name if assigned
    - Gray "Desagrupado" badge if unassigned
  - Badge placed after field type info in the field list

### Key Implementation Details
- **API Pattern**: assignToStep uses batch update pattern - accepts array of fieldIds and single stepId
- **UI Pattern**: Multi-select checkboxes follow existing pattern from requiredFieldsToEnter/Exit
- **Badge Styling**: Uses existing Badge component with color="brand" for assigned, color="gray" for unassigned
- **State Management**: assignedFields stored as field names (not IDs) in form state for consistency with requiredFields
- **Unassign Logic**: When editing step, fields that were previously assigned but are now unchecked are unassigned (stepId set to null)

### Verification Results
- ✅ LSP diagnostics clean on all modified files
- ✅ No TypeScript errors in modified files
- ✅ Git commit successful: `feat(admin): add field-to-step assignment UI with multi-select and badges`

### Files Modified
- `packages/api/src/routers/content-type-field.ts` - Added assignToStep procedure, updated listByContentType
- `apps/web/src/app/admin/content-types/[id]/workflow/page.tsx` - Added field assignment UI and logic
- `apps/web/src/app/admin/content-types/[id]/fields/page.tsx` - Added step badge column

### Next Steps (Task 5)
- Implement field value versioning with step context
- Add step-based field visibility/grouping in request form
- Add workflow step navigation UI

## Wave 2, Task 3: requiredFieldsToEnter Validation (2026-01-30)

### Completed Changes
- Modified `advanceStep` mutation in `packages/api/src/routers/request.ts`:
  - Updated existing `requiredFieldsToExit` validation error message to clarify "exit" context
  - Added new validation block for `requiredFieldsToEnter` after fetching nextStep
  - Validation checks if nextStep has requiredFieldsToEnter array with length > 0
  - Calls `validateRequiredFields(nextStep, fieldValuesMap, "enter")` with "enter" direction
  - Throws TRPCError with code "BAD_REQUEST" if validation fails
  - Error message distinguishes "enter" vs "exit" validation failures

### Implementation Details
- **Placement**: Validation added after `getNextStep()` call and before `tx.request.update()`
- **Reuse**: Leverages existing `validateRequiredFields()` function which already supports "enter" direction
- **Error Handling**: Follows existing pattern with TRPCError BAD_REQUEST code
- **Field Values**: Uses same `fieldValuesMap` built from current request's field values
- **Conditional**: Only validates if nextStep exists and has requiredFieldsToEnter array

### Key Learnings
- **Validation Direction**: The `validateRequiredFields()` function accepts "enter" | "exit" direction parameter
- **Error Message Clarity**: Distinguishing "exit" vs "enter" in error messages helps users understand which step's requirements failed
- **Reusability**: Existing validator functions handle both directions, reducing code duplication
- **Workflow Logic**: requiredFieldsToEnter validates fields needed to ENTER the next step, not the current step

### Verification Results
- ✅ LSP diagnostics clean on request.ts - No TypeScript errors
- ✅ Git commit successful: `feat(api): validate requiredFieldsToEnter when advancing workflow step`
- ✅ File modified: `packages/api/src/routers/request.ts` (55 insertions, 17 deletions)

### Files Modified
- `packages/api/src/routers/request.ts` - Added requiredFieldsToEnter validation in advanceStep mutation

## Wave 2, Task 2: useFieldPermissions Hook (2026-01-30)

### Completed Changes
- Created `apps/web/src/hooks/use-field-permissions.ts` with:
  - `UseFieldPermissionsParams` interface matching spec
  - `UseFieldPermissionsResult` interface with editableFieldIds, requiredFieldIds, canAdvance
  - `useFieldPermissions` hook with useMemo for performance
  - Status-based logic for field editability:
    - DRAFT: all fields editable if creator
    - REJECTED: all fields editable if creator OR unassigned fields for area members
    - IN_REVIEW/PENDING: fields matching currentStepId OR unassigned fields for area members
    - APPROVED: all fields editable only for admin/super_admin
    - CANCELLED: no fields editable
  - Required fields validation from currentStep.requiredFieldsToExit
  - canAdvance flag based on all required fields being filled

### Key Implementation Details
- **useMemo Dependencies**: All params destructured in dependency array for proper memoization
- **isEmpty Helper**: Checks null, undefined, empty string, and empty arrays
- **Set Return Type**: Using Set<string> for O(1) field ID lookups
- **Status Handling**: Explicit status checks with no default case (CANCELLED implicitly handled)
- **Field Matching**: requiredFieldIds matched by field name against requiredFieldsToExit array

### Verification Results
- ✅ LSP diagnostics clean - No TypeScript errors in use-field-permissions.ts
- ✅ Git commit successful: `feat(hooks): add useFieldPermissions hook for step-based field editability`
- ✅ File created: `apps/web/src/hooks/use-field-permissions.ts` (145 lines)

### Files Modified
- `apps/web/src/hooks/use-field-permissions.ts` - New hook implementation

### Next Steps (Task 3)
- Implement field value versioning with step context
- Add step-based field visibility/grouping in request form
- Add workflow step navigation UI

## Wave 2, Task 4: saveFieldValue & getFieldVersions Endpoints (2026-01-30)

### Completed Changes
- Added `saveFieldValue` mutation to request router:
  - Input: `{ requestId, fieldId, value }` (single field, not bulk)
  - Step-based authorization via switch on RequestStatus:
    - CANCELLED: nobody
    - DRAFT: creator only
    - REJECTED: creator OR area member (via canUserApprove)
    - IN_REVIEW/PENDING: area member only + field-level check (assignedStepId must match currentStepId or be null)
    - APPROVED: admin only
  - Version tracking: creates FieldValueVersion on every save with oldValue/newValue/changedById/stepId
  - Upsert pattern: finds existing RequestFieldValue or creates new
- Added `getFieldVersions` query to request router:
  - Input: `{ requestId, fieldId }`
  - Returns version history with changedBy user info (id, name, image)
  - Ordered by createdAt desc

### Key Implementation Details
- **Prisma JSON null handling**: `oldValue: oldValue === null ? undefined : oldValue` - passing `null` directly to nullable Json fields fails; use `undefined` to skip the field
- **canUserApprove reuse**: Used existing workflow-validator function for area membership checks
- **Field-level auth**: For IN_REVIEW/PENDING, checked `field.assignedStepId !== null && field.assignedStepId !== request.currentStepId`
- **Admin check**: Used string comparison `userRole === "ADMIN" || userRole === "SUPER_ADMIN"` matching existing codebase pattern

### Verification Results
- ✅ LSP diagnostics clean on request.ts
- ✅ No tsc errors in request.ts (pre-existing errors in other files only)
- ✅ Git commit successful: `feat(api): add saveFieldValue and getFieldVersions endpoints with step-based authorization`

### Files Modified
- `packages/api/src/routers/request.ts` - Added saveFieldValue mutation and getFieldVersions query (193 insertions)
