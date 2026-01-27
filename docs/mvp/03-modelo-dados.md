# Modelo de Dados

[◀ Anterior](02-escopo-mvp.md) | [Índice](README.md) | [Próximo ▶](04-content-types.md)

---

## Schema Prisma (Core)

```prisma
enum ContentType {
  video_ugc
  video_institucional
  carrossel
  post_unico
  stories
  reels
}

enum RequestStatus {
  draft
  pending
  in_review
  approved
  rejected
  cancelled
}

enum Priority {
  low
  medium
  high
}

enum Origin {
  oslo
  interno
  influencer
}

enum Patologia {
  insonia
  ansiedade
  dor
  estresse
  inflamacao
  outro
}

model Request {
  id               String        @id @default(cuid())
  title            String        @db.VarChar(200)
  description      String        @db.Text
  contentType      ContentType
  deadline         DateTime
  priority         Priority      @default(medium)
  status           RequestStatus @default(draft)
  rejectionReason  String?       @db.Text
  origin           Origin        @default(interno)
  patologia        Patologia?
  
  createdById      String
  createdBy        User          @relation("CreatedRequests", fields: [createdById], references: [id])
  
  reviewedById     String?
  reviewedBy       User?         @relation("ReviewedRequests", fields: [reviewedById], references: [id])
  
  createdAt        DateTime      @default(now())
  updatedAt        DateTime      @updatedAt
  
  @@index([status])
  @@index([createdById])
  @@index([reviewedById])
}

model RequestHistory {
  id               String        @id @default(cuid())
  requestId        String
  request          Request       @relation(fields: [requestId], references: [id], onDelete: Cascade)
  
  action           String        // "created", "updated", "submitted", "approved", "rejected", "cancelled"
  changedBy        String
  changedByUser    User          @relation(fields: [changedBy], references: [id])
  
  oldValues        Json?         // Snapshot dos valores anteriores
  newValues        Json?         // Snapshot dos novos valores
  
  createdAt        DateTime      @default(now())
  
  @@index([requestId])
  @@index([changedBy])
}
```

---

## Validações de Campo

### Title
- **Mínimo**: 3 caracteres
- **Máximo**: 200 caracteres
- **Tipo**: String
- **Obrigatório**: Sim
- **Exemplo**: "Vídeo UGC - Depoimento Ansiedade"

### Description
- **Mínimo**: 10 caracteres
- **Máximo**: 5000 caracteres
- **Tipo**: Text (Markdown básico permitido)
- **Obrigatório**: Sim
- **Exemplo**: "Roteiro detalhado do vídeo, incluindo CTA final..."

### ContentType
- **Valores**: `video_ugc`, `video_institucional`, `carrossel`, `post_unico`, `stories`, `reels`
- **Obrigatório**: Sim
- **Padrão**: Nenhum (deve ser selecionado)

### Deadline
- **Formato**: ISO 8601 DateTime
- **Mínimo**: +1 hora a partir de agora
- **Obrigatório**: Sim
- **Nota**: Deadlines no passado são permitidos para registros retroativos

### Priority
- **Valores**: `low`, `medium`, `high`
- **Padrão**: `medium`
- **Obrigatório**: Não

### Status
- **Valores**: `draft`, `pending`, `in_review`, `approved`, `rejected`, `cancelled`
- **Padrão**: `draft`
- **Obrigatório**: Não (gerenciado pelo sistema)

### RejectionReason
- **Mínimo**: 10 caracteres reais (sem espaços em branco)
- **Máximo**: 2000 caracteres
- **Obrigatório**: Apenas quando status = `rejected`
- **Validação**: Botão de confirmar rejeição fica desabilitado até preencher

### Origin
- **Valores**: `oslo`, `interno`, `influencer`
- **Padrão**: `interno`
- **Obrigatório**: Não

### Patologia
- **Valores**: `insonia`, `ansiedade`, `dor`, `estresse`, `inflamacao`, `outro`
- **Obrigatório**: Não
- **Nota**: Campo opcional para categorização de conteúdo médico

---

## Relações

### Request → User (createdBy)
- Um request é criado por exatamente um usuário
- Relação: `Request.createdById` → `User.id`
- Comportamento ao deletar user: `Set Null` (mantém histórico)

### Request → User (reviewedBy)
- Um request pode ser revisado por no máximo um usuário
- Relação: `Request.reviewedById` → `User.id` (nullable)
- Comportamento ao deletar user: `Set Null`

### RequestHistory → Request
- Histórico é vinculado ao request
- Relação: `RequestHistory.requestId` → `Request.id`
- Comportamento ao deletar request: `Cascade` (deleta histórico)

### RequestHistory → User (changedBy)
- Cada ação no histórico é atribuída a um usuário
- Relação: `RequestHistory.changedBy` → `User.id`

---

## Índices

- `Request.status`: Para filtros rápidos por status
- `Request.createdById`: Para listar requests de um usuário
- `Request.reviewedById`: Para listar requests em revisão
- `RequestHistory.requestId`: Para carregar histórico
- `RequestHistory.changedBy`: Para auditoria por usuário

---

[◀ Anterior](02-escopo-mvp.md) | [Índice](README.md) | [Próximo ▶](04-content-types.md)
