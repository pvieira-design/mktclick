# FASE-0 Learnings

## Project Context
- Marketing Click Cannabis - Sistema de Requests MVP
- Stack: Next.js, tRPC, Prisma, PostgreSQL
- Database: Port 5433, database `mktclick`
- UI: shadcn/ui (NOT Untitled UI)

## Key Decisions
- ENUMs → Tables: ContentType/Origin are now models (configurable)
- Areas as Entity: Supports hierarchy (HEAD, COORDINATOR, STAFF)
- UserRole Enum: USER, ADMIN, SUPER_ADMIN for access control

## Conventions
- Use cuids for IDs
- Slugs for human-readable identifiers
- isActive flag for soft deletes
- Color codes in hex format (#RRGGBB)

## Gotchas
- Prisma Client path: `./prisma/generated/client`
- Enums path: `./prisma/generated/enums`
- Always run `npx prisma generate` after schema changes
