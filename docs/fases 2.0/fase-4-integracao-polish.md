# Fase 4 — Integracao & Polish

> **Versao**: 2.0  
> **Data**: 31 de Janeiro de 2026  
> **Pre-requisitos**: Fases 0-3 completas  
> **Objetivo**: Integrar tudo, polir UX, validar end-to-end

---

## Escopo da Fase 4

Esta fase nao cria funcionalidade nova. Ela integra e valida tudo que foi construido nas fases anteriores.

---

## 1. Verificacao de Integracao

### 1.1 Sidebar Funciona

- [ ] Menu "Ads Request" aparece para todos usuarios logados
- [ ] Menu "Ads Types" aparece apenas para ADMIN e SUPER_ADMIN
- [ ] Clicar em "Ads Request" navega para `/ads-requests`
- [ ] Clicar em "Ads Types" navega para `/admin/ads-types`
- [ ] Item ativo eh destacado corretamente no sidebar
- [ ] Navegacao entre Requests e Ads Requests funciona sem reload

### 1.2 Fluxo Completo End-to-End

Testar o fluxo completo com um projeto real:

1. **Criar projeto** (qualquer usuario)
   - Preencher titulo, origin, briefing
   - Adicionar 2 videos com nomeDescritivo, tema, estilo, formato
   - Salvar como rascunho
   - Submeter (DRAFT → ACTIVE)

2. **Fase 1: Briefing**
   - Verificar que projeto esta na Fase 1
   - Aprovar briefing (como Content Manager HEAD ou SUPER_ADMIN)
   - Verificar que projeto avancou para Fase 2

3. **Fase 2: Roteiro**
   - Escrever roteiro para cada video
   - Marcar validacao Compliance para cada video
   - Marcar validacao Medico para cada video
   - Adicionar 1 video extra (ultima chance)
   - Verificar que projeto avancou para Fase 3
   - Verificar que NAO pode mais adicionar videos

4. **Fase 3: Elenco**
   - Selecionar criador para cada video
   - Aprovar elenco (como Growth HEAD)
   - Preencher storyboard/locacao
   - Aprovar pre-producao (como Growth HEAD)
   - Verificar avanco para Fase 4

5. **Fase 4: Producao**
   - Fazer upload de arquivo de video para cada video
   - Criar deliverables (hooks) com tempo e tamanho
   - Verificar que pelo menos 1 deliverable por video
   - Verificar avanco para Fase 5

6. **Fase 5: Revisao**
   - Marcar revisao de conteudo
   - Marcar revisao de design
   - Marcar validacao final Compliance
   - Marcar validacao final Medico
   - Testar regressao: enviar 1 video de volta para Fase 2
   - Verificar que projeto NAO avanca (video bloqueando)
   - Percorrer video de volta ate Fase 5 PRONTO
   - Verificar avanco para Fase 6

7. **Fase 6: Publicacao**
   - Aprovar video (verificar que AD numbers sao atribuidos)
   - Verificar nomenclatura gerada automaticamente
   - Editar nomenclatura manualmente
   - Copiar nomenclatura
   - Preencher link Meta Ads
   - Marcar como publicado
   - Repetir para todos videos
   - Verificar que projeto ficou COMPLETED

### 1.3 Permissoes

Testar com diferentes usuarios:

| Usuario | Role | Deve poder | NAO deve poder |
|---------|------|-----------|----------------|
| Pedro | SUPER_ADMIN | Tudo | - |
| Lucas | SUPER_ADMIN | Tudo | - |
| Rafael Pro | ADMIN | Criar projeto, editar | Aprovar fases (se nao esta na area) |
| Samira (CM HEAD) | USER | Aprovar briefing, aprovacao final | Aprovar elenco |
| Vidjai (Design HEAD) | USER | Revisao design | Aprovar briefing |
| Bruna (UGC HEAD) | USER | Selecionar elenco | Aprovar elenco |
| Usuario sem area | USER | Criar projeto, visualizar | Aprovar qualquer coisa |

### 1.4 Edge Cases

- [ ] Projeto sem videos: nao pode submeter
- [ ] Video sem roteiro: nao pode avancar Fase 2
- [ ] Video sem deliverables: nao pode avancar Fase 4
- [ ] Deliverable sem arquivo: nao pode criar
- [ ] Mais de 10 deliverables: erro
- [ ] Nome descritivo com acentos: sanitizado automaticamente
- [ ] Nome descritivo > 25 chars: erro
- [ ] Cancelar projeto: status muda, acoes bloqueadas
- [ ] Deletar projeto DRAFT: funciona
- [ ] Deletar projeto ACTIVE: nao pode (so cancelar)
- [ ] AD number duplicado: impossivel (atomico)
- [ ] Editar deliverable apos AD number: bloqueado

---

## 2. Polish de UX

### 2.1 Loading States

- [ ] Skeleton loading na listagem de projetos
- [ ] Spinner nos botoes de acao (aprovar, avancar)
- [ ] Progress bar no upload de arquivos
- [ ] Disabled state nos botoes durante mutations

### 2.2 Error Handling

- [ ] Toast de erro quando acao falha
- [ ] Mensagem clara quando usuario nao tem permissao
- [ ] Mensagem clara quando campos obrigatorios faltam
- [ ] Redirect para login se sessao expirar

### 2.3 Success Feedback

- [ ] Toast de sucesso ao criar projeto
- [ ] Toast de sucesso ao avancar fase
- [ ] Toast de sucesso ao aprovar video
- [ ] Toast "Nomenclatura copiada!" ao copiar
- [ ] Animacao suave ao mudar status de video

### 2.4 Empty States

- [ ] Listagem vazia: "Nenhum projeto de ad encontrado. Crie o primeiro!"
- [ ] Projeto sem videos: "Adicione pelo menos 1 video para submeter"
- [ ] Video sem deliverables: "Faca upload do primeiro hook"

### 2.5 Confirmacoes

- [ ] Confirmar antes de cancelar projeto
- [ ] Confirmar antes de deletar projeto
- [ ] Confirmar antes de deletar video
- [ ] Confirmar antes de deletar deliverable
- [ ] Confirmar antes de enviar video de volta (regressao)

---

## 3. Validacao de Seed

Verificar que todos os dados de seed estao corretos:

```sql
-- AdType existe
SELECT * FROM ad_type;
-- Deve ter 1 registro: "Video Criativo"

-- AdCounter existe
SELECT * FROM ad_counter;
-- Deve ter 1 registro: currentValue = 730

-- Origin codes preenchidos
SELECT name, slug, code FROM origin;
-- oslo → OSLLO, interno → CLICK, influencer → LAGENCY, freelancer → OUTRO, chamber → CHAMBER

-- Creator codes preenchidos
SELECT name, code FROM creator WHERE code IS NOT NULL;
-- Deve ter os 8 creators com codes

-- Areas Growth e Copywriting existem
SELECT name, slug FROM area WHERE slug IN ('growth', 'copywriting');
-- Deve retornar 2 registros

-- Pedro em Compliance
SELECT u.name, a.name as area, am.position 
FROM area_member am 
JOIN "user" u ON am."userId" = u.id 
JOIN area a ON am."areaId" = a.id 
WHERE a.slug = 'compliance' AND am.position = 'HEAD';
-- Deve retornar Pedro
```

---

## 4. Verificacao Final

### Build

```bash
npm run build
# Deve compilar sem erros
```

### Type Check

```bash
npm run check-types
# Deve passar sem erros
```

### Sistema Existente

```bash
# Verificar que NADA quebrou:
# 1. Login funciona
# 2. Dashboard de Requests carrega
# 3. Criar Request funciona
# 4. Workflow de aprovacao funciona
# 5. Criadores carrega
# 6. Biblioteca carrega
# 7. Anuncios (/ads) carrega
# 8. Admin pages carregam
```

---

## Checklist Final da Fase 4

- [ ] Sidebar com novos menus funciona
- [ ] Fluxo end-to-end completo testado
- [ ] Permissoes testadas com diferentes usuarios
- [ ] Edge cases testados
- [ ] Loading states implementados
- [ ] Error handling implementado
- [ ] Success feedback implementado
- [ ] Empty states implementados
- [ ] Confirmacoes implementadas
- [ ] Seed validado via SQL
- [ ] Build passa
- [ ] Type check passa
- [ ] Sistema existente funciona normalmente
- [ ] Nenhum arquivo existente foi modificado indevidamente
