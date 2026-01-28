# Draft: Phase 2 UI Integration

## Requirements (confirmed)

### 1. UI Integration Gaps (CRITICAL)
- `/requests/new/page.tsx` does NOT use `DynamicFieldRenderer` - has hardcoded fields
- `/requests/[id]/page.tsx` does NOT use `WorkflowActions` - has hardcoded status-based actions 
- `/requests/[id]/edit/page.tsx` does NOT use `DynamicFieldRenderer` - has hardcoded fields

### 2. Admin Navigation Gap
- `/admin/users` page exists but NO LINK in admin sidebar
- Admin layout at `apps/web/src/app/admin/layout.tsx` is missing Users link

### 3. Content Type Edit Page Missing Links
- Edit page (`/admin/content-types/[id]/edit/page.tsx`) does NOT have links to:
  - Fields config: `/admin/content-types/[id]/fields`
  - Workflow config: `/admin/content-types/[id]/workflow`

### 4. Request Creation Flow Incomplete
- Current: Creates request with hardcoded fields, no workflow initialization
- Expected: Dynamic fields rendered, field values saved, workflow initialized

### 5. API Gaps
- `request.create` does NOT handle `fieldValues` in payload
- `request.submit` should initialize workflow when transitioning from DRAFT

## Technical Decisions

### API Schema Updates
- Add `fieldValues: z.record(z.string(), z.any()).optional()` to `createInputSchema`
- In `create` mutation, save field values after request creation using same pattern as `saveFieldValues`

### Workflow Initialization Strategy
- Option A: Initialize in `create` mutation (rejected - request might stay in DRAFT)
- Option B: Initialize in `submit` mutation (selected - workflow starts when request is submitted)
- Decision: Initialize workflow in `submit` mutation if `currentStepId` is null

### DynamicFieldRenderer Integration Pattern
1. Fetch fields when contentTypeId is selected
2. Store field values in component state as `Record<string, any>`
3. Include fieldValues in create/update mutation payload
4. For edit page: Load existing field values from `request.fieldValues`

### WorkflowActions Integration Pattern  
1. Fetch user area memberships
2. Pass to WorkflowActions component with request data
3. Replace hardcoded `renderActions()` function

## Research Findings

### Existing Components (VERIFIED)
- `DynamicFieldRenderer` at `apps/web/src/components/request/dynamic-field-renderer.tsx` - fully implemented
- `WorkflowActions` at `apps/web/src/components/request/workflow-actions.tsx` - fully implemented  
- `usePermissions` at `apps/web/src/hooks/use-permissions.ts` - fully implemented

### API Patterns Observed
- `request.create` returns `{ id: string }`
- `request.getById` includes `fieldValues` with field metadata
- `contentTypeField.listByContentType` returns `{ items: Field[] }`
- User area memberships available via `user.getById` as `areaMemberships`

### Admin Pages Structure
- Fields page exists: `apps/web/src/app/admin/content-types/[id]/fields/page.tsx`
- Workflow page exists: `apps/web/src/app/admin/content-types/[id]/workflow/page.tsx`
- Users pages exist: `apps/web/src/app/admin/users/page.tsx`, `[id]/edit/page.tsx`, `new/page.tsx`

## Open Questions
- NONE - all requirements clear

## Scope Boundaries

### INCLUDE
1. DynamicFieldRenderer integration in new/edit request pages
2. WorkflowActions integration in request detail page
3. Admin sidebar Users link
4. Content type edit page links to fields/workflow
5. API updates for fieldValues in create mutation
6. Workflow initialization in submit mutation

### EXCLUDE
- New component development (all components exist)
- Schema/database changes (schema is complete)
- Backend workflow logic changes (only initialization point)
- Unit tests (no test infrastructure observed)
