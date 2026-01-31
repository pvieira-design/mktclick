# Modelo de Dados — Ads Types & Ads Request

> **Versao**: 2.0  
> **Data**: 31 de Janeiro de 2026  
> **Pre-requisito**: Leia [regras-de-negocio.md](./regras-de-negocio.md) antes deste documento  
> **Referencia**: Schema existente em `packages/db/prisma/schema/`

---

## Visao Geral

Este documento define TODOS os modelos Prisma necessarios para a feature Ads Types. Os modelos sao 100% novos — nenhum modelo existente eh modificado estruturalmente (apenas campos aditivos em Origin e Creator).

### Novos Modelos (5)

| Modelo | Tabela | Proposito |
|--------|--------|-----------|
| AdType | `ad_type` | Tipo de ad (hardcoded: "Video Criativo") |
| AdProject | `ad_project` | Projeto/campanha com multiplos videos |
| AdVideo | `ad_video` | Conceito/roteiro individual |
| AdDeliverable | `ad_deliverable` | Hook/variacao com arquivo e AD number |
| AdCounter | `ad_counter` | Singleton para sequencia atomica de AD numbers |

### Novos Enums (6)

| Enum | Valores | Uso |
|------|---------|-----|
| AdProjectStatus | DRAFT, ACTIVE, COMPLETED, CANCELLED | Status do projeto |
| AdVideoPhaseStatus | PENDENTE, EM_ANDAMENTO, PRONTO, ELENCO, PRE_PROD, EM_PRODUCAO, ENTREGUE, EM_REVISAO, VALIDANDO, APROVADO, NOMENCLATURA, PUBLICADO | Status do video dentro da fase |
| AdVideoTema | GERAL, SONO, ANSIEDADE, DEPRESSAO, PESO, DISF, DORES, FOCO, PERFORM, PATOLOGIAS, TABACO | Tema do video |
| AdVideoEstilo | UGC, EDUC, COMED, DEPOI, POV, STORY, MITOS, QA, ANTES, REVIEW, REACT, TREND, INST | Estilo do video |
| AdVideoFormato | VID, MOT, IMG, CRSEL | Formato do video |
| AdDeliverableTempo | T15S, T30S, T45S, T60S, T90S, T120S, T180S | Duracao do deliverable |
| AdDeliverableTamanho | S9X16, S1X1, S4X5, S16X9, S2X3 | Tamanho/aspect ratio |

### Campos Aditivos em Modelos Existentes (2)

| Modelo | Campo Novo | Tipo | Nullable | Proposito |
|--------|-----------|------|----------|-----------|
| Origin | code | String? | Sim | Codigo para nomenclatura (ex: OSLLO) |
| Creator | code | String? | Sim | Codigo para nomenclatura (ex: BRUNAWT) |

---

## Arquivo Prisma

Todos os novos modelos vivem em um UNICO arquivo:

```
packages/db/prisma/schema/ad-project.prisma
```

> **NOTA**: O arquivo `ad-creative.prisma` ja existe (para AdCreativeMedia do sistema de analytics). NAO modificar esse arquivo. O novo arquivo eh `ad-project.prisma`.

---

## Schema Completo

### Enums

```prisma
// === ENUMS PARA ADS TYPES ===

enum AdProjectStatus {
  DRAFT
  ACTIVE
  COMPLETED
  CANCELLED
}

// Status do video dentro de cada fase
// Nem todos os valores sao usados em todas as fases
// Cada fase usa um subconjunto (documentado em regras-de-negocio.md)
enum AdVideoPhaseStatus {
  // Genericos (usados em multiplas fases)
  PENDENTE
  EM_ANDAMENTO
  PRONTO

  // Fase 3 especificos
  ELENCO
  PRE_PROD

  // Fase 4 especificos
  EM_PRODUCAO
  ENTREGUE

  // Fase 5 especificos
  EM_REVISAO
  VALIDANDO

  // Fase 6 especificos
  APROVADO
  NOMENCLATURA
  PUBLICADO
}

enum AdVideoTema {
  GERAL
  SONO
  ANSIEDADE
  DEPRESSAO
  PESO
  DISF
  DORES
  FOCO
  PERFORM
  PATOLOGIAS
  TABACO
}

enum AdVideoEstilo {
  UGC
  EDUC
  COMED
  DEPOI
  POV
  STORY
  MITOS
  QA
  ANTES
  REVIEW
  REACT
  TREND
  INST
}

enum AdVideoFormato {
  VID
  MOT
  IMG
  CRSEL
}

enum AdDeliverableTempo {
  T15S
  T30S
  T45S
  T60S
  T90S
  T120S
  T180S
}

enum AdDeliverableTamanho {
  S9X16
  S1X1
  S4X5
  S16X9
  S2X3
}
```

### AdType

```prisma
model AdType {
  id          String   @id @default(cuid())
  name        String   @unique
  slug        String   @unique
  description String?  @db.Text
  icon        String?
  color       String?
  isActive    Boolean  @default(true)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  // Relations
  projects AdProject[]

  @@map("ad_type")
}
```

**Notas**:
- Hardcoded no seed: apenas "Video Criativo" (slug: `video-criativo`)
- Estrutura identica a ContentType para consistencia visual
- Sem UI de CRUD por agora — gerenciado via seed/codigo
- Relacao 1:N com AdProject (um tipo pode ter muitos projetos)

### AdProject

```prisma
model AdProject {
  id           String          @id @default(cuid())
  title        String
  adTypeId     String
  originId     String
  briefing     String          @db.Text
  deadline     DateTime?
  priority     Priority?       // Reutiliza enum Priority existente (LOW, MEDIUM, HIGH, URGENT)
  currentPhase Int             @default(1)
  status       AdProjectStatus @default(DRAFT)
  createdById  String
  createdAt    DateTime        @default(now())
  updatedAt    DateTime        @updatedAt

  // Relations
  adType    AdType  @relation(fields: [adTypeId], references: [id])
  origin    Origin  @relation(fields: [originId], references: [id])
  createdBy User    @relation("AdProjectCreator", fields: [createdById], references: [id])
  videos    AdVideo[]

  // Indexes
  @@index([adTypeId])
  @@index([originId])
  @@index([createdById])
  @@index([status])
  @@index([currentPhase])
  @@map("ad_project")
}
```

**Notas**:
- `currentPhase` (1-6): fase macro do projeto. Comeca em 1 (Briefing)
- `status`: DRAFT ao criar, ACTIVE ao submeter, COMPLETED quando todos videos PUBLICADO, CANCELLED a qualquer momento
- `priority`: reutiliza o enum `Priority` ja existente em `request.prisma` (LOW, MEDIUM, HIGH, URGENT)
- `originId`: FK para Origin existente. Todos videos do projeto herdam a mesma origin
- `createdById`: FK para User existente. Quem criou o projeto

### AdVideo

```prisma
model AdVideo {
  id                          String              @id @default(cuid())
  projectId                   String
  nomeDescritivo              String              @db.VarChar(25)
  tema                        AdVideoTema
  estilo                      AdVideoEstilo
  formato                     AdVideoFormato
  roteiro                     String?             @db.Text
  criadorId                   String?
  storyboardUrl               String?
  localGravacao               String?
  dataGravacao                DateTime?
  currentPhase                Int                 @default(1)
  phaseStatus                 AdVideoPhaseStatus  @default(PENDENTE)

  // Validacoes Fase 2
  validacaoRoteiroCompliance  Boolean             @default(false)
  validacaoRoteiroMedico      Boolean             @default(false)

  // Aprovacoes Fase 3
  aprovacaoElenco             Boolean             @default(false)
  aprovacaoPreProducao        Boolean             @default(false)

  // Revisoes Fase 5
  revisaoConteudo             Boolean             @default(false)
  revisaoDesign               Boolean             @default(false)
  validacaoFinalCompliance    Boolean             @default(false)
  validacaoFinalMedico        Boolean             @default(false)

  // Fase 6
  aprovacaoFinal              Boolean             @default(false)
  linkAnuncio                 String?

  // Regressao
  rejectionReason             String?             @db.Text
  rejectedToPhase             Int?

  // Timestamps
  createdAt                   DateTime            @default(now())
  updatedAt                   DateTime            @updatedAt

  // Relations
  project      AdProject       @relation(fields: [projectId], references: [id], onDelete: Cascade)
  criador      Creator?        @relation("AdVideoCriador", fields: [criadorId], references: [id])
  deliverables AdDeliverable[]

  // Indexes
  @@index([projectId])
  @@index([criadorId])
  @@index([currentPhase])
  @@index([phaseStatus])
  @@map("ad_video")
}
```

**Notas**:
- `nomeDescritivo`: maximo 25 chars, sem espacos/acentos/especiais (validado no backend)
- `currentPhase` (1-6): fase individual do video. Pode diferir da fase do projeto quando video regredir
- `phaseStatus`: status dentro da fase atual. Valores validos dependem da fase (ver regras-de-negocio.md)
- Campos de validacao/aprovacao sao booleans simples — marcados por membros das areas autorizadas
- `rejectionReason` + `rejectedToPhase`: preenchidos quando video eh enviado de volta
- `onDelete: Cascade`: se projeto for deletado, videos sao deletados junto
- `criadorId`: FK para Creator existente. Preenchido na Fase 3

### AdDeliverable

```prisma
model AdDeliverable {
  id                  String                @id @default(cuid())
  videoId             String
  hookNumber          Int
  adNumber            Int?
  fileId              String
  tempo               AdDeliverableTempo
  tamanho             AdDeliverableTamanho
  mostraProduto       Boolean               @default(false)
  isPost              Boolean               @default(false)
  versionNumber       Int                   @default(1)
  descHook            String?               @db.Text
  nomenclaturaGerada  String?
  nomenclaturaEditada String?
  createdAt           DateTime              @default(now())
  updatedAt           DateTime              @updatedAt

  // Relations
  video AdVideo @relation(fields: [videoId], references: [id], onDelete: Cascade)
  file  File    @relation("AdDeliverableFile", fields: [fileId], references: [id])

  // Constraints
  @@unique([videoId, hookNumber])

  // Indexes
  @@index([videoId])
  @@index([fileId])
  @@index([adNumber])
  @@map("ad_deliverable")
}
```

**Notas**:
- `hookNumber`: sequencial dentro do video (1-10). Unique constraint com videoId
- `adNumber`: null ate Fase 6A. Atribuido atomicamente via AdCounter. Nunca muda apos atribuicao
- `nomenclaturaGerada`: gerada automaticamente pelo sistema na Fase 6B
- `nomenclaturaEditada`: se preenchido, usa este em vez do gerado. Editavel apenas na Fase 6B
- `mostraProduto`: presenca VISUAL de produto Click no video
- `isPost`: post impulsionado. Editavel na Fase 6B (apos aprovacao)
- `versionNumber`: versao da variacao. Editavel na Fase 6B
- `onDelete: Cascade`: se video for deletado, deliverables sao deletados junto
- Maximo 10 deliverables por video (validado no backend, nao no schema)

### AdCounter

```prisma
model AdCounter {
  id           String   @id @default(cuid())
  currentValue Int      @default(730)
  updatedAt    DateTime @updatedAt

  @@map("ad_counter")
}
```

**Notas**:
- Tabela SINGLETON — sempre tera exatamente 1 registro
- `currentValue`: ultimo AD number usado. Proximo = currentValue + 1
- Valor inicial: 730 (proximo AD sera 731)
- Operacao atomica via `UPDATE ... SET currentValue = currentValue + 1 RETURNING currentValue`
- NUNCA usar `SELECT MAX() + 1` — causa race conditions

---

## Modificacoes em Modelos Existentes

### Origin (content-config.prisma)

Adicionar campo `code` e relacao com AdProject:

```prisma
model Origin {
  id          String    @id @default(cuid())
  name        String    @unique
  slug        String    @unique
  description String?   @db.Text
  code        String?                    // NOVO: codigo para nomenclatura (ex: OSLLO)
  isActive    Boolean   @default(true)
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
  
  // Relations existentes
  requests    Request[]
  files       File[]    @relation("FileOrigin")
  
  // NOVA relacao
  adProjects  AdProject[]
  
  @@map("origin")
}
```

### Creator (creator.prisma)

Adicionar campo `code` e relacao com AdVideo:

```prisma
model Creator {
  id                 String        @id @default(cuid())
  name               String
  imageUrl           String?
  type               CreatorType
  responsibleId      String
  email              String?
  phone              String?
  instagram          String?
  contractStartDate  DateTime?
  contractEndDate    DateTime?
  notes              String?       @db.Text
  code               String?                    // NOVO: codigo para nomenclatura (ex: BRUNAWT)
  isActive           Boolean       @default(true)
  createdAt          DateTime      @default(now())
  updatedAt          DateTime      @updatedAt

  // Relations existentes
  responsible    User                   @relation("CreatorResponsible", fields: [responsibleId], references: [id], onDelete: Cascade)
  participations CreatorParticipation[]
  files          File[]                 @relation("FileCreator")

  // NOVA relacao
  adVideos       AdVideo[]              @relation("AdVideoCriador")

  // Indexes existentes
  @@index([responsibleId])
  @@index([type])
  @@index([isActive])
  @@map("creator")
}
```

### User (auth.prisma)

Adicionar relacao com AdProject:

```prisma
model User {
   // ... campos existentes ...
   
   // NOVA relacao
   adProjects         AdProject[] @relation("AdProjectCreator")

   @@map("user")
}
```

### File (file.prisma)

Adicionar relacao com AdDeliverable:

```prisma
model File {
  // ... campos existentes ...
  
  // NOVA relacao
  adDeliverables AdDeliverable[] @relation("AdDeliverableFile")

  @@map("file")
}
```

---

## Diagrama de Relacoes

```
                    +-----------+
                    |  AdType   |
                    |-----------|
                    | id        |
                    | name      |
                    | slug      |
                    +-----------+
                         |
                         | 1:N
                         v
+--------+       +--------------+       +--------+
| Origin |------>|  AdProject   |<------| User   |
| (code) | 1:N   |--------------|  1:N  |        |
+--------+       | id           |       +--------+
                 | title        |
                 | adTypeId     |
                 | originId     |
                 | briefing     |
                 | currentPhase |
                 | status       |
                 | createdById  |
                 +--------------+
                       |
                       | 1:N (cascade)
                       v
+---------+      +-------------+
| Creator |----->|   AdVideo   |
| (code)  | 0:N  |-------------|
+---------+      | id          |
                 | projectId   |
                 | nomeDescr.  |
                 | tema        |
                 | estilo      |
                 | formato     |
                 | currentPhase|
                 | phaseStatus |
                 | criadorId   |
                 | validacoes..|
                 +-------------+
                       |
                       | 1:N (cascade, max 10)
                       v
+--------+      +----------------+
| File   |----->| AdDeliverable  |
|        | 1:1  |----------------|
+--------+      | id             |
                | videoId        |
                | hookNumber     |
                | adNumber       |
                | fileId         |
                | tempo          |
                | tamanho        |
                | mostraProduto  |
                | nomenclatura.. |
                +----------------+

+-------------+
| AdCounter   |  (singleton)
|-------------|
| id          |
| currentValue|  = 730 (proximo = 731)
+-------------+
```

---

## Mapeamento Fase → Status Validos

Para referencia rapida de quais valores de `AdVideoPhaseStatus` sao validos em cada fase:

| Fase | Valores Validos de phaseStatus |
|------|-------------------------------|
| 1 (Briefing) | PENDENTE, EM_ANDAMENTO, PRONTO |
| 2 (Roteiro) | PENDENTE, EM_ANDAMENTO, PRONTO |
| 3 (Elenco) | PENDENTE, ELENCO, PRE_PROD, PRONTO |
| 4 (Producao) | PENDENTE, EM_PRODUCAO, ENTREGUE |
| 5 (Revisao) | PENDENTE, EM_REVISAO, VALIDANDO, PRONTO |
| 6 (Publicacao) | PENDENTE, APROVADO, NOMENCLATURA, PUBLICADO |

> **NOTA**: A validacao de quais status sao validos em cada fase eh feita no BACKEND (service layer), nao no schema Prisma. O enum contem todos os valores possiveis.

---

## Convencoes Seguidas

1. **Naming**: `@@map("snake_case")` para tabelas, camelCase para campos Prisma
2. **IDs**: `@id @default(cuid())` — mesmo padrao do projeto
3. **Timestamps**: `createdAt` + `updatedAt` em todos os modelos
4. **Cascade**: `onDelete: Cascade` em relacoes pai-filho (Project→Video, Video→Deliverable)
5. **Indexes**: em todas as FKs e campos usados em queries frequentes
6. **Unique constraints**: `@@unique([videoId, hookNumber])` para prevenir hooks duplicados
7. **Nullable FKs**: `criadorId` (preenchido na Fase 3), `adNumber` (preenchido na Fase 6)
8. **Reutilizacao**: `Priority` enum, `User`, `Origin`, `Creator`, `File` — todos existentes

---

## Checklist de Implementacao

- [ ] Criar arquivo `packages/db/prisma/schema/ad-project.prisma` com todos enums e modelos novos
- [ ] Adicionar campo `code String?` em Origin (`content-config.prisma`)
- [ ] Adicionar campo `code String?` em Creator (`creator.prisma`)
- [ ] Adicionar relacao `adProjects AdProject[] @relation("AdProjectCreator")` em User (`auth.prisma`)
- [ ] Adicionar relacao `adDeliverables AdDeliverable[] @relation("AdDeliverableFile")` em File (`file.prisma`)
- [ ] Adicionar relacao `adProjects AdProject[]` em Origin (`content-config.prisma`)
- [ ] Adicionar relacao `adVideos AdVideo[] @relation("AdVideoCriador")` em Creator (`creator.prisma`)
- [ ] Rodar `npx prisma generate` para validar schema
- [ ] Rodar `npx prisma migrate dev --name add-ads-types` para criar migration
- [ ] Verificar que migration NAO altera tabelas existentes (exceto adicionar campos nullable)
