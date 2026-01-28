# Draft: Extended Phase 2 - Areas, Users, Custom Fields, Configurable Flows

## Requirements (confirmed)

### 1. Areas Module Improvements
- Assign HEAD (max 1), COORDINATOR (max 1), STAFF (unlimited) per area
- UI to change member position WITHOUT delete+recreate
- Better user search/selection in add member dialog

### 2. Users Module (NEW)
- Admin page to list all users with filters
- Create user with area assignment and position
- Change user's global role (USER, ADMIN, SUPER_ADMIN)
- View user's area memberships

### 3. Custom Fields Module (NEW)
- Field types needed:
  - Text (short input)
  - Textarea (long text)
  - WYSIWYG Editor (rich text for blog posts)
  - File Upload (images, videos, PDFs)
  - Date/Datetime picker
  - Select/Dropdown (predefined options)
  - Number
  - Checkbox (yes/no)
  - URL/Link
  - Reference to Ad (FUTURE - placeholder only)
- Admin configures which fields each ContentType has
- Field properties: name, label, type, required, order, options (for select), placeholder, helpText

### 4. Configurable Flow/Workflow Module (NEW)
- Each ContentType has its own workflow
- Linear steps only (Step 1 -> Step 2 -> ... -> Complete)
- Per step configuration:
  - Name, description, order
  - Required fields to ENTER this step
  - Required fields to EXIT/complete this step
  - Who can approve (by position: HEAD/COORDINATOR/STAFF, or specific area, or specific user)
- Which areas can CREATE requests of this ContentType

### 5. Permissions
- API validates based on workflow configuration
- UI shows/hides buttons based on user's position and current step
- Hook usePermissions uses flow config

## Technical Decisions

### Schema Design Decisions

**ContentTypeField Model:**
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
  AD_REFERENCE  // Future
}

model ContentTypeField {
  id             String      @id @default(cuid())
  contentTypeId  String
  name           String      // internal identifier
  label          String      // display label
  fieldType      FieldType
  required       Boolean     @default(false)
  order          Int         @default(0)
  options        Json?       // for SELECT: ["Option A", "Option B"]
  placeholder    String?
  helpText       String?
  defaultValue   String?
  isActive       Boolean     @default(true)
  
  contentType    ContentType @relation(fields: [contentTypeId], references: [id], onDelete: Cascade)
  
  @@unique([contentTypeId, name])
  @@index([contentTypeId])
}
```

**WorkflowStep Model (UPDATED based on decisions):**
```prisma
model WorkflowStep {
  id              String      @id @default(cuid())
  contentTypeId   String
  name            String
  description     String?
  order           Int
  requiredFieldsToEnter  String[]   // field names required to ENTER this step
  requiredFieldsToExit   String[]   // field names required to EXIT this step
  
  // Approver configuration - WHO can approve at this step
  // Multiple positions allowed (any one can approve)
  approverAreaId     String?    // Specific area whose members can approve
  approverPositions  String[]   // ["HEAD", "COORDINATOR"] - positions allowed
  
  isActive        Boolean    @default(true)
  isFinalStep     Boolean    @default(false)  // Mark completion step
  
  contentType     ContentType @relation(fields: [contentTypeId], references: [id], onDelete: Cascade)
  approverArea    Area?       @relation(fields: [approverAreaId], references: [id])
  
  @@index([contentTypeId])
  @@index([order])
}
```

**RequestFieldValue Model:**
```prisma
model RequestFieldValue {
  id            String    @id @default(cuid())
  requestId     String
  fieldId       String
  value         Json      // flexible storage for any field type
  
  request       Request   @relation(fields: [requestId], references: [id], onDelete: Cascade)
  field         ContentTypeField @relation(fields: [fieldId], references: [id])
  
  @@unique([requestId, fieldId])
  @@index([requestId])
  @@index([fieldId])
}
```

**ContentTypeAreaPermission Model:**
```prisma
model ContentTypeAreaPermission {
  id              String      @id @default(cuid())
  contentTypeId   String
  areaId          String
  canCreate       Boolean     @default(true)
  
  contentType     ContentType @relation(fields: [contentTypeId], references: [id], onDelete: Cascade)
  area            Area        @relation(fields: [areaId], references: [id], onDelete: Cascade)
  
  @@unique([contentTypeId, areaId])
  @@index([contentTypeId])
  @@index([areaId])
}
```

**Request Model Updates:**
```prisma
model Request {
  // ... existing fields ...
  currentStepId   String?    // Track which workflow step request is on
  
  // New relations
  currentStep     WorkflowStep? @relation(fields: [currentStepId], references: [id])
  fieldValues     RequestFieldValue[]
}
```

## Research Findings

### Codebase Patterns Found:

1. **Prisma Schema**: Split into multiple files under `packages/db/prisma/schema/`
2. **tRPC Routers**: Located in `packages/api/src/routers/`
3. **Admin Pages**: Follow pattern `apps/web/src/app/admin/{resource}/...`
4. **Form Pattern**: Uses useState hooks with controlled inputs
5. **Mutation Pattern**: Uses `useMutation` with `trpc.{router}.{method}.mutationOptions`
6. **Query Invalidation**: Uses `queryClient.invalidateQueries`
7. **UI Components**: shadcn/ui (Button, Input, Card, Select, Dialog, etc.)
8. **Toast Notifications**: Uses `sonner` via `toast.success/error`

### Existing Code References:
- Area router with member management: `packages/api/src/routers/area.ts`
- Request router with status transitions: `packages/api/src/routers/request.ts`
- Admin member management page: `apps/web/src/app/admin/areas/[id]/members/page.tsx`
- Content type edit page pattern: `apps/web/src/app/admin/content-types/[id]/edit/page.tsx`

## Decisions Made (User Confirmed)

### 1. User Creation Flow
- **Decision**: Temporary password approach
- Admin creates user with email/name and temporary password
- User must change password on first login
- Integrate with Better Auth password reset flow

### 2. File Upload Storage
- **Decision**: Vercel Blob
- Use `@vercel/blob` package for file storage
- Simple integration for production

### 3. WYSIWYG Editor
- **Decision**: Novel editor
- Notion-like experience
- Built on Tiptap (modern, extensible)

### 4. Workflow Rejection Behavior
- **Decision**: CUSTOM step selection on rejection
- When rejecting, reviewer selects:
  1. Rejection reason (text)
  2. Which step to return to (dropdown of previous steps)
- NOT fixed to previous step or start

### 5. Approver Scope
- **Decision**: HEAD/COORDINATOR of SPECIFIC AREA per step
- Each step configures which area's members can approve
- Example: "Design Review" step -> HEAD/COORDINATOR of "Design" area

### 6. Multiple Approvers per Step
- **Decision**: YES - multiple approver types allowed
- Example: "HEAD OR COORDINATOR of Design area"
- Any ONE matching approver can approve (not all required)

### 7. Test Strategy
- **Decision**: Manual verification for now
- Tests will be added later after validating business rules
- Plan will include detailed manual QA procedures

## Scope Boundaries

### INCLUDE:
- Area member position change (update endpoint + UI)
- User admin CRUD with area assignment
- Custom field definitions per ContentType
- Request field value storage
- Workflow step configuration per ContentType
- Dynamic request form based on ContentType fields
- Workflow-based status transitions
- Permission hooks for UI

### EXCLUDE:
- Ad reference field implementation (placeholder only)
- File upload storage backend (assume endpoint exists)
- Email notifications on workflow transitions
- Workflow branching/parallel steps
- Approval chains (multiple sequential approvers)
- Audit trail for workflow changes
