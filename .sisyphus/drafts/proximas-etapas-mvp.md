# Draft: Proximas Etapas MVP - Marketing Click Cannabis

## Data: 28/01/2026

---

## Estado Atual Verificado (vs Documentacao Desatualizada)

### O que a documentacao diz vs realidade

| Componente | docs/ESTADO_ATUAL.md (27/01) | Realidade (28/01) |
|------------|------------------------------|-------------------|
| Seed Data | 0% - BLOQUEADOR | **100% - Executado** |
| Forms UI | Usam enums hardcoded | **Usam IDs dinamicos** (useContentTypes, useOrigins) |
| Admin Panel | 0% - Nao iniciado | **95% completo** (CRUD areas, content-types, origins, users) |
| Modulo Criadores | Nao mencionado | **100% implementado** (Creator, CreatorParticipation) |
| Permissoes | 30% estrutura | **60%** - adminProcedure funciona, workflow validator existe |

### Descobertas Criticas da Exploracao

1. **Forms de Request estao CORRETOS**: Usam `useContentTypes()` e `useOrigins()` hooks que buscam dados da API dinamicamente

2. **Admin Panel quase completo**: 
   - Areas: CRUD + gestao de membros
   - Content Types: CRUD + campos customizados + workflow steps + permissoes
   - Origins: CRUD completo
   - Users: CRUD + reset password + ban/unban
   - **GAP**: UI restringe a SUPER_ADMIN mas API permite ADMIN

3. **Sistema de Permissoes - GAPS IMPORTANTES**:
   - `canUserCreateRequestOfType` existe mas NAO E USADO no router de create
   - `approve/reject` usam logica simplificada (reviewedById == userId) vs workflow steps que usam Area/Position
   - Falta ownership check em algumas mutations

4. **Upload de Arquivos**:
   - Router Vercel Blob EXISTE e funciona
   - UI do DynamicFieldRenderer suporta FILE type
   - **GAP**: `onFileUpload` handler NAO ESTA CONECTADO nos forms new/edit

5. **Custom Fields**:
   - Schema completo (FieldType enum, RequestFieldValue)
   - DynamicFieldRenderer implementado
   - Funciona end-to-end para campos configurados

---

## Gaps Criticos para Sistema Funcionar End-to-End

### PRIORIDADE 1: Validacao de Permissoes (Seguranca)

**Problema**: Qualquer usuario logado pode criar qualquer tipo de request
**Impacto**: Viola regras de negocio (Oslo nao deveria criar Video UGC, por exemplo)
**Solucao**: Integrar `canUserCreateRequestOfType` no mutation create

### PRIORIDADE 2: Upload de Arquivos Funcional

**Problema**: UI existe, backend existe, mas nao estao conectados
**Impacto**: Usuarios nao conseguem anexar arquivos aos requests
**Solucao**: Conectar `onFileUpload` handler nos forms

### PRIORIDADE 3: Consistencia Approve/Reject vs Workflow

**Problema**: Duas logicas diferentes para aprovacao
**Impacto**: Confusao e possiveis bypasses de seguranca
**Solucao**: Consolidar approve/reject para usar workflow validator

### PRIORIDADE 4: Admin UI Role Mismatch

**Problema**: UI exige SUPER_ADMIN mas API aceita ADMIN
**Impacto**: Admins regulares bloqueados da interface
**Solucao**: Ajustar layout.tsx para aceitar ADMIN

---

## Features Sugeridas (Roadmap Fase 2)

Do roadmap original, removendo integracoes externas:

| Feature | Impacto | Esforco | Dependencias |
|---------|---------|---------|--------------|
| Upload de Arquivos | Alto | Baixo | Conectar UI existente |
| Sistema de Comentarios | Alto | Medio | Nova feature |
| Dashboard com Metricas | Alto | Medio | Dados ja existem |
| Notificacoes In-App | Medio | Medio | Nova infra |
| Notificacoes Email (Resend) | Medio | Medio | Config externa |
| Templates/Duplicacao | Medio | Baixo | Logica simples |
| Busca Avancada | Baixo | Medio | Full-text search |

---

## Decisoes Pendentes do Usuario

1. **Permissoes para ADMIN**: ADMINs devem ter acesso ao painel admin ou apenas SUPER_ADMIN?

2. **Prioridade de Features**: 
   - Foco em completar gaps de seguranca primeiro?
   - Ou priorizar features de colaboracao (comentarios)?

3. **Notificacoes**: 
   - Comecar com in-app apenas?
   - Ou ja configurar Resend para email?

4. **Testes**: 
   - Existe infra de testes? Quer TDD?
   - Ou verificacao manual?

---

## Resumo de Pesquisa dos Agentes

### Agent 1: Forms de Request
- Forms usam IDs dinamicos (CORRETO)
- Hooks useContentTypes/useOrigins funcionam
- Custom fields carregam dinamicamente
- NAO ha TODOs pendentes

### Agent 2: Admin Panel  
- CRUD 95% completo para todas entidades
- Validacao com Zod no backend
- Toasts com Sonner
- GAP: Role mismatch SUPER_ADMIN vs ADMIN

### Agent 3: Permissoes
- adminProcedure implementado corretamente
- protectedProcedure funciona
- workflow-validator.ts tem logica completa
- GAPS: canUserCreateRequestOfType nao usado, approve/reject inconsistente

### Agent 4: Uploads
- Vercel Blob configurado e funciona
- DynamicFieldRenderer suporta FILE
- GAP: onFileUpload nao conectado nos forms
