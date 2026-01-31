# Ads Types Fase 2 — Frontend — Learnings

## Codebase Patterns

### tRPC Usage
- `useQuery(trpc.adProject.list.queryOptions({...}))` — standard pattern
- `useMutation({ ...trpc.adProject.create.mutationOptions(), onSuccess: ... })` — mutation pattern
- Some places use `(trpc.xxx.mutationOptions as any)()` to work around type issues
- `queryClient.invalidateQueries({ queryKey: [["adProject"]] })` for cache invalidation

### Component Patterns
- Button: `@/components/base/buttons/button` with `iconLeading`, `color`, `size`, `isDisabled` props
- Badge: `@/components/base/badges/badges` — `Badge`, `BadgeWithDot` components
- BadgeColors type: `@/components/base/badges/badge-types`
- Input: `@/components/base/input/input` with `icon`, `placeholder`, `value`, `onChange` props
- Select: `@/components/base/select/select` with `selectedKey`, `onSelectionChange`, `Select.Item`
- Table: `@/components/application/table/table` — `Table`, `TableCard`
- Skeleton: `@/components/ui/skeleton`
- SlideoutMenu: `@/components/application/slideout-menus/slideout-menu`
- Icons: `@untitledui/icons` (Plus, SearchMd, FilterLines, etc.)
- Toast: `sonner` — `toast.success()`, `toast.error()`

### Layout Pattern
- Server component with auth check
- `auth.api.getSession({ headers: await headers() })`
- Redirect to `/login` if no session
- `<div className="flex h-screen"><Sidebar userRole={...}><ProfileWidget /></Sidebar><main className="flex-1 overflow-auto bg-secondary p-8">{children}</main></div>`

### Page Pattern
- "use client" for interactive pages
- useState for filters, pagination
- useQuery for data fetching
- Grid layout: `grid gap-4 md:grid-cols-2 lg:grid-cols-3`
- Header: `text-3xl font-bold tracking-tight text-primary`
- Subtitle: `text-tertiary`

### Card Pattern (from request-card.tsx)
- Link wrapper with `rounded-xl bg-primary shadow-xs ring-1 ring-border-secondary transition-all hover:shadow-md hover:ring-border-primary`
- BadgeWithDot for status
- Footer with border-t

### Sidebar
- getActiveUrl() uses pathname.startsWith() checks
- CRITICAL: `/ads-requests` must be checked BEFORE `/ads`
- sections array with label + items
- Admin section conditionally pushed

### Admin Page Pattern
- Uses Table + TableCard for listing
- Badge for status indicators
- Pagination at bottom
- Search + filter at top

### Key Constraints
- Route `/ads` exists (Facebook Ads analytics) — new routes use `/ads-requests`
- Router keys: `adProject`, `adVideo`, `adDeliverable` (NOT `ads`)
- `ctx.session.user.role` is `string | null` — use `?? ""` or `as string`
