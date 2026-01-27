# Escopo do MVP

[◀ Anterior](01-visao-geral.md) | [Índice](README.md) | [Próximo ▶](03-modelo-dados.md)

---

## ✅ Funcionalidades Incluídas

1. **Gestão de Requests**: Criação, edição (em draft), submissão e cancelamento.
2. **Workflow de Aprovação**: Fluxo fixo `draft` → `pending` → `in_review` → `approved`/`rejected`.
3. **Filtros Avançados**: Busca por status, tipo, prioridade e responsável.
4. **Histórico Completo**: Log de todas as alterações e decisões (quem, quando, o quê).
5. **Notificações Visuais**: Toasts e badges de status usando Untitled UI.

---

## 📋 Campos do Request

| Campo | Tipo | Regra/Limite | Descrição |
|-------|------|--------------|-----------|
| `title` | String | 3-200 chars | Título claro da demanda |
| `description` | Text | 10-5000 chars | Briefing detalhado/Roteiro |
| `contentType` | Enum | 6 tipos fixos | Categoria do conteúdo |
| `deadline` | DateTime | Min: +1h | Prazo sugerido para entrega |
| `priority` | Enum | low/med/high | Nível de urgência |
| `status` | Enum | Fixo | Estado no workflow |
| `rejectionReason` | Text | 10-2000 chars | Obrigatório em caso de rejeição |
| `origin` | Enum | Oslo/Interno/Influencer | Origem da produção |
| `patologia` | Enum | Opcional | Insônia, Ansiedade, Dor, etc. |

---

## ❌ O que NÃO está no MVP

- Upload de arquivos (Vercel Blob)
- Comentários/Chat por request
- Notificações por E-mail/WhatsApp
- Dashboard de métricas de Ads (Módulo 6)
- Gestão de estoque de Trade Marketing
- Integração com Banco de Ads
- Portal do Influencer
- IA para análise de performance
- Workflow customizável por área

---

## Scope Boundaries

### Foco Claro
O MVP é **100% focado em centralizar e validar requests**. Não é um sistema de produção, não é um CRM, não é um analytics dashboard.

### Próximas Fases
Funcionalidades avançadas serão adicionadas nas Fases 2, 3 e 4 (veja [Roadmap](12-roadmap.md)).

---

[◀ Anterior](01-visao-geral.md) | [Índice](README.md) | [Próximo ▶](03-modelo-dados.md)
