# Learnings - gaps-e-comentarios

This file captures patterns, conventions, and insights discovered during implementation.

## Format
```
## [TIMESTAMP] Task: {task-id}
{content}
```
## 2026-01-28 19:18:56 Pre-execution: Untitled UI Components

### Available Components for Comments System:
- **messaging**: src/components/application/messaging/messaging.tsx - PERFECT for comments
- **avatar**: Avatar component for user display
- **textarea**: For comment input
- **button**: For submit action
- **input**: For any additional fields

### Components Already Installed:
- Button, Input, Textarea, Checkbox, Select
- Avatar (with online indicator, verified tick)
- Dropdown, Tooltip, Tags
- Modal, Table, Slideout menus
- Messaging (chat/comments component)

All components follow Untitled UI design system.


## 2026-01-28 19:21:00 Task: Create Comment Model Schema

### Completed Successfully
- ✅ Created: `packages/db/prisma/schema/comment.prisma`
- ✅ Updated: `packages/db/prisma/schema/request.prisma` - added `comments Comment[]` relation
- ✅ Updated: `packages/db/prisma/schema/auth.prisma` - added `comments Comment[]` relation
- ✅ Schema pushed to database successfully
- ✅ Prisma client generated with full Comment model support

### Comment Model Structure
```prisma
model Comment {
  id        String   @id @default(cuid())
  requestId String
  request   Request  @relation(fields: [requestId], references: [id], onDelete: Cascade)
  userId    String
  user      User     @relation(fields: [userId], references: [id])
  content   String   @db.Text
  createdAt DateTime @default(now())
  
  @@index([requestId])
  @@index([userId])
  @@map("comment")
}
```

### Key Design Decisions
- **Immutable comments**: No updatedAt field (audit trail - no edits allowed)
- **Flat structure**: No parentId/replyToId (no threading/replies)
- **No soft delete**: No status or isDeleted fields
- **Cascade delete**: Comments deleted when request is deleted
- **Indexes**: Both requestId and userId indexed for query performance
- **Text field**: content uses @db.Text for longer comments

### Generated Types
- Full Prisma client types generated
- Relations work bidirectionally:
  - Request.comments[] → Comment[]
  - User.comments[] → Comment[]
  - Comment.request → Request
  - Comment.user → User
- All CRUD operations available via Prisma client

### Database Status
- PostgreSQL table "comment" created successfully
- Indexes created on requestId and userId
- Foreign key constraints established with cascade delete on Request
- Foreign key constraint on User (no cascade - user deletion doesn't delete comments)

## 2026-01-28 Admin Role Check Pattern

### Admin Layout Role Authorization
- **File**: `apps/web/src/app/admin/layout.tsx` (line 20-22)
- **Pattern**: Both ADMIN and SUPER_ADMIN roles can access admin panel
- **Implementation**: Array inclusion check using `.includes()`

### Code Pattern
```typescript
// Only ADMIN and SUPER_ADMIN can access admin panel
if (!["ADMIN", "SUPER_ADMIN"].includes(session.user.role)) {
  redirect("/dashboard");
}
```

### Consistency with Backend
- Backend `adminProcedure` (packages/api/src/index.ts) uses same pattern
- Both frontend and backend check for ADMIN OR SUPER_ADMIN
- Ensures consistent authorization across the application

### Key Insight
- Use array `.includes()` for multiple role checks instead of chained OR conditions
- More maintainable and scalable if additional roles need admin access
- Matches backend authorization pattern for consistency

## 2026-01-28 Permission Validation Pattern: Area-Based Create Permissions

### Task: Add permission validation to request.create mutation

### Implementation Pattern
- **File**: `packages/api/src/routers/request.ts` (create mutation, lines 224-238)
- **Function**: `canUserCreateRequestOfType(userId, contentTypeId)`
- **Location**: Permission check BEFORE `db.$transaction()` (not inside)

### Code Pattern
```typescript
const userId = ctx.session.user.id;

// Validate user has permission to create this content type
const canCreate = await canUserCreateRequestOfType(userId, input.contentTypeId);
if (!canCreate) {
  throw new TRPCError({
    code: "FORBIDDEN",
    message: "You do not have permission to create requests of this content type",
  });
}

return db.$transaction(async (tx) => {
  // existing logic unchanged
});
```

### Key Design Decisions
- **Pre-transaction check**: Permission validation happens BEFORE transaction starts (fail-fast)
- **Fail-open behavior**: If no permissions configured for contentType, allow creation (backward compatible)
- **Area-based**: Checks user's area memberships against contentTypeAreaPermission records
- **Consistent pattern**: Matches `advanceStep` mutation's permission check approach (line 791-794)

### Function Behavior (workflow-validator.ts)
1. Get user's area memberships
2. If user has no areas → return false (deny)
3. Check if user's areas have canCreate=true for contentTypeId
4. If no permissions configured at all → return true (fail-open)
5. Otherwise → return permission result

### Import Addition
- Added `canUserCreateRequestOfType` to imports from `../services/workflow-validator`
- Maintains alphabetical ordering in import list

### Verification
- ✅ LSP diagnostics: No type errors
- ✅ Import added correctly
- ✅ Permission check placed before transaction
- ✅ Error message clear and specific
- ✅ Follows existing pattern from advanceStep mutation
