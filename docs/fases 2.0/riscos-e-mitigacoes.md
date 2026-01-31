# Riscos e Mitigacoes — Ads Types & Ads Request

> **Versao**: 2.0  
> **Data**: 31 de Janeiro de 2026  
> **Proposito**: Analise completa de riscos com mitigacoes para cada fase de implementacao

---

## Classificacao de Risco

| Nivel | Probabilidade | Impacto | Acao |
|-------|--------------|---------|------|
| CRITICO | Alta | Alto | Bloqueia implementacao ate resolver |
| ALTO | Media-Alta | Alto | Mitigacao obrigatoria antes de prosseguir |
| MEDIO | Media | Medio | Mitigacao recomendada |
| BAIXO | Baixa | Baixo | Monitorar |

---

## 1. Riscos de Arquitetura

### R1: Colisao com Rota /ads Existente
- **Nivel**: CRITICO (ja mitigado)
- **Descricao**: A rota `/ads` ja existe para Facebook Ads analytics. Se a nova feature usar `/ads`, quebra a funcionalidade existente.
- **Mitigacao**: Feature usa `/ads-requests` e `/admin/ads-types`. Decisao documentada e confirmada.
- **Status**: RESOLVIDO

### R2: Modificacao Acidental do Sistema Existente
- **Nivel**: ALTO
- **Descricao**: Ao implementar, desenvolvedor pode acidentalmente modificar routers, services ou modelos do sistema existente de Requests/ContentTypes.
- **Mitigacao**:
  1. Escopo FORA claramente documentado no README
  2. Novos arquivos em locais separados (ad-project.ts, ad-video.ts, etc.)
  3. Revisao de PR deve verificar que NENHUM arquivo existente foi modificado (exceto sidebar.tsx, index.ts, e schemas para relacoes)
  4. Checklist de verificacao: "Sistema existente funciona?" apos cada fase
- **Indicador de falha**: Qualquer modificacao em `request.ts`, `workflow.ts`, `workflow-validator.ts`, `content-type.ts`

### R3: Relacoes Prisma Quebram Modelos Existentes
- **Nivel**: MEDIO
- **Descricao**: Adicionar relacoes em User, File, Origin, Creator pode causar erros de compilacao se feito incorretamente.
- **Mitigacao**:
  1. Relacoes sao APENAS listas (arrays) no lado "um" — nao adicionam colunas
  2. Campos novos (Origin.code, Creator.code) sao nullable — nao quebram dados existentes
  3. Migration revisada manualmente antes de aplicar
  4. Rollback documentado (dropar tabelas novas + colunas)
- **Teste**: `npx prisma validate` + `npm run build` apos cada mudanca

### R4: Enum Conflicts
- **Nivel**: BAIXO
- **Descricao**: Novos enums (AdProjectStatus, etc.) podem conflitar com enums existentes se nomes forem iguais.
- **Mitigacao**: Todos enums novos tem prefixo "Ad" (AdProjectStatus, AdVideoPhaseStatus, etc.). Enum `Priority` eh reutilizado (nao duplicado).

---

## 2. Riscos de Backend

### R5: Race Condition no AD Counter
- **Nivel**: CRITICO
- **Descricao**: Se dois usuarios aprovam videos simultaneamente, podem receber o mesmo AD number.
- **Mitigacao**:
  1. Operacao atomica via `UPDATE ... SET currentValue = currentValue + 1`
  2. Executado dentro de `db.$transaction()`
  3. NUNCA usar `SELECT MAX() + 1` (padrao anti-pattern)
  4. Cada deliverable recebe AD number em sequencia dentro da mesma transacao
- **Teste**: Simular 2 aprovacoes simultaneas e verificar que AD numbers sao unicos

### R6: AD Numbers Atribuidos a Projeto Cancelado
- **Nivel**: MEDIO
- **Descricao**: Se um projeto eh cancelado apos AD numbers serem atribuidos, os numeros ficam "queimados" (gaps na sequencia).
- **Mitigacao**: Decisao explicita — gaps sao aceitos. AD numbers nunca sao reutilizados. Documentado em regras-de-negocio.md secao 5.5.
- **Impacto**: Puramente estetico (gaps na sequencia). Sem impacto funcional.

### R7: Inconsistencia de Fase entre Projeto e Videos
- **Nivel**: ALTO
- **Descricao**: Se a logica de avanco de fase falhar no meio (ex: atualiza projeto mas nao atualiza videos), o estado fica inconsistente.
- **Mitigacao**:
  1. Toda operacao de avanco de fase dentro de `db.$transaction()`
  2. Atualiza projeto E todos videos atomicamente
  3. Se qualquer parte falhar, toda transacao eh revertida
  4. Validacao: `canProjectAdvancePhase()` checa TODOS os videos antes de avancar

### R8: Permissoes Incorretas (Multi-Area OR)
- **Nivel**: ALTO
- **Descricao**: Logica de multi-area OR eh nova no sistema. Se implementada incorretamente, usuarios podem aprovar etapas que nao deveriam.
- **Mitigacao**:
  1. Mapeamento completo de acoes → areas → posicoes em `AD_ACTIONS` (constante, nao banco)
  2. Funcao `canUserPerformAdAction()` centralizada e reutilizada em todos os routers
  3. SUPER_ADMIN bypass eh o PRIMEIRO check (antes de qualquer logica de area)
  4. Testes manuais com usuarios de diferentes areas/posicoes
- **Teste**: Para cada acao, testar com: SUPER_ADMIN, ADMIN, HEAD da area correta, STAFF da area correta, membro de area errada, usuario sem area

### R9: Regressao de Video Cria Estado Invalido
- **Nivel**: MEDIO
- **Descricao**: Se um video regredir para Fase 2 enquanto o projeto esta na Fase 5, o projeto fica "travado" ate o video percorrer todas as fases novamente.
- **Mitigacao**:
  1. Comportamento documentado e intencional (regra de negocio)
  2. UI mostra claramente quais videos estao bloqueando o avanco
  3. Banner de aviso: "Video X esta na Fase 2 — projeto nao avancara ate ele voltar"
  4. Restricao: nao pode regredir apos AD numbers atribuidos

---

## 3. Riscos de Frontend

### R10: Complexidade da Pagina de Detalhe
- **Nivel**: ALTO
- **Descricao**: A pagina `/ads-requests/[id]` eh extremamente complexa — 6 fases diferentes, cada uma com UI propria, acoes contextuais por permissao, deliverables com upload, nomenclatura.
- **Mitigacao**:
  1. Componentizacao agressiva (1 componente por fase, 1 por secao)
  2. Implementar fase por fase, nao tudo de uma vez
  3. Fase 2 (frontend basico) cria estrutura. Fase 3 adiciona workflow.
  4. Cada componente de fase eh independente — pode ser testado isoladamente

### R11: Performance com Muitos Videos/Deliverables
- **Nivel**: MEDIO
- **Descricao**: Projeto com 20+ videos, cada um com 10 hooks, gera muitos componentes na pagina.
- **Mitigacao**:
  1. Videos colapsaveis (expandir/colapsar cards)
  2. Lazy loading de deliverables (so carrega quando video eh expandido)
  3. Paginacao de videos se necessario (improvavel — projetos tipicos tem 3-10 videos)
  4. Query otimizada no backend (include seletivo)

### R12: Upload de Arquivos Grandes
- **Nivel**: MEDIO
- **Descricao**: Videos podem ser arquivos grandes (100MB+). Upload pode falhar ou demorar.
- **Mitigacao**:
  1. Reutilizar sistema de upload existente (Vercel Blob)
  2. Progress bar durante upload
  3. Retry automatico em caso de falha
  4. Limite de tamanho documentado na UI
  5. Considerar upload em background com toast de progresso (padrao ja existe no projeto)

### R13: Nomenclatura Incorreta
- **Nivel**: MEDIO
- **Descricao**: Nomenclatura gerada automaticamente pode ter erros (acentos nao removidos, campos vazios, formato errado).
- **Mitigacao**:
  1. Funcao `sanitizeName()` com testes unitarios
  2. Preview da nomenclatura ANTES de confirmar
  3. Campo `nomenclaturaEditada` permite correcao manual
  4. Botao "Resetar" volta para a gerada automaticamente
  5. Validacao: nomenclatura nao pode ter espacos, acentos ou caracteres especiais

---

## 4. Riscos de Dados

### R14: Origin/Creator Sem Code
- **Nivel**: MEDIO
- **Descricao**: Se um Origin ou Creator nao tem `code` preenchido, a nomenclatura fica incompleta.
- **Mitigacao**:
  1. Seed preenche codes para todos Origins e Creators conhecidos
  2. Funcao `generateCreatorCode()` gera codigo automatico para Creators sem code
  3. Origin sem code usa "OUTRO" como fallback
  4. UI mostra aviso se Origin/Creator nao tem code

### R15: Dados Orfaos apos Cancelamento
- **Nivel**: BAIXO
- **Descricao**: Projeto cancelado mantem videos e deliverables no banco.
- **Mitigacao**:
  1. Comportamento intencional — dados sao mantidos para auditoria
  2. Status CANCELLED impede qualquer acao
  3. Filtro padrao na listagem exclui CANCELLED
  4. Cleanup pode ser feito manualmente via Prisma Studio se necessario

### R16: Migration Falha em Producao
- **Nivel**: ALTO
- **Descricao**: Migration pode falhar em producao se houver dados inconsistentes ou locks de tabela.
- **Mitigacao**:
  1. Migration eh 100% aditiva (cria tabelas, adiciona colunas nullable)
  2. Nao modifica dados existentes
  3. Nao adiciona constraints em tabelas existentes (exceto relacoes)
  4. Testar migration em staging antes de producao
  5. Rollback documentado em fase-0-schema-seed.md

---

## 5. Riscos de Processo

### R17: Confusao com Plano v1.0
- **Nivel**: MEDIO
- **Descricao**: Documentos do plano v1.0 (`docs/fases/`) ainda existem e podem confundir desenvolvedores.
- **Mitigacao**:
  1. README do v1.0 marcado como SUPERSEDED com pointer para v2.0
  2. README do v2.0 explica claramente a diferenca
  3. Decisao #1 na tabela de decisoes: "Feature separada vs content type"

### R18: Scope Creep
- **Nivel**: ALTO
- **Descricao**: Durante implementacao, podem surgir pedidos para adicionar funcionalidades fora do escopo (notificacoes, dashboard, integracao Meta API, etc.).
- **Mitigacao**:
  1. Escopo DENTRO e FORA claramente documentado no README
  2. Qualquer pedido fora do escopo deve ser avaliado como feature separada
  3. MVP primeiro — polish depois
  4. Lista de "FORA" serve como backlog para futuras iteracoes

### R19: Falta de Testes Automatizados
- **Nivel**: MEDIO
- **Descricao**: Projeto nao tem infraestrutura de testes. Toda verificacao eh manual.
- **Mitigacao**:
  1. Checklists de verificacao manual em cada fase
  2. Verificacao via Prisma Studio para dados
  3. Verificacao via browser para UI
  4. Queries SQL para validar integridade
  5. Decisao explicita: sem testes automatizados neste MVP

---

## 6. Riscos de Seguranca

### R20: Bypass de Permissoes via API
- **Nivel**: ALTO
- **Descricao**: Se permissoes so forem checadas no frontend (esconder botoes), usuarios podem chamar a API diretamente.
- **Mitigacao**:
  1. TODAS as checagens de permissao sao feitas no BACKEND (routers)
  2. Frontend esconde botoes para UX, mas backend rejeita requests nao autorizados
  3. `canUserPerformAdAction()` chamado em TODA mutation que requer permissao
  4. `protectedProcedure` garante que usuario esta autenticado

### R21: Manipulacao de AD Numbers
- **Nivel**: CRITICO
- **Descricao**: Se um usuario conseguir manipular AD numbers (atribuir manualmente, reutilizar, etc.), a integridade da sequencia eh comprometida.
- **Mitigacao**:
  1. `adNumber` so eh atribuido via `assignAdNumbers()` (funcao interna)
  2. Nenhum endpoint permite setar `adNumber` diretamente
  3. `adNumber` eh imutavel apos atribuicao (checado no backend)
  4. Operacao atomica previne duplicatas

---

## 7. Matriz de Riscos Resumida

| # | Risco | Nivel | Status |
|---|-------|-------|--------|
| R1 | Colisao rota /ads | CRITICO | RESOLVIDO |
| R2 | Modificacao sistema existente | ALTO | Mitigado (escopo + revisao) |
| R3 | Relacoes quebram modelos | MEDIO | Mitigado (nullable + revisao) |
| R4 | Enum conflicts | BAIXO | Mitigado (prefixo Ad) |
| R5 | Race condition AD counter | CRITICO | Mitigado (atomico + transacao) |
| R6 | AD numbers queimados | MEDIO | Aceito (decisao de negocio) |
| R7 | Inconsistencia fase/videos | ALTO | Mitigado (transacao atomica) |
| R8 | Permissoes multi-area | ALTO | Mitigado (funcao centralizada) |
| R9 | Regressao cria estado invalido | MEDIO | Aceito (comportamento intencional) |
| R10 | Complexidade pagina detalhe | ALTO | Mitigado (componentizacao) |
| R11 | Performance muitos videos | MEDIO | Mitigado (lazy loading) |
| R12 | Upload arquivos grandes | MEDIO | Mitigado (sistema existente) |
| R13 | Nomenclatura incorreta | MEDIO | Mitigado (preview + edicao manual) |
| R14 | Origin/Creator sem code | MEDIO | Mitigado (fallback + auto-geracao) |
| R15 | Dados orfaos | BAIXO | Aceito (auditoria) |
| R16 | Migration falha producao | ALTO | Mitigado (aditiva + staging) |
| R17 | Confusao plano v1.0 | MEDIO | Mitigado (SUPERSEDED) |
| R18 | Scope creep | ALTO | Mitigado (escopo documentado) |
| R19 | Sem testes automatizados | MEDIO | Aceito (decisao de projeto) |
| R20 | Bypass permissoes via API | ALTO | Mitigado (backend checks) |
| R21 | Manipulacao AD numbers | CRITICO | Mitigado (funcao interna + imutavel) |

---

## 8. Plano de Contingencia

### Se a migration falhar em producao:
1. NAO tentar corrigir em producao
2. Reverter migration: `npx prisma migrate resolve --rolled-back [name]`
3. Investigar causa em staging
4. Corrigir e re-aplicar

### Se o sistema existente quebrar:
1. Reverter TODAS as mudancas via git
2. Re-aplicar migration reversa (dropar tabelas novas)
3. Investigar qual mudanca causou o problema
4. Corrigir e re-implementar com mais cuidado

### Se AD numbers ficarem inconsistentes:
1. Parar todas as aprovacoes (comunicar equipe)
2. Verificar AdCounter.currentValue vs MAX(adNumber) nos deliverables
3. Corrigir AdCounter se necessario: `UPDATE ad_counter SET currentValue = (SELECT MAX(adNumber) FROM ad_deliverable)`
4. Verificar duplicatas: `SELECT adNumber, COUNT(*) FROM ad_deliverable GROUP BY adNumber HAVING COUNT(*) > 1`

### Se permissoes estiverem erradas:
1. Verificar AD_ACTIONS no codigo vs regras-de-negocio.md
2. Verificar AreaMember records no banco
3. Verificar que SUPER_ADMIN bypass esta funcionando
4. Corrigir mapeamento e re-deploy
