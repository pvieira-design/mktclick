# Draft: Click Cannabis Marketing Request & Approval System

## Requirements (confirmed)

### Core Objective
Complete implementation of the marketing request & approval system for Click Cannabis team.

### Deliverables
1. **FASE-0**: Critical fixes to make system functional
2. **FASE-1**: Admin panel for managing ContentTypes/Origins/Areas
3. **FASE-2**: Complete permissions system with role-based access control

## Current State Analysis

### Existing Implementation (verified in codebase)
- Database schema: 100% complete (ContentType, Origin, Request, Area, AreaMember models)
- tRPC request router: Complete with all procedures (list, getById, create, update, submit, startReview, approve, reject, correct, cancel)
- UI components: RequestCard, RequestFilters, StatusBadge exist but have schema mismatch issues
- Pages: /dashboard, /requests/new, /requests/[id], /requests/[id]/edit exist but forms are broken

### Critical Blockers (confirmed via code review)
1. **Seed data missing**: `content_type`, `origin`, `area` tables are empty
2. **UI schema mismatch**: `apps/web/src/app/requests/new/page.tsx` sends enum strings (`VIDEO_UGC`) instead of CUIDs
3. **No contentType/origin routers**: Only `requestRouter` exists in `packages/api/src/routers/`
4. **Hooks using mock data**: `apps/web/src/hooks/use-metadata.ts` has hardcoded mock data, not connected to API
5. **No permissions enforcement**: request router has no role validation

## Technical Decisions

### Test Strategy
- **Infrastructure exists**: NO (no test files found)
- **Approach**: Manual verification with detailed QA procedures per task
- Each task will include specific verification commands and expected outputs

### Architecture Patterns (from codebase)
- tRPC router pattern: `packages/api/src/routers/[name].ts` + register in `index.ts`
- Hooks pattern: `apps/web/src/hooks/use-[name].ts`
- Page structure: `apps/web/src/app/[route]/page.tsx`
- Components: `apps/web/src/components/[name].tsx`

## Research Findings

### From Phase Documentation
- FASE-0: 11 tasks, ~3 hours, sequential execution
- FASE-1: 7 tasks, ~6-7 hours, can parallelize after layout task
- FASE-2: 6 tasks, ~5 hours, sequential execution

### Seed Data Required
- 6 ContentTypes: video-ugc, video-institucional, carrossel, post-unico, stories, reels
- 4 Origins: oslo, interno, influencer, freelancer
- 6 Areas: content-manager, design, social-media, trafego, oslo, ugc-manager

### Permission Matrix
- USER: Create, View, Edit own drafts, Submit, Cancel own
- ADMIN/HEAD: + startReview, approve, reject
- SUPER_ADMIN: + access /admin panel

## Scope Boundaries

### IN SCOPE (from phase docs)
- Seed data creation and script
- API routers for contentType and origin
- UI form updates to use IDs
- Admin panel with CRUD for ContentTypes/Origins/Areas
- Authorization middleware
- Permission enforcement in API
- Conditional UI rendering
- usePermissions hook
- Seed users with different roles

### OUT OF SCOPE (explicit exclusions)
- Custom fields per ContentType (FASE-3)
- Workflows configuration (FASE-4)
- Notifications and integrations (FASE-5)
- File attachments
- Comments on requests
- Email notifications

## Open Questions
None - requirements are fully specified in phase documentation.

---

**Document created**: 2026-01-27
**Status**: Ready for plan generation
