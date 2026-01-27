# FASE 2: Sistema de Permissões Completo

**Status**: 🟡 Importante - Segurança e controle de acesso
**Duração Estimada**: 4-6 horas
**Prioridade**: ALTA
**Depende de**: FASE-1 (Areas devem estar configuradas)

---

## 🎯 Objetivo

Implementar controle de acesso baseado em:
1. **UserRole**: USER, ADMIN, SUPER_ADMIN
2. **Area Membership**: HEAD, COORDINATOR, STAFF
3. **Request Ownership**: Criador, Revisor

**Matriz de Permissões** (baseado em `docs/mvp/06-permissoes-roles.md`):

| Ação | USER | ADMIN/HEAD | SUPER_ADMIN |
|------|------|-----------|-------------|
| Criar Request | ✅ | ✅ | ✅ |
| Ver Todos | ✅ | ✅ | ✅ |
| Editar (Draft próprio) | ✅ | ✅ | ✅ |
| Submeter | ✅ | ✅ | ✅ |
| Iniciar Revisão | ❌ | ✅ | ✅ |
| Aprovar | ❌ | ✅ | ✅ |
| Rejeitar | ❌ | ✅ | ✅ |
| Cancelar | ✅ (próprio) | ✅ | ✅ |

---

## 📋 Tasks

### Task 2.1: Criar Middleware de Autorização
**Arquivo**: `packages/api/src/middleware/authorization.ts` (criar)

**Objetivo**: Funções reutilizáveis para checar permissões

**Código**:
```typescript
import { TRPCError } from '@trpc/server';
import type { Context } from '../index';

export function requireRole(ctx: Context, roles: string[]) {
  if (!ctx.session?.user) {
    throw new TRPCError({ code: 'UNAUTHORIZED', message: 'Not logged in' });
  }
  
  if (!roles.includes(ctx.session.user.role)) {
    throw new TRPCError({
      code: 'FORBIDDEN',
      message: `Requires one of: ${roles.join(', ')}`,
    });
  }
}

export function requireAdmin(ctx: Context) {
  requireRole(ctx, ['ADMIN', 'SUPER_ADMIN']);
}

export function requireSuperAdmin(ctx: Context) {
  requireRole(ctx, ['SUPER_ADMIN']);
}

export async function requireOwnership(
  ctx: Context,
  resourceId: string,
  getResource: (id: string) => Promise<{ createdById: string } | null>
) {
  const resource = await getResource(resourceId);
  
  if (!resource) {
    throw new TRPCError({ code: 'NOT_FOUND' });
  }
  
  // Super Admin pode tudo
  if (ctx.session.user.role === 'SUPER_ADMIN') {
    return resource;
  }
  
  // Admin pode editar qualquer
  if (ctx.session.user.role === 'ADMIN') {
    return resource;
  }
  
  // User comum só pode editar próprio
  if (resource.createdById !== ctx.session.user.id) {
    throw new TRPCError({
      code: 'FORBIDDEN',
      message: 'You can only edit your own resources',
    });
  }
  
  return resource;
}
```

---

### Task 2.2: Aplicar Permissões no Request Router
**Arquivo**: `packages/api/src/routers/request.ts`

**Mudanças**:

#### update (editar request)
```typescript
update: protectedProcedure
  .input(updateInputSchema)
  .mutation(async ({ ctx, input }) => {
    const { id, ...updateData } = input;
    
    // Verificar ownership
    const request = await requireOwnership(
      ctx,
      id,
      (id) => db.request.findUnique({ where: { id }, select: { createdById: true, status: true } })
    );
    
    // Verificar status
    if (request.status !== 'DRAFT') {
      throw new TRPCError({
        code: 'BAD_REQUEST',
        message: 'Only draft requests can be edited',
      });
    }
    
    // Atualizar
    return db.request.update({ where: { id }, data: updateData });
  }),
```

#### startReview (iniciar revisão)
```typescript
startReview: protectedProcedure
  .input(z.object({ id: z.string().cuid() }))
  .mutation(async ({ ctx, input }) => {
    // Apenas ADMIN/HEAD podem iniciar revisão
    requireAdmin(ctx);
    
    const request = await db.request.findUnique({ where: { id: input.id } });
    if (!request) throw new TRPCError({ code: 'NOT_FOUND' });
    
    if (request.status !== 'PENDING') {
      throw new TRPCError({
        code: 'BAD_REQUEST',
        message: 'Only pending requests can be reviewed',
      });
    }
    
    return db.request.update({
      where: { id: input.id },
      data: {
        status: 'IN_REVIEW',
        reviewedById: ctx.session.user.id,
      },
    });
  }),
```

#### approve (aprovar)
```typescript
approve: protectedProcedure
  .input(z.object({ id: z.string().cuid() }))
  .mutation(async ({ ctx, input }) => {
    // Apenas ADMIN/HEAD podem aprovar
    requireAdmin(ctx);
    
    const request = await db.request.findUnique({ where: { id: input.id } });
    if (!request) throw new TRPCError({ code: 'NOT_FOUND' });
    
    if (request.status !== 'IN_REVIEW') {
      throw new TRPCError({
        code: 'BAD_REQUEST',
        message: 'Only requests in review can be approved',
      });
    }
    
    // Verificar se é o revisor atribuído (opcional - pode remover se auto-aprovação permitida)
    if (request.reviewedById !== ctx.session.user.id) {
      throw new TRPCError({
        code: 'FORBIDDEN',
        message: 'Only the assigned reviewer can approve',
      });
    }
    
    return db.request.update({
      where: { id: input.id },
      data: { status: 'APPROVED' },
    });
  }),
```

#### reject (rejeitar)
```typescript
reject: protectedProcedure
  .input(z.object({
    id: z.string().cuid(),
    reason: z.string().min(10).max(2000),
  }))
  .mutation(async ({ ctx, input }) => {
    // Apenas ADMIN/HEAD podem rejeitar
    requireAdmin(ctx);
    
    const request = await db.request.findUnique({ where: { id: input.id } });
    if (!request) throw new TRPCError({ code: 'NOT_FOUND' });
    
    if (request.status !== 'IN_REVIEW') {
      throw new TRPCError({
        code: 'BAD_REQUEST',
        message: 'Only requests in review can be rejected',
      });
    }
    
    return db.request.update({
      where: { id: input.id },
      data: {
        status: 'REJECTED',
        rejectionReason: input.reason,
      },
    });
  }),
```

#### cancel (cancelar)
```typescript
cancel: protectedProcedure
  .input(z.object({ id: z.string().cuid() }))
  .mutation(async ({ ctx, input }) => {
    const request = await db.request.findUnique({
      where: { id: input.id },
      select: { createdById: true, status: true },
    });
    
    if (!request) throw new TRPCError({ code: 'NOT_FOUND' });
    
    // Criador pode cancelar próprio OU admin pode cancelar qualquer
    const isOwner = request.createdById === ctx.session.user.id;
    const isAdmin = ['ADMIN', 'SUPER_ADMIN'].includes(ctx.session.user.role);
    
    if (!isOwner && !isAdmin) {
      throw new TRPCError({
        code: 'FORBIDDEN',
        message: 'Only the creator or an admin can cancel this request',
      });
    }
    
    if (request.status === 'APPROVED') {
      throw new TRPCError({
        code: 'BAD_REQUEST',
        message: 'Approved requests cannot be cancelled',
      });
    }
    
    return db.request.update({
      where: { id: input.id },
      data: { status: 'CANCELLED' },
    });
  }),
```

---

### Task 2.3: Atualizar UI - Conditional Rendering
**Arquivo**: `apps/web/src/app/requests/[id]/page.tsx`

**Objetivo**: Mostrar botões apenas quando user tem permissão

**Código**:
```tsx
export default function RequestDetailPage({ params }: { params: { id: string } }) {
  const { data: request } = trpc.request.getById.useQuery({ id: params.id });
  const { data: session } = useSession();
  
  const userRole = session?.user?.role;
  const isAdmin = ['ADMIN', 'SUPER_ADMIN'].includes(userRole);
  const isOwner = request?.createdById === session?.user?.id;
  
  // Lógica de permissões
  const canEdit = request?.status === 'DRAFT' && isOwner;
  const canSubmit = request?.status === 'DRAFT' && isOwner;
  const canStartReview = request?.status === 'PENDING' && isAdmin;
  const canApprove = request?.status === 'IN_REVIEW' && isAdmin;
  const canReject = request?.status === 'IN_REVIEW' && isAdmin;
  const canCorrect = request?.status === 'REJECTED' && isOwner;
  const canCancel = (isOwner || isAdmin) && request?.status !== 'APPROVED';
  
  return (
    <div>
      {/* Request Details */}
      
      {/* Action Buttons */}
      <div className="flex gap-2">
        {canEdit && (
          <Button asChild>
            <Link href={`/requests/${params.id}/edit`}>Editar</Link>
          </Button>
        )}
        
        {canSubmit && (
          <Button onClick={handleSubmit}>Submeter para Aprovação</Button>
        )}
        
        {canStartReview && (
          <Button onClick={handleStartReview}>Iniciar Revisão</Button>
        )}
        
        {canApprove && (
          <Button variant="default" onClick={handleApprove}>Aprovar</Button>
        )}
        
        {canReject && (
          <Button variant="destructive" onClick={handleReject}>Rejeitar</Button>
        )}
        
        {canCorrect && (
          <Button onClick={handleCorrect}>Corrigir</Button>
        )}
        
        {canCancel && (
          <Button variant="outline" onClick={handleCancel}>Cancelar</Button>
        )}
      </div>
    </div>
  );
}
```

---

### Task 2.4: Criar Hook usePermissions
**Arquivo**: `apps/web/src/hooks/use-permissions.ts` (criar)

**Objetivo**: Centralizar lógica de permissões

**Código**:
```typescript
import { useSession } from '@/lib/auth';

export function usePermissions() {
  const { data: session } = useSession();
  
  const userRole = session?.user?.role;
  const userId = session?.user?.id;
  
  const isUser = userRole === 'USER';
  const isAdmin = userRole === 'ADMIN';
  const isSuperAdmin = userRole === 'SUPER_ADMIN';
  const isAdminOrAbove = isAdmin || isSuperAdmin;
  
  return {
    // Role checks
    isUser,
    isAdmin,
    isSuperAdmin,
    isAdminOrAbove,
    
    // Action checks
    canCreateRequest: true, // Todos podem
    canApprove: isAdminOrAbove,
    canReject: isAdminOrAbove,
    canStartReview: isAdminOrAbove,
    canAccessAdmin: isSuperAdmin,
    
    // Resource checks
    canEditRequest: (request: { createdById: string; status: string }) => {
      return request.status === 'DRAFT' && (isAdminOrAbove || request.createdById === userId);
    },
    canCancelRequest: (request: { createdById: string }) => {
      return isAdminOrAbove || request.createdById === userId;
    },
  };
}
```

**Usar no componente**:
```tsx
const permissions = usePermissions();

{permissions.canApprove && (
  <Button onClick={handleApprove}>Aprovar</Button>
)}
```

---

### Task 2.5: Adicionar Role Badge no User Menu
**Arquivo**: `apps/web/src/components/user-menu.tsx`

**Objetivo**: Mostrar role do user

**Código**:
```tsx
<DropdownMenu>
  <DropdownMenuTrigger asChild>
    <Button variant="ghost">
      {session.user.name}
      <Badge variant="secondary">{session.user.role}</Badge>
    </Button>
  </DropdownMenuTrigger>
  <DropdownMenuContent>
    <DropdownMenuItem>Profile</DropdownMenuItem>
    {permissions.canAccessAdmin && (
      <DropdownMenuItem asChild>
        <Link href="/admin">Admin Panel</Link>
      </DropdownMenuItem>
    )}
    <DropdownMenuItem onClick={handleLogout}>Logout</DropdownMenuItem>
  </DropdownMenuContent>
</DropdownMenu>
```

---

### Task 2.6: Seed de Usuários com Roles
**Arquivo**: `packages/db/prisma/seed.ts` (adicionar)

**Objetivo**: Criar users de teste com diferentes roles

**Código**:
```typescript
// Users
const users = await prisma.$transaction([
  // Super Admin
  prisma.user.upsert({
    where: { email: 'pedro@clickcannabis.com' },
    update: {},
    create: {
      id: 'user_pedro',
      name: 'Pedro Mota',
      email: 'pedro@clickcannabis.com',
      role: 'SUPER_ADMIN',
      emailVerified: true,
    },
  }),
  
  // Admin
  prisma.user.upsert({
    where: { email: 'lucas@clickcannabis.com' },
    update: {},
    create: {
      id: 'user_lucas',
      name: 'Lucas Rouxinol',
      email: 'lucas@clickcannabis.com',
      role: 'ADMIN',
      emailVerified: true,
    },
  }),
  
  // User comum
  prisma.user.upsert({
    where: { email: 'samira@clickcannabis.com' },
    update: {},
    create: {
      id: 'user_samira',
      name: 'Samira',
      email: 'samira@clickcannabis.com',
      role: 'USER',
      emailVerified: true,
    },
  }),
]);

console.log(`✅ Created ${users.length} users`);
```

**Executar**:
```bash
npm run db:seed
```

---

## ✅ Critérios de Aceitação

### Funcional
- [ ] USER comum NÃO vê botões de aprovar/rejeitar
- [ ] ADMIN vê botões de aprovar/rejeitar
- [ ] USER pode editar apenas próprios drafts
- [ ] ADMIN pode editar qualquer draft
- [ ] SUPER_ADMIN pode acessar `/admin`
- [ ] USER comum vê 403 em `/admin`

### API
- [ ] Todas mutations validam role
- [ ] Tentativa de aprovar sem permissão retorna 403
- [ ] Logs de erro mostram mensagem clara

### UI
- [ ] Badge de role aparece no menu do user
- [ ] Botões desabilitados têm tooltip explicativo
- [ ] Mensagens de erro são amigáveis

---

## 🚀 Ordem de Execução

**SEQUENCIAL**:
1. Task 2.1 - Middleware
2. Task 2.2 - Aplicar no router
3. Task 2.4 - Hook usePermissions
4. Task 2.3 - UI conditional rendering
5. Task 2.5 - Role badge
6. Task 2.6 - Seed users

---

## 📊 Estimativa de Tempo

| Task | Tempo | Complexidade |
|------|-------|--------------|
| 2.1 | 45 min | Média |
| 2.2 | 2h | Alta |
| 2.3 | 1h | Média |
| 2.4 | 30 min | Baixa |
| 2.5 | 15 min | Baixa |
| 2.6 | 30 min | Baixa |
| **TOTAL** | **~5h** | |

---

## 🔧 Testes Manuais

```bash
# 1. Login como USER
# - Criar request
# - Tentar aprovar → Deve ver botão desabilitado ou oculto
# - Tentar acessar /admin → Deve redirecionar

# 2. Login como ADMIN
# - Ver request de outro user
# - Clicar "Iniciar Revisão" → Deve funcionar
# - Clicar "Aprovar" → Deve funcionar

# 3. Login como SUPER_ADMIN
# - Acessar /admin → Deve funcionar
# - Criar ContentType → Deve funcionar
```

---

**Próxima Fase**: [FASE-3-CUSTOM-FIELDS.md](FASE-3-CUSTOM-FIELDS.md)
