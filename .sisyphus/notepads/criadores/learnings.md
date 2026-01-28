
## Creator Schema Pattern
- Enum values use SCREAMING_SNAKE_CASE (UGC_CREATOR, EMBAIXADOR, etc)
- Model follows standard pattern: id (cuid), timestamps (createdAt, updatedAt), isActive boolean
- Relations use onDelete: Cascade for foreign keys
- Indexes on frequently queried fields: responsibleId (FK), type (filter), isActive (status)
- Table mapping uses @@map("creator") for snake_case DB table name
- Optional fields use String? for nullable columns
- Text fields use @db.Text for longer content (notes)

## tRPC Router Patterns (Task 3 - Creator Router)

### Router Structure
- Import TRPCError, z, db, enums, and procedures from index
- Export router with descriptive name (e.g., `creatorRouter`)
- Use `router()` function to define all endpoints

### Endpoint Patterns
1. **List with Pagination & Filters**
   - Use `protectedProcedure` for authenticated access
   - Input schema: search, filters, page (default 1), limit (default 20, max 100)
   - Build dynamic `where` clause with optional filters
   - Use `Promise.all()` for parallel findMany + count queries
   - Return: `{ items, total, hasMore }`
   - Order by `createdAt: "desc"` for newest first

2. **GetById**
   - Use `protectedProcedure` for read operations
   - Input: `z.object({ id: z.string().cuid() })`
   - Include related data with `select` to avoid exposing sensitive fields
   - Throw `TRPCError` with `NOT_FOUND` if not found

3. **Create**
   - Use `adminProcedure` for admin-only operations
   - Validate all required fields with Zod schemas
   - Check for existing records (email uniqueness, etc.)
   - Verify foreign key references exist before creating
   - Return created record with included relations

4. **Update**
   - Use `adminProcedure`
   - Destructure `{ id, ...updateData }` from input
   - Check record exists before updating
   - Validate foreign key changes
   - Check uniqueness constraints when changing unique fields
   - Return updated record with relations

5. **Delete (Soft Delete)**
   - Use `adminProcedure`
   - Set `isActive: false` instead of actual deletion
   - Verify record exists before soft deleting
   - Return updated record

6. **ToggleActive**
   - Use `adminProcedure`
   - Fetch current state, toggle `isActive` field
   - Return updated record

### Key Learnings
- Always use `mode: "insensitive"` for case-insensitive search
- Use `select` on User relations to avoid exposing password field
- Validate foreign keys exist before creating/updating
- Check uniqueness constraints with `findFirst` + `where` conditions
- Use `skip` and `take` for pagination: `skip = (page - 1) * limit`
- Soft delete pattern: update `isActive` to false, don't use `db.delete()`
- Error codes: `NOT_FOUND`, `CONFLICT`, `UNAUTHORIZED`, `FORBIDDEN`

### Database Export Pattern
- Enums must be exported from `packages/db/src/index.ts`
- Types must be exported from generated Prisma client
- Run `bun run db:generate` after schema changes to regenerate client
- Export format: `export { EnumName } from "../prisma/generated/enums"`
- Type export: `export type { ModelName } from "../prisma/generated/client"`
