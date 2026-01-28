# Draft: Click Cannabis Marketing Request System - Full Implementation

## Requirements (confirmed)

### Current State Analysis
- **Database Schema**: COMPLETE - ContentType, Origin, Area, Request, User models all defined
- **tRPC API**: PARTIALLY COMPLETE - Only `requestRouter` exists, missing contentType/origin/area routers
- **UI Pages**: BASIC - Dashboard, create, detail, edit pages exist
- **Authentication**: Configured via better-auth

### Identified Blockers (FASE-0)
1. **No seed data**: ContentType, Origin, Area tables are EMPTY
2. **UI/API mismatch**: UI uses hardcoded enum strings, API expects CUID IDs
3. **Missing API routers**: No contentType.list, origin.list endpoints
4. **Hook uses mock data**: `use-metadata.ts` returns hardcoded arrays instead of API data

### Technical Decisions

1. **Seed Implementation**: Use Prisma `$transaction` with `upsert` for idempotent seeds
2. **API Router Structure**: Create separate routers for contentType, origin, area
3. **Middleware Pattern**: Add `adminProcedure` to protect admin routes
4. **UI Updates**: Refactor forms to fetch options from API, send IDs

## Research Findings

### Codebase Patterns
- **Router pattern**: `packages/api/src/routers/*.ts` registered in `index.ts`
- **Procedure types**: `publicProcedure`, `protectedProcedure` defined in `packages/api/src/index.ts`
- **DB access**: Import `db` from `@marketingclickcannabis/db`
- **Prisma schema**: Split into multiple files under `packages/db/prisma/schema/`

### Files to Modify

**FASE-0:**
- CREATE: `packages/db/prisma/seed.ts`
- MODIFY: `packages/db/package.json` (add seed script)
- CREATE: `packages/api/src/routers/content-type.ts`
- CREATE: `packages/api/src/routers/origin.ts`
- MODIFY: `packages/api/src/routers/index.ts` (register new routers)
- MODIFY: `apps/web/src/hooks/use-metadata.ts` (use real API)
- MODIFY: `apps/web/src/app/requests/new/page.tsx` (use IDs)

**FASE-1:**
- CREATE: `apps/web/src/app/admin/layout.tsx`
- CREATE: `apps/web/src/app/admin/page.tsx`
- CREATE: `apps/web/src/app/admin/content-types/` (list, new, edit pages)
- CREATE: `apps/web/src/app/admin/origins/` (list, new, edit pages)
- CREATE: `apps/web/src/app/admin/areas/` (list, new, edit pages)
- MODIFY: `packages/api/src/routers/content-type.ts` (add CRUD)
- CREATE: `packages/api/src/routers/area.ts`
- MODIFY: `packages/api/src/index.ts` (add adminProcedure)

**FASE-2:**
- CREATE: `packages/api/src/middleware/authorization.ts`
- MODIFY: `packages/api/src/routers/request.ts` (add permission checks)
- CREATE: `apps/web/src/hooks/use-permissions.ts`
- MODIFY: `apps/web/src/app/requests/[id]/page.tsx` (conditional rendering)
- MODIFY: `apps/web/src/components/user-menu.tsx` (role badge)

## Open Questions

None - all requirements are clear from the phase documentation.

## Scope Boundaries

### INCLUDE (IN SCOPE)
- FASE-0: Seed data, API routers, UI form updates
- FASE-1: Admin panel CRUD for ContentTypes, Origins, Areas
- FASE-2: Authorization middleware, API permissions, UI conditional rendering

### EXCLUDE (OUT OF SCOPE)
- Custom fields per ContentType
- Workflow configuration
- Notifications/integrations
- Email verification flows
- Complex area-based permission inheritance

## Test Strategy Decision
- **Infrastructure exists**: NO (no test files found)
- **User wants tests**: NOT SPECIFIED - will propose manual QA verification
- **QA approach**: Manual verification with specific commands and browser checks
