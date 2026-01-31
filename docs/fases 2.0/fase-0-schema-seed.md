# Fase 0 — Schema & Seed

> **Versao**: 2.0  
> **Data**: 31 de Janeiro de 2026  
> **Pre-requisitos**: [modelo-de-dados.md](./modelo-de-dados.md)  
> **Objetivo**: Criar migration Prisma, seed de dados iniciais, e verificar que tudo funciona  
> **Risco**: BAIXO (apenas adiciona — nao modifica nada existente)

---

## Escopo da Fase 0

| Acao | Arquivo | Impacto |
|------|---------|---------|
| Criar schema novos modelos | `packages/db/prisma/schema/ad-project.prisma` | NOVO arquivo |
| Adicionar `code` em Origin | `packages/db/prisma/schema/content-config.prisma` | Campo nullable aditivo |
| Adicionar `code` em Creator | `packages/db/prisma/schema/creator.prisma` | Campo nullable aditivo |
| Adicionar relacao em User | `packages/db/prisma/schema/auth.prisma` | Relacao (sem coluna nova) |
| Adicionar relacao em File | `packages/db/prisma/schema/file.prisma` | Relacao (sem coluna nova) |
| Rodar migration | `packages/db/prisma/migrations/` | Nova migration |
| Atualizar seed | `packages/db/prisma/seed.ts` | Adicionar secoes ao final |

---

## Passo 1: Criar Arquivo ad-project.prisma

Criar `packages/db/prisma/schema/ad-project.prisma` com o conteudo completo definido em [modelo-de-dados.md](./modelo-de-dados.md):

- Todos os 7 enums (AdProjectStatus, AdVideoPhaseStatus, AdVideoTema, AdVideoEstilo, AdVideoFormato, AdDeliverableTempo, AdDeliverableTamanho)
- Todos os 5 modelos (AdType, AdProject, AdVideo, AdDeliverable, AdCounter)
- Todas as relacoes, indexes e constraints

---

## Passo 2: Modificar Modelos Existentes

### 2.1 Origin (content-config.prisma)

Adicionar:
```prisma
code        String?                    // Codigo para nomenclatura (ex: OSLLO)
adProjects  AdProject[]
```

### 2.2 Creator (creator.prisma)

Adicionar:
```prisma
code        String?                    // Codigo para nomenclatura (ex: BRUNAWT)
adVideos    AdVideo[]  @relation("AdVideoCriador")
```

### 2.3 User (auth.prisma)

Adicionar na lista de relacoes:
```prisma
adProjects  AdProject[] @relation("AdProjectCreator")
```

### 2.4 File (file.prisma)

Adicionar na lista de relacoes:
```prisma
adDeliverables AdDeliverable[] @relation("AdDeliverableFile")
```

---

## Passo 3: Gerar e Rodar Migration

```bash
# 1. Validar schema
cd packages/db
npx prisma validate

# 2. Gerar migration (NÃO aplicar automaticamente)
npx prisma migrate dev --name add-ads-types --create-only

# 3. REVISAR a migration gerada antes de aplicar
# Verificar que:
# - Cria tabelas: ad_type, ad_project, ad_video, ad_deliverable, ad_counter
# - Adiciona colunas: origin.code, creator.code
# - NAO altera nenhuma tabela existente alem de origin e creator
# - NAO deleta nada

# 4. Aplicar migration
npx prisma migrate dev

# 5. Gerar client
npx prisma generate
```

### Verificacao da Migration

A migration SQL gerada DEVE conter:

```sql
-- CreateEnum "AdProjectStatus"
-- CreateEnum "AdVideoPhaseStatus"
-- CreateEnum "AdVideoTema"
-- CreateEnum "AdVideoEstilo"
-- CreateEnum "AdVideoFormato"
-- CreateEnum "AdDeliverableTempo"
-- CreateEnum "AdDeliverableTamanho"

-- CreateTable "ad_type"
-- CreateTable "ad_project"
-- CreateTable "ad_video"
-- CreateTable "ad_deliverable"
-- CreateTable "ad_counter"

-- AlterTable "origin" ADD COLUMN "code" TEXT
-- AlterTable "creator" ADD COLUMN "code" TEXT

-- CreateIndex (varios)
-- AddForeignKey (varios)
```

A migration NAO DEVE conter:
- `DROP TABLE`
- `DROP COLUMN`
- `ALTER TABLE` em tabelas que nao sejam `origin` ou `creator`
- Qualquer modificacao em `request`, `workflow_step`, `content_type`, etc.

---

## Passo 4: Atualizar Seed

Adicionar as seguintes secoes ao FINAL do arquivo `packages/db/prisma/seed.ts` (antes do `console.log("Seed completed")`):

### 4.1 Importar Novos Enums

Adicionar aos imports existentes:
```typescript
import { PrismaClient, FieldType, AreaPosition, AdVideoTema, AdVideoEstilo, AdVideoFormato } from "./generated/client.js";
```

### 4.2 Seed de Areas Adicionais

Adicionar Growth e Copywriting ao array `areaData` (se nao existirem):

```typescript
// Adicionar ao areaData existente:
{ name: "Growth", slug: "growth", description: "Estrategia de crescimento e performance - Lucas Rouxinol" },
{ name: "Copywriting", slug: "copywriting", description: "Redacao publicitaria e roteiros" },
```

> **NOTA**: Growth e Copywriting ja podem existir no banco de producao. O seed usa `upsert` entao eh seguro.

### 4.3 Seed de Origin Codes

```typescript
// ============================================
// 7. ORIGIN CODES (para nomenclatura ads-types)
// ============================================
const originCodes: Record<string, string> = {
  "oslo": "OSLLO",
  "interno": "CLICK",
  "influencer": "LAGENCY",
  "freelancer": "OUTRO",
};

for (const [slug, code] of Object.entries(originCodes)) {
  await prisma.origin.updateMany({
    where: { slug },
    data: { code },
  });
}

// Adicionar origin "Chamber" se nao existir
await prisma.origin.upsert({
  where: { slug: "chamber" },
  update: { code: "CHAMBER" },
  create: {
    name: "Chamber",
    slug: "chamber",
    description: "Agencia Chamber",
    code: "CHAMBER",
    isActive: true,
  },
});

console.log("✓ Seeded Origin codes for nomenclatura");
```

### 4.4 Seed de Creator Codes

```typescript
// ============================================
// 8. CREATOR CODES (para nomenclatura ads-types)
// ============================================
const creatorCodes: Record<string, string> = {
  "Leo do Taxi": "LEOTX",
  "Pedro Machado": "PEDROM",
  "Dr. Joao": "DRJOAO",
  "Dr. Felipe": "DRFELIPE",
  "Bruna Wright": "BRUNAWT",
  "Rachel": "RACHEL",
  "Irwen": "IRWEN",
  "Babi Rosa": "BABIROSA",
};

for (const [name, code] of Object.entries(creatorCodes)) {
  await prisma.creator.updateMany({
    where: { name },
    data: { code },
  });
}

console.log("✓ Seeded Creator codes for nomenclatura");
```

### 4.5 Seed de AdType

```typescript
// ============================================
// 9. AD TYPES
// ============================================
await prisma.adType.upsert({
  where: { slug: "video-criativo" },
  update: {},
  create: {
    name: "Video Criativo",
    slug: "video-criativo",
    description: "Video criativo para anuncios de performance (hooks, variacoes, nomenclatura)",
    icon: "Film",
    color: "#7C3AED",
    isActive: true,
  },
});

console.log("✓ Seeded AdType: Video Criativo");
```

### 4.6 Seed de AdCounter

```typescript
// ============================================
// 10. AD COUNTER (singleton)
// ============================================
const existingCounter = await prisma.adCounter.findFirst();
if (!existingCounter) {
  await prisma.adCounter.create({
    data: {
      currentValue: 730,
    },
  });
  console.log("✓ Seeded AdCounter (starting at 730)");
} else {
  console.log(`✓ AdCounter already exists (current value: ${existingCounter.currentValue})`);
}
```

### 4.7 Seed de Pedro em Compliance (HEAD)

```typescript
// ============================================
// 11. PEDRO EM COMPLIANCE (HEAD)
// ============================================
// Pedro precisa estar em Compliance como HEAD para poder aprovar
// validacoes de roteiro e video final
const pedro = await prisma.user.findFirst({
  where: { role: "SUPER_ADMIN", name: { contains: "Pedro" } },
});

if (pedro && areas["compliance"]) {
  await prisma.areaMember.upsert({
    where: { userId_areaId: { userId: pedro.id, areaId: areas["compliance"]!.id } },
    update: { position: AreaPosition.HEAD },
    create: {
      userId: pedro.id,
      areaId: areas["compliance"]!.id,
      position: AreaPosition.HEAD,
    },
  });
  console.log("✓ Pedro added to Compliance as HEAD");
}
```

### 4.8 Atualizar Summary

```typescript
console.log("\n📋 Summary:");
console.log(`   - ${Object.keys(contentTypes).length} Content Types`);
console.log(`   - ${originData.length} Origins (with codes)`);
console.log(`   - ${Object.keys(areas).length} Areas`);
console.log("   - Custom Fields for each Content Type");
console.log("   - Workflow Steps with approval rules");
console.log("   - Area Permissions configured");
console.log("   - 1 AdType (Video Criativo)");
console.log("   - AdCounter initialized at 730");
console.log("   - Origin & Creator codes for nomenclatura");
```

---

## Passo 5: Verificacao

### 5.1 Verificar Schema

```bash
cd packages/db
npx prisma validate
# Deve retornar sem erros
```

### 5.2 Verificar Migration

```bash
npx prisma migrate status
# Deve mostrar todas migrations aplicadas
```

### 5.3 Verificar Seed

```bash
npx prisma db seed
# Deve completar sem erros
```

### 5.4 Verificar Dados via Prisma Studio

```bash
npx prisma studio
# Abrir no browser e verificar:
```

| Tabela | Verificacao |
|--------|------------|
| `ad_type` | 1 registro: "Video Criativo" |
| `ad_counter` | 1 registro: currentValue = 730 |
| `origin` | Todos com campo `code` preenchido |
| `creator` | Creators conhecidos com `code` preenchido |
| `ad_project` | Tabela existe, vazia |
| `ad_video` | Tabela existe, vazia |
| `ad_deliverable` | Tabela existe, vazia |

### 5.5 Verificar Build

```bash
cd ../..  # volta para raiz
npm run build
# Deve compilar sem erros
```

### 5.6 Verificar que Sistema Existente Funciona

```bash
npm run dev
# Abrir http://localhost:3001
# Verificar:
# - Login funciona
# - Requests existentes carregam
# - Criar novo request funciona
# - Workflow de aprovacao funciona
# - Nenhuma pagina quebrou
```

---

## Checklist Final da Fase 0

- [ ] Arquivo `ad-project.prisma` criado com todos enums e modelos
- [ ] Campo `code` adicionado em Origin
- [ ] Campo `code` adicionado em Creator
- [ ] Relacao `adProjects` adicionada em User
- [ ] Relacao `adDeliverables` adicionada em File
- [ ] Relacao `adProjects` adicionada em Origin
- [ ] Relacao `adVideos` adicionada em Creator
- [ ] `prisma validate` passa sem erros
- [ ] Migration gerada e revisada (so cria, nao deleta)
- [ ] Migration aplicada com sucesso
- [ ] `prisma generate` executado
- [ ] Seed atualizado com AdType, AdCounter, Origin codes, Creator codes
- [ ] Seed executado com sucesso
- [ ] Areas Growth e Copywriting existem
- [ ] Pedro em Compliance como HEAD
- [ ] Build (`npm run build`) passa
- [ ] Sistema existente funciona normalmente (requests, workflow, etc.)

---

## Rollback

Se algo der errado:

```bash
# Reverter migration
npx prisma migrate resolve --rolled-back [migration-name]

# Ou, se migration ja foi aplicada e precisa reverter:
# 1. Remover arquivo da migration
# 2. Reverter mudancas no schema
# 3. Rodar: npx prisma migrate dev
```

> **IMPORTANTE**: Como todas as mudancas sao ADITIVAS (novos modelos, campos nullable), o rollback eh seguro — basta dropar as novas tabelas e colunas. Nenhum dado existente eh afetado.
