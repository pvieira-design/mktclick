# Draft: Click Cannabis Marketing System - Phases 0, 1, 2

## User Request Summary

Implement three phases for the Click Cannabis marketing request management system:
- **FASE-0**: Critical fixes (seed data, API routers, UI updates) - BLOCKER
- **FASE-1**: Admin panel for managing ContentTypes, Origins, Areas
- **FASE-2**: Role-based permission system

## Research Findings

### Current Codebase State

**Database Schema** (packages/db/prisma/schema/):
- `content-config.prisma`: ContentType and Origin models (ready)
- `area.prisma`: Area and AreaMember models with AreaPosition enum
- `auth.prisma`: User model with UserRole enum (USER, ADMIN, SUPER_ADMIN)
- `request.prisma`: Request model with relations to ContentType, Origin

**API Layer** (packages/api/src/):
- `routers/request.ts`: Complete CRUD with 515 lines
- `routers/index.ts`: Only exports requestRouter (missing contentType, origin, area)
- `index.ts`: Has protectedProcedure but NO adminProcedure yet

**Frontend** (apps/web/src/):
- `app/requests/new/page.tsx`: Uses HARDCODED enum labels, not API data
- `components/request-card.tsx`: Already handles object contentType/origin
- `components/request-filters.tsx`: Uses useContentTypes from use-metadata
- `hooks/use-metadata.ts`: MOCK data, marked TODO for real API

**Database Package** (packages/db/):
- `src/index.ts`: Exports are CORRECT (verified - no LSP errors mentioned as already fixed)
- `package.json`: Missing db:seed script

### Key Patterns Identified

1. **Router Pattern** (from request.ts):
   - Uses Zod schemas for input validation
   - Prisma transactions for data integrity
   - TRPCError for error handling
   - Returns objects with `items` array for lists

2. **UI Pattern**:
   - shadcn/ui components (Card, Select, Button, etc.)
   - Portuguese labels in user-facing elements
   - useQuery/useMutation from @tanstack/react-query
   - trpc client via `@/utils/trpc`

3. **Form Pattern**:
   - useState for form data
   - Manual validation with errors state
   - toast from sonner for notifications

## Verified Requirements

### FASE-0 Tasks (from docs/fases/FASE-0-CORRECOES-URGENTES.md):
1. Task 0.1: Fix db exports - ALREADY DONE (index.ts exports are correct)
2. Task 0.2-0.4: Create seed.ts with ContentTypes, Origins, Areas
3. Task 0.5: Add db:seed script to package.json
4. Task 0.6-0.8: Create contentType and origin routers
5. Task 0.9: Update new request form to use IDs
6. Task 0.10: Update RequestCard (already partially handles objects)
7. Task 0.11: Update RequestFilters (already uses hook)
8. Task 0.6 (hook): Update use-metadata.ts for real API

### FASE-1 Tasks (from docs/fases/FASE-1-ADMIN-PANEL.md):
1. Task 1.1: Admin layout with SUPER_ADMIN protection
2. Task 1.2-1.4: ContentTypes CRUD (list, create, edit, toggle)
3. Task 1.5: Origins CRUD
4. Task 1.6-1.7: Areas CRUD + member management

### FASE-2 Tasks (from docs/fases/FASE-2-PERMISSOES.md):
1. Task 2.1: Authorization middleware
2. Task 2.2: Apply permissions to request router
3. Task 2.3-2.4: UI conditional rendering + usePermissions hook
4. Task 2.5: Role badge in user menu
5. Task 2.6: Seed users with roles

## Technical Decisions

- **Router naming**: content-type.ts, origin.ts, area.ts (following kebab-case pattern)
- **Seed approach**: Use $transaction with upsert for idempotency
- **adminProcedure**: Add to packages/api/src/index.ts
- **Auth check in admin**: Use server-side auth in layout.tsx

## Open Questions

1. Test strategy - TDD or manual verification?
2. Should seed script be run automatically or manually?
3. Better Auth session access pattern for server components?

## Scope Boundaries

### INCLUDE:
- All tasks from FASE-0, FASE-1, FASE-2 docs
- Type safety throughout
- Portuguese labels in UI
- Follow existing patterns

### EXCLUDE:
- FASE-3 (Custom Fields)
- Email notifications
- Audit logging beyond existing RequestHistory
- Mobile responsiveness improvements
