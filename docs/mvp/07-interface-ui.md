# Interface UI

[◀ Anterior](06-permissoes-roles.md) | [Índice](README.md) | [Próximo ▶](08-arquitetura-tecnica.md)

---

## Design System: Untitled UI

O sistema usa componentes do **Untitled UI** para garantir consistência visual e acessibilidade.

### Cores de Status

| Status | Cor | Uso |
|--------|-----|-----|
| `draft` | Cinza | Rascunho, não submetido |
| `pending` | Laranja | Aguardando revisão |
| `in_review` | Azul | Em análise |
| `approved` | Verde | Aprovado, pronto |
| `rejected` | Vermelho | Rejeitado, precisa corrigir |
| `cancelled` | Cinza + Riscado | Cancelado, descartado |

### Componentes Untitled UI Utilizados

- **Badge**: Para exibir status e prioridade
- **Button**: Para ações (Criar, Submeter, Aprovar, etc.)
- **Input**: Para campos de texto (title)
- **Textarea**: Para descrição e motivo de rejeição
- **Select**: Para contentType, priority, origin, patologia
- **DatePicker**: Para deadline
- **Modal**: Para confirmações (Aprovar, Rejeitar, Cancelar)
- **Sonner**: Para notificações em tempo real (toasts)
- **Table**: Para listar requests
- **Skeleton**: Para loading states

---

## Páginas Principais

### 1. Dashboard / Lista de Requests

**URL**: `/requests` ou `/`

**Componentes**:
- Header com título "Requests"
- Barra de busca (por título)
- Filtros avançados (status, tipo, prioridade, responsável)
- Tabela com colunas:
  - Title (clicável para detalhe)
  - Status (badge colorida)
  - Priority (badge)
  - Deadline (com alerta se expirado)
  - CreatedBy (nome do usuário)
  - CreatedAt (data formatada)
  - Ações (Ver, Editar, Cancelar)

**Funcionalidades**:
- Paginação (50 por página)
- Ordenação por coluna
- Filtros persistentes na URL
- Busca em tempo real

**Exemplo Visual**:
```
┌─────────────────────────────────────────────────────────┐
│ Requests                                                │
├─────────────────────────────────────────────────────────┤
│ 🔍 Buscar...        [Status ▼] [Tipo ▼] [Prioridade ▼] │
├─────────────────────────────────────────────────────────┤
│ Title              │ Status    │ Prioridade │ Deadline   │
├────────────────────┼───────────┼────────────┼────────────┤
│ Vídeo UGC Insônia  │ ⚫ Pending│ 🔴 High    │ 28/01 14h  │
│ Carrossel CBD      │ 🟢 Approved│ 🟡 Medium │ 30/01 10h  │
│ Post Feriado       │ 🔵 In Review│ 🟡 Medium │ 25/01 ⚠️  │
└─────────────────────────────────────────────────────────┘
```

---

### 2. Criar/Editar Request

**URL**: `/requests/new` ou `/requests/[id]/edit`

**Componentes**:
- Form com campos:
  - Title (Input, 3-200 chars)
  - Description (Textarea, 10-5000 chars, Markdown)
  - ContentType (Select, 6 opções)
  - Deadline (DatePicker)
  - Priority (Select: low, medium, high)
  - Origin (Select: oslo, interno, influencer)
  - Patologia (Select, opcional)
- Botões:
  - Salvar (Draft)
  - Submeter (Draft → Pending)
  - Cancelar (volta para lista)
- Validação em tempo real
- Toast de sucesso/erro

**Funcionalidades**:
- Auto-save a cada 30 segundos (draft)
- Preview de Markdown
- Contador de caracteres
- Avisos de deadline no passado

**Exemplo Visual**:
```
┌─────────────────────────────────────────────────────────┐
│ Novo Request                                            │
├─────────────────────────────────────────────────────────┤
│ Title *                                                 │
│ [Vídeo UGC - Depoimento Ansiedade.....................]│
│ 3-200 caracteres (45/200)                              │
│                                                         │
│ Description *                                           │
│ [Roteiro detalhado do vídeo...........................] │
│ 10-5000 caracteres (250/5000)                          │
│                                                         │
│ Content Type *        │ Priority              │         │
│ [video_ugc ▼]         │ [medium ▼]            │         │
│                                                         │
│ Deadline *            │ Origin                │         │
│ [28/01/2026 14:00 ▼]  │ [interno ▼]           │         │
│                                                         │
│ [Salvar] [Submeter] [Cancelar]                         │
└─────────────────────────────────────────────────────────┘
```

---

### 3. Detalhe do Request

**URL**: `/requests/[id]`

**Componentes**:
- Header com título e status (badge)
- Informações principais:
  - Title
  - Description (Markdown renderizado)
  - ContentType, Priority, Origin, Patologia
  - Deadline (com alerta se expirado)
  - CreatedBy, CreatedAt
  - ReviewedBy, UpdatedAt
- Histórico (timeline)
- Botões de ação (contextuais):
  - Se draft: Editar, Submeter, Cancelar
  - Se pending: Iniciar Revisão (admin only)
  - Se in_review: Aprovar, Rejeitar (admin only)
  - Se rejected: Corrigir (criador only)
  - Se approved: Nenhum (apenas visualização)
  - Se cancelled: Nenhum (apenas visualização)

**Funcionalidades**:
- Timeline de histórico com quem fez o quê e quando
- Motivo de rejeição em destaque (se rejeitado)
- Botões desabilitados com tooltip explicativo

**Exemplo Visual**:
```
┌─────────────────────────────────────────────────────────┐
│ ◀ Voltar                                                │
├─────────────────────────────────────────────────────────┤
│ Vídeo UGC - Depoimento Ansiedade        [🟠 Pending]   │
├─────────────────────────────────────────────────────────┤
│ Criado por: Samira em 27/01/2026 10:30                 │
│ Deadline: 28/01/2026 14:00 (em 28h)                    │
│ Prioridade: 🔴 High | Tipo: video_ugc | Origem: interno│
│                                                         │
│ Descrição:                                              │
│ Roteiro detalhado do vídeo, incluindo CTA final...     │
│                                                         │
│ Histórico:                                              │
│ ─────────────────────────────────────────────────────  │
│ 27/01 10:30 - Samira criou o request                   │
│ 27/01 10:45 - Samira submeteu (draft → pending)        │
│                                                         │
│ [Iniciar Revisão] [Cancelar]                           │
└─────────────────────────────────────────────────────────┘
```

---

### 4. Modal de Aprovação

**Acionado por**: Botão "Aprovar" em request `in_review`

**Componentes**:
- Título: "Aprovar Request?"
- Resumo do request
- Botões:
  - Confirmar (verde)
  - Cancelar (cinza)

**Funcionalidades**:
- Confirmação antes de aprovar
- Toast de sucesso
- Redirecionamento para lista

---

### 5. Modal de Rejeição

**Acionado por**: Botão "Rejeitar" em request `in_review`

**Componentes**:
- Título: "Rejeitar Request"
- Campo de texto: "Motivo da Rejeição" (obrigatório, 10+ chars)
- Botões:
  - Confirmar (vermelho, desabilitado até preencher)
  - Cancelar (cinza)

**Funcionalidades**:
- Validação em tempo real (10+ chars)
- Botão desabilitado até preencher
- Toast de sucesso
- Redirecionamento para lista

**Exemplo Visual**:
```
┌─────────────────────────────────────────────────────────┐
│ Rejeitar Request                                        │
├─────────────────────────────────────────────────────────┤
│ Motivo da Rejeição *                                    │
│ [Falta definir o CTA final do vídeo...................]│
│ 10-2000 caracteres (45/2000)                           │
│                                                         │
│ [Confirmar] [Cancelar]                                 │
└─────────────────────────────────────────────────────────┘
```

---

## Notificações (Sonner)

### Toast de Sucesso
- "Request criado com sucesso!"
- "Request submetido para aprovação!"
- "Request aprovado!"
- "Request rejeitado. Criador pode corrigir."
- "Request cancelado."

### Toast de Erro
- "Erro ao salvar. Tente novamente."
- "Título deve ter 3-200 caracteres."
- "Descrição deve ter 10-5000 caracteres."
- "Motivo de rejeição deve ter 10+ caracteres."
- "Você não tem permissão para esta ação."

### Toast de Aviso
- "Deadline expirado!"
- "Este request foi alterado por outro usuário."

---

## Responsividade

Todas as páginas são **responsivas** e funcionam em:
- Desktop (1920px+)
- Tablet (768px-1024px)
- Mobile (320px-767px)

Componentes Untitled UI garantem acessibilidade e usabilidade em todos os tamanhos.

---

[◀ Anterior](06-permissoes-roles.md) | [Índice](README.md) | [Próximo ▶](08-arquitetura-tecnica.md)
