# Draft: Workflow + Campos Personalizados

## Estado Atual (pesquisa)

### Workflow System
- Steps por ContentType com `order`, `approverAreaId`, `approverPositions`, `isFinalStep`
- Cada step tem `requiredFieldsToEnter` e `requiredFieldsToExit` (nomes dos campos)
- Status: DRAFT -> PENDING -> IN_REVIEW -> APPROVED/REJECTED -> CORRECTED
- `advanceStep` valida `requiredFieldsToExit` antes de avançar
- `requiredFieldsToEnter` existe no schema mas **NÃO é validado no backend**

### Permissões de Edição (use-permissions.ts)
- `canEdit`: apenas se `isCreator && (DRAFT || REJECTED || step.order === 0)`
- Ou seja: só o criador pode editar, e somente no DRAFT, REJECTED, ou primeiro step
- **Problema**: aprovadores em steps intermediários NÃO conseguem preencher campos

### Campos Personalizados
- Definidos por ContentType (ContentTypeField)
- Valores em RequestFieldValue (requestId + fieldId)
- DynamicFieldRenderer existe para formulário (INPUT mode)
- Na view page: campos mostrados como read-only (acabamos de implementar)

## Perguntas Abertas
- Quem pode preencher campos em cada step?
- Campos devem ser editáveis na view page ou só na edit page?
- Quais campos ficam visíveis em cada step?

## Decisões Confirmadas

### Rodada 1
- **Quem preenche**: Qualquer membro da area aprovadora do step (HEAD, COORDINATOR, STAFF)
- **Onde preenche**: Na view page (inline) — campos editáveis direto na visualização
- **Visibilidade**: Todos os campos visíveis sempre, requiredFieldsToExit marca os obrigatórios para avançar

### Rodada 2
- **Rejeição**: Mantém dados preenchidos, mas podem ser editáveis (nova versão) pelo step de destino
- **DRAFT**: Criador pode preencher TODOS os campos, mesmo os de steps futuros
- **Validação ao avançar**: Botão desabilitado + campos obrigatórios faltantes destacados em vermelho
- **Salvamento**: Auto-save (onBlur) — sem botão salvar
- **Campos de steps anteriores**: Read-only para quem está no step atual

### Rodada 3
- **Versionamento**: SIM — guardar histórico de cada alteração do campo (timestamp, autor, valor antigo → novo)
- **Editáveis no step**: Todos os campos ainda VAZIOS + os obrigatórios do step (requiredFieldsToExit). Campos já preenchidos em steps anteriores ficam read-only.
- **Criador durante workflow**: Só visualização. Perde edição ao sair do DRAFT. Só volta a editar se request for rejeitado de volta.
- **requiredFieldsToEnter**: VALIDAR. Antes de entrar no próximo step, validar que os requiredFieldsToEnter estão preenchidos.

### Rodada 4
- **Histórico de versões**: Seção separada POR CAMPO — cada campo tem ícone/botão que abre histórico de alterações daquele campo
- **Edição na rejeição**: AMBOS podem editar — criador original + membros da área do step destino
- **Campos na rejeição**: TODOS os campos ficam editáveis (incluindo os preenchidos em steps posteriores)
- **Campos fixos (título, descrição, etc.)**: Sempre READ-ONLY na view page. Só campos personalizados são editáveis inline

### Rodada 5
- **Entrega final**: O último step tem requiredFieldsToExit específicos que representam a entrega (ex: link_final, arquivo_aprovado). Sem seção extra.
- **Após aprovação**: Admin pode editar campos mesmo depois de aprovado. Demais usuários: 100% read-only.
- **Feedback auto-save**: Indicador sutil — ícone de check verde ou "Salvo" breve ao lado do campo.
- **Agrupamento visual**: SIM — campos agrupados por step, cada grupo com título do step. Campos sem step (genéricos) ficam em grupo separado.

### Rodada 6
- **Mapeamento campo→step**: Novo campo `assignedStepId` (opcional) no ContentTypeField para associar cada campo a um step. Campos sem step = grupo "Geral".
- **Campo em múltiplos steps**: Aparece no grupo do PRIMEIRO step que referencia (menor order). Sem duplicação.

### Rodada 7 (Metis follow-ups)
- **Concorrência**: Last-write-wins. Histórico de versões registra tudo.
- **Reenvio após rejeição**: Membro da área do step destino clica "Avançar" (advanceStep normal). Sem botão especial de "Reenviar".
- **Admin UI assignedStepId**: SIM, incluir no escopo. No drawer de editar workflow step: campo para selecionar fields. Na lista de fields do admin: badge mostrando qual step o field está atrelado.
- **WYSIWYG auto-save**: Botão "Salvar" explícito SÓ para campos WYSIWYG. Demais campos = auto-save onBlur.
- **Falha no auto-save**: Ícone vermelho no campo + botão "Tentar novamente". Valor digitado mantido no input.
