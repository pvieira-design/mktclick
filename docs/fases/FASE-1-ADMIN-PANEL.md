# FASE 1: Admin Panel - Gerenciar ContentTypes, Origins e Areas

**Status**: 🟡 Importante - Sistema funciona, mas sem UI de gestão
**Duração Estimada**: 6-8 horas
**Prioridade**: ALTA
**Depende de**: FASE-0 (seed data deve existir)

---

## 🎯 Objetivo

Criar interface administrativa para:
1. **ContentTypes**: CRUD completo (criar, editar, desativar, reordenar)
2. **Origins**: CRUD completo
3. **Areas**: CRUD completo + atribuir membros
4. **Permissions**: Ver quem pode aprovar em cada área

**SEM ISSO**: Admin precisa editar banco manualmente

---

## 📋 Tasks

### Task 1.1: Criar Layout do Admin
**Arquivo**: `apps/web/src/app/admin/layout.tsx` (criar)

**Objetivo**: Sidebar específica para área admin

**Features**:
- Tab navigation: ContentTypes | Origins | Areas | Settings
- Only visible to SUPER_ADMIN
- Breadcrumbs

**Código**:
```typescript
import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';

export default async function AdminLayout({ children }: { children: React.Node }) {
  const session = await auth();
  
  if (!session?.user || session.user.role !== 'SUPER_ADMIN') {
    redirect('/dashboard');
  }
  
  return (
    <div className="flex">
      <aside className="w-64 border-r">
        <nav>
          <Link href="/admin/content-types">Content Types</Link>
          <Link href="/admin/origins">Origins</Link>
          <Link href="/admin/areas">Areas</Link>
        </nav>
      </aside>
      <main className="flex-1 p-8">{children}</main>
    </div>
  );
}
```

**Verificação**:
- USER comum não consegue acessar `/admin`
- SUPER_ADMIN vê sidebar

---

### Task 1.2: ContentTypes - Lista
**Arquivo**: `apps/web/src/app/admin/content-types/page.tsx` (criar)

**Features**:
- Tabela com: Name, Slug, Color (preview), Icon, isActive, Ações
- Botão "Novo Content Type"
- Botão "Desativar/Ativar" em cada linha
- Drag & drop para reordenar (opcional)

**Componente**:
```tsx
export default function ContentTypesPage() {
  const { data } = trpc.contentType.list.useQuery();
  
  return (
    <div>
      <div className="flex justify-between">
        <h1>Content Types</h1>
        <Button asChild>
          <Link href="/admin/content-types/new">Novo</Link>
        </Button>
      </div>
      
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Name</TableCell>
            <TableCell>Slug</TableCell>
            <TableCell>Color</TableCell>
            <TableCell>Active</TableCell>
            <TableCell>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {data?.items.map((ct) => (
            <TableRow key={ct.id}>
              <TableCell>{ct.name}</TableCell>
              <TableCell>{ct.slug}</TableCell>
              <TableCell>
                <div className="w-6 h-6 rounded" style={{ backgroundColor: ct.color }} />
              </TableCell>
              <TableCell>{ct.isActive ? '✓' : '✗'}</TableCell>
              <TableCell>
                <Button variant="ghost" asChild>
                  <Link href={`/admin/content-types/${ct.id}/edit`}>Edit</Link>
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
```

---

### Task 1.3: ContentTypes - Form (Criar/Editar)
**Arquivo**: `apps/web/src/app/admin/content-types/[id]/edit/page.tsx` (criar)
**Arquivo**: `apps/web/src/app/admin/content-types/new/page.tsx` (criar)

**Fields**:
- Name (String, required, 3-100 chars)
- Slug (String, required, auto-generated from name, unique)
- Description (Text, optional)
- Icon (String, select from Lucide icons list)
- Color (Color picker, hex)
- isActive (Checkbox, default true)

**Validação**:
- Slug único
- Color formato hex válido
- Icon deve existir em Lucide

**Código** (simplificado):
```tsx
export default function ContentTypeForm({ params }: { params: { id?: string } }) {
  const isEdit = !!params.id;
  const { data: contentType } = trpc.contentType.getById.useQuery(
    { id: params.id! },
    { enabled: isEdit }
  );
  
  const createMutation = trpc.contentType.create.useMutation();
  const updateMutation = trpc.contentType.update.useMutation();
  
  const [formData, setFormData] = useState({
    name: contentType?.name || '',
    slug: contentType?.slug || '',
    description: contentType?.description || '',
    icon: contentType?.icon || 'FileText',
    color: contentType?.color || '#3B82F6',
    isActive: contentType?.isActive ?? true,
  });
  
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (isEdit) {
      await updateMutation.mutateAsync({ id: params.id!, ...formData });
    } else {
      await createMutation.mutateAsync(formData);
    }
    router.push('/admin/content-types');
  };
  
  return (
    <form onSubmit={handleSubmit}>
      <Input label="Name" value={formData.name} onChange={...} />
      <Input label="Slug" value={formData.slug} onChange={...} />
      <Textarea label="Description" value={formData.description} onChange={...} />
      <Select label="Icon" value={formData.icon} onChange={...}>
        {/* List of Lucide icons */}
      </Select>
      <Input type="color" label="Color" value={formData.color} onChange={...} />
      <Checkbox label="Active" checked={formData.isActive} onChange={...} />
      <Button type="submit">{isEdit ? 'Update' : 'Create'}</Button>
    </form>
  );
}
```

---

### Task 1.4: ContentTypes - API Completa
**Arquivo**: `packages/api/src/routers/content-type.ts`

**Adicionar procedures**:
```typescript
export const contentTypeRouter = router({
  list: publicProcedure.query(...), // JÁ EXISTE
  
  getById: publicProcedure
    .input(z.object({ id: z.string().cuid() }))
    .query(async ({ input }) => {
      const ct = await db.contentType.findUnique({ where: { id: input.id } });
      if (!ct) throw new TRPCError({ code: 'NOT_FOUND' });
      return ct;
    }),
  
  create: adminProcedure
    .input(z.object({
      name: z.string().min(3).max(100),
      slug: z.string().regex(/^[a-z0-9-]+$/),
      description: z.string().optional(),
      icon: z.string(),
      color: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
      isActive: z.boolean().default(true),
    }))
    .mutation(async ({ input }) => {
      // Check unique slug
      const existing = await db.contentType.findUnique({ where: { slug: input.slug } });
      if (existing) throw new TRPCError({ code: 'CONFLICT', message: 'Slug already exists' });
      
      return db.contentType.create({ data: input });
    }),
  
  update: adminProcedure
    .input(z.object({
      id: z.string().cuid(),
      name: z.string().min(3).max(100).optional(),
      slug: z.string().regex(/^[a-z0-9-]+$/).optional(),
      description: z.string().optional(),
      icon: z.string().optional(),
      color: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
      isActive: z.boolean().optional(),
    }))
    .mutation(async ({ input }) => {
      const { id, ...data } = input;
      return db.contentType.update({ where: { id }, data });
    }),
  
  toggleActive: adminProcedure
    .input(z.object({ id: z.string().cuid() }))
    .mutation(async ({ input }) => {
      const ct = await db.contentType.findUnique({ where: { id: input.id } });
      if (!ct) throw new TRPCError({ code: 'NOT_FOUND' });
      
      return db.contentType.update({
        where: { id: input.id },
        data: { isActive: !ct.isActive },
      });
    }),
});
```

**Middleware `adminProcedure`**:
```typescript
// packages/api/src/index.ts
export const adminProcedure = protectedProcedure.use(async ({ ctx, next }) => {
  if (!['ADMIN', 'SUPER_ADMIN'].includes(ctx.session.user.role)) {
    throw new TRPCError({ code: 'FORBIDDEN' });
  }
  return next();
});
```

---

### Task 1.5: Origins - CRUD Completo
**Similar ao ContentTypes**, mas mais simples (sem icon/color)

**Arquivos**:
- `apps/web/src/app/admin/origins/page.tsx` - Lista
- `apps/web/src/app/admin/origins/new/page.tsx` - Form criar
- `apps/web/src/app/admin/origins/[id]/edit/page.tsx` - Form editar
- `packages/api/src/routers/origin.ts` - API completa

**Fields**:
- name (String, required)
- slug (String, required, unique)
- description (Text, optional)
- isActive (Boolean, default true)

---

### Task 1.6: Areas - CRUD Completo
**Similar aos anteriores**

**Arquivos**:
- `apps/web/src/app/admin/areas/page.tsx` - Lista
- `apps/web/src/app/admin/areas/new/page.tsx` - Form criar
- `apps/web/src/app/admin/areas/[id]/edit/page.tsx` - Form editar
- `packages/api/src/routers/area.ts` - API completa

**Fields**:
- name (String, required)
- slug (String, required, unique)
- description (Text, optional)
- isActive (Boolean, default true)

---

### Task 1.7: Area Members - Atribuir Usuários
**Arquivo**: `apps/web/src/app/admin/areas/[id]/members/page.tsx` (criar)

**Features**:
- Lista de membros atuais com posição (HEAD, COORDINATOR, STAFF)
- Botão "Add Member"
- Modal para selecionar user e posição
- Validação: max 1 HEAD, max 1 COORDINATOR

**API** (`packages/api/src/routers/area.ts`):
```typescript
addMember: adminProcedure
  .input(z.object({
    areaId: z.string().cuid(),
    userId: z.string().cuid(),
    position: z.enum(['HEAD', 'COORDINATOR', 'STAFF']),
  }))
  .mutation(async ({ input }) => {
    // Check constraints
    if (input.position === 'HEAD' || input.position === 'COORDINATOR') {
      const existing = await db.areaMember.findFirst({
        where: { areaId: input.areaId, position: input.position },
      });
      if (existing) {
        throw new TRPCError({
          code: 'CONFLICT',
          message: `Area already has a ${input.position}`,
        });
      }
    }
    
    return db.areaMember.create({ data: input });
  }),

removeMember: adminProcedure
  .input(z.object({ id: z.string().cuid() }))
  .mutation(async ({ input }) => {
    return db.areaMember.delete({ where: { id: input.id } });
  }),
```

---

## ✅ Critérios de Aceitação

### ContentTypes
- [ ] Admin pode listar todos ContentTypes
- [ ] Admin pode criar novo ContentType
- [ ] Admin pode editar ContentType existente
- [ ] Admin pode desativar/ativar ContentType
- [ ] Slug é único (validação)
- [ ] Color preview funciona
- [ ] Ao desativar, não aparece mais nos forms de request

### Origins
- [ ] Admin pode listar todos Origins
- [ ] Admin pode criar novo Origin
- [ ] Admin pode editar Origin existente
- [ ] Admin pode desativar/ativar Origin

### Areas
- [ ] Admin pode listar todas Areas
- [ ] Admin pode criar nova Area
- [ ] Admin pode editar Area existente
- [ ] Admin pode atribuir membros
- [ ] Validação: max 1 HEAD por área
- [ ] Validação: max 1 COORDINATOR por área
- [ ] STAFF ilimitado

### Segurança
- [ ] Apenas SUPER_ADMIN acessa `/admin`
- [ ] USER comum vê 403 ou redirect
- [ ] API valida role em todas mutations

---

## 🚀 Ordem de Execução

**PARALELO** (podem ser feitos em paralelo):
- Task 1.2-1.4 (ContentTypes)
- Task 1.5 (Origins)
- Task 1.6-1.7 (Areas)

**SEQUENCIAL**:
1. Task 1.1 (Layout) - PRIMEIRO
2. Tasks paralelas
3. Testes integrados

---

## 📊 Estimativa de Tempo

| Task | Tempo | Complexidade |
|------|-------|--------------|
| 1.1 | 30 min | Baixa |
| 1.2-1.4 | 3h | Média |
| 1.5 | 1h | Baixa |
| 1.6-1.7 | 2h | Média |
| **TOTAL** | **~6-7h** | |

---

**Próxima Fase**: [FASE-2-PERMISSOES.md](FASE-2-PERMISSOES.md)
