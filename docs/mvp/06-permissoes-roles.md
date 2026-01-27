# Permissões e Roles

[◀ Anterior](05-regras-negocio.md) | [Índice](README.md) | [Próximo ▶](07-interface-ui.md)

---

## Roles Existentes

### Super Admin
- **Quem**: Pedro Mota (Tech/Growth)
- **Permissões**: Acesso total ao sistema
- **Responsabilidades**: Gestão de usuários, configurações globais

### Admin
- **Quem**: Heads de área, coordenadores sênior
- **Permissões**: Criar, editar (draft), aprovar, rejeitar, cancelar
- **Responsabilidades**: Validação de requests, garantia de qualidade

### Head
- **Quem**: Líderes de área (ex: Lucas Rouxinol - CEO)
- **Permissões**: Criar, editar (draft), aprovar, rejeitar, cancelar
- **Responsabilidades**: Aprovação estratégica, alinhamento com objetivos

### User (Padrão)
- **Quem**: Equipe geral, Oslo, Influencers
- **Permissões**: Criar, editar (draft), cancelar
- **Responsabilidades**: Submeter requests, corrigir após rejeição

### External (Oslo/Influencer)
- **Quem**: Agências externas, influencers
- **Permissões**: Criar, editar (draft), cancelar
- **Responsabilidades**: Submeter requests de produção

---

## Matriz de Permissões

| Ação | User | Admin/Head | Super Admin | Externo (Oslo) |
|------|------|-----------|-------------|----------------|
| Criar Request | ✅ | ✅ | ✅ | ✅ |
| Ver Todos | ✅ | ✅ | ✅ | ✅ |
| Editar (Draft) | ✅ (próprio) | ✅ (próprio) | ✅ | ✅ (próprio) |
| Submeter | ✅ | ✅ | ✅ | ✅ |
| Iniciar Revisão | ❌ | ✅ | ✅ | ❌ |
| Aprovar | ❌ | ✅ | ✅ | ❌ |
| Rejeitar | ❌ | ✅ | ✅ | ❌ |
| Corrigir (Rejected) | ✅ (próprio) | ✅ (próprio) | ✅ | ✅ (próprio) |
| Cancelar | ✅ | ✅ | ✅ | ✅ |
| Ver Histórico | ✅ | ✅ | ✅ | ✅ |
| Deletar | ❌ | ❌ | ❌ | ❌ |

---

## Verificações de Autorização

### Criar Request
```
Permitido se: user.role in [user, admin, head, super_admin, external]
```

### Editar Request (Draft)
```
Permitido se:
  - status === 'draft' AND
  - (user.id === request.createdById OR user.role in [admin, head, super_admin])
```

### Submeter Request
```
Permitido se:
  - status === 'draft' AND
  - user.id === request.createdById
```

### Iniciar Revisão
```
Permitido se:
  - status === 'pending' AND
  - user.role in [admin, head, super_admin]
```

### Aprovar Request
```
Permitido se:
  - status === 'in_review' AND
  - user.role in [admin, head, super_admin]
```

### Rejeitar Request
```
Permitido se:
  - status === 'in_review' AND
  - user.role in [admin, head, super_admin] AND
  - rejectionReason.length >= 10
```

### Corrigir Request (Rejected → Draft)
```
Permitido se:
  - status === 'rejected' AND
  - user.id === request.createdById
```

### Cancelar Request
```
Permitido se:
  - status !== 'cancelled' AND
  - (user.id === request.createdById OR user.role in [admin, head, super_admin])
```

---

## Hierarquia de Áreas

A Click Cannabis é organizada em áreas:

- **Marketing**: Estratégia, planejamento de campanhas
- **Design**: Criação visual, branding
- **Conteúdo**: Redação, roteiros, briefings
- **Tráfego**: Gestão de Ads, performance
- **Compliance**: Validação legal, ANVISA
- **Médico**: Validação médica, CFM
- **Jurídico**: Questões legais
- **Financeiro**: Orçamento, custos

### Heads Atuais
- **Super Admin**: Pedro Mota (Tech/Growth)
- **CEO**: Lucas Rouxinol
- **Content**: Samira
- **Design**: Vidjai
- **UGC Manager**: Bruna Wright

---

## Fluxo de Aprovação Típico

```
1. Samira (User) cria request
   ↓
2. Samira submete (draft → pending)
   ↓
3. Lucas (Head) vê na lista
   ↓
4. Lucas clica "Iniciar Revisão" (pending → in_review)
   ↓
5. Lucas aprova ou rejeita
   ├─ Se aprovar: in_review → approved ✅
   └─ Se rejeitar: in_review → rejected
      ↓
      Samira clica "Corrigir" (rejected → draft)
      ↓
      Samira resubmete (draft → pending)
      ↓
      Lucas revisa novamente...
```

---

## Mudanças de Role

Se um usuário **perde** a role de `admin` ou `head`:
- ❌ Perde acesso aos botões de aprovação imediatamente
- ❌ Não pode mais iniciar revisões
- ✅ Pode continuar criando requests como user comum
- ✅ Requests já aprovados permanecem válidos

Se um usuário **ganha** a role de `admin` ou `head`:
- ✅ Ganha acesso aos botões de aprovação imediatamente
- ✅ Pode revisar requests pendentes
- ✅ Pode aprovar/rejeitar

---

[◀ Anterior](05-regras-negocio.md) | [Índice](README.md) | [Próximo ▶](07-interface-ui.md)
