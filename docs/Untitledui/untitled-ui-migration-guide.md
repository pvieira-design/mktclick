# Guia de Migração: Untitled UI

Este documento detalha as boas práticas para importar e utilizar componentes do Untitled UI neste projeto, substituindo gradualmente os componentes shadcn/ui.

## Arquitetura CSS do Projeto

### Estrutura Atual

O projeto utiliza **dois sistemas CSS coexistindo**:

```
apps/web/src/
├── globals.css          # Untitled UI (tema principal)
│   ├── @import "tailwindcss"
│   ├── @import "./theme.css"      # Cores, shadows, radius do Untitled UI
│   └── @import "./typography.css" # Tipografia do Untitled UI
│
└── index.css            # shadcn/ui (componentes legados)
    ├── @import "tailwindcss"
    ├── @import "shadcn/tailwind.css"
    └── @theme inline { ... }      # Variáveis shadcn
```

### Ordem de Importação (CRÍTICO)

No `layout.tsx`, a ordem de importação é **essencial**:

```tsx
// apps/web/src/app/layout.tsx
import "@/globals.css";   // 1. Untitled UI PRIMEIRO (tema base)
import "../index.css";    // 2. shadcn DEPOIS (adiciona variáveis extras)
```

**Por que essa ordem?**
- `globals.css` define o tema completo do Untitled UI via `@theme` no `theme.css`
- `index.css` usa `@theme inline` que **adiciona** variáveis ao tema existente
- Se inverter, o tema Untitled UI sobrescreve tudo e quebra componentes shadcn

---

## Como Adicionar Novos Componentes Untitled UI

### Passo 1: Instalar via CLI

```bash
cd apps/web
npx untitledui@latest add <component-name>
```

**Componentes disponíveis (FREE):**
- `button` (já instalado)
- `input`
- `textarea`
- `checkbox`
- `radio`
- `select`
- `badge`
- `avatar`
- `toggle`
- `tooltip`
- `tabs`

**Componentes PRO (requer login):**
```bash
npx untitledui@latest login
npx untitledui@latest add table
```

### Passo 2: Localização dos Componentes

Após instalar, os componentes ficam em:

```
apps/web/src/components/base/
├── buttons/
│   └── button.tsx
├── inputs/
│   └── input.tsx
├── selects/
│   └── select.tsx
└── ...
```

### Passo 3: Utilitários Necessários

O Untitled UI requer estes utilitários (já instalados):

```
apps/web/src/lib/utils/
├── cx.ts                 # Wrapper do tailwind-merge
└── is-react-component.ts # Helper para detectar componentes React
```

---

## Mapeamento: shadcn → Untitled UI

### Button

| shadcn | Untitled UI |
|--------|-------------|
| `variant="default"` | `color="primary"` |
| `variant="destructive"` | `color="primary-destructive"` |
| `variant="outline"` | `color="secondary"` |
| `variant="secondary"` | `color="secondary"` |
| `variant="ghost"` | `color="tertiary"` |
| `variant="link"` | `color="link-gray"` ou `color="link-color"` |
| `size="default"` | `size="md"` |
| `size="sm"` | `size="sm"` |
| `size="lg"` | `size="lg"` |
| `size="icon"` | Apenas `iconLeading` ou `iconTrailing`, sem children |
| `disabled` | `isDisabled` |
| `asChild` + `Link` | `href="/path"` (nativo) |

**Exemplo de migração:**

```tsx
// ANTES (shadcn)
import { Button, buttonVariants } from "@/components/ui/button";
import Link from "next/link";
import { Plus } from "lucide-react";

<Button variant="destructive" size="sm" disabled>
  <Plus className="mr-2 h-4 w-4" />
  Deletar
</Button>

<Link href="/new" className={buttonVariants({ variant: "default" })}>
  Criar Novo
</Link>

// DEPOIS (Untitled UI)
import { Button } from "@/components/base/buttons/button";
import { Plus } from "lucide-react";

<Button color="primary-destructive" size="sm" isDisabled iconLeading={Plus}>
  Deletar
</Button>

<Button href="/new" color="primary">
  Criar Novo
</Button>
```

### Input (quando instalado)

| shadcn | Untitled UI |
|--------|-------------|
| `<Input />` | `<Input />` |
| `disabled` | `isDisabled` |
| `className` | `className` (funciona igual) |
| Ícones via className | `iconLeading` / `iconTrailing` |

### Select (quando instalado)

| shadcn | Untitled UI |
|--------|-------------|
| `<Select>` + `<SelectTrigger>` + `<SelectContent>` + `<SelectItem>` | Estrutura similar, verificar docs |
| `onValueChange` | `onChange` ou similar |
| `value` | `value` |

### Badge

| shadcn | Untitled UI |
|--------|-------------|
| `variant="default"` | `color="brand"` |
| `variant="secondary"` | `color="gray"` |
| `variant="destructive"` | `color="error"` |
| `variant="outline"` | `color="gray"` + `variant="outline"` |

---

## Padrão de Importação Recomendado

### Para arquivos que usam APENAS Untitled UI:

```tsx
import { Button } from "@/components/base/buttons/button";
import { Input } from "@/components/base/inputs/input";
// ... outros componentes Untitled UI
```

### Para arquivos em MIGRAÇÃO (ambos os sistemas):

```tsx
// Untitled UI (novos)
import { Button } from "@/components/base/buttons/button";

// shadcn (legado - remover gradualmente)
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Select, SelectTrigger, SelectContent, SelectItem } from "@/components/ui/select";
```

### Convenção de Alias (se precisar ambos temporariamente):

```tsx
import { Button } from "@/components/base/buttons/button";
import { Button as ShadcnButton } from "@/components/ui/button"; // EVITAR - só em transição
```

---

## Variáveis CSS: Untitled UI

O tema Untitled UI (`theme.css`) define estas categorias de variáveis:

### Cores Base
```css
--color-brand-{25-950}    /* Cor principal da marca */
--color-gray-{25-950}     /* Cinzas neutros */
--color-error-{25-950}    /* Erros/destructive */
--color-warning-{25-950}  /* Avisos */
--color-success-{25-950}  /* Sucesso */
```

### Cores Semânticas (use estas!)
```css
/* Texto */
--color-text-primary      /* Texto principal */
--color-text-secondary    /* Texto secundário */
--color-text-tertiary     /* Texto terciário */
--color-text-disabled     /* Texto desabilitado */
--color-text-error-primary

/* Background */
--color-bg-primary        /* Fundo principal (branco) */
--color-bg-secondary      /* Fundo secundário (cinza claro) */
--color-bg-brand-solid    /* Fundo do botão primary */
--color-bg-error-solid    /* Fundo do botão destructive */

/* Bordas */
--color-border-primary
--color-border-secondary
--color-border-error

/* Foreground (ícones, etc) */
--color-fg-primary
--color-fg-secondary
--color-fg-disabled
```

### Shadows
```css
--shadow-xs
--shadow-sm
--shadow-md
--shadow-lg
--shadow-xl
--shadow-xs-skeumorphic   /* Usado em botões */
```

### Radius
```css
--radius-sm   /* 0.25rem */
--radius-md   /* 0.375rem */
--radius-lg   /* 0.5rem */
--radius-xl   /* 0.75rem */
--radius-full /* 9999px */
```

---

## Checklist de Migração por Componente

### Antes de migrar qualquer componente:

- [ ] Instalar via CLI: `npx untitledui@latest add <component>`
- [ ] Verificar se o componente apareceu em `src/components/base/`
- [ ] Ler o código do componente para entender a API
- [ ] Testar isoladamente antes de substituir

### Migração de um arquivo:

1. [ ] Adicionar import do componente Untitled UI
2. [ ] Substituir usos do componente shadcn pelo Untitled UI
3. [ ] Ajustar props conforme mapeamento
4. [ ] Remover import do shadcn (se não usado mais)
5. [ ] Testar visualmente
6. [ ] Verificar console por erros

---

## Problemas Comuns e Soluções

### 1. Componente Untitled UI não aparece / sem estilo

**Causa:** `globals.css` não está sendo importado ou está na ordem errada.

**Solução:** Verificar `layout.tsx`:
```tsx
import "@/globals.css";   // DEVE vir PRIMEIRO
import "../index.css";
```

### 2. Componentes shadcn quebrados após adicionar Untitled UI

**Causa:** Conflito de variáveis CSS no `@theme`.

**Solução:** Manter `index.css` DEPOIS de `globals.css`. O `@theme inline` do shadcn adiciona sem sobrescrever.

### 3. Ícones não aparecem no botão

**Causa:** Usando a sintaxe antiga de children.

**Solução:** Usar props `iconLeading` ou `iconTrailing`:
```tsx
// ERRADO
<Button><Plus className="mr-2 h-4 w-4" /> Texto</Button>

// CERTO
<Button iconLeading={Plus}>Texto</Button>
```

### 4. Link não funciona como botão

**Causa:** Usando `asChild` do shadcn.

**Solução:** Untitled UI suporta `href` nativamente:
```tsx
// ERRADO
<Button asChild><Link href="/x">Texto</Link></Button>

// CERTO
<Button href="/x">Texto</Button>
```

### 5. Erro "isReactComponent is not defined"

**Causa:** Utilitário não instalado.

**Solução:** Verificar se existe `src/lib/utils/is-react-component.ts`:
```ts
export function isReactComponent(value: unknown): value is React.FC {
  return typeof value === "function";
}
```

---

## Dark Mode

### Untitled UI
Usa classe `.dark-mode` no elemento pai:
```css
@custom-variant dark (&:where(.dark-mode, .dark-mode *));
```

### shadcn
Usa classe `.dark`:
```css
@custom-variant dark (&:is(.dark *));
```

**Para compatibilidade**, o provider de tema deve adicionar ambas as classes:
```tsx
<html className={theme === 'dark' ? 'dark dark-mode' : ''}>
```

---

## Ordem de Migração Recomendada

Migrar na seguinte ordem para minimizar riscos:

1. **Button** (já feito parcialmente)
2. **Badge** - simples, pouco impacto
3. **Input** - muito usado, testar bem
4. **Textarea** - similar ao input
5. **Select** - mais complexo, testar forms
6. **Checkbox / Radio** - forms
7. **Toggle** - settings
8. **Avatar** - perfil
9. **Tabs** - navegação
10. **Table** - PRO, requer login

---

## Comandos Úteis

```bash
# Instalar componente
npx untitledui@latest add <component>

# Ver componentes disponíveis
npx untitledui@latest add --help

# Login para componentes PRO
npx untitledui@latest login

# Adicionar exemplo de uso
npx untitledui@latest example <example-name>
```

---

## Recursos

- [Untitled UI Docs](https://www.untitledui.com/docs)
- [Untitled UI Figma](https://www.untitledui.com/)
- Componentes instalados: `apps/web/src/components/base/`
- Tema: `apps/web/src/theme.css`
