# FASE 0: Correções Urgentes (BLOQUEADOR)

**Status**: 🔴 CRÍTICO - Sistema não funciona sem isso
**Duração Estimada**: 2-4 horas
**Prioridade**: MÁXIMA

---

## 🎯 Objetivo

Fazer o sistema funcionar AGORA:
1. Popular seed data (ContentTypes, Origins)
2. Consertar exports do db package (erros LSP)
3. Atualizar UI para usar IDs ao invés de enums

**SEM ISSO, NADA FUNCIONA.**

---

## 📋 Tasks

### Task 0.1: Fix db/src/index.ts exports
**Problema**: Prisma Client regenerado mas exports desatualizados
**Arquivo**: `packages/db/src/index.ts`

**Erros atuais**:
```
ERROR: Module '"../prisma/generated/enums"' has no exported member 'UserRole'.
ERROR: Module '"../prisma/generated/enums"' has no exported member 'AreaPosition'.
ERROR: Module '"../prisma/generated/client"' has no exported member 'Origin'.
ERROR: Module '"../prisma/generated/client"' has no exported member 'Area'.
ERROR: Module '"../prisma/generated/client"' has no exported member 'AreaMember'.
```

**Ação**: 
1. Verificar o que está em `prisma/generated/enums/index.d.ts`
2. Verificar o que está em `prisma/generated/client/index.d.ts`
3. Ajustar exports conforme o que realmente existe

**Verificação**:
```bash
cd packages/db && npx tsc --noEmit
# Deve retornar: exit 0, sem erros
```

---

### Task 0.2: Criar Seed Data - ContentTypes
**Arquivo**: `packages/db/prisma/seed.ts` (criar)

**ContentTypes a criar** (baseado em `docs/mvp/04-content-types.md`):

| name | slug | description | icon | color |
|------|------|-------------|------|-------|
| Vídeo UGC | video-ugc | Vídeo amador gravado por usuário | Video | #3B82F6 |
| Vídeo Institucional | video-institucional | Vídeo profissional de alta qualidade | VideoCamera | #8B5CF6 |
| Carrossel | carrossel | Sequência de imagens para feed | Images | #10B981 |
| Post Único | post-unico | Imagem única estática | Image | #F59E0B |
| Stories | stories | Conteúdo vertical 24h | Smartphone | #EC4899 |
| Reels | reels | Vídeo vertical curto/dinâmico | Play | #EF4444 |

**Código**:
```typescript
import { PrismaClient } from './prisma/generated/client';

const prisma = new PrismaClient();

async function main() {
  // ContentTypes
  const contentTypes = await prisma.$transaction([
    prisma.contentType.upsert({
      where: { slug: 'video-ugc' },
      update: {},
      create: {
        name: 'Vídeo UGC',
        slug: 'video-ugc',
        description: 'Vídeo amador gravado por usuário',
        icon: 'Video',
        color: '#3B82F6',
        isActive: true,
      },
    }),
    // ... repetir para os outros 5
  ]);

  console.log(`✅ Created ${contentTypes.length} content types`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
```

**Executar**:
```bash
cd packages/db
npx tsx prisma/seed.ts
```

**Verificação**:
```sql
SELECT id, name, slug, color FROM content_type;
-- Deve retornar 6 linhas
```

---

### Task 0.3: Criar Seed Data - Origins
**Arquivo**: `packages/db/prisma/seed.ts` (adicionar)

**Origins a criar** (baseado em `docs/mvp/04-content-types.md`):

| name | slug | description |
|------|------|-------------|
| Oslo | oslo | Agência externa de produção audiovisual |
| Interno | interno | Equipe interna da Click Cannabis |
| Influencer | influencer | Criador de conteúdo externo (UGC) |
| Freelancer | freelancer | Profissional avulso contratado |

**Código**:
```typescript
// Origins
const origins = await prisma.$transaction([
  prisma.origin.upsert({
    where: { slug: 'oslo' },
    update: {},
    create: {
      name: 'Oslo',
      slug: 'oslo',
      description: 'Agência externa de produção audiovisual',
      isActive: true,
    },
  }),
  // ... repetir para os outros 3
]);

console.log(`✅ Created ${origins.length} origins`);
```

**Verificação**:
```sql
SELECT id, name, slug FROM origin;
-- Deve retornar 4 linhas
```

---

### Task 0.4: Criar Seed Data - Areas
**Arquivo**: `packages/db/prisma/seed.ts` (adicionar)

**Areas a criar** (baseado em `docs/mvp/11-contexto-click-cannabis.md`):

| name | slug | description |
|------|------|-------------|
| Content Manager | content-manager | Coordenação geral de conteúdo |
| Design | design | Criação visual e branding |
| Social Media | social-media | Gestão de redes sociais |
| Tráfego | trafego | Gestão de Ads e performance |
| Oslo | oslo | Agência externa de produção |
| UGC Manager | ugc-manager | Gestão de creators e influencers |

**Código**:
```typescript
// Areas
const areas = await prisma.$transaction([
  prisma.area.upsert({
    where: { slug: 'content-manager' },
    update: {},
    create: {
      name: 'Content Manager',
      slug: 'content-manager',
      description: 'Coordenação geral de conteúdo',
      isActive: true,
    },
  }),
  // ... repetir para os outros 5
]);

console.log(`✅ Created ${areas.length} areas`);
```

**Verificação**:
```sql
SELECT id, name, slug FROM area;
-- Deve retornar 6 linhas
```

---

### Task 0.5: Adicionar Script no package.json
**Arquivo**: `packages/db/package.json`

**Adicionar**:
```json
{
  "scripts": {
    "db:seed": "tsx prisma/seed.ts"
  }
}
```

**Verificação**:
```bash
npm run db:seed
# Deve executar sem erros e mostrar:
# ✅ Created 6 content types
# ✅ Created 4 origins
# ✅ Created 6 areas
```

---

### Task 0.6: Criar Hook para Fetch ContentTypes
**Arquivo**: `apps/web/src/hooks/use-content-types.ts` (criar)

**Objetivo**: Hook que busca ContentTypes da API para usar nos forms

**Código**:
```typescript
import { trpc } from '@/utils/trpc';

export function useContentTypes() {
  const { data: contentTypes, isLoading } = trpc.contentType.list.useQuery();
  
  return {
    contentTypes: contentTypes?.items || [],
    isLoading,
  };
}
```

**Requer**: Criar router `contentType` na API (ver Task 0.7)

---

### Task 0.7: Criar Router contentType na API
**Arquivo**: `packages/api/src/routers/content-type.ts` (criar)

**Objetivo**: Endpoint para listar ContentTypes

**Código**:
```typescript
import { z } from "zod";
import db from "@marketingclickcannabis/db";
import { publicProcedure, router } from "../index";

export const contentTypeRouter = router({
  list: publicProcedure.query(async () => {
    const items = await db.contentType.findMany({
      where: { isActive: true },
      orderBy: { name: "asc" },
    });
    
    return { items };
  }),
});
```

**Registrar em**: `packages/api/src/routers/index.ts`
```typescript
import { contentTypeRouter } from "./content-type";

export const appRouter = router({
  request: requestRouter,
  contentType: contentTypeRouter, // ADICIONAR
  // ... outros
});
```

**Verificação**:
```bash
# No browser console:
trpc.contentType.list.query()
# Deve retornar { items: [{id, name, slug, ...}, ...] }
```

---

### Task 0.8: Criar Router origin na API
**Arquivo**: `packages/api/src/routers/origin.ts` (criar)

**Código**: Igual ao contentType, mas para Origin

**Verificação**: `trpc.origin.list.query()` funciona

---

### Task 0.9: Atualizar Form de Criar Request
**Arquivo**: `apps/web/src/app/requests/new/page.tsx`

**Mudanças**:
1. Importar `useContentTypes()` e `useOrigins()`
2. Substituir hardcoded options pelos dados da API
3. Form state passa a guardar `contentTypeId` (cuid) ao invés de `contentType` (string)
4. Enviar `contentTypeId` e `originId` para API

**Antes**:
```typescript
const [formData, setFormData] = useState({
  contentType: "" as ContentType | "", // ENUM
  origin: "" as RequestOrigin | "",    // ENUM
});

// Enviar:
contentType: formData.contentType as ContentType,
origin: formData.origin as RequestOrigin,
```

**Depois**:
```typescript
const { contentTypes } = useContentTypes();
const { origins } = useOrigins();

const [formData, setFormData] = useState({
  contentTypeId: "", // CUID
  originId: "",      // CUID
});

// Enviar:
contentTypeId: formData.contentTypeId,
originId: formData.originId,
```

**Select component**:
```tsx
<Select
  value={formData.contentTypeId}
  onValueChange={(value) => setFormData({ ...formData, contentTypeId: value })}
>
  <SelectContent>
    {contentTypes.map((ct) => (
      <SelectItem key={ct.id} value={ct.id}>{ct.name}</SelectItem>
    ))}
  </SelectContent>
</Select>
```

**Verificação**:
1. Abrir `/requests/new`
2. Selects devem mostrar opções vindas do banco
3. Ao submeter, console.log deve mostrar `contentTypeId` e `originId` como cuids
4. Request deve ser criado com sucesso

---

### Task 0.10: Atualizar RequestCard
**Arquivo**: `apps/web/src/components/request-card.tsx`

**Problema**: Tenta acessar `request.contentType` como string, mas é objeto

**Mudanças**:
1. Interface deve refletir que contentType/origin são objetos
2. Display deve usar `.name`

**Antes**:
```typescript
interface RequestCardProps {
  request: {
    contentType: string;  // ❌ Errado
    origin: string;       // ❌ Errado
  };
}

// Render:
{contentTypeLabels[request.contentType] || request.contentType}
```

**Depois**:
```typescript
interface RequestCardProps {
  request: {
    contentType?: { id: string; name: string; slug: string; color?: string } | null;
    origin?: { id: string; name: string; slug: string } | null;
  };
}

// Render:
{request.contentType?.name || "N/A"}
{request.origin?.name || "N/A"}

// BONUS: Usar cor do ContentType
<span style={{ color: request.contentType?.color }}>
  {request.contentType?.name}
</span>
```

**Verificação**:
1. Dashboard deve renderizar cards corretamente
2. Nomes de ContentType e Origin devem aparecer
3. Não deve ter erros no console

---

### Task 0.11: Atualizar RequestFilters
**Arquivo**: `apps/web/src/components/request-filters.tsx`

**Problema**: Filtros hardcoded com enums

**Mudanças**:
1. Carregar ContentTypes dinamicamente
2. Filtrar por `contentTypeId` ao invés de enum string

**Código**:
```typescript
const { contentTypes } = useContentTypes();

// No Select:
<SelectContent>
  <SelectItem value="ALL">Todos</SelectItem>
  {contentTypes.map((ct) => (
    <SelectItem key={ct.id} value={ct.id}>{ct.name}</SelectItem>
  ))}
</SelectContent>
```

**API**: O filtro `contentType` que a API recebe já está mapeado para `contentTypeId` internamente (ver `packages/api/src/routers/request.ts` linha 85-87)

**Verificação**:
1. Filtros devem aparecer com dados dinâmicos
2. Ao filtrar por ContentType, lista deve atualizar
3. URL deve refletir o filtro

---

## ✅ Critérios de Aceitação

### Funcional
- [ ] Seed script executa sem erros
- [ ] 6 ContentTypes criados no banco
- [ ] 4 Origins criados no banco
- [ ] 6 Areas criados no banco
- [ ] API routers funcionando (contentType.list, origin.list)
- [ ] Form de criar request usa IDs
- [ ] Request criado com sucesso através do form
- [ ] Dashboard renderiza cards corretamente
- [ ] Filtros funcionam

### Técnico
- [ ] `npx tsc --noEmit` passa em todos os packages
- [ ] Nenhum erro LSP
- [ ] Nenhum erro no console do browser
- [ ] Build passa: `npm run build`

### Manual
- [ ] Criar request → Submeter → Aparece no dashboard
- [ ] Card mostra ContentType e Origin corretos
- [ ] Filtros atualizam a lista

---

## 🚀 Ordem de Execução

**SEQUENCIAL** (cada task depende da anterior):

1. Task 0.1 - Fix exports
2. Task 0.2 - Seed ContentTypes
3. Task 0.3 - Seed Origins
4. Task 0.4 - Seed Areas
5. Task 0.5 - Add script
6. Task 0.7 - API contentType router
7. Task 0.8 - API origin router
8. Task 0.6 - Hook useContentTypes (depende de 0.7)
9. Task 0.9 - Update form (depende de 0.6)
10. Task 0.10 - Update card
11. Task 0.11 - Update filters

---

## 📊 Estimativa de Tempo

| Task | Tempo | Complexidade |
|------|-------|--------------|
| 0.1 | 15 min | Baixa |
| 0.2-0.4 | 30 min | Baixa |
| 0.5 | 5 min | Trivial |
| 0.6-0.8 | 30 min | Baixa |
| 0.9 | 45 min | Média |
| 0.10 | 20 min | Baixa |
| 0.11 | 20 min | Baixa |
| **TOTAL** | **~3 horas** | |

---

## 🔧 Comandos de Verificação

Após todas as tasks:

```bash
# 1. Verificar banco
docker exec mktclick-postgres psql -U postgres -d mktclick -c "SELECT COUNT(*) FROM content_type;"
# Deve retornar: 6

docker exec mktclick-postgres psql -U postgres -d mktclick -c "SELECT COUNT(*) FROM origin;"
# Deve retornar: 4

docker exec mktclick-postgres psql -U postgres -d mktclick -c "SELECT COUNT(*) FROM area;"
# Deve retornar: 6

# 2. Build
npm run build
# Deve retornar: exit 0

# 3. Types
cd packages/db && npx tsc --noEmit
cd packages/api && npx tsc --noEmit
cd apps/web && npx tsc --noEmit
# Todos devem retornar: exit 0

# 4. Dev server
npm run dev
# Abrir http://localhost:3001/requests/new
# Form deve carregar opções de ContentType e Origin
# Criar request deve funcionar
```

---

**Próxima Fase**: [FASE-1-ADMIN-PANEL.md](FASE-1-ADMIN-PANEL.md)
