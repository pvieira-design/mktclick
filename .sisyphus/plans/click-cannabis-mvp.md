# Click Cannabis Marketing MVP - Phase 1

## Context

### Original Request
Build MVP Phase 1 for Click Cannabis marketing management system:
1. Login screen (exists)
2. Create account screen with all accounts as admin (exists, needs role)
3. Home page with sidebar navigation (left) with only "Home" item
4. Profile widget at bottom of sidebar + logout button
5. Local PostgreSQL database using OrbStack (create database "mktclick")
6. Use Better Auth plugin

### Interview Summary
**Key Discussions**:
- Root URL `/` should redirect to `/dashboard` when authenticated, `/login` when not
- Sidebar layout only for dashboard routes (login page stays clean)
- Manual QA verification (no automated tests)
- User needs full OrbStack setup (installation + PostgreSQL container)
- Profile widget shows: name, email, logout button

**Research Findings**:
- Better Auth admin plugin: `admin({ defaultRole: "admin" })` sets default role
- Schema fields added by plugin: role, banned, banReason, banExpires (user), impersonatedBy (session)
- CLI command: `bunx @better-auth/cli@latest generate` generates Prisma schema
- Existing codebase uses TanStack Form, shadcn/ui, tRPC
- Protected route pattern exists at `/dashboard/page.tsx`

### Self-Review Gap Analysis
**Identified Gaps (addressed in plan)**:
- Error handling for database connection failures
- Session expiry behavior on sidebar
- Loading states for profile widget
- Mobile responsiveness consideration for sidebar

---

## Work Objectives

### Core Objective
Establish database infrastructure and implement authenticated dashboard with sidebar navigation, enabling user registration with admin role by default.

### Concrete Deliverables
- PostgreSQL database "mktclick" running in OrbStack
- Better Auth admin plugin integrated with default "admin" role
- Dashboard layout with left sidebar containing "Home" navigation
- Profile widget at sidebar bottom showing user name, email, and logout button
- Root URL `/` redirects based on authentication state

### Definition of Done
- [ ] `psql -h localhost -U postgres -d mktclick -c "SELECT 1"` returns successfully
- [ ] New user registration creates user with role="admin" in database
- [ ] Authenticated user visiting `/` is redirected to `/dashboard`
- [ ] Non-authenticated user visiting `/` is redirected to `/login`
- [ ] Dashboard displays sidebar with "Home" link and profile widget
- [ ] Clicking logout in profile widget signs out and redirects to `/login`

### Must Have
- Working PostgreSQL connection with "mktclick" database
- Admin plugin configured with defaultRole: "admin"
- Sidebar with "Home" navigation item
- Profile widget with name, email, logout
- Auth-based redirect on root URL

### Must NOT Have (Guardrails)
- No role-based access control enforcement (all users are admin for Phase 1)
- No user management/admin panel features
- No additional sidebar navigation items beyond "Home"
- No avatar/image upload functionality
- No request system or multi-tenant features
- No responsive mobile sidebar (can be hamburger menu placeholder, but not full implementation)

---

## Verification Strategy (MANDATORY)

### Test Decision
- **Infrastructure exists**: NO
- **User wants tests**: Manual-only
- **Framework**: None (manual QA with Playwright browser for visual verification)

### Manual QA Approach
Each TODO includes detailed verification procedures using:
- **Shell commands**: For database and CLI operations
- **Browser automation**: For UI verification via Playwright
- **Terminal output**: For command verification

---

## Task Flow

```
Task 0 (OrbStack) 
    ↓
Task 1 (Database) 
    ↓
Task 2 (Admin Plugin) ← Can partially parallel with Task 3
    ↓
Task 3 (Schema Generation) 
    ↓
Task 4 (Sidebar Component) ← Parallel with Task 5
Task 5 (Profile Widget)
    ↓
Task 6 (Dashboard Layout) ← Depends on 4, 5
    ↓
Task 7 (Root Redirect) ← Depends on 6
    ↓
Task 8 (Integration Verification)
```

## Parallelization

| Group | Tasks | Reason |
|-------|-------|--------|
| A | 4, 5 | Independent UI components |

| Task | Depends On | Reason |
|------|------------|--------|
| 1 | 0 | Database needs OrbStack container |
| 3 | 2 | Schema gen needs admin plugin config |
| 6 | 4, 5 | Layout needs sidebar and profile widget |
| 7 | 6 | Redirect needs dashboard to exist |
| 8 | 7 | Full integration test |

---

## TODOs

- [ ] 0. Install OrbStack and Create PostgreSQL Container

  **What to do**:
  - Download and install OrbStack from https://orbstack.dev/
  - Create a PostgreSQL container named "postgres-mktclick"
  - Configure PostgreSQL with user "postgres", password "postgres", port 5432
  - Verify container is running and accessible

  **Must NOT do**:
  - Don't use Docker Desktop (OrbStack is the specified tool)
  - Don't change default PostgreSQL port from 5432

  **Parallelizable**: NO (first task)

  **References**:

  **Documentation References**:
  - OrbStack installation: https://orbstack.dev/download
  - OrbStack PostgreSQL docs: https://docs.orbstack.dev/machines/

  **Codebase References**:
  - `apps/web/.env:5` - Current DATABASE_URL format to match

  **WHY Each Reference Matters**:
  - OrbStack provides lightweight VM-based containers on macOS
  - DATABASE_URL shows expected connection string format

  **Acceptance Criteria**:

  **Manual Execution Verification:**
  - [ ] OrbStack installed: Open OrbStack app, verify it launches
  - [ ] Create container:
    ```bash
    orb create -m postgres postgres-mktclick
    ```
  - [ ] Verify PostgreSQL running:
    ```bash
    orb shell postgres-mktclick -c "pg_isready -U postgres"
    ```
    Expected output: `/var/run/postgresql:5432 - accepting connections`
  - [ ] Test connection from host:
    ```bash
    psql -h localhost -U postgres -c "SELECT version();"
    ```
    Expected: PostgreSQL version string (may need password: postgres)

  **Commit**: YES
  - Message: `chore: document OrbStack PostgreSQL setup`
  - Files: `README.md` (update database setup section)
  - Pre-commit: N/A

---

- [ ] 1. Create "mktclick" Database and Update Environment

  **What to do**:
  - Connect to PostgreSQL container and create "mktclick" database
  - Update `apps/web/.env` with new DATABASE_URL pointing to mktclick
  - Verify connection works with new database

  **Must NOT do**:
  - Don't modify any Prisma schema files yet
  - Don't delete existing database data

  **Parallelizable**: NO (depends on Task 0)

  **References**:

  **Codebase References**:
  - `apps/web/.env:5` - DATABASE_URL to update: `postgresql://postgres:password@localhost:5432/postgres`
  - `packages/env/src/server.ts:7` - DATABASE_URL validation: `z.string().min(1)`

  **WHY Each Reference Matters**:
  - Current .env shows connection string format
  - env validation ensures DATABASE_URL is set correctly

  **Acceptance Criteria**:

  **Manual Execution Verification:**
  - [ ] Create database:
    ```bash
    orb shell postgres-mktclick -c "psql -U postgres -c 'CREATE DATABASE mktclick;'"
    ```
    Expected: `CREATE DATABASE`
  - [ ] Update `apps/web/.env`:
    ```
    DATABASE_URL=postgresql://postgres:postgres@localhost:5432/mktclick
    ```
  - [ ] Verify connection:
    ```bash
    psql -h localhost -U postgres -d mktclick -c "SELECT current_database();"
    ```
    Expected: `mktclick`

  **Commit**: YES
  - Message: `chore(db): configure mktclick database connection`
  - Files: `apps/web/.env`
  - Pre-commit: Verify env loads (no syntax errors)

---

- [ ] 2. Add Better Auth Admin Plugin

  **What to do**:
  - Install admin plugin (already included in better-auth package)
  - Configure server-side admin plugin in `packages/auth/src/index.ts`
  - Set defaultRole to "admin"
  - Configure client-side adminClient plugin in `apps/web/src/lib/auth-client.ts`

  **Must NOT do**:
  - Don't add custom access control (AC) rules yet
  - Don't implement role-checking middleware
  - Don't add impersonation UI

  **Parallelizable**: NO (depends on Task 1 for DB connection)

  **References**:

  **Pattern References**:
  - `packages/auth/src/index.ts:7-17` - Current Better Auth config structure with plugins array

  **API/Type References**:
  - Better Auth admin plugin: `import { admin } from "better-auth/plugins"`
  - Better Auth adminClient: `import { adminClient } from "better-auth/client/plugins"`

  **Documentation References**:
  - Better Auth admin plugin docs: https://www.better-auth.com/docs/plugins/admin
  - Default role config: `admin({ defaultRole: "admin" })`

  **WHY Each Reference Matters**:
  - Existing auth config shows plugin array pattern to follow
  - Admin plugin adds role management without custom implementation

  **Acceptance Criteria**:

  **Manual Execution Verification:**
  - [ ] Server config updated (`packages/auth/src/index.ts`):
    ```typescript
    import { admin } from "better-auth/plugins";
    // ...
    plugins: [nextCookies(), admin({ defaultRole: "admin" })],
    ```
  - [ ] Client config updated (`apps/web/src/lib/auth-client.ts`):
    ```typescript
    import { adminClient } from "better-auth/client/plugins";
    // ...
    export const authClient = createAuthClient({
      plugins: [adminClient()]
    });
    ```
  - [ ] TypeScript check passes:
    ```bash
    cd packages/auth && bun run check-types
    ```
    Expected: No type errors

  **Commit**: YES
  - Message: `feat(auth): add admin plugin with default admin role`
  - Files: `packages/auth/src/index.ts`, `apps/web/src/lib/auth-client.ts`
  - Pre-commit: `bun run check-types`

---

- [ ] 3. Generate and Apply Database Schema

  **What to do**:
  - Run Better Auth CLI to generate updated Prisma schema with admin fields
  - Review generated schema changes (role, banned, banReason, banExpires on User)
  - Run Prisma db push to apply schema to mktclick database
  - Regenerate Prisma client

  **Must NOT do**:
  - Don't manually edit generated schema fields
  - Don't add custom fields beyond admin plugin requirements
  - Don't create migration files (use db push for development)

  **Parallelizable**: NO (depends on Task 2)

  **References**:

  **Codebase References**:
  - `packages/db/prisma/schema/auth.prisma` - Current User model (will be updated)
  - `packages/db/prisma/schema/schema.prisma` - Prisma config with generator
  - `packages/db/src/index.ts` - Prisma client import path

  **Documentation References**:
  - Better Auth CLI: `bunx @better-auth/cli@latest generate`
  - Prisma db push: `bunx prisma db push`

  **WHY Each Reference Matters**:
  - auth.prisma shows current User model structure
  - CLI generates schema changes for admin plugin fields

  **Acceptance Criteria**:

  **Manual Execution Verification:**
  - [ ] Generate schema:
    ```bash
    cd packages/db && bunx @better-auth/cli@latest generate
    ```
    Expected: Schema file updated with role, banned fields
  - [ ] Verify schema has new fields in `packages/db/prisma/schema/auth.prisma`:
    - `role String?`
    - `banned Boolean?`
    - `banReason String?`
    - `banExpires DateTime?`
  - [ ] Push schema to database:
    ```bash
    cd packages/db && bunx prisma db push
    ```
    Expected: Database synced successfully
  - [ ] Generate Prisma client:
    ```bash
    cd packages/db && bunx prisma generate
    ```
    Expected: Client generated successfully
  - [ ] Verify tables exist:
    ```bash
    psql -h localhost -U postgres -d mktclick -c "\dt"
    ```
    Expected: user, session, account, verification tables listed

  **Commit**: YES
  - Message: `feat(db): add admin plugin schema fields`
  - Files: `packages/db/prisma/schema/auth.prisma`
  - Pre-commit: `bunx prisma validate`

---

- [ ] 4. Create Sidebar Component

  **What to do**:
  - Create `apps/web/src/components/sidebar.tsx` component
  - Implement vertical sidebar with fixed width (e.g., 240px)
  - Add "Home" navigation link using shadcn Button or Link
  - Style to match existing app theme (dark mode aware)
  - Leave space at bottom for profile widget (will be composed in layout)

  **Must NOT do**:
  - Don't add navigation items beyond "Home"
  - Don't implement collapsible/responsive behavior
  - Don't include profile widget in this component (separate concern)

  **Parallelizable**: YES (with Task 5)

  **References**:

  **Pattern References**:
  - `apps/web/src/components/header.tsx:8-11` - Navigation link pattern
  - `apps/web/src/components/ui/button.tsx` - Button component API

  **API/Type References**:
  - Next.js Link: `import Link from "next/link"`
  - shadcn Button variant="ghost" for nav items

  **Documentation References**:
  - shadcn/ui Button: Already installed, check `components/ui/button.tsx`
  - TailwindCSS 4 utilities for flexbox layout

  **WHY Each Reference Matters**:
  - header.tsx shows existing navigation pattern with Link component
  - Button component provides consistent styling

  **Acceptance Criteria**:

  **Manual Execution Verification:**
  - [ ] File created: `apps/web/src/components/sidebar.tsx`
  - [ ] Component exports: `export function Sidebar()`
  - [ ] Contains "Home" link to `/dashboard`
  - [ ] TypeScript check:
    ```bash
    cd apps/web && bun run check-types
    ```
    Expected: No errors
  - [ ] Visual check (after Task 6): Sidebar renders in dashboard

  **Commit**: NO (groups with Task 5 and 6)

---

- [ ] 5. Create Profile Widget Component

  **What to do**:
  - Create `apps/web/src/components/profile-widget.tsx` component
  - Display user name (from session)
  - Display user email (from session)
  - Add logout button using `authClient.signOut()`
  - Handle loading state while session loads
  - Component receives session data as prop (from layout)

  **Must NOT do**:
  - Don't fetch session inside component (passed as prop)
  - Don't add avatar/image functionality
  - Don't add profile editing features

  **Parallelizable**: YES (with Task 4)

  **References**:

  **Pattern References**:
  - `apps/web/src/components/user-menu.tsx:44-57` - Logout implementation pattern
  - `apps/web/src/components/ui/button.tsx` - Button component

  **API/Type References**:
  - Session type: `typeof authClient.$Infer.Session`
  - `authClient.signOut()` method with `onSuccess` callback

  **WHY Each Reference Matters**:
  - user-menu.tsx shows exact pattern for signOut with redirect
  - Session type ensures type safety

  **Acceptance Criteria**:

  **Manual Execution Verification:**
  - [ ] File created: `apps/web/src/components/profile-widget.tsx`
  - [ ] Props typed: `{ session: typeof authClient.$Infer.Session }`
  - [ ] Displays `session.user.name`
  - [ ] Displays `session.user.email`
  - [ ] Logout button calls `authClient.signOut()`
  - [ ] TypeScript check:
    ```bash
    cd apps/web && bun run check-types
    ```
    Expected: No errors

  **Commit**: NO (groups with Task 4 and 6)

---

- [ ] 6. Create Dashboard Layout with Sidebar

  **What to do**:
  - Create `apps/web/src/app/dashboard/layout.tsx`
  - Check session server-side, redirect to `/login` if not authenticated
  - Render sidebar on left, main content on right
  - Pass session to ProfileWidget at sidebar bottom
  - Remove old Header from dashboard routes (sidebar replaces it)

  **Must NOT do**:
  - Don't modify root layout (`app/layout.tsx`)
  - Don't add responsive mobile menu (Phase 2)
  - Don't include theme toggle in sidebar (keep existing behavior)

  **Parallelizable**: NO (depends on Tasks 4, 5)

  **References**:

  **Pattern References**:
  - `apps/web/src/app/dashboard/page.tsx:9-16` - Server-side session check pattern
  - `apps/web/src/app/layout.tsx:24-41` - Layout structure with Providers

  **API/Type References**:
  - `auth.api.getSession({ headers: await headers() })` - Server-side session
  - `redirect("/login")` from `next/navigation`

  **WHY Each Reference Matters**:
  - dashboard/page.tsx shows exact pattern for server-side auth check
  - Layout structure shows how to wrap children with providers

  **Acceptance Criteria**:

  **Manual Execution Verification:**
  - [ ] File created: `apps/web/src/app/dashboard/layout.tsx`
  - [ ] Contains session check with redirect
  - [ ] Renders Sidebar component
  - [ ] Renders ProfileWidget with session prop
  - [ ] Start dev server:
    ```bash
    bun run dev
    ```
  - [ ] Using Playwright browser automation:
    - Navigate to: `http://localhost:3001/dashboard`
    - If not logged in: Should redirect to `/login`
    - Login with test account
    - Verify: Sidebar appears on left
    - Verify: "Home" link visible in sidebar
    - Verify: Profile widget at bottom shows name and email
    - Screenshot: Save evidence to `.sisyphus/evidence/task6-dashboard.png`

  **Commit**: YES
  - Message: `feat(ui): add dashboard layout with sidebar and profile widget`
  - Files: `apps/web/src/components/sidebar.tsx`, `apps/web/src/components/profile-widget.tsx`, `apps/web/src/app/dashboard/layout.tsx`
  - Pre-commit: `bun run check-types`

---

- [ ] 7. Implement Root URL Auth Redirect

  **What to do**:
  - Modify `apps/web/src/app/page.tsx` to check authentication
  - If authenticated: redirect to `/dashboard`
  - If not authenticated: redirect to `/login`
  - Make this a server component for server-side redirect

  **Must NOT do**:
  - Don't show any content on `/` (immediate redirect)
  - Don't use client-side redirect (causes flash)

  **Parallelizable**: NO (depends on Task 6)

  **References**:

  **Pattern References**:
  - `apps/web/src/app/dashboard/page.tsx:9-16` - Server-side session check and redirect

  **API/Type References**:
  - `auth.api.getSession({ headers: await headers() })`
  - `redirect()` from `next/navigation`

  **WHY Each Reference Matters**:
  - Existing dashboard page shows exact pattern for server-side auth redirect

  **Acceptance Criteria**:

  **Manual Execution Verification:**
  - [ ] File modified: `apps/web/src/app/page.tsx`
  - [ ] Server component (no "use client")
  - [ ] Using Playwright browser automation:
    - Clear cookies/logout first
    - Navigate to: `http://localhost:3001/`
    - Verify: Redirects to `/login`
    - Login with test account
    - Navigate to: `http://localhost:3001/`
    - Verify: Redirects to `/dashboard`
    - Screenshot: Save to `.sisyphus/evidence/task7-redirect.png`

  **Commit**: YES
  - Message: `feat(routing): redirect root URL based on auth state`
  - Files: `apps/web/src/app/page.tsx`
  - Pre-commit: `bun run check-types`

---

- [ ] 8. Full Integration Verification

  **What to do**:
  - Complete end-to-end flow verification
  - Test new user registration creates admin role
  - Test complete auth flow (signup -> dashboard -> logout)
  - Verify all acceptance criteria from Definition of Done

  **Must NOT do**:
  - Don't modify any code (verification only)

  **Parallelizable**: NO (final task)

  **References**:

  **Codebase References**:
  - All modified files from previous tasks

  **Acceptance Criteria**:

  **Manual Execution Verification:**
  - [ ] Database check - new users have admin role:
    ```bash
    psql -h localhost -U postgres -d mktclick -c "SELECT email, role FROM \"user\";"
    ```
    Expected: All users have role = 'admin'
  
  - [ ] Complete flow test using Playwright:
    1. Clear all cookies
    2. Navigate to `http://localhost:3001/`
    3. Verify: Redirects to `/login`
    4. Click "Sign Up" (or already on signup form)
    5. Fill: name="Test User", email="test@example.com", password="password123"
    6. Submit form
    7. Verify: Redirects to `/dashboard`
    8. Verify: Sidebar visible with "Home" link
    9. Verify: Profile widget shows "Test User" and "test@example.com"
    10. Click logout button
    11. Verify: Redirects to `/login`
    12. Navigate to `http://localhost:3001/`
    13. Verify: Redirects to `/login` (not authenticated)
    
  - [ ] Database verification after signup:
    ```bash
    psql -h localhost -U postgres -d mktclick -c "SELECT email, role FROM \"user\" WHERE email='test@example.com';"
    ```
    Expected: `test@example.com | admin`

  **Commit**: NO (verification only)

---

## Commit Strategy

| After Task | Message | Files | Verification |
|------------|---------|-------|--------------|
| 0 | `chore: document OrbStack PostgreSQL setup` | README.md | N/A |
| 1 | `chore(db): configure mktclick database connection` | apps/web/.env | env loads |
| 2 | `feat(auth): add admin plugin with default admin role` | packages/auth/src/index.ts, apps/web/src/lib/auth-client.ts | check-types |
| 3 | `feat(db): add admin plugin schema fields` | packages/db/prisma/schema/auth.prisma | prisma validate |
| 6 | `feat(ui): add dashboard layout with sidebar and profile widget` | sidebar.tsx, profile-widget.tsx, layout.tsx | check-types |
| 7 | `feat(routing): redirect root URL based on auth state` | apps/web/src/app/page.tsx | check-types |

---

## Success Criteria

### Verification Commands
```bash
# Database connection
psql -h localhost -U postgres -d mktclick -c "SELECT 1"
# Expected: 1

# Schema verification
psql -h localhost -U postgres -d mktclick -c "\d user"
# Expected: Shows role, banned, banReason, banExpires columns

# TypeScript
bun run check-types
# Expected: No errors

# Dev server
bun run dev
# Expected: Server starts on http://localhost:3001
```

### Final Checklist
- [ ] PostgreSQL "mktclick" database accessible
- [ ] New users created with role="admin"
- [ ] Root `/` redirects to `/dashboard` when authenticated
- [ ] Root `/` redirects to `/login` when not authenticated
- [ ] Dashboard has left sidebar with "Home" link
- [ ] Profile widget shows name, email, logout button
- [ ] Logout redirects to `/login`
- [ ] All TypeScript checks pass
- [ ] No Header component visible on dashboard routes
