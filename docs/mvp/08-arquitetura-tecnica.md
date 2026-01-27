# Arquitetura Técnica

[◀ Anterior](07-interface-ui.md) | [Índice](README.md) | [Próximo ▶](09-exemplos-uso.md)

---

## Stack Tecnológico

| Camada | Tecnologia | Versão | Propósito |
|--------|-----------|--------|----------|
| **Frontend** | Next.js | 15 | Framework React full-stack |
| **Styling** | TailwindCSS | 3.x | Utility-first CSS |
| **UI Components** | Untitled UI | Latest | Design system |
| **API** | tRPC | Latest | Type-safe RPC |
| **Database** | PostgreSQL | 15+ | Banco de dados relacional |
| **ORM** | Prisma | Latest | Type-safe database client |
| **Auth** | Better-Auth | Latest | Autenticação com roles |
| **Validation** | Zod | Latest | Schema validation |
| **Notifications** | Sonner | Latest | Toast notifications |
| **Timezone** | date-fns-tz | Latest | Timezone handling |

---

## Estrutura de Arquivos

```
apps/web/
├── src/
│   ├── app/
│   │   ├── (auth)/
│   │   │   ├── login/
│   │   │   └── register/
│   │   ├── (dashboard)/
│   │   │   ├── requests/
│   │   │   │   ├── page.tsx          # Lista de requests
│   │   │   │   ├── [id]/
│   │   │   │   │   └── page.tsx      # Detalhe do request
│   │   │   │   ├── new/
│   │   │   │   │   └── page.tsx      # Criar novo request
│   │   │   │   └── [id]/edit/
│   │   │   │       └── page.tsx      # Editar request
│   │   │   └── layout.tsx
│   │   ├── api/
│   │   │   └── trpc/
│   │   │       └── [trpc]/
│   │   │           └── route.ts      # tRPC endpoint
│   │   └── layout.tsx
│   ├── components/
│   │   ├── ui/                       # Untitled UI components
│   │   │   ├── button.tsx
│   │   │   ├── input.tsx
│   │   │   ├── badge.tsx
│   │   │   ├── modal.tsx
│   │   │   └── ...
│   │   ├── requests/
│   │   │   ├── RequestList.tsx       # Tabela de requests
│   │   │   ├── RequestForm.tsx       # Form criar/editar
│   │   │   ├── RequestDetail.tsx     # Detalhe
│   │   │   ├── RequestHistory.tsx    # Timeline
│   │   │   ├── ApprovalModal.tsx     # Modal aprovação
│   │   │   └── RejectionModal.tsx    # Modal rejeição
│   │   └── layout/
│   │       ├── Header.tsx
│   │       ├── Sidebar.tsx
│   │       └── Footer.tsx
│   ├── lib/
│   │   ├── trpc.ts                   # tRPC client setup
│   │   ├── auth.ts                   # Auth utilities
│   │   ├── validation.ts             # Zod schemas
│   │   └── utils.ts                  # Helper functions
│   ├── server/
│   │   ├── routers/
│   │   │   ├── requests.ts           # tRPC router para requests
│   │   │   └── index.ts              # Root router
│   │   ├── db.ts                     # Prisma client
│   │   └── auth.ts                   # Auth config
│   └── env.ts                        # Environment variables
├── .env.local                        # Local env vars
├── prisma/
│   ├── schema.prisma                 # Database schema
│   └── migrations/                   # Database migrations
└── package.json

packages/
├── db/
│   ├── src/
│   │   ├── schema.prisma             # Shared schema
│   │   └── index.ts
│   └── package.json
├── auth/
│   ├── src/
│   │   ├── config.ts                 # Better-Auth config
│   │   └── index.ts
│   └── package.json
└── api/
    ├── src/
    │   ├── routers/
    │   │   └── requests.ts
    │   └── index.ts
    └── package.json
```

---

## tRPC Router Structure

```typescript
// server/routers/index.ts
export const appRouter = router({
  requests: requestsRouter,
});

// server/routers/requests.ts
export const requestsRouter = router({
  // Queries
  list: publicProcedure
    .input(z.object({ status: z.string().optional() }))
    .query(async ({ input, ctx }) => {
      // Listar requests com filtros
    }),
  
  getById: publicProcedure
    .input(z.string())
    .query(async ({ input, ctx }) => {
      // Buscar request por ID
    }),
  
  // Mutations
  create: protectedProcedure
    .input(createRequestSchema)
    .mutation(async ({ input, ctx }) => {
      // Criar novo request
    }),
  
  update: protectedProcedure
    .input(updateRequestSchema)
    .mutation(async ({ input, ctx }) => {
      // Editar request (draft only)
    }),
  
  submit: protectedProcedure
    .input(z.string())
    .mutation(async ({ input, ctx }) => {
      // Submeter request (draft → pending)
    }),
  
  startReview: adminProcedure
    .input(z.string())
    .mutation(async ({ input, ctx }) => {
      // Iniciar revisão (pending → in_review)
    }),
  
  approve: adminProcedure
    .input(z.string())
    .mutation(async ({ input, ctx }) => {
      // Aprovar request (in_review → approved)
    }),
  
  reject: adminProcedure
    .input(z.object({ id: z.string(), reason: z.string() }))
    .mutation(async ({ input, ctx }) => {
      // Rejeitar request (in_review → rejected)
    }),
  
  correct: protectedProcedure
    .input(z.string())
    .mutation(async ({ input, ctx }) => {
      // Corrigir request (rejected → draft)
    }),
  
  cancel: protectedProcedure
    .input(z.string())
    .mutation(async ({ input, ctx }) => {
      // Cancelar request
    }),
});
```

---

## Validação com Zod

```typescript
// lib/validation.ts
export const createRequestSchema = z.object({
  title: z.string().min(3).max(200),
  description: z.string().min(10).max(5000),
  contentType: z.enum([
    'video_ugc',
    'video_institucional',
    'carrossel',
    'post_unico',
    'stories',
    'reels',
  ]),
  deadline: z.date().min(new Date(Date.now() + 3600000)), // +1h
  priority: z.enum(['low', 'medium', 'high']).default('medium'),
  origin: z.enum(['oslo', 'interno', 'influencer']).default('interno'),
  patologia: z.enum([...]).optional(),
});

export const rejectionReasonSchema = z.object({
  reason: z.string().min(10).max(2000),
});
```

---

## Timezone Handling

### Armazenamento
- Todos os timestamps são armazenados em **UTC** no banco de dados
- Campo `createdAt`, `updatedAt`, `deadline` em UTC

### Exibição
- Conversão para **America/Sao_Paulo** (Brasília) no frontend
- Uso de `date-fns-tz` para conversão
- Formato: `DD/MM/YYYY HH:mm` (ex: 27/01/2026 14:30)

### Exemplo
```typescript
import { formatInTimeZone } from 'date-fns-tz';

const deadline = new Date('2026-01-28T14:00:00Z');
const formatted = formatInTimeZone(
  deadline,
  'America/Sao_Paulo',
  'dd/MM/yyyy HH:mm'
);
// Output: 28/01/2026 11:00 (UTC-3)
```

---

## Autenticação e Autorização

### Better-Auth Setup
```typescript
// server/auth.ts
export const auth = initAuth({
  database: db,
  secret: process.env.AUTH_SECRET,
  baseURL: process.env.AUTH_URL,
  trustedOrigins: [process.env.NEXT_PUBLIC_APP_URL],
});

// Roles
export const roles = {
  super_admin: 'super_admin',
  admin: 'admin',
  head: 'head',
  user: 'user',
  external: 'external',
};
```

### Middleware de Autorização
```typescript
// lib/auth.ts
export const adminProcedure = protectedProcedure
  .use(async ({ ctx, next }) => {
    if (!['admin', 'head', 'super_admin'].includes(ctx.user.role)) {
      throw new TRPCError({ code: 'UNAUTHORIZED' });
    }
    return next();
  });
```

---

## Decisões Técnicas

### 1. Por que tRPC?
- Type-safety end-to-end (frontend ↔ backend)
- Sem necessidade de OpenAPI/Swagger
- Autocompletar automático no frontend
- Validação compartilhada com Zod

### 2. Por que Prisma?
- Type-safe database queries
- Migrations automáticas
- Suporte a PostgreSQL nativo
- Excelente DX

### 3. Por que Untitled UI?
- Design system consistente
- Componentes acessíveis (WCAG)
- Documentação completa
- Suporte a temas

### 4. Por que Sonner?
- Notificações elegantes
- Sem dependência de bibliotecas pesadas
- Suporte a custom styling
- Acessibilidade nativa

---

## Performance

### Otimizações Implementadas
- Paginação (50 requests por página)
- Índices no banco de dados (status, createdById, reviewedById)
- Lazy loading de componentes
- Caching de queries tRPC
- Compressão de assets

### Monitoramento
- Logs de erro em produção
- Métricas de performance (Core Web Vitals)
- Alertas de downtime

---

## Segurança

### Validação
- Zod schema validation em todas as inputs
- Sanitização de Markdown (DOMPurify)
- Rate limiting em endpoints críticos

### Autenticação
- Better-Auth com JWT
- CSRF protection
- Secure cookies (httpOnly, sameSite)

### Autorização
- Role-based access control (RBAC)
- Verificação de permissões em cada mutation
- Auditoria completa em RequestHistory

---

[◀ Anterior](07-interface-ui.md) | [Índice](README.md) | [Próximo ▶](09-exemplos-uso.md)
