# Draft: E2E Test — Ad Request Full Workflow

## Requirements (confirmed)
- Test: criar ad request com 3 videos diferentes, percorrer todas as 6 fases ate conclusao
- Infraestrutura de teste: NAO EXISTE no projeto (zero configs, zero deps, zero test files)

## Technical Decisions
- (pending) Framework de teste E2E
- (pending) Database strategy (test DB vs mock)
- (pending) Auth strategy (como logar no teste)

## Research Findings
- Projeto usa npm workspaces (sem turbo)
- NODE_ENV "test" ja reconhecido em packages/env/src/server.ts
- Roadmap doc ja mencionava "add e2e tests for approval flow" como futuro

## Open Questions
- Framework E2E: Playwright vs Cypress?
- Database: usar DB real de dev ou criar test DB?
- Auth: como autenticar no teste?
- Seed data: precisa de dados pre-existentes?

## Scope Boundaries
- INCLUDE: (pending)
- EXCLUDE: (pending)
