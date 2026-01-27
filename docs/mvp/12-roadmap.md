# Roadmap & Checklist

[◀ Anterior](11-contexto-click-cannabis.md) | [Índice](README.md)

---

## Fases de Desenvolvimento

### Fase 1: MVP (Atual)

**Status**: Em desenvolvimento

**Funcionalidades**:
- ✅ Gestão de Requests (CRUD)
- ✅ Workflow de Aprovação (draft → pending → in_review → approved/rejected)
- ✅ Filtros Avançados
- ✅ Histórico Completo
- ✅ Notificações Visuais (Sonner)
- ✅ Autenticação com Better-Auth
- ✅ Roles e Permissões

**Timeline**: Janeiro - Fevereiro 2026

**Entregáveis**:
- Sistema funcional em produção
- Documentação completa
- Treinamento da equipe

---

### Fase 2: Integração e Notificações

**Status**: Planejado

**Funcionalidades**:
- 📦 Upload de Arquivos (Vercel Blob)
- 📧 Notificações por E-mail (Resend)
- 💬 Notificações por WhatsApp (Twilio)
- 🔗 Integração com Banco de Ads
- 📊 Dashboard de Métricas Básicas
- 🏷️ Tags e Categorias Customizadas

**Timeline**: Março - Abril 2026

**Prioridade**: Alta

**Estimativa**: 4-6 semanas

---

### Fase 3: IA e Automação

**Status**: Planejado

**Funcionalidades**:
- 🤖 IA para Análise de Performance
- 🔄 Workflow Customizável por Área
- 📱 Portal do Influencer
- 💬 Comentários/Chat por Request
- 🔔 Notificações Inteligentes
- 📈 Previsões de Performance

**Timeline**: Maio - Junho 2026

**Prioridade**: Média

**Estimativa**: 6-8 semanas

---

### Fase 4: Expansão

**Status**: Planejado

**Funcionalidades**:
- 🎬 Gestão de Estoque de Trade Marketing
- 📅 Calendário de Conteúdo
- 🎯 Planejamento de Campanhas
- 📊 Dashboard Executivo
- 🔐 Controle de Acesso Granular
- 🌍 Suporte a Múltiplos Idiomas

**Timeline**: Julho - Setembro 2026

**Prioridade**: Baixa

**Estimativa**: 8-10 semanas

---

## Checklist de Implementação (MVP)

### Backend

#### Autenticação
- [ ] Configurar Better-Auth
- [ ] Implementar roles (super_admin, admin, head, user, external)
- [ ] Middleware de autorização
- [ ] Testes de autenticação

#### Database
- [ ] Schema Prisma completo
- [ ] Migrations
- [ ] Índices de performance
- [ ] Seed de dados de teste

#### API (tRPC)
- [ ] Router de requests
- [ ] Validação com Zod
- [ ] Procedures (list, getById, create, update, submit, startReview, approve, reject, correct, cancel)
- [ ] Testes de API
- [ ] Tratamento de erros

#### Histórico e Auditoria
- [ ] Model RequestHistory
- [ ] Log de todas as ações
- [ ] Queries para histórico
- [ ] Testes de auditoria

---

### Frontend

#### Páginas
- [ ] `/requests` - Lista com filtros
- [ ] `/requests/new` - Criar novo
- [ ] `/requests/[id]` - Detalhe
- [ ] `/requests/[id]/edit` - Editar
- [ ] `/login` - Login
- [ ] `/` - Redirect para /requests

#### Componentes
- [ ] RequestList (tabela com filtros)
- [ ] RequestForm (criar/editar)
- [ ] RequestDetail (detalhe + histórico)
- [ ] ApprovalModal
- [ ] RejectionModal
- [ ] StatusBadge
- [ ] PriorityBadge
- [ ] Header/Navigation
- [ ] Sidebar

#### Funcionalidades
- [ ] Busca em tempo real
- [ ] Filtros persistentes na URL
- [ ] Paginação
- [ ] Ordenação por coluna
- [ ] Auto-save em draft
- [ ] Validação em tempo real
- [ ] Toasts de sucesso/erro
- [ ] Loading states
- [ ] Error boundaries

#### Styling
- [ ] Componentes Untitled UI
- [ ] Cores de status
- [ ] Responsividade
- [ ] Dark mode (opcional)

---

### Testes

#### Unit Tests
- [ ] Validação com Zod
- [ ] Lógica de permissões
- [ ] Transições de status
- [ ] Cálculos de timezone

#### Integration Tests
- [ ] Fluxo completo de request
- [ ] Aprovação e rejeição
- [ ] Histórico
- [ ] Filtros

#### E2E Tests
- [ ] Criar request
- [ ] Submeter
- [ ] Aprovar
- [ ] Rejeitar e corrigir
- [ ] Cancelar

---

### Documentação

#### Técnica
- [ ] README.md
- [ ] Setup local
- [ ] Variáveis de ambiente
- [ ] Estrutura de arquivos
- [ ] Guia de contribuição

#### Usuário
- [ ] Guia de uso
- [ ] FAQ
- [ ] Troubleshooting
- [ ] Vídeos tutoriais (opcional)

#### Negócio
- [ ] Visão geral
- [ ] Escopo
- [ ] Regras de negócio
- [ ] Exemplos de uso

---

### DevOps

#### Ambiente Local
- [ ] Docker setup (opcional)
- [ ] Database local
- [ ] Seed de dados
- [ ] Hot reload

#### Staging
- [ ] Deploy automático
- [ ] Variáveis de ambiente
- [ ] Database staging
- [ ] Testes de smoke

#### Produção
- [ ] Deploy automático (GitHub Actions)
- [ ] Backup de database
- [ ] Monitoramento
- [ ] Alertas de erro
- [ ] Logs centralizados

---

### Treinamento

#### Equipe Interna
- [ ] Sessão de apresentação
- [ ] Hands-on workshop
- [ ] Documentação em português
- [ ] Suporte inicial (1 semana)

#### Oslo
- [ ] Apresentação do sistema
- [ ] Guia de uso
- [ ] Contato de suporte
- [ ] SLA de resposta

---

## Commit Strategy

### Convenção de Commits

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types
- `feat`: Nova funcionalidade
- `fix`: Correção de bug
- `docs`: Documentação
- `style`: Formatação (sem mudança de lógica)
- `refactor`: Refatoração
- `test`: Testes
- `chore`: Tarefas de build, dependências

### Exemplos
```
feat(requests): add approval workflow
fix(auth): fix role-based access control
docs(readme): add setup instructions
test(requests): add e2e tests for approval flow
```

### Branches
- `main`: Produção
- `develop`: Desenvolvimento
- `feature/xxx`: Novas funcionalidades
- `fix/xxx`: Correções de bugs
- `docs/xxx`: Documentação

---

## Métricas de Sucesso

### Funcionalidade
- ✅ 100% dos requests centralizados
- ✅ Workflow completo funcionando
- ✅ Filtros e busca funcionando
- ✅ Histórico registrando todas as ações

### Performance
- ✅ Tempo de carregamento < 2s
- ✅ Busca < 500ms
- ✅ Filtros < 1s
- ✅ Suporta 1000+ requests

### Usabilidade
- ✅ Tempo de aprendizado < 30 min
- ✅ Zero erros de validação confusos
- ✅ Responsivo em mobile
- ✅ Acessibilidade WCAG AA

### Negócio
- ✅ Tempo de aprovação < 4 horas
- ✅ Zero requests perdidos
- ✅ Rastreabilidade 100%
- ✅ Escalabilidade para 200+ vídeos/mês

---

## Próximos Passos

### Imediato (Esta Semana)
1. [ ] Finalizar design do banco de dados
2. [ ] Configurar ambiente de desenvolvimento
3. [ ] Criar estrutura de pastas
4. [ ] Setup de autenticação

### Curto Prazo (Próximas 2 Semanas)
1. [ ] Implementar API (tRPC)
2. [ ] Implementar páginas principais
3. [ ] Testes básicos
4. [ ] Deploy em staging

### Médio Prazo (Próximas 4 Semanas)
1. [ ] Testes completos
2. [ ] Documentação
3. [ ] Treinamento
4. [ ] Deploy em produção

---

## Contato e Suporte

### Desenvolvimento
- **Lead**: Pedro Mota (Tech/Growth)
- **E-mail**: pedro@clickcannabis.com
- **WhatsApp**: [Número]

### Produto
- **Owner**: Lucas Rouxinol (CEO)
- **E-mail**: lucas@clickcannabis.com

### Suporte
- **Responsável**: [Nome]
- **E-mail**: suporte@clickcannabis.com
- **Horário**: Segunda-Sexta, 9h-18h

---

[◀ Anterior](11-contexto-click-cannabis.md) | [Índice](README.md)
