# FASE-0 Architectural Decisions

## Database Schema
- ContentType, Origin, Area are now first-class entities (not enums)
- Allows dynamic configuration without code changes
- Supports future admin panel for configuration

## API Design
- tRPC routers for each entity (contentType, origin, area)
- Public procedures for list operations (no auth required for MVP)
- Include relations in queries for rich data

## Frontend Patterns
- Custom hooks for data fetching (useContentTypes, useOrigins)
- Form state uses IDs (cuids) not enum strings
- Components receive full objects with relations
