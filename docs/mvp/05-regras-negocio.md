# Regras de Negócio

[◀ Anterior](04-content-types.md) | [Índice](README.md) | [Próximo ▶](06-permissoes-roles.md)

---

## Decisões Estratégicas (Confirmadas)

### 1. Roles Aprovadores
**Apenas `admin`, `head` e `super_admin` podem aprovar/rejeitar.**

- Usuários comuns podem criar requests, mas não podem aprová-los
- Heads de área têm poder de aprovação
- Super Admin (Pedro) tem poder total

### 2. Auto-aprovação
**PERMITIDA. Um admin pode aprovar seu próprio request para agilizar processos.**

- Evita gargalos em tarefas simples
- Mantém rastreabilidade (fica registrado quem aprovou)
- Recomendado para requests de baixa complexidade

### 3. Rejeição
**O campo `rejectionReason` é OBRIGATÓRIO (mínimo 10 caracteres reais).**

- Botão de confirmar rejeição fica desabilitado até preencher
- Espaços em branco não contam como caracteres reais
- Feedback claro para o criador corrigir

### 4. Visibilidade
**TODOS veem TUDO. Transparência total entre áreas e parceiros.**

- Oslo vê requests da equipe interna
- Equipe interna vê requests da Oslo
- Não há requests "privados" ou "ocultos"
- Decisão de negócio: transparência radical

### 5. Deadline
**Prazo expirado NÃO bloqueia ações. Gera apenas alerta visual (badge vermelho).**

- Sistema continua funcionando normalmente
- Badge vermelho indica urgência
- Permite registros retroativos

### 6. Edição
**Bloqueada após submissão (`pending`). Só volta a ser editável se for rejeitado e o criador clicar em "Corrigir" (volta para `draft`).**

- Garante que o que foi aprovado é o que foi pedido
- Rejeição + Corrigir = volta para draft
- Não é possível editar um request aprovado (deve-se criar novo)

---

## Fluxo de Status

```
┌─────────┐
│  DRAFT  │ ← Criação e edição livre
└────┬────┘
     │ Submeter
     ↓
┌─────────┐
│ PENDING │ ← Aguardando um Admin "pegar" para revisar
└────┬────┘
     │ Iniciar Revisão
     ↓
┌──────────┐
│IN_REVIEW │ ← Admin analisando. Bloqueia outros admins
└────┬─────┘
     │
     ├─ Aprovar ──→ ┌──────────┐
     │              │ APPROVED │ ← Pronto para produção
     │              └──────────┘
     │
     └─ Rejeitar ──→ ┌──────────┐
                     │ REJECTED │ ← Volta para draft se "Corrigir"
                     └──────────┘
                            ↑
                            │ Corrigir
                            │
                        ┌─────────┐
                        │  DRAFT  │
                        └─────────┘

Qualquer status → CANCELLED (permanente)
```

---

## Tabela de Transições de Status

| De | Para | Quem | Condição |
|----|----|------|----------|
| `draft` | `pending` | Criador | Submeter |
| `pending` | `in_review` | Admin/Head | Iniciar Revisão |
| `in_review` | `approved` | Admin/Head | Aprovar |
| `in_review` | `rejected` | Admin/Head | Rejeitar + motivo |
| `rejected` | `draft` | Criador | Clicar em "Corrigir" |
| Qualquer | `cancelled` | Criador/Admin | Cancelar |
| `approved` | ❌ | Ninguém | Não é possível voltar |
| `cancelled` | ❌ | Ninguém | Não é possível reverter |

---

## Edge Cases e Tratamento de Erros

| Cenário | Regra | Comportamento do Sistema |
|---------|-------|--------------------------|
| **Aprovar Cancelado** | Proibido | Erro: "Não é possível aprovar um request cancelado". |
| **Rejeição sem Motivo** | Proibido | Botão de confirmar desabilitado até preencher 10+ chars. |
| **Edição Simultânea** | Last Write Wins | Toast avisa: "Este registro foi alterado por outro usuário". |
| **Deadline no Passado** | Permitido na criação | Aviso visual, mas permite salvar para registros retroativos. |
| **User Deletado** | Integridade | Requests do user são mantidos (Set Null no autor) para histórico. |
| **Mudança de Role** | Imediato | Se um user perde role de admin, perde acesso aos botões de aprovação na hora. |
| **Request Órfão** | Prevenção | Todo request deve ter obrigatoriamente um `createdById`. |
| **Caracteres Especiais** | Sanitização | Descrições aceitam Markdown básico, mas limpam scripts maliciosos. |
| **Dois Admins Revisando** | Prevenção | Quando um admin clica em "Iniciar Revisão", o status muda para `in_review` e bloqueia outros. |
| **Submeter sem Preencher** | Validação | Campos obrigatórios devem estar preenchidos. Toast de erro lista campos faltantes. |

---

## Regras de Validação

### Ao Criar/Editar (Draft)
- ✅ Title: 3-200 caracteres
- ✅ Description: 10-5000 caracteres
- ✅ ContentType: Obrigatório
- ✅ Deadline: Obrigatório, mínimo +1h
- ✅ Priority: Opcional (padrão: medium)
- ✅ Origin: Opcional (padrão: interno)
- ✅ Patologia: Opcional

### Ao Submeter (Draft → Pending)
- ✅ Todos os campos obrigatórios preenchidos
- ✅ Title não vazio
- ✅ Description não vazio
- ✅ Deadline válido

### Ao Rejeitar (In Review → Rejected)
- ✅ RejectionReason: Obrigatório, mínimo 10 caracteres reais
- ✅ Motivo deve ser claro e acionável

### Ao Aprovar (In Review → Approved)
- ✅ Nenhuma validação adicional
- ✅ Request está pronto para produção

---

## Histórico e Auditoria

Cada ação no request é registrada em `RequestHistory`:

- **Criação**: Quem criou, quando, valores iniciais
- **Edição**: Quem editou, quando, o quê mudou
- **Submissão**: Quem submeteu, quando
- **Revisão**: Quem iniciou, quando
- **Aprovação**: Quem aprovou, quando
- **Rejeição**: Quem rejeitou, quando, motivo
- **Cancelamento**: Quem cancelou, quando

Histórico é **imutável** e serve para auditoria completa.

---

[◀ Anterior](04-content-types.md) | [Índice](README.md) | [Próximo ▶](06-permissoes-roles.md)
