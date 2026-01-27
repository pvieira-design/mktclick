# Plano de Implementação - Fases

**Data**: 27/01/2026
**Status**: FASE-0 em execução

---

## 📊 Visão Geral

| Fase | Status | Duração | Prioridade | Bloqueador? |
|------|--------|---------|------------|-------------|
| [FASE-0](FASE-0-CORRECOES-URGENTES.md) | 🔴 TODO | 2-4h | CRÍTICA | ✅ SIM |
| [FASE-1](FASE-1-ADMIN-PANEL.md) | ⭕ Pendente | 6-8h | ALTA | ❌ |
| [FASE-2](FASE-2-PERMISSOES.md) | ⭕ Pendente | 4-6h | ALTA | ❌ |
| FASE-3 | ⭕ Não criada | TBD | MÉDIA | ❌ |

---

## 🎯 Estado Atual

### ✅ Implementado
- Database schema completo (Area, ContentType, Origin, Request)
- API tRPC com todos endpoints (create, update, approve, reject, etc.)
- UI básica (dashboard, form criar, detalhes)
- shadcn/ui components instalados

### ❌ Bloqueadores Críticos
1. **Sem Seed Data** - Tabelas vazias, sistema não funciona
2. **UI Desatualizada** - Forms tentam enviar ENUMs ao invés de IDs
3. **LSP Errors** - Exports quebrados no db package

### 🟡 Funciona mas Incompleto
- Permissões (estrutura pronta, falta validação)
- Admin Panel (não existe)
- Custom Fields (não existe)

---

## 🚀 Próximos Passos

### Agora (URGENTE)
1. Executar [FASE-0](FASE-0-CORRECOES-URGENTES.md)
   - Fix LSP errors
   - Criar seed data
   - Atualizar UI para usar IDs

### Depois (IMPORTANTE)
2. Executar [FASE-1](FASE-1-ADMIN-PANEL.md)
   - Admin panel para gerenciar ContentTypes/Origins/Areas
   - UI amigável para configuração

3. Executar [FASE-2](FASE-2-PERMISSOES.md)
   - Sistema de permissões completo
   - Validações na API
   - UI condicional baseada em role

### Futuro (DESEJÁVEL)
4. FASE-3: Custom Fields por ContentType
5. FASE-4: Workflows configuráveis
6. FASE-5: Notificações e integrações

---

## 📖 Como Usar Este Plano

### Para Iniciar Uma Fase

1. **Ler o arquivo da fase** (ex: `FASE-0-CORRECOES-URGENTES.md`)
2. **Verificar dependências** - Se depende de fase anterior, completar primeiro
3. **Executar tasks na ordem** - Algumas podem ser paralelas, outras são sequenciais
4. **Verificar critérios de aceitação** - Todos devem passar
5. **Marcar como completa** - Atualizar este README

### Estrutura de Cada Fase

Cada arquivo de fase contém:
- **Objetivo** - O que será implementado
- **Tasks detalhadas** - Passo a passo
- **Código de exemplo** - Snippets prontos
- **Critérios de aceitação** - Como saber que está pronto
- **Verificação** - Comandos para testar
- **Estimativa de tempo** - Quanto tempo leva

---

## 🔗 Links Úteis

- [Estado Atual Completo](../ESTADO_ATUAL.md)
- [Documentação MVP](../mvp/README.md)
- [Modelo de Dados](../mvp/03-modelo-dados.md)
- [Regras de Negócio](../mvp/05-regras-negocio.md)

---

## ✅ Checklist Geral

### FASE-0: Correções Urgentes
- [ ] LSP errors corrigidos
- [ ] Seed data criado (ContentTypes, Origins, Areas)
- [ ] API routers para ContentType/Origin
- [ ] UI atualizada para usar IDs
- [ ] Sistema funciona end-to-end

### FASE-1: Admin Panel
- [ ] Layout admin criado
- [ ] CRUD ContentTypes completo
- [ ] CRUD Origins completo
- [ ] CRUD Areas completo
- [ ] Atribuir membros a Areas

### FASE-2: Permissões
- [ ] Middleware de autorização
- [ ] Validações na API
- [ ] UI condicional (botões ocultos/desabilitados)
- [ ] Hook usePermissions
- [ ] Seed de users com roles

---

## 📞 Suporte

Se você está implementando e tem dúvidas:
1. Leia o arquivo da fase específica
2. Consulte a documentação MVP em `docs/mvp/`
3. Verifique `docs/ESTADO_ATUAL.md` para contexto

---

**Última atualização**: 27/01/2026 16:30
