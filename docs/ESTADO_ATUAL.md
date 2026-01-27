# Estado Atual do Sistema - 27/01/2026

## ✅ O QUE JÁ ESTÁ IMPLEMENTADO

### Database (Prisma)
- ✅ Schema completo em `packages/db/prisma/schema/`:
  - ✅ `area.prisma` - Area, AreaMember, AreaPosition enum
  - ✅ `content-config.prisma` - ContentType, Origin models
  - ✅ `auth.prisma` - User com UserRole enum, relação com AreaMember
  - ✅ `request.prisma` - Request, RequestHistory (usando contentTypeId/originId FK)
- ✅ Migration aplicada no banco
- ✅ Tabelas criadas: area, area_member, content_type, origin, request, request_history

### API (tRPC)
- ✅ Router completo em `packages/api/src/routers/request.ts`:
  - ✅ list: lista com filtros (status, contentType, search)
  - ✅ getById: busca por ID com relations incluídas
  - ✅ create: cria request com contentTypeId/originId
  - ✅ update: edita request (draft only)
  - ✅ submit: draft → pending
  - ✅ startReview: pending → in_review
  - ✅ approve: in_review → approved
  - ✅ reject: in_review → rejected (com motivo)
  - ✅ correct: rejected → draft
  - ✅ cancel: cancela request
- ✅ Validações Zod atualizadas para FK (contentTypeId, originId como cuid)
- ✅ Relations incluídas: contentType, origin, createdBy

### UI Components (shadcn/ui)
- ✅ `RequestCard.tsx` - Card para listar requests
- ✅ `StatusBadge.tsx` - Badge de status com cores
- ✅ `RequestFilters.tsx` - Filtros com debounce
- ✅ Sidebar com navegação

### Pages
- ✅ `/dashboard` - Lista de requests com filtros
- ✅ `/requests/new` - Form de criação
- ✅ `/requests/[id]` - Página de detalhes
- ✅ `/requests/[id]/edit` - Form de edição

---

## ❌ O QUE ESTÁ QUEBRADO (PRECISA CONSERTAR)

### 1. SEED DATA FALTANDO
**Problema**: Tabelas `content_type` e `origin` estão VAZIAS.
- Não há ContentTypes cadastrados (VIDEO_UGC, CARROSSEL, etc.)
- Não há Origins cadastrados (OSLO, INTERNO, INFLUENCER)
- Forms não conseguem criar requests porque não tem IDs para referenciar

**Impacto**: Sistema não funciona - não é possível criar requests

### 2. UI DESATUALIZADA
**Problema**: Componentes ainda esperam ENUM strings, mas API retorna objetos

**Arquivos afetados**:
- `apps/web/src/app/requests/new/page.tsx` - Form envia enum string, precisa enviar ID
- `apps/web/src/components/request-card.tsx` - Espera string, recebe objeto {id, name, slug}
- `apps/web/src/components/request-filters.tsx` - Filtra por enum string hardcoded

**Impacto**: 
- Formulário de criar request não funciona (tenta enviar "VIDEO_UGC" mas API espera cuid)
- Cards podem quebrar se tentarem acessar `request.contentType` como string

### 3. ÁREAS NÃO CONFIGURADAS
**Problema**: Tabela `area` e `area_member` vazias
- Nenhuma área criada (Content Manager, Design, Oslo, etc.)
- Nenhum membro atribuído
- Sistema de permissões não funciona sem áreas

**Impacto**: Funcionalidade de aprovação por área não funciona

### 4. ROLES NÃO IMPLEMENTADOS
**Problema**: Better Auth configurado, mas roles não estão sendo validados
- Todos users têm role `USER` (default)
- Não há admin/head para aprovar
- Não há validação de permissões nas ações

**Impacto**: Qualquer user pode fazer qualquer ação (sem controle)

---

## 🎯 PRIORIDADES PARA PRÓXIMOS PASSOS

### CRÍTICO (Sistema não funciona sem isso)
1. **Criar SEED DATA** - Popular ContentType e Origin
2. **Consertar UI** - Forms e componentes usarem IDs ao invés de enums

### IMPORTANTE (Funcionalidade core)
3. **Seed de Áreas** - Criar áreas iniciais
4. **Implementar Permissões** - Validar roles nas ações (approve, reject)

### DESEJÁVEL (Melhoria)
5. **Admin Panel** - Tela para gerenciar ContentTypes, Origins, Areas
6. **Custom Fields** - Campos dinâmicos por ContentType

---

## 📊 MÉTRICAS DE PROGRESSO

| Componente | Progresso | Status |
|-----------|-----------|--------|
| Database Schema | 100% | ✅ Completo |
| API Routes | 100% | ✅ Completo |
| Seed Data | 0% | ❌ Bloqueador |
| UI Components | 60% | 🟡 Precisa atualizar |
| Pages | 70% | 🟡 Precisa atualizar |
| Permissões | 30% | 🟡 Estrutura pronta, falta validação |
| Admin Panel | 0% | ⭕ Não iniciado |

---

## 🔧 FERRAMENTAS INSTALADAS

### Stack Atual
- Next.js 15
- tRPC 11
- Prisma 7
- Better Auth (auth configurado)
- shadcn/ui (componentes instalados: button, input, textarea, select, badge, card, dialog, separator)
- Sonner (toasts)
- TailwindCSS 4

### Database
- PostgreSQL no Docker (porta 5433)
- Database: `mktclick`
- Tables: 11 (todas criadas e sincronizadas)

---

## 📁 ESTRUTURA DE ARQUIVOS

```
marketingclickcannabis/
├── apps/web/                              # Frontend Next.js
│   ├── src/
│   │   ├── app/
│   │   │   ├── dashboard/page.tsx         # ✅ Lista requests
│   │   │   ├── requests/
│   │   │   │   ├── new/page.tsx           # 🟡 Precisa atualizar
│   │   │   │   ├── [id]/page.tsx          # 🟡 Precisa atualizar
│   │   │   │   └── [id]/edit/page.tsx     # 🟡 Precisa atualizar
│   │   ├── components/
│   │   │   ├── request-card.tsx           # 🟡 Precisa atualizar
│   │   │   ├── status-badge.tsx           # ✅ OK
│   │   │   ├── request-filters.tsx        # 🟡 Precisa atualizar
│   │   │   └── ui/                        # ✅ shadcn components
├── packages/
│   ├── db/                                # Database
│   │   ├── prisma/
│   │   │   └── schema/
│   │   │       ├── area.prisma            # ✅ OK
│   │   │       ├── content-config.prisma  # ✅ OK
│   │   │       ├── auth.prisma            # ✅ OK
│   │   │       └── request.prisma         # ✅ OK
│   │   └── src/index.ts                   # ✅ Exports atualizados
│   ├── api/                               # tRPC API
│   │   └── src/routers/request.ts         # ✅ OK
│   └── auth/                              # Better Auth
│       └── src/index.ts                   # ✅ Configurado
├── docs/
│   └── mvp/                               # ✅ Documentação completa
```

---

## 🚨 DECISÕES TÉCNICAS TOMADAS

### 1. ENUMs → Tabelas Configuráveis
**Decisão**: Transformar ContentType e Origin de enums fixos para tabelas
**Razão**: Permite admin configurar tipos sem deploy
**Status**: ✅ Implementado no schema e API, ❌ Falta seed data e atualizar UI

### 2. Áreas como Entidade
**Decisão**: Criar modelo Area com membros e posições (HEAD, COORDINATOR, STAFF)
**Razão**: Suportar fluxo de aprovação por área no futuro
**Status**: ✅ Schema criado, ❌ Falta seed data

### 3. UserRole Enum
**Decisão**: Usar enum UserRole (USER, ADMIN, SUPER_ADMIN) ao invés de string
**Razão**: Type safety
**Status**: ✅ Implementado no schema, ❌ Falta validação na API

### 4. Keep It Simple
**Decisão**: Manter shadcn/ui (não adicionar Untitled UI)
**Razão**: Stack já funcional, foco em features
**Status**: ✅ Mantido

---

**Última atualização**: 27/01/2026 15:45
**Autor**: Atlas (Orchestrator)
