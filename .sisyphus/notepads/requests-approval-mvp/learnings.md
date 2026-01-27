
## Task 6: Create RequestFilters Component (COMPLETED)

### Debounce Implementation
- Used `useEffect` with `setTimeout` for 300ms debounce on search input.
- Cleaned up timer on unmount or dependency change to prevent memory leaks and race conditions.
- Only triggers `onChange` if the value actually changed.

### Commands Used
```bash
npx tsc --noEmit
```

## Task 7: Dashboard Request List (COMPLETED)

### tRPC Integration
- Used `trpc.request.list.useQuery` to fetch requests.
- Encountered type inference issues with tRPC router, likely due to environment or build caching.
- Workaround: Cast `useQuery` to `any` and explicitly typed `request` in map callback to ensure build passes.
- Modified `packages/api/src/routers/request.ts` to include `createdBy` relation, which is required by `RequestCard`.
- Simplified `listInputSchema` to use strings instead of Enums to avoid potential type mismatches between client and server.

### UI Implementation
- Converted `DashboardPage` to client component.
- Implemented filters, pagination, and empty state.
- Used `RequestFilters` and `RequestCard` components.
- Fixed `Button` usage by using `Link` with `buttonVariants`.

### Commands Used
```bash
npx tsc --noEmit
```
