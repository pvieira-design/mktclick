# Exemplos Práticos

[◀ Anterior](08-arquitetura-tecnica.md) | [Índice](README.md) | [Próximo ▶](10-faq-troubleshooting.md)

---

## Cenário A: Happy Path (Sucesso)

### Contexto
Samira (Content Manager) precisa de um vídeo UGC para a campanha de Insônia. Ela cria um request, submete para aprovação, e Lucas (Head) aprova rapidamente.

### Passo a Passo

#### 1. Samira cria o request
- Acessa `/requests/new`
- Preenche:
  - **Title**: "Vídeo UGC - Depoimento Insônia V1"
  - **Description**: "Roteiro: Paciente contando como o CBD ajudou no sono. Duração: 45s. Formato: vertical. CTA: 'Agende sua consulta'."
  - **ContentType**: `video_ugc`
  - **Deadline**: 28/01/2026 14:00
  - **Priority**: `high`
  - **Origin**: `interno`
- Clica em "Salvar"
- Status: `draft`
- Toast: "Request criado com sucesso!"

#### 2. Samira revisa e submete
- Acessa `/requests/[id]`
- Revisa o conteúdo
- Clica em "Submeter"
- Status: `draft` → `pending`
- Toast: "Request submetido para aprovação!"

#### 3. Lucas vê a notificação
- Acessa `/requests`
- Vê o novo request com badge laranja (pending)
- Clica no request para abrir detalhe

#### 4. Lucas inicia a revisão
- Clica em "Iniciar Revisão"
- Status: `pending` → `in_review`
- Botões de "Aprovar" e "Rejeitar" aparecem

#### 5. Lucas aprova
- Revisa o briefing
- Clica em "Aprovar"
- Modal de confirmação aparece
- Clica em "Confirmar"
- Status: `in_review` → `approved`
- Toast: "Request aprovado!"
- Histórico registra: "Lucas aprovou em 27/01/2026 11:00"

#### 6. Samira recebe notificação
- Vê o request com badge verde (approved)
- Pode agora encaminhar para produção

### Resultado
✅ Request aprovado em ~30 minutos
✅ Histórico completo registrado
✅ Pronto para produção

---

## Cenário B: Rejeição e Ajuste

### Contexto
Oslo submete um request de produção, mas o briefing está incompleto. Pedro (Admin) rejeita e pede ajustes. Oslo corrige e resubmete.

### Passo a Passo

#### 1. Oslo cria e submete o request
- Acessa `/requests/new`
- Preenche:
  - **Title**: "Produção Mensal Oslo - Janeiro"
  - **Description**: "Vídeos profissionais para campanha de Ansiedade. Incluir 3 vídeos de 2 min cada."
  - **ContentType**: `video_institucional`
  - **Deadline**: 31/01/2026 17:00
  - **Priority**: `high`
  - **Origin**: `oslo`
- Clica em "Submeter"
- Status: `draft` → `pending`

#### 2. Pedro inicia a revisão
- Acessa `/requests`
- Vê o request de Oslo
- Clica em "Iniciar Revisão"
- Status: `pending` → `in_review`

#### 3. Pedro rejeita
- Revisa o briefing
- Percebe que falta definir o CTA final
- Clica em "Rejeitar"
- Modal de rejeição aparece
- Preenche: "Falta definir o CTA final de cada vídeo. Qual é a ação esperada do espectador?"
- Clica em "Confirmar"
- Status: `in_review` → `rejected`
- Toast: "Request rejeitado. Criador pode corrigir."
- Histórico registra: "Pedro rejeitou em 27/01/2026 11:15. Motivo: Falta definir o CTA final..."

#### 4. Oslo vê a rejeição
- Acessa `/requests/[id]`
- Vê badge vermelha (rejected)
- Vê o motivo em destaque: "Falta definir o CTA final de cada vídeo..."
- Clica em "Corrigir"
- Status: `rejected` → `draft`
- Botão de editar fica disponível

#### 5. Oslo ajusta o request
- Clica em "Editar"
- Atualiza a descrição:
  - **Description**: "Vídeos profissionais para campanha de Ansiedade. Incluir 3 vídeos de 2 min cada. **CTA: 'Agende sua consulta com nossos especialistas'**. Incluir logo da Click no final."
- Clica em "Salvar"
- Status: `draft`

#### 6. Oslo resubmete
- Clica em "Submeter"
- Status: `draft` → `pending`
- Toast: "Request submetido para aprovação!"

#### 7. Pedro revisa novamente
- Vê o request novamente na lista
- Clica em "Iniciar Revisão"
- Status: `pending` → `in_review`
- Revisa a descrição atualizada
- Agora está claro e completo
- Clica em "Aprovar"
- Status: `in_review` → `approved`
- Toast: "Request aprovado!"

### Resultado
✅ Feedback claro e acionável
✅ Criador conseguiu corrigir rapidamente
✅ Request aprovado na segunda tentativa
✅ Histórico completo de iterações

---

## Cenário C: Cancelamento

### Contexto
Rafael Pro cria um request para análise de Ads, mas a campanha é pausada pelo cliente. Ele cancela o request.

### Passo a Passo

#### 1. Rafael cria o request
- Acessa `/requests/new`
- Preenche:
  - **Title**: "Análise de Performance - Campanha Insônia"
  - **Description**: "Análise detalhada dos Ads da campanha de Insônia. Incluir CTR, CPC, ROAS e recomendações de otimização."
  - **ContentType**: `carrossel` (para apresentação)
  - **Deadline**: 30/01/2026 10:00
  - **Priority**: `medium`
- Clica em "Salvar"
- Status: `draft`

#### 2. Rafael submete
- Clica em "Submeter"
- Status: `draft` → `pending`

#### 3. Cliente pausa a campanha
- Rafael recebe mensagem do cliente: "Pausamos a campanha de Insônia por enquanto."

#### 4. Rafael cancela o request
- Acessa `/requests/[id]`
- Clica em "Cancelar"
- Modal de confirmação: "Tem certeza que deseja cancelar este request?"
- Clica em "Confirmar"
- Status: `pending` → `cancelled`
- Toast: "Request cancelado."
- Histórico registra: "Rafael cancelou em 27/01/2026 12:00"

#### 5. Request fica riscado na lista
- Acessa `/requests`
- Vê o request com badge cinza e texto riscado
- Pode filtrar para não mostrar cancelados

### Resultado
✅ Request cancelado sem deletar histórico
✅ Auditoria mantida
✅ Pode ser reativado se necessário (criar novo)

---

## Cenário D: Auto-aprovação (Admin)

### Contexto
Pedro (Super Admin) cria um request simples de atualização de conteúdo. Como é admin, ele mesmo aprova para agilizar.

### Passo a Passo

#### 1. Pedro cria o request
- Acessa `/requests/new`
- Preenche:
  - **Title**: "Atualizar descrição do produto CBD"
  - **Description**: "Atualizar a descrição do produto CBD no site. Adicionar informação sobre dosagem recomendada."
  - **ContentType**: `post_unico`
  - **Deadline**: 27/01/2026 17:00
  - **Priority**: `low`
- Clica em "Salvar"
- Status: `draft`

#### 2. Pedro submete
- Clica em "Submeter"
- Status: `draft` → `pending`

#### 3. Pedro inicia a revisão
- Clica em "Iniciar Revisão"
- Status: `pending` → `in_review`

#### 4. Pedro aprova seu próprio request
- Revisa o conteúdo (é simples)
- Clica em "Aprovar"
- Status: `in_review` → `approved`
- Toast: "Request aprovado!"
- Histórico registra: "Pedro aprovou em 27/01/2026 12:30"

### Resultado
✅ Auto-aprovação permitida
✅ Agiliza processos simples
✅ Rastreabilidade mantida

---

## Cenário E: Filtros e Busca

### Contexto
Samira quer encontrar todos os requests de vídeo UGC que estão pendentes de aprovação.

### Passo a Passo

#### 1. Samira acessa a lista
- Acessa `/requests`

#### 2. Samira aplica filtros
- Clica em "Status ▼" → Seleciona "Pending"
- Clica em "Tipo ▼" → Seleciona "video_ugc"
- Clica em "Prioridade ▼" → Deixa em branco (todas)

#### 3. Resultados filtrados
- Lista mostra apenas requests com:
  - Status: `pending`
  - ContentType: `video_ugc`
- Exemplo:
  - "Vídeo UGC - Depoimento Insônia V1" (Pending, High)
  - "Vídeo UGC - Unboxing CBD" (Pending, Medium)

#### 4. Samira clica em um
- Abre o detalhe
- Vê todas as informações
- Pode editar se for draft

### Resultado
✅ Filtros funcionam corretamente
✅ Busca rápida por critérios
✅ URL persistente (pode compartilhar)

---

[◀ Anterior](08-arquitetura-tecnica.md) | [Índice](README.md) | [Próximo ▶](10-faq-troubleshooting.md)
